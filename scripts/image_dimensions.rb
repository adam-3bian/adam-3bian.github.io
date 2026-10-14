# Read intrinsic dimensions from bundled artwork using standard-library formats.
# A missing/unknown size leaves the original HTML unchanged; no asset is edited.
module ImageDimensions
  def self.read(path)
    bytes = File.binread(path)
    pair = if bytes.start_with?("\x89PNG\r\n\x1a\n".b)
      bytes[16, 8].unpack('N2')
    elsif bytes.start_with?('GIF87a', 'GIF89a')
      bytes[6, 4].unpack('v2')
    elsif bytes[0, 4] == 'RIFF' && bytes[8, 4] == 'WEBP'
      case bytes[12, 4]
      when 'VP8X'
        [bytes[24, 3], bytes[27, 3]].map { |value| value.bytes.each_with_index.sum { |byte, i| byte << (i * 8) } + 1 }
      when 'VP8 '
        bytes[26, 4].unpack('v2').map { |value| value & 0x3fff }
      when 'VP8L'
        bits = bytes[21, 4].unpack1('V')
        [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]
      end
    elsif bytes.start_with?("\xff\xd8".b)
      offset = 2
      while offset < bytes.size
        offset += 1 while bytes.getbyte(offset) == 0xff
        marker = bytes.getbyte(offset); offset += 1
        break if marker == 0xd9 || marker == 0xda
        next if marker == 0x01 || (0xd0..0xd8).include?(marker)
        length = bytes[offset, 2].unpack1('n')
        if [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].include?(marker)
          height, width = bytes[offset + 3, 4].unpack('n2')
          return [width, height]
        end
        break if length < 2
        offset += length
      end
      nil
    elsif File.extname(path).downcase == '.svg'
      text = bytes.force_encoding('UTF-8')[/<svg\b[^>]*>/] || ''
      width = text[/\bwidth=["']([\d.]+)(?:px)?["']/, 1]
      height = text[/\bheight=["']([\d.]+)(?:px)?["']/, 1]
      if width && height
        [width, height].map { |value| value.to_f.round }
      else
        viewport = text[/\bviewBox=["']([^"']+)["']/, 1]
        values = viewport&.split(/[\s,]+/)&.map(&:to_f)
        [values[2], values[3]].map(&:round) if values&.size == 4
      end
    end
    pair if pair&.all? { |value| value && value > 0 }
  rescue ArgumentError, NoMethodError
    nil
  end
end
