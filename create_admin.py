#!/usr/bin/env python
import os
import django

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elegance_store.settings')
django.setup()

from accounts.models import User

# Create superuser
if not User.objects.filter(email='admin@elegance.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@elegance.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    print("✅ Superuser created: admin@elegance.com / admin123")
else:
    print("✅ Superuser already exists")
