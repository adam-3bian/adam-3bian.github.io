# Validate actual Kramdown syntax; HTML inside fenced/inline code is literal source text.
require 'kramdown'
require 'yaml'
require 'json'
require 'date'
root = File.expand_path('..', __dir__)
config = YAML.safe_load(File.read(File.join(root, '_config.yml')))
paths = ['pages'] + config.fetch('collections').keys.map { |name| '_'+name }
checks = paths.flat_map { |path| Dir.glob(File.join(root, path, '**', '*.md')) }.sort.map do |path|
  text = File.read(path)
  match = text.match(/\A---\s*\n(.*?)\n---\s*\n(.*)\z/m)
  raise "Missing YAML front matter: #{path}" unless match
  front = YAML.safe_load(match[1], permitted_classes: [Date, Time])
  raise "Missing actual title: #{path}" unless front.is_a?(Hash) && front['title'].is_a?(String) && !front['title'].empty?
  body = match[2]
  raise "Liquid content wrapper: #{path}" if body.include?('{% raw %}') || body.include?('{% endraw %}')
  document = Kramdown::Document.new(body, input: 'Kramdown', auto_ids: false)
  walk = lambda do |node|
    raise "Raw HTML content in #{path}: #{node.type}" if [:html_element, :xml_comment, :xml_pi].include?(node.type)
    cms_classes = node.attr.fetch('class', '').split.select { |name| name.match?(/\A(?:elementor-|wp-|widget-|tablepress)/) || %w[entry-title source-div-text].include?(name) }
    raise "CMS formatting in #{path}: #{cms_classes.join(', ')}" unless cms_classes.empty?
    if node.type == :img
      classes = node.attr.fetch('class', '').split
      raise "Image alignment missing: #{path}" unless (classes & %w[image-left image-right image-full]).size == 1
    end
    if [:img, :a].include?(node.type)
      target = node.attr[node.type == :img ? 'src' : 'href']
      if target && target.start_with?('/assets/')
        raise "Missing local asset: #{target}" unless File.file?(File.join(root, target.delete_prefix('/')))
      end
    end
    node.children.each { |child| walk.call(child) }
  end
  walk.call(document.root)
  {'path'=>path.delete_prefix(root+'/'),'format'=>'yaml-front-matter-and-kramdown-only','status'=>'passed'}
end
File.write(File.join(root, 'reports/markdown-format-validation.json'), JSON.pretty_generate(checks)+"\n")
puts "PASS: #{checks.size} content files contain YAML front matter and Kramdown only; image classes and local assets exist."
