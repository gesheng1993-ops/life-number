/**
 * 数字卡通角色 SVG（圆润几何风，120×120 viewBox）
 * 每个数字对应一个动物角色
 */
var AVATARS = {
  /** 1号 — 小狮子·领导者 */
  1: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="62" r="42" fill="#FFE0CC"/>' +
     '<circle cx="60" cy="62" r="42" fill="none" stroke="#FF6B6B" stroke-width="2.5"/>' +
     '<circle cx="38" cy="55" r="8" fill="#FF6B6B"/><circle cx="38" cy="55" r="4" fill="#FFE0CC"/>' +
     '<circle cx="82" cy="55" r="8" fill="#FF6B6B"/><circle cx="82" cy="55" r="4" fill="#FFE0CC"/>' +
     '<ellipse cx="60" cy="65" rx="8" ry="5" fill="#FF6B6B" opacity="0.6"/>' +
     '<path d="M52,60 Q60,54 68,60" fill="none" stroke="#FF4444" stroke-width="2.5" stroke-linecap="round"/>' +
     '<circle cx="60" cy="40" r="16" fill="none" stroke="#FF6B6B" stroke-width="2"/>' +
     '<polygon points="44,30 48,28 50,34 54,36 48,38 46,44 42,38 38,36 44,34" fill="#FF6B6B"/>' +
     '<polygon points="66,30 68,38 72,36 70,30" fill="#FFD93D"/>' +
     '<polygon points="72,30 74,28 76,34 80,36 74,38 72,44 68,38 66,36 72,34" fill="#FF6B6B"/>' +
     '<rect x="45" y="44" width="30" height="6" rx="3" fill="#FFD93D" opacity="0.6"/>' +
     '</svg>',

  /** 2号 — 小兔子·合作者 */
  2: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="62" r="38" fill="#FFF0E6"/>' +
     '<circle cx="60" cy="62" r="38" fill="none" stroke="#FF9F43" stroke-width="2.5"/>' +
     '<ellipse cx="48" cy="36" rx="10" ry="18" fill="#FFF0E6" stroke="#FF9F43" stroke-width="2" transform="rotate(-12,48,36)"/>' +
     '<ellipse cx="48" cy="36" rx="6" ry="12" fill="#FFD4B8" transform="rotate(-12,48,36)"/>' +
     '<ellipse cx="72" cy="36" rx="10" ry="18" fill="#FFF0E6" stroke="#FF9F43" stroke-width="2" transform="rotate(12,72,36)"/>' +
     '<ellipse cx="72" cy="36" rx="6" ry="12" fill="#FFD4B8" transform="rotate(12,72,36)"/>' +
     '<circle cx="46" cy="58" r="6" fill="#FF9F43"/><circle cx="46" cy="58" r="3" fill="#4A2E1E"/>' +
     '<circle cx="74" cy="58" r="6" fill="#FF9F43"/><circle cx="74" cy="58" r="3" fill="#4A2E1E"/>' +
     '<ellipse cx="60" cy="66" rx="6" ry="4" fill="#FF9F43" opacity="0.5"/>' +
     '<path d="M54,62 Q60,56 66,62" fill="none" stroke="#FF9F43" stroke-width="2" stroke-linecap="round"/>' +
     '<circle cx="50" cy="82" r="8" fill="#FF6B6B" opacity="0.5"/>' +
     '<circle cx="70" cy="84" r="8" fill="#FFD93D" opacity="0.5"/>' +
     '<circle cx="60" cy="88" r="8" fill="#C77DFF" opacity="0.5"/>' +
     '<line x1="50" y1="82" x2="33" y2="92" stroke="#6BCB77" stroke-width="2.5" stroke-linecap="round"/>' +
     '<line x1="60" y1="88" x2="58" y2="102" stroke="#6BCB77" stroke-width="2.5" stroke-linecap="round"/>' +
     '<line x1="70" y1="84" x2="85" y2="96" stroke="#6BCB77" stroke-width="2.5" stroke-linecap="round"/>' +
     '</svg>',

  /** 3号 — 小松鼠·创造者 */
  3: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="52" r="30" fill="#FFF5D5"/>' +
     '<circle cx="60" cy="52" r="30" fill="none" stroke="#FFD93D" stroke-width="2.5"/>' +
     '<circle cx="48" cy="46" r="5" fill="#FFD93D"/><circle cx="48" cy="46" r="2.5" fill="#4A2E1E"/>' +
     '<circle cx="72" cy="46" r="5" fill="#FFD93D"/><circle cx="72" cy="46" r="2.5" fill="#4A2E1E"/>' +
     '<ellipse cx="60" cy="55" rx="4" ry="3" fill="#FF9F43"/>' +
     '<path d="M55,52 Q60,48 65,52" fill="none" stroke="#E8B800" stroke-width="2" stroke-linecap="round"/>' +
     '<ellipse cx="60" cy="90" rx="28" ry="22" fill="#FFE8A0" stroke="#FFD93D" stroke-width="2"/>' +
     '<line x1="60" y1="46" x2="74" y2="28" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round"/>' +
     '<rect x="72" y="21" width="16" height="10" rx="3" fill="#FF6B6B"/>' +
     '<circle cx="60" cy="66" r="6" fill="#6BCB77" opacity="0.5"/>' +
     '</svg>',

  /** 4号 — 小熊·建造者 */
  4: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="58" r="36" fill="#E8F5E0"/>' +
     '<circle cx="60" cy="58" r="36" fill="none" stroke="#6BCB77" stroke-width="2.5"/>' +
     '<circle cx="42" cy="50" r="10" fill="#6BCB77" opacity="0.3"/>' +
     '<circle cx="78" cy="50" r="10" fill="#6BCB77" opacity="0.3"/>' +
     '<circle cx="42" cy="50" r="5" fill="#6BCB77"/><circle cx="42" cy="50" r="2.5" fill="#1A5E1A"/>' +
     '<circle cx="78" cy="50" r="5" fill="#6BCB77"/><circle cx="78" cy="50" r="2.5" fill="#1A5E1A"/>' +
     '<ellipse cx="60" cy="60" rx="6" ry="4" fill="#6BCB77" opacity="0.6"/>' +
     '<ellipse cx="60" cy="38" rx="20" ry="5" fill="#FF9F43" opacity="0.9"/>' +
     '<rect x="52" y="26" width="16" height="8" rx="3" fill="#FF9F43"/>' +
     '<rect x="56" y="28" width="8" height="4" rx="1" fill="#FFD93D" opacity="0.5"/>' +
     '<rect x="82" y="64" width="6" height="24" rx="3" fill="#D4A56A"/>' +
     '<rect x="76" y="56" width="18" height="12" rx="4" fill="#888"/>' +
     '</svg>',

  /** 5号 — 小狐狸·探索者 */
  5: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<polygon points="60,36 48,62 38,40 46,62 36,62 50,74 70,74 84,62 74,62 82,40 72,62" fill="#FF9F43" opacity="0.8"/>' +
     '<circle cx="60" cy="62" r="28" fill="#FFE8D0"/>' +
     '<circle cx="60" cy="62" r="28" fill="none" stroke="#4D96FF" stroke-width="2.5"/>' +
     '<polygon points="60,34 52,58 68,58" fill="#FF9F43"/>' +
     '<circle cx="50" cy="55" r="5" fill="#4D96FF"/><circle cx="50" cy="55" r="2.5" fill="#1A3A5E"/>' +
     '<circle cx="70" cy="55" r="5" fill="#4D96FF"/><circle cx="70" cy="55" r="2.5" fill="#1A3A5E"/>' +
     '<ellipse cx="60" cy="66" rx="4" ry="3" fill="#FF9F43"/>' +
     '<ellipse cx="85" cy="60" rx="8" ry="14" fill="#FFE8D0" stroke="#4D96FF" stroke-width="1.5" transform="rotate(15,85,60)"/>' +
     '<ellipse cx="35" cy="60" rx="8" ry="14" fill="#FFE8D0" stroke="#4D96FF" stroke-width="1.5" transform="rotate(-15,35,60)"/>' +
     '<rect x="50" y="78" width="20" height="16" rx="6" fill="#FF9F43" opacity="0.6"/>' +
     '<line x1="58" y1="78" x2="58" y2="94" stroke="#4D96FF" stroke-width="2"/>' +
     '</svg>',

  /** 6号 — 小猫·守护者 */
  6: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="58" r="34" fill="#F0E8F5"/>' +
     '<circle cx="60" cy="58" r="34" fill="none" stroke="#9B72CF" stroke-width="2.5"/>' +
     '<polygon points="42,34 38,12 50,28" fill="#F0E8F5" stroke="#9B72CF" stroke-width="2"/>' +
     '<polygon points="42,34 38,12 50,28" fill="#E8D5F5"/>' +
     '<polygon points="78,34 82,12 70,28" fill="#F0E8F5" stroke="#9B72CF" stroke-width="2"/>' +
     '<polygon points="78,34 82,12 70,28" fill="#E8D5F5"/>' +
     '<circle cx="48" cy="54" r="7" fill="#9B72CF"/><circle cx="48" cy="54" r="3.5" fill="#2E184E"/>' +
     '<circle cx="72" cy="54" r="7" fill="#9B72CF"/><circle cx="72" cy="54" r="3.5" fill="#2E184E"/>' +
     '<ellipse cx="60" cy="64" rx="5" ry="3.5" fill="#9B72CF" opacity="0.5"/>' +
     '<path d="M79,50 Q86,46 84,54" fill="none" stroke="#9B72CF" stroke-width="1.5" stroke-linecap="round"/>' +
     '<path d="M41,50 Q34,46 36,54" fill="none" stroke="#9B72CF" stroke-width="1.5" stroke-linecap="round"/>' +
     '<circle cx="60" cy="78" r="12" fill="#FF6B6B"/>' +
     '<circle cx="58" cy="76" r="2" fill="#fff" opacity="0.6"/>' +
     '</svg>',

  /** 7号 — 猫头鹰·智慧者 */
  7: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="62" r="34" fill="#F0E8FF"/>' +
     '<circle cx="60" cy="62" r="34" fill="none" stroke="#C77DFF" stroke-width="2.5"/>' +
     '<circle cx="44" cy="48" r="16" fill="#fff" stroke="#C77DFF" stroke-width="2"/>' +
     '<circle cx="76" cy="48" r="16" fill="#fff" stroke="#C77DFF" stroke-width="2"/>' +
     '<circle cx="44" cy="48" r="8" fill="#C77DFF"/><circle cx="44" cy="48" r="4" fill="#1A0E3E"/>' +
     '<circle cx="76" cy="48" r="8" fill="#C77DFF"/><circle cx="76" cy="48" r="4" fill="#1A0E3E"/>' +
     '<polygon points="52,62 68,62 64,68 56,68" fill="#FF9F43"/>' +
     '<line x1="50" y1="47" x2="36" y2="38" stroke="#C77DFF" stroke-width="1.5"/>' +
     '<line x1="70" y1="47" x2="84" y2="38" stroke="#C77DFF" stroke-width="1.5"/>' +
     '<rect x="46" y="76" width="28" height="16" rx="4" fill="#E8D5FF" stroke="#C77DFF" stroke-width="1.5"/>' +
     '<line x1="52" y1="80" x2="56" y2="88" stroke="#C77DFF" stroke-width="1"/>' +
     '<line x1="60" y1="80" x2="60" y2="88" stroke="#C77DFF" stroke-width="1"/>' +
     '<line x1="68" y1="80" x2="64" y2="88" stroke="#C77DFF" stroke-width="1"/>' +
     '</svg>',

  /** 8号 — 小老虎·成就者 */
  8: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="58" r="36" fill="#FFF0DD"/>' +
     '<circle cx="60" cy="58" r="36" fill="none" stroke="#FFB830" stroke-width="2.5"/>' +
     '<circle cx="40" cy="50" r="9" fill="#FFB830" opacity="0.3"/>' +
     '<circle cx="80" cy="50" r="9" fill="#FFB830" opacity="0.3"/>' +
     '<circle cx="40" cy="50" r="5" fill="#FFB830"/><circle cx="40" cy="50" r="2.5" fill="#4A2E00"/>' +
     '<circle cx="80" cy="50" r="5" fill="#FFB830"/><circle cx="80" cy="50" r="2.5" fill="#4A2E00"/>' +
     '<ellipse cx="60" cy="62" rx="8" ry="5" fill="#FFB830" opacity="0.5"/>' +
     '<path d="M52,58 Q60,52 68,58" fill="none" stroke="#D49400" stroke-width="2" stroke-linecap="round"/>' +
     '<line x1="50" y1="40" x2="44" y2="46" stroke="#D49400" stroke-width="2"/>' +
     '<line x1="70" y1="40" x2="76" y2="46" stroke="#D49400" stroke-width="2"/>' +
     '<line x1="60" y1="38" x2="60" y2="45" stroke="#D49400" stroke-width="2"/>' +
     '<rect x="54" y="76" width="12" height="14" rx="3" fill="#FFD93D"/>' +
     '<rect x="57" y="72" width="6" height="6" rx="3" fill="#FFD93D"/>' +
     '<circle cx="56" cy="85" r="2" fill="#D49400"/>' +
     '<circle cx="64" cy="85" r="2" fill="#D49400"/>' +
     '</svg>',

  /** 9号 — 小鹿·完成者 */
  9: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
     '<circle cx="60" cy="62" r="34" fill="#F5F0E8"/>' +
     '<circle cx="60" cy="62" r="34" fill="none" stroke="#C4B5A5" stroke-width="2.5"/>' +
     '<circle cx="46" cy="54" r="7" fill="#C4B5A5"/><circle cx="46" cy="54" r="3.5" fill="#3A2E2E"/>' +
     '<circle cx="74" cy="54" r="7" fill="#C4B5A5"/><circle cx="74" cy="54" r="3.5" fill="#3A2E2E"/>' +
     '<ellipse cx="60" cy="66" rx="6" ry="4" fill="#B8A595" opacity="0.6"/>' +
     '<path d="M54,60 Q60,54 66,60" fill="none" stroke="#A8917A" stroke-width="2" stroke-linecap="round"/>' +
     '<line x1="42" y1="42" x2="30" y2="26" stroke="#C4B5A5" stroke-width="3" stroke-linecap="round"/>' +
     '<line x1="38" y1="38" x2="24" y2="30" stroke="#C4B5A5" stroke-width="2.5" stroke-linecap="round"/>' +
     '<line x1="78" y1="42" x2="90" y2="26" stroke="#C4B5A5" stroke-width="3" stroke-linecap="round"/>' +
     '<line x1="82" y1="38" x2="96" y2="30" stroke="#C4B5A5" stroke-width="2.5" stroke-linecap="round"/>' +
     '<circle cx="24" cy="80" r="3" fill="#FFD93D" opacity="0.5"/>' +
     '<circle cx="42" cy="90" r="2.5" fill="#FFD93D" opacity="0.4"/>' +
     '<circle cx="78" cy="88" r="3" fill="#FFD93D" opacity="0.5"/>' +
     '<circle cx="96" cy="78" r="2.5" fill="#FFD93D" opacity="0.4"/>' +
     '<circle cx="60" cy="96" r="3" fill="#FFD93D" opacity="0.4"/>' +
     '<circle cx="34" cy="68" r="2" fill="#FFD93D" opacity="0.35"/>' +
     '<circle cx="86" cy="68" r="2" fill="#FFD93D" opacity="0.35"/>' +
     '</svg>',
};

function getAvatar(num) {
  return AVATARS[num] || AVATARS[1];
}
