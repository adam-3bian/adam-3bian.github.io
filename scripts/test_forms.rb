require 'jekyll'
require 'nokogiri'
require 'yaml'
root = File.expand_path('..', __dir__)
site = Jekyll::Site.new(Jekyll.configuration('source' => root, 'safe' => true, 'baseurl' => '/preview', 'quiet' => true))
form = YAML.safe_load(File.read(File.join(root, '_data/forms.yml')))['contact']
template = Liquid::Template.parse('{% include form-panel.html form=fixture action=endpoint method=verb %}')
render = lambda do |endpoint, method = nil|
  html = template.render!({'fixture' => form, 'endpoint' => endpoint, 'verb' => method, 'site' => site.site_payload['site']}, registers: {site: site, page: {}})
  Nokogiri::HTML.fragment(html)
end
contact_template = Liquid::Template.parse('{% include contact-form.html %}')
contact = contact_template.render!({'page' => {'form' => {'action' => '/live-contact/'}}, 'site' => {'data' => {'forms' => {'contact' => form}}}}, registers: {site: site, page: {}})
abort 'Contact page front matter does not enable native submission' unless Nokogiri::HTML.fragment(contact).at_css('form')['action'] == '/preview/live-contact/'
unconfigured_contact = contact_template.render!({'page' => {}, 'site' => {'data' => {'forms' => {'contact' => form}}}}, registers: {site: site, page: {}})
unconfigured_contact = Nokogiri::HTML.fragment(unconfigured_contact)
fields = unconfigured_contact.css('input, textarea, select')
abort 'Contact fields must remain visible without an action' unless fields.map { |field| field['name'] } == form['fields'].map { |field| field['name'] }
abort 'Restored contact fields lack labels' unless fields.all? { |field| unconfigured_contact.at_css("label[for='#{field['id']}']") }
abort 'Unconfigured contact must not submit to the current page' unless unconfigured_contact.css('form').empty? && unconfigured_contact.at_css('button[disabled][type="button"]')
abort 'Published contact route must remain available' unless unconfigured_contact.at_css("a[href='#{form['external_url']}']")
abort 'Preview notice remains on contact' if unconfigured_contact.text.include?('Preview form') || unconfigured_contact.text.include?('Submission is unavailable')
ids = unconfigured_contact.css('[id]').map { |node| node['id'] }
abort 'Restored contact duplicates anchor IDs' unless ids.uniq == ids
blank = render.call(nil)
abort 'Inactive form should offer the existing published form, without dead controls' unless blank.css('form, input, textarea, select, button').empty? && blank.at_css('a.button')['href'] == form['external_url']
abort 'Preview notice remains' if blank.text.include?('Preview form') || blank.text.include?('Submission is unavailable')
[['/contact-endpoint/', '/preview/contact-endpoint/'], ['https://example.test/enquiries', 'https://example.test/enquiries']].each do |endpoint, expected|
  output = render.call(endpoint)
  f = output.at_css('form')
  abort 'Configured endpoint or method lost' unless f && f['action'] == expected && f['method'] == 'post'
  abort 'Submit must be live' unless f.at_css('button[type="submit"]') && !f.at_css('button')['disabled']
  abort 'Authored field names changed' unless f.css('input, textarea, select').map { |field| field['name'] } == form['fields'].map { |field| field['name'] }
  abort 'Fields lack labels' unless f.css('input, textarea, select').all? { |field| f.at_css("label[for='#{field['id']}']") }
end
abort 'GET configuration ignored' unless render.call('/contact-endpoint/', 'get').at_css('form')['method'] == 'get'
abort 'Unknown methods must fall back to POST' unless render.call('/contact-endpoint/', 'delete').at_css('form')['method'] == 'post'
puts 'Contact form: visible unconfigured fields, configured POST/GET endpoints, baseurl, labels and published fallback passed; no submissions sent.'
