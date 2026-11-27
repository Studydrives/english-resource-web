'use strict';

/**
 * HUFLIT English Hub
 * Chatbot and draggable robot widget
 */

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    const chatButton = document.getElementById('chatBubbleBtn');

    if (!chatBox) {
        console.warn('[Chatbot] Chat box not found.');
        return;
    }

    const shouldOpen = chatBox.hidden;

    chatBox.hidden = !shouldOpen;
    chatBox.classList.toggle('hidden', !shouldOpen);
    chatBox.setAttribute('aria-hidden', String(!shouldOpen));

    if (chatButton) {
        chatButton.setAttribute('aria-expanded', String(shouldOpen));
    }

    if (shouldOpen) {
        document.getElementById('chatInput')?.focus();
    } else {
        chatButton?.focus();
    }
}

function appendChatMessage(container, message, type) {
    const messageElement = document.createElement('div');

    if (type === 'user') {
        messageElement.className =
            'bg-purple-600 text-white p-2.5 rounded-xl ml-auto max-w-[85%] text-right';
    } else {
        messageElement.className =
            'bg-white p-2.5 rounded-xl border border-neutral-200 text-neutral-800 max-w-[85%] shadow-sm';
    }

    messageElement.textContent = message;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

function getChatbotReply(message) {
    const normalizedMessage = message
        .toLowerCase()
        .trim();

    if (/^(hi|hello|hey|chào|xin chào)\b/.test(normalizedMessage)) {
        return 'Chào bạn sinh viên HUFLIT! Robot sẵn sàng hỗ trợ bạn nè.';
    }

    return 'Bạn có thể tra cứu 25 trang tài liệu ở mục Resource hoặc làm bài Quiz 5 câu để kiểm tra kiến thức nhé.';
}

function handleChatSubmit(event) {
    event.preventDefault();

    const input = document.getElementById('chatInput');
    const message = input?.value.trim();

    if (!message) {
        return;
    }

    const chatMessages = document.getElementById('chatMessages');

    if (!chatMessages) {
        console.error('[Chatbot] Chat messages container not found.');
        return;
    }

    appendChatMessage(chatMessages, message, 'user');

    input.value = '';
    input.focus();

    window.setTimeout(() => {
        appendChatMessage(
            chatMessages,
            getChatbotReply(message),
            'bot'
        );
    }, 500);
}

/* Draggable Robot Widget */

function initializeDraggableRobot() {
    const dragItem = document.getElementById('draggableRobot');

    if (!dragItem) {
        console.warn('[Chatbot] Draggable robot not found.');
        return;
    }

    let active = false;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;

    function dragStart(event) {
        if (event.target.closest('#chatBox')) {
            return;
        }

        if (!dragItem.contains(event.target)) {
            return;
        }

        const pointer = {
            x: event.clientX,
            y: event.clientY
        };

        initialX = pointer.x - currentX;
        initialY = pointer.y - currentY;

        active = true;
    }

    function drag(event) {
        if (!active) {
            return;
        }

        event.preventDefault();

        currentX = event.clientX - initialX;
        currentY = event.clientY - initialY;

        dragItem.style.transform =
            `translate3d(${currentX}px, ${currentY}px, 0)`;
    }

    function dragEnd() {
        active = false;
    }

    dragItem.addEventListener('pointerdown', dragStart);
    window.addEventListener('pointermove', drag);
    window.addEventListener('pointerup', dragEnd);
    window.addEventListener('pointercancel', dragEnd);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDraggableRobot();

    const chatForm = document.getElementById('chatForm');

    chatForm?.addEventListener('submit', handleChatSubmit);
});
