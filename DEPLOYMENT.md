# Backend Deployment Guide

Complete guide for deploying the Hospital Management System backend to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] MongoDB database is accessible
- [ ] Node.js v14+ installed on server
- [ ] SSL certificates obtained for HTTPS
- [ ] Frontend URL configured in CORS settings
- [ ] Email service configured (if needed)
- [ ] Payment gateway keys added (Razorpay)
- [ ] Database backups scheduled
- [ ] Monitoring tools set up
- [ ] Error logging configured

## 🚀 Deployment Options

### Option 1: Traditional Server Deployment (VPS/Dedicated Server)

#### Prerequisites
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm

# Install MongoDB (if self-hosted)
sudo apt install -y mongodb

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx
```

#### Setup

1. **Clone repository:**
```bash
cd /var/www
sudo git clone <repo-url> hospital-backend
cd hospital-backend
```

2. **Install dependencies:**
```bash
npm install --production
```

3. **Create production .env file:**
```bash
sudo cp .env.example .env
sudo nano .env
# Update all variables for production
```

4. **Start application with PM2:**
```bash
pm2 start server.js --name "hospital-backend" --env production
pm2 save
pm2 startup
```

5. **Configure Nginx reverse proxy:**

Create `/etc/nginx/sites-available/hospital-backend`:
```nginx
upstream hospital_backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    listen 80;
    server_name api.hospital.com;

    client_max_body_size 50M;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.hospital.com;

    ssl_certificate /etc/ssl/certs/api.hospital.com.crt;
    ssl_certificate_key /etc/ssl/private/api.hospital.com.key;

    client_max_body_size 50M;

    location / {
        proxy_pass http://hospital_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/hospital-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL certificates with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d api.hospital.com
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: hospital_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - hospital_network

  backend:
    build: .
    container_name: hospital_backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@mongodb:27017/hospital_management?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - hospital_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: hospital_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/ssl/certs:/etc/ssl/certs
      - /etc/ssl/private:/etc/ssl/private
    depends_on:
      - backend
    networks:
      - hospital_network
    restart: unless-stopped

volumes:
  mongodb_data:
  mongodb_config:

networks:
  hospital_network:
    driver: bridge
```

#### Deploy with Docker

```bash
# Build images
docker-compose build

# Create .env file for Docker
cp .env.example .env.docker
# Edit .env.docker with production values

# Start services
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Option 3: Heroku Deployment

1. **Install Heroku CLI:**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app:**
```bash
heroku create hospital-backend-prod
```

3. **Set environment variables:**
```bash
heroku config:set -a hospital-backend-prod \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/hospital_management?retryWrites=true&w=majority" \
  JWT_SECRET="your-super-secret-key" \
  JWT_REFRESH_SECRET="your-refresh-secret" \
  NODE_ENV="production" \
  FRONTEND_URL="https://hospital.com"
```

4. **Deploy:**
```bash
git push heroku main
```

5. **View logs:**
```bash
heroku logs -a hospital-backend-prod -t
```

### Option 4: AWS EC2 Deployment

1. **Launch EC2 instance:**
   - Choose Ubuntu 20.04 LTS AMI
   - Instance type: t3.medium (or larger)
   - Configure security group (open ports 22, 80, 443)
   - Create and download key pair

2. **Connect to instance:**
```bash
ssh -i your-key.pem ubuntu@ec2-instance-ip
```

3. **Setup instance:**
```bash
# Follow Traditional Server Deployment steps above
```

4. **Setup RDS for MongoDB (optional):**
   - Create MongoDB cluster in AWS Atlas
   - Update MONGODB_URI in .env

## 🔒 Security Hardening

### 1. Environment Variables
```bash
# Ensure .env file is not in git
echo ".env" >> .gitignore

# Restrict file permissions
chmod 600 .env
```

### 2. Firewall Configuration
```bash
# UFW firewall setup
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3. Database Security
```javascript
// MongoDB connection with authentication
const mongoURI = 'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority';
```

### 4. JWT Security
- Use strong, random JWT secrets (min 32 characters)
- Implement token rotation
- Set appropriate expiration times

### 5. Rate Limiting
Add to server.js:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Logging

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 save
```

### 2. Application Logging
Logs are stored in:
- `logs/requests.log` - All requests
- `logs/errors.log` - Errors only

### 3. Database Monitoring
- Monitor MongoDB Atlas dashboard
- Set up alerts for high connection counts
- Schedule regular backups

### 4. Uptime Monitoring
Use services like:
- UptimeRobot (free)
- New Relic (paid)
- Datadog (paid)

## 📈 Performance Optimization

### 1. Database Indexing
```javascript
// Add indexes in models
schema.index({ email: 1 });
schema.index({ patientId: 1 });
schema.index({ status: 1 });
```

### 2. Caching
```javascript
import redis from 'redis';

const redisClient = redis.createClient();

// Cache GET requests
app.get('/api/patients', async (req, res) => {
  const cacheKey = 'patients_list';
  const cachedData = await redisClient.get(cacheKey);
  
  if (cachedData) return res.json(JSON.parse(cachedData));
  
  // Fetch from DB and cache
  const data = await Patient.find();
  await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);
  res.json(data);
});
```

### 3. Load Balancing
Run multiple instances:
```bash
pm2 start server.js -i max --name "backend"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      run: |
        mkdir -p ~/.ssh
        echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
        chmod 600 ~/.ssh/deploy_key
        ssh -i ~/.ssh/deploy_key user@server.com "cd /var/www/hospital-backend && git pull && npm install && pm2 restart hospital-backend"
```

## 🔧 Maintenance

### Regular Backups
```bash
# MongoDB backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/hospital_management" --out backup_$(date +%Y%m%d)
```

### Database Optimization
```bash
# Run monthly
db.collection.reIndex()
```

### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Configure in /etc/logrotate.d/hospital-backend
/var/www/hospital-backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

## 🆘 Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs hospital-backend

# Check port
lsof -i :5000

# Check MongoDB connection
mongosh --uri "your_mongodb_uri"
```

### High memory usage
```bash
# Restart service
pm2 restart hospital-backend

# Check memory leaks
node --inspect server.js
```

### Database connection issues
- Verify MongoDB URI
- Check firewall rules
- Test connectivity from server
- Verify credentials

## 📞 Production Support

For production issues:
1. Check PM2 logs: `pm2 logs`
2. Check application logs: `cat logs/errors.log`
3. Check server resources: `top`, `df -h`
4. Check network: `netstat -an`
5. Contact support team

---

**Last Updated:** January 2024
**Version:** 1.0.0
