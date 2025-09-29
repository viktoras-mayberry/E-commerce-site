from django.urls import path
from . import views

urlpatterns = [
    # Orders
    path('', views.OrderListView.as_view(), name='order-list'),
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/update/', views.OrderUpdateView.as_view(), name='order-update'),
    path('stats/', views.order_stats, name='order-stats'),
    path('cart/stats/', views.cart_stats, name='cart-stats'),
    
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/items/', views.CartItemCreateView.as_view(), name='cart-item-create'),
    path('cart/items/<int:pk>/', views.CartItemUpdateView.as_view(), name='cart-item-update'),
    path('cart/items/<int:pk>/delete/', views.CartItemDeleteView.as_view(), name='cart-item-delete'),
    path('cart/clear/', views.clear_cart, name='cart-clear'),
]
