/**
 * @OnlyCurrentDoc
 * 위 표시로 이 스크립트는 붙여 넣은 스프레드시트 하나에만 접근 권한을 요청한다 (드라이브의 다른 파일은 못 건드림).
 */

/**
 * 널스메이트 의견 게시판 서버 (Google Apps Script 웹 앱)
 *
 * 붙여 넣을 스프레드시트의 "글" 탭에 의견을 저장하고, 공개된 글과 운영자 답변을 돌려준다.
 * 운영자는 시트에서 직접 관리한다.
 *   - 답변: "답변" 칸에 적으면 페이지에 "널스메이트 팀" 답변으로 보인다. 답변시각은 자동 기록.
 *   - 숨김: "공개" 칸을 N으로 바꾸면 페이지에서 사라진다.
 */

const SHEET_NAME = '글';
const HEADERS = ['ID', '작성시각', '닉네임', '내용', '답변', '답변시각', '공개'];
const COL = { id: 1, createdAt: 2, nickname: 3, content: 4, reply: 5, repliedAt: 6, visible: 7 };

// true면 새 글이 "공개" N으로 저장되어, 운영자가 Y로 바꿔야 보인다.
const REQUIRE_APPROVAL = false;
const MAX_CONTENT = 1000;
const MAX_NICKNAME = 20;
const MAX_LIST = 200;
// 브라우저(작성자)별 제한. Apps Script는 IP를 알 수 없어 페이지가 브라우저에 저장한 ID로 구분한다.
const COOLDOWN_SECONDS = 30;
const POSTS_PER_HOUR = 5;
// 운영팀 사칭 방지: 공백·대소문자 무시하고 이 단어가 들어간 닉네임은 받지 않는다.
const RESERVED_NICKNAMES = ['널스메이트', 'nursemate', '운영자', '운영팀', '관리자', 'admin', '투박한배', 'twoparkonebae'];

function doGet() {
  const sheet = getSheet_();
  const rows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues()
    : [];
  const posts = rows
    .filter(function (r) { return String(r[COL.visible - 1]).trim().toUpperCase() !== 'N' && r[COL.content - 1] !== ''; })
    .map(function (r) {
      return {
        id: String(r[COL.id - 1]),
        createdAt: toIso_(r[COL.createdAt - 1]),
        nickname: String(r[COL.nickname - 1] || ''),
        content: String(r[COL.content - 1]),
        reply: String(r[COL.reply - 1] || ''),
        repliedAt: toIso_(r[COL.repliedAt - 1]),
      };
    })
    .reverse()
    .slice(0, MAX_LIST);
  return json_({ ok: true, posts: posts });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid' });
  }
  // 사람에게 보이지 않는 칸이 채워져 있으면 봇으로 보고 성공처럼 응답만 한다.
  if (body.website) return json_({ ok: true });

  const content = String(body.content || '').trim();
  const nickname = String(body.nickname || '').trim().slice(0, MAX_NICKNAME);
  const client = String(body.client || '');
  if (!/^[A-Za-z0-9-]{16,64}$/.test(client)) return json_({ ok: false, error: 'invalid' });
  if (!content) return json_({ ok: false, error: 'empty' });
  if (isReservedNickname_(nickname)) return json_({ ok: false, error: 'reserved_nickname' });
  if (content.length > MAX_CONTENT) return json_({ ok: false, error: 'too_long' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'busy' });
  try {
    const limited = takeRateSlot_(client);
    if (limited) return json_({ ok: false, error: limited });
    getSheet_().appendRow([
      Utilities.getUuid().slice(0, 8),
      new Date(),
      safeCell_(nickname),
      safeCell_(content),
      '',
      '',
      REQUIRE_APPROVAL ? 'N' : 'Y',
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, pending: REQUIRE_APPROVAL });
}

// 운영자가 "답변" 칸을 고치면 답변시각을 채운다 (설치 없이 동작하는 단순 트리거).
function onEdit(e) {
  const range = e.range;
  if (range.getSheet().getName() !== SHEET_NAME || range.getRow() < 2) return;
  if (range.getColumn() > COL.reply || range.getLastColumn() < COL.reply) return;
  for (let row = range.getRow(); row <= range.getLastRow(); row++) {
    const sheet = range.getSheet();
    const reply = sheet.getRange(row, COL.reply).getValue();
    sheet.getRange(row, COL.repliedAt).setValue(reply === '' ? '' : new Date());
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setColumnWidth(COL.content, 420);
    sheet.setColumnWidth(COL.reply, 320);
  }
  return sheet;
}

// 제한에 걸리면 오류 코드를, 통과하면 null을 돌려준다.
function takeRateSlot_(client) {
  const cache = CacheService.getScriptCache();
  const cooldownKey = 'cooldown:' + client;
  const hourKey = 'hour:' + client + ':' + Math.floor(Date.now() / 3600000);
  if (cache.get(cooldownKey)) return 'too_fast';
  const count = Number(cache.get(hourKey) || 0);
  if (count >= POSTS_PER_HOUR) return 'rate_limited';
  cache.put(cooldownKey, '1', COOLDOWN_SECONDS);
  cache.put(hourKey, String(count + 1), 3700);
  return null;
}

function isReservedNickname_(nickname) {
  const normalized = nickname.replace(/\s+/g, '').toLowerCase();
  return RESERVED_NICKNAMES.some(function (word) { return normalized.indexOf(word) !== -1; });
}

// =, +, -, @ 로 시작하는 입력이 시트에서 수식으로 실행되지 않게 막는다.
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function toIso_(value) {
  return value instanceof Date ? value.toISOString() : '';
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
