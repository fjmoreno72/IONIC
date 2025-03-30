#!/bin/bash

export PYTHONPATH=/home/iocore/IONIC2

source /home/iocore/IONIC2/.venv/bin/activate

cd /home/iocore/IONIC2

nohup python3 app_ionic.py > app_ionic.log 2>&1 &
