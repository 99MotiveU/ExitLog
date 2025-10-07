// js/core.js (통합된 파일)

document.addEventListener('DOMContentLoaded', function() {
	// --- 1. 모든 DOM 요소들을 window.Elements 객체에 할당 ---
	// window.Elements 객체를 DOMContentLoaded 안에서 초기화하고 할당합니다.
	window.Elements = {
		sidebarLinks: document.querySelectorAll('.sidebar-link'),
		contentSections: document.querySelectorAll('.mypage-content-section'),

		// 비밀번호 모달 관련
		passwordModal: document.getElementById('password-modal'),
		closeModalButton: document.getElementById('closePasswordModal'),
		authenticateButton: document.getElementById('authenticate-password'),
		currentPasswordField: document.getElementById('current-password'),
		authMessage: document.getElementById('auth-message'),

		// 회원정보 수정 폼 관련
		infoForm: document.querySelector('.info-form'),
		editButton: document.getElementById('editButton'),
		saveButton: document.getElementById('saveButton'),
		employmentReauthButton: document.getElementById('employmentReauthButton'),

		// 닉네임 관련
		nicknameInput: document.getElementById('nickname'),
		checkNicknameButton: document.getElementById('checkNicknameButton'),
		nicknameValidationMessage: document.getElementById('nicknameValidationMessage'),




		// 이메일 인증 관련
		emailInput: document.getElementById('email'),
		sendEmailVerificationButton: document.getElementById('sendEmailVerificationButton'),
		emailValidationMessage: document.getElementById('emailValidationMessage'),
		emailVerificationMessage: document.getElementById('emailVerificationMessage'),
		verificationCodeSection: document.getElementById('verificationCodeSection'),
		verificationCodeInput: document.getElementById('verificationCodeInput'),
		checkVerificationCodeButton: document.getElementById('checkVerificationCodeButton'),
		emailTimer: document.getElementById('emailTimer'), // 이미 이렇게 되어있다고 하셨으므로 유지
		authCodeValidationMessage: document.getElementById('authCodeValidationMessage'), // ★★★ HTML에 추가 후 이 부분을 정확히 가져오도록 함 ★★★

		// 재직 증명서 관련 (기존 코드에서 사용하던 요소)
		employmentCertificateInput: document.getElementById('employmentCertificate'), // mypage_info_content 섹션의 input (선택된 파일 없음 표시)
		submitEmploymentCertBtn: document.getElementById('submitEmploymentCertBtn'), // HTML에 있는 ID로 변경

		// 비밀번호 변경 폼 관련
		currentPasswordInput: document.getElementById('currentPasswordInput'),
		newPassword: document.getElementById('newPassword'), // HTML ID와 일치
		confirmNewPassword: document.getElementById('confirmNewPassword'), // HTML ID와 일치
		passwordMatchError: document.getElementById('passwordMatchError'),
		currentPasswordError: document.getElementById('currentPasswordError'),
		changePasswordSubmitButton: document.getElementById('changePasswordSubmitButton'),
		newPasswordFormatError: document.getElementById('newPasswordFormatError'),

		// 재직 증명서 업로드 모달 관련
		employmentUploadModal: document.getElementById('employmentVerificationModal'),
		employmentUploadModalClose: document.getElementById('employmentUploadModalClose'),
		modalCompanyName: document.getElementById('modalCompanyName'),
		modalEmploymentCertificateInput: document.getElementById('modalSelectedFileName'),
		modalSelectFileBtn: document.getElementById('modalSelectFileBtn'),
		submitModalVerificationBtn: document.getElementById('submitModalVerificationBtn'),


		emailTimer: document.getElementById('emailTimer'),
		authCodeValidationMessage: document.getElementById('authCodeValidationMessage'),
		currentEmploymentStatus: null
	};

	if (window.Elements.employmentCertificateInput) {
		window.Elements.employmentCertificateInput.setAttribute('readonly', 'true');
	}



	// 요소들이 null일 경우에 대한 경고 로그 (선택 사항)
	Object.keys(window.Elements).forEach(key => {
		const element = window.Elements[key];
		if (element === null && key !== 'secessionConfirmButton') {
			console.warn(`경고: "${key}" 요소를 찾을 수 없습니다. HTML ID/클래스명을 확인해주세요.`);
		}
	});

	// --- 2. 헬퍼 함수 정의 ---

	// 비밀번호 인증 모달 닫기
	window.closePasswordModal = function() {
		const { passwordModal, authMessage, currentPasswordField } = window.Elements;
		if (passwordModal) {
			passwordModal.style.display = 'none';
			passwordModal.classList.add('hidden');
		}
		if (authMessage) {
			authMessage.textContent = '';
			authMessage.style.display = 'none';
			authMessage.classList.remove('error', 'success');
		}
		if (currentPasswordField) {
			currentPasswordField.value = '';
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
			if (modalCompanyName) modalCompanyName.value = '';
			if (modalEmploymentCertificateInput) modalEmploymentCertificateInput.textContent = '선택된 파일 없음';
			if (modalEmploymentCertificateUpload) modalEmploymentCertificateUpload.value = '';
		}
		
	};

	// 제출 클릭 이벤트


	// 특정 콘텐츠 섹션을 활성화하고 사이드바 링크를 업데이트합니다.
	window.activateContent = function(targetId) {
		const { contentSections, sidebarLinks } = window.Elements;

		if (!contentSections || contentSections.length === 0) {
			console.warn("경고: 'contentSections' 요소를 찾을 수 없습니다. 콘텐츠 활성화 로직이 작동하지 않을 수 있습니다.");
			return;
		}

		contentSections.forEach(section => {
			section.classList.remove('active');
		});
		const targetSection = document.getElementById(targetId);
		if (targetSection) {
			targetSection.classList.add('active');
		}

		if (sidebarLinks && sidebarLinks.length > 0) {
			sidebarLinks.forEach(link => {
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
			window.scrollTo(0, 0);
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
		if (enteredNickname.length < 2 || enteredNickname.length > 15) return { isValid: false, errorMessage: '닉네임은 2자 이상 15자 이하로 입력해주세요.' };
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
		if (window.Elements.emailValidationMessage) {
			window.Elements.emailValidationMessage.style.display = 'none';
		}
		if (window.Elements.emailVerificationMessage) {
			window.Elements.emailVerificationMessage.style.display = 'none';
		}
		if (window.Elements.authCodeValidationMessage) {
			window.Elements.authCodeValidationMessage.style.display = 'none';
		}
		if (window.Elements.emailTimer) {
			window.Elements.emailTimer.style.display = 'none';
		}

		// ★★★ emailInput 사용 부분 수정 ★★★
		if (window.Elements.emailInput) { // emailInput 대신 window.Elements.emailInput 사용
			window.Elements.emailInput.removeAttribute('readonly'); // core.js:196 라인이 이 부분일 가능성이 높음
		}
		if (window.Elements.sendEmailVerificationButton) { // sendEmailVerificationButton도 동일하게 접근
			window.Elements.sendEmailVerificationButton.removeAttribute('disabled');
		}
	};
	// --- 3. 모듈 초기화 함수 정의 (userInfo.js의 내용 포함) ---

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

				// 비밀번호 설정 또는 탈퇴하기 탭을 클릭했을 때만 비밀번호 인증 모달 띄우기
				if (targetId === 'mypage_pwfix_content' || targetId === 'mypage_secession_content') {
					if (passwordModal) {
						passwordModal.style.display = 'flex';
						passwordModal.classList.remove('hidden');
						window.targetIdAfterAuth = targetId; // 인증 후 이동할 타겟 ID 저장
						// 이 경우, 모달이 뜨면 해당 콘텐츠 섹션은 아직 활성화하지 않고
						// 인증 성공 후에 window.activateContent(window.targetIdAfterAuth)가 호출될 것입니다.
					}
				} else {
					// 비밀번호 설정/탈퇴하기 탭이 아닌 경우에만 hash 변경 및 콘텐츠 활성화
					window.location.hash = targetId;
					window.activateContent(targetId);
				}

				// 활성 링크 업데이트
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
						window.activateContent(window.targetIdAfterAuth); // 저장된 ID로 해당 섹션 활성화
						window.location.hash = window.targetIdAfterAuth; // URL 해시 업데이트
					}
					window.closePasswordModal();

					// 추가적인 탭별 동작 (회원정보 수정 폼 활성화 등)
					if (window.targetIdAfterAuth === 'mypage_info_content') {
						window.setInfoFormInitialState(); // 폼을 초기 상태로 설정
						if (window.Elements.editButton) {
							window.Elements.editButton.click(); // '수정' 버튼 클릭 효과
						}
					} else if (window.targetIdAfterAuth === 'mypage_pwfix_content') {
						// 비밀번호 변경 탭으로 이동 후 추가 동작
						// 예: 비밀번호 변경 필드 활성화 로직
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
	window.Elements.modalSelectFileBtn = document.getElementById('modalSelectFileBtn'); // 파일 선택 버튼 (HTML ID: modalSelectFileBtn)
	window.Elements.modalEmploymentCertificateUpload = document.getElementById('modalCertDoc');
	window.Elements.submitModalVerificationBtn = document.getElementById('submitModalVerificationBtn');

	console.log("--- 재직 증명서 업로드 모달 관련 요소 할당 확인 ---");
	console.log("employmentUploadModal:", window.Elements.employmentUploadModal);
	console.log("modalCompanyName:", window.Elements.modalCompanyName);
	console.log("modalEmploymentCertificateInput:", window.Elements.modalEmploymentCertificateInput);
	console.log("modalEmploymentCertificateUpload (input type=file):", window.Elements.modalEmploymentCertificateUpload);
	console.log("modalSelectFileBtn (파일 선택 버튼):", window.Elements.modalSelectFileBtn);
	console.log("submitModalVerificationBtn (제출 버튼):", window.Elements.submitModalVerificationBtn);
	console.log("--------------------------------------------------");

	// 재직 증명서 업로드 모달 관련 로직
	window.setupEmploymentUploadModalLogic = function() {
		const {
			employmentUploadModal,
			modalCompanyName,
			modalEmploymentCertificateInput,
			modalEmploymentCertificateUpload,
			modalSelectFileBtn,
			submitModalVerificationBtn,
			employmentUploadModalClose
		} = window.Elements;

		if (!employmentUploadModal || !modalCompanyName ||
			!modalEmploymentCertificateInput || !modalEmploymentCertificateUpload ||
			!modalSelectFileBtn || !submitModalVerificationBtn) {
			console.warn("경고: 재직 증명서 업로드 모달 관련 DOM 요소를 찾을 수 없습니다. HTML ID를 확인해주세요.");
			return;
		}

		if (employmentUploadModalClose) {
			employmentUploadModalClose.addEventListener('click', window.closeEmploymentUploadModal);
		}

		employmentUploadModal.addEventListener('click', function(event) {
			if (event.target === employmentUploadModal) {
				window.closeEmploymentUploadModal();
			}
		});

		modalSelectFileBtn.addEventListener('click', function() {
			modalEmploymentCertificateUpload.click();
		});

		modalEmploymentCertificateUpload.addEventListener('change', function() {
			if (this.files) {
				const fileName = this.files[0].name;
				modalEmploymentCertificateInput.textContent = fileName;
			} else {
				modalEmploymentCertificateInput.textContent = '선택된 파일 없음';
			}
		});
		//재직 인증서 db 넣기 
		submitModalVerificationBtn.addEventListener('click', async function() {
			if (window.Elements.currentEmploymentStatus === 'PENDING') {
				alert('이미 제출된 재직 증명서가 있습니다. 현재 관리자가 확인 중입니다.');
				window.closeEmploymentUploadModal();
				return; // 함수 실행 중단
			}


			const companyName = modalCompanyName.value;
			const uploadedFile = modalEmploymentCertificateUpload.files[0];

			// ⭐ 재직증명서 파일명 표시 input 요소 가져오기 ⭐

			if (!companyName || !uploadedFile) {
				alert('회사명과 인증 서류를 모두 입력해주세요.');
				return;
			}

			const formData = new FormData();
			formData.append('companyName', companyName);
			formData.append('certificateFile', uploadedFile); // 'certificateFile'로 올바르게 사용 중

			try {
				const response = await fetch('/api/mypage/upload', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					const errorData = await response.json(); // 오류 응답도 JSON으로 파싱
					alert(errorData.message || '재직 증명서 제출에 실패했습니다.');
					return; // 오류 발생 시 여기서 함수 종료
				}

				const data = await response.json(); // 성공 응답 본문을 JSON으로 파싱

				if (data.success === 'true') { // 'true'는 문자열로 오는 경우를 대비
					const fileNameToDisplay = data.storedFileName || uploadedFile.name;
					localStorage.setItem('employmentCertificateFileName', fileNameToDisplay);
					localStorage.setItem('employmentCertificateStatus', 'PENDING'); // 상태도 함께 저장


					window.closeEmploymentUploadModal();
					alert(data.message); // "재직 증명서가 제출되었습니다." 알림
					window.location.reload();
				} else {
					alert(data.message || '재직 증명서 제출에 실패했습니다.');
				}
			} catch (error) {
				console.error('재직 증명서 제출 중 오류 발생:', error);
				alert('재직 증명서 제출 중 오류가 발생했습니다. 서버 통신을 확인해주세요.');
			}
		});
	};



	// 회원정보 수정 폼 관련 로직
	window.setupUserInfoFormLogic = function() {
		const {
			infoForm, editButton, saveButton,
			checkNicknameButton, sendEmailVerificationButton, checkVerificationCodeButton,
			employmentCertificateInput,
			submitEmploymentCertBtn,
			employmentReauthButton,
			nicknameInput, nicknameValidationMessage,
			emailInput, emailValidationMessage, emailVerificationMessage, verificationCodeSection, verificationCodeInput,
			emailTimer,
			authCodeValidationMessage,
			currentPasswordInput,
			newPassword,
			confirmNewPassword,
			passwordMatchError,
			changePasswordSubmitButton, currentPasswordError,
			newPasswordFormatError
		} = window.Elements;

		if (!infoForm) return;

		// --- 이메일 관련 변수 추가 및 재할당 (window.Elements에서 가져옴) ---
		const emailTimerElement = document.getElementById('emailTimer');
		let emailTimerInterval; // 타이머 인터벌 변수
		let verifiedNewEmail = null; // 인증 성공 시 임시로 이메일을 저장할 변수

		/**
		 * saveButton의 활성화 상태와 색상을 업데이트하는 함수
		 */
		window.updateSaveButtonAppearance = function() {
			if (saveButton) {
				const {
					isNicknameChangedAndValid,
					isEmailVerifiedAndChanged,
					isEmploymentInfoSubmitted
				} = window.Elements;

				// 닉네임 변경 및 유효성 검사 성공 || 이메일 변경 및 인증 성공 || 재직 증명서 제출 성공
				if (isNicknameChangedAndValid || isEmailVerifiedAndChanged || isEmploymentInfoSubmitted) {
					saveButton.removeAttribute('disabled');
					saveButton.classList.remove('btn-gray');
					saveButton.classList.add('btn-blue');
				} else {
					saveButton.setAttribute('disabled', 'true');
					saveButton.classList.remove('btn-blue');
					saveButton.classList.add('btn-gray');
				}
			}
		};
		if (typeof window.setupEmploymentUploadModalLogic === 'function') {
			window.setupEmploymentUploadModalLogic();
			console.log("setupEmploymentUploadModalLogic 호출 완료");
		} else {
			console.error("setupEmploymentUploadModalLogic 함수를 찾을 수 없습니다.");
		}
		function startEmailTimer(duration) {
			let timer = duration;
			emailTimerElement.style.display = 'block';
			sendEmailVerificationButton.setAttribute('disabled', 'true'); // 발송 버튼 비활성화
			sendEmailVerificationButton.textContent = '재전송 대기 중...';
			window.Elements.isNicknameChangedAndValid = false;
			window.Elements.isEmailVerifiedAndChanged = false;
			window.Elements.isEmploymentInfoSubmitted = false;
			window.Elements.initialNicknameValue = nicknameInput ? nicknameInput.value : ''; // 초기 닉네임 값 저장
			window.Elements.initialEmailValue = emailInput ? emailInput.value : ''; // 초기 이메일 값 저장

			emailTimerInterval = setInterval(() => {
				const minutes = parseInt(timer / 60, 10);
				const seconds = parseInt(timer % 60, 10);

				if (emailTimer) {
					emailTimer.textContent = `인증 코드 유효 시간: ${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
				}

				if (--timer < 0) {
					clearInterval(emailTimerInterval);
					if (emailTimer) { // ★★★ emailTimerElement 대신 emailTimer 사용 ★★★
						emailTimer.textContent = '인증 코드 유효 시간이 만료되었습니다. 재전송해주세요.';
						emailTimer.classList.remove('active');
					}
					if (sendEmailVerificationButton) {
						sendEmailVerificationButton.removeAttribute('disabled');
						sendEmailVerificationButton.textContent = '이메일 인증 재전송';
					}
					if (verificationCodeInput) {
						verificationCodeInput.value = '';
						verificationCodeInput.setAttribute('readonly', 'true');
					}
					if (checkVerificationCodeButton) {
						checkVerificationCodeButton.setAttribute('disabled', 'true');
					}
					if (verificationCodeSection) {
						verificationCodeSection.style.display = 'none';
					}
				}
			}, 1000);
		}

		window.setInfoFormInitialState = function() { // 전역 함수로 노출
			infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
				input.setAttribute('readonly', 'true');
			});

			// 관련 버튼들 disabled 상태로 초기화
			if (checkNicknameButton) {
                checkNicknameButton.setAttribute('disabled', 'true');
                checkNicknameButton.classList.add('btn-gray');
                checkNicknameButton.classList.remove('btn-blue');
            }
            if (sendEmailVerificationButton) {
                sendEmailVerificationButton.setAttribute('disabled', 'true');
                sendEmailVerificationButton.textContent = '이메일 인증'; // 텍스트 초기화
                sendEmailVerificationButton.classList.add('btn-gray');
                sendEmailVerificationButton.classList.remove('btn-blue');
            }
            if (checkVerificationCodeButton) {
                checkVerificationCodeButton.setAttribute('disabled', 'true');
            }
            if (employmentReauthButton) {
                employmentReauthButton.setAttribute('disabled', 'true');
                employmentReauthButton.classList.add('btn-gray');
                employmentReauthButton.classList.remove('btn-blue');
            }
            if (submitEmploymentCertBtn) {
                submitEmploymentCertBtn.setAttribute('disabled', 'true'); // 파일 제출 버튼도 초기에는 비활성화
                submitEmploymentCertBtn.classList.add('btn-gray');
                submitEmploymentCertBtn.classList.remove('btn-blue');
            }
			if (saveButton) saveButton.setAttribute('disabled', 'true');
			window.updateSaveButtonAppearance(); // 초기 상태에 맞게 버튼 외관 업데이트

			if (editButton) {
				editButton.removeAttribute('disabled');
				editButton.classList.remove('btn-gray');
				editButton.classList.add('btn-blue');
			}
			window.Elements.isNicknameChangedAndValid = false;
			window.Elements.isEmailVerifiedAndChanged = false; // 이메일 인증 상태 플래그 초기화
			window.Elements.isEmploymentInfoSubmitted = false;
			window.Elements.initialNicknameValue = nicknameInput ? nicknameInput.value.trim() : '';
			window.Elements.initialEmailValue = emailInput ? emailInput.value.trim() : '';
			window.updateSaveButtonAppearance(); // 초기 상태에 맞게 버튼 외관 업데이트

			window.resetNicknameValidationMessage();
			window.resetEmailMessages();
			if (verificationCodeSection) {
				verificationCodeSection.style.display = 'none';
			}
			clearInterval(emailTimerInterval);
			verifiedNewEmail = null; // 초기 상태에서는 인증된 이메일 없음
		};

		// 1. 모든 입력 필드 초기 상태 설정
		// 회사명(companyName)과 재직 증명서(employmentCertificate) 필드를 제외하고 readonly 설정
		infoForm.querySelectorAll('input.form-label-input-nick, input.form-label-input').forEach(input => {
			if (input.id !== 'companyName' && input.id !== 'employmentCertificate') {
				input.setAttribute('readonly', 'true');
			}
		});

		// 2. 버튼 활성화/비활성화 및 클래스 설정
		// '저장' 버튼은 항상 비활성화로 시작
		if (saveButton) {
			saveButton.setAttribute('disabled', 'true');
			saveButton.classList.remove('btn-blue'); // 혹시 모를 파란색 제거
			saveButton.classList.add('btn-gray');    // 회색으로 설정
		}

		// --- 여기에 submitEmploymentCertBtn 클릭 이벤트 추가 ---
		if (submitEmploymentCertBtn) {
			submitEmploymentCertBtn.addEventListener('click', function() {
				if (window.Elements.currentEmploymentStatus === 'PENDING') {
					alert('이미 제출된 재직 증명서가 있습니다. 현재 관리자가 확인 중입니다.');
					return; // 모달을 띄우지 않고 함수 실행 중단
				}

				// PENDING 상태가 아니면 모달을 띄웁니다.
				// 이 버튼은 '수정' 버튼 클릭 시 비활성화가 해제되므로, disabled 상태 체크는 유지합니다.
				if (!this.hasAttribute('disabled') && window.Elements.employmentUploadModal) {
					window.Elements.employmentUploadModal.style.display = 'flex';
					window.Elements.employmentUploadModal.classList.remove('hidden');
					// 모달 열 때 초기화 로직도 함께 추가 (선택 사항, setupEmploymentUploadModalLogic에도 있음)
					if (window.Elements.modalCompanyName) window.Elements.modalCompanyName.value = '';
					if (window.Elements.modalEmploymentCertificateInput) window.Elements.modalEmploymentCertificateInput.textContent = '선택된 파일 없음';
					if (window.Elements.modalEmploymentCertificateUpload) window.Elements.modalEmploymentCertificateUpload.value = ''; // input type="file"의 값 초기화
				}
			});
		}

		// '수정' 버튼은 항상 활성화로 시작
		if (editButton) {
			editButton.removeAttribute('disabled');
			editButton.classList.remove('btn-gray'); // 회색 클래스 제거
			editButton.classList.add('btn-blue');    // 파란색 클래스 추가
		}

		// 다른 관련 버튼들 비활성화
		if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
		if (sendEmailVerificationButton) {
			sendEmailVerificationButton.setAttribute('disabled', 'true');
			sendEmailVerificationButton.textContent = '이메일 인증'; // 초기 텍스트로 복원
		}
		if (submitEmploymentCertBtn) submitEmploymentCertBtn.setAttribute('disabled', 'true');
		if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true');
		if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');


		// 3. 메시지 및 섹션 초기화
		window.resetNicknameValidationMessage();
		window.resetEmailMessages(); // 이메일 관련 메시지 초기화
		if (verificationCodeSection) {
			verificationCodeSection.style.display = 'none'; // 인증 코드 섹션 숨김
		}

		// 4. 타이머 초기화
		if (emailTimerInterval) {
			clearInterval(emailTimerInterval); // 실행 중인 타이머 중지
		}
		if (emailTimer) { // 타이머 표시 요소도 숨김
			emailTimer.style.display = 'none';
			emailTimer.textContent = '';
		}

		// 5. 유효성 상태 변수 초기화 (초기화 방식 setInfoFormInitialState와 동일)
		window.Elements.isNicknameChangedAndValid = false;
		window.Elements.isEmailVerifiedAndChanged = false; // 이메일 인증 상태 플래그 초기화
		window.Elements.isEmploymentInfoSubmitted = false;

		window.Elements.initialNicknameValue = nicknameInput ? nicknameInput.value.trim() : '';
		window.Elements.initialEmailValue = emailInput ? emailInput.value.trim() : '';

		window.updateSaveButtonAppearance();

		// 회원정보 수정 '수정' 버튼 클릭 이벤트
		if (editButton) {
			editButton.addEventListener('click', function() {
				infoForm.querySelectorAll('input.form-label-input-nick, input.form-label-input').forEach(input => {
                    if (input.id !== 'companyName' && input.id !== 'employmentCertificate') {
                        input.removeAttribute('readonly'); // readonly 속성 제거
                    }

				});

				// 버튼 활성화
				if (window.Elements.submitEmploymentCertBtn) {
                    window.Elements.submitEmploymentCertBtn.removeAttribute('disabled');
                    window.Elements.submitEmploymentCertBtn.classList.remove('btn-gray');
                    window.Elements.submitEmploymentCertBtn.classList.add('btn-blue');
                }
                if (window.Elements.employmentReauthButton) {
                    window.Elements.employmentReauthButton.removeAttribute('disabled');
                    window.Elements.employmentReauthButton.classList.remove('btn-gray');
                    window.Elements.employmentReauthButton.classList.add('btn-blue');
                }
                if (window.Elements.checkNicknameButton) {
                    window.Elements.checkNicknameButton.removeAttribute('disabled');
                    window.Elements.checkNicknameButton.classList.remove('btn-gray');
                    window.Elements.checkNicknameButton.classList.add('btn-blue');
                }
				// 이메일 필드가 비어있지 않고 유효하면 발송 버튼 활성화
				if (sendEmailVerificationButton && emailInput && emailInput.value.trim() && window.validateEmail(emailInput.value.trim())) {
					sendEmailVerificationButton.removeAttribute('disabled');
					sendEmailVerificationButton.textContent = '이메일 인증';
					sendEmailVerificationButton.classList.remove('btn-gray');
					sendEmailVerificationButton.classList.add('btn-blue');
				} else if (sendEmailVerificationButton) {
					sendEmailVerificationButton.setAttribute('disabled', 'true');
					sendEmailVerificationButton.textContent = '이메일 인증';
					sendEmailVerificationButton.classList.add('btn-gray');
					sendEmailVerificationButton.classList.remove('btn-blue');
				}

				// 인증번호 관련 버튼 및 섹션은 '이메일 인증' 버튼 클릭 후 활성화
				if (checkVerificationCodeButton) {
                    checkVerificationCodeButton.setAttribute('disabled', 'true');
                }
				this.setAttribute('disabled', 'true'); // '수정' 버튼 비활성화

				window.Elements.isNicknameChangedAndValid = false;
				window.Elements.isEmailVerifiedAndChanged = false; // 이메일 인증 상태 플래그 초기화
				window.Elements.isEmploymentInfoSubmitted = false;
				window.updateSaveButtonAppearance();

				window.resetNicknameValidationMessage();
				window.resetEmailMessages(); // 전역 resetEmailMessages 사용
				if (verificationCodeSection) {
					verificationCodeSection.style.display = 'none';
				}
				clearInterval(emailTimerInterval); // 타이머 초기화
				verifiedNewEmail = null; // 인증된 이메일 초기화 (수정 모드 진입 시)
			});
		}

		// 닉네임 중복 확인 로직
		if (checkNicknameButton) {
			checkNicknameButton.addEventListener('click', function() {
				if (this.hasAttribute('disabled')) return;

				const enteredNickname = nicknameInput.value.trim();
				window.resetNicknameValidationMessage(); // window.resetNicknameValidationMessage 호출

				// 1. 클라이언트 측 유효성 검사 (기존 로직 유지)
				const { isValid, errorMessage } = window.validateNickname(enteredNickname);
				if (!isValid) {
					nicknameValidationMessage.textContent = errorMessage;
					nicknameValidationMessage.classList.add('error');
					nicknameValidationMessage.style.display = 'block';
					return;
				}

				// 2. 서버에 닉네임 중복 확인 요청 (Fetch API 사용)
				fetch('/api/checkNickname', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ nickname: enteredNickname })
				})
					.then(response => {
						if (!response.ok) {
							console.error('서버 응답 오류:', response.status, response.statusText);
							throw new Error('서버 오류가 발생했습니다. 다시 시도해주세요.');
						}
						return response.json();
					})
					.then(data => {
						if (data.isTaken) {
							nicknameValidationMessage.textContent = '이미 등록된 닉네임입니다.';
							nicknameValidationMessage.classList.add('error');
							nicknameValidationMessage.classList.remove('success');
						} else {
							nicknameValidationMessage.textContent = '사용 가능한 닉네임입니다.';
							nicknameValidationMessage.classList.add('success');
							nicknameValidationMessage.classList.remove('error');
							window.Elements.isNicknameChangedAndValid = true;
							window.updateSaveButtonAppearance();
						}
						nicknameValidationMessage.style.display = 'block';
					})
					.catch(error => {
						console.error('닉네임 확인 중 오류 발생:', error);
						nicknameValidationMessage.textContent = '닉네임 확인 중 알 수 없는 오류가 발생했습니다.';
						nicknameValidationMessage.classList.add('error');
						nicknameValidationMessage.style.display = 'block';
					});
			});
		}

		// 이메일 입력 필드 변경 시 로직 (수정된 부분)
		if (emailInput) {
			emailInput.addEventListener('input', function() {
				window.resetEmailMessages(); // 전역 resetEmailMessages 사용
				clearInterval(emailTimerInterval); // 타이머 초기화 (이메일 수정 시 기존 타이머 중지)

				// 이메일 주소 변경 시, '이메일 인증' 버튼 다시 활성화
				// (readonly 속성 제거는 이미 인증된 상태에서 변경하려고 할 때 필요)
				if (sendEmailVerificationButton) { // 버튼 존재 여부 확인
					const emailValue = this.value.trim();
					if (emailValue.length > 0 && window.validateEmail(emailValue)) {
						sendEmailVerificationButton.removeAttribute('disabled');
						sendEmailVerificationButton.textContent = '이메일 인증'; // 텍스트 초기화
					} else {
						sendEmailVerificationButton.setAttribute('disabled', 'true');
						sendEmailVerificationButton.textContent = '이메일 인증'; // 텍스트 초기화
					}
				}
				// 인증번호 입력 섹션 숨김 및 필드 초기화
				if (verificationCodeSection) {
					verificationCodeSection.style.display = 'none';
				}
				if (verificationCodeInput) {
					verificationCodeInput.value = '';
					verificationCodeInput.removeAttribute('readonly'); // 수정 가능하도록
				}
				if (checkVerificationCodeButton) {
					checkVerificationCodeButton.setAttribute('disabled', 'true'); // 버튼 비활성화
				}
				if (saveButton) {
					saveButton.setAttribute('disabled', 'true'); // 저장 버튼 비활성화
				}
				// 이메일 필드 변경 시, 인증 상태 플래그도 초기화해야 함
				window.Elements.isEmailVerifiedAndChanged = false; // 
				verifiedNewEmail = null; // 
				window.updateSaveButtonAppearance(); // 
			});
			emailInput.addEventListener('blur', function() {
				const email = this.value.trim();
				if (email.length > 0 && !window.validateEmail(email)) {
					emailValidationMessage.textContent = '유효한 이메일 형식이 아닙니다.';
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
					if (sendEmailVerificationButton) sendEmailVerificationButton.setAttribute('disabled', 'true');
				} else if (email.length > 0) {
					if (sendEmailVerificationButton) sendEmailVerificationButton.removeAttribute('disabled');
				} else {
					if (sendEmailVerificationButton) sendEmailVerificationButton.setAttribute('disabled', 'true');
				}
				// 이메일 유효성 검증 실패 시, 인증 상태 플래그 초기화
				window.Elements.isEmailVerifiedAndChanged = false; // ★★★ 추가: 이메일 유효성 실패 시 인증 상태 초기화 ★★★
				verifiedNewEmail = null; // ★★★ 추가: 임시 저장된 인증 이메일도 초기화 ★★★
				window.updateSaveButtonAppearance(); // ★★★ 추가: saveButton 상태 업데이트 ★★★
			});
		}

		// 이메일 인증 메일 발송 로직 (수정된 부분)
		if (sendEmailVerificationButton) {
			sendEmailVerificationButton.addEventListener('click', async function() {
				if (this.hasAttribute('disabled')) return;

				const currentEmail = emailInput.value.trim();
				window.resetEmailMessages(); // 전역 resetEmailMessages 사용

				if (!currentEmail) {
					emailValidationMessage.textContent = '이메일을 입력해주세요.';
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
					return;
				}
				if (!window.validateEmail(currentEmail)) {
					emailValidationMessage.textContent = '유효한 이메일 형식이 아닙니다.';
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
					return;
				}

				// --- 백엔드 API 호출 시작 ---
				try {
					// UI 피드백을 먼저 제공 (네트워크 요청 시작 전)
					this.setAttribute('disabled', 'true');
					this.textContent = '발송 중...';
					emailInput.setAttribute('readonly', 'true'); // 이메일 입력 필드 잠금

					const response = await fetch('/api/mypage/send-email-auth-code', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email: currentEmail })
					});

					const data = await response.json();

					if (response.ok && data.success) {
						emailVerificationMessage.textContent = data.message || '인증 메일이 발송되었습니다. 인증번호를 입력해주세요.';
						emailVerificationMessage.classList.remove('error');
						emailVerificationMessage.classList.add('success');
						emailVerificationMessage.style.display = 'block';

						if (verificationCodeSection) {
							verificationCodeSection.style.display = 'block'; // 일단 block으로 유지
						}
						if (verificationCodeInput) {
							verificationCodeInput.value = '';
							verificationCodeInput.focus();
							verificationCodeInput.removeAttribute('readonly'); // 인증번호 입력 가능하게
						}
						if (checkVerificationCodeButton) {
							checkVerificationCodeButton.removeAttribute('disabled'); // 확인 버튼 활성화
						}

						// 타이머 시작 (5분 = 300초)
						startEmailTimer(300);

					} else {
						emailInput.removeAttribute('readonly'); // 발송 실패 시 이메일 입력 필드 다시 활성화
						this.removeAttribute('disabled'); // 버튼 다시 활성화
						this.textContent = '이메일 인증'; // 텍스트 초기화
						emailValidationMessage.textContent = data.message || '인증번호 발송에 실패했습니다.';
						emailValidationMessage.classList.remove('success');
						emailValidationMessage.classList.add('error');
						emailValidationMessage.style.display = 'block';
					}
				} catch (error) {
					console.error('이메일 인증 메일 발송 중 오류 발생:', error);
					emailInput.removeAttribute('readonly'); // 오류 시 이메일 입력 필드 다시 활성화
					this.removeAttribute('disabled'); // 버튼 다시 활성화
					this.textContent = '이메일 인증 재전송'; // 텍스트 초기화
					emailValidationMessage.textContent = '서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.';
					emailValidationMessage.classList.remove('success');
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
				}
				// --- 백엔드 API 호출 끝 ---
			});
		}

		// 이메일 인증 코드 확인 로직 (바로 DB 업데이트
		if (checkVerificationCodeButton) {
			checkVerificationCodeButton.addEventListener('click', async function() {
				if (this.hasAttribute('disabled')) return;

				const enteredCode = verificationCodeInput.value.trim();
				const emailToVerify = emailInput.value.trim();

				window.Elements.authCodeValidationMessage.style.display = 'none';
				window.Elements.emailVerificationMessage.style.display = 'none';

				if (!enteredCode) {
					window.Elements.authCodeValidationMessage.textContent = '인증번호를 입력해주세요.';
					window.Elements.authCodeValidationMessage.classList.add('error');
					window.Elements.authCodeValidationMessage.style.display = 'block';
					return;
				}

				try {
					const response = await fetch('/api/mypage/verify-email-auth-code', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email: emailToVerify, authCode: enteredCode })
					});

					const data = await response.json();

					if (response.ok && data.success) { // 서버에서 인증 성공 응답을 받은 경우
						alert('이메일이 변경되었습니다.');
						clearInterval(emailTimerInterval);
						window.Elements.emailTimer.style.display = 'none';

						window.Elements.emailVerificationMessage.textContent = data.message || '이메일 인증 및 업데이트가 완료되었습니다!';
						window.Elements.emailVerificationMessage.classList.remove('error');
						window.Elements.emailVerificationMessage.classList.add('success');
						window.Elements.emailVerificationMessage.style.display = 'block';

						// 성공 시 필드 및 버튼 상태 업데이트
						window.Elements.emailInput.setAttribute('readonly', 'true');
						window.Elements.sendEmailVerificationButton.setAttribute('disabled', 'true');
						window.Elements.sendEmailVerificationButton.textContent = '인증 완료';
						window.Elements.verificationCodeInput.setAttribute('readonly', 'true');
						this.setAttribute('disabled', 'true'); // 인증번호 확인 버튼 비활성화

						// ★★★ 이메일 인증이 성공했으니, saveButton 활성화 플래그를 true로 설정 ★★★
						// (이메일 변경 여부와 상관없이 인증 성공 시 활성화)
						window.Elements.initialEmailValue = emailToVerify; // 업데이트된 이메일로 초기 이메일 갱신
						
						window.location.reload();
						window.updateSaveButtonAppearance(); // ★★★ saveButton 상태 업데이트 ★★★

						setTimeout(() => {
							if (window.Elements.verificationCodeSection) {
								window.Elements.verificationCodeCodeSection.style.display = 'none'; // 오타 수정: verificationCodeSection
							}
						}, 1000);

					} else { // 서버에서 인증 실패 응답을 받은 경우
						window.Elements.authCodeValidationMessage.textContent = data.message || '인증번호가 일치하지 않거나 업데이트에 실패했습니다.';
						window.Elements.authCodeValidationMessage.classList.remove('success');
						window.Elements.authCodeValidationMessage.classList.add('error');
						window.Elements.authCodeValidationMessage.style.display = 'block';
						window.Elements.verificationCodeInput.value = '';
						window.Elements.verificationCodeInput.focus();

						// 인증 실패 시, 이메일 변경 플래그는 false로 유지
						window.Elements.isEmailVerifiedAndChanged = false;
						verifiedNewEmail = null;
						window.updateSaveButtonAppearance();
					}
				} catch (error) { // 네트워크 오류 등 예외 발생 시
					console.error('이메일 인증번호 확인 중 오류 발생:', error);
					window.Elements.authCodeValidationMessage.textContent = '서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.';
					window.Elements.authCodeValidationMessage.classList.remove('success');
					window.Elements.authCodeValidationMessage.classList.add('error');
					window.Elements.authCodeValidationMessage.style.display = 'block';

					// isEmailVerifiedAndChanged 및 verifiedNewEmail 초기화
					window.Elements.isEmailVerifiedAndChanged = false;
					verifiedNewEmail = null; //  
					window.updateSaveButtonAppearance();
				}
			});
		}
		// --- 통합된 '저장' 버튼 클릭 이벤트 로직 ---
		if (saveButton) {
			saveButton.addEventListener('click', async function(event) {
				event.preventDefault(); // 폼 기본 제출 방지

				if (this.hasAttribute('disabled')) {
					console.log('Save button is disabled. Skipping save operation.');
					return;
				}

				let isAnyUpdateAttempted = false;     // 어떤 업데이트 시도라도 있었는지
				let isAnyUpdateActuallySucceeded = false; // ★★★ 중요: 하나라도 성공했는지 추적 ★★★
				let failedUpdatesMessages = [];       // 실패한 업데이트의 메시지를 모으는 배열

				const updatePayload = {}; // ★★★ 새로운 통합 저장 로직을 위한 payload ★★★

				// 1. 닉네임 변경 확인 및 데이터 추가
				const currentNickname = nicknameInput.value.trim();
				if (window.Elements.isNicknameChangedAndValid && currentNickname !== window.Elements.initialNicknameValue) {
					isAnyUpdateAttempted = true;
					updatePayload.nickname = currentNickname; // ★★★ payload에 닉네임 추가 ★★★
				} else if (currentNickname !== window.Elements.initialNicknameValue && !window.Elements.isNicknameChangedAndValid) {
					isAnyUpdateAttempted = true;
					failedUpdatesMessages.push('닉네임: 유효성 검사 또는 중복 확인이 필요합니다.');
				}


				// 2. 이메일 변경 확인 및 데이터 추가 (이제 saveButton이 다시 이메일을 보냅니다)
				// 이메일 필드 값이 초기값과 다르고, 이메일이 인증되었다고 플래그가 설정되어 있다면
				const currentEmail = emailInput.value.trim();
				if (currentEmail !== window.Elements.initialEmailValue && window.Elements.isEmailVerifiedAndChanged) {
					isAnyUpdateAttempted = true;
					updatePayload.email = currentEmail; // ★★★ payload에 이메일 추가 ★★★
				} else if (currentEmail !== window.Elements.initialEmailValue && !window.Elements.isEmailVerifiedAndChanged) {
					isAnyUpdateAttempted = true;
					failedUpdatesMessages.push('이메일: 이메일 인증이 필요합니다.');
				}

				// 3. 재직 증명서 제출 여부 확인 (데이터는 이미 /api/mypage/upload로 전송됨)
				if (window.Elements.isEmploymentInfoSubmitted) {
					isAnyUpdateAttempted = true;
					updatePayload.employmentInfoSubmitted = true; // ★★★ payload에 재직 증명서 플래그 추가 ★★★
				}
				// 업데이트할 정보가 없다면 (즉, payload가 비어있고 재직증명서도 제출되지 않았다면)
				if (Object.keys(updatePayload).length === 0 && !window.Elements.isEmploymentInfoSubmitted) { // ★★★ 조건 강화 ★★★
					alert('변경된 정보가 없습니다.');
					return; // 저장 로직 종료
				}

				// ★★★ 통합 업데이트 API 호출 ★★★
				try {
					const response = await fetch('/api/mypage/update-profile', { // ★★★ 새로운 통합 API 엔드포인트 ★★★
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(updatePayload) // ★★★ 모든 변경 데이터를 한 번에 전송 ★★★
					});
					const data = await response.json();

					if (response.ok && data.success) {
						alert('회원 정보가 저장되었습니다!');
						isAnyUpdateActuallySucceeded = true; // 통합 업데이트 성공

						// 성공 시 초기 값 업데이트 및 플래그 초기화
						// 닉네임 변경 성공 시:
						if (updatePayload.nickname) {
							window.Elements.initialNicknameValue = updatePayload.nickname;
							window.Elements.isNicknameChangedAndValid = false;
						}
						// 이메일 변경 성공 시:
						if (updatePayload.email) {
							window.Elements.initialEmailValue = updatePayload.email;
							window.Elements.isEmailVerifiedAndChanged = false; // 이메일도 변경/저장되었으므로 플래그 초기화
							// verifiedNewEmail = null; // now a local variable, not needed here
						}
						// 재직 증명서 제출 성공 시:
						if (updatePayload.employmentInfoSubmitted) {
							window.Elements.isEmploymentInfoSubmitted = false;
						}

					} else {
						const serverErrorMessage = data.message || '알 수 없는 서버 오류로 인해 정보 수정에 실패했습니다.';
						failedUpdatesMessages.push(`전체 저장: ${serverErrorMessage}`); // 전체 저장 실패 메시지 추가
						isAnyUpdateActuallySucceeded = false; // 통합 업데이트 실패
					}
				} catch (error) {
					console.error('회원 정보 수정 중 서버 통신 오류 발생:', error);
					failedUpdatesMessages.push('전체 저장: 서버 통신 오류');
					isAnyUpdateActuallySucceeded = false;
				}


				// UI 초기화 로직
				infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
					input.setAttribute('readonly', 'true');
				});

				if (editButton) editButton.removeAttribute('disabled');
				if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
				if (sendEmailVerificationButton) {
					sendEmailVerificationButton.setAttribute('disabled', 'true');
					sendEmailVerificationButton.textContent = '이메일 인증';
				}
				if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
				if (submitEmploymentCertBtn) submitEmploymentCertBtn.setAttribute('disabled', 'true');
				if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true');

				window.resetNicknameValidationMessage();
				window.resetEmailMessages();
				if (verificationCodeSection) {
					verificationCodeSection.style.display = 'none';
				}
				clearInterval(emailTimerInterval);
				verifiedNewEmail = null; // 이제 saveButton 로직 내에서만 쓰이므로 여기서 초기화

				window.updateSaveButtonAppearance(); // 최종적으로 saveButton 비활성화
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





		// --- 비밀번호 유효성 검사 상태 관리 ---
		window.passwordValidationStatus = {
			currentPasswordValidated: false,
			newPasswordFormatValid: false,
			newPasswordMatch: false
		};

		// --- 헬퍼 함수: 메시지 표시/숨김 ---
		window.showPasswordMessage = function(element, message, isError) {
			if (element) {
				element.textContent = message;
				element.style.display = 'block';
				if (isError) {
					element.classList.remove('success');
					element.classList.add('error');
				} else {
					element.classList.remove('error');
					element.classList.add('success');
				}
			}
		};

		window.clearPasswordMessage = function(element) {
			if (element) {
				element.textContent = '';
				element.style.display = 'none';
				element.classList.remove('error', 'success');
			}
		};

		// --- '변경하기' 버튼 활성화/비활성화 로직 ---
		function updateChangePasswordButtonState() {
			if (changePasswordSubmitButton) {
				if (window.passwordValidationStatus.currentPasswordValidated &&
					window.passwordValidationStatus.newPasswordFormatValid &&
					window.passwordValidationStatus.newPasswordMatch) {
					changePasswordSubmitButton.removeAttribute('disabled');
				} else {
					changePasswordSubmitButton.setAttribute('disabled', 'true');
				}
			} else {
				console.error("오류: 'changePasswordSubmitButton' 요소를 찾을 수 없습니다. HTML ID를 확인하세요.");
			}
		}


		// --- 이벤트 리스너: 현재 비밀번호 입력 필드 ---
		if (currentPasswordInput) {
			currentPasswordInput.addEventListener('input', function() {
				window.passwordValidationStatus.currentPasswordValidated = false;
				window.clearPasswordMessage(currentPasswordError);
				updateChangePasswordButtonState();
			});

			currentPasswordInput.addEventListener('blur', async function() {
				const password = this.value.trim();
				if (password.length === 0) {
					window.clearPasswordMessage(currentPasswordError);
					window.passwordValidationStatus.currentPasswordValidated = false;
					updateChangePasswordButtonState();
					return;
				}

				try {
					const response = await fetch('/api/mypage/checkPassword', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ password: password })
					});

					const data = await response.json();

					if (response.ok && data.success) {
						window.showPasswordMessage(currentPasswordError, '현재 비밀번호가 확인되었습니다.', false);
						window.passwordValidationStatus.currentPasswordValidated = true;
					} else {
						window.showPasswordMessage(currentPasswordError, data.message || '현재 비밀번호가 올바르지 않습니다.', true);
						window.passwordValidationStatus.currentPasswordValidated = false;
					}
				} catch (error) {
					console.error('현재 비밀번호 확인 중 오류 발생:', error);
					window.showPasswordMessage(currentPasswordError, '현재 비밀번호 확인 중 오류가 발생했습니다.', true);
					window.passwordValidationStatus.currentPasswordValidated = false;
				} finally {
					updateChangePasswordButtonState();
				}
			});
		} else {
			console.warn("경고: 'currentPasswordInput' 요소를 찾을 수 없습니다. 비밀번호 변경 로직의 일부가 작동하지 않을 수 있습니다.");
		}

		// --- 이벤트 리스너: 새 비밀번호 입력 필드 ---
		if (newPassword) {
			newPassword.addEventListener('input', function() {
				const password = this.value;
				const regex = /^(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`])(?=.*[A-Z]).{10,}$/;
				const currentPasswordValue = currentPasswordInput ? currentPasswordInput.value : '';

				if (password.length > 0 && password === currentPasswordValue) {
					// 새 비밀번호가 기존 비밀번호와 동일할 때
					window.showPasswordMessage(newPasswordFormatError, '새 비밀번호는 기존 비밀번호와 동일할 수 없습니다.', true);
					window.passwordValidationStatus.newPasswordFormatValid = false; // 유효하지 않다고 설정
				} else if (password.length === 0) {
					// 입력이 없을 때
					window.passwordValidationStatus.newPasswordFormatValid = false;
					window.clearPasswordMessage(newPasswordFormatError);
				} else if (!regex.test(password)) {
					// 비밀번호 형식에 맞지 않을 때
					window.showPasswordMessage(newPasswordFormatError, '새 비밀번호는 특수문자, 대문자를 포함하여 10자 이상이어야 합니다.', true);
					window.passwordValidationStatus.newPasswordFormatValid = false;
				} else {
					// 모든 조건에 부합할 때
					window.showPasswordMessage(newPasswordFormatError, '새 비밀번호 조건에 부합합니다.', false);
					window.passwordValidationStatus.newPasswordFormatValid = true;
				}

				checkNewPasswordMatch();
				updateChangePasswordButtonState();
			});
		} else {
			console.warn("경고: 'newPassword' 요소를 찾을 수 없습니다.");
		}

		// --- 이벤트 리스너: 변경 비밀번호 확인 입력 필드 ---
		if (confirmNewPassword) {
			confirmNewPassword.addEventListener('input', checkNewPasswordMatch);
		} else {
			console.warn("경고: 'confirmNewPassword' 요소를 찾을 수 없습니다.");
		}

		// 초기화 시점에 메시지들 비우기
		window.clearPasswordMessage(passwordMatchError);
		window.clearPasswordMessage(currentPasswordError);
		if (newPasswordFormatError) {
			window.clearPasswordMessage(newPasswordFormatError);
		}

		// --- 새 비밀번호와 확인 비밀번호 일치 여부 및 형식 유효성 검사 함수 ---
		function checkNewPasswordMatch() {
			const newPasswordValue = newPassword ? newPassword.value : '';
			const confirmNewPasswordValue = confirmNewPassword ? confirmNewPassword.value : '';

			if (confirmNewPasswordValue.length === 0) {
				window.clearPasswordMessage(passwordMatchError);
				window.passwordValidationStatus.newPasswordMatch = false;
			} else if (newPasswordValue !== confirmNewPasswordValue) {
				window.showPasswordMessage(passwordMatchError, '비밀번호가 일치하지 않습니다.', true);
				window.passwordValidationStatus.newPasswordMatch = false;
			} else {
				if (window.passwordValidationStatus.newPasswordFormatValid) {
					window.showPasswordMessage(passwordMatchError, '비밀번호가 일치합니다.', false);
					window.passwordValidationStatus.newPasswordMatch = true;
				} else {
					window.clearPasswordMessage(passwordMatchError);
					window.passwordValidationStatus.newPasswordMatch = false;
				}
			}
			updateChangePasswordButtonState();
		}

		// --- 이벤트 리스너: '변경하기' 버튼 제출 ---
		if (changePasswordSubmitButton) { // 버튼 존재 여부 확인
			changePasswordSubmitButton.addEventListener('click', async function(event) {
				event.preventDefault();

				// 최종 유효성 검사 (클라이언트 측)
				if (!window.passwordValidationStatus.currentPasswordValidated ||
					!window.passwordValidationStatus.newPasswordFormatValid ||
					!window.passwordValidationStatus.newPasswordMatch) {
					alert('모든 비밀번호 조건을 만족해야 비밀번호를 변경할 수 있습니다.');
					return;
				}
				const newPasswordToSubmit = newPassword.value;
				const currentPasswordToSubmit = currentPasswordInput.value;
				if (newPasswordToSubmit === currentPasswordToSubmit) { // 일반 텍스트 비교 (백엔드에서 암호화 비교 필요)
					alert('새로운 비밀번호는 기존 비밀번호와 동일할 수 없습니다.');
					return; // 변경 요청 중단
				}
				try {
					const response = await fetch('/api/mypage/changePassword', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							currentPassword: currentPasswordToSubmit,
							newPassword: newPasswordToSubmit
						})
					});
					const data = await response.json();

					if (response.ok && data.success) {
						alert('비밀번호가 변경되었습니다');
						// 성공 시 폼 초기화
						if (currentPasswordInput) currentPasswordInput.value = '';
						if (newPassword) newPassword.value = '';
						if (confirmNewPassword) confirmNewPassword.value = '';
						window.clearPasswordMessage(currentPasswordError);
						window.clearPasswordMessage(passwordMatchError);
						if (newPasswordFormatError) window.clearPasswordMessage(newPasswordFormatError);
						// 유효성 상태 초기화
						window.passwordValidationStatus.currentPasswordValidated = false;
						window.passwordValidationStatus.newPasswordFormatValid = false;
						window.passwordValidationStatus.newPasswordMatch = false;
						updateChangePasswordButtonState(); // 버튼 다시 비활성화
					} else {
						alert(data.message || '비밀번호 변경에 실패했습니다.');
					}
				} catch (error) {
					console.error('비밀번호 변경 요청 중 오류 발생:', error);
					alert('비밀번호 변경 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
				}
			});
		}
	};

	// --- 4. 모든 Elements 할당이 끝난 후에 각 모듈의 초기화 함수 호출 ---
	window.setupSidebarLogic();
	window.setupPasswordModalLogic();
	window.setupUserInfoFormLogic(); // 통합된 userInfo 로직 호출

	// --- 5. 이벤트 리스너 등록 및 초기 상태 설정 (DOMContentLoaded 안에서) ---
	window.addEventListener('hashchange', window.activateContentFromHash);

	// 초기 페이지 로드 시 콘텐츠 활성화 및 폼 초기 상태 설정
	const initialHash = window.location.hash.substring(1);
	if (!initialHash) {
		window.activateContent('mypage_mylogs_content'); // 기본 탭 ('내가 쓴 로그') 활성화
	} else {
		// 해시가 있는 경우, 해당 콘텐츠 활성화 시도
		// 비밀번호 설정/탈퇴 탭은 인증 모달이 먼저 뜨므로, 여기서 activateContent를 직접 호출하지 않습니다.
		// authenticateButton 클릭 로직에서 인증 성공 시 activateContent를 호출합니다.
		if (initialHash !== 'mypage_pwfix_content' && initialHash !== 'mypage_secession_content') {
			window.activateContentFromHash();
		} else {
			window.activateContent(initialHash);
		}
	}

	// '회원정보 수정' 탭이 활성화되어 있다면 초기 상태 설정
	// 페이지 로드 시 `mypage_info_content`가 기본이거나, 해당 해시로 접근했을 때
	if (!initialHash || initialHash === 'mypage_info_content') {
		if (window.setInfoFormInitialState) { // setupUserInfoFormLogic 내에서 정의된 함수
			window.setInfoFormInitialState();
		}
	}
	async function loadUserEmploymentStatus() {
		try {
			const response = await fetch('/api/mypage/employment-status'); // ★★★ 백엔드 API 엔드포인트 ★★★
			window.Elements.currentEmploymentStatus = null;
			window.Elements.currentSubmittedFileName = null; // 파일명 초기화
			
			

			if (!response.ok) {
				console.error('재직 증명서 상태 로드 실패:', response.status, response.statusText);
                window.Elements.currentEmploymentStatus = null;
                window.Elements.currentSubmittedFileName = null; // 파일명 초기화
                // localStorage에서도 정보 삭제
                localStorage.removeItem('employmentCertificateFileName');
                localStorage.removeItem('employmentCertificateStatus');
                if (window.Elements.companyNameInput) {
                    window.Elements.companyNameInput.value = '정보 로드 오류';
                    window.Elements.companyNameInput.style.color = 'red'; // 오류 시 빨간색
                }
                if (window.Elements.employmentCertificateInput) {
                    window.Elements.employmentCertificateInput.value = '상태 로드 오류';
                    window.Elements.employmentCertificateInput.style.color = 'red'; // 오류 시 빨간색
                }
                return;
			}

			const data = await response.json();

			if (data && data.status) {
				window.Elements.currentEmploymentStatus = data.status;
				console.log('재직 증명서 초기 상태:', window.Elements.currentEmploymentStatus);
				// companyNameInput 필드 업데이트
                if (window.Elements.companyNameInput) {
                    if (data.status === 'APPROVED' && data.approvedCompanyName) {
                        window.Elements.companyNameInput.value = data.approvedCompanyName;
                        window.Elements.companyNameInput.placeholder = '재직 중';
                        window.Elements.companyNameInput.style.color = ''; // 기본 색상
                    } else {
                        window.Elements.companyNameInput.value = '';
                        window.Elements.companyNameInput.placeholder = '재직 인증이 확인되면, 회사 정보가 자동으로 업데이트됩니다.';
                        window.Elements.companyNameInput.style.color = ''; // 기본 색상
                    }
                }
				// ★★★ localStorage에서 파일명과 상태를 먼저 확인 ★★★
                const storedFileName = localStorage.getItem('employmentCertificateFileName');
                const storedStatus = localStorage.getItem('employmentCertificateStatus');
				if (window.Elements.currentEmploymentStatus === 'PENDING' && storedFileName && storedStatus === 'PENDING') {
                        // DB 상태가 PENDING이고 localStorage에도 PENDING 파일명이 있다면
                        window.Elements.currentSubmittedFileName = storedFileName;
                        window.Elements.employmentCertificateInput.value = `${storedFileName} (처리 중)`;
                    } else if (window.Elements.currentEmploymentStatus === 'APPROVED') {
                        // DB 상태가 APPROVED라면 (이때는 DB에 파일명 필요, 아니면 알 수 없음)
                        // 만약 APPROVED 시에도 파일명을 알 수 없다면, '승인됨'으로만 표시
                        window.Elements.currentSubmittedFileName = storedFileName; // (재활용)
                        window.Elements.employmentCertificateInput.value = "승인되었습니다. 새로운 증명서 제출이 가능합니다."; // 파일명 알 수 없으므로 일반 메시지
                        window.Elements.employmentCertificateInput.style.color = 'blue';
                        localStorage.removeItem('employmentCertificateFileName'); // 승인되면 localStorage에서 파일명은 지우는 것이 좋음
                        localStorage.removeItem('employmentCertificateStatus');
                    } else if (window.Elements.currentEmploymentStatus === 'REJECTED') {
                        // DB 상태가 REJECTED라면
                        window.Elements.currentSubmittedFileName = null; // 반려 시 파일명 제거
                        window.Elements.employmentCertificateInput.value = `재직 증명서가 반려되었습니다. 다시 확인 후 제출해주세요.`;
                        window.Elements.employmentCertificateInput.style.color ='red';
                        localStorage.removeItem('employmentCertificateFileName'); // 반려되면 localStorage에서 파일명은 지우는 것이 좋음
                        localStorage.removeItem('employmentCertificateStatus');
                    } else {
                        // 기타 상태 (NOT_SUBMITTED, 또는 상태는 있지만 파일명 관련 정보가 없는 경우)
                        window.Elements.currentSubmittedFileName = null;
                        window.Elements.employmentCertificateInput.value = '선택된 파일 없음';
                        localStorage.removeItem('employmentCertificateFileName');
                        localStorage.removeItem('employmentCertificateStatus');
                    }
                
			} else {
				window.Elements.currentEmploymentStatus = null;
                window.Elements.currentSubmittedFileName = null;
                if (window.Elements.employmentCertificateInput) {
                    window.Elements.employmentCertificateInput.value = '선택된 파일 없음';
                }
                localStorage.removeItem('employmentCertificateFileName'); // 상태 없으면 localStorage도 비움
                localStorage.removeItem('employmentCertificateStatus');
            }

		}catch (error) {
            console.error('사용자 재직 증명서 상태 로드 중 오류:', error);
            window.Elements.currentEmploymentStatus = null;
            window.Elements.currentSubmittedFileName = null;
            if (window.Elements.employmentCertificateInput) {
                window.Elements.employmentCertificateInput.value = '상태 로드 실패';
            }
            localStorage.removeItem('employmentCertificateFileName');
            localStorage.removeItem('employmentCertificateStatus');
        }
	}

	loadUserEmploymentStatus(); // 페이지 로드 시 호출
});