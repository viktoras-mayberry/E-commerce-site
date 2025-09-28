// Admin Forms JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    setupFormEventListeners();
});

function initializeForms() {
    console.log('Admin forms initialized');
    
    // Initialize file upload
    initializeFileUpload();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize other form features
    initializeFormFeatures();
}

function setupFormEventListeners() {
    // Form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // File upload
    const fileInputs = document.querySelectorAll('.file-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
    
    // Real-time validation
    const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Price formatting
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', formatPrice);
    }
    
    // SKU generation
    const nameInput = document.getElementById('name');
    const skuInput = document.getElementById('sku');
    if (nameInput && skuInput) {
        nameInput.addEventListener('input', generateSKU);
    }
}

function initializeFileUpload() {
    const fileInputs = document.querySelectorAll('.file-input');
    
    fileInputs.forEach(input => {
        const label = input.nextElementSibling;
        const fileInfo = label.nextElementSibling;
        
        if (label && fileInfo) {
            // Add drag and drop functionality
            label.addEventListener('dragover', handleDragOver);
            label.addEventListener('dragleave', handleDragLeave);
            label.addEventListener('drop', handleDrop);
        }
    });
}

function initializeFormValidation() {
    // Add validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        sku: {
            required: true,
            pattern: /^[A-Z0-9-_]+$/,
            minLength: 3,
            maxLength: 50
        },
        price: {
            required: true,
            min: 0.01,
            max: 999999.99
        },
        category: {
            required: true
        }
    };
    
    // Store validation rules globally
    window.formValidationRules = validationRules;
}

function initializeFormFeatures() {
    // Initialize any additional form features
    console.log('Form features initialized');
}

function handleFormSubmit(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm(form)) {
        e.preventDefault();
        return false;
    }
    
    // Show loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }
    
    // Form is valid, allow submission
    return true;
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    const rules = window.formValidationRules?.[fieldName];
    
    if (!rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (rules.required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Min length validation
    if (isValid && rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = `Minimum length is ${rules.minLength} characters`;
    }
    
    // Max length validation
    if (isValid && rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errorMessage = `Maximum length is ${rules.maxLength} characters`;
    }
    
    // Pattern validation
    if (isValid && rules.pattern && value && !rules.pattern.test(value)) {
        isValid = false;
        errorMessage = 'Invalid format';
    }
    
    // Min value validation
    if (isValid && rules.min !== undefined && value && parseFloat(value) < rules.min) {
        isValid = false;
        errorMessage = `Minimum value is ${rules.min}`;
    }
    
    // Max value validation
    if (isValid && rules.max !== undefined && value && parseFloat(value) > rules.max) {
        isValid = false;
        errorMessage = `Maximum value is ${rules.max}`;
    }
    
    // Update field appearance
    if (isValid) {
        clearFieldError({ target: field });
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function handleFileUpload(e) {
    const input = e.target;
    const file = input.files[0];
    const fileInfo = input.parentNode.querySelector('.file-info');
    const fileName = fileInfo.querySelector('.file-name');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (file) {
        // Update file name
        fileName.textContent = file.name;
        
        // Show image preview
        if (preview && previewImg && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        
        // Validate file
        validateFile(file);
    }
}

function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error');
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
        return false;
    }
    
    return true;
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = e.currentTarget.previousElementSibling;
        fileInput.files = files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }
}

function removeImage() {
    const fileInput = document.getElementById('image');
    const preview = document.getElementById('imagePreview');
    const fileName = document.querySelector('.file-name');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (preview) {
        preview.style.display = 'none';
    }
    
    if (fileName) {
        fileName.textContent = 'No file selected';
    }
}

function formatPrice(e) {
    const input = e.target;
    let value = input.value;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    input.value = value;
}

function generateSKU(e) {
    const nameInput = e.target;
    const skuInput = document.getElementById('sku');
    
    if (skuInput && !skuInput.value) {
        const name = nameInput.value;
        const sku = name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 20);
        
        if (sku) {
            skuInput.value = sku;
        }
    }
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
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    
    .file-upload-label.drag-over {
        border-color: #667eea;
        background: #f0f4ff;
        transform: scale(1.02);
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
window.adminForms = {
    validateForm,
    validateField,
    showFieldError,
    clearFieldError,
    handleFileUpload,
    removeImage,
    formatPrice,
    generateSKU,
    showNotification
};
