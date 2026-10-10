# Wrap native Markdown without dropping or reordering source body text.
module CheriPresentation
  def self.cards(html)
    image_card = %r{<p>\s*(?:<a\b[^>]*>)?<img\b[^>]*>(?:</a>)?\s*</p>\s*(?:<p\b[^>]*class="collection-card__meta"[^>]*>.*?</p>\s*)?<h[23]\b[^>]*class="collection-card__title"[^>]*>.*?</h[23]>\s*(?:<p\b[^>]*class="collection-card__(?:summary|link)"[^>]*>.*?</p>\s*)+}m
    html = html.gsub(image_card) { |body| '<div class="source-card-grid"><section class="card">'+body+'</section></div>' }
    onward = %r{<h3\b[^>]*class="(?:where-next-card-title|related-pages-item-title)"[^>]*>.*?</h3>\s*<p\b[^>]*class="(?:where-next-summary|related-pages-item-summary)"[^>]*>.*?</p>\s*<p\b[^>]*class="source-card-label"[^>]*>.*?</p>}m
    html.gsub(onward) { |body| '<div class="source-card-grid"><section class="card">'+body+'</section></div>' }
        .gsub(%r{</section></div>\s*<div class="source-card-grid"><section class="card">}m, '</section><section class="card">')
  end
  def self.body(html, item)
    html = cards(html)
    html.sub!(%r{<ol class="source-breadcrumbs">.*?</ol>}m) { |crumbs| '<nav class="source-navigation" aria-label="Breadcrumb">'+crumbs+'</nav>' }
    if item.url == '/'
      html.sub!(%r{\A\s*(<h1\b.*?)(?=<h2)}m) { '<section class="hero hero-large"><div class="hero-intro">'+Regexp.last_match(1)+'</div></section>' }
      html.gsub!(%r{<h2\b[^>]*id="(?:protect-your-organisation|build-more-secure-products|build-the-technology)"[^>]*>.*?(?=<h2|<hr)}m) do |body|
        '<div class="home-paths"><section class="home-path card">'+body+'</section></div>'
      end
      html.gsub!(%r{</section></div>\s*<div class="home-paths"><section class="home-path card">}m, '</section><section class="home-path card">')
    else
      html.sub!(%r{(<h1\b[^>]*>.*?</h1>)(\s*<p\b[^>]*class="page-hero-summary"[^>]*>.*?</p>)?}m) { '<section class="hero page-intro"><div class="hero-intro">'+Regexp.last_match(0)+'</div></section>' }
      if item.respond_to?(:collection) && %w[people organisations events].include?(item.collection.label)
        html.sub!(%r{(<p\b[^>]*class="entity-media[^\"]*"[^>]*>.*?</p>\s*<dl\b[^>]*>.*?</dl>)(.*)\z}m) do
          '<div class="profile-layout"><aside class="profile-facts" aria-label="Profile details">'+Regexp.last_match(1)+'</aside><div class="profile-body">'+Regexp.last_match(2)+'</div></div>'
        end
      end
    end
    html
  end
end
[:pages, :documents].each do |owner|
  Jekyll::Hooks.register owner, :post_convert do |item|
    item.content = CheriPresentation.body(item.content, item) if item.data['layout'] == 'page' && item.extname == '.md'
  end
end
