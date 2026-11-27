
'use strict';

/**
 * HUFLIT English Hub
 * Resource rendering and search
 */

function renderResources(items) {
    const container = document.getElementById('resourceContainer');

    if (!container) {
        console.warn('[Search] Resource container not found.');
        return;
    }

    if (!Array.isArray(items) || items.length === 0) {
        container.replaceChildren();

        const message = document.createElement('p');
        message.className = 'col-span-full text-center text-neutral-400 py-8';
        message.textContent = 'Không tìm thấy tài liệu phù hợp.';

        container.appendChild(message);
        return;
    }

    container.innerHTML = items.map((doc) => `
        <div
            role="button"
            tabindex="0"
            data-resource-id="${Number(doc.id)}"
            class="border border-neutral-200 p-5 rounded-2xl bg-white hover:border-black transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow"
        >
            <div>
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md">
                        ${escapeResourceText(doc.category)}
                    </span>

                    <span class="text-[11px] font-medium text-neutral-400">
                        Trang ${Number(doc.id)}
                    </span>
                </div>

                <h3 class="font-bold text-base mt-3 mb-2 group-hover:underline">
                    ${escapeResourceText(doc.title)}
                </h3>

                <p class="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    ${escapeResourceText(doc.desc)}
                </p>
            </div>

            <div class="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-600">
                <span>Mở trang tài liệu (1 page)</span>
                <span aria-hidden="true" class="text-xs group-hover:translate-x-1 transition">→</span>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('[data-resource-id]').forEach((card) => {
        const openDocument = () => {
            const id = Number(card.dataset.resourceId);

            if (typeof openDocModal === 'function') {
                openDocModal(id);
            }
        };

        card.addEventListener('click', openDocument);

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDocument();
            }
        });
    });
}

function escapeResourceText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const suggestionBox = document.getElementById('searchSuggestions');

    if (!searchInput || !suggestionBox) {
        return;
    }

    const query = searchInput.value.toLowerCase().trim();

    if (typeof resourcesData === 'undefined') {
        console.error('[Search] resourcesData is not available.');
        return;
    }

    if (!query) {
        renderResources(resourcesData);
        suggestionBox.replaceChildren();
        suggestionBox.classList.add('hidden');
        return;
    }

    const filtered = resourcesData.filter((resource) => {
        const searchableContent = [
            resource.title,
            resource.category,
            resource.desc,
            resource.content
        ].join(' ').toLowerCase();

        return searchableContent.includes(query);
    });

    renderResources(filtered);
    suggestionBox.replaceChildren();

    if (filtered.length === 0) {
        suggestionBox.classList.add('hidden');
        return;
    }

    filtered.slice(0, 5).forEach((resource) => {
        const item = document.createElement('button');

        item.type = 'button';
        item.className = 'w-full p-3 hover:bg-neutral-100 cursor-pointer text-sm border-b border-neutral-100 flex items-center justify-between gap-2 text-left';
        item.textContent = resource.title;

        const category = document.createElement('span');
        category.className = 'text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded shrink-0';
        category.textContent = resource.category;

        item.appendChild(category);

        item.addEventListener('click', () => {
            selectSuggestion(resource.id);
        });

        suggestionBox.appendChild(item);
    });

    suggestionBox.classList.remove('hidden');
}

function selectSuggestion(resourceId) {
    const searchInput = document.getElementById('searchInput');
    const suggestionBox = document.getElementById('searchSuggestions');

    if (typeof resourcesData === 'undefined') {
        return;
    }

    const resource = resourcesData.find((item) =>
        item.id === Number(resourceId)
    );

    if (!resource) {
        return;
    }

    if (searchInput) {
        searchInput.value = resource.title;
    }

    if (suggestionBox) {
        suggestionBox.classList.add('hidden');
        suggestionBox.replaceChildren();
    }

    renderResources([resource]);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof resourcesData !== 'undefined') {
        renderResources(resourcesData);
    } else {
        console.error('[Search] Resource data is not available.');
    }
});
