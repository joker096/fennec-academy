# 🛡️ Admin Panel Guide (PolyglotPro)

This guide explains how to use the administrative interface to manage the application, users, and advertisements.

## 1. Accessing the Admin Panel

### URL
The admin panel is accessible at the following route:
`https://your-app-url.run.app/admin`

### Permissions
*   **Role Requirement:** Your user account must have the `admin` role in the database.
*   **Default Admin:** The email `zaartyom@gmail.com` is configured as the primary administrator in the security rules (`firestore.rules`). If you are logged in with this email, you will have full access.
*   **Sidebar Link:** Once logged in as an admin, a "Admin Panel" link will appear in the sidebar navigation.

---

## 2. Managing Advertisements

The application supports three main ad placements. You can insert any HTML/JavaScript code (e.g., Google AdSense, Yandex Advertising Network).

### How to insert ads:
1.  Go to the **Settings** tab in the Admin Panel.
2.  Locate the **Ad Placements** section.
3.  Paste your ad snippets into the corresponding fields:
    *   **Header Ad Code:** Appears at the top of the page (managed via `ScriptInjector`).
    *   **Sidebar Ad Code:** Appears in the sidebar or inline components (managed via `AdBanner`).
    *   **Footer Ad Code:** Appears at the bottom of the page.
4.  Click **Save Configuration** at the top of the page to apply changes.

*Note: Ads are automatically hidden for users with "Premium" status.*

---

## 3. Global Settings & Maintenance

*   **Maintenance Mode:** Toggle this to prevent non-admin users from using the app. You can customize the message they see.
*   **Analytics:** Enter your **Google Analytics ID** or **Yandex Metrica ID** to enable tracking.
*   **Custom Scripts:** Add any additional `<script>` tags (e.g., for support chats or custom tracking) that should be injected into the page.

---

## 4. User Management

The **Users** tab allows you to:
*   **Search:** Find users by Name or Email.
*   **Edit Roles:** Promote users to `admin` or demote them to `user`.
*   **Premium Status:** Manually grant or revoke Premium access.
*   **Ban/Unban:** Restrict access for specific users.
*   **Stats View:** See a user's XP, Level, and currency (Caps).

---

## 5. Analytics & Reports

*   **Dashboard Stats:** View real-time charts showing user growth, level distribution, and language preferences.
*   **Export Data:** Use the **Reports** tab to download a full CSV export of all users for external analysis.

---

## 6. Security Note

Access control is enforced at two levels:
1.  **Frontend:** The `/admin` route checks the `role` field in the user's profile.
2.  **Database (Firestore):** The `firestore.rules` file strictly allows `write` access to global settings and `list` access to users ONLY for accounts where `role == 'admin'`.

If you lose access, ensure your email is correctly set in the `isAdmin()` function within `firestore.rules`.
