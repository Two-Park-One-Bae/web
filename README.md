# web — NurseMate 공개 웹사이트

널스메이트(NurseMate)의 공개 정적 사이트. GitHub Pages로 **www.nursemate.app** 에 배포된다.
App Store 심사 필수 URL(개인정보처리방침·지원)을 호스팅하고, 랜딩 페이지를 겸한다.

## 구성
- `/` — 랜딩
- `/download/` — QR 다운로드 연결 (iOS: App Store, Android: 출시 준비 안내)
- `/privacy/` — 개인정보처리방침 (내용: NM-299)
- `/support/` — 지원 (내용: NM-300)
- `/terms/` — 이용약관

## 배포
- GitHub Pages, `main` 브랜치 root 배포
- 커스텀 도메인: `www.nursemate.app` (CNAME · HTTPS 강제)
- 개발 페이지 예정 주소: `www.nursemate.app/develop/` (`develop` 브랜치)
- [운영·개발 배포 설정과 초기 활성화 절차](docs/DEPLOYMENT.md)

## 개발
순수 정적 HTML (빌드 없음). `feature/NM-XXX-*` 브랜치에서 작업 → `develop`으로 PR → 검토 후 `main`으로 릴리스 PR. 운영 사이트는 `main` 머지 시 배포된다.

```sh
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/`을 연다. 랜딩·다운로드는 `landing.css`, 지원·정책 페이지는 `styles.css`를 사용한다.

## 시안 검토

- [PC 전체 시안](docs/preview/desktop.png)
- [모바일 전체 시안](docs/preview/mobile.png)
- 검토 항목: 메인 화면의 폰·워치 배치, 실제 앱 화면의 가독성, 기능 설명, 다운로드 안내.

QR의 목적지는 `https://www.nursemate.app/download/`이므로 해당 경로를 배포한 뒤 실제 QR 연결을 확인한다. Android 출시 시 `download/download.js`의 `STORE_LINKS.android`와 출시 안내 문구를 갱신한다. Google Search Console·네이버 서치어드바이저 소유권 확인 및 사이트맵 제출은 별도 등록 작업이다.
