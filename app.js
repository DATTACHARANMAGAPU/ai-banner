/**
 * ENHANCED DATABASE CONTROLLER
 * Handles JSON data, user credentials, and images in LocalStorage
 */
class MockDB {
    static getUsers() {
        return JSON.parse(localStorage.getItem('app_users')) || [];
    }

    static saveUser(username, password) {
        const users = this.getUsers();
        
        // Validate username
        if (!username || username.trim() === '') {
            return { success: false, msg: "Username cannot be empty" };
        }
        
        if (username.length < 3) {
            return { success: false, msg: "Username must be at least 3 characters" };
        }
        
        // Check if user exists
        if (users.some(u => u.username === username)) {
            return { success: false, msg: "User already exists" };
        }
        
        // Validate password
        if (!password || password.length < 6) {
            return { success: false, msg: "Password must be at least 6 characters" };
        }
        
        const newUser = {
            id: Date.now(),
            username: username.trim(),
            password: password,
            created: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('app_users', JSON.stringify(users));
        return { success: true, user: newUser };
    }

    static authenticate(username, password) {
        if (!username || !password) {
            return null;
        }
        
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return null;
        }
        
        if (user.password !== password) {
            return null;
        }
        
        return user;
    }

    static getBanners(userId) {
        const banners = JSON.parse(localStorage.getItem('app_banners')) || [];
        return banners.filter(b => b.userId === userId);
    }

    static saveBanner(userId, title, desc, imageData = null) {
        const banners = JSON.parse(localStorage.getItem('app_banners')) || [];
        const banner = {
            id: Date.now(),
            userId,
            title,
            desc,
            image: imageData || null,
            created: new Date().toISOString()
        };
        banners.push(banner);
        localStorage.setItem('app_banners', JSON.stringify(banners));
        return { success: true, id: banner.id };
    }

    static updateBannerImage(bannerId, imageData) {
        const banners = JSON.parse(localStorage.getItem('app_banners')) || [];
        const banner = banners.find(b => b.id === bannerId);
        if (banner) {
            banner.image = imageData;
            localStorage.setItem('app_banners', JSON.stringify(banners));
            return { success: true };
        }
        return { success: false };
    }

    static getAllData() {
        return {
            users: this.getUsers(),
            banners: JSON.parse(localStorage.getItem('app_banners')) || [],
            exported: new Date().toISOString()
        };
    }
}

/**
 * ENHANCED UI & STATE MANAGER
 */
const UI = {
    // State
    currentUser: null,
    currentBannerId: null,

    // UI Elements (will be initialized in init())
    promptInput: null,
    genBtn: null,
    display: null,
    overlay: null,
    authContent: null,
    closeBtn: null,
    showLoginBtn: null,
    showSignupBtn: null,
    bannerImage: null,
    uploadInput: null,
    downloadBtn: null,
    exportBtn: null,

    // Initialize
    init() {
        // Initialize DOM elements here after page loads
        this.promptInput = document.getElementById('user-prompt');
        this.genBtn = document.getElementById('generate-btn');
        this.display = document.getElementById('display-area');
        this.overlay = document.getElementById('auth-overlay');
        this.authContent = document.getElementById('auth-content');
        this.closeBtn = document.querySelector('.close-btn');
        this.showLoginBtn = document.getElementById('show-login');
        this.showSignupBtn = document.getElementById('show-signup');
        this.bannerImage = document.getElementById('banner-image');
        this.uploadInput = document.getElementById('upload-image');
        this.downloadBtn = document.getElementById('download-image');
        this.exportBtn = document.getElementById('export-banner');
        
        this.checkAuth();
        this.setupEventListeners();
    },

    checkAuth() {
        const user = localStorage.getItem('current_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showMainApp();
        } else {
            this.showAuthPrompt();
        }
    },

    setupEventListeners() {
        this.showLoginBtn.addEventListener('click', () => this.showLoginForm());
        this.showSignupBtn.addEventListener('click', () => this.showSignupForm());
        this.closeBtn.addEventListener('click', () => this.closeOverlay());
        this.genBtn.addEventListener('click', () => this.handleGeneration());
        
        // Example buttons event listener with event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('example-btn')) {
                const prompt = e.target.getAttribute('data-prompt');
                this.promptInput.value = prompt;
                this.handleGeneration();
            }
        });
        
        // Close overlay when clicking outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.closeOverlay();
        });
    },

    showAuthPrompt() {
        this.overlay.classList.remove('hidden');
        this.showLoginForm();
    },

    showLoginForm() {
        this.authContent.innerHTML = `
            <form class="auth-form" id="login-form">
                <h2>Sign In</h2>
                <div id="form-alerts"></div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-username" placeholder="Enter your username" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="form-btn">Sign In</button>
                <div class="form-toggle">
                    Don't have an account? <a onclick="UI.showSignupForm()">Sign Up</a>
                </div>
            </form>
        `;
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    },

    showSignupForm() {
        this.authContent.innerHTML = `
            <form class="auth-form" id="signup-form">
                <h2>Create Account</h2>
                <div id="form-alerts"></div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="signup-username" placeholder="Choose a username (min 3 characters)" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="signup-password" placeholder="Create a password (min 6 characters)" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" id="signup-confirm" placeholder="Confirm your password" required>
                </div>
                <button type="submit" class="form-btn">Get Started</button>
                <div class="form-toggle">
                    Already have an account? <a onclick="UI.showLoginForm()">Sign In</a>
                </div>
            </form>
        `;
        document.getElementById('signup-form').addEventListener('submit', (e) => this.handleSignup(e));
    },

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        // Validate inputs
        if (!username) {
            this.showAlert('Please enter your username', 'error');
            return;
        }

        if (!password) {
            this.showAlert('Please enter your password', 'error');
            return;
        }

        // Authenticate user
        const user = MockDB.authenticate(username, password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('current_user', JSON.stringify(user));
            this.closeOverlay();
            this.showMainApp();
            this.showAlert(`Welcome back, ${username}!`, 'success');
        } else {
            // Check if user exists
            const userExists = MockDB.getUsers().some(u => u.username === username);
            if (userExists) {
                this.showAlert('Invalid password. Please try again.', 'error');
            } else {
                this.showAlert('User does not exist. Please Sign Up.', 'error');
            }
        }
    },

    handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        // Validate username
        if (!username) {
            this.showAlert('Username cannot be empty', 'error');
            return;
        }

        if (username.length < 3) {
            this.showAlert('Username must be at least 3 characters', 'error');
            return;
        }

        // Validate password
        if (!password) {
            this.showAlert('Password cannot be empty', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if passwords match
        if (password !== confirm) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        // Check if user already exists
        if (MockDB.getUsers().some(u => u.username === username)) {
            this.showAlert('User already exists. Please login instead.', 'error');
            return;
        }

        // Save new user
        const result = MockDB.saveUser(username, password);
        
        if (result.success) {
            this.currentUser = result.user;
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
            this.closeOverlay();
            this.showMainApp();
            this.showAlert(`Account created successfully! Welcome, ${username}!`, 'success');
        } else {
            this.showAlert(result.msg, 'error');
        }
    },

    showAlert(msg, type) {
        const alertDiv = document.getElementById('form-alerts');
        if (alertDiv) {
            alertDiv.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
            setTimeout(() => {
                if (alertDiv.innerHTML.includes(msg)) {
                    alertDiv.innerHTML = '';
                }
            }, 4000);
        }
    },

    closeOverlay() {
        this.overlay.classList.add('hidden');
        this.authContent.innerHTML = '';
    },

    showMainApp() {
        this.promptInput.disabled = false;
        this.genBtn.disabled = false;
        this.showLoginBtn.textContent = `${this.currentUser.username} (Logout)`;
        this.showLoginBtn.onclick = () => this.logout();
        this.showSignupBtn.style.display = 'none';
    },

    logout() {
        localStorage.removeItem('current_user');
        this.currentUser = null;
        this.currentBannerId = null;
        this.promptInput.value = '';
        this.display.classList.add('hidden');
        this.showLoginBtn.textContent = 'Sign In';
        this.showLoginBtn.onclick = () => this.showLoginForm();
        this.showSignupBtn.style.display = 'block';
        this.showAuthPrompt();
    },

    // AI Status indicator
    showAIStatus(message, type = 'generating') {
        const statusDiv = document.getElementById('ai-status');
        statusDiv.className = `ai-status show ${type}`;
        
        if (type === 'generating') {
            statusDiv.innerHTML = `<span class="loading-spinner"></span><span>${message}</span>`;
        } else {
            statusDiv.innerHTML = message;
        }
    },

    hideAIStatus() {
        const statusDiv = document.getElementById('ai-status');
        statusDiv.className = 'ai-status';
        statusDiv.innerHTML = '';
    },

    // Banner generation logic
    async handleGeneration() {
        if (!this.currentUser) {
            this.showAuthPrompt();
            return;
        }

        const prompt = this.promptInput.value.trim();
        if (!prompt) return alert("Please enter a theme!");

        this.genBtn.innerText = "Processing...";
        this.genBtn.disabled = true;
        this.showAIStatus("Generating AI-powered banner...", 'generating');

        try {
            const result = await this.mockAiCall(prompt);
            
            // Show AI status
            if (result.aiGenerated) {
                this.showAIStatus("✨ AI image generated successfully!", 'success');
            } else {
                this.showAIStatus("Using procedural generation (API not configured)", 'fallback');
            }
            
            this.renderBanner(result);
            
            // Auto-hide status after 3 seconds
            setTimeout(() => this.hideAIStatus(), 3000);
        } catch (error) {
            this.showAIStatus(`❌ Error: ${error.message}`, 'error');
            console.error('Generation error:', error);
        } finally {
            this.genBtn.innerText = "Generate Banner";
            this.genBtn.disabled = false;
        }
    },

    async mockAiCall(prompt) {
        // Use Gemini + Image Generation for banner creation
        try {
            console.log('🎨 Starting banner generation...', { prompt });
            this.showAIStatus("🔍 Detecting theme...", 'generating');
            
            const theme = this.detectTheme(prompt);
            console.log('🎭 Detected theme:', theme);
            
            // Call backend to generate banner with image
            console.log('📡 Calling API...');
            this.showAIStatus("🤖 Calling Gemini AI...", 'generating');
            
            const response = await this.generateWithGemini(prompt, theme);
            
            if (!response) {
                throw new Error('No response from generation API');
            }

            console.log('✅ API Response:', response);
            this.showAIStatus("🎨 Processing image...", 'generating');

            const data = {
                title: response.title || 'Amazing Banner',
                desc: response.description || prompt,
                image: response.image, // Use AI-generated image!
                theme: theme,
                aiGenerated: true
            };

            console.log('🎉 Banner data ready:', { title: data.title, theme: data.theme, hasImage: !!data.image });
            return data;
        } catch (error) {
            console.error('❌ FATAL ERROR in mockAiCall:', error);
            console.error('Error stack:', error.stack);
            this.showAIStatus(`❌ Error: ${error.message}`, 'error');
            throw error;
        }
    },

    async generateWithGemini(prompt, theme) {
        try {
            console.log('📤 Sending request to /api/generate-banner');
            const requestBody = {
                prompt: prompt,
                theme: theme
            };
            console.log('📋 Request body:', requestBody);
            
            const response = await fetch('/api/generate-banner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`📨 Response received: ${response.status} ${response.statusText}`);
            console.log('📄 Response headers:', {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length')
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('❌ API returned error JSON:', errorData);
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('❌ API returned error text:', errorText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const result = await response.json();
            console.log('✅ Parsed response JSON:', result);
            
            return result;
        } catch (error) {
            console.error('❌ FETCH ERROR in generateWithGemini:', error.message);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    },

    processInputWithAI(prompt) {
        // Analyze the prompt and generate contextual content
        const lowerPrompt = prompt.toLowerCase();
        
        // Extract keywords
        const keywords = this.extractKeywords(lowerPrompt);
        
        // Generate title based on analysis
        const title = this.generateTitle(prompt, keywords);
        
        // Generate description based on analysis
        const description = this.generateDescription(prompt, keywords);
        
        return { title, description };
    },

    extractKeywords(text) {
        // Common stop words to filter out
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'be', 'was', 'were'];
        
        // Split and clean text
        const words = text.match(/\b\w+\b/g) || [];
        const keywords = words
            .filter(word => !stopWords.includes(word) && word.length > 3)
            .slice(0, 5); // Get top 5 keywords
        
        return keywords;
    },

    generateTitle(prompt, keywords) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Diwali
        if (lowerPrompt.includes('diwali') || lowerPrompt.includes('दिवाली')) {
            const titles = ['Celebrate Diwali - Festival of Lights', 'Diwali 2026 - Illuminate Your World', 'Divine Light, Endless Joy - Diwali', 'Light Up Your Life', 'Blessed Diwali Festival'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Christmas
        if (lowerPrompt.includes('christmas')) {
            const titles = ['Magical Christmas 2026', 'Christmas Joy & Wonder', 'Festive Holiday Season', 'Merry Christmas Celebration', 'Holiday Magic Awaits'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // New Year
        if (lowerPrompt.includes('new year') || lowerPrompt.includes('newyear') || lowerPrompt.includes('eve') || lowerPrompt.includes('fireworks')) {
            const titles = ['Welcome 2026', 'New Year, New Dreams', 'Fresh Start Begins', 'Celebrate the New Year', 'New Possibilities Await'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Easter
        if (lowerPrompt.includes('easter') || lowerPrompt.includes('egg') || lowerPrompt.includes('bunny')) {
            const titles = ['Happy Easter Celebration', 'Easter Joy & Renewal', 'Celebrate Easter Together', 'Easter Magic Time', 'Spring Easter Blessings'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Halloween
        if (lowerPrompt.includes('halloween') || lowerPrompt.includes('pumpkin') || lowerPrompt.includes('spooky')) {
            const titles = ['Spooky Halloween Party', 'Halloween Thrills Await', 'Trick & Treat Night', 'Halloween Magic Hour', 'Spooktacular Fun'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Valentine
        if (lowerPrompt.includes('valentine') || lowerPrompt.includes('love') || lowerPrompt.includes('romantic')) {
            const titles = ['Romantic Valentine Day', 'Love is in the Air', 'Valentine Elegance', 'Heart & Soul Celebration', 'Love Story Begins'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Birthday
        if (lowerPrompt.includes('birthday') || lowerPrompt.includes('balloon') || lowerPrompt.includes('celebration')) {
            const titles = ['Happy Birthday Celebration', 'Make a Wish Today', 'Birthday Magic & Joy', 'Celebrate Life', 'Another Year Brighter'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Wedding
        if (lowerPrompt.includes('wedding') || lowerPrompt.includes('ceremony') || lowerPrompt.includes('bride') || lowerPrompt.includes('groom')) {
            const titles = ['Elegant Wedding Celebration', 'Two Hearts, One Love', 'Forever Starts Today', 'Wedding Day Bliss', 'Love & Commitment Forever'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Graduation
        if (lowerPrompt.includes('graduation') || lowerPrompt.includes('graduate') || lowerPrompt.includes('academic')) {
            const titles = ['Graduation Day Success', 'Academic Achievement Unlocked', 'Graduate with Pride', 'New Horizons Await', 'Celebrating Your Success'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Baby Shower
        if (lowerPrompt.includes('baby') || lowerPrompt.includes('shower')) {
            const titles = ['Baby Shower Celebration', 'New Beginning Arrives', 'Baby Joy Awaits', 'Bundle of Joy Coming', 'Welcome Baby Party'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Beach
        if (lowerPrompt.includes('beach') || lowerPrompt.includes('ocean') || lowerPrompt.includes('sand')) {
            const titles = ['Summer Beach Escape', 'Ocean Paradise Awaits', 'Beach Vibes Only', 'Sun, Sand & Relaxation', 'Tropical Getaway'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Mountain
        if (lowerPrompt.includes('mountain') || lowerPrompt.includes('hiking') || lowerPrompt.includes('peak')) {
            const titles = ['Mountain Adventure Calls', 'Reach New Heights', 'Adventure on the Peak', 'Mountain Quest Begins', 'Trail to Glory'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Fitness
        if (lowerPrompt.includes('fitness') || lowerPrompt.includes('gym') || lowerPrompt.includes('workout') || lowerPrompt.includes('challenge')) {
            const titles = ['Fitness Challenge Unleash', 'Transform Your Body', 'Strength Awaits You', 'Fitness Goals Achieved', 'Power Up Your Fitness'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Tech
        if (lowerPrompt.includes('tech') || lowerPrompt.includes('innovation')) {
            const titles = ['Tech Innovation Summit', 'Future Technology Today', 'Digital Revolution', 'Tech Breakthroughs', 'Innovation Unleashed'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Gaming
        if (lowerPrompt.includes('gaming') || lowerPrompt.includes('game') || lowerPrompt.includes('tournament') || lowerPrompt.includes('esports')) {
            const titles = ['Gaming Championship Arena', 'Battle Royale Begins', 'Victory Awaits Players', 'Gaming Legends Rise', 'Tournament Showdown'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Music
        if (lowerPrompt.includes('music') || lowerPrompt.includes('concert') || lowerPrompt.includes('festival') || lowerPrompt.includes('performance')) {
            const titles = ['Music Festival Spectacular', 'Live Concert Experience', 'Melodic Journey Begins', 'Festival Vibes Only', 'Sound of Joy'];
            return titles[Math.floor(Math.random() * titles.length)];
        }

        // Default title generation
        if (keywords.length > 0) {
            const templates = [
                (k) => `Elevate Your ${this.capitalize(k)}`,
                (k) => `Next Level ${this.capitalize(k)}`,
                (k) => `Master ${this.capitalize(k)} Today`
            ];
            const tmpl = templates[Math.floor(Math.random() * templates.length)];
            return tmpl(keywords[0]);
        }

        return `Discover ${prompt}`;
    },

    generateDescription(prompt, keywords) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Diwali
        if (lowerPrompt.includes('diwali')) {
            const desc = ['Celebrate the triumph of light over darkness. A festival of joy, prosperity, and togetherness awaits you.', 'Light up your world with the magic of Diwali. Experience spirituality, joy, and endless blessings.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Christmas
        if (lowerPrompt.includes('christmas')) {
            const desc = ['Share the warmth and joy of Christmas. Create magical moments with loved ones this festive season.', 'Experience the enchantment of Christmas. Celebrate joy, love, and the spirit of giving.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // New Year
        if (lowerPrompt.includes('new year') || lowerPrompt.includes('newyear') || lowerPrompt.includes('eve')) {
            const desc = ['Start fresh with new dreams and goals. Make 2026 your best year with determination and vision.', 'Embrace new opportunities ahead. Transform your dreams into reality this exciting new year.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Birthday
        if (lowerPrompt.includes('birthday') || lowerPrompt.includes('balloon')) {
            const desc = ['Make a wish and celebrate you! Another year of adventures, laughter, and amazing moments awaits.', 'Your special day is here. Celebrate the joy of life, friendship, and new chapters ahead.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Wedding
        if (lowerPrompt.includes('wedding') || lowerPrompt.includes('ceremony') || lowerPrompt.includes('bride')) {
            const desc = ['Two hearts become one. Celebrate love, commitment, and the beginning of forever together.', 'A day of elegance and romance. Marriage is a beautiful journey of love and togetherness.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Graduation
        if (lowerPrompt.includes('graduation') || lowerPrompt.includes('academic')) {
            const desc = ['Celebrate your achievement! You\'ve earned this success through dedication and hard work.', 'Graduation day marks a new beginning. Step into the future with confidence and pride.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Baby
        if (lowerPrompt.includes('baby') || lowerPrompt.includes('shower')) {
            const desc = ['A new bundle of joy is on the way! Celebrate this wonderful life milestone with love.', 'Welcome the newest family member. A time of happiness, hope, and beautiful new beginnings.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Beach
        if (lowerPrompt.includes('beach') || lowerPrompt.includes('ocean') || lowerPrompt.includes('sand')) {
            const desc = ['Escape to paradise. Feel the sun, sand, and sea breeze of ultimate relaxation.', 'Beach life is calling. Unwind and rejuvenate in tropical paradise awaiting you.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Mountain
        if (lowerPrompt.includes('mountain') || lowerPrompt.includes('hiking') || lowerPrompt.includes('peak')) {
            const desc = ['Adventure awaits on the mountain. Experience breathtaking views and thrilling exploration.', 'Reach new heights. Challenge yourself and discover the beauty of nature from the peaks.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Fitness
        if (lowerPrompt.includes('fitness') || lowerPrompt.includes('gym') || lowerPrompt.includes('workout') || lowerPrompt.includes('strength')) {
            const desc = ['Transform your body and mind. Unlock your full potential through dedication and fitness.', 'Strength starts within. Challenge yourself and achieve your health and fitness goals.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Tech
        if (lowerPrompt.includes('tech') || lowerPrompt.includes('innovation')) {
            const desc = ['Innovation shaping the future. Discover cutting-edge technology and digital transformation.', 'Technology revolution begins here. Explore the possibilities of tomorrow, today.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Gaming
        if (lowerPrompt.includes('gaming') || lowerPrompt.includes('tournament') || lowerPrompt.includes('esports')) {
            const desc = ['Battle it out for glory! Competition, skill, and excitement await in the arena.', 'Gaming excellence awaits. Compete, conquer, and claim your victory.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Music/Festival
        if (lowerPrompt.includes('music') || lowerPrompt.includes('concert') || lowerPrompt.includes('festival')) {
            const desc = ['Feel the rhythm and energy. Experience live music and unforgettable concert moments.', 'Festival magic in the air. Join thousands celebrating music, art, and pure joy.'];
            return desc[Math.floor(Math.random() * desc.length)];
        }

        // Default
        if (keywords.length > 0) {
            return `Discover amazing features and possibilities in ${keywords[0]}. Experience excellence and innovation.`;
        }

        return "Experience excellence and innovation with cutting-edge solutions designed for your success.";
    },

    capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    },

    drawBannerImage(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Check if this is a special themed banner (like Diwali)
        const lowerTitle = title.toLowerCase();
        const theme = this.detectTheme(lowerTitle);

        // Theme-specific drawing functions
        switch(theme) {
            case 'diwali':
                this.drawDiwaliBanner(ctx, title, description);
                break;
            case 'christmas':
                this.drawChristmasBanner(ctx, title, description);
                break;
            case 'newyear':
                this.drawNewYearBanner(ctx, title, description);
                break;
            case 'easter':
                this.drawEasterBanner(ctx, title, description);
                break;
            case 'halloween':
                this.drawHalloweenBanner(ctx, title, description);
                break;
            case 'valentine':
                this.drawValentineBanner(ctx, title, description);
                break;
            case 'birthday':
                this.drawBirthdayBanner(ctx, title, description);
                break;
            case 'business':
                this.drawBusinessBanner(ctx, title, description);
                break;
            case 'conference':
                this.drawConferenceBanner(ctx, title, description);
                break;
            case 'marketing':
                this.drawMarketingBanner(ctx, title, description);
                break;
            case 'food':
                this.drawFoodBanner(ctx, title, description);
                break;
            case 'coffee':
                this.drawCoffeeBanner(ctx, title, description);
                break;
            case 'bakery':
                this.drawBakeryBanner(ctx, title, description);
                break;
            case 'travel':
                this.drawTravelBanner(ctx, title, description);
                break;
            case 'beach':
                this.drawBeachBanner(ctx, title, description);
                break;
            case 'mountain':
                this.drawMountainBanner(ctx, title, description);
                break;
            case 'fitness':
                this.drawFitnessBanner(ctx, title, description);
                break;
            case 'health':
                this.drawHealthBanner(ctx, title, description);
                break;
            case 'beauty':
                this.drawBeautyBanner(ctx, title, description);
                break;
            case 'tech':
                this.drawTechBanner(ctx, title, description);
                break;
            case 'data':
                this.drawDataBanner(ctx, title, description);
                break;
            case 'fashion':
                this.drawFashionBanner(ctx, title, description);
                break;
            case 'sale':
                this.drawSaleBanner(ctx, title, description);
                break;
            case 'sports':
                this.drawSportsBanner(ctx, title, description);
                break;
            case 'gaming':
                this.drawGamingBanner(ctx, title, description);
                break;
            case 'nature':
                this.drawNatureBanner(ctx, title, description);
                break;
            case 'garden':
                this.drawGardenBanner(ctx, title, description);
                break;
            case 'music':
                this.drawMusicBanner(ctx, title, description);
                break;
            case 'movie':
                this.drawMovieBanner(ctx, title, description);
                break;
            default:
                this.drawBusinessBanner(ctx, title, description);
        }

        return canvas.toDataURL('image/png');
    },

    detectTheme(text) {
        // Festival & Holiday Themes
        if (text.includes('diwali') || text.includes('दिवाली') || text.includes('lamp') || text.includes('golden')) return 'diwali';
        if (text.includes('christmas') || text.includes('tree') || text.includes('snow')) return 'christmas';
        if (text.includes('new year') || text.includes('newyear') || text.includes('fireworks') || text.includes('eve')) return 'newyear';
        if (text.includes('easter') || text.includes('egg') || text.includes('bunny')) return 'easter';
        if (text.includes('halloween') || text.includes('pumpkin') || text.includes('spooky')) return 'halloween';
        if (text.includes('valentine') || text.includes('love') || text.includes('romantic')) return 'valentine';
        if (text.includes('birthday') || text.includes('balloon') || text.includes('celebration')) return 'birthday';
        
        // Life Events
        if (text.includes('wedding') || text.includes('ceremony') || text.includes('bride') || text.includes('groom')) return 'birthday'; // Use birthday banner style = elegant
        if (text.includes('graduation') || text.includes('graduate') || text.includes('academic')) return 'birthday'; // Use birthday theme
        if (text.includes('baby') || text.includes('shower')) return 'birthday'; // Use birthday theme
        
        // Business & Corporate
        if (text.includes('business') || text.includes('startup') || text.includes('corporate') || text.includes('professional')) return 'business';
        if (text.includes('conference') || text.includes('seminar') || text.includes('meeting')) return 'conference';
        if (text.includes('marketing') || text.includes('promotion') || text.includes('launch')) return 'marketing';
        
        // Food & Restaurant
        if (text.includes('restaurant') || text.includes('cafe') || text.includes('food') || text.includes('pizza') || text.includes('burger')) return 'food';
        if (text.includes('coffee') || text.includes('tea') || text.includes('lounge')) return 'coffee';
        if (text.includes('bakery') || text.includes('cake')) return 'bakery';
        
        // Travel & Adventure
        if (text.includes('travel') || text.includes('vacation') || text.includes('tour') || text.includes('adventure')) return 'travel';
        if (text.includes('beach') || text.includes('summer') || text.includes('ocean') || text.includes('sand')) return 'beach';
        if (text.includes('mountain') || text.includes('hiking') || text.includes('peak') || text.includes('trail')) return 'mountain';
        
        // Health & Fitness
        if (text.includes('fitness') || text.includes('gym') || text.includes('workout') || text.includes('exercise') || text.includes('challenge')) return 'fitness';
        if (text.includes('health') || text.includes('wellness') || text.includes('yoga') || text.includes('strength')) return 'health';
        if (text.includes('spa') || text.includes('beauty') || text.includes('makeup') || text.includes('glow')) return 'beauty';
        
        // Technology
        if (text.includes('tech') || text.includes('software') || text.includes('app') || text.includes('code') || text.includes('innovation')) return 'tech';
        if (text.includes('data') || text.includes('analytics') || text.includes('digital')) return 'data';
        
        // Fashion & Shopping
        if (text.includes('fashion') || text.includes('clothing') || text.includes('shop') || text.includes('store') || text.includes('style')) return 'fashion';
        if (text.includes('sale') || text.includes('discount') || text.includes('offer')) return 'sale';
        
        // Sports & Games
        if (text.includes('sport') || text.includes('cricket') || text.includes('football') || text.includes('basketball') || text.includes('trophy')) return 'sports';
        if (text.includes('gaming') || text.includes('game') || text.includes('esports') || text.includes('tournament') || text.includes('battle')) return 'gaming';
        
        // Nature & Eco
        if (text.includes('nature') || text.includes('eco') || text.includes('green') || text.includes('plant') || text.includes('forest')) return 'nature';
        if (text.includes('garden') || text.includes('flower') || text.includes('blooming') || text.includes('blooms')) return 'garden';
        
        // Music & Entertainment
        if (text.includes('music') || text.includes('concert') || text.includes('festival') || text.includes('performance') || text.includes('live')) return 'music';
        if (text.includes('movie') || text.includes('film') || text.includes('cinema')) return 'movie';
        
        // Default theme
        return 'default';
    },

    drawDiwaliBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Dark background with gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add golden light effects
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(200, 150, 150, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
        ctx.beginPath();
        ctx.arc(1000, 450, 200, 0, Math.PI * 2);
        ctx.fill();

        // Draw decorative diyas (lamps)
        this.drawDiya(ctx, 100, 500, 40);
        this.drawDiya(ctx, 1100, 500, 40);
        this.drawDiya(ctx, 600, 100, 35);

        // Draw fireworks/sparkles
        this.drawSparkles(ctx, 300, 200, 8, 'rgba(255, 215, 0, 0.8)');
        this.drawSparkles(ctx, 950, 350, 10, 'rgba(255, 100, 150, 0.8)');
        this.drawSparkles(ctx, 400, 450, 7, 'rgba(100, 200, 255, 0.8)');

        // Get today's date or use provided date
        const today = new Date();
        const dateStr = `29th March 2026`; // Diwali date as per user request

        // Title with golden color
        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 180;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.shadowColor = 'transparent';

        // Description
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        // Date footer
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, canvas.width / 2, canvas.height - 30);

        // Watermark
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('🎆 BannerApp AI 🎆', canvas.width - 20, canvas.height - 20);
    },

    drawChristmasBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Festive red-green gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a4d2e');
        gradient.addColorStop(0.5, '#2d5a3d');
        gradient.addColorStop(1, '#c41e3a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Snow effect (optimized: 30 particles instead of 50)
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3 + 1;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Title with festive colors
        ctx.font = 'bold 60px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#c41e3a';
        ctx.shadowBlur = 15;

        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 180;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.shadowColor = 'transparent';

        // Description
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        // Footer
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('🎄 Merry Christmas! 🎄', canvas.width / 2, canvas.height - 30);
    },

    drawNewYearBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Festive gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#001a4d');
        gradient.addColorStop(0.5, '#003d99');
        gradient.addColorStop(1, '#6600cc');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Confetti effect (optimized: 60 particles instead of 100)
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const color = ['#FFD700', '#FF1493', '#00CED1', '#32CD32', '#FF6347'][Math.floor(Math.random() * 5)];
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 4, 8);
        }

        // Title
        ctx.font = 'bold 70px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;

        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.shadowColor = 'transparent';

        // Description
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        // Footer
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Happy New Year 2026! ✨', canvas.width / 2, canvas.height - 30);
    },

    drawEasterBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Pastel spring gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FFB6C1');
        gradient.addColorStop(0.5, '#FFE4E1');
        gradient.addColorStop(1, '#FFC0CB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Easter eggs
        this.drawEasterEgg(ctx, 150, 150, 50, '#FF69B4');
        this.drawEasterEgg(ctx, 1050, 150, 50, '#87CEEB');
        this.drawEasterEgg(ctx, 600, 450, 45, '#FFD700');

        // Title
        ctx.font = 'bold 60px Arial, sans-serif';
        ctx.fillStyle = '#FF1493';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 8;

        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 180;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.shadowColor = 'transparent';

        // Description
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        // Footer
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FF1493';
        ctx.textAlign = 'center';
        ctx.fillText('🐰 Happy Easter! 🐣', canvas.width / 2, canvas.height - 30);
    },

    drawHalloweenBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(1, '#330000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw pumpkins
        this.drawPumpkin(ctx, 150, 450, 40);
        this.drawPumpkin(ctx, 1050, 450, 40);

        // Draw bats
        for (let i = 0; i < 5; i++) {
            this.drawBat(ctx, 200 + i * 200, 100 + Math.random() * 100);
        }

        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.fillStyle = '#FF8C00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 180;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FF8C00';
        ctx.fillText('🎃 Spooky Halloween! 👻', canvas.width / 2, canvas.height - 30);
    },

    drawValentineBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF69B4');
        gradient.addColorStop(1, '#FFB6C1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw hearts
        for (let i = 0; i < 8; i++) {
            const x = 150 + i * 140;
            this.drawHeart(ctx, x, 80, 25, '#FF1493');
            this.drawHeart(ctx, x, 520, 25, '#FF1493');
        }

        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FF1493';
        ctx.shadowBlur = 10;
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 180;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });
        ctx.shadowColor = 'transparent';

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('💕 Happy Valentine\'s Day! 💕', canvas.width / 2, canvas.height - 30);
    },

    drawBirthdayBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF6B9D');
        gradient.addColorStop(0.5, '#FFC75F');
        gradient.addColorStop(1, '#845EC2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw balloons
        for (let i = 0; i < 6; i++) {
            this.drawBalloon(ctx, 150 + i * 175, 100 + Math.random() * 100, ['#FF0000', '#0000FF', '#FFD700', '#00FF00', '#FF69B4', '#FF8C00'][i]);
        }

        ctx.font = 'bold 70px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 80));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 80) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('🎉 Happy Birthday! 🎂', canvas.width / 2, canvas.height - 30);
    },

    drawBusinessBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#003366');
        gradient.addColorStop(1, '#0066CC');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw office buildings/shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(100, 250, 150, 200);
        ctx.fillRect(300, 200, 120, 250);
        ctx.fillRect(950, 280, 140, 170);
        ctx.fillRect(1050, 220, 100, 230);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText('Professional Business Solutions', canvas.width - 20, canvas.height - 20);
    },

    drawConferenceBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw simplified seats (reduced from 24 to 12 for better performance)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                ctx.fillRect(150 + col * 170, 120 + row * 100, 20, 20);
            }
        }

        // Stage
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.fillRect(200, 350, 800, 150);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });
    },

    drawMarketingBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(1, '#FF8C42');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw target
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(150, 150, 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.fillText('Marketing Excellence', canvas.width - 20, canvas.height - 20);
    },

    drawFoodBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#F4A460');
        gradient.addColorStop(1, '#FFB347');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw food items
        this.drawHotdog(ctx, 150, 450, 35);
        this.drawPizza(ctx, 1050, 450, 35);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#8B4513';
        ctx.fillText('🍕 Delicious Food! 🍔', canvas.width / 2, canvas.height - 30);
    },

    drawCoffeeBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#A0522D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw coffee cups
        this.drawCoffee(ctx, 150, 450, 35);
        this.drawCoffee(ctx, 1050, 450, 35);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#F5DEB3';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#F5DEB3';
        ctx.fillText('☕ Coffee Lovers! ☕', canvas.width / 2, canvas.height - 30);
    },

    drawBakeryBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FFE4B5');
        gradient.addColorStop(1, '#DEB887');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw cupcakes
        for (let i = 0; i < 3; i++) {
            this.drawCupcake(ctx, 300 + i * 300, 420, 30);
        }

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#8B4513';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#C85A54';
        ctx.fillText('🧁 Sweet Bakery! 🎂', canvas.width / 2, canvas.height - 30);
    },

    drawTravelBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1E90FF');
        gradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw airplane
        this.drawAirplane(ctx, 600, 150, 40);

        // Draw mountains
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.beginPath();
        ctx.moveTo(100, 400);
        ctx.lineTo(250, 200);
        ctx.lineTo(400, 400);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(800, 400);
        ctx.lineTo(900, 150);
        ctx.lineTo(1000, 400);
        ctx.fill();

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('✈️ Adventure Awaits! 🌍', canvas.width / 2, canvas.height - 30);
    },

    drawBeachBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height / 3);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0FFFF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height / 3);

        // Water
        this.drawWater(ctx, 0, canvas.height / 3, canvas.width, canvas.height / 3, '#1E90FF');

        // Sand
        this.drawSand(ctx, 0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);

        // Draw sun
        this.drawSun(ctx, 150, 100, 50, '#FFD700');

        // Draw clouds
        this.drawClouds(ctx, 900, 80, 25, 'rgba(255, 255, 255, 0.9)');

        // Draw shells on sand
        this.drawShell(ctx, 200, 480, 15);
        this.drawShell(ctx, 450, 500, 12);
        this.drawShell(ctx, 750, 490, 14);
        this.drawShell(ctx, 1050, 510, 13);

        // Draw palm trees (simplified trees on beach)
        this.drawDetailedTree(ctx, 100, 350, 80, '#8B4513', '#228B22');
        this.drawDetailedTree(ctx, 1100, 360, 75, '#A0522D', '#2E8B57');

        // Draw grass on sand
        this.drawGrass(ctx, 0, 430, 1200, 30, '#DAA520');

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 20;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 70));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 70) + 40;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FF6347';
        ctx.fillText('🏖️ Summer Beach Fun! 🌊', canvas.width / 2, canvas.height - 30);
    },

    drawMountainBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.4);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

        // Ground
        const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.4, canvas.width, canvas.height);
        groundGradient.addColorStop(0, '#90EE90');
        groundGradient.addColorStop(1, '#7BC67B');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

        // Draw Sun
        this.drawSun(ctx, 180, 120, 40, '#FFD700');

        // Draw Clouds
        this.drawClouds(ctx, 850, 100, 28, 'rgba(255, 255, 255, 0.85)');

        // Draw mountains in background
        this.drawMountain(ctx, 50, 320, 280, 180, '#8B7355');
        this.drawMountain(ctx, 300, 330, 320, 150, '#A0826D');
        this.drawMountain(ctx, 650, 310, 300, 200, '#9B8B7B');
        this.drawMountain(ctx, 950, 340, 280, 140, '#8B7355');

        // Draw trees on mountains
        this.drawDetailedTree(ctx, 200, 280, 80, '#8B4513', '#228B22');
        this.drawDetailedTree(ctx, 550, 290, 85, '#654321', '#2E8B57');
        this.drawDetailedTree(ctx, 900, 280, 75, '#8B4513', '#228B22');

        // Draw grass/grass patches
        this.drawGrass(ctx, 50, 380, 1100, 40, '#228B22');

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 30;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 70));
        });
        ctx.shadowColor = 'transparent';

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 70) + 40;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('⛰️ Mountain Adventure! 🏔️', canvas.width / 2, canvas.height - 30);
    },

    drawFitnessBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(1, '#FF8787');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw dumbbells
        ctx.fillStyle = '#4A4A4A';
        this.drawDumbbell(ctx, 150, 450, 30);
        this.drawDumbbell(ctx, 1050, 450, 30);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('💪 Get Fit & Strong! 🏋️', canvas.width / 2, canvas.height - 30);
    },

    drawHealthBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#98FF98');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw leaves
        for (let i = 0; i < 5; i++) {
            this.drawLeaf(ctx, 200 + i * 200, 100 + Math.random() * 100);
        }

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#228B22';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(30, 100, 30, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#228B22';
        ctx.fillText('🧘 Wellness & Health! 🌿', canvas.width / 2, canvas.height - 30);
    },

    drawBeautyBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FFB6D9');
        gradient.addColorStop(1, '#FF69B4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw flowers
        for (let i = 0; i < 4; i++) {
            this.drawFlower(ctx, 250 + i * 250, 100, 30);
        }

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('✨ Beauty & Glow! 💄', canvas.width / 2, canvas.height - 30);
    },

    drawTechBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw circuit patterns
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(300, 100);
        ctx.lineTo(300, 300);
        ctx.lineTo(500, 300);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.beginPath();
        ctx.arc(100, 100, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(300, 100, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(300, 300, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(500, 300, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#00FF88';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#00FF88';
        ctx.fillText('💻 Technology & Innovation! 🚀', canvas.width / 2, canvas.height - 30);
    },

    drawDataBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bar chart
        const barColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
        const barHeights = [200, 280, 150, 240];
        ctx.fillStyle = barColors[0];
        ctx.fillRect(200, 450 - barHeights[0], 80, barHeights[0]);
        ctx.fillStyle = barColors[1];
        ctx.fillRect(320, 450 - barHeights[1], 80, barHeights[1]);
        ctx.fillStyle = barColors[2];
        ctx.fillRect(440, 450 - barHeights[2], 80, barHeights[2]);
        ctx.fillStyle = barColors[3];
        ctx.fillRect(560, 450 - barHeights[3], 80, barHeights[3]);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('📊 Data Analytics! 📈', canvas.width / 2, canvas.height - 30);
    },

    drawFashionBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#2C1B47');
        gradient.addColorStop(1, '#663399');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw dress shapes
        ctx.fillStyle = 'rgba(255, 192, 203, 0.3)';
        ctx.beginPath();
        ctx.moveTo(150, 200);
        ctx.lineTo(100, 500);
        ctx.lineTo(200, 500);
        ctx.lineTo(200, 300);
        ctx.lineTo(100, 200);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(1050, 200);
        ctx.lineTo(1000, 500);
        ctx.lineTo(1100, 500);
        ctx.lineTo(1100, 300);
        ctx.lineTo(1000, 200);
        ctx.fill();

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFB6C1';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFB6C1';
        ctx.fillText('👗 Fashion & Style! 👠', canvas.width / 2, canvas.height - 30);
    },

    drawSaleBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF4136');
        gradient.addColorStop(1, '#FF851B');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw sale tags
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(200, 150, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF4136';
        ctx.font = 'bold 30px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('50%', 200, 160);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(1000, 150, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF4136';
        ctx.fillText('OFF', 1000, 160);

        ctx.font = 'bold 70px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 85));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 85) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🛍️ Limited Sale! 💰', canvas.width / 2, canvas.height - 30);
    },

    drawSportsBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a237e');
        gradient.addColorStop(1, '#311b92');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ball
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(150, 450, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(125, 450);
        ctx.lineTo(175, 450);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(1050, 450, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(1025, 450);
        ctx.lineTo(1075, 450);
        ctx.stroke();

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('⚽ Sports & Games! 🏆', canvas.width / 2, canvas.height - 30);
    },

    drawGamingBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0D1117');
        gradient.addColorStop(1, '#161B22');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game elements
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(150 + i * 180, 100, 40, 40);
        }

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#4CAF50';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('🎮 Gaming Power! 🕹️', canvas.width / 2, canvas.height - 30);
    },

    drawNatureBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Sky to ground gradient
        const skyGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height / 2);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

        // Ground
        const groundGradient = ctx.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height);
        groundGradient.addColorStop(0, '#90EE90');
        groundGradient.addColorStop(1, '#7BC67B');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        // Draw sun
        this.drawSun(ctx, 150, 150, 40, '#FFD700');

        // Draw clouds
        this.drawClouds(ctx, 800, 100, 25, 'rgba(255, 255, 255, 0.8)');

        // Draw multiple trees
        this.drawDetailedTree(ctx, 200, 320, 120, '#8B4513', '#228B22');
        this.drawDetailedTree(ctx, 450, 340, 100, '#8B4513', '#2E8B57');
        this.drawDetailedTree(ctx, 750, 310, 130, '#A0522D', '#228B22');
        this.drawDetailedTree(ctx, 1050, 330, 110, '#8B4513', '#3CB371');

        // Draw bushes
        this.drawBush(ctx, 300, 350, 40, '#32CD32');
        this.drawBush(ctx, 600, 360, 35, '#228B22');
        this.drawBush(ctx, 900, 355, 40, '#3CB371');

        // Draw grass
        this.drawGrass(ctx, 50, 340, 1100, 40, '#228B22');

        // Draw butterflies
        this.drawButterfly(ctx, 300, 200, 20);
        this.drawButterfly(ctx, 950, 250, 18);

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#228B22';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 50;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(30, 100, 30, 0.9)';
        const descY = titleY + (titleLines.length * 75) + 30;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#228B22';
        ctx.fillText('🌲 Nature Forever! 🌿', canvas.width / 2, canvas.height - 30);
    },

    drawGardenBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        
        // Sky
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D98E');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sun
        this.drawSun(ctx, 200, 120, 35, '#FFD700');

        // Clouds
        this.drawClouds(ctx, 900, 100, 20, 'rgba(255, 255, 255, 0.7)');

        // Draw garden floor
        this.drawGrass(ctx, 50, 350, 1100, 50, '#2E7D32');

        // Draw decorative flowers (various types)
        const flowerColors = ['#FF69B4', '#FFD700', '#FF6347', '#87CEEB', '#90EE90', '#FFB6D9'];
        for (let i = 0; i < 6; i++) {
            this.drawFlower(ctx, 150 + i * 170, 320, 35, flowerColors[i]);
        }

        // Draw bushes
        this.drawBush(ctx, 100, 300, 50, '#3CB371');
        this.drawBush(ctx, 1100, 310, 50, '#2E8B57');

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#228B22';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 100;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(30, 100, 30, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 40;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FF69B4';
        ctx.fillText('🌸 Beautiful Garden! 🌺', canvas.width / 2, canvas.height - 30);
    },

    drawMusicBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#9933CC');
        gradient.addColorStop(1, '#FF1493');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw musical notes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 6; i++) {
            ctx.font = '40px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('♪', 150 + i * 170, 120 + Math.random() * 100);
        }

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('🎵 Music Festival! 🎸', canvas.width / 2, canvas.height - 30);
    },

    drawMovieBanner(ctx, title, description) {
        const canvas = ctx.canvas;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw simplified film strips (reduced from 20 to 8 rectangles for performance)
        ctx.fillStyle = '#FFD700';
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                ctx.fillRect(100 + col * 130, 50 + row * 400, 110, 80);
            }
        }

        // Draw star
        this.drawStar(ctx, 600, 250, 50, '#FFD700');

        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#FF1493';
        ctx.textAlign = 'center';
        const titleLines = this.wrapText(ctx, title, 1000);
        const titleY = 160;
        titleLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, titleY + (index * 75));
        });

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descY = titleY + (titleLines.length * 75) + 50;
        const descLines = this.wrapText(ctx, description, 1000);
        descLines.slice(0, 2).forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, descY + (index * 28));
        });

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🎬 Movie Magic! 🎥', canvas.width / 2, canvas.height - 30);
    },

    drawPumpkin(ctx, x, y, size) {
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x - 3, y - size - 5, 6, 15);
    },

    drawBat(ctx, x, y) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 20, y + 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 20, y + 5, 12, 0, Math.PI * 2);
        ctx.fill();
    },

    drawHeart(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + size / 2);
        ctx.bezierCurveTo(x, y + size / 2, x - size / 2, y - size / 4, x - size / 2, y - size / 3);
        ctx.bezierCurveTo(x - size / 2, y - size / 1.5, x, y - size / 1.2, x, y);
        ctx.bezierCurveTo(x, y - size / 1.2, x + size / 2, y - size / 1.5, x + size / 2, y - size / 3);
        ctx.bezierCurveTo(x + size / 2, y - size / 4, x, y + size / 2, x, y + size / 2);
        ctx.fill();
    },

    drawBalloon(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 20, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 30);
        ctx.lineTo(x, y + 80);
        ctx.stroke();
    },

    drawHotdog(ctx, x, y, size) {
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(x - size, y - size / 2, size * 2, size);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - size + 5, y - size / 3, size * 2 - 10, size / 1.5);
    },

    drawPizza(ctx, x, y, size) {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x - size / 3 + i * size / 3, y + size / 2, size / 6, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawCoffee(ctx, x, y, size) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + size + 2, y - size / 2, 5, size);
    },

    drawCupcake(ctx, x, y, size) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - size, y, size * 2, size);
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(x, y - size / 2, size * 1.5, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawAirplane(ctx, x, y, size) {
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x - size * 1.5, y - size / 4, size * 3, size / 2);
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 4, y + size / 4);
        ctx.lineTo(x + size / 4, y + size / 4);
        ctx.fill();
    },

    drawDumbbell(ctx, x, y, size) {
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x - size * 2, y - size / 3, size * 4, size / 1.5);
        ctx.beginPath();
        ctx.arc(x - size * 2, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 2, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    },

    drawLeaf(ctx, x, y) {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(x, y, 15, 25, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    },

    drawFlower(ctx, x, y, size, color) {
        color = color || '#FF69B4';
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            ctx.beginPath();
            ctx.arc(px, py, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        ctx.fill();
    },

    drawTree(ctx, x, y, size) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - size / 4, y + size, size / 2, size * 2);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size / 2);
        ctx.lineTo(x + size, y + size / 2);
        ctx.fill();
    },

    drawStar(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        const radius = size;
        const sides = 5;
        const step = (Math.PI * 2) / sides;
        ctx.beginPath();
        ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
        for (let i = 1; i <= sides; i++) {
            const angle = step * i;
            ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
    },

    // ===== ENHANCED NATURE & LANDSCAPE ELEMENTS =====
    
    drawDetailedTree(ctx, x, y, height, trunkColor, foliageColor) {
        // Trunk with gradient
        const trunkGradient = ctx.createLinearGradient(x - 8, y, x + 8, y);
        trunkGradient.addColorStop(0, trunkColor);
        trunkGradient.addColorStop(1, this.adjustBrightness(trunkColor, -30));
        ctx.fillStyle = trunkGradient;
        ctx.fillRect(x - 8, y, 16, height);

        // Foliage (multiple layers for depth)
        const foliageGradient = ctx.createRadialGradient(x, y - height * 0.6, 5, x, y - height * 0.6, height * 0.8);
        foliageGradient.addColorStop(0, this.adjustBrightness(foliageColor, 20));
        foliageGradient.addColorStop(1, foliageColor);
        
        ctx.fillStyle = foliageGradient;
        // Main canopy circle
        ctx.beginPath();
        ctx.ellipse(x, y - height * 0.4, height * 0.7, height * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Additional side foliage for shape
        ctx.fillStyle = foliageColor;
        ctx.beginPath();
        ctx.arc(x - height * 0.4, y - height * 0.3, height * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + height * 0.4, y - height * 0.3, height * 0.5, 0, Math.PI * 2);
        ctx.fill();
    },

    drawBush(ctx, x, y, size, color) {
        // Clustered foliage
        ctx.fillStyle = color;
        const positions = [
            [0, 0], [-size/2, size/3], [size/2, size/3], 
            [-size/3, -size/4], [size/3, -size/4]
        ];
        positions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(x + pos[0], y + pos[1], size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawGrass(ctx, x, y, width, height, color) {
        // Multiple grass blades
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < width; i += 4) {
            const randomHeight = height * (0.7 + Math.random() * 0.3);
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.quadraticCurveTo(x + i + 2, y - randomHeight * 0.5, x + i + Math.random() * 3 - 1.5, y - randomHeight);
            ctx.stroke();
        }
    },

    drawWater(ctx, x, y, width, height, baseColor) {
        // Water with gradient and waves
        const waterGradient = ctx.createLinearGradient(x, y, x, y + height);
        waterGradient.addColorStop(0, baseColor);
        waterGradient.addColorStop(1, this.adjustBrightness(baseColor, -40));
        ctx.fillStyle = waterGradient;
        ctx.fillRect(x, y, width, height);

        // Wave patterns
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        for (let wave = 0; wave < 4; wave++) {
            ctx.beginPath();
            for (let i = 0; i < width; i += 20) {
                const waveY = y + (wave * height / 4) + Math.sin(i / 20) * 8;
                if (i === 0) ctx.moveTo(x + i, waveY);
                else ctx.lineTo(x + i, waveY);
            }
            ctx.stroke();
        }
    },

    drawSand(ctx, x, y, width, height) {
        // Sandy beach texture
        const sandGradient = ctx.createLinearGradient(x, y, x, y + height);
        sandGradient.addColorStop(0, '#F4A460');
        sandGradient.addColorStop(1, '#DEB887');
        ctx.fillStyle = sandGradient;
        ctx.fillRect(x, y, width, height);

        // Sand texture dots
        ctx.fillStyle = 'rgba(139, 90, 43, 0.3)';
        for (let i = 0; i < 100; i++) {
            const sx = x + Math.random() * width;
            const sy = y + Math.random() * height;
            ctx.fillRect(sx, sy, Math.random() * 3 + 1, Math.random() * 3 + 1);
        }
    },

    drawShell(ctx, x, y, size) {
        ctx.fillStyle = '#FFB347';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const ex = x + Math.cos(angle) * size;
            const ey = y + Math.sin(angle) * size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
    },

    drawMountain(ctx, x, y, width, height, color) {
        // Single mountain peak
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width / 2, y - height);
        ctx.lineTo(x + width, y);
        ctx.fill();

        // Snow cap
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x + width / 2 - width * 0.1, y - height * 0.3);
        ctx.lineTo(x + width / 2, y - height);
        ctx.lineTo(x + width / 2 + width * 0.1, y - height * 0.3);
        ctx.fill();
    },

    drawClouds(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        const positions = [
            [0, 0], [size * 0.6, size * 0.3], [size * 1.2, 0]
        ];
        positions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(x + pos[0], y + pos[1], size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawSun(ctx, x, y, radius, color) {
        // Sun with rays
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = x + Math.cos(angle) * (radius + 10);
            const startY = y + Math.sin(angle) * (radius + 10);
            const endX = x + Math.cos(angle) * (radius + 30);
            const endY = y + Math.sin(angle) * (radius + 30);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    },

    drawButterfly(ctx, x, y, size) {
        ctx.fillStyle = '#FF69B4';
        // Left wings
        ctx.beginPath();
        ctx.ellipse(x - size * 0.5, y, size * 0.6, size * 0.8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right wings
        ctx.beginPath();
        ctx.ellipse(x + size * 0.5, y, size * 0.6, size * 0.8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 3, y - size * 0.3, 6, size * 0.6);
    },

    adjustBrightness(color, percent) {
        // Simple brightness adjustment
        if (color.startsWith('#')) {
            const num = parseInt(color.replace("#", ""), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.min(255, Math.max(0, (num >> 16) + amt));
            const G = Math.min(255, Math.max(0, (num >> 8) + amt & 0x00FF));
            const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
            return "#" + (0x1000000 + (R < 16 ? 0 : 0) * 256 + (G < 16 ? 0 : 0) * 256 + B).toString(16).slice(1);
        }
        return color;
    },

    drawEasterEgg(ctx, x, y, size) {
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const px = x + Math.cos(angle) * size * 0.6;
            const py = y + Math.sin(angle) * size * 0.9;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }
    },

    drawDiya(ctx, x, y, size) {
        // Draw a decorative diya (lamp)
        ctx.fillStyle = '#FFD700';
        
        // Lamp body
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lamp top
        ctx.beginPath();
        ctx.ellipse(x, y - size * 0.7, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flame
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(x, y - size * 1.1, size * 0.3, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x, y - size * 1.2, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    },

    drawSparkles(ctx, x, y, count, color) {
        // Optimized sparkle drawing - reduced circle quality
        ctx.fillStyle = color;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const sparkleX = x + Math.cos(angle) * 50;
            const sparkleY = y + Math.sin(angle) * 50;
            
            // Draw smaller circles for better performance
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw lines
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(sparkleX, sparkleY);
            ctx.stroke();
        }
    },

    drawEasterEgg(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.6, size, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 10, y - size);
            ctx.lineTo(x + i * 10, y + size);
            ctx.stroke();
        }
    },

    wrapText(ctx, text, maxWidth) {
        // Optimized word wrapping with better performance
        if (!text) return [];
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        // Cache for common widths
        const measureCache = {};

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            
            // Use cache to avoid remeasuring same text
            let width;
            if (measureCache[testLine]) {
                width = measureCache[testLine];
            } else {
                width = ctx.measureText(testLine).width;
                measureCache[testLine] = width;
            }
            
            if (width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    renderBanner(data) {
        this.display.classList.remove('hidden');
        document.getElementById('banner-h2').innerText = data.title;
        document.getElementById('banner-p').innerText = data.desc;
        
        // Store current banner data
        window.currentBanner = data;
        
        // Setup image element if not already done
        if (!this.bannerImage) {
            this.bannerImage = document.getElementById('banner-image');
            this.uploadInput = document.getElementById('upload-image');
            this.downloadBtn = document.getElementById('download-image');
            this.exportBtn = document.getElementById('export-banner');

            // Image upload handler
            this.uploadInput.addEventListener('change', (e) => this.handleImageUpload(e));
            
            // Download image handler
            this.downloadBtn.addEventListener('click', () => this.downloadBannerImage());
            
            // Export to JSON handler
            this.exportBtn.addEventListener('click', () => this.exportBannerToJSON());
        }
        
        // Display image with text overlay
        if (data.image) {
            console.log('✅ Loading image and adding text overlay...');
            this.addTextToImage(data.image, data.title, data.desc, (imageWithText) => {
                this.bannerImage.src = imageWithText;
                this.bannerImage.classList.remove('hidden');
                window.currentBanner.image = imageWithText;
            });
        } else {
            console.warn('⚠️ No image provided, creating canvas banner');
            this.createCanvasBanner(data);
        }
    },

    addTextToImage(imageBase64, title, description, callback) {
        // Load the image and add text overlay
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            // Draw the background image
            ctx.drawImage(img, 0, 0, 1200, 600);
            
            // Add semi-transparent overlay for text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(0, 0, 1200, 600);
            
            // Draw title
            ctx.font = 'bold 70px Arial, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Wrap and draw title
            const titleLines = this.wrapText(ctx, title, 1000);
            const titleStartY = 200;
            titleLines.forEach((line, i) => {
                ctx.fillText(line, 600, titleStartY + (i * 90));
            });
            
            // Draw description
            ctx.font = '32px Arial, sans-serif';
            ctx.fillStyle = '#F0F0F0';
            const descLines = this.wrapText(ctx, description, 1000);
            const descStartY = titleStartY + (titleLines.length * 90) + 60;
            descLines.forEach((line, i) => {
                ctx.fillText(line, 600, descStartY + (i * 50));
            });
            
            // Convert to data URL
            const imageWithText = canvas.toDataURL('image/jpeg', 0.95);
            callback(imageWithText);
        };
        img.onerror = () => {
            console.error('Failed to load image');
            // Create fallback canvas banner
            this.createCanvasBanner({ title, desc: description, theme: 'default' });
        };
        img.src = imageBase64;
    },

    createCanvasBanner(data) {
        // Create a canvas-based banner with title and description
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Get theme colors
        const theme = data.theme || 'default';
        const colors = this.getThemeColors(theme);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw decorative elements based on theme
        this.drawThemeElements(ctx, theme, colors);
        
        // Draw semi-transparent overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        ctx.font = 'bold 72px Inter, Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap title text
        const titleLines = this.wrapText(ctx, data.title, canvas.width - 100);
        const titleStartY = 150;
        titleLines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, titleStartY + (i * 90));
        });
        
        // Draw description
        ctx.font = '28px Inter, Arial, sans-serif';
        ctx.fillStyle = '#F0F0F0';
        const descLines = this.wrapText(ctx, data.desc, canvas.width - 100);
        const descStartY = titleStartY + (titleLines.length * 90) + 60;
        descLines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, descStartY + (i * 45));
        });
        
        // Convert canvas to image
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Display the canvas image
        this.bannerImage.src = imageData;
        this.bannerImage.classList.remove('hidden');
        window.currentBanner.image = imageData;
    },

    getThemeColors(theme) {
        const themeMap = {
            'festival': { primary: '#FF6B35', secondary: '#F7931E' },
            'celebration': { primary: '#667EEA', secondary: '#764BA2' },
            'wedding': { primary: '#F093FB', secondary: '#F5576C' },
            'business': { primary: '#11998E', secondary: '#38EF7D' },
            'nature': { primary: '#134E5E', secondary: '#71B280' },
            'sports': { primary: '#FA8231', secondary: '#1ABC9C' },
            'music': { primary: '#667EEA', secondary: '#764BA2' },
            'tech': { primary: '#0F2027', secondary: '#203A43' },
            'beach': { primary: '#00B4DB', secondary: '#0083B0' },
            'default': { primary: '#667EEA', secondary: '#764BA2' }
        };
        return themeMap[theme] || themeMap['default'];
    },

    drawThemeElements(ctx, theme, colors) {
        // Draw decorative elements based on theme
        ctx.fillStyle = colors.secondary;
        ctx.globalAlpha = 0.1;
        
        if (theme.includes('festival') || theme.includes('celebration')) {
            // Draw circles for festive theme
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1200, Math.random() * 600, Math.random() * 100 + 50, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (theme.includes('wedding')) {
            // Draw hearts
            ctx.font = '100px Arial';
            ctx.fillText('💕', 100, 100);
            ctx.fillText('💕', 1000, 100);
        } else if (theme.includes('beach')) {
            // Draw wave-like shapes
            ctx.strokeStyle = colors.secondary;
            ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(600, 150 + i * 150, 200, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1.0;
    },

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            this.bannerImage.src = imageData;
            this.bannerImage.classList.remove('hidden');
            window.currentBanner.image = imageData;
            alert('Image uploaded! Click "Save to JSON" to save it.');
        };
        reader.readAsDataURL(file);
    },

    downloadBannerImage() {
        if (!window.currentBanner || !window.currentBanner.image) {
            alert('No image to download');
            return;
        }

        const link = document.createElement('a');
        link.href = window.currentBanner.image;
        link.download = `banner-${Date.now()}.png`;
        link.click();
    },

    exportBannerToJSON() {
        if (!window.currentBanner || !this.currentUser) {
            alert('No banner to export');
            return;
        }

        // Save banner with image data
        const result = MockDB.saveBanner(
            this.currentUser.id,
            window.currentBanner.title,
            window.currentBanner.desc,
            window.currentBanner.image || null
        );

        if (result.success) {
            this.currentBannerId = result.id;
            alert('Banner saved to your profile!');
            this.downloadJSON();
        }
    },

    downloadJSON() {
        const data = MockDB.getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bannerapp-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => UI.init());

// Command: Export all data to JSON
// Run in browser console: ExportCommand.exportAllData()
const ExportCommand = {
    exportAllData() {
        const data = MockDB.getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        console.log('All Data:', data);
        console.log('JSON String:', dataStr);
        
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bannerapp-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },

    viewAllUsers() {
        console.table(MockDB.getUsers());
    },

    viewAllBanners() {
        console.table(JSON.parse(localStorage.getItem('app_banners')) || []);
    },

    viewUserBanners(userId) {
        console.table(MockDB.getBanners(userId));
    },

    clearAllData() {
        if (confirm('Are you sure? This will delete all data!')) {
            localStorage.removeItem('app_users');
            localStorage.removeItem('app_banners');
            localStorage.removeItem('current_user');
            console.log('All data cleared');
            location.reload();
        }
    }
};;