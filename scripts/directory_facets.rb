# Reserve the real controls in static HTML before progressive enhancement.
# Values are confirmed source metadata, matching the client-side directory data.
module DirectoryFacets
  module_function

  def generate(collections, board, objects)
    authors = objects.flat_map { |object| Array(object.data['authors']) + Array(object.data['author']) }.uniq
    hardware = collections.fetch('hardware').docs.to_h { |record| [record.data['slug'], record.data['title']] }
    collections.to_h do |name, collection|
      records = collection.docs.reject { |record| record.data['alternate'] || record.data['published'] == false }
      facets = []
      add = lambda do |key, label, values, labels = {}|
        values = values.compact.map(&:to_s).uniq.sort
        if values.size > 1
          facets << {'key' => key, 'label' => label, 'options' => values.map { |value| {'value' => value, 'label' => labels.fetch(value, value)} }}
        end
      end
      if name == 'people'
        roles = records.flat_map { |r| [r.data['is_speaker'] && 'speaker', board.include?(r.data['slug']) && 'board', authors.include?(r.data['slug']) && 'author'].select { |v| v } }
        add.call('role', 'Documented role', roles, {'speaker' => 'Speakers', 'board' => 'Board members', 'author' => 'Named authors'})
      elsif name == 'organisations'
        tiers = records.flat_map { |r| [r.data['membership_tier'] || 'unspecified', r.data['is_founding_member'] && 'founder'].select { |v| v } }
        add.call('membership', 'Membership', tiers, {'full' => 'Full members', 'community' => 'Community members', 'unspecified' => 'Tier not specified', 'founder' => 'Founding members'})
      end
      field = {'news' => 'published_date', 'academic-papers' => 'published_year', 'reports' => 'published_year', 'policies' => 'document_date'}[name]
      dates = records.map { |r| name == 'events' ? r.data['start_datetime'] || r.data['start_date'] : r.data[field] }
      add.call('year', 'Source year', dates.map { |date| date ? date.to_s[0, 4] : 'unspecified' }, {'unspecified' => 'Date not specified'}) if field || name == 'events'
      if %w[hardware software].include?(name)
        add.call('kind', 'Resource type', records.map { |r| r.data['type'] || 'unspecified' }, {'unspecified' => 'Type not specified'})
      end
      add.call('period', 'Event period', %w[upcoming past], {'upcoming' => 'Upcoming and current', 'past' => 'Past'}) if name == 'events'
      if %w[academic-papers software guides reports].include?(name)
        platforms = records.flat_map { |r| Array(r.data.dig('related', 'hardware')) }
        add.call('platform', 'Related hardware', platforms, hardware)
      end
      [name, facets]
    end
  end
end
