// Remove everything the install step created.
//
// Unlike launchers that clone their app in install.js, this launcher ships the
// storefront inside app/, so app/ itself is never deleted. Only generated
// state is removed, which makes the next Install a true install from scratch.
module.exports = {
  run: [
    {
      method: "fs.rm",
      params: {
        path: "app/node_modules"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: "app/dist"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: "app/.wrangler"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: "app/.installed"
      }
    }
  ]
}
