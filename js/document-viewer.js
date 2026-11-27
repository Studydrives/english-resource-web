'use strict';

/**
 * HUFLIT English Hub
 * Full-page document viewer
 */

function openDocModal(id) {
    if (typeof resourcesData === 'undefined') {
        console.error('[DocumentViewer] resourcesData is not available.');
        return;
    }

    const doc = resourcesData.find((item) => item.id === Number(id));

    if (!doc) {
        console.warn(`[DocumentViewer] Document not found: ${id}`);
        return;
    }

    const modal = document.getElementById('docModal');
    const category = document.getElementById('modalCategory');
    const pageBadge = document.getElementById('modalPageBadge');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!modal || !category || !pageBadge || !title || !body) {
        console.error('[DocumentViewer] Required modal elements are missing.');
        return;
    }

    category.textContent = doc.category;
    pageBadge.textContent = `Trang tài liệu #${doc.id} / ${resourcesData.length}`;
    title.textContent = doc.title;

    // Document content contains intentional HTML formatting.
    body.innerHTML = doc.content;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const closeButton = modal.querySelector('button[onclick="closeDocModal()"]');

    if (closeButton) {
        closeButton.focus();
    }
}

function closeDocModal() {
    const modal = document.getElementById('docModal');

    if (!modal) {
        return;
    }

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    const modal = document.getElementById('docModal');

    if (modal && !modal.classList.contains('hidden')) {
        closeDocModal();
    }
});
