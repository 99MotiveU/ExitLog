document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-id');
    const loginButton = document.getElementById('loginButton'); // id로 변경
    const loginErrorMessage = document.getElementById('loginErrorMessage'); // 에러 메시지 표시용 div

    // --- 1. 아이디 기억하기 (Remember Me) 기능 ---
    // 페이지 로드 시 저장된 아이디 불러오기
    const savedUsername = getCookie('savedUsername');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberMeCheckbox.checked = true; // 저장된 아이디가 있으면 체크박스도 체크
    }

    // 아이디 기억하기 체크박스 변경 시 쿠키 저장/삭제
    rememberMeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 체크되면 아이디를 쿠키에 저장 (예: 7일간 유효)
            setCookie('savedUsername', usernameInput.value, 7);
        } else {
            // 체크 해제되면 쿠키 삭제
            deleteCookie('savedUsername');
        }
    });

    // 아이디 입력 필드가 변경될 때마다 쿠키 업데이트 (체크박스 활성화 상태일 경우)
    usernameInput.addEventListener('input', function() {
        if (rememberMeCheckbox.checked) {
            setCookie('savedUsername', this.value, 7);
        }
    });

    // --- 2. 로그인 버튼 클릭 시 기능 ---
    loginButton.addEventListener('click', function() {
        const userId = usernameInput.value;
        const password = passwordInput.value;

        // 에러 메시지 초기화
        loginErrorMessage.innerHTML = '';

        if (!userId || !password) {
            loginErrorMessage.innerHTML = '<p style="color: red;">아이디와 비밀번호를 모두 입력해주세요.</p>';
            return;
        }

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                userId: userId,
                password: password
            })
        })
        .then(response => {
            return response.json(); // 응답이 성공이든 실패든 JSON을 파싱
        })
        .then(data => {
            if (data.success) { // 백엔드 응답에 따라 성공 여부 판단
                window.location.href = data.redirectUrl || '/main'; // 백엔드에서 전달받은 URL로 이동 또는 기본 홈으로
            } else {
                // 백엔드에서 전달받은 메시지를 `loginErrorMessage`에 그대로 표시
                loginErrorMessage.innerHTML = '<p style="color: red;">' + (data.message || '로그인 처리 중 오류가 발생했습니다.') + '</p>';
            }
        })
        .catch(error => {
            console.error('로그인 중 오류 발생:', error);
            // 네트워크 오류 또는 JSON 파싱 오류 등 예상치 못한 오류
            loginErrorMessage.innerHTML = '<p style="color: red;">로그인 처리 중 알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.</p>';
        });
    });

    // --- 3. 엔터 키 감지 및 로그인 트리거 ---
    usernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loginButton.click(); // 로그인 버튼 클릭 이벤트 트리거
        }
    });
	
    // --- 쿠키 관련 헬퍼 함수 ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999; path=/';
    }
});