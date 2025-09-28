# 🏆 Elegance E-commerce Platform

A modern, full-featured e-commerce platform for jewelry and home decor items built with Django, featuring a comprehensive admin panel and seamless customer experience.

## ✨ Features

### 🛍️ Customer Experience
- **Product Browsing**: Beautiful jewelry and home decor collections
- **Advanced Search & Filter**: Smart product discovery
- **Shopping Cart**: Seamless add/remove with quantity management
- **Secure Checkout**: Paystack payment integration
- **Responsive Design**: Mobile-first, works on all devices
- **No Registration Required**: Customers can shop and checkout without creating accounts

### 🔐 Admin Panel
- **Secure Authentication**: Session-based admin login system
- **Comprehensive Dashboard**: Real-time analytics and insights
- **Product Management**: Full CRUD operations with image uploads
- **Order Management**: Complete order lifecycle tracking
- **Inventory Management**: Stock tracking and low stock alerts
- **Analytics Dashboard**: Performance metrics and reporting
- **Professional UI**: Modern, responsive admin interface

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7**: Python web framework
- **Django REST Framework**: API development
- **SQLite**: Database (production-ready for PostgreSQL)
- **Django CORS**: Cross-origin resource sharing
- **Django Filter**: Advanced filtering capabilities

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with CSS Grid/Flexbox
- **Font Awesome 6.4.0**: Professional icons
- **Google Fonts**: Inter typography
- **Responsive Design**: Mobile-first approach

### Payment & Notifications
- **Paystack**: Payment processing
- **EmailJS**: Email notifications
- **CSRF Protection**: Security implementation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/viktoras-mayberry/E-commerce-site.git
   cd E-commerce-site
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements_simple.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create admin user**
   ```bash
   python create_admin.py
   ```

6. **Start the server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - **Homepage**: http://localhost:8000/
   - **Admin Login**: http://localhost:8000/admin-login/
   - **Admin Dashboard**: http://localhost:8000/dashboard/

## 🔐 Admin Access

### Default Credentials
- **Email**: `admin@elegance.com`
- **Password**: `admin123`

### Admin Features
- **Dashboard**: Analytics, recent orders, top products
- **Product Management**: Add, edit, delete products
- **Order Management**: View and manage customer orders
- **Inventory Management**: Stock tracking and alerts
- **Analytics**: Performance metrics and reporting

## 📁 Project Structure

```
E-commerce-site/
├── elegance_store/           # Django project settings
├── accounts/                 # User authentication
├── products/                 # Product management
├── orders/                   # Order processing
├── payments/                 # Payment handling
├── templates/                # HTML templates
│   ├── index.html
│   ├── admin_login.html
│   ├── admin_dashboard.html
│   ├── jewelry-product.html
│   ├── home-product.html
│   └── admin/
├── static/                   # Static files
│   ├── css/
│   ├── js/
│   └── images/
├── media/                    # Uploaded files
├── requirements_simple.txt   # Dependencies
├── create_admin.py          # Admin user creation
└── manage.py                # Django management
```

## 🌐 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /jewelry/` - Jewelry products
- `GET /home-decor/` - Home decor products
- `GET /api/products/` - Product API
- `GET /api/orders/cart/` - Cart management

### Admin Endpoints (Authentication Required)
- `POST /api/auth/login/` - Admin login
- `GET /dashboard/` - Admin dashboard
- `GET /admin/products/` - Product management
- `GET /admin/orders/` - Order management
- `GET /admin/customers/` - Customer management
- `GET /admin/inventory/` - Inventory management
- `GET /admin/analytics/` - Analytics dashboard

## 🎨 Design System

### Brand Colors
- **Primary**: #667eea (Elegant Blue)
- **Secondary**: #764ba2 (Royal Purple)
- **Accent**: #f093fb (Soft Pink)
- **Success**: #10b981 (Emerald Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Mobile-first approach

### Animations
- **Smooth Transitions**: 0.3s cubic-bezier easing
- **Hover Effects**: Subtle lift and shadow changes
- **Loading States**: Spinner animations
- **Page Transitions**: Slide and fade effects

## 🔧 Configuration

### Environment Variables
```bash
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Static Files
STATIC_URL=/static/
MEDIA_URL=/media/
```

### Security Features
- **CSRF Protection**: Cross-site request forgery prevention
- **Session Authentication**: Secure admin sessions
- **Input Validation**: Server and client-side validation
- **File Upload Security**: Type and size restrictions
- **Admin Access Control**: Single administrator system

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

### Mobile Features
- **Touch-Friendly**: Large buttons and touch targets
- **Responsive Tables**: Horizontal scrolling
- **Collapsible Sidebar**: Space-efficient navigation
- **Mobile Navigation**: Hamburger menu

## 🚀 Deployment

### Production Checklist
1. Set `DEBUG=False`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Set up static file serving
5. Configure email settings
6. Set up SSL/HTTPS
7. Use environment variables for secrets

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS
- **Database**: PostgreSQL on cloud
- **Static Files**: AWS S3 or CloudFront
- **Domain**: Custom domain with SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue on GitHub

## 🔄 Future Enhancements

- [ ] Database migration to PostgreSQL
- [ ] Customer accounts and order history
- [ ] Advanced analytics and reporting
- [ ] Email notifications system
- [ ] Multi-language support
- [ ] Advanced SEO features
- [ ] Performance optimizations
- [ ] Mobile app integration

## 🏆 Key Features

### Professional Admin Panel
- **Modern Dashboard**: Real-time analytics and insights
- **Product Management**: Complete CRUD operations
- **Order Tracking**: Full order lifecycle management
- **Customer Database**: Comprehensive customer management
- **Inventory Control**: Stock tracking and alerts
- **Analytics**: Performance metrics and reporting

### Customer Experience
- **Beautiful Design**: Professional, modern interface
- **Smooth Animations**: Subtle, professional animations
- **Responsive Layout**: Works perfectly on all devices
- **Fast Performance**: Optimized for speed
- **Secure Payments**: Paystack integration
- **No Registration Required**: Easy checkout process

## 📊 Performance

- **Fast Loading**: Optimized static files
- **Efficient Queries**: Database optimization
- **Caching Ready**: Prepared for Redis/Memcached
- **CDN Ready**: Static file optimization
- **Mobile Optimized**: Touch-friendly interface

---

**Built with ❤️ using Django, Python, and modern web technologies**