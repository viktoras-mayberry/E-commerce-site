#!/usr/bin/env python
"""
Development server runner for Elegance E-commerce Platform
"""
import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

def main():
    """Run the development server"""
    print("=" * 60)
    print("ELEGANCE E-COMMERCE PLATFORM")
    print("Starting Development Server...")
    print("=" * 60)
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elegance_store.settings')
    django.setup()
    
    # Check if database is set up
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("Please run: python setup.py")
        sys.exit(1)
    
    # Run migrations if needed
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✓ Database migrations up to date")
    except Exception as e:
        print(f"✗ Migration error: {e}")
        sys.exit(1)
    
    print("\n🚀 Starting server...")
    print("📍 Frontend: http://localhost:8000")
    print("📍 Admin Panel: http://localhost:8000/admin")
    print("📍 Admin Login: http://localhost:8000/admin-login/")
    print("📍 API: http://localhost:8000/api/")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start the server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])

if __name__ == '__main__':
    main()
