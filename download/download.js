'use strict';

// 공개된 앱 설치 주소. HTML에도 수동 설치 링크를 제공합니다.
const STORE_LINKS = Object.freeze({
  ios: 'https://apps.apple.com/kr/app/id6783877557',
  android: 'https://play.google.com/store/apps/details?id=app.nursemate&hl=ko',
});

function detectPlatform(navigatorInfo) {
  const ua = navigatorInfo.userAgent || '';
  if (/Windows Phone/i.test(ua)) return 'other';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) ||
      (navigatorInfo.platform === 'MacIntel' && navigatorInfo.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

const platform = detectPlatform(navigator);
const statusText = document.getElementById('download-status');
if (STORE_LINKS[platform]) {
  statusText.textContent = platform === 'ios'
    ? 'App Store로 이동하고 있어요. 연결되지 않으면 아래 버튼을 눌러 주세요.'
    : 'Google Play로 이동하고 있어요. 연결되지 않으면 아래 버튼을 눌러 주세요.';
  window.location.replace(STORE_LINKS[platform]);
}
