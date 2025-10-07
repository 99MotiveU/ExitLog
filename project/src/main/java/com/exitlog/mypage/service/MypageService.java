package com.exitlog.mypage.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exitlog.admin.model.entity.EmploymentCertificate;
import com.exitlog.login.model.entity.User;
import com.exitlog.mypage.mapper.MypageMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MypageService {
	public MypageMapper mypageMapper;

	public MypageService(MypageMapper mypageMapper) {
		this.mypageMapper = mypageMapper;
	}

	public User MyPageInfo(int user_no) {

		return mypageMapper.MyPageInfo(user_no);

	}

	public String hashPassword(String password) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] hash = md.digest(password.getBytes());
			// System.out.println(Base64.getEncoder().encodeToString(hash)); // 디버깅용 출력
			return Base64.getEncoder().encodeToString(hash);
		} catch (NoSuchAlgorithmException e) {
			// 이 예외는 SHA-256 알고리즘이 존재하지 않을 때 발생하며, 일반적으로 발생하지 않습니다.
			throw new RuntimeException("비밀번호 해싱 중 오류 발생", e);
		}
	}

	public boolean checkUserPassword(Integer userNo, String enteredPassword) {
		User user = mypageMapper.MyPageInfo(userNo);

		if (user == null || user.getPassword() == null) {
			return false; // 사용자 정보가 없거나 비밀번호가 없는 경우
		}

		String dbHashedPassword = user.getPassword(); // DB에서 가져온 해시 + Base64 인코딩된 비밀번호
		String enteredHashedPassword = hashPassword(enteredPassword); // 사용자가 입력한 비밀번호를 해싱 + Base64 인코딩

		return enteredHashedPassword.equals(dbHashedPassword);
	}

	public boolean isNicknameTaken(String nickname) {
		// MypageMapper에 countNickname(String nickname) 메서드가 정의되어 있어야 합니다.
		// 이 메서드는 해당 닉네임을 가진 사용자의 수를 반환합니다 (0 또는 1 이상).
		int count = mypageMapper.countNickname(nickname);
		return count > 0; // 닉네임이 1개라도 존재하면 중복으로 간주하여 true 반환
	}

	// 새로 구현할 updateUserPassword 메서드
	@Transactional // 비밀번호 업데이트는 DB 변경 작업이므로 트랜잭션 처리 권장
	public boolean updateUserPassword(Integer userNo, String newPassword) {
		if (userNo == null || newPassword == null || newPassword.isEmpty()) {
			System.err.println("비밀번호 업데이트: userNo 또는 새 비밀번호가 유효하지 않습니다.");
			return false;
		}

		try {
			// 1. 새 비밀번호를 현재 서비스의 hashPassword 메서드를 사용하여 해싱합니다.
			String hashedNewPassword = hashPassword(newPassword);
			System.out.println("해싱된 새 비밀번호: " + hashedNewPassword); // 디버깅용 로그

			// 2. MypageMapper를 통해 해싱된 비밀번호를 DB에 업데이트합니다.
			// mypageMapper에 updateUserPasswordInDB(Integer userNo, String
			// hashedNewPassword) 메서드를 추가해야 합니다.
			int updatedRows = mypageMapper.updateUserPasswordInDB(userNo, hashedNewPassword);

			// 1보다 큰 값이 반환되면 성공 (보통 1이 반환됨)
			return updatedRows > 0;
		} catch (Exception e) {
			// DB 업데이트 중 발생할 수 있는 예외를 로깅
			System.err.println("비밀번호 업데이트 중 오류 발생: userNo=" + userNo + ", 에러: " + e.getMessage());
			// 실제 애플리케이션에서는 로그 프레임워크(ex. SLF4J, Log4j)를 사용하세요.
			return false;
		}
	}

	@Transactional
	public boolean secedeUser(Integer userNo) {
		if (userNo == null) {
			return false;
		}
		try {
			int deletedRows = mypageMapper.deleteUser(userNo);
			return deletedRows > 0;
		} catch (Exception e) {
			// 데이터베이스 작업 중 오류 발생 시
			System.err.println("회원 탈퇴 중 DB 오류 발생: " + e.getMessage());
			// @Transactional 어노테이션에 의해 트랜잭션이 자동으로 롤백됩니다.
			return false;
		}
	}

	public boolean isEmailTakenByOtherUser(String email, int currentUserNo) {
		// MypageMapper에 countEmailExcludingCurrentUser(String email, int userNo) 메서드가
		// 정의되어 있어야 합니다.
		// 이 메서드는 해당 이메일을 가진 사용자 중, userNo와 일치하지 않는 사용자의 수를 반환합니다.
		int count = mypageMapper.countEmailExcludingCurrentUser(email, currentUserNo);
		return count > 0; // 0보다 크면 다른 사용자에게 사용 중인 것
	}

	@Transactional
	public boolean registerEmploymentCertificate(EmploymentCertificate certificate) {
		// 필수 값 검증
		if (certificate == null || certificate.getUserNo() == null || certificate.getUserNo() <= 0
				|| certificate.getCompanyName() == null || certificate.getCompanyName().isEmpty()
				|| certificate.getFilePath() == null || certificate.getFilePath().isEmpty()) { // <--- 여기서 filePath 값을
																								// 사용
			log.warn("재직증명서 등록: 필수 정보(사용자 번호, 회사명, 파일 경로)가 엔티티에 누락되거나 유효하지 않습니다.");
			return false;
		}

		try {
			// DB에 저장하기 전에 uploadDate와 status를 설정합니다.
			// 컨트롤러에서 이미 설정되어 넘어올 수도 있지만, 서비스에서 한 번 더 확인/설정하는 것이 좋습니다.
			if (certificate.getUploadDate() == null) {
				certificate.setUploadDate(LocalDateTime.now());
			}
			if (certificate.getStatus() == null || certificate.getStatus().isEmpty()) {
				// 기본 상태를 "PENDING"으로 설정 (대기 중)
				certificate.setStatus("PENDING");
			}
			// updateDate는 등록 시에는 uploadDate와 동일하게 설정하거나, null로 두었다가 업데이트 시점에만 설정할 수 있습니다.
			// 여기서는 일단 uploadDate와 동일하게 설정하겠습니다.
			if (certificate.getUpdateDate() == null) {
				certificate.setUpdateDate(LocalDateTime.now());
			}

			log.info("재직증명서 등록 시도 (EmploymentCertificate 사용): {}", certificate);

			// mypageMapper.insertEmploymentCertificate는 EmploymentCertificate 객체를 받아서
			// 그 안의 filePath를 DB에 저장할 것입니다.
			int insertedRows = mypageMapper.insertEmploymentCertificate(certificate);
			return insertedRows > 0;
		} catch (Exception e) {
			log.error("재직증명서 등록 중 오류 발생 (EmploymentCertificate 사용): userNo={}, companyName={}, filePath={}, 에러: {}",
					certificate.getUserNo(), certificate.getCompanyName(), certificate.getFilePath(), e.getMessage(),
					e); // <--- 여기서도 filePath 값을 사용
			return false;
		}
	}

	@Transactional // DB 변경 작업은 트랜잭션 범위 내에서 이루어져야 합니다.
	public boolean updateNickname(Integer userNo, String newNickname) {
		log.info("닉네임 업데이트 서비스 호출: userNo={}, newNickname={}", userNo, newNickname);
		// MypageMapper를 사용하여 닉네임 업데이트
		// mypageMapper에 updateUserNicknameInDB(Integer userNo, String newNickname) 메서드
		// 필요
		try {
			int updatedRows = mypageMapper.updateUserNickname(userNo, newNickname);
			log.info("닉네임 업데이트 성공: userNo={}, newNickname={}", userNo, newNickname);
			return updatedRows > 0; // 1개 이상 업데이트되면 성공
		} catch (Exception e) {
			log.error("닉네임 업데이트 실패: userNo={}, newNickname={}, 에러: {}", userNo, newNickname, e.getMessage(), e);
			return false;
		}
	}

	// 8. 사용자 이메일 업데이트 (MyBatis 매퍼 사용)
	@Transactional // DB 변경 작업은 트랜잭션 범위 내에서 이루어져야 합니다.
	public boolean updateUserEmail(Integer userNo, String newEmail) {
		log.info("이메일 업데이트 서비스 호출: userNo={}, newEmail={}", userNo, newEmail);
		System.out.println(">>>>>>>>>>>>>>>>>>"+newEmail);
		try {
			int updatedRows = mypageMapper.updateUserEmail(userNo, newEmail);
			if (updatedRows > 0) {
				log.info("이메일 업데이트 성공: userNo={}, newEmail={}", userNo, newEmail);
				return true;
			} else {
				log.warn("이메일 업데이트 실패: userNo={}, newEmail={}. DB에서 행이 업데이트되지 않았습니다.", userNo, newEmail);
				return false;
			}
		} catch (Exception e) {
			log.error("이메일 업데이트 중 DB 오류 발생: userNo={}, newEmail={}, 에러: {}", userNo, newEmail, e.getMessage(), e);
			throw new RuntimeException("이메일 업데이트 중 데이터베이스 오류가 발생했습니다.", e);
		}
	}

	@Transactional // 여러 DB 작업이 묶이므로 @Transactional 필수
	public boolean updateUserProfile(Integer userNo, String newNickname, String newEmail, Boolean employmentInfoSubmitted) {
	    if (userNo == null || userNo <= 0) {
	        throw new IllegalArgumentException("유효한 사용자 번호가 필요합니다.");
	    }

	    User currentUser = mypageMapper.MyPageInfo(userNo);
	    if (currentUser == null) {
	        throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.");
	    }

	    boolean overallSuccess = true; // 모든 개별 업데이트의 성공 여부

	    // 1. 닉네임 업데이트 처리
	    if (newNickname != null) { // 닉네임 변경 요청이 있었다면
	        // 닉네임 유효성 검증 (컨트롤러에서 했지만 서비스에서 다시 하는 것이 안전)
	        if (newNickname.length() < 2 || newNickname.length() > 15 || !newNickname.matches("^[가-힣a-zA-Z0-9]+$")) {
	            throw new IllegalArgumentException("닉네임은 2자 이상 15자 이하의 한글, 영어, 숫자만 가능합니다.");
	        }
	        // 기존 닉네임과 동일한지 확인
	        if (!Objects.equals(newNickname, currentUser.getNickname())) {
	            // 다른 사용자에게 이미 사용 중인지 확인
	            if (mypageMapper.countNickname(newNickname) > 0) {
	                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
	            }
	            // 실제 닉네임 업데이트
	            if (mypageMapper.updateUserNickname(userNo, newNickname) <= 0) {
	                log.error("닉네임 DB 업데이트 실패: userNo={}, newNickname={}", userNo, newNickname);
	                overallSuccess = false; // 실패로 표시
	            }
	        }
	    }

	    // 2. 이메일 업데이트 처리
	    if (newEmail != null) { // 이메일 변경 요청이 있었다면
	        // 이메일 유효성 검증 (컨트롤러에서 했지만 서비스에서 다시 하는 것이 안전)
	        if (!newEmail.matches("^[^\s@]+@[^\s@]+\\.[^\s@]+$")) {
	            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
	        }
	        // 기존 이메일과 동일한지 확인
	        if (!Objects.equals(newEmail, currentUser.getEmail())) {
	            // 다른 사용자에게 이미 사용 중인지 확인
	            if (mypageMapper.countEmailExcludingCurrentUser(newEmail, userNo) > 0) {
	                throw new IllegalArgumentException("이미 다른 계정에서 사용 중인 이메일 주소입니다.");
	            }
	            // 실제 이메일 업데이트
	            if (mypageMapper.updateUserEmail(userNo, newEmail) <= 0) {
	                log.error("이메일 DB 업데이트 실패: userNo={}, newEmail={}", userNo, newEmail);
	                overallSuccess = false; // 실패로 표시
	            }
	        }
	    }

	    if (employmentInfoSubmitted != null && employmentInfoSubmitted) {
	    }

	    return overallSuccess; // 모든 업데이트가 성공했는지 여부 반환
	}

	public String getLatestEmploymentStatusByUserNo(Integer userNo) {
        if (userNo == null || userNo <= 0) {
            log.warn("getLatestEmploymentStatusByUserNo: 유효하지 않은 userNo가 전달되었습니다: {}", userNo);
            return null; // 또는 빈 문자열
        }
        try {
            // Mapper 호출: userNo를 기준으로 최신 재직 증명서의 상태를 조회
            String status = mypageMapper.selectLatestEmploymentStatusByUserNo(userNo);
            log.debug("UserNo {}의 재직 증명서 상태: {}", userNo, status);
            return status;
        } catch (Exception e) {
            log.error("userNo {}의 재직 증명서 상태 조회 중 데이터베이스 오류 발생: {}", userNo, e.getMessage(), e);
            throw new RuntimeException("재직 증명서 상태 조회 중 오류가 발생했습니다.", e);
        }
    }
}
