# web — NurseMate 공개 웹사이트

널스메이트(NurseMate)의 공개 정적 사이트. GitHub Pages로 **www.nursemate.app** 에 배포된다.
App Store 심사 필수 URL(개인정보처리방침·지원)을 호스팅하고, 랜딩 페이지를 겸한다.

## 구성
- `/` — 랜딩
- `/privacy/` — 개인정보처리방침 (내용: NM-299)
- `/support/` — 지원 (내용: NM-300)

## 배포
- GitHub Pages, `main` 브랜치 root 배포
- 커스텀 도메인: `www.nursemate.app` (CNAME · HTTPS 강제)

## 개발
순수 정적 HTML (빌드 없음). `feature/*` 브랜치에서 작업 → `main` 으로 PR → 머지 시 배포.
