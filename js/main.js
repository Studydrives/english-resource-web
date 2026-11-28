'use strict';

/**
 * HUFLIT English Hub
 * Navigation, motion system and lightweight UI interactions.
 */

const PAGE_IDS = Object.freeze({
    home: 'page-home',
    resource: 'page-resource',
    quiz: 'page-quiz',
    feedback: 'page-feedback'
});

const UI_MOTION = Object.freeze({
    revealThreshold: 0.08,
    revealRootMargin: '0px 0px -36px 0px',
    staggerDelay: 75
});

let pageRevealObserver = null;
let resourceMutationObserver = null;
let scrollTicking = false;
let uiInitialized = false;

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function switchPage(pageId) {
    const normalizedPageId = PAGE_IDS[pageId]
        ? pageId
        : Object.keys(PAGE_IDS).find((key) => PAGE_IDS[key] === pageId);

    if (!normalizedPageId) {
        console.warn(`[Navigation] Invalid page: ${pageId}`);
        return;
    }

    const targetPage = document.getElementById(PAGE_IDS[normalizedPageId]);

    if (!targetPage) {
        console.error(`[Navigation] Page not found: ${PAGE_IDS[normalizedPageId]}`);
        return;
    }

    document.querySelectorAll('.page-content').forEach((page) => {
        const isActive = page === targetPage;

        page.classList.toggle('hidden', !isActive);
        page.setAttribute('aria-hidden', String(!isActive));
    });

    Object.keys(PAGE_IDS).forEach((key) => {
        const button = document.getElementById(`nav-${key}`);
        if (!button) return;

        const isActive = key === normalizedPageId;

        button.classList.toggle('text-black', isActive);
        button.classList.toggle('font-semibold', isActive);
        button.classList.toggle('border-b-2', isActive);
        button.classList.toggle('border-black', isActive);
        button.classList.toggle('text-neutral-500', !isActive);
        button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });

    observePageElements(targetPage);
    updateScrollProgress();
}

function toggleMiniAnswer(answerId) {
    const answer = document.getElementById(answerId);

    if (!answer) {
        console.warn(`[MiniAnswer] Element not found: ${answerId}`);
        return;
    }

    const isHidden = answer.classList.toggle('hidden');
    answer.setAttribute('aria-hidden', String(isHidden));
}

function revealElement(element, index = 0) {
    if (!element || element.dataset.revealReady === 'true') return;

    element.dataset.revealReady = 'true';
    element.classList.add('reveal-pending');

    element.style.setProperty(
        '--reveal-delay',
        `${Math.min(index, 7) * UI_MOTION.staggerDelay}ms`
    );

    if (!pageRevealObserver || prefersReducedMotion()) {
        element.classList.add('is-revealed');
        return;
    }

    pageRevealObserver.observe(element);
}

function observePageElements(root = document) {
    const selectors = [
        '.page-content > div',
        '.page-content > section',
        '#resourceContainer > *',
        '#quizCard',
        '#quizResultBox',
        '#surveyForm'
    ];

    root.querySelectorAll(selectors.join(',')).forEach((element, index) => {
        revealElement(element, index);
    });
}

function initializePageReveal() {
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        observePageElements(document);
        return;
    }

    pageRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: UI_MOTION.revealThreshold,
        rootMargin: UI_MOTION.revealRootMargin
    });

    observePageElements(document);
}

function initializeScrollProgress() {
    if (document.getElementById('uiScrollProgress')) return;

    const progress = document.createElement('div');
    progress.id = 'uiScrollProgress';
    progress.setAttribute('aria-hidden', 'true');

    document.body.appendChild(progress);
}

function updateScrollProgress() {
    const progress = document.getElementById('uiScrollProgress');
    if (!progress) return;

    const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const percentage = scrollableHeight > 0
        ? (window.scrollY / scrollableHeight) * 100
        : 0;

    progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

function updateHeaderState() {
    const header = document.querySelector('header');
    if (!header) return;

    header.classList.toggle('is-scrolled', window.scrollY > 12);
}

function updateHeroParallax() {
    if (prefersReducedMotion()) return;

    const heroImage = document.querySelector('#page-home img');
    if (!heroImage) return;

    const rect = heroImage.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const distance = Math.max(-10, Math.min(10, (rect.top - window.innerHeight / 2) * -0.018));

    heroImage.style.setProperty('--hero-shift', `${distance}px`);
}

function handleScroll() {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
        updateScrollProgress();
        updateHeaderState();
        updateHeroParallax();
        scrollTicking = false;
    });
}

function initializeButtonRipple() {
    document.addEventListener('click', (event) => {
        if (prefersReducedMotion()) return;

        const button = event.target.closest('button');

        if (
            !button ||
            button.disabled ||
            button.closest('#draggableRobot') ||
            button.classList.contains('chat-resource-card') ||
            button.classList.contains('chat-suggestion-chip')
        ) {
            return;
        }

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');

        ripple.className = 'ui-ripple';
        ripple.setAttribute('aria-hidden', 'true');

        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;

        const computedPosition = window.getComputedStyle(button).position;

        if (computedPosition === 'static') {
            button.style.position = 'relative';
        }

        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove(), {
            once: true
        });
    });
}

function triggerShake(element) {
    if (!element || prefersReducedMotion()) return;

    element.classList.remove('is-shaking');

    // Force animation restart.
    void element.offsetWidth;

    element.classList.add('is-shaking');

    element.addEventListener('animationend', () => {
        element.classList.remove('is-shaking');
    }, { once: true });
}

function initializeFormFeedback() {
    document.addEventListener('invalid', (event) => {
        const field = event.target;

        if (!(field instanceof HTMLElement)) return;

        const container = field.closest(
            '#surveyForm, #chatForm, #searchInput'
        );

        triggerShake(container || field);
    }, true);
}

function initializeResourceObserver() {
    const container = document.getElementById('resourceContainer');

    if (!container || !('MutationObserver' in window)) return;

    resourceMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node, index) => {
                if (!(node instanceof HTMLElement)) return;

                revealElement(node, index);
            });
        });
    });

    resourceMutationObserver.observe(container, {
        childList: true
    });
}

function initializeMotionSystem() {
    if (uiInitialized) return;
    uiInitialized = true;

    initializeScrollProgress();
    initializePageReveal();
    initializeButtonRipple();
    initializeFormFeedback();
    initializeResourceObserver();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    updateScrollProgress();
    updateHeaderState();
}

document.addEventListener('DOMContentLoaded', () => {
    const visiblePage = document.querySelector('.page-content:not(.hidden)');

    document.querySelectorAll('.page-content').forEach((page) => {
        page.setAttribute(
            'aria-hidden',
            String(page !== visiblePage)
        );
    });

    initializeMotionSystem();
    observePageElements(visiblePage || document);
});

window.addEventListener('beforeunload', () => {
    pageRevealObserver?.disconnect();
    resourceMutationObserver?.disconnect();

    pageRevealObserver = null;
    resourceMutationObserver = null;
});
