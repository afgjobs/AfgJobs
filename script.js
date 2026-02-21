/**
 * AfgJobs - Core Logic
 * Handles local storage, rendering, search, theme, auth UI, posting, and feedback.
 */

const APP_KEYS = {
    JOBS: 'afg_jobs_data',
    LEGACY_JOBS: 'jobs',
    USERS: 'afg_users',
    THEME: 'afg_theme',
    USER: 'afg_current_user',
    SETTINGS: 'afg_settings',
    FEEDBACK: 'afg_feedback',
    NEWSLETTER: 'afg_newsletter',
    SEEKER_POSTS: 'afg_job_seeker_posts'
};

const DEFAULT_SETTINGS = {
    theme: 'light',
    jobSearch: '',
    jobCategory: 'All',
    jobSort: 'newest',
    defaultPosterType: 'Company',
    defaultCategory: '',
    defaultCurrency: 'USD',
    defaultLocation: '',
    defaultOnline: false,
    notifications: {
        weeklyDigest: true,
        jobAlerts: true,
        productUpdates: false
    }
};

const DEFAULT_JOBS = [
    {
        id: -1,
        title: 'Social Media Manager for Local Bakery',
        category: 'Social Media',
        description: 'Create weekly posts, reply to comments, and help improve local visibility on Facebook and Instagram.',
        location: 'Kabul',
        contact: 'bakery.hiring@example.com',
        posterType: 'Business',
        price: 180,
        currency: 'USD',
        isOnline: true,
        sampleLink: 'https://example.com/sample-work',
        portfolioLink: '',
        media: '',
        mediaType: '',
        postedByName: 'City Bakery',
        createdAt: '2026-01-15T09:00:00.000Z'
    },
    {
        id: -2,
        title: 'Arabic to Dari Translator Needed',
        category: 'Translator',
        description: 'Translate short legal and business documents with clear formatting and accurate terminology.',
        location: 'Herat',
        contact: '+93 700 123 456',
        posterType: 'Poster',
        price: 120,
        currency: 'USD',
        isOnline: true,
        sampleLink: 'https://example.com/translation-sample',
        portfolioLink: '',
        media: '',
        mediaType: '',
        postedByName: 'Hamid',
        createdAt: '2026-01-10T11:30:00.000Z'
    },
    {
        id: -3,
        title: 'Part-time Math Tutor (Grade 9-12)',
        category: 'Tutor',
        description: 'Provide three evening sessions per week for high school students. Prior tutoring experience preferred.',
        location: 'Kandahar',
        contact: 'tutor.jobs@example.com',
        posterType: 'Poster',
        price: 90,
        currency: 'USD',
        isOnline: false,
        sampleLink: '',
        portfolioLink: '',
        media: '',
        mediaType: '',
        postedByName: 'Zainab',
        createdAt: '2026-01-05T08:45:00.000Z'
    }
];

const Utils = {
    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    },

    isPhone(value) {
        return /^\+?[\d\s\-()]{7,}$/.test(String(value || '').trim());
    },

    safeHttpUrl(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        try {
            const parsed = new URL(raw);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return parsed.href;
            }
            return '';
        } catch {
            return '';
        }
    },

    readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },

    isJobOwner(job, user) {
        if (!job || !user) return false;
        if (job.posterId && user.id && String(job.posterId) === String(user.id)) return true;
        if (job.postedBy && user.email && String(job.postedBy).toLowerCase() === String(user.email).toLowerCase()) return true;
        return false;
    }
};

const Storage = {
    getAllJobs() {
        try {
            const data = localStorage.getItem(APP_KEYS.JOBS);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                localStorage.setItem(APP_KEYS.JOBS, JSON.stringify(DEFAULT_JOBS));
                return [...DEFAULT_JOBS];
            }

            // One-time migration from legacy key if present.
            const legacy = localStorage.getItem(APP_KEYS.LEGACY_JOBS);
            const parsedLegacy = legacy ? JSON.parse(legacy) : [];
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
                localStorage.setItem(APP_KEYS.JOBS, JSON.stringify(parsedLegacy));
                return parsedLegacy;
            }

            localStorage.setItem(APP_KEYS.JOBS, JSON.stringify(DEFAULT_JOBS));
            return [...DEFAULT_JOBS];
        } catch {
            return [];
        }
    },

    saveJob(job) {
        const jobs = this.getAllJobs();

        try {
            jobs.unshift({
                ...job,
                id: Date.now(),
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(APP_KEYS.JOBS, JSON.stringify(jobs));
            return true;
        } catch {
            alert('Storage is full. Please use a smaller media file or remove old posts.');
            return false;
        }
    },

    getUsers() {
        try {
            const data = localStorage.getItem(APP_KEYS.USERS);
            const parsed = data ? JSON.parse(data) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    },

    getTheme() {
        return localStorage.getItem(APP_KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        localStorage.setItem(APP_KEYS.THEME, theme);
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(APP_KEYS.USER) || 'null');
        } catch {
            return null;
        }
    },

    getSettings() {
        const raw = Utils.readJson(APP_KEYS.SETTINGS, {});
        const theme = raw?.theme || this.getTheme();
        return {
            ...DEFAULT_SETTINGS,
            ...raw,
            theme,
            notifications: {
                ...DEFAULT_SETTINGS.notifications,
                ...(raw?.notifications || {})
            }
        };
    },

    saveSettings(settings) {
        localStorage.setItem(APP_KEYS.SETTINGS, JSON.stringify(settings || {}));
    },

    deleteJobById(jobId, user) {
        const jobs = this.getAllJobs();
        const target = jobs.find((job) => String(job.id) === String(jobId));
        if (!target) return { ok: false, reason: 'not-found' };
        if (!Utils.isJobOwner(target, user)) return { ok: false, reason: 'not-owner' };

        const updated = jobs.filter((job) => String(job.id) !== String(jobId));
        localStorage.setItem(APP_KEYS.JOBS, JSON.stringify(updated));
        return { ok: true };
    }
};

const Renderer = {
    createJobCard(job) {
        const title = Utils.escapeHtml(job.title || 'Untitled');
        const category = Utils.escapeHtml(job.category || 'Other');
        const location = Utils.escapeHtml(job.location || 'Remote');
        const posterType = Utils.escapeHtml(job.posterType || 'Poster');
        const description = Utils.escapeHtml((job.description || '').slice(0, 100));
        const budgetHtml = Number.isFinite(Number(job.price))
            ? `<p class="budget">Budget: ${Utils.escapeHtml(job.currency || 'USD')} ${Utils.escapeHtml(job.price)}</p>`
            : '';

        const sampleUrl = Utils.safeHttpUrl(job.sampleLink);
        const sampleHtml = job.isOnline && sampleUrl
            ? `<p><a href="${sampleUrl}" target="_blank" rel="noopener noreferrer">View sample link</a></p>`
            : '';

        const mediaHtml = job.media
            ? ((job.mediaType || '').includes('video')
                ? `<video src="${job.media}" class="card-media" controls></video>`
                : `<img src="${job.media}" class="card-media" alt="Job media">`)
            : '';

        return `
            <a href="job-detail.html?id=${job.id}" style="text-decoration: none; color: inherit; display: block;">
                <article class="card job-card" style="cursor: pointer; transition: all 0.3s ease;">
                    ${mediaHtml}
                    <div class="card-body">
                        <span class="badge">${category}</span>
                        <h3>${title}</h3>
                        <p class="location">Location: ${location}</p>
                        <p class="description">${description}${(job.description || '').length > 100 ? '...' : ''}</p>
                        ${budgetHtml}
                        ${sampleHtml}
                        <div class="card-footer">
                            <span class="poster">${posterType}</span>
                            <span class="btn outline small" style="pointer-events: none;">View Details</span>
                        </div>
                    </div>
                </article>
            </a>
        `;
    },

    renderList(containerId, jobs) {
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById('empty-state');
        const countDisplay = document.getElementById('job-count');

        if (!container) return;

        if (!Array.isArray(jobs) || jobs.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (countDisplay) countDisplay.innerText = '0 jobs found';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (countDisplay) countDisplay.innerText = `${jobs.length} jobs found`;
        container.innerHTML = jobs.map((job) => this.createJobCard(job)).join('');
    }
};

const SearchEngine = {
    init() {
        const searchInput = document.getElementById('jobs-search') || document.getElementById('hero-search');
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');

        if (!searchInput && !categoryFilter && !sortFilter) return;

        const settings = Storage.getSettings();

        const performSearch = () => {
            const query = String(searchInput?.value || '').toLowerCase().trim();
            const category = categoryFilter?.value || 'All';
            const sortBy = sortFilter?.value || 'newest';
            const allJobs = Storage.getAllJobs();

            const filtered = allJobs.filter((job) => {
                const title = String(job.title || '').toLowerCase();
                const desc = String(job.description || '').toLowerCase();
                const location = String(job.location || '').toLowerCase();
                const matchesQuery = !query || title.includes(query) || desc.includes(query) || location.includes(query);
                const matchesCategory = category === 'All' || job.category === category;
                return matchesQuery && matchesCategory;
            });

            filtered.sort((a, b) => {
                if (sortBy === 'budget-high') {
                    return Number(b.price || 0) - Number(a.price || 0);
                }
                if (sortBy === 'budget-low') {
                    return Number(a.price || 0) - Number(b.price || 0);
                }

                const aDate = new Date(a.createdAt || 0).getTime();
                const bDate = new Date(b.createdAt || 0).getTime();
                return bDate - aDate;
            });

            Renderer.renderList('jobs-list', filtered);
            Renderer.renderList('featured-list', filtered.slice(0, 3));

            const hasFilters = Boolean(query) || category !== 'All';
            if (clearFiltersBtn) {
                clearFiltersBtn.style.display = hasFilters ? 'inline-flex' : 'none';
            }
        };

        searchInput?.addEventListener('input', performSearch);
        categoryFilter?.addEventListener('change', performSearch);
        sortFilter?.addEventListener('change', performSearch);
        clearFiltersBtn?.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = 'All';
            if (sortFilter) sortFilter.value = 'newest';
            performSearch();
        });

        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get('search');
        if (queryFromUrl && searchInput) {
            searchInput.value = queryFromUrl;
            performSearch();
            return;
        }

        if (searchInput && settings.jobSearch) {
            searchInput.value = settings.jobSearch;
        }
        if (categoryFilter && settings.jobCategory) {
            categoryFilter.value = settings.jobCategory;
        }
        if (sortFilter && settings.jobSort) {
            sortFilter.value = settings.jobSort;
        }

        performSearch();
    }
};

const ThemeManager = {
    init() {
        const btn = document.getElementById('themeToggle');
        const currentTheme = Storage.getTheme();

        if (currentTheme === 'dark') {
            document.body.classList.add('dark');
            if (btn) btn.setAttribute('aria-pressed', 'true');
        }

        btn?.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            Storage.setTheme(isDark ? 'dark' : 'light');
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        });
    }
};

const AuthManager = {
    init() {
        const user = Storage.getCurrentUser();
        const userDisplay = document.getElementById('user-display');
        const authLink = document.getElementById('auth-link');
        const profileLink = document.getElementById('profile-link');
        const settingsLink = document.getElementById('settings-link');
        const logoutBtn = document.getElementById('logout-btn');

        if (!user || !userDisplay || !authLink || !logoutBtn) return;

        userDisplay.textContent = `Welcome, ${user.fullname || 'User'}`;
        userDisplay.style.display = 'inline';
        authLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'inline';
        if (settingsLink) settingsLink.style.display = 'inline';
        logoutBtn.style.display = 'inline';

        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!confirm('Are you sure you want to log out?')) return;

            localStorage.removeItem(APP_KEYS.USER);
            window.location.reload();
        });
    }
};

const FormHandler = {
    mediaData: null,
    mediaType: null,

    init() {
        const form = document.getElementById('post-job-form');
        const user = Storage.getCurrentUser();
        const settings = Storage.getSettings();

        if (form && !user) {
            const container = form.parentElement;
            container.innerHTML = '<div style="text-align:center;padding:2rem;"><h3>Please sign in to post a job</h3><p>You need an account before posting a job.</p><a href="auth.html" class="btn" style="display:inline-block;margin-top:1rem;">Sign In / Create Account</a></div>';
            return;
        }

        if (!form) return;

        const fileInput = document.getElementById('media-upload-input');
        const mediaUploadArea = document.getElementById('media-upload-area');
        const uploadBtn = document.getElementById('upload-btn');
        const removeBtn = document.getElementById('media-remove-btn');
        const descTextarea = document.getElementById('description');
        const charCount = document.getElementById('char-count');
        const isOnlineCheckbox = document.getElementById('is-online');
        const sampleLinkLabel = document.getElementById('sample-link-label');
        const sampleLinkInput = document.getElementById('sample-link');

        if (settings) {
            const posterTypeSelect = document.getElementById('poster-type');
            const categorySelect = document.getElementById('category');
            const currencySelect = document.getElementById('currency');
            const locationInput = document.getElementById('location');
            const onlineCheckbox = document.getElementById('is-online');

            if (posterTypeSelect && settings.defaultPosterType) {
                posterTypeSelect.value = settings.defaultPosterType;
            }
            if (categorySelect && !categorySelect.value && settings.defaultCategory) {
                categorySelect.value = settings.defaultCategory;
            }
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
            }
            if (locationInput && !locationInput.value && settings.defaultLocation) {
                locationInput.value = settings.defaultLocation;
            }
            if (onlineCheckbox && settings.defaultOnline) {
                onlineCheckbox.checked = true;
            }
        }

        const syncOnlineFields = () => {
            const show = Boolean(isOnlineCheckbox?.checked);
            if (!sampleLinkLabel || !sampleLinkInput) return;
            sampleLinkLabel.style.display = show ? 'block' : 'none';
            sampleLinkInput.style.display = show ? 'block' : 'none';
            sampleLinkInput.required = show;
            if (!show) sampleLinkInput.value = '';
        };

        isOnlineCheckbox?.addEventListener('change', syncOnlineFields);
        syncOnlineFields();

        if (descTextarea && charCount) {
            descTextarea.addEventListener('input', (event) => {
                charCount.textContent = `${event.target.value.length}/1000`;
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (event) => this.handleFile(event.target.files?.[0]));
        }

        if (mediaUploadArea && fileInput) {
            mediaUploadArea.addEventListener('click', () => fileInput.click());

            mediaUploadArea.addEventListener('dragover', (event) => {
                event.preventDefault();
                mediaUploadArea.style.borderColor = 'var(--primary)';
                mediaUploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
            });

            mediaUploadArea.addEventListener('dragleave', () => {
                mediaUploadArea.style.borderColor = 'var(--border)';
                mediaUploadArea.style.background = 'var(--accent-bg)';
            });

            mediaUploadArea.addEventListener('drop', (event) => {
                event.preventDefault();
                mediaUploadArea.style.borderColor = 'var(--border)';
                mediaUploadArea.style.background = 'var(--accent-bg)';
                this.handleFile(event.dataTransfer?.files?.[0]);
            });
        }

        uploadBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            fileInput?.click();
        });

        removeBtn?.addEventListener('click', () => {
            this.mediaData = null;
            this.mediaType = null;
            const container = document.getElementById('media-preview-container');
            if (container) container.style.display = 'none';
            if (fileInput) fileInput.value = '';
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const title = String(formData.get('title') || '').trim();
            const category = String(formData.get('category') || '').trim();
            const description = String(formData.get('description') || '').trim();
            const location = String(formData.get('location') || '').trim();
            const contact = String(formData.get('contact') || '').trim();
            const posterType = String(formData.get('posterType') || '').trim();
            const price = Number(formData.get('price'));
            const currency = String(formData.get('currency') || 'USD').trim();
            const isOnline = formData.get('isOnline') === 'on';
            const sampleLink = String(formData.get('sampleLink') || '').trim();
            const portfolioLink = String(formData.get('portfolioLink') || '').trim();

            if (!title || !category || !description || !location || !contact || !posterType) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!Number.isFinite(price) || price < 0) {
                alert('Please enter a valid price.');
                return;
            }

            if (description.length < 20) {
                alert('Description must be at least 20 characters.');
                return;
            }

            if (!Utils.isEmail(contact) && !Utils.isPhone(contact)) {
                alert('Please enter a valid email or phone number.');
                return;
            }

            if (isOnline && !sampleLink) {
                alert('Please add a sample link for online jobs.');
                return;
            }

            if (sampleLink && !/^https?:\/\//i.test(sampleLink)) {
                alert('Sample link must start with http:// or https://');
                return;
            }

            if (portfolioLink && !/^https?:\/\//i.test(portfolioLink)) {
                alert('Portfolio link must start with http:// or https://');
                return;
            }

            const jobData = {
                title,
                category,
                description,
                location,
                contact,
                posterType,
                price,
                currency,
                isOnline,
                sampleLink,
                portfolioLink,
                media: this.mediaData,
                mediaType: this.mediaType,
                posterId: user.id,
                postedBy: user.email,
                postedByName: user.fullname
            };

            const msgEl = document.getElementById('form-msg');
            if (!Storage.saveJob(jobData)) {
                if (msgEl) {
                    msgEl.textContent = 'Unable to post the job right now. Please try again.';
                    msgEl.className = 'form-msg error';
                }
                return;
            }

            form.reset();
            this.mediaData = null;
            this.mediaType = null;
            const previewContainer = document.getElementById('media-preview-container');
            if (previewContainer) previewContainer.style.display = 'none';
            syncOnlineFields();

            if (msgEl) {
                msgEl.textContent = 'Job posted successfully. Redirecting...';
                msgEl.className = 'form-msg success';
            }

            setTimeout(() => {
                window.location.href = 'jobs.html';
            }, 1200);
        });
    },

    handleFile(file) {
        if (!file) return;

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert('Please upload an image or video file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Please choose a file under 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            this.mediaData = event.target?.result;
            this.mediaType = file.type;

            const previewContainer = document.getElementById('media-preview-container');
            const info = document.getElementById('media-info');
            if (!previewContainer) return;

            previewContainer.style.display = 'block';
            if (info) info.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;

            const imgEl = document.getElementById('media-preview-img');
            const videoEl = document.getElementById('media-preview-video');

            if (file.type.startsWith('video/')) {
                if (imgEl) imgEl.style.display = 'none';
                if (videoEl) {
                    videoEl.src = String(event.target?.result || '');
                    videoEl.style.display = 'block';
                }
            } else {
                if (videoEl) videoEl.style.display = 'none';
                if (imgEl) {
                    imgEl.src = String(event.target?.result || '');
                    imgEl.style.display = 'block';
                }
            }
        };

        reader.readAsDataURL(file);
    }
};

const FeedbackHandler = {
    init() {
        const form = document.getElementById('feedback-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = String(document.getElementById('feedback-name')?.value || '').trim() || 'Anonymous';
            const email = String(document.getElementById('feedback-email')?.value || '').trim();
            const message = String(document.getElementById('feedback-message')?.value || '').trim();
            const msgEl = document.getElementById('feedback-msg');

            if (!message) {
                if (msgEl) {
                    msgEl.textContent = 'Please enter your feedback.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            if (email && !Utils.isEmail(email)) {
                if (msgEl) {
                    msgEl.textContent = 'Please enter a valid email address.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            try {
                const feedback = JSON.parse(localStorage.getItem(APP_KEYS.FEEDBACK) || '[]');
                feedback.push({
                    name,
                    email,
                    message,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem(APP_KEYS.FEEDBACK, JSON.stringify(feedback));

                form.reset();
                if (msgEl) {
                    msgEl.textContent = 'Thank you for your feedback.';
                    msgEl.className = 'feedback-msg success';
                    setTimeout(() => {
                        msgEl.className = 'feedback-msg';
                    }, 3000);
                }
            } catch {
                if (msgEl) {
                    msgEl.textContent = 'Could not save feedback. Please try again.';
                    msgEl.className = 'feedback-msg error';
                }
            }
        });
    }
};

const NewsletterHandler = {
    init() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const input = document.getElementById('newsletter-email');
            const msgEl = document.getElementById('newsletter-msg');
            const email = String(input?.value || '').trim().toLowerCase();

            if (!Utils.isEmail(email)) {
                if (msgEl) {
                    msgEl.textContent = 'Enter a valid email address.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            const entries = Utils.readJson(APP_KEYS.NEWSLETTER, []);
            if (!entries.includes(email)) {
                entries.push(email);
                localStorage.setItem(APP_KEYS.NEWSLETTER, JSON.stringify(entries));
            }

            if (input) input.value = '';
            if (msgEl) {
                msgEl.textContent = 'You are subscribed. Thanks for joining.';
                msgEl.className = 'feedback-msg success';
            }
        });
    }
};

const JobSeekerHandler = {
    init() {
        const form = document.getElementById('seeker-form');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = String(document.getElementById('seeker-name')?.value || '').trim();
            const location = String(document.getElementById('seeker-location')?.value || '').trim();
            const skills = String(document.getElementById('seeker-skills')?.value || '').trim();
            const contact = String(document.getElementById('seeker-contact')?.value || '').trim();
            const msgEl = document.getElementById('seeker-msg');

            if (!name || !location || !skills || !contact) {
                if (msgEl) {
                    msgEl.textContent = 'Please complete all fields.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            if (skills.length < 20) {
                if (msgEl) {
                    msgEl.textContent = 'Please add at least 20 characters about your skills.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            if (!Utils.isEmail(contact) && !Utils.isPhone(contact)) {
                if (msgEl) {
                    msgEl.textContent = 'Contact must be a valid email or phone number.';
                    msgEl.className = 'feedback-msg error';
                }
                return;
            }

            const posts = Utils.readJson(APP_KEYS.SEEKER_POSTS, []);
            posts.unshift({
                id: Date.now(),
                name,
                location,
                skills,
                contact,
                createdAt: new Date().toISOString()
            });

            try {
                localStorage.setItem(APP_KEYS.SEEKER_POSTS, JSON.stringify(posts.slice(0, 200)));
                form.reset();
                if (msgEl) {
                    msgEl.textContent = 'Your job-seeker profile was posted successfully.';
                    msgEl.className = 'feedback-msg success';
                }
            } catch {
                if (msgEl) {
                    msgEl.textContent = 'Could not save your profile. Please try again.';
                    msgEl.className = 'feedback-msg error';
                }
            }
        });
    }
};

const StatsManager = {
    init() {
        const jobsEl = document.getElementById('stat-jobs-posted');
        const freelancersEl = document.getElementById('stat-freelancers-active');
        const categoriesEl = document.getElementById('stat-categories');

        if (!jobsEl || !freelancersEl || !categoriesEl) return;

        const jobs = Storage.getAllJobs();
        const users = Storage.getUsers();

        const categories = new Set(
            jobs
                .map((job) => String(job.category || '').trim())
                .filter(Boolean)
        );

        // Active freelancers = unique registered users + unique poster identities from posted jobs.
        const freelancers = new Set();
        users.forEach((user) => {
            if (user?.id) freelancers.add(`id:${user.id}`);
            else if (user?.email) freelancers.add(`email:${String(user.email).toLowerCase()}`);
        });
        jobs.forEach((job) => {
            if (job?.posterId) freelancers.add(`id:${job.posterId}`);
            else if (job?.postedBy) freelancers.add(`email:${String(job.postedBy).toLowerCase()}`);
            else if (job?.postedByName) freelancers.add(`name:${String(job.postedByName).toLowerCase()}`);
        });

        jobsEl.textContent = String(jobs.length);
        freelancersEl.textContent = String(freelancers.size);
        categoriesEl.textContent = String(categories.size);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    AuthManager.init();
    StatsManager.init();
    SearchEngine.init();
    FormHandler.init();
    FeedbackHandler.init();
    NewsletterHandler.init();
    JobSeekerHandler.init();

    const allJobs = Storage.getAllJobs();
    // Avoid overriding the filtered results on pages where search/filter controls exist.
    const hasJobsFilters = Boolean(
        document.getElementById('jobs-search')
        || document.getElementById('category-filter')
        || document.getElementById('sort-filter')
    );

    if (!hasJobsFilters) {
        Renderer.renderList('jobs-list', allJobs);
        Renderer.renderList('featured-list', allJobs.slice(0, 3));
    }
});
