document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DOM 요소 가져오기 ---
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('username-error');
    const checkUsernameButton = document.getElementById('check-username-button');

    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');

    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    const nicknameInput = document.getElementById('nickname');
    const nicknameError = document.getElementById('nickname-error');
    const checkNicknameButton = document.getElementById('check-nickname-button');

    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const sendEmailButton = document.getElementById('send-email-button');

    const emailCodeInput = document.getElementById('email-code');
    const emailCodeError = document.getElementById('email-code-error');
    const verifyEmailButton = document.getElementById('verify-email-button');

    const signupForm = document.getElementById('signup-form');
    const signupSubmitButton = signupForm.querySelector('button[type="submit"]');
    const resetButton = signupForm.querySelector('button[type="reset"]');

    // 유효성 검사 상태를 저장할 객체 (모든 항목이 true여야 회원가입 가능)
    const validationStatus = {
        username: false,
        isUsernameChecked: false, // 중복 확인 여부
        password: false,
        confirmPassword: false,
        nickname: false,
        isNicknameChecked: false, // 중복 확인 여부
        email: false,
        isEmailSent: false,      // 인증번호 발송 여부
        isEmailVerified: false,  // 이메일 인증 완료 여부

    };

    // --- 2. 헬퍼 함수: 에러 메시지 표시/숨김 ---
    function showErrorMessage(element, message) {
        element.textContent = message;
        element.style.color = 'red';
    }

    function showSuccessMessage(element, message) {
        element.textContent = message;
        element.style.color = '#0079FF';
    }

    function clearMessage(element) {
        element.textContent = '';
    }

    // --- 3. 아이디 유효성 검사 및 중복 확인 ---
    usernameInput.addEventListener('input', function() {
        const username = usernameInput.value;
        const regex = /^[a-zA-Z0-9]{6,16}$/;

        if (username.length === 0) {
            clearMessage(usernameError);
            validationStatus.username = false;
            validationStatus.isUsernameChecked = false; // 입력 변경 시 중복 확인 초기화
        } else if (!regex.test(username)) {
            showErrorMessage(usernameError, '잘못된 형식입니다. 영문, 숫자 포함 가능 6 ~ 16자');
            validationStatus.username = false;
            validationStatus.isUsernameChecked = false;
        } else {
            showSuccessMessage(usernameError, '사용 가능한 형식입니다.');
            showErrorMessage(usernameError, '중복 확인을 해주세요.');
            validationStatus.username = true;
            validationStatus.isUsernameChecked = false; // 다시 입력하면 중복확인 다시 하도록
        }
        checkOverallValidation(); // 전반적인 유효성 검사 호출
    });

    // 아이디 중복 확인 버튼 클릭 이벤트
    checkUsernameButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if (!validationStatus.username) {
            alert('먼저 아이디 형식을 올바르게 입력해주세요.');
            return;
        }

        // 백엔드와 데이터베이스 연동: 아이디 중복 확인 요청
        fetch('/api/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: username }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.isDuplicate) {
                showErrorMessage(usernameError, '중복된 아이디입니다.');
                validationStatus.isUsernameChecked = false;
            } else {
                showSuccessMessage(usernameError, '사용 가능한 아이디입니다.');
                validationStatus.isUsernameChecked = true;
            }
            checkOverallValidation();
        })
        .catch(error => {
            console.error('아이디 중복 확인 오류:', error);
            showErrorMessage(usernameError, '오류 발생, 다시 시도해주세요.');
            validationStatus.isUsernameChecked = false;
            checkOverallValidation();
        });
    });

    // --- 4. 비밀번호 유효성 검사 ---
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        // 최소 10자, 특수문자 1개 이상, 대문자 1개 이상
        const regex = /^(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`])(?=.*[A-Z]).{10,}$/; 

        if (password.length === 0) {
            clearMessage(passwordError);
            validationStatus.password = false;
        } else if (!regex.test(password)) {
            showErrorMessage(passwordError, '잘못된 형식입니다. 특수문자, 대문자 포함 10자 이상');
            validationStatus.password = false;
        } else {
            showSuccessMessage(passwordError, '올바른 형식입니다.');
            validationStatus.password = true;
        }
        // 비밀번호 변경 시 비밀번호 확인도 다시 검사
        checkConfirmPassword();
        checkOverallValidation();
    });

    // --- 5. 비밀번호 확인 일치 검사 ---
    confirmPasswordInput.addEventListener('input', checkConfirmPassword);

    function checkConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length === 0) {
            clearMessage(confirmPasswordError);
            validationStatus.confirmPassword = false;
        } else if (password !== confirmPassword) {
            showErrorMessage(confirmPasswordError, '비밀번호가 일치하지 않습니다.');
            validationStatus.confirmPassword = false;
        } else {
            showSuccessMessage(confirmPasswordError, '비밀번호가 일치합니다.');
            validationStatus.confirmPassword = true;
        }
        checkOverallValidation();
    }

    // --- 6. 닉네임 유효성 검사 및 중복 확인 ---
    // 특수문자 제외, 영문/한글/숫자 포함 15자 이내
    nicknameInput.addEventListener('input', function() {
        const nickname = nicknameInput.value;
        const regex = /^[a-zA-Z0-9가-힣]{2,15}$/; // 특수문자 제외, 15자 이내

        if (nickname.length === 0) {
            clearMessage(nicknameError);
            validationStatus.nickname = false;
            validationStatus.isNicknameChecked = false; // 입력 변경 시 중복 확인 초기화
        } else if (!regex.test(nickname)) {
            showErrorMessage(nicknameError, '잘못된 닉네임 형식입니다. 특수문자 제외, 2자 이상 15자 이내');
            validationStatus.nickname = false;
            validationStatus.isNicknameChecked = false;
        } else {
            showSuccessMessage(nicknameError, '사용 가능한 형식입니다.');
            showErrorMessage(nicknameError, '중복 확인을 해주세요.');
            validationStatus.nickname = true;
            validationStatus.isNicknameChecked = false; // 다시 입력하면 중복확인 다시 하도록
        }
        checkOverallValidation();
    });

    // 닉네임 중복 확인 버튼 클릭 이벤트
    checkNicknameButton.addEventListener('click', function() {
        const nickname = nicknameInput.value;

        if (!validationStatus.nickname) {
            alert('먼저 닉네임 형식을 올바르게 입력해주세요.');
            return;
        }

        // 백엔드와 데이터베이스 연동: 닉네임 중복 확인 요청
        fetch('/api/check-nickname', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: nickname })
        })
        .then(response => response.json())
        .then(data => {
            if (data.isDuplicate) { 
                showErrorMessage(nicknameError, '중복된 닉네임입니다.');
                validationStatus.isNicknameChecked = false;
            } else {
                showSuccessMessage(nicknameError, '사용 가능한 닉네임입니다.');
                validationStatus.isNicknameChecked = true;
            }
            checkOverallValidation();
        })
        .catch(error => {
            console.error('닉네임 중복 확인 오류:', error);
            showErrorMessage(nicknameError, '오류 발생, 다시 시도해주세요.');
            validationStatus.isNicknameChecked = false;
            checkOverallValidation();
        });
    });

    // --- 7. 이메일 유효성 검사 및 인증 ---
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
            validationStatus.isEmailSent = false; // 이메일 변경 시 인증 상태 초기화
            validationStatus.isEmailVerified = false;
        }
        checkOverallValidation();
    });

    // 인증번호 발송 버튼 클릭
    sendEmailButton.addEventListener('click', function() {
        const email = emailInput.value;

        if (!validationStatus.email) {
            alert('먼저 이메일 형식을 올바르게 입력해주세요.');
            return;
        }

        // 버튼 중복 클릭 방지 (disable)
        sendEmailButton.disabled = true;
        sendEmailButton.textContent = '발송 중';
        showSuccessMessage(emailError, '인증번호를 발송 중입니다...');


        fetch('/api/signup/send-email-auth-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(async response => {
            if (!response.ok) { 
                const errorData = await response.json();
                throw new Error(errorData.message || '인증번호 발송 실패');
            }
            // 200 OK일 경우 JSON 응답 파싱
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('인증번호가 이메일로 발송되었습니다. 5분 이내로 입력해주세요.');
                showSuccessMessage(emailError, '인증번호가 발송되었습니다.');
                validationStatus.isEmailSent = true;
            } else {
                // data.success가 false일 때 (백엔드에서 의도적으로 실패 응답을 보낸 경우)
                alert('인증번호 발송 실패: ' + (data.message || '다시 시도해주세요.'));
                showErrorMessage(emailError, data.message || '인증번호 발송에 실패했습니다.');
                validationStatus.isEmailSent = false;
            }
            sendEmailButton.disabled = false;
            sendEmailButton.textContent = '인증번호 발송';
            checkOverallValidation();
        })
        .catch(error => {
            console.error('이메일 발송 오류:', error);
            // 'SyntaxError: Failed to execute 'json' on 'Response'' 같은 오류는
            // 서버에서 유효한 JSON이 아닌 응답을 보낼 때 발생합니다.
            // 이때는 error.message를 그대로 보여주는 것이 좋습니다.
            const errorMessageToShow = error.message.includes("Unexpected end of JSON input") ?
                                       "서버 응답 오류 (JSON 형식 아님): 다시 시도해주세요." :
                                       error.message;
            alert(errorMessageToShow);
            showErrorMessage(emailError,  errorMessageToShow);
            validationStatus.isEmailSent = false;
            sendEmailButton.disabled = false;
            sendEmailButton.textContent = '인증번호 발송';
            checkOverallValidation();
        });
    });

    // 이메일 인증번호 입력 시 유효성 검사 (6자리 숫자)
    emailCodeInput.addEventListener('input', function() {
        const code = emailCodeInput.value;
        const regex = /^\d{6}$/; // 6자리 숫자

        if (code.length === 0) {
            clearMessage(emailCodeError);
            // validationStatus.emailCode는 형식 검사 용도로만 사용되므로, 
            // 실제 인증 상태는 isEmailVerified로 판단합니다.
            // validationStatus.emailCode = false; 
            validationStatus.isEmailVerified = false; // 인증 상태 초기화
        } else if (!regex.test(code)) {
            showErrorMessage(emailCodeError, '인증번호는 6자리 숫자입니다.');
            // validationStatus.emailCode = false;
            validationStatus.isEmailVerified = false;
        } else {
            clearMessage(emailCodeError); // 형식은 맞으므로 메시지 삭제
            // validationStatus.emailCode = true;
            validationStatus.isEmailVerified = false; // 재입력 시 인증 상태 초기화
        }
        checkOverallValidation();
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
        // emailCodeInput의 형식 유효성 검사를 여기서 직접 사용
        if (!/^\d{6}$/.test(enteredCode)) { // 6자리 숫자인지 다시 확인
             alert('올바른 인증번호 형식을 입력해주세요 (6자리 숫자).');
             showErrorMessage(emailCodeError, '인증번호는 6자리 숫자입니다.');
             return;
        }
        
        verifyEmailButton.disabled = true; 
        verifyEmailButton.textContent = '인증 중...';

        // 백엔드 연동: 인증번호 확인 요청
        // 변경된 API 경로 사용: /api/signup/verify-email-auth-code
        fetch('/api/signup/verify-email-auth-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, code: enteredCode })
        })
        .then(response => {
            if (!response.ok) { // HTTP 에러 처리 (4xx, 5xx)
                // 서버에서 JSON 응답을 보낼 것이라고 가정하고 파싱 시도
                return response.json().then(err => { throw new Error(err.message || '인증번호 확인 실패'); });
            }
            // 200 OK일 경우 JSON 응답 파싱
            return response.json();
        })
        .then(data => {
            if (data.isVerified) { // 백엔드에서 isVerified: true/false 응답
                alert('이메일 인증이 완료되었습니다.');
                showSuccessMessage(emailCodeError, '인증 완료');
                validationStatus.isEmailVerified = true;
                // 인증 완료 후 입력 필드 비활성화 (선택 사항)
                emailInput.disabled = true;
                sendEmailButton.disabled = true;
                emailCodeInput.disabled = true;
                verifyEmailButton.disabled = true;
            } else {
                alert('인증번호가 일치하지 않습니다.');
                showErrorMessage(emailCodeError, '인증번호가 일치하지 않습니다.');
                validationStatus.isEmailVerified = false;
            }
            verifyEmailButton.disabled = false;
            verifyEmailButton.textContent = '인증';
            checkOverallValidation();
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
            checkOverallValidation();
        });
    });

    // --- 8. 전체 유효성 검사 및 회원가입 버튼 활성화/비활성화 ---
    function checkOverallValidation() {
        const allValid = validationStatus.username &&
                         validationStatus.isUsernameChecked &&
                         validationStatus.password &&
                         validationStatus.confirmPassword &&
                         validationStatus.nickname &&
                         validationStatus.isNicknameChecked &&
                         validationStatus.email &&        // 이메일 형식 통과
                         validationStatus.isEmailSent &&   // 인증번호 발송 완료
                         validationStatus.isEmailVerified; // 이메일 최종 인증 완료

        signupSubmitButton.disabled = !allValid;
    }

    // 초기 로드 시 버튼 상태 설정
    checkOverallValidation();

    // --- 9. 회원가입 폼 제출 이벤트 (실제 회원가입 로직) ---
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 폼의 기본 제출 동작 방지

        // 최종 유효성 검사 (다시 한번 확인)
        if (!validationStatus.username || !validationStatus.isUsernameChecked ||
            !validationStatus.password || !validationStatus.confirmPassword ||
            !validationStatus.nickname || !validationStatus.isNicknameChecked ||
            !validationStatus.email || !validationStatus.isEmailSent || !validationStatus.isEmailVerified) {
            alert('모든 필수 입력 사항을 확인하고 유효성 검사, 중복 확인 및 이메일 인증을 완료해주세요.');
            return;
        }

        const userData = {
            userId: usernameInput.value,
            password: passwordInput.value,
            nickname: nicknameInput.value,
            email: emailInput.value
        };

        console.log('회원가입 데이터:', userData);

        // 회원가입 요청
        fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) { // HTTP 에러 처리
                return response.json().then(err => { throw new Error(err.message || '회원가입 요청 실패'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert(data.message + ' 로그인 페이지로 이동합니다.'); // "회원가입 성공!"
                window.location.href = data.redirectUrl || '/login'; // 로그인 페이지로 이동
            } else {
                if (data.message === 'DUPLICATE_ID') {
                    showErrorMessage(usernameError, '이미 사용 중인 아이디입니다.');
                    validationStatus.isUsernameChecked = false; // 중복 확인 다시 필요
                } else if (data.message === 'DUPLICATE_NICKNAME') {
                    showErrorMessage(nicknameError, '이미 사용 중인 닉네임입니다.');
                    validationStatus.isNicknameChecked = false; // 중복 확인 다시 필요
                } else {
                    alert('회원가입 실패: ' + (data.message || '알 수 없는 오류가 발생했습니다.'));
                }
            }
        })
        .catch(error => {
            console.error('회원가입 중 오류 발생:', error);
            alert('회원가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
        });
    });

    // --- 10. 취소 버튼 클릭 이벤트 ---
    resetButton.addEventListener('click', function(event) {
        if (confirm('회원가입을 취소하고 홈화면으로 이동하시겠습니까?\n입력하 정보는 저장되지 않습니다.')) {
            window.location.href = '/main';
        } else {}
    });
});