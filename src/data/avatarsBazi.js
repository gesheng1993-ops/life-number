/**
 * 八字日主身强身弱插画
 * 10天干 × 2种强弱 = 20个SVG插画
 * 风格：圆润童趣儿童绘本风，viewBox="0 0 160 160"
 * 使用：baziAvatars['甲-强'], baziAvatars['乙-弱'] 等
 */

var baziAvatars = {

  '甲-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0FBF2"/>'
    + '<rect x="68" y="85" width="24" height="45" rx="8" fill="#8B5E3C"/>'
    + '<circle cx="80" cy="60" r="38" fill="#6BCB77"/>'
    + '<circle cx="55" cy="72" r="22" fill="#5DBF6A"/>'
    + '<circle cx="105" cy="72" r="22" fill="#5DBF6A"/>'
    + '<circle cx="80" cy="42" r="24" fill="#4DB85A"/>'
    + '<circle cx="115" cy="35" r="12" fill="#FFD93D" opacity=".9"/>'
    + '<line x1="115" y1="35" x2="100" y2="50" stroke="#FFD93D" stroke-width="2" opacity=".5"/>'
    + '</svg>',

  '甲-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFF8EE"/>'
    + '<rect x="76" y="95" width="8" height="30" rx="4" fill="#A0724A"/>'
    + '<ellipse cx="80" cy="88" rx="18" ry="14" fill="#8BC67A" opacity=".8"/>'
    + '<ellipse cx="65" cy="94" rx="12" ry="9" fill="#7AB869" opacity=".7"/>'
    + '<ellipse cx="95" cy="94" rx="12" ry="9" fill="#7AB869" opacity=".7"/>'
    + '<ellipse cx="80" cy="128" rx="35" ry="8" fill="#D4A96A"/>'
    + '<line x1="55" y1="122" x2="58" y2="132" stroke="#C49050" stroke-width="1.5" opacity=".6"/>'
    + '<line x1="70" y1="125" x2="68" y2="135" stroke="#C49050" stroke-width="1.5" opacity=".6"/>'
    + '<line x1="90" y1="125" x2="92" y2="135" stroke="#C49050" stroke-width="1.5" opacity=".6"/>'
    + '</svg>',

  '乙-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0FBF2"/>'
    + '<path d="M40,130 Q50,80 80,60 Q110,40 120,30" fill="none" stroke="#6BCB77" stroke-width="6" stroke-linecap="round"/>'
    + '<path d="M40,130 Q60,100 90,90 Q120,80 130,60" fill="none" stroke="#5DBF6A" stroke-width="5" stroke-linecap="round"/>'
    + '<circle cx="80" cy="60" r="10" fill="#4DB85A"/>'
    + '<circle cx="120" cy="30" r="8" fill="#4DB85A"/>'
    + '<circle cx="130" cy="60" r="7" fill="#6BCB77"/>'
    + '<circle cx="55" cy="95" r="9" fill="#4DB85A"/>'
    + '<circle cx="105" cy="75" r="8" fill="#5DBF6A"/>'
    + '</svg>',

  '乙-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFFBF0"/>'
    + '<path d="M60,120 Q55,90 65,70" fill="none" stroke="#C4A862" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M80,120 Q85,88 75,65" fill="none" stroke="#BFA058" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M100,120 Q108,92 95,72" fill="none" stroke="#C4A862" stroke-width="4" stroke-linecap="round"/>'
    + '<ellipse cx="80" cy="122" rx="38" ry="7" fill="#D4B87A" opacity=".5"/>'
    + '</svg>',

  '丙-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFFBEE"/>'
    + '<circle cx="80" cy="72" r="32" fill="#FFD93D"/>'
    + '<circle cx="80" cy="72" r="24" fill="#FFB830"/>'
    + '<line x1="118.0" y1="72.0" x2="132.0" y2="72.0" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="110.7" y1="94.3" x2="122.1" y2="102.6" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="91.7" y1="108.1" x2="96.1" y2="121.5" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="68.3" y1="108.1" x2="63.9" y2="121.5" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="49.3" y1="94.3" x2="37.9" y2="102.6" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="42.0" y1="72.0" x2="28.0" y2="72.0" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="49.3" y1="49.7" x2="37.9" y2="41.4" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="68.3" y1="35.9" x2="63.9" y2="22.5" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="91.7" y1="35.9" x2="96.1" y2="22.5" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<line x1="110.7" y1="49.7" x2="122.1" y2="41.4" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<ellipse cx="80" cy="128" rx="45" ry="6" fill="#FFE0A0" opacity=".4"/>'
    + '</svg>',

  '丙-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFF8F0"/>'
    + '<rect x="68" y="95" width="24" height="38" rx="6" fill="#F0E0C0"/>'
    + '<rect x="74" y="88" width="12" height="10" rx="3" fill="#E0C89A"/>'
    + '<ellipse cx="80" cy="84" rx="6" ry="9" fill="#FF9F43" opacity=".9"/>'
    + '<ellipse cx="80" cy="80" rx="4" ry="6" fill="#FFD93D"/>'
    + '<ellipse cx="80" cy="78" rx="2" ry="3" fill="white" opacity=".8"/>'
    + '</svg>',

  '丁-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFF5EE"/>'
    + '<ellipse cx="80" cy="118" rx="30" ry="8" fill="#C49050"/>'
    + '<ellipse cx="58" cy="115" rx="12" ry="9" fill="#A87840"/>'
    + '<ellipse cx="102" cy="115" rx="12" ry="9" fill="#A87840"/>'
    + '<rect x="65" y="85" width="8" height="30" rx="3" fill="#8B5E3C" transform="rotate(-10,69,100)"/>'
    + '<rect x="87" y="85" width="8" height="30" rx="3" fill="#8B5E3C" transform="rotate(10,91,100)"/>'
    + '<ellipse cx="80" cy="82" rx="14" ry="18" fill="#FF6B6B" opacity=".85"/>'
    + '<ellipse cx="80" cy="76" rx="9" ry="13" fill="#FF9F43"/>'
    + '<ellipse cx="80" cy="72" rx="5" ry="8" fill="#FFD93D"/>'
    + '</svg>',

  '丁-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFF8F5"/>'
    + '<rect x="70" y="100" width="20" height="32" rx="5" fill="#EED8B0"/>'
    + '<path d="M80,96 Q92,78 85,65" fill="none" stroke="#FF9F43" stroke-width="5" stroke-linecap="round"/>'
    + '<path d="M80,96 Q90,82 86,70" fill="none" stroke="#FFD93D" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M40,75 Q55,72 70,75" fill="none" stroke="#C4D8F0" stroke-width="1.5" opacity=".6" stroke-dasharray="3 2"/>'
    + '<path d="M35,85 Q52,82 65,85" fill="none" stroke="#C4D8F0" stroke-width="1.5" opacity=".5" stroke-dasharray="3 2"/>'
    + '</svg>',

  '戊-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F5F8FF"/>'
    + '<polygon points="80,30 120,110 40,110" fill="#8B9AAA"/>'
    + '<polygon points="115,55 145,110 85,110" fill="#9BAABB"/>'
    + '<polygon points="45,60 75,110 15,110" fill="#9BAABB"/>'
    + '<polygon points="80,30 95,65 65,65" fill="white" opacity=".7"/>'
    + '<ellipse cx="55" cy="85" rx="22" ry="8" fill="white" opacity=".7"/>'
    + '<ellipse cx="110" cy="80" rx="18" ry="7" fill="white" opacity=".6"/>'
    + '</svg>',

  '戊-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F5F0E8"/>'
    + '<ellipse cx="80" cy="105" rx="52" ry="20" fill="#B89860"/>'
    + '<ellipse cx="80" cy="100" rx="40" ry="14" fill="#C8A870"/>'
    + '<ellipse cx="55" cy="108" rx="18" ry="6" fill="#7BA8C4" opacity=".5"/>'
    + '<ellipse cx="105" cy="112" rx="14" ry="5" fill="#7BA8C4" opacity=".4"/>'
    + '</svg>',

  '己-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FFFBEE"/>'
    + '<circle cx="80" cy="45" r="22" fill="#FFD93D"/>'
    + '<circle cx="80" cy="45" r="15" fill="#FFB830"/>'
    + '<line x1="80" y1="18" x2="80" y2="10" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"/>'
    + '<line x1="55" y1="26" x2="50" y2="20" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"/>'
    + '<line x1="105" y1="26" x2="110" y2="20" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"/>'
    + '<line x1="46" y1="45" x2="38" y2="45" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"/>'
    + '<line x1="114" y1="45" x2="122" y2="45" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"/>'
    + '<ellipse cx="80" cy="118" rx="52" ry="16" fill="#D4A850"/>'
    + '<ellipse cx="80" cy="112" rx="45" ry="12" fill="#C89840"/>'
    + '<path d="M40,108 Q55,102 70,108 Q85,114 100,108 Q115,102 128,108" fill="none" stroke="#A87830" stroke-width="1.5" opacity=".6"/>'
    + '<path d="M50,118 Q62,112 74,118" fill="none" stroke="#A87830" stroke-width="1.5" opacity=".5"/>'
    + '<path d="M88,116 Q100,110 112,116" fill="none" stroke="#A87830" stroke-width="1.5" opacity=".5"/>'
    + '<path d="M60,104 L65,120" stroke="#A87830" stroke-width="1" opacity=".4"/>'
    + '<path d="M80,102 L80,122" stroke="#A87830" stroke-width="1" opacity=".4"/>'
    + '<path d="M100,105 L95,120" stroke="#A87830" stroke-width="1" opacity=".4"/>'
    + '</svg>',

  '己-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0F4F8"/>'
    + '<ellipse cx="65" cy="45" rx="28" ry="16" fill="#B0B8C4"/>'
    + '<ellipse cx="95" cy="40" rx="22" ry="14" fill="#A8B0BC"/>'
    + '<ellipse cx="80" cy="50" rx="35" ry="18" fill="#B8C0CC"/>'
    + '<ellipse cx="80" cy="112" rx="50" ry="15" fill="#8B9A70"/>'
    + '<ellipse cx="80" cy="106" rx="42" ry="10" fill="#9AAA78"/>'
    + '<ellipse cx="45" cy="110" rx="16" ry="5" fill="#7BA8C4" opacity=".45"/>'
    + '<ellipse cx="110" cy="115" rx="12" ry="4" fill="#7BA8C4" opacity=".4"/>'
    + '<line x1="60" y1="65" x2="55" y2="78" stroke="#8090A4" stroke-width="1.5" opacity=".5"/>'
    + '<line x1="80" y1="62" x2="80" y2="76" stroke="#8090A4" stroke-width="1.5" opacity=".5"/>'
    + '<line x1="100" y1="65" x2="105" y2="78" stroke="#8090A4" stroke-width="1.5" opacity=".5"/>'
    + '</svg>',

  '庚-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F5F8FF"/>'
    + '<defs><linearGradient id="swordGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A0B4C8"/><stop offset="50%" stop-color="#E8F0F8"/><stop offset="100%" stop-color="#A0B4C8"/></linearGradient></defs>'
    + '<polygon points="80,20 86,90 80,100 74,90" fill="#C8D4E0"/>'
    + '<polygon points="80,20 86,90 80,100 74,90" fill="url(#swordGrad)"/>'
    + '<rect x="65" y="88" width="30" height="8" rx="4" fill="#C8A850"/>'
    + '<rect x="75" y="96" width="10" height="22" rx="4" fill="#B89840"/>'
    + '<circle cx="105" cy="38" r="4" fill="#E8F0F8" opacity=".9"/>'
    + '<circle cx="118" cy="55" r="3" fill="#E8F0F8" opacity=".8"/>'
    + '<circle cx="55" cy="45" r="3" fill="#E8F0F8" opacity=".7"/>'
    + '</svg>',

  '庚-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0F2F5"/>'
    + '<polygon points="80,45 115,75 105,115 55,115 45,75" fill="#8090A0"/>'
    + '<polygon points="80,45 115,75 100,60" fill="#9AAABB"/>'
    + '<polygon points="55,115 45,75 60,90" fill="#707880"/>'
    + '<circle cx="75" cy="85" r="5" fill="#9AAABB"/>'
    + '<circle cx="90" cy="95" r="4" fill="#9AAABB"/>'
    + '<circle cx="68" cy="98" r="3" fill="#A0B0C0"/>'
    + '</svg>',

  '辛-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F5F0FF"/>'
    + '<polygon points="80,30 115,65 115,100 80,125 45,100 45,65" fill="#C8B8F0"/>'
    + '<polygon points="80,30 115,65 80,72" fill="#E0D0FF"/>'
    + '<polygon points="80,30 45,65 80,72" fill="#D0C0F0"/>'
    + '<polygon points="80,72 115,65 115,100 80,125 45,100 45,65" fill="#B8A8E0"/>'
    + '<polygon points="80,72 115,100 80,125" fill="#A898D0"/>'
    + '<polygon points="80,72 45,100 80,125" fill="#C0B0E8"/>'
    + '<circle cx="55" cy="45" r="3" fill="white" opacity=".8"/>'
    + '<circle cx="108" cy="52" r="2.5" fill="white" opacity=".7"/>'
    + '<circle cx="48" cy="80" r="2" fill="white" opacity=".6"/>'
    + '</svg>',

  '辛-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0EEF5"/>'
    + '<circle cx="80" cy="82" r="32" fill="#B0A8C0"/>'
    + '<circle cx="80" cy="82" r="28" fill="#C0B8D0"/>'
    + '<circle cx="80" cy="82" r="22" fill="#A898B8"/>'
    + '<ellipse cx="80" cy="78" rx="14" ry="10" fill="#C8C0D8" opacity=".6"/>'
    + '<ellipse cx="50" cy="95" rx="18" ry="5" fill="#C4B8A8" opacity=".5"/>'
    + '<ellipse cx="112" cy="92" rx="14" ry="4" fill="#C4B8A8" opacity=".4"/>'
    + '<ellipse cx="80" cy="105" rx="25" ry="5" fill="#C4B8A8" opacity=".45"/>'
    + '</svg>',

  '壬-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#EEF5FF"/>'
    + '<ellipse cx="80" cy="105" rx="65" ry="30" fill="#2878C8"/>'
    + '<path d="M15,95 Q35,80 55,95 Q75,110 95,95 Q115,80 145,95" fill="none" stroke="#4D96FF" stroke-width="3.5" stroke-linecap="round"/>'
    + '<path d="M15,108 Q40,95 60,108 Q80,121 100,108 Q120,95 145,108" fill="none" stroke="#3D86EF" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M15,82 Q30,70 50,82 Q70,94 85,82 Q100,70 120,78" fill="none" stroke="#5DA6FF" stroke-width="2.5" stroke-linecap="round"/>'
    + '</svg>',

  '壬-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#F0F8FF"/>'
    + '<ellipse cx="45" cy="100" rx="16" ry="12" fill="#9AAABB"/>'
    + '<ellipse cx="110" cy="105" rx="14" ry="10" fill="#8A9AAB"/>'
    + '<ellipse cx="78" cy="115" rx="10" ry="8" fill="#9AAABB"/>'
    + '<path d="M20,85 Q45,90 55,100 Q65,110 80,108 Q95,106 105,100 Q118,94 140,98" fill="none" stroke="#7BB8E0" stroke-width="5" stroke-linecap="round" opacity=".8"/>'
    + '<path d="M20,85 Q45,90 55,100 Q65,110 80,108 Q95,106 105,100 Q118,94 140,98" fill="none" stroke="#A0D0F0" stroke-width="2" stroke-linecap="round" opacity=".6"/>'
    + '</svg>',

  '癸-强': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#EEF5FF"/>'
    + '<ellipse cx="70" cy="50" rx="28" ry="18" fill="#7BB8E0"/>'
    + '<ellipse cx="95" cy="45" rx="22" ry="16" fill="#8AC8F0"/>'
    + '<ellipse cx="80" cy="55" rx="34" ry="20" fill="#90C8F0"/>'
    + '<ellipse cx="65" cy="80" rx="6" ry="9" fill="#4D96FF" opacity=".7"/>'
    + '<ellipse cx="80" cy="85" rx="6" ry="9" fill="#4D96FF" opacity=".75"/>'
    + '<ellipse cx="95" cy="78" rx="6" ry="9" fill="#4D96FF" opacity=".7"/>'
    + '<ellipse cx="72" cy="100" rx="5" ry="8" fill="#5DA6FF" opacity=".65"/>'
    + '<ellipse cx="90" cy="102" rx="5" ry="8" fill="#5DA6FF" opacity=".65"/>'
    + '<ellipse cx="80" cy="120" rx="28" ry="8" fill="#8BC8F0" opacity=".4"/>'
    + '</svg>',

  '癸-弱': '<svg viewBox="0 0 160 160">'
    + '<circle cx="80" cy="80" r="70" fill="#FBF5EE"/>'
    + '<ellipse cx="80" cy="105" rx="50" ry="18" fill="#C8A870"/>'
    + '<path d="M45,100 Q60,95 75,100 Q90,105 105,100 Q118,95 125,100" fill="none" stroke="#A88850" stroke-width="1.5" opacity=".6"/>'
    + '<path d="M55,110 Q65,105 75,110" fill="none" stroke="#A88850" stroke-width="1.5" opacity=".5"/>'
    + '<path d="M88,108 Q98,103 108,108" fill="none" stroke="#A88850" stroke-width="1.5" opacity=".5"/>'
    + '<path d="M62,97 L60,113" stroke="#A88850" stroke-width="1" opacity=".4"/>'
    + '<path d="M80,95 L80,115" stroke="#A88850" stroke-width="1" opacity=".4"/>'
    + '<path d="M98,97 L100,112" stroke="#A88850" stroke-width="1" opacity=".4"/>'
    + '<ellipse cx="80" cy="100" rx="12" ry="5" fill="#7BA8C4" opacity=".3"/>'
    + '</svg>'

};
