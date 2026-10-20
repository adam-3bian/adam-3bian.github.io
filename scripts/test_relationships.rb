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
abort 'Multiple organisers/speakers did not resolve' unless orgs.all?{|o|output.at_css("a[href='#{o['url']}']")}&&output.at_css('a[href="/people/dual/"]')
guides=(1..3).map{|n|{'slug'=>"guide-#{n}",'title'=>"Guide #{n}",'url'=>"/guides/guide-#{n}/",'guide'=>{'series'=>'onboarding','sequence'=>n}}}
guides.each_with_index do |guide,index|
 output=render.call('_layouts/detail.html',guide,{'guides'=>guides})
 expected=guides.each_with_index.select{|_,n|(n-index).abs==1}.map{|g,_|g['url']}
 abort 'Guide sequence did not derive neighbours' unless output.css('.guide-navigation a').map{|a|a['href']}==expected
end
puts 'Relationships: simultaneous current employers/titles, historical positions, both organisation inverse views, no inferred organisation news, multiple organisers and guide neighbours passed.'
