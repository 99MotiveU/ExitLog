// js/mypage/main.js - Combined and Optimized

document.addEventListener('DOMContentLoaded', function() {
    window.Elements = window.Elements || {};

    // --- 1. 모든 DOM 요소들을 window.Elements 객체에 할당 ---
    // querySelectorAll은 NodeList를 반환하므로, null 체크가 덜 중요하지만, 만약을 위해.
    window.Elements.sidebarLinks = document.querySelectorAll('.sidebar-link');
    window.Elements.contentSections = document.querySelectorAll('.mypage-content-section');

    // 비밀번호 모달 관련
    window.Elements.passwordModal = document.getElementById('password-modal');
    if (window.Elements.passwordModal) {
        window.Elements.closeModalButton = document.getElementById('closePasswordModal'); // HTML ID 사용
    }
    window.Elements.authenticateButton = document.getElementById('authenticate-password');
    window.Elements.currentPasswordField = document.getElementById('current-password');
    window.Elements.authMessage = document.getElementById('auth-message');

    // 회원정보 수정 폼 관련
    window.Elements.infoForm = document.querySelector('.info-form'); // class로 찾거나, 폼에 id="infoForm" 부여 후 id로 찾기
    window.Elements.editButton = document.getElementById('editButton'); // ⭐ HTML ID와 일치
    window.Elements.saveButton = document.getElementById('saveButton');
    window.Elements.employmentReauthButton = document.getElementById('employmentReauthButton'); // ⭐ HTML ID와 일치

    // 닉네임 관련
    window.Elements.nicknameInput = document.getElementById('nickname');
    window.Elements.checkNicknameButton = document.getElementById('checkNicknameButton'); // ⭐ HTML ID와 일치
    window.Elements.nicknameValidationMessage = document.getElementById('nicknameValidationMessage'); // ⭐ HTML ID와 일치

    // 이메일 인증 관련
    window.Elements.sendEmailVerificationButton = document.getElementById('sendEmailVerificationButton'); // ⭐ HTML ID와 일치
    window.Elements.emailInput = document.getElementById('email');
    window.Elements.emailValidationMessage = document.getElementById('emailValidationMessage'); // ⭐ HTML ID와 일치
    window.Elements.emailVerificationMessage = document.getElementById('emailVerificationMessage'); // ⭐ HTML ID와 일치
    window.Elements.verificationCodeSection = document.getElementById('verificationCodeSection'); // ⭐ HTML에 이 ID 추가 필요
    window.Elements.verificationCodeInput = document.getElementById('verificationCodeInput'); // ⭐ HTML ID와 일치
    window.Elements.checkVerificationCodeButton = document.getElementById('checkVerificationCodeButton'); // ⭐ HTML ID와 일치


    // 비밀번호 변경 폼 관련
    window.Elements.currentPasswordInput = document.getElementById('currentPasswordInput');
    window.Elements.newPassword = document.getElementById('newPassword');
    window.Elements.confirmNewPassword = document.getElementById('confirmNewPassword');
    window.Elements.passwordMatchError = document.getElementById('passwordMatchError');
    window.Elements.currentPasswordError = document.getElementById('currentPasswordError');
    window.Elements.changePasswordSubmitButton = document.getElementById('changePasswordSubmitButton');
    window.Elements.newPasswordFormatError = document.getElementById('newPasswordFormatError');

    // 재직 증명서 관련 (mypage_info_content 섹션)
    window.Elements.employmentCertificateInput = document.getElementById('employmentCertificate'); // ⭐ HTML ID와 일치 (파일명 표시 input)
    window.Elements.submitFileButton = document.getElementById('submitEmploymentCertBtn'); // ⭐ HTML ID와 일치 (제출 버튼)
    // 재직 증명서 업로드 모달 관련
    window.Elements.employmentUploadModal = document.getElementById('employmentVerificationModal');
    if (window.Elements.employmentUploadModal) { // 모달이 있을 때만 내부 요소 찾기
        window.Elements.employmentUploadModalClose = document.getElementById('employmentUploadModalClose');
    }
    window.Elements.modalMemberIdDisplay = document.getElementById('modalMemberIdDisplay');
    window.Elements.modalCompanyName = document.getElementById('modalCompanyName');
    window.Elements.modalEmploymentCertificateInput = document.getElementById('modalSelectedFileName'); // 파일명 표시 span
    window.Elements.modalEmploymentCertificateUpload = document.getElementById('modalCertDoc'); // 실제 파일 input

    // 회원 탈퇴 관련
    window.Elements.secessionProcessButton = document.getElementById('secessionProcessButton'); // '회원 탈퇴 진행' 버튼
    window.Elements.secessionConfirmModal = document.getElementById('secessionConfirmModal');
    if (window.Elements.secessionConfirmModal) {
        window.Elements.secessionModalClose = document.getElementById('secessionModalClose');
        window.Elements.secessionCancelButton = document.getElementById('secessionCancelButton');
        window.Elements.secessiondeleteButton = document.getElementById('secessiondeleteButton');
    } else {
        console.error("main.js - #secessionConfirmModal 요소를 찾을 수 없습니다! HTML 확인 필요.");
    }

    // --- 2. 헬퍼 함수 정의 ---

    // 비밀번호 인증 모달 닫기
    window.closePasswordModal = function() {
        if (window.Elements.passwordModal) {
            window.Elements.passwordModal.style.display = 'none';
            window.Elements.passwordModal.classList.add('hidden');
        }
        if (window.Elements.authMessage) {
            window.Elements.authMessage.textContent = '';
            window.Elements.authMessage.style.display = 'none';
            window.Elements.authMessage.classList.remove('error', 'success');
        }
        if (window.Elements.currentPasswordField) {
            window.Elements.currentPasswordField.value = '';
        }
        window.targetIdAfterAuth = null;
    };

    // 회원 탈퇴 확인 모달 닫기
    window.closeSecessionConfirmModal = function() {
        if (window.Elements.secessionConfirmModal) {
            window.Elements.secessionConfirmModal.style.display = 'none';
            window.Elements.secessionConfirmModal.classList.add('hidden');
        }
    };

    // 재직 증명서 업로드 모달 닫기
    window.closeEmploymentUploadModal = function() {
        const { employmentUploadModal, modalCompanyName, modalEmploymentCertificateInput, modalEmploymentCertificateUpload } = window.Elements;
        if (employmentUploadModal) {
            employmentUploadModal.style.display = 'none';
            employmentUploadModal.classList.add('hidden');
            // 닫을 때 입력 필드 초기화
            if (modalCompanyName) modalCompanyName.value = '';
            if (modalEmploymentCertificateInput) modalEmploymentCertificateInput.textContent = '선택된 파일 없음';
            if (modalEmploymentCertificateUpload) modalEmploymentCertificateUpload.value = '';
        }
    };


    // 특정 콘텐츠 섹션을 활성화하고 사이드바 링크를 업데이트합니다.
    window.activateContent = function(targetId) {
        if (!window.Elements.contentSections || window.Elements.contentSections.length === 0) {
            console.warn("경고: 'contentSections' 요소를 찾을 수 없습니다. 콘텐츠 활성화 로직이 작동하지 않을 수 있습니다.");
            return;
        }

        window.Elements.contentSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        if (window.Elements.sidebarLinks && window.Elements.sidebarLinks.length > 0) {
            window.Elements.sidebarLinks.forEach(link => {
                if (link.getAttribute('data-target') === targetId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    // URL 해시로부터 콘텐츠를 활성화합니다.
    window.activateContentFromHash = function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            window.activateContent(hash);
        } else {
            window.activateContent('mypage_mylogs_content'); // 기본 탭
        }
    };

    // 닉네임 유효성 메시지를 초기화합니다.
    window.resetNicknameValidationMessage = function() {
        const msgElem = window.Elements.nicknameValidationMessage;
        if (msgElem) {
            msgElem.style.display = 'none';
            msgElem.textContent = '';
            msgElem.classList.remove('error', 'success');
        }
    };

    // 닉네임 유효성을 검사합니다.
    window.validateNickname = function(enteredNickname) {
        if (enteredNickname.length === 0) return { isValid: false, errorMessage: '닉네임을 입력해주세요.' };
        if (enteredNickname.length < 2 || enteredNickname.length > 10) return { isValid: false, errorMessage: '닉네임은 2자 이상 10자 이하로 입력해주세요.' };
        if (!/^[가-힣a-zA-Z0-9]+$/.test(enteredNickname)) return { isValid: false, errorMessage: '닉네임은 한글, 영어, 숫자만 입력 가능합니다.' };
        if (/^[ㄱ-ㅎ]+$/.test(enteredNickname)) return { isValid: false, errorMessage: '초성만으로 이루어진 닉네임은 사용할 수 없습니다.' };
        if (/(.)\1\1/.test(enteredNickname)) return { isValid: false, errorMessage: '같은 문자를 3회 이상 연속하여 사용할 수 없습니다.' };
        return { isValid: true, errorMessage: '' };
    };

    // 이메일 유효성을 검사합니다.
    window.validateEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 이메일 메시지를 초기화합니다.
    window.resetEmailMessages = function() {
        const validationMsg = window.Elements.emailValidationMessage;
        const verificationMsg = window.Elements.emailVerificationMessage;

        if (validationMsg) {
            validationMsg.style.display = 'none';
            validationMsg.textContent = '';
            validationMsg.classList.remove('error', 'success');
        }
        if (verificationMsg) {
            verificationMsg.style.display = 'none';
            verificationMsg.textContent = '';
            verificationMsg.classList.remove('error', 'success');
        }
    };

    // --- 3. 모듈 초기화 함수 정의 ---

    // 사이드바 로직 설정 함수
    window.setupSidebarLogic = function() {
        const { sidebarLinks, passwordModal } = window.Elements;

        if (!sidebarLinks || sidebarLinks.length === 0) {
            console.warn("경고: 'sidebarLinks' 요소를 찾을 수 없습니다. 사이드바 로직이 작동하지 않을 수 있습니다.");
            return;
        }

        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('data-target');

                if (targetId === 'mypage_pwfix_content' || targetId === 'mypage_secession_content') {
                    if (passwordModal) {
                        passwordModal.style.display = 'flex';
                        passwordModal.classList.remove('hidden');
                        window.targetIdAfterAuth = targetId; // 인증 후 이동할 타겟 ID 저장
                    }
                    return;
                }

                window.location.hash = targetId;
                window.activateContent(targetId);

                sidebarLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            });
        });
    };

    // 비밀번호 인증 모달 관련 로직
    window.setupPasswordModalLogic = function() {
        const { passwordModal, authenticateButton, currentPasswordField, authMessage, closeModalButton } = window.Elements;

        if (!passwordModal || !authenticateButton || !currentPasswordField || !authMessage) {
            console.warn("경고: 비밀번호 인증 모달 관련 DOM 요소를 찾을 수 없습니다. HTML ID를 확인해주세요.");
            return;
        }

        if (closeModalButton) {
            closeModalButton.addEventListener('click', window.closePasswordModal);
        }

        passwordModal.addEventListener('click', function(event) {
            if (event.target === passwordModal) {
                window.closePasswordModal();
            }
        });

        authenticateButton.addEventListener('click', async function() {
            const password = currentPasswordField.value;
            const authMessageElement = authMessage;

            if (!password) {
                authMessageElement.textContent = '비밀번호를 입력해주세요.';
                authMessageElement.style.display = 'block';
                authMessageElement.classList.remove('success');
                authMessageElement.classList.add('error');
                return;
            }

            try {
                const response = await fetch('/api/mypage/checkPassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    authMessage.textContent = '비밀번호 인증 성공!';
                    authMessage.classList.remove('error');
                    authMessage.classList.add('success');
                    authMessage.style.display = 'block';

                    if (window.activateContent && window.targetIdAfterAuth) {
                        window.activateContent(window.targetIdAfterAuth);
                        window.location.hash = window.targetIdAfterAuth;
                    }
                    window.closePasswordModal();

                    if (window.targetIdAfterAuth === 'mypage_info_content') {
                        if (window.Elements.editButton && window.setInfoFormInitialState) {
                             // setInfoFormInitialState가 userInfo.js에 정의되어있다고 가정
                            window.setInfoFormInitialState(); // 폼 활성화 및 초기 상태 설정
                            window.Elements.editButton.click(); // '수정' 버튼 클릭 효과 (필요 시)
                        }
                    }

                } else {
                    authMessageElement.textContent = result.message || '비밀번호가 일치하지 않습니다.';
                    authMessageElement.classList.remove('success');
                    authMessageElement.classList.add('error');
                    authMessageElement.style.display = 'block';
                }

            } catch (error) {
                console.error('비밀번호 인증 중 오류 발생:', error);
                authMessageElement.textContent = '서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.';
                authMessageElement.classList.remove('success');
                authMessageElement.classList.add('error');
                authMessageElement.style.display = 'block';
            }
        });

        currentPasswordField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                authenticateButton.click();
            }
        });
    };


    // 회원 탈퇴 확인 모달 관련 로직
    window.setupSecessionConfirmModalLogic = function() {
        const { secessionConfirmModal, secessionModalClose, secessionCancelButton, secessiondeleteButton } = window.Elements;

        if (!secessionConfirmModal || !secessionModalClose || !secessionCancelButton || !secessiondeleteButton) {
            console.warn("경고: 회원 탈퇴 확인 모달 관련 DOM 요소를 찾을 수 없습니다. HTML ID를 확인해주세요.");
            return;
        }

        secessionModalClose.addEventListener('click', window.closeSecessionConfirmModal);
        secessionCancelButton.addEventListener('click', window.closeSecessionConfirmModal);
        secessionConfirmModal.addEventListener('click', function(event) {
            if (event.target === secessionConfirmModal) {
                window.closeSecessionConfirmModal();
            }
        });

        if (secessiondeleteButton) {
            secessiondeleteButton.addEventListener('click', async function() {
                try {
                    window.closeSecessionConfirmModal();

                    const secedeResponse = await fetch('/api/mypage/secede', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    });
                    if (!secedeResponse.ok) {
                        if (secedeResponse.status === 401) {
                            alert('세션이 만료되었거나 로그인이 필요합니다. 다시 로그인해주세요.');
                            window.location.href = '/login';
                            return;
                        }
                        throw new Error('회원 탈퇴 처리 실패: ' + secedeResponse.status);
                    }

                    const secedeData = await secedeResponse.json();

                    if (secedeData.success) {
                        alert('회원 탈퇴가 완료되었습니다.');
                        window.location.href = '/logout';
                    } else {
                        alert('회원 탈퇴 실패: ' + (secedeData.message || '알 수 없는 오류가 발생했습니다.'));
                    }

                } catch (error) {
                    console.error('회원 탈퇴 중 오류 발생:', error);
                    alert('회원 탈퇴 중 오류가 발생했습니다. 서버 통신을 확인해주세요.');
                }
            });
        }
    };

    // --- 4. 모든 Elements 할당이 끝난 후에 각 모듈의 초기화 함수 호출 ---
    window.setupSidebarLogic();
    window.setupPasswordModalLogic();
    window.setupSecessionConfirmModalLogic();
    // --- 5. 이벤트 리스너 등록 (DOMContentLoaded 안에서) ---

    // '회원 탈퇴 진행' 버튼 클릭 시 탈퇴 확인 모달 띄우기
    if (window.Elements.secessionProcessButton) {
        window.Elements.secessionProcessButton.addEventListener('click', function() {
            if (window.Elements.secessionConfirmModal) {
                window.Elements.secessionConfirmModal.style.display = 'flex';
                window.Elements.secessionConfirmModal.classList.remove('hidden');
            } else {
                console.error("main.js: 회원 탈퇴 확인 모달(secessionConfirmModal)을 찾을 수 없습니다.");
            }
        });
    }

    // URL 해시 변경 시 콘텐츠 활성화
    window.addEventListener('hashchange', window.activateContentFromHash);

    // 초기 페이지 로드 시 콘텐츠 활성화:
    const initialHash = window.location.hash.substring(1);
    if (!initialHash) {
        window.activateContent('mypage_mylogs_content'); // 기본 탭 ('내가 쓴 로그') 활성화
    } else {
        window.activateContentFromHash();
    }

    // '회원정보 수정' 탭이 활성화되어 있다면 초기 상태 설정
    if (!initialHash || initialHash === 'mypage_info_content') {
        if (window.Elements.infoForm && window.setInfoFormInitialState) {
            window.setInfoFormInitialState(); // userInfo.js에 정의되어 있다고 가정
        }
    }
});

// 기존 window.Elements 정의는 유지 (이 부분은 DOMContentLoaded 밖에 있어야 합니다.)
// Note: This block is largely redundant if all elements are consistently assigned within DOMContentLoaded.
// However, it serves as a good documentation of expected elements.
window.Elements = {
    sidebarLinks: null,
    contentSections: null,
    passwordModal: null,
    closeModalButton: null,
    authenticateButton: null,
    currentPasswordField: null,
    authMessage: null,
    infoForm: null,
    editButton: null,
    saveButton: null,
    employmentReauthButton: null,
    nicknameInput: null,
    checkNicknameButton: null,
    nicknameValidationMessage: null,
    sendEmailVerificationButton: null,
    emailInput: null,
    emailValidationMessage: null,
    emailVerificationMessage: null,
    verificationCodeSection: null,
    verificationCodeInput: null,
    checkVerificationCodeButton: null,
    employmentCertificateInput: null,
    submitFileButton: null,
    currentPasswordInput: null,
    newPassword: null,
    confirmNewPassword: null,
    passwordMatchError: null,
    currentPasswordError: null,
    changePasswordSubmitButton: null,
    newPasswordFormatError: null,
    employmentUploadModal: null,
    employmentUploadModalClose: null,
    modalMemberIdDisplay: null,
    modalCompanyName: null,
    modalEmploymentCertificateInput: null,
    modalEmploymentCertificateUpload: null,
    submitModalVerificationBtn: null,
    secessionProcessButton: null,
    secessionConfirmModal: null,
    secessionModalClose: null,
    secessionCancelButton: null,
    secessiondeleteButton: null,
    secessionConfirmButton: null, // This was present in your initial window.Elements declaration, so keeping it.
};