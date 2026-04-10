"""
scheduler.py
Runs as a background process alongside the Django app.
Calls the mark-overdue endpoint every hour to keep task statuses fresh.

Usage:
    python scheduler.py
"""

import time
import requests
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

DJANGO_BASE_URL = 'http://localhost:8001'
INTERVAL_SECONDS = 3600  # 1 hour


def run_mark_overdue():
    try:
        resp = requests.post(f'{DJANGO_BASE_URL}/api/tasks/mark-overdue/')
        data = resp.json()
        logger.info(f"[Scheduler] mark-overdue: {data.get('message')}")
    except Exception as e:
        logger.error(f"[Scheduler] Error calling mark-overdue: {e}")


if __name__ == '__main__':
    logger.info(f"Overdue task scheduler started. Interval: {INTERVAL_SECONDS}s")
    while True:
        run_mark_overdue()
        time.sleep(INTERVAL_SECONDS)
