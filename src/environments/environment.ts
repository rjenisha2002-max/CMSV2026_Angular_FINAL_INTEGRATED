export const environment = {
  production: false,
  // Use the API's HTTPS profile (see Properties/launchSettings.json ->
  // "https" -> https://localhost:7037). The session cookie is configured as
  // SameSite=None; Secure so the browser will only send it back on HTTPS
  // cross-origin calls from the Angular dev server (http://localhost:4200).
  apiUrl: 'https://localhost:7037/api'
};
