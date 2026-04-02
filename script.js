// --- STATE ---
let postsData = [];
let reelsData = [];
let authToken = localStorage.getItem('insta_token');
let currentUser = localStorage.getItem('insta_user') || "first_semester_coder";

// --- ELEMENTS ---
const feedContainer = document.getElementById('feed');
const profileGrid = document.getElementById('profile-grid');
const reelsContainer = document.getElementById('reels-view');
const postCountText = document.getElementById('profile-post-count');

const navIcons = document.querySelectorAll('.nav-icon');
const views = document.querySelectorAll('.view');
const appTitle = document.getElementById('app-title');
const appHeader = document.querySelector('.app-header');
const bottomNav = document.querySelector('.bottom-nav');

const mediaUpload = document.getElementById('media-upload');
const uploadStatus = document.getElementById('upload-status');
const inputCaption = document.getElementById('new-post-caption');
const imagePreview = document.getElementById('image-preview');
const shareBtn = document.getElementById('share-btn');

// Login Elements
const loginView = document.getElementById('login-view');
const loginBtn = document.getElementById('login-btn');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// --- 0. AUTHENTICATION LOGIC ---
async function apiFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (authToken) options.headers['Authorization'] = `Bearer ${authToken}`;
    
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Unauthorized");
    }
    return response;
}

loginBtn.addEventListener('click', async () => {
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;
    
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            loginError.textContent = data.error || "Login failed";
            return;
        }
        
        // Success
        authToken = data.token;
        currentUser = data.username;
        localStorage.setItem('insta_token', authToken);
        localStorage.setItem('insta_user', currentUser);
        
        // Load data and show app
        loginError.textContent = "";
        await bootApp();
        
    } catch (e) {
        loginError.textContent = "Server connection error.";
    }
});

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('insta_token');
    localStorage.removeItem('insta_user');
    
    // Hide app, show login
    views.forEach(v => v.classList.remove('active'));
    loginView.classList.add('active');
    appHeader.style.display = 'none';
    bottomNav.style.display = 'none';
}

function showApp() {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById('home-view').classList.add('active');
    appHeader.style.display = 'flex';
    bottomNav.style.display = 'flex';
    
    // Reset nav
    navIcons.forEach(i => i.classList.remove('active', 'fa-solid'));
    navIcons.forEach(i => i.classList.add('fa-regular')); 
    navIcons[0].classList.remove('fa-regular');
    navIcons[0].classList.add('active', 'fa-solid');
    
    // Update profile username
    document.querySelector('.bio-name').textContent = currentUser;
}


// --- 1. NAVIGATION LOGIC ---
navIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
        navIcons.forEach(i => i.classList.remove('active', 'fa-solid'));
        navIcons.forEach(i => i.classList.add('fa-regular')); 
        views.forEach(v => v.classList.remove('active')); 

        e.target.classList.remove('fa-regular');
        e.target.classList.add('active', 'fa-solid'); 

        const targetViewId = e.target.getAttribute('data-target');
        document.getElementById(targetViewId).classList.add('active');

        if (targetViewId === 'reels-view') {
            appHeader.style.display = 'none'; 
        } else {
            appHeader.style.display = 'flex'; 
            if (targetViewId === 'home-view') appTitle.textContent = 'Instagram';
            else if (targetViewId === 'add-post-view') appTitle.textContent = 'New Upload';
            else if (targetViewId === 'profile-view') appTitle.textContent = currentUser;
        }
    });
});

// --- 2. NEW UPLOAD LOGIC ---
mediaUpload.addEventListener('change', () => {
    const file = mediaUpload.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        imagePreview.style.backgroundImage = `url(${url})`;
        imagePreview.innerHTML = '';
    } else {
        imagePreview.style.backgroundImage = 'none';
        imagePreview.innerHTML = '<span>Preview Placeholder</span>';
    }
});

shareBtn.addEventListener('click', async () => {
    const file = mediaUpload.files[0];
    if (!file) { alert("Please provide a file!"); return; }
    
    // Check our new Dropdown to see what the user wants to post!
    const postType = document.getElementById('post-type').value;

    const formData = new FormData();
    formData.append('username', currentUser);
    formData.append('userImage', `https://ui-avatars.com/api/?name=${currentUser}&background=random`);
    formData.append('caption', inputCaption.value);
    formData.append('media', file);

    try {
        shareBtn.disabled = true;
        uploadStatus.style.display = 'block';
        shareBtn.textContent = 'Uploading...';

        if (postType === 'photo') {
            await apiFetch('http://localhost:3000/api/posts/new', {
                method: 'POST', body: formData
            });
            await loadPostsFromBackend();
            navIcons[0].click(); // Take user to Feed View
        } else {
            await apiFetch('http://localhost:3000/api/reels/new', {
                method: 'POST', body: formData
            });
            await loadReelsFromBackend();
            navIcons[1].click(); // Take user directly to Reels View
        }

        // Clean up text boxes
        mediaUpload.value = ''; inputCaption.value = '';
        imagePreview.style.backgroundImage = 'none'; imagePreview.innerHTML = '<span>Preview Placeholder</span>';
        
    } catch (error) { 
        console.error("Failed to create", error); 
        alert("Failed to upload. Check console.");
    } finally {
        shareBtn.disabled = false;
        uploadStatus.style.display = 'none';
        shareBtn.textContent = 'Share';
    }
});

// --- 3. FETCHING & DRAWING DATA ---
async function loadPostsFromBackend() {
    try {
        const response = await apiFetch('http://localhost:3000/api/posts');
        postsData = await response.json();
        postsData.reverse(); 
        renderFeed();
        renderProfile();
    } catch (error) { console.error("Connection error:", error); }
}

async function loadReelsFromBackend() {
    try {
        const response = await apiFetch('http://localhost:3000/api/reels');
        reelsData = await response.json();
        reelsData.reverse(); // Show newest reels first!
        renderReels();
    } catch (error) { console.error("Reels Connection error:", error); }
}

function renderFeed() {
    feedContainer.innerHTML = '';
    postsData.forEach((post, index) => {
        const postElement = document.createElement('article');
        postElement.className = 'post';
        const isActuallyLiked = post.isLiked === 1 || post.isLiked === true;
        postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${post.userImage}" alt="Profile" class="profile-pic">
                    <span class="username">${post.username}</span>
                </div>
                <i class="fa-solid fa-ellipsis"></i>
            </div>
            
            <div class="post-image">
                <img src="${post.postImage}" class="main-image" data-index="${index}">
            </div>

            <div class="post-actions">
                <div class="action-buttons">
                    <i class="${isActuallyLiked ? 'fa-solid liked' : 'fa-regular'} fa-heart like-btn" data-index="${index}"></i>
                    <i class="fa-regular fa-comment"></i>
                    <i class="fa-regular fa-paper-plane"></i>
                </div>
                <i class="fa-regular fa-bookmark"></i>
            </div>

            <div class="post-likes"><span class="like-count">${post.likes.toLocaleString()}</span> likes</div>
            <div class="post-caption"><span class="username">${post.username}</span> ${post.caption}</div>
        `;
        feedContainer.appendChild(postElement);
    });
    attachEventListeners();
}

function renderProfile() {
    profileGrid.innerHTML = '';
    const myPosts = postsData.filter(post => post.username === currentUser);
    postCountText.textContent = myPosts.length;
    myPosts.forEach(post => {
        const img = document.createElement('img');
        img.src = post.postImage;
        img.className = 'grid-item'; 
        profileGrid.appendChild(img);
    });
}

function renderReels() {
    reelsContainer.innerHTML = '';
    
    reelsData.forEach(reel => {
        const reelEl = document.createElement('div');
        reelEl.className = 'reel-container';
        
        reelEl.innerHTML = `
            <video class="reel-video" src="${reel.videoUrl}" loop muted playsinline></video>
            
            <div class="reel-overlay">
                <div class="reel-username">
                    <img src="${reel.userImage}" class="profile-pic" style="width: 28px; height: 28px;">
                    ${reel.username}
                </div>
                <div class="reel-caption">${reel.caption}</div>
            </div>
            
            <div class="reel-actions">
                <i class="fa-regular fa-heart"><span>${reel.likes.toLocaleString()}</span></i>
                <i class="fa-regular fa-comment"><span>120</span></i>
                <i class="fa-solid fa-share"><span>Share</span></i>
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </div>
        `;
        reelsContainer.appendChild(reelEl);
    });
    
    setupVideoScrollSnapping();
}

function setupVideoScrollSnapping() {
    const videos = document.querySelectorAll('.reel-video');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) video.play();
            else video.pause(); 
        });
    }, { threshold: 0.6 }); 
    
    videos.forEach(video => {
        observer.observe(video);
        video.addEventListener('click', () => {
            if (video.paused) video.play();
            else video.pause();
        });
    });
}

function attachEventListeners() {
    const likeBtns = document.querySelectorAll('.like-btn');
    const images = document.querySelectorAll('.main-image');
    likeBtns.forEach(button => button.addEventListener('click', (event) => toggleLike(event.target.getAttribute('data-index'))));
    images.forEach(image => {
        image.addEventListener('dblclick', (event) => {
            const index = event.target.getAttribute('data-index');
            const isActuallyLiked = postsData[index].isLiked === 1 || postsData[index].isLiked === true;
            if (!isActuallyLiked) toggleLike(index);
        });
    });
}

async function toggleLike(index) {
    const post = postsData[index];
    const isActuallyLiked = post.isLiked === 1 || post.isLiked === true;
    
    const newIsLiked = !isActuallyLiked;
    post.isLiked = newIsLiked ? 1 : 0; 
    
    if (newIsLiked) post.likes++;
    else post.likes--;
    
    renderFeed(); 
    try {
        await apiFetch(`http://localhost:3000/api/posts/${post.id}/like`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLiked: post.isLiked, likes: post.likes })
        });
    } catch (error) { console.error("Failed to save like", error); }
}

// --- BOOTUP LOGIC ---
async function bootApp() {
    if (authToken) {
        try {
            await loadPostsFromBackend();
            await loadReelsFromBackend();
            showApp();
        } catch (error) {
            console.log("Token invalid or expired");
        }
    } else {
        logout();
    }
}

// Start sequence
bootApp();
