/**
 * AI 个性化报告生成系统
 * 基于 Claude API，根据命理数据生成一人一版的专属报告
 *
 * 架构：
 *   generatePersonalReport() → proxy endpoint → Claude API → parseReport()
 *   失败时返回 null，调用方降级到静态模板
 *
 * 缓存：sessionStorage，同生日+type不重复调用
 * 安全：API key 不写在前端，通过代理端点注入
 */

/* ══════════════════════════════════════════
   Config — 部署时修改此处的代理端点
   ══════════════════════════════════════════ */
var AI_CONFIG = {
  // 代理端点 URL（Vercel Serverless Function 或其他中转接口）
  // 部署时替换为你的实际端点，留空则 AI 模式自动降级为静态模板
  endpoint: '',

  // 是否启用 AI 生成（endpoint 为空时自动禁用）
  enabled: false,

  // 请求超时（毫秒）
  timeout: 25000,

  // 缓存有效期（毫秒），默认 session 级别
  cacheTTL: 0
};

/* ══════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════ */

/** 构建缓存键（生日+type，同一人不重复生成） */
function _aiCacheKey(userData) {
  return 'ai_report_' + userData.bazi.year.gan + userData.bazi.year.zhi +
         userData.bazi.month.gan + userData.bazi.month.zhi +
         userData.bazi.day.gan + userData.bazi.day.zhi +
         (userData.bazi.hasHour ? userData.bazi.hour.gan + userData.bazi.hour.zhi : '') +
         '_' + (userData.isAdult ? 'adult' : 'baby');
}

/** 从 sessionStorage 读缓存 */
function _aiCacheGet(key) {
  try {
    var raw = sessionStorage.getItem(key);
    if (!raw) return null;
    var entry = JSON.parse(raw);
    if (AI_CONFIG.cacheTTL > 0 && Date.now() - entry.ts > AI_CONFIG.cacheTTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch(e) { return null; }
}

/** 写入 sessionStorage 缓存 */
function _aiCacheSet(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data: data, ts: Date.now() }));
  } catch(e) { /* quota exceeded, ignore */ }
}

/* ══════════════════════════════════════════
   Step 2: Adult System Prompt
   ══════════════════════════════════════════ */
function buildAdultSystemPrompt() {
  return '你是一位融合西方数字命理学和中国传统八字命理的解读师，擅长用现代白话语言帮助人理解自己的先天能量和人生方向。\n' +
    '\n' +
    '你的语言风格：\n' +
    '- 像一个了解对方的朋友在说话，不是在读报告\n' +
    '- 句子短，一句话不超过25字\n' +
    '- 直接说到点上，不废话，不用"往往""通常""一般来说"\n' +
    '- 负面特质用"功课"而不是"缺点"\n' +
    '- 不用算命腔调，不说"命中注定""天命所归"\n' +
    '- 多用"你"开头，让用户感受到在说自己\n' +
    '- 关键结论加粗（用**文字**格式）\n' +
    '\n' +
    '输出格式要求：\n' +
    '严格按照JSON格式输出，不要有任何前缀或后缀文字，不要markdown代码块，直接输出JSON对象。';
}

/* ══════════════════════════════════════════
   Step 3: Baby System Prompt
   ══════════════════════════════════════════ */
function buildBabySystemPrompt() {
  return '你是一位融合西方数字命理学和中国传统八字命理的儿童天赋解读师，擅长帮助父母读懂孩子的先天能量和成长方向。\n' +
    '\n' +
    '你的语言风格：\n' +
    '- 像一个了解这个孩子的朋友在跟妈妈说话\n' +
    '- 句子短，温暖，有具体的生活场景感\n' +
    '- 用孩子的名字，第三人称（他/她）\n' +
    '- 不说"这类孩子通常"，要说"小宝会在..."\n' +
    '- 养育建议必须具体可执行，今天就能用\n' +
    '- 不说废话，不用"多陪伴孩子"这种空话\n' +
    '- 关键描述加粗（用**文字**格式）\n' +
    '\n' +
    '输出格式要求：\n' +
    '严格按照JSON格式输出，不要有任何前缀或后缀文字，不要markdown代码块，直接输出JSON对象。';
}

/* ══════════════════════════════════════════
   Step 4: User Prompt Builder
   ══════════════════════════════════════════ */
function buildUserPrompt(dataDesc, name, pronoun, isAdult, momNum, childNum) {
  var wxEmoji = {木:'🌱',火:'🔥',土:'🌍',金:'⚡',水:'💧'};

  if (isAdult) {
    return '根据以下用户的命理数据，生成一份个性化报告。\n' +
      '每个模块的文案必须严格基于这个人的具体数据组合，不能是通用描述。\n' +
      '\n' +
      '用户数据：\n' +
      dataDesc + '\n' +
      '\n' +
      '请生成以下JSON结构，每个字段的内容必须：\n' +
      '1. 包含至少一处引用用户具体数据的描述（如"' + name + '的XX日主..."）\n' +
      '2. 不能出现"这类人""通常""一般来说"等通用表达\n' +
      '3. 每个模块的第一句话必须是这个人能立刻认出自己的具体行为描述\n' +
      '\n' +
      '{\n' +
      '  "opening": "100字以内，这个人的核心能量描述，包含主命数+日主+身强弱三层交叉，第一句是别人能观察到的具体行为",\n' +
      '  "personality": "先天性格，120字，描述这个人在日常生活里具体是什么样子，用至少一个具体场景，绝对不能和strength内容重复",\n' +
      '  "strength": "天生优势，120字，说清楚这个人的特质在哪个具体场景里是竞争力，为什么是竞争力，不能和personality重复",\n' +
      '  "wealthAnalysis": "财富格局分析，150字，基于具体八字数据分析财富能力，包含：财星是什么五行、有几个、日主能否驾驭、给出具体的财富路径建议",\n' +
      '  "industryAdvice": "行业建议，100字，基于喜用神+主命数，给出3个最适合的具体行业方向和一句为什么",\n' +
      '  "lifeLesson": {\n' +
      '    "label": "人生课题的4字名称",\n' +
      '    "core": "人生课题核心一句话，15字以内",\n' +
      '    "body": "120字，说清楚这个课题为什么是这个人的，在哪些生活场景里会出现，不能泛泛而谈",\n' +
      '    "scene": "60字，这个课题在3个具体时刻的表现",\n' +
      '    "action": "今天就能做的一个行动，40字，非常具体"\n' +
      '  },\n' +
      '  "yearTheme": {\n' +
      '    "theme": "今年流年主题名称",\n' +
      '    "desc": "100字，今年对这个人具体意味着什么，结合主命数+流年数+八字身强弱",\n' +
      '    "q1": "Q1（1-3月）建议，40字",\n' +
      '    "q2": "Q2（4-6月）建议，40字",\n' +
      '    "q3": "Q3（7-9月）建议，40字",\n' +
      '    "q4": "Q4（10-12月）建议，40字"\n' +
      '  },\n' +
      '  "missingAnalysis": [\n' +
      '    对每个缺失数字生成：\n' +
      '    {\n' +
      '      "num": 缺失的数字,\n' +
      '      "label": "缺失能力的4字名称",\n' +
      '      "signal": "80字，这个人在生活里会认出自己的具体行为信号，第一句必须是一个场景",\n' +
      '      "fix": ["具体补法1，40字，今天就能做", "具体补法2，40字", "日常补法，30字"]\n' +
      '    }\n' +
      '  ],\n' +
      '  "actions": {\n' +
      '    "career": {"title": "事业行动标题，10字以内", "action": "80字，第一句说为什么（基于具体数据），后面说今天做什么，非常具体"},\n' +
      '    "love":   {"title": "爱情行动标题，10字以内", "action": "80字，同上"},\n' +
      '    "life":   {"title": "生活行动标题，10字以内", "action": "80字，同上"}\n' +
      '  }\n' +
      '}';

  } else {
    return '根据以下孩子的命理数据，生成一份给妈妈看的个性化育儿报告。\n' +
      '\n' +
      '用户数据：\n' +
      dataDesc + '\n' +
      '\n' +
      '请生成以下JSON结构：\n' +
      '\n' +
      '{\n' +
      '  "opening": "100字，这个孩子的核心能量描述，包含主命数+日主，第一句是妈妈能立刻认出孩子的具体行为",\n' +
      '  "personality": "先天性格，120字，描述孩子在日常生活里具体是什么样子，用至少一个具体生活场景",\n' +
      '  "strength": "天生优势，120字，说清楚孩子的特质在哪个具体场景里会显现，绝不能和personality内容重复",\n' +
      '  "yearTheme": {\n' +
      '    "theme": "今年养育主题",\n' +
      '    "desc": "100字，今年对这个孩子具体意味着什么，给妈妈的养育重点",\n' +
      '    "q1": "Q1养育建议，40字，具体可执行",\n' +
      '    "q2": "Q2养育建议，40字",\n' +
      '    "q3": "Q3养育建议，40字",\n' +
      '    "q4": "Q4养育建议，40字"\n' +
      '  },\n' +
      '  "missingAnalysis": [\n' +
      '    {\n' +
      '      "num": 缺失数字,\n' +
      '      "label": "缺失能力名称",\n' +
      '      "signal": "60字，妈妈在生活里能观察到的具体表现",\n' +
      '      "fix": ["今天就能用的方法1，35字", "方法2，35字", "日常小习惯，25字"]\n' +
      '    }\n' +
      '  ],\n' +
      '  "parentTips": [\n' +
      '    "妈妈今天就能用的方法1，50字，非常具体，包含具体对话或行为",\n' +
      '    "方法2，50字",\n' +
      '    "方法3，50字"\n' +
      '  ],\n' +
      '  "contactMode": {\n' +
      '    "reason": "60字，为什么这个孩子需要这种相处方式，基于具体数据",\n' +
      '    "mode": "核心相处模式，15字以内",\n' +
      '    "scenes": ["具体场景1，50字，包含具体对话示例", "场景2，50字", "场景3，50字"]\n' +
      '  }\n' +
      '}';
  }
}

/* ══════════════════════════════════════════
   Step 5: Parse AI Response
   ══════════════════════════════════════════ */
function parseReport(text) {
  try {
    var clean = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    // Handle case where JSON is wrapped in {}
    var start = clean.indexOf('{');
    var end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) {
      clean = clean.substring(start, end + 1);
    }
    return JSON.parse(clean);
  } catch(e) {
    console.error('AI报告JSON解析失败:', e.message);
    return null;
  }
}

/* ══════════════════════════════════════════
   Step 1: Core API Call
   ══════════════════════════════════════════ */

/**
 * 生成个性化报告
 * @param {object} userData - 完整命理数据
 * @returns {Promise<object|null>} AI报告JSON，失败返回null
 */
async function generatePersonalReport(userData) {
  // 检查是否启用
  if (!AI_CONFIG.enabled || !AI_CONFIG.endpoint) {
    console.log('AI报告未启用（endpoint为空），使用静态模板');
    return null;
  }

  // 检查缓存
  var cacheKey = _aiCacheKey(userData);
  var cached = _aiCacheGet(cacheKey);
  if (cached) {
    console.log('命中AI报告缓存');
    return cached;
  }

  var name = userData.name;
  var gender = userData.gender;
  var pronoun = gender === 'female' ? '她' : '他';
  var isAdult = userData.isAdult;
  var momNum = userData.momNum;
  var childNum = userData.childNum;

  // 构建数据描述
  var numberNames = {};
  for (var n = 1; n <= 9; n++) {
    numberNames[n] = NUMBER_COLORS[n] ? NUMBER_COLORS[n].theme : '';
  }
  var yearThemes = {};
  for (var yn2 = 1; yn2 <= 9; yn2++) {
    yearThemes[yn2] = adultYearTheme[yn2] ? adultYearTheme[yn2].theme : '';
  }

  var wxEmoji = {木:'🌱',火:'🔥',土:'🌍',金:'⚡',水:'💧'};
  var dataDesc = [
    '姓名：' + name,
    '性别：' + (gender === 'female' ? '女' : '男'),
    '生命主命数：' + userData.lifeNum + '号（' + (numberNames[userData.lifeNum] || '') + '）',
    '今年流年数：' + userData.yearNum + '号（' + (yearThemes[userData.yearNum] || '') + '）',
    '八字日主：' + userData.dayMaster + '（' + userData.dayMasterWX + wxEmoji[userData.dayMasterWX] + '）',
    '身强身弱：' + userData.strengthLevel + '（' + (userData.isStrong ? '身强' : '身弱') + '）',
    '五行分布：木' + userData.wuXing.count['木'] + ' 火' + userData.wuXing.count['火'] + ' 土' + userData.wuXing.count['土'] + ' 金' + userData.wuXing.count['金'] + ' 水' + userData.wuXing.count['水'],
    '缺失数字：' + (userData.missingNumbers && userData.missingNumbers.length > 0 ? userData.missingNumbers.join('、') + '号' : '无缺失'),
    '缺失五行：' + (userData.missingWX && userData.missingWX.length > 0 ? userData.missingWX.join('、') : '五行齐全'),
    '喜用神：' + (userData.xiWX || []).join('、'),
    '忌神：' + (userData.jiWX || []).join('、'),
    '财富格局：' + (userData.wealthPattern ? userData.wealthPattern.pattern : '未知'),
    '四柱：' + userData.bazi.year.gan + userData.bazi.year.zhi + ' ' + userData.bazi.month.gan + userData.bazi.month.zhi + ' ' + userData.bazi.day.gan + userData.bazi.day.zhi + (userData.bazi.hasHour ? ' ' + userData.bazi.hour.gan + userData.bazi.hour.zhi : ''),
    '版本：' + (isAdult ? '成人版' : '宝宝版')
  ];

  if (!isAdult && momNum) {
    dataDesc.push('妈妈主命数：' + momNum + '号');
  }

  var dataDescText = dataDesc.join('\n');

  var systemPrompt = isAdult
    ? buildAdultSystemPrompt()
    : buildBabySystemPrompt();

  var userPrompt = buildUserPrompt(dataDescText, name, pronoun, isAdult, momNum, childNum);

  // 构建请求体
  var body = JSON.stringify({
    system: systemPrompt,
    user: userPrompt,
    maxTokens: 4000
  });

  // 带超时的fetch
  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, AI_CONFIG.timeout);

  try {
    var response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('AI代理端点返回错误: ' + response.status);
      return null;
    }

    var data = await response.json();
    var text = '';
    if (data.content && data.content[0] && data.content[0].text) {
      text = data.content[0].text;
    } else if (data.text) {
      text = data.text;
    } else if (typeof data === 'string') {
      text = data;
    } else {
      text = JSON.stringify(data);
    }

    var report = parseReport(text);
    if (report) {
      _aiCacheSet(cacheKey, report);
      console.log('AI报告生成成功');
      return report;
    }

    console.error('AI报告解析后为空');
    return null;

  } catch(err) {
    clearTimeout(timeoutId);
    console.error('AI报告生成失败，降级到静态模板:', err.message);
    return null;
  }
}

/* ══════════════════════════════════════════
   Step 7: Render AI Report to DOM
   ══════════════════════════════════════════ */

/** 把 **text** 转成 <strong>text</strong> */
function _aiBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * 将AI报告渲染到页面DOM
 * @param {object} report - AI生成的报告JSON
 * @param {object} userData - 用户命理数据
 */
function renderAIReport(report, userData) {
  var isAdult = userData.isAdult;
  var adultColor = '#9B72CF';

  // --- Opening ---
  var elOpen = document.getElementById('aiOpening');
  if (elOpen && report.opening) {
    elOpen.innerHTML = _aiBold(report.opening);
  }

  // --- Personality ---
  var elPers = document.getElementById('personalityText');
  if (elPers && report.personality) {
    elPers.innerHTML = _aiBold(report.personality);
  }

  // --- Strength ---
  var elStr = document.getElementById('strengthList');
  if (elStr && report.strength) {
    elStr.style.listStyle = 'none';
    elStr.style.padding = '0';
    elStr.innerHTML = '<li style="padding:0;"><p class="body-text" style="margin:0;line-height:1.8;">' + _aiBold(report.strength) + '</p></li>';
  }

  // --- Wealth + Industry (adult) ---
  if (isAdult) {
    var elWealth = document.getElementById('aiWealthSection');
    if (elWealth && report.wealthAnalysis) {
      elWealth.style.display = '';
      document.getElementById('aiWealthText').innerHTML = _aiBold(report.wealthAnalysis);
      if (report.industryAdvice) {
        document.getElementById('aiIndustryText').innerHTML = _aiBold(report.industryAdvice);
      }
    }
  }

  // --- Life Lesson (adult) ---
  if (isAdult && report.lifeLesson) {
    var lesson = report.lifeLesson;
    var elLesson = document.getElementById('missingSection');
    if (elLesson) {
      elLesson.innerHTML =
        '<div class="card" style="padding:24px 20px;">' +
          '<div style="display:inline-block;font-size:13px;font-weight:600;color:' + adultColor + ';background:#F8F4FF;padding:4px 14px;border-radius:100px;margin-bottom:12px;">人生课题：' + _aiBold(lesson.label || '') + '</div>' +
          '<p style="font-family:var(--font-display);font-size:18px;color:var(--text-primary);margin-bottom:10px;line-height:1.5;">' + _aiBold(lesson.core || '') + '</p>' +
          '<p style="font-size:14px;color:var(--text-secondary);line-height:1.75;margin-bottom:12px;">' + _aiBold(lesson.body || '') + '</p>' +
          '<div style="background:#F8F4FF;border-radius:12px;padding:12px 14px;margin-bottom:10px;">' +
            '<p style="font-size:12px;color:' + adultColor + ';margin-bottom:4px;">它会在这些时刻出现：</p>' +
            '<p style="font-size:13px;color:var(--text-secondary);line-height:1.7;">' + _aiBold(lesson.scene || '') + '</p>' +
          '</div>' +
          '<div style="background:#FFF5F5;border-radius:12px;padding:12px 14px;">' +
            '<p style="font-size:12px;color:#FF6B6B;margin-bottom:4px;">现在就可以做：</p>' +
            '<p style="font-size:13px;color:var(--text-secondary);line-height:1.7;">' + _aiBold(lesson.action || '') + '</p>' +
          '</div>' +
        '</div>';
    }
  }

  // --- Missing Analysis ---
  if (report.missingAnalysis && report.missingAnalysis.length > 0) {
    var elMissing = document.getElementById(isAdult ? 'missingSection' : 'missingSection');
    // Only override missing section for baby mode (adult mode already handled above)
    if (!isAdult && elMissing) {
      var missHtml = '';
      for (var mi = 0; mi < report.missingAnalysis.length; mi++) {
        var mItem = report.missingAnalysis[mi];
        var mc = NUMBER_COLORS[mItem.num];
        var mColor = mc ? mc.color : '#A8917A';
        missHtml +=
          '<div class="missing-item" style="padding:16px 0;">' +
            '<div class="missing-num-badge" style="background:' + mColor + ';">' + mItem.num + '</div>' +
            '<div class="missing-num-body">' +
              '<p style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">' + _aiBold(mItem.label || '') + '</p>' +
              '<p class="missing-num-desc">' + _aiBold(mItem.signal || '') + '</p>' +
              '<div style="margin-top:8px;">' +
                (mItem.fix || []).map(function(f, fi) {
                  return '<p style="font-size:12px;color:var(--c2);margin-top:4px;">' + (fi + 1) + '. ' + _aiBold(f) + '</p>';
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>';
      }
      elMissing.innerHTML = missHtml;
    }
  }

  // --- Year Theme ---
  if (report.yearTheme) {
    var yt = report.yearTheme;
    var elYear = document.getElementById('yearThemeCard');
    if (elYear) {
      elYear.innerHTML =
        '<div style="text-align:center;padding:8px 0;">' +
          '<p style="font-family:var(--font-display);font-size:22px;color:var(--text-primary);margin-bottom:6px;">' + _aiBold(yt.theme || '') + '</p>' +
          '<p style="font-size:14px;color:var(--text-secondary);line-height:1.7;max-width:280px;margin:0 auto 16px;">' + _aiBold(yt.desc || '') + '</p>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
          '<div style="background:#EEF6FF;border-radius:10px;padding:10px 12px;"><p style="font-size:11px;color:#4D96FF;margin-bottom:2px;">Q1 · 1-3月</p><p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + _aiBold(yt.q1 || '') + '</p></div>' +
          '<div style="background:#FFF0F5;border-radius:10px;padding:10px 12px;"><p style="font-size:11px;color:#FF6B6B;margin-bottom:2px;">Q2 · 4-6月</p><p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + _aiBold(yt.q2 || '') + '</p></div>' +
          '<div style="background:#FFF8E1;border-radius:10px;padding:10px 12px;"><p style="font-size:11px;color:#FFB830;margin-bottom:2px;">Q3 · 7-9月</p><p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + _aiBold(yt.q3 || '') + '</p></div>' +
          '<div style="background:#F0FBF2;border-radius:10px;padding:10px 12px;"><p style="font-size:11px;color:#6BCB77;margin-bottom:2px;">Q4 · 10-12月</p><p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + _aiBold(yt.q4 || '') + '</p></div>' +
        '</div>';
    }
  }

  // --- Actions (adult) ---
  if (isAdult && report.actions) {
    var elTips = document.getElementById('tipsList');
    if (elTips) {
      var cardStyles = {
        career: { bg: '#EEF6FF', border: '#4D96FF', icon: '💼' },
        love:   { bg: '#FFF0F5', border: '#FF6B6B', icon: '💕' },
        life:   { bg: '#F0FBF2', border: '#6BCB77', icon: '🌟' }
      };
      var keys = ['career', 'love', 'life'];
      var actHtml = '';
      for (var ak = 0; ak < keys.length; ak++) {
        var aItem = report.actions[keys[ak]];
        if (!aItem) continue;
        var aStyle = cardStyles[keys[ak]];
        actHtml +=
          '<div style="background:' + aStyle.bg + ';border-radius:12px;padding:16px;margin-bottom:10px;border-left:3px solid ' + aStyle.border + ';">' +
            '<p style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">' + aStyle.icon + ' ' + _aiBold(aItem.title || '') + '</p>' +
            '<p style="font-size:13px;color:var(--text-secondary);line-height:1.8;">' + _aiBold(aItem.action || '') + '</p>' +
          '</div>';
      }
      elTips.style.listStyle = 'none';
      elTips.style.padding = '0';
      elTips.innerHTML = actHtml;
    }
  }

  // --- Parent Tips (baby) ---
  if (!isAdult && report.parentTips) {
    var elTips2 = document.getElementById('tipsList');
    if (elTips2) {
      var tipsHtml = '';
      for (var pt = 0; pt < report.parentTips.length; pt++) {
        tipsHtml += '<li style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:12px;padding-left:4px;">' +
          '<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:var(--c2);color:#fff;border-radius:50%;font-size:12px;margin-right:8px;">' + (pt + 1) + '</span>' +
          _aiBold(report.parentTips[pt]) +
        '</li>';
      }
      elTips2.innerHTML = tipsHtml;
    }
  }

  // --- Contact Mode (baby) ---
  if (!isAdult && report.contactMode) {
    var cm = report.contactMode;
    var elTips3 = document.getElementById('tipsList');
    if (elTips3) {
      var scenesHtml = '';
      for (var si = 0; si < (cm.scenes || []).length; si++) {
        scenesHtml += '<li class="contact-scene">' + _aiBold(cm.scenes[si]) + '</li>';
      }
      elTips3.innerHTML =
        '<div class="contact-mode-card">' +
          '<p class="contact-mode-why">' + _aiBold(cm.reason || '') + '</p>' +
          '<p class="contact-mode-core"><strong>' + _aiBold(cm.mode || '') + '</strong></p>' +
          '<p class="contact-mode-scenes-label">今天就能用的' + (cm.scenes || []).length + '个场景：</p>' +
          '<ol class="contact-scenes-list">' + scenesHtml + '</ol>' +
        '</div>';
    }
  }
}

/* ══════════════════════════════════════════
   Step 8: Loading Animation
   ══════════════════════════════════════════ */

var _loadingTimer = null;

/** 显示加载动画 */
function showAILoading() {
  var el = document.getElementById('aiLoading');
  if (el) el.style.display = 'flex';
  var content = document.getElementById('reportContent');
  if (content) content.style.display = 'none';

  var msgs = [
    '正在解读你的生命数字...',
    '分析八字五行分布...',
    '计算身强身弱和喜用神...',
    '生成专属报告...'
  ];
  var i = 0;
  var textEl = document.getElementById('aiLoadingText');
  if (textEl) {
    textEl.textContent = msgs[0];
    _loadingTimer = setInterval(function() {
      i = (i + 1) % msgs.length;
      textEl.textContent = msgs[i];
    }, 1500);
  }
}

/** 隐藏加载动画 */
function hideAILoading() {
  if (_loadingTimer) {
    clearInterval(_loadingTimer);
    _loadingTimer = null;
  }
  var el = document.getElementById('aiLoading');
  if (el) el.style.display = 'none';
  var content = document.getElementById('reportContent');
  if (content) {
    content.style.display = 'block';
    // 触发入场动画
    var cards = content.querySelectorAll('.anim-fade-up');
    for (var c = 0; c < cards.length; c++) {
      cards[c].style.animationPlayState = 'running';
    }
  }
}

/* ══════════════════════════════════════════
   Step 6: Main Entry — initReport
   ══════════════════════════════════════════ */

/**
 * 初始化报告页（替代原有的直接渲染逻辑）
 *
 * 使用方法：在 report-free.html 中，将原有的 report-init IIFE 替换为调用此函数。
 *
 * @param {object} p - URL参数对象（来自 getParams()）
 * @param {Function} renderStatic - 静态模板渲染回调（AI失败时调用）
 */
async function initAIReport(p, renderStatic) {
  // 解析基础参数
  var childName   = p.c_name || p.name;
  var childYear   = parseInt(p.c_year || p.year);
  var childMonth  = parseInt(p.c_month || p.month);
  var childDay    = parseInt(p.c_day || p.day);
  var childGender = p.c_gender || p.gender;
  var childHour   = p.c_hour !== undefined ? parseInt(p.c_hour) : undefined;
  var isAdult     = p.type === 'adult';

  if (!childName || !childYear || !childMonth || !childDay) {
    hideAILoading();
    if (typeof renderStatic === 'function') {
      renderStatic({ error: 'missing_params' });
    }
    return;
  }

  // 显示加载动画
  showAILoading();

  // 计算所有命理数据
  var lifeNum = calcLifeNumber(childYear, childMonth, childDay);
  var yearNum = calcYearNumber(childMonth, childDay, getCurrentYear());
  var freq = countDigitFrequency(childYear, childMonth, childDay);
  var missingNums = calcMissingNumbers(childYear, childMonth, childDay);

  // BaZi
  var baziData = null;
  var wuXingData = null;
  var strengthData = null;
  var xijiData = null;
  var dayMasterWX = '';
  var GAN_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};

  try {
    if (typeof Lunar !== 'undefined') {
      baziData = calcBazi(childYear, childMonth, childDay, childHour);
      wuXingData = calcWuXing(baziData);
      strengthData = calcStrength(baziData);
      dayMasterWX = GAN_WX[baziData.dayMaster] || '';
      try { sessionStorage.setItem('dayMasterWX', dayMasterWX); } catch(e) {}
      xijiData = calcXiJi(dayMasterWX, strengthData.isStrong);
    }
  } catch(e) {
    console.warn('BaZi computation failed:', e);
  }

  // Wealth pattern (adult only)
  var wealthData = null;
  if (isAdult && baziData && wuXingData && strengthData) {
    try {
      wealthData = calcWealthPattern(baziData, wuXingData, strengthData);
    } catch(e) {
      console.warn('Wealth calc failed:', e);
    }
  }

  // 组装 userData
  var userData = {
    name: childName,
    gender: childGender || 'male',
    lifeNum: lifeNum,
    yearNum: yearNum,
    dayMaster: baziData ? baziData.dayMaster : '',
    dayMasterWX: dayMasterWX,
    isStrong: strengthData ? strengthData.isStrong : false,
    strengthLevel: strengthData ? strengthData.level : '',
    wuXing: wuXingData || { count: {木:0,火:0,土:0,金:0,水:0}, missing: [], strong: [] },
    missingNumbers: missingNums,
    missingWX: wuXingData ? wuXingData.missing : [],
    wealthPattern: wealthData,
    xiWX: xijiData ? xijiData.xi.map(function(x) { return x.wx; }) : [],
    jiWX: xijiData ? xijiData.ji.map(function(x) { return x.wx; }) : [],
    bazi: baziData || { year:{gan:'',zhi:''}, month:{gan:'',zhi:''}, day:{gan:'',zhi:''}, hasHour:false, dayMaster:'' },
    isAdult: isAdult,
    momNum: p.m_num || null,
    childNum: lifeNum,
    freq: freq,
    connections: baziData ? getConnections(freq) : []
  };

  // 尝试AI生成
  var aiReport = null;
  try {
    aiReport = await generatePersonalReport(userData);
  } catch(e) {
    console.warn('AI report generation error:', e);
    aiReport = null;
  }

  if (aiReport) {
    // AI成功 → 渲染AI内容
    try {
      renderAIReport(aiReport, userData);
      hideAILoading();
      console.log('AI报告渲染完成');
      return;
    } catch(e) {
      console.warn('AI报告渲染失败，降级到静态模板:', e);
    }
  }

  // AI失败 → 降级到静态模板
  hideAILoading();
  if (typeof renderStatic === 'function') {
    renderStatic({ success: true, data: userData });
  }
}
