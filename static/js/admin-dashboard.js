// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load dashboard data
    loadDashboardData();
});

function initializeDashboard() {
    console.log('Admin Dashboard initialized');
    
    // Check authentication
    checkAuthentication();
    
    // Initialize charts if needed
    initializeCharts();
}

function setupEventListeners() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.querySelector('.dropdown-menu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    });
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                handleNavigation(href.substring(1));
            }
            // Allow normal navigation for non-hash links
        });
    });
    
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('onclick');
            if (action) {
                eval(action);
            }
        });
    });
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function checkAuthentication() {
    // Check if user is authenticated
    fetch('/api/auth/check/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            // Redirect to login if not authenticated
            window.location.href = '/admin-login/';
        }
    })
    .catch(error => {
        console.error('Authentication check failed:', error);
        window.location.href = '/admin-login/';
    });
}

function getCSRFToken() {
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken) {
        return metaToken.getAttribute('content');
    }
    return getCookie('csrftoken');
}

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

function loadDashboardData() {
    // Load additional dashboard data via AJAX
    loadRecentOrders();
    loadTopProducts();
    loadLowStockProducts();
    loadAnalytics();
}

function loadRecentOrders() {
    fetch('/api/orders/recent/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        updateRecentOrders(data);
    })
    .catch(error => {
        console.error('Error loading recent orders:', error);
    });
}

function loadTopProducts() {
    fetch('/api/products/top-selling/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        updateTopProducts(data);
    })
    .catch(error => {
        console.error('Error loading top products:', error);
    });
}

function loadLowStockProducts() {
    fetch('/api/products/low-stock/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        updateLowStockProducts(data);
    })
    .catch(error => {
        console.error('Error loading low stock products:', error);
    });
}

function loadAnalytics() {
    fetch('/api/analytics/dashboard/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        updateAnalytics(data);
    })
    .catch(error => {
        console.error('Error loading analytics:', error);
    });
}

function updateRecentOrders(orders) {
    const ordersList = document.querySelector('.orders-list');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>No recent orders</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <div class="order-number">#${order.order_number}</div>
                <div class="order-customer">${order.customer_name}</div>
                <div class="order-date">${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <div class="order-status">
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-amount">$${order.total_amount}</div>
        </div>
    `).join('');
}

function updateTopProducts(products) {
    const productsList = document.querySelector('.products-list');
    if (!productsList) return;
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <p>No sales data yet</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
            </div>
            <div class="product-sales">
                <span class="sales-count">${product.total_sold || 0} sold</span>
            </div>
        </div>
    `).join('');
}

function updateLowStockProducts(products) {
    const stockList = document.querySelector('.stock-list');
    if (!stockList) return;
    
    if (products.length === 0) {
        stockList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>All products in stock</p>
            </div>
        `;
        return;
    }
    
    stockList.innerHTML = products.map(product => `
        <div class="stock-item">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-sku">${product.sku}</div>
            </div>
            <div class="stock-quantity">
                <span class="stock-count">${product.stock_quantity}</span>
                <span class="stock-label">left</span>
            </div>
        </div>
    `).join('');
}

function updateAnalytics(analytics) {
    // Update analytics charts and data
    console.log('Analytics data:', analytics);
}

function initializeCharts() {
    // Initialize any charts if needed
    console.log('Charts initialized');
}

function handleNavigation(section) {
    console.log('Navigating to:', section);
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[href="#${section}"]`).parentElement.classList.add('active');
    
    // Handle different sections
    switch(section) {
        case 'dashboard':
            showDashboard();
            break;
        case 'products':
            showProducts();
            break;
        case 'orders':
            showOrders();
            break;
        case 'inventory':
            showInventory();
            break;
        case 'analytics':
            showAnalytics();
            break;
        case 'settings':
            showSettings();
            break;
    }
}

function showDashboard() {
    console.log('Showing dashboard');
    // Dashboard is already visible
}

function showProducts() {
    console.log('Showing products');
    // Load products management interface
    window.location.href = '/admin/products/';
}

function showOrders() {
    console.log('Showing orders');
    // Load orders management interface
    window.location.href = '/admin/orders/';
}


function showInventory() {
    console.log('Showing inventory');
    // Load inventory management interface
    window.location.href = '/admin/inventory/';
}

function showAnalytics() {
    console.log('Showing analytics');
    // Load analytics interface
    window.location.href = '/admin/analytics/';
}

function showSettings() {
    console.log('Showing settings');
    // Load settings interface
    window.location.href = '/admin/settings/';
}

// Quick action functions
function addProduct() {
    console.log('Adding new product');
    // Navigate to custom admin add product page
    window.location.href = '/admin/products/add/';
}

function viewOrders() {
    console.log('Viewing orders');
    showOrders();
}

function manageInventory() {
    console.log('Managing inventory');
    showInventory();
}

function viewAnalytics() {
    console.log('Viewing analytics');
    showAnalytics();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/api/auth/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/admin-login/';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Force redirect even if logout fails
            window.location.href = '/admin-login/';
        });
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export functions for global access
window.adminDashboard = {
    addProduct,
    viewOrders,
    manageInventory,
    viewAnalytics,
    logout,
    showNotification
};
