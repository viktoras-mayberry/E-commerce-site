        // Image preview functionality
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        const fileButtonText = document.getElementById('fileButtonText');
        const addVariationBtn = document.getElementById('addVariationBtn');
        const variationsList = document.getElementById('variationsList');
        let variationCount = 0;
        
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.addEventListener('load', function() {
                    imagePreview.style.display = 'block';
                    imagePreview.querySelector('img').src = this.result;
                    fileButtonText.textContent = ' Change image';
                });
                
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                imagePreview.querySelector('img').src = '';
                fileButtonText.textContent = ' Choose an image';
            }
        });
        
        // Add variation functionality
        addVariationBtn.addEventListener('click', function() {
            variationCount++;
            const variationId = `variation-${variationCount}`;
            
            const variationItem = document.createElement('div');
            variationItem.className = 'variation-item';
            variationItem.id = variationId;
            
            variationItem.innerHTML = `
                <div class="variation-item-header">
                    <div class="variation-title">Variation #${variationCount}</div>
                    <div class="variation-actions">
                        <button type="button" class="btn btn-secondary" onclick="removeVariation('${variationId}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                
                <div class="variation-grid">
                    <div>
                        <div class="form-group">
                            <label>Variation Name</label>
                            <input type="text" placeholder="e.g., Color, Size, etc." class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Options</label>
                            <input type="text" placeholder="e.g., Red, Blue, Green (comma separated)" class="input-control" required>
                            <small style="color: #777; display: block; margin-top: 5px;">Separate options with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Additional Price ($)</label>
                            <input type="number" placeholder="0.00" min="0" step="0.01" class="input-control">
                            <small style="color: #777; display: block; margin-top: 5px;">Extra cost for this variation (if any)</small>
                        </div>
                    </div>
                    
                    <div>
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" placeholder="Enter quantity" min="0" class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>SKU (Stock Keeping Unit)</label>
                            <input type="text" placeholder="e.g., TSHIRT-RED-M" class="input-control">
                        </div>
                        
                        <div class="form-group">
                            <label>Variation Image (Optional)</label>
                            <div class="file-input-container">
                                <input type="file" accept="image/*" class="input-control variation-image">
                                <div class="file-input-button">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span>Choose variation image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            variationsList.appendChild(variationItem);
            
            // Add event listener for the new variation image input
            const variationImageInput = variationItem.querySelector('.variation-image');
            variationImageInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    const buttonText = this.parentElement.querySelector('.file-input-button span');
                    
                    reader.addEventListener('load', function() {
                        buttonText.textContent = ' Change image';
                    });
                    
                    reader.readAsDataURL(file);
                }
            });
        });
        
        // Remove variation function
        function removeVariation(id) {
            const variation = document.getElementById(id);
            if (variation) {
                variation.remove();
            }
        }
        
        // Form submission handling
        document.getElementById('productForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if user is authenticated
            const token = localStorage.getItem('admin_token');
            if (!token) {
                alert('Please login to add products');
                window.location.href = '/admin-login/';
                return;
            }
            
            const formData = new FormData();
            const productName = document.getElementById('productName').value;
            const productCategory = document.getElementById('productCategory').value;
            const about = document.getElementById('about').value;
            const productPrice = document.getElementById('productPrice').value;
            const productComparePrice = document.getElementById('productComparePrice').value;
            const initialStock = document.getElementById('initialStock').value;
            const imageFile = document.getElementById('image').files[0];
            
            // Prepare product data
            const productData = {
                name: productName,
                slug: productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                description: about,
                category: productCategory,
                price: parseFloat(productPrice),
                compare_price: productComparePrice ? parseFloat(productComparePrice) : null,
                stock_quantity: parseInt(initialStock),
                is_featured: false,
                is_bestseller: false,
                is_new_arrival: true,
                is_active: true
            };
            
            try {
                const response = await fetch('/api/products/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    const product = await response.json();
                    
                    // Upload image if provided
                    if (imageFile) {
                        const imageFormData = new FormData();
                        imageFormData.append('product', product.id);
                        imageFormData.append('image', imageFile);
                        imageFormData.append('is_primary', 'true');
                        imageFormData.append('order', '1');
                        
                        await fetch('/api/products/images/', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Token ${token}`,
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: imageFormData
                        });
                    }
                    
                    alert('Product saved successfully!');
                    this.reset();
                    imagePreview.style.display = 'none';
                    fileButtonText.textContent = ' Choose an image';
                    variationsList.innerHTML = '';
                    variationCount = 0;
                } else {
                    const error = await response.json();
                    alert('Error saving product: ' + (error.detail || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error saving product:', error);
                alert('Error saving product. Please try again.');
            }
        });
        
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
        
        // Check authentication on page load
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                window.location.href = '/admin-login/';
                return;
            }
            
            // Load dashboard data
            loadDashboardData();
        });
        
        // Load dashboard data
        async function loadDashboardData() {
            try {
                const token = localStorage.getItem('admin_token');
                
                // Load product stats
                const productsResponse = await fetch('/api/products/stats/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                
                if (productsResponse.ok) {
                    const stats = await productsResponse.json();
                    updateStatsCards(stats);
                }
                
                // Load recent orders
                const ordersResponse = await fetch('/api/orders/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                
                if (ordersResponse.ok) {
                    const orders = await ordersResponse.json();
                    updateRecentOrders(orders.results || orders);
                }
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        
        // Update stats cards
        function updateStatsCards(stats) {
            // Update product stats
            document.querySelector('.stat-card:nth-child(1) .stat-text h3').textContent = stats.total_products || 0;
            document.querySelector('.stat-card:nth-child(2) .stat-text h3').textContent = stats.in_stock || 0;
            document.querySelector('.stat-card:nth-child(3) .stat-text h3').textContent = stats.out_of_stock || 0;
            document.querySelector('.stat-card:nth-child(4) .stat-text h3').textContent = stats.featured || 0;
        }
        
        // Update recent orders (if you have an orders section)
        function updateRecentOrders(orders) {
            // This would update a recent orders section if you have one
            console.log('Recent orders:', orders);
        }
        
        // Logout function
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/admin-login/';
            }
        }
        
        // Add logout functionality to any logout buttons
        document.addEventListener('DOMContentLoaded', function() {
            // Add logout functionality to menu items
            const logoutItems = document.querySelectorAll('.menu-item');
            logoutItems.forEach(item => {
                if (item.textContent.includes('Logout')) {
                    item.addEventListener('click', logout);
                }
            });
        });