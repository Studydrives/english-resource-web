'use strict';

/**
 * HUFLIT English Hub
 * Chatbot and draggable robot widget
 */

function toggleChat() {
    const chatBox = document.getElementById('chatBox');

    if (!chatBox) {
        console.warn('[Chatbot] Chat box not found.');
        return;
    }

    chatBox.classList.toggle('hidden');
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
    const normalizedMessage = message.toLowerCase();

    if (
        normalizedMessage.includes('hi') ||
        normalizedMessage.includes('chào')
    ) {
        return 'Chào bạn sinh viên HUFLIT! Robot sẵn sàng hỗ trợ bạn nè.';
    }

    return 'Xịn quá! Bạn có thể tra cứu 25 trang tài liệu ở mục Resource hoặc làm bài Quiz 5 câu để kiểm tra kiến thức nhé.';
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
        const reply = getChatbotReply(message);
        appendChatMessage(chatMessages, reply, 'bot');
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
    let xOffset = 0;
    let yOffset = 0;

    function getPointerPosition(event) {
        if (event.touches?.length) {
            return {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }

        if (event.changedTouches?.length) {
            return {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY
            };
        }

        return {
            x: event.clientX,
            y: event.clientY
        };
    }

    function dragStart(event) {
        if (event.target.closest('#chatBox')) {
            return;
        }

        if (!dragItem.contains(event.target)) {
            return;
        }

        const pointer = getPointerPosition(event);

        initialX = pointer.x - xOffset;
        initialY = pointer.y - yOffset;

        active = true;
    }

    function dragEnd() {
        if (!active) {
            return;
        }

        initialX = currentX;
        initialY = currentY;
        active = false;
    }

    function drag(event) {
        if (!active) {
            return;
        }

        if (event.cancelable) {
            event.preventDefault();
        }

        const pointer = getPointerPosition(event);

        currentX = pointer.x - initialX;
        currentY = pointer.y - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
    }

    function setTranslate(x, y, element) {
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    dragItem.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('mousemove', drag);

    dragItem.addEventListener('touchstart', dragStart, {
        passive: true
    });

    window.addEventListener('touchend', dragEnd);
    window.addEventListener('touchcancel', dragEnd);
    window.addEventListener('touchmove', drag, {
        passive: false
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDraggableRobot();
});
