require 'json'
require_relative 'collection_order'

Record = Struct.new(:url, :data)
def record(title, **fields)
  Record.new("/fixture/#{title.downcase.tr(' ', '-')}/", {'title' => title}.merge(fields.transform_keys(&:to_s)))
end
def assert_order(collection, items, expected, **options)
  actual = CollectionOrder.sorted(items, collection, **options).map { |item| item.data['title'] }
  raise "#{collection}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
end
alphabetical = [record('Zulu'), record('alpha 10'), record('Alpha 2'), record('beta')]
%w[people organisations hardware software working-groups guides policies case-studies].each do |collection|
  assert_order(collection, alphabetical, ['Alpha 2', 'alpha 10', 'beta', 'Zulu'])
end
%w[academic-papers reports].each do |collection|
  items = [record('Zulu', published_year: 2025), record('Beta', published_year: 2024), record('Alpha', published_year: 2025), record('No year', published_date: '2099-01-01'), record('Absent')]
  assert_order(collection, items, ['Alpha', 'Zulu', 'Beta', 'Absent', 'No year'])
end
assert_order('news', [record('Zulu', published_date: '2026-01-01'), record('Beta'), record('Alpha', published_date: '2026-01-01'), record('New', published_date: '2026-02-01'), record('Absent')], ['New', 'Alpha', 'Zulu', 'Absent', 'Beta'])
events = [record('Late', start_datetime: '2026-10-14T12:00:00Z'), record('Alpha', start_datetime: '2026-10-14T09:00:00+01:00'), record('Beta', start_datetime: '2026-10-14T04:00:00-04:00'), record('Day', start_date: '2026-10-13')]
assert_order('events', events, ['Day', 'Alpha', 'Beta', 'Late'])
assert_order('events', events, ['Late', 'Alpha', 'Beta', 'Day'], archive: true)
# Equal natural titles still have deterministic title and canonical URL ties.
tie = [Record.new('/z/', {'title' => 'Same'}), Record.new('/a/', {'title' => 'Same'})]
raise 'URL tie-break failed' unless CollectionOrder.sorted(tie, 'people').map(&:url) == ['/a/', '/z/']
cache = JSON.parse(File.read(File.expand_path('../_data/collection_order.json', __dir__)))
%w[people organisations news events academic-papers hardware software working-groups guides policies case-studies reports].each do |name|
  urls = cache.fetch('collections').fetch(name)
  raise "Empty or repeated #{name} cache" if urls.empty? || urls.uniq != urls
end
puts 'Collection ordering: all twelve defaults, natural numbers/case, source-only dates, missing dates, title/URL ties and zoned event chronology passed.'
