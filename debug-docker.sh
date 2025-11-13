#!/bin/bash

echo "🐳 LSBA Docker Build Debug Script"
echo "================================="

# Test 1: Build with current Dockerfile
echo ""
echo "📋 Test 1: Testing current Dockerfile..."
if docker build -t lsba-test-1 . --no-cache; then
    echo "✅ Current Dockerfile works!"
else
    echo "❌ Current Dockerfile failed"
fi

# Test 2: Build with debug Dockerfile  
echo ""
echo "📋 Test 2: Testing debug Dockerfile..."
if docker build -f Dockerfile.debug -t lsba-test-2 . --no-cache; then
    echo "✅ Debug Dockerfile works!"
else
    echo "❌ Debug Dockerfile failed"
fi

# Test 3: Check if local build works
echo ""
echo "📋 Test 3: Testing local build..."
if npm run build; then
    echo "✅ Local build works!"
else
    echo "❌ Local build failed"
fi

# Test 4: Check dependencies
echo ""
echo "📋 Test 4: Checking Vite plugin dependency..."
if npm list @vitejs/plugin-react-swc; then
    echo "✅ Vite plugin found locally"
else
    echo "❌ Vite plugin missing locally"
fi

echo ""
echo "🎯 Summary:"
echo "- If local build works but Docker fails: Docker dependency issue"
echo "- If both fail: Source code issue"
echo "- If debug Dockerfile works: Use that one"

echo ""
echo "💡 Quick fixes to try:"
echo "1. Use Dockerfile.debug (most verbose)"
echo "2. Clear Docker cache: docker system prune -a"
echo "3. For cloud deployment: Use Vercel/Netlify (no Docker needed)"