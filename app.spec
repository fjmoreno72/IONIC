# -*- mode: python ; coding: utf-8 -*-
import os
from pathlib import Path

block_cipher = None

# Get the current directory
current_dir = os.path.abspath(os.getcwd())

# Define paths
app_dir = os.path.join(current_dir, 'app')
templates_dir = os.path.join(app_dir, 'templates')
static_dir = os.path.join(app_dir, 'static')
config_dir = os.path.join(app_dir, 'config')

# Data files to include
datas = [
    (templates_dir, 'app/templates'),
    (static_dir, 'app/static'),
    (config_dir, 'app/config'),
]

# Include other app directories
app_subdirs = ['core', 'data_access', 'data_models', 'routes', 'api', 'utils']
for subdir in app_subdirs:
    subdir_path = os.path.join(app_dir, subdir)
    if os.path.exists(subdir_path):
        datas.append((subdir_path, f'app/{subdir}'))

# Include shared_core if it exists (common in this type of project)
shared_core_dir = os.path.join(current_dir, 'shared_core')
if os.path.exists(shared_core_dir):
    datas.append((shared_core_dir, 'shared_core'))

a = Analysis(
    ['run.py'],  # Changed from app.py to run.py - your actual entry point
    pathex=[current_dir],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'flask',
        'requests',
        'urllib3',
        'certifi',
        'ssl',
        'socket',
        'json',
        'datetime',
        'threading',
        'logging',
        'werkzeug',
        'jinja2',
        'markupsafe',
        'itsdangerous',
        'click',
        'blinker',
        'argparse',
        'pathlib',
        'warnings',
        'psutil',
        'ijson',
        'beautifulsoup4',
        'pandas',
        'openpyxl',
        # App-specific imports
        'app',
        'app.config',
        'app.config.settings',
        'app.utils',
        'app.utils.logging',
        'app.core',
        'app.core.exceptions',
        'app.core.auth_patch',
        'app.routes',
        'app.routes.auth',
        'app.routes.api',
        'app.routes.views',
        'app.routes.config_items',
        'app.routes.services',
        'app.routes.sps',
        'app.routes.gps',
        'app.routes.models',
        'app.routes.actors2gp',
        'app.routes.cis_plan',
        'app.routes.cis_plan_2',
        'app.routes.participants',
        'app.routes.ascs',
        'app.data_access',
        'app.data_models',
        'app.api',
        # Add shared_core if it exists
        'shared_core',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'tkinter',
        'PyQt5',
        'PyQt6',
        'PySide2',
        'PySide6',
        'IPython',
        'jupyter',
        'notebook',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyt = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyt,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='SystemMonitor',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep as True to see startup messages and errors
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add path to .ico file if you have one: 'app/static/favicon/favicon.ico'
) 