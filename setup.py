#!/usr/bin/env python
"""
Setup script for Elegance E-commerce Platform
"""
import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e.stderr}")
        return False

def setup_django():
    """Setup Django project"""
    print("Setting up Django project...")
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elegance_store.settings')
    django.setup()
    
    # Run migrations
    if not run_command("python manage.py makemigrations", "Creating migrations"):
        return False
    
    if not run_command("python manage.py migrate", "Running migrations"):
        return False
    
    # Create superuser
    print("\nCreating superuser...")
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(email='admin@elegance.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@elegance.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                is_admin=True
            )
            print("✓ Superuser created: admin@elegance.com / admin123")
        else:
            print("✓ Superuser already exists")
    except Exception as e:
        print(f"✗ Error creating superuser: {e}")
        return False
    
    # Populate sample data
    if not run_command("python manage.py populate_data", "Populating sample data"):
        return False
    
    return True

def main():
    """Main setup function"""
    print("=" * 60)
    print("ELEGANCE E-COMMERCE PLATFORM SETUP")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("✗ Error: manage.py not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing requirements"):
        print("✗ Failed to install requirements. Please check your Python environment.")
        sys.exit(1)
    
    # Setup Django
    if not setup_django():
        print("✗ Django setup failed.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Copy env.example to .env and configure your settings")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000")
    print("4. Admin panel: http://localhost:8000/admin")
    print("   Username: admin@elegance.com")
    print("   Password: admin123")
    print("\nAPI Endpoints:")
    print("- Products: http://localhost:8000/api/products/")
    print("- Categories: http://localhost:8000/api/products/categories/")
    print("- Cart: http://localhost:8000/api/orders/cart/")
    print("- Orders: http://localhost:8000/api/orders/")
    print("- Payments: http://localhost:8000/api/payments/")

if __name__ == '__main__':
    main()
