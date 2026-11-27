'use strict';

/**
 * HUFLIT English Hub
 * Main navigation and shared UI controls
 */

const PAGE_IDS = {
    home: 'page-home',
    resource: 'page-resource',
    quiz: 'page-quiz',
    feedback: 'page-feedback'
};

function switchPage(pageId) {
    const normalizedPageId = PAGE_IDS[pageId]
        ? pageId
        : Object.keys(PAGE_IDS).find(
            (key) => PAGE_IDS[key] === pageId
        );

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

        if (!button) {
            return;
        }

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
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth'
    });
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

document.addEventListener('DOMContentLoaded', () => {
    const visiblePage = document.querySelector('.page-content:not(.hidden)');

    if (visiblePage) {
        visiblePage.setAttribute('aria-hidden', 'false');

        const pageKey = Object.keys(PAGE_IDS).find(
            (key) => PAGE_IDS[key] === visiblePage.id
        );

        if (pageKey) {
            switchPage(pageKey);
        }
    }

    document.querySelectorAll('.page-content.hidden').forEach((page) => {
        page.setAttribute('aria-hidden', 'true');
    });
});
