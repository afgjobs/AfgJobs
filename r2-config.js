// Cloudflare R2 browser configuration.
// Safe to expose in the frontend because uploads go through a server-side Worker.
// Setup:
// 1) Deploy the Worker from cloudflare/r2-upload-worker.js.
// 2) Replace the placeholder values below with your Worker URL and public bucket URL.
// 3) Keep your Cloudflare API tokens and R2 credentials out of this project.
(function () {
  window.R2_UPLOAD_CONFIG = {
    workerUrl: "https://YOUR-WORKER.your-subdomain.workers.dev",
    publicBaseUrl: "https://pub-YOUR_BUCKET_ID.r2.dev",
    basePath: "afgjobs",
    maxFileSizeMb: 2
  };
})();
