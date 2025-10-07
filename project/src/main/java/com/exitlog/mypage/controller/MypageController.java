package com.exitlog.mypage.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap; // Map 사용을 위해 추가
import java.util.List;
import java.util.Map; // Map 사용을 위해 추가
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus; // HTTP 상태 코드 사용을 위해 추가
import org.springframework.http.ResponseEntity; // ResponseEntity 사용을 위해 추가
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping; // POST 요청 처리를 위해 추가
import org.springframework.web.bind.annotation.RequestBody; // JSON 요청 바디를 받기 위해 추가
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody; // JSON 응답을 위해 추가
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.exitlog.admin.model.entity.EmploymentCertificate;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.log.service.LogService;
import com.exitlog.login.model.dto.SessionUserDto;
import com.exitlog.login.model.entity.User;
import com.exitlog.login.service.EmailService;
import com.exitlog.login.service.LoginService;
import com.exitlog.mypage.service.MypageService;
import com.exitlog.pagination.LogPagination;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class MypageController {

	private final LogService logService;
	private final MypageService mypageService;
	private final EmailService emailService;
	private final LoginService loginService;

	public MypageController(LogService logService, MypageService mypageService, EmailService emailService,
			LoginService loginService) {
		this.logService = logService;
		this.mypageService = mypageService;
		this.emailService = emailService;
		this.loginService = loginService;
	}

	@GetMapping("/mypage")
	public String showMyPage(HttpSession session, Model model, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "7") int limit) {
		SessionUserDto loginUser = (SessionUserDto) session.getAttribute("loginUser");
		log.info(loginUser.toString());
		if (loginUser == null) {
			return "redirect:/login";
		}
		Integer userNo = loginUser.getUserNo();

		User userInfo = mypageService.MyPageInfo(userNo);

		if (userInfo != null) {
			model.addAttribute("userInfo", userInfo);
		} else {
			log.warn("User information not found for userNo: {}", userNo);
		}

		model.addAttribute("currentPage", "mypage_mylogs");
		model.addAttribute("userNo", userNo);
		int listCount = logService.getLogMyListCount(userNo);
		LogPagination pagination = new LogPagination(page, listCount, limit, 10);
		List<LogPostDetailDto> logList = logService.getMyLogList(userNo, pagination);

		model.addAttribute("logList", logList);
		model.addAttribute("pagination", pagination);

		return "mypage/mypage";
	}

	// --- 비밀번호 확인을 위한 새 API 엔드포인트 추가 ---
	@PostMapping("/api/mypage/checkPassword")
	@ResponseBody // 이 어노테이션은 메서드가 HTTP 응답 본문에 직접 데이터를 쓸 것임을 나타냅니다. (JSON 응답)
	public ResponseEntity<Map<String, Boolean>> checkPassword(@RequestBody Map<String, String> payload,
			HttpSession session) {
		SessionUserDto loginUser = (SessionUserDto) session.getAttribute("loginUser");
		Map<String, Boolean> response = new HashMap<>(); // 응답으로 보낼 Map 객체 생성

		// 1. 로그인 상태 확인
		if (loginUser == null) {
			log.warn("Unauthorized password check attempt: no loginUser in session.");
			response.put("success", false);
			// HTTP 401 Unauthorized 상태 코드와 함께 응답
			return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
		}

		Integer userNo = loginUser.getUserNo();
		// 클라이언트(JavaScript)에서 보낸 JSON 요청 본문에서 'password' 키의 값을 가져옵니다.
		String enteredPassword = payload.get("password");

		// 2. 입력된 비밀번호 유효성 검사
		if (enteredPassword == null || enteredPassword.isEmpty()) {
			log.warn("Bad request: entered password is null or empty for userNo: {}", userNo);
			response.put("success", false);
			// HTTP 400 Bad Request 상태 코드와 함께 응답
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		// 3. MypageService를 통해 비밀번호 일치 여부 확인
		// MypageService의 checkUserPassword 메서드가 내부적으로 해싱 로직을 처리합니다.
		boolean isPasswordCorrect = mypageService.checkUserPassword(userNo, enteredPassword);

		log.info("Password correctness for userNo {}: {}", userNo, isPasswordCorrect); // 로그 추가 (디버깅 용이)

		// 4. 결과에 따라 응답 생성
		response.put("success", isPasswordCorrect);

		// 비밀번호 일치 여부에 따라 HTTP 상태 코드를 조절할 수 있지만,
		// 여기서는 비밀번호 불일치도 200 OK로 응답하고 'success: false'로 클라이언트에게 알립니다.
		// (클라이언트 JS에서 'data.success' 값을 통해 판단하므로 200 OK로도 충분합니다.)
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/api/checkNickname")
	@ResponseBody
	public ResponseEntity<Map<String, Boolean>> checkNickname(@RequestBody Map<String, String> payload) {
		Map<String, Boolean> response = new HashMap<>();

		String nickname = payload.get("nickname");

		// 1. 입력된 닉네임에 대한 기본적인 서버 측 유효성 검사
		if (nickname == null || nickname.trim().isEmpty()) {
			log.warn("Bad request: nickname is null or empty.");
			response.put("isTaken", false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		// 2. MypageService의 isNicknameTaken 메서드를 호출하여 닉네임 중복 여부 확인
		boolean isTaken = mypageService.isNicknameTaken(nickname.trim());

		log.info("Nickname '{}' is taken: {}", nickname, isTaken);

		// 3. 중복 여부를 "isTaken" 키에 담아 응답 Map에 추가합니다.
		response.put("isTaken", isTaken);

		// HTTP 200 OK 상태 코드와 함께 JSON 응답을 반환합니다.
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/api/mypage/changePassword")
	@ResponseBody
	public ResponseEntity<Map<String, Boolean>> changePassword(@RequestBody Map<String, String> payload,
			HttpSession session) {
		SessionUserDto loginUser = (SessionUserDto) session.getAttribute("loginUser");
		Map<String, Boolean> response = new HashMap<>();

		if (loginUser == null) {
			response.put("success", false);
			// 필요하다면 message 필드 추가: response.put("message", "세션이 만료되었습니다.");
			return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
		}

		Integer userNo = loginUser.getUserNo();
		String currentPassword = payload.get("currentPassword");
		String newPassword = payload.get("newPassword"); // 프론트에서 보낸
															// 'newPassword' 키

		if (currentPassword == null || currentPassword.isEmpty() || newPassword == null || newPassword.isEmpty()) {
			response.put("success", false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		try {
			// Service 계층 호출: 새 비밀번호로 업데이트
			// 이 메서드 내부에서 PasswordEncoder를 사용하여 새 비밀번호를 암호화해야 합니다.
			boolean isUpdated = mypageService.updateUserPassword(userNo, newPassword);

			response.put("success", isUpdated);

		} catch (Exception e) {
			log.error("비밀번호 변경 중 오류 발생: userNo={}, newPassword={}", userNo, newPassword, e);
			response.put("success", false);
			// response.put("message", "서버 오류로 인해 비밀번호 변경에 실패했습니다.");
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	// --- 회원 탈퇴 API 엔드포인트 추가 ---
	@PostMapping("/api/mypage/secede")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> secedeUser(HttpSession session, // HttpSession
																				// 직접
																				// 주입
			HttpServletRequest request) { // 세션 무효화를 위해 HttpServletRequest 추가
		SessionUserDto loginUser = (SessionUserDto) session.getAttribute("loginUser"); // HttpSession에서 직접 가져옴
		Map<String, Object> response = new HashMap<>();

		// 1. 로그인 상태 확인 (세션에 사용자 정보가 있는지 확인)
		if (loginUser == null || (Integer) loginUser.getUserNo() == null) {
			log.warn("Unauthorized secession attempt: no loggedInUser or userNo in session.");
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED); // 401
																			// Unauthorized
		}

		Integer userNo = loginUser.getUserNo();
		log.info("회원 탈퇴 요청: userNo={}", userNo);

		try {
			// 2. 서비스 계층을 호출하여 회원 탈퇴 로직 수행
			// MypageService에 실제 DB에서 사용자 정보를 삭제하는 메서드를 구현해야 합니다.
			boolean isSeceded = mypageService.secedeUser(userNo); // 사용자 번호로 탈퇴
																	// 처리

			if (isSeceded) {
				log.info("회원 탈퇴 성공: userNo={}", userNo);
				// 3. 탈퇴 성공 시 세션 무효화
				// @SessionAttributes와 함께 사용 시 SessionStatus가 더 권장되지만,
				// 즉시 세션을 완전히 날려버리려면 HttpSession invalidate가 강력합니다.
				HttpSession currentSession = request.getSession(false);
				if (currentSession != null) {
					currentSession.invalidate(); // 세션 무효화 (세션에 저장된 모든 정보 삭제)
				}

				response.put("success", true);
				response.put("message", "회원 탈퇴가 처리되었습니다.");
				// 프론트엔드에서 /logout으로 리다이렉트할 것이므로, 백엔드에서 특정 리다이렉트 URL을 줄 필요는
				// 없습니다.
			} else {
				log.warn("회원 탈퇴 실패 (서비스 로직에서 실패): userNo={}", userNo);
				response.put("success", false);
				response.put("message", "회원 탈퇴에 실패했습니다. 관리자에게 문의해주세요.");
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal
																							// Server Error
			}

		} catch (Exception e) {
			log.error("회원 탈퇴 중 예상치 못한 오류 발생: userNo={}", userNo, e);
			response.put("success", false);
			response.put("message", "서버 오류로 인해 회원 탈퇴에 실패했습니다.");
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server
																						// Error
		}

		return new ResponseEntity<>(response, HttpStatus.OK); // 200 OK
	}

	@PostMapping("/api/mypage/send-email-auth-code")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> sendSignupEmailAuthCode(@RequestBody Map<String, String> payload,
			@SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser, // 세션에서
																								// loginUser
																								// 객체
																								// 주입
			HttpSession session) {
		String newEmail = payload.get("email");
		Map<String, Object> response = new HashMap<>();

		// 1. 이메일 주소 유효성 검사 (기본적인 null, empty 확인)
		if (newEmail == null || newEmail.isEmpty()) {
			response.put("success", false);
			response.put("message", "이메일 주소를 입력해주세요.");
			return ResponseEntity.badRequest().body(response);
		}

		// 2. 현재 로그인된 사용자 정보 확인 (SessionUserDto 활용)
		if (loginUser == null || (Integer) loginUser.getUserNo() == null) { // loginUser
																			// 객체
																			// 또는
																			// userNo가
																			// 없는
																			// 경우
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response); // 401 Unauthorized
		} // 시
		int loggedInUserNo = loginUser.getUserNo(); // SessionUserDto에서 userNo
													// 추출
		// 세션에
		User currentUser = mypageService.MyPageInfo(loggedInUserNo); // MypageService에서
																		// 사용자
																		// 정보 조회
		if (currentUser == null) {
			response.put("success", false);
			response.put("message", "사용자 정보를 찾을 수 없습니다.");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // 404
																				// Not
																				// Found
		}

		String currentEmail = currentUser.getEmail(); // 현재 로그인된 사용자의 기존 이메일

		// 3. 입력된 새 이메일이 현재 사용자의 이메일과 동일한지 확인
		// Objects.equals()는 null 안전하게 문자열 비교
		if (Objects.equals(newEmail, currentEmail)) {
			response.put("success", false);
			response.put("message", "현재 사용 중인 이메일 주소입니다. 다른 이메일을 입력해주세요.");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response); // 400
																					// Bad
																					// Request
		}

		// 4. 입력된 새 이메일이 다른 사용자에 의해 이미 사용 중인지 확인
		if (mypageService.isEmailTakenByOtherUser(newEmail, loggedInUserNo)) {
			response.put("success", false);
			response.put("message", "이미 다른 계정에서 사용 중인 이메일 주소입니다.");
			return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
		}
		try {
			String authCode = emailService.sendAuthCodeForChangEmail(newEmail); // EmailService에서
																				// 인증코드
																				// 생성
																				// 및
																				// 발송

			// 세션에 인증 코드 저장 (새 이메일 주소에 대한 인증임을 명확히)
			// 추후 인증 코드 확인할 때 이 키를 사용
			session.setAttribute("emailUpdateAuthCode_" + newEmail, authCode);
			session.setMaxInactiveInterval(5 * 60); // 5분 유효 시간 설정

			response.put("success", true);
			response.put("message", "인증번호가 발송되었습니다.");
			return ResponseEntity.ok(response); // 200 OK
		} catch (Exception e) {
			// 로깅 프레임워크 사용을 권장합니다. (예: Log4j, Logback)
			System.err.println("이메일 인증번호 발송 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "인증번호 발송에 실패했습니다. 다시 시도해주세요.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // 500 Internal Server Error
		}

	}

	@PostMapping("/api/mypage/verify-email-auth-code")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> verifyEmailAuthCode( // 메서드명 변경: 업데이트 로직이 없으므로
			@RequestBody Map<String, String> payload,
			@SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser, HttpSession session) {
		log.info("verifyEmailAuthCode 메서드 진입"); // 로그도 변경

		String emailToVerify = payload.get("email");
		String enteredAuthCode = payload.get("authCode");
		Map<String, Object> response = new HashMap<>();

		log.info("클라이언트로부터 받은 email: {}, authCode: {}", emailToVerify, enteredAuthCode);

		if (emailToVerify == null || emailToVerify.isEmpty() || enteredAuthCode == null || enteredAuthCode.isEmpty()) {
			response.put("success", false);
			response.put("message", "이메일 주소와 인증번호를 모두 입력해주세요.");
			return ResponseEntity.badRequest().body(response);
		}

		if (loginUser == null || (Integer)loginUser.getUserNo() == null) {
			response.put("success", false);
			response.put("message", "로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
		}
		Integer loggedInUserNo = loginUser.getUserNo(); // 변수 사용은 유지

		String storedAuthCode = (String) session.getAttribute("emailUpdateAuthCode_" + emailToVerify);

		if (storedAuthCode == null) {
			response.put("success", false);
			response.put("message", "유효하지 않거나 만료된 인증번호입니다. 다시 인증을 요청해주세요.");
			return ResponseEntity.status(HttpStatus.GONE).body(response);
		}

		if (!enteredAuthCode.equals(storedAuthCode)) {
			response.put("success", false);
			response.put("message", "인증번호가 일치하지 않습니다.");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
		}
		try {
			// 1. 서비스 계층 호출: 이메일 업데이트
			boolean updateSuccess = mypageService.updateUserEmail(loggedInUserNo, emailToVerify);

			if (updateSuccess) {
				// 2. 이메일 업데이트 성공 후, 세션에서 인증 코드 제거 (일회용으로 사용)
				session.removeAttribute("emailUpdateAuthCode_" + emailToVerify);
				
				// 3. 세션의 SessionUserDto 객체 이메일 필드 갱신
				// SessionUserDto에 setEmail 메서드가 있다고 가정
				loginUser.setEmail(emailToVerify); 

				response.put("success", true);
				response.put("message", "이메일이 변경되었습니다!"); // 성공 메시지
				return ResponseEntity.ok(response);
			} else {
				// 서비스에서 false를 반환했다면 (예: 변경 사항 없음, 중복 등)
				response.put("success", false);
				response.put("message", "이메일 업데이트에 실패했습니다. 이미 사용 중인 이메일이거나 변경 사항이 없습니다.");
				return ResponseEntity.status(HttpStatus.CONFLICT).body(response); // 409 Conflict 또는 400 Bad Request
			}
		} catch (Exception e) {
			log.error("이메일 업데이트 중 오류 발생: userNo={}, email={}, 에러: {}", loggedInUserNo, emailToVerify, e.getMessage(), e);
			response.put("success", false);
			response.put("message", "이메일 업데이트 중 서버 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/api/mypage/upload")
	public ResponseEntity<Map<String, String>> uploadCertificate(@RequestParam("companyName") String companyName,
			@RequestParam("certificateFile") MultipartFile certificateFile,
			@SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser, HttpSession session,
			RedirectAttributes redirectAttributes) {
		Map<String, String> responseBody = new HashMap<>(); // 응답 본문용 Map
		Integer userNoFromSession = loginUser.getUserNo();
		System.out.println(userNoFromSession);
		// 세션의 userNo와 폼에서 넘어온 userNo가 일치하는지 확인 (보안 강화)
		if (userNoFromSession == null) {

			responseBody.put("success", "false");
			return new ResponseEntity<>(responseBody, HttpStatus.UNAUTHORIZED); // 401 Unauthorized
		}

		if (companyName == null || companyName.isEmpty()) {
			log.warn("재직증명서 업로드: 회사명이 누락되었습니다. userNo: {}", userNoFromSession);
			responseBody.put("success", "false");
			responseBody.put("message", "회사명을 입력해주세요.");
			return new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST); // 400
																				// Bad
																				// Request
		}
		if (certificateFile.isEmpty()) {
			log.warn("재직증명서 업로드: 파일이 첨부되지 않았습니다. userNo: {}", userNoFromSession);
			responseBody.put("success", "false");
			responseBody.put("message", "재직증명서 파일을 선택해주세요.");
			return new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST); // 400
																				// Bad
																				// Request
		}
		String contentType = certificateFile.getContentType();
		String originalFileName = certificateFile.getOriginalFilename();
		String fileExtension = "";

		// 허용할 이미지 MIME 타입 목록
		List<String> allowedImageMimeTypes = Arrays.asList("image/jpg", "image/jpeg", "image/png", "image/gif",
				"image/bmp", "image/webp");

		// MIME 타입 검사
		if (contentType == null || !allowedImageMimeTypes.contains(contentType.toLowerCase())) {
			log.warn("재직증명서 업로드: 허용되지 않는 파일 형식입니다. userNo={}, Content-Type={}", userNoFromSession, contentType);
			responseBody.put("success", "false");
			responseBody.put("message", "이미지 파일 (JPG, PNG, GIF 등)만 업로드할 수 있습니다.");
			return new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST);
		}
		//파일 확장자 검사 
		if (originalFileName != null && originalFileName.contains(".")) {
			fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
		}
		
		// 허용할 이미지 확장자 목록 (MIME 타입 검사로 충분할 수 있지만, 이중 검증)
        List<String> allowedImageExtensions = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"
        );
		
        if (fileExtension.isEmpty() || !allowedImageExtensions.contains(fileExtension)) {
            log.warn("재직증명서 업로드: 허용되지 않는 파일 확장자입니다. userNo={}, 확장자={}", userNoFromSession, fileExtension);
            responseBody.put("success", "false");
            responseBody.put("message", "이미지 파일 (JPG, PNG, GIF 등)만 업로드할 수 있습니다.");
            return new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST);
       }
		
		String storedFileName = UUID.randomUUID().toString() + fileExtension; // UUID_originalExtension

		// WebMvcConfig에서 정의한 동일한 기본 경로를 사용
		Path baseUploadDir = Paths.get(System.getProperty("user.dir")).getParent().resolve("imgUpload");

		// ⭐⭐ 이 부분을 수정해야 합니다. verificationFiles 하위 디렉토리를 포함시킵니다. ⭐⭐
		Path verificationFilesDir = baseUploadDir.resolve("verificationFiles"); // 최종 저장될 디렉토리
		Path targetLocation = verificationFilesDir.resolve(storedFileName); // 파일의 최종 경로

		try {
			// 디렉토리가 없으면 생성 (verificationFiles까지 모두 생성)
			if (!Files.exists(verificationFilesDir)) {
				Files.createDirectories(verificationFilesDir);
				log.info("파일 업로드 디렉토리 생성: {}", verificationFilesDir);
			}
			Files.copy(certificateFile.getInputStream(), targetLocation);
			log.info("파일 저장 성공: userNo={}, originalFileName={}, storedFileName={}, 실제경로={}", userNoFromSession,
					originalFileName, storedFileName, targetLocation.toAbsolutePath());

			// 1. EmploymentCertificate 엔티티 객체 생성
			EmploymentCertificate newCertificate = new EmploymentCertificate();
			newCertificate.setUserNo(userNoFromSession);
			newCertificate.setCompanyName(companyName);

			// ⭐ DB에 저장할 파일 경로/이름을 웹 접근 경로에 맞춰 저장합니다.
			// addResourceHandler는 "/upload/verify/"로 시작하는 URL을 "/verificationFiles/"와
			// 매핑합니다.
			// 따라서 DB에는 파일명만 저장하거나, "/upload/verify/" + 파일명을 저장하는 것이 일반적입니다.
			newCertificate.setFilePath(storedFileName); // 웹 접근 URL의 마지막 부분 (파일 이름)만 저장
														// (DB에 저장된 이 이름을 통해 웹에서 파일을 다시 찾을 수 있습니다.)
			newCertificate.setUploadDate(LocalDateTime.now());
			newCertificate.setUpdateDate(LocalDateTime.now());
			newCertificate.setStatus("PENDING");

			// 2. 서비스에 Entity 직접 전달
			boolean success = mypageService.registerEmploymentCertificate(newCertificate);

			if (success) {
				log.info("재직증명서 DB 등록 성공: userNo={}, companyName={}", userNoFromSession, companyName);
				responseBody.put("success", "true");
				responseBody.put("message", "재직 증명서가 제출되었습니다.");
				return new ResponseEntity<>(responseBody, HttpStatus.OK); // 200
																			// OK
			} else {
				log.error("재직증명서 DB 등록 실패: userNo={}, companyName={}. 저장된 파일 삭제 시도.", userNoFromSession, companyName);
				Files.deleteIfExists(targetLocation);
				responseBody.put("success", "false");
				responseBody.put("message", "재직 증명서 등록에 실패했습니다. 다시 시도해주세요.");
				return new ResponseEntity<>(responseBody, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal
																								// Server Error
			}
		} catch (IOException e) {
			log.error("파일 저장 중 오류 발생: userNo={}, fileName={}, 에러: {}", userNoFromSession, originalFileName,
					e.getMessage(), e);
			responseBody.put("success", "false");
			responseBody.put("message", "파일 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
			return new ResponseEntity<>(responseBody, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server
																							// Error
		} catch (Exception e) {
			log.error("재직증명서 업로드 중 예상치 못한 오류 발생: userNo={}, 에러: {}", userNoFromSession, e.getMessage(), e);
			responseBody.put("success", "false");
			responseBody.put("message", "재직 증명서 업로드 중 예상치 못한 오류가 발생했습니다.");
			return new ResponseEntity<>(responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PostMapping("/api/mypage/update-profile") // ★★★ 새로운 통합 API 엔드포인트 ★★★
	@ResponseBody
	public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> payload,
	                                                        @SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser) {
	    Map<String, Object> response = new HashMap<>();

	    if (loginUser == null || (Integer)loginUser.getUserNo() == null) {
	        response.put("success", false);
	        response.put("message", "로그인이 필요합니다.");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	    }
	    Integer userNo = loginUser.getUserNo();

	    // 서비스 계층에 넘길 데이터를 담을 객체 (혹은 DTO)
	    // Map 대신 UserDto 같은 DTO를 사용하는 것이 더 좋습니다.
	    String newNickname = (String) payload.get("nickname");
	    String newEmail = (String) payload.get("email");
	    Boolean employmentInfoSubmitted = (Boolean) payload.get("employmentInfoSubmitted");

	    try {
	        // 서비스 계층 호출: 통합 업데이트 메서드 (새로 생성해야 함)
	        boolean updateSuccess = mypageService.updateUserProfile(userNo, newNickname, newEmail, employmentInfoSubmitted);

	        if (updateSuccess) {
	            // 세션 정보 갱신 (변경사항이 실제로 있었다면)
	            if (newNickname != null) {
	                loginUser.setNickname(newNickname);
	            }
	            if (newEmail != null) {
	                loginUser.setEmail(newEmail);
	            }
	            // 재직 증명서는 이미 upload 시점에 DB에 반영되었으므로, 세션에 별도 정보 업데이트는 필요 없을 수 있음.
	            // 필요하다면 User 엔티티에 재직 상태 필드를 추가하고 세션 업데이트

	            response.put("success", true);
	            return ResponseEntity.ok(response);
	        } else {
	            // 서비스에서 false를 반환한 경우 (예: 닉네임/이메일 중복, 유효성 오류 등)
	            response.put("success", false);
	            response.put("message", "정보 수정에 실패했습니다. 유효하지 않은 항목이 있거나 이미 사용 중일 수 있습니다.");
	            return ResponseEntity.badRequest().body(response); // 400 Bad Request (구체적인 오류)
	        }
	    } catch (IllegalArgumentException e) { // 서비스에서 던지는 유효성/비즈니스 예외
	        log.warn("Profile update validation error: userNo={}, error: {}", userNo, e.getMessage());
	        response.put("success", false);
	        response.put("message", e.getMessage());
	        return ResponseEntity.badRequest().body(response);
	    } catch (Exception e) {
	        log.error("Error during profile update: userNo={}, error: {}", userNo, e.getMessage(), e);
	        response.put("success", false);
	        response.put("message", "서버 오류로 인해 정보 수정에 실패했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}
	@GetMapping("/api/mypage/employment-status")
	@ResponseBody
	public ResponseEntity<Map<String, String>> getEmploymentStatus(
			@SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser) {

		Map<String, String> response = new HashMap<>();

		// 1. 로그인 상태 확인
		if (loginUser == null || (Integer)loginUser.getUserNo() == null) {
			log.warn("Unauthorized employment status request: no loginUser in session.");
			response.put("message", "로그인이 필요합니다.");
			return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED); // 401 Unauthorized
		}

		Integer userNo = loginUser.getUserNo();

		try {
			// 2. MypageService를 통해 최신 재직 증명서의 상태 조회
			// 이 메서드는 MypageService에 새로 추가해야 합니다.
			String employmentStatus = mypageService.getLatestEmploymentStatusByUserNo(userNo);

			if (employmentStatus != null && !employmentStatus.isEmpty()) {
				response.put("status", employmentStatus);
				log.info("userNo {}의 재직 증명서 상태 조회 성공: {}", userNo, employmentStatus);
			} else {
				// 재직 증명서가 아직 제출되지 않았거나 상태가 없는 경우
				response.put("status", "NOT_SUBMITTED"); // 명시적인 메시지를 전달하거나, 아예 status 필드를 포함하지 않아도 됨
				log.info("userNo {}의 재직 증명서 상태 없음 (NOT_SUBMITTED).", userNo);
			}
			return new ResponseEntity<>(response, HttpStatus.OK); // 200 OK
		} catch (Exception e) {
			log.error("userNo {}의 재직 증명서 상태 조회 중 오류 발생: {}", userNo, e.getMessage(), e);
			response.put("message", "재직 증명서 상태 조회 중 서버 오류가 발생했습니다.");
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
		}
	}

	
}