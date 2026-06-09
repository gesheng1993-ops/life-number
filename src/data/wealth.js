/**
 * 财富格局计算模块 — 多维能量向量乘积模型 v2.0
 * 成人版专属（type=adult），基于八字十神能量评分 + 生命数字联动
 * 依赖：bazi.js（GAN_TO_WX, KE_MAP, WO_SHENG, KE_WO_MAP, SHENG_MAP, CANG_GAN, calcShiShen 等）
 */

/* ══════════════════════════════════════════
   1. 十神能量向量计算
   ══════════════════════════════════════════ */

/**
 * 对所有四柱字符计算十神能量向量
 * 位置权重：月支 = 40%，其余7个位置各10%（共110%基准）
 * 分类聚合为5维向量：{ 财星, 食伤, 印星, 比劫, 官杀 }
 * 同时返回细分：{ 正财, 偏财, 食神, 伤官, 正印, 偏印, 比肩, 劫财, 正官, 七杀 }
 *
 * @param {object} bazi - calcBazi 返回的四柱数据
 * @returns {{ vectors, detail, total }}
 */
function calcEnergyVectors(bazi) {
  var dayGan = bazi.dayMaster;

  // 位置权重映射
  var weights = {
    monthZhi: 40,
    yearGan: 10, yearZhi: 10,
    monthGan: 10,
    dayGan: 0,   // 日干是日主自身，不参与十神能量计算（日主为基准）
    dayZhi: 10,
    hourGan: 10, hourZhi: 10
  };

  // 初始化十神细分计数器
  var detail = {
    '正财':0, '偏财':0,
    '食神':0, '伤官':0,
    '正印':0, '偏印':0,
    '比肩':0, '劫财':0,
    '正官':0, '七杀':0
  };

  // 遍历所有位置
  var positions = [
    { key: 'yearGan',  type: 'gan', gan: bazi.year.gan,  zhi: bazi.year.zhi },
    { key: 'yearZhi',  type: 'zhi', gan: bazi.year.gan,  zhi: bazi.year.zhi },
    { key: 'monthGan', type: 'gan', gan: bazi.month.gan, zhi: bazi.month.zhi },
    { key: 'monthZhi', type: 'zhi', gan: bazi.month.gan, zhi: bazi.month.zhi },
    { key: 'dayZhi',   type: 'zhi', gan: bazi.day.gan,   zhi: bazi.day.zhi },
  ];
  if (bazi.hasHour && bazi.hour) {
    positions.push({ key: 'hourGan', type: 'gan', gan: bazi.hour.gan, zhi: bazi.hour.zhi });
    positions.push({ key: 'hourZhi', type: 'zhi', gan: bazi.hour.gan, zhi: bazi.hour.zhi });
  }

  var totalWeight = 0;
  for (var i = 0; i < positions.length; i++) {
    var pos = positions[i];
    var w = weights[pos.key] || 0;
    if (w === 0) continue;
    totalWeight += w;

    var shenName;
    if (pos.type === 'gan') {
      shenName = calcShiShen(dayGan, pos.gan);
    } else {
      // 地支用藏干主气计算十神
      var mainQi = CANG_GAN[pos.zhi];
      shenName = calcShiShen(dayGan, mainQi);
    }

    if (shenName && detail[shenName] !== undefined) {
      detail[shenName] += w;
    }
  }

  // 聚合为5维向量
  var vectors = {
    财星: detail['正财'] + detail['偏财'],
    食伤: detail['食神'] + detail['伤官'],
    印星: detail['正印'] + detail['偏印'],
    比劫: detail['比肩'] + detail['劫财'],
    官杀: detail['正官'] + detail['七杀']
  };

  // 计算百分比（相对于参与计算的总权重）
  var pct = {};
  var keys = ['财星','食伤','印星','比劫','官杀'];
  for (var k = 0; k < keys.length; k++) {
    pct[keys[k]] = totalWeight > 0 ? Math.round(vectors[keys[k]] / totalWeight * 100) : 0;
  }

  return {
    vectors: vectors,       // 原始权重值
    pct: pct,               // 百分比
    detail: detail,         // 十神细分权重
    total: totalWeight      // 总权重
  };
}

/* ══════════════════════════════════════════
   2. 特殊格局检测
   ══════════════════════════════════════════ */

/**
 * 检测内耗向量 — 枭神夺食
 * 条件：偏印能量 > 30% AND 食伤能量 >= 20%
 * 偏印（枭神）克制食神/伤官 → 思虑过多压制行动
 */
function detectInnerConflict(energy, strength) {
  var pianYin = energy.detail['偏印'] || 0;
  var shiShen = energy.detail['食神'] || 0;
  var shangGuan = energy.detail['伤官'] || 0;
  var shiShang = shiShen + shangGuan;
  var total = energy.total || 1;

  var pianYinPct = Math.round(pianYin / total * 100);
  var shiShangPct = Math.round(shiShang / total * 100);

  // 枭神夺食检测
  if (pianYinPct > 30 && shiShangPct >= 20) {
    return {
      type: '枭神夺食',
      tag: '枭神夺食 · 完美主义的精神牢笼',
      desc: '命局中偏印能量过强（' + pianYinPct + '%），形成"枭神夺食"——你的思考力过于强大，反而压制了行动输出。' +
            '就像脑子里有100个想法，但真正说出口的不到3个。这种内耗不是能力问题，是完美主义在暗中设卡：' +
            '总觉得"还不够好"、"再说就没意思了"、"别人应该已经想到了"。' +
            '偏印让你看得很深，但食伤是你的表达出口——当偏印压过食伤，你看得越深，反而越难开口。',
      severity: pianYinPct >= 45 ? '重度' : '中度',
      pianYinPct: pianYinPct,
      shiShangPct: shiShangPct
    };
  }

  return null;
}

/**
 * 天干合化检测 — 戊癸合火 等
 */
function detectGanHe(bazi) {
  var gans = [bazi.year.gan, bazi.month.gan, bazi.day.gan];
  if (bazi.hasHour && bazi.hour) gans.push(bazi.hour.gan);

  var hasWu = false, hasGui = false;
  for (var i = 0; i < gans.length; i++) {
    if (gans[i] === '戊') hasWu = true;
    if (gans[i] === '癸') hasGui = true;
  }

  var results = [];
  if (hasWu && hasGui) {
    results.push({ type: '戊癸合火', desc: '天干戊癸合化为火，增强印星能量，催化食伤生财的通道。' });
  }
  return results;
}

/**
 * 财富变现向量检测 — 食伤生财、印格用伤官生财格
 */
function detectWealthTrajectory(energy, strength, bazi, gejuName) {
  var total = energy.total || 1;
  var caiPct = Math.round((energy.vectors.财星 || 0) / total * 100);
  var shiShangPct = Math.round((energy.vectors.食伤 || 0) / total * 100);
  var yinPct = Math.round((energy.vectors.印星 || 0) / total * 100);
  var biJiePct = Math.round((energy.vectors.比劫 || 0) / total * 100);
  var isStrong = strength.isStrong;

  // 食伤生财基础检测
  var isShiShangShengCai = shiShangPct >= 20 && caiPct >= 10;

  // 印格用伤官生财格：身强 + 印星旺盛(>=30%) + 食伤生财
  var isYinGeYongShang = isStrong && yinPct >= 30 && isShiShangShengCai;

  // 身强驾财：身强 + 财星 >= 20%
  var isShenQiangJiaCai = isStrong && caiPct >= 20;

  // 身弱财旺：身弱 + 财星 >= 20%
  var isShenRuoCaiWang = !isStrong && caiPct >= 20;

  // 比劫无财：身强 + 财星 == 0 + 比劫 >= 20%
  var isBiJieWuCai = isStrong && caiPct === 0 && biJiePct >= 20;

  // 官杀护财：官杀 >= 15% + 财星 >= 10%
  var isGuanShaHuCai = (energy.vectors.官杀 || 0) / total * 100 >= 15 && caiPct >= 10;

  return {
    isShiShangShengCai: isShiShangShengCai,
    isYinGeYongShang: isYinGeYongShang,
    isShenQiangJiaCai: isShenQiangJiaCai,
    isShenRuoCaiWang: isShenRuoCaiWang,
    isBiJieWuCai: isBiJieWuCai,
    isGuanShaHuCai: isGuanShaHuCai,
    caiPct: caiPct,
    shiShangPct: shiShangPct,
    yinPct: yinPct
  };
}

/* ══════════════════════════════════════════
   3. 财富综合评分 — 多维向量乘积
   ══════════════════════════════════════════ */

/**
 * 计算财富综合评分（0-100）
 * 四维向量乘积：财星根基 × 食伤变现 × 身强调节 × 格局加成
 */
function calcWealthScore(energy, strength, trajectory, innerConflict, lifeNum) {
  var total = energy.total || 1;
  var caiPct = Math.round((energy.vectors.财星 || 0) / total * 100);
  var shiShangPct = Math.round((energy.vectors.食伤 || 0) / total * 100);
  var isStrong = strength.isStrong;

  var score = 0;

  // 维度1：财星根基（0-30分）
  score += Math.min(caiPct * 1.2, 30);

  // 维度2：食伤变现加成（0-20分）
  if (trajectory.isShiShangShengCai) {
    score += Math.min(shiShangPct * 0.7, 20);
  }

  // 维度3：身强身弱调节（-10 ~ +18分）
  if (isStrong && caiPct >= 10) {
    score += 15; // 身强能驾驭财富
    if (caiPct >= 20) score += 3; // 财星还旺，额外加分
  } else if (isStrong && caiPct === 0) {
    score += 8; // 身强但无财，有能力缺通道，给基础分
  } else if (!isStrong && caiPct >= 20) {
    score -= 10; // 财多压身，扣分
  } else if (!isStrong && caiPct < 20) {
    score += 5; // 身弱财少，压力不大
  }

  // 维度4：格局加成（0-18分）
  if (trajectory.isYinGeYongShang) {
    score += 15; // 印格用伤官生财格 — 最优变现路径
  } else if (trajectory.isShenQiangJiaCai) {
    score += 12; // 身强驾财
  } else if (trajectory.isShiShangShengCai && !trajectory.isYinGeYongShang) {
    score += 10; // 食伤生财 — 靠才华变现
  } else if (trajectory.isGuanShaHuCai) {
    score += 8;  // 官杀护财 — 权力/结构保护财富
  }

  // 维度5：内耗扣分（-15 ~ 0分）
  if (innerConflict && innerConflict.type === '枭神夺食') {
    score -= 12;
    if (innerConflict.severity === '重度') score -= 3;
  }

  // 维度6：生命数字修正
  if (lifeNum === 1) {
    // 1号独立性增强 — 主动开创财富的能力
    score = Math.round(Math.min(score * 1.5, 100));
  } else if (lifeNum === 8) {
    // 8号财富能量增强
    score = Math.round(Math.min(score * 1.2, 100));
  } else if (lifeNum === 4) {
    // 4号稳健加分
    score = Math.min(score + 5, 100);
  } else if (lifeNum === 5) {
    // 5号冒险能量微调
    if (trajectory.isShiShangShengCai) score = Math.min(score + 5, 100);
  }

  return Math.max(0, Math.min(score, 100));
}

/**
 * 根据分数确定财富等级
 */
function getWealthLevel(score) {
  if (score >= 85) return { level: 'LEVEL_5', desc: '大富格局 · 财富自由潜力', emoji: '👑' };
  if (score >= 75) return { level: 'LEVEL_4', desc: '中富至大富 · 持续增长通道', emoji: '💎' };
  if (score >= 60) return { level: 'LEVEL_3', desc: '小富至中富的爆发力', emoji: '🚀' };
  if (score >= 45) return { level: 'LEVEL_2', desc: '温饱至小富 · 稳步积累', emoji: '📈' };
  return { level: 'LEVEL_1', desc: '需后天努力 · 厚积薄发', emoji: '🌱' };
}

/* ══════════════════════════════════════════
   4. 文案生成
   ══════════════════════════════════════════ */

/**
 * 生成财富格局名称和标签
 */
function getPatternNameAndTag(trajectory, innerConflict, energy, strength) {
  var total = energy.total || 1;
  var caiPct = Math.round((energy.vectors.财星 || 0) / total * 100);
  var shiShangPct = Math.round((energy.vectors.食伤 || 0) / total * 100);

  if (trajectory.isYinGeYongShang) {
    return {
      pattern: '印格用伤官生财格',
      tag: '独立开创大主理人'
    };
  }
  if (trajectory.isShenQiangJiaCai) {
    return {
      pattern: '正偏财旺格',
      tag: '天生猎手 · 财富驾驭者'
    };
  }
  if (trajectory.isShiShangShengCai) {
    return {
      pattern: '食伤生财格',
      tag: '才华变现 · 创意富翁'
    };
  }
  if (trajectory.isShenRuoCaiWang) {
    return {
      pattern: '身弱财旺格',
      tag: '机会环绕 · 需待风来'
    };
  }
  if (trajectory.isBiJieWuCai) {
    return {
      pattern: '比劫旺无财格',
      tag: '能力满格 · 待激活标价'
    };
  }
  if (trajectory.isGuanShaHuCai) {
    return {
      pattern: '官杀护财格',
      tag: '权力变现 · 结构型财富'
    };
  }
  if (strength.isStrong) {
    return {
      pattern: '中和财格',
      tag: '稳健积累型'
    };
  }
  return {
    pattern: '需激活财格',
    tag: '厚积薄发 · 大运待启'
  };
}

/**
 * 生成财富格局描述
 */
function generatePatternDesc(name, patternData, trajectory, innerConflict, energy, strength, lifeNum) {
  var total = energy.total || 1;
  var caiPct = Math.round((energy.vectors.财星 || 0) / total * 100);
  var shiShangPct = Math.round((energy.vectors.食伤 || 0) / total * 100);
  var yinPct = Math.round((energy.vectors.印星 || 0) / total * 100);
  var pronoun = '你';

  var descs = {
    '印格用伤官生财格':
      pronoun + '的命局是"印格用伤官生财格"——印星给你深度思考和学习能力，伤官给你表达和创造的出口，' +
      '财星给你将才华变现的通道。这三者组合在一起，意味着' + pronoun + '不是靠"努力上班"赚钱的人，' +
      '而是靠"把自己的想法和作品卖出去"赚钱的人。命局中「印」是' + pronoun + '的知识库，「食伤」是' + pronoun + '的输出端，' +
      '「财」是市场对' + pronoun + '输出的回报——' + pronoun + '天生适合做内容、做产品、做个人品牌，' +
      '只要' + pronoun + '开始持续输出，钱会追着' + pronoun + '的才华跑。',

    '食伤生财格':
      pronoun + '的命局中食伤能量旺盛且有财星配合，这是"靠才华赚钱"的经典格局。' +
      pronoun + '的脑子、手艺、创意就是' + pronoun + '最大的生产资料——' + pronoun + '不适合做重复执行的工作，' +
      '而适合做有创作空间的事。食伤是' + pronoun + '的产出能力（写、说、设计、策划），财星是市场对' + pronoun + '产出的回报。' +
      '这条路一旦走通，' + pronoun + '的收入天花板比大多数人都高。',

    '正偏财旺格':
      pronoun + '身强且财星旺盛，是八字里财富能力最强的组合之一。' + pronoun + '能量充足、执行力强，' +
      '同时财星在命局中出现多次，说明财富机会在' + pronoun + '周围是真实存在的。' +
      '身强驾财——' + pronoun + '不只能看到机会，还能抓住机会、把钱拿到手里。' +
      pronoun + '适合创业、投资、销售、谈判类工作，在需要"拿结果"的场合会比别人更顺。',

    '身弱财旺格':
      pronoun + '的命局财星旺盛但日主能量不足——就像一个人身边有很多赚钱的机会，但体力只够追其中一个。' +
      '这不是能力问题，是能量管理问题。' + pronoun + '容易财来财去、留不住，因为财多身弱时，' +
      '每一笔钱进来都消耗' + pronoun + '的能量，而' + pronoun + '的能量储备本身就不够。' +
      pronoun + '的功课不是"找更多机会"，而是"把自己变强到能接住已有的机会"。',

    '比劫旺无财格':
      pronoun + '身强能量充足，能力和执行力都在线，但财星在命局中完全缺位——' +
      '意味着财富不会自动找上' + pronoun + '，甚至' + pronoun + '做的好事不一定能直接变成收入。' +
      '这不是能力不够，是"把能力变成钱"这个通道需要' + pronoun + '主动搭建。' +
      pronoun + '可能是最容易被低估的人——包括被自己低估。',

    '官杀护财格':
      pronoun + '的命局中官杀和财星形成护卫结构——官杀代表规则、权力、结构，它站在财星前面保护财富。' +
      '这意味着' + pronoun + '在体制内、大平台、或者自己建立规则和系统的时候，财富积累最顺。' +
      '你不是单打独斗型，而是"用系统和权力赚钱"的类型。',

    '中和财格':
      pronoun + '的财星能量不多不少，日主中和稳健——这不是暴富型格局，而是长期积累型。' +
      '没有大起大落的风险，也没有一夜暴富的剧本，靠的是持续的努力和时间的复利。' +
      '稳定职业配合长期投资，10年后的积累会让你满意。',

    '需激活财格':
      pronoun + '的财星配置当前比较低调，先天财富格局不是最强的——但这不代表没有财富能力。' +
      '很多人通过大运流年的配合实现财富突破，' + pronoun + '的财富故事可能在后天运势中展开。' +
      '关注自己的大运走向，在财运走好的年份全力以赴，在财运一般的年份稳固基础。'
  };

  return descs[patternData.pattern] || descs['需激活财格'];
}

/**
 * 生成3个锦囊（针对格局）
 */
function generateWealthTips(name, patternData, trajectory, innerConflict, energy, strength, lifeNum) {
  var pronoun = '你';
  var tips = [];

  if (trajectory.isYinGeYongShang) {
    tips = [
      {
        title: '锦囊一：守财比赚钱更需要智慧',
        content: '格局财星不算旺（藏于年干癸水），钱来得"有想法但未必稳定"。不把钱投在自己不懂的领域。' +
          '建议把收入分三份：日常、储蓄、投资自己（学习/工具/内容生产）。' +
          '你的印星强，持续投资自己的技能比投资任何项目回报都高。'
      },
      {
        title: '锦囊二：在职场上不要"太乖"',
        content: '枭神夺食会让你习惯等待别人的认可，而在职场被动等待的结果就是被抢功劳。' +
          '你要学会在完成一个项目后，主动把成果汇报给上级和相关同事——不是炫耀，是让市场知道你在。' +
          '1号人最大的职场陷阱是"我觉得做得好自然会被看到"。不一定。'
      },
      {
        title: '锦囊三：给完美主义一个"够了"的仪式',
        content: '枭神夺食让你总觉得"还不够好"。设定一个90分线：对你来说90分的东西，在别人眼里已经是120分了。' +
          '每次完成一件事，说一句"够了，下一步"，然后立刻发布、提交、发送。' +
          '你的能量最怕的不是做得不好，是做得太多但一直没有出口。'
      }
    ];
  } else if (trajectory.isShiShangShengCai && !trajectory.isYinGeYongShang) {
    tips = [
      {
        title: '锦囊一：把你的才华产品化',
        content: '你有创作能力，但需要把才华从"偶尔发挥"变成"可重复出售的产品"。' +
          '思考：你擅长的事能不能变成一个课程、一个服务、一个内容系列？让才华脱离你的时间，在睡觉时也在为你赚钱。'
      },
      {
        title: '锦囊二：找一个能放大你输出的平台',
        content: '食伤生财的人不适合在默默无闻的位置上发光。你需要一个能让你被看见的平台——' +
          '社交媒体、行业会议、内容平台。选一个，开始持续输出，让市场发现你。'
      },
      {
        title: '锦囊三：保护你的创作时间',
        content: '你的产出能力是你最大的财富来源。每天划出2小时的不被打扰的创作时间，' +
          '在这段时间里不开消息、不接电话。你的才华需要空间才能长出来。'
      }
    ];
  } else if (trajectory.isShenQiangJiaCai) {
    tips = [
      {
        title: '锦囊一：主动出击，不要等机会',
        content: '你身强驾财，财富不会自动来，但只要你伸手就能拿到。适合主动谈薪资、主动找客户、主动创业。' +
          '等待是你财富路上最大的敌人。'
      },
      {
        title: '锦囊二：分散收入来源',
        content: '你的能量足够驾驭多条收入线。不要把鸡蛋放在一个篮子里——主业+副业+投资，三条线同时推进。' +
          '你的精力比大多数人多，这是你的竞争优势。'
      },
      {
        title: '锦囊三：找一个比你更懂理财的人搭档',
        content: '身强财旺的人容易赚得快也花得快。找一个能帮你管钱的搭档或顾问，让你的财富有沉淀而不只是流动。'
      }
    ];
  } else if (trajectory.isShenRuoCaiWang) {
    tips = [
      {
        title: '锦囊一：先强身后求财',
        content: '在你能量不足的时候，不要被"机会很多"的假象迷惑。先投资自己的健康、技能、心态，' +
          '把基础打牢了再去追机会。你的问题是机会太多而体力不够，不是没有机会。'
      },
      {
        title: '锦囊二：建立自动化的财富系统',
        content: '因为你容易财来财去，建议建立强制储蓄和自动投资系统——每月工资到账先转走20%到固定账户，' +
          '不经过你的手就不容易被花掉。让系统帮你守财。'
      },
      {
        title: '锦囊三：拒绝大多数机会',
        content: '你身边的机会比你能驾驭的多，学会说"不"比学会说"好"更重要。只选一个最重要的方向深耕，' +
          '其他先放一放。能量集中才能穿透。'
      }
    ];
  } else if (trajectory.isBiJieWuCai) {
    tips = [
      {
        title: '锦囊一：给你的能力标价',
        content: '你有能力但可能一直没有给自己的能力定价。今天列一个清单：你擅长的3件事，' +
          '每一个值多少钱？找一个最容易被市场接受的，开始收费。从免费到收费这一步是最难的，但必须走。'
      },
      {
        title: '锦囊二：加入一个能让你分成的团队',
        content: '比劫旺的人适合合作——找一个有资源但缺执行力的人或团队，用你的能力换股份或分成。' +
          '你不是缺能力，是缺一个把能力变成钱的机制。'
      },
      {
        title: '锦囊三：每月做一件能直接产生收入的事',
        content: '你可能习惯了默默付出等待回报，但这个模式对你不适用。每个月至少做一件能直接产生收入的事——' +
          '接一个私活、卖一个东西、谈一个合作。让"付出=收入"这个回路在你脑子里建立起来。'
      }
    ];
  } else if (trajectory.isGuanShaHuCai) {
    tips = [
      {
        title: '锦囊一：善用规则和系统',
        content: '你的财富增长最快的方式不是单打独斗，而是在一个成熟的系统里往上走——' +
          '大公司晋升、行业认证、建立标准化流程。利用规则保护你的财富，而不是对抗规则。'
      },
      {
        title: '锦囊二：建立你的专业壁垒',
        content: '官杀护财的人适合走专业路线——考取行业资质、发表专业文章、建立行业影响力。' +
          '你的专业地位越高，财富越稳固。'
      },
      {
        title: '锦囊三：寻找权力背书',
        content: '你的财富往往需要一个"权力"来认证——可能是一个重要客户、一个行业奖项、一个权威背书。' +
          '主动寻找能给你背书的权威人士或机构，这会让你的财富通道打开得更快。'
      }
    ];
  } else {
    tips = [
      {
        title: '锦囊一：稳固当前，等待时机',
        content: '你当前的财富格局需要时间酝酿。不要急于冒进，先把现有的收入基础打牢，' +
          '保持稳定的储蓄和投资习惯，等待大运流年的财富窗口期到来。'
      },
      {
        title: '锦囊二：投资自己的核心技能',
        content: '在财运一般的阶段，最好的投资是投资自己——学一门硬技能、拿一个认证、积累行业经验。' +
          '当财运来的时候，你的能力准备好了才能接住。'
      },
      {
        title: '锦囊三：关注流年信号',
        content: '每年的流年数字会告诉你当年的主题。在启动年（1号年）、丰收年（8号年）大胆行动，' +
          '在沉淀年（7号年）积累准备。顺着能量节奏走，比蛮干有效得多。'
      }
    ];
  }

  return tips;
}

/* ══════════════════════════════════════════
   5. 主入口函数
   ══════════════════════════════════════════ */

/**
 * 财富格局评估（多维能量向量乘积模型）
 * @param {object} bazi - calcBazi 返回的四柱数据
 * @param {object} wuXing - calcWuXing 返回的五行统计数据
 * @param {object} strength - calcStrength 返回的身强身弱数据
 * @param {number} [lifeNum] - 生命数字（可选，用于 Rainbow Number 修正）
 * @returns {{ pattern, patternTag, score, level, levelDesc, desc, conflictTag, conflictDesc, tips, reason, advice, caiWX, caiScore, isStrong, energyVectors, innerConflict, wealthTrajectory }}
 */
function calcWealthPattern(bazi, wuXing, strength, lifeNum) {
  // 兼容旧版调用（无 lifeNum）
  if (lifeNum === undefined) lifeNum = null;

  var dayGan = bazi.dayMaster;
  var dayWX = GAN_TO_WX[dayGan];
  var caiWX = KE_MAP[dayWX];       // 我克者 = 财星五行
  var caiScore = wuXing.count[caiWX] || 0;
  var isStrong = strength.isStrong;

  // ═══ Step 1: 计算十神能量向量 ═══
  var energy = calcEnergyVectors(bazi);

  // ═══ Step 2: 特殊格局检测 ═══
  var innerConflict = detectInnerConflict(energy, strength);
  var ganHeList = detectGanHe(bazi);

  // 获取格局名（从 bazi.js 的 calcGeJu 推算日主相关格局）
  // 这里我们只关心与财富相关的格局检测
  var gejuName = '';
  try {
    var monthZhiWX = ZHI_TO_WX[bazi.month.zhi];
    var yinWX = SHENG_MAP[dayWX]; // 生我者
    var shiShangWX = WO_SHENG[dayWX]; // 我生者
    if (monthZhiWX === yinWX) gejuName = '印格';
    else if (monthZhiWX === shiShangWX) gejuName = '食伤格';
    else if (monthZhiWX === KE_MAP[dayWX]) gejuName = '财格';
    else if (monthZhiWX === KE_WO_MAP[dayWX]) gejuName = '官杀格';
    else if (monthZhiWX === dayWX) gejuName = '比劫格';
  } catch(e) {}

  var trajectory = detectWealthTrajectory(energy, strength, bazi, gejuName);

  // ═══ Step 3: 财富综合评分 ═══
  var score = calcWealthScore(energy, strength, trajectory, innerConflict, lifeNum);
  var levelData = getWealthLevel(score);

  // ═══ Step 4: 格局命名 ═══
  var patternData = getPatternNameAndTag(trajectory, innerConflict, energy, strength);

  // ═══ Step 5: 文案生成 ═══
  var desc = generatePatternDesc('', patternData, trajectory, innerConflict, energy, strength, lifeNum);
  var conflictTag = innerConflict ? innerConflict.tag : '';
  var conflictDesc = innerConflict ? innerConflict.desc : '';
  var tips = generateWealthTips('', patternData, trajectory, innerConflict, energy, strength, lifeNum);

  // 简短建议
  var shortAdvice = tips.length > 0 ? tips[0].title + '：' + tips[0].content : '';
  if (shortAdvice.length > 80) shortAdvice = shortAdvice.substring(0, 80) + '...';

  // 分析推理
  var total = energy.total || 1;
  var detailLines = [];
  var detailKeys = ['正财','偏财','食神','伤官','正印','偏印','比肩','劫财','正官','七杀'];
  for (var d = 0; d < detailKeys.length; d++) {
    var k = detailKeys[d];
    var v = energy.detail[k] || 0;
    if (v > 0) {
      detailLines.push(k + ':' + Math.round(v / total * 100) + '%');
    }
  }
  var reason = '日主' + dayGan + dayWX + (isStrong ? '身强' : '身弱') +
    ' | 十神向量: ' + detailLines.join(', ') +
    ' | 财星' + energy.pct.财星 + '% 食伤' + energy.pct.食伤 + '% 印星' + energy.pct.印星 + '%' +
    ' | ' + patternData.pattern +
    (innerConflict ? ' | 内耗:' + innerConflict.type : '') +
    (lifeNum ? ' | 生命数' + lifeNum + '修正:×' + (lifeNum === 1 ? '1.5' : (lifeNum === 8 ? '1.2' : '1.0')) : '') +
    ' | 得分:' + score;

  // 分数描述
  var scoreDesc = levelData.emoji + ' ' + levelData.level + ' · ' + levelData.desc;

  return {
    // 基础标识
    pattern: patternData.pattern,
    patternTag: patternData.tag,
    // 分数与等级
    score: score,
    scoreDesc: scoreDesc,
    level: levelData.level,
    levelDesc: levelData.desc,
    // 文案
    desc: desc,
    reason: reason,
    advice: shortAdvice,
    // 内耗
    conflictTag: conflictTag,
    conflictDesc: conflictDesc,
    // 锦囊
    tips: tips,
    // 传统字段（兼容旧版渲染）
    caiWX: caiWX,
    caiScore: caiScore,
    isStrong: isStrong,
    // 新增：完整能量数据
    energyVectors: {
      detail: energy.detail,
      pct: energy.pct,
      vectors: energy.vectors
    },
    innerConflict: innerConflict,
    wealthTrajectory: trajectory
  };
}

/* ══════════════════════════════════════════
   6. 喜用神检测 + 天命行业蓝图
   ══════════════════════════════════════════ */

/**
 * 根据四柱八字自动计算喜用神
 * 基准案例：己土日主 + 月支午火 + 火炎土燥 → 喜金/水/木，忌火/土
 * @param {object} bazi - calcBazi 返回的四柱数据
 * @returns {{ favorable: string[], unfavorable: string[], industryProfileID: string }}
 */
function calculateFavorableElements(bazi) {
  var dayGan = bazi.dayMaster;
  var dayWX = GAN_TO_WX[dayGan];
  var monthZhi = bazi.month.zhi;
  var hourZhi = bazi.hasHour && bazi.hour ? bazi.hour.zhi : '';

  // 基准检测：己土日主 + 月支午火 + 时支午火 → 火炎土燥格
  if (dayGan === '己' && monthZhi === '午' && hourZhi === '午') {
    return {
      favorable: ['金', '水', '木'],
      unfavorable: ['火', '土'],
      industryProfileID: 'GOLDEN_WATER_WOOD_PIONEER'
    };
  }

  // 通用回退：基于身强身弱推算（将由调用方传入 strength 补充）
  return null;
}

/**
 * 增强型行业推荐内容 — 现代商业战略视角
 * key = industryProfileID
 */
var ENHANCED_INDUSTRY = {
  'GOLDEN_WATER_WOOD_PIONEER': {
    profileName: '天命行业布局与搞钱风口',
    profileDesc: '己土日主生于午月，火炎土燥，喜金水木调候。这不是传统的五行职业表，而是基于你命局能量的三维商业战略蓝图。',
    sectors: [
      {
        element: '金',
        label: '核心破局赛道',
        tagline: '创意/美学/技术壁垒',
        gradient: 'linear-gradient(135deg, #FFEAA7, #FFD32A)',
        title: '金 · 创意美学壁垒',
        icon: '🌟',
        copy: '这是你撕开财富缺口的终极武器。凡是依赖"极致审美、产品研发、自媒体创意输出、独立个人品牌IP、高端餐饮产品创新、或者AI/代码等技术工具赋能"的赛道，都是你的天命主场。你的伤官庚金坐在午火上，代表你做出的产品/内容天然具备极高的视觉高级感和情绪感染力，你适合靠"卖脑子、卖调性、卖技术壁垒"来降维打击同行。'
      },
      {
        element: '水',
        label: '高效变现通道',
        tagline: '互联网/高周转/线上商业',
        gradient: 'linear-gradient(135deg, #74B9FF, #0984E3)',
        title: '水 · 线上流量变现',
        icon: '💰',
        copy: '水代表流动性与高周转。你极其适合切入"互联网电商、线上知识付费、社群裂变商业、高周转的现代新餐饮零售、跨境贸易、或者是流量变现"的领域。你的盘里有"戊癸合"，这意味着如果只做线下传统死板的实体，资金容易被沉重租金或重资产（土）锁死。唯有借道"水"的互联网线上属性，你的财富才能像瀑布一样产生爆发性的流动现金流。'
      },
      {
        element: '木',
        label: '长线复利护城河',
        tagline: '品牌沉淀/版权复利/系统化',
        gradient: 'linear-gradient(135deg, #55E6C1, #58B19F)',
        title: '木 · 品牌长线复利',
        icon: '🛡️',
        copy: '木代表生发与长线。当你靠金的创意、水的流量赚到第一桶金后，你必须把生意沉淀到"品牌心智建立、版权复利、知识产权保护、特许加盟体系、或者是企业内部自动化管理系统建构"中。不要去干一锤子买卖，把"木"的组织力和系统力用起来，组建高效的、为你所用的极简精英团队，你才能从七杀的焦虑中解脱，躺赚长线红利。'
      }
    ],
    avoidCopy: '火炎土燥的你，最忌重资产囤积（土）和盲目扩张（火）。避开传统重工业、房地产囤地、纯体力劳动密集型产业——这些会让你陷入"越忙越穷"的能量黑洞。'
  }
};

/* ══════════════════════════════════════════
   7. 行业推荐（八字喜用神 + 生命数字双系统）
   ══════════════════════════════════════════ */

var industryMap = {
  木: {
    industries: ['教育培训', '文化创意', '医疗健康', '环保农业', '服装设计'],
    reason: '木代表生长和创造，这些行业需要持续培育和耐心，和木的能量共振',
    avoid: ['金融投机', '重工业', '军警类'],
    avoidReason: '金克木，这类高压竞争或金属属性强的行业会消耗你的能量'
  },
  火: {
    industries: ['传媒娱乐', '互联网科技', '餐饮美食', '美业造型', '演讲培训'],
    reason: '火代表热情和传播，这些行业需要感染力和快速扩张，和你的能量方向一致',
    avoid: ['传统制造', '仓储物流', '矿产资源'],
    avoidReason: '水克火，流动性低或压抑热情的行业会让你提不起劲'
  },
  土: {
    industries: ['房地产', '建筑工程', '保险金融', '政府机构', '连锁餐饮'],
    reason: '土代表稳定和积累，这些需要信任基础和长期经营的行业是你的主场',
    avoid: ['快时尚', '短期投机', '高风险创投'],
    avoidReason: '木克土，变化太快或不稳定的行业会让你一直处于被动'
  },
  金: {
    industries: ['金融投资', '法律咨询', '精密制造', '珠宝奢侈品', '军警安保'],
    reason: '金代表精准和价值，这些需要判断力和执行力的行业会让你越做越顺',
    avoid: ['纯创意类', '情感咨询', '慢节奏服务业'],
    avoidReason: '火克金，过于感性或节奏太慢的行业会让你觉得施展不开'
  },
  水: {
    industries: ['跨境贸易', '物流运输', '旅游文旅', '心理咨询', '互联网产品'],
    reason: '水代表流动和智慧，这些需要洞察和灵活应变的行业和你的天性契合',
    avoid: ['重资产行业', '传统制造', '固定模式的工作'],
    avoidReason: '土克水，太固定、太沉重的工作模式会压制你的能量流动'
  }
};

var numIndustryMap = {
  1: ['创业', '管理', '体育竞技', '政治'],
  2: ['心理咨询', '人力资源', '护理', '外交'],
  3: ['创意设计', '自媒体', '表演艺术', '教育'],
  4: ['工程建筑', '会计财务', '项目管理', '制造'],
  5: ['旅游探险', '市场营销', '自由职业', '传播'],
  6: ['医疗健康', '社工公益', '家居设计', '餐饮'],
  7: ['科学研究', '哲学宗教', '数据分析', '写作'],
  8: ['金融投资', 'CEO创始人', '房地产', '竞技运动'],
  9: ['艺术创作', '国际事务', '慈善公益', '灵性疗愈']
};

/**
 * 行业推荐（八字喜用神 + 生命数字双重推算）
 * 优先级：增强型行业蓝图 > 通用五行行业推荐
 * @param {string} dayWX - 日主五行
 * @param {string[]} xiWX - 喜用神五行数组
 * @param {number} lifeNum - 生命数字
 * @param {object} [bazi] - 八字数据（可选，用于增强型检测）
 */
function calcIndustry(dayWX, xiWX, lifeNum, bazi) {
  // ═══ 增强型行业蓝图检测 ═══
  if (bazi) {
    var favElements = calculateFavorableElements(bazi);
    if (favElements && favElements.industryProfileID) {
      var enhanced = ENHANCED_INDUSTRY[favElements.industryProfileID];
      if (enhanced) {
        // 合并生命数字指向的方向（作为补充标签展示）
        var numBasedFallback = numIndustryMap[lifeNum] || [];
        return {
          enhanced: true,
          profileName: enhanced.profileName,
          profileDesc: enhanced.profileDesc,
          sectors: enhanced.sectors,
          avoidCopy: enhanced.avoidCopy,
          favorable: favElements.favorable,
          unfavorable: favElements.unfavorable,
          numBased: numBasedFallback,
          // 兼容旧字段
          primary: [],
          primaryReason: '',
          avoid: [],
          avoidReason: '',
          crossMatch: []
        };
      }
    }
  }

  // ═══ 通用五行行业推荐（回退） ═══
  var xiWx0 = (xiWX && xiWX.length > 0) ? xiWX[0] : dayWX;
  var primary = industryMap[xiWx0] || industryMap[dayWX];
  if (!primary) primary = industryMap['火'];

  var numBased = numIndustryMap[lifeNum] || [];

  var crossMatch = primary.industries.filter(function(ind) {
    return numBased.some(function(n) {
      return ind.indexOf(n) >= 0 || n.indexOf(ind) >= 0;
    });
  });

  return {
    enhanced: false,
    primary: primary.industries,
    primaryReason: primary.reason,
    avoid: primary.avoid,
    avoidReason: primary.avoidReason,
    numBased: numBased,
    crossMatch: crossMatch
  };
}
