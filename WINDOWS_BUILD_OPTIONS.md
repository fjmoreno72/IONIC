# Building Windows Executables from macOS

You have several options to build a Windows `.exe` file from your macOS system. Here are the approaches ranked from **most reliable** to **experimental**:

## 🥇 Option 1: Wine-based Build (Recommended)

**Reliability**: ⭐⭐⭐⭐  
**Setup Time**: ~30 minutes  
**Pros**: Works reliably, no VM needed  
**Cons**: Initial setup is complex  

### How to use:
```bash
python build_windows_from_mac.py
```

This script will:
1. Install Wine using Homebrew
2. Download and install Windows Python in Wine
3. Install all required Python packages
4. Build the Windows executable

**Requirements**:
- Homebrew installed
- ~2GB free disk space
- Good internet connection

---

## 🥈 Option 2: Docker with Windows Containers

**Reliability**: ⭐⭐⭐  
**Setup Time**: ~45 minutes  
**Pros**: Clean isolated environment  
**Cons**: Large downloads, Docker complexity  

### How to use:
```bash
python build_windows_docker.py
```

This script will:
1. Build a Windows Docker container
2. Install Python and dependencies inside
3. Build the executable in the container
4. Extract the `.exe` file

**Requirements**:
- Docker Desktop for Mac
- ~5GB free disk space
- Very good internet connection

**Note**: Docker's Windows container support on macOS is limited and experimental.

---

## 🥉 Option 3: Modified PyInstaller (Limited)

**Reliability**: ⭐⭐  
**Setup Time**: ~5 minutes  
**Pros**: Quick and simple  
**Cons**: May not work reliably for cross-platform  

### How to use:
```bash
python build_executable.py
# Choose "1" for Windows when prompted
```

This approach modifies the standard build script to attempt cross-compilation. However, PyInstaller has limited cross-platform support.

---

## 🏆 Option 4: Remote Windows Machine (Most Reliable)

**Reliability**: ⭐⭐⭐⭐⭐  
**Setup Time**: ~10 minutes  
**Pros**: 100% guaranteed to work  
**Cons**: Requires access to Windows machine  

### How to use:

1. **Transfer files to Windows machine**:
   ```bash
   # Create a zip with all necessary files
   zip -r systemmonitor_source.zip . -x "*.git*" "*.pyc" "__pycache__/*" "dist/*" "build/*"
   ```

2. **On Windows machine**:
   ```cmd
   # Extract files and install Python 3.11+
   pip install -r requirements.txt
   python download_dependencies.py
   python build_executable.py
   ```

---

## 🌩️ Option 5: Cloud Build Services

**Reliability**: ⭐⭐⭐⭐  
**Setup Time**: ~20 minutes  
**Pros**: No local setup needed  
**Cons**: Requires account setup  

### GitHub Actions (Free)

Create `.github/workflows/build-windows.yml`:

```yaml
name: Build Windows Executable

on:
  workflow_dispatch:  # Manual trigger

jobs:
  build-windows:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pyinstaller
    
    - name: Download static dependencies
      run: python download_dependencies.py
    
    - name: Build executable
      run: pyinstaller app.spec
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: SystemMonitor-Windows
        path: |
          dist/SystemMonitor.exe
          dist/SystemMonitor_Launcher.bat
```

---

## 🚀 Quick Start Recommendation

**For immediate needs**: Use **Option 1 (Wine)** - it's the most reliable local solution.

**For production/regular builds**: Set up **Option 5 (GitHub Actions)** - it's the most maintainable.

**If you have Windows access**: Use **Option 4 (Remote Windows)** - it's guaranteed to work.

---

## Troubleshooting

### Common Issues:

1. **"MIME type application/json" errors**:
   - Run `python download_dependencies.py` first
   - Check that CSS/JS files are valid (not error pages)

2. **PyInstaller cross-compilation fails**:
   - Use Wine or Docker approaches instead
   - PyInstaller doesn't officially support cross-compilation

3. **Wine installation issues**:
   - Ensure Homebrew is installed and updated
   - Run `brew doctor` to check for issues

4. **Docker Windows container issues**:
   - Docker on macOS has limited Windows support
   - Consider using Wine instead

### Getting Help:

1. Check the console output for specific error messages
2. Ensure all dependencies are installed correctly
3. Verify that the local development version works first
4. Try building a simple test executable first

---

## File Outputs

All build methods will create:
- `SystemMonitor.exe` - The main executable
- `SystemMonitor_Launcher.bat` - Convenient launcher with environment variables

The executables will be in:
- **Wine/PyInstaller**: `dist/`
- **Docker**: `dist_windows/`
- **GitHub Actions**: Downloaded as artifact

---

## Next Steps After Building

1. **Test the executable** on a Windows machine
2. **Transfer the entire dist folder** (not just the .exe)
3. **Run SystemMonitor_Launcher.bat** for easiest startup
4. **Access the app** at `http://localhost:5007`
5. **Set custom port** if needed: `set IONIC2_PORT=8080 && SystemMonitor.exe` 