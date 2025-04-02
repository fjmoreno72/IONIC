#!/usr/bin/env python3
"""
Migration script to help transition from the old structure to the new structure.
"""
import os
import shutil
import sys
from pathlib import Path

def create_symlinks():
    """
    Create symlinks from the original templates and static folders to the new structure.
    """
    # Get absolute paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Source directories (original structure)
    src_templates = project_root / "templates"
    src_static = project_root / "static"
    
    # Target directories (new structure)
    target_templates = script_dir / "templates"
    target_static = script_dir / "static"
    
    # Create symlinks
    if not target_templates.exists():
        print(f"Creating symlink for templates: {src_templates} -> {target_templates}")
        os.symlink(src_templates, target_templates, target_is_directory=True)
    
    if not target_static.exists():
        print(f"Creating symlink for static: {src_static} -> {target_static}")
        os.symlink(src_static, target_static, target_is_directory=True)
    
    print("Symlinks created successfully.")

def copy_files():
    """
    Copy templates and static files from the original structure to the new structure.
    """
    # Get absolute paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Source directories (original structure)
    src_templates = project_root / "templates"
    src_static = project_root / "static"
    
    # Target directories (new structure)
    target_templates = script_dir / "templates"
    target_static = script_dir / "static"
    
    # Copy templates directory
    if src_templates.exists() and not target_templates.exists():
        print(f"Copying templates: {src_templates} -> {target_templates}")
        shutil.copytree(src_templates, target_templates)
    elif target_templates.exists():
        print(f"Target directory already exists: {target_templates}")
    
    # Copy static directory
    if src_static.exists() and not target_static.exists():
        print(f"Copying static files: {src_static} -> {target_static}")
        shutil.copytree(src_static, target_static)
    elif target_static.exists():
        print(f"Target directory already exists: {target_static}")
    
    print("Files copied successfully.")

def show_help():
    """
    Display help information.
    """
    print("Migration Script for IOCore2 Coverage Analysis Tool")
    print("Usage:")
    print("  python migrate.py [command]")
    print("")
    print("Commands:")
    print("  symlink   - Create symlinks from original templates and static to new structure")
    print("  copy      - Copy templates and static files to new structure")
    print("  help      - Show this help message")
    print("")
    print("Examples:")
    print("  python migrate.py symlink  # Create symlinks (for development)")
    print("  python migrate.py copy     # Copy files (for production)")

def main():
    """
    Main entry point for the migration script.
    """
    if len(sys.argv) < 2 or sys.argv[1] == "help":
        show_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == "symlink":
        create_symlinks()
    elif command == "copy":
        copy_files()
    else:
        print(f"Unknown command: {command}")
        show_help()

if __name__ == "__main__":
    main()
