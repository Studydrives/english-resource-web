'use strict';

/**
 * HUFLIT English Hub
 * Quiz logic
 */

const quizData = [
    {
        q: "1. Từ nào đồng nghĩa với 'Implement' trong tiếng Anh thương mại?",
        options: ['Cancel', 'Execute', 'Delay', 'Reject'],
        correct: 1
    },
    {
        q: '2. Cấu trúc mở đầu nào phù hợp nhất khi viết Email trang trọng?',
        options: ['Hey bro,', 'Dear Mr. Smith,', "What's up,", 'Yo!'],
        correct: 1
    },
    {
        q: "3. Trong tài chính doanh nghiệp, 'Assets' có nghĩa là gì?",
        options: ['Các khoản nợ', 'Chi phí vận hành', 'Tài sản', 'Thuế'],
        correct: 2
    },
    {
        q: '4. Phương pháp quản lý thời gian giúp tăng 35% tập trung được nhắc đến là gì?',
        options: ['Pomodoro', 'Workflow', 'Incoterms', 'STAR Method'],
        correct: 0
    },
    {
        q: '5. Quy tắc HEAT trong chăm sóc khách hàng bao gồm bước nào đầu tiên?',
        options: ['Apologize', 'Take Action', 'Hear', 'Empathize'],
        correct: 2
    }
];

let currentQIndex = 0;
let score = 0;
let hasAnswered = false;

function getQuizElements() {
    return {
        progress: document.getElementById('quizProgress'),
        scoreTracker: document.getElementById('quizScoreTracker'),
        question: document.getElementById('quizQuestion'),
        feedback: document.getElementById('quizFeedbackMsg'),
        options: document.getElementById('quizOptions'),
        nextButton: document.getElementById('nextQuizBtn'),
        card: document.getElementById('quizCard'),
        resultBox: document.getElementById('quizResultBox'),
        finalScore: document.getElementById('quizFinalScoreText')
    };
}

function loadQuizQuestion() {
    const elements = getQuizElements();
    const quiz = quizData[currentQIndex];

    if (!quiz || Object.values(elements).some((element) => !element)) {
        console.error('[Quiz] Required quiz elements are missing.');
        return;
    }

    hasAnswered = false;

    elements.progress.textContent =
        `Câu hỏi ${currentQIndex + 1}/${quizData.length}`;

    elements.scoreTracker.textContent = `Điểm: ${score}`;
    elements.question.textContent = quiz.q;
    elements.feedback.textContent = '';
    elements.feedback.className = '';
    elements.nextButton.classList.add('hidden');

    elements.options.replaceChildren();

    quiz.options.forEach((option, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className =
            'quiz-opt-btn w-full text-left p-3.5 border border-neutral-200 rounded-xl text-sm font-medium hover:border-black transition bg-white';

        button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

        button.addEventListener('click', () => {
            selectQuizAnswer(index);
        });

        elements.options.appendChild(button);
    });
}

function selectQuizAnswer(selectedIndex) {
    const quiz = quizData[currentQIndex];
    const elements = getQuizElements();

    if (!quiz || hasAnswered) {
        return;
    }

    if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= quiz.options.length
    ) {
        return;
    }

    hasAnswered = true;

    const buttons = elements.options.querySelectorAll('.quiz-opt-btn');

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === quiz.correct) {
            button.classList.add(
                'bg-green-50',
                'border-green-500',
                'font-bold'
            );
        } else if (index === selectedIndex) {
            button.classList.add(
                'bg-red-50',
                'border-red-500'
            );
        }
    });

    if (selectedIndex === quiz.correct) {
        score += 20;

        elements.feedback.textContent = '✓ Chính xác (+20 điểm)!';
        elements.feedback.className = 'text-green-600 font-semibold';
    } else {
        elements.feedback.textContent = '✗ Chưa đúng đáp án chuẩn.';
        elements.feedback.className = 'text-red-500 font-semibold';
    }

    elements.scoreTracker.textContent = `Điểm: ${score}`;
    elements.nextButton.classList.remove('hidden');
}

function nextQuizQuestion() {
    if (!hasAnswered) {
        return;
    }

    currentQIndex++;

    if (currentQIndex < quizData.length) {
        loadQuizQuestion();
        return;
    }

    const elements = getQuizElements();

    elements.card.classList.add('hidden');
    elements.resultBox.classList.remove('hidden');

    elements.finalScore.textContent =
        `Tổng số điểm của bạn: ${score} / 100 điểm.`;
}

function restartQuiz() {
    const elements = getQuizElements();

    currentQIndex = 0;
    score = 0;
    hasAnswered = false;

    elements.resultBox.classList.add('hidden');
    elements.card.classList.remove('hidden');

    loadQuizQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuizQuestion();
});
