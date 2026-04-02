# AfgJobs - Fast Local Jobs for Afghans

AfgJobs is a fast, simple job board for Afghan communities, built to help people post local jobs and find nearby freelance or full-time work in minutes.

**Features**
- Job listings with search and filters (category, location, type)
- Post jobs for freelance, short-term, or full-time roles
- User profiles and basic account management
- Firebase-backed app setup
- Cloudflare R2-powered media uploads for profile photos and job media
- Dark mode
- Mobile-responsive design
- PWA support for installable app experience
- User settings for preferences

**Built With**
- HTML5, CSS3, JavaScript (Vanilla)
- Firebase for app and data services
- Cloudflare R2 for uploaded images and videos
- Local Storage for client-side session and fallback persistence
- Mobile-first responsive design
- SEO-friendly markup

**Pages**
Home, Jobs, Job Detail, Post Job, Authentication, Profile, Settings, About, Contact, FAQ, Privacy, Terms, 404.

**Getting Started**
1. Download or clone this repository.
2. Review `firebase-init.js` and confirm the Firebase project values are correct for your deployment.
3. Update `r2-config.js` with your Cloudflare Worker URL and public R2 bucket URL.
4. Open `index.html` in your browser.
5. Start browsing or posting jobs.

**R2 + Firebase Upload Flow**
- Job media and profile photos upload to Cloudflare R2 through a Worker first.
- The public R2 URL is stored with the related job or user record.
- Firebase stays focused on lightweight application data instead of large media files.

**Cloudflare R2 Setup**
1. Create an R2 bucket in Cloudflare and enable a public bucket URL or custom domain.
2. Deploy the Worker in `cloudflare/r2-upload-worker.js` with an `R2_BUCKET` binding.
3. Copy your Worker URL and public bucket URL into `r2-config.js`.
4. Keep your Cloudflare API tokens and account secrets private and out of frontend code.

**Note**
This project still includes local/session storage behavior for some client-side flows. For production use, keep Firebase rules locked down and protect the Worker with auth or rate limits before accepting public uploads.
