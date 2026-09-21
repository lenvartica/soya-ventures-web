#!/bin/bash

# Soya Ventures - Quick Start Script
# This script will set up and start your Soya Ventures platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   Soya Ventures - Quick Start Setup       ║"
echo "║   MLM & Referral Commerce Platform        ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (v$NODE_VERSION)${NC}"
    echo "Please upgrade to Node.js 18 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) found${NC}"

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found in PATH${NC}"
    echo "Make sure PostgreSQL is installed and running"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=soya-ventures-secret-key-change-in-production
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Push database schema
echo -e "${YELLOW}Setting up database schema...${NC}"
npm run db:push

echo -e "${GREEN}✓ Database schema created${NC}"

# Seed database
echo -e "${YELLOW}Seeding database with sample data...${NC}"
npm run db:seed

echo -e "${GREEN}✓ Database seeded successfully${NC}"

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

echo -e "${GREEN}✓ Application built successfully${NC}"

# Display success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Setup Complete! 🎉               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Open your browser to:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "3. Login with:"
echo ""
echo -e "   ${BLUE}Admin:${NC}"
echo -e "   Email: ${YELLOW}admin@soyaventures.com${NC}"
echo -e "   Password: ${YELLOW}Admin123!${NC}"
echo ""
echo -e "   ${BLUE}Test User:${NC}"
echo -e "   Email: ${YELLOW}user@soyaventures.com${NC}"
echo -e "   Password: ${YELLOW}User123!${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  • README.md - Project overview"
echo "  • SETUP_GUIDE.md - Detailed setup instructions"
echo "  • API_DOCUMENTATION.md - Complete API reference"
echo "  • DEPLOYMENT.md - Production deployment guide"
echo "  • FEATURES.md - Complete feature list"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

# Ask if user wants to start dev server
read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting development server...${NC}"
    npm run dev
fi
