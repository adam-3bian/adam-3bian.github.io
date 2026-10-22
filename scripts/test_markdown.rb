require 'jekyll'
require 'json'
require 'csv'
require 'nokogiri'
root=File.expand_path('..',__dir__)
destination=ARGV[0]||File.join(root,'dist')
audit_file=ARGV[1]
site=Jekyll::Site.new(Jekyll.configuration('source'=>root,'safe'=>true,'quiet'=>true))
converter=Jekyll::Converters::Markdown.new(site.config)
snapshot=JSON.parse(File.read(File.join(root,'docs/migrations/v5.3/source-snapshot.json'))).values.flatten.to_h{|r|[r['path'],r]}
normalize=lambda{|text|text.unicode_normalize(:nfkc).tr('’‘“”',"''\"\"").gsub(/\s+/,' ').strip}
legacy_homepage=lambda{|a|a['href'].to_s.match?(%r{\Ahttps?://(?:www\.)?cheri-alliance\.org/?\z}) && a.text.match?(%r{\A(?:https?://)?(?:www\.)?cheri-alliance\.org/?\z})}
count=0;paragraphs=0;transformed=0;audit=[]
CSV.foreach(File.join(root,'docs/migrations/v5.3/records.csv'),headers:true) do |row|
 original=Nokogiri::HTML.fragment(converter.convert(snapshot[row['old_source']]['body']))
 route=row['new_url'].sub(%r{^/},'');route+='index.html' if route.end_with?('/')||route.empty?
 output=Nokogiri::HTML(File.read(File.join(destination,route)))
 literal_text=lambda{|s|s.delete("\r").gsub(/\A\n+|\n+\z/, '')}
 actual=output.css('main pre').map{|n|literal_text.call(n.text)}
 text=normalize.call(output.at_css('main').text)
 original.css('pre').each do |code|
  expected=normalize.call(code.text);count+=1
  abort "Lost/reformatted code example: #{row['old_source']} #{expected[0,100]}" unless actual.include?(literal_text.call(code.text))
  audit<<[row['old_source'],row['new_source'],row['new_url'],'code',expected,'Preserved literal code','Native pre/code']
 end
 original.css('p').each do |paragraph|
  expected=normalize.call(paragraph.text);next if expected.length<=35
  paragraphs+=1;reason=nil
  unless text.include?(expected)
   if row['new_url']=='/adopt/assurance-and-adoption/about-cheri-enabled/' && expected=='Read the current programme specifications.'
    button=output.at_css('main a.button[href="/assets/pdf/shared/certification-program-v1.pdf"]')
    abort 'Programme specification button changed its label or destination' unless button && normalize.call(button.text)==expected.delete_suffix('.')
    reason='Existing programme specification link uses a native Markdown button without sentence punctuation'
   elsif row['new_url']=='/events/webinar-cheri-cra-compliance/' && expected.start_with?('Date & Time:')
    abort 'Webinar clock facts lost' unless text.include?('14:00–14:30')&&text.include?('Europe/London')&&output.at_css('time[datetime="2026-09-09"]')
    reason='Published date/clock facts moved to event.date/time_bounds/timezone'
   elsif row['new_url']=='/events/webinar-cheri-cra-compliance/' && expected.include?('TBD - insert video')
    abort 'Webinar recording lost' unless output.at_css('main a[href="https://www.youtube.com/watch?v=OZS6JHoAUkc"]')
    reason='Published recording moved to resources; obsolete TBD removed'
   elsif ['/alliance/membership/contact/','/news-and-events/news-and-analysis/subscribe-newsletter/'].include?(row['new_url'])
    if expected.downcase.include?('preview') || expected.include?('published Alliance')
     form=output.at_css('main .form-panel form[data-local-form]')
     field_count=row['new_url'].include?('contact') ? 5 : 1
     abort 'Requested local form must replace obsolete provider/preview copy' unless form && !form['action'] && form.css('input,textarea,select').length==field_count && form.at_css('button[type="submit"][disabled][hidden]') && output.css('main .form-panel a.button').empty? && !text.downcase.include?('preview only')
     reason='Obsolete provider/preview copy replaced by user-requested on-page fields without an endpoint'
    end
   elsif row['new_url']=='/news/initial-members-join-cheri-alliance-to-drive-adoption-of-memory-safety-and-scalable-software-compartmentalization/' && expected=='Interested companies can contact the Alliance at https://cheri-alliance.org/'
    abort 'Local membership contact wording lost' unless text.include?('Interested companies can contact the Alliance.') && output.at_css('main a[href="/alliance/membership/contact/"]')
    reason='Approved membership application link now points to the local contact page'
   elsif paragraph.css('a').any?(&legacy_homepage)
    revised=paragraph.dup(1)
    revised.css('a').select(&legacy_homepage).each{|a|a.content='the CHERI Alliance'}
    abort "Localised Alliance homepage link changed unrelated wording: #{row['new_url']}" unless text.include?(normalize.call(revised.text)) && output.at_css('main a[href="/"]')
    reason='Approved local homepage link uses the CHERI Alliance label instead of the old hostname'
   end
   abort "Lost source paragraph: #{row['old_source']} #{expected[0,150]}" unless reason
   transformed+=1
  end
  audit<<[row['old_source'],row['new_source'],row['new_url'],'paragraph',expected,reason ? 'Migrated semantic content' : 'Preserved text',reason||'Same visible text']
 end
end
# Exercise actual Liquid + repository Kramdown without publishing illustrative content.
literal="{{ page.title }}\n{% assign fixture = 1 %}"
liquid=Liquid::Template.parse("{% raw %}\n~~~ liquid\n#{literal}\n~~~\n{% endraw %}").render!('page'=>{'title'=>'MUST NOT EXECUTE'})
rendered=Nokogiri::HTML.fragment(converter.convert(liquid))
abort 'Literal Liquid example executed or lost' unless rendered.at_css('pre').text.strip==literal
# Exercise native Kramdown + the safe-build link adapter without JavaScript.
links_markdown=<<~'MARKDOWN'
  [External](https://example.org/path?q=1&x=2 "An existing title")
  <https://example.org/autolink>
  [Existing attributes](https://example.org/existing){: rel="nofollow" target="_self" }
  [Protocol relative](//example.org/protocol)
  [Internal](/people/gavin-ferris/)
  [Canonical](HTTPS://ADAM-3BIAN.GITHUB.IO/people/gavin-ferris/)
  [Mail](mailto:person@example.org)
  [Fragment](#local)
  [View slides](/slides.pdf){: .button }
  `https://example.org/literal`

  ~~~html
  <a href="https://example.org/code">Literal example</a>
  ~~~
MARKDOWN
links_html=converter.convert(links_markdown)
link_template=Liquid::Template.parse('{% include external-links.html content=fixture %}')
adapted_html=link_template.render!({'fixture'=>links_html,'site'=>{'url'=>'https://adam-3bian.github.io'}},registers:{site:site,page:{}})
before_links=Nokogiri::HTML.fragment(links_html);after_links=Nokogiri::HTML.fragment(adapted_html)
abort 'Native Markdown button class was lost' unless after_links.at_css('a.button[href="/slides.pdf"]')
abort 'Link adapter changed content, code or destinations' unless before_links.text==after_links.text && before_links.css('a').map{|a|a['href']}==after_links.css('a').map{|a|a['href']}
after_links.css('a').each do |link|
 external=link['href'].start_with?('https://example.org/','//example.org/')
 if external
  abort 'External link attributes missing' unless link['target']=='_blank' && %w[noopener noreferrer].all?{|token|link['rel'].split.include?(token)}
  abort 'rel must precede target' unless link.attribute_nodes.map(&:name).index('rel') < link.attribute_nodes.map(&:name).index('target')
 else
  abort 'Internal/email/fragment link acquired external attributes' if link['target'] || link['rel']
 end
end
abort 'Existing rel tokens lost' unless after_links.at_css('a[href="https://example.org/existing"]')['rel'].split.include?('nofollow')
abort 'Existing title replaced' unless after_links.at_css('a[href^="https://example.org/path"]')['title']=='An existing title'
if audit_file
 CSV.open(audit_file,'w'){|csv|csv<<%w[old_source new_source new_url kind original_text outcome detail];audit.each{|row|csv<<row}}
end
puts "Markdown: #{count} literal code examples, #{paragraphs} source paragraphs (#{transformed} documented semantic/UI migrations), protected Liquid and native external-link fixtures passed."
