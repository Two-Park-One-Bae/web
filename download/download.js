'use strict';

// Android 출시 후 공개된 Google Play URL을 입력합니다.
const STORE_LINKS = Object.freeze({
  ios: 'https://apps.apple.com/kr/app/id6783877557',
  android: null,
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
if (STORE_LINKS.android) {
  const androidLink = document.getElementById('android-link');
  androidLink.href = STORE_LINKS.android;
  androidLink.hidden = false;
  document.getElementById('android-pending').hidden = true;
}

if (platform === 'android' && !STORE_LINKS.android) {
  statusText.textContent = 'Android 앱은 출시 준비 중이에요. 조금만 기다려 주세요!';
} else if (STORE_LINKS[platform]) {
  statusText.textContent = platform === 'ios'
    ? 'App Store로 이동하고 있어요. 연결되지 않으면 아래 버튼을 눌러 주세요.'
    : 'Google Play로 이동하고 있어요. 연결되지 않으면 아래 버튼을 눌러 주세요.';
  window.location.replace(STORE_LINKS[platform]);
}
