# 🍳 깃깔나는 레시피 - 생성형 AI 기반 맞춤형 레시피 플랫폼

> 실제 프로젝트 서비스 : **[깃깔나는 레시피](https://est-fe-13-3st-finalproject.vercel.app/)**

---

## 1. 프로젝트 소개

### 📌 프로젝트 개요

**깃깔나는 레시피**는  
'오늘 뭐 먹지?'라는 일상적인 고민에서 시작한 **생성형 AI 기반 레시피 플랫폼**입니다.

사용자가 원하는 메뉴나 보유 재료, 조리 조건을 입력하면 AI가 맞춤형 레시피와 이미지를 생성하며,  
생성한 레시피를 직접 등록하거나 다른 사용자의 레시피를 검색하고 저장할 수 있습니다.

또한 레시피 상세 페이지의 좋아요·북마크·후기 기능과  
레시피를 연결하여 이야기를 나눌 수 있는 커뮤니티 기능을 통해  
**레시피 생성 → 탐색 → 저장 → 후기 → 공유**까지 하나의 서비스에서 경험할 수 있도록 구현했습니다.

### 🎯 프로젝트 목표

- **생성형 AI 기반 맞춤 레시피 제공**
  - 재료, 조리 시간, 난이도, 음식 종류 등 사용자 조건을 기반으로 AI 레시피 생성
- **레시피 탐색부터 공유까지 연결된 사용자 경험 구축**
  - 레시피 검색·필터·상세·좋아요·북마크·후기·커뮤니티 기능 연계
- **Supabase 기반 사용자 및 데이터 관리**
  - Auth, Database, Storage, RLS를 활용한 사용자 인증 및 데이터 관리
- **안전한 AI API 연동**
  - Supabase Edge Functions를 통해 API Key가 클라이언트에 노출되지 않도록 구성
- **반응형 및 접근성을 고려한 UI 구현**
  - Desktop / Tablet / Mobile 대응 및 웹 표준·웹 접근성·크로스 브라우징 점검

---

## 2. 개발 기간

| 구분 | 기간 |
| --- | --- |
| 전체 진행 기간 | 2026.07.15 ~ 2026.08.21 |
| 구현 집중 기간 | 2026.07.28 ~ 2026.08.21 |
| 프로젝트 유형 | 4인 팀 프로젝트 |

---

## 3. 팀원 소개 및 담당 역할

| 이름 | 담당 페이지 / 파트 | 주요 담당 기능 |
| --- | --- | --- |
| **이성희** | **메인 페이지 · 공통 컴포넌트** | • 메인 페이지 레이아웃 및 콘텐츠 구성<br>• 인기 레시피 및 커뮤니티 데이터 연동<br>• AI 냉장고 털기 및 주간 식단 UI<br>• Header, Footer 등 공통 컴포넌트 구현<br>• 반응형 레이아웃 및 공통 UI 관리 |
| **남윤동** | **레시피 목록 · 마이페이지** | • 레시피 검색·필터·정렬 기능<br>• 서버 사이드 페이지네이션 및 Skeleton UI<br>• Header 검색어와 레시피 목록 검색 연동<br>• 마이페이지 프로필 수정 및 이미지 업로드<br>• 작성·좋아요·북마크 레시피 조회 및 관리 |
| **주후산** | **AI 레시피 생성 · 레시피 등록** | • 사용자 조건 기반 AI 레시피 생성<br>• Supabase Edge Functions를 통한 AI API 연동<br>• AI 레시피 및 이미지 생성 프로세스 구현<br>• 5단계 Multi-step 레시피 등록 폼<br>• AI 생성 결과 등록 폼 자동 입력<br>• 임시 저장·수정·최종 등록 및 Storage 이미지 업로드 |
| **최정원** | **커뮤니티 · 로그인/회원가입 · 레시피 상세** | • Supabase Auth 기반 이메일·Google·Kakao 로그인/회원가입<br>• 로그인 상태 및 사용자 프로필 전역 관리<br>• 커뮤니티 게시글·댓글 CRUD 및 레시피 연결<br>• 커뮤니티 좋아요·북마크·카테고리·무한 스크롤 구현<br>• 레시피 상세 좋아요·북마크·조회수·후기 기능 구현<br>• 작성자 프로필 연동 및 관련 레시피 조회<br>• SEO, 접근성 및 상세페이지 성능 개선 |

---

## 4. 기술 스택

| 분류 | 기술 스택 |
| --- | --- |
| **Frontend** | React, React Router, JavaScript, TypeScript |
| **Styling / UI** | CSS Modules, CSS, Material UI, Lucide React |
| **Backend & DB** | Supabase Database, Auth, Storage, Edge Functions |
| **AI Integration** | OpenAI API |
| **Build** | Vite |
| **Deploy** | Vercel |
| **Collaboration** | Git, GitHub, Discord, Notion |
| **Design** | Figma |
| **Quality Test** | Lighthouse, WAVE, W3C Validator |

---

## 5. 주요 기능

### 🤖 AI 레시피 생성

- 사용자가 원하는 메뉴 또는 간단한 설명 입력
- 보유 재료 및 제외 재료 설정
- 인분, 조리 시간, 난이도, 음식 종류, 식단 조건 설정
- 선택한 조건을 조합하여 AI 요청용 프롬프트 생성
- Supabase Edge Functions를 통해 AI API 호출
- AI가 생성한 레시피 데이터를 JSON 형태로 가공
- 필요 시 완성 요리 이미지 함께 생성
- 생성 결과를 레시피 등록 페이지로 전달

---

### 📝 레시피 등록

- **5단계 Multi-step Form**
  1. 기본 정보
  2. 재료 입력
  3. 조리 과정
  4. 이미지 설정
  5. 최종 확인 및 공개 설정
- AI가 생성한 레시피 데이터를 등록 폼에 자동 입력
- 조리 단계별 설명 및 이미지 등록
- 작성 중인 레시피 임시 저장 및 재불러오기
- 기존 레시피 수정 시 등록 폼 재사용
- Base64 및 로컬 이미지를 변환하여 Supabase Storage에 저장
- Storage Public URL을 레시피 데이터와 함께 DB에 저장

---

### 🏠 메인 페이지

- 서비스 핵심 기능으로 이동할 수 있는 메인 콘텐츠 구성
- Supabase 기반 레시피 데이터 조회
- 인기 레시피 및 커뮤니티 후기 노출
- DB 조회 실패 또는 데이터 부족 시 Fallback 데이터 제공
- 보유 재료를 활용한 **AI 냉장고 털기 UI**
- 냉장고 사진을 활용한 재료 인식 시뮬레이션
- **일주일 식단 미리보기** 및 개별 식단 교체 기능
- 커뮤니티 콘텐츠 무한 롤링 UI
- Desktop / Tablet / Mobile 반응형 대응

---

### 🔍 레시피 둘러보기

- 레시피 제목 및 작성자 기반 검색
- 음식 종류·식단·난이도 복합 필터
- 최신순·평점순·조회순·좋아요순·댓글순 정렬
- Supabase `range()` 기반 서버 사이드 페이지네이션
- 검색어 **500ms Debouncing** 적용
- Header 검색어와 레시피 목록 검색 연동
- 레시피 좋아요 상태 조회 및 변경
- 데이터 로딩 시 Skeleton UI 제공

---

### 📖 레시피 상세

- 레시피 기본 정보 및 재료·조리 단계 출력
- 작성자 `profiles` 데이터 연동
- 상세 페이지 진입 시 조회수 증가
- 좋아요 및 북마크 기능
- 별점·텍스트·이미지를 활용한 완성 후기 작성
- 본인 후기 수정 및 삭제
- 동일 카테고리 기반 관련 레시피 추천
- AI 조리 단계 요약 데이터 관리
- 중복 AI 요청 방지를 위한 DB Claim 방식 적용
- Recipe Schema 기반 JSON-LD 및 SEO 메타데이터 적용
- 실제 콘텐츠와 유사한 Skeleton을 활용해 초기 레이아웃 이동 최소화

---

### 💬 커뮤니티

- **최신 / 인기 / 요리 후기 / 질문 / 자유 이야기 / 북마크** 카테고리 제공
- 게시글 작성·조회·수정·삭제
- 댓글 작성·수정·삭제
- 게시글 좋아요 및 북마크
- 북마크한 게시글만 모아보는 전용 탭
- 게시글 작성 시 서비스에 등록된 실제 레시피 검색 및 연결
- 연결된 레시피 상세 페이지로 이동
- 이미지 첨부 게시글 작성
- Masonry 기반 반응형 게시글 레이아웃
- Intersection Observer 기반 무한 스크롤
- 최초 데이터 로딩 시 Skeleton UI
- 게시글 데이터 우선 렌더링 후 작성자 프로필을 후속 조회하여 초기 표시 속도 개선

---

### 🔐 로그인 / 회원가입

- Supabase Auth 기반 이메일 로그인 및 회원가입
- Google OAuth 로그인
- Kakao OAuth 로그인
- 비밀번호 재설정 기능
- 로그인 후 이전 페이지로 복귀
- 로그인 사용자의 `/login`, `/signup` 접근 제한
- AuthContext를 통한 전역 인증 상태 관리
- `profiles` 테이블 기반 닉네임 및 프로필 이미지 관리
- 공통 `UserAvatar` 컴포넌트를 통한 사용자 정보 표시
- 로그인/회원가입 페이지 검색엔진 `noindex` 처리

---

### 👤 마이페이지

- 프로필 닉네임 및 프로필 이미지 수정
- Supabase Storage 프로필 이미지 업로드
- 작성한 레시피 조회 및 관리
- 좋아요한 레시피 조회
- 북마크한 레시피 조회
- 작성 레시피 공개 / 비공개 전환
- 레시피 수정 및 삭제
- 사용자 활동 데이터 기반 검색 및 정렬
- 닉네임 변경 시 관련 데이터에 변경 사항 반영

---

## 6. 트러블 슈팅

| 구분 | 문제 상황 | 원인 | 해결 방법 |
| --- | --- | --- | --- |
| **AI API 보안** | Frontend에서 AI API를 직접 호출할 경우 API Key가 노출될 위험이 있었음 | 브라우저에 전달되는 환경변수와 요청 정보를 사용자가 확인할 수 있음 | AI 요청을 **Supabase Edge Functions**로 이동하여 클라이언트에는 API Key가 전달되지 않도록 구조 변경 |
| **이미지 데이터 관리** | AI 이미지의 Base64 데이터를 DB에 직접 저장하면 데이터 크기가 지나치게 커지는 문제가 있었음 | Base64 문자열 자체의 용량이 크고 반복 조회 시 DB 부하가 발생 | 이미지 데이터를 Blob으로 변환한 뒤 **Supabase Storage**에 저장하고 DB에는 Public URL만 저장 |
| **레시피 작성 데이터 유실** | 여러 단계로 구성된 등록 폼 작성 중 페이지를 이탈하면 작성 내용이 사라질 수 있었음 | 입력 데이터가 컴포넌트 상태에만 존재 | `istempsaved` 상태를 활용해 작성 중인 레시피를 DB에 임시 저장하고 재진입 시 복구할 수 있도록 구현 |
| **커뮤니티 초기 로딩 성능** | 커뮤니티 진입 시 게시글과 사용자 프로필, 이미지 데이터를 한 번에 불러오면서 초기 렌더링이 늦어짐 | 여러 테이블 데이터와 이미지가 첫 렌더링에 동시에 필요했음 | 게시글을 우선 렌더링하고 프로필은 후속 조회하도록 분리했으며, **Skeleton UI + 무한 스크롤**을 적용 |
| **좋아요 동시성** | 여러 사용자가 동시에 좋아요를 변경할 경우 클라이언트 계산만으로 카운트가 정확하지 않을 수 있었음 | 조회한 값을 Frontend에서 직접 증감하는 방식의 Race Condition 가능성 | Supabase **RPC를 이용한 원자적 업데이트** 방식으로 좋아요 카운트 처리 |
| **AI 요약 중복 요청** | 여러 사용자가 같은 상세 페이지에 접근하면 동일한 AI 요약 요청이 중복 발생할 수 있었음 | AI 요약 생성 여부만으로는 현재 다른 사용자가 생성 중인지 판단할 수 없음 | DB에 Claim Token을 발급하여 한 사용자만 생성하도록 하고, 다른 사용자는 저장된 결과를 대기하도록 처리 |
| **상세페이지 Layout Shift** | 데이터 로딩 완료 후 실제 상세 콘텐츠가 나타날 때 화면이 크게 움직이는 현상이 발생 | 단순 로딩 문구와 실제 페이지의 높이 차이가 컸음 | 실제 상세 레이아웃과 유사한 Skeleton UI로 공간을 선점하여 **CLS 감소** |
| **검색 요청 과다 발생** | 검색창 입력 시 글자마다 Supabase 요청이 실행됨 | `onChange`와 데이터 조회가 즉시 연결되어 있었음 | **500ms Debouncing**을 적용하여 입력 완료 후 검색 요청 실행 |
| **프로필 정보 불일치** | 프로필을 수정해도 기존 콘텐츠에 이전 닉네임이나 이미지가 표시되는 문제가 발생 | 각 콘텐츠에서 서로 다른 사용자 정보를 사용 | `profiles`를 사용자 프로필의 기준 데이터로 사용하고 Header·커뮤니티·상세 페이지 등에서 동일한 프로필 데이터를 참조하도록 개선 |

---

## 7. 웹 품질 및 최적화

### ✅ 웹 표준 / 웹 접근성

- W3C Validator를 활용한 웹 표준 검사
- WAVE 및 Lighthouse를 활용한 접근성 점검
- 이미지 대체 텍스트 및 버튼 `aria-label` 적용
- 명도 대비 및 키보드 접근성 점검
- 상태 변화 영역에 `aria-live`, `aria-busy` 등 접근성 속성 적용

### ⚡ 성능 최적화

- `React.lazy` + `Suspense` 기반 **Route Code Splitting**
- 이미지 `loading="lazy"` 적용
- Skeleton UI를 통한 레이아웃 안정화
- 검색 Debouncing
- 커뮤니티 Infinite Scroll
- 게시글과 프로필 데이터 요청 분리
- Supabase Storage를 활용한 이미지 데이터 분리 저장

### 🔎 SEO

- 페이지별 `title`, `description`, Canonical URL 구성
- Open Graph 메타데이터 적용
- 로그인 / 회원가입 페이지 `noindex`
- 레시피 상세 페이지 **Schema.org Recipe JSON-LD** 적용
- `robots.txt`, `sitemap.xml` 구성

### 🌐 Cross Browsing

- Chrome / Edge 환경에서 주요 페이지 비교
- 동일한 화면 크기와 배율에서 레이아웃 및 기능 동작 확인
- Desktop / Tablet / Mobile 반응형 UI 점검

---

## 8. 폴더 구조

```text
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── BottomNav.tsx
│   ├── UserAvatar.jsx
│   ├── GuestRoute.jsx
│   ├── AuthGuardModal.jsx
│   ├── ConfirmModal.jsx
│   └── SEO.jsx
│
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
│
├── lib/
│   └── supabaseClient.js
│
├── pages/
│   ├── Home/
│   │   └── Home.tsx
│   │
│   ├── CreateAIRecipe/
│   │   ├── CreateAIRecipe.jsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── RegistRecipe/
│   │   ├── RegistRecipe.jsx
│   │   ├── components/
│   │   │   ├── Step1BasicInfo.jsx
│   │   │   ├── Step2Ingredients.jsx
│   │   │   ├── Step3CookingSteps.jsx
│   │   │   ├── Step4Image.jsx
│   │   │   └── Step5Options.jsx
│   │   └── hooks/
│   │
│   ├── RecipeList/
│   │   └── RecipeList.jsx
│   │
│   ├── RecipeDetail/
│   │   ├── RecipeDetail.jsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── Community/
│   │   ├── Community.jsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── MyPage/
│   │   └── MyPage.jsx
│   │
│   └── Auth/
│       ├── Login.jsx
│       ├── SignUp.jsx
│       ├── UpdatePassword.jsx
│       ├── components/
│       └── hooks/
│
├── types/
├── utils/
├── App.jsx
└── main.tsx