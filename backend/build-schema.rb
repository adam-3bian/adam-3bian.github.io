# Run from the repository root: bundle exec ruby backend/build-schema.rb
# Share the exact front-matter field definitions with the separate PHP service.
require 'yaml'
require 'json'
require 'fileutils'

root = File.expand_path('..', __dir__)
schemas = %w[contact apply].to_h do |name|
  front_matter = File.read(File.join(root, "#{name}.md")).split(/^---\s*$\n?/, 3)[1]
  page = YAML.safe_load(front_matter, aliases: true)
  form = page.fetch('form')
  [form.fetch('id'), form]
end

FileUtils.mkdir_p(File.join(__dir__, 'private'))
File.write(File.join(__dir__, 'private/form-schema.json'), JSON.pretty_generate(schemas) + "\n")
puts 'Exported contact and housing application schemas.'
