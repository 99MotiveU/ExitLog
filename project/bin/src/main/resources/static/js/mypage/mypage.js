document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DOM 요소 선택 (상수화) ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    // 모달 관련 요소
    const passwordModal = document.getElementById('password-modal');
    const closeModalButton = passwordModal?.querySelector('.close-button'); // null 체크를 위해 ? 추가
    const authenticateButton = document.getElementById('authenticate-password');
    const currentPasswordField = document.getElementById('current-password');
    const authMessage = document.getElementById('auth-message');

    // 회원정보 수정 폼 관련 요소
    const infoForm = document.querySelector('.info-form');
    const editButton = infoForm?.querySelector('.btn-gray'); // null 체크를 위해 ? 추가
    const saveButton = infoForm?.querySelector('.btn-blue'); // null 체크를 위해 ? 추가

    // 닉네임 관련 요소
    const nicknameInput = document.getElementById('nickname');
    const checkNicknameButton = document.getElementById('checkNicknameButton');
    const nicknameValidationMessage = document.getElementById('nicknameValidationMessage');

    // 이메일 인증 관련 요소
    const sendEmailVerificationButton = document.getElementById('sendEmailVerificationButton');
    const emailInput = document.getElementById('email');
    const emailValidationMessage = document.getElementById('emailValidationMessage');
    const emailVerificationMessage = document.getElementById('emailVerificationMessage');
    const verificationCodeSection = document.getElementById('verificationCodeSection');
    const verificationCodeInput = document.getElementById('verificationCodeInput');
    const checkVerificationCodeButton = document.getElementById('checkVerificationCodeButton');

    // 재직 증명서 관련 요소
    const employmentCertificateInput = document.getElementById('employmentCertificate');
    const employmentCertificateUpload = document.getElementById('employmentCertificateUpload');
    const submitFileButton = document.getElementById('submitFileButton');
    const employmentReauthButton = infoForm?.querySelector('.btn-secondary'); // 재인증 버튼 (새로 추가)

    // 인증 후 이동할 페이지의 URI 값 (let으로 선언)
    let targetIdAfterAuth = '';

    // --- 2. 헬퍼 함수 정의 ---

    // URL 해시에 따라 콘텐츠 섹션 활성화
    function activateContentFromHash() {
        const hash = window.location.hash.substring(1);
        const targetId = hash || 'mypage_mylogs_content'; // 기본값: 내가 쓴 로그
        activateContent(targetId);
    }

    // 특정 콘텐츠 섹션 활성화 및 사이드바 링크 업데이트
    function activateContent(targetId) {
        contentSections.forEach(section => section.classList.remove('active'));
        sidebarLinks.forEach(link => link.classList.remove('active'));

        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        const correspondingLink = document.querySelector(`.sidebar-link[data-target="${targetId}"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }
    }

    // 닉네임 유효성 메시지 초기화
    function resetNicknameValidationMessage() {
        if (nicknameValidationMessage) {
            nicknameValidationMessage.style.display = 'none';
            nicknameValidationMessage.textContent = '';
            nicknameValidationMessage.classList.remove('error', 'success');
        }
    }

    // 닉네임 유효성 검사 로직
    function validateNickname(enteredNickname) {
        if (enteredNickname.length === 0) return { isValid: false, errorMessage: '닉네임을 입력해주세요.' };
        if (enteredNickname.length < 2 || enteredNickname.length > 10) return { isValid: false, errorMessage: '닉네임은 2자 이상 10자 이하로 입력해주세요.' };
        if (!/^[가-힣a-zA-Z0-9]+$/.test(enteredNickname)) return { isValid: false, errorMessage: '닉네임은 한글, 영어, 숫자만 입력 가능합니다.' };
        if (/^[ㄱ-ㅎ]+$/.test(enteredNickname)) return { isValid: false, errorMessage: '초성만으로 이루어진 닉네임은 사용할 수 없습니다.' };
        if (/(.)\1\1/.test(enteredNickname)) return { isValid: false, errorMessage: '같은 문자를 3회 이상 연속하여 사용할 수 없습니다.' };
        return { isValid: true, errorMessage: '' };
    }

    // 이메일 유효성 검사 로직
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 이메일 관련 메시지 초기화 (유효성 + 인증)
    function resetEmailMessages() {
        if (emailValidationMessage) {
            emailValidationMessage.style.display = 'none';
            emailValidationMessage.textContent = '';
            emailValidationMessage.classList.remove('error', 'success');
        }
        if (emailVerificationMessage) {
            emailVerificationMessage.style.display = 'none';
            emailVerificationMessage.textContent = '';
            emailVerificationMessage.classList.remove('error', 'success');
        }
    }

    // 모달 닫기 함수
    function closePasswordModal() {
        passwordModal.style.display = 'none';
        authMessage.style.display = 'none';
        currentPasswordField.value = '';
    }

    // 회원정보 수정 폼 필드 및 버튼 초기 상태 설정
    function setInfoFormInitialState() {
        // 회사명을 제외한 모든 입력 필드를 readonly로 설정
        infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
            input.setAttribute('readonly', 'true');
        });

        // 관련 버튼들 disabled 상태로 초기화
        if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
        if (sendEmailVerificationButton) sendEmailVerificationButton.setAttribute('disabled', 'true');
        if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
        if (submitFileButton) submitFileButton.setAttribute('disabled', 'true');
        if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true'); // 재인증 버튼

        if (saveButton) saveButton.setAttribute('disabled', 'true');
        if (editButton) editButton.removeAttribute('disabled');

        resetNicknameValidationMessage();
        resetEmailMessages();
        if (verificationCodeSection) {
            verificationCodeSection.style.display = 'none';
        }
    }


    // --- 3. 이벤트 리스너 등록 ---

    // 사이드바 링크 클릭 이벤트
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.dataset.target;

            if (targetId === 'mypage_pwfix_content' || targetId === 'mypage_secession_content') {
                passwordModal.style.display = 'flex';
                currentPasswordField.value = '';
                authMessage.style.display = 'none';
                currentPasswordField.focus();
                targetIdAfterAuth = targetId;
            } else {
                activateContent(targetId);
                window.history.pushState(null, '', '#' + targetId);
            }

            // '회원정보 수정' 탭으로 이동 시 초기 상태 설정
            if (targetId === 'mypage_info_content' && infoForm) {
                setInfoFormInitialState();
            }
        });
    });

    // 모달 닫기 버튼 및 외부 클릭 이벤트
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closePasswordModal);
    }
    if (passwordModal) {
        window.addEventListener('click', function(event) {
            if (event.target === passwordModal) {
                closePasswordModal();
            }
        });
    }

    // 비밀번호 인증 로직
    if (authenticateButton) {
        authenticateButton.addEventListener('click', function() {
            const enteredPassword = currentPasswordField.value;
            // 실제 DB와 연동하여 비밀번호 확인 필요
            if (enteredPassword === '1234') { // 예시 비밀번호
                authMessage.textContent = '';
                authMessage.style.display = 'none';
                closePasswordModal();
                if (targetIdAfterAuth) {
                    activateContent(targetIdAfterAuth);
                    window.history.pushState(null, '', '#' + targetIdAfterAuth);
                }
                targetIdAfterAuth = '';
            } else {
                authMessage.textContent = '비밀번호가 일치하지 않습니다.';
                authMessage.style.display = 'block';
                currentPasswordField.value = '';
                currentPasswordField.focus();
            }
        });
    }

    // 비밀번호 입력 필드에서 Enter 키 처리
    if (currentPasswordField) {
        currentPasswordField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                authenticateButton.click();
            }
        });
    }

    // 재직 증명서 파일 제출 로직
    if (submitFileButton) {
        submitFileButton.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return; // disabled일 때 클릭 방지
            employmentCertificateUpload.click();
        });
    }
    if (employmentCertificateUpload) {
        employmentCertificateUpload.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                employmentCertificateInput.value = fileName;
                // employmentCertificateInput.setAttribute('readonly', 'true'); // 파일 선택 시 readonly 유지
            } else {
                employmentCertificateInput.value = '';
            }
        });
    }

    // 닉네임 중복 확인 로직
    if (checkNicknameButton) {
        checkNicknameButton.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return; // disabled일 때 클릭 방지

            const enteredNickname = nicknameInput.value.trim();
            resetNicknameValidationMessage();

            const { isValid, errorMessage } = validateNickname(enteredNickname);
            if (!isValid) {
                nicknameValidationMessage.textContent = errorMessage;
                nicknameValidationMessage.classList.add('error');
                nicknameValidationMessage.style.display = 'block';
                return;
            }

            const isNicknameTaken = (enteredNickname === '김와와'); // 실제 DB 연결 필요
            if (isNicknameTaken) {
                nicknameValidationMessage.textContent = '이미 등록된 닉네임입니다.';
                nicknameValidationMessage.classList.add('error');
            } else {
                nicknameValidationMessage.textContent = '사용 가능한 닉네임 입니다.';
                nicknameValidationMessage.classList.add('success');
            }
            nicknameValidationMessage.style.display = 'block';
        });
    }

    // 이메일 인증 메일 발송 로직
    if (sendEmailVerificationButton) {
        sendEmailVerificationButton.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return; // disabled일 때 클릭 방지

            const currentEmail = emailInput.value.trim();
            resetEmailMessages();

            if (!currentEmail) {
                emailValidationMessage.textContent = '이메일을 입력해주세요.';
                emailValidationMessage.classList.add('error');
                emailValidationMessage.style.display = 'block';
                return;
            }
            if (!validateEmail(currentEmail)) {
                emailValidationMessage.textContent = '유효한 이메일 형식이 아닙니다.';
                emailValidationMessage.classList.add('error');
                emailValidationMessage.style.display = 'block';
                return;
            }

            console.log(`Sending verification email to: ${currentEmail}`); // 실제 이메일 발송 로직 추가

            emailVerificationMessage.textContent = '인증 메일이 발송되었습니다. 인증번호를 입력해주세요.';
            emailVerificationMessage.classList.remove('error');
            emailVerificationMessage.classList.add('success');
            emailVerificationMessage.style.display = 'block';

            verificationCodeSection.style.display = 'block';
            verificationCodeInput.value = '';
            verificationCodeInput.focus();

            // 이메일 입력 필드와 인증 버튼 비활성화
            emailInput.setAttribute('readonly', 'true');
            this.setAttribute('disabled', 'true');
        });
    }

    // 인증번호 확인 로직 (⭐ 수정된 부분: 인증번호 값)
    if (checkVerificationCodeButton) {
        checkVerificationCodeButton.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return; // disabled일 때 클릭 방지

            const enteredCode = verificationCodeInput.value.trim();
            // ⭐ 수정된 부분: 실제 인증번호 '123456'으로 변경
            if (enteredCode === '123456') { // 백엔드에서 받은 실제 인증번호와 비교
                emailVerificationMessage.textContent = '이메일 인증이 완료되었습니다!';
                emailVerificationMessage.classList.remove('error');
                emailVerificationMessage.classList.add('success');
                emailVerificationMessage.style.display = 'block';

                emailInput.setAttribute('readonly', 'true');
                sendEmailVerificationButton.setAttribute('disabled', 'true');
                sendEmailVerificationButton.textContent = '인증 완료';
                verificationCodeInput.setAttribute('readonly', 'true');
                this.setAttribute('disabled', 'true'); // 본인 버튼 (인증번호 확인) 비활성화

                setTimeout(() => {
                    verificationCodeSection.style.display = 'none';
                }, 2000);
            } else {
                emailVerificationMessage.textContent = '인증번호가 일치하지 않습니다.';
                emailVerificationMessage.classList.remove('success');
                emailVerificationMessage.classList.add('error');
                emailVerificationMessage.style.display = 'block';
                verificationCodeInput.value = '';
                verificationCodeInput.focus();
            }
        });
    }

    // 인증번호 입력 필드에서 Enter 키 처리
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkVerificationCodeButton.click();
            }
        });
    }

    // 회원정보 수정 '수정' 버튼 클릭 이벤트
    if (editButton) {
        editButton.addEventListener('click', function() {
            // '회사명' 필드를 제외한 모든 입력 필드의 readonly 속성 해제
            infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
                input.removeAttribute('readonly');
            });

            // 닉네임 중복 확인, 이메일 인증, 인증번호 확인, 재직 증명서 관련 버튼 활성화
            if (checkNicknameButton) checkNicknameButton.removeAttribute('disabled');
            if (sendEmailVerificationButton) sendEmailVerificationButton.removeAttribute('disabled');
            if (checkVerificationCodeButton) checkVerificationCodeButton.removeAttribute('disabled'); // 인증번호 확인 버튼 활성화
            if (submitFileButton) submitFileButton.removeAttribute('disabled'); // 재직 증명서 '제출' 버튼 활성화
            if (employmentReauthButton) employmentReauthButton.removeAttribute('disabled'); // 재직 증명서 '재인증' 버튼 활성화

            // '수정' 버튼 비활성화, '저장' 버튼 활성화
            this.setAttribute('disabled', 'true'); // '수정' 버튼
            saveButton.removeAttribute('disabled'); // '저장' 버튼

            // 메시지 초기화
            resetNicknameValidationMessage();
            resetEmailMessages();
            // verificationCodeSection은 '이메일 인증' 버튼을 다시 누르기 전까지는 숨겨져 있어야 함
            if (verificationCodeSection) {
                verificationCodeSection.style.display = 'none';
            }
        });
    }

    // 회원정보 수정 '저장' 버튼 클릭 이벤트
    if (saveButton) {
        saveButton.addEventListener('click', function(event) {
            event.preventDefault(); // 폼 기본 제출 방지

            // TODO: 여기에 폼 유효성 검사 및 데이터 전송(AJAX 등) 로직을 추가
            console.log('회원 정보 저장 시도');
            alert('회원 정보가 저장되었습니다. (실제 저장 로직은 백엔드 연동 필요)');

            // 저장 후 다시 readonly 상태로 전환 (회사명 제외)
            infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
                input.setAttribute('readonly', 'true');
            });

            // 버튼 상태 재설정
            editButton.removeAttribute('disabled'); // '수정' 버튼 활성화
            this.setAttribute('disabled', 'true'); // '저장' 버튼 비활성화

            // 닉네임 중복 확인, 이메일 인증, 인증번호 확인, 재직 증명서 관련 버튼 비활성화
            if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
            if (sendEmailVerificationButton) sendEmailVerificationButton.setAttribute('disabled', 'true');
            if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
            if (submitFileButton) submitFileButton.setAttribute('disabled', 'true');
            if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true');

            // 메시지 초기화 및 인증번호 섹션 숨기기
            resetNicknameValidationMessage();
            resetEmailMessages();
            if (verificationCodeSection) {
                verificationCodeSection.style.display = 'none';
            }
        });
    }

    // --- 4. 초기화 로직 ---

    // 페이지 로드 시 또는 URL 해시 변경 시 콘텐츠 활성화
    window.addEventListener('hashchange', activateContentFromHash);
    activateContentFromHash(); // 초기 콘텐츠 활성화

    // 회원정보 수정 탭의 초기 상태를 직접 설정
    // 페이지 로드 시 'mypage_info_content'가 active 섹션이 아닐 수 있으므로,
    // 해당 탭을 활성화할 때만 초기 상태를 설정하도록 변경했습니다.
    // 만약 페이지 로드 시 항상 'mypage_info_content'가 첫 화면이라면, 이 부분을 따로 호출할 수도 있습니다.
    // 하지만 현재 사이드바 로직을 따르는 것이 더 일관적입니다.
});