document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DOM 요소 가져오기 ---
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('username-error');

    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const sendEmailButton = document.getElementById('send-email-button');

    const emailCodeInput = document.getElementById('email-code');
    const emailCodeError = document.getElementById('email-code-error');
    const verifyEmailButton = document.getElementById('verify-email-button');

    const changePasswordButton = document.getElementById('change-password-button');
    const cancelButton = document.getElementById('cancel-button');

    // 모달 관련 DOM 요소
    const changePasswordModal = $('#changePasswordModal');
    const newPasswordInput = document.getElementById('new-password');
    const newPasswordError = document.getElementById('new-password-error');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const confirmNewPasswordError = document.getElementById('confirm-new-password-error');
    const submitNewPasswordButton = document.getElementById('submit-new-password-button');

    // 유효성 검사 상태를 저장할 객체
    const validationStatus = {
        usernameFormat: false, // 아이디가 유효한 형식인지
        emailFormat: false,    // 이메일이 유효한 형식인지
        isUserEmailMatched: false, // 서버에서 아이디와 이메일이 DB에 매칭되는지 확인된 상태
        isEmailSent: false,      // 인증번호 발송 요청 성공 여부
        isEmailVerified: false,  // 이메일 인증 완료 여부
        newPasswordFormat: false,      // 새 비밀번호 형식이 유효한지
        confirmNewPasswordMatch: false // 새 비밀번호와 확인이 일치하는지
    };

    // --- 2. 헬퍼 함수: 에러/성공 메시지 표시/숨김 ---
    function showErrorMessage(element, message) {
        element.textContent = message;
        element.style.color = 'red';
        element.style.textAlign = 'left';
        element.style.paddingLeft = '5px';
        element.classList.remove('hidden-message');
    }

    function showSuccessMessage(element, message) {
        element.textContent = message;
        element.style.color = '#0079FF';
        element.style.textAlign = 'left';
        element.style.paddingLeft = '5px';
        element.classList.remove('hidden-message');
    }

    function clearMessage(element) {
        element.textContent = '';
        element.classList.add('hidden-message');
    }

    // --- 3. 전체 유효성 검사 및 버튼 활성화/비활성화 (메인 페이지) ---
    function updateMainButtonVisibility() {
        const canChangePassword = validationStatus.usernameFormat &&
                                validationStatus.emailFormat &&
                                validationStatus.isUserEmailMatched &&
                                validationStatus.isEmailSent &&
                                validationStatus.isEmailVerified;

        changePasswordButton.style.display = canChangePassword ? 'block' : 'none';
        
        if (validationStatus.isEmailVerified) {
            cancelButton.style.display = 'none';
        } else {
            cancelButton.style.display = 'block';
        }
    }

    // --- 이메일 및 인증 관련 상태 초기화 함수 (재발송, 재시도 등을 위해) ---
    function resetEmailAndVerificationStatus() {
        validationStatus.isEmailSent = false;
        validationStatus.isEmailVerified = false;
        validationStatus.isUserEmailMatched = false;
        
        usernameInput.disabled = false;
        emailInput.disabled = false;
        emailCodeInput.disabled = false;
        verifyEmailButton.disabled = false;

        sendEmailButton.disabled = false;
        sendEmailButton.classList.remove('button-disabled');
        verifyEmailButton.classList.remove('button-disabled');

        sendEmailButton.textContent = '인증번호 발송';
        verifyEmailButton.textContent = '인증';
        emailCodeInput.value = '';
        
        clearMessage(emailError);
        clearMessage(emailCodeError);

        updateMainButtonVisibility();
    }

    //4. 아이디 입력 유효성 검사
    usernameInput.addEventListener('input', function() {
        const username = usernameInput.value;
        const regex = /^[a-zA-Z0-9]{6,15}$/;

        if (username.length === 0) {
            clearMessage(usernameError);
            validationStatus.usernameFormat = false;
        } else if (!regex.test(username)) {
            showErrorMessage(usernameError, '잘못된 형식입니다. 영문, 숫자 6~15자');
            validationStatus.usernameFormat = false;
        } else {
            showSuccessMessage(usernameError, '올바른 아이디 형식입니다.');
            validationStatus.usernameFormat = true;
        }
        resetEmailAndVerificationStatus();
        updateMainButtonVisibility();
    });

    //5. 이메일 입력 유효성 검사 (형식만)
    emailInput.addEventListener('input', function() {
        const email = emailInput.value;
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email.length === 0) {
            clearMessage(emailError);
            validationStatus.emailFormat = false;
        } else if (!regex.test(email)) {
            showErrorMessage(emailError, '유효하지 않은 이메일 형식입니다.');
            validationStatus.emailFormat = false;
        } else {
            showSuccessMessage(emailError, '올바른 이메일 형식입니다.');
            validationStatus.emailFormat = true;
        }
        resetEmailAndVerificationStatus();
        updateMainButtonVisibility();
    });

    //6. 인증번호 발송 버튼 클릭 (아이디 & 이메일 매칭 여부 서버 검증 및 발송) 
    sendEmailButton.addEventListener('click', function() {
        const username = usernameInput.value;
        const email = emailInput.value;

        if (!validationStatus.usernameFormat) {
            alert('먼저 아이디 형식을 올바르게 입력해주세요.');
            showErrorMessage(usernameError, '잘못된 형식입니다. 영문, 숫자 8~20자');
            return;
        }
        if (!validationStatus.emailFormat) {
            alert('먼저 이메일 형식을 올바르게 입력해주세요.');
            showErrorMessage(emailError, '유효하지 않은 이메일 형식입니다.');
            return;
        }

        resetEmailAndVerificationStatus();

        sendEmailButton.disabled = true;
        sendEmailButton.classList.add('button-disabled');
        showSuccessMessage(emailError, '아이디와 이메일 정보를 확인하고 인증번호를 발송 중입니다...');

        fetch('/api/findpw/send-email-auth-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: username, email: email })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '인증번호 발송 실패');
            }
            return data;
        })
        .then(data => {
            if (data.success) {
                alert('인증번호가 이메일로 발송되었습니다. 5분 이내로 입력해주세요.');
                showSuccessMessage(emailError, '인증번호가 발송되었습니다.');
                validationStatus.isEmailSent = true;
                validationStatus.isUserEmailMatched = true;

                usernameInput.disabled = true;
                emailInput.disabled = true;
                sendEmailButton.disabled = true;
                sendEmailButton.classList.add('button-disabled');
            } else {
                alert('인증번호 발송 실패: ' + (data.message || '알 수 없는 오류'));
                showErrorMessage(emailError, data.message || '인증번호 발송에 실패했습니다.');
                validationStatus.isEmailSent = false;
                validationStatus.isUserEmailMatched = false;
                sendEmailButton.disabled = false;
                sendEmailButton.classList.remove('button-disabled');
                sendEmailButton.textContent = '인증번호 발송';
            }
            updateMainButtonVisibility();
        })
        .catch(error => {
            console.error('이메일 발송 오류:', error);
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요. (서버 콘솔 확인)" :
                                       error.message;
            alert('인증번호 발송 중 오류가 발생했습니다: ' + errorMessageToShow);
            showErrorMessage(emailError, errorMessageToShow);
            validationStatus.isEmailSent = false;
            validationStatus.isUserEmailMatched = false;
            sendEmailButton.disabled = false;
            sendEmailButton.classList.remove('button-disabled');
            sendEmailButton.textContent = '인증번호 발송';
            updateMainButtonVisibility();
        });
    });

    // --- 7. 이메일 인증 번호 입력 시 유효성 검사 ---
    emailCodeInput.addEventListener('input', function() {
        const code = emailCodeInput.value;
        const regex = /^\d{6}$/;

        if (code.length === 0) {
            clearMessage(emailCodeError);
        } else if (!regex.test(code)) {
            showErrorMessage(emailCodeError, '인증번호는 6자리 숫자입니다.');
        } else {
            clearMessage(emailCodeError); 
        }
        validationStatus.isEmailVerified = false;
        updateMainButtonVisibility();
    });

    // --- 8. 이메일 인증 버튼 클릭 ---
    verifyEmailButton.addEventListener('click', function() {
        const email = emailInput.value;
        const enteredCode = emailCodeInput.value;

        if (!validationStatus.isEmailSent || !validationStatus.isUserEmailMatched) {
            alert('먼저 아이디와 이메일을 확인하고 인증번호를 발송해주세요.');
            showErrorMessage(emailCodeError, '인증번호 발송이 필요합니다.');
            return;
        }

        if (!/^\d{6}$/.test(enteredCode)) {
            alert('인증번호는 6자리 숫자입니다.');
            showErrorMessage(emailCodeError, '인증번호는 6자리 숫자입니다.');
            return;
        }

        verifyEmailButton.disabled = true;
        verifyEmailButton.classList.add('button-disabled');
        verifyEmailButton.textContent = '인증 중';
        sendEmailButton.disabled = true;
        sendEmailButton.classList.add('button-disabled');


        fetch('/api/findpw/verify-email-auth-code', {
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
                alert('이메일 인증이 완료되었습니다. 비밀번호 변경 버튼을 클릭해주세요.');
                showSuccessMessage(emailCodeError, '인증 완료');
                validationStatus.isEmailVerified = true;
                usernameInput.disabled = true;
                emailInput.disabled = true;
                sendEmailButton.disabled = true;
                sendEmailButton.classList.add('button-disabled');
                emailCodeInput.disabled = true;
                verifyEmailButton.disabled = true;
                verifyEmailButton.classList.add('button-disabled');

                cancelButton.style.display = 'none';
            } else {
                alert('인증번호가 일치하지 않습니다.');
                showErrorMessage(emailCodeError, '인증번호가 일치하지 않습니다.');
                validationStatus.isEmailVerified = false;
                verifyEmailButton.disabled = false;
                verifyEmailButton.classList.remove('button-disabled');
                verifyEmailButton.textContent = '인증';
                sendEmailButton.disabled = false;
                sendEmailButton.classList.remove('button-disabled');
            }
            updateMainButtonVisibility();
        })
        .catch(error => {
            console.error('인증번호 확인 오류:', error);
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요." :
                                       error.message;
            alert('인증번호 확인 중 오류가 발생했습니다: ' + errorMessageToShow);
            showErrorMessage(emailCodeError, errorMessageToShow);
            validationStatus.isEmailVerified = false;
            verifyEmailButton.disabled = false;
            verifyEmailButton.classList.remove('button-disabled');
            verifyEmailButton.textContent = '인증';
            sendEmailButton.disabled = false;
            sendEmailButton.classList.remove('button-disabled');
            updateMainButtonVisibility();
        });
    });

    // --- 9. 비밀번호 변경 버튼 클릭 (모달 띄우기) ---
    changePasswordButton.addEventListener('click', function() {
        if (!validationStatus.isEmailVerified) {
            alert('이메일 인증이 완료되지 않았습니다.');
            return;
        }
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        clearMessage(newPasswordError);
        clearMessage(confirmNewPasswordError);
        validationStatus.newPasswordFormat = false;
        validationStatus.confirmNewPasswordMatch = false;
        submitNewPasswordButton.disabled = true;

        changePasswordModal.modal('show');
    });

    // --- 10. 새 비밀번호 유효성 검사 (모달 내부) ---
    newPasswordInput.addEventListener('input', function() {
        const password = newPasswordInput.value;
        // 기존 비밀번호와 동일한지 여부는 서버에서 확인해야 합니다.
        // 클라이언트 측에서는 형식 유효성만 검사합니다.
        const regex = /^(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`])(?=.*[A-Z]).{10,}$/;

        if (password.length === 0) {
            clearMessage(newPasswordError);
            validationStatus.newPasswordFormat = false;
        } else if (!regex.test(password)) {
            showErrorMessage(newPasswordError, '잘못된 형식입니다. 특수문자, 대문자 포함 10자 이상');
            validationStatus.newPasswordFormat = false;
        } else {
            showSuccessMessage(newPasswordError, '올바른 형식입니다.');
            validationStatus.newPasswordFormat = true;
        }
        checkConfirmNewPassword();
        updateModalSubmitButton();
    });

    // --- 11. 새 비밀번호 확인 일치 검사 (모달 내부) ---
    confirmNewPasswordInput.addEventListener('input', checkConfirmNewPassword);

    function checkConfirmNewPassword() {
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (confirmNewPassword.length === 0) {
            clearMessage(confirmNewPasswordError);
            validationStatus.confirmNewPasswordMatch = false;
        } else if (newPassword !== confirmNewPassword) {
            showErrorMessage(confirmNewPasswordError, '비밀번호가 일치하지 않습니다.');
            validationStatus.confirmNewPasswordMatch = false;
        } else {
            showSuccessMessage(confirmNewPasswordError, '비밀번호가 일치합니다.');
            validationStatus.confirmNewPasswordMatch = true;
        }
        updateModalSubmitButton();
    }

    // --- 12. 모달 내 '확인' 버튼 활성화/비활성화 ---
    function updateModalSubmitButton() {
        const allNewPasswordValid = validationStatus.newPasswordFormat && validationStatus.confirmNewPasswordMatch;
        submitNewPasswordButton.disabled = !allNewPasswordValid;
    }

    // --- 13. 모달 내 '확인' 버튼 클릭 (비밀번호 변경 최종 요청) ---
    submitNewPasswordButton.addEventListener('click', function() {
        const userId = usernameInput.value;
        const newPassword = newPasswordInput.value;

        if (!validationStatus.newPasswordFormat || !validationStatus.confirmNewPasswordMatch) {
            alert('새 비밀번호 형식을 확인하고 일치하게 입력해주세요.');
            return;
        }

        submitNewPasswordButton.disabled = true;
        submitNewPasswordButton.textContent = '변경 중';

        fetch('/api/findpw/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, newPassword: newPassword })
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '비밀번호 변경 실패');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
                changePasswordModal.modal('hide');
                window.location.href = '/login';
            } else {
                if (data.message && data.message.includes('기존 비밀번호와 동일')) {
                    alert('비밀번호 변경 실패: ' + data.message);
                    showErrorMessage(newPasswordError, data.message); // 모달 내 새 비밀번호 에러 메시지 표시
                } else {
                    alert('비밀번호 변경 실패: ' + (data.message || '알 수 없는 오류'));
                }
                submitNewPasswordButton.disabled = false;
                submitNewPasswordButton.textContent = '확인';
            }
        })
        .catch(error => {
            console.error('비밀번호 변경 오류:', error);
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요." :
                                       error.message;
            alert(errorMessageToShow);
            submitNewPasswordButton.disabled = false;
            submitNewPasswordButton.textContent = '확인';
        });
    });

    // --- 14. 취소 버튼 클릭 이벤트 ---
    cancelButton.addEventListener('click', function() {
        if (confirm('비밀번호 변경을 취소하고 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = '/login';
        }
    });

    // 초기 로드 시 모든 메시지 숨김 및 버튼 상태 설정
    clearMessage(usernameError);
    clearMessage(emailError);
    clearMessage(emailCodeError);
    clearMessage(newPasswordError);
    clearMessage(confirmNewPasswordError);
    updateMainButtonVisibility();
});