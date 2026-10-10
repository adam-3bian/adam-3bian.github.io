# Present source directory cards using the starter's card styling, with no editorial HTML.
module CheriPresentation
  def self.cards(html)
    card = %r{<p>\s*(?:<a\b[^>]*>)?<img\b[^>]*>(?:</a>)?\s*</p>\s*(?:<p\b[^>]*class="collection-card__meta"[^>]*>.*?</p>\s*)?<h[23]\b[^>]*class="collection-card__title"[^>]*>.*?</h[23]>\s*(?:<p\b[^>]*class="collection-card__(?:summary|link)"[^>]*>.*?</p>\s*)+}m
    html.gsub(card) { |body| '<div class="source-card-grid"><article class="card">'+body+'</article></div>' }
        .gsub(%r{</article></div>\s*<div class="source-card-grid"><article class="card">}m, '</article><article class="card">')
  end
end
[:pages, :documents].each do |owner|
  Jekyll::Hooks.register owner, :post_render do |item|
    if item.output.include?('data-source-body')
      item.output = item.output.sub(%r{(<article\b[^>]*data-source-body[^>]*>)(.*?)(</article>)}m) do
        opening,body,closing=Regexp.last_match.captures
        opening+CheriPresentation.cards(body)+closing
      end
    end
  end
end
