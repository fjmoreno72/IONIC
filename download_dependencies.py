import os
import urllib.request
from pathlib import Path
import ssl

# Create SSL context to handle HTTPS downloads
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Create directories for static files
static_dir = Path("app/static")
css_dir = static_dir / "css"
js_dir = static_dir / "js"
fonts_dir = static_dir / "webfonts"

# Create directories if they don't exist
css_dir.mkdir(parents=True, exist_ok=True)
js_dir.mkdir(parents=True, exist_ok=True)
fonts_dir.mkdir(parents=True, exist_ok=True)

# URLs to download
dependencies = {
    "css/bootstrap.min.css": "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "css/fontawesome.min.css": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
    "js/chart.min.js": "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js",
}

def download_file(url, local_path):
    """Download a file from URL to local path"""
    try:
        print(f"Downloading {url}")
        print(f"  -> {local_path}")
        
        # Create request with headers to avoid blocking
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        with urllib.request.urlopen(req, context=ssl_context) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        
        print(f"✓ Downloaded {local_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {url}: {e}")
        return False

def download_fontawesome_fonts():
    """Download FontAwesome font files"""
    print("\nDownloading FontAwesome font files...")
    
    # FontAwesome webfont files
    font_files = [
        "fa-solid-900.woff2",
        "fa-solid-900.woff",
        "fa-regular-400.woff2", 
        "fa-regular-400.woff",
        "fa-brands-400.woff2",
        "fa-brands-400.woff"
    ]
    
    base_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/"
    
    for font_file in font_files:
        url = base_url + font_file
        local_path = fonts_dir / font_file
        download_file(url, local_path)

def fix_fontawesome_css():
    """Fix FontAwesome CSS to use local font paths"""
    css_file = css_dir / "fontawesome.min.css"
    if css_file.exists():
        print("\nFixing FontAwesome CSS paths...")
        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace CDN font URLs with local paths
            content = content.replace(
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/',
                '../webfonts/'
            )
            
            with open(css_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("✓ Fixed FontAwesome CSS paths")
        except Exception as e:
            print(f"✗ Failed to fix FontAwesome CSS: {e}")

# Main execution
print("=== Downloading Dependencies for Offline Use ===\n")

# Download main dependencies
success_count = 0
total_count = len(dependencies)

for local_path, url in dependencies.items():
    full_path = static_dir / local_path
    if download_file(url, full_path):
        success_count += 1

# Download FontAwesome fonts
download_fontawesome_fonts()

# Fix FontAwesome CSS paths
fix_fontawesome_css()

print(f"\n=== Download Summary ===")
print(f"Successfully downloaded {success_count}/{total_count} main dependencies")
print("\nFiles downloaded to:")
print(f"  - CSS files: {css_dir}")
print(f"  - JS files: {js_dir}")
print(f"  - Font files: {fonts_dir}")

print("\n=== Next Steps ===")
print("1. Update your HTML template to use local files (see instructions)")
print("2. Test your application locally")
print("3. Build with PyInstaller")

if success_count == total_count:
    print("\n✓ All dependencies downloaded successfully!")
else:
    print(f"\n⚠ Some downloads failed. Check the errors above.") 