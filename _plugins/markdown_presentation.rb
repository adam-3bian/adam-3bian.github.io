# Editorial files contain Markdown only. Rebuild shared presentation after conversion.
require 'cgi'
module MarkdownPresentation
  def self.render(html, collection, data)
    return html unless data['layout'] == 'source-github'
    html.sub(/(<main\b[^>]*>)(.*?)(<\/main>)/m) do
      opening, body, closing = Regexp.last_match.captures
      body.sub!(/<ol class="source-breadcrumbs">(.*?)<\/ol>/m) do
        items = Regexp.last_match(1)
        items.sub!(/<li>([^<]*)<\/li>(\s*)\z/, '<li aria-current="page">\1</li>\2')
        '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>'+items+'</ol></nav>'
      end
      body.sub!(/(<h1\b[^>]*id="page-hero-title"[^>]*>.*?<\/h1>)(\s*<p\b[^>]*class="page-hero-summary"[^>]*>.*?<\/p>)?/m) do
        '<section class="page-hero" aria-labelledby="page-hero-title"><div class="page-hero-inner">'+Regexp.last_match(0)+'</div></section>'
      end
      hero_end = body.index('</section>')
      if hero_end
        prefix = body[0...hero_end+10]
        rest = body[hero_end+10..]
        if %w[people organisations events].include?(collection)
          sidebar = rest.slice!(/\A\s*<p\b[^>]*class="entity-media[^\"]*"[^>]*>.*?<\/p>\s*<dl\b[^>]*>.*?<\/dl>\s*(?:<p\b[^>]*class="entity-links[^\"]*"[^>]*>.*?<\/p>\s*)?/m)
          if sidebar
            sidebar.sub!(/<p([^>]*class="entity-media[^\"]*"[^>]*)>(.*?)<\/p>/m, '<figure\1>\2</figure>')
            sidebar.gsub!(/(<dt\b[^>]*>.*?<\/dt>)\s*(<dd\b[^>]*>.*?<\/dd>)/m, '<div>\1\2</div>')
            sidebar.gsub!(/<p([^>]*class="entity-links[^\"]*"[^>]*)>(.*?)<\/p>/m, '<nav\1 aria-label="External profiles">\2</nav>')
            back = rest.slice!(/<p([^>]*class="entity-back[^\"]*"[^>]*)>(.*?)<\/p>/m) || ''
            back.sub!(/<p([^>]*)>(.*?)<\/p>/m, '<nav\1>\2</nav>')
            kind = {'people'=>'person','organisations'=>'member','events'=>'event'}[collection]
            body = prefix+'<article class="entity-detail entity-detail--'+kind+'"><div class="entity-layout"><aside class="entity-sidebar" aria-label="Profile details">'+sidebar+'</aside><div class="entity-body">'+rest+'</div></div>'+back+'</article>'
          end
        elsif collection == 'news'
          metadata = rest.slice!(/<p([^>]*class="collection-detail__metadata[^\"]*"[^>]*)>(.*?)<\/p>/m) || ''
          metadata.sub!(/<p([^>]*)>(.*?)<\/p>/m, '<div\1 aria-label="Item details">\2</div>')
          metadata.gsub!(/<em class="source-date">(.*?)<\/em>/m) { '<time datetime="'+CGI.escapeHTML(data['date'].to_s)+'">'+Regexp.last_match(1)+'</time>' }
          metadata.gsub!(/<em class="collection-tag">(.*?)<\/em>/m, '<span class="collection-tag">\1</span>')
          image = rest.slice!(/<p([^>]*class="collection-detail__lead-image[^\"]*"[^>]*)>(.*?)<\/p>/m) || ''
          image.sub!(/<p([^>]*)>(.*?)<\/p>/m, '<figure\1>\2</figure>')
          back = rest.slice!(/<p\b[^>]*class="collection-detail__back[^\"]*"[^>]*>.*?<\/p>/m) || ''
          body = prefix+'<article class="collection-detail collection-detail--news">'+metadata+image+'<div class="collection-detail__body">'+rest+'</div>'+back+'</article>'
        end
      end
      opening+body+closing
    end
  end
end
[:pages, :documents].each do |owner|
  Jekyll::Hooks.register owner, :post_render do |item|
    collection = item.respond_to?(:collection) ? item.collection.label : nil
    item.output = MarkdownPresentation.render(item.output, collection, item.data)
  end
end
