import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Filter for products"""
    name = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.CharFilter(field_name='category__slug')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    stock_status = django_filters.ChoiceFilter(choices=Product.STOCK_STATUS_CHOICES)
    is_featured = django_filters.BooleanFilter()
    is_bestseller = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()

    class Meta:
        model = Product
        fields = ['name', 'category', 'price_min', 'price_max', 'stock_status', 'is_featured', 'is_bestseller', 'is_new_arrival']
