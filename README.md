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

## 국외 이전 고지는 두 곳에 있다

`privacy/index.html` 5항 나목과 `privacy/overseas/index.html`이 **같은 사실**을 담는다.
방침은 전체 처리 내역의 일부로, 전용 페이지는 개인정보 보호법 제28조의8 제2항의
고지 순서대로 정리한 동의용 양식으로 적는다.

**둘 중 하나만 고치지 않는다.** 이전받는 자·국가·목적·보유기간·거부 방법이 바뀌면
두 파일을 함께 수정한다.
