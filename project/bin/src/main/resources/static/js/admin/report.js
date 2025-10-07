// CSRF 토큰 및 헤더명 전역 변수 (AJAX 요청 시 사용)
window.csrfToken = /*[[${_csrf?.token}]]*/ null;
window.csrfHeaderName = /*[[${_csrf?.headerName}]]*/ null;
$(document).ready(function () {
    // ⭐ 신규: 제목(span) 클릭 시 신고 처리 모달 초기화 및 데이터 로드
$('.report-log-title-action').on('click', function() {
    const logNo = $(this).data('logno'); // ⭐ data-logno에서 값을 가져옴
    const logTitle = $(this).data('logtitle');
    const repoCount = $(this).data('repocount');

    console.log("모달 트리거: logNo=", logNo, "타입:", typeof logNo); // ⭐ logNo 값과 타입 확인

    // logNo가 undefined 또는 null이 아닌지 확인
    if (logNo === undefined || logNo === null || String(logNo).trim() === "") { // ⭐ 유효성 검사 강화
        console.error('클릭된 항목에서 유효한 logNo를 가져올 수 없습니다. data-logno 속성 및 값을 확인하세요.');
        alert('게시글 정보를 가져오는 데 실패했습니다 (logNo 누락). 다시 시도해주세요.');
        // 모달이 이미 떴다면, 오류 메시지를 모달 내부에 표시하고 닫을 수도 있음
        $('#modalReportReasonList').html('<li class="text-danger p-2">게시글 정보(ID)를 가져올 수 없습니다.</li>');
        return; 
    }

    console.log("모달 트리거: logNo=", logNo, "logTitle=", logTitle, "repoCount=", repoCount); // ⭐ 디버깅 로그 추가

    $('#currentProcessLogNo').val(logNo);
    $('#modalProcessLogId').text(logNo);
    $('#modalProcessLogTitle').text(logTitle);
    $('#modalProcessRepoCount').text(repoCount);
    
    // 모달 내 "게시글 내용 보기" 링크 URL 설정
    $('#modalViewPostLink').attr('href', '/log/' + logNo);
    
    $('#modalReportReasonList').html('<li class="text-muted">신고 사유를 불러오는 중...</li>');
    loadReportDetailsForModal(logNo);

    // loadReportDetailsForModal 함수에 유효한 logNo 전달 확인
    loadReportDetailsForModal(logNo); 
    
    // data-toggle="modal" data-target="#reportProcessModal" 속성이 span에 있으므로 모달은 자동으로 뜸
});

// 신고 사유 목록을 AJAX로 로드하는 함수
function loadReportDetailsForModal(logNo) {
// logNo가 undefined로 들어오는지 여기서도 확인 가능
    console.log(`loadReportDetailsForModal 호출됨. logNo: ${logNo}`); 
    
    if (typeof logNo === 'undefined' || logNo === null) {
    console.error('loadReportDetailsForModal: 유효하지 않은 logNo 값으로 호출됨:', logNo);
    $('#modalReportReasonList').html('<li class="text-danger p-2">잘못된 게시글 정보로 신고 내역을 불러올 수 없습니다.</li>');
    return;
    }

    const $reportReasonList = $('#modalReportReasonList');
    $reportReasonList.html('<li class="text-muted p-2">신고 사유를 불러오는 중...</li>'); 

    console.log(`게시글 ID ${logNo}의 신고 상세 내역을 AJAX로 가져옵니다.`);

    $.ajax({
        url: `/api/reports/log/${logNo}/details`,
        type: 'GET',
        dataType: 'json', // 서버가 JSON을 반환할 것으로 기대
        beforeSend: function(xhr) {
            if (window.csrfHeaderName && window.csrfToken) {
                // xhr.setRequestHeader(window.csrfHeaderName, window.csrfToken); // GET에는 보통 불필요
            }
        },
        success: function(reportItems) { 
            $reportReasonList.empty();
            if (reportItems && reportItems.length > 0) {
                // 총 신고 횟수를 여기서 다시 정확하게 설정할 수도 있습니다.
                // $('#modalProcessRepoCount').text(reportItems.length); // 또는 서버에서 총 신고 횟수를 별도로 받아와도 됨

                reportItems.forEach(function(report) {
                    const reportDate = report.repoDate ? new Date(report.repoDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
                    const listItem = `<li>
                                        <span class="reason-text">${escapeHTML(report.repoReason)}</span>
                                        <span class="reason-meta">
                                        (신고자: ${escapeHTML(report.reporterNickname || '익명')}, 
                                            날짜: ${reportDate})
                                        </span>
                                    </li>`;
                    $reportReasonList.append(listItem);
                });
            } else {
                $reportReasonList.append('<li class="text-muted p-2">이 게시글에 대한 신고 내역이 없습니다.</li>');
            }
        },
        error: function(xhr, status, error) {
            console.error("신고 상세 내역 로드 중 오류:", status, error, xhr.responseText);
            $reportReasonList.html('<li class="text-danger p-2">신고 사유를 불러오는데 실패했습니다. 다시 시도해주세요.</li>');
        }
    });
}

// ⭐ 수정: 모달 내 "게시글 삭제" 버튼 클릭 이벤트
$('#processDeleteButton').on('click', function() {
    const logNo = $('#currentProcessLogNo').val();
    if (!logNo) { 
        alert('처리할 게시글의 ID가 없습니다.'); 
        return; 
    }
    
    if (confirm(`정말 이 게시글(ID: ${logNo})을 삭제 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        console.log(`게시글 ID ${logNo} 삭제 처리 AJAX 요청`);
        
        $.ajax({
            url: `/api/admin/reports/log/${logNo}/delete`, 
            type: 'POST', 
            // dataType: 'json', // 서버가 JSON을 반환한다면 명시
            beforeSend: function(xhr) {
                // CSRF 토큰 헤더 추가
                if (window.csrfHeaderName && window.csrfToken) {
                    xhr.setRequestHeader(window.csrfHeaderName, window.csrfToken);
                } else {
                    console.warn('CSRF 토큰 또는 헤더 이름이 설정되지 않았습니다.');
                }
            },
            success: function(response) {
                
                alert(response.message || '게시글이 성공적으로 삭제 처리되었습니다.');
                $('#reportProcessModal').modal('hide'); 
                location.reload(); // 페이지 새로고침하여 목록 업데이트
            },
            error: function(xhr, status, error) {
                console.error("게시글 삭제 처리 중 오류:", status, error, xhr.responseText);
                let errorMessage = "게시글 삭제 처리 중 오류가 발생했습니다.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage += "\n" + xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    // 서버가 JSON이 아닌 일반 텍스트로 에러 메시지를 보낼 경우
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse.message) errorMessage += "\n" + errorResponse.message;
                    } catch(e) {
                        // JSON 파싱 실패 시, 응답 텍스트 일부를 보여줄 수 있음
                        // errorMessage += "\n" + xhr.responseText.substring(0, 100); 
                    }
                }
                alert(errorMessage);
            }
        });
    }
});

// 모달 내 "보류" 버튼 클릭 이벤트
$('#processDismissButton').on('click', function() {
    const logNo = $('#currentProcessLogNo').val();
    if (!logNo) { 
        alert('처리할 게시글의 ID가 없습니다.'); 
        return; 
    }

    if (confirm(`이 게시글(ID: ${logNo})의 신고 내역을 보류 처리하시겠습니까?`)) {
        console.log(`게시글 ID ${logNo} 신고 보류(리셋) 처리 AJAX 요청`);
        
        $.ajax({
            url: `/api/admin/reports/log/${logNo}/dismiss`,
            type: 'POST',
            beforeSend: function(xhr) {
                if (window.csrfHeaderName && window.csrfToken) {
                    xhr.setRequestHeader(window.csrfHeaderName, window.csrfToken);
                }
            },
            success: function(response) {
                alert(response.message || '게시글 신고가 보류 처리되고 신고 수가 리셋되었습니다.');
                $('#reportProcessModal').modal('hide');
                location.reload(); // 페이지 새로고침하여 목록 업데이트
            },
            error: function(xhr, status, error) {
                console.error("신고 보류(리셋) 처리 중 오류:", status, error, xhr.responseText);
                let errorMessage = "신고 보류(리셋) 처리 중 오류가 발생했습니다.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage += "\n" + xhr.responseJSON.message;
                }
                alert(errorMessage);
            }
        });
    }
});

// HTML 이스케이프 함수 (XSS 방지용)
function escapeHTML(str) {
    if (str === null || typeof str === 'undefined') return '';
    return String(str).replace(/[&<>"']/g, function (match) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'};
        return map[match];
    });
}
});