#!/usr/bin/env python3
"""
Script to create the lightweight system monitor application structure.
This script sets up a separate monitor app that shares core components with the main app.
"""
import os
import shutil
from pathlib import Path

def create_monitor_structure():
    """Create the directory structure for the monitor app."""
    
    # Create the monitor app directory structure
    monitor_dirs = [
        'monitor_app',
        'monitor_app/templates',
        'monitor_app/static',
        'monitor_app/static/css',
        'monitor_app/static/js',
        'shared_core',
        'shared_core/auth',
        'shared_core/api',
        'shared_core/config',
        'shared_core/utils',
        'shared_core/templates',
        'shared_core/templates/components',
        'shared_core/static',
        'shared_core/static/css',
        'shared_core/static/js'
    ]
    
    for dir_path in monitor_dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        # Create __init__.py files for Python packages
        if not dir_path.endswith(('templates', 'static', 'css', 'js')):
            Path(dir_path, '__init__.py').touch()
    
    print("Directory structure created successfully!")
    print("\nNext steps:")
    print("1. Run this script to create the structure")
    print("2. Move shared components to shared_core/")
    print("3. Create monitor-specific files")
    print("4. Update imports to use shared_core")

if __name__ == "__main__":
    create_monitor_structure() 