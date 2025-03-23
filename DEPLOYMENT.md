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

## Database Setup on Render

1. **Create External MySQL Database**
   - Use a service like PlanetScale, Railway, or AWS RDS
   - Get connection details:
     ```
     DB_HOST=your-db-host
     DB_PORT=3306
     DB_USER=your-username
     DB_PASSWORD=your-password
     DB_NAME=your-database
     ```

2. **Test Database Connection**
   ```bash
   mysql -h your-db-host -u your-username -p
   ```

3. **Update Render Environment Variables**
   - Add these additional variables:
     ```
     DB_PORT=3306
     NODE_ENV=production
     ```

4. **Initialize Database**
   - Connect to your database
   - Run schema.sql:
     ```bash
     mysql -h your-db-host -u your-username -p your-database < server/db/schema.sql
     ```

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

## Updating Code on GitHub

1. **Check Status**
   ```bash
   git status  # See which files have changed
   ```

2. **Stage Changes**
   ```bash
   # Stage specific files
   git add filename1 filename2

   # Or stage all changes
   git add .
   ```

3. **Commit Changes**
   ```bash
   # Create a commit with a descriptive message
   git commit -m "Description of your changes"
   ```

4. **Pull Latest Changes**
   ```bash
   # Get latest changes from remote
   git pull origin main
   ```

5. **Push Updates**
   ```bash
   # Push your changes to GitHub
   git push origin main
   ```

6. **Best Practices**
   - Always pull before pushing to avoid conflicts
   - Use meaningful commit messages
   - Commit related changes together
   - Test code before pushing
   - Review your changes with `git diff` before committing

7. **Handling Merge Conflicts**
   ```bash
   # If you get conflicts, resolve them then:
   git add .
   git commit -m "Resolved merge conflicts"
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

## Running Server Locally with Deployed Client

1. **Local Server Setup**
   ```bash
   # In server directory
   npm install
   npm run dev
   ```

2. **Environment Setup**
   - Create `.env` in server directory:
   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=golf_bookr
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup**
   - Install MySQL locally
   - Create database and run schema:
   ```bash
   mysql -u root -p
   CREATE DATABASE golf_bookr;
   exit;
   mysql -u root -p golf_bookr < db/schema.sql
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

5. **Test Connection**
   - Visit http://localhost:3000/health
   - Should see database connection status

6. **Troubleshooting Local Setup**
   - Check MySQL is running
   - Verify database credentials
   - Ensure port 3000 is available
   - Check firewall settings

## Expose Local Server with ngrok

1. **Install ngrok**
   - Download ngrok from https://ngrok.com/download
   - Extract the zip file
   - Move ngrok.exe to `C:\Windows` or add its location to PATH
   - Open new terminal to apply PATH changes

2. **Configure ngrok**
   ```bash
   # Test ngrok is installed
   ngrok --version

   # Configure your authtoken
   ngrok config add-authtoken cr_2ug4UKmgFcCGs7rTV4I0tmm1jlo
   ```

3. **Start ngrok**
   ```bash
   # Make sure your server is running first
   cd server
   npm run dev

   # In a new terminal, start ngrok
   ngrok http 3000
   ```

4. **Update Vercel Environment Variables**
   - Copy the ngrok URL (e.g., https://xxxx-xx-xx-xxx-xx.ngrok.io)
   - Go to Vercel project settings
   - Update environment variable:
   ```
   VITE_API_URL=https://xxxx-xx-xx-xxx-xx.ngrok.io/api/v1
   ```

5. **Keep Terminal Open**
   - Keep the ngrok terminal window open while testing
   - The URL changes each time you restart ngrok
   - Consider upgrading to a paid plan for static URLs

6. **Verify Connection**
   - Test the health endpoint through ngrok URL
   - Test the client connection
   - Check CORS headers in browser dev tools

## Database Setup

1. **Schema Initialization**
   ```bash
   # Connect to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE golf_bookr;
   
   # Import schema
   mysql -u root -p golf_bookr < server/db/schema.sql
   ```

2. **Initial Data Setup**
   ```bash
   # Create admin user
   node server/scripts/createAdmin.js
   
   # Verify tables
   mysql -u root -p golf_bookr -e "SHOW TABLES;"
   ```

## Server Deployment

1. **Environment Variables**
   ```bash
   # Server .env
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=golf_bookr
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   CORS_ORIGIN=your_client_url
   ```

2. **WebSocket Setup**
   ```bash
   # Check port availability
   lsof -i :3000
   
   # Start server with WebSocket support
   npm run dev
   ```

3. **Real-time Features**
   - WebSocket connection for live booking updates
   - Chat system with database context refresh
   - Tee time availability monitoring

## Client Deployment

1. **Environment Setup**
   ```bash
   # Client .env
   VITE_API_URL=your_server_url
   VITE_WS_URL=your_websocket_url
   ```

2. **Build and Deploy**
   ```bash
   cd client
   npm run build
   ```

## Database Maintenance

1. **Regular Backups**
   ```bash
   # Backup database
   mysqldump -u root -p golf_bookr > backup.sql
   ```

2. **Index Management**
   ```sql
   -- Check index usage
   SHOW INDEX FROM tee_times;
   SHOW INDEX FROM bookings;
   ```

## Monitoring

1. **WebSocket Status**
   - Monitor client connections
   - Check real-time updates
   - Verify chat service status

2. **Database Performance**
   - Monitor tee time queries
   - Check booking transaction times
   - Verify connection pool status

## Troubleshooting

1. **Common Issues**
   - WebSocket connection failures
   - Database connection timeouts
   - Real-time update delays

2. **Solutions**
   - Restart WebSocket server
   - Check database connections
   - Clear expired chat sessions

## Health Checks

1. **API Endpoints**
   - /health for server status
   - /ws for WebSocket status
   - /chat/test for chat service

2. **Database Status**
   ```sql
   -- Check active connections
   SHOW PROCESSLIST;
   ```
