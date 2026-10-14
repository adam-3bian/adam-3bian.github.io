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
header_menu = site.config.fetch('navigation').fetch('header')
index_pages = {}
errors = []
# Keep the complete examples in the authoring reference executable.
reference = File.read(File.join(root, 'FRONT_MATTER.md'))
reference_examples = reference.scan(/<!-- schema: ([\w-]+) -->\s*```yaml\n(.*?)\n```/m).map do |kind, example|
  fields = YAML.safe_load(example, permitted_classes: [Date, Time], aliases: false)
  [kind, fields]
end
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

def required_schema_fields(schema, fields, common, optional = {})
  optional_fields = common.merge(optional)
  required = fields.reject { |key, _| optional_fields.key?(key) && !schema.key?(key) }
  if schema['related'].is_a?(Hash) && required['related'].is_a?(Hash)
    required['related'] = required['related'].select { |key, _| schema['related'].key?(key) }
  end
  required
end

reference_examples.each do |kind, fields|
  errors << "Invalid FRONT_MATTER.md #{kind} example" unless schemas[kind] && same_fields?(schemas[kind], required_schema_fields(schemas[kind], fields, schemas.fetch('common', {}), schemas.dig('optional', kind) || {}))
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
  required_fields = required_schema_fields(schemas.fetch(kind), fields, schemas.fetch('common', {}), schemas.dig('optional', kind) || {})
  errors << "Incomplete or unexpected schema fields: #{entry['file']}" unless same_fields?(schemas[kind], required_fields)
  errors << "Missing title: #{entry['file']}" if object.data['title'].to_s.strip.empty?
  %w[parent next_page_url].each do |key|
    target = fields[key]
    if target.to_s.start_with?('/') && !lookup.key?(target)
      errors << "Unknown #{key} route #{target}: #{entry['file']}"
    end
  end
  if kind == 'index'
    errors << "Index introduction must be nonempty: #{entry['file']}" unless fields['summary'].is_a?(String) && !fields['summary'].strip.empty?
    errors << "Index content belongs in summary, not its body: #{entry['file']}" unless object.content.strip.empty?
    menu = header_menu.find { |section| section['url'] == object.url }
    if object.url != '/' && !menu
      errors << "Index has no matching mega-menu: #{entry['file']}"
    end
    groups = (menu && menu['subcategories'] || []).map do |group|
      links = group.fetch('links', []).map { |link| link.slice('title', 'url') }
      links.unshift({'title' => "#{group['title']} overview", 'url' => group['url']}) if group['url']
      {'title' => group['title'], 'links' => links}
    end
    links = object.url == '/' ? header_menu.select { |section| section['url'] }.map { |section| section.slice('title', 'url') } : groups.flat_map { |group| group['links'] }
    errors << "Index has no page links: #{entry['file']}" if links.empty?
    index_pages[object.url] = {'title' => fields['title'], 'summary' => fields['summary'],
                             'columns' => menu && menu.fetch('columns', 3) || 1,
                             'groups' => groups, 'links' => links}
  end
  if kind == 'listing'
    listing = fields['listing'] || {}
    errors << "Invalid listing role: #{entry['file']}" unless [nil, 'speaker', 'member', 'board'].include?(listing['role'])
    errors << "Invalid listing status: #{entry['file']}" unless [nil, 'past', 'upcoming'].include?(listing['status'])
    if fields['layout'] == 'list' && !settings['collections'].key?(listing['collection'])
      errors << "Invalid listing collection: #{entry['file']}"
    end
    collection = %w[people events news].include?(fields['layout']) ? fields['layout'] : listing['collection']
    role = listing['role'] || settings.dig('listing_presets', object.url, 'role')
    if (['speaker', 'board'].include?(role) && collection != 'people') || (role == 'member' && collection != 'organisations')
      errors << "Listing role does not match its collection: #{entry['file']}"
    end
    errors << "Event status on non-event listing: #{entry['file']}" if listing['status'] && collection != 'events'
    if fields['certification']
      errors << "Invalid certification listing: #{entry['file']}" unless collection == 'hardware' && fields['certification'] == 'cheri-enabled'
    end
  end
  if kind == 'hardware'
    if fields['certification']
      errors << "Invalid hardware certification: #{entry['file']}" unless fields['certification'] == 'cheri-enabled'
      errors << "Missing certification evidence URL: #{entry['file']}" if fields['certification_url'].to_s.strip.empty?
    elsif fields['certification_url']
      errors << "Certification evidence without a certification: #{entry['file']}"
    end
  end
  fields.each do |key, value|
    next if value.nil?
    if key == 'version'
      errors << "Invalid version (use a quoted string): #{entry['file']}" unless value.is_a?(String) && !value.strip.empty?
    elsif key == 'document_date'
      begin
        raise ArgumentError unless value.is_a?(String) && value.match?(/\A\d{4}-\d{2}(?:-\d{2})?\z/)
        Date.iso8601(value.length == 7 ? "#{value}-01" : value)
      rescue ArgumentError
        errors << "Invalid document_date (use quoted YYYY-MM or YYYY-MM-DD): #{entry['file']}"
      end
    elsif key == 'document_url'
      begin
        uri = URI.parse(value.to_s)
        raise URI::InvalidURIError unless value.is_a?(String) && ((uri.is_a?(URI::HTTP) && uri.host) || value.start_with?('/'))
        if value.start_with?('/') && !File.file?(File.join(root, value.sub(%r{^/}, '')))
          errors << "Missing document asset #{value}: #{entry['file']}"
        end
      rescue URI::InvalidURIError
        errors << "Invalid document_url: #{entry['file']}"
      end
    elsif key.end_with?('_date')
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
  if kind == 'reports'
    errors << "Invalid report publication type: #{entry['file']}" unless %w[report white-paper policy-paper technical-report].include?(fields['publication_type'])
    errors << "Missing report publication URL: #{entry['file']}" if fields['publication_url'].to_s.strip.empty?
    errors << "Missing report publisher: #{entry['file']}" if fields['publisher'].to_s.strip.empty?
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
  related = fields['related'] || {}
  errors << "Invalid related mapping: #{entry['file']}" unless related.is_a?(Hash)
  (related.is_a?(Hash) ? related : {}).each do |collection, references|
    unless (collection == 'pages' || settings['collections'].key?(collection)) && references.is_a?(Array) && references.all? { |slug| slug.is_a?(String) }
      errors << "Invalid related #{collection} references: #{entry['file']}"
      next
    end
    errors << "Duplicate related #{collection} references: #{entry['file']}" unless references.uniq.length == references.length
    references.each do |slug|
      target = collection == 'pages' ? lookup[settings.fetch('aliases', {}).fetch(slug, slug)] : slugs.fetch(collection, {})[slug]
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
  errors << "Unknown alias source #{url}" unless lookup.key?(url)
  errors << "Unknown alias target #{url} -> #{target}" unless lookup.key?(target)
  errors << "Chained or circular alias #{url} -> #{target}" if settings.fetch('aliases', {}).key?(target)
end
objects.each do |object|
  if object.data['layout'] == 'redirect' && !settings.dig('aliases', object.url)
    errors << "Redirect without an alias destination: #{object.url}"
  end
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
  next unless object.is_a?(Jekyll::Document)
  # Every collection record has a local image (a clearly labelled SVG when no
  # source image exists), stored under its owning collection and record name.
  expected_assets = "/assets/#{object.collection.label}/#{object.data['slug']}/"
  unless object.data['image_url'].to_s.start_with?(expected_assets)
    errors << "Collection image outside its record directory: #{entry['file']}"
  end
  validate_values = lambda do |value, field|
    if value.is_a?(Hash)
      value.each { |key, child| validate_values.call(child, [field, key].reject(&:empty?).join('.')) }
    elsif value.is_a?(Array)
      errors << "Duplicate #{field} values: #{entry['file']}" unless value.uniq.length == value.length
      value.each { |child| validate_values.call(child, field) }
    elsif value && (field.end_with?('_url') || field == 'repository_urls')
      begin
        uri = URI.parse(value.to_s)
        raise URI::InvalidURIError unless (uri.is_a?(URI::HTTP) && uri.host) || value.to_s.start_with?('/')
      rescue URI::InvalidURIError
        errors << "Invalid #{field} URL: #{entry['file']}"
      end
    end
  end
  validate_values.call(object.data, '')
  rendered = markdown.convert(object.content)
  rendered.scan(/<a\b[^>]*?\bhref\s*=\s*["']([^"']*)["']/i).flatten.each do |href|
    href = CGI.unescapeHTML(href)
    errors << "Empty Markdown link: #{entry['file']}" if href.empty?
    next unless href.start_with?('/')
    target = URI::DEFAULT_PARSER.unescape(href.split(/[?#]/).first)
    unless lookup.key?(target) || File.file?(File.join(root, target.sub(%r{^/}, '')))
      errors << "Unknown collection content link #{href}: #{entry['file']}"
    end
  end
end
errors << 'Duplicate routes in source map' unless map.map { |entry| entry['url'] }.uniq.length == map.length
errors << 'Content record count differs from source map' unless objects.length == map.length
board = site.data.fetch('governing-board')
errors << 'Duplicate governing-board people' unless board.uniq.length == board.length
board.each do |slug|
  errors << "Unknown governing-board person: #{slug}" unless slugs.fetch('people', {}).key?(slug)
  errors << "Alternate governing-board person: #{slug}" if slugs.dig('people', slug)&.data&.fetch('alternate', false)
end

records = objects.sort_by { |object| object.data['title'].to_s.downcase }.map do |object|
  entry = map_lookup[object.url]
  next unless entry
  field_date = object.data['published_date'] || object.data['start_datetime'] || object.data['start_date'] || object.data['published_year'] || object.data['updated_date'] || object.data['document_date']
  image = object.data['image_url'].to_s
  image_status = image.empty? ? 'none' : image.end_with?('/placeholder.svg') ? 'placeholder' : 'provided'
  schema = schemas.fetch(schema_kind(object, entry))
  properties = (schema.keys + schemas.fetch('common', {}).keys + (schemas.dig('optional', schema_kind(object, entry)) || {}).keys).uniq.each_with_object({}) do |key, values|
    values[key] = object.data[key] if schema.key?(key) || !object.data[key].nil?
  end
  {'title' => object.data['title'], 'url' => object.url, 'file' => entry['file'],
   'type' => entry['page_type'], 'collection' => entry['collection'],
   'has_image' => image_status == 'provided', 'image_status' => image_status,
   'missing_news_date' => entry['collection'] == 'news' && object.data['published_date'].nil?,
   'display_date' => field_date && field_date.to_s,
   'alternate' => object.data['alternate'] == true,
   'alias_target' => settings.dig('aliases', object.url), 'properties' => properties}
end.compact
collection_summary = settings['collections'].map do |key, value|
  collection_records = records.select { |record| record['collection'] == key }
  {'key' => key, 'label' => value['label'], 'url' => value['url'] || "/#{key}/",
   'records' => collection_records.length, 'canonical' => collection_records.count { |record| !record['alternate'] },
   'provided_images' => collection_records.count { |record| record['image_status'] == 'provided' },
   'placeholders' => collection_records.count { |record| record['image_status'] == 'placeholder' }}
end
report = {'generated_at' => Time.now.utc.iso8601, 'record_count' => records.length,
          'relationship_count' => edges.length, 'image_count' => images.length,
          'collection_count' => collection_summary.length, 'collections' => collection_summary,
          'errors' => errors.uniq, 'records' => records}
relation_data = relationships.transform_values do |groups|
  groups.map { |label, targets| {'label' => label, 'targets' => targets} }
end
File.write(File.join(root, '_data/checks.yml'), YAML.dump(report))
File.write(File.join(root, '_data/relationships.yml'), YAML.dump(relation_data))
FileUtils.mkdir_p(File.join(root, 'reports'))
File.write(File.join(root, 'reports/index-navigation.json'), JSON.pretty_generate(index_pages) + "\n")
footer_navigation = {
  'groups' => Array(config.dig('navigation', 'footer')).map do |group|
    {'title' => group['title'], 'links' => Array(group['links']).map { |link| link.slice('title', 'url') }}
  end,
  'utilities' => Array(config.dig('navigation', 'social')).map { |link| link.slice('title', 'url') } +
    [{'title' => 'Content audit', 'url' => '/checks/'}]
}
File.write(File.join(root, 'reports/footer-navigation.json'), JSON.pretty_generate(footer_navigation) + "\n")
File.write(File.join(root, 'reports/preflight.json'), JSON.pretty_generate(report) + "\n")
File.write(File.join(root, 'reports/relationship-edges.json'), JSON.pretty_generate(edges) + "\n")
puts JSON.generate({'records' => records.length, 'relationships' => edges.length, 'images' => images.length, 'errors' => errors.uniq})
exit(errors.empty? ? 0 : 1)
