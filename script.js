document.addEventListener('DOMContentLoaded', () => {

    // ── Smooth Scroll for Anchor Links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Navbar Scroll Effect ──
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;

    function handleNavbarScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // ── Reveal on Scroll (Intersection Observer) ──
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Scroll-driven Phone Showcase ──
    const showcaseSection = document.querySelector('.interface-section');
    const showcaseSpacer = document.querySelector('.showcase-scroll-spacer');
    const showcaseDevice = document.querySelector('.showcase-device');
    const showcaseCursor = document.getElementById('showcaseCursor');
    const showcaseRipple = document.getElementById('showcaseRipple');
    const showcaseLabel = document.querySelector('.showcase-label-text');
    const showcaseHint = document.getElementById('showcaseHint');
    const showcaseScreens = document.querySelectorAll('.showcase-screen');
    const showcaseDots = document.querySelectorAll('.showcase-dot');

    if (showcaseSection && showcaseSpacer && showcaseDevice && showcaseScreens.length > 0) {
        // Configurations for each screen and interactive click targets
        const screenConfigs = [
            { label: 'Tela Inicial', clickTop: '54%', clickLeft: '50%' }, // "Entrar" on Tela Inicial
            { label: 'Login', clickTop: '64%', clickLeft: '50%' },        // "Entrar" on Login
            { label: 'Hábitos', clickTop: '50%', clickLeft: '50%' }       // Dashboard
        ];

        let currentScreen = 0;
        let isClickAnimating = false;
        let clickTimeouts = [];

        function clearClickAnimation() {
            clickTimeouts.forEach(t => clearTimeout(t));
            clickTimeouts = [];
            if (showcaseCursor) {
                showcaseCursor.classList.remove('is-clicking');
            }
            if (showcaseRipple) {
                showcaseRipple.classList.remove('is-animating');
            }
            isClickAnimating = false;
        }

        function setScreen(index) {
            if (index < 0 || index >= showcaseScreens.length) return;

            const prevScreen = currentScreen;
            currentScreen = index;

            showcaseScreens.forEach((screen, i) => {
                screen.classList.remove('showcase-screen--active', 'showcase-screen--exit');
                if (i === prevScreen && i !== index) {
                    screen.classList.add('showcase-screen--exit');
                }
                if (i === index) {
                    screen.classList.add('showcase-screen--active');
                }
            });

            // Update dots
            showcaseDots.forEach((dot, i) => {
                dot.classList.toggle('showcase-dot--active', i === index);
            });

            // Update label
            if (showcaseLabel && screenConfigs[index]) {
                showcaseLabel.textContent = screenConfigs[index].label;
            }
        }

        function triggerClickTransition(fromScreen, toScreen) {
            clearClickAnimation();
            isClickAnimating = true;

            const config = screenConfigs[fromScreen] || screenConfigs[0];

            if (showcaseCursor) {
                showcaseCursor.style.top = config.clickTop;
                showcaseCursor.style.left = config.clickLeft;
                showcaseCursor.classList.add('is-visible');
            }

            // Click down
            const t1 = setTimeout(() => {
                if (showcaseCursor) showcaseCursor.classList.add('is-clicking');

                if (showcaseRipple) {
                    showcaseRipple.style.top = config.clickTop;
                    showcaseRipple.style.left = config.clickLeft;
                    showcaseRipple.classList.remove('is-animating');
                    void showcaseRipple.offsetWidth; // trigger reflow
                    showcaseRipple.classList.add('is-animating');
                }

                // Switch screen
                const t2 = setTimeout(() => {
                    setScreen(toScreen);
                    if (showcaseCursor) showcaseCursor.classList.remove('is-clicking');

                    // If final screen (Hábitos), fade cursor away
                    if (toScreen === 2 && showcaseCursor) {
                        showcaseCursor.classList.remove('is-visible');
                    }

                    const t3 = setTimeout(() => {
                        if (showcaseRipple) showcaseRipple.classList.remove('is-animating');
                        isClickAnimating = false;
                    }, 400);
                    clickTimeouts.push(t3);
                }, 130);
                clickTimeouts.push(t2);
            }, 100);
            clickTimeouts.push(t1);
        }

        // Track target phase to detect forward/backward steps
        let lastTargetScreen = -1;

        function handleShowcaseScroll() {
            const rect = showcaseSpacer.getBoundingClientRect();
            const scrollRange = showcaseSpacer.offsetHeight - window.innerHeight;
            if (scrollRange <= 0) return;

            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

            // Determine target screen and zoom scale based on progress
            // Phase 0: 0.00 -> 0.33 (Tela Inicial)
            // Phase 1: 0.33 -> 0.67 (Login)
            // Phase 2: 0.67 -> 1.00 (Hábitos)
            let targetScreen = 0;
            let zoomScale = 1;

            if (progress < 0.33) {
                targetScreen = 0;
                const p = progress / 0.33;
                zoomScale = 1 + p * 0.06;

                if (!isClickAnimating && showcaseCursor) {
                    if (p > 0.20) {
                        showcaseCursor.classList.add('is-visible');
                        showcaseCursor.style.top = screenConfigs[0].clickTop;
                        showcaseCursor.style.left = screenConfigs[0].clickLeft;
                    } else {
                        showcaseCursor.classList.remove('is-visible');
                    }
                }
            } else if (progress < 0.67) {
                targetScreen = 1;
                const p = (progress - 0.33) / 0.34;
                zoomScale = 1 + p * 0.06;

                if (!isClickAnimating && showcaseCursor) {
                    if (p > 0.20) {
                        showcaseCursor.classList.add('is-visible');
                        showcaseCursor.style.top = screenConfigs[1].clickTop;
                        showcaseCursor.style.left = screenConfigs[1].clickLeft;
                    }
                }
            } else {
                targetScreen = 2;
                const p = (progress - 0.67) / 0.33;
                zoomScale = 1.06 - p * 0.06;

                if (!isClickAnimating && showcaseCursor) {
                    showcaseCursor.classList.remove('is-visible');
                }
            }

            // Apply zoom
            showcaseDevice.style.transform = `scale(${zoomScale.toFixed(3)})`;
            showcaseDevice.classList.toggle('zoomed', zoomScale > 1.03);

            // Hide scroll hint after scrolling begins
            if (showcaseHint) {
                showcaseHint.classList.toggle('is-hidden', progress > 0.04);
            }

            // Initial run
            if (lastTargetScreen === -1) {
                lastTargetScreen = targetScreen;
                setScreen(targetScreen);
                if (targetScreen === 0 && showcaseCursor) {
                    showcaseCursor.classList.remove('is-visible');
                }
                return;
            }

            // Phase transition
            if (targetScreen !== lastTargetScreen) {
                const prev = lastTargetScreen;
                lastTargetScreen = targetScreen;

                if (targetScreen > prev) {
                    // Forward scroll: animate simulated click
                    triggerClickTransition(prev, targetScreen);
                } else {
                    // Backward scroll: cleanly switch back without forward clicks
                    clearClickAnimation();
                    setScreen(targetScreen);
                    if (targetScreen === 0 && showcaseCursor) {
                        showcaseCursor.classList.remove('is-visible');
                    }
                }
            } else if (currentScreen !== targetScreen && !isClickAnimating) {
                // Failsafe: keep currentScreen in lockstep with targetScreen
                setScreen(targetScreen);
            }
        }

        // Dot click support: jump to section and change screen smoothly
        showcaseDots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const scrollRange = showcaseSpacer.offsetHeight - window.innerHeight;
                if (scrollRange <= 0) {
                    setScreen(index);
                    return;
                }
                const targetP = index === 0 ? 0.08 : (index === 1 ? 0.50 : 0.85);
                const rect = showcaseSpacer.getBoundingClientRect();
                const targetY = window.scrollY + rect.top + (targetP * scrollRange);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
            });
        });

        // Phone click support: tapping phone advances to next screen
        showcaseDevice.addEventListener('click', () => {
            const nextScreen = (currentScreen + 1) % showcaseScreens.length;
            const scrollRange = showcaseSpacer.offsetHeight - window.innerHeight;
            if (scrollRange > 0) {
                const targetP = nextScreen === 0 ? 0.08 : (nextScreen === 1 ? 0.50 : 0.85);
                const rect = showcaseSpacer.getBoundingClientRect();
                const targetY = window.scrollY + rect.top + (targetP * scrollRange);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
            } else {
                setScreen(nextScreen);
            }
        });

        // Scroll listener with requestAnimationFrame
        let scrollTicking = false;
        function onScrollShowcase() {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    handleShowcaseScroll();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }

        window.addEventListener('scroll', onScrollShowcase, { passive: true });
        window.addEventListener('resize', onScrollShowcase, { passive: true });

        // Initialize immediately
        handleShowcaseScroll();
    }

    // ── Download Button Handler ──
    const downloadButtons = document.querySelectorAll('a[href="seu-app.apk"]');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // If no real file exists, show a notification
            // Remove this block when you have a real APK file
            e.preventDefault();
            showToast('O download do yadoT.apk começará em instantes!');
        });
    });

    // ── Toast Notification ──
    function showToast(message) {
        // Remove existing toasts
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${message}</span>
        `;

        // Toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%) translateY(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            background: '#0a0a0a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            zIndex: '9999',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        });

        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Auto-dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // ── Parallax tilt on mouse move (hero phone) ──
    const phoneImg = document.querySelector('.phone-3d');
    const heroSection = document.querySelector('.hero');

    if (phoneImg && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateY = x * 20;
            const rotateX = -y * 10;

            phoneImg.style.animation = 'none';
            phoneImg.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            phoneImg.style.animation = '';
            phoneImg.style.transform = '';
        });
    }

});
