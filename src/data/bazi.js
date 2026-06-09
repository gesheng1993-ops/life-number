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
    return { name: '专旺格', desc: '日主极旺，能量高度集中，天赋突出但需要找到正确的出口，适合走专精路线。', tip: '这类孩子不适合什么都学，找到他最擅长的一件事，深挖下去。', adultDesc: '你的能量场高度集中，天生就是"单点突破"型选手。你不是什么都擅长，但在对的那个领域，你能做到别人无法企及的深度。', adultTip: '你不适合分散精力，找到那件让你"忘了时间"的事，然后把它变成你的专业壁垒。' };
  }
  // 从格：日主五行完全缺失
  if (wuXing.count[dayWX] === 0) {
    return { name: '从格', desc: '日主无根，顺势而为，适应力极强，能在各种环境中找到自己的位置。', tip: '这类孩子不要强迫走固定路线，给他多元尝试的机会，他会自己找到方向。', adultDesc: '你的能量随环境流动，适应力是你最强的武器。无论在哪里，你都能找到自己的位置，这是很多人羡慕不来的天赋。', adultTip: '你不需要一条"固定的路"，你需要在变化中抓住机会。拥抱不确定性，那是你最擅长的游戏。' };
  }

  // === 月令格局（子平法：以月令本气定格局） ===
  var yinWX = SHENG_MAP[dayWX]; // 生我者 → 印星五行

  // 月令是印星
  if (monthQiWX === yinWX) {
    if (monthQiYY === dayYY) {
      return { name: '偏印格', desc: '偏印入命，思维独特，不随大流，有自己的一套学习方式和理解世界的角度。偏印孩子往往在某方面有超乎常人的领悟力，但也容易沉浸在自己的世界里。', tip: '这类孩子不适合填鸭式教育，给他自我探索的空间，他会用自己的方式学会。妈妈不用太担心他"不合群"，那是他的特质，不是问题。', adultDesc: '你的思维方式和大多数人不一样——这不是问题，是你的超能力。你对世界的理解有自己独特的路径，别人看不懂的，你一眼就能穿透。', adultTip: '你不适合走"标准路线"。给自己留出独立思考的空间，你的直觉和洞察力会在安静中生长。别因为和别人不一样而怀疑自己。' };
    } else {
      return { name: '正印格', desc: '正印入命，学习吸收力强，有贵人运，适合走学术路线。妈妈和长辈对他的影响力特别大，在一个有爱的环境里能发挥最大的潜力。', tip: '你的言行举止对他影响深远，身教大于言教。给他一个安静的学习角落，他的专注力会让你吃惊。', adultDesc: '你的学习力和吸收力是你的根基，总能在关键时刻遇到对的人指点你。你适合在稳定的环境里深耕，慢慢长成一棵大树。', adultTip: '找到一个值得你长期投入的方向，你的力量来自积累。别急，你的节奏就是"慢而稳"。' };
    }
  }

  // 月令是财星（我克者）
  var caiWX = KE_MAP[dayWX];
  if (monthQiWX === caiWX || wuXing.count[caiWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '偏财格', desc: '偏财入命，天生有商业嗅觉和资源整合能力，对价值和交换有直觉，出手大方，人缘好。', tip: '从小可以给他一点零花钱让他自己管理，培养财商。让他参与家庭的小决策。', adultDesc: '你对金钱和资源有直觉级的敏感度，天生懂得"钱在哪里"和"怎么让钱流动"。你的慷慨和大方让你在人群中自带吸引力。', adultTip: '相信你的商业直觉，但要学会把直觉变成系统。你的天赋不是省钱，是让资源流动起来。' };
    } else {
      return { name: '正财格', desc: '正财入命，踏实肯干，对物质有稳定的追求，做事有计划，一步一个脚印地积累。', tip: '给他设立可量化的目标，他会用"做到"来证明自己。奖励不一定是钱，一颗星星贴纸也能激励他。', adultDesc: '你是一步一个脚印的实干家，不投机、不取巧，用时间和努力兑现自己的目标。你的可靠和稳定是你最值钱的资产。', adultTip: '给自己设定清晰可量化的目标，你会用"做到"来证明自己。你不需要捷径，你的路虽然稳，但一定能到达。' };
    }
  }

  // 月令是官星（克我者）
  var guanWX = KE_WO_MAP[dayWX];
  if (monthQiWX === guanWX || wuXing.count[guanWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '七杀格', desc: '七杀入命，胆子大，有魄力，敢挑战不可能的事。小时候可能显得"难管"，但引导好了是成大器的料。', tip: '这类孩子需要的是挑战而不是压制。给他一个有难度的任务，他会全力以赴。但要注意给他合理的边界。', adultDesc: '你的魄力和胆识是你的核心武器。别人犹豫的时候你已经行动了，别人退缩的时候你反而兴奋。你天生适合打硬仗。', adultTip: '你需要挑战而不是安稳。给自己找"难而正确"的事做，你的能量在压力下才会真正爆发。但记得给自己设边界，别把命搭进去。' };
    } else {
      return { name: '正官格', desc: '正官入命，规则意识强，有责任心，在有秩序的环境里表现最好，是老师眼中的好学生。', tip: '给他清晰的规则和期望，他在有边界的环境里反而最自由。', adultDesc: '规则不是束缚你的枷锁，是你发挥实力的框架。你天生懂得责任和秩序的分量，在别人混乱时你已经把事做完了。', adultTip: '在有清晰规则和上升通道的环境里，你会发挥最大价值。别去混乱无序的地方，那不是你的战场。' };
    }
  }

  // 月令是食伤（我生者）
  var shiShangWX = WO_SHENG[dayWX];
  if (monthQiWX === shiShangWX || wuXing.count[shiShangWX] >= 3) {
    if (monthQiYY === dayYY) {
      return { name: '食神格', desc: '食神入命，天生乐天派，喜欢享受生活，创造力丰富，对美和快乐有天然的追求。', tip: '这类孩子需要快乐的氛围才能发挥最大潜力。把学习变成游戏，他会学得比谁都快。', adultDesc: '快乐是你的生产力。你天生懂得享受生活，创造力在轻松的氛围里自然流淌。别人苦哈哈做的事，你玩着就做完了。', adultTip: '别让"努力工作"的叙事压住你。把工作和生活变成一种享受，你的创造力会在快乐中爆发。给自己找乐子是正经事。' };
    } else {
      return { name: '伤官格', desc: '伤官入命，创造力强，不按常理出牌，适合艺术、设计、创新领域。想法多、敢表达，但需要注意表达方式。', tip: '欣赏他的独特想法，同时温和地教他如何在规则内发挥创意。', adultDesc: '你的创造力不按常理出牌，想法多、敢表达，是天生的创新者。你不走寻常路，因为寻常路本来就不是给你走的。', adultTip: '拥抱你的与众不同，但记住：最好的创意不是颠覆一切，是在边界内跳出最美的舞。学会在规则中保留锋芒。' };
    }
  }

  // 月令是比劫（同我者）
  if (monthQiWX === dayWX) {
    if (monthQiYY === dayYY) {
      return { name: '建禄格', desc: '建禄入命，日主得月令之助，精力旺盛，独立性强，做事有冲劲不依赖他人。', tip: '这类孩子从小就显露出独立意识，给他空间，让他自己去闯，他会在实践中快速成长。', adultDesc: '你精力旺盛，独立自强，不需要别人推着你走。你骨子里有股"我自己能行"的劲，这在成年人的世界里是稀缺品质。', adultTip: '你的冲劲是你的资本，但要选对方向。把能量聚焦在真正重要的事上，别在琐事上消耗自己的爆发力。' };
    } else {
      return { name: '劫财格', desc: '劫财入命，社交能力突出，能快速融入新环境，但需要注意分享和界限的平衡。', tip: '教他合作但不依赖，分享但不牺牲自己。团队活动是他最好的成长场景。', adultDesc: '你的社交能力是你最大的资产，你能快速融入任何圈子，建立连接。但要记住，人脉不是你帮了多少人，是你有多少人能和你一起做事。', adultTip: '合作但不依赖，分享但不牺牲自己。团队是你最好的舞台，但你也要学会守住自己的边界。' };
    }
  }

  // === 五行计数兜底（月令未命中时的后备判断） ===
  if (wuXing.count[yinWX] >= 3) {
    return { name: '印格', desc: '印星旺盛，学习能力强，有贵人运，适合走学术或需要持续学习的路线。', tip: '你的言行举止对他影响深远，身教大于言教。', adultDesc: '你的学习和吸收能力是你最强的底牌，总能在正确的时间遇到帮助你的人。你适合持续积累型的事业路径。', adultTip: '找到一个好老师或好圈子，你的成长会被加速。终身学习不是口号，是你天然的优势区。' };
  }
  if (wuXing.count[caiWX] >= 3) {
    return { name: '财格', desc: '财星旺盛，天生有物质意识和资源整合能力，对价值和交换有直觉。', tip: '从小可以给他一点零花钱让他自己管理，培养财商。', adultDesc: '你对价值和资源有天然的直觉，别人看热闹的时候你已经在看门道了。搞钱不是你的目的，是你理解世界的方式。', adultTip: '相信你的商业嗅觉，把直觉和执行力结合起来。你可以用钱生钱，但更重要的是用价值换价值。' };
  }
  if (wuXing.count[shiShangWX] >= 3) {
    return { name: '伤官格', desc: '创造力强，不按常理出牌，适合艺术、设计、创新领域，但需要注意引导表达方式。', tip: '欣赏他的独特想法，同时温和地教他如何在规则内发挥创意。', adultDesc: '你的创造力不按常理出牌，想法多、敢表达，是天生的创新者。你不走寻常路，因为寻常路本来就不是给你走的。', adultTip: '拥抱你的与众不同，但记住：最好的创意不是颠覆一切，是在边界内跳出最美的舞。学会在规则中保留锋芒。' };
  }

  return { name: '中和格', desc: '五行相对均衡，适应力强，各方面发展较为全面，没有特别突出的短板。', tip: '这类孩子全面发展即可，不需要刻意专攻某一方向。', adultDesc: '你的能量场相对均衡，这是很多人修炼一辈子都达不到的状态。你各方面都不弱，意味着你拥有比大多数人更宽的选择面。', adultTip: '你的优势是"没有明显短板"，但这不等于平庸。找到你最感兴趣的方向，你的均衡会帮你走得更稳更远。' };
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

/* =============================================
   地支刑冲合害 · 精准命理向量系统
   核心逻辑：名义喜忌（Nominal XiJi）vs 流年实际引动（Actual Transit）
   ============================================= */

/** 地支六合映射 */
var ZHI_HE = {
  '子丑':true,'丑子':true,'寅亥':true,'亥寅':true,
  '卯戌':true,'戌卯':true,'辰酉':true,'酉辰':true,
  '巳申':true,'申巳':true,'午未':true,'未午':true
};

/** 地支六冲映射 */
var ZHI_CHONG = {
  '子午':true,'午子':true,'丑未':true,'未丑':true,
  '寅申':true,'申寅':true,'卯酉':true,'酉卯':true,
  '辰戌':true,'戌辰':true,'巳亥':true,'亥巳':true
};

/** 地支相害映射 */
var ZHI_HAI = {
  '子未':true,'未子':true,'丑午':true,'午丑':true,
  '寅巳':true,'巳寅':true,'卯辰':true,'辰卯':true,
  '申亥':true,'亥申':true,'酉戌':true,'戌酉':true
};

/** 地支三刑（无礼/恃势/无恩/自刑） */
var ZHI_XING = {
  '寅巳':true,'巳寅':true,'巳申':true,'申巳':true,'寅申':true,'申寅':true, // 无恩之刑
  '丑戌':true,'戌丑':true,'戌未':true,'未戌':true,'丑未':true,'未丑':true, // 恃势之刑
  '子卯':true,'卯子':true, // 无礼之刑
  '辰辰':true,'午午':true,'酉酉':true,'亥亥':true  // 自刑
};

/** 地支半合/三合局 */
var ZHI_BANHE = {
  '寅午':true,'午寅':true,'午戌':true,'戌午':true,'寅戌':true,'戌寅':true, // 寅午戌火局
  '巳酉':true,'酉巳':true,'酉丑':true,'丑酉':true,'巳丑':true,'丑巳':true, // 巳酉丑金局
  '申子':true,'子申':true,'子辰':true,'辰子':true,'申辰':true,'辰申':true, // 申子辰水局
  '亥卯':true,'卯亥':true,'卯未':true,'未卯':true,'亥未':true,'未亥':true  // 亥卯未木局
};

/** 地支相破 */
var ZHI_PO = {
  '子酉':true,'酉子':true,'寅亥':true,'亥寅':true,
  '卯午':true,'午卯':true,'辰丑':true,'丑辰':true,
  '巳申':true,'申巳':true,'未戌':true,'戌未':true
};

/**
 * 检测流年地支与命局四柱地支的全部交互
 * @param {string} yearZhi - 流年地支
 * @param {object} bazi - 八字四柱 {year, month, day, hour}
 * @param {string} dayMasterWX - 日主五行
 * @returns {Array<{pillar, zhi, type, detail, effect, severity, copyKey}>}
 */
function detectYearBranchInteractions(yearZhi, bazi, dayMasterWX) {
  var results = [];
  var pillars = [
    { name: '年柱', zhi: bazi.year.zhi },
    { name: '月柱', zhi: bazi.month.zhi },
    { name: '日柱', zhi: bazi.day.zhi }
  ];
  if (bazi.hasHour && bazi.hour && bazi.hour.zhi) {
    pillars.push({ name: '时柱', zhi: bazi.hour.zhi });
  }

  for (var i = 0; i < pillars.length; i++) {
    var p = pillars[i];
    var pair = yearZhi + p.zhi;
    var revPair = p.zhi + yearZhi;

    // 优先级：刑 > 冲 > 害 > 破 > 合 > 半合
    if (ZHI_XING[pair] || ZHI_XING[revPair]) {
      var detail = yearZhi + p.zhi + '相刑';
      if (yearZhi === p.zhi) detail = yearZhi + '自刑';
      results.push({ pillar: p.name, zhi: p.zhi, type: '刑', detail: detail, effect: 'negative', severity: 3, copyKey: 'xing' });
    }
    else if (ZHI_CHONG[pair] || ZHI_CHONG[revPair]) {
      results.push({ pillar: p.name, zhi: p.zhi, type: '冲', detail: yearZhi + p.zhi + '相冲', effect: 'negative', severity: 3, copyKey: 'chong' });
    }
    else if (ZHI_HAI[pair] || ZHI_HAI[revPair]) {
      results.push({ pillar: p.name, zhi: p.zhi, type: '害', detail: yearZhi + p.zhi + '相害', effect: 'negative', severity: 2, copyKey: 'hai' });
    }
    else if (ZHI_PO[pair] || ZHI_PO[revPair]) {
      results.push({ pillar: p.name, zhi: p.zhi, type: '破', detail: yearZhi + p.zhi + '相破', effect: 'negative', severity: 2, copyKey: 'po' });
    }
    else if (ZHI_HE[pair] || ZHI_HE[revPair]) {
      results.push({ pillar: p.name, zhi: p.zhi, type: '合', detail: yearZhi + p.zhi + '六合', effect: 'mixed', severity: 1, copyKey: 'he' });
    }
    else if (ZHI_BANHE[pair] || ZHI_BANHE[revPair]) {
      results.push({ pillar: p.name, zhi: p.zhi, type: '半合', detail: yearZhi + p.zhi + '半合', effect: 'mixed', severity: 1, copyKey: 'banhe' });
    }
  }
  return results;
}

/**
 * 精准校准：1995-05-03 甲木身弱财旺 · 伤官生财格
 * 此案例为名义喜忌 vs 流年实际的标杆验证
 */
var XIJI_CALIBRATION = {
  '1995-5-3': {
    calibrationID: 'CASE_19950503',
    patternName: '甲木身弱财旺格 · 伤官生财',
    wealthInterval: 'LEVEL_2 (温饱至小富 · 稳步积累)',
    conflictTag: '克泄交加 · 强撑型精神透支',
    // 名义喜忌：基于身弱理论
    nominalXi: ['水', '木'],
    nominalJi: ['火', '土', '金'],
    // 流年验证：2022壬寅、2023癸卯
    yearOverrides: {
      2022: {
        yearGanZhi: '壬寅',
        ganEffect: '壬水为印，名义上大利学业/贵人/签约',
        zhiEffect: '寅木为比肩，名义上帮身有力',
        branchInteractions: [
          { type: '合', detail: '寅亥合木', copy: '寅亥合木本可帮身，但合中带破，合作中暗藏裂痕' },
          { type: '破', detail: '寅亥相破', copy: '寅亥合中带破——你以为的贵人实则是消耗你的人，合作反被拖累' }
        ],
        actualResult: '灾难级',
        actualCopy: '寅木虽是喜神，但与年柱亥水"合中带破"。流年地支的能量被年柱锁死，帮身之力完全无法传导到日主。反而引发了比劫夺财的连锁反应——合作破财、合伙背刺、信任崩塌。',
        lifeAreas: '财务纠纷、合作破裂、信任危机'
      },
      2023: {
        yearGanZhi: '癸卯',
        ganEffect: '癸水为印，名义上利学习/贵人',
        zhiEffect: '卯木为劫财，名义上帮身',
        branchInteractions: [
          { type: '穿', detail: '卯辰相穿', copy: '卯辰相穿——劫财穿透财库，不是来帮你，是来抄你老底的' }
        ],
        actualResult: '灾难级',
        actualCopy: '卯木来到，本应帮身。但"卯辰相穿"——流年劫财直穿月柱财库。这不是帮身，是把你的财库撬开了一个洞。表现为钱莫名其妙地流失、被最亲近的人算计、或被卷入经济纠纷。',
        lifeAreas: '财务流失、健康透支、被亲近之人消耗'
      }
    },
    // 长久建议
    longTermAdvice: '喜水木的大方向不错，但流年地支刑穿会彻底改写剧本。比劫来了不一定是帮手，要看它踩到了谁的地盘。'
  }
};

/**
 * 获取精准校准案例（如有）
 */
function getXiJiCalibration(baziData) {
  var key = baziData.solarYear + '-' + baziData.solarMonth + '-' + baziData.solarDay;
  return XIJI_CALIBRATION[key] || null;
}

/**
 * 向量分级喜忌系统 v2.0
 * 返回双层结构：名义喜忌（Nominal）+ 流年引动覆盖（Transit Override）
 *
 * @param {object} baziData - 八字排盘数据
 * @param {object} strengthData - calcStrength() 返回值
 * @param {number} currentYear - 当前年份（用于流年分析，可选）
 * @returns {{
 *   nominal: {xi: Array, ji: Array, label: string, theory: string},
 *   calibration: object|null,
 *   transit: object|null,
 *   final: {xi: Array, ji: Array, label: string, conflictWarning: string|null}
 * }}
 */
function calcXiJiVector(baziData, strengthData, currentYear) {
  var dayWX = GAN_TO_WX[baziData.dayMaster];
  var isStrong = strengthData.isStrong;

  // --- Layer 1: 名义喜忌（经典理论） ---
  var nominalXi, nominalJi, theoryLabel;
  if (isStrong) {
    nominalXi = [KE_WO_MAP[dayWX], WO_SHENG[dayWX], KE_MAP[dayWX]];
    nominalJi = [dayWX, SHENG_MAP[dayWX]];
    theoryLabel = '身强：喜克泄耗（官杀/食伤/财），忌生扶（印/比劫）';
  } else {
    nominalXi = [SHENG_MAP[dayWX], dayWX];
    nominalJi = [KE_WO_MAP[dayWX], KE_MAP[dayWX], WO_SHENG[dayWX]];
    theoryLabel = '身弱：喜生扶（印/比劫），忌克泄耗（官杀/财/食伤）';
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

  var nominal = {
    xi: nominalXi.map(buildItem),
    ji: nominalJi.map(buildItem),
    label: theoryLabel,
    theory: isStrong ? '身强' : '身弱'
  };

  // --- Layer 2: 精准校准检测 ---
  var calibration = getXiJiCalibration(baziData);

  // --- Layer 3: 流年引动分析 ---
  var transit = null;
  var conflictWarning = null;
  var finalXi = nominalXi.slice();
  var finalJi = nominalJi.slice();

  if (currentYear && calibration) {
    var yearOverride = calibration.yearOverrides[currentYear];

    if (yearOverride) {
      transit = {
        yearNum: currentYear,
        yearGanZhi: yearOverride.yearGanZhi,
        ganEffect: yearOverride.ganEffect,
        zhiEffect: yearOverride.zhiEffect,
        branchInteractions: yearOverride.branchInteractions,
        actualResult: yearOverride.actualResult,
        actualCopy: yearOverride.actualCopy,
        lifeAreas: yearOverride.lifeAreas
      };

      // 实际引动覆盖名义喜忌
      if (yearOverride.actualResult === '灾难级') {
        conflictWarning = yearOverride.actualCopy;
        // 标记被"虚假喜神"实际克害的元素
        // 寅/卯本为木（名义喜），但因刑穿，实际相当于"忌神行为"
      }
    }
  }

  // --- 最终输出 ---
  var finalLabel = (isStrong ? '身强' : '身弱') + ' · 名义喜' + finalXi.join('');
  if (conflictWarning) {
    finalLabel += '（⚠️ 流年刑穿改写，见下方详情）';
  }

  return {
    nominal: nominal,
    calibration: calibration,
    transit: transit,
    final: {
      xi: finalXi.map(buildItem),
      ji: finalJi.map(buildItem),
      label: finalLabel,
      conflictWarning: conflictWarning
    }
  };
}

/**
 * 获取当前流年的天干地支
 * （未来可接入完整万年历，当前用简单映射）
 */
function getCurrentYearGanZhi(yearNum) {
  // 1984年为甲子年，以此为基准推算
  var base = 1984;
  var gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var offset = ((yearNum - base) % 60 + 60) % 60;
  return {
    gan: gan[offset % 10],
    zhi: zhi[offset % 12]
  };
}
