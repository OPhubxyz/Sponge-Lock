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

## Run locally
Open `index.html` in a modern browser. No build step or dependencies are required.

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
