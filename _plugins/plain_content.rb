# The migrated bodies contain headings, paragraphs, and images. Kramdown also
# treats a single paragraph with a pipe as a table, even without a header row.
# Keep these paragraphs as authored without changing any source Markdown.
require 'kramdown/parser/gfm'

module Kramdown
  module Parser
    class PlainContent < GFM
      def initialize(source, options)
        super
        @block_parsers.delete(:table)
      end
    end
  end
end
