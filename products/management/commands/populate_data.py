from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Category, Product, ProductImage
import random


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Product.objects.all().delete()
            Category.objects.all().delete()

        with transaction.atomic():
            self.create_categories()
            self.create_products()
            self.stdout.write(
                self.style.SUCCESS('Successfully populated database with sample data')
            )

    def create_categories(self):
        """Create product categories"""
        categories_data = [
            {
                'name': 'Jewelry',
                'slug': 'jewelry',
                'description': 'Elegant jewelry pieces for every occasion',
            },
            {
                'name': 'Home Decor',
                'slug': 'home-decor',
                'description': 'Beautiful home decoration items',
            },
            {
                'name': 'Necklaces',
                'slug': 'necklaces',
                'description': 'Stunning necklaces and pendants',
            },
            {
                'name': 'Earrings',
                'slug': 'earrings',
                'description': 'Elegant earrings for all styles',
            },
            {
                'name': 'Rings',
                'slug': 'rings',
                'description': 'Beautiful rings and bands',
            },
            {
                'name': 'Bracelets',
                'slug': 'bracelets',
                'description': 'Charming bracelets and bangles',
            },
            {
                'name': 'Tableware',
                'slug': 'tableware',
                'description': 'Elegant tableware and dining accessories',
            },
            {
                'name': 'Decorative Accents',
                'slug': 'decorative-accents',
                'description': 'Decorative items to enhance your space',
            },
            {
                'name': 'Lighting',
                'slug': 'lighting',
                'description': 'Beautiful lighting solutions',
            },
            {
                'name': 'Textiles',
                'slug': 'textiles',
                'description': 'Luxurious textiles and fabrics',
            },
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

    def create_products(self):
        """Create sample products"""
        jewelry_categories = Category.objects.filter(slug__in=['jewelry', 'necklaces', 'earrings', 'rings', 'bracelets'])
        home_categories = Category.objects.filter(slug__in=['home-decor', 'tableware', 'decorative-accents', 'lighting', 'textiles'])

        # Jewelry products
        jewelry_products = [
            {
                'name': 'Delicate Gold Chain Necklace',
                'slug': 'delicate-gold-chain-necklace',
                'description': 'A beautiful delicate gold chain necklace perfect for everyday wear.',
                'category': random.choice(jewelry_categories),
                'price': 89.99,
                'compare_price': 120.00,
                'stock_quantity': random.randint(0, 50),
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Pearl Drop Earrings',
                'slug': 'pearl-drop-earrings',
                'description': 'Elegant pearl drop earrings that add sophistication to any outfit.',
                'category': random.choice(jewelry_categories),
                'price': 75.99,
                'compare_price': 95.00,
                'stock_quantity': random.randint(0, 30),
                'is_featured': True,
                'is_new_arrival': True,
            },
            {
                'name': 'Vintage Silver Ring',
                'slug': 'vintage-silver-ring',
                'description': 'A stunning vintage-inspired silver ring with intricate details.',
                'category': random.choice(jewelry_categories),
                'price': 45.99,
                'compare_price': 65.00,
                'stock_quantity': random.randint(0, 25),
                'is_bestseller': True,
            },
            {
                'name': 'Gemstone Bead Bracelet',
                'slug': 'gemstone-bead-bracelet',
                'description': 'Colorful gemstone bead bracelet that brings joy to your wrist.',
                'category': random.choice(jewelry_categories),
                'price': 58.00,
                'compare_price': 75.00,
                'stock_quantity': random.randint(0, 40),
                'is_new_arrival': True,
            },
        ]

        # Home decor products
        home_products = [
            {
                'name': 'Artisan Ceramic Vase',
                'slug': 'artisan-ceramic-vase',
                'description': 'Handcrafted ceramic vase perfect for displaying flowers or as a standalone piece.',
                'category': random.choice(home_categories),
                'price': 64.99,
                'compare_price': 85.00,
                'stock_quantity': random.randint(0, 20),
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Modern Table Lamp',
                'slug': 'modern-table-lamp',
                'description': 'Sleek modern table lamp that provides both functionality and style.',
                'category': random.choice(home_categories),
                'price': 120.00,
                'compare_price': 150.00,
                'stock_quantity': random.randint(0, 15),
                'is_featured': True,
            },
            {
                'name': 'Wooden Serving Board',
                'slug': 'wooden-serving-board',
                'description': 'Beautiful wooden serving board perfect for entertaining guests.',
                'category': random.choice(home_categories),
                'price': 42.50,
                'compare_price': 55.00,
                'stock_quantity': random.randint(0, 35),
                'is_bestseller': True,
                'is_new_arrival': True,
            },
        ]

        all_products = jewelry_products + home_products

        for product_data in all_products:
            product, created = Product.objects.get_or_create(
                slug=product_data['slug'],
                defaults=product_data
            )
            
            if created:
                # Generate SKU
                product.sku = f"ELG-{product.id}-{product.category.name[:3].upper()}"
                product.save()
                
                # Add product image
                ProductImage.objects.create(
                    product=product,
                    image='products/default-product.jpg',  # You'll need to add this image
                    alt_text=product.name,
                    is_primary=True,
                    order=1
                )
                
                self.stdout.write(f'Created product: {product.name}')

        self.stdout.write(f'Created {len(all_products)} products')
