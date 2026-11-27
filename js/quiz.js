
'use strict';

/**
 * HUFLIT English Hub
 * Randomized English Quiz
 */

const QUIZ_SIZE = 5;
const POINTS_PER_QUESTION = 20;

const quizData = [
    {
        question: 'Which sentence is grammatically correct?',
        options: [
            'She go to school every day.',
            'She goes to school every day.',
            'She going to school every day.',
            'She gone to school every day.'
        ],
        correct: 1
    },
    {
        question: 'What is the past tense of "buy"?',
        options: ['Buyed', 'Bought', 'Buying', 'Buys'],
        correct: 1
    },
    {
        question: 'Choose the correct article: "He is ___ honest person."',
        options: ['a', 'an', 'the', 'no article'],
        correct: 1
    },
    {
        question: 'Which word is a synonym of "important"?',
        options: ['Significant', 'Ordinary', 'Useless', 'Minor'],
        correct: 0
    },
    {
        question: 'What does "deadline" mean?',
        options: [
            'Starting date',
            'Final time to complete something',
            'Meeting location',
            'Break time'
        ],
        correct: 1
    },
    {
        question: 'Choose the correct form: "If I ___ rich, I would travel the world."',
        options: ['am', 'was', 'were', 'be'],
        correct: 2
    },
    {
        question: 'Which phrase is appropriate in a formal business email?',
        options: [
            'Hey buddy!',
            'What’s up?',
            'Dear Mr. Smith,',
            'Yo!'
        ],
        correct: 2
    },
    {
        question: 'What is the opposite of "increase"?',
        options: ['Expand', 'Improve', 'Decrease', 'Develop'],
        correct: 2
    },
    {
        question: 'Choose the correct preposition: "She is interested ___ learning English."',
        options: ['on', 'at', 'in', 'for'],
        correct: 2
    },
    {
        question: 'What does "ASAP" stand for?',
        options: [
            'As Soon As Possible',
            'At Some Available Point',
            'As Simple As Planned',
            'After Sending A Proposal'
        ],
        correct: 0
    },
    {
        question: 'Which sentence uses the present perfect tense?',
        options: [
            'I visited London last year.',
            'I have visited London.',
            'I visit London every year.',
            'I am visiting London now.'
        ],
        correct: 1
    },
    {
        question: 'What does "negotiate" mean?',
        options: [
            'To avoid communication',
            'To discuss in order to reach an agreement',
            'To cancel a contract',
            'To write a report'
        ],
        correct: 1
    },
    {
        question: 'Choose the correct word: "The company ___ new employees every year."',
        options: ['recruit', 'recruits', 'recruiting', 'recruited'],
        correct: 1
    },
    {
        question: 'Which expression is suitable for asking someone to repeat information politely?',
        options: [
            'Say it again!',
            'What?',
            'Could you repeat that, please?',
            'Speak louder!'
        ],
        correct: 2
    },
    {
        question: 'What does "revenue" mean?',
        options: [
            'Company expenses',
            'Money earned from business activities',
            'Employee salaries',
            'Company debt'
        ],
        correct: 1
    },
    {
        question: 'Choose the correct passive voice: "They built this bridge in 2020."',
        options: [
            'This bridge built in 2020.',
            'This bridge was built in 2020.',
            'This bridge is building in 2020.',
            'This bridge has build in 2020.'
        ],
        correct: 1
    },
    {
        question: 'What is the plural form of "analysis"?',
        options: ['Analysises', 'Analysiseses', 'Analyses', 'Analysis'],
        correct: 2
    },
    {
        question: 'Which word best completes the sentence: "We look forward to ___ from you."',
        options: ['hear', 'hearing', 'heard', 'hears'],
        correct: 1
    },
    {
        question: 'What does "customer satisfaction" refer to?',
        options: [
            'Customer complaints only',
            'How satisfied customers are with a product or service',
            'The number of company employees',
            'The company’s monthly expenses'
        ],
        correct: 1
    },
    {
        question: 'Choose the correct reported speech: He said, "I am busy."',
        options: [
            'He said he is busy.',
            'He said he was busy.',
            'He said I was busy.',
            'He says he busy.'
        ],
        correct: 1
    }
];

let activeQuiz = [];
let currentQIndex = 0;
let score = 0;
let hasAnswered = false;

function shuffleQuestions(questions) {
    const shuffled = [...questions];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i]
        ];
    }

    return shuffled;
}

function getQuizElements() {
    return {
        card: document.getElementById('quizCard'),
        question: document.getElementById('quizQuestion'),
        options: document.getElementById('quizOptions'),
        progress: document.getElementById('quizProgress'),
        score: document.getElementById('quizScoreTracker'),
        feedback: document.getElementById('quizFeedbackMsg'),
        next: document.getElementById('nextQuizBtn'),
        result: document.getElementById('quizResultBox'),
        finalScore: document.getElementById('quizFinalScoreText')
    };
}

function startQuiz() {
    if (quizData.length < QUIZ_SIZE) {
        console.error('[Quiz] Not enough questions.');
        return;
    }

    activeQuiz = shuffleQuestions(quizData).slice(0, QUIZ_SIZE);

    currentQIndex = 0;
    score = 0;
    hasAnswered = false;

    const elements = getQuizElements();

    if (!elements.question || !elements.options || !elements.card) {
        console.error('[Quiz] Required HTML elements not found.');
        return;
    }

    elements.card.classList.remove('hidden');
    elements.result?.classList.add('hidden');

    if (elements.next) {
        elements.next.classList.add('hidden');
    }

    if (elements.feedback) {
        elements.feedback.textContent = '';
    }

    updateScore();
    loadQuizQuestion();
}

function updateScore() {
    const elements = getQuizElements();

    if (elements.score) {
        elements.score.textContent = `Điểm: ${score}`;
    }
}

function loadQuizQuestion() {
    const elements = getQuizElements();

    if (!elements.question || !elements.options) {
        console.error('[Quiz] Question or options container not found.');
        return;
    }

    if (currentQIndex >= activeQuiz.length) {
        showQuizResult();
        return;
    }

    const question = activeQuiz[currentQIndex];

    hasAnswered = false;

    elements.question.textContent = question.question;
    elements.options.replaceChildren();

    if (elements.progress) {
        elements.progress.textContent =
            `Câu hỏi ${currentQIndex + 1}/${QUIZ_SIZE}`;
    }

    if (elements.feedback) {
        elements.feedback.textContent = '';
        elements.feedback.className = 'text-sm font-medium';
    }

    if (elements.next) {
        elements.next.classList.add('hidden');
    }

    question.options.forEach((option, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className =
            'quiz-opt-btn w-full text-left p-4 border border-neutral-200 ' +
            'rounded-xl hover:border-black hover:bg-neutral-50 transition';

        button.textContent = option;
        button.addEventListener('click', () => selectQuizAnswer(index));

        elements.options.appendChild(button);
    });
}

function selectQuizAnswer(selectedIndex) {
    if (hasAnswered || currentQIndex >= activeQuiz.length) {
        return;
    }

    const question = activeQuiz[currentQIndex];

    if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= question.options.length
    ) {
        return;
    }

    hasAnswered = true;

    const elements = getQuizElements();
    const buttons = elements.options.querySelectorAll('button');

    buttons.forEach((button, index) => {
        button.disabled = true;

        button.classList.remove(
            'hover:border-black',
            'hover:bg-neutral-50'
        );

        if (index === question.correct) {
            button.classList.add(
                'border-green-500',
                'bg-green-50',
                'text-green-700'
            );
        } else if (index === selectedIndex) {
            button.classList.add(
                'border-red-500',
                'bg-red-50',
                'text-red-700'
            );
        }
    });

    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
        score += POINTS_PER_QUESTION;
    }

    updateScore();

    if (elements.feedback) {
        elements.feedback.textContent = isCorrect
            ? 'Chính xác! / Correct!'
            : 'Chưa chính xác. Hãy ghi nhớ đáp án đúng nhé.';

        elements.feedback.className = isCorrect
            ? 'text-sm font-medium text-green-600'
            : 'text-sm font-medium text-red-600';
    }

    if (elements.next) {
        elements.next.textContent =
            currentQIndex === QUIZ_SIZE - 1
                ? 'Xem kết quả / View Result'
                : 'Câu tiếp theo / Next';

        elements.next.classList.remove('hidden');
    }
}

function nextQuizQuestion() {
    if (!hasAnswered) {
        return;
    }

    currentQIndex++;

    if (currentQIndex >= activeQuiz.length) {
        showQuizResult();
        return;
    }

    loadQuizQuestion();
}

function showQuizResult() {
    const elements = getQuizElements();

    elements.card?.classList.add('hidden');
    elements.result?.classList.remove('hidden');

    if (elements.finalScore) {
        elements.finalScore.textContent =
            `Điểm của bạn: ${score}/${QUIZ_SIZE * POINTS_PER_QUESTION}`;
    }

    if (elements.progress) {
        elements.progress.textContent = 'Hoàn thành 5/5';
    }
}

function restartQuiz() {
    startQuiz();
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = getQuizElements();

    if (!elements.next) {
        console.error('[Quiz] Next button not found.');
        return;
    }

    // index.html already calls nextQuizQuestion() inline.
    startQuiz();
});
