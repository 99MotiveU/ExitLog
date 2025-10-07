package com.exitlog.login.service;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 현재 활성화된 사용자 세션을 추적하는 저장소.
 * userId를 키로, sessionId를 값으로 가집니다.
 * 이 클래스는 Spring 컴포넌트로 등록되어 애플리케이션 전역에서 사용됩니다.
 */
@Component
public class ActiveUserStore {

    // 동시성 문제를 해결하기 위해 ConcurrentHashMap 사용
    // userId -> sessionId
    private final Map<String, String> activeUsers = new ConcurrentHashMap<>();

    /**
     * 사용자를 활성 사용자 목록에 추가합니다.
     * @param userId 로그인한 사용자의 ID
     * @param sessionId 해당 사용자의 세션 ID
     */
    public void addActiveUser(String userId, String sessionId) {
        activeUsers.put(userId, sessionId);
        System.out.println("[ActiveUserStore] User '" + userId + "' logged in with session ID: " + sessionId);
        System.out.println("[ActiveUserStore] Current active users: " + activeUsers.keySet());
    }

    /**
     * 활성 사용자 목록에서 사용자를 제거합니다.
     * @param userId 로그아웃하거나 세션이 만료된 사용자의 ID
     */
    public void removeActiveUser(String userId) {
        activeUsers.remove(userId);
        System.out.println("[ActiveUserStore] User '" + userId + "' logged out.");
        System.out.println("[ActiveUserStore] Current active users: " + activeUsers.keySet());
    }

    /**
     * 특정 사용자 ID가 현재 로그인되어 있는지 확인합니다.
     * @param userId 확인할 사용자의 ID
     * @return 로그인되어 있으면 true, 아니면 false
     */
    public boolean isUserLoggedIn(String userId) {
        return activeUsers.containsKey(userId);
    }

    /**
     * 특정 사용자 ID에 해당하는 세션 ID를 반환합니다.
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 세션 ID (로그인되어 있지 않으면 null)
     */
    public String getSessionId(String userId) {
        return activeUsers.get(userId);
    }

    /**
     * 현재 활성화된 모든 사용자 목록을 반환합니다.
     * 외부에서 맵을 수정할 수 없도록 UnmodifiableMap으로 반환합니다.
     * @return 활성화된 사용자 맵
     */
    public Map<String, String> getActiveUsers() {
        return Collections.unmodifiableMap(activeUsers);
    }
}