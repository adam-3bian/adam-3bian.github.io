# Wrap native Markdown without dropping or reordering source body text.
module CheriPresentation
  def self.cards(html)
    image_card = %r{<p>\s*(?:<a\b[^>]*>)?<img\b[^>]*>(?:</a>)?\s*</p>\s*(?:<p\b[^>]*class="collection-card__meta"[^>]*>.*?</p>\s*)?<h[23]\b[^>]*class="collection-card__title"[^>]*>.*?</h[23]>\s*(?:<p\b[^>]*class="collection-card__(?:summary|link)"[^>]*>.*?</p>\s*)+}m
    html = html.gsub(image_card) { |body| '<div class="cards columns-3"><section class="card">'+body+'</section></div>' }
    onward = %r{<h3\b[^>]*class="(?:where-next-card-title|related-pages-item-title)"[^>]*>.*?</h3>\s*<p\b[^>]*class="(?:where-next-summary|related-pages-item-summary)"[^>]*>.*?</p>\s*<p\b[^>]*class="source-card-label"[^>]*>.*?</p>}m
    html.gsub(onward) { |body| '<div class="cards columns-3"><section class="card">'+body+'</section></div>' }
        .gsub(%r{</section></div>\s*<div class="cards columns-3"><section class="card">}m, '</section><section class="card">')
  end
  def self.body(html, item)
    html = cards(html)
    # Feed the starter's shared heading and breadcrumb includes, keeping source
    # text and anchors intact rather than embedding another theme inside it.
    item.data['rendered_breadcrumbs'] = html.slice!(%r{\A\s*<ol class="source-breadcrumbs">.*?</ol>}m)
    if item.data['rendered_breadcrumbs']
      item.data['rendered_breadcrumbs'].sub!(%r{<li>([^<]*)</li>(\s*</ol>)\s*\z}, '<li><span aria-current="page">\1</span></li>\2')
    end
    item.data['rendered_heading'] = html.slice!(%r{\A\s*<h1\b[^>]*>.*?</h1>(?:\s*<p\b[^>]*class="page-hero-summary"[^>]*>.*?</p>)?}m)
    if item.data['rendered_heading']
      item.data['heading_id'] = item.data['rendered_heading'][/\bid="([^"]+)"/, 1]
      item.data['rendered_heading'].sub!('class="page-hero-summary"', 'class="page-hero-summary lede"')
    end
    if item.url == '/'
      item.data['hero'] = {'size'=>'large'}
      html.gsub!(%r{<h2\b[^>]*id="(?:protect-your-organisation|build-more-secure-products|build-the-technology)"[^>]*>.*?(?=<h2|<hr)}m) do |body|
        '<div class="cards columns-3"><section class="card">'+body+'</section></div>'
      end
      html.gsub!(%r{</section></div>\s*<div class="cards columns-3"><section class="card">}m, '</section><section class="card">')
    end
    if item.respond_to?(:collection) && item.collection.label == 'people'
      html.gsub!(/(<img\b[^>]*class=")([^"]*image-left[^"]*)(")/, '\1\2 image-square\3')
    end
    html
  end
end
[:pages, :documents].each do |owner|
  Jekyll::Hooks.register owner, :pre_render do |item, payload|
    item.instance_variable_set(:@cheri_render_payload, payload)
  end
  Jekyll::Hooks.register owner, :post_convert do |item|
    if %w[page person member event post default].include?(item.data['layout']) && item.extname == '.md'
      item.content = CheriPresentation.body(item.content, item)
      # Pages expose a copied Hash while collection documents expose a Drop.
      # Refresh the payload so both receive the derived heading fields.
      item.instance_variable_get(:@cheri_render_payload)['page'] = item.to_liquid
    end
  end
end
