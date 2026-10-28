// The launcher menu.
//
// The menu is generated on the fly from the current state: installing,
// updating, resetting, running, or idle. Once the server is running, start.js
// has set the `url` local variable, which becomes the "Open Web UI" button.
module.exports = {
  version: "8.0.0",
  menu: async (kernel, info) => {
    for (const [script, text] of [["install", "Installing"], ["update", "Updating"], ["reset", "Resetting"]]) {
      if (info.running(`${script}.js`)) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text,
          href: `${script}.js`
        }]
      }
    }
    if (info.running("start.js")) {
      const local = info.local("start.js")
      return local && local.url ? [{
        default: true,
        icon: "fa-solid fa-rocket",
        text: "Open Web UI",
        href: local.url,
        popout: true
      }, {
        icon: "fa-solid fa-terminal",
        text: "Terminal",
        href: "start.js"
      }] : [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Terminal",
        href: "start.js"
      }]
    }
    if (!info.exists("app/.installed")) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js"
      }]
    }
    return [{
      default: true,
      icon: "fa-solid fa-power-off",
      text: "Start",
      href: "start.js"
    }, {
      icon: "fa-solid fa-cloud-arrow-up",
      text: "Deploy to Cloudflare",
      href: "deploy.js",
      confirm: "Build the storefront and upload it to Cloudflare Workers? Run `npx wrangler login` in app/ first if you have not signed in."
    }, {
      icon: "fa-solid fa-rotate",
      text: "Update",
      href: "update.js"
    }, {
      icon: "fa-solid fa-plug",
      text: "Reinstall",
      href: "install.js"
    }, {
      icon: "fa-regular fa-circle-xmark",
      text: "Reset",
      href: "reset.js",
      confirm: "Remove the installed node modules and build output? The storefront source in app/ is kept."
    }]
  }
}
