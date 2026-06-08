/**
 * 生命数字计算模块
 * 规则：所有位数相加，持续化减到1-9，不保留主数
 * ⚠️ 核心计算函数禁止修改（除非明确要求）
 * v2.0 新增：罗盘扇区映射 · 亲子合盘 · 流年数组
 */

function sumDigits(str) {
  return str.split('').reduce((a, b) => a + parseInt(b), 0);
}

function reduceToSingle(n) {
  let sum = n;
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

/** 生命主命数 */
function calcLifeNumber(year, month, day) {
  var digits =
    String(year) +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0');
  return reduceToSingle(sumDigits(digits));
}

/** 流年个人年数 */
function calcYearNumber(month, day, currentYear) {
  var digits =
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0') +
    String(currentYear);
  return reduceToSingle(sumDigits(digits));
}

/** 所有位数之和（化减前），用于展示计算过程 */
function calcTotalSum(year, month, day) {
  var digits =
    String(year) +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0');
  return sumDigits(digits);
}

/** 数字颜色映射 */
var NUMBER_COLORS = {
  1: { color: '#FF6B6B', name: '红色',   theme: '领导力·开创·独立',   personality: '小狮子·领导者' },
  2: { color: '#FF9F43', name: '橙色',   theme: '合作·感知·温柔',   personality: '小兔子·合作者' },
  3: { color: '#FFD93D', name: '黄色',   theme: '表达·创造·活力',   personality: '小松鼠·创造者' },
  4: { color: '#6BCB77', name: '绿色',   theme: '稳定·建造·踏实',   personality: '小熊·建造者' },
  5: { color: '#4D96FF', name: '蓝色',   theme: '自由·变化·探索',   personality: '小狐狸·探索者' },
  6: { color: '#9B72CF', name: '靛色',   theme: '责任·爱·家庭',    personality: '小猫·守护者' },
  7: { color: '#C77DFF', name: '紫色',   theme: '智慧·探索·直觉',   personality: '猫头鹰·智慧者' },
  8: { color: '#FFB830', name: '金色',   theme: '丰盛·掌控·成就',   personality: '小老虎·成就者' },
  9: { color: '#C4B5A5', name: '银色',   theme: '完成·慈悲·智慧',   personality: '小鹿·完成者' },
};

/* =============================================
   v2.0 新增：罗盘扇区映射
   ============================================= */

/** 默认未激活节点样式 */
var COMPASS_DEFAULT = {
  bg: '#E0D5C5',
  text: '#A8917A',
};

/**
 * 生成罗盘 9 个扇区数据
 * @param {number[]} activeNums - 需要高亮的数字数组
 * @returns {Array<{num, color, bg, textColor, active, glow}>}
 */
function getCompassSectors(activeNums) {
  var lookup = {};
  if (activeNums && activeNums.length) {
    for (var i = 0; i < activeNums.length; i++) {
      lookup[activeNums[i]] = true;
    }
  }
  var sectors = [];
  for (var n = 1; n <= 9; n++) {
    if (lookup[n]) {
      var nc = NUMBER_COLORS[n];
      sectors.push({
        num: n,
        bg: nc.color,
        textColor: '#FFFFFF',
        active: true,
        glow: '0 0 10px ' + nc.color,
      });
    } else {
      sectors.push({
        num: n,
        bg: COMPASS_DEFAULT.bg,
        textColor: COMPASS_DEFAULT.text,
        active: false,
        glow: 'none',
      });
    }
  }
  return sectors;
}

/**
 * 计算罗盘节点在圆形轨道上的坐标
 * @param {number} index - 节点序号 0-8（对应数字 1-9）
 * @param {number} cx - 圆心 X（罗盘容器中心）
 * @param {number} cy - 圆心 Y
 * @param {number} radius - 节点圆心轨道半径
 * @returns {{x: number, y: number}} 节点左上角定位坐标
 */
function getNodePosition(index, cx, cy, radius) {
  var angleDeg = index * 40 - 90; // 数字1从顶部(12点钟)开始
  var angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad) - 24, // 减去节点半径(48/2)
    y: cy + radius * Math.sin(angleRad) - 24,
  };
}

/* =============================================
   v2.0 新增：亲子合盘
   ============================================= */

/**
 * 亲子合盘分析
 * @param {number} childNum - 孩子生命数
 * @param {number} momNum - 妈妈生命数
 * @returns {{ resonance: number[], adjacent: number[], tension: number[], summary: string }}
 */
function calcCompatibility(childNum, momNum) {
  var resonance = []; // 共鸣点 — 完全相同的数字
  var adjacent = [];  // 互补点 — 相邻数字
  var tension = [];    // 张力点 — 差距大的数字

  if (childNum === momNum) {
    resonance.push(childNum);
  }

  // 相邻检测（循环 1-9：1 和 9 也算相邻）
  var diff = Math.abs(childNum - momNum);
  if (diff === 1 || diff === 8) {
    adjacent.push(childNum);
    adjacent.push(momNum);
  }

  // 张力检测（差距 >= 5 且不是相邻）
  if (diff >= 5 && diff !== 8) {
    tension.push(childNum);
    tension.push(momNum);
  }

  // 去重
  resonance = resonance.filter(function(v, i, a) { return a.indexOf(v) === i; });
  adjacent = adjacent.filter(function(v, i, a) { return a.indexOf(v) === i; });
  tension = tension.filter(function(v, i, a) { return a.indexOf(v) === i; });

  var summary = '';
  if (resonance.length > 0) {
    summary = '母子同为 ' + childNum + ' 号，天生同频。你能本能地理解孩子的内心节奏，这是最深的默契。';
  } else if (adjacent.length > 0) {
    summary = '你是 ' + momNum + ' 号，孩子是 ' + childNum + ' 号，能量相邻互补。你们像两个相邻的齿轮，配合默契但各有节奏。';
  } else if (tension.length > 0) {
    summary = '你是 ' + momNum + ' 号，孩子是 ' + childNum + ' 号，数字距离较远。这不是问题，而是一份"学习彼此不同"的礼物。';
  } else {
    summary = '你是 ' + momNum + ' 号，孩子是 ' + childNum + ' 号。你们的数字有独特的互动方式，合盘帮你看见彼此的能量地图。';
  }

  return {
    resonance: resonance,
    adjacent: adjacent,
    tension: tension,
    summary: summary,
  };
}

/**
 * 获取合盘激活节点（用于罗盘同时高亮母子数字）
 * @returns {number[]} 合并去重后的激活节点
 */
function getComboActiveNums(childNum, momNum) {
  var nums = [childNum];
  if (momNum && momNum !== childNum) {
    nums.push(momNum);
  }
  // 返回去重数组
  return nums.filter(function(v, i, a) { return a.indexOf(v) === i; });
}

/**
 * 获取生日数字中缺失的数字（1-9）
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {number[]} 缺失数字数组
 */
function getMissingNumbers(year, month, day) {
  var digits = String(year) + String(month).padStart(2, '0') + String(day).padStart(2, '0');
  var present = {};
  for (var i = 0; i < digits.length; i++) {
    var d = parseInt(digits[i]);
    if (d >= 1 && d <= 9) {
      present[d] = true;
    }
  }
  var missing = [];
  for (var n = 1; n <= 9; n++) {
    if (!present[n]) {
      missing.push(n);
    }
  }
  return missing;
}

/**
 * 计算生日中未出现的数字（0不算）
 * 同 getMissingNumbers，规范命名
 */
function calcMissingNumbers(year, month, day) {
  var digits = String(year) + String(month).padStart(2, '0') + String(day).padStart(2, '0');
  var appeared = {};
  var ds = digits.split('');
  for (var i = 0; i < ds.length; i++) {
    var n = parseInt(ds[i]);
    if (n !== 0) appeared[n] = true;
  }
  var missing = [];
  for (var j = 1; j <= 9; j++) {
    if (!appeared[j]) missing.push(j);
  }
  return missing;
}

/**
 * 统计生日中每个数字 1-9 出现的次数
 * @returns {{1: number, 2: number, ..., 9: number}}
 */
function countDigitFrequency(year, month, day) {
  var digits = String(year) + String(month).padStart(2, '0') + String(day).padStart(2, '0');
  var freq = {};
  for (var n = 1; n <= 9; n++) freq[n] = 0;
  for (var i = 0; i < digits.length; i++) {
    var d = parseInt(digits[i]);
    if (d >= 1 && d <= 9) freq[d]++;
  }
  return freq;
}

/**
 * 9宫格位置映射（数字→网格坐标）
 * 1左上 2中上 3右上 / 4左中 5中心 6右中 / 7左下 8中下 9右下
 */
var GRID_POS = {
  1: { row: 0, col: 0 }, 2: { row: 0, col: 1 }, 3: { row: 0, col: 2 },
  4: { row: 1, col: 0 }, 5: { row: 1, col: 1 }, 6: { row: 1, col: 2 },
  7: { row: 2, col: 0 }, 8: { row: 2, col: 1 }, 9: { row: 2, col: 2 },
};

/**
 * 根据数字频率找出已有数字之间的连线
 * 连线规则：相邻（水平/垂直/对角）的已有数字之间建立连线
 * @returns {Array<{from: number, to: number, type: string}>}
 */
function getConnections(freq) {
  var present = [];
  for (var n = 1; n <= 9; n++) {
    if (freq[n] > 0) present.push(n);
  }

  // 相邻对定义（含水平和垂直相邻）
  var adjacentPairs = [
    [1,2],[2,3],[4,5],[5,6],[7,8],[8,9], // 水平
    [1,4],[4,7],[2,5],[5,8],[3,6],[6,9], // 垂直
    [1,5],[5,9],[3,5],[5,7],             // 对角
    [2,4],[4,8],[6,8],[2,6],             // 对角（补充）
  ];

  var connections = [];
  for (var i = 0; i < adjacentPairs.length; i++) {
    var a = adjacentPairs[i][0];
    var b = adjacentPairs[i][1];
    if (freq[a] > 0 && freq[b] > 0) {
      var type = 'pair';
      // 检测是否属于三元组
      if (a === 1 && b === 2 && freq[3] > 0) type = 'triple-123';
      if (a === 2 && b === 3 && freq[1] > 0) type = 'triple-123';
      if (a === 4 && b === 5 && freq[6] > 0) type = 'triple-456';
      if (a === 5 && b === 6 && freq[4] > 0) type = 'triple-456';
      if (a === 7 && b === 8 && freq[9] > 0) type = 'triple-789';
      if (a === 8 && b === 9 && freq[7] > 0) type = 'triple-789';
      if (a === 1 && b === 4 && freq[7] > 0) type = 'triple-147';
      if (a === 4 && b === 7 && freq[1] > 0) type = 'triple-147';
      if (a === 2 && b === 5 && freq[8] > 0) type = 'triple-258';
      if (a === 5 && b === 8 && freq[2] > 0) type = 'triple-258';
      if (a === 3 && b === 6 && freq[9] > 0) type = 'triple-369';
      if (a === 6 && b === 9 && freq[3] > 0) type = 'triple-369';
      // 对角三元组
      if (a === 1 && b === 5 && freq[9] > 0) type = 'triple-159';
      if (a === 5 && b === 9 && freq[1] > 0) type = 'triple-159';
      if (a === 3 && b === 5 && freq[7] > 0) type = 'triple-357';
      if (a === 5 && b === 7 && freq[3] > 0) type = 'triple-357';
      connections.push({ from: a, to: b, type: type });
    }
  }

  // 去重：同一条连线不重复（反向视为同一条）
  var seen = {};
  var unique = [];
  for (var c = 0; c < connections.length; c++) {
    var key = connections[c].from < connections[c].to
      ? connections[c].from + '-' + connections[c].to
      : connections[c].to + '-' + connections[c].from;
    if (!seen[key]) {
      seen[key] = true;
      unique.push(connections[c]);
    }
  }
  return unique;
}

/** 当前季度 */
function getCurrentQuarter() {
  var m = new Date().getMonth() + 1;
  if (m <= 3) return 'Q1';
  if (m <= 6) return 'Q2';
  if (m <= 9) return 'Q3';
  return 'Q4';
}

/** 季度对应月份 */
var QUARTER_MONTHS = {
  Q1: '1-3月',
  Q2: '4-6月',
  Q3: '7-9月',
  Q4: '10-12月',
};
