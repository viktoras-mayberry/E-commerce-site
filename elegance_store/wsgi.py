"""
WSGI config for elegance_store project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elegance_store.settings')

application = get_wsgi_application()
