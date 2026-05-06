# 🚀 Railway Deployment Guide for Team Task Manager

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code is already at https://github.com/sailajakolliboina/Task-manager
3. **Payment Method**: Railway requires a payment method for deployment

## 🚀 Step-by-Step Deployment

### Step 1: Connect GitHub to Railway

1. Go to [railway.app](https://railway.app) and login
2. Click **"New Project"** or **"Deploy from Git repo"**
3. Choose **"GitHub"** as the source
4. Click **"Connect GitHub"**
5. Authorize Railway to access your GitHub account
6. Select your **Task Manager repository**: `sailajakolliboina/Task-manager`
7. Click **"Deploy"**

### Step 2: Configure Environment Variables

1. Once deployed, go to your Railway dashboard
2. Click on your project
3. Go to **"Variables"** tab
4. Add these environment variables:

#### Backend Environment Variables:
```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-app-url.railway.app
JWT_SECRET=your-secure-jwt-secret-key-here
DATABASE_URL=postgresql://postgres:password@host:port/database
```

#### Frontend Environment Variables:
```
VITE_API_URL=https://your-app-url.railway.app/api
```

### Step 3: Configure Database

1. Go to **"Add-ons"** tab in Railway
2. Click **"PostgreSQL"**
3. Choose a plan (free tier is available)
4. Set up database connection

### Step 4: Deploy Settings

1. In your project settings, configure:
   - **Build Command**: `cd backend && npm install && npm start`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
   - **Node Version**: `18.x` or `20.x`

2. For frontend deployment (separate service):
   - **Build Command**: `cd frontend && npm run build`
   - **Start Command**: `npm run preview`
   - **Root Directory**: `frontend`
   - **Node Version**: `18.x` or `20.x`

### Step 5: Deploy

1. Click **"Deploy"** button
2. Railway will build and deploy your application
3. Wait for deployment to complete (usually 2-5 minutes)

## 🔧 Important Notes

### Database Migration
Since you're using Prisma, you'll need to run:
```bash
npx prisma migrate deploy
```

### In-Memory Storage
Your current code uses in-memory storage for development. For production, you'll want to:
1. Keep the in-memory storage as a fallback
2. Or update to use PostgreSQL fully
3. The in-memory storage will work fine for Railway deployment

### Environment Variables Security
- Never commit sensitive data like `JWT_SECRET` to your repository
- Use Railway's environment variables for all secrets
- Generate a strong JWT secret for production

## 🌐 Expected Live URL

After deployment, your application will be available at:
- **Backend**: `https://your-app-name.railway.app/api`
- **Frontend**: `https://your-app-name.railway.app`

## 📱 Testing Your Live Application

1. **Test authentication**: Create account and login
2. **Test project creation**: Create and manage projects
3. **Test task management**: Create and assign tasks
4. **Test dashboard**: Verify statistics display correctly
5. **Test responsive design**: Check on mobile devices

## 🆘 Troubleshooting

### Common Issues:
- **Build failures**: Check package.json scripts
- **Database connection**: Verify DATABASE_URL format
- **CORS errors**: Ensure CLIENT_URL is correct
- **404 errors**: Check build and deployment settings

### Railway Documentation:
- [Railway Docs](https://docs.railway.app/)
- [GitHub Integration Guide](https://docs.railway.app/deploy/github-deployment)

## 🎯 Quick Start Commands

If you want to deploy right now, you can also use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy your project
railway up
```

This will automatically detect your project and deploy it to Railway.

## 📞 Support

- **Railway Support**: support@railway.app
- **Documentation**: https://docs.railway.app/
- **Community**: https://discord.gg/railway

---

**Your Team Task Manager is ready for production deployment!** 🚀
