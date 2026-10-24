# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

- `npm start` — 개발 서버 (http://localhost:4200). `/api/`, `/auth/` 요청은 `localhost:3000` 백엔드로 프록시됨 (`proxy.conf.json`)
- `npm run build` — 빌드 (기본 설정이 production). `npm run production`도 동일하며 Dockerfile에서 사용
- `npm run watch` — development 설정으로 watch 빌드
- `npm test` — `ng test` 단위 테스트 (Karma/Jasmine이 아니라 Vitest + jsdom). 파일 하나만 실행: `npx ng test --include=src/app/app.spec.ts`
- 빌드 결과물: `dist/frontend/browser`. Prettier 설정은 `package.json`에 있음 (100컬럼, 작은따옴표)

## 아키텍처

Angular 21 standalone 컴포넌트 앱(NgModule 없음) + Tailwind CSS v4. Heimdall 백엔드용 관리자 콘솔(API 키, 유저, 주문, 카탈로그, 상품 업로드).

- **경로 별칭**: `@/*` → `src/app/*` (예: `@/model/...`, `@/shared/...`)
- **라우팅** (`src/app/app.routes.ts`): 모든 페이지는 `loadComponent` lazy 로딩. 인증이 필요한 페이지는 전부 `HomePage`(레이아웃 셸)의 children. 라우트 `data`에 `pageTitle`과 선택적으로 `roles: [Role.ADMIN]`을 둔다. 가드는 `authGuard`, `RoleGuard`(`data.roles` 참조), `notAuthGuard`(로그인 페이지 전용). 새 관리자 페이지는 `canActivate: [authGuard, RoleGuard]`와 `roles`가 필요하다.
- **인증**: 쿠키 기반 JWT. `authInterceptor`가 모든 요청에 `withCredentials`를 설정하고, 401이 오면 `AuthService.refresh()` 후 1회 재시도하며 실패 시 `AuthService.currentUser`(signal)를 비우고 `/login`으로 이동한다. `provideAppInitializer`가 앱 시작 전에 `AuthService.checkAuth()`를 실행하므로 가드 실행 시점에는 `currentUser`가 채워져 있다.
- **서비스** (`src/app/service/`): `HttpClient`를 감싼 얇은 래퍼로 `/api/...`를 호출하고 Observable을 반환. 인증/가드/테마 서비스는 `providedIn: 'root'`이지만, 데이터 서비스(`APIService`, `CatalogService` 등)는 일반 `@Injectable()`이라 사용하는 페이지 컴포넌트의 `providers`에 직접 등록해야 한다.
- **모델** (`src/app/model/`): 백엔드와 대응되는 DTO/응답 인터페이스. `Role` enum은 `user.ts`.
- **페이지** (`src/app/page/`): `login`, `signup`, `home/<기능>/`. 각 기능 폴더에 `*.page.ts/.html`과 해당 다이얼로그/시트 컴포넌트(예: `add-user.component`, `edit-order-status.component`)가 함께 있다.
- **UI 키트** (`src/app/shared/`): Zard UI(Angular용 shadcn 스타일) 컴포넌트가 레포에 직접 포함되어 있고 `components.json`으로 설정된다. 컴포넌트 폴더마다 `*.component.ts`, `*.variants.ts`(class-variance-authority 스타일), `index.ts` 배럴이 있다. 새 컴포넌트를 만들기보다 이것들과 `@/shared/utils`의 `cn()`을 우선 사용한다. `provideZard()`(`shared/core`)가 app config에 등록되어 있다. dialog / alert-dialog / sheet는 각 `*.service.ts`와 `*-ref`로 연다.

## 배포

Dockerfile은 `npm ci --offline`(빌드 컨텍스트에 `.npm` 캐시 디렉터리 필요)로 빌드한 뒤 `dist/frontend/browser`를 nginx로 서빙한다. `nginx.conf`는 SPA fallback, `/api/` 및 swagger 경로(`/api-docs-light`, `/api-docs-dark`, `/static/swagger-dark.js`)를 `http://backend:3000`으로 프록시하고, 5G 업로드와 600초 타임아웃(상품 업로드용)을 허용한다. 업로드/API 경로가 바뀌면 함께 수정해야 한다.
