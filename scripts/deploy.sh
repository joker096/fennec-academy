#!/bin/bash
# Deployment script for Fennec Academy

echo "🚀 Starting deployment process..."

# 1. Build the application
echo "📦 Building production bundle..."
npm run build

# 2. Deployment to Firebase (if configured)
if [ -f "firebase.json" ]; then
  echo "🔥 Deploying to Firebase..."
  firebase deploy
else
  echo "⚠️ Firebase not configured. Skipping Firebase deploy."
fi

# 3. Check for assets
echo "🎨 Verifying marketing assets..."
if [ -f "public/logo.svg" ] && [ -f "public/perks/ammosmith-1.jpg" ]; then
  echo "✅ Core assets found."
else
  echo "❌ Missing core assets! Check public/ folder."
fi

echo "✨ Deployment preparations complete!"
