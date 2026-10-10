# Editorial authors maintain one forward relationship. Reverse lists are derived.
module CheriContent
  class Graph < Jekyll::Generator
    safe true
    priority :low
    def generate(site)
      groups = site.collections.transform_values { |collection| collection.docs }
      index = groups.transform_values { |docs| docs.to_h { |doc| [doc.basename_without_ext, doc] } }
      refs = ->(value) { value.nil? ? [] : Array(value) }
      card = lambda do |doc|
        item = {'title'=>doc.data['title'], 'url'=>doc.url, 'slug'=>doc.basename_without_ext, 'collection'=>doc.collection.label}
        item['date'] = doc.data['date'] if doc.data['date']
        images = doc.content.scan(%r{!\[([^\]]*)\]\((/assets/[^)]+)\)})
        image = images.find { |alt,src| !src.include?('cheri-logo') }
        if image
          item['thumbnail'] = {'src'=>image[1], 'alt'=>image[0], 'fit'=>doc.collection.label=='organisations' ? 'contain' : 'cover'}
        end
        item
      end
      resolve = lambda do |collection, ids, owner|
        refs.call(ids).map do |id|
          doc = index.fetch(collection).fetch(id) { raise "Unknown #{collection} reference #{id} in #{owner.path}" }
          card.call(doc)
        end
      end
      groups.fetch('people').each do |person|
        id = person.basename_without_ext
        person.data['governing_board'] = site.data.fetch('governing-board').include?(id)
        person.data['linked_organizations'] = resolve.call('organisations', person.data['organization'], person)
        person.data['related_events'] = groups.fetch('events').select { |e| refs.call(e.data['speakers']).include?(id) }.map(&card)
        person.data['related_papers'] = groups.fetch('papers').select { |p| refs.call(p.data['authors']).include?(id) }.map(&card)
      end
      groups.fetch('events').each do |event|
        event.data['linked_speakers'] = resolve.call('people', event.data['speakers'], event)
      end
      groups.fetch('papers').each do |paper|
        paper.data['linked_authors'] = resolve.call('people', paper.data['authors'], paper)
      end
      groups.fetch('organisations').each do |organization|
        id = organization.basename_without_ext
        organization.data['related_people'] = groups.fetch('people').select { |p| refs.call(p.data['organization']).include?(id) }.map(&card)
      end
      site.pages.each do |page|
        if page.data['listing']
          page.data['collection_items'] = groups.fetch(page.data['listing']).sort_by { |d| d.data['title'].downcase }.map(&card)
        end
        if page.url == '/alliance/leadership/members/'
          named = page.content.scan(%r{\]\(/organisations/([^/]+)/\)}).flatten
          page.data['additional_members'] = groups.fetch('organisations').select { |d| d.data['member'] == true && !named.include?(d.basename_without_ext) }.map(&card)
        end
        if page.url == '/news-and-events/news-and-analysis/latest-news/'
          named = page.content.scan(%r{\]\(/news/([^/]+)/\)}).flatten
          page.data['additional_news'] = groups.fetch('news').select { |d| d.data['alternate'] != true && !named.include?(d.basename_without_ext) }.map(&card)
        end
        if page.url == '/alliance/leadership/governing-board/'
          # The central board list contains short people slugs only.
          site.data.fetch('governing-board').each { |id| index.fetch('people').fetch(id) }
        end
      end
    end
  end
end
