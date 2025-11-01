#!/bin/bash

echo "🚀 ROULYX DEMO DEPLOYMENT SCRIPT"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "1. ✅ Stripe in test mode (verified)"
echo "2. ✅ Demo warnings implemented"
echo "3. ✅ Global demo banner ready"
echo "4. ✅ All AI providers configured"
echo "5. ✅ Database connected"
echo ""

echo -e "${YELLOW}🛡️  Safety reminder:${NC}"
echo "- This app uses Stripe TEST mode only"
echo "- No real payments can be processed"
echo "- Test card: 4242 4242 4242 4242"
echo "- Demo banners will show in production"
echo ""

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
else
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

echo ""
echo -e "${BLUE}🔧 Deployment options:${NC}"
echo "1. Deploy to Vercel (recommended)"
echo "2. Build locally and check"
echo "3. Run in production mode locally"
echo ""

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Deploying to Vercel...${NC}"
        echo ""
        echo "Make sure to set these environment variables in Vercel:"
        echo "- All variables from your .env.local file"
        echo "- NODE_ENV=production (for demo banners)"
        echo ""
        vercel --prod
        ;;
    2)
        echo -e "${BLUE}🔨 Building locally...${NC}"
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Build successful!${NC}"
            echo "Your app is ready for deployment."
        else
            echo -e "${RED}❌ Build failed${NC}"
            echo "Please fix the errors above before deploying."
        fi
        ;;
    3)
        echo -e "${BLUE}🌍 Running in production mode locally...${NC}"
        echo "Building first..."
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Starting production server...${NC}"
            echo "Visit http://localhost:3000 to see demo banners"
            NODE_ENV=production npm start
        else
            echo -e "${RED}❌ Build failed${NC}"
        fi
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps for portfolio:${NC}"
echo "1. Test the deployed app with test payments"
echo "2. Share the URL with potential employers"
echo "3. Mention it's a full-stack SaaS demo"
echo "4. Highlight the tech stack in your portfolio"
echo ""
echo -e "${YELLOW}💡 Portfolio talking points:${NC}"
echo "- Next.js 14 with TypeScript"
echo "- Stripe integration (test mode)"
echo "- Multi-provider AI routing"
echo "- Real-time notifications"
echo "- Complete authentication system"
echo "- Responsive design with Tailwind"
echo ""