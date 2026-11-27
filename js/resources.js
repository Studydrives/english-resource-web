'use strict';

/**
 * HUFLIT English Hub
 * Resource data and document content builder
 */

function createFullPageSheet(
    pageNo,
    longKeywords,
    overview,
    coreSections,
    sampleBox,
    studyTip
) {
    const sectionsHtml = coreSections.map((sec) => `
        <div class="border-l-2 border-black pl-4">
            <h4 class="font-bold text-neutral-900 text-sm mb-1">
                ${sec.heading}
            </h4>
            <p class="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                ${sec.body}
            </p>
        </div>
    `).join('');

    return `
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Từ khóa dài trọng tâm (Long Keywords) • Trang ${pageNo}
            </div>
            <p class="text-xs sm:text-sm font-semibold text-neutral-900">
                ${longKeywords}
            </p>
        </div>

        <div>
            <h4 class="font-bold text-neutral-900 text-sm mb-1.5">
                1. Tổng quan trang tài liệu
            </h4>
            <p class="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                ${overview}
            </p>
        </div>

        <div class="space-y-3">
            <h4 class="font-bold text-neutral-900 text-sm">
                2. Nội dung chi tiết & Thuật ngữ
            </h4>
            ${sectionsHtml}
        </div>

        <div class="bg-neutral-900 text-white rounded-xl p-4 space-y-1.5">
            <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                3. Ví dụ / Mẫu áp dụng thực tế
            </div>
            <div class="text-xs sm:text-sm leading-relaxed text-neutral-100">
                ${sampleBox}
            </div>
        </div>

        <div class="bg-neutral-100 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-800">
            <span class="font-bold">💡 Ghi nhớ ôn tập nhanh:</span>
            ${studyTip}
        </div>
    `;
}

const resourcesData = [
    {
        id: 1,
        title: "Academic Essay Writing Guide & Advanced Structure",
        category: "Business English",
        desc: "Trang tài liệu hướng dẫn cấu trúc bài luận học thuật, câu luận điểm, từ nối chuyển ý và từ vựng nâng cao cho sinh viên HUFLIT.",
        content: createFullPageSheet(
            1,
            "Academic Vocabulary Acquisition • Structural Layout Optimization • Thesis Statement Development",
            "Bài luận học thuật (Academic Essay) đòi hỏi văn phong khách quan, lập luận chặt chẽ và hệ thống từ vựng chuẩn xác. Trang tài liệu này tổng hợp khung bài viết chuẩn giúp người học triển khai ý tưởng rõ ràng từ mở bài đến kết luận.",
            [
                {
                    heading: "Cấu trúc 3 phần cốt lõi",
                    body: "Mở bài (Introduction) dẫn dắt bối cảnh và nêu luận điểm (Thesis Statement); Thân bài (Body Paragraphs) mỗi đoạn tập trung một luận điểm chính kèm dẫn chứng; Kết bài (Conclusion) tóm lược lại ý và nêu hàm ý."
                },
                {
                    heading: "Từ nối & liên kết mạch lạc",
                    body: "Dùng 'Furthermore', 'Moreover' để bổ sung ý; 'Conversely', 'Nevertheless' để tạo tương phản; 'Consequently', 'As a result' để chỉ hệ quả."
                },
                {
                    heading: "Nâng cấp từ vựng học thuật",
                    body: "Thay thế các cụm nói thông thường như 'a lot of', 'get bigger', 'bad for' bằng 'a substantial number of', 'expand significantly', 'detrimental to'."
                }
            ],
            "<b>Thesis Statement mẫu:</b> While digital learning platforms offer unprecedented flexibility, their long-term effectiveness depends on structured guidance and active student engagement.",
            "Luôn kiểm tra xem mỗi câu chủ đề (Topic Sentence) có phục vụ trực tiếp cho luận điểm chính ở đoạn mở bài hay không."
        )
    },
    {
        id: 2,
        title: "English Phonetics & Phonology Masterclass",
        category: "Linguistics",
        desc: "Trang tài liệu chuyên sâu về bảng phiên âm IPA, phân loại nguyên âm - phụ âm, quy tắc trọng âm và ngữ điệu trong giao tiếp tiếng Anh.",
        content: createFullPageSheet(
            2,
            "International Phonetic Alphabet • Stress Patterns in Multi-syllable Words • Intonation Contours",
            "Ngữ âm và âm vị học (Phonetics & Phonology) là nền tảng giúp người học phát âm chuẩn và nghe hiểu chính xác hơn. Trang này tóm tắt hệ thống âm chuẩn, trọng âm từ và ngữ điệu câu thường gặp.",
            [
                {
                    heading: "Hệ thống nguyên âm và phụ âm IPA",
                    body: "Tiếng Anh chuẩn có 20 nguyên âm (gồm nguyên âm đơn ngắn, nguyên âm đơn dài và nguyên âm đôi) cùng 24 phụ âm chia theo vị trí cấu âm và độ rung thanh quản."
                },
                {
                    heading: "Quy tắc nhấn trọng âm từ",
                    body: "Danh từ và tính từ hai âm tiết thường nhấn âm đầu (e.g., 'TAble', 'CLEver'), trong khi động từ hai âm tiết thường nhấn âm hai (e.g., 'deCIDE', 'rePAIR')."
                },
                {
                    heading: "Ngữ điệu câu (Intonation)",
                    body: "Câu hỏi Yes/No thường có ngữ điệu đi lên ở cuối câu; câu hỏi Wh- và câu trần thuật thường đi xuống để thể hiện sự chắc chắn."
                }
            ],
            "<b>Ví dụ trọng âm:</b> 'PREsent (danh từ: món quà) vs. preSENT (động từ: trình bày); 'REcord (hồ sơ) vs. reCORD (ghi âm).",
            "Luyện nghe và nhại lại (shadowing) theo từng cụm ý thay vì đọc rời từng từ đơn lẻ."
        )
    },
    {
        id: 3,
        title: "Corporate Recruitment Strategies & HR Workflow",
        category: "Human Resources",
        desc: "Trang tài liệu về quy trình tuyển dụng doanh nghiệp, viết mô tả công việc, phỏng vấn theo phương pháp STAR và hội nhập nhân sự.",
        content: createFullPageSheet(
            3,
            "Candidate Evaluation Parameters • Formal Employment Onboarding Templates • STAR Interview Method",
            "Tuyển dụng và quản trị nguồn nhân lực hiện đại yêu cầu sự minh bạch, chuẩn hóa tiêu chí đánh giá và trải nghiệm ứng viên chuyên nghiệp từ khâu đăng tuyển đến nhận việc.",
            [
                {
                    heading: "Thiết kế Job Description & Screening",
                    body: "Xác định rõ mục tiêu vị trí, trách nhiệm chính, kỹ năng bắt buộc và kỹ năng ưu tiên để lọc hồ sơ chính xác."
                },
                {
                    heading: "Phỏng vấn theo phương pháp STAR",
                    body: "Đánh giá năng lực thực tế của ứng viên qua 4 yếu tố: Situation (Bối cảnh), Task (Nhiệm vụ), Action (Hành động cá nhân), Result (Kết quả đạt được)."
                },
                {
                    heading: "Quy trình Onboarding",
                    body: "Hướng dẫn nhân viên mới làm quen văn hóa công ty, công cụ làm việc, mục tiêu 30-60-90 ngày và người đồng hành (buddy)."
                }
            ],
            "<b>Câu hỏi phỏng vấn STAR:</b> 'Tell me about a time you resolved a team conflict under a tight deadline.' — Ứng viên cần nêu rõ hành động cụ thể của bản thân và kết quả đo lường được.",
            "Khi trả lời phỏng vấn, dành khoảng 60–70% thời lượng cho phần Action và Result."
        )
    },
    {
        id: 4,
        title: "Digital Device Utilization & Academic Concentration",
        category: "Methodology",
        desc: "Trang tổng hợp nghiên cứu về thói quen dùng thiết bị số, mức độ tập trung học tập của sinh viên và phương pháp quản lý thời gian.",
        content: createFullPageSheet(
            4,
            "Digital Device Utilization Patterns • Academic Concentration Levels • Behavioral Impacts Analysis",
            "Điện thoại thông minh và laptop mang lại kho tài liệu khổng lồ nhưng cũng là nguồn gây xao nhãng lớn nếu sinh viên không kiểm soát thông báo và thời lượng sử dụng.",
            [
                {
                    heading: "Tác động của đa nhiệm kỹ thuật số",
                    body: "Chuyển đổi liên tục giữa tab học tập và mạng xã hội làm giảm hiệu suất xử lý thông tin và kéo dài thời gian hoàn thành bài tập."
                },
                {
                    heading: "Kỹ thuật Pomodoro & Deep Work",
                    body: "Chia thời gian học thành các phiên tập trung cao độ (25–50 phút) xen kẽ nghỉ ngắn (5–10 phút) và tắt thông báo không cần thiết."
                },
                {
                    heading: "Theo dõi tiến độ học tập",
                    body: "Ghi chép mục tiêu từng buổi học giúp nhận diện khung giờ tập trung tốt nhất của bản thân."
                }
            ],
            "<b>Lịch học mẫu 1 phiên:</b> 45 phút đọc tài liệu & ghi chú từ vựng không mở mạng xã hội -> 10 phút nghỉ giãn mắt -> tóm tắt lại 3 ý chính.",
            "Đặt điện thoại ở chế độ im lặng hoặc để xa tầm với khi đang ôn bài hoặc làm quiz."
        )
    },
    {
        id: 5,
        title: "Business Communication & Professional Email Writing",
        category: "Business English",
        desc: "Trang tài liệu hướng dẫn viết email thương mại chuyên nghiệp, đặt hàng, phản hồi khách hàng và xử lý tình huống công sở bằng tiếng Anh.",
        content: createFullPageSheet(
            5,
            "Formal Business Correspondence • Complaint Resolution Emails • Order Placement Templates",
            "Email là kênh giao tiếp chính thức phổ biến trong môi trường kinh doanh. Một email tốt cần tiêu đề rõ ràng, mục đích nêu ngay từ đầu và giọng điệu lịch sự, đúng ngữ cảnh.",
            [
                {
                    heading: "Subject Line & Salutation",
                    body: "Tiêu đề ngắn gọn, nêu rõ chủ đề và mã tham chiếu nếu có. Dùng 'Dear [Name],' hoặc 'Dear Hiring Team,' cho văn phong trang trọng."
                },
                {
                    heading: "Thân bài đi thẳng vào trọng tâm",
                    body: "Đoạn đầu nêu lý do viết email; đoạn giữa trình bày chi tiết yêu cầu, số liệu hoặc thời hạn; đoạn cuối nêu bước tiếp theo."
                },
                {
                    heading: "Sign-off chuẩn mực",
                    body: "Dùng 'Best regards,' hoặc 'Sincerely,' kèm chữ ký đầy đủ họ tên và chức danh."
                }
            ],
            "<b>Mẫu mở đầu:</b> 'I am writing to follow up on the quotation sent on November 15 and confirm our delivery schedule for next week.'",
            "Luôn đọc lại email một lượt trước khi gửi để kiểm tra tên người nhận, số liệu, ngày tháng và file đính kèm."
        )
    }
];
