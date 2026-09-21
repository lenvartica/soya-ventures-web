# Soya Ventures - Deployment Guide

Complete guide for deploying Soya Ventures to production environments.

## 🎯 Quick Deployment Options

### Option 1: Vercel (Recommended for Next.js)
### Option 2: DigitalOcean / AWS / Google Cloud
### Option 3: Docker Container
### Option 4: Traditional VPS

---

## 📦 Option 1: Vercel Deployment

### Prerequisites
- Vercel account
- GitHub account
- PostgreSQL database (Vercel Postgres, Supabase, or Neon)

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/soya-ventures.git
git push -u origin main
```

2. **Connect to Vercel**
- Visit [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repository
- Configure project settings

3. **Environment Variables**
Add in Vercel dashboard:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=production
```

4. **Deploy**
- Click "Deploy"
- Vercel will build and deploy automatically
- Database migrations run via `npm run db:push`

5. **Post-Deployment**
```bash
# Seed production database (one-time)
vercel env pull .env.production.local
npm run db:seed
```

### Vercel Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🌊 Option 2: DigitalOcean Deployment

### Prerequisites
- DigitalOcean account
- Domain name (optional)
- Basic server management knowledge

### Setup Droplet

1. **Create Droplet**
- OS: Ubuntu 22.04 LTS
- Plan: Basic ($6/mo minimum)
- Choose datacenter region
- Add SSH keys

2. **Connect to Server**
```bash
ssh root@your-server-ip
```

3. **Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

4. **Setup PostgreSQL**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE soya_ventures;
CREATE USER soya_user WITH PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE soya_ventures TO soya_user;
\q
```

5. **Deploy Application**
```bash
# Create application directory
mkdir -p /var/www/soya-ventures
cd /var/www/soya-ventures

# Clone repository
git clone https://github.com/yourusername/soya-ventures.git .

# Install dependencies
npm install

# Create .env file
nano .env
```

Add to `.env`:
```
DATABASE_URL=postgresql://soya_user:strong-password@localhost:5432/soya_ventures
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=production
```

```bash
# Push database schema
npm run db:push

# Seed database
npm run db:seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "soya-ventures" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx**
```bash
nano /etc/nginx/sites-available/soya-ventures
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/soya-ventures /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🐳 Option 3: Docker Deployment

### Dockerfile
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=soya_user
      - POSTGRES_PASSWORD=strong-password
      - POSTGRES_DB=soya_ventures
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:push

# Seed database
docker-compose exec app npm run db:seed

# View logs
docker-compose logs -f app
```

---

## 🔧 Option 4: Traditional VPS (Ubuntu)

### Complete Setup Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting Soya Ventures Deployment${NC}"

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
echo "Setting up database..."
sudo -u postgres psql <<EOF
CREATE DATABASE soya_ventures;
CREATE USER soya_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE soya_ventures TO soya_user;
EOF

# Setup application
echo "Setting up application..."
cd /var/www
git clone https://github.com/yourusername/soya-ventures.git
cd soya-ventures

# Install dependencies
npm install

# Setup environment
cat > .env <<EOF
DATABASE_URL=postgresql://soya_user:CHANGE_THIS_PASSWORD@localhost:5432/soya_ventures
JWT_SECRET=CHANGE_THIS_SECRET_KEY
NODE_ENV=production
EOF

# Build and start
npm run db:push
npm run build
pm2 start npm --name "soya-ventures" -- start
pm2 save
pm2 startup

echo -e "${GREEN}Deployment complete!${NC}"
echo "Next steps:"
echo "1. Configure Nginx"
echo "2. Setup SSL certificate"
echo "3. Configure firewall"
```

---

## 🔒 Production Security Checklist

### Environment Variables
- [ ] Strong JWT_SECRET (minimum 32 characters)
- [ ] Secure DATABASE_URL
- [ ] Never commit .env files
- [ ] Use environment variable management (Vercel, Doppler, etc.)

### Database
- [ ] Strong database password
- [ ] Enable SSL for database connections
- [ ] Regular backups scheduled
- [ ] Limit database access by IP
- [ ] Use connection pooling

### Application
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Set up monitoring
- [ ] Configure error logging
- [ ] Regular security updates

### Server (if self-hosted)
- [ ] Configure firewall (UFW)
- [ ] Disable root login
- [ ] Use SSH keys only
- [ ] Keep system updated
- [ ] Monitor server resources
- [ ] Set up fail2ban
- [ ] Regular security audits

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring:**
```bash
pm2 monit                    # Real-time monitoring
pm2 logs soya-ventures      # View logs
pm2 restart soya-ventures   # Restart app
pm2 status                  # Check status
```

**Log Management:**
```bash
# Install pm2-logrotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Backups

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/soya-ventures"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${DATE}.sql"

mkdir -p $BACKUP_DIR

pg_dump -U soya_user soya_ventures > $BACKUP_DIR/$FILENAME

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: $FILENAME"
```

**Schedule with Cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Performance Monitoring

**New Relic / DataDog:**
```bash
npm install newrelic
```

**Self-hosted with Prometheus:**
```bash
npm install prom-client
```

---

## 🔄 Continuous Deployment

### GitHub Actions

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
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🚨 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
# Or change port
PORT=3001 npm start
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U soya_user -d soya_ventures -h localhost
```

**Build failures:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**PM2 not starting:**
```bash
pm2 delete all
pm2 start npm --name "soya-ventures" -- start
pm2 save
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple application instances
- Shared PostgreSQL instance
- Redis for session storage
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use database read replicas

---

## 📞 Support

Deployment support:
- Email: devops@soyaventures.com
- Documentation: https://docs.soyaventures.com/deployment
- Community: https://community.soyaventures.com

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0
