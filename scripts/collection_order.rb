# A generated presentation cache, not a Jekyll plugin. Source records remain
# authoritative; Pages safe mode can read the committed result directly.
require 'date'
require 'time'

module CollectionOrder
  module_function

  def title_key(record)
    title = record.data.fetch('title').to_s
    natural = title.unicode_normalize(:nfkc).downcase.scan(/\d+|\D+/).map do |part|
      part.match?(/\A\d+\z/) ? [0, part.to_i] : [1, part]
    end
    [natural, title, record.url]
  end

  def date_key(value)
    return nil if value.nil? || value.to_s.empty?
    Time.iso8601(value.to_s.length == 10 ? "#{value}T00:00:00Z" : value.to_s).to_r
  end

  def sorted(records, collection, archive: false)
    records.sort_by do |record|
      title = title_key(record)
      case collection
      when 'news'
        date = date_key(record.data['published_date'])
        [date ? 0 : 1, date ? -date : 0, *title]
      when 'academic-papers', 'reports'
        year = record.data['published_year']
        [year ? 0 : 1, year ? -year : 0, *title]
      when 'events'
        date = date_key(record.data['start_datetime'] || record.data['start_date'])
        [date ? 0 : 1, date ? (archive ? -date : date) : 0, *title]
      else
        title
      end
    end
  end

  def generate(collections)
    canonical = collections.transform_values { |collection| collection.docs.reject { |record| record.data['alternate'] || record.data['published'] == false } }
    {'collections' => canonical.to_h { |name, records| [name, sorted(records, name).map(&:url)] },
     'event_archive' => sorted(canonical.fetch('events'), 'events', archive: true).map(&:url)}
  end
end
