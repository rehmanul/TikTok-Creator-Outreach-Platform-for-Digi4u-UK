# GitHub Webhook Setup Guide

## Overview

Your TikTok affiliate bot now supports GitHub webhooks for automated deployments and repository event handling.

## 📋 GitHub Webhook Configuration

### Step 1: Access Repository Settings
1. Go to your GitHub repository
2. Click **Settings** tab
3. Select **Webhooks** from the left sidebar
4. Click **Add webhook**

### Step 2: Configure Webhook Settings

Fill in the webhook form with these exact settings:

#### Payload URL
```
https://your-app-name.onrender.com/api/webhooks/github
```
Replace `your-app-name` with your actual Render service name.

#### Content Type
- Select: **application/json**

#### Secret
Use your webhook secret from environment variables:
```
your-webhook-secret
```
**Important**: This must match your `WEBHOOK_SECRET` environment variable in Render.

#### SSL Verification
- Select: **Enable SSL verification**

#### Events to Trigger Webhook

Choose based on your needs:

**Option 1: Just Push Events (Recommended)**
- Select: **Just the push event**
- Triggers: Auto-deployment on main branch pushes

**Option 2: Custom Events**
- Select: **Let me select individual events**
- Check these events:
  - ✅ **Pushes** - Code deployments
  - ✅ **Pull requests** - Code review workflow
  - ✅ **Releases** - Version releases
  - ✅ **Workflow runs** - GitHub Actions results

#### Active
- ✅ **Active** - Enable webhook delivery

### Step 3: Save Webhook
Click **Add webhook** to save the configuration.

## 🔧 Environment Variables Setup

Add this to your Render environment variables:

```bash
WEBHOOK_SECRET=your-webhook-secret-here
```

**How to generate a secure webhook secret:**
```bash
# Generate a random 32-character secret
openssl rand -hex 32
```

## 🚀 Webhook Events Handled

Your bot processes these GitHub events:

### 1. Push Events
**Triggers on**: Code pushes to main/master branch
**Action**: Logs deployment trigger (Render handles auto-deployment)

### 2. Pull Request Events
**Triggers on**: PR opened, updated, or synchronized
**Action**: Logs PR activity for monitoring

### 3. Release Events
**Triggers on**: New release published
**Action**: Logs version release for tracking

### 4. Workflow Run Events
**Triggers on**: GitHub Actions completed
**Action**: Logs CI/CD pipeline results

## 📊 Monitoring Webhook Delivery

### Check Webhook Status
1. Go to your repository **Settings** → **Webhooks**
2. Click on your webhook URL
3. View **Recent Deliveries** tab
4. Check response status (should be 200)

### Webhook Logs
Monitor webhook activity in your Render logs:
```bash
# In Render dashboard, view logs for entries like:
GitHub webhook received: push
Push to main branch detected - deployment will auto-trigger
```

## 🔒 Security Features

### Signature Verification
Your webhook endpoint verifies GitHub signatures using HMAC-SHA256:
```javascript
const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
```

### SSL/TLS
- All webhook traffic is encrypted via HTTPS
- SSL verification is enabled by default

## 🛠 Testing Your Webhook

### Manual Test
1. Push a commit to your main branch
2. Check Render logs for webhook activity
3. Verify deployment triggers automatically

### GitHub Test
1. Go to your webhook settings
2. Click **Recent Deliveries**
3. Click **Redeliver** on any delivery
4. Check response status and timing

## ⚙ Advanced Configuration

### Custom Branch Deployment
Modify webhook handler to deploy from different branches:
```javascript
// In server/routes/webhooks.ts
case 'push':
  if (ref === 'refs/heads/staging') {
    console.log('Staging branch push - trigger staging deployment');
  }
  break;
```

### Slack Notifications
Add Slack integration for deployment notifications:
```javascript
// Send notification to Slack when deployment completes
if (eventType === 'push' && ref === 'refs/heads/main') {
  await sendSlackNotification('🚀 Production deployment started');
}
```

## 🐛 Troubleshooting

### Webhook Not Triggering
1. **Check URL**: Ensure webhook URL is correct
2. **Verify SSL**: Make sure your Render app has valid SSL
3. **Check Secret**: Verify `WEBHOOK_SECRET` matches exactly
4. **Review Logs**: Check Render logs for error messages

### Response Errors
- **401 Unauthorized**: Secret mismatch or missing
- **404 Not Found**: Incorrect webhook URL
- **500 Server Error**: Check application logs

### Common Issues
```bash
# Invalid signature error
GitHub webhook: Invalid signature
# Solution: Check WEBHOOK_SECRET environment variable

# Webhook endpoint not found
Cannot POST /api/webhooks/github
# Solution: Verify webhook URL and routing
```

## 📝 Webhook Payload Examples

### Push Event
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "name": "tiktok-affiliate-bot",
    "full_name": "username/tiktok-affiliate-bot"
  },
  "commits": [...]
}
```

### Pull Request Event
```json
{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "title": "Add new feature",
    "head": { "ref": "feature-branch" }
  }
}
```

Your GitHub webhook is now configured for seamless CI/CD with automatic deployments on Render!