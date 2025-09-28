from django.core.management.base import BaseCommand
from products.models import Category, Product
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with sample categories and products'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create categories
        jewelry_category, created = Category.objects.get_or_create(
            name='Jewelry',
            defaults={
                'slug': 'jewelry',
                'description': 'Beautiful jewelry collection',
                'is_active': True
            }
        )
        
        home_decor_category, created = Category.objects.get_or_create(
            name='Home Decor',
            defaults={
                'slug': 'home-decor',
                'description': 'Elegant home decoration items',
                'is_active': True
            }
        )
        
        # Create sample jewelry products
        jewelry_products = [
            {
                'name': 'Diamond Necklace',
                'slug': 'diamond-necklace',
                'description': 'Elegant diamond necklace perfect for special occasions',
                'price': Decimal('299.99'),
                'sku': 'JEW001',
                'is_featured': True,
                'is_bestseller': True,
                'is_new_arrival': False,
                'stock_quantity': 10
            },
            {
                'name': 'Gold Earrings',
                'slug': 'gold-earrings',
                'description': 'Classic gold earrings with modern design',
                'price': Decimal('149.99'),
                'sku': 'JEW002',
                'is_featured': False,
                'is_bestseller': True,
                'is_new_arrival': True,
                'stock_quantity': 15
            },
            {
                'name': 'Silver Bracelet',
                'slug': 'silver-bracelet',
                'description': 'Handcrafted silver bracelet',
                'price': Decimal('89.99'),
                'sku': 'JEW003',
                'is_featured': True,
                'is_bestseller': False,
                'is_new_arrival': True,
                'stock_quantity': 20
            },
            {
                'name': 'Pearl Ring',
                'slug': 'pearl-ring',
                'description': 'Elegant pearl ring with sterling silver setting',
                'price': Decimal('199.99'),
                'sku': 'JEW004',
                'is_featured': False,
                'is_bestseller': False,
                'is_new_arrival': True,
                'stock_quantity': 8
            }
        ]
        
        # Create sample home decor products
        home_decor_products = [
            {
                'name': 'Crystal Vase',
                'slug': 'crystal-vase',
                'description': 'Beautiful crystal vase for flowers and decoration',
                'price': Decimal('79.99'),
                'sku': 'HD001',
                'is_featured': True,
                'is_bestseller': False,
                'is_new_arrival': True,
                'stock_quantity': 12
            },
            {
                'name': 'Decorative Candle Set',
                'slug': 'decorative-candle-set',
                'description': 'Set of 3 decorative candles with elegant holders',
                'price': Decimal('49.99'),
                'sku': 'HD002',
                'is_featured': False,
                'is_bestseller': True,
                'is_new_arrival': False,
                'stock_quantity': 25
            },
            {
                'name': 'Wall Art Canvas',
                'slug': 'wall-art-canvas',
                'description': 'Modern abstract wall art canvas',
                'price': Decimal('129.99'),
                'sku': 'HD003',
                'is_featured': True,
                'is_bestseller': True,
                'is_new_arrival': False,
                'stock_quantity': 5
            },
            {
                'name': 'Table Centerpiece',
                'slug': 'table-centerpiece',
                'description': 'Elegant table centerpiece for dining room',
                'price': Decimal('99.99'),
                'sku': 'HD004',
                'is_featured': False,
                'is_bestseller': False,
                'is_new_arrival': True,
                'stock_quantity': 18
            }
        ]
        
        # Create jewelry products
        for product_data in jewelry_products:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults={
                    'name': product_data['name'],
                    'slug': product_data['slug'],
                    'description': product_data['description'],
                    'category': jewelry_category,
                    'price': product_data['price'],
                    'is_featured': product_data['is_featured'],
                    'is_bestseller': product_data['is_bestseller'],
                    'is_new_arrival': product_data['is_new_arrival'],
                    'stock_quantity': product_data['stock_quantity'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created jewelry product: {product.name}')
        
        # Create home decor products
        for product_data in home_decor_products:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults={
                    'name': product_data['name'],
                    'slug': product_data['slug'],
                    'description': product_data['description'],
                    'category': home_decor_category,
                    'price': product_data['price'],
                    'is_featured': product_data['is_featured'],
                    'is_bestseller': product_data['is_bestseller'],
                    'is_new_arrival': product_data['is_new_arrival'],
                    'stock_quantity': product_data['stock_quantity'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created home decor product: {product.name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data!')
        )
