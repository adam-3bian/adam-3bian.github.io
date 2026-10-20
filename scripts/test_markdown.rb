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
   if row['new_url']=='/events/webinar-cheri-cra-compliance/' && expected.start_with?('Date & Time:')
    abort 'Webinar clock facts lost' unless text.include?('14:00–14:30')&&text.include?('Europe/London')&&output.at_css('time[datetime="2026-09-09"]')
    reason='Published date/clock facts moved to event.date/time_bounds/timezone'
   elsif row['new_url']=='/events/webinar-cheri-cra-compliance/' && expected.include?('TBD - insert video')
    abort 'Webinar recording lost' unless output.at_css('main a[href="https://www.youtube.com/watch?v=OZS6JHoAUkc"]')
    reason='Published recording moved to resources; obsolete TBD removed'
   elsif ['/alliance/membership/contact/','/news-and-events/news-and-analysis/subscribe-newsletter/'].include?(row['new_url'])
    provider=row['new_url'].include?('contact') ? 'https://cheri-alliance.org/contact/#contact_form' : 'https://cheri-alliance.kit.com/subscribe'
    if expected.downcase.include?('preview') || expected.include?('published Alliance')
     abort 'External form must replace obsolete preview copy' unless output.at_css("main .form-panel a[href='#{provider}']")&&output.css('main .form-panel input,main .form-panel textarea,main .form-panel select').empty?&&!text.downcase.include?('preview')
     reason='Obsolete preview/duplicate provider copy replaced by canonical external form CTA'
    end
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
if audit_file
 CSV.open(audit_file,'w'){|csv|csv<<%w[old_source new_source new_url kind original_text outcome detail];audit.each{|row|csv<<row}}
end
puts "Markdown: #{count} literal code examples, #{paragraphs} source paragraphs (#{transformed} documented semantic/UI migrations), and a protected Liquid fixture passed."
