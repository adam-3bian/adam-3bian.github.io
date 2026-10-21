#!/usr/bin/env python3
"""Prepare a content image without changing the artwork or relying on the build.

Requires Pillow (requirements-dev.txt). Examples are in docs/assets/README.md.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps


def remove_exterior_white(image):
    """Remove only near-white pixels connected to the canvas edge.

    Enclosed white lettering and coloured brand panels remain intact. Always
    inspect the result; use an approved transparent source for complex artwork.
    """
    image = image.convert('RGBA')
    rgb = image.convert('RGB')
    channels = rgb.split()
    minimum = ImageChops.darker(ImageChops.darker(channels[0], channels[1]), channels[2])
    mask = minimum.point(lambda value: 0 if value >= 247 else 255)
    width, height = mask.size
    edges = ([(x, 0) for x in range(width)] + [(x, height - 1) for x in range(width)]
             + [(0, y) for y in range(height)] + [(width - 1, y) for y in range(height)])
    for point in edges:
        if mask.getpixel(point) == 0:
            ImageDraw.floodfill(mask, point, 128)
    retained = mask.point(lambda value: 0 if value == 128 else 255)
    image.putalpha(ImageChops.multiply(image.getchannel('A'), retained))
    return image


def prepare(source, destination, kind, crop=None, remove_white=False):
    with Image.open(source) as original:
        if getattr(original, 'n_frames', 1) > 1:
            raise ValueError('Animated assets must retain their original format.')
        oriented = ImageOps.exif_transpose(original)
        metadata = {key: value for key, value in {
            'icc_profile': oriented.info.get('icc_profile'),
            'exif': oriented.getexif().tobytes() if oriented.getexif() else None,
            'xmp': oriented.info.get('xmp') or oriented.info.get('XML:com.adobe.xmp'),
        }.items() if value}
        image = oriented.convert('RGBA')
    if kind == 'people':
        if crop is None:
            raise ValueError('People require a reviewed face crop: --crop LEFT TOP SIZE')
        left, top, side = crop
        if min(left, top) < 0 or side <= 0 or left + side > image.width or top + side > image.height:
            raise ValueError('Crop must be a square inside the source image.')
        image = image.crop((left, top, left + side, top + side))
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    elif kind == 'organisation':
        if remove_white:
            image = remove_exterior_white(image)
        # Trim only fully transparent margin; never crop visible logo artwork.
        bounds = image.getchannel('A').getbbox()
        if not bounds:
            raise ValueError('The logo has no visible artwork.')
        image = image.crop(bounds)
        image = ImageOps.contain(image, (1140, 340), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (1200, 400), (0, 0, 0, 0))
        canvas.alpha_composite(image, ((1200 - image.width) // 2, (400 - image.height) // 2))
        image = canvas
    elif kind in ('posts', 'events'):
        # Fill the 16:9 thumbnail without baking letterbox padding into the file.
        # Choose a canvas that does not enlarge the source, up to 1280 x 720.
        unit = max(1, min(80, image.width // 16, image.height // 9))
        image = ImageOps.fit(image, (unit * 16, unit * 9), Image.Resampling.LANCZOS)
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, 'WEBP', lossless=kind == 'organisation', quality=92, method=6, **metadata)
    return image.size


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--kind', required=True, choices=['people', 'organisation', 'posts', 'events', 'additional'])
    parser.add_argument('--crop', nargs=3, type=int, metavar=('LEFT', 'TOP', 'SIZE'))
    parser.add_argument('--remove-white-background', action='store_true')
    args = parser.parse_args()
    if args.destination.suffix != '.webp':
        parser.error('The destination must use the .webp extension.')
    size = prepare(args.source, args.destination, args.kind, args.crop, args.remove_white_background)
    print(f'{args.destination}: {size[0]} × {size[1]}')


if __name__ == '__main__':
    main()
