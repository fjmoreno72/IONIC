#!/bin/bash

export PYTHONPATH=/Users/fjmoreno72/WORK/IONIC2

source /Users/fjmoreno72/WORK/IONIC2/.venv/bin/activate

cd /Users/fjmoreno72/WORK/IONIC2

nohup python app_ionic.py > app_ionic.log 2>&1 &

sleep 5

open http://127.0.0.1:5005