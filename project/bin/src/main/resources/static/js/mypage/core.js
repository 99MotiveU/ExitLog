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
		authCodeValidationMessage: document.getElementById('authCodeValidationMessage')
	};



	// 요소들이 null일 경우에 대한 경고 로그 (선택 사항)
	Object.keys(window.Elements).forEach(key => {
		const element = window.Elements[key];
		// 일부 버튼은 존재하지 않을 수도 있으므로, 해당 요소에 대한 경고는 제외하거나 특정합니다.
		// 예를 들어, closeModalButton은 passwordModal의 자식으로 존재하지 않을 수 있습니다 (그러나 일반적으로는 존재해야 합니다).
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
	window.Elements.modalEmploymentCertificateUpload = document.getElementById('modalCertDoc'); // 실제 파일 인풋 (HTML ID: modalCertDoc)
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
					alert(data.message); // "재직 증명서가 제출되었습니다." 알림

					const mainPageEmploymentCertificateInput = document.getElementById('employmentCertificate');
					if (mainPageEmploymentCertificateInput) {
						// disabled가 있다면 잠시 해제 후 값 설정, 다시 disabled
						if (mainPageEmploymentCertificateInput.hasAttribute('disabled')) {
							mainPageEmploymentCertificateInput.removeAttribute('disabled');
							mainPageEmploymentCertificateInput.value = data.submittedFileName || uploadedFile.name;
							mainPageEmploymentCertificateInput.setAttribute('disabled', 'true');
						} else {
							// disabled가 없다면 readonly만 있으므로 바로 값 설정
							mainPageEmploymentCertificateInput.value = data.submittedFileName || uploadedFile.name;
						}
					}
					// 모달 내부 파일 선택 input 초기화
					if (modalEmploymentCertificateUpload) {
						modalEmploymentCertificateUpload.value = '';
					}
					// 모달 내부 파일명 표시 span 초기화 (모달 내부에만 있다면)
					const modalSelectedFileNameSpan = document.getElementById('modalSelectedFileName');
					if (modalSelectedFileNameSpan) {
						modalSelectedFileNameSpan.textContent = '선택된 파일 없음';
					}
					window.closeEmploymentUploadModal(); // 모달 닫기 함수 호출
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
			infoForm, editButton, saveButton, // saveButton으로 변경
			checkNicknameButton, sendEmailVerificationButton, checkVerificationCodeButton,
			employmentCertificateInput,
			submitEmploymentCertBtn, // HTML에 있는 ID로 가져옴 (이 변수명으로 JS에서 계속 사용)
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
		let verifiedNewEmail = null; // 인증 성공 시 임시로 이메일을 저장할 변수
		let emailTimerInterval; // 타이머 인터벌 변수

		/**
		 * 회원정보 수정 폼 필드 및 버튼의 초기 상태를 설정합니다. (readonly 및 disabled)
		 */
		if (typeof window.setupEmploymentUploadModalLogic === 'function') {
			window.setupEmploymentUploadModalLogic(); // <-- 여기서만 호출!
			console.log("setupEmploymentUploadModalLogic 호출 완료");
		} else {
			console.error("setupEmploymentUploadModalLogic 함수를 찾을 수 없습니다.");
		}
		function startEmailTimer(duration) {
			let timer = duration;
			emailTimerElement.style.display = 'block';
			sendEmailVerificationButton.setAttribute('disabled', 'true'); // 발송 버튼 비활성화
			sendEmailVerificationButton.textContent = '재전송 대기 중...';

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
			// 회사명을 제외한 모든 입력 필드를 readonly로 설정
			infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
				input.setAttribute('readonly', 'true');
			});

			// 관련 버튼들 disabled 상태로 초기화
			if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
			if (sendEmailVerificationButton) {
				sendEmailVerificationButton.setAttribute('disabled', 'true');
				sendEmailVerificationButton.textContent = '이메일 인증'; // 텍스트 초기화
			}
			if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
			if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true'); // 재인증 버튼


			if (saveButton) saveButton.setAttribute('disabled', 'true');
			// 회원정보 수정 '수정' 버튼 클릭 이벤트
			if (editButton) {
				editButton.addEventListener('click', function() {
					// 모든 .form-label-input 및 .form-label-input-nick 필드 중,
					// 'companyName'과 'employmentCertificate'를 제외하고 readonly 속성을 제거합니다.
					infoForm.querySelectorAll('input.form-label-input:not(#companyName):not(#employmentCertificate), input.form-label-input-nick').forEach(input => {
						input.removeAttribute('readonly'); // <-- 여기를 수정!
					});

					// 파일 첨부 관련 버튼 활성화 (제출, 재인증)
					if (window.Elements.submitEmploymentCertBtn) window.Elements.submitEmploymentCertBtn.removeAttribute('disabled');
					if (window.Elements.employmentReauthButton) window.Elements.employmentReauthButton.removeAttribute('disabled');

					// 닉네임, 이메일 관련 버튼 활성화
					if (window.Elements.checkNicknameButton) window.Elements.checkNicknameButton.removeAttribute('disabled');
					if (window.Elements.sendEmailVerificationButton) window.Elements.sendEmailVerificationButton.removeAttribute('disabled');
					if (window.Elements.checkVerificationCodeButton) window.Elements.checkVerificationCodeButton.removeAttribute('disabled');

					this.setAttribute('disabled', 'true'); // '수정' 버튼 비활성화
					if (saveButton) saveButton.removeAttribute('disabled'); // '저장' 버튼 활성화

					window.resetNicknameValidationMessage();
					window.resetEmailMessages();
					if (window.Elements.verificationCodeSection) {
						window.Elements.verificationCodeSection.style.display = 'none';
					}
				});
			}
			window.resetNicknameValidationMessage();
			window.resetEmailMessages(); // 전역 resetEmailMessages 사용
			if (verificationCodeSection) {
				verificationCodeSection.style.display = 'none';
			}
			clearInterval(emailTimerInterval); // 혹시 모를 타이머 초기화
			verifiedNewEmail = null; // 초기 상태에서는 인증된 이메일 없음
		};

		// 1. 모든 입력 필드 초기 상태 설정
		// 회사명(companyName)과 재직 증명서(employmentCertificate) 필드를 제외하고 readonly 설정
		infoForm.querySelectorAll('input.form-label-input-nick, input.form-label-input').forEach(input => {
			// companyName과 employmentCertificate 필드는 항상 readonly를 유지해야 합니다.
			if (input.id !== 'companyName' && input.id !== 'employmentCertificate') {
				input.setAttribute('readonly', 'true');
			}
			// 그 외 필드의 값도 초기화 (필요하다면)
			// input.value = '';
		});

		// 2. 버튼 활성화/비활성화 및 클래스 설정
		// '저장' 버튼은 항상 비활성화로 시작
		if (saveButton) {
			saveButton.setAttribute('disabled', 'true');
			saveButton.classList.remove('btn-blue'); // 혹시 모를 파란색 제거
			saveButton.classList.add('btn-gray');    // 회색으로 설정
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

		// 5. 유효성 상태 변수 초기화
		window.Elements.isNicknameValid = false;
		window.Elements.isEmailVerified = false;
		window.Elements.isEmploymentVerified = false;

		// 6. 초기 닉네임/이메일 값 저장 (폼 초기화 시)
		// 이 값들은 폼 수정 시 변경 여부를 판단하는 데 사용됩니다.
		window.Elements.initialNickname = nicknameInput ? nicknameInput.value.trim() : '';
		window.Elements.initialEmail = emailInput ? emailInput.value.trim() : '';



		// 회원정보 수정 '수정' 버튼 클릭 이벤트
		if (editButton) {
			editButton.addEventListener('click', function() {
				infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
					input.removeAttribute('readonly'); // readonly 속성 제거
				});

				// 닉네임, 이메일, 재직 증명서 관련 버튼 활성화
				if (checkNicknameButton) checkNicknameButton.removeAttribute('disabled');

				// 이메일 필드가 비어있지 않고 유효하면 발송 버튼 활성화
				if (sendEmailVerificationButton && emailInput && emailInput.value.trim() && window.validateEmail(emailInput.value.trim())) {
					sendEmailVerificationButton.removeAttribute('disabled');
					sendEmailVerificationButton.textContent = '이메일 인증';
				} else if (sendEmailVerificationButton) { // 이메일이 비어있거나 유효하지 않으면 비활성화
					sendEmailVerificationButton.setAttribute('disabled', 'true');
					sendEmailVerificationButton.textContent = '이메일 인증';
				}

				// 인증번호 관련 버튼 및 섹션은 '이메일 인증' 버튼 클릭 후 활성화
				if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
				if (submitEmploymentCertBtn) submitEmploymentCertBtn.removeAttribute('disabled');
				if (employmentReauthButton) employmentReauthButton.removeAttribute('disabled');

				this.setAttribute('disabled', 'true'); // '수정' 버튼 비활성화
				if (saveButton) saveButton.removeAttribute('disabled'); // '저장' 버튼 활성화 (전체 폼 저장)



				window.resetNicknameValidationMessage();
				window.resetEmailMessages(); // 전역 resetEmailMessages 사용
				if (verificationCodeSection) {
					verificationCodeSection.style.display = 'none';
				}
				clearInterval(emailTimerInterval); // 타이머 초기화
				verifiedNewEmail = null; // 인증된 이메일 초기화 (수정 모드 진입 시)
			});
		}

		// 회원정보 수정 '저장' 버튼 클릭 이벤트 (기존과 동일, email 저장 로직은 saveButton으로 분리)
		if (saveButton) {
			saveButton.addEventListener('click', function(event) {
				event.preventDefault(); // 폼 기본 제출 방지

				alert('회원 정보가 수정되었습니다.');
				// 저장 후 다시 readonly 상태로 전환 (회사명 제외)
				infoForm.querySelectorAll('input.form-label-input:not(#companyName), input.form-label-input-nick').forEach(input => {
					input.setAttribute('readonly', 'true');
				});

				if (editButton) editButton.removeAttribute('disabled');
				this.setAttribute('disabled', 'true');

				// 닉네임, 이메일, 재직 증명서 관련 버튼 비활성화
				if (checkNicknameButton) checkNicknameButton.setAttribute('disabled', 'true');
				if (sendEmailVerificationButton) {
					sendEmailVerificationButton.setAttribute('disabled', 'true');
					sendEmailVerificationButton.textContent = '이메일 인증'; // 텍스트 초기화
				}
				if (checkVerificationCodeButton) checkVerificationCodeButton.setAttribute('disabled', 'true');
				if (submitEmploymentCertBtn) submitEmploymentCertBtn.setAttribute('disabled', 'true');
				if (employmentReauthButton) employmentReauthButton.setAttribute('disabled', 'true');
				if (saveButton) saveButton.setAttribute('disabled', 'true');


				window.resetNicknameValidationMessage();
				window.resetEmailMessages(); // 전역 resetEmailMessages 사용
				if (verificationCodeSection) {
					verificationCodeSection.style.display = 'none';
				}
				clearInterval(emailTimerInterval); // 타이머 초기화
				verifiedNewEmail = null; // 인증된 이메일 초기화
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
				verifiedNewEmail = null; // 인증된 이메일 초기화
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

		// 인증번호 확인 로직 (DB 업데이트는 여기서 하지 않음) (수정된 부분)
		if (checkVerificationCodeButton) {
			checkVerificationCodeButton.addEventListener('click', async function() {
				if (this.hasAttribute('disabled')) return;

				const enteredCode = verificationCodeInput.value.trim();
				const emailToVerify = emailInput.value.trim();
				// authCodeValidationMessage 변수는 이미 상단에서 선언되었습니다.

				authCodeValidationMessage.style.display = 'none'; // 메시지 초기화
				emailVerificationMessage.style.display = 'none';

				if (!enteredCode) {
					authCodeValidationMessage.textContent = '인증번호를 입력해주세요.';
					authCodeValidationMessage.classList.add('error');
					authCodeValidationMessage.style.display = 'block';
					return;
				}

				// --- 백엔드 API 호출 시작: 인증번호 일치 여부만 확인 ---
				try {
					const response = await fetch('/api/mypage/verify-email-auth-code', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							email: emailToVerify,
							authCode: enteredCode
						})
					});

					const data = await response.json();

					if (response.ok && data.success) {
						clearInterval(emailTimerInterval); // 타이머 중지
						emailTimerElement.style.display = 'none'; // 타이머 숨김

						emailVerificationMessage.textContent = data.message || '이메일 인증이 완료되었습니다!';
						emailVerificationMessage.classList.remove('error');
						emailVerificationMessage.classList.add('success');
						emailVerificationMessage.style.display = 'block';

						// 성공 시 필드 및 버튼 상태 업데이트
						emailInput.setAttribute('readonly', 'true');
						sendEmailVerificationButton.setAttribute('disabled', 'true');
						sendEmailVerificationButton.textContent = '인증 완료';
						verificationCodeInput.setAttribute('readonly', 'true');
						this.setAttribute('disabled', 'true'); // 인증번호 확인 버튼 비활성화

						// 이메일이 성공적으로 인증되었음을 임시 저장
						verifiedNewEmail = emailToVerify;

						// '이메일 변경 저장' 버튼 활성화
						if (saveButton) {
							saveButton.removeAttribute('disabled');
						}

						setTimeout(() => {
							if (verificationCodeSection) {
								// 여기에서 CSS 클래스 토글 방식 고려
								verificationCodeSection.style.display = 'none'; // 일단 block으로 유지
							}
						}, 2000); // 2초 후 숨김

					} else {
						authCodeValidationMessage.textContent = data.message || '인증번호가 일치하지 않습니다.';
						authCodeValidationMessage.classList.remove('success');
						authCodeValidationMessage.classList.add('error');
						authCodeValidationMessage.style.display = 'block';
						verificationCodeInput.value = '';
						verificationCodeInput.focus();
					}
				} catch (error) {
					console.error('이메일 인증번호 확인 중 오류 발생:', error);
					authCodeValidationMessage.textContent = '서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.';
					authCodeValidationMessage.classList.remove('success');
					authCodeValidationMessage.classList.add('error');
					authCodeValidationMessage.style.display = 'block';
				}
				// --- 백엔드 API 호출 끝 ---
			});
		}

		// 이메일 변경 '저장' 버튼 로직 (DB 업데이트는 이 버튼을 통해서만) (새로 추가)
		if (saveButton) {
			saveButton.addEventListener('click', async function() {
				if (this.hasAttribute('disabled') || !verifiedNewEmail) return;

				// 이미 DB에 업데이트된 이메일이거나, 인증되지 않은 이메일이라면 저장하지 않음
				// 이메일 입력 필드의 현재 값과 verifiedNewEmail이 일치하는지 확인
				if (!verifiedNewEmail || verifiedNewEmail !== emailInput.value) {
					emailValidationMessage.textContent = '먼저 이메일을 인증하거나, 인증된 이메일과 입력된 이메일이 일치하지 않습니다.';
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
					return;
				}

				// --- 백엔드 API 호출 시작: 실제 이메일 DB 업데이트 ---
				try {
					const response = await fetch('/api/mypage/update-user-info', { // 새로운 API 엔드포인트
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email: verifiedNewEmail })
					});

					const data = await response.json();

					if (response.ok && data.success) {
						emailVerificationMessage.textContent = data.message || '이메일 주소가 성공적으로 변경되었습니다!';
						emailVerificationMessage.classList.remove('error');
						emailVerificationMessage.classList.add('success');
						emailVerificationMessage.style.display = 'block';

						this.setAttribute('disabled', 'true'); // 저장 버튼 비활성화
						verifiedNewEmail = null; // 임시 저장값 초기화

						// 이메일 입력 필드의 readonly는 유지하거나, 필요에 따라 다시 활성화 가능.
						// 현재는 '인증 완료' 상태로 유지하는 것이 자연스러움.

						// 페이지를 새로고침하여 최신 이메일 정보를 반영할 수 있음.
						setTimeout(() => {
							window.location.reload();
						}, 1500); // 1.5초 후 새로고침

					} else {
						emailValidationMessage.textContent = data.message || '이메일 변경에 실패했습니다. 다시 시도해주세요.';
						emailValidationMessage.classList.remove('success');
						emailValidationMessage.classList.add('error');
						emailValidationMessage.style.display = 'block';
					}
				} catch (error) {
					console.error('이메일 변경 저장 중 오류 발생:', error);
					emailValidationMessage.textContent = '서버 통신 중 오류가 발생했습니다. 다시 시도해주세요.';
					emailValidationMessage.classList.remove('success');
					emailValidationMessage.classList.add('error');
					emailValidationMessage.style.display = 'block';
				}
				// --- 백엔드 API 호출 끝 ---
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

		// 재직 증명서 파일 제출 로직 (기존 폼에 있던 파일 선택 기능)
		if (saveButton) {
			saveButton.addEventListener('click', function() {
				if (this.hasAttribute('disabled')) return;
				if (employmentReauthButton) employmentReauthButton.click();
			});
		}
		if (employmentReauthButton) {
			employmentReauthButton.addEventListener('change', function() {
				if (this.files && this.files.length > 0) {
					const fileName = this.files[0].name;
					if (employmentCertificateInput.tagName === 'INPUT') {
						employmentCertificateInput.value = fileName;
					} else {
						employmentCertificateInput.textContent = fileName;
					}
				} else {
					if (employmentCertificateInput.tagName === 'INPUT') {
						employmentCertificateInput.value = '';
					} else {
						employmentCertificateInput.textContent = '선택된 파일 없음';
					}
				}
			});
		}

		// "재인증" 버튼 클릭 시 (새롭게 추가된 재직 증명서 모달 열기)
		if (submitEmploymentCertBtn) {
			submitEmploymentCertBtn.addEventListener('click', function() {
				if (this.hasAttribute('disabled')) return;
				if (window.Elements.employmentUploadModal) {
					window.Elements.employmentUploadModal.classList.remove('hidden');
					window.Elements.employmentUploadModal.style.display = 'flex'; // flex로 표시
					// 모달 열 때 초기화
					if (window.Elements.modalCompanyName) window.Elements.modalCompanyName.value = '';
					if (window.Elements.modalEmploymentCertificateInput) window.Elements.modalEmploymentCertificateInput.textContent = '선택된 파일 없음';
					if (window.Elements.modalemploymentReauthButton) window.Elements.modalemploymentReauthButton.value = '';
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
		if (changePasswordSubmitButton) {
			updateChangePasswordButtonState();
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
						alert('비밀번호가 성공적으로 변경되었습니다!');
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



	// URL 해시 변경 시 콘텐츠 활성화
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
			// 해당 탭으로 직접 접근 시 비밀번호 모달을 띄우는 로직 (UX 고려 필요)
			// 현재 코드에서는 사이드바 클릭 시에만 모달을 띄우고, 직접 URL 접근 시에는 콘텐츠만 활성화하도록 되어 있습니다.
			// 만약 URL 직접 접근 시에도 모달을 띄우고 싶다면 여기에 로직 추가.
			// 현재 요청사항에는 "탈퇴하기 클릭 시 모달"이므로, URL 직접 접근 시 모달은 생략합니다.
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
});