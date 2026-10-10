# Adapt existing collections to the uploaded starter's data contract.
# Keep content and source provenance in their existing files.
module CheriStarter
  class Adapter < Jekyll::Generator
    safe true
    priority :lowest
    def generate(site)
      site.data['navigation'] = site.config.fetch('navigation')
      (site.pages + site.collections.values.flat_map(&:docs)).each do |item|
        next unless item.extname == '.md'
        item.data['source_portrait'] = item.content.include?('.entity-media')
        item.data['subscribe'] = false if item.data['alternate'] == true || item.url == '/news-and-events/news-and-analysis/subscribe-newsletter/'
      end
    end
  end
end
