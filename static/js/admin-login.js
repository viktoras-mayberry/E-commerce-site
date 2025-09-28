// Admin Login JavaScript - Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin login page loaded');
    initializeLogin();
    setupEventListeners();
});

function initializeLogin() {
    console.log('Initializing admin login');
    
    // Check if already logged in
    checkExistingLogin();
    
    // Ensure form inputs are focusable
    ensureInputsWork();
}

function ensureInputsWork() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    console.log('Ensuring inputs work...');
    console.log('Email input found:', !!emailInput);
    console.log('Password input found:', !!passwordInput);
    
    if (emailInput) {
        // Remove any attributes that might block interaction
        emailInput.removeAttribute('disabled');
        emailInput.removeAttribute('readonly');
        emailInput.removeAttribute('readOnly');
        
        // Set styles to ensure interaction
        emailInput.style.pointerEvents = 'auto';
        emailInput.style.userSelect = 'text';
        emailInput.style.cursor = 'text';
        emailInput.style.position = 'relative';
        emailInput.style.zIndex = '10';
        
        // Test if input is focusable
        emailInput.focus();
        console.log('Email input configured and focused');
    }
    
    if (passwordInput) {
        // Remove any attributes that might block interaction
        passwordInput.removeAttribute('disabled');
        passwordInput.removeAttribute('readonly');
        passwordInput.removeAttribute('readOnly');
        
        // Set styles to ensure interaction
        passwordInput.style.pointerEvents = 'auto';
        passwordInput.style.userSelect = 'text';
        passwordInput.style.cursor = 'text';
        passwordInput.style.position = 'relative';
        passwordInput.style.zIndex = '10';
        
        console.log('Password input configured');
    }
    
    // Test clicking on inputs
    setTimeout(() => {
        if (emailInput) {
            emailInput.click();
            emailInput.focus();
            console.log('Email input click and focus test');
        }
    }, 500);
}

function setupEventListeners() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    console.log('Setting up event listeners');
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleLogin);
        console.log('Form submit listener added');
    }
    
    // Input focus events
    if (emailInput) {
        emailInput.addEventListener('focus', function() {
            console.log('Email input focused');
        });
        emailInput.addEventListener('input', function() {
            console.log('Email input changed:', this.value);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            console.log('Password input focused');
        });
        passwordInput.addEventListener('input', function() {
            console.log('Password input changed');
        });
    }
    
    // Test if inputs are working
    setTimeout(() => {
        if (emailInput) {
            emailInput.focus();
            console.log('Email input focus test');
        }
    }, 1000);
}

function checkExistingLogin() {
    // Check if user is already logged in
    fetch('/api/auth/check/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            console.log('Already logged in, redirecting');
            // Add a small delay to prevent redirect loops
            setTimeout(() => {
                window.location.replace('/dashboard/');
            }, 100);
        } else {
            console.log('Not logged in, showing login form');
        }
    })
    .catch(error => {
        console.log('Not logged in, showing login form');
    });
}

function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const form = e.target;
    const submitBtn = form.querySelector('.login-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Get form data
    const formData = new FormData(form);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    console.log('Login data:', loginData);
    
    // Show loading state
    showLoadingState(submitBtn, btnText, btnLoader);
    
    // Submit login request
    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login response:', data);
        if (data.user && data.message === 'Admin login successful') {
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                // Use replace instead of href to prevent back button issues
                window.location.replace('/dashboard/');
            }, 1500);
        } else {
            showErrorMessage(data.error || 'Login failed. Please check your credentials.');
            hideLoadingState(submitBtn, btnText, btnLoader);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showErrorMessage('An error occurred. Please try again.');
        hideLoadingState(submitBtn, btnText, btnLoader);
    });
}

function showLoadingState(btn, text, loader) {
    btn.classList.add('loading');
    btn.disabled = true;
    text.style.opacity = '0';
    loader.style.display = 'block';
}

function hideLoadingState(btn, text, loader) {
    btn.classList.remove('loading');
    btn.disabled = false;
    text.style.opacity = '1';
    loader.style.display = 'none';
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // Hide success message
    if (successDiv) {
        successDiv.style.display = 'none';
    }
    
    // Show error message
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccessMessage(message) {
    const successDiv = document.getElementById('success-message');
    const errorDiv = document.getElementById('error-message');
    
    // Hide error message
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    // Show success message
    if (successDiv) {
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.display = 'block';
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
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

// Debug function to test inputs
function testInputs() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    console.log('Testing inputs...');
    console.log('Email input:', emailInput);
    console.log('Password input:', passwordInput);
    
    if (emailInput) {
        emailInput.focus();
        emailInput.value = 'test@example.com';
        console.log('Email input test completed');
    }
    
    if (passwordInput) {
        passwordInput.focus();
        passwordInput.value = 'test123';
        console.log('Password input test completed');
    }
}

// Make test function available globally
window.testInputs = testInputs;

// Export functions for global access
window.adminLogin = {
    togglePassword,
    showErrorMessage,
    showSuccessMessage,
    testInputs
};