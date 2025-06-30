# TikTok Affiliate Bot - Deployment Guide

## 🚀 Render Deployment Setup

Your TikTok affiliate bot is now ready for deployment on Render.com! Follow these steps to deploy your application.

### 1. Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Render.com account (free tier available)
- Your TikTok Business API credentials
- Your Google Gemini API key

### 2. Repository Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### 3. Render Deployment Steps

#### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Choose your repository and branch

#### Step 2: Configure Service Settings
- **Name**: `tiktok-affiliate-bot` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free tier or Starter ($7/month for always-on)

#### Step 3: Add Environment Variables
In the Render dashboard, add these environment variables:

**Required Variables:**
```
NODE_ENV=production
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_ADVERTISER_ID=your-tiktok-advertiser-id
GEMINI_API_KEY=your-gemini-api-key
```

**Auto-Generated Variables (Render will set these):**
```
DATABASE_URL=postgresql://...  (from PostgreSQL add-on)
JWT_SECRET=auto-generated-secure-key
WEBHOOK_SECRET=auto-generated-webhook-secret
```

**Fixed Redirect URI:**
```
TIKTOK_REDIRECT_URI=https://your-app-name.onrender.com/api/tiktok/callback
```

#### Step 4: Add PostgreSQL Database
1. Go to your service dashboard
2. Click "Add" → "PostgreSQL"
3. Choose the free tier
4. Name it `tiktok-affiliate-db`
5. Render will automatically set `DATABASE_URL`

### 4. TikTok Developer App Configuration

**IMPORTANT**: Update your TikTok Developer App settings:

1. Go to [TikTok for Business Developer Portal](https://ads.tiktok.com/marketing_api/homepage)
2. Find your app (ID: 7519035078651936769)
3. Update the **Redirect URI** to:
   ```
   https://your-app-name.onrender.com/api/tiktok/callback
   ```
4. Replace `your-app-name` with your actual Render service name

### 5. API Keys You'll Need

#### TikTok Business API
- **Client Key**: Already configured (7519035078651936769)
- **Client Secret**: Get from TikTok Developer Portal
- **Advertiser ID**: Already configured (7519829315018588178)

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it as `GEMINI_API_KEY` environment variable

### 6. Deployment Process

1. **Deploy**: Click "Create Web Service" in Render
2. **Wait**: Initial deployment takes 2-5 minutes
3. **Check Logs**: Monitor deployment progress in logs
4. **Test**: Visit your app URL when deployment completes

### 7. Post-Deployment Setup

#### Database Migration
Your app will automatically create database tables on first run. The PostgreSQL schema is handled by Drizzle ORM.

#### Health Check
Test your deployment:
```
GET https://your-app-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-06-30T...",
  "version": "1.0.0"
}
```

### 8. Configuration Files

The following files are already configured for Render deployment:

- ✅ `render.yaml` - Render service configuration
- ✅ `package.json` - Build and start scripts
- ✅ `.env.example` - Environment variables template
- ✅ Database schema and migrations

### 9. Free Tier Limitations

**Render Free Tier:**
- Apps sleep after 15 minutes of inactivity
- 750 hours/month (sufficient for development/testing)
- PostgreSQL database with 1GB storage

**Upgrade to Starter ($7/month) for:**
- Always-on service (no sleeping)
- Custom domains
- Better performance

### 10. Monitoring and Logs

**View Logs:**
```bash
# In Render dashboard:
Logs → View live logs
```

**Monitor Performance:**
- CPU and memory usage in Render dashboard
- Database connection status
- API response times

### 11. Troubleshooting

#### Common Issues:

**Build Fails:**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

**Database Connection Error:**
- Ensure PostgreSQL add-on is connected
- Check `DATABASE_URL` environment variable
- Verify database migrations ran successfully

**TikTok OAuth Error:**
- Confirm redirect URI matches exactly
- Check TikTok app configuration
- Verify client credentials are correct

**App Won't Start:**
- Check required environment variables
- Review start command in `package.json`
- Monitor startup logs for errors

### 12. Production Optimizations

Once deployed, consider these optimizations:

**Performance:**
- Enable CDN for static assets
- Set up Redis for session storage
- Configure database connection pooling

**Security:**
- Rotate JWT secrets regularly
- Enable HTTPS (automatic on Render)
- Set up monitoring and alerts

**Scaling:**
- Monitor resource usage
- Consider upgrading to higher tier plans
- Implement horizontal scaling if needed

---

## 🔗 Important URLs

After deployment, you'll have these URLs:

- **App URL**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/api/health`
- **TikTok OAuth**: `https://your-app-name.onrender.com/api/tiktok/auth/url`

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Review this deployment guide
3. Verify all environment variables
4. Test API endpoints individually

Your TikTok affiliate bot is production-ready and optimized for Render deployment! 🎉