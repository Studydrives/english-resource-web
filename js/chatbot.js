
'use strict';

/**
 * HUFLIT English Hub
 * Accessible chatbot, resource suggestions and bounded draggable launcher.
 */

const CHATBOT_CONFIG = {
    storageKey: 'huflit_chatbot_position',
    maxSuggestions: 4,
    typingDelay: 450,
    edgeGap: 12
};

const CHATBOT_SUGGESTIONS = [
    'Tôi có thể tìm tài liệu tiếng Anh ở đâu?',
    'Có tài liệu cho người mới bắt đầu không?',
    'Làm thế nào để cải thiện Listening?',
    'Tôi muốn luyện ngữ pháp.',
    'Có bài kiểm tra tiếng Anh nào không?'
];

let chatbotDragState = null;
let chatbotSuppressClickUntil = 0;
let chatbotInitialized = false;

function getChatbotElements() {
    return {
        robot: document.getElementById('draggableRobot'),
        button: document.getElementById('chatBubbleBtn'),
        box: document.getElementById('chatBox'),
        messages: document.getElementById('chatMessages'),
        input: document.getElementById('chatInput'),
        form: document.getElementById('chatForm')
    };
}

function isReducedMotionEnabled() {
    return window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;
}

function appendChatMessage(container, message, type = 'bot') {
    if (!container) return null;

    const element = document.createElement('div');

    element.className = type === 'user'
        ? 'bg-purple-600 text-white p-3 rounded-xl ml-auto max-w-[85%] text-right shadow-sm'
        : 'bg-white p-3 rounded-xl border border-neutral-200 text-neutral-800 max-w-[85%] shadow-sm';

    element.textContent = String(message ?? '');

    if (!isReducedMotionEnabled()) {
        element.style.animation = 'chatMessageIn 220ms ease both';
    }

    container.appendChild(element);
    container.scrollTop = container.scrollHeight;

    return element;
}

function appendChatTypingIndicator(container) {
    const indicator = document.createElement('div');

    indicator.className = 'bg-white border border-neutral-200 rounded-xl p-3 text-neutral-500 text-xs self-start';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-label', 'Robot đang trả lời');
    indicator.textContent = 'Robot đang soạn câu trả lời...';

    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;

    return indicator;
}

function getAvailableResources() {
    if (
        typeof resourcesData === 'undefined' ||
        !Array.isArray(resourcesData)
    ) {
        return [];
    }

    return resourcesData.filter((resource) =>
        resource &&
        resource.id !== undefined &&
        resource.title
    );
}

function getSuggestedResources(message) {
    const resources = getAvailableResources();

    if (resources.length === 0) return [];

    const normalized = message
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const keywordGroups = [
        {
            keywords: ['grammar', 'ngu phap', 'tense', 'sentence', 'verb'],
            terms: ['grammar', 'writing', 'sentence', 'academic']
        },
        {
            keywords: ['vocabulary', 'tu vung', 'word', 'lexical'],
            terms: ['vocabulary', 'lexical', 'word']
        },
        {
            keywords: ['listening', 'nghe', 'pronunciation', 'phat am'],
            terms: ['listening', 'pronunciation', 'phonetics', 'phonology']
        },
        {
            keywords: ['speaking', 'noi', 'communication', 'giao tiep'],
            terms: ['speaking', 'communication', 'presentation']
        },
        {
            keywords: ['reading', 'doc hieu', 'reading comprehension'],
            terms: ['reading', 'comprehension']
        },
        {
            keywords: ['writing', 'viet', 'essay', 'essay writing'],
            terms: ['writing', 'essay', 'academic']
        },
        {
            keywords: ['ielts'],
            terms: ['ielts']
        },
        {
            keywords: ['toeic'],
            terms: ['toeic']
        },
        {
            keywords: ['business', 'kinh doanh', 'cong viec'],
            terms: ['business', 'corporate', 'workplace']
        }
    ];

    const matchedGroup = keywordGroups.find((group) =>
        group.keywords.some((keyword) => normalized.includes(keyword))
    );

    if (!matchedGroup) {
        return resources
            .slice()
            .sort(() => Math.random() - 0.5)
            .slice(0, CHATBOT_CONFIG.maxSuggestions);
    }

    const matched = resources.filter((resource) => {
        const searchableText = [
            resource.title,
            resource.category,
            resource.desc
        ].join(' ').toLowerCase();

        return matchedGroup.terms.some((term) =>
            searchableText.includes(term)
        );
    });

    if (matched.length > 0) {
        return matched.slice(0, CHATBOT_CONFIG.maxSuggestions);
    }

    return resources
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, CHATBOT_CONFIG.maxSuggestions);
}

function appendResourceSuggestions(container, message) {
    const resources = getSuggestedResources(message);

    if (resources.length === 0) {
        appendChatMessage(
            container,
            'Hiện tại mình chưa tải được dữ liệu tài liệu. Bạn có thể thử lại sau nhé.'
        );
        return;
    }

    const wrapper = document.createElement('div');

    wrapper.className = 'w-full space-y-2';

    const heading = document.createElement('p');
    heading.className = 'font-semibold text-neutral-700';
    heading.textContent = '📚 Tài liệu có thể hữu ích:';

    wrapper.appendChild(heading);

    resources.forEach((resource) => {
        const card = document.createElement('button');

        card.type = 'button';
        card.className = 'block w-full text-left bg-white border border-neutral-200 rounded-xl p-3 hover:border-purple-400 hover:bg-purple-50 transition';

        const title = document.createElement('span');
        title.className = 'block font-semibold text-neutral-800 text-xs';
        title.textContent = resource.title;

        const description = document.createElement('span');
        description.className = 'block text-neutral-500 text-xs mt-1';
        description.textContent = resource.desc || resource.category || '';

        const action = document.createElement('span');
        action.className = 'block text-purple-700 text-xs font-semibold mt-2';
        action.textContent = 'Mở tài liệu →';

        card.append(title, description, action);

        card.addEventListener('click', () => {
            if (typeof openDocModal !== 'function') {
                appendChatMessage(
                    container,
                    'Chức năng mở tài liệu hiện chưa sẵn sàng.'
                );
                return;
            }

            openDocModal(resource.id);
        });

        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
}

function getChatbotReply(message) {
    const normalized = message
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    if (/^(hi|hello|hey|xin chao|chao|helo)\b/.test(normalized)) {
        return {
            text: 'Xin chào! Mình là HUFLIT Learning Robot. Bạn muốn tìm tài liệu hay luyện tập tiếng Anh hôm nay?'
        };
    }

    if (
        /tai lieu|document|resource|hoc tieng anh|grammar|vocabulary|listening|speaking|reading|writing|ielts|toeic/.test(normalized)
    ) {
        return {
            text: 'Mình đã tìm một số tài liệu phù hợp với nội dung bạn đang quan tâm.'
            , showResources: true
        };
    }

    if (/quiz|kiem tra|test|trac nghiem|bai thi/.test(normalized)) {
        return {
            text: 'Bạn có thể làm bài Quiz gồm 5 câu hỏi tại mục Quiz / Trắc nghiệm. Mỗi câu đúng được 20 điểm.'
            , action: {
                label: 'Mở trang Quiz',
                callback: () => {
                    if (typeof switchPage === 'function') {
                        switchPage('quiz');
                    }
                }
            }
        };
    }

    if (/cam on|thank|thanks/.test(normalized)) {
        return {
            text: 'Không có gì! Chúc bạn học tiếng Anh hiệu quả nhé.'
        };
    }

    if (/ban la ai|who are you|robot/.test(normalized)) {
        return {
            text: 'Mình là HUFLIT Learning Robot, trợ lý tra cứu tài liệu và hướng dẫn sử dụng các chức năng học tập trên website.'
        };
    }

    if (/help|giup|huong dan|co the lam gi/.test(normalized)) {
        return {
            text: 'Mình có thể giúp bạn tìm tài liệu, gợi ý nội dung học tiếng Anh và hướng dẫn mở bài Quiz. Bạn muốn bắt đầu với nội dung nào?'
            , showSuggestions: true
        };
    }

    return {
        text: 'Mình chưa hiểu rõ câu hỏi này. Bạn có thể hỏi về tài liệu, Grammar, Vocabulary, Listening, Speaking hoặc bài Quiz nhé.'
        , showSuggestions: true
    };
}

function appendChatAction(container, action) {
    if (!action || typeof action.callback !== 'function') return;

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition';
    button.textContent = action.label;

    button.addEventListener('click', action.callback);

    container.appendChild(button);
}

function appendChatSuggestions(container) {
    const wrapper = document.createElement('div');

    wrapper.className = 'w-full space-y-2';

    const heading = document.createElement('p');
    heading.className = 'text-xs font-semibold text-neutral-600';
    heading.textContent = 'Bạn có thể hỏi mình:';

    wrapper.appendChild(heading);

    CHATBOT_SUGGESTIONS
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .forEach((suggestion) => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'block w-full text-left text-xs text-purple-700 bg-white border border-purple-100 rounded-lg px-3 py-2 hover:bg-purple-50 transition';
            button.textContent = suggestion;

            button.addEventListener('click', () => {
                const { input, form } = getChatbotElements();

                if (!input || !form) return;

                input.value = suggestion;
                form.requestSubmit();
            });

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

    window.setTimeout(() => {
        typingIndicator.remove();

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
    }, CHATBOT_CONFIG.typingDelay);
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

function toggleChat() {
    const { box, button, input } = getChatbotElements();

    if (!box) {
        console.warn('[Chatbot] Chat box not found.');
        return;
    }

    const shouldOpen = box.hidden;

    box.hidden = !shouldOpen;
    box.classList.toggle('hidden', !shouldOpen);
    box.setAttribute('aria-hidden', String(!shouldOpen));

    button?.setAttribute('aria-expanded', String(shouldOpen));

    if (shouldOpen) {
        positionChatBox();

        if (input) {
            window.setTimeout(() => input.focus(), 50);
        }
    } else {
        button?.focus();
    }
}

function positionChatBox() {
    const { robot, box } = getChatbotElements();

    if (!robot || !box || box.hidden) return;

    const rect = robot.getBoundingClientRect();
    const gap = CHATBOT_CONFIG.edgeGap;

    box.style.position = 'fixed';
    box.style.right = 'auto';
    box.style.bottom = 'auto';

    const boxRect = box.getBoundingClientRect();

    const left = Math.max(
        gap,
        Math.min(
            rect.right - boxRect.width,
            window.innerWidth - boxRect.width - gap
        )
    );

    const top = Math.max(
        gap,
        rect.top - boxRect.height - 12
    );

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
}

function clampRobotPosition() {
    const { robot } = getChatbotElements();

    if (!robot) return;

    const gap = CHATBOT_CONFIG.edgeGap;
    const rect = robot.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const maxLeft = Math.max(gap, window.innerWidth - width - gap);
    const maxTop = Math.max(gap, window.innerHeight - height - gap);

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

    if (!robot || !button) {
        console.warn('[Chatbot] Draggable elements not found.');
        return;
    }

    // Drag only from the launcher button, never from the chat panel.
    button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 && event.pointerType === 'mouse') {
            return;
        }

        if (!robot.style.left) {
            const rect = robot.getBoundingClientRect();

            robot.style.position = 'fixed';
            robot.style.left = `${rect.left}px`;
            robot.style.top = `${rect.top}px`;
            robot.style.right = 'auto';
            robot.style.bottom = 'auto';
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
            Math.abs(deltaX) < 5 &&
            Math.abs(deltaY) < 5
        ) {
            return;
        }

        chatbotDragState.moved = true;

        const { robot } = getChatbotElements();
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

        const nextLeft = Math.min(
            Math.max(chatbotDragState.startLeft + deltaX, gap),
            maxLeft
        );

        const nextTop = Math.min(
            Math.max(chatbotDragState.startTop + deltaY, gap),
            maxTop
        );

        robot.style.left = `${nextLeft}px`;
        robot.style.top = `${nextTop}px`;

        positionChatBox();
    });

    function finishDragging(event) {
        if (
            !chatbotDragState ||
            chatbotDragState.pointerId !== event.pointerId
        ) {
            return;
        }

        const moved = chatbotDragState.moved;

        chatbotDragState = null;

        if (moved) {
            chatbotSuppressClickUntil = Date.now() + 250;
            clampRobotPosition();
            saveRobotPosition();
        }
    }

    button.addEventListener('pointerup', finishDragging);
    button.addEventListener('pointercancel', finishDragging);

    // Prevent the launcher's inline onclick from firing after a drag.
    button.addEventListener('click', (event) => {
        if (Date.now() < chatbotSuppressClickUntil) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    restoreRobotPosition();

    window.addEventListener('resize', () => {
        clampRobotPosition();
        saveRobotPosition();
    });
}

function injectChatbotStyles() {
    if (document.getElementById('chatbotRuntimeStyles')) return;

    const style = document.createElement('style');

    style.id = 'chatbotRuntimeStyles';
    style.textContent = `
        @keyframes chatMessageIn {
            from {
                opacity: 0;
                transform: translateY(7px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #chatBubbleBtn {
            cursor: grab;
            touch-action: none;
            transition: transform 180ms ease, box-shadow 180ms ease;
        }

        #chatBubbleBtn:active {
            cursor: grabbing;
        }

        #chatBox {
            z-index: 60;
            max-width: calc(100vw - 24px);
            max-height: calc(100dvh - 24px);
        }

        #chatBox[hidden] {
            display: none !important;
        }

        @media (prefers-reduced-motion: no-preference) {
            #chatBubbleBtn {
                animation: chatbotFloat 3s ease-in-out infinite;
            }

            @keyframes chatbotFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }
        }
    `;

    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    if (chatbotInitialized) return;

    chatbotInitialized = true;

    const { form, messages } = getChatbotElements();

    injectChatbotStyles();
    initializeDraggableRobot();

    form?.addEventListener('submit', handleChatSubmit);

    if (messages && messages.children.length === 1) {
        appendChatSuggestions(messages);
    }
});
