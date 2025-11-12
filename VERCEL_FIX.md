# 🔧 Vercel 404 Fix Instructions

## Quick Fix Steps:

### 1. Update Your Vercel Project Settings
In your Vercel dashboard:

**Build & Development Settings:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
- Add: `VITE_API_URL` = `https://your-railway-api-url.railway.app`

### 2. Re-deploy
```bash
git add .
git commit -m "Fix Vercel configuration"
git push origin main
```

Or trigger a new deployment in Vercel dashboard.

## Alternative: Simple Vercel Config

If still getting 404, try this minimal vercel.json:

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Common Issues & Solutions:

### Issue: Static files not loading
**Solution:** Ensure your build outputs to `dist` folder
- Check: `vite.config.ts` has correct build settings
- Verify: `npm run build` creates `dist/index.html`

### Issue: API calls failing  
**Solution:** Set environment variable
- In Vercel: Add `VITE_API_URL=https://your-api.railway.app`
- Redeploy after adding the variable

### Issue: Routing problems (404 on refresh)
**Solution:** The vercel.json should handle SPA routing
- All routes should redirect to `/index.html`

## Test Your Build Locally:
```bash
npm run build
npm run preview
```
Open http://localhost:4173 - should work perfectly

## Vercel Deployment Checklist:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`  
- ✅ Output Directory: `dist`
- ✅ Environment Variable: `VITE_API_URL` set
- ✅ vercel.json handles SPA routing
- ✅ Build succeeds locally with `npm run build`

## If Still Having Issues:
1. Check Vercel build logs for errors
2. Ensure Railway API is deployed and working
3. Test API endpoint: `https://your-api.railway.app/health`
4. Verify build directory contains `index.html` and assets

Your LSBA app should load correctly after these fixes! 🎉