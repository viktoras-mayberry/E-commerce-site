from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer
)
from .filters import ProductFilter


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    """List products with filtering and search"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variations')
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status')
        if stock_status:
            queryset = queryset.filter(stock_status=stock_status)
        
        # Filter by featured products
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by bestsellers
        bestseller = self.request.query_params.get('bestseller')
        if bestseller and bestseller.lower() == 'true':
            queryset = queryset.filter(is_bestseller=True)
        
        # Filter by new arrivals
        new_arrival = self.request.query_params.get('new_arrival')
        if new_arrival and new_arrival.lower() == 'true':
            queryset = queryset.filter(is_new_arrival=True)
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Get product details"""
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variations')
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ProductCreateView(generics.CreateAPIView):
    """Create new product (Admin only)"""
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Only admins can create products
        if not self.request.user.is_admin:
            raise PermissionError("Only admins can create products")
        serializer.save()


class ProductUpdateView(generics.UpdateAPIView):
    """Update product (Admin only)"""
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def perform_update(self, serializer):
        # Only admins can update products
        if not self.request.user.is_admin:
            raise PermissionError("Only admins can update products")
        serializer.save()


class ProductDeleteView(generics.DestroyAPIView):
    """Delete product (Admin only)"""
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def perform_destroy(self, instance):
        # Only admins can delete products
        if not self.request.user.is_admin:
            raise PermissionError("Only admins can delete products")
        instance.delete()


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Get featured products"""
    products = Product.objects.filter(is_active=True, is_featured=True).select_related('category').prefetch_related('images')
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def bestseller_products(request):
    """Get bestseller products"""
    products = Product.objects.filter(is_active=True, is_bestseller=True).select_related('category').prefetch_related('images')
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def new_arrival_products(request):
    """Get new arrival products"""
    products = Product.objects.filter(is_active=True, is_new_arrival=True).select_related('category').prefetch_related('images')
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_stats(request):
    """Get product statistics"""
    total_products = Product.objects.filter(is_active=True).count()
    in_stock = Product.objects.filter(is_active=True, stock_status='in_stock').count()
    low_stock = Product.objects.filter(is_active=True, stock_status='low_stock').count()
    out_of_stock = Product.objects.filter(is_active=True, stock_status='out_of_stock').count()
    featured = Product.objects.filter(is_active=True, is_featured=True).count()
    bestsellers = Product.objects.filter(is_active=True, is_bestseller=True).count()
    new_arrivals = Product.objects.filter(is_active=True, is_new_arrival=True).count()
    
    return Response({
        'total_products': total_products,
        'in_stock': in_stock,
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'featured': featured,
        'bestsellers': bestsellers,
        'new_arrivals': new_arrivals
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def global_search(request):
    """Global search across all products with enhanced partial matching"""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response({
            'results': [],
            'total': 0,
            'query': '',
            'message': 'Please enter a search term'
        })
    
    # Enhanced partial matching with multiple search strategies
    search_terms = [query]
    
    # Add variations of the search term for better matching
    if len(query) > 2:
        # Add singular/plural variations
        if query.endswith('s'):
            search_terms.append(query[:-1])  # Remove 's' for singular
        else:
            search_terms.append(query + 's')  # Add 's' for plural
    
    # Create comprehensive search query
    search_query = Q()
    for term in search_terms:
        search_query |= (
            Q(name__icontains=term) |
            Q(description__icontains=term) |
            Q(category__name__icontains=term) |
            Q(sku__icontains=term) |
            Q(tags__icontains=term) if hasattr(Product, 'tags') else Q()
        )
    
    # Search across product name, description, category, and SKU
    products = Product.objects.filter(
        search_query,
        is_active=True
    ).distinct().order_by('-is_featured', '-is_bestseller', '-created_at')
    
    # Serialize the results
    serializer = ProductListSerializer(products, many=True)
    
    return Response({
        'results': serializer.data,
        'total': products.count(),
        'query': query,
        'message': f'Found {products.count()} results for "{query}"'
    })
