# Deployment Guide

## Client Deployment (Vercel)

1. **Prepare Environment Variables**
   - Create `.env.production` in client directory with:
   ```
   VITE_API_URL=your_render_api_url
   ```

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Login to Vercel: `vercel login`
   - From the client directory, run: `vercel`
   - Follow the prompts to link your project
   - For production deployment: `vercel --prod`

3. **Configure Build Settings in Vercel Dashboard**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Server Deployment (Render)

1. **Prepare Your Server**
   - Update package.json to include proper start script:
   ```json
   "scripts": {
     "start": "node index.js"
   }
   ```
   - Ensure all environment variables are ready

2. **Create Database**
   - Create a MySQL database instance
   - Keep the database credentials ready
   - Run schema migrations from `db/schema.sql`

3. **Deploy to Render**
   - Sign up/Login to Render
   - Create a "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `golf-bookr-api`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Set environment variables:
       ```
       DB_HOST=your_mysql_host
       DB_USER=your_mysql_user
       DB_PASSWORD=your_mysql_password
       DB_NAME=your_database_name
       JWT_SECRET=your_jwt_secret
       GEMINI_API_KEY=your_gemini_api_key
       ```

4. **Configure CORS**
   - Add your Vercel domain to CORS configuration
   - Update `server/index.js` CORS settings

## GitHub Setup and Deployment

1. **Initialize Git Repository**
   ```bash
   git init
   ```

2. **Create GitHub Repository**
   - Go to GitHub.com and login
   - Click "New repository"
   - Name it "golf-bookr"
   - Keep it private if you prefer
   - Don't initialize with README (we already have one)

3. **Add Files to Git**
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

4. **Link to GitHub**
   ```bash
   git remote add origin https://github.com/your-username/golf-bookr.git
   git branch -M main
   git push -u origin main
   ```

5. **Update Repository Settings**
   - Go to repository Settings
   - Add collaborators if needed
   - Configure branch protection rules
   - Set up GitHub Actions if needed

6. **Recommended Git Workflow**
   ```bash
   # Create new feature branch
   git checkout -b feature/new-feature

   # Make changes and commit
   git add .
   git commit -m "Add new feature"

   # Push changes
   git push origin feature/new-feature

   # Merge to main
   git checkout main
   git pull origin main
   git merge feature/new-feature
   git push origin main
   ```

## Post-Deployment Steps

1. **Test API Connection**
   - Verify client can connect to server
   - Test authentication flow
   - Check file uploads
   - Validate database operations

2. **Set Up Monitoring**
   - Enable Render logs and metrics
   - Set up uptime monitoring
   - Configure error notifications

3. **Security Checklist**
   - [ ] SSL/HTTPS enabled
   - [ ] Environment variables secured
   - [ ] API rate limiting configured
   - [ ] Database backups scheduled
   - [ ] CORS properly configured
   - [ ] Security headers set

## Troubleshooting

Common issues and solutions:
1. **CORS Errors**
   - Verify CORS configuration includes Vercel domain
   - Check for proper protocol (https)

2. **Database Connection Issues**
   - Verify database credentials
   - Check IP allowlist
   - Confirm connection string format

3. **File Upload Problems**
   - Verify upload directory permissions
   - Check file size limits
   - Confirm proper multer configuration

## Useful Commands

```bash
# Deploy client
vercel
vercel --prod

# Check server logs on Render
render logs

# Monitor server status
render status
```
