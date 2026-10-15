#!/usr/bin/env ruby
require 'jekyll'
require 'kramdown-parser-gfm'
require_relative 'forms'

def check(value, message)
  raise message unless value
end

form = {'id' => 'contact-form', 'fields' => [
  {'name' => 'email', 'label' => 'Email address', 'type' => 'email', 'required' => true},
  {'name' => 'topic', 'label' => 'Topic', 'type' => 'select', 'options' => [{'label' => 'General enquiry', 'value' => 'general'}]},
  {'name' => 'message', 'label' => 'Message', 'type' => 'textarea', 'rows' => 6}
]}
check(AuthoredForms.errors(form, '').empty?, 'Valid starter-kit fields must pass')
[
  form.merge('action' => 'javascript:alert(1)'),
  form.merge('action' => '//unconfigured.example/'),
  form.merge('action' => 'https:///missing-host'),
  form.merge('action' => 'https://user:password@example.org/'),
  form.merge('method' => 'delete'),
  form.merge('before_heading' => 'missing'),
  form.merge('fields' => form['fields'] + [form['fields'].first]),
  form.merge('fields' => [{'name' => 'x', 'label' => 'X', 'type' => 'password'}]),
  form.merge('fields' => [{'name' => 'x', 'label' => 'X', 'type' => 'select', 'options' => []}]),
  form.merge('fields' => [{'name' => 'x', 'label' => 'X', 'required' => 'false'}])
].each { |invalid| check(!AuthoredForms.errors(invalid, '').empty?, 'Invalid form authoring must fail') }
check(AuthoredForms.errors(form.merge('before_heading' => 'next'), "## Next\n").empty?, 'Existing insertion heading must pass')

site = Jekyll::Site.new(Jekyll.configuration('quiet' => true, 'baseurl' => '/preview'))
source = File.read(File.expand_path('../_includes/form.html', __dir__))
render = lambda do |value|
  Liquid::Template.parse(source).render!({'page' => {'title' => 'Contact', 'form' => value}}, registers: {site: site})
end
preview = render.call(form)
check(!preview.include?('<form '), 'Missing endpoint must never create a submitting form')
check(preview.include?('disabled aria-describedby="contact-form-status"'), 'Preview submission remains disabled')
check(preview.include?('id="contact-form-email" name="email" required'), 'Native validation and label identifiers survive rendering')
%w[get post].each do |method|
  connected = render.call(form.merge('action' => '/receive/', 'method' => method))
  check(connected.include?('action="/preview/receive/" method="' + method + '"'), 'Native action respects method and base URL')
  check(connected.include?('type="submit"') && !connected.include?('disabled aria-describedby'), 'Connected form uses a native submit button')
end
external = render.call(form.merge('action' => 'https://example.org/receive?a=1&b=2'))
check(external.include?('action="https://example.org/receive?a=1&amp;b=2" method="post"'), 'External actions are escaped and default to POST')
puts 'PASS: form schema, preview isolation, native GET/POST, escaped external action and /preview URLs'
