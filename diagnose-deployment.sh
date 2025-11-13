#!/bin/bash

echo "🚨 CANNOT GET / - Deployment Diagnosis Script"
echo "=============================================="

# Check if build works locally
echo ""
echo "📋 Step 1: Testing Local Build..."
if npm run build > build.log 2>&1; then
    echo "✅ Build successful!"
    echo "📁 Build files:"
    ls -la dist/
    echo ""
    echo "📄 Index.html exists:" 
    [ -f dist/index.html ] && echo "✅ Yes" || echo "❌ No"
    echo ""
    echo "💾 Total build size:"
    du -sh dist/
else
    echo "❌ Build failed! Check build.log"
    exit 1
fi

# Test local preview
echo ""
echo "📋 Step 2: Testing Local Preview..."
echo "🔄 Starting preview server (5 seconds)..."
npm run preview &
PREVIEW_PID=$!
sleep 5

# Test if preview works
if curl -s http://localhost:4173 > /dev/null; then
    echo "✅ Local preview works!"
    echo "🌐 Test it: http://localhost:4173"
else
    echo "❌ Local preview failed"
fi

# Kill preview server
kill $PREVIEW_PID 2>/dev/null

echo ""
echo "📋 Step 3: Deployment Platform Check..."
echo ""
echo "🎯 For VERCEL:"
echo "   Framework: Vite"
echo "   Build Command: npm run build"
echo "   Output Directory: dist" 
echo "   Root Directory: (leave empty)"
echo ""
echo "🎯 For NETLIFY:"
echo "   Build command: npm run build"
echo "   Publish directory: dist"
echo "   Base directory: (leave empty)"
echo ""

echo "📋 Step 4: Common Issues & Solutions..."
echo ""
echo "❌ 'Cannot GET /' usually means:"
echo "   1. Wrong output directory (should be 'dist')"
echo "   2. Build failed (check platform build logs)"
echo "   3. Wrong framework preset"
echo "   4. Deployed server code instead of frontend"
echo ""
echo "✅ Quick fixes:"
echo "   1. Clear deployment cache and rebuild"
echo "   2. Check build logs for errors"
echo "   3. Verify dist/ folder is deployed"
echo "   4. Try different platform (Vercel vs Netlify)"
echo ""

echo "📋 Step 5: File Check..."
echo "Your dist/index.html content:"
head -10 dist/index.html
echo ""

echo "🚀 READY TO DEPLOY!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel or Netlify with above settings"
echo "2. Check build logs if it fails"
echo "3. Share the live URL for boxing organizations to use!"
echo ""
echo "Your LSBA app is ready for global boxing management! 🥊"