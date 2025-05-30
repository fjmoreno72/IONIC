# Windows Deployment Guide

## 🎯 Running System Monitor on Windows (Recommended)

This is the **simplest and most reliable** approach - no cross-compilation needed!

---

## 📦 Option A: Run as Python Script (Easiest)

### Step 1: Transfer Files
1. **Download the zip file**: `systemmonitor_for_windows.zip` 
2. **Transfer to your Windows machine** (USB, email, network share, etc.)
3. **Extract** to a folder like `C:\SystemMonitor\`

### Step 2: Install Python on Windows
1. **Download Python 3.11+** from https://python.org/downloads/
2. **Install Python** - ⚠️ **IMPORTANT**: Check "Add Python to PATH" during installation
3. **Verify installation**: Open Command Prompt and run:
   ```cmd
   python --version
   pip --version
   ```

### Step 3: Install Dependencies
```cmd
cd C:\SystemMonitor
pip install -r requirements.txt
```

### Step 4: Download Static Files
```cmd
python download_dependencies.py
```

### Step 5: Run the Application
```cmd
set IONIC2_PORT=5007
python run.py
```

**Access at**: http://localhost:5007

---

## 🚀 Option B: Create Windows Executable (On Windows)

If you want a standalone `.exe` file:

### Step 1-4: Same as Option A

### Step 5: Build Executable
```cmd
pip install pyinstaller
python build_executable.py
```

### Step 6: Run Executable
```cmd
cd dist
SystemMonitor_Launcher.bat
```

---

## 🔧 Configuration Options

### Change Port
```cmd
# Option A (Python script)
set IONIC2_PORT=8080
python run.py

# Option B (Executable)
set IONIC2_PORT=8080
SystemMonitor.exe
```

### Run in Background
```cmd
# Option A
start /B python run.py

# Option B  
start /B SystemMonitor.exe
```

### Auto-start with Windows
1. **Create shortcut** to `SystemMonitor_Launcher.bat`
2. **Copy shortcut** to: `C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

---

## 📋 File Structure After Setup

```
C:\SystemMonitor\
├── run.py                          # Main application entry point
├── app/                            # Application code
├── requirements.txt                # Python dependencies
├── download_dependencies.py        # Downloads CSS/JS files
├── build_executable.py            # Creates .exe (optional)
├── app.spec                       # PyInstaller config
└── app/static/                    # Downloaded CSS/JS files
    ├── css/
    │   ├── bootstrap.min.css
    │   └── fontawesome.min.css
    └── js/
        └── chart.min.js
```

---

## ✅ Advantages of Windows Direct Deployment

1. **No cross-compilation issues** - everything runs natively
2. **Easy to debug** - full Python environment available
3. **Simple updates** - just replace files and restart
4. **No Wine/Docker complexity** - standard Windows tools only
5. **Better performance** - no virtualization overhead
6. **Easy troubleshooting** - standard Python error messages

---

## 🛠️ Troubleshooting

### Python Not Found
```cmd
# Add Python to PATH manually
set PATH=%PATH%;C:\Python311;C:\Python311\Scripts
```

### Port Already in Use
```cmd
# Check what's using the port
netstat -ano | findstr :5007

# Use different port
set IONIC2_PORT=8080
python run.py
```

### Missing Dependencies
```cmd
# Reinstall all dependencies
pip install --force-reinstall -r requirements.txt
```

### Static Files Not Loading
```cmd
# Re-download static files
python download_dependencies.py
```

---

## 🚀 Quick Start Commands

**For immediate testing**:
```cmd
cd C:\SystemMonitor
pip install -r requirements.txt
python download_dependencies.py
set IONIC2_PORT=5007
python run.py
```

**For production deployment**:
```cmd
cd C:\SystemMonitor
pip install -r requirements.txt
python download_dependencies.py
pip install pyinstaller
python build_executable.py
cd dist
SystemMonitor_Launcher.bat
```

---

## 📞 Support

If you encounter issues:
1. **Check Python version**: `python --version` (should be 3.7+)
2. **Check pip**: `pip --version`
3. **Verify files**: Make sure all files extracted properly
4. **Check firewall**: Windows may block the application
5. **Try different port**: Some ports may be restricted

The application should be accessible at `http://localhost:5007` once running! 