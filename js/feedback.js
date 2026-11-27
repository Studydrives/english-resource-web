
'use strict';

/**
 * HUFLIT English Hub
 * Feedback display
 *
 * Demonstration feedback and locally submitted surveys
 * are displayed in separate sections.
 */

const FEEDBACK_SURVEY_STORAGE_KEY = 'huflit_english_hub_surveys';

const virtualFeedbacks = [
    {
        name: 'Trần Minh Quân',
        year: 'Sinh viên Năm 3',
        major: 'Ngôn ngữ Anh',
        stars: 5,
        comment: 'Web tối giản đỉnh chóp lun, tìm tài liệu Business English ôn thi cuối kỳ phê lòi :v',
        date: 'Hôm qua'
    },
    {
        name: 'Lê Hoàng Yến',
        year: 'Sinh viên Năm 2',
        major: 'Quản trị KD',
        stars: 4,
        comment: 'Kho tài liệu phong phú vãi, phần Quiz 5 câu hay phết. Mong web add thêm audio nghe nha.',
        date: '2 ngày trước'
    },
    {
        name: 'Nguyễn Hải Nam',
        year: 'Sinh viên Năm 4',
        major: 'Hệ thống thông tin',
        stars: 5,
        comment: 'Giao diện mượt, search gợi ý nhanh gọn. Thích nhất khoản k cần tải file rườm rà click đọc lun.',
        date: '3 ngày trước'
    },
    {
        name: 'Phạm Quỳnh Chi',
        year: 'Sinh viên Năm 1',
        major: 'Kế toán - Kiểm toán',
        stars: 5,
        comment: 'Mới vô trường k biết kiếm tài liệu đâu, may ô giới thiệu web này. Quá ổn áp cho sv năm 1!',
        date: '3 ngày trước'
    },
    {
        name: 'Đặng Tuấn Kiệt',
        year: 'Sinh viên Năm 3',
        major: 'Ngôn ngữ Anh',
        stars: 4,
        comment: 'Font chữ đẹp, màu đen trắng nhìn sang kiểu Studocu. Tốc độ load web nhanh ko bị lag.',
        date: '4 ngày trước'
    },
    {
        name: 'Vũ Thị Thảo',
        year: 'Sinh viên Năm 2',
        major: 'Marketing',
        stars: 5,
        comment: 'Tài liệu marketing case study đọc cuốn cực. Cho web 10 điểm k nhưng nhé hahaha.',
        date: '5 ngày trước'
    },
    {
        name: 'Hoàng Văn Long',
        year: 'Sinh viên Năm 4',
        major: 'Tài chính Ngân hàng',
        stars: 4,
        comment: 'Nhiều từ vựng chuyên ngành khá chuẩn. Cần bổ sung thêm đề thi mẫu các năm trc nữa là hoàn hảo.',
        date: '5 ngày trước'
    },
    {
        name: 'Bùi Ngọc Mai',
        year: 'Sinh viên Năm 1',
        major: 'Quản trị Khách sạn',
        stars: 5,
        comment: 'Giao diện tối giản xịn xò quá chời. Bot robot chat cute phô mai que nữa chứ :3',
        date: '6 ngày trước'
    },
    {
        name: 'Ngô Quang Huy',
        year: 'Sinh viên Năm 3',
        major: 'Luật Thương mại',
        stars: 5,
        comment: 'Đọc phần Supply Chain với Incoterms 2020 thấy tóm tắt ngắn gọn dễ hiểu vãi.',
        date: '1 tuần trước'
    },
    {
        name: 'Lý Gia Hân',
        year: 'Sinh viên Năm 2',
        major: 'Ngôn ngữ Anh',
        stars: 4,
        comment: 'Nói chung là ưng cái bụng, lướt mượt mà, tài liệu không bịa đặt lung tung.',
        date: '1 tuần trước'
    }
];

function getSubmittedSurveys() {
    try {
        const storedData = localStorage.getItem(
            FEEDBACK_SURVEY_STORAGE_KEY
        );

        if (!storedData) {
            return [];
        }

        const surveys = JSON.parse(storedData);

        if (!Array.isArray(surveys)) {
            return [];
        }

        return surveys.filter((survey) => (
            survey &&
            typeof survey === 'object' &&
            typeof survey.rating === 'string' &&
            typeof survey.comments === 'string'
        ));
    } catch (error) {
        console.error(
            '[Feedback] Unable to read submitted surveys:',
            error
        );

        return [];
    }
}

function formatSurveyDate(timestamp) {
    if (!timestamp) {
        return 'Không rõ thời gian';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return 'Không rõ thời gian';
    }

    return date.toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function createSubmittedFeedbackSection() {
    const sampleList = document.getElementById(
        'virtualFeedbackList'
    );

    if (!sampleList) {
        console.warn('[Feedback] Feedback list element not found.');
        return null;
    }

    const existingSection = document.getElementById(
        'submittedFeedbackSection'
    );

    if (existingSection) {
        return existingSection;
    }

    const sampleSection = sampleList.closest(
        'section[aria-labelledby="feedback-heading"]'
    );

    if (!sampleSection || !sampleSection.parentElement) {
        console.warn('[Feedback] Feedback section not found.');
        return null;
    }

    const section = document.createElement('section');

    section.id = 'submittedFeedbackSection';
    section.className = 'mb-10';
    section.setAttribute(
        'aria-labelledby',
        'submitted-feedback-heading'
    );

    const heading = document.createElement('h3');

    heading.id = 'submitted-feedback-heading';
    heading.className = 'text-xl font-bold tracking-tight mb-2';
    heading.textContent = 'Đánh giá đã gửi / Submitted Feedback';

    const description = document.createElement('p');

    description.className = 'text-xs text-neutral-500 mb-6';
    description.textContent =
        'Các đánh giá được lưu trên trình duyệt hiện tại, chưa đồng bộ lên máy chủ.';

    const list = document.createElement('div');

    list.id = 'submittedFeedbackList';
    list.className =
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

    section.append(heading, description, list);

    sampleSection.parentElement.insertBefore(
        section,
        sampleSection
    );

    return section;
}

function renderSubmittedSurveys() {
    const section = createSubmittedFeedbackSection();

    if (!section) {
        return;
    }

    const list = section.querySelector(
        '#submittedFeedbackList'
    );

    if (!list) {
        return;
    }

    list.replaceChildren();

    const surveys = getSubmittedSurveys().sort((a, b) => (
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    ));

    if (surveys.length === 0) {
        const emptyMessage = document.createElement('p');

        emptyMessage.className =
            'col-span-full text-sm text-neutral-500 py-4';

        emptyMessage.textContent =
            'Chưa có đánh giá nào được gửi trên trình duyệt này.';

        list.appendChild(emptyMessage);
        return;
    }

    surveys.forEach((survey) => {
        const card = document.createElement('article');

        card.className =
            'border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm';

        const header = document.createElement('div');

        header.className =
            'flex items-center justify-between gap-3 mb-4';

        const label = document.createElement('span');

        label.className =
            'text-xs font-semibold bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full';

        label.textContent = survey.rating;

        const date = document.createElement('time');

        date.className = 'text-xs text-neutral-400';

        date.textContent = formatSurveyDate(survey.timestamp);

        if (survey.timestamp) {
            date.dateTime = survey.timestamp;
        }

        header.append(label, date);

        const comment = document.createElement('p');

        comment.className =
            'text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap';

        comment.textContent = survey.comments;

        const storageNote = document.createElement('p');

        storageNote.className =
            'text-xs text-neutral-400 mt-4 pt-3 border-t border-neutral-100';

        storageNote.textContent = 'Đã lưu trên thiết bị này';

        card.append(header, comment, storageNote);

        list.appendChild(card);
    });
}

function renderVirtualFeedbacks() {
    const list = document.getElementById('virtualFeedbackList');

    if (!list) {
        console.warn('[Feedback] Feedback list element not found.');
        return;
    }

    list.replaceChildren();

    virtualFeedbacks.forEach((feedback) => {
        const card = document.createElement('article');

        card.className =
            'border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between';

        const content = document.createElement('div');

        const header = document.createElement('div');

        header.className =
            'flex items-center justify-between mb-2';

        const name = document.createElement('span');

        name.className = 'font-bold text-sm';
        name.textContent = feedback.name;

        const date = document.createElement('span');

        date.className = 'text-xs text-neutral-400';
        date.textContent = feedback.date;

        header.append(name, date);

        const details = document.createElement('div');

        details.className = 'text-xs text-neutral-500 mb-3';

        details.textContent =
            `${feedback.year} • Ngành: ${feedback.major}`;

        const stars = document.createElement('div');

        stars.className = 'flex text-amber-400 text-xs mb-3';

        stars.setAttribute(
            'aria-label',
            `${feedback.stars} trên 5 sao`
        );

        for (let index = 0; index < feedback.stars; index++) {
            const star = document.createElement('i');

            star.className = 'fa-solid fa-star';
            star.setAttribute('aria-hidden', 'true');

            stars.appendChild(star);
        }

        const comment = document.createElement('p');

        comment.className =
            'text-xs text-neutral-700 leading-relaxed';

        comment.textContent = `"${feedback.comment}"`;

        content.append(header, details, stars, comment);

        card.appendChild(content);
        list.appendChild(card);
    });
}

function initializeFeedback() {
    renderSubmittedSurveys();
    renderVirtualFeedbacks();

    const surveyForm = document.getElementById('surveyForm');

    if (surveyForm) {
        // survey.js registers its submit handler before this handler.
        // Therefore, saved data is available when this callback runs.
        surveyForm.addEventListener('submit', () => {
            renderSubmittedSurveys();
        });
    }

    // Refresh when another browser tab updates localStorage.
    window.addEventListener('storage', (event) => {
        if (event.key === FEEDBACK_SURVEY_STORAGE_KEY) {
            renderSubmittedSurveys();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeFeedback);
