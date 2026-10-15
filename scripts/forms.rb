# The starter-kit form contract, validated before Liquid renders it.
require 'uri'

module AuthoredForms
  def self.errors(form, content)
    return [] if form.nil?
    errors = []
    return ['form must be a mapping'] unless form.is_a?(Hash)
    allowed = %w[id title action method submit demo before_heading fields]
    errors << 'unknown form properties' unless (form.keys - allowed).empty?
    %w[id title action method submit demo before_heading].each do |key|
      errors << "#{key} must be text" if !form[key].nil? && !form[key].is_a?(String)
    end
    if form['id'] && !form['id'].to_s.match?(/\A[a-z][a-z0-9-]*\z/)
      errors << 'id must be a lowercase HTML identifier'
    end
    action = form['action'].to_s.strip
    begin
      uri = URI.parse(action)
      valid_endpoint = uri.is_a?(URI::HTTPS) && !uri.host.to_s.empty? && uri.userinfo.nil?
    rescue URI::InvalidURIError
      valid_endpoint = false
    end
    unless action.empty? || valid_endpoint || action.match?(%r{\A/(?!/)[^\s]*\z})
      errors << 'action must be an HTTPS endpoint or local absolute path'
    end
    errors << 'method must be get or post' if form['method'] && !%w[get post].include?(form['method'])
    if form['before_heading']
      rendered = Kramdown::Document.new(content, input: 'GFM').to_html
      errors << 'before_heading must identify an existing h2' unless rendered.include?(%(<h2 id="#{form['before_heading']}"))
    end
    fields = form['fields']
    return errors + ['fields must be a nonempty list'] unless fields.is_a?(Array) && !fields.empty?
    names = []
    fields.each do |field|
      unless field.is_a?(Hash)
        errors << 'each field must be a mapping'
        next
      end
      errors << 'unknown field properties' unless (field.keys - %w[name label type size required autocomplete placeholder help rows options]).empty?
      errors << 'invalid field name' unless field['name'].is_a?(String) && field['name'].match?(/\A[a-zA-Z][a-zA-Z0-9_-]*\z/)
      names << field['name']
      errors << 'field label must be nonempty text' unless field['label'].is_a?(String) && !field['label'].strip.empty?
      errors << 'unsupported field type' unless %w[text email tel textarea select].include?(field['type'] || 'text')
      errors << 'size must be half or full' if field['size'] && !%w[half full].include?(field['size'])
      errors << 'required must be boolean' if field.key?('required') && ![true, false].include?(field['required'])
      %w[autocomplete placeholder help].each do |key|
        errors << "field #{key} must be text" if field[key] && !field[key].is_a?(String)
      end
      if field.key?('rows') && !(field['rows'].is_a?(Integer) && field['rows'].between?(2, 30))
        errors << 'textarea rows must be between 2 and 30'
      end
      if field['type'] == 'select'
        options = field['options']
        if !options.is_a?(Array) || options.empty?
          errors << 'select needs options'
        else
          options.each do |option|
            unless option.is_a?(Hash) && (option.keys - %w[label value]).empty? && option['label'].is_a?(String) && !option['label'].strip.empty? && (!option.key?('value') || option['value'].is_a?(String))
              errors << 'invalid select option'
            end
          end
        end
      elsif field.key?('options')
        errors << 'only select fields have options'
      end
    end
    errors << 'field names must be unique' unless names.uniq == names
    errors
  end
end
