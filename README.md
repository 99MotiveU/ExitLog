# ExitLog: 당신의 다음 커리어를 위한 솔직하고 현명한 가이드

**ExitLog**는 퇴사, 이직, 구직자들이 모여 생생한 기업 경험을 공유하는 신뢰 기반 커뮤니티 플랫폼입니다.  저희의 핵심 가치는 "검증된 정보로 불확실성을 줄이고, 더 나은 커리어 선택을 돕는다"입니다. 

---

## 🚀 프로젝트 개요

### 현존하는 문제점
현재 구직 시장은 신뢰할 수 있는 정보를 얻기 어려운 구조적인 문제를 안고 있습니다.
* **홍보성 정보:** 대부분의 기업 정보가 홍보에 의존하고 있습니다. 
* **솔직함의 부재:** 재직 중인 직원은 솔직한 후기를 작성하기 어렵습니다. 
* **신뢰도 부족:** 익명 커뮤니티는 감정적이거나 허위 정보가 만연합니다. 

### ExitLog의 해결책
ExitLog는 솔직하고 검증된 경험담과 이직을 위한 실질적인 정보가 통합된 플랫폼의 부재를 해결하고자 합니다. 
* **신뢰와 익명성:** '재직 증명' 시스템을 통해 정보의 신뢰도를 높이는 동시에 사용자의 익명성을 보장합니다. 
* **체계적인 이직 계획:** 사람인 Open API를 활용한 '공고 캘린더'를 제공하여 체계적인 이직 계획을 지원합니다. 

---

## 👥 팀 소개: Team 200

팀명 **Team 200**은 "HTTP 200 OK" 상태 코드처럼 클라이언트의 요청을 정확히 이해하고 성공적으로 처리하겠다는 의미를 담고 있습니다. 

| 이름 | 역할 | 주요 기여 |
| :---- | :--- | :--- |
| **[김소영](https://github.com/shong69)** | **팀장** | - **기술:** 로그(게시글) 및 댓글 CRUD, 메인페이지, 채용공고 캘린더 (사람인 API + Redis 캐싱)  <br>- **운영:** 요구사항 명세서 작성, 개발 환경 세팅, Git 전략 및 PR 관리, 문서화  |
| **[유동기](https://github.com/99MotiveU)** | **팀원** | - **기술:** 회원가입, 로그인, 아이디/비밀번호 찾기, 메인페이지, 채용공고 캘린더, Azure - 프로젝트, Redis 서버 배포 및 운영  <br>- **운영:** 간트차트 관리  |
| **[정유리](https://github.com/owzl)** | **팀원** | - **기술:** 로그 조회 및 신고, 관리자 페이지 (신고/인증 관리), Azure - MySQL 서버 배포 및 운영  <br>- **운영:** 서비스 기획, UI 디자인 및 와이어프레임 제작  |
| **[노종현](https://github.com/nojong99)** | **팀원** | - **기술:** 마이페이지, 회원 정보 수정/탈퇴, 재직 인증서 제출  <br>- **운영:** 유스케이스 작성, ERD 초안, 로고/파비콘 디자인  |

---

## 🛠️ 기술 스택

| 구분 | 사용 기술 |
| :--- | :--- |
| **Frontend** | ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Thymeleaf](https://img.shields.io/badge/Thymeleaf-%23005C0F.svg?style=for-the-badge&logo=Thymeleaf) ![ToastUI Editor](https://img.shields.io/badge/TOAST%20UI%20Editor-grey?style=for-the-badge) |
| **Backend** | ![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white) ![MyBatis](https://img.shields.io/badge/MyBatis-black?style=for-the-badge) |
| **Database** | ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) |
| **DevOps & Tools** | ![Azure](https://img.shields.io/badge/Azure-blue?style=for-the-badge&logo=microsoft%20azure&logoColor=blue&labelColor=FFFFFF&color=0078D4) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) ![Saramin API](https://img.shields.io/badge/Saramin%20API-orange?style=for-the-badge) |

---

## ✨ 주요 기능

### 1. 메인 페이지
* 조회수 높은 인기 로그와 오늘 마감되는 인기 공고를 빠르게 확인할 수 있습니다. 
* 최신 사용자 활동을 비동기 호출로 실시간 표시합니다. 
* `Promise.all`을 사용해 여러 API를 동시에 호출하여 데이터 로딩 속도를 개선했습니다. 

### 2. 회원 인증
* **회원가입:** 이메일 인증을 통해 신뢰할 수 있는 사용자만 가입할 수 있습니다. 
* **로그인/로그아웃:** 안전한 세션 관리를 지원합니다. 
* **아이디/비밀번호 찾기:** 이메일 인증을 통해 안전하게 계정 정보를 찾을 수 있습니다. 

### 3. '로그' 게시판 (커뮤니티)
신뢰와 익명성을 모두 확보한 커뮤니티 공간입니다. 
* **게시글 CRUD:** 회원은 게시글과 댓글을 자유롭게 작성, 수정, 삭제할 수 있습니다. 
* **강력한 검색:** 제목, 작성자, 제목+내용 기반으로 원하는 게시글을 쉽게 찾을 수 있습니다. 
* **재직 인증 마크:** 재직 인증을 완료한 회원의 글에는 인증 마크가 표시되어 신뢰도를 극대화합니다. 
* **다채로운 콘텐츠:** 이모지+키워드 태그와 가벼운 'TMI' 섹션으로 직관적이고 재미있는 정보를 제공합니다. 
* **계층형 댓글:** 대댓글 기능을 지원하며, `Soft Delete` 방식으로 데이터 무결성을 유지합니다. 
* **신고 기능:** 사용자들이 직접 유해 게시물을 신고하여 건강한 커뮤니티를 만들어갑니다. 

### 4. 공고 캘린더
흩어져 있는 채용 공고를 한눈에 보고 일정을 관리하는 직관적인 도구입니다. 
* **신뢰도 높은 데이터:** 사람인 Open API를 연동하여 신뢰도 높은 채용 공고를 제공합니다. 
* **직관적인 UI:** FullCalendar.js를 활용해 마감일 등 주요 일정을 시각적으로 보여줍니다. 
* **성능 최적화:** Redis 캐싱과 스케줄링을 통해 API 호출을 최소화하고 빠른 응답 속도를 구현했습니다. 
* **맞춤형 정보:** 직무, 지역별 필터링 기능과 상세 정보 모달, 원본 공고 바로가기 링크를 제공합니다. 

### 5. 마이페이지
나의 활동을 관리하고 신뢰를 더하는 개인 공간입니다. 
* **활동 관리:** 내가 쓴 모든 게시물을 조회하고 닉네임, 이메일 등 개인 정보를 수정할 수 있습니다. 
* **재직 인증:** 공인 재직 증명서를 제출하여 인증을 요청할 수 있으며, 처리 중에는 중복 제출이 방지됩니다. 
* **계정 보안:** 현재 비밀번호를 확인하는 절차를 통해 안전하게 비밀번호를 변경하거나 회원을 탈퇴할 수 있습니다. 

### 6. 관리자 페이지
커뮤니티 콘텐츠와 회원을 체계적으로 관리하는 시스템입니다. 
* **신고 관리:** 신고된 게시글의 내역을 확인하고 보류 또는 삭제 처리할 수 있습니다. 
* **재직 인증 관리:** 제출된 서류를 검토하여 인증 요청을 승인하거나 반려합니다.  승인 시 회원 정보에 회사명이 자동으로 등록됩니다. 

---

## 🏗️ 시스템 아키텍처 및 산출물

* **WireFrame:** 주요 페이지의 UI/UX 설계를 위해 와이어프레임을 제작했습니다. 
* **ERD:** 데이터베이스 구조를 설계했으며, 주요 엔티티는 다음과 같습니다.
    * 사용자(User), 게시글(Log), 댓글(Comment), 태그(Tag), 채용공고(JobPost), 재직 인증(Employment Certificate), 신고(Report) 
* **UML:** 비회원, 회원, 관리자의 시스템 동작 범위를 정의하기 위해 유스케이스 다이어그램을 작성했습니다. 

---

## 🤝 개발 프로세스 및 협업

* **협업 툴**
    * **GitHub:** 형상 관리, 이슈 트래킹, 코드 리뷰(PR) 
    * **Notion:** 회의록, 작업 분배, 일정 관리 등 모든 문서를 기록하고 공유 
    * **GatherTown / KakaoTalk:** 실시간 소통 

* **개발 워크플로우**
    * **업무 분배:** `GitHub Issues`에 기능 단위로 업무를 등록하고 자율적으로 담당자를 배정했습니다. 
    * **브랜치 전략:** `feature/이슈번호-기능명` 형식으로 브랜치를 생성하여 작업을 진행했습니다. 
    * **커밋 전략:** `Git-CZ`를 도입하여 커밋 메시지 형식을 통일하고 이력 관리의 용이성을 높였습니다. 
    * **지속적인 소통:** 매일 아침 일일 회의를 진행하고, 모든 논의 내용을 Notion에 기록하여 투명하게 공유했습니다. 

---

## 💣 트러블 슈팅

### 1. MyBatis `List<Tag>` 매핑 오류 (담당: 김소영)
* **문제:** 게시글 상세 조회 시, 여러 행으로 반환된 태그 데이터를 하나의 `List<Tag>` 객체로 매핑하지 못하는 500 에러 발생. 
* **원인:** `@Builder`와 `@Data`를 함께 사용하면서 MyBatis가 생성자 기반 매핑에 실패. 
* **해결:** `@NoArgsConstructor`와 `@AllArgsConstructor`를 추가하여 MyBatis가 정상적으로 객체를 생성하도록 하여 문제를 해결했습니다. 

### 2. FormData 객체와 Content-Type 헤더 충돌 (담당: 노종현)
* **문제:** `FormData`를 사용해 파일을 전송할 때 `Content-Type` 헤더를 `multipart/form-data`로 명시적으로 설정하자 오류가 발생. 
* **원인:** `FormData`를 사용할 경우, 브라우저가 `boundary`를 포함한 `Content-Type` 헤더를 자동으로 생성해야 함. 
* **해결:** 헤더 설정 코드를 제거하여 브라우저가 헤더를 자동으로 설정하도록 위임하여 문제를 해결했습니다. 

### 3. Azure 환경에서 Redis 연결 실패 (담당: 유동기)
* **문제:** Azure 배포 환경에서 Redis 컨테이너에 지속적으로 연결하지 못하는 `CONNECTION FAILURE` 오류 발생. 
* **시도:** 최초 원인을 `DOCKER.IO` 이미지 정책 문제로 파악하고, Redis 이미지를 직접 ACR(Azure Container Registry)에 빌드하여 배포하는 데 성공. 
* **결과:** 하지만 이후에도 `UNABLE TO CONNECT` 오류가 계속 발생했으며, 포트 및 SSL 설정 등 여러 가능성을 시도했으나 최종적으로 해결하지 못했습니다. 

## 🧪 데모 계정 안내

관리자 페이지 기능 테스트를 원하시면 아래 계정 정보를 사용해 주세요. (동시 로그인은 지원되지 않습니다) 

* **아이디:** `admin200` 
* **비밀번호:** `Admin200!@`
