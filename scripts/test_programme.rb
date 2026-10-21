require 'jekyll'
require 'nokogiri'
require 'json'
require 'date'
require 'fileutils'

root=File.expand_path('..',__dir__)
fixtures={}
[1,2,3,4,7].each do |count|
  days=count.times.map do |index|
    date=(Date.new(2026,11,10)+index).iso8601
    sessions=[
      {'type'=>'introduction','title'=>'Introduction','start'=>'13:00','presentations'=>[{'title'=>'Introduction to Day 1'}]},
      {'type'=>'keynote','title'=>'Keynotes','start'=>'13:05','end'=>'14:20','presentations'=>[
        {'title'=>'Keynote','start'=>'13:05','speakers'=>[{'name'=>'Yona Raekow','affiliation'=>'BSI'}], 'resources'=>[
          {'type'=>'slides','label'=>'View slides','url'=>'/policies/code-of-conduct/'},
          {'type'=>'video','label'=>'View video','url'=>'https://youtu.be/example'}]},
        {'title'=>'With CHERI, can we afford to ignore hardware security?','start'=>'13:20','speakers'=>[{'person'=>'mike-eftimakis','affiliation'=>'CHERI Alliance'}]},
        {'title'=>'Untimed discussion','speakers'=>[{'name'=>'Guest speaker'}]},
        {'title'=>'Keynote','start'=>'14:00','resources'=>[{'type'=>'slides','label'=>'Session slides','url'=>'/policies/code-of-conduct/'}]}
      ]},
      {'type'=>'break','title'=>'Break and exhibition','start'=>'14:20'},
      {'title'=>'Case studies','start'=>'14:30','end'=>'15:25','presentations'=>[
        {'title'=>'Opportunities for CHERI in the Energy Industry','speakers'=>[{'name'=>'Joshua Cooper','affiliation'=>'Hildebrand'}]}
      ]},
      {'type'=>'networking','title'=>'Exhibition demonstrations','start'=>'15:30','room'=>'Hall B0','description'=>'Meet the exhibitors and discuss their demonstrations.'}
    ]
    if count==2 && index==1
      sessions.unshift({'type'=>'networking','title'=>'Doors open','start'=>'12:00'})
      sessions.push({'title'=>'End of day','start'=>'18:30'})
    end
    sessions=[] if count>=4 && index==1
    sessions=[{'type'=>'networking','title'=>'Exhibition all day','start'=>'09:00'}] if count==4 && index==2
    if count==7 && index==6
      sessions=[{'title'=>'Exhibition','start'=>'09:00','speakers'=>[{'person'=>'mike-eftimakis'}],
        'resources'=>[{'type'=>'slides','label'=>'View slides','url'=>'/policies/code-of-conduct/'}]}, {'title'=>'Untimed demonstrations'}]
    end
    {'date'=>date,'label'=>index<2 ? 'Exhibition only' : 'Conference and exhibition','sessions'=>sessions}
  end
  page={'slug'=>'programme-fixture','collection'=>'events','event'=>{'timezone'=>'Europe/Berlin','schedule'=>days}}
  original=Marshal.dump(page)
  ['', '/preview'].each do |prefix|
    site=Jekyll::Site.new(Jekyll.configuration('source'=>root,'safe'=>true,'quiet'=>true,'baseurl'=>prefix))
    payload={'baseurl'=>prefix,'data'=>{},'people'=>[{'slug'=>'mike-eftimakis','title'=>'Mike Eftimakis','url'=>'/people/mike-eftimakis/'}],
      'organisations'=>[{'slug'=>'cheri-alliance','title'=>'CHERI Alliance','url'=>'/organisations/cheri-alliance/'}]}
    output=Liquid::Template.parse('{% include event-programme.html %}').render!({'page'=>page,'site'=>payload},registers:{site:site,page:{}})
    tree=Nokogiri::HTML.fragment(output)
    abort 'Rendering changed authored front matter' unless Marshal.dump(page)==original
    abort 'A programme day was dropped' unless tree.css('[data-programme-day]').size==count
    abort 'Incorrect number of day links' unless tree.css('[data-programme-tab]').size==(count>1 ? count : 0)
    ids=tree.css('[id]').map{|node|node['id']}
    abort 'Programme IDs are not unique' unless ids.uniq==ids
    tree.css('[data-programme-tab]').each do |tab|
      abort 'A day link does not resolve' unless tree.at_css("[id='#{tab['href'].delete_prefix('#')}']")
      abort 'A descriptive day label was omitted' unless tab.at_css('.programme-day-label')
    end
    intro=tree.at_css('.programme-presentation')
    abort 'First presentation did not inherit its known session start' unless intro.at_css('.programme-clock')&.text=='13:00'
    explicit=tree.css('.programme-presentation').find{|node|node.at_css('h5').text.include?('afford')}
    abort 'Explicit talk timing changed' unless explicit.at_css('.programme-clock')&.text=='13:20'
    untimed=tree.css('.programme-presentation').find{|node|node.at_css('h5').text=='Untimed discussion'}
    abort 'An unknown talk time was invented' if untimed.at_css('.programme-clock')
    pause=tree.at_css('[data-session-type="break"] .programme-time')
    abort 'Break end did not derive from the next session' unless pause.text=='14:20–14:30'
    abort 'Speaker links were lost' unless tree.at_css(".programme-speakers a[href='#{prefix}/people/mike-eftimakis/']")
    abort 'Talk downloads were lost' unless tree.at_css(".programme-resources a[href='#{prefix}/policies/code-of-conduct/']")
    abort 'Talk videos were lost' unless tree.at_css('.programme-resources a[href="https://youtu.be/example"]')
    abort 'Known speaker organisations must link to their detail page' unless tree.at_css(".programme-speakers a[href='#{prefix}/organisations/cheri-alliance/']")
    abort 'An organisation without a record must remain plain text' if tree.css('.programme-speakers a').any?{|node|node.text=='BSI'}
    organisation_template=Liquid::Template.parse('{% include programme-organisation.html label="CHERI Alliance / Missing, CHERI Alliance" %}')
    organisations=Nokogiri::HTML.fragment(organisation_template.render!({'site'=>payload},registers:{site:site,page:{}}))
    abort 'Multiple affiliations changed their text or lost known links' unless organisations.text=='CHERI Alliance / Missing, CHERI Alliance' && organisations.css('a').size==2
    credits=Marshal.load(original)
    credits['event']['speakers']=[{'person'=>'mike-eftimakis'},{'name'=>'Yona Raekow'},{'name'=>'Other guest','affiliation'=>'Example'}]
    credit_template=Liquid::Template.parse('{% include event-unlisted-speakers.html record=page %}{{ extra_event_speakers | jsonify }}')
    extra=JSON.parse(credit_template.render!({'page'=>credits,'site'=>payload},registers:{site:site,page:{}}))
    abort 'Timeline speakers were duplicated or unscoped credits were lost' unless extra==[{'name'=>'Other guest','affiliation'=>'Example'}]
    credits['event']['schedule']=[]
    extra=JSON.parse(credit_template.render!({'page'=>credits,'site'=>payload},registers:{site:site,page:{}}))
    abort 'A speaker on an event without a programme was lost' unless extra.size==3
    html=<<~HTML
      <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>#{count}-day programme fixture</title><link rel="stylesheet" href="#{prefix}/assets/css/main.css"></head>
      <body><main class="site-frame"><div class="page-surface"><article class="content">
      <h1>#{count}-day programme</h1>#{output}</article></div></main><script src="#{prefix}/assets/js/programme.js"></script></body></html>
    HTML
    fixtures["#{prefix}:#{count}"]=html
  end
end
if ARGV.first=='--fixtures'
  path=ARGV.fetch(1)
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path,JSON.pretty_generate(fixtures)+"\n")
end
puts 'Programme: 1/2/3/4/7 days, empty and flat days, descriptive labels, stable unique anchors, source preservation, inherited/explicit/unknown times, speaker links and resources passed at root and /preview.'
