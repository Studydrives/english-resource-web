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
    },
    {
                id: 6,
                title: "Intercultural Communication in Multinational Firms",
                category: "Linguistics",
                desc: "Trang tài liệu phân tích giao tiếp liên văn hóa, sắc thái ngữ cảnh cao/thấp và kỹ năng làm việc trong môi trường quốc tế.",
                content: createFullPageSheet(
                    6,
                    "High-context vs Low-context Cultures • Non-verbal Communication Nuances • Cross-cultural Barriers",
                    "Làm việc trong môi trường đa văn hóa đòi hỏi sự nhạy bén để tránh hiểu lầm trong cách diễn đạt trực tiếp/gián tiếp, quản lý thời gian và giao tiếp phi ngôn ngữ.",
                    [
                        { heading: "High-context & Low-context", body: "Văn hóa ngữ cảnh cao dựa nhiều vào ngầm hiểu, mối quan hệ và ngữ cảnh; văn hóa ngữ cảnh thấp ưu tiên diễn đạt rõ ràng, trực diện bằng lời." },
                        { heading: "Ngôn ngữ cơ thể & sắc thái", body: "Giao tiếp bằng mắt, khoảng cách cá nhân, cử chỉ tay và cách phản hồi 'có/không' có thể mang ý nghĩa khác nhau giữa các quốc gia." },
                        { heading: "Xây dựng sự đồng cảm nghề nghiệp", body: "Tránh phán xét vội vàng khi gặp khác biệt thói quen làm việc; đặt câu hỏi làm rõ thay vì suy đoán." }
                    ],
                    "<b>Tình huống thực tế:</b> Khi đối tác nói 'We will consider this carefully', trong nhiều ngữ cảnh giao tiếp đây có thể là cách từ chối tế nhị thay vì đồng ý ngay.",
                    "Chú ý cả cách nói lẫn ngữ cảnh để hiểu đúng ý định của người giao tiếp quốc tế."
                )
            },
            {
                id: 7,
                title: "IELTS Speaking Part 2 & 3 Comprehensive Topics",
                category: "Exam Prep",
                desc: "Trang tài liệu luyện nói IELTS Part 2 & 3 với dàn ý triển khai, cụm từ vựng nâng điểm và cách mở rộng câu trả lời phân tích.",
                content: createFullPageSheet(
                    7,
                    "Band 7.0+ Vocabulary Bank • Idiomatic Expressions • Structured Cue Card Answers",
                    "IELTS Speaking Part 2 kiểm tra khả năng nói mạch lạc trong 1–2 phút theo cue card, còn Part 3 yêu cầu phân tích, so sánh và lập luận ở tầm khái quát hơn.",
                    [
                        { heading: "Triển khai ý Part 2 theo trình tự thời gian", body: "Giới thiệu chủ đề -> bối cảnh/lý do -> diễn biến hoặc trải nghiệm nổi bật -> cảm nhận và tác động lâu dài." },
                        { heading: "Mở rộng lập luận ở Part 3", body: "Nêu quan điểm -> giải thích nguyên nhân -> đưa ví dụ thực tế -> so sánh hoặc xét khía cạnh ngược lại." },
                        { heading: "Cụm từ tự nhiên, chính xác", body: "Ưu tiên collocations tự nhiên như 'practical application', 'long-term benefits', 'weigh the pros and cons' hơn việc nhồi từ khó không đúng ngữ cảnh." }
                    ],
                    "<b>Cấu trúc trả lời Part 3:</b> 'From my perspective, digital tools have made self-study far more accessible, largely because learners can review lessons at their own pace.'",
                    "Ghi âm lại câu trả lời của bản thân để tự nhận ra chỗ ngập ngừng hoặc lặp từ."
                )
            },
            {
                id: 8,
                title: "Financial English Vocabulary & Balance Sheet Analysis",
                category: "Finance",
                desc: "Trang tài liệu thuật ngữ tài chính - kế toán tiếng Anh, bảng cân đối kế toán, doanh thu, chi phí và dòng tiền doanh nghiệp.",
                content: createFullPageSheet(
                    8,
                    "Corporate Finance Terminology • Asset and Liability Management • Revenue Stream Analysis",
                    "Nắm vững thuật ngữ tài chính tiếng Anh giúp sinh viên đọc hiểu báo cáo tài chính, bản tin kinh tế và trao đổi chính xác trong lĩnh vực kinh doanh.",
                    [
                        { heading: "Tài sản & Nợ phải trả", body: "Assets (Tài sản) gồm tài sản ngắn hạn (Current Assets) và tài sản dài hạn (Non-current Assets); Liabilities (Nợ phải trả) là nghĩa vụ tài chính doanh nghiệp phải thanh toán." },
                        { heading: "Doanh thu, Chi phí & Lợi nhuận", body: "Revenue (Doanh thu) là tổng giá trị thu được từ hoạt động kinh doanh; Expenses (Chi phí) là các khoản chi vận hành; Net Profit (Lợi nhuận ròng) là phần còn lại sau chi phí và thuế." },
                        { heading: "Dòng tiền (Cash Flow)", body: "Phân biệt giữa lợi nhuận kế toán và dòng tiền thực tế ra/vào doanh nghiệp trong từng kỳ." }
                    ],
                    "<b>Công thức khái niệm:</b> Assets = Liabilities + Equity (Tài sản = Nợ phải trả + Vốn chủ sở hữu).",
                    "Học từ vựng tài chính theo cặp khái niệm đối lập hoặc liên quan như Revenue – Expense, Receivable – Payable."
                )
            },
            {
                id: 9,
                title: "Customer Service Operation Manual & HEAT Rule",
                category: "Customer Care",
                desc: "Trang tài liệu quy trình chăm sóc khách hàng, xử lý khiếu nại, giữ bình tĩnh và áp dụng mô hình HEAT trong dịch vụ.",
                content: createFullPageSheet(
                    9,
                    "Customer Service Representative Standards • Conflict Resolution Protocols • HEAT Framework",
                    "Chăm sóc khách hàng hiệu quả không chỉ giải quyết sự cố mà còn giữ gìn uy tín thương hiệu khi khách hàng gặp trục trặc hoặc không hài lòng.",
                    [
                        { heading: "Bước H - Hear & E - Empathize", body: "Lắng nghe trọn vẹn không ngắt lời, sau đó thể hiện sự thấu hiểu trước trải nghiệm chưa trọn vẹn của khách hàng." },
                        { heading: "Bước A - Apologize & T - Take Action", body: "Xin lỗi chân thành, rõ ràng và đưa ra phương án xử lý cụ thể kèm mốc thời gian hoàn tất." },
                        { heading: "Giữ thái độ tích cực, chuyên nghiệp", body: "Tập trung vào giải pháp thay vì tranh luận đúng sai không cần thiết." }
                    ],
                    "<b>Mẫu câu phản hồi:</b> 'I completely understand how frustrating this delay must be for you. Let me check your order status right away and update you within 15 minutes.'",
                    "Luôn xác nhận lại với khách hàng rằng hướng giải quyết đã đáp ứng đúng nhu cầu của họ hay chưa."
                )
            },
            {
                id: 10,
                title: "Syntax & Sentence Structure Advanced Analysis",
                category: "Linguistics",
                desc: "Trang tài liệu phân tích cú pháp câu, phân biệt mệnh đề - cụm từ, mệnh đề quan hệ và cách tránh lỗi câu sai cấu trúc.",
                content: createFullPageSheet(
                    10,
                    "Syntactic Structure Analysis • Relative Clauses • Run-on Sentence Correction",
                    "Hiểu cấu trúc cú pháp giúp người viết kiểm soát độ dài câu, tránh lỗi thiếu vị ngữ, nối câu sai dấu phẩy (comma splice) hoặc câu kéo dài thiếu liên kết (run-on sentence).",
                    [
                        { heading: "Phrase vs. Clause", body: "Cụm từ (Phrase) không có đủ cặp chủ ngữ - vị ngữ hoàn chỉnh; Mệnh đề (Clause) có chủ ngữ và vị ngữ, chia thành mệnh đề độc lập và mệnh đề phụ thuộc." },
                        { heading: "Mệnh đề quan hệ (Relative Clauses)", body: "Mệnh đề xác định cung cấp thông tin thiết yếu (không dùng dấu phẩy); mệnh đề không xác định bổ sung thông tin phụ (có dấu phẩy)." },
                        { heading: "Khắc phục lỗi câu phức", body: "Dùng liên từ phụ thuộc, từ nối hợp lý hoặc tách thành hai câu độc lập khi ý quá dài." }
                    ],
                    "<b>Sửa lỗi Comma Splice:</b> Sai: 'The report was long, it covered all key metrics.' -> Đúng: 'The report was long; however, it covered all key metrics.'",
                    "Xác định rõ động từ chính (main verb) của từng câu trước khi thêm mệnh đề phụ."
                )
            },
            {
                id: 11,
                title: "Global Supply Chain Fundamentals & Incoterms 2020",
                category: "Business English",
                desc: "Trang tài liệu chuỗi cung ứng toàn cầu, quy trình logistics, chứng từ vận tải và các điều kiện giao hàng Incoterms 2020.",
                content: createFullPageSheet(
                    11,
                    "Supply Chain Management • International Logistics Operations • Incoterms 2020 Guidelines",
                    "Chuỗi cung ứng và logistics kết nối dòng chảy nguyên vật liệu, thông tin và tài chính từ nhà cung cấp đến khách hàng cuối cùng trên phạm vi toàn cầu.",
                    [
                        { heading: "Chuỗi cung ứng & Logistics", body: "Bao gồm thu mua, sản xuất, tồn kho, vận tải đa phương thức và phân phối hàng hóa đúng thời điểm, đúng địa điểm." },
                        { heading: "Nhóm điều kiện Incoterms 2020", body: "Quy định rõ trách nhiệm chi phí, chuyển giao rủi ro và nghĩa vụ thông quan giữa người bán và người mua (ví dụ: EXW, FOB, CIF, DDP)." },
                        { heading: "Chứng từ thương mại cơ bản", body: "Commercial Invoice, Packing List, Bill of Lading và Certificate of Origin." }
                    ],
                    "<b>Phân biệt nhanh:</b> Dưới điều kiện FOB, rủi ro chuyển từ người bán sang người mua khi hàng hóa được xếp qua lan can tàu tại cảng bốc hàng quy định.",
                    "Luôn ghi rõ phiên bản 'Incoterms 2020' và địa điểm cụ thể khi tham chiếu điều kiện giao hàng."
                )
            },
            {
                id: 12,
                title: "Public Speaking & Professional Presentation Skills",
                category: "Soft Skills",
                desc: "Trang tài liệu kỹ năng thuyết trình tiếng Anh, cách mở đầu thu hút, cấu trúc slide rõ ràng và làm chủ phần hỏi đáp.",
                content: createFullPageSheet(
                    12,
                    "Dynamic Public Speaking Techniques • Audience Engagement Strategies • Body Language Control",
                    "Thuyết trình hiệu quả là sự kết hợp giữa nội dung cô đọng, giọng nói có điểm nhấn, ngôn ngữ cơ thể tự nhiên và khả năng tương tác với người nghe.",
                    [
                        { heading: "Mở đầu gây chú ý & nêu mục tiêu", body: "Dùng câu hỏi gợi mở, số liệu nổi bật hoặc tình huống ngắn ở 30 giây đầu, sau đó tóm tắt lộ trình bài nói." },
                        { heading: "Trình bày ý rõ ràng, có điểm dừng", body: "Dùng từ chuyển ý như 'Moving on to the next point...', 'To put it simply...' và tạm dừng ngắn sau ý quan trọng." },
                        { heading: "Xử lý câu hỏi (Q&A)", body: "Lắng nghe kỹ câu hỏi, xác nhận lại ý nếu cần, trả lời trọng tâm và kết thúc gọn gàng." }
                    ],
                    "<b>Câu chuyển ý thuyết trình:</b> 'Now that we have examined the current challenges, let us look at practical solutions we can implement next semester.'",
                    "Tránh đọc nguyên văn chữ trên slide; dùng slide làm điểm tựa hình ảnh cho ý chính."
                )
            },
            {
                id: 13,
                title: "English Grammar In Use - Advanced Structures",
                category: "Grammar",
                desc: "Trang tài liệu ngữ pháp nâng cao: đảo ngữ nhấn mạnh, câu điều kiện hỗn hợp, thức giả định và thể bị động đặc biệt.",
                content: createFullPageSheet(
                    13,
                    "Advanced Grammatical Structures • Subject-Verb Inversion • Mixed Conditionals",
                    "Sử dụng linh hoạt các cấu trúc ngữ pháp nâng cao giúp bài viết học thuật và bài nói chuyên sâu đạt độ chính xác và sắc thái biểu đạt đa dạng hơn.",
                    [
                        { heading: "Đảo ngữ (Inversion)", body: "Thường dùng sau các trạng từ phủ định hoặc hạn định đứng đầu câu như 'Seldom', 'Rarely', 'Not only' để tạo sắc thái nhấn mạnh." },
                        { heading: "Câu điều kiện hỗn hợp (Mixed Conditionals)", body: "Kết hợp giả định ở quá khứ với kết quả ở hiện tại (hoặc ngược lại) khi hai thời điểm có mối liên hệ nhân - quả." },
                        { heading: "Thức giả định (Subjunctive Mood)", body: "Thường xuất hiện sau các động từ/tính từ mang tính đề xuất, yêu cầu, cần thiết như 'recommend', 'essential', 'insist that + S + V(bare)'." }
                    ],
                    "<b>Ví dụ đảo ngữ:</b> 'Not only does this platform organize study materials, but it also encourages active self-testing.'",
                    "Chỉ dùng cấu trúc đảo ngữ khi thật sự muốn nhấn mạnh, tránh lạm dụng làm câu trở nên nặng nề."
                )
            },
            {
                id: 14,
                title: "Marketing Strategy Case Studies & 4P Model",
                category: "Marketing",
                desc: "Trang tài liệu phân tích chiến lược marketing, mô hình 4P (Product, Price, Place, Promotion) và hành vi người tiêu dùng.",
                content: createFullPageSheet(
                    14,
                    "Strategic Marketing Management • The 4P Marketing Mix Framework • Consumer Behavior Analysis",
                    "Mô hình Marketing Mix 4P giúp doanh nghiệp định hình cách sản phẩm đáp ứng nhu cầu thị trường thông qua thiết kế, định giá, phân phối và truyền thông đồng bộ.",
                    [
                        { heading: "Product & Price", body: "Product tập trung vào giá trị cốt lõi, tính năng và bao bì; Price phản ánh định vị thương hiệu, giá trị cảm nhận và khả năng chi trả của khách hàng mục tiêu." },
                        { heading: "Place & Promotion", body: "Place đảm bảo sản phẩm tiếp cận thuận tiện đúng kênh; Promotion kết hợp quảng cáo, nội dung số, PR và khuyến mãi để tạo nhận diện." },
                        { heading: "Phân tích tình huống (Case Study)", body: "Luôn gắn phân tích 4P với chân dung khách hàng mục tiêu và bối cảnh cạnh tranh cụ thể." }
                    ],
                    "<b>Gợi ý phân tích case:</b> Khi đánh giá một chiến dịch, hãy đối chiếu xem thông điệp truyền thông có khớp với định vị giá và kênh phân phối hay không.",
                    "Tránh liệt kê 4P rời rạc; hãy chỉ ra sự liên kết thống nhất giữa cả bốn yếu tố."
                )
            },
            {
                id: 15,
                title: "HUFLIT Final Exam Preparation Set (Reading & Listening)",
                category: "Exam Prep",
                desc: "Trang tài liệu ôn tập thi cuối kỳ: chiến lược đọc hiểu, nhận diện ý chính, suy luận từ vựng và kỹ năng nghe lấy thông tin.",
                content: createFullPageSheet(
                    15,
                    "Standardized English Assessment • Reading Comprehension Strategies • Mock Test Practice",
                    "Ôn thi cuối kỳ hiệu quả đòi hỏi sự kết hợp giữa nắm vững từ vựng chuyên ngành, quản lý thời gian làm bài và áp dụng đúng kỹ thuật đọc - nghe.",
                    [
                        { heading: "Skimming & Scanning trong Reading", body: "Skimming giúp nắm ý chính từng đoạn nhanh chóng; Scanning giúp định vị số liệu, tên riêng hoặc chi tiết cụ thể theo câu hỏi." },
                        { heading: "Đoán nghĩa từ qua ngữ cảnh", body: "Dựa vào từ đồng nghĩa, ví dụ minh họa hoặc quan hệ đối lập ngay trong câu lân cận khi gặp từ mới." },
                        { heading: "Tập trung từ khóa & dấu hiệu chuyển ý trong Listening", body: "Chú ý các từ chỉ sự thay đổi ý kiến như 'however', 'actually', 'in fact' để tránh chọn nhầm đáp án bẫy." }
                    ],
                    "<b>Mẹo làm bài trắc nghiệm:</b> Loại trừ các phương án mang tính tuyệt đối hóa ('always', 'never', 'all') nếu đoạn văn chỉ nêu xu hướng hoặc trường hợp cụ thể.",
                    "Dành 5 phút cuối giờ để rà soát lại các câu còn phân vân và kiểm tra phiếu trả lời."
                )
            },
            {
                id: 16,
                title: "Negotiation Skills in International Business",
                category: "Business English",
                desc: "Trang tài liệu kỹ năng đàm phán kinh doanh quốc tế, chuẩn bị lập luận, đặt câu hỏi làm rõ và hướng tới thỏa thuận đôi bên cùng có lợi.",
                content: createFullPageSheet(
                    16,
                    "Win-win Negotiation Tactics • Contractual Terms Agreement • Conflict Management",
                    "Đàm phán trong kinh doanh quốc tế không chỉ là mặc cả giá mà là quá trình trao đổi thông tin, tìm điểm chung và thống nhất điều khoản hợp tác bền vững.",
                    [
                        { heading: "Chuẩn bị trước buổi đàm phán", body: "Xác định mục tiêu kỳ vọng, mức giới hạn chấp nhận được và các phương án thay thế nếu điều kiện ban đầu chưa đạt." },
                        { heading: "Hỏi để hiểu nhu cầu cốt lõi", body: "Đặt câu hỏi mở để biết đối tác ưu tiên yếu tố nào hơn: tiến độ giao hàng, khối lượng đơn hàng, phương thức thanh toán hay hỗ trợ kỹ thuật." },
                        { heading: "Tóm tắt & xác nhận văn bản", body: "Chốt lại từng điều khoản đã thống nhất bằng văn bản rõ ràng để tránh hiểu nhầm về sau." }
                    ],
                    "<b>Mẫu câu đàm phán:</b> 'If we commit to a larger volume over the next two quarters, could you offer a more flexible payment schedule?'",
                    "Luôn tách biệt vấn đề/lợi ích khỏi cảm xúc cá nhân trong suốt quá trình thương lượng."
                )
            },
            {
                id: 17,
                title: "Business Ethics and Corporate Social Responsibility",
                category: "Business English",
                desc: "Trang tài liệu đạo đức kinh doanh và trách nhiệm xã hội doanh nghiệp (CSR), tính minh bạch và phát triển bền vững.",
                content: createFullPageSheet(
                    17,
                    "Corporate Social Responsibility (CSR) • Ethical Decision Making • Sustainable Business Practices",
                    "Đạo đức kinh doanh và CSR ngày càng được đánh giá cao vì tác động trực tiếp đến niềm tin của khách hàng, nhân viên, nhà đầu tư và cộng đồng.",
                    [
                        { heading: "Đạo đức trong hoạt động kinh doanh", body: "Bao gồm tính trung thực trong thông tin sản phẩm, tôn trọng quyền sở hữu trí tuệ, cạnh tranh lành mạnh và đối xử công bằng." },
                        { heading: "Trách nhiệm xã hội (CSR)", body: "Các sáng kiến bảo vệ môi trường, giảm phát thải, hỗ trợ giáo dục cộng đồng và đảm bảo điều kiện lao động an toàn." },
                        { heading: "Tránh 'Greenwashing' hình thức", body: "Cam kết bền vững cần đi kèm hành động thực chất và minh bạch thay vì chỉ làm truyền thông bề mặt." }
                    ],
                    "<b>Điểm liên hệ thực tế:</b> Một doanh nghiệp thực hiện CSR hiệu quả thường gắn hoạt động cộng đồng với năng lực chuyên môn cốt lõi của mình.",
                    "Khi phân tích tình huống đạo đức, hãy cân nhắc tác động đến tất cả các bên liên quan (stakeholders)."
                )
            },
            {
                id: 18,
                title: "E-Commerce Trends and Digital Marketing Essentials",
                category: "Marketing",
                desc: "Trang tài liệu thương mại điện tử và marketing số: các mô hình giao dịch, hành trình mua hàng trực tuyến và tối ưu hiển thị.",
                content: createFullPageSheet(
                    18,
                    "E-Commerce Ecosystem • Digital Marketing Channels • Search Engine Optimization",
                    "Thương mại điện tử và marketing số giúp doanh nghiệp tiếp cận khách hàng trên đa kênh, đo lường tương tác nhanh và cá nhân hóa trải nghiệm mua sắm.",
                    [
                        { heading: "Mô hình thương mại điện tử phổ biến", body: "B2C (doanh nghiệp tới người tiêu dùng), B2B (doanh nghiệp tới doanh nghiệp), C2C (người tiêu dùng tới người tiêu dùng)." },
                        { heading: "Kênh tiếp cận & tối ưu nội dung", body: "Kết hợp tìm kiếm tự nhiên (SEO), nội dung mạng xã hội, email và đánh giá khách hàng để tăng độ tin cậy." },
                        { heading: "Trải nghiệm mua sắm liền mạch", body: "Tốc độ tải trang, mô tả sản phẩm rõ ràng, quy trình thanh toán đơn giản và chính sách đổi trả minh bạch." }
                    ],
                    "<b>Ví dụ thực tiễn:</b> Trang sản phẩm có thông số rõ ràng, hình ảnh thật và phần giải đáp câu hỏi thường gặp giúp giảm tỷ lệ bỏ giỏ hàng.",
                    "Đo lường hiệu quả dựa trên chất lượng tương tác và chuyển đổi thực tế thay vì chỉ nhìn lượt xem."
                )
            },
            {
                id: 19,
                title: "Leadership and Team Management in Workplace",
                category: "Soft Skills",
                desc: "Trang tài liệu kỹ năng lãnh đạo và quản lý nhóm: phân công công việc, tạo động lực, phản hồi xây dựng và giải quyết bất đồng.",
                content: createFullPageSheet(
                    19,
                    "Transformational Leadership Styles • Team Motivation Strategies • Delegation of Authority",
                    "Quản lý nhóm hiệu quả giúp mọi thành viên hiểu rõ vai trò, phát huy điểm mạnh cá nhân và phối hợp nhịp nhàng để hoàn thành mục tiêu chung đúng hạn.",
                    [
                        { heading: "Phân công rõ ràng & đúng người", body: "Giao việc kèm mục tiêu cụ thể, tiêu chuẩn hoàn thành, thời hạn và mức độ quyền hạn đi kèm." },
                        { heading: "Phản hồi xây dựng (Constructive Feedback)", body: "Góp ý tập trung vào hành vi/công việc cụ thể và hướng cải thiện, kết hợp ghi nhận nỗ lực đúng lúc." },
                        { heading: "Giải quyết bất đồng trong nhóm", body: "Trao đổi thẳng thắn trên tinh thần tôn trọng, làm rõ nguyên nhân gốc rễ và thống nhất quy tắc làm việc chung." }
                    ],
                    "<b>Khung góp ý ngắn gọn:</b> Nêu bối cảnh -> mô tả điểm cần điều chỉnh -> đề xuất cách làm mới -> hỏi ý kiến phản hồi của thành viên.",
                    "Làm việc nhóm hiệu quả bắt đầu từ việc thống nhất deadline nội bộ sớm hơn deadline chính thức."
                )
            },
            {
                id: 20,
                title: "Project Management Fundamentals (Agile & Scrum)",
                category: "Business English",
                desc: "Trang tài liệu quản lý dự án theo tư duy Agile và khung làm việc Scrum: chia nhỏ công việc, sprint ngắn hạn và cải tiến liên tục.",
                content: createFullPageSheet(
                    20,
                    "Agile Project Management • Scrum Framework • Sprint Planning and Retrospective",
                    "Agile và Scrum phù hợp với các dự án cần thích ứng nhanh với thay đổi, chia nhỏ khối lượng công việc thành từng chu kỳ ngắn và kiểm tra tiến độ thường xuyên.",
                    [
                        { heading: "Làm việc theo chu kỳ Sprint", body: "Chia dự án thành các giai đoạn ngắn (thường 1–2 tuần) với đầu ra cụ thể có thể kiểm chứng được ở cuối mỗi chu kỳ." },
                        { heading: "Các vai trò & hoạt động cốt lõi", body: "Xác định thứ tự ưu tiên công việc (Product Backlog), họp lên kế hoạch (Sprint Planning), theo dõi tiến độ hàng ngày và họp rút kinh nghiệm (Retrospective)." },
                        { heading: "Minh bạch tiến độ & rủi ro sớm", body: "Phát hiện điểm nghẽn ngay trong từng sprint để điều chỉnh nguồn lực kịp thời." }
                    ],
                    "<b>Áp dụng cho đồ án nhóm:</b> Chia báo cáo và code thành từng mốc tuần, cuối mỗi tuần rà soát phần đã xong và phần bị trễ để cân đối lại ngay.",
                    "Giữ danh sách đầu việc rõ trạng thái: To Do – In Progress – Done."
                )
            },
            {
                id: 21,
                title: "Risk Management in Global Trade Operations",
                category: "Finance",
                desc: "Trang tài liệu quản trị rủi ro trong hoạt động thương mại quốc tế: rủi ro tỷ giá, thanh toán, vận chuyển và biện pháp phòng ngừa.",
                content: createFullPageSheet(
                    21,
                    "Foreign Exchange Risk • Financial Hedging Strategies • Trade Credit Insurance",
                    "Hoạt động thương mại xuyên biên giới chịu tác động của biến động tỷ giá, quy định pháp lý, logistics và năng lực thanh toán của đối tác.",
                    [
                        { heading: "Nhận diện nhóm rủi ro chính", body: "Rủi ro thị trường & tỷ giá (Exchange Rate Risk), rủi ro tín dụng/thanh toán, rủi ro chuỗi cung ứng và chậm trễ thông quan." },
                        { heading: "Biện pháp phòng ngừa & giảm thiểu", body: "Sử dụng điều khoản thanh toán an toàn, đa dạng hóa nhà cung cấp, mua bảo hiểm phù hợp và theo dõi biến động tỷ giá định kỳ." },
                        { heading: "Kế hoạch dự phòng (Contingency Plan)", body: "Chuẩn bị sẵn phương án thay thế khi tuyến vận tải hoặc nguồn cung gặp sự cố bất ngờ." }
                    ],
                    "<b>Lưu ý thực tiễn:</b> Biến động tỷ giá có thể làm giảm biên lợi nhuận kỳ vọng nếu hợp đồng kéo dài mà không có cơ chế điều chỉnh hoặc phòng ngừa phù hợp.",
                    "Luôn đánh giá cả xác suất xảy ra và mức độ ảnh hưởng khi xếp hạng rủi ro."
                )
            },
            {
                id: 22,
                title: "Advanced English Pronunciation and Accent Reduction",
                category: "Linguistics",
                desc: "Trang tài liệu luyện phát âm nâng cao: nối âm, nuốt âm, biến âm và nhịp điệu tự nhiên trong tiếng Anh giao tiếp.",
                content: createFullPageSheet(
                    22,
                    "Accent Reduction Techniques • Connected Speech Phenomena • Elision and Assimilation",
                    "Trong tiếng Anh tự nhiên, các từ không đứng tách rời mà hòa quyện qua hiện tượng nối âm (linking), nuốt âm (elision) và đồng hóa âm (assimilation).",
                    [
                        { heading: "Nối âm (Linking)", body: "Nối phụ âm cuối sang nguyên âm đầu của từ kế tiếp (consonant-to-vowel) hoặc nối giữa các nguyên âm trôi chảy." },
                        { heading: "Nuốt âm (Elision) & Biến âm (Assimilation)", body: "Một số âm tiết hoặc phụ âm cuối có thể được lược bớt hoặc biến đổi nhẹ để giữ nhịp điệu đều đặn của câu." },
                        { heading: "Nhịp điệu trọng âm câu (Stress-timed Rhythm)", body: "Nhấn mạnh các từ mang nội dung chính (content words) và lướt nhẹ các từ chức năng (function words)." }
                    ],
                    "<b>Ví dụ nối âm:</b> 'pick it up' đọc liền mạch thường nối phụ âm cuối sang nguyên âm sau để nghe tự nhiên hơn.",
                    "Mục tiêu cốt lõi của luyện phát âm là rõ ràng, dễ hiểu và nhất quán, không nhất thiết xóa bỏ hoàn toàn dấu ấn cá nhân."
                )
            },
            {
                id: 23,
                title: "Translation Theory and Practice for Business",
                category: "Linguistics",
                desc: "Trang tài liệu lý thuyết và thực hành dịch thuật kinh tế - thương mại Anh - Việt: dịch tương đương, thuật ngữ và kiểm tra chất lượng.",
                content: createFullPageSheet(
                    23,
                    "Economic Translation Strategies • Equivalent Terminology Matching • Glossaries Management",
                    "Dịch thuật kinh tế - thương mại yêu cầu truyền tải chính xác sắc thái nghĩa, thuật ngữ chuyên ngành và văn phong phù hợp với đối tượng đọc bản dịch.",
                    [
                        { heading: "Dịch nghĩa tương đương thay vì dịch word-by-word", body: "Nhiều thành ngữ hoặc cụm từ kinh doanh nếu dịch từng chữ sẽ gây tối nghĩa; cần tìm cách diễn đạt tương đương tự nhiên trong ngôn ngữ đích." },
                        { heading: "Quản lý bảng thuật ngữ (Glossary)", body: "Thống nhất cách dịch các thuật ngữ cốt lõi trong toàn bộ tài liệu để tránh mỗi đoạn dịch một kiểu." },
                        { heading: "Hiệu đính (Proofreading) bản dịch", body: "Đối chiếu kỹ số liệu, tên riêng, sắc thái trang trọng và lỗi ngữ pháp sau khi hoàn tất bản nháp." }
                    ],
                    "<b>Nguyên tắc quan trọng:</b> Một bản dịch tốt phải khiến người đọc ở ngôn ngữ đích hiểu tự nhiên như văn bản được viết gốc cho họ.",
                    "Luôn kiểm tra bối cảnh trước khi chọn nghĩa tiếng Việt cho các từ đa nghĩa."
                )
            },
            {
                id: 24,
                title: "Cross-Cultural Business Etiquette Worldwide",
                category: "Business English",
                desc: "Trang tài liệu nghi thức kinh doanh quốc tế: tác phong gặp gỡ, trao danh thiếp, tặng quà và quy tắc ứng xử với đối tác nước ngoài.",
                content: createFullPageSheet(
                    24,
                    "Global Business Etiquette • International Protocol Rules • Cultural Sensitivity Training",
                    "Nghi thức kinh doanh khác nhau giữa các khu vực; tôn trọng quy tắc ứng xử địa phương giúp tạo thiện cảm ban đầu và xây dựng mối quan hệ hợp tác lâu dài.",
                    [
                        { heading: "Đúng giờ & chuẩn bị chuyên nghiệp", body: "Đúng giờ thể hiện sự tôn trọng thời gian của đối tác; chuẩn bị tài liệu và agenda rõ ràng trước cuộc họp." },
                        { heading: "Danh thiếp, xưng hô & quà tặng", body: "Lưu ý cách nhận/trao danh thiếp trân trọng ở nhiều nước châu Á, cách xưng hô đúng vị trí và chọn quà tặng phù hợp quy định doanh nghiệp." },
                        { heading: "Tính linh hoạt trong giao tiếp", body: "Quan sát cách đối tác mở đầu câu chuyện (đi thẳng vào công việc hay dành thời gian trò chuyện làm quen)." }
                    ],
                    "<b>Ghi nhớ thực tế:</b> Trước khi làm việc hoặc thuyết trình với đối tác quốc tế, nên tìm hiểu nhanh chuẩn mực xưng hô và tác phong cuộc họp của họ.",
                    "Sự lịch sự, lắng nghe và tôn trọng khác biệt luôn là nền tảng an toàn nhất."
                )
            },
            {
                id: 25,
                title: "Startup Pitch Deck Writing and Funding Strategies",
                category: "Marketing",
                desc: "Trang tài liệu xây dựng bài thuyết trình gọi vốn (Pitch Deck): vấn đề, giải pháp, mô hình kinh doanh, thị trường và kế hoạch triển khai.",
                content: createFullPageSheet(
                    25,
                    "Startup Funding Acquisition • Pitch Deck Structure Design • Investor Presentation Skills",
                    "Một bài Pitch Deck thuyết phục cần kể được câu chuyện rõ ràng, logic: từ vấn đề thực tế có thật, giải pháp khác biệt, mô hình tạo doanh thu đến kế hoạch thực thi khả thi.",
                    [
                        { heading: "Problem & Solution", body: "Nêu rõ nỗi đau/vấn đề cụ thể của người dùng và cách giải pháp giải quyết vấn đề đó tốt hơn cách làm hiện tại." },
                        { heading: "Business Model & Market Size", body: "Giải thích cách sản phẩm tạo ra giá trị và doanh thu, cùng quy mô thị trường mục tiêu có tính thực tế." },
                        { heading: "Traction, Roadmap & Team", body: "Trình bày kết quả thử nghiệm/sản phẩm mẫu, lộ trình phát triển tiếp theo và năng lực bổ trợ của đội ngũ." }
                    ],
                    "<b>Cấu trúc ngắn gọn 6 ý:</b> Vấn đề -> Giải pháp -> Sản phẩm/Demo -> Khách hàng & Mô hình doanh thu -> Lộ trình -> Đội ngũ.",
                    "Trình bày số liệu trung thực, có cơ sở và trả lời thẳng vào trọng tâm câu hỏi phản biện."
                )
            }
        ];
