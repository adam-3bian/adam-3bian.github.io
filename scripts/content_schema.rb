# Shared validation for authored front matter, separate from Jekyll defaults.
require 'date'
require 'uri'
module ContentSchema
  module_function

  def errors(kind, fields, schemas, collections)
    return ['Front matter must be a mapping'] unless fields.is_a?(Hash)
    shape = schemas.fetch('common', {}).merge(schemas.fetch(kind, {})).merge(schemas.dig('optional', kind) || {})
    shape['related'] = (collections + ['pages']).to_h { |key| [key, []] } if shape.key?('related')
    problems = validate_shape(shape, fields)
    Array(schemas.dig('required', kind)).each do |key|
      value = fields[key]
      problems << "Missing required #{key}" if !fields.key?(key) || value.nil? || value.respond_to?(:empty?) && value.empty?
    end
    problems
  end

  def validate_shape(shape, fields, prefix = '')
    fields.flat_map do |key, value|
      name = prefix.empty? ? key.to_s : "#{prefix}.#{key}"
      next ["Unknown field #{name}"] unless shape.key?(key)
      next ["Omit unused #{name}"] if value.nil? || value.respond_to?(:empty?) && value.empty?
      expected = shape[key]
      case expected
      when Hash
        value.is_a?(Hash) ? validate_shape(expected, value, name) : ["#{name} must be a mapping"]
      when Array
        next ["#{name} must be an array"] unless value.is_a?(Array)
        problems = []
        problems << "Duplicate #{name} values" unless value.uniq.length == value.length
        if expected.first.is_a?(Hash)
          value.each_with_index do |entry, index|
            if entry.is_a?(Hash)
              problems.concat(validate_shape(expected.first, entry, "#{name}[#{index}]"))
              expected.first.each_key { |required| problems << "Missing #{name}[#{index}].#{required}" if entry[required].to_s.strip.empty? }
              problems << "Invalid #{name}[#{index}].label" unless entry['label'].is_a?(String)
              problems << "Invalid #{name}[#{index}].url" unless entry['url'].is_a?(String)
            else
              problems << "#{name}[#{index}] must be a mapping"
            end
          end
        elsif !value.all? { |entry| entry.is_a?(String) && !entry.strip.empty? }
          problems << "#{name} must contain nonempty strings"
        end
        problems
      else
        if value.is_a?(Hash) || value.is_a?(Array)
          ["#{name} must be a scalar"]
        elsif key.to_s.start_with?('is_')
          [true, false].include?(value) ? [] : ["#{name} must be a boolean"]
        elsif key == 'published_year'
          value.is_a?(Integer) ? [] : ["#{name} must be an integer"]
        elsif key.to_s.end_with?('_date', '_datetime')
          value.is_a?(String) || value.is_a?(Date) || value.is_a?(Time) ? [] : ["#{name} must be a date string"]
        elsif key.to_s.end_with?('_url') || key == 'url'
          begin
            uri = URI.parse(value)
            valid = value.is_a?(String) && ((uri.is_a?(URI::HTTP) && uri.host) || value.start_with?('/'))
            valid ? [] : ["Invalid #{name} URL"]
          rescue URI::InvalidURIError, TypeError
            ["Invalid #{name} URL"]
          end
        else
          value.is_a?(String) && !value.strip.empty? ? [] : ["#{name} must be nonempty text"]
        end
      end
    end
  end
end
