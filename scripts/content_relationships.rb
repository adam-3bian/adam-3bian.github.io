require 'date'

# A single canonical destination per reader, regardless of edge direction.
class ContentRelationships
  def initialize(lookup:, map:, settings:, today:)
    @lookup, @map, @settings, @today = lookup, map, settings, today
    @destinations = Hash.new { |hash, url| hash[url] = {} }
  end

  def canonical(object)
    @lookup[@settings.fetch('aliases', {}).fetch(object.url, object.url)] || object
  end

  def add(from, target, priority:, label: nil, context: nil)
    return if from.data['alternate']
    from, target = canonical(from), canonical(target)
    return if from.url == target.url || from.data['alternate'] || target.data['alternate']
    group = @map.fetch(target.url)['collection']
    existing = @destinations[from.url][target.url]
    candidate = {object: target, collection: group, priority: priority, label: label, contexts: []}
    if existing
      candidate = existing
      if priority < existing[:priority]
        candidate[:priority], candidate[:label] = priority, label
      end
    end
    candidate[:contexts] << context if context && !candidate[:contexts].include?(context)
    @destinations[from.url][target.url] = candidate
  end

  def data
    @destinations.sort.to_h.transform_values do |destinations|
      groups = destinations.values.group_by { |item| [item[:collection], item[:label]] }
      groups.sort_by do |(collection, label), items|
        [items.map { |item| item[:priority] }.min, @settings.fetch('related_order').index(collection) || 99, label.to_s]
      end.map do |(collection, label), items|
        targets = items.sort_by { |item| sort_key(item[:object], collection) }.map do |item|
          object = item[:object]
          target = {'url' => object.url, 'title' => object.data['title'], 'type' => @map.fetch(object.url)['page_type']}
          target['context'] = item[:contexts].join(' · ') unless item[:contexts].empty?
          target
        end
        {'label' => label || default_label(collection), 'targets' => targets}
      end
    end
  end

  private

  def default_label(collection)
    return 'Related pages' if collection == 'pages'
    "Related #{@settings.fetch('collections').fetch(collection)['label'].downcase}"
  end

  def sort_key(object, collection)
    title = object.data['title'].to_s.downcase
    if collection == 'news' || collection == 'academic-papers' || collection == 'reports'
      date = object.data['published_date'] || object.data['published_year']
      [date ? 0 : 1, date ? -date.to_s.delete('-').to_i : 0, title]
    elsif collection == 'events'
      start = (object.data['start_datetime'] || object.data['start_date']).to_s[0, 10]
      finish = (object.data['end_datetime'] || object.data['end_date'] || start).to_s[0, 10]
      [finish >= @today ? 0 : 1, finish >= @today ? start.delete('-').to_i : -start.delete('-').to_i, title]
    else
      [0, 0, title]
    end
  end
end
