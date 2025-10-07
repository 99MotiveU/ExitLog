document.addEventListener('DOMContentLoaded', function() {
    // 기존 비밀번호 모달 관련 스크립트 (건드리지 않습니다)
    const passwordModal = document.getElementById('password-modal');
    const closeButton = document.querySelector('.close-button');
    const authenticateButton = document.getElementById('authenticate-password');
    const currentPasswordInput = document.getElementById('current-password');
    const authMessage = document.getElementById('auth-message');

    // "오늘 마감하는 인기 공고" 로드
    async function loadHomeData() {
        try {
            const [deadlineRes, popularRes] = await Promise.all([
                fetch('/main/api/deadline-today'),
                fetch('/main/api/popular')
            ]);

            if (!deadlineRes.ok || !popularRes.ok) {
                throw new Error('하나 이상의 API 응답 오류');
            }

            const [deadlineData, popularData] = await Promise.all([
                deadlineRes.json(),
                popularRes.json()
            ]);

            renderDeadlineJobs(deadlineData);
            renderPopularLogs(popularData);

        } catch (error) {
            console.error('홈 데이터 로딩 실패:', error);
            renderErrorFallbacks();
        }
    }

    // 오늘 마감 공고 렌더링
    function renderDeadlineJobs(data) {
        const grid = document.querySelector('.right-section .popular-grid');
        grid.innerHTML = '';

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="job-card empty-card">표시할 공고가 없습니다</div>';
            return;
        }

        data.slice(0, 6).forEach(job => {
            const card = document.createElement('div');
            card.classList.add('job-card');

            card.innerHTML = `
                <h3 class="job-title">${job.title}</h3>
                <p class="company">${job.companyName}</p>
                <p class="location">${job.location}</p>
                <p class="job-meta">${job.jobCodeName} · ${job.experienceLevelName}</p>
                <a href="${job.url}" target="_blank" class="apply-button">지원하기</a>
            `;

            card.addEventListener('click', () => {
                window.open(job.url, '_blank');
            });

            grid.appendChild(card);
        });
    }

    // 인기 로그 렌더링
    function renderPopularLogs(data) {
        const grid = document.querySelector('.left-section .log-grid');
        grid.innerHTML = '';

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="job-card empty-card">인기 로그가 없습니다</div>';
            return;
        }

        data.slice(0, 6).forEach(log => {
            console.log(log);
            const card = document.createElement('div');
            card.classList.add('job-card');

            card.innerHTML = `
                <h3 class="job-title">${log.title}</h3>
                <div class="log-meta-row">
                    <div>
                        <div class="meta-author">작성자: ${log.nickname}</div>
                        ${log.companyName ? `<div class="log-company">${log.companyName}</div>` : ``}
                    </div>
                    <div>
                        <div class="meta-date">&nbsp;작성일: ${log.createdDateFormatted}</div>
                        <div class="meta-views"><i class="fa-regular fa-eye"></i> ${log.viewCount}</div>
                    </div>
                </div>                
            `;

            grid.appendChild(card);
        });
    }

    // 오류 발생 시 fallback UI 렌더링
    function renderErrorFallbacks() {
        const jobGrid = document.querySelector('.popular-grid');
        const logGrid = document.querySelector('.log-grid');

        if (jobGrid) {
            jobGrid.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const card = document.createElement('div');
                card.classList.add('job-card', 'empty-card');
                card.textContent = "공고 로드 실패";
                jobGrid.appendChild(card);
            }
        }

        if (logGrid) {
            logGrid.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const card = document.createElement('div');
                card.classList.add('job-card', 'empty-card');
                card.textContent = "인기 로그 로드 실패";
                logGrid.appendChild(card);
            }
        }
    }

    // 데이터 로드 실행
    loadHomeData();
});