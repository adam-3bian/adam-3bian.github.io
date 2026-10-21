require 'jekyll'
require 'nokogiri'
root=File.expand_path('..',__dir__)
site=Jekyll::Site.new(Jekyll.configuration('source'=>root,'safe'=>true,'quiet'=>true))
render=lambda do |include_name,page,records|
 payload={'data'=>{'catalog'=>{}},'pages'=>[],'posts'=>[],'people'=>[],'organisations'=>[],'events'=>[],'papers'=>[],'products'=>[],'repositories'=>[],'groups'=>[],'guides'=>[],'policies'=>[]}.merge(records)
 source=include_name.start_with?('_layouts/') ? File.read(File.join(root,include_name)).sub(/\A---\n.*?\n---\n/m,'') : "{% include #{include_name} %}"
 template=Liquid::Template.parse(source)
 Nokogiri::HTML.fragment(template.render!({'page'=>page,'site'=>payload},registers:{site:site,page:{}}))
end
person={'slug'=>'dual','title'=>'Dual affiliation fixture','url'=>'/people/dual/','person'=>{'organisations'=>[
 {'organisation'=>'one','relationship'=>'employment','positions'=>[{'title'=>'Engineer','status'=>'current'}]},
 {'organisation'=>'two','relationship'=>'research','positions'=>[{'title'=>'Researcher','status'=>'current'},{'title'=>'Visiting fellow','status'=>'past'}]}]}}
orgs=[{'slug'=>'one','title'=>'Organisation One','url'=>'/organisations/one/','organisation'=>{}},{'slug'=>'two','title'=>'Organisation Two','url'=>'/organisations/two/','organisation'=>{}}]
facts=render.call('facts.html',person,{'organisations'=>orgs}) # facts returns captured rows for the detail layout
facts_template=Liquid::Template.parse('{% include facts.html %}<dl>{{ fact_rows }}</dl>')
facts=Nokogiri::HTML.fragment(facts_template.render!({'page'=>person,'site'=>{'data'=>{'catalog'=>{}},'organisations'=>orgs}},registers:{site:site,page:{}}))
abort 'Concurrent current titles or historical role lost' unless ['Organisation One','Organisation Two','Engineer (current)','Researcher (current)','Visiting fellow (past)'].all?{|s|facts.text.include?(s)}
orgs.each do |org|
 output=render.call('relationships.html',org,{'people'=>[person],'organisations'=>orgs})
 abort 'Person absent from an employer inverse view' unless output.css('a[href="/people/dual/"]').size==1
 abort 'Employer news inferred from a person' unless output.css('[data-relationship="posts"]').empty?
end
speakers=[{'person'=>'dual','role'=>'speaker','session'=>'opening'}]
event={'slug'=>'event','title'=>'Event','url'=>'/events/event/','event'=>{'organisers'=>orgs.map{|o|{'organisation'=>o['slug'],'role'=>'organiser'}},'speakers'=>speakers}}
output=render.call('relationships.html',event,{'people'=>[person],'organisations'=>orgs})
abort 'Organisers were lost or a separate speakers list returned' unless orgs.all?{|o|output.at_css("a[href='#{o['url']}']")} && output.css('[aria-labelledby="speakers-title"], [aria-labelledby="guest-speakers-title"]').empty?
guides=(1..3).map{|n|{'slug'=>"guide-#{n}",'title'=>"Guide #{n}",'url'=>"/guides/guide-#{n}/",'guide'=>{'series'=>'onboarding','sequence'=>n}}}
guides.each_with_index do |guide,index|
 output=render.call('_layouts/detail.html',guide,{'guides'=>guides})
 expected=guides.each_with_index.select{|_,n|(n-index).abs==1}.map{|g,_|g['url']}
 abort 'Guide sequence did not derive neighbours' unless output.css('.guide-navigation a').map{|a|a['href']}==expected
end
product={'slug'=>'board','title'=>'Board','url'=>'/products/board/','product'=>{'type'=>'fpga_board','manufacturer'=>'one'}}
output=render.call('relationships.html',product,{'organisations'=>orgs})
abort 'Manufacturer includes unrelated organisations' unless output.css('[aria-labelledby="manufacturer-title"] a').map{|a|a['href']}==['/organisations/one/']
orgs.each do |org|
 output=render.call('relationships.html',org,{'products'=>[product]})
 expected=org['slug']=='one' ? ['/products/board/'] : []
 abort 'Products must appear only on their manufacturer inverse view' unless output.css('[aria-labelledby="products-title"] a').map{|a|a['href']}==expected
end
[nil,'','missing'].each do |manufacturer|
 fixture=product.merge('product'=>product['product'].merge('manufacturer'=>manufacturer))
 output=render.call('relationships.html',fixture,{'organisations'=>orgs})
 abort 'Missing/empty/unresolved manufacturer expanded to all organisations' unless output.css('[aria-labelledby="manufacturer-title"]').empty?
 template=Liquid::Template.parse('{% include facts.html %}<dl>{{ fact_rows }}</dl>')
 facts=Nokogiri::HTML.fragment(template.render!({'page'=>fixture,'site'=>{'data'=>{'catalog'=>{}},'organisations'=>orgs}},registers:{site:site,page:{}}))
 abort 'Unknown manufacturer rendered a blank fact link' unless facts.css('a').empty?
end
post={'slug'=>'post','post'=>{},'url'=>'/news/post/'}
output=render.call('relationships.html',post,{'posts'=>[{'slug'=>'unrelated','url'=>'/news/unrelated/','post'=>{'category'=>'news'}}]})
abort 'Missing article category inferred unrelated news' unless output.css('[aria-labelledby="related-posts-title"]').empty?
page={'slug'=>'page','related'=>[{'type'=>'organisation','slug'=>'one'},{'type'=>'unknown','slug'=>'two'},{'type'=>'organisation'},{'type'=>'organisation','slug'=>''},{'type'=>'organisation','slug'=>'missing'},{'type'=>'organisation','slug'=>'one'}]}
output=render.call('relationships.html',page,{'organisations'=>orgs})
abort 'Invalid related reference leaked a previous pool or duplicate' unless output.css('[aria-labelledby="related-title"] a').map{|a|a['href']}==['/organisations/one/']
editor_person=person.merge('person'=>person['person'].reject{|key,_|key=='organisations'}.merge('affiliation'=>person['person']['organisations'].first,'other_affiliations'=>person['person']['organisations'].drop(1)))
output=render.call('card.html item=page kind="people" metadata=true',editor_person,{'organisations'=>orgs})
abort 'Main job/company card lines are incorrect' unless output.at_css('.person-job-title')&.text=='Engineer' && output.at_css('.person-company')&.text=='Organisation One'
abort 'Additional affiliation lost from filtering' unless output.at_css('[data-facet]')['data-facet'].include?('Organisation Two')
orgs.each do |org|
 output=render.call('relationships.html',org,{'people'=>[editor_person],'organisations'=>orgs})
 abort 'Primary/additional affiliation absent from organisation inverse view' unless output.at_css('a[href="/people/dual/"]')
end
nested_event=event.merge('event'=>{'schedule'=>[{'date'=>'2026-11-12','sessions'=>[
 {'title'=>'Opening','speakers'=>[{'person'=>'dual'}],'resources'=>[{'type'=>'slides','label'=>'Slides','url'=>'/opening.pdf'}]},
 {'title'=>'Panel','speakers'=>[{'person'=>'dual','role'=>'moderator'}]}]}]})
output=render.call('relationships.html',editor_person,{'people'=>[editor_person],'events'=>[nested_event],'organisations'=>orgs})
abort 'ID-free programme did not generate both talk cards' unless output.css('[data-talk-id]').size==2
programme=render.call('event-programme.html',nested_event,{'people'=>[editor_person]})
abort 'Timeline speaker links were lost' unless programme.css('.programme-speakers a[href="/people/dual/"]').size==2
abort 'Generated profile talk links do not target programme entries' unless output.css('[data-talk-id] .talk-copy a').all?{|a|programme.at_css("[id='#{a['href'].split('#').last}']")}
abort 'Nested slides did not follow the correct talk' unless output.css('[data-talk-id]').first.css('a[href="/opening.pdf"]').size==1 && output.css('[data-talk-id]').last.css('a[href="/opening.pdf"]').empty?
lead_group={'slug'=>'group','title'=>'Group','url'=>'/groups/group/','working_group'=>{'type'=>'technical','leads'=>[{'person'=>'dual'},{'name'=>'Named co-lead'}]}}
facts=Nokogiri::HTML.fragment(facts_template.render!({'page'=>lead_group,'site'=>{'data'=>{'catalog'=>{}},'people'=>[editor_person]}},registers:{site:site,page:{}}))
abort 'Working-group leads are not rendered as linked and named credits' unless facts.at_css('dt').text=='Working Group Leads' && facts.at_css('a[href="/people/dual/"]') && facts.text.include?('Named co-lead')
output=render.call('relationships.html',editor_person,{'people'=>[editor_person],'groups'=>[lead_group]})
abort 'Lead profile did not derive its working group' unless output.css('[aria-labelledby="groups-title"] a').map{|a|a['href']}==['/groups/group/']
puts 'Relationships: working-group leads and inverse views, nested ID-free programmes, primary/additional affiliations, organisers, guide neighbours and exact references passed.'
