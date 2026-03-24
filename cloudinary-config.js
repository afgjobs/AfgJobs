// Cloudinary browser configuration.
// Safe to expose in the frontend because it uses an unsigned upload preset.
// Setup:
// 1) Create an unsigned upload preset in Cloudinary.
// 2) Replace the placeholder values below with your real Cloudinary details.
// 3) Keep your API secret out of this project.
(function () {
  window.CLOUDINARY_CONFIG = {
    cloudName: "dbbp3cusz",
    uploadPreset: "afgjobs_unsigned",
    folder: "afgjobs"
  };
})();
