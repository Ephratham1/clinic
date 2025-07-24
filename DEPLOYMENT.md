# Deployment Guide

This guide covers deploying the Clinic Appointment System to production using MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Cloud Platform Accounts**: 
   - [Vercel](https://vercel.com) for frontend
   - [Railway](https://railway.app) or [Render](https://render.com) for backend
3. **GitHub Account**: For CI/CD pipeline

## MongoDB Atlas Setup

### 1. Create a Cluster

1. Log in to MongoDB Atlas
2. Create a new project or use existing
3. Build a database (choose M0 for free tier)
4. Select your preferred cloud provider and region
5. Create cluster

### 2. Configure Database Access

1. Go to Database Access in the left sidebar
2. Add a new database user:
   - Username: `ephratham`
   - Password: `ephratham` (use a strong password in production)
   - Database User Privileges: Read and write to any database

### 3. Configure Network Access

1. Go to Network Access in the left sidebar
2. Add IP Address:
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow access from anywhere)
   - Or add specific IPs of your deployment platforms

### 4. Get Connection String

1. Go to Database → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

## Environment Variables Setup

### Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

\`\`\`
MONGODB_URI=mongodb+srv://ephratham:ephratham@cluster0.x3irutl.mongodb.net/clinic?retryWrites=true&w=majority&appName=Cluster0
RAILWAY_TOKEN=your-railway-token
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
VITE_API_URL=https://your-backend-url.railway.app/api
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
\`\`\`

## Backend Deployment (Railway)

### 1. Create Railway Account

1. Sign up at [Railway](https://railway.app)
2. Connect your GitHub account

### 2. Deploy Backend

1. Create new project from GitHub repo
2. Select the repository
3. Railway will auto-detect Node.js
4. Add environment variables:
   \`\`\`
   NODE_ENV=production
   MONGODB_URI=your-atlas-connection-string
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   PORT=5000
   \`\`\`

### 3. Configure Build

Railway should automatically:
- Install dependencies from `server/package.json`
- Start the application with `npm start`
- Expose the service on a public URL

## Frontend Deployment (Vercel)

### 1. Create Vercel Account

1. Sign up at [Vercel](https://vercel.com)
2. Connect your GitHub account

### 2. Deploy Frontend

1. Import your GitHub repository
2. Vercel will auto-detect Vite
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### 3. Environment Variables

Add to Vercel project settings:
\`\`\`
VITE_API_URL=https://your-backend-url.railway.app/api
\`\`\`

## Docker Deployment

### 1. Build Images

\`\`\`bash
# Build backend
docker build -t clinic-backend .

# Build frontend
docker build -f Dockerfile.frontend -t clinic-frontend .
\`\`\`

### 2. Run with Docker Compose

\`\`\`bash
# Update docker-compose.yml with your Atlas URI
docker-compose up -d
\`\`\`

## CI/CD Pipeline

The GitHub Actions workflow will automatically:

1. **On Pull Request**: Run tests and linting
2. **On Push to Main**: 
   - Run tests
   - Build and deploy to Railway (backend)
   - Build and deploy to Vercel (frontend)
   - Build and push Docker images

## Monitoring and Maintenance

### Health Checks

- Backend health: `https://your-backend-url.railway.app/api/health`
- Frontend health: Check if the site loads properly

### Logs

- **Railway**: View logs in Railway dashboard
- **Vercel**: View function logs in Vercel dashboard
- **MongoDB Atlas**: Monitor database performance in Atlas dashboard

### Database Maintenance

1. **Backups**: Atlas provides automatic backups
2. **Monitoring**: Use Atlas monitoring tools
3. **Scaling**: Upgrade cluster tier as needed

## Security Considerations

### Production Checklist

- [ ] Use strong database passwords
- [ ] Restrict IP access in Atlas
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (handled by platforms)
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Monitor for security issues

### Atlas Security

1. Enable database auditing
2. Set up alerts for unusual activity
3. Regularly rotate database passwords
4. Use database roles with minimal permissions

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check Atlas IP whitelist
2. **Authentication Failed**: Verify username/password
3. **Build Failures**: Check environment variables
4. **CORS Errors**: Verify FRONTEND_URL setting

### Debug Steps

1. Check application logs
2. Verify environment variables
3. Test database connection
4. Check network connectivity
5. Review Atlas connection logs

## Cost Optimization

### MongoDB Atlas

- Use M0 (free tier) for development
- Monitor data usage
- Set up billing alerts
- Consider data archiving strategies

### Deployment Platforms

- **Vercel**: Free tier for personal projects
- **Railway**: $5/month for hobby plan
- Monitor usage and costs regularly

## Scaling Considerations

### Database Scaling

1. **Vertical Scaling**: Upgrade cluster tier
2. **Horizontal Scaling**: Enable sharding
3. **Read Replicas**: For read-heavy workloads
4. **Indexing**: Optimize query performance

### Application Scaling

1. **Railway**: Auto-scaling available
2. **Vercel**: Serverless functions scale automatically
3. **Load Balancing**: Consider for high traffic
4. **CDN**: Vercel provides global CDN

---

For additional help, refer to the platform-specific documentation:
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
