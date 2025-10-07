//게시글 수정 진입
$('#log-edit-btn-area').on('click', function () {
  window.location.href = `/log/${logNo}/edit`;
});

//게시글 수정 요청
function updateLog() {
  fetch(`/log/${logNo}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  })
    .then((response) => {
      if (response.ok) {
        window.location.reload();
      } else {
        alert('수정 실패');
      }
    })
    .catch((error) => {
      console.error('수정 중 오류:', error);
    });
}

//게시글 삭제
function deleteLog() {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  fetch(`/log/${logNo}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = '/log';
      } else {
        return response.text().then((msg) => {
          throw new Error(msg);
        });
      }
    })
    .catch((error) => {
      console.error('삭제 중 오류:', error);
    });
}

//-----------------------------------------------------
//댓글 로드 비동기 요청
async function selectCommentlist(logNo, loginUserNo) {
  try {
    const res = await fetch(`/log/comment/${logNo}`);
    if (!res.ok) throw new Error('댓글 로딩 실패');
    const commentList = await res.json();
    document.getElementById('comment-count').innerText = commentList.length;
    renderCommentList(commentList, loginUserNo);
  } catch (error) {
    console.log('댓글 불러오기 실패: ', error);
    alert('서버 오류:댓글 불러오기에 실패하였습니다.');
  }
}

//댓글 불러오기
function renderCommentList(commentList, loginUserNo) {
  const container = document.getElementById('comment-list');
  container.innerHTML = '';

  const html = commentList
    .map((comment) => {
      const isWriter = loginUserNo != null && comment.userNo === loginUserNo;
      const isChild = comment.parentCommentNo !== 0;
      const isDeleted = comment.isDel === 1;

      // 1) 댓글 (삭제 O)
      if (isDeleted) {
        return `
            <div class="comment ${isChild ? 'reply' : ''}">
                <div class="comment-text-area">삭제된 댓글입니다</div>
            </div>
        `;
      }

      // 2) 댓글 불러오기 (삭제 X)
      return `
        <div class="comment ${isChild ? 'reply' : ''}">
            <div class="comment-author">${comment.nickname}</div>
            <div class="comment-text-area">
                <div class="comment-edit">
                    ${
                      isWriter
                        ? `
                        <button class="edit-btn" onclick="editComment(${
                          comment.commentNo
                        },
                            '${escapeHTML(comment.content)}', 
                            '${comment.parentNickname}')">수정</button>
                        <button class="del-btn" onclick="deleteComment(${
                          comment.commentNo
                        }, this)">삭제</button>                                
                        `
                        : ''
                    }
                    ${
                      loginUserNo != null
                        ? `
                        <button class="reply-btn" onclick="replyComment(${comment.commentNo})">답글</button>
                        `
                        : ''
                    }
                </div>
                <div class="comment-text" id="comment-text-${comment.commentNo}">
                    <span class="parent-comment-nickname">${comment.parentCommentNo ? `@${comment.parentNickname}<br/>`:''}</span>
                    <span>${comment.content}</span>
                </div>
            </div>
        </div>
        `;
    })
    .join('');

  container.innerHTML = html;
}

// 댓글 등록
function addComment(e, parentCommentNo = '') {
  e.preventDefault();

  //댓글/답댓글 여부 확인
  const isReply = parentCommentNo !== '';
  const url = isReply
    ? `/log/comment/reply/${logNo}/${parentCommentNo}`
    : `/log/comment/${logNo}`;

  const content = isReply
    ? document.getElementById(`reply-input-${parentCommentNo}`).value.trim()
    : document.getElementById('text').value.trim();

  if (!content) {
    alert('댓글을 입력하세요');
    return;
  }

  console.log('비동기 전 content 정보: ', content);

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('댓글 등록 실패');
      if (isReply) {
        return res.json();
      }
      return res.text();
    })
    .then((data) => {
      if (isReply) {
        const comment = e.target.closest('.reply');
        comment.innerHTML = `
                <div class="comment-author">${data.nickname}</div>
                <div class="comment-text-area">
                    <div class="comment-edit">
                        <button class="edit-btn" onclick="editComment(${data.commentNo},
                            '${data.content}',
                            '${data.parentNickname}')">수정</button>
                            
                        <button class="del-btn" onclick="deleteComment(${data.commentNo}, this)">삭제</button>                                
                        <button class="reply-btn" onclick="replyComment(${data.commentNo})">답글</button>
                    </div>
                    <div class="comment-text" id="comment-text-${data.commentNo}">
                        <span class="parent-comment-nickname">@${data.parentNickname}<br/></span>
                        <span>${data.content}</span>
                    </div>
                </div>
            `;
      } else {
        document.getElementById('text').value = '';
        selectCommentlist(logNo, loginUserNo);
      }
    })
    .catch((err) => {
      console.error('댓글 등록 중 오류 : ', err);
      alert('댓글 등록에 실패했습니다.');
    });
}

// 1.댓글 수정
function editComment(commentNo, content, parentNickname = '') {
  const commentTextDiv = document.getElementById(`comment-text-${commentNo}`);
  const commentTextArea = commentTextDiv.closest('.comment-text-area');
  const commentEditDiv = commentTextArea.querySelector('.comment-edit');

  if (commentEditDiv) {
    commentEditDiv.style.display = 'none';
  }

  commentTextDiv.style.display = 'none';

  // 이미 수정 영역이 있다면 중복 추가 방지
  if (commentTextArea.querySelector('.comment-edit-area')) return;

  const editArea = document.createElement('div');
  editArea.className = 'comment-edit-area';
  editArea.innerHTML = `
        <textarea class="form-control" id="edit-input-${commentNo}">${content}</textarea>
        <button onclick="submitEdit(${commentNo},'${parentNickname}')">등록</button>
        <button onclick="cancelEdit(${commentNo}, '${escapeHTML(
    content
  )}', '${parentNickname}')">취소</button>
    `;

  commentTextArea.appendChild(editArea);
}
// 1.1 수정 등록
async function submitEdit(commentNo, parentNickname = '') {
  const newContent = document
    .getElementById(`edit-input-${commentNo}`)
    .value.trim();
  try {
    const res = await fetch(`/log/comment/edit/${logNo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newContent,
        commentNo: commentNo,
      }),
    });
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }
    const commentTextDiv = document.getElementById(`comment-text-${commentNo}`);
    const commentTextArea = commentTextDiv.closest('.comment-text-area');
    const commentEditArea = commentTextArea.querySelector('.comment-edit-area');
    const commentEditDiv = commentTextArea.querySelector('.comment-edit');
    commentEditArea.remove();
    commentTextDiv.style.display = 'block';
    commentEditDiv.style.display = 'block';

    commentTextDiv.innerHTML = `
             ${
               parentNickname && parentNickname !== 'null'
                 ? `<span class="parent-comment-nickname">@${parentNickname}</span><br/>`
                 : ''
             }
            <span>${newContent}</span>
        `;
  } catch (error) {
    console.error('댓글 수정 실패:', error.message);
    alert('댓글 수정 실패: ' + error.message);
  }
}
// 1.2 수정 취소
function cancelEdit(commentNo, content, parentNickname = '') {
  const commentTextDiv = document.getElementById(`comment-text-${commentNo}`);
  const commentTextArea = commentTextDiv.closest('.comment-text-area');
  const commentEditArea = commentTextArea.querySelector('.comment-edit-area');
  const commentEditDiv = commentTextArea.querySelector('.comment-edit');

  // 수정 영역 제거
  if (commentEditArea) {
    commentEditArea.remove();
  }

  // 기존 텍스트 복구 및 표시
  commentTextDiv.innerHTML = `
         ${
           parentNickname && parentNickname !== 'null'
             ? `<span class="parent-comment-nickname">@${parentNickname}</span><br/>`
             : ''
         }
        <span>${content}</span>
    `;
  commentTextDiv.style.display = 'block';

  // 버튼 영역 다시 표시
  if (commentEditDiv) {
    commentEditDiv.style.display = 'flex'; // 원래 스타일에 따라 block 또는 flex
  }
}

// 2.댓글 삭제
async function deleteComment(commentNo, button) {
  console.log(commentNo);
  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }
  const res = await fetch(`/log/comment/delete/${commentNo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const commentDiv = button.closest('.comment');
  try {
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }
    //댓글 div 삭제표시로 변경하기
    commentDiv.innerHTML = `
            <div class="comment-text-area">삭제된 댓글입니다</div>
        `;
    if (commentDiv.classList.contains('reply')) {
      commentDiv.className = 'comment reply';
    } else {
      commentDiv.className = 'comment';
    }
  } catch (error) {
    console.error('댓글 삭제 실패 : ', error.message);
    alert('댓글 삭제 실패: ' + error.message);
  }
}

// 3.답댓글
function replyComment(commentNo) {
  const parentComment = document
    .querySelector(`#comment-text-${commentNo}`)
    .closest('.comment');
  const replyComment = document.createElement('div');
  replyComment.classList.add('reply');
  replyComment.classList.add('comment');

  replyComment.innerHTML = `
        <div class="comment-edit-area">
            <textarea class="form-control" id="reply-input-${commentNo}"></textarea>
            <button onclick="addComment(event,${commentNo})">등록</button>
            <button onclick="cancelReply(this)">취소</button>
        </div>
    `;
  if (document.getElementById(`reply-input-${commentNo}`)) return;
  parentComment.insertAdjacentElement('afterend', replyComment);
}

// 4. 답댓글 등록 -> 댓글 등록 메서드에 포함 (addComment())

// 5. 답댓글 취소
function cancelReply(button) {
  const replyBox = button.closest('.reply');
  if (replyBox) {
    replyBox.remove();
  }
}

// 이스케이프 함수
function escapeHTML(str) {

    return str.replace(/[&<>"']/g, function(match) {
        switch(match) {
            case "&": return "&amp;";
            case "<": return "&lt;";
            case ">": return "&gt;";
            case '"': return "&quot;";
            case "'": return "&#39;";
            default: return match;
        }
    });
}


//-----------------------------------------------------
// 신고하기 모달
// --- 페이지 로드 완료 후 실행될 로직 (기존 DOMContentLoaded가 있다면 그 안에 통합) ---
document.addEventListener('DOMContentLoaded', () => {
  // window.logNo, window.loginUserNo, window.csrfToken, window.csrfHeaderName 는
  // HTML의 인라인 스CRIPT에서 이미 설정되어 있다고 가정합니다.

  // ==================== 게시글 신고 모달 관련 로직 시작 ====================
  const reportButton = document.querySelector(
    'button.report[data-target="#reportPostModal"]'
  );
  const reportPostModalJquery = $('#reportPostModal'); // jQuery 객체로 모달 제어
  const modalReportLogNoInput = document.getElementById('modalReportLogNo');
  const modalReporterUserNoInput = document.getElementById(
    'modalReporterUserNo'
  );
  const submitReportPostBtn = document.getElementById('submitReportPostButton');

  // "신고하기" 버튼 클릭 시: 모달에 정보 설정
  if (reportButton) {
    reportButton.addEventListener('click', function () {
      if (!window.loginUserNo) {
        alert('신고는 로그인 후 이용 가능합니다.');
        // 필요시 로그인 페이지로 이동: window.location.href = '/login';
        return;
      }
      const logNoToReport = this.getAttribute('data-logno');
      if (modalReportLogNoInput) {
        modalReportLogNoInput.value = logNoToReport;
      }
      if (modalReporterUserNoInput && window.loginUserNo) {
        modalReporterUserNoInput.value = window.loginUserNo;
      }
    });
  }

  // 모달 내 "신고" 버튼 클릭 시: AJAX 요청
  if (submitReportPostBtn) {
    submitReportPostBtn.addEventListener('click', function () {
      const logNo = modalReportLogNoInput ? modalReportLogNoInput.value : null;
      // reporterUserNo는 서버 측에서 세션으로 가져오는 것이 더 안전하지만, 클라이언트에서도 전달 가능
      const reporterUserNo = modalReporterUserNoInput
        ? modalReporterUserNoInput.value
        : null;
      const selectedReasonRadio = document.querySelector(
        'input[name="reportReason"]:checked'
      );

      if (!reporterUserNo) {
        alert('로그인이 필요한 기능입니다.');
        reportPostModalJquery.modal('hide');
        return;
      }

      if (!selectedReasonRadio) {
        alert('신고하려는 이유를 선택해주세요.');
        return;
      }
      const reportReason = selectedReasonRadio.value;

      // 서버로 전송할 데이터 객체
      const reportData = {
        logNo: parseInt(logNo), // 서버에서 int로 받는다면 숫자로 변환
        // userNo: parseInt(reporterUserNo), // 서버에서 세션으로 가져올 것이므로 생략 가능
        repoReason: reportReason,
        // 상세 내용 필드가 있다면 여기에 추가: repoDetail: document.getElementById('reportDetailText').value
      };

      console.log('전송할 신고 데이터:', reportData); // 개발 중 확인용

      // AJAX POST 요청
      $.ajax({
        url: `/api/log/${logNo}/report`, // 신고 처리 API 엔드포인트 (예시)
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(reportData),
        beforeSend: function (xhr) {
          // CSRF 토큰 헤더에 추가 (window.csrfHeaderName이 실제 헤더 이름이어야 함)
          if (window.csrfHeaderName && window.csrfToken) {
            xhr.setRequestHeader(window.csrfHeaderName, window.csrfToken);
          }
        },
        success: function (response) {
          // response 객체에 서버로부터의 메시지나 상태가 담겨 올 수 있음
          alert(response.message || '게시글이 성공적으로 신고되었습니다.');
          reportPostModalJquery.modal('hide');
          // TODO: 필요시 신고 버튼 상태 변경 또는 신고 횟수 UI 업데이트 등의 후속 처리
        },
        error: function (xhr, status, error) {
          console.error('신고 처리 중 오류 발생: ', xhr.responseText);
          let errorMessage = '신고 처리 중 오류가 발생했습니다.';
          if (xhr.responseJSON && xhr.responseJSON.message) {
            errorMessage += '\n' + xhr.responseJSON.message;
          } else if (xhr.responseText) {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.message)
                errorMessage += '\n' + errorResponse.message;
            } catch (e) {
              // 일반 텍스트 응답일 경우
              errorMessage += '\n' + xhr.responseText;
            }
          }
          alert(errorMessage);
        },
      });
    });
  }
  // ==================== 게시글 신고 모달 관련 로직 끝 ====================

  // 기존 댓글 로드 함수 호출 (HTML의 인라인 스크립트에서 이미 호출하고 있다면 중복 X)
  // if (typeof selectCommentlist === 'function' && window.logNo) {
  //   selectCommentlist(window.logNo, window.loginUserNo);
  // }
});

