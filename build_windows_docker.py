#!/usr/bin/env python3
"""
Docker-based Windows Executable Builder for macOS
Builds a Windows .exe from macOS using Docker with Windows containers
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

def check_docker():
    """Check if Docker is installed and running"""
    try:
        result = subprocess.run("docker --version", shell=True, check=True, capture_output=True, text=True)
        print(f"✓ Docker is installed: {result.stdout.strip()}")
        
        # Check if Docker Desktop is running
        result = subprocess.run("docker info", shell=True, check=True, capture_output=True, text=True)
        print("✓ Docker is running")
        return True
    except:
        print("❌ Docker is not installed or not running")
        print("Please:")
        print("1. Install Docker Desktop for Mac from https://docker.com/products/docker-desktop")
        print("2. Start Docker Desktop")
        print("3. Make sure Docker is running (you should see the Docker icon in your menu bar)")
        return False

def check_docker_windows_support():
    """Check if Docker supports Windows containers"""
    try:
        # Try to run a simple Windows container
        result = subprocess.run(
            "docker run --rm mcr.microsoft.com/windows/nanoserver:ltsc2022 cmd /c echo test", 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            timeout=60
        )
        print("✓ Docker supports Windows containers")
        return True
    except subprocess.TimeoutExpired:
        print("⚠ Docker Windows container test timed out - this is normal for first run")
        print("  Windows container images are large and may take time to download")
        return True
    except:
        print("❌ Docker does not support Windows containers on this system")
        print("Note: Docker on macOS has limited Windows container support")
        print("Consider using the Wine approach instead")
        return False

def build_docker_image():
    """Build the Docker image for Windows executable creation"""
    print("\n🐳 Building Docker image...")
    print("⚠ Warning: This will download a large Windows container image (~1-2GB)")
    print("The first build may take 10-30 minutes depending on your internet connection")
    
    proceed = input("Do you want to proceed? (y/N): ").lower().strip()
    if proceed != 'y' and proceed != 'yes':
        print("Build cancelled by user")
        return False
    
    if not run_command(
        "docker build -f Dockerfile.windows -t systemmonitor-windows-builder .", 
        "Building Windows Docker image"
    ):
        print("❌ Failed to build Docker image")
        return False
    
    return True

def extract_executable():
    """Extract the built executable from the Docker container"""
    print("\n📦 Extracting executable from container...")
    
    # Create output directory
    output_dir = Path("dist_windows")
    output_dir.mkdir(exist_ok=True)
    
    # Run container and copy files
    container_id = None
    try:
        # Create a container from our image
        result = subprocess.run(
            "docker create systemmonitor-windows-builder", 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True
        )
        container_id = result.stdout.strip()
        print(f"✓ Created container: {container_id[:12]}")
        
        # Copy executable from container
        if not run_command(
            f"docker cp {container_id}:C:/output/SystemMonitor.exe {output_dir}/", 
            "Copying SystemMonitor.exe"
        ):
            return False
        
        # Copy launcher if it exists
        run_command(
            f"docker cp {container_id}:C:/output/SystemMonitor_Launcher.bat {output_dir}/", 
            "Copying launcher script",
            check_exit=False
        )
        
        print(f"✓ Files extracted to: {output_dir.absolute()}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to extract files: {e}")
        return False
    
    finally:
        # Clean up container
        if container_id:
            subprocess.run(f"docker rm {container_id}", shell=True, check=False)

def main():
    print("🐳 Docker-based Windows Executable Builder")
    print("==========================================")
    print("This builds a Windows .exe using Docker with Windows containers")
    print()
    
    if platform.system() != "Darwin":
        print("❌ This script is designed for macOS")
        return False
    
    # Check prerequisites
    if not check_docker():
        return False
    
    print("\n⚠ Important Notes:")
    print("1. This requires Docker Desktop for Mac with Windows container support")
    print("2. Windows container images are very large (1-2GB download)")
    print("3. The build process may take 20-30 minutes on first run")
    print("4. You need sufficient disk space (~5GB free recommended)")
    print()
    
    # Check Windows container support
    print("Testing Windows container support...")
    if not check_docker_windows_support():
        print("\n❌ Windows containers not supported")
        print("Alternative: Use the Wine-based builder (build_windows_from_mac.py)")
        return False
    
    # Build Docker image
    if not build_docker_image():
        return False
    
    # Extract executable
    if not extract_executable():
        return False
    
    print("\n🎉 SUCCESS!")
    print("Windows executable has been created using Docker!")
    print(f"📁 Location: {Path('dist_windows').absolute()}")
    print("📝 Transfer the 'dist_windows' directory to a Windows machine to run")
    
    # Show file info
    exe_path = Path("dist_windows/SystemMonitor.exe")
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"📊 Executable size: {size_mb:.1f} MB")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        
        print("\n" + "="*50)
        if success:
            print("✅ Docker build completed successfully!")
        else:
            print("❌ Docker build failed!")
            print("\nTroubleshooting:")
            print("  - Ensure Docker Desktop is running")
            print("  - Check available disk space (need ~5GB)")
            print("  - Verify internet connection for image downloads")
            print("  - Try the Wine-based approach if Docker issues persist")
        
        input("\nPress Enter to exit...")
        sys.exit(0 if success else 1)
    
    except KeyboardInterrupt:
        print("\n\n⚠ Build cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1) 