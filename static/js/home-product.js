        // API endpoints
        const API_ENDPOINTS = {
            PRODUCTS: '/api/products/',
            CATEGORIES: '/api/products/categories/',
            CART: '/api/orders/cart/',
            ORDERS: '/api/orders/',
            PAYMENTS: '/api/payments/'
        };

        // Paystack public key (replace with your live key)
        const PAYSTACK_PUBLIC_KEY = 'pk_test_71d220e5fd848c18440c04f724fbb94d8716cd98';

        // Helper function to get CSRF token
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        // Get CSRF token from meta tag or cookie
        function getCSRFToken() {
            // Try to get from meta tag first
            const metaToken = document.querySelector('meta[name="csrf-token"]');
            if (metaToken) {
                return metaToken.getAttribute('content');
            }
            // Fallback to cookie
            return getCookie('csrftoken');
        }

        // EmailJS configuration (replace with your actual credentials)
        const EMAILJS_CONFIG = {
            SERVICE_ID: 'your_service_id',
            TEMPLATE_ID: 'your_template_id',
            USER_ID: 'user_id'
        };

        // Generate demo home decor products with stock information
        const generateDemoProducts = () => {
            const products = [];
            const categories = ["tableware", "decorative", "lighting", "textiles"];
            const materials = ["Ceramic", "Wood", "Glass", "Metal", "Marble", "Cotton", "Wool", "Brass"];
            const adjectives = ["Elegant", "Modern", "Vintage", "Minimalist", "Artisan", "Handcrafted", "Luxury", "Rustic", "Bohemian", "Coastal"];
            const types = ["Vase", "Bowl", "Plate", "Candle Holder", "Lamp", "Pillow", "Rug", "Mirror", "Frame", "Sculpture"];
            
            // Preload home decor images from Unsplash
            const imageUrls = [
                "https://images.unsplash.com/photo-1586023492125-27a3dcaa17ef",
                "https://images.unsplash.com/photo-1556020685-ae41abfc9365",
                "https://images.unsplash.com/photo-1540932239986-30128078f3c5",
                "https://images.unsplash.com/photo-1556159903-5b6a9a3e6b0f",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f",
                "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4b9",
                "https://images.unsplash.com/photo-1505842381624-c6b0579625a5",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
                "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de",
                "https://images.unsplash.com/photo-1556228720-195a672e8a03",
                "https://images.unsplash.com/photo-1511385348-a52b4a160dc2",
                "https://images.unsplash.com/photo-1505692952040-d6f7c3aafa4a",
                "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da",
                "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
                "https://images.unsplash.com/photo-1507652313519-d4e9174996dd",
                "https://images.unsplash.com/photo-1530026405186-1f3d0ff5acfa",
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
                "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"
            ];
            
            // Generate 200 products with stock information
            for (let i = 1; i <= 200; i++) {
                const category = categories[Math.floor(Math.random() * categories.length)];
                const material = materials[Math.floor(Math.random() * materials.length)];
                const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                const type = types[Math.floor(Math.random() * types.length)];
                const price = (Math.floor(Math.random() * 300000) + 2000).toFixed(2);
                const imageIndex = Math.floor(Math.random() * imageUrls.length);
                
                // Generate random stock quantity (0-50)
                const stockQuantity = Math.floor(Math.random() * 51);
                let stockStatus = 'in-stock';
                
                if (stockQuantity === 0) {
                    stockStatus = 'out-of-stock';
                } else if (stockQuantity <= 5) {
                    stockStatus = 'low-stock';
                }
                
                products.push({
                    id: i,
                    name: `${adjective} ${material} ${type}`,
                    category: category,
                    price: parseFloat(price),
                    stock: stockQuantity,
                    stockStatus: stockStatus,
                    image: `${imageUrls[imageIndex]}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80`
                });
            }
            
            return products;
        };

        // Get products from backend data
        function getBackendProducts() {
            try {
                console.log('Using backend products data...');
                if (window.BACKEND_PRODUCTS) {
                    const products = JSON.parse(window.BACKEND_PRODUCTS);
                    console.log('Backend products loaded:', products.length);
                    
                    // Convert Django serialized format to our expected format
                    return products.map(item => ({
                        id: item.pk,
                        name: item.fields.name,
                        description: item.fields.description,
                        price: parseFloat(item.fields.price),
                        image: item.fields.primary_image || 'https://via.placeholder.com/300',
                        category: item.fields.category_name || 'home decor',
                        stock: item.fields.stock_quantity || 0,
                        stockStatus: item.fields.stock_quantity > 0 ? 'in-stock' : 'out-of-stock',
                        is_featured: item.fields.is_featured,
                        is_bestseller: item.fields.is_bestseller,
                        is_new_arrival: item.fields.is_new_arrival
                    }));
                }
                throw new Error('No backend products data available');
            } catch (error) {
                console.error('Error parsing backend products:', error);
                console.log('Falling back to demo products...');
                return generateDemoProducts();
            }
        }

        // Cart functionality
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Update cart count
        function updateCartCount() {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = count;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        // Add to cart
        function addToCart(product, quantity = 1) {
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showAddedToCartMessage(product.name);
        }
        
        // Remove from cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
        
        // Update quantity
        function updateQuantity(productId, quantity) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCartItems();
                }
            }
        }
        
        // Calculate cart total
        function calculateCartTotal() {
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        // Show added to cart message
        function showAddedToCartMessage(productName) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'var(--primary)';
            notification.style.color = 'white';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${productName} added to cart!`;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // Animate out and remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
        
        // Render cart items
        function renderCartItems() {
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
                cartTotal.textContent = '₦0.00';
                return;
            }
            
            let itemsHTML = '';
            cart.forEach(item => {
                itemsHTML += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₦${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-times"></i></button>
                    </div>
                `;
            });
            
            cartItems.innerHTML = itemsHTML;
            cartTotal.textContent = `₦${calculateCartTotal().toLocaleString('en-US', {minimumFractionDigits: 2})}`;
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const item = cart.find(item => item.id === id);
                    if (item) {
                        updateQuantity(id, item.quantity + 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    const quantity = parseInt(this.value) || 1;
                    updateQuantity(id, quantity);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }
        
        // Send order via EmailJS
        function sendOrderEmail(orderData) {
            // Initialize EmailJS
            emailjs.init(EMAILJS_CONFIG.USER_ID);
            
            // Prepare email parameters
            const templateParams = {
                to_name: orderData.name,
                to_email: orderData.email,
                phone: orderData.phone,
                address: orderData.address,
                order_total: `₦${orderData.total.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
                order_items: orderData.items.map(item => 
                    `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                ).join('\n')
            };
            
            // Send email
            emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams)
                .then(response => {
                    console.log('Email sent successfully!', response.status, response.text);
                })
                .catch(error => {
                    console.error('Failed to send email:', error);
                });
        }
        
        // Process payment with Paystack
        function processPayment(orderData) {
            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: orderData.email,
                amount: orderData.total * 100, // Convert to kobo
                currency: 'NGN',
                ref: 'ELG-' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random reference
                callback: function(response) {
                    // Payment successful
                    console.log('Payment successful!', response);
                    
                    // Save order to local storage
                    saveOrderToStorage(orderData, response.reference);
                    
                    // Send order email
                    sendOrderEmail(orderData);
                    
                    // Show confirmation
                    document.getElementById('checkout-form').style.display = 'none';
                    document.getElementById('order-confirmation').style.display = 'block';
                    
                    // Clear cart
                    cart = [];
                    localStorage.removeItem('cart');
                    updateCartCount();
                },
                onClose: function() {
                    // User closed the payment window
                    alert('Payment was not completed. Please try again.');
                }
            });
            
            handler.openIframe();
        }
        
        // Save order to local storage
        function saveOrderToStorage(orderData, reference) {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = {
                id: reference,
                date: new Date().toISOString(),
                customer: {
                    name: orderData.name,
                    email: orderData.email,
                    phone: orderData.phone,
                    address: orderData.address
                },
                items: orderData.items,
                total: orderData.total,
                status: 'completed'
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        document.addEventListener('DOMContentLoaded', async function() {
            // Mobile menu toggle
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.getElementById('nav-menu');
            const loadingOverlay = document.getElementById('loading-overlay');
            const cartModal = document.getElementById('cart-modal');
            const cartOverlay = document.getElementById('cart-overlay');
            const cartIcon = document.getElementById('cart-icon');
            const closeCart = document.getElementById('close-cart');
            const checkoutBtn = document.getElementById('checkout-btn');
            const backToCartBtn = document.getElementById('back-to-cart');
            const paystackBtn = document.getElementById('paystack-btn');
            const continueShoppingBtn = document.getElementById('continue-shopping');
            
            // Initialize cart
            updateCartCount();
            
            // Mobile menu toggle
            hamburger.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                hamburger.innerHTML = navMenu.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
            
            // Cart modal toggle
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                cartModal.classList.add('active');
                cartOverlay.classList.add('active');
                renderCartItems();
            });
            
            closeCart.addEventListener('click', function() {
                cartModal.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
            
            cartOverlay.addEventListener('click', function() {
                cartModal.classList.remove('active');
                this.classList.remove('active');
            });
            
            // Checkout process
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty. Add some products first.');
                    return;
                }
                
                document.querySelector('.cart-footer').style.display = 'none';
                document.querySelector('.cart-items').style.display = 'none';
                document.querySelector('.cart-header').style.display = 'none';
                document.getElementById('checkout-form').style.display = 'block';
            });
            
            backToCartBtn.addEventListener('click', function() {
                document.getElementById('checkout-form').style.display = 'none';
                document.querySelector('.cart-footer').style.display = 'block';
                document.querySelector('.cart-items').style.display = 'block';
                document.querySelector('.cart-header').style.display = 'flex';
            });
            
            // Process payment
            paystackBtn.addEventListener('click', function() {
                const name = document.getElementById('full-name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const address = document.getElementById('address').value;
                const city = document.getElementById('city').value;
                const zip = document.getElementById('zip').value;
                
                if (!name || !email || !phone || !address || !city || !zip) {
                    alert('Please fill in all fields');
                    return;
                }
                
                const orderData = {
                    name,
                    email,
                    phone,
                    address: `${address}, ${city}, ${zip}`,
                    items: [...cart],
                    total: calculateCartTotal()
                };
                
                // Process payment
                processPayment(orderData);
            });
            
            continueShoppingBtn.addEventListener('click', function() {
                cartModal.classList.remove('active');
                cartOverlay.classList.remove('active');
                window.scrollTo(0, 0);
            });
            
            // Initialize page with products
            let currentPage = 1;
            const productsPerPage = 12;
            let allProducts = [];
            let filteredProducts = [];
            
            // Show loading animation
            function showLoading() {
                loadingOverlay.classList.add('active');
            }
            
            // Hide loading animation
            function hideLoading() {
                setTimeout(() => {
                    loadingOverlay.classList.remove('active');
                }, 500);
            }
            
            // Get stock status class based on quantity
            function getStockStatusClass(quantity) {
                if (quantity === 0) return 'out-of-stock';
                if (quantity <= 5) return 'low-stock';
                return 'in-stock';
            }
            
            // Get stock status text based on quantity
            function getStockStatusText(quantity) {
                if (quantity === 0) return 'Out of stock';
                if (quantity <= 5) return `Only ${quantity} left in stock`;
                return `${quantity} in stock`;
            }
            
            // Render products based on current page
            function renderProducts() {
                showLoading();
                
                setTimeout(() => {
                    const container = document.getElementById('products-container');
                    container.innerHTML = '';
                    
                    const startIndex = (currentPage - 1) * productsPerPage;
                    const endIndex = startIndex + productsPerPage;
                    const productsToRender = filteredProducts.slice(startIndex, endIndex);
                    
                    document.getElementById('showing-count').textContent = productsToRender.length;
                    document.getElementById('total-count').textContent = filteredProducts.length;
                    
                    if (productsToRender.length === 0) {
                        container.innerHTML = '<div class="no-results">No products found matching your criteria.</div>';
                        hideLoading();
                        return;
                    }
                    
                    productsToRender.forEach((product, index) => {
                        const productEl = document.createElement('div');
                        productEl.className = 'product-card';
                        productEl.setAttribute('data-product-id', product.id);
                        productEl.setAttribute('data-category', product.category);
                        productEl.setAttribute('data-price', product.price);
                        productEl.setAttribute('data-stock', product.stockStatus);
                        productEl.style.animationDelay = `${index * 0.05}s`;
                        
                        // Add out of stock label if needed
                        const outOfStockLabel = product.stock === 0 ? 
                            '<div class="out-of-stock-label">Out of Stock</div>' : '';
                        
                        productEl.innerHTML = `
                            ${outOfStockLabel}
                            <div class="product-img-container">
                                <img src="${product.image}" alt="${product.name}" class="product-img">
                                <div class="product-overlay">
                                    ${product.stock > 0 ? 
                                        '<button class="add-to-cart" data-id="${product.id}">Add to Cart</button>' : 
                                        '<button class="add-to-cart" disabled>Out of Stock</button>'}
                                </div>
                            </div>
                            <div class="product-info">
                                <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-price">₦${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                                <p class="stock-info ${getStockStatusClass(product.stock)}">
                                    ${getStockStatusText(product.stock)}
                                </p>
                            </div>
                        `;
                        
                        container.appendChild(productEl);
                    });
                    
                    // Add event listeners to the new Add to Cart buttons
                    document.querySelectorAll('.add-to-cart:not([disabled])').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = parseInt(this.getAttribute('data-id'));
                            const product = allProducts.find(p => p.id === productId);
                            
                            if (product) {
                                addToCart(product);
                                renderCartItems();
                            }
                        });
                    });
                    
                    renderPagination();
                    hideLoading();
                }, 500);
            }
            
            // Render pagination controls
            function renderPagination() {
                const paginationContainer = document.getElementById('pagination');
                paginationContainer.innerHTML = '';
                
                const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
                
                if (totalPages <= 1) return;
                
                // Previous button
                if (currentPage > 1) {
                    const prevBtn = document.createElement('a');
                    prevBtn.href = '#';
                    prevBtn.className = 'pagination-item';
                    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    prevBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage--;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(prevBtn);
                }
                
                // Page numbers
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                if (startPage > 1) {
                    const firstPage = document.createElement('a');
                    firstPage.href = '#';
                    firstPage.className = 'pagination-item';
                    firstPage.textContent = '1';
                    firstPage.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = 1;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(firstPage);
                    
                    if (startPage > 2) {
                        const dots = document.createElement('span');
                        dots.className = 'pagination-dots';
                        dots.textContent = '...';
                        paginationContainer.appendChild(dots);
                    }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('a');
                    pageBtn.href = '#';
                    pageBtn.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = i;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(pageBtn);
                }
                
                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        const dots = document.createElement('span');
                        dots.className = 'pagination-dots';
                        dots.textContent = '...';
                        paginationContainer.appendChild(dots);
                    }
                    
                    const lastPage = document.createElement('a');
                    lastPage.href = '#';
                    lastPage.className = 'pagination-item';
                    lastPage.textContent = totalPages;
                    lastPage.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage = totalPages;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(lastPage);
                }
                
                // Next button
                if (currentPage < totalPages) {
                    const nextBtn = document.createElement('a');
                    nextBtn.href = '#';
                    nextBtn.className = 'pagination-item';
                    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    nextBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        showLoading();
                        setTimeout(() => {
                            currentPage++;
                            renderProducts();
                            window.scrollTo(0, 0);
                        }, 500);
                    });
                    paginationContainer.appendChild(nextBtn);
                }
            }
            
            // Filter functionality
            function filterProducts() {
                const selectedCategories = Array.from(document.querySelectorAll('.filter-option input:checked')).map(input => input.id);
                const selectedStockStatus = Array.from(document.querySelectorAll('#stock-status-filter input:checked')).map(input => input.id);
                const searchTerm = document.getElementById('search-input').value.toLowerCase();
                
                // If search term is more than 2 characters, use global search
                if (searchTerm.length > 2) {
                    performGlobalSearch(searchTerm);
                    return;
                }
                
                filteredProducts = allProducts.filter(product => {
                    // Category filter
                    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
                    
                    // Stock status filter
                    const stockMatch = selectedStockStatus.length === 0 || selectedStockStatus.includes(product.stockStatus);
                    
                    // Enhanced search filter with partial matching
                    const searchMatch = searchTerm === '' || 
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.category.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm) ||
                        // Check for word variations
                        checkWordVariations(product.name.toLowerCase(), searchTerm) ||
                        checkWordVariations(product.category.toLowerCase(), searchTerm) ||
                        checkWordVariations(product.description.toLowerCase(), searchTerm);
                    
                    return categoryMatch && stockMatch && searchMatch;
                });
                
                currentPage = 1;
                renderProducts();
            }
            
            // Word variations function for enhanced search
            function checkWordVariations(text, searchTerm) {
                const wordVariations = {
                    'necklace': ['necklaces', 'chain', 'chains', 'pendant', 'pendants'],
                    'earring': ['earrings', 'ear ring', 'ear rings'],
                    'ring': ['rings', 'band', 'bands'],
                    'bracelet': ['bracelets', 'bangle', 'bangles'],
                    'diamond': ['diamonds', 'gem', 'gems', 'stone', 'stones'],
                    'gold': ['golden', 'yellow gold', 'rose gold', 'white gold'],
                    'silver': ['silver plated', 'sterling silver'],
                    'vase': ['vases', 'pottery', 'ceramic'],
                    'lamp': ['lamps', 'lighting', 'light'],
                    'candle': ['candles', 'candlestick', 'candlesticks'],
                    'bowl': ['bowls', 'dish', 'dishes'],
                    'plate': ['plates', 'platter', 'platters'],
                    'cup': ['cups', 'mug', 'mugs', 'glass', 'glasses'],
                    'decor': ['decoration', 'decorative', 'ornament', 'ornaments'],
                    'home': ['house', 'interior', 'furnishing', 'furnishings']
                };
                
                // Check if search term matches any variations
                for (const [key, variations] of Object.entries(wordVariations)) {
                    if (searchTerm.includes(key)) {
                        for (const variation of variations) {
                            if (text.includes(variation)) return true;
                        }
                    }
                    for (const variation of variations) {
                        if (searchTerm.includes(variation) && text.includes(key)) return true;
                    }
                }
                
                // Check for partial word matches
                const words = text.split(/\s+/);
                for (const word of words) {
                    if (word.includes(searchTerm) || searchTerm.includes(word)) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // Global search functionality
            function performGlobalSearch(searchTerm) {
                console.log('Performing local search for:', searchTerm);
                
                // Show loading state
                const searchBtn = document.querySelector('.search-btn');
                const originalContent = searchBtn.innerHTML;
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                searchBtn.disabled = true;
                
                // Use setTimeout to show loading state briefly
                setTimeout(() => {
                    try {
                        // Search through local products
                        const searchResults = allProducts.filter(product => {
                            const searchMatch = searchTerm === '' || 
                                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                checkWordVariations(product.name.toLowerCase(), searchTerm.toLowerCase()) ||
                                checkWordVariations(product.category.toLowerCase(), searchTerm.toLowerCase()) ||
                                checkWordVariations(product.description.toLowerCase(), searchTerm.toLowerCase());
                            
                            return searchMatch;
                        });
                        
                        console.log('Search results:', searchResults.length);
                        
                        if (searchResults.length > 0) {
                            // Update the products display with search results
                            filteredProducts = searchResults;
                            currentPage = 1;
                            renderProducts();
                            updatePagination();
                            
                            // Show search results summary
                            showSearchSummary(searchResults.length, searchTerm);
                        } else {
                            // No results found
                            showNoResultsMessage(searchTerm);
                        }
                    } catch (error) {
                        console.error('Search error:', error);
                        showNotification('Search failed. Please try again.', 'error');
                    } finally {
                        // Reset button state
                        searchBtn.innerHTML = originalContent;
                        searchBtn.disabled = false;
                    }
                }, 300); // Brief loading state
            }
            
            // Show search results summary
            function showSearchSummary(count, searchTerm) {
                const existingSummary = document.querySelector('.search-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }
                
                const summary = document.createElement('div');
                summary.className = 'search-summary';
                summary.innerHTML = `
                    <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; color: #1976d2;">
                        <i class="fas fa-search"></i> Found ${count} result${count !== 1 ? 's' : ''} for "${searchTerm}"
                        <button onclick="clearSearch()" style="float: right; background: none; border: none; color: #1976d2; cursor: pointer;">
                            <i class="fas fa-times"></i> Clear
                        </button>
                    </div>
                `;
                
                const productsContainer = document.querySelector('.products-container');
                productsContainer.insertBefore(summary, productsContainer.firstChild);
            }
            
            // Show no results message
            function showNoResultsMessage(searchTerm) {
                const existingSummary = document.querySelector('.search-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }
                
                const summary = document.createElement('div');
                summary.className = 'search-summary';
                summary.innerHTML = `
                    <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; color: #d32f2f;">
                        <i class="fas fa-exclamation-triangle"></i> No home decor products found for "${searchTerm}"
                        <button onclick="clearSearch()" style="float: right; background: none; border: none; color: #d32f2f; cursor: pointer;">
                            <i class="fas fa-times"></i> Clear
                        </button>
                    </div>
                `;
                
                const productsContainer = document.querySelector('.products-container');
                productsContainer.insertBefore(summary, productsContainer.firstChild);
            }
            
            // Clear search function
            window.clearSearch = function() {
                document.getElementById('search-input').value = '';
                filteredProducts = allProducts;
                currentPage = 1;
                renderProducts();
                
                const existingSummary = document.querySelector('.search-summary');
                if (existingSummary) {
                    existingSummary.remove();
                }
            };
            
            // Sort functionality
            function sortProducts(sortOption) {
                switch(sortOption) {
                    case 'Price: Low to High':
                        filteredProducts.sort((a, b) => a.price - b.price);
                        break;
                    case 'Price: High to Low':
                        filteredProducts.sort((a, b) => b.price - a.price);
                        break;
                    case 'Newest First':
                        filteredProducts.sort((a, b) => b.id - a.id);
                        break;
                    default:
                        // Default sorting (by ID)
                        filteredProducts.sort((a, b) => a.id - a.id);
                }
                
                currentPage = 1;
                renderProducts();
            }
            
            // Initialize the page
            async function initPage() {
                showLoading();
                
                // Get products from backend data
                allProducts = getBackendProducts();
                filteredProducts = [...allProducts];
                
                // Add event listeners to filter options
                document.querySelectorAll('.filter-option input').forEach(checkbox => {
                    checkbox.addEventListener('change', filterProducts);
                });
                
                document.querySelectorAll('#stock-status-filter input').forEach(checkbox => {
                    checkbox.addEventListener('change', filterProducts);
                });
                
                // Search functionality with debounce
                let searchTimeout;
                document.getElementById('search-input').addEventListener('input', function() {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        filterProducts();
                    }, 300); // 300ms debounce
                });
                
                // Sort functionality
                document.getElementById('sort-select').addEventListener('change', function() {
                    sortProducts(this.value);
                });
                
                // Reset filters
                document.querySelectorAll('.reset-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const widget = this.closest('.filter-widget');
                        const checkboxes = widget.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach(checkbox => {
                            checkbox.checked = true;
                        });
                        filterProducts();
                    });
                });
                
                // Dropdown menu for mobile
                const dropdowns = document.querySelectorAll('.dropdown');
                
                dropdowns.forEach(dropdown => {
                    dropdown.addEventListener('click', function(e) {
                        if (window.innerWidth <= 992) {
                            e.preventDefault();
                            this.classList.toggle('active');
                        }
                    });
                });
                
                // Initial render
                renderProducts();
            }
            
            // Start the page initialization
            initPage();
            
            // Check for product highlighting from search
            const urlParams = new URLSearchParams(window.location.search);
            const highlightId = urlParams.get('highlight');
            if (highlightId) {
                setTimeout(() => highlightProduct(highlightId), 1000);
            }
        });
        
        // Highlight specific product
        function highlightProduct(productId) {
            const productElement = document.querySelector(`[data-product-id="${productId}"]`);
            if (productElement) {
                // Scroll to product
                productElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add highlight animation
                productElement.style.transition = 'all 0.5s ease';
                productElement.style.transform = 'scale(1.05)';
                productElement.style.boxShadow = '0 0 20px rgba(196, 91, 60, 0.5)';
                productElement.style.border = '2px solid #c45b3c';
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    productElement.style.transform = 'scale(1)';
                    productElement.style.boxShadow = '';
                    productElement.style.border = '';
                }, 3000);
                
                // Remove highlight parameter from URL
                const url = new URL(window.location);
                url.searchParams.delete('highlight');
                window.history.replaceState({}, '', url);
            }
        }