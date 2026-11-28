
'use strict';

/**
 * HUFLIT English Hub
 * Responsive glass chatbot with independent launcher and panel.
 */

const CHATBOT_CONFIG = Object.freeze({
    storageKey: 'huflit_chatbot_position',
    maxSuggestions: 4,
    typingDelay: 420,
    edgeGap: 12,
    dragThreshold: 5,
    panelWidth: 380,
    mobileBreakpoint: 520
});

const CHATBOT_SUGGESTIONS = [
    'Tôi muốn tìm tài liệu tiếng Anh.',
    'Có tài liệu dành cho người mới bắt đầu không?',
    'Tôi muốn luyện Listening và phát âm.',
    'Gợi ý tài liệu Grammar và Vocabulary.',
    'Tôi muốn làm bài Quiz.',
    'Có tài liệu IELTS hoặc TOEIC không?'
];

const CHATBOT_INTENTS = [
    {
        id: 'grammar',
        keywords: ['grammar', 'ngu phap', 'tense', 'thì', 'sentence', 'verb', 'clause'],
        terms: ['grammar', 'syntax', 'sentence', 'linguistics', 'writing']
    },
    {
        id: 'vocabulary',
        keywords: ['vocabulary', 'tu vung', 'word', 'lexical', 'collocation'],
        terms: ['vocabulary', 'lexical', 'word', 'terminology', 'business']
    },
    {
        id: 'listening',
        keywords: ['listening', 'nghe', 'pronunciation', 'phat am', 'phonetic', 'phonology'],
        terms: ['listening', 'pronunciation', 'phonetics', 'phonology']
    },
    {
        id: 'speaking',
        keywords: ['speaking', 'noi', 'giao tiep', 'communication', 'presentation'],
        terms: ['speaking', 'communication', 'presentation', 'ielts']
    },
    {
        id: 'reading',
        keywords: ['reading', 'doc hieu', 'doc tai lieu', 'comprehension'],
        terms: ['reading', 'comprehension', 'academic']
    },
    {
        id: 'writing',
        keywords: ['writing', 'viet', 'essay', 'email', 'report'],
        terms: ['writing', 'essay', 'email', 'report', 'academic']
    },
    {
        id: 'ielts',
        keywords: ['ielts'],
        terms: ['ielts']
    },
    {
        id: 'toeic',
        keywords: ['toeic'],
        terms: ['toeic']
    },
    {
        id: 'business',
        keywords: ['business', 'kinh doanh', 'cong viec', 'thuong mai', 'workplace'],
        terms: ['business', 'corporate', 'workplace', 'finance', 'customer']
    }
];

let chatbotDragState = null;
let chatbotSuppressClickUntil = 0;
let chatbotInitialized = false;
let chatbotResponseTimers = new Set();

function getChatbotElements() {
    return {
        robot: document.getElementById('draggableRobot'),
        button: document.getElementById('chatBubbleBtn'),
        box: document.getElementById('chatBox'),
        messages: document.getElementById('chatMessages'),
        input: document.getElementById('chatInput'),
        form: document.getElementById('chatForm'),
        closeButton: document.querySelector('#chatBox .chat-close-btn')
    };
}

function normalizeChatText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .toLowerCase()
        .trim();
}

function isReducedMotionEnabled() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function appendChatMessage(container, message, type = 'bot') {
    if (!container) return null;

    const element = document.createElement('div');

    element.className = type === 'user'
        ? 'chat-message chat-message-user'
        : 'chat-message chat-message-bot';

    element.textContent = String(message ?? '');
    element.dataset.messageType = type;

    container.appendChild(element);
    container.scrollTop = container.scrollHeight;

    return element;
}

function appendChatTypingIndicator(container) {
    if (!container) return null;

    const indicator = document.createElement('div');

    indicator.className = 'chat-typing-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-label', 'Trợ lý đang soạn câu trả lời');
    indicator.innerHTML = '<span></span><span></span><span></span>';

    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;

    return indicator;
}

function getAvailableResources() {
    if (typeof resourcesData === 'undefined' || !Array.isArray(resourcesData)) {
        return [];
    }

    return resourcesData.filter((resource) =>
        resource &&
        resource.id !== undefined &&
        typeof resource.title === 'string' &&
        resource.title.trim()
    );
}

function findResourceIntent(message) {
    const normalized = normalizeChatText(message);

    return CHATBOT_INTENTS.find((intent) =>
        intent.keywords.some((keyword) =>
            normalized.includes(normalizeChatText(keyword))
        )
    ) || null;
}

function scoreResource(resource, intent) {
    if (!intent) return 0;

    const title = normalizeChatText(resource.title);
    const category = normalizeChatText(resource.category);
    const description = normalizeChatText(resource.desc);

    return intent.terms.reduce((score, term) => {
        const keyword = normalizeChatText(term);

        if (title.includes(keyword)) score += 5;
        if (category.includes(keyword)) score += 4;
        if (description.includes(keyword)) score += 2;

        return score;
    }, 0);
}

function getSuggestedResources(message) {
    const resources = getAvailableResources();

    if (!resources.length) return [];

    const intent = findResourceIntent(message);

    if (!intent) {
        return resources.slice(0, CHATBOT_CONFIG.maxSuggestions);
    }

    const ranked = resources
        .map((resource) => ({
            resource,
            score: scoreResource(resource, intent)
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return ranked.length
        ? ranked.slice(0, CHATBOT_CONFIG.maxSuggestions).map((item) => item.resource)
        : resources.slice(0, CHATBOT_CONFIG.maxSuggestions);
}

function appendResourceSuggestions(container, message) {
    const resources = getSuggestedResources(message);

    if (!resources.length) {
        appendChatMessage(
            container,
            'Hiện chưa có dữ liệu tài liệu để gợi ý. Bạn có thể mở mục Resource để kiểm tra.'
        );
        return;
    }

    const wrapper = document.createElement('section');

    wrapper.className = 'chat-resource-list';
    wrapper.setAttribute('aria-label', 'Tài liệu được đề xuất');

    const heading = document.createElement('p');

    heading.className = 'chat-section-heading';
    heading.textContent = 'Tài liệu có thể phù hợp với bạn';

    wrapper.appendChild(heading);

    resources.forEach((resource) => {
        const card = document.createElement('button');

        card.type = 'button';
        card.className = 'chat-resource-card';

        const title = document.createElement('span');
        title.className = 'chat-resource-title';
        title.textContent = resource.title;

        const description = document.createElement('span');
        description.className = 'chat-resource-description';
        description.textContent =
            resource.desc || resource.category || 'Tài liệu học tập';

        const action = document.createElement('span');
        action.className = 'chat-resource-action';
        action.textContent = 'Mở tài liệu';

        card.append(title, description, action);

        card.addEventListener('click', () => {
            if (typeof openDocModal === 'function') {
                openDocModal(resource.id);
            } else {
                appendChatMessage(
                    container,
                    'Chức năng xem tài liệu hiện chưa sẵn sàng.'
                );
            }
        });

        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function getChatbotReply(message) {
    const text = normalizeChatText(message);

    if (/^(hi|hello|hey|xin chao|chao|helo)\b/.test(text)) {
        return {
            text: 'Xin chào! Mình là HUFLIT Learning Robot. Bạn muốn tìm tài liệu hay luyện tập nội dung nào hôm nay?',
            showSuggestions: true
        };
    }

    if (/\b(quiz|kiem tra|test|trac nghiem|bai thi)\b/.test(text)) {
        return {
            text: 'Website hiện có bài Quiz gồm 5 câu hỏi. Bạn có thể mở trang Quiz để bắt đầu luyện tập.',
            action: {
                label: 'Mở trang Quiz',
                callback: () => {
                    if (typeof switchPage === 'function') switchPage('quiz');
                }
            }
        };
    }

    if (/\b(resource|tai lieu|document|hoc tieng anh|grammar|vocabulary|listening|speaking|reading|writing|ielts|toeic|pronunciation)\b/.test(text)) {
        return {
            text: 'Mình đã đối chiếu câu hỏi với kho tài liệu hiện có và chọn một số nội dung liên quan.',
            showResources: true
        };
    }

    if (/\b(cam on|thank|thanks)\b/.test(text)) {
        return {
            text: 'Rất vui được hỗ trợ bạn. Chúc bạn học tập hiệu quả!'
        };
    }

    if (/\b(ban la ai|who are you|robot)\b/.test(text)) {
        return {
            text: 'Mình là HUFLIT Learning Robot, trợ lý tra cứu tài liệu và hướng dẫn sử dụng các chức năng hiện có trên website.'
        };
    }

    if (/\b(help|giup|huong dan|co the lam gi)\b/.test(text)) {
        return {
            text: 'Mình có thể gợi ý tài liệu theo chủ đề, mở trang Quiz và hướng dẫn bạn tìm nội dung trong website.',
            showSuggestions: true
        };
    }

    if (/\b(home|trang chu)\b/.test(text)) {
        return {
            text: 'Bạn có thể quay lại trang chủ để xem giới thiệu và các lối tắt đến kho tài liệu, Quiz.',
            action: {
                label: 'Về trang chủ',
                callback: () => {
                    if (typeof switchPage === 'function') switchPage('home');
                }
            }
        };
    }

    return {
        text: 'Mình chưa xác định được chủ đề bạn muốn hỏi. Hãy thử nêu tên kỹ năng hoặc chức năng, ví dụ Grammar, Listening, IELTS, tài liệu hoặc Quiz.',
        showSuggestions: true
    };
}

function appendChatAction(container, action) {
    if (!action || typeof action.callback !== 'function') return;

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'chat-action-button';
    button.textContent = action.label;

    button.addEventListener('click', action.callback);
    container.appendChild(button);
}

function submitSuggestedMessage(message) {
    const { input, form } = getChatbotElements();

    if (!input || !form) return;

    input.value = message;

    if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
    } else {
        form.dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true
        }));
    }
}

function appendChatSuggestions(container) {
    if (!container || container.querySelector('.chat-suggestion-list')) return;

    const wrapper = document.createElement('section');

    wrapper.className = 'chat-suggestion-list';
    wrapper.setAttribute('aria-label', 'Câu hỏi gợi ý');

    const heading = document.createElement('p');

    heading.className = 'chat-section-heading';
    heading.textContent = 'Bạn có thể bắt đầu bằng cách hỏi:';

    wrapper.appendChild(heading);

    CHATBOT_SUGGESTIONS.slice(0, CHATBOT_CONFIG.maxSuggestions)
        .forEach((suggestion) => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'chat-suggestion-chip';
            button.textContent = suggestion;

            button.addEventListener('click', () =>
                submitSuggestedMessage(suggestion)
            );

            wrapper.appendChild(button);
        });

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function showChatbotResponse(message) {
    const { messages } = getChatbotElements();

    if (!messages) return;

    const reply = getChatbotReply(message);
    const typingIndicator = appendChatTypingIndicator(messages);

    const timer = window.setTimeout(() => {
        chatbotResponseTimers.delete(timer);

        typingIndicator?.remove();

        appendChatMessage(messages, reply.text, 'bot');

        if (reply.showResources) {
            appendResourceSuggestions(messages, message);
        }

        if (reply.action) {
            appendChatAction(messages, reply.action);
        }

        if (reply.showSuggestions) {
            appendChatSuggestions(messages);
        }
    }, isReducedMotionEnabled() ? 0 : CHATBOT_CONFIG.typingDelay);

    chatbotResponseTimers.add(timer);
}

function handleChatSubmit(event) {
    event.preventDefault();

    const { input, messages } = getChatbotElements();

    if (!input || !messages) return;

    const message = input.value.trim();

    if (!message) return;

    appendChatMessage(messages, message, 'user');

    input.value = '';

    showChatbotResponse(message);
    input.focus();
}

/**
 * Move the panel outside the draggable launcher.
 * This prevents the panel from covering the launcher button.
 */
function detachChatPanel() {
    const { box } = getChatbotElements();

    if (!box || box.parentElement === document.body) return;

    document.body.appendChild(box);
}

/**
 * Position the panel inside the visible viewport.
 * The launcher and panel have independent stacking contexts.
 */
function positionChatBox() {
    const { button, box } = getChatbotElements();

    if (!button || !box || box.hidden) return;

    const viewport = window.visualViewport;

    const viewportWidth = viewport?.width || window.innerWidth;
    const viewportHeight = viewport?.height || window.innerHeight;
    const offsetLeft = viewport?.offsetLeft || 0;
    const offsetTop = viewport?.offsetTop || 0;

    const gap = CHATBOT_CONFIG.edgeGap;

    const availableWidth = Math.max(1, viewportWidth - gap * 2);
    const availableHeight = Math.max(1, viewportHeight - gap * 2);

    const panelWidth = Math.min(
        CHATBOT_CONFIG.panelWidth,
        availableWidth
    );

    box.style.position = 'fixed';
    box.style.width = `${panelWidth}px`;
    box.style.maxWidth = `${availableWidth}px`;
    box.style.maxHeight = `${availableHeight}px`;
    box.style.left = `${offsetLeft + gap}px`;
    box.style.top = `${offsetTop + gap}px`;
    box.style.right = 'auto';
    box.style.bottom = 'auto';

    const panelRect = box.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const width = Math.min(panelRect.width, availableWidth);
    const height = Math.min(panelRect.height, availableHeight);

    const minLeft = offsetLeft + gap;
    const maxLeft = offsetLeft + viewportWidth - width - gap;

    const minTop = offsetTop + gap;
    const maxTop = offsetTop + viewportHeight - height - gap;

    const centerX = buttonRect.left + buttonRect.width / 2;

    const candidates = [
        {
            left: centerX - width / 2,
            top: buttonRect.top - height - gap,
            side: 'top'
        },
        {
            left: centerX - width / 2,
            top: buttonRect.bottom + gap,
            side: 'bottom'
        },
        {
            left: buttonRect.left - width - gap,
            top: buttonRect.top + buttonRect.height / 2 - height / 2,
            side: 'left'
        },
        {
            left: buttonRect.right + gap,
            top: buttonRect.top + buttonRect.height / 2 - height / 2,
            side: 'right'
        }
    ];

    const position = candidates.find((candidate) =>
        candidate.left >= minLeft &&
        candidate.left + width <= maxLeft + width &&
        candidate.top >= minTop &&
        candidate.top + height <= maxTop + height
    );

    const selected = position || {
        left: Math.max(minLeft, Math.min(centerX - width / 2, maxLeft)),
        top: buttonRect.top - height - gap >= minTop
            ? buttonRect.top - height - gap
            : buttonRect.bottom + gap,
        side: 'adaptive'
    };

    box.style.left = `${Math.max(
        minLeft,
        Math.min(selected.left, maxLeft)
    )}px`;

    box.style.top = `${Math.max(
        minTop,
        Math.min(selected.top, maxTop)
    )}px`;

    box.dataset.position = selected.side;
}

function toggleChat(forceState) {
    const { box, button, input } = getChatbotElements();

    if (!box || !button) return;

    const shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : box.hidden;

    if (shouldOpen === !box.hidden) return;

    if (shouldOpen) {
        detachChatPanel();

        box.hidden = false;
        box.classList.add('is-open');

        box.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-expanded', 'true');

        requestAnimationFrame(() => {
            positionChatBox();
            input?.focus();
        });

        return;
    }

    box.classList.remove('is-open');
    box.hidden = true;

    box.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');

    button.focus();
}

function clampRobotPosition() {
    const { robot } = getChatbotElements();

    if (!robot) return;

    const gap = CHATBOT_CONFIG.edgeGap;
    const rect = robot.getBoundingClientRect();

    const maxLeft = Math.max(
        gap,
        window.innerWidth - rect.width - gap
    );

    const maxTop = Math.max(
        gap,
        window.innerHeight - rect.height - gap
    );

    const left = Math.min(Math.max(rect.left, gap), maxLeft);
    const top = Math.min(Math.max(rect.top, gap), maxTop);

    robot.style.position = 'fixed';
    robot.style.left = `${left}px`;
    robot.style.top = `${top}px`;
    robot.style.right = 'auto';
    robot.style.bottom = 'auto';

    positionChatBox();
}

function saveRobotPosition() {
    const { robot } = getChatbotElements();

    if (!robot) return;

    try {
        const rect = robot.getBoundingClientRect();

        localStorage.setItem(
            CHATBOT_CONFIG.storageKey,
            JSON.stringify({
                left: rect.left,
                top: rect.top
            })
        );
    } catch (error) {
        console.warn('[Chatbot] Cannot save position:', error);
    }
}

function restoreRobotPosition() {
    const { robot } = getChatbotElements();

    if (!robot) return;

    try {
        const saved = JSON.parse(
            localStorage.getItem(CHATBOT_CONFIG.storageKey) || 'null'
        );

        if (
            !saved ||
            !Number.isFinite(saved.left) ||
            !Number.isFinite(saved.top)
        ) {
            return;
        }

        robot.style.position = 'fixed';
        robot.style.left = `${saved.left}px`;
        robot.style.top = `${saved.top}px`;
        robot.style.right = 'auto';
        robot.style.bottom = 'auto';

        clampRobotPosition();
    } catch (error) {
        console.warn('[Chatbot] Cannot restore position:', error);
    }
}

function initializeDraggableRobot() {
    const { robot, button } = getChatbotElements();

    if (!robot || !button) return;

    button.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        const rect = robot.getBoundingClientRect();

        chatbotDragState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            moved: false
        };

        robot.classList.add('is-dragging');

        button.setPointerCapture?.(event.pointerId);
    });

    button.addEventListener('pointermove', (event) => {
        if (
            !chatbotDragState ||
            chatbotDragState.pointerId !== event.pointerId
        ) {
            return;
        }

        const deltaX = event.clientX - chatbotDragState.startX;
        const deltaY = event.clientY - chatbotDragState.startY;

        if (
            !chatbotDragState.moved &&
            Math.abs(deltaX) < CHATBOT_CONFIG.dragThreshold &&
            Math.abs(deltaY) < CHATBOT_CONFIG.dragThreshold
        ) {
            return;
        }

        chatbotDragState.moved = true;

        const rect = robot.getBoundingClientRect();
        const gap = CHATBOT_CONFIG.edgeGap;

        const left = Math.min(
            Math.max(chatbotDragState.startLeft + deltaX, gap),
            Math.max(gap, window.innerWidth - rect.width - gap)
        );

        const top = Math.min(
            Math.max(chatbotDragState.startTop + deltaY, gap),
            Math.max(gap, window.innerHeight - rect.height - gap)
        );

        robot.style.left = `${left}px`;
        robot.style.top = `${top}px`;
        robot.style.right = 'auto';
        robot.style.bottom = 'auto';

        positionChatBox();
    });

    const finishDragging = (event) => {
        if (
            !chatbotDragState ||
            chatbotDragState.pointerId !== event.pointerId
        ) {
            return;
        }

        const moved = chatbotDragState.moved;

        chatbotDragState = null;

        robot.classList.remove('is-dragging');

        if (moved) {
            chatbotSuppressClickUntil = Date.now() + 350;

            clampRobotPosition();
            saveRobotPosition();
        }
    };

    button.addEventListener('pointerup', finishDragging);
    button.addEventListener('pointercancel', finishDragging);

    button.addEventListener('click', (event) => {
        if (Date.now() < chatbotSuppressClickUntil) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    restoreRobotPosition();
}

function initializeChatbot() {
    if (chatbotInitialized) return;

    const {
        robot,
        button,
        box,
        form,
        messages,
        closeButton
    } = getChatbotElements();

    if (!robot || !button || !box || !form || !messages) {
        return;
    }

    chatbotInitialized = true;

    detachChatPanel();
    initializeDraggableRobot();

    form.addEventListener('submit', handleChatSubmit);

    closeButton?.addEventListener('click', () => {
        toggleChat(false);
    });

    if (!messages.querySelector('.chat-suggestion-list')) {
        appendChatSuggestions(messages);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !box.hidden) {
            toggleChat(false);
        }
    });

    window.addEventListener('resize', clampRobotPosition, {
        passive: true
    });

    window.addEventListener('resize', positionChatBox, {
        passive: true
    });

    window.visualViewport?.addEventListener('resize', positionChatBox, {
        passive: true
    });

    window.visualViewport?.addEventListener('scroll', positionChatBox, {
        passive: true
    });

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(() => {
            positionChatBox();
        });

        observer.observe(box);
    }
}

document.addEventListener('DOMContentLoaded', initializeChatbot);
