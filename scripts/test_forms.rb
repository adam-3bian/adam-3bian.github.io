require 'jekyll'
require 'nokogiri'
require 'yaml'
root=File.expand_path('..',__dir__)
site=Jekyll::Site.new(Jekyll.configuration('source'=>root,'safe'=>true,'baseurl'=>'/preview','quiet'=>true))
forms=YAML.safe_load(File.read(File.join(root,'_data/forms.yml')))
template=Liquid::Template.parse('{% include form-from-data.html form=fixture %}')
render=lambda do |form|
 Nokogiri::HTML.fragment(template.render!({'fixture'=>form,'page'=>{'slug'=>'test-page'},'site'=>site.site_payload['site']},registers:{site:site,page:{}}))
end
forms.each do |key,form|
 output=render.call(form)
 abort 'External mode must never collect local data' unless output.css('form,input,textarea,select,button').empty?
 abort 'Published provider URL lost' unless output.at_css('a.button')['href']==form['submission']['url']
end
fixture={'id'=>'all-inputs','title'=>'Integration fixture','description'=>'Tests only; never submitted','privacy_url'=>'/policies/privacy/','submission'=>{'mode'=>'post','url'=>'/verified-endpoint/','label'=>'Send test'},'fields'=>[
 {'name'=>'first-name','type'=>'text','label'=>'First name','required'=>true,'width'=>'half','min_length'=>2,'max_length'=>50,'pattern'=>'[A-Za-z ]+','help'=>'Use letters','autocomplete'=>'given-name','default'=>'Ada'},
 {'name'=>'email','type'=>'email','label'=>'Email','required'=>true},
 {'name'=>'phone','type'=>'tel','label'=>'Phone'},
 {'name'=>'message','type'=>'textarea','label'=>'Message','rows'=>4,'default'=>'Hello <world>'},
 {'name'=>'topic','type'=>'select','label'=>'Topic','required'=>true,'options'=>[{'value'=>'research','label'=>'Research'},{'value'=>'build','label'=>'Build'}],'default'=>'build'},
 {'name'=>'consent','type'=>'checkbox','label'=>'I agree','required'=>true,'default'=>'yes'},
 {'name'=>'choice','type'=>'radio','label'=>'Choice','required'=>true,'options'=>[{'value'=>'one','label'=>'One'},{'value'=>'two','label'=>'Two'}],'default'=>'two','help'=>'Choose one'},
 {'name'=>'source','type'=>'hidden','default'=>'test-source'}]}
output=render.call(fixture);f=output.at_css('form')
abort 'POST endpoint/baseurl lost' unless f['action']=='/preview/verified-endpoint/'&&f['method']=='post'
abort 'Field type missing' unless %w[text email tel checkbox radio hidden].all?{|t|f.at_css("input[type='#{t}']")}&&f.at_css('textarea')&&f.at_css('select')
abort 'Provider wire names changed' unless f.at_css('input[type="text"]')['name']=='first-name'
abort 'Validation constraints lost' unless f.at_css('input[type="text"]')['minlength']=='2'&&f.at_css('input[type="text"]')['maxlength']=='50'&&f.at_css('input[type="text"]')['required']
abort 'Defaults not escaped/preserved' unless f.at_css('textarea').text=='Hello <world>'&&f.at_css('option[selected]')['value']=='build'&&f.at_css('input[type="radio"][checked]')['value']=='two'
f.css('input:not([type="hidden"]),select,textarea').each{|field|abort 'Field lacks connected label' unless output.at_css("label[for='#{field['id']}']")}
f.css('[aria-describedby]').each{|field|field['aria-describedby'].split.each{|id|abort 'Unresolved field help' unless output.at_css("[id='#{id}']")}}
ids=output.css('[id]').map{|n|n['id']};abort 'Duplicate form IDs' unless ids.uniq==ids
preview=render.call(fixture.merge('submission'=>{'mode'=>'disabled'}));abort 'Disabled preview can submit' unless preview.css('form,button[type="submit"]').empty?&&preview.at_css('fieldset[disabled]')&&preview.text.include?('Preview only')
puts 'Forms: external-only providers, POST renderer, eight input types, native constraints, wire names, escaping, defaults, labels/help, safe IDs and disabled preview passed; no submissions sent.'
