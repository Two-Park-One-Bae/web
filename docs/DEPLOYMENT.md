# 운영·개발 웹사이트 배포

| 환경 | 브랜치 | 주소 | 용도 |
| --- | --- | --- | --- |
| 운영 | `main` | `https://www.nursemate.app/` | 출시된 앱에 맞춘 소개·지원·정책 |
| 개발 | `develop` | `https://www.nursemate.app/develop/` | 다음 버전의 소개·지원·정책 검토 |

개발 주소는 아래 초기 설정을 완료한 뒤 활성화된다. 백엔드 개발 주소인 `dev.nursemate.app`은 웹사이트 배포에 사용하지 않는다. 이 정적 사이트는 백엔드 API에 연결하지 않으며, 앱 출시 상태와 지원 조건은 해당 브랜치의 콘텐츠로 관리한다.

## 브랜치와 배포 흐름

1. `feature/NM-XXX-*` → `develop` PR로 코드·콘텐츠를 검토한다.
2. `develop` 머지 시 개발 페이지를 갱신한다. 운영 페이지 파일은 항상 `main`에서 가져온다.
3. 앱·백엔드 운영 배포에 맞춰 별도 릴리스 PR로 `main`에 반영한다. Android 설치 링크·출시 상태·타이머 지원 조건은 실제 출시 상태를 확인해 변경한다.
4. `main` 머지 시 운영 페이지를 갱신하며 개발 페이지도 함께 유지한다.

GitHub Pages는 하나의 사이트를 배포하므로 `.github/workflows/pages.yml`이 main 루트와 develop 하위 경로를 하나의 산출물로 조합한다. PR 실행은 산출물만 업로드하며 배포하지 않는다. `site-preview` 산출물을 내려받아 압축을 풀고 `python3 -m http.server 8000`으로 실행하면 `/`과 `/develop/`을 함께 검토할 수 있다.

개발 페이지에는 안내 배너와 `noindex, nofollow`를 적용한다. 루트 `robots.txt`에서 `/develop/` 수집을 차단한다. 이 설정은 접근 통제가 아니므로 개발 페이지도 공개된 콘텐츠만 포함한다. QR은 정식 운영 다운로드 URL을 유지한다.

## 초기 활성화 절차

현재 Pages는 main 루트를 직접 배포하는 기존 방식이다. 워크플로 코드만 추가해도 기존 배포 설정을 자동 변경하지 않는다.

1. NM-344 PR을 검토하고 `develop`에 머지한다. Actions의 `site-preview` 산출물로 두 환경을 확인한다.
2. 운영 콘텐츠를 출시하기 전에 배포 인프라 파일만 별도 PR로 `main`에 먼저 반영한다: `.github/workflows/pages.yml`, `scripts/build-pages.py`, 이 배포 문서. 이렇게 해야 main의 후속 변경도 자동 배포된다. 랜딩 콘텐츠는 이 단계에서 main에 반영할 필요가 없다.
3. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 전환한다. 커스텀 도메인과 HTTPS 설정은 유지한다.
4. `github-pages` environment의 배포 허용 브랜치에 `main`과 `develop`을 포함한다.
5. Actions에서 `Build and deploy main and develop pages`를 main 기준으로 수동 실행한다. 성공 후 운영·개발 홈, 지원, 개인정보처리방침, 이용약관 링크를 실제 브라우저에서 확인한다.

설정 전환 전에 main에 배포 워크플로가 있어야 한다. 기존 `CNAME`, `.nojekyll`, `404.html` 원본은 수정하지 않는다. 조합한 사이트의 루트에도 main의 원본을 그대로 사용한다.

문제가 생기면 Pages Source를 기존 **Deploy from a branch / main / root**로 되돌려 기존 운영 배포를 복원한다.

공식 가이드: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
