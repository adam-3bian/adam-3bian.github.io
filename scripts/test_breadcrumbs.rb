require 'jekyll'
require 'nokogiri'

root=File.expand_path('..',__dir__)
site=Jekyll::Site.new(Jekyll.configuration('source'=>root,'safe'=>true,'quiet'=>true))
lists=YAML.safe_load_file(File.join(root,'_data/breadcrumbs.yml'))
routes=lists.values+['/alliance/leadership/members/','/discover/resources/reports-and-white-papers/']
pages=[{'url'=>'/404.html','title'=>'404 - Page not found'},
  {'url'=>'/alliance/','title'=>'CHERI Alliance','landing'=>{'navigation'=>'category'},'navigation'=>{'header'=>{'category'=>'CHERI Alliance'}}}]
pages+=routes.map{|url|{'url'=>url,'title'=>url.split('/').last.tr('-',' ').capitalize}}
cases=lists.map{|kind,url|[{'collection'=>kind},url]}
cases+=[
  [{'collection'=>'organisations','organisation'=>{'membership'=>{'is_member'=>true,'status'=>'active'}}},'/alliance/leadership/members/'],
  [{'collection'=>'organisations','organisation'=>{'membership'=>{'is_member'=>true,'status'=>'inactive'}}},lists['organisations']],
  [{'collection'=>'papers','publication'=>{'type'=>'academic_paper'}},lists['papers']],
  [{'collection'=>'papers','publication'=>{'type'=>'report'}},'/discover/resources/reports-and-white-papers/'],
  [{},nil], # Ordinary Markdown pages must not inherit a list or the first site page.
  [{'collection'=>'unknown'},nil],
  [{'url'=>lists['people']},nil] # A list must never link back to itself.
]
# The default papers fixture represents an academic publication.
cases[lists.keys.index('papers')][0]['publication']={'type'=>'academic_paper'}
template=Liquid::Template.parse('{% include breadcrumbs.html %}')
['','/preview'].each do |prefix|
  cases.each do |fields,expected|
    page={'url'=>'/test/','title'=>'Current page','navigation'=>{'header'=>{'category'=>'CHERI Alliance'}}}.merge(fields)
    output=template.render!({'page'=>page,'site'=>{'data'=>{'breadcrumbs'=>lists},'pages'=>pages,'baseurl'=>prefix}},registers:{site:site,page:{}})
    tree=Nokogiri::HTML.fragment(output)
    links=tree.css('a').map{|a|a['href'].delete_prefix(prefix)}
    abort "Missing collection list #{expected}: #{links}" if expected && links.last!=expected
    abort 'An ordinary page gained a spurious list' if !expected && links!=['/','/alliance/']
    abort 'An invalid, duplicate or self ancestor appeared' if links.include?('/404.html') || links.include?(page['url']) || links.uniq!=links
    abort 'The current breadcrumb is not marked' unless tree.at_css('[aria-current="page"]')&.text==page['title']
  end
end
puts "Breadcrumbs: #{cases.size} collection, member/publication subtype and ordinary-page cases passed at root and /preview."
