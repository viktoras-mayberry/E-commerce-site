from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariation


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        fields = ['id', 'name', 'value', 'price_adjustment', 'stock_quantity', 'sku', 'is_active']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view"""
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    variations = ProductVariationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'price', 'compare_price',
            'stock_quantity', 'stock_status', 'sku', 'is_featured', 'is_bestseller',
            'is_new_arrival', 'is_active', 'primary_image', 'images', 'variations',
            'created_at', 'updated_at'
        ]

    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first()
        if primary_img:
            return ProductImageSerializer(primary_img).data
        # Return first image if no primary image
        first_img = obj.images.first()
        if first_img:
            return ProductImageSerializer(first_img).data
        return None


class ProductDetailSerializer(ProductListSerializer):
    """Serializer for product detail view"""
    pass


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    images = ProductImageSerializer(many=True, required=False)
    variations = ProductVariationSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'category', 'price', 'compare_price',
            'stock_quantity', 'sku', 'is_featured', 'is_bestseller', 'is_new_arrival',
            'is_active', 'images', 'variations'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        variations_data = validated_data.pop('variations', [])
        
        product = Product.objects.create(**validated_data)
        
        # Create images
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
        
        # Create variations
        for variation_data in variations_data:
            ProductVariation.objects.create(product=product, **variation_data)
        
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        variations_data = validated_data.pop('variations', [])
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                ProductImage.objects.create(product=instance, **image_data)
        
        # Update variations if provided
        if variations_data:
            instance.variations.all().delete()
            for variation_data in variations_data:
                ProductVariation.objects.create(product=instance, **variation_data)
        
        return instance
