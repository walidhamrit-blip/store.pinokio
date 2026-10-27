// Update the launcher and the app.
//
// When this folder was installed from a git remote, pull the latest scripts and
// app source. The git pull is guarded because a launcher that was created
// locally is not a git checkout yet. Re-running install afterwards brings the
// dependencies in line with package.json.
module.exports = {
  run: [
    {
      when: "{{exists('.git')}}",
      method: "shell.run",
      params: {
        message: "git pull --ff-only"
      }
    },
    {
      method: "script.start",
      params: {
        uri: "install.js"
      }
    }
  ]
}
