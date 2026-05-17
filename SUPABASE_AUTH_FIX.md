# Fix Supabase Auth Redirect URL

## Problem
APK code already uses `https://joker096.github.io/fennec-reset-password/`, but Supabase Dashboard still has the old `sud.cvr.name` configured as the Site URL.

## Verification (already done)
- ✅ `src/lib/auth.ts` uses `https://joker096.github.io/fennec-reset-password/`
- ✅ APK v1.0.16 contains the correct URL (verified via grep)
- ✅ GitHub Pages is live: https://joker096.github.io/fennec-reset-password/

## Solution Option 1: Supabase Dashboard (Manual)
1. Go to https://app.supabase.com/project/qhiietjvfuekfaehddox/auth/settings
2. Under **URL Configuration**:
   - Set **Site URL** to: `https://joker096.github.io/fennec-reset-password/`
   - Add to **Redirect URLs**:
     - `https://joker096.github.io/fennec-reset-password/*`
     - `capacitor://localhost`
     - `http://localhost:3000`
3. Click **Save**

## Solution Option 2: Management API (Script)
Get a Personal Access Token from https://app.supabase.com/account/tokens

Then run:
```bash
# Set your token
export SUPABASE_ACCESS_TOKEN="your-token-here"

# Run the update script
node scripts/update-supabase-redirect.js
```

Or via curl:
```bash
curl -X PATCH "https://api.supabase.com/v1/projects/qhiietjvfuekfaehddox/auth/config" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://joker096.github.io/fennec-reset-password/",
    "additional_redirect_urls": [
      "https://joker096.github.io/fennec-reset-password/*",
      "capacitor://localhost",
      "http://localhost:3000"
    ]
  }'
```

## Note
If the email still redirects to sud.cvr.name after updating, also check:
- **Authentication → Email Templates → Recovery Email** - ensure it uses `{{ .RedirectTo }}` or `{{ .ConfirmationURL }}`
- Clear browser/app cache and test with a fresh password reset request
