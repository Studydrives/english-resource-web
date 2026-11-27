'use strict';

/**
 * HUFLIT English Hub
 * Document viewer modal
 */

function openDocModal(resourceId) {
    const modal = document.getElementById('docModal');

    if (!modal || typeof resourcesData === 'undefined') {
        console.error('[DocumentViewer] Modal or resource data not found.');
        return;
    }

    const resource = resourcesData.find(
        (item) => item.id === Number(resourceId)
    );

    if (!resource) {
        console.error('[DocumentViewer] Resource not found:', resourceId);
        return;
    }

    const title = modal.querySelector('#docTitle');
    const content = modal.querySelector('#docContent');

    if (!title || !content) {
        console.error('[DocumentViewer] Modal content elements not found.');
        return;
    }

    title.textContent = resource.title;
    content.textContent = resource.content || resource.desc || '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.body.style.overflow = 'hidden';

    const closeButton = modal.querySelector(
        '#closeDocModal, [data-close-doc-modal]'
    );

    if (closeButton) {
        closeButton.focus();
    }
}

function closeDocModal() {
    const modal = document.getElementById('docModal');

    if (!modal) {
        return;
    }

    modal.classList.remove('flex');
    modal.classList.add('hidden');

    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('docModal');

    if (!modal) {
        return;
    }

    const closeButton = modal.querySelector(
        '#closeDocModal, [data-close-doc-modal]'
    );

    if (closeButton) {
        closeButton.addEventListener('click', closeDocModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeDocModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeDocModal();
        }
    });
});
