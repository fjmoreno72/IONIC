#!/usr/bin/env python3
"""
Windows Executable Builder for macOS
Builds a Windows .exe from macOS using Wine and Windows Python
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import platform

def run_command(command, description, check_exit=True):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"{description}")
    print(f"{'='*50}")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=check_exit, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Success!")
        else:
            print(f"⚠ Warning: Exit code {result.returncode}")
        
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr and result.returncode != 0:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def check_homebrew():
    """Check if Homebrew is installed"""
    try:
        result = subprocess.run("brew --version", shell=True, check=True, capture_output=True, text=True)
        print("✓ Homebrew is installed")
        return True
    except:
        print("❌ Homebrew is not installed")
        print("Please install Homebrew first: /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
        return False

def install_wine():
    """Install Wine using Homebrew"""
    print("\n🍷 Installing Wine...")
    
    if not run_command("brew install --cask wine-stable", "Installing Wine", check_exit=False):
        print("⚠ Wine installation may have failed, but continuing...")
    
    # Initialize wine prefix
    print("\n🔧 Initializing Wine...")
    os.environ["WINEARCH"] = "win64"
    os.environ["WINEPREFIX"] = str(Path.home() / ".wine_systemmonitor")
    
    if not run_command("winecfg", "Configuring Wine (this will open a GUI - just click OK)", check_exit=False):
        print("⚠ Wine configuration may have failed, but continuing...")
    
    return True

def download_python_windows():
    """Download Windows Python installer"""
    print("\n🐍 Downloading Windows Python...")
    
    wine_prefix = Path.home() / ".wine_systemmonitor"
    downloads_dir = wine_prefix / "drive_c" / "downloads"
    downloads_dir.mkdir(parents=True, exist_ok=True)
    
    python_url = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
    python_installer = downloads_dir / "python-installer.exe"
    
    if not python_installer.exists():
        if not run_command(f"curl -L -o '{python_installer}' '{python_url}'", "Downloading Python installer"):
            return False
    else:
        print("✓ Python installer already downloaded")
    
    return True

def install_python_windows():
    """Install Python in Wine"""
    print("\n🔧 Installing Python in Wine...")
    
    wine_prefix = Path.home() / ".wine_systemmonitor"
    python_installer = wine_prefix / "drive_c" / "downloads" / "python-installer.exe"
    
    os.environ["WINEPREFIX"] = str(wine_prefix)
    
    # Install Python silently
    wine_cmd = f"wine '{python_installer}' /quiet InstallAllUsers=1 PrependPath=1"
    if not run_command(wine_cmd, "Installing Python in Wine"):
        return False
    
    return True

def setup_wine_environment():
    """Set up Wine environment for building"""
    print("\n🔧 Setting up Wine environment...")
    
    wine_prefix = Path.home() / ".wine_systemmonitor"
    os.environ["WINEPREFIX"] = str(wine_prefix)
    
    # Install pip packages in Wine Python
    pip_packages = ["pyinstaller", "flask", "requests", "psutil", "beautifulsoup4", "pandas", "openpyxl"]
    
    for package in pip_packages:
        if not run_command(f"wine python -m pip install {package}", f"Installing {package}"):
            print(f"⚠ Failed to install {package}, but continuing...")
    
    return True

def create_build_directory():
    """Create a clean build directory in Wine"""
    print("\n📁 Creating build directory...")
    
    wine_prefix = Path.home() / ".wine_systemmonitor"
    build_dir = wine_prefix / "drive_c" / "SystemMonitor"
    
    if build_dir.exists():
        shutil.rmtree(build_dir)
    
    build_dir.mkdir(parents=True)
    
    # Copy project files
    current_dir = Path.cwd()
    
    # Copy essential files
    files_to_copy = ["run.py", "app.spec", "download_dependencies.py"]
    dirs_to_copy = ["app"]
    
    for file in files_to_copy:
        if Path(file).exists():
            shutil.copy2(file, build_dir / file)
            print(f"✓ Copied {file}")
    
    for dir_name in dirs_to_copy:
        if Path(dir_name).exists():
            shutil.copytree(dir_name, build_dir / dir_name, dirs_exist_ok=True)
            print(f"✓ Copied {dir_name}/")
    
    return build_dir

def build_windows_executable(build_dir):
    """Build the Windows executable using Wine"""
    print("\n🔨 Building Windows executable...")
    
    wine_prefix = Path.home() / ".wine_systemmonitor"
    os.environ["WINEPREFIX"] = str(wine_prefix)
    
    # Change to build directory
    old_cwd = os.getcwd()
    os.chdir(build_dir)
    
    try:
        # Download dependencies
        if not run_command("wine python download_dependencies.py", "Downloading dependencies in Wine"):
            print("⚠ Failed to download dependencies, but continuing...")
        
        # Build executable
        if not run_command("wine python -m PyInstaller app.spec", "Building executable with PyInstaller"):
            return False
        
        # Check if executable was created
        exe_path = build_dir / "dist" / "SystemMonitor.exe"
        if exe_path.exists():
            print(f"✓ Windows executable created: {exe_path}")
            
            # Copy to main project directory
            dest_dir = Path(old_cwd) / "dist_windows"
            dest_dir.mkdir(exist_ok=True)
            
            shutil.copy2(exe_path, dest_dir / "SystemMonitor.exe")
            
            # Copy launcher if it exists
            launcher_path = build_dir / "dist" / "SystemMonitor_Launcher.bat"
            if launcher_path.exists():
                shutil.copy2(launcher_path, dest_dir / "SystemMonitor_Launcher.bat")
            
            print(f"✓ Copied executable to: {dest_dir}")
            return True
        else:
            print("❌ Executable not found after build")
            return False
    
    finally:
        os.chdir(old_cwd)
    
    return False

def main():
    print("🪟 Windows Executable Builder for macOS")
    print("=====================================")
    print("This will build a Windows .exe using Wine")
    print()
    
    if platform.system() != "Darwin":
        print("❌ This script is designed for macOS only")
        return False
    
    # Check prerequisites
    if not check_homebrew():
        return False
    
    # Ask user if they want to proceed
    print("This process will:")
    print("1. Install Wine (if not already installed)")
    print("2. Download and install Windows Python in Wine")
    print("3. Install required Python packages")
    print("4. Build the Windows executable")
    print()
    proceed = input("Do you want to proceed? (y/N): ").lower().strip()
    
    if proceed != 'y' and proceed != 'yes':
        print("Build cancelled by user")
        return False
    
    # Install Wine
    if not install_wine():
        return False
    
    # Download Python for Windows
    if not download_python_windows():
        return False
    
    # Install Python in Wine
    if not install_python_windows():
        return False
    
    # Set up environment
    if not setup_wine_environment():
        return False
    
    # Create build directory
    build_dir = create_build_directory()
    if not build_dir:
        return False
    
    # Build executable
    if not build_windows_executable(build_dir):
        return False
    
    print("\n🎉 SUCCESS!")
    print("Windows executable has been created in the 'dist_windows' directory")
    print("Transfer this entire directory to a Windows machine to run the application")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        
        print("\n" + "="*50)
        if success:
            print("✅ Windows build completed successfully!")
        else:
            print("❌ Windows build failed!")
            print("\nTroubleshooting:")
            print("  - Ensure you have sufficient disk space (Wine needs ~2GB)")
            print("  - Check your internet connection for downloads")
            print("  - Try running individual steps manually")
            print("  - Wine setup can be tricky - consider using a Windows VM instead")
        
        input("\nPress Enter to exit...")
        sys.exit(0 if success else 1)
    
    except KeyboardInterrupt:
        print("\n\n⚠ Build cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1) 