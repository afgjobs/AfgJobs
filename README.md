# AfgJobs - Fast Local Jobs for Afghans

AfgJobs is a fast, simple job board for Afghan communities, built to help people post local jobs and find nearby freelance or full-time work in minutes.

**Features**
- Job listings with search and filters (category, location, type)
- Post jobs for freelance, short-term, or full-time roles
- User profiles and basic account management
- Firebase-backed app setup
- Cloudinary-powered media uploads for profile photos and job media
- Dark mode
- Mobile-responsive design
- PWA support for installable app experience
- User settings for preferences

**Built With**
- HTML5, CSS3, JavaScript (Vanilla)
- Firebase for app and data services
- Cloudinary for uploaded images and videos
- Local Storage for client-side session and fallback persistence
- Mobile-first responsive design
- SEO-friendly markup

**Pages**
Home, Jobs, Job Detail, Post Job, Authentication, Profile, Settings, About, Contact, FAQ, Privacy, Terms, 404.

**Getting Started**
1. Download or clone this repository.
2. Review `firebase-init.js` and confirm the Firebase project values are correct for your deployment.
3. Update `cloudinary-config.js` with your Cloudinary cloud name and unsigned upload preset.
4. Open `index.html` in your browser.
5. Start browsing or posting jobs.

**Cloudinary + Firebase Upload Flow**
- Job media and profile photos upload to Cloudinary first.
- The Cloudinary URL is stored with the related job or user record.
- Firebase stays focused on lightweight application data instead of large media files.

**Cloudinary Setup**
1. Create a Cloudinary account.
2. In Cloudinary Console, create an unsigned upload preset.
3. Copy your cloud name and preset into `cloudinary-config.js`.
4. Keep your Cloudinary API secret private and out of frontend code.

**Note**
This project still includes local/session storage behavior for some client-side flows. For production use, keep Firebase rules locked down and use Cloudinary unsigned presets carefully.
