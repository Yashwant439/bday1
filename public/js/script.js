// script.js — updated for photo background, responsive gallery, searchable names & birthday-only validation

document.addEventListener('DOMContentLoaded', function() {
    initDecorParallax();
    initNavigation();
    initVideoCarousel();
    initMusicPlayer();
    startConfetti();
    initPhotoGrid();
    initLightboxHandlers();
});

/* ---------- Background parallax + subtle candle flicker ---------- */
function initDecorParallax() {
    // slight parallax on mouse move for the background image
    const bg = document.querySelector('.bg-photo');
    if (!bg) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 6;
        bg.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
    });

    // candle flicker animation achieved in CSS (class .candle-flicker)
}

/* ---------- Navigation System (responsive-friendly) ---------- */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                    // small scroll for mobile
                    setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 60);
                }
            });
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.toggle('active', nav.getAttribute('data-target') === sectionId));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    section.classList.add('active');
    section.scrollIntoView({ behavior: 'smooth' });
}

/* ---------- Photo Grid (responsive masonry-like) ---------- */
function initPhotoGrid() {
    const grid = document.getElementById('photoGrid');
    if (!grid) return;

    // Add click handler for lightbox
    grid.addEventListener('click', (e) => {
        const figure = e.target.closest('.photo-card');
        if (!figure) return;
        const img = figure.querySelector('img');
        const caption = figure.querySelector('figcaption')?.textContent || '';
        openLightbox(img.src, caption);
    });

    // Simple layout: adjust column count depending on width (CSS handles it)
}

/* ---------- Lightbox ---------- */
function initLightboxHandlers() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    img.src = src;
    img.alt = caption || 'Memory photo';
    cap.textContent = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.getElementById('lightboxImg').src = '';
}

/* ---------- Video Carousel (drag / swipe) ---------- */
function initVideoCarousel() {
    const carousel = document.getElementById('videoCarousel');
    if (!carousel) return;

    let isDown = false, startX, scrollLeft;

    // Mouse
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.classList.add('dragging');
    });
    carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mouseup', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('touchend', () => isDown = false);
    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

/* ---------- Music Player ---------- */
function initMusicPlayer() {
    const music = document.getElementById('bgMusic');
    const toggleBtn = document.querySelector('.music-toggle');
    if (!music || !toggleBtn) return;

    // warm default volume
    music.volume = 0.25;

    // try to play on user gesture
    document.body.addEventListener('click', function initMusic() {
        music.play().catch(() => {});
        document.body.removeEventListener('click', initMusic);
    }, { once: true });
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const iconEl = document.querySelector('.music-toggle i');
    if (!music) return;
    if (music.paused) {
        music.play();
        iconEl.classList.remove('fa-music');
        iconEl.classList.add('fa-pause');
    } else {
        music.pause();
        iconEl.classList.remove('fa-pause');
        iconEl.classList.add('fa-music');
    }
}

/* ---------- Wish System (with birthday-only validation) ---------- */
async function addWish() {
    const nameInput = document.getElementById('nameInput');
    const messageTextarea = document.getElementById('wishMessage');

    const name = (nameInput.value || '').trim();
    const message = (messageTextarea.value || '').trim();

    if (!name) {
        showNotification('Please enter or select your name!', 'error');
        nameInput.focus();
        return;
    }
    if (!message) {
        showNotification('Please write a birthday wish!', 'error');
        messageTextarea.focus();
        return;
    }

    // birthday-only validation: must contain "birthday" or "happy" or one of the birthday emojis
    const lowered = message.toLowerCase();
    const hasBirthdayKeywords = /birthday|happy/.test(lowered);
    const hasEmoji = /🎂|🎉|🥳|🎁/.test(message);

    if (!hasBirthdayKeywords && !hasEmoji) {
        showNotification("Please include 'birthday' or 'happy' or a birthday emoji (🎂 🎉 🥳).", 'error');
        messageTextarea.focus();
        return;
    }

    // sanitize simple (server should also sanitize) — escape dangerous chars for safety in client-side insertion
    const safeMessage = escapeHtml(message);

    try {
        const response = await fetch('/add-wish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message: safeMessage })
        });

        const result = await response.json();

        if (result.success) {
            addWishToDOM(result.wish);
            messageTextarea.value = '';
            nameInput.value = '';
            showNotification('Wish sent successfully! 🎉', 'success');
            createConfettiBurst();
        } else {
            showNotification(result.error || 'Failed to send wish', 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('Network error. Try again.', 'error');
    }
}

/* addWishToDOM / toggleLike — reuse your existing structure, sanitize input shown */
function addWishToDOM(wish) {
    const wishesGrid = document.getElementById('wishesGrid');
    if (!wishesGrid) return;

    const div = document.createElement('div');
    div.className = 'wish-card';
    div.setAttribute('data-wish-id', wish.id || Date.now());
    div.innerHTML = `
        <div class="wish-card-inner">
            <div class="wish-header">
                <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="wish-info">
                    <h4 class="wish-name">${escapeHtml(wish.name)}</h4>
                    <span class="wish-time">${escapeHtml(wish.timestamp || new Date().toLocaleString())}</span>
                </div>
            </div>
            <p class="wish-text">${escapeHtml(wish.message)}</p>
            <div class="wish-actions">
                <button class="wish-like" onclick="toggleLike(this)"><i class="far fa-heart"></i></button>
            </div>
        </div>
    `;
    wishesGrid.insertBefore(div, wishesGrid.firstChild);
    setTimeout(() => div.classList.add('loaded'), 80);
}

function toggleLike(btn) {
    const icon = btn.querySelector('i');
    if (!icon) return;
    const liked = icon.classList.toggle('fas');
    icon.classList.toggle('far', !liked);
    icon.style.color = liked ? '#ff6b6b' : '';
}

/* ---------- Notifications (same as before) ---------- */
function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerHTML = `<div class="notification-content"><i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${escapeHtml(message)}</span></div>`;
    document.body.appendChild(n);

    setTimeout(() => n.classList.add('show'), 80);
    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => n.remove(), 350);
    }, 3200);
}

/* ---------- Confetti (optimized, smaller for mobile) ---------- */
function startConfetti() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
}

function createConfettiBurst() {
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const count = Math.min(120, Math.floor(window.innerWidth / 8));
    const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#ff9ff3', '#e0e0e0'];
    const confetti = [];
    for (let i = 0; i < count; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * 200,
            w: 6 + Math.random() * 10,
            h: 6 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: 2 + Math.random() * 4,
            vx: -2 + Math.random() * 4,
            rot: Math.random() * Math.PI
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.rot += 0.05;
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();
        });
        if (confetti.some(c => c.y < canvas.height + 50)) {
            requestAnimationFrame(render);
        }
    }
    render();
}

/* ---------- Small helper ---------- */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
