'use strict';

/**
 * HUFLIT English Hub
 * Main navigation and shared UI controls
 */

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    const targetPage = document.getElementById(pageId);

    if (!targetPage || !targetPage.classList.contains('page-content')) {
        console.warn(`[Navigation] Page not found: ${pageId}`);
        return;
    }

    pages.forEach((page) => {
        page.classList.toggle('hidden', page !== targetPage);
        page.setAttribute('aria-hidden', String(page !== targetPage));
    });

    document.querySelectorAll('[data-page-target]').forEach((button) => {
        const isActive = button.dataset.pageTarget === pageId;

        button.classList.toggle('text-blue-600', isActive);
        button.classList.toggle('font-bold', isActive);
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
    }

    document.querySelectorAll('.page-content.hidden').forEach((page) => {
        page.setAttribute('aria-hidden', 'true');
    });
});
