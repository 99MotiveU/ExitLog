const today = new Date();
const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // 이번달 1일
const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 1); // 다다음달 1일 (다다음달 말일까지 포함)

let calendar;
let allJobPosts = []; // 원본 API 데이터
let processedCalendarEvents = []; // FullCalendar에 전달할 개별 이벤트 목록

async function fetchJobPosts(filters = {}) {
	let url = '/api/recruitments';
	const params = new URLSearchParams();

	if (filters.location) {
		params.append('location', filters.location);
	}
	if (filters.jobCode) {
		params.append('jobCode', filters.jobCode);
	}
	if (filters.experienceLevel) {
		params.append('experienceLevel', filters.experienceLevel);
	}

	if (params.toString()) {
		url += '?' + params.toString();
	}

	try {
		const res = await fetch(url);
		
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		allJobPosts = await res.json(); // 원본 데이터를 allJobPosts에 저장
		// FullCalendar에 전달할 이벤트 가공 로직
		// 각 채용 공고의 '일자별'로 개별 회사 이벤트를 생성합니다.
		processedCalendarEvents = [];
		
		allJobPosts.forEach(job => {
			console.log(job);
			const openingDateMoment = moment(job.openingDate);
			const expirationDateMoment = moment(job.expirationDate);

			if (!openingDateMoment.isValid() || !expirationDateMoment.isValid()) {
				console.warn('Invalid date for job:', job);
				return; // 유효하지 않은 날짜는 건너뛰기
			}

			// 시작일부터 마감일까지 각 날짜에 대해 이벤트를 생성
			// FullCalendar의 end는 exclusive이므로, 루프는 expirationDate까지 포함
			for (let m = moment(openingDateMoment); m.isSameOrBefore(expirationDateMoment, 'day'); m.add(1, 'days')) {
				const currentDate = m.format('YYYY-MM-DD');
				const isStartDay = m.isSame(openingDateMoment, 'day');
				const isEndDay = m.isSame(expirationDateMoment, 'day');

				// 회사명에 (주)가 포함되어 있는지 확인하여 displayCompanyText 결정
				let displayCompanyText = job.company || '';
				if (displayCompanyText && !displayCompanyText.includes('(주)')) {
					displayCompanyText = `(주)${displayCompanyText}`;
				} else if (displayCompanyText) {
					displayCompanyText = `${displayCompanyText}`;
				}

				processedCalendarEvents.push({
					id: `${job.id}-${currentDate}`, // 고유 ID (날짜별로 다르게)
					title: job.title, // 원본 제목 유지 (모달용)
					start: currentDate, // 현재 날짜
					end: moment(currentDate).add(1, 'days').format('YYYY-MM-DD'), // 그 날 하루 종일 이벤트
					allDay: true,
					classNames: job.active === 0 ? ['fc-event-expired'] : [],
					extendedProps: {
						company: job.company, // 원본 회사명 (모달용)
						displayCompany: displayCompanyText, // 캘린더에 표시할 회사명 (((주)회사명) 형식)
						location: job.location,
						jobCodeName: job.jobCodeName,
						experienceLevelName: job.experienceLevelName,
						postUrl: job.url,
						active: job.active,
						openingDateRaw: job.openingDate,
						expirationDateRaw: job.expirationDate,
						isStartDay: isStartDay, // 시작일 여부
						isEndDay: isEndDay      // 마감일 여부
					}
				});
			}
		});

		return processedCalendarEvents; // FullCalendar에 전달할 이벤트 배열 반환
	} catch (error) {
		console.error("Error fetching job posts:", error);
		return [];
	}
}


document.addEventListener('DOMContentLoaded', async function() {
	const calendarEl = document.getElementById('calendar');

	// 캘린더 초기 로드 시 필터 없이 데이터 가져오기
	const initialEvents = await fetchJobPosts();

	// 데이터가 없으면 캘린더 대신 메시지 표시
	if (initialEvents.length === 0) {
		calendarEl.innerHTML = '<p class="text-muted text-center">현재 표시할 채용 공고가 없습니다.</p>';
		return;
	}

	calendar = new FullCalendar.Calendar(calendarEl, {
		locale: 'ko',
		headerToolbar: {
			left: 'prev',
			center: 'title',
			right: 'next,dayGridMonth'
		},
		dayMaxEvents: 4, // 한 셀에 최대 4개 이벤트 표시
		fixedWeekCount: false,
		validRange: {
			start: startDate,
			end: endDate
		},
		events: processedCalendarEvents, // 가공된 이벤트 배열 사용

		eventContent: function(arg) {
			// 이제 arg.event.extendedProps에 isStartDay, isEndDay, displayCompany가 미리 계산되어 있음
			const displayCompany = arg.event.extendedProps.displayCompany || '';
			const isStartDay = arg.event.extendedProps.isStartDay;
			const isEndDay = arg.event.extendedProps.isEndDay;

			let iconHtml = '';
			if (isStartDay) {
				iconHtml += '<span class="event-icon start-icon">시</span>';
			}
			if (isEndDay) {
				iconHtml += '<span class="event-icon end-icon">마</span>';
			}

			return {
				html: `
                    <div class="fc-event-custom-content">
                        <div class="fc-event-header">
                            ${iconHtml}
                            <span class="fc-event-company">${displayCompany}</span>
                        </div>
                    </div>
                `
			};
		},

		// "+N more" 버튼 클릭 시 FullCalendar 기본 팝오버를 비활성화
		moreLinkClick: function(arg) {
			return false;
		},

		eventClick: function(info) {
			const existingModal = document.getElementById('eventModal');
    		if (existingModal) existingModal.remove(); // 기존 모달 제거
			const event = info.event;
			const modalHtml = `
		                <div class="modal fade" id="eventModal" tabindex="-1" aria-labelledby="eventModalLabel" aria-hidden="true">
		                    <div class="modal-dialog">
		                        <div class="modal-content">
		                            <div class="modal-header">
		                                <h5 class="modal-title" id="eventModalLabel">${event.title}</h5>
		                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		                            </div>
		                            <div class="modal-body">
		                                <p><strong>회사:</strong> ${event.extendedProps.company}</p>
		                                <p><strong>직무:</strong> <span class="job-description">${event.extendedProps.jobCodeName}</span></p> 
		                                <p><strong>경력:</strong> ${event.extendedProps.experienceLevelName}</p>
		                                <p><strong>기간:</strong> ${moment(event.extendedProps.openingDateRaw).format('YYYY.MM.DD')} ~ ${moment(event.extendedProps.expirationDateRaw).format('YYYY.MM.DD')}</p>
		                                <a href="${event.extendedProps.postUrl}" target="_blank" class="btn btn-primary link-btn">공고 보기</a>
		                            </div>
		                        </div>
		                    </div>
		                </div>
		            `;

			document.body.insertAdjacentHTML('beforeend', modalHtml);
			const modal = new bootstrap.Modal(document.getElementById('eventModal'));
			
			modal.show();

			document.getElementById('eventModal').addEventListener('hidden.bs.modal', function() {
				this.remove();
			});
		}
	});

	calendar.render();

	// 필터 버튼 이벤트 리스너
	document.getElementById('filter-btn').addEventListener('click', async function() {
		const location = document.getElementById('filter-location').value;
		const jobCode = document.getElementById('filter-job-code').value;
		const experienceLevel = document.getElementById('filter-experience-level').value;

		const filters = {};
		if (location) filters.location = location;
		if (jobCode) filters.jobCode = jobCode;
		if (experienceLevel) filters.experienceLevel = experienceLevel;

		// 필터 적용 시 다시 fetchJobPosts 호출하여 processedCalendarEvents 갱신
		await fetchJobPosts(filters);
		calendar.setOption('events', processedCalendarEvents); // 갱신된 이벤트로 캘린더 업데이트
		calendar.refetchEvents();
	});

	// 필터 초기화 버튼 이벤트 리스너 
	document.getElementById('filter-reset-btn').addEventListener('click', async function() {
		document.getElementById('filter-location').value = '';
		document.getElementById('filter-job-code').value = '';
		document.getElementById('filter-experience-level').value = '';

		// 필터 초기화 시 다시 fetchJobPosts 호출하여 processedCalendarEvents 갱신
		await fetchJobPosts();
		calendar.setOption('events', processedCalendarEvents); // 갱신된 이벤트로 캘린더 업데이트
		calendar.refetchEvents();
	});

});