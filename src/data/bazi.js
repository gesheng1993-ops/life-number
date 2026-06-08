/**
 * 四柱八字计算模块
 * 依赖：lunar-javascript CDN（需在 HTML 中先引入）
 *
 * 验证网站：
 * 1. 算命网 suanming.com 八字排盘
 * 2. 易奇八字 eqbz.com
 * 以上两个网站结果一致则为准确
 */

var BAZI_CACHE = {};

// ====== 共享五行映射表 ======
var GAN_TO_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var GAN_TO_YY = {甲:'阳',乙:'阴',丙:'阳',丁:'阴',戊:'阳',己:'阴',庚:'阳',辛:'阴',壬:'阳',癸:'阴'};
var ZHI_TO_WX = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
var CANG_GAN  = {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};
var SHENG_MAP = {木:'水',火:'木',土:'火',金:'土',水:'金'}; // 生我者
var KE_MAP    = {木:'土',火:'金',土:'水',金:'木',水:'火'}; // 我克者
var KE_WO_MAP = {木:'金',火:'水',土:'木',金:'火',水:'土'}; // 克我者
var WO_SHENG  = {木:'火',火:'土',土:'金',金:'水',水:'木'}; // 我生者

/** 十神计算：传入日主天干和目标天干，返回十神名称 */
function calcShiShen(dayGan, targetGan) {
  var dayWX  = GAN_TO_WX[dayGan];
  var tarWX  = GAN_TO_WX[targetGan];
  // 阴阳判断（天干奇数位为阳：甲丙戊庚壬）
  var yangGan = ['甲','丙','戊','庚','壬'];
  var dayYin  = yangGan.indexOf(dayGan) === -1;
  var tarYin  = yangGan.indexOf(targetGan) === -1;
  var sameYin = dayYin === tarYin;

  if (tarWX === dayWX)               return sameYin ? '比肩' : '劫财';
  if (tarWX === SHENG_MAP[dayWX])    return sameYin ? '偏印' : '正印';
  if (tarWX === WO_SHENG[dayWX])     return sameYin ? '食神' : '伤官';
  if (tarWX === KE_MAP[dayWX])       return sameYin ? '偏财' : '正财';
  if (tarWX === KE_WO_MAP[dayWX])    return sameYin ? '七杀' : '正官';
  return '';
}

/** 地支十神（用藏干主气） */
function calcZhiShenName(dayGan, zhi) {
  return calcShiShen(dayGan, CANG_GAN[zhi]);
}

function calcBazi(year, month, day, hour) {
  var hasHour = (hour >= 0);
  var cacheKey = year + '-' + month + '-' + day + (hasHour ? '-h' + hour : '');

  if (BAZI_CACHE[cacheKey]) return BAZI_CACHE[cacheKey];

  var ec = null;
  var usedPath = '';

  // 方式一：Solar类（最精确，正确处理时区和日历转换）
  if (!ec) {
    try {
      if (typeof Solar !== 'undefined') {
        var solar = Solar.fromYmdHms(year, month, day, hasHour ? hour : 12, 0, 0);
        ec = solar.getLunar().getEightChar();
        usedPath = 'Solar';
      }
    } catch(e) {
      console.warn('Solar 路径失败: ' + e.message);
    }
  }

  // 方式二：Lunar.fromYmdHms（带时辰）
  if (!ec && hasHour) {
    try {
      if (typeof Lunar !== 'undefined' && Lunar.fromYmdHms) {
        var lunarHms = Lunar.fromYmdHms(year, month, day, hour, 0, 0);
        ec = lunarHms.getEightChar();
        usedPath = 'Lunar.fromYmdHms';
      }
    } catch(e) {
      console.warn('Lunar.fromYmdHms 路径失败: ' + e.message);
    }
  }

  // 方式三：Lunar.fromYmd（无时辰，最终兜底）
  if (!ec) {
    if (hasHour) {
      console.warn('带时辰的排盘路径全部失败，降级为无时辰排盘');
      hasHour = false;
    }
    try {
      var lunarYmd = Lunar.fromYmd(year, month, day);
      ec = lunarYmd.getEightChar();
      usedPath = 'Lunar.fromYmd（无时柱）';
    } catch(e) {
      console.error('所有排盘路径都失败了: ' + e.message);
      return null;
    }
  }

  console.log('八字排盘路径: ' + usedPath);

  // 构建结果
  var result = {
    year:  { gan: ec.getYearGan(),  zhi: ec.getYearZhi()  },
    month: { gan: ec.getMonthGan(), zhi: ec.getMonthZhi() },
    day:   { gan: ec.getDayGan(),   zhi: ec.getDayZhi()   },
    hasHour: hasHour,
    dayMaster: ec.getDayGan()
  };

  if (hasHour) {
    result.hour = { gan: ec.getTimeGan(), zhi: ec.getTimeZhi() };
  }

  // 十神（可选，部分版本可能不支持）
  try {
    result.year.ganShen = ec.getYearGanShen();
    result.year.zhiShen = ec.getYearZhiShen();
    result.month.ganShen = ec.getMonthGanShen();
    result.month.zhiShen = ec.getMonthZhiShen();
    result.day.ganShen = ec.getDayGanShen();
    result.day.zhiShen = ec.getDayZhiShen();
    if (hasHour) {
      result.hour.ganShen = ec.getTimeGanShen();
      result.hour.zhiShen = ec.getTimeZhiShen();
    }
  } catch(e) {
    // 十神方法不存在，忽略
  }

  console.log('年柱：' + result.year.gan + result.year.zhi);
  console.log('月柱：' + result.month.gan + result.month.zhi);
  console.log('日柱：' + result.day.gan + result.day.zhi);
  console.log('日主：' + result.dayMaster + '（' + GAN_TO_WX[result.dayMaster] + '）');
  if (hasHour) console.log('时柱：' + result.hour.gan + result.hour.zhi);

  BAZI_CACHE[cacheKey] = result;
  return result;
}

function calcWuXing(bazi) {
  var count = { 木:0, 火:0, 土:0, 金:0, 水:0 };

  var pillars = [bazi.year, bazi.month, bazi.day];
  if (bazi.hasHour && bazi.hour) pillars.push(bazi.hour);

  pillars.forEach(function(p) {
    count[GAN_TO_WX[p.gan]]++;
    count[ZHI_TO_WX[p.zhi]]++;
  });

  var missing = [];
  var strong = [];
  Object.keys(count).forEach(function(k) {
    if (count[k] === 0) missing.push(k);
    if (count[k] >= 3) strong.push(k);
  });

  var details = {};
  Object.keys(count).forEach(function(k) {
    details[k] = { score: count[k], label: count[k] === 0 ? '缺' : (count[k] >= 3 ? '旺' : '有') };
  });

  return { count: count, missing: missing, strong: strong, details: details };
}

function calcGeJu(bazi, wuXing) {
  var dayGan = bazi.day.gan;
  var dayWX = GAN_TO_WX[dayGan];
  var dayYY = GAN_TO_YY[dayGan];

  var monthZhi = bazi.month.zhi;
  var monthWX = ZHI_TO_WX[monthZhi];

  var monthMainQi = CANG_GAN[monthZhi];
  var monthQiWX = GAN_TO_WX[monthMainQi];
  var monthQiYY = GAN_TO_YY[monthMainQi];

  // === 特殊格局 ===
  // 专旺格：日主五行旺且月令同日主五行
  if (wuXing.count[dayWX] >= 3 && monthWX === dayWX) {
    return { name: '专旺格', desc: '日主极旺，能量高度集中，天赋突出但需要找到正确的出口，适合走专精路线。', tip: '这类孩子不适合什么都学，找到他最擅长的一件事，深挖下去。' };
  }
  // 从格：日主五行完全缺失
  if (wuXing.count[dayWX] === 0) {
    return { name: '从格', desc: '日主无根，顺势而为，适应力极强，能在各种环境中找到自己的位置。', tip: '这类孩子不要强迫走固定路线，给他多元尝试的机会，他会自己找到方向。' };
  }

  // === 月令格局（子平法：以月令本气定格局） ===
  var yinWX = SHENG_MAP[dayWX]; // 生我者 → 印星五行

  // 月令是印星
  if (monthQiWX === yinWX) {
    if (monthQiYY === dayYY) {
      return { name: '偏印格', desc: '偏印入命，思维独特，不随大流，有自己的一套学习方式和理解世界的角度。偏印孩子往往在某方面有超乎常人的领悟力，但也容易沉浸在自己的世界里。', tip: '这类孩子不适合填鸭式教育，给他自我探索的空间，他会用自己的方式学会。妈妈不用太担心他"不合群"，那是他的特质，不是问题。' };
    } else {
      return { name: '正印格', desc: '正印入命，学习吸收力强，有贵人运，适合走学术路线。妈妈和长辈对他的影响力特别大，在一个有爱的环境里能发挥最大的潜力。', tip: '你的言行举止对他影响深远，身教大于言教。给他一个安静的学习角落，他的专注力会让你吃惊。' };
    }
  }

  // 月令是财星（我克者）
  var caiWX = KE_MAP[dayWX];
  if (monthQiWX === caiWX || wuXing.count[caiWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '偏财格', desc: '偏财入命，天生有商业嗅觉和资源整合能力，对价值和交换有直觉，出手大方，人缘好。', tip: '从小可以给他一点零花钱让他自己管理，培养财商。让他参与家庭的小决策。' };
    } else {
      return { name: '正财格', desc: '正财入命，踏实肯干，对物质有稳定的追求，做事有计划，一步一个脚印地积累。', tip: '给他设立可量化的目标，他会用"做到"来证明自己。奖励不一定是钱，一颗星星贴纸也能激励他。' };
    }
  }

  // 月令是官星（克我者）
  var guanWX = KE_WO_MAP[dayWX];
  if (monthQiWX === guanWX || wuXing.count[guanWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '七杀格', desc: '七杀入命，胆子大，有魄力，敢挑战不可能的事。小时候可能显得"难管"，但引导好了是成大器的料。', tip: '这类孩子需要的是挑战而不是压制。给他一个有难度的任务，他会全力以赴。但要注意给他合理的边界。' };
    } else {
      return { name: '正官格', desc: '正官入命，规则意识强，有责任心，在有秩序的环境里表现最好，是老师眼中的好学生。', tip: '给他清晰的规则和期望，他在有边界的环境里反而最自由。' };
    }
  }

  // 月令是食伤（我生者）
  var shiShangWX = WO_SHENG[dayWX];
  if (monthQiWX === shiShangWX || wuXing.count[shiShangWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '食神格', desc: '食神入命，天生乐天派，喜欢享受生活，创造力丰富，对美和快乐有天然的追求。', tip: '这类孩子需要快乐的氛围才能发挥最大潜力。把学习变成游戏，他会学得比谁都快。' };
    } else {
      return { name: '伤官格', desc: '伤官入命，创造力强，不按常理出牌，适合艺术、设计、创新领域。想法多、敢表达，但需要注意表达方式。', tip: '欣赏他的独特想法，同时温和地教他如何在规则内发挥创意。' };
    }
  }

  // 月令是比劫（同我者）
  if (monthQiWX === dayWX) {
    if (monthQiYY === dayYY) {
      return { name: '建禄格', desc: '建禄入命，日主得月令之助，精力旺盛，独立性强，做事有冲劲不依赖他人。', tip: '这类孩子从小就显露出独立意识，给他空间，让他自己去闯，他会在实践中快速成长。' };
    } else {
      return { name: '劫财格', desc: '劫财入命，社交能力突出，能快速融入新环境，但需要注意分享和界限的平衡。', tip: '教他合作但不依赖，分享但不牺牲自己。团队活动是他最好的成长场景。' };
    }
  }

  // === 五行计数兜底（月令未命中时的后备判断） ===
  if (wuXing.count[yinWX] >= 3) {
    return { name: '印格', desc: '印星旺盛，学习能力强，有贵人运，适合走学术或需要持续学习的路线。', tip: '你的言行举止对他影响深远，身教大于言教。' };
  }
  if (wuXing.count[caiWX] >= 3) {
    return { name: '财格', desc: '财星旺盛，天生有物质意识和资源整合能力，对价值和交换有直觉。', tip: '从小可以给他一点零花钱让他自己管理，培养财商。' };
  }
  if (wuXing.count[shiShangWX] >= 3) {
    return { name: '伤官格', desc: '创造力强，不按常理出牌，适合艺术、设计、创新领域，但需要注意引导表达方式。', tip: '欣赏他的独特想法，同时温和地教他如何在规则内发挥创意。' };
  }

  return { name: '中和格', desc: '五行相对均衡，适应力强，各方面发展较为全面，没有特别突出的短板。', tip: '这类孩子全面发展即可，不需要刻意专攻某一方向。' };
}

/** 身强身弱判断（帮扶 vs 克泄比较法） */
function calcStrength(bazi) {
  var dayGan = bazi.dayMaster;
  var dayWX  = GAN_TO_WX[dayGan];
  var beShengWX = SHENG_MAP[dayWX]; // 生我者（印星）

  // 月令得令判断（权重最高）
  var monthZhiWX = ZHI_TO_WX[bazi.month.zhi];
  var deOrder = monthZhiWX === dayWX || monthZhiWX === beShengWX;

  // 统计全局帮扶 vs 克泄
  var helpScore = 0;
  var weakScore = 0;

  var allElements = [
    GAN_TO_WX[bazi.year.gan],
    ZHI_TO_WX[bazi.year.zhi],
    GAN_TO_WX[bazi.month.gan],
    ZHI_TO_WX[bazi.month.zhi],
    ZHI_TO_WX[bazi.day.zhi]
  ];
  if (bazi.hasHour) {
    allElements.push(GAN_TO_WX[bazi.hour.gan]);
    allElements.push(ZHI_TO_WX[bazi.hour.zhi]);
  }

  for (var i = 0; i < allElements.length; i++) {
    var wx = allElements[i];
    if (wx === dayWX) helpScore += 1;               // 同五行：比劫帮扶
    else if (wx === beShengWX) helpScore += 1;       // 生我者：印星滋养
    else if (wx === KE_WO_MAP[dayWX]) weakScore += 1; // 克我者：官杀压制
    else if (wx === WO_SHENG[dayWX]) weakScore += 0.5; // 我生者：食伤泄气
    else weakScore += 0.5;                            // 我克者：财星消耗
  }

  // 月令得令额外加权
  if (deOrder) helpScore += 2;

  var isStrong = helpScore > weakScore;

  // 强弱等级
  var diff = helpScore - weakScore;
  var level = '';
  if (diff >= 4) level = '极强';
  else if (diff >= 2) level = '偏强';
  else if (diff >= 0) level = '中和偏强';
  else if (diff >= -2) level = '中和偏弱';
  else if (diff >= -4) level = '偏弱';
  else level = '极弱';

  // 调试输出
  console.log('=== 八字身强身弱计算过程 ===');
  console.log('日主：' + dayGan + ' ' + dayWX);
  console.log('月令：' + bazi.month.zhi + ' ' + monthZhiWX + ' → ' + (deOrder ? '得令✓' : '失令✗'));
  console.log('帮扶分：' + helpScore.toFixed(1));
  console.log('克泄分：' + weakScore.toFixed(1));
  console.log('结论：' + level + ' ' + (isStrong ? '身强' : '身弱'));
  console.log('========================');

  return {
    isStrong: isStrong,
    level: level,
    helpScore: helpScore.toFixed(1),
    weakScore: weakScore.toFixed(1),
    deOrder: deOrder,
    label: isStrong ? '身强' : '身弱',
    desc: isStrong
      ? '帮扶力量(' + helpScore.toFixed(1) + ') > 克泄力量(' + weakScore.toFixed(1) + ')，日主能量旺盛'
      : '帮扶力量(' + helpScore.toFixed(1) + ') < 克泄力量(' + weakScore.toFixed(1) + ')，日主能量偏弱'
  };
}

/** 喜忌推算 */
function calcXiJi(dayWX, isStrong) {
  var xi, ji;
  if (isStrong) {
    // 身强：喜克我+我生+我克（泄秀耗）
    xi = [KE_WO_MAP[dayWX], WO_SHENG[dayWX], KE_MAP[dayWX]];
    ji = [dayWX, SHENG_MAP[dayWX]]; // 忌同类+生我
  } else {
    // 身弱：喜生我+同类
    xi = [SHENG_MAP[dayWX], dayWX];
    ji = [KE_WO_MAP[dayWX], KE_MAP[dayWX], WO_SHENG[dayWX]];
  }

  var wxColor = {木:'#6BCB77',火:'#FF6B6B',土:'#FFD93D',金:'#C4A882',水:'#4D96FF'};
  var wxEmoji = {木:'🌱',火:'🔥',土:'🌍',金:'⚡',水:'💧'};
  var wxDesc  = {
    木:'木（成长、表达、创造）',
    火:'火（热情、行动、领导）',
    土:'土（稳定、踏实、责任）',
    金:'金（智慧、精准、执行）',
    水:'水（感知、直觉、深度）'
  };

  function buildItem(w) {
    return { wx: w, color: wxColor[w], emoji: wxEmoji[w], desc: wxDesc[w] };
  }

  return {
    xi: xi.map(buildItem),
    ji: ji.map(buildItem)
  };
}

var WUXING_TO_NUMBER = {
  木: { numbers:[3,5], ability:'表达力、创造力、自由探索' },
  火: { numbers:[1,9], ability:'领导力、行动力、热情完成' },
  土: { numbers:[4,8], ability:'稳定性、目标感、踏实执行' },
  金: { numbers:[6,7], ability:'责任感、智慧、精准判断' },
  水: { numbers:[2,7], ability:'共情力、感知力、深度思考' }
};

function getBaziNumberLink(wuXing, missingNumbers) {
  var result = [];
  wuXing.missing.forEach(function(wx) {
    var link = WUXING_TO_NUMBER[wx];
    if (!link) return;
    var overlap = link.numbers.filter(function(n) { return missingNumbers.indexOf(n) >= 0; });
    result.push({
      wuXing: wx,
      numbers: link.numbers,
      ability: link.ability,
      isDoubleConfirm: overlap.length > 0,
      overlapNumbers: overlap
    });
  });
  return result;
}
