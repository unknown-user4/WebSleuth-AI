"""
Generate PNG icons for the WebSleuth AI Chrome extension.
Run once: python generate_icons.py
Requires: pip install Pillow
"""
import os
import struct
import zlib

def create_shield_png(size):
    """Creates a simple shield PNG programmatically using raw PNG bytes."""
    # We'll create icons using a simple approach with PIL if available
    # or fallback to creating a minimal valid PNG
    
    try:
        from PIL import Image, ImageDraw, ImageFilter
        
        # Create base image with transparency
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        pad = size * 0.08
        w, h = size - 2*pad, size - 2*pad
        cx = size / 2
        
        # Draw shield shape (filled polygon)
        shield_pts = [
            (cx, pad),                          # top center
            (pad, pad + h * 0.2),               # top left
            (pad, pad + h * 0.6),               # mid left
            (cx, pad + h),                       # bottom center
            (size - pad, pad + h * 0.6),        # mid right
            (size - pad, pad + h * 0.2),        # top right
        ]
        
        # Gradient-like background - draw multiple circles
        for i in range(size // 2, 0, -1):
            ratio = i / (size // 2)
            r = int(0 + ratio * 0)
            g = int(212 * (1 - ratio * 0.5))
            b = int(255 * (1 - ratio * 0.3))
            a = int(255 * (1 - ratio * 0.3))
        
        # Fill shield
        draw.polygon(shield_pts, fill=(0, 180, 220, 255))
        
        # Draw inner shield (slightly darker/lighter)
        inner_pad = size * 0.15
        inner_pts = [
            (cx, inner_pad),
            (inner_pad, inner_pad + h * 0.22),
            (inner_pad, inner_pad + h * 0.58),
            (cx, size - inner_pad * 0.5),
            (size - inner_pad, inner_pad + h * 0.58),
            (size - inner_pad, inner_pad + h * 0.22),
        ]
        draw.polygon(inner_pts, fill=(0, 140, 180, 200))
        
        # Draw checkmark
        check_size = size * 0.35
        cx2 = cx
        cy2 = cx * 1.05
        pts_check = [
            (cx2 - check_size*0.45, cy2),
            (cx2 - check_size*0.1, cy2 + check_size*0.35),
            (cx2 + check_size*0.45, cy2 - check_size*0.35),
        ]
        stroke_w = max(2, size // 10)
        draw.line(pts_check, fill=(255, 255, 255, 255), width=stroke_w)
        
        return img
        
    except ImportError:
        # Pillow not available, return a minimal 1x1 transparent PNG
        return None


def save_icons():
    os.makedirs('icons', exist_ok=True)
    sizes = [16, 48, 128]
    
    for size in sizes:
        path = f'icons/icon{size}.png'
        img = create_shield_png(size)
        if img:
            img.save(path, 'PNG')
            print(f'✅ Created {path}')
        else:
            # Create a minimal valid PNG (1x1 cyan pixel, scaled)
            create_minimal_png(path, size)
            print(f'⚠️  Created minimal {path} (install Pillow for better icons)')


def create_minimal_png(path, size):
    """Creates a minimal valid PNG file with a cyan shield-like appearance."""
    # Create a simple colored square PNG
    width = height = size
    
    # PNG header
    header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    ihdr = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Image data - draw a simple shield shape
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter type none
        for x in range(width):
            # Simple shield shape logic
            cx = width / 2
            cy = height / 2
            rel_x = (x - cx) / (width / 2)
            rel_y = (y - height * 0.1) / (height * 0.9)
            
            # Shield boundary check (simplified)
            in_shield = (
                abs(rel_x) < (1 - rel_y * 0.3) and
                rel_y >= 0 and rel_y <= 1 and
                (rel_y < 0.7 or abs(rel_x) < (1 - rel_y))
            )
            
            if in_shield:
                # Cyan gradient
                r = int(0 + rel_y * 50)
                g = int(180 + rel_y * 30)
                b = 220
            else:
                r, g, b = 7, 11, 20  # Background
            
            raw_data += bytes([r, g, b])
    
    # Compress
    compressed = zlib.compress(raw_data, 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(path, 'wb') as f:
        f.write(header + ihdr + idat + iend)


if __name__ == '__main__':
    save_icons()
    print('\n🛡️  Icons generated! Now you can load the extension in Chrome.')
