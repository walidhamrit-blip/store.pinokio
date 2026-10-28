// Deploy the storefront to Cloudflare Workers.
//
// The build produces a Worker bundle (dist/store/index.js) plus static assets
// (dist/client), and `wrangler deploy` uploads both: the Worker serves the API
// and the assets binding serves the store, with SPA fallback for the routes.
//
// Authentication: run `npx wrangler login` once (or set CLOUDFLARE_API_TOKEN
// and CLOUDFLARE_ACCOUNT_ID) inside app/ before using this menu item. If you
// are not logged in yet, the first run prints the login URL — click it, come
// back, and run Deploy again.
module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "npm run build"
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "npx wrangler deploy"
      }
    },
    {
      method: "notify",
      params: {
        html: "Deployed. Open the workers.dev URL printed in the log above (it looks like https://store.<your-subdomain>.workers.dev).",
        href: "https://dash.cloudflare.com/?to=/:account/workers-and-pages"
      }
    }
  ]
}
