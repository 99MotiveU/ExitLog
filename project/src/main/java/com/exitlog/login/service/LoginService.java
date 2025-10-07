package com.exitlog.login.service;

import com.exitlog.login.model.entity.User;
import com.exitlog.log.service.CommentService; // 이 부분이 기존 코드에 있다면 그대로 유지
import com.exitlog.login.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * 사용자 로그인, 회원가입, 사용자 정보 조회 및 비밀번호 관련 비즈니스 로직을 처리하는 서비스 클래스.
 */
@Service
public class LoginService {

    private final CommentService commentService; // 이 부분이 기존 코드에 있다면 그대로 유지
    private final UserMapper userMapper;
    private final ActiveUserStore activeUserStore; // ActiveUserStore 주입

    public LoginService(UserMapper userMapper, CommentService commentService, ActiveUserStore activeUserStore) {
        this.userMapper = userMapper;
        this.commentService = commentService; // 이 부분이 기존 코드에 있다면 그대로 유지
        this.activeUserStore = activeUserStore; // ActiveUserStore 초기화
    }

    /**
     * 사용자 로그인 처리를 수행합니다.
     * 입력받은 비밀번호를 해싱하여 데이터베이스에 저장된 해싱된 비밀번호와 비교합니다.
     *
     * @param userId 사용자가 입력한 아이디
     * @param password 사용자가 입력한 비밀번호 (평문)
     * @return 로그인 성공 시 User 객체
     * @throws UserNotFoundException 아이디를 찾을 수 없는 경우
     * @throws PasswordMismatchException 비밀번호가 일치하지 않는 경우
     * @throws UserDeletedException 탈퇴한 회원이 로그인 시도 시 발생
     * @throws AlreadyLoggedInException 이미 로그인된 사용자가 다른 세션에서 로그인 시도 시 발생 (새로운 예외)
     */
    public User login(String userId, String password) throws UserNotFoundException, PasswordMismatchException, UserDeletedException, AlreadyLoggedInException {
        // 1. 아이디로 사용자 정보 조회
        User user = userMapper.findByUserId(userId);

        if (user != null) {
            System.out.println("[DEBUG] Mapper에서 조회된 사용자 '" + userId + "'의 isDel 값: " + user.getIsDel());
        } else {
            System.out.println("[DEBUG] Mapper에서 아이디 '" + userId + "'를 찾을 수 없음.");
        }
        // 사용자가 존재하지 않으면 UserNotFoundException 발생
        if (user == null) {
            System.out.println("[DEBUG] 로그인 실패: 아이디 '" + userId + "'를 찾을 수 없습니다."); 
            throw new UserNotFoundException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        System.out.println("[DEBUG] 사용자 '" + userId + "' 정보 조회 완료. isDel 값: " + user.getIsDel());

        // 2. ***** 핵심: isDel 컬럼 값 확인 및 탈퇴 회원 처리 (Boolean 타입 안전하게 처리) *****
        if (Boolean.TRUE.equals(user.getIsDel())) {
            System.out.println("[DEBUG] 로그인 차단: 사용자 '" + userId + "'는 탈퇴 회원입니다 (isDel=TRUE).");
            throw new UserDeletedException("탈퇴한 회원입니다. 로그인할 수 없습니다.");
        }

        // 3. 비밀번호 일치 여부 확인
        String hashedPassword = hashPassword(password);
        if (!user.getPassword().equals(hashedPassword)) {
            System.out.println("[DEBUG] 로그인 실패: 사용자 '" + userId + "'의 비밀번호가 일치하지 않습니다.");
            throw new PasswordMismatchException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 4. ***** 핵심: 다중 로그인 방지 로직 추가 *****
        // 현재 로그인하려는 user ID가 ActiveUserStore에 이미 있는지 확인
        if (activeUserStore.isUserLoggedIn(userId)) {
            System.out.println("[DEBUG] 로그인 차단: 사용자 '" + userId + "'는 이미 로그인 중입니다.");
            throw new AlreadyLoggedInException("이미 로그인된 사용자입니다. 기존 세션을 종료하고 다시 시도해주세요.");
        }

        System.out.println("[DEBUG] 로그인 성공: 사용자 '" + userId + "'."); 
        // 모든 검증을 통과했다면, 로그인 성공으로 간주하고 User 객체를 반환
        return user;
    }

    /**
     * 사용자 ID로 사용자 정보를 조회합니다.
     *
     * @param userId 조회할 사용자의 아이디
     * @return 조회된 User 객체, 없으면 null
     */
    public User getUserByUserId(String userId) {
        return userMapper.findByUserId(userId);
    }

    /**
     * 닉네임으로 사용자 정보를 조회합니다.
     *
     * @param nickname 조회할 사용자의 닉네임
     * @return 조회된 User 객체, 없으면 null
     */
    public User getUserByNickname(String nickname) {
        return userMapper.findByNickname(nickname);
    }

    /**
     * 이메일로 사용자 정보를 조회합니다.
     *
     * @param email 조회할 사용자의 이메일 주소
     * @return 조회된 User 객체, 없으면 null
     */
    public User getUserByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    /**
     * 게시글 번호(logNo)로 해당 게시글을 작성한 사용자의 userNo를 조회합니다.
     * 주로 사용자 인터셉터 등의 용도로 사용됩니다.
     *
     * @param logNo 조회할 게시글 번호
     * @return 게시글 작성자의 userNo
     */
    public int getUserNoByLogNo(int logNo) {
        return userMapper.findBylogNo(logNo);
    }

    /**
     * 새로운 사용자를 등록합니다.
     * 아이디, 닉네임, 이메일 중복 체크를 수행하며, 비밀번호는 해싱하여 저장합니다.
     *
     * @param user 등록할 사용자 정보 (User DTO)
     * @return 회원가입 성공 여부
     * @throws IllegalArgumentException 아이디, 닉네임, 이메일 중복 시 발생
     */
    @Transactional // 트랜잭션 처리
    public boolean registerUser(User user) {
        // 아이디 중복 체크
        if (userMapper.findByUserId(user.getUserId()) != null) {
            System.out.println("[DEBUG] 회원가입 실패: 아이디 '" + user.getUserId() + "' 중복.");
            throw new IllegalArgumentException("DUPLICATE_ID"); // 아이디 중복 에러
        }

        // 닉네임 중복 체크
        if (userMapper.findByNickname(user.getNickname()) != null) {
            System.out.println("[DEBUG] 회원가입 실패: 닉네임 '" + user.getNickname() + "' 중복.");
            throw new IllegalArgumentException("DUPLICATE_NICKNAME"); // 닉네임 중복 에러
        }

        // 이메일 중복 체크
        System.out.println("[DEBUG] 회원가입 시도: 닉네임 " + user.getNickname()); 
        if (userMapper.findByEmail(user.getEmail()) != null) {
            System.out.println("[DEBUG] 회원가입 실패: 이메일 '" + user.getEmail() + "' 중복.");
            throw new IllegalArgumentException("DUPLICATE_EMAIL");
        }

        // 비밀번호 해싱 후 DTO에 설정
        user.setPassword(hashPassword(user.getPassword()));
        user.setIsDel(false);
        System.out.println("[DEBUG] 신규 사용자 '" + user.getUserId() + "' 등록: isDel = " + user.getIsDel()); 

        userMapper.save(user); 
        System.out.println("[DEBUG] 사용자 '" + user.getUserId() + "' 데이터베이스 저장 완료.");
        return true;
    }

    /**
     * 사용자 아이디와 이메일 주소로 사용자 정보를 조회합니다.
     * 비밀번호 찾기 시 아이디와 이메일이 일치하는지 확인하는 용도로 사용됩니다.
     *
     * @param userId 조회할 사용자의 아이디
     * @param email 조회할 사용자의 이메일 주소
     * @return 아이디와 이메일이 모두 일치하는 User 객체, 없으면 null
     */
    public User findUserByUserIdAndEmail(String userId, String email) {
        return userMapper.findByUserIdAndEmail(userId, email);
    }

    /**
     * 특정 사용자의 비밀번호를 업데이트합니다.
     * 새 비밀번호는 해싱되어 저장됩니다.
     * @param userId 비밀번호를 변경할 사용자의 아이디
     * @param newPassword 새로 설정할 비밀번호 (평문)
     * @return 비밀번호 변경 성공 여부
     * @throws IllegalArgumentException 새 비밀번호가 기존 비밀번호와 동일한 경우 발생
     */
    @Transactional
    public boolean updatePassword(String userId, String newPassword) {
        User user = userMapper.findByUserId(userId); // 사용자 ID로 사용자 조회
        if (user != null) {
            String hashedNewPassword = hashPassword(newPassword); // 새 비밀번호 해싱

            // 새 비밀번호가 기존 비밀번호와 동일한지 비교
            // user.getPassword()는 현재 데이터베이스에 저장된 해시된 비밀번호입니다.
            if (user.getPassword().equals(hashedNewPassword)) {
                System.out.println("[DEBUG] 비밀번호 업데이트 실패: 사용자 '" + userId + "'의 새 비밀번호가 기존과 동일."); // 디버그 로그 추가
                throw new IllegalArgumentException("NEW_PASSWORD_IS_SAME_AS_OLD");
            }

            // 새 비밀번호로 업데이트
            user.setPassword(hashedNewPassword);
            userMapper.updatePassword(user);
            System.out.println("[DEBUG] 사용자 '" + userId + "' 비밀번호 업데이트 완료."); // 디버그 로그 추가
            return true;
        }
        System.out.println("[DEBUG] 비밀번호 업데이트 실패: 사용자 '" + userId + "'를 찾을 수 없음."); // 디버그 로그 추가
        return false; // 해당 ID의 사용자가 없을 경우
    }

    /**
     * 평문 비밀번호를 SHA-256 알고리즘으로 해싱하고 Base64로 인코딩합니다.
     * @param password 해싱할 평문 비밀번호
     * @return 해싱되고 Base64 인코딩된 비밀번호 문자열
     * @throws RuntimeException 비밀번호 해싱 중 오류 발생 시
     */
    public String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            System.err.println("[ERROR] 비밀번호 해싱 중 오류 발생: " + e.getMessage()); // 오류 로그 추가
            throw new RuntimeException("비밀번호 해싱 중 오류 발생", e);
        }
    }

    // 커스텀 예외 클래스들 (LoginService 내부에 정의되어 있으므로 LoginController에서 Import 시 LoginService.UserDeletedException 등으로 명시)
    // 별도의 파일로 분리하는 것을 권장합니다.
    public static class UserDeletedException extends RuntimeException {
        public UserDeletedException(String message) {
            super(message);
        }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) {
            super(message);
        }
    }

    public static class PasswordMismatchException extends RuntimeException {
        public PasswordMismatchException(String message) {
            super(message);
        }
    }

    // 새로 추가된 예외
    public static class AlreadyLoggedInException extends RuntimeException {
        public AlreadyLoggedInException(String message) {
            super(message);
        }
    }

    /**
     * 사용자 번호(userNo)로 사용자의 역할을 조회합니다.
     * @param userNo 조회할 사용자 번호
     * @return 사용자의 역할 (예: 숫자 코드)
     */
    public int getRoleByUserNo(int userNo) {
        return userMapper.getRole(userNo);
    }
}