'use strict';

/**
 * HUFLIT English Hub
 * Survey form handling
 *
 * Temporary storage:
 * Survey submissions are stored locally in the current browser.
 * Online synchronization will be implemented separately.
 */

const SURVEY_STORAGE_KEY = 'huflit_english_hub_surveys';

function getSurveyElements() {
    return {
        form: document.getElementById('surveyForm'),
        rating: document.getElementById('rating'),
        comments: document.getElementById('comments'),
        status: document.getElementById('surveyStatus')
    };
}

function setSurveyStatus(message, type = 'info') {
    const status = document.getElementById('surveyStatus');

    if (!status) {
        return;
    }

    status.textContent = message;
    status.dataset.state = type;
}

function getStoredSurveys() {
    try {
        const storedData = localStorage.getItem(SURVEY_STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        const surveys = JSON.parse(storedData);

        return Array.isArray(surveys) ? surveys : [];
    } catch (error) {
        console.error('[Survey] Unable to read stored surveys:', error);
        throw new Error('Không thể đọc dữ liệu khảo sát đã lưu.');
    }
}

function saveSurvey(submission) {
    try {
        const surveys = getStoredSurveys();

        surveys.push(submission);

        localStorage.setItem(
            SURVEY_STORAGE_KEY,
            JSON.stringify(surveys)
        );
    } catch (error) {
        console.error('[Survey] Unable to save submission:', error);

        throw new Error(
            'Không thể lưu khảo sát. Vui lòng kiểm tra bộ nhớ trình duyệt.'
        );
    }
}

function handleSurveySubmit(event) {
    event.preventDefault();

    const elements = getSurveyElements();

    if (!elements.form || !elements.rating || !elements.comments) {
        setSurveyStatus(
            'Không tìm thấy đầy đủ các thành phần của biểu mẫu.',
            'error'
        );
        return;
    }

    if (!elements.form.reportValidity()) {
        return;
    }

    const rating = elements.rating.value.trim();
    const comments = elements.comments.value.trim();

    if (!rating || !comments) {
        setSurveyStatus(
            'Vui lòng chọn mức đánh giá và nhập ý kiến.',
            'error'
        );
        return;
    }

    const submission = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `survey-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        rating,
        comments,
        timestamp: new Date().toISOString()
    };

    try {
        saveSurvey(submission);

        elements.form.reset();

        setSurveyStatus(
            'Cảm ơn bạn! Đánh giá đã được lưu trên trình duyệt này. Dữ liệu hiện chưa được đồng bộ lên máy chủ.',
            'success'
        );
    } catch (error) {
        setSurveyStatus(error.message, 'error');
    }
}

function initializeSurvey() {
    const { form } = getSurveyElements();

    if (!form) {
        console.warn('[Survey] Survey form was not found.');
        return;
    }

    form.addEventListener('submit', handleSurveySubmit);
}

document.addEventListener('DOMContentLoaded', initializeSurvey);
