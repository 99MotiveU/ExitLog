document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DOM 요소 가져오기 ---
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const sendEmailButton = document.getElementById('send-email-button');

    const emailCodeInput = document.getElementById('email-code');
    const emailCodeError = document.getElementById('email-code-error');
    const verifyEmailButton = document.getElementById('verify-email-button');

    const findIdForm = document.getElementById('findid-form');
    const findIdActionButton = document.getElementById('find-id-action-button');
    const cancelButton = document.getElementById('cancel-button');

    // 모달 관련 DOM 요소
    const foundIdModal = $('#foundIdModal'); // jQuery로 모달 객체 가져오기
    const displayFoundId = document.getElementById('display-found-id');
    const goToLoginButtonModal = document.getElementById('goToLoginButtonModal');

    // 유효성 검사 상태를 저장할 객체
    const validationStatus = {
        email: false,
        isEmailSent: false,
        isEmailVerified: false,
        emailCodeFormat: false
    };

    // --- 2. 헬퍼 함수: 에러 메시지 표시/숨김 ---
    function showErrorMessage(element, message) {
        element.textContent = message;
        element.style.color = 'red';
    }

    function showSuccessMessage(element, message) {
        element.textContent = message;
        element.style.color = '#0079FF'; // 파란색 계열
    }

    function clearMessage(element) {
        element.textContent = '';
    }

    // --- 3. 이메일 유효성 검사 및 인증 ---
    // 이메일 형식 검사
    emailInput.addEventListener('input', function() {
        const email = emailInput.value;
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

        if (email.length === 0) {
            clearMessage(emailError);
            validationStatus.email = false;
            validationStatus.isEmailSent = false;
            validationStatus.isEmailVerified = false;
        } else if (!regex.test(email)) {
            showErrorMessage(emailError, '유효하지 않은 이메일 형식입니다.');
            validationStatus.email = false;
            validationStatus.isEmailSent = false;
            validationStatus.isEmailVerified = false;
        } else {
            showSuccessMessage(emailError, '유효한 이메일 형식입니다. 인증번호 발송을 해주세요.');
            validationStatus.email = true;
            validationStatus.isEmailSent = false;
            validationStatus.isEmailVerified = false;
        }
        updateActionButtonVisibility();
    });

    // 인증번호 발송 버튼 클릭
    sendEmailButton.addEventListener('click', function() {
        const email = emailInput.value;

        if (!validationStatus.email) {
            alert('먼저 이메일 형식을 올바르게 입력해주세요.');
            return;
        }

        sendEmailButton.disabled = true;
        sendEmailButton.textContent = '발송 중';
        showSuccessMessage(emailError, '인증번호를 발송 중입니다...');

        fetch('/api/findid/send-email-auth-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(async response => {
            if (!response.ok) { 
                const errorData = await response.json();
                throw new Error(errorData.message || '인증번호 발송 실패');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('인증번호가 이메일로 발송되었습니다. 5분 이내로 입력해주세요.');
                showSuccessMessage(emailError, '인증번호가 발송되었습니다.');
                validationStatus.isEmailSent = true;
            } else {
                alert('인증번호 발송 실패: ' + (data.message || '다시 시도해주세요.'));
                showErrorMessage(emailError, data.message || '인증번호 발송에 실패했습니다.');
                validationStatus.isEmailSent = false;
            }
            sendEmailButton.disabled = false;
            sendEmailButton.textContent = '인증번호 발송';
            updateActionButtonVisibility();
        })
        .catch(error => {
            console.error('이메일 발송 오류:', error);
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요." :
                                       error.message;
            alert('인증번호 발송 중 오류가 발생했습니다: ' + errorMessageToShow);
            showErrorMessage(emailError, '인증번호 발송 중 오류가 발생했습니다: ' + errorMessageToShow);
            validationStatus.isEmailSent = false;
            sendEmailButton.disabled = false;
            sendEmailButton.textContent = '인증번호 발송';
            updateActionButtonVisibility();
        });
    });

    // 이메일 인증번호 입력 시 유효성 검사 (6자리 숫자)
    emailCodeInput.addEventListener('input', function() {
        const code = emailCodeInput.value;
        const regex = /^\d{6}$/;

        if (code.length === 0) {
            clearMessage(emailCodeError);
            validationStatus.emailCodeFormat = false;
            validationStatus.isEmailVerified = false; 
        } else if (!regex.test(code)) {
            showErrorMessage(emailCodeError, '인증번호는 6자리 숫자입니다.');
            validationStatus.emailCodeFormat = false;
            validationStatus.isEmailVerified = false;
        } else {
            clearMessage(emailCodeError); 
            validationStatus.emailCodeFormat = true;
            validationStatus.isEmailVerified = false; 
        }
        updateActionButtonVisibility();
    });

    // 인증 버튼 클릭
    verifyEmailButton.addEventListener('click', function() {
        const enteredCode = emailCodeInput.value;
        const email = emailInput.value;

        if (!validationStatus.isEmailSent) {
            alert('먼저 인증번호를 발송해주세요.');
            return;
        }
        if (!email) {
            alert('이메일을 입력해주세요.');
            return;
        }
        if (!validationStatus.emailCodeFormat) { 
             alert('올바른 인증번호 형식을 입력해주세요 (6자리 숫자).');
             return;
        }
        
        verifyEmailButton.disabled = true; 
        verifyEmailButton.textContent = '인증 중...';

        fetch('/api/findid/verify-email-auth-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, code: enteredCode })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || '인증번호 확인 실패'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.isVerified) {
                alert('이메일 인증이 완료되었습니다. 아이디 찾기 버튼을 클릭해주세요.');
                showSuccessMessage(emailCodeError, '인증 완료');
                validationStatus.isEmailVerified = true;
                
                // 인증 완료 후 입력 필드 비활성화
                emailInput.disabled = true;
                sendEmailButton.disabled = true;
                emailCodeInput.disabled = true;
                verifyEmailButton.disabled = true;

                // 아이디 찾기 버튼 보이기
                findIdActionButton.style.display = 'block';

            } else {
                alert('인증번호가 일치하지 않습니다.');
                showErrorMessage(emailCodeError, '인증번호가 일치하지 않습니다.');
                validationStatus.isEmailVerified = false;
                findIdActionButton.style.display = 'none'; // 인증 실패 시 버튼 숨김
            }
            verifyEmailButton.disabled = false;
            verifyEmailButton.textContent = '인증';
            updateActionButtonVisibility();
        })
        .catch(error => {
            console.error('인증번호 확인 오류:', error);
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요." :
                                       error.message;
            alert('인증번호 확인 중 오류가 발생했습니다: ' + errorMessageToShow);
            showErrorMessage(emailCodeError, '인증번호 확인 중 오류가 발생했습니다: ' + errorMessageToShow);
            validationStatus.isEmailVerified = false;
            verifyEmailButton.disabled = false;
            verifyEmailButton.textContent = '인증';
            findIdActionButton.style.display = 'none';
            updateActionButtonVisibility();
        });
    });

    // --- 4. 액션 버튼 활성화/비활성화 (가시성) ---
    function updateActionButtonVisibility() {
        const allEmailValid = validationStatus.email &&
                              validationStatus.isEmailSent &&
                              validationStatus.isEmailVerified;
        
        if (allEmailValid) {
            findIdActionButton.style.display = 'block';
        } else {
            findIdActionButton.style.display = 'none';
        }
    }

    // --- 5. 아이디 찾기 버튼 클릭 이벤트 (새롭게 아이디 조회 API 호출) ---
    findIdActionButton.addEventListener('click', function() {
        const email = emailInput.value;

        // 아이디 조회 API 호출
        fetch('/api/findid/userid', { // 다시 필요한 엔드포인트
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || '아이디 조회 실패'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.userId) {  
                displayFoundId.textContent = data.userId; // 모달에 아이디 표시
                foundIdModal.modal('show'); // 모달 띄우기
            } else {
                alert('해당 이메일로 등록된 아이디를 찾을 수 없습니다.');
            }
        })
        .catch(error => {
            console.error('아이디 조회 중 오류 발생:', error);
            alert('아이디 조회 중 오류가 발생했습니다. 다시 시도해 주세요.');
        });
    });

    // --- 6. 취소 버튼 클릭 이벤트 ---
    cancelButton.addEventListener('click', function() {
        if (confirm('아이디 찾기를 취소하고 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = '/login';
        }
    });

    // --- 7. 모달 내 로그인 페이지로 이동 버튼 클릭 이벤트 ---
    goToLoginButtonModal.addEventListener('click', function() {
        foundIdModal.modal('hide'); 
        window.location.href = '/login'; 
    });

    // 초기 로드 시 액션 버튼 숨김
    updateActionButtonVisibility();
});