# System Monitor - Executable Build Instructions

This guide will help you create a standalone Windows executable of the System Monitor that works both online and offline.

## 🎯 What This Creates

- **Single executable file** (`SystemMonitor.exe`) 
- **Launcher script** (`SystemMonitor_Launcher.bat`) with environment variables
- **No Python installation required** on target machine
- **No internet connection required** for operation
- **All dependencies bundled** (Bootstrap, Chart.js, FontAwesome)
- **Works on any Windows machine** (Windows 7+)

## 📋 Prerequisites

1. **Python 3.7+** installed on build machine
2. **Internet connection** for downloading dependencies
3. **Your Flask application** with these files:
   - `run.py` (main entry point)
   - `app/` directory with templates, static files, and Python modules

## 🚀 Quick Build (Automatic)

**Option 1: Use the automated build script**
```bash
python build_executable.py
```

This script automatically:
- Downloads all static dependencies
- Installs PyInstaller
- Sets environment variables
- Builds the executable
- Creates a launcher script
- Provides success/error feedback

## 🔧 Manual Build (Step by Step)

**Option 2: Manual process if you prefer control**

### Step 1: Download Dependencies
```bash
python download_dependencies.py
```

This downloads:
- Bootstrap CSS (~160KB)
- Chart.js (~200KB) 
- FontAwesome CSS + fonts (~300KB)

### Step 2: Install PyInstaller
```bash
pip install pyinstaller
```

### Step 3: Set Environment Variables (Optional)
```bash
set IONIC2_PORT=5007
set IONIC2_DEBUG=False
set IONIC2_HOST=0.0.0.0
```

### Step 4: Build Executable
```bash
pyinstaller app.spec
```

## 📁 File Structure After Build

```
your-project/
├── app/
│   ├── static/
│   │   ├── css/          # Downloaded CSS files
│   │   ├── js/           # Downloaded JS files
│   │   └── webfonts/     # Downloaded font files
│   ├── templates/        # Your HTML templates
│   ├── config/          # App configuration
│   ├── routes/          # Flask routes/blueprints
│   ├── core/            # Core application logic
│   └── ...              # Other app directories
├── dist/
│   ├── SystemMonitor.exe         # ← Your main executable!
│   └── SystemMonitor_Launcher.bat # ← Launcher with env vars!
├── build/                # Build cache (can delete)
├── run.py               # Your Flask app entry point
├── app.spec             # PyInstaller config
└── download_dependencies.py
```

## ✅ Testing Your Executable

### Test Locally
1. Navigate to `dist/` folder
2. **Recommended**: Double-click `SystemMonitor_Launcher.bat`
3. **Alternative**: Double-click `SystemMonitor.exe` directly
4. Open browser to `http://localhost:5007`

### Test with Custom Port
```cmd
set IONIC2_PORT=8080 && SystemMonitor.exe
```

### Test Offline
1. Disconnect internet
2. Run the executable
3. Verify all functionality works

### Test on Target Machine
1. Copy both files to target machine:
   - `SystemMonitor.exe`
   - `SystemMonitor_Launcher.bat` (optional but recommended)
2. Run the launcher script or executable

## 🐛 Troubleshooting

### Common Issues

**"Missing module" errors:**
- Add missing modules to `hiddenimports` in `app.spec`
- Check that all app directories are included in `datas`

**"Template not found" errors:**
- Verify `app/templates/` directory is included
- Check that template paths use Flask's `render_template()`

**"Static file not found" errors:**
- Verify static files downloaded correctly with `download_dependencies.py`
- Check paths in HTML templates use `url_for('static', filename='...')`

**"Port already in use" errors:**
- Change the port: `set IONIC2_PORT=8080 && SystemMonitor.exe`
- Or kill the process using the port

**"Configuration not found" errors:**
- Verify `app/config/` directory is included in build
- Check environment variables are set

### Build Issues

**"run.py not found":**
- Ensure you're in the correct directory
- Check that `run.py` exists in the project root

**Download failures:**
```bash
# Try downloading dependencies manually
python download_dependencies.py
```

**PyInstaller errors:**
```bash
# Clean and rebuild
rmdir /s build dist
pyinstaller app.spec
```

**Permission errors:**
- Run command prompt as administrator
- Check antivirus isn't blocking files

## 🔧 Customization

### Change Default Port
Edit `SystemMonitor_Launcher.bat`:
```batch
set IONIC2_PORT=8080
```

Or edit `app.spec` to change the default:
```python
# Add to environment variables section
os.environ.setdefault('IONIC2_PORT', '8080')
```

### Change Executable Name
Edit `app.spec`:
```python
name='YourAppName',  # Change this line
```

### Add Icon
1. Convert PNG to ICO format
2. Edit `app.spec`:
```python
icon='app/static/favicon/favicon.ico',
```

### Hide Console Window
Edit `app.spec`:
```python
console=False,  # Change from True to False
```

⚠️ **Warning**: Only hide console after testing, as it shows important startup messages and errors.

### Add Environment Variables
Edit the launcher script or set them before running:
```batch
set MY_CUSTOM_VAR=value
set IONIC2_DEBUG=True
SystemMonitor.exe
```

## 📦 Distribution

Your distribution includes:

### Required Files:
✅ **`SystemMonitor.exe`** - Main application

### Optional Files:
✅ **`SystemMonitor_Launcher.bat`** - Convenient launcher with environment variables

### Capabilities:
✅ **Copy to any Windows machine**
✅ **No installation required**
✅ **No internet needed**
✅ **No Python needed**
✅ **Works immediately**

## 🌐 Usage

### Start the Application:
1. **Easy way**: Double-click `SystemMonitor_Launcher.bat`
2. **Direct way**: Double-click `SystemMonitor.exe`
3. **Custom port**: `set IONIC2_PORT=8080 && SystemMonitor.exe`

### Access the Application:
- Default: `http://localhost:5007`
- Custom port: `http://localhost:YOUR_PORT`

### Environment Variables:
- `IONIC2_PORT` - Web server port (default: 5007)
- `IONIC2_HOST` - Bind address (default: 0.0.0.0)
- `IONIC2_DEBUG` - Debug mode (default: False)

## 🔄 Updates

To update the executable:
1. Modify your Flask application
2. Run `python build_executable.py` again
3. Replace old executable with new one

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all required files are present
3. Test the original `python run.py` command first
4. Check PyInstaller documentation

---

**🎉 Congratulations!** 
You now have a portable, offline-capable system monitor application! 