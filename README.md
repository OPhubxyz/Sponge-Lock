# Sponge-Lock

A Roblox script access-management platform prototype with a clean charcoal-and-gold interface.

## PR1 — Add Code workspace (updated)

### Features
- Mobile-optimized navigation with a compact top brand bar and fixed bottom action dock
- Single **Add Code** workspace (legacy Overview, Scripts, Access Keys, Users, and Settings tabs removed from the UI)
- Paste Luau source into the editor or upload a `.lua` / `.luau` file (1 MB browser-side limit)
- Create a temporary browser Blob URL that serves the entered source as plain text
- Copy or open the generated temporary URL
- English / Vietnamese interface toggle
- Responsive editor layout

## Cloudflare setup (free tier)

1. Create a Cloudflare account and a D1 database named `sponge-lock-db`.
2. Copy the database ID into `worker/wrangler.toml`.
3. From the `worker` directory, apply the schema with `npx wrangler d1 execute sponge-lock-db --remote --file=./migrations/0001_init.sql`.
4. Set a long random secret: `npx wrangler secret put ADMIN_TOKEN` (use at least 24 characters; do not commit it).
5. Deploy the Worker: `npx wrangler deploy`.
6. Open `index.html`, enter the deployed Worker URL and the same admin token, then save a script.

The Worker creates permanent `/s/<uuid>` URLs and serves source as plain text with `nosniff` and a restrictive CSP. Script writes and the management list require the admin token. The token is entered in the page and is not saved to local storage. The public script URL is readable by anyone who has it; do not store secrets or private data in scripts.

## Run locally
Open `index.html` in a modern browser. No build step is required. Cloud saving requires the deployed Worker and D1 setup above.

## Important limitations
- The generated URL is a browser-local `blob:` URL, not a permanent hosted endpoint. It is temporary and only available in the browser session that created it.
- The URL returns source text; it is not a secure execution endpoint or a server-hosted script.
- No backend, database, user authentication, durable script storage, or real license-key validation is implemented.
- Uploaded files and pasted code are processed locally in the browser.

## Roadmap
1. Add Code workspace UI
2. Backend-managed script storage and durable URLs
3. Authentication and authorization for script access
4. License/key management API
5. Audit logging and integrations
