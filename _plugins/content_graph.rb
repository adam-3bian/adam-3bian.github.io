# Canonical Markdown supplies forward links; presentation and reverse lists are derived.
require 'cgi'
require 'date'
module CheriContent
  def self.plain(text)
    CGI.unescapeHTML(text.to_s.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip)
  end
  def self.fact(html, label)
    plain(html[/<dt>#{Regexp.escape(label)}<\/dt>\s*<dd>(.*?)<\/dd>/m, 1])
  end
  def self.event_dates(label)
    match = label.match(/(\d{1,2})(?:\s+(?:to|[-–])\s+(\d{1,2}))?\s+([A-Za-z]+)\s+(\d{4})/)
    return nil unless match
    first = Date.parse("#{match[1]} #{match[3]} #{match[4]}")
    last = Date.parse("#{match[2] || match[1]} #{match[3]} #{match[4]}")
    [first, last]
  rescue Date::Error
    nil
  end
  class Graph < Jekyll::Generator
    safe true
    priority :low
    def generate(site)
      groups = site.collections.transform_values(&:docs)
      index = groups.transform_values { |docs| docs.to_h { |doc| [doc.basename_without_ext, doc] } }
      refs = ->(value) { value.nil? ? [] : Array(value) }
      authored = groups.fetch('papers') + groups.fetch('news')
      author_ids = authored.flat_map { |p| refs.call(p.data['authors']) }.uniq
      today = Date.parse(ENV.fetch('CHERI_TODAY', site.time.strftime('%Y-%m-%d')))
      card = lambda do |doc|
        return doc.data['card'] if doc.data['card']
        kind = doc.collection.label
        html = Kramdown::Document.new(doc.content, site.config['kramdown']).to_html
        item = {'title'=>doc.data['title'], 'url'=>doc.url, 'slug'=>doc.basename_without_ext, 'collection'=>kind}
        summary = html[/<p\b[^>]*class="page-hero-summary"[^>]*>(.*?)<\/p>/m, 1]
        item['summary'] = CheriContent.plain(summary) unless summary.nil?
        item['date'] = doc.data['date'] if doc.data['date']
        if kind == 'news' && !item['date']
          published = html[/<em\b[^>]*class="source-date"[^>]*>(.*?)<\/em>/m, 1]
          item['date'] = Date.parse(CheriContent.plain(published)).iso8601 if published
        end
        images = doc.content.scan(%r{!\[([^\]]*)\]\((/assets/[^)]+)\)})
        image = images.find { |_alt,src| !src.include?('cheri-logo') }
        item['thumbnail'] = {'src'=>image[1], 'alt'=>image[0], 'fit'=>kind=='organisations' ? 'contain' : 'cover'} if image
        item['roles'] = []
        item['roles'] << 'speaker' if doc.data['speaker'] == true
        item['roles'] << 'author' if author_ids.include?(doc.basename_without_ext) && kind == 'people'
        item['roles'] << 'member' if doc.data['member'] == true
        if kind == 'organisations'
          item['membership'] = CheriContent.fact(html, 'Membership')
          item['founding'] = CheriContent.fact(html, 'Status').downcase.include?('founding')
        end
        if kind == 'events'
          label = CheriContent.fact(html, 'Date')
          dates = CheriContent.event_dates(label)
          item['date_label'] = label
          item['location'] = CheriContent.fact(html, 'Location')
          if dates
            item['start_date'], item['end_date'] = dates.map(&:iso8601)
            item['status'] = dates.last < today ? 'past' : 'upcoming'
          else
            item['status'] = CheriContent.fact(html, 'Status').downcase
          end
        end
        item['search'] = ([item['title'], item['summary'], item['location'], item['membership']] + refs.call(doc.data['organization']).map { |id| index.fetch('organisations').fetch(id).data['title'] }).compact.join(' ')
        doc.data['card'] = item
      end
      groups.values.flatten.each(&card)
      resolve = lambda do |collection, ids, owner|
        refs.call(ids).map { |id| card.call(index.fetch(collection).fetch(id) { raise "Unknown #{collection} reference #{id} in #{owner.path}" }) }
      end
      groups.fetch('people').each do |person|
        id = person.basename_without_ext
        person.data['governing_board'] = site.data.fetch('governing-board').include?(id)
        person.data['linked_organizations'] = resolve.call('organisations', person.data['organization'], person)
        person.data['related_events'] = groups.fetch('events').select { |e| refs.call(e.data['speakers']).include?(id) }.map(&card)
        person.data['related_papers'] = groups.fetch('papers').select { |p| refs.call(p.data['authors']).include?(id) }.map(&card)
        person.data['related_news'] = groups.fetch('news').reject { |n| n.data['alternate'] == true }
          .select { |n| refs.call(n.data['authors']).include?(id) }
          .sort_by { |n| [n.data['card']['date'].to_s, n.data['title']] }.reverse.map(&card)
      end
      groups.fetch('events').each { |event| event.data['linked_speakers'] = resolve.call('people', event.data['speakers'], event) }
      authored.each { |article| article.data['linked_authors'] = resolve.call('people', article.data['authors'], article) }
      groups.fetch('organisations').each do |org|
        org.data['related_people'] = groups.fetch('people').select { |p| refs.call(p.data['organization']).include?(org.basename_without_ext) }.map(&card)
      end
      news = groups.fetch('news').reject { |d| d.data['alternate'] == true }.sort_by { |d| [d.data['card']['date'].to_s, d.data['title']] }.reverse
      events = groups.fetch('events').sort_by { |d| d.data['card']['start_date'].to_s }
      site.pages.each do |page|
        if page.data['listing']
          listing = page.data['listing']
          docs = case listing
                 when 'members' then groups.fetch('organisations').select { |d| d.data['member'] == true }
                 when 'speakers' then groups.fetch('people').select { |d| d.data['speaker'] == true }
                 when 'news' then news
                 when 'events' then events
                 else groups.fetch(listing)
                 end
          if listing == 'events'
            docs = docs.select { |d| d.data['card']['status'] == page.data['filter'] } if page.data['filter']
            docs = docs.reverse if page.data['filter'] == 'past'
          elsif listing != 'news'
            docs = docs.sort_by { |d| d.data['title'].downcase }
          end
          page.data['collection_items'] = docs.map(&card)
        end
        if page.url == '/'
          page.data['featured_news'] = news.first(3).map(&card)
          page.data['featured_events'] = events.select { |d| d.data['card']['status'] == 'upcoming' }.first(3).map(&card)
        end
        if page.url == '/alliance/leadership/governing-board/'
          site.data.fetch('governing-board').each { |id| index.fetch('people').fetch(id) }
        end
      end
    end
  end
end
