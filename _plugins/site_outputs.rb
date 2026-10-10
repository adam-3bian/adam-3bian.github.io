require 'json'
require 'cgi'
require 'rexml/document'
require 'set'
module CheriWebsite
  def self.relative(site, value)
    base = site.baseurl.to_s.sub(%r{/$}, '')
    return value if base.empty? || !value.start_with?('/') || value.start_with?('//') || value == base || value.start_with?(base+'/')
    base + value
  end
  class Outputs < Jekyll::Generator
    safe true
    priority :lowest
    def generate(site)
      docs = (site.pages + site.collections.values.flat_map(&:docs)).select { |doc| doc.extname == '.md' }
      search = docs.reject { |d| d.data['alternate'] == true || d.url == '/404.html' || d.url == '/search/' }.map do |doc|
        html = Kramdown::Document.new(doc.content, site.config['kramdown']).to_html
        text = CheriContent.plain(html.gsub(/<pre\b.*?<\/pre>/m, ' '))
        kind = doc.respond_to?(:collection) ? doc.collection.label : 'pages'
        card = doc.data['card'] || {}
        {'title'=>doc.data['title'], 'url'=>CheriWebsite.relative(site, doc.url), 'type'=>kind,
         'summary'=>card['summary'] || text[0,220], 'text'=>text, 'roles'=>card['roles'] || []}
      end
      path = ->(url) { site.config['url'].to_s + CheriWebsite.relative(site,url) }
      add = lambda do |name, content|
        page = Jekyll::PageWithoutAFile.new(site, site.source, '', name)
        page.data['layout'] = nil
        page.data['render_with_liquid'] = false
        page.content = content
        site.pages << page
      end
      add.call('search-index.json', JSON.generate(search)+"\n")
      add.call('site-build.json', JSON.generate({'baseurl'=>site.baseurl.to_s,'url'=>site.config['url'],'search_records'=>search.size})+"\n")
      urls = search.map { |entry| site.config['url'].to_s+entry['url'] }.uniq
      add.call('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map { |url| '<url><loc>'+CGI.escapeHTML(url)+'</loc></url>' }.join+ '</urlset>')
      add.call('robots.txt', "User-agent: *\nAllow: /\nDisallow: #{CheriWebsite.relative(site,'/reference/source-versions/')}\nSitemap: #{path.call('/sitemap.xml')}\n")
      add.call('.nojekyll', '')
      known = docs.map(&:url).to_set
      {'/members/'=>'/alliance/leadership/members/','/speakers/'=>'/news-and-events/people-and-opportunities/speakers/',
       '/contact/'=>'/alliance/membership/contact/','/subscribe/'=>'/news-and-events/news-and-analysis/subscribe-newsletter/',
       '/alliance/build/'=>'/build/'}.each do |from,to|
        next if known.include?(from)
        target = CheriWebsite.relative(site,to)
        redirect = Jekyll::PageWithoutAFile.new(site, site.source, from.sub(%r{\A/}, ''), 'index.html')
        redirect.data['layout'] = nil
        redirect.data['render_with_liquid'] = false
        redirect.content = '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url='+CGI.escapeHTML(target)+'"><title>Page moved | CHERI Alliance</title><link rel="canonical" href="'+CGI.escapeHTML(path.call(to))+'"></head><body><p>Page moved. <a href="'+CGI.escapeHTML(target)+'">Continue to the CHERI Alliance</a>.</p></body></html>'
        site.pages << redirect
      end
    end
  end
end
# Markdown can keep readable root paths while deployments use a project base path.
Jekyll::Hooks.register :site, :post_render do |site|
  (site.pages + site.collections.values.flat_map(&:docs)).each do |item|
    next unless item.output_ext == '.html'
    item.output = item.output.gsub(/\b(href|src|action)=(['"])(\/(?!\/)[^'"]*)\2/) do
      attribute, quote, value = Regexp.last_match.captures
      attribute+'='+quote+CheriWebsite.relative(site,value)+quote
    end
  end
end
