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

function startQuiz() {
    activeQuiz = shuffleQuestions(quizData).slice(0, QUIZ_SIZE);

    currentQIndex = 0;
    score = 0;
    hasAnswered = false;

    loadQuizQuestion();
}

function loadQuizQuestion() {
    const questionElement = document.getElementById('questionText');
    const optionsElement = document.getElementById('optionsContainer');
    const progressElement = document.getElementById('quizProgress');

    if (!questionElement || !optionsElement) {
        console.error('[Quiz] Required quiz elements not found.');
        return;
    }

    if (currentQIndex >= activeQuiz.length) {
        showQuizResult();
        return;
    }

    const question = activeQuiz[currentQIndex];

    hasAnswered = false;

    questionElement.textContent = question.question;
    optionsElement.replaceChildren();

    if (progressElement) {
        progressElement.textContent =
            `Câu hỏi ${currentQIndex + 1}/${QUIZ_SIZE}`;
    }

    question.options.forEach((option, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className =
            'w-full text-left p-4 border border-neutral-200 rounded-xl ' +
            'hover:border-black hover:bg-neutral-50 transition';

        button.textContent = option;

        button.addEventListener('click', () => {
            selectQuizAnswer(index);
        });

        optionsElement.appendChild(button);
    });
}

function selectQuizAnswer(selectedIndex) {
    if (hasAnswered || currentQIndex >= activeQuiz.length) {
        return;
    }

    hasAnswered = true;

    const question = activeQuiz[currentQIndex];
    const optionButtons = document.querySelectorAll(
        '#optionsContainer button'
    );

    optionButtons.forEach((button, index) => {
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

    if (selectedIndex === question.correct) {
        score += POINTS_PER_QUESTION;
    }

    const nextButton = document.getElementById('nextQuestionBtn');

    if (nextButton) {
        nextButton.classList.remove('hidden');
        nextButton.textContent =
            currentQIndex === QUIZ_SIZE - 1
                ? 'Xem kết quả'
                : 'Câu tiếp theo';
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

    const nextButton = document.getElementById('nextQuestionBtn');

    if (nextButton) {
        nextButton.classList.add('hidden');
    }

    loadQuizQuestion();
}

function showQuizResult() {
    const questionElement = document.getElementById('questionText');
    const optionsElement = document.getElementById('optionsContainer');
    const progressElement = document.getElementById('quizProgress');
    const nextButton = document.getElementById('nextQuestionBtn');

    if (questionElement) {
        questionElement.textContent = 'Bạn đã hoàn thành bài kiểm tra!';
    }

    if (optionsElement) {
        optionsElement.replaceChildren();

        const result = document.createElement('p');

        result.className =
            'text-center text-2xl font-bold text-neutral-800 py-6';

        result.textContent = `Điểm của bạn: ${score}/${QUIZ_SIZE * POINTS_PER_QUESTION}`;

        optionsElement.appendChild(result);

        const message = document.createElement('p');

        message.className = 'text-center text-neutral-500';

        if (score === 100) {
            message.textContent = 'Xuất sắc! Bạn đã trả lời đúng tất cả.';
        } else if (score >= 60) {
            message.textContent = 'Làm tốt lắm! Hãy tiếp tục luyện tập.';
        } else {
            message.textContent = 'Hãy ôn tập thêm và thử lại nhé.';
        }

        optionsElement.appendChild(message);
    }

    if (progressElement) {
        progressElement.textContent = 'Hoàn thành 5/5';
    }

    if (nextButton) {
        nextButton.classList.add('hidden');
    }
}

function restartQuiz() {
    startQuiz();

    const nextButton = document.getElementById('nextQuestionBtn');

    if (nextButton) {
        nextButton.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nextButton = document.getElementById('nextQuestionBtn');

    if (nextButton) {
        nextButton.addEventListener('click', nextQuizQuestion);
    }

    startQuiz();
});
