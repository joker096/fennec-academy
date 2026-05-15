# Security Specification for Wasteland Learning App

## 1. Data Invariants
- A user profile must always have a `uid` and `email`.
- `xp`, `caps`, `hp`, `hunger`, `thirst` must be non-negative.
- `role` can only be set to `admin` by an existing admin.
- `lastUpdated` and `createdAt` must be server-validated timestamps.
- Flashcard and mistake maps must be objects.

## 2. The "Dirty Dozen" Payloads (Anti-Patterns)

1. **Identity Spoofing**: Attempt to change `uid` of a document.
   ```json
   { "uid": "attacker_id", "email": "user@example.com" }
   ```
2. **Privilege Escalation**: Attempt to set `role` to `admin` during profile creation.
   ```json
   { "uid": "user_id", "email": "user@example.com", "role": "admin" }
   ```
3. **Shadow Field Injection**: Injecting a hidden field `isBanned` to bypass logic.
   ```json
   { "uid": "uid", "email": "e", "isBanned": false }
   ```
4. **Denial of Wallet (ID Injection)**: Creating a user document with a 1MB random string as ID.
5. **Denial of Wallet (Value Poisoning)**: Setting `displayName` to a 1MB string.
   ```json
   { "displayName": "A".repeat(1024 * 1024) }
   ```
6. **State Shortcutting**: Directly unlocking all perks without XP.
7. **Type Confusion**: Setting `xp` to a string instead of an integer.
   ```json
   { "xp": "lots" }
   ```
8. **Relational Sync Breakage**: Updating `leaderboard` with fake XP that doesn't match the user profile.
9. **Timestamp Forgery**: Providing a client-side `lastUpdated` in the past.
10. **Terminal State Lock-out**: Attempting to edit a user account after it's been marked `banned`.
11. **Email Verification Bypass**: Accessing admin features with an unverified email (if spoofed).
12. **PII Leakage**: Authenticated user trying to `get` another user's profile with personal email.

## 3. Test Runner Design
I will generate `firestore.rules.test.ts` to verify these constraints.

---

### Implementation Plan

I will fix the `hasOnly` issue and harden the rules using the mandated patterns:
- Standalone `isValidUserProfile` helper.
- `affectedKeys().hasOnly()` for updates.
- Server timestamp validation.
- `isAdmin()` verification.
- Size constraints on all strings.
