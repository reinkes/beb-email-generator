# 🚀 Deployment Guide

This project supports multiple automated deployment options through GitHub Actions. Choose the method that best fits your hosting provider.

## 🎯 Quick Setup Options

### Option 1: GitHub Pages (FREE & EASIEST)
Perfect for static sites, completely free.

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Click "Save"

2. **Configure Secrets** (if not using default GITHUB_TOKEN):
   - Go to Settings → Secrets and variables → Actions
   - Add secret: `GITHUB_TOKEN` with your personal access token

**Result**: Your site will be available at `https://yourusername.github.io/beb-email-generator`

### Option 2: FTP Deployment
For traditional web hosting with FTP access.

**Required Secrets**:
```bash
FTP_HOST=your-server.com
FTP_USER=your-username
FTP_PASSWORD=your-password
FTP_PATH=/public_html  # or your web directory
```

### Option 3: Netlify
For modern JAMstack hosting with CDN.

**Required Secrets**:
```bash
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-auth-token
```

### Option 4: Vercel
For serverless deployment with automatic previews.

**Required Secrets**:
```bash
VERCEL_TOKEN=your-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

## 🔧 Setup Instructions

### 1. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Click "New repository secret" and add the secrets for your chosen deployment method.

### 2. Deployment Triggers

Deployments happen automatically when:
- ✅ Code is pushed to `main` branch
- ✅ All tests pass
- ✅ Accessibility and performance checks complete

### 3. Multiple Deployment Targets

You can configure multiple deployment targets simultaneously:
- **GitHub Pages**: Free backup/mirror site
- **FTP**: Your main production server
- **Netlify/Vercel**: CDN and preview deployments

## 📋 Deployment Checklist

Before setting up deployment:

- [ ] **Tests Pass**: Ensure CI pipeline is green
- [ ] **Domain Ready**: Configure your domain/subdomain
- [ ] **Secrets Added**: Add required secrets to GitHub
- [ ] **Permissions**: Ensure GitHub Actions has necessary permissions

## 🌐 Hosting Provider Examples

### Traditional Web Hosting (FTP)
```bash
# Common providers: HostGator, Bluehost, SiteGround
FTP_HOST=ftp.yourdomain.com
FTP_USER=your-username
FTP_PASSWORD=your-password
FTP_PATH=/public_html
```

### Netlify Setup
1. Create account at netlify.com
2. Create new site from Git (optional)
3. Get Site ID from Site settings → General
4. Generate Personal Access Token in User settings

### Vercel Setup
1. Create account at vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel login` and `vercel link`
4. Get tokens from dashboard settings

### GitHub Pages Setup
1. Enable Pages in repository settings
2. Choose `gh-pages` branch as source
3. Optionally configure custom domain

## 🔍 Deployment Monitoring

### View Deployment Status
- **GitHub Actions**: Check the "Actions" tab in your repository
- **Deployment logs**: Click on workflow runs for detailed logs
- **Status badges**: Add badges to README for deployment status

### Deployment Info
Each deployment creates a `deployment-info.json` file with:
```json
{
  "version": "20250114-143022",
  "commit": "abc123...",
  "branch": "main",
  "timestamp": "2025-01-14T14:30:22Z",
  "build_number": "42"
}
```

## 🚨 Troubleshooting

### Common Issues

**Deployment fails with "No secrets configured"**
- Solution: Add required secrets in GitHub repository settings

**FTP connection timeout**
- Check FTP_HOST, FTP_USER, FTP_PASSWORD are correct
- Verify FTP_PATH exists on server
- Some providers require SFTP instead of FTP

**GitHub Pages not updating**
- Check if gh-pages branch was created
- Verify GitHub Pages is enabled in repository settings
- DNS changes can take up to 24 hours

**Tests failing before deployment**
- Fix CI pipeline errors first
- Deployment only runs after all tests pass

### Debug Deployment

1. **Check Action Logs**: Go to Actions tab → Click failed workflow
2. **Verify Secrets**: Ensure all required secrets are set
3. **Test Locally**: Run deployment steps manually
4. **Contact Support**: GitHub, Netlify, Vercel have excellent support

## 📊 Performance Monitoring

After deployment, monitor:
- **Load times**: Use Google PageSpeed Insights
- **Uptime**: Set up monitoring with UptimeRobot
- **Analytics**: Add Google Analytics or similar
- **Error tracking**: Monitor browser console errors

## 🔒 Security Considerations

- **Never commit secrets**: Use GitHub secrets only
- **Use HTTPS**: All deployment targets support SSL
- **Regular updates**: Keep deployment scripts updated
- **Access control**: Limit who can modify deployment secrets

---

## 🎉 Quick Start for Your Current Setup

Since you're currently uploading manually to a server, I recommend:

1. **Start with GitHub Pages** (free, immediate)
2. **Add FTP deployment** for your existing server
3. **Configure custom domain** to point to your preferred deployment

**Commands to get started:**
```bash
# Enable GitHub Pages deployment immediately
git push origin main  # This will trigger deployment

# Your site will be available at:
# https://reinkes.github.io/beb-email-generator
```

Need help with setup? Check the GitHub Actions logs or create an issue in the repository.