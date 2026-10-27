// Install the storefront's dependencies.
//
// The app itself ships inside this launcher under app/, so nothing is cloned
// here. We only install the node modules with npm and mark the install as
// complete once that succeeds. The marker is removed first so an interrupted
// install never looks finished.
module.exports = {
  run: [
    {
      method: "fs.rm",
      params: {
        path: "app/.installed"
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "npm install"
      }
    },
    {
      method: "fs.write",
      params: {
        path: "app/.installed",
        text: "installed\n"
      }
    }
  ]
}
