// Admin Products JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
    setupEventListeners();
});

function initializeProductsPage() {
    console.log('Products page initialized');
    
    // Check authentication
    checkAuthentication();
    
    // Initialize any additional features
    initializeProductFeatures();
}

function setupEventListeners() {
    // Modal functionality
    setupModalEvents();
    
    // Search functionality
    setupSearchEvents();
    
    // Filter functionality
    setupFilterEvents();
    
    // Bulk actions
    setupBulkActions();
}

function setupModalEvents() {
    const modal = document.getElementById('deleteModal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function setupSearchEvents() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 500);
        });
    }
}

function setupFilterEvents() {
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function setupBulkActions() {
    // Add bulk action functionality if needed
    console.log('Bulk actions setup');
}

function initializeProductFeatures() {
    // Initialize any product-specific features
    console.log('Product features initialized');
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

function performSearch(query) {
    // Update URL with search parameter
    const url = new URL(window.location);
    if (query) {
        url.searchParams.set('search', query);
    } else {
        url.searchParams.delete('search');
    }
    url.searchParams.delete('page'); // Reset to first page
    window.location.href = url.toString();
}

function applyFilters() {
    const form = document.querySelector('.filters-form');
    if (form) {
        form.submit();
    }
}

function deleteProduct(productId, productName) {
    // Show confirmation modal
    const modal = document.getElementById('deleteModal');
    const productNameElement = document.getElementById('productName');
    
    if (modal && productNameElement) {
        productNameElement.textContent = productName;
        modal.style.display = 'block';
        
        // Store product ID for deletion
        modal.dataset.productId = productId;
    }
}

function closeModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
        modal.dataset.productId = '';
    }
}

function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    const productId = modal.dataset.productId;
    
    if (productId) {
        // Show loading state
        const deleteBtn = modal.querySelector('.btn-danger');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;
        
        // Create form to submit DELETE request
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/products/delete/${productId}/`;
        
        // Add CSRF token
        const csrfToken = document.createElement('input');
        csrfToken.type = 'hidden';
        csrfToken.name = 'csrfmiddlewaretoken';
        csrfToken.value = getCSRFToken();
        form.appendChild(csrfToken);
        
        // Submit form
        document.body.appendChild(form);
        form.submit();
    }
}

function editProduct(productId) {
    window.location.href = `/admin/products/edit/${productId}/`;
}

function viewProduct(productId) {
    window.location.href = `/admin/products/view/${productId}/`;
}

function duplicateProduct(productId) {
    if (confirm('Are you sure you want to duplicate this product?')) {
        // Show loading state
        showNotification('Duplicating product...', 'info');
        
        fetch(`/api/products/duplicate/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Product duplicated successfully!', 'success');
                // Reload page to show new product
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(data.error || 'Failed to duplicate product', 'error');
            }
        })
        .catch(error => {
            console.error('Error duplicating product:', error);
            showNotification('Failed to duplicate product', 'error');
        });
    }
}

function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (confirm(`Are you sure you want to ${newStatus} this product?`)) {
        fetch(`/api/products/toggle-status/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(`Product ${newStatus}d successfully!`, 'success');
                // Reload page to update status
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(data.error || 'Failed to update product status', 'error');
            }
        })
        .catch(error => {
            console.error('Error updating product status:', error);
            showNotification('Failed to update product status', 'error');
        });
    }
}

function bulkDeleteProducts() {
    const selectedProducts = getSelectedProducts();
    
    if (selectedProducts.length === 0) {
        showNotification('Please select products to delete', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
        // Show loading state
        showNotification('Deleting products...', 'info');
        
        fetch('/api/products/bulk-delete/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_ids: selectedProducts
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(`${data.deleted_count} products deleted successfully!`, 'success');
                // Reload page to update list
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(data.error || 'Failed to delete products', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting products:', error);
            showNotification('Failed to delete products', 'error');
        });
    }
}

function getSelectedProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function selectAllProducts() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    
    productCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const selectedProducts = getSelectedProducts();
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (bulkActions) {
        if (selectedProducts.length > 0) {
            bulkActions.style.display = 'flex';
            bulkActions.querySelector('.selected-count').textContent = selectedProducts.length;
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

function exportProducts() {
    const filters = getCurrentFilters();
    
    // Create export URL with current filters
    const url = new URL('/api/products/export/', window.location.origin);
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            url.searchParams.set(key, filters[key]);
        }
    });
    
    // Trigger download
    window.open(url.toString(), '_blank');
    showNotification('Export started...', 'info');
}

function getCurrentFilters() {
    const form = document.querySelector('.filters-form');
    const formData = new FormData(form);
    const filters = {};
    
    for (let [key, value] of formData.entries()) {
        if (value) {
            filters[key] = value;
        }
    }
    
    return filters;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification i {
        font-size: 1.125rem;
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.adminProducts = {
    deleteProduct,
    editProduct,
    viewProduct,
    duplicateProduct,
    toggleProductStatus,
    bulkDeleteProducts,
    selectAllProducts,
    updateBulkActions,
    exportProducts,
    showNotification
};
