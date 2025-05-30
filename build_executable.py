#!/usr/bin/env python3
"""
System Monitor Executable Builder
Builds a standalone executable for the System Monitor application.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"{description}")
    print(f"{'='*50}")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("✓ Success!")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_files_exist():
    """Check if required files exist"""
    required_files = ['run.py', 'app.spec']
    required_dirs = ['app', 'app/templates', 'app/config']
    missing_items = []
    
    # Check files
    for file in required_files:
        if not Path(file).exists():
            missing_items.append(file)
    
    # Check directories
    for dir_path in required_dirs:
        if not Path(dir_path).exists():
            missing_items.append(f"{dir_path}/ (directory)")
    
    if missing_items:
        print(f"❌ Missing required items: {', '.join(missing_items)}")
        return False
    
    print("✓ All required files and directories found")
    return True

def set_environment_variables():
    """Set default environment variables for the build"""
    print("\n🔧 Setting environment variables...")
    
    # Set default environment variables that your app expects
    env_vars = {
        'IONIC2_PORT': '5007',  # Your default port
        'IONIC2_DEBUG': 'False',  # Production mode for executable
        'IONIC2_HOST': '0.0.0.0'
    }
    
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value
            print(f"  Set {key}={value}")
        else:
            print(f"  Using existing {key}={os.environ[key]}")

def create_launcher_script():
    """Create a launcher script that sets environment variables"""
    print("\n📝 Creating launcher script...")
    
    launcher_content = '''@echo off
REM Launcher script for System Monitor
REM This sets the required environment variables and runs the executable

REM Set default environment variables
set IONIC2_PORT=5007
set IONIC2_DEBUG=False
set IONIC2_HOST=0.0.0.0

REM You can override these by setting them before running this script
REM For example: set IONIC2_PORT=8080 && SystemMonitor_Launcher.bat

echo Starting System Monitor on port %IONIC2_PORT%...
echo.
echo To change the port, set IONIC2_PORT before running this script:
echo   set IONIC2_PORT=8080 ^&^& SystemMonitor_Launcher.bat
echo.

REM Run the executable
SystemMonitor.exe

REM Keep window open if there's an error
if %ERRORLEVEL% neq 0 (
    echo.
    echo System Monitor exited with error code %ERRORLEVEL%
    pause
)
'''
    
    launcher_path = Path("SystemMonitor_Launcher.bat")
    with open(launcher_path, 'w') as f:
        f.write(launcher_content)
    
    print(f"✓ Created launcher script: {launcher_path}")

def get_target_platform():
    """Determine target platform and executable name"""
    current_os = platform.system().lower()
    
    # Ask user for target platform
    print(f"\n🎯 Target Platform Selection")
    print(f"Current OS: {current_os}")
    print(f"1. Windows (creates .exe)")
    print(f"2. Current platform ({current_os})")
    
    choice = input("Choose target platform (1 for Windows, 2 for current): ").strip()
    
    if choice == "1":
        return "windows", "SystemMonitor.exe", "--target win32"
    else:
        if current_os == "windows":
            return "windows", "SystemMonitor.exe", ""
        elif current_os == "darwin":
            return "macos", "SystemMonitor", ""
        else:
            return "linux", "SystemMonitor", ""

def main():
    print("🚀 System Monitor Executable Builder")
    print("====================================")
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_files_exist():
        return False
    
    # Get target platform
    target_platform, exe_name, pyinstaller_target = get_target_platform()
    print(f"✓ Building for: {target_platform}")
    print(f"✓ Executable name: {exe_name}")
    
    # Set environment variables
    set_environment_variables()
    
    # Step 1: Download dependencies
    print("\n📦 Step 1: Downloading static dependencies...")
    if not run_command("python download_dependencies.py", "Downloading CSS/JS dependencies"):
        print("❌ Failed to download dependencies")
        return False
    
    # Step 2: Install PyInstaller (if not already installed)
    print("\n🔧 Step 2: Installing PyInstaller...")
    if not run_command("pip install pyinstaller", "Installing PyInstaller"):
        print("❌ Failed to install PyInstaller")
        return False
    
    # Step 3: Clean previous builds
    print("\n🧹 Step 3: Cleaning previous builds...")
    dirs_to_clean = ['build', 'dist', '__pycache__']
    for dir_name in dirs_to_clean:
        if Path(dir_name).exists():
            shutil.rmtree(dir_name)
            print(f"  Removed {dir_name}/")
    
    # Step 4: Build executable
    print("\n🔨 Step 4: Building executable...")
    pyinstaller_cmd = f"pyinstaller app.spec {pyinstaller_target}".strip()
    if not run_command(pyinstaller_cmd, "Building executable with PyInstaller"):
        print("❌ Failed to build executable")
        return False
    
    # Step 5: Create launcher script (for Windows builds)
    if target_platform == "windows":
        create_launcher_script()
        
        # Step 6: Move launcher to dist directory
        launcher_src = Path("SystemMonitor_Launcher.bat")
        if launcher_src.exists():
            launcher_dst = Path("dist/SystemMonitor_Launcher.bat")
            shutil.copy2(launcher_src, launcher_dst)
            print(f"✓ Copied launcher to dist directory")
    
    # Step 7: Verify build
    exe_path = Path(f"dist/{exe_name}")
    
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"\n🎉 SUCCESS!")
        print(f"Executable created: {exe_path}")
        
        if target_platform == "windows":
            launcher_path = Path("dist/SystemMonitor_Launcher.bat")
            print(f"Launcher created: {launcher_path}")
            print(f"Size: {size_mb:.1f} MB")
            print(f"\n📁 Distribution files:")
            print(f"  - {exe_path.absolute()}")
            print(f"  - {launcher_path.absolute()}")
            print(f"\n📋 Usage options:")
            print(f"  Option 1: Double-click SystemMonitor_Launcher.bat (recommended)")
            print(f"  Option 2: Run SystemMonitor.exe directly")
            print(f"  Option 3: From command line with custom port:")
            print(f"           set IONIC2_PORT=8080 && SystemMonitor.exe")
        else:
            print(f"Size: {size_mb:.1f} MB")
            print(f"\n📁 Distribution file:")
            print(f"  - {exe_path.absolute()}")
            print(f"\n📋 Usage:")
            print(f"  Run: ./{exe_name}")
            print(f"  Custom port: IONIC2_PORT=8080 ./{exe_name}")
        
        print(f"\n🌐 Access the application at: http://localhost:5007")
        
        if target_platform == "windows" and platform.system().lower() != "windows":
            print(f"\n📝 Note: Windows executable created on {platform.system()}")
            print(f"Transfer the entire 'dist' folder to a Windows machine to run.")
        
        return True
    else:
        print(f"❌ Executable not found after build: {exe_path}")
        print(f"📁 Contents of dist directory:")
        dist_path = Path("dist")
        if dist_path.exists():
            for item in dist_path.iterdir():
                print(f"  - {item.name}")
        return False

if __name__ == "__main__":
    success = main()
    
    print("\n" + "="*50)
    if success:
        print("✅ Build completed successfully!")
    else:
        print("❌ Build failed!")
        print("\nTroubleshooting:")
        print("  - Check that run.py and app/ directory exist")
        print("  - Ensure you have internet connection for downloading dependencies")
        print("  - Try running individual steps manually")
        print("  - Check the console output for specific error messages")
        print("  - For cross-platform builds, ensure PyInstaller supports the target")
    
    input("\nPress Enter to exit...")
    sys.exit(0 if success else 1) 