# Clinic Appointment System

A modern, full-stack clinic appointment management system built with React, Vite, Express.js, and MongoDB. This production-ready application includes comprehensive features for booking, managing, and tracking medical appointments.

## 🚀 Features

### Frontend (React + Vite)
- **Modern UI**: Built with React 18 and shadcn/ui components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Context-based state management
- **Form Validation**: Comprehensive client-side validation
- **Performance Optimized**: Code splitting and lazy loading
- **Accessibility**: WCAG compliant components

### Backend (Express.js + MongoDB)
- **RESTful API**: Well-structured API endpoints
- **Data Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error handling middleware
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Logging**: Winston-based logging system
- **Health Checks**: Built-in health monitoring endpoints
- **Database Optimization**: Connection pooling and indexing

### Production Features
- **Docker Support**: Multi-stage builds for optimization
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Monitoring**: Health checks and performance monitoring
- **Security**: HTTPS, security headers, and best practices
- **Scalability**: Horizontal scaling ready with load balancing

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Docker (optional)
- Git

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/clinic-appointment-system.git
   cd clinic-appointment-system
   \`\`\`

2. **Install frontend dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Install backend dependencies**
   \`\`\`bash
   cd server
   npm install
   cd ..
   \`\`\`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   cp server/.env.example server/.env
   \`\`\`
   
   Edit the `.env` files with your configuration.

5. **Start MongoDB**
   \`\`\`bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or use your local MongoDB installation
   mongod
   \`\`\`

6. **Start the development servers**
   \`\`\`bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd server
   npm run dev
   \`\`\`

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Docker Development

\`\`\`bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
\`\`\`

## 🚀 Production Deployment

### Using Docker

1. **Build and start production containers**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. **Access the application**
   - Application: http://localhost
   - API: http://localhost/api

### Manual Deployment

1. **Build the frontend**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Set production environment variables**
   \`\`\`bash
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   # ... other environment variables
   \`\`\`

3. **Start the backend**
   \`\`\`bash
   cd server
   npm start
   \`\`\`

4. **Serve the frontend**
   Use a web server like Nginx to serve the built files from the `dist` directory.

## 📊 API Documentation

### Appointments Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Create new appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| PATCH | `/api/appointments/:id/status` | Update appointment status |
| DELETE | `/api/appointments/:id` | Delete appointment |
| GET | `/api/appointments/stats/overview` | Get appointment statistics |

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Basic health check |
| GET | `/api/health/detailed` | Detailed health information |

## 🧪 Testing

### Frontend Tests
\`\`\`bash
npm run test
npm run test:coverage
\`\`\`

### Backend Tests
\`\`\`bash
cd server
npm run test
npm run test:coverage
\`\`\`

### End-to-End Tests
\`\`\`bash
npm run test:e2e
\`\`\`

## 📈 Monitoring and Maintenance

### Health Monitoring
- Health check endpoints available at `/api/health`
- Docker health checks configured
- Uptime monitoring ready for services like UptimeRobot

### Logging
- Winston-based logging system
- Log files stored in `server/logs/`
- Different log levels for development and production

### Performance Monitoring
- Built-in performance metrics
- Memory and CPU usage tracking
- Database connection monitoring

### Backup Strategy
- MongoDB backup scripts in `scripts/backup/`
- Automated backup scheduling recommended
- Point-in-time recovery support

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured Cross-Origin Resource Sharing
- **Security Headers**: Helmet.js for security headers
- **Data Sanitization**: Input sanitization to prevent injection attacks
- **HTTPS**: SSL/TLS configuration ready
- **Environment Variables**: Sensitive data in environment variables

## 🚀 Deployment Platforms

### Recommended Platforms

#### Frontend
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting with CDN
- **GitHub Pages**: Free hosting for public repositories

#### Backend
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Popular PaaS platform
- **DigitalOcean App Platform**: Scalable hosting

#### Database
- **MongoDB Atlas**: Managed MongoDB service
- **DigitalOcean Managed Databases**: Reliable database hosting

## 📝 Environment Variables

### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

### Backend (server/.env)
\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
LOG_LEVEL=info
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](https://github.com/your-username/clinic-appointment-system/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🗺️ Roadmap

- [ ] User authentication and authorization
- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Payment integration
- [ ] Multi-clinic support
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Telemedicine integration

---

Built with ❤️ by [Your Name](https://github.com/your-username)
