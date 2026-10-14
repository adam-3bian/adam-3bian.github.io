require 'json'
require 'fileutils'
require 'yaml'
require_relative 'content_schema'
require_relative 'content_relationships'

class ContentModelTest
  attr_reader :assertions

  def check(condition, message)
    @assertions = (@assertions || 0) + 1
    raise message unless condition
  end

  def assert_equal(expected, actual)
    check(expected == actual, "Expected #{expected.inspect}; received #{actual.inspect}")
  end

  def assert_empty(value)
    check(value.empty?, "Expected empty; received #{value.inspect}")
  end

  def refute_empty(value)
    check(!value.empty?, 'Expected a validation error')
  end

  def assert_includes(values, expected)
    check(values.include?(expected), "Missing #{expected.inspect} in #{values.inspect}")
  end

  Record = Struct.new(:url, :data)

  def setup
    root = File.expand_path('..', __dir__)
    @schemas = YAML.safe_load_file(File.join(root, '_data/schemas.yml'))
    @settings = YAML.safe_load_file(File.join(root, '_data/viewer.yml'))
    @records = {
      '/hardware/test/' => Record.new('/hardware/test/', {'title' => 'Test platform'}),
      '/software/test/' => Record.new('/software/test/', {'title' => 'Test software'}),
      '/software/old/' => Record.new('/software/old/', {'title' => 'Old software', 'alternate' => true}),
      '/working-groups/test/' => Record.new('/working-groups/test/', {'title' => 'Test working group'}),
      '/news/older/' => Record.new('/news/older/', {'title' => 'A older article', 'published_date' => '2025-03-10'}),
      '/news/newer/' => Record.new('/news/newer/', {'title' => 'Z newer article', 'published_date' => '2026-03-10'}),
      '/events/past/' => Record.new('/events/past/', {'title' => 'Past event', 'start_date' => '2025-03-10'}),
      '/events/future/' => Record.new('/events/future/', {'title' => 'Future event', 'start_date' => '2027-03-10'})
    }
    @settings['aliases'] = {'/software/old/' => '/software/test/'}
    map = @records.to_h { |url, _| [url, {'collection' => url.split('/')[1], 'page_type' => 'Record'}] }
    @relations = ContentRelationships.new(lookup: @records, map: map, settings: @settings, today: '2026-10-14')
  end

  def errors(kind, fields)
    ContentSchema.errors(kind, fields, @schemas, @settings['collections'].keys)
  end

  def test_title_only_record_and_meaningful_false_are_valid
    assert_empty errors('hardware', {'title' => 'A platform'})
    assert_empty errors('people', {'title' => 'A person', 'is_speaker' => false})
  end

  def test_required_and_unknown_fields_are_still_checked
    assert_includes errors('hardware', {}), 'Missing required title'
    assert_includes errors('hardware', {'title' => 'A platform', 'button_color' => 'red'}), 'Unknown field button_color'
    refute_empty errors('reports', {'title' => 'A report'})
    refute_empty errors('people', {'title' => false})
  end

  def test_optional_values_need_no_empty_scaffolding
    assert_includes errors('software', {'title' => 'A project', 'status' => nil}), 'Omit unused status'
    assert_includes errors('software', {'title' => 'A project', 'related' => {'hardware' => []}}), 'Omit unused related.hardware'
  end

  def test_named_repositories_require_both_fields_and_safe_urls
    assert_empty errors('software', {'title' => 'A project', 'repositories' => [{'label' => 'Source', 'url' => 'https://github.com/example/project'}]})
    refute_empty errors('software', {'title' => 'A project', 'repositories' => [{'url' => 'https://github.com/example/project'}]})
    refute_empty errors('software', {'title' => 'A project', 'repositories' => [{'label' => 'Source', 'url' => 'javascript:alert(1)'}]})
    refute_empty errors('software', {'title' => 'A project', 'repository_urls' => ['https://github.com/example/project']})
  end

  def test_role_arrays_cannot_be_scalar_or_duplicate
    refute_empty errors('policies', {'title' => 'A policy', 'authors' => 'a-person'})
    refute_empty errors('policies', {'title' => 'A policy', 'authors' => ['a-person', 'a-person']})
    assert_empty errors('policies', {'title' => 'A policy', 'authors' => ['a-person']})
  end

  def test_forward_reverse_and_alias_links_merge
    from = @records['/hardware/test/']
    @relations.add(from, @records['/software/test/'], priority: 1)
    @relations.add(from, @records['/software/test/'], priority: 2)
    @relations.add(from, @records['/software/old/'], priority: 1)
    targets = @relations.data.fetch(from.url).flat_map { |group| group['targets'] }
    assert_equal ['/software/test/'], targets.map { |target| target['url'] }
  end

  def test_role_context_survives_deduplication
    from = @records['/hardware/test/']
    target = @records['/working-groups/test/']
    @relations.add(from, target, priority: 1)
    @relations.add(from, target, priority: 0, label: 'Working groups', context: 'Lead')
    group = @relations.data.fetch(from.url).first
    assert_equal 'Working groups', group['label']
    assert_equal 1, group['targets'].length
    assert_equal 'Lead', group['targets'].first['context']
  end

  def test_self_links_and_archived_sources_do_not_create_recommendations
    from = @records['/hardware/test/']
    @relations.add(from, from, priority: 1)
    @relations.add(@records['/software/old/'], from, priority: 1)
    assert_empty @relations.data
  end

  def test_date_order_is_useful_and_deterministic
    from = @records['/hardware/test/']
    %w[/news/older/ /news/newer/ /events/past/ /events/future/].each { |url| @relations.add(from, @records[url], priority: 2) }
    groups = @relations.data.fetch(from.url)
    assert_equal ['/news/newer/', '/news/older/'], groups.find { |group| group['label'] == 'Related news' }['targets'].map { |target| target['url'] }
    assert_equal ['/events/future/', '/events/past/'], groups.find { |group| group['label'] == 'Related events' }['targets'].map { |target| target['url'] }
  end
end

failures = []
assertions = 0
tests = ContentModelTest.instance_methods(false).grep(/^test_/).sort
tests.each do |name|
  example = ContentModelTest.new
  begin
    example.setup
    example.public_send(name)
  rescue StandardError => error
    failures << "#{name}: #{error.message}"
  ensure
    assertions += example.assertions || 0
  end
end
result = {'tests' => tests.length, 'assertions' => assertions, 'errors' => failures}
FileUtils.mkdir_p(File.join(__dir__, '../reports/content-tests'))
File.write(File.join(__dir__, '../reports/content-tests/model.json'), JSON.pretty_generate(result) + "\n")
puts JSON.generate(result)
exit(failures.empty? ? 0 : 1)
