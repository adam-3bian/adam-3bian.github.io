#!/usr/bin/env ruby
require 'jekyll'
require 'json'
require 'yaml'
require 'date'
require 'time'
require 'fileutils'
require 'cgi'
require 'uri'

root = File.expand_path('..', __dir__)
config = Jekyll.configuration('source' => root, 'quiet' => true)
site = Jekyll::Site.new(config)
site.reset
site.read
schemas = site.data.fetch('schemas')
map = site.data.fetch('page-map')
settings = site.data.fetch('viewer')
errors = []
objects = site.pages.select { |p| p.path.start_with?('pages/') } + site.documents
lookup = objects.to_h { |object| [object.url, object] }
map_lookup = map.to_h { |entry| [entry['url'], entry] }
slugs = site.collections.transform_values { |collection| collection.docs.to_h { |doc| [doc.data['slug'], doc] } }

def same_fields?(schema, value)
  if schema.is_a?(Hash)
    return false unless value.is_a?(Hash) && schema.keys.sort == value.keys.sort
    schema.all? { |key, sub| same_fields?(sub, value[key]) }
  elsif schema.is_a?(Array)
    return false unless value.is_a?(Array)
    schema.empty? || (!value.empty? && value.all? { |entry| same_fields?(schema.first, entry) })
  else
    true
  end
end

def schema_kind(object, entry)
  return object.collection.label if object.is_a?(Jekyll::Document)
  return 'listing' if entry['page_type'].include?('(list)')
  return 'index' if entry['page_type'].include?('(index)')
  'content'
end

edges = []
relationships = Hash.new { |hash, key| hash[key] = {} }
add_group = lambda do |from, label, target|
  groups = relationships[from.url]
  groups[label] ||= []
  unless groups[label].any? { |item| item['url'] == target.url }
    target_entry = map_lookup[target.url]
    groups[label] << {'url' => target.url, 'title' => target.data['title'],
                     'type' => target_entry ? target_entry['page_type'] : 'Content page'}
  end
end

objects.each do |object|
  entry = map_lookup[object.url]
  unless entry
    errors << "No route mapping for #{object.url}"
    next
  end
  kind = schema_kind(object, entry)
  raw = File.read(File.join(root, entry['file']))
  front = raw.match(/\A---\r?\n(.*?)\r?\n---/m)
  unless front
    errors << "No front matter: #{entry['file']}"
    next
  end
  fields = YAML.safe_load(front[1], permitted_classes: [Date, Time], aliases: true)
  errors << "Incomplete or unexpected schema fields: #{entry['file']}" unless same_fields?(schemas[kind], fields)
  errors << "Missing title: #{entry['file']}" if object.data['title'].to_s.strip.empty?
  fields.each do |key, value|
    next if value.nil?
    if key.end_with?('_date')
      begin
        raise ArgumentError unless value.to_s.match?(/\A\d{4}-\d{2}-\d{2}\z/)
        Date.iso8601(value.to_s)
      rescue ArgumentError
        errors << "Invalid date #{key}: #{entry['file']}"
      end
    elsif key.end_with?('_datetime')
      begin
        raise ArgumentError unless value.to_s.match?(/(?:Z|[+-]\d{2}:\d{2})\z/)
        Time.iso8601(value.to_s)
      rescue ArgumentError
        errors << "Invalid datetime #{key}: #{entry['file']}"
      end
    elsif key.start_with?('is_')
      errors << "Invalid boolean #{key}: #{entry['file']}" unless [true, false].include?(value)
    end
  end
  if kind == 'events'
    errors << "Invalid event start fields: #{entry['file']}" unless %w[start_date start_datetime].count { |k| !fields[k].nil? } == 1
    errors << "Invalid event end fields: #{entry['file']}" unless %w[end_date end_datetime].count { |k| !fields[k].nil? } <= 1
  end
  if fields['membership_tier'] && !%w[full community].include?(fields['membership_tier'])
    errors << "Invalid membership tier: #{entry['file']}"
  end
  if fields['published_year'] && (!fields['published_year'].is_a?(Integer) || fields['published_year'] < 1000 || fields['published_year'] > 9999)
    errors << "Invalid publication year: #{entry['file']}"
  end
  settings['roles'].each do |key, role|
    references = fields[key].nil? ? [] : Array(fields[key])
    references.each do |slug|
      target = slugs.fetch(role['target'], {})[slug]
      unless target
        errors << "Unknown #{key} reference #{slug}: #{entry['file']}"
        next
      end
      edges << {'from' => object.url, 'to' => target.url, 'field' => key}
      # Role-specific forward links already appear in the metadata strip.
      unless object.data['alternate']
        label = "#{role['inverse']} #{settings['collections'].fetch(entry['collection'], {'label' => 'Pages'})['label']}"
        add_group.call(target, label, object)
      end
    end
  end
  (fields['related'] || {}).each do |collection, references|
    references.each do |slug|
      target = collection == 'pages' ? lookup[slug] : slugs.fetch(collection, {})[slug]
      unless target
        errors << "Unknown related #{collection} reference #{slug}: #{entry['file']}"
        next
      end
      edges << {'from' => object.url, 'to' => target.url, 'field' => "related.#{collection}"}
      # Organisations have one forward display in the metadata strip.
      unless collection == 'organisations'
        add_group.call(object, settings['collections'].fetch(collection, {'label' => 'Related pages'})['label'], target)
      end
      unless object.data['alternate']
        label = "Related #{settings['collections'].fetch(entry['collection'], {'label' => 'pages'})['label']}"
        add_group.call(target, label, object)
      end
    end
  end
end

walk_navigation = lambda do |nodes|
  Array(nodes).each do |node|
    if node['url'].to_s.start_with?('/') && !lookup.key?(node['url'])
      errors << "Unknown navigation URL: #{node['url']}"
    end
    %w[subcategories links children].each { |key| walk_navigation.call(node[key]) if node[key] }
  end
end
%w[header footer social].each { |part| walk_navigation.call(config.dig('navigation', part)) }
map.each do |entry|
  errors << "Missing record at #{entry['url']}" unless lookup.key?(entry['url'])
  errors << "Unknown parent #{entry['parent']}" if entry['parent'] && !lookup.key?(entry['parent'])
end
settings.fetch('aliases', {}).each do |url, target|
  errors << "Unknown alias target #{url} -> #{target}" unless lookup.key?(target)
end

images = {}
markdown = site.find_converter_instance(Jekyll::Converters::Markdown)
objects.each do |object|
  entry = map_lookup[object.url]
  next unless entry
  # Render before extracting: also validate reference-style Markdown and images
  # inside semantic galleries/figures, while ignoring examples in code fences.
  image_urls = markdown.convert(object.content).scan(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i).flatten.map { |url| CGI.unescapeHTML(url) }
  image_urls << object.data['image_url'] if object.data['image_url']
  image_urls.each do |url|
    next unless url.start_with?('/')
    path = File.join(root, URI::DEFAULT_PARSER.unescape(url.split(/[?#]/).first).sub(%r{^/}, ''))
    errors << "Missing image #{url}: #{entry['file']}" unless File.file?(path)
    images[url] = true
  end
end
errors << 'Duplicate routes in source map' unless map.map { |entry| entry['url'] }.uniq.length == map.length
errors << 'Content record count differs from source map' unless objects.length == map.length
site.data.fetch('governing-board').each do |slug|
  errors << "Unknown governing-board person: #{slug}" unless slugs.fetch('people', {}).key?(slug)
end

records = objects.sort_by { |object| object.data['title'].to_s.downcase }.map do |object|
  entry = map_lookup[object.url]
  next unless entry
  field_date = object.data['published_date'] || object.data['start_datetime'] || object.data['start_date'] || object.data['published_year'] || object.data['updated_date']
  {'title' => object.data['title'], 'url' => object.url, 'file' => entry['file'],
   'type' => entry['page_type'], 'collection' => entry['collection'],
   'has_image' => !object.data['image_url'].nil?,
   'missing_news_date' => entry['collection'] == 'news' && object.data['published_date'].nil?,
   'display_date' => field_date && field_date.to_s,
   'alternate' => object.data['alternate'] == true,
   'alias_target' => settings.dig('aliases', object.url)}
end.compact
report = {'generated_at' => Time.now.utc.iso8601, 'record_count' => records.length,
          'relationship_count' => edges.length, 'image_count' => images.length,
          'errors' => errors.uniq, 'records' => records}
relation_data = relationships.transform_values do |groups|
  groups.map { |label, targets| {'label' => label, 'targets' => targets} }
end
File.write(File.join(root, '_data/checks.yml'), YAML.dump(report))
File.write(File.join(root, '_data/relationships.yml'), YAML.dump(relation_data))
FileUtils.mkdir_p(File.join(root, 'reports'))
File.write(File.join(root, 'reports/preflight.json'), JSON.pretty_generate(report) + "\n")
File.write(File.join(root, 'reports/relationship-edges.json'), JSON.pretty_generate(edges) + "\n")
puts JSON.generate({'records' => records.length, 'relationships' => edges.length, 'images' => images.length, 'errors' => errors.uniq})
exit(errors.empty? ? 0 : 1)
