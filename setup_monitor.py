#!/usr/bin/env python3
"""
Setup script for the IOCore2 System Monitor application.

This script automates the creation of the monitor app structure and
copies required files from the main application.
"""
import os
import shutil
import sys
from pathlib import Path

def create_directories():
    """Create the required directory structure."""
    dirs = [
        'shared_core',
        'shared_core/auth',
        'shared_core/api',
        'shared_core/config',
        'shared_core/utils',
        'shared_core/templates',
        'shared_core/templates/components',
        'shared_core/static',
        'shared_core/static/css',
        'shared_core/static/js',
        'monitor_app',
        'monitor_app/routes',
        'monitor_app/templates',
        'monitor_app/static',
        'monitor_app/static/css',
        'monitor_app/static/js'
    ]
    
    for directory in dirs:
        Path(directory).mkdir(parents=True, exist_ok=True)
        
        # Create __init__.py files for Python packages
        if not directory.endswith(('templates', 'static', 'css', 'js')):
            init_file = Path(directory) / '__init__.py'
            if not init_file.exists():
                init_file.touch()
    
    print("✅ Directory structure created")

def copy_required_files():
    """Copy required files from the main application."""
    
    # Files to copy from the main app
    file_mappings = [
        # API client and related files
        ('app/api', 'shared_core/api'),
        ('app/core/exceptions.py', 'shared_core/exceptions.py'),
        
        # Configuration (if exists)
        ('app/config/settings.py', 'shared_core/config/base_settings.py'),
        
        # Utilities (if exists)
        ('app/utils/logging.py', 'shared_core/utils/logging.py'),
        
        # Templates components (if exists)
        ('app/templates/components', 'shared_core/templates/components'),
    ]
    
    copied_files = []
    missing_files = []
    
    for src, dst in file_mappings:
        src_path = Path(src)
        dst_path = Path(dst)
        
        if src_path.exists():
            try:
                if src_path.is_dir():
                    if dst_path.exists():
                        shutil.rmtree(dst_path)
                    shutil.copytree(src_path, dst_path)
                else:
                    dst_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_path, dst_path)
                copied_files.append(f"{src} -> {dst}")
            except Exception as e:
                print(f"❌ Error copying {src}: {e}")
        else:
            missing_files.append(src)
    
    if copied_files:
        print("✅ Copied files:")
        for file_info in copied_files:
            print(f"   {file_info}")
    
    if missing_files:
        print("⚠️  Missing files (optional):")
        for file_path in missing_files:
            print(f"   {file_path}")

def update_imports():
    """Update import statements in shared files to work with the new structure."""
    
    # Files that need import updates
    files_to_update = [
        'shared_core/auth/auth_service.py',
        'monitor_app/routes/auth.py',
        'monitor_app/routes/monitor.py',
    ]
    
    for file_path in files_to_update:
        path = Path(file_path)
        if path.exists():
            try:
                content = path.read_text()
                
                # Update imports
                updated_content = content.replace(
                    'from app.api.iocore2', 'from shared_core.api.iocore2'
                ).replace(
                    'from app.core.exceptions', 'from shared_core.exceptions'
                ).replace(
                    'from app.config', 'from shared_core.config'
                ).replace(
                    'from app.utils', 'from shared_core.utils'
                )
                
                if content != updated_content:
                    path.write_text(updated_content)
                    print(f"✅ Updated imports in {file_path}")
                    
            except Exception as e:
                print(f"❌ Error updating {file_path}: {e}")

def create_requirements():
    """Create or copy requirements.txt for the monitor app."""
    
    main_requirements = Path('requirements.txt')
    monitor_requirements = Path('monitor_requirements.txt')
    
    # Minimal requirements for the monitor app
    minimal_requirements = """Flask==2.3.3
requests==2.31.0
beautifulsoup4==4.12.2
urllib3==2.0.4
"""
    
    if main_requirements.exists():
        # Copy the main requirements
        shutil.copy2(main_requirements, monitor_requirements)
        print("✅ Copied requirements.txt -> monitor_requirements.txt")
    else:
        # Create minimal requirements
        monitor_requirements.write_text(minimal_requirements)
        print("✅ Created minimal monitor_requirements.txt")

def create_environment_file():
    """Create a sample environment configuration file."""
    
    env_content = """# IOCore2 Monitor Configuration
# Copy this file to .env and customize as needed

# App Configuration
IONIC2_SECRET_KEY=your-secret-key-here-change-in-production
IONIC2_DEBUG=false

# Server Configuration
IONIC2_HOST=0.0.0.0
IONIC2_MONITOR_PORT=5007

# IOCore2 API Configuration
IONIC2_DEFAULT_URL=https://your-iocore2-instance.com
IONIC2_VERIFY_SSL=true

# Logging Configuration
IONIC2_LOG_LEVEL=INFO
"""
    
    env_file = Path('monitor.env.example')
    env_file.write_text(env_content)
    print("✅ Created monitor.env.example")

def main():
    """Main setup function."""
    print("🚀 Setting up IOCore2 System Monitor...")
    print()
    
    # Check if we're in the right directory
    if not Path('app').exists():
        print("❌ Error: This script should be run from the root directory of your IOCore2 project")
        print("   Make sure you can see the 'app' directory in the current location")
        sys.exit(1)
    
    try:
        # Step 1: Create directory structure
        print("📁 Creating directory structure...")
        create_directories()
        print()
        
        # Step 2: Copy required files
        print("📋 Copying files from main application...")
        copy_required_files()
        print()
        
        # Step 3: Update imports
        print("🔧 Updating import statements...")
        update_imports()
        print()
        
        # Step 4: Create requirements file
        print("📦 Setting up requirements...")
        create_requirements()
        print()
        
        # Step 5: Create environment file
        print("⚙️  Creating environment configuration...")
        create_environment_file()
        print()
        
        print("✅ Setup complete!")
        print()
        print("Next steps:")
        print("1. Review and customize monitor.env.example")
        print("2. Install dependencies: pip install -r monitor_requirements.txt")
        print("3. Run the monitor: python run_monitor.py")
        print("4. Access the monitor at: http://localhost:5007")
        print()
        print("For development with auth bypass: python run_monitor.py --bypassAuth")
        
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 