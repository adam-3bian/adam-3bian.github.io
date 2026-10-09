require 'kramdown'
puts Kramdown::Document.new(STDIN.read, input: 'Kramdown', auto_ids: false,
  smart_quotes: %w[apos apos quot quot],
  typographic_symbols: {hellip: '...', mdash: '---', ndash: '--', laquo: '<<', raquo: '>>'}).to_html
