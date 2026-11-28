'use strict';

/**
 * HUFLIT English Hub
 * Main navigation and lightweight page interaction effects.
 */

const PAGE_IDS = Object.freeze({
    home: 'page-home',
    resource: 'page-resource',
    quiz: 'page-quiz',
    feedback: 'page-feedback'
});

let pageRevealObserver = null;

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

    const targetPageId = PAGE_IDS[normalizedPageId];
    const targetPage = document.getElementById(targetPageId);

    if (!targetPage) {
        console.error(`[Navigation] Page not found: ${targetPageId}`);
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

function revealElement(element) {
    if (!element || element.dataset.revealReady === 'true') return;

    element.dataset.revealReady = 'true';
    element.classList.add('reveal-pending');

    if (!pageRevealObserver || prefersReducedMotion()) {
        element.classList.add('is-revealed');
        return;
    }

    pageRevealObserver.observe(element);
}

function observePageElements(root = document) {
    if (prefersReducedMotion()) return;

    const selectors = [
        '.page-content > div',
        '.page-content > section',
        '#resourceContainer > *',
        '#quizCard',
        '#quizResultBox'
    ];

    root.querySelectorAll(selectors.join(',')).forEach(revealElement);
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
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px'
    });

    observePageElements(document);
}

document.addEventListener('DOMContentLoaded', () => {
    const visiblePage = document.querySelector('.page-content:not(.hidden)');

    if (visiblePage) {
        visiblePage.setAttribute('aria-hidden', 'false');

        const pageKey = Object.keys(PAGE_IDS).find(
            (key) => PAGE_IDS[key] === visiblePage.id
        );

        if (pageKey) switchPage(pageKey);
    }

    document.querySelectorAll('.page-content.hidden').forEach((page) => {
        page.setAttribute('aria-hidden', 'true');
    });

    initializePageReveal();
});

window.addEventListener('beforeunload', () => {
    pageRevealObserver?.disconnect();
    pageRevealObserver = null;
});
