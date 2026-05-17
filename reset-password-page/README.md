# Password Reset Page

Standalone HTML page for Supabase password reset. Works independently from the main Fennec app.

## Why?

The Fennec app runs inside a Capacitor WebView where `window.location.origin` is `file://` or `capacitor://localhost`. Supabase rejects these origins for password reset redirects. We need a real hosted HTTPS page.

## Deploy to GitHub Pages (Free)

1. Create a **new public repository** on GitHub (e.g. `fennec-reset-password`)
2. Upload `index.html` from this folder to that repo
3. Enable GitHub Pages:
   - Go to repo **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / `master` → `/ (root)`
4. Your page will be at: `https://YOUR_USERNAME.github.io/fennec-reset-password`

## Update Fennec App

After deploying, update the redirect URL in `src/lib/auth.ts`:

```typescript
const redirectTo = 'https://YOUR_USERNAME.github.io/fennec-reset-password';
```

Then rebuild the web app and sync to Android:

```bash
npm run build
npx cap copy
```

## Alternative: Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Create a project → Upload `index.html`
3. You'll get a URL like `https://fennec-reset-password.pages.dev`
4. Use that URL as `redirectTo` in the app.
