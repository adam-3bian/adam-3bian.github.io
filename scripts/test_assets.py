#!/usr/bin/env python3
"""Image preparation regressions: protect faces, logo artwork and thumbnail edges."""
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw
from prepare_image import prepare, remove_exterior_white


class ImagePreparation(unittest.TestCase):
    def test_exterior_white_removal_preserves_enclosed_lettering(self):
        image = Image.new('RGBA', (30, 30), 'white')
        draw = ImageDraw.Draw(image)
        draw.rectangle((5, 5, 24, 24), fill='navy')
        draw.rectangle((10, 10, 19, 19), fill='white')
        result = remove_exterior_white(image)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((12, 12)), (255, 255, 255, 255))
        self.assertEqual(result.getpixel((6, 6)), (0, 0, 128, 255))

    def test_coloured_brand_panel_is_preserved(self):
        image = Image.new('RGBA', (30, 30), 'maroon')
        self.assertEqual(remove_exterior_white(image).tobytes(), image.tobytes())

    def test_logo_has_transparent_canvas_and_unchanged_artwork(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'logo.png', Path(directory) / 'logo.webp'
            Image.new('RGBA', (100, 100), 'maroon').save(source)
            prepare(source, output, 'organisation')
            with Image.open(output) as image:
                self.assertEqual(image.size, (1200, 400))
                self.assertEqual(image.getpixel((0, 0))[3], 0)
                self.assertEqual(image.getpixel((600, 200)), (128, 0, 0, 255))

    def test_cover_fills_the_frame_without_padding_or_stretching(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'poster.png', Path(directory) / 'poster.webp'
            image = Image.new('RGB', (160, 180), 'navy')
            draw = ImageDraw.Draw(image)
            draw.rectangle((0, 0, 159, 19), fill='red')
            draw.rectangle((0, 160, 159, 179), fill='red')
            draw.rectangle((0, 20, 7, 159), fill='lime')
            draw.rectangle((152, 20, 159, 159), fill='lime')
            image.save(source)
            prepare(source, output, 'events')
            with Image.open(output) as result:
                self.assertEqual(result.size, (160, 90))
                # Vertical excess is cropped; left/right bars retain their width.
                for point in [(3, 0), (156, 0), (3, 89), (156, 89)]:
                    self.assertGreater(result.getpixel(point)[1], 220)
                for point in [(80, 0), (80, 45), (80, 89)]:
                    red, green, blue = result.getpixel(point)[:3]
                    self.assertLess(max(red, green), 15)
                    self.assertGreater(blue, 100)

    def test_people_require_an_explicit_in_bounds_face_crop(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'person.png', Path(directory) / 'person.webp'
            Image.new('RGB', (100, 200), 'navy').save(source)
            for crop in [None, (-1, 0, 50), (50, 0, 100), (0, 0, 0)]:
                with self.assertRaises(ValueError):
                    prepare(source, output, 'people', crop)
            prepare(source, output, 'people', (0, 25, 100))
            with Image.open(output) as result:
                self.assertEqual(result.size, (100, 100))

    def test_animation_is_not_silently_flattened(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'animation.gif', Path(directory) / 'animation.webp'
            first, second = Image.new('RGB', (10, 10), 'red'), Image.new('RGB', (10, 10), 'blue')
            first.save(source, save_all=True, append_images=[second], duration=100, loop=0)
            with self.assertRaises(ValueError):
                prepare(source, output, 'posts')

    def test_colour_profile_and_attribution_survive_conversion(self):
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / 'artwork.png', Path(directory) / 'artwork.webp'
            profile = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
            attribution = Image.Exif()
            attribution[315] = 'CHERI Alliance'
            Image.new('RGB', (160, 90), 'navy').save(source, icc_profile=profile, exif=attribution)
            prepare(source, output, 'posts')
            with Image.open(output) as result:
                self.assertEqual(result.info['icc_profile'], profile)
                self.assertEqual(result.getexif()[315], 'CHERI Alliance')


if __name__ == '__main__':
    unittest.main()
