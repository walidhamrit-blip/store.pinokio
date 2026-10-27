// Start the storefront.
//
// `npm run dev` runs the Vite dev server that ships with the app. Binding to
// 127.0.0.1 keeps the store on loopback and makes Vite print a numeric URL we
// can capture below. No port is hardcoded: Vite automatically moves to the next
// free port when 5173 is already taken.
//
// NO_COLOR turns off Vite's colored output. Without it Vite wraps the port in
// ANSI escape codes (http://127.0.0.1:<esc>[1m5173<esc>[22m/) and the capture
// below would only see the host, giving you an Open Web UI button with no port.
//
// daemon: true keeps the server alive after the script steps finish.
module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        path: "app",
        env: {
          NO_COLOR: "1"
        },
        message: "npm run dev -- --host 127.0.0.1",
        on: [{
          // Whenever this pattern appears in the shell output, the shell
          // returns and the match object is passed on as `input.event`.
          event: "/(http:\\/\\/[0-9.:]+)/",
          // "done": true moves on to the next step while keeping the shell alive.
          done: true
        }]
      }
    },
    {
      // `url` is the local variable pinokio.js reads to offer the "Open Web UI"
      // button. input.event is the regex match object from the step above, and
      // event[1] is the URL captured inside the parenthesis.
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
