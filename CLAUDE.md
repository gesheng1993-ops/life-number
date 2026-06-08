# 生命数字 · 开发规范
> Claude Code 每次开始前必读此文件

---

## 项目简介
面向宝妈群体的彩虹数字玄学 H5 应用。
用户输入孩子生日 → 计算生命数字 → **彩虹天赋罗盘可视化** → 天赋报告 → 付费解锁完整版。

目标用户：25-40岁宝妈，孩子0-12岁
核心价值：不只是"算命"，而是给妈妈可执行的养育建议
**核心差异点：彩虹天赋罗盘 — 免费可视化星盘，AI 对话无法替代的视觉资产**

---

## 技术约定

- 纯 HTML + CSS + JavaScript，不使用任何框架
- 移动端优先，页面最大宽度 430px，水平居中
- 所有页面必须在微信内置浏览器正常运行
- 字体：Ma Shan Zheng（标题/数字）+ Noto Sans SC（正文）
  - 引入方式：Google Fonts CDN
  - `@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;600&display=swap');`

---

## 设计规范（严格遵守）

### 色彩系统
```
页面背景：  #FEFAF5  暖白（近白微暖，不是纯白）
卡片背景：  #FFFFFF
次级背景：  #FFF5EB  暖米色
边框颜色：  #EDE0D5  暖棕边框
主文字：    #3A2E2E
次级文字：  #8C7A6B
浅提示字：  #B8A595

彩虹九色（固定不变）：
  1号红：   #FF6B6B
  2号橙：   #FF9F43
  3号黄：   #FFD93D
  4号绿：   #6BCB77
  5号蓝：   #4D96FF
  6号靛：   #9B72CF
  7号紫：   #C77DFF
  8号金：   #FFB830
  9号白/银： #C4B5A5

罗盘专用：
  未激活节点：  背景 #E0D5C5，文字 #A8917A
  激活节点发光：  filter: drop-shadow(0 0 8px [对应主题色])
  轨道环颜色：   #EDE0D5，stroke-width 1.5
```

### 彩虹天赋罗盘（核心视觉资产，100% 免费展示）

#### 罗盘技术规范
- 使用纯 CSS 绝对定位 + 内联 SVG 轨道环实现，零外部库依赖
- 罗盘容器 `#talent-compass-container`，最大宽度 380px，居中显示
- 9 个扇形节点环绕圆心均匀分布（每节点间隔 40 度）
- 节点尺寸 48px × 48px，圆形
- 圆心徽章尺寸 72px × 72px，显示孩子核心生命数字
- 外层轨道环使用 SVG `<circle>` 绘制（3 层同心圆，半径递减）

#### 罗盘视觉状态
- **默认/未激活**：背景 `#E0D5C5`，文字颜色 `#A8917A`
- **激活（孩子的生命数）**：背景使用对应 NUMBER_COLORS 的 HEX 色值，文字白色，发光效果 `filter: drop-shadow(0 0 8px [对应颜色])`
- **圆心徽章**：背景为激活数字的主题色，白色文字，'Ma Shan Zheng' 字体 36px+

#### 罗盘动画序列
1. 页面加载 → 罗盘触发 `compassCalibrate` 动画（1.5s，旋转 + 缩放入场，"宇宙校准"感）
2. 罗盘校准完成后 → 激活节点依次触发 `bounce` 动画（每个间隔 0.1s）
3. 轨道环使用 `float` 动画缓慢浮动

### 圆角规范
```
页面容器：  border-radius: 28px
卡片：      border-radius: 14px
输入框：    border-radius: 12px
按钮：      border-radius: 100px（全圆角胶囊）
小标签：    border-radius: 8px
罗盘节点：  border-radius: 50%（正圆）
```

### 主按钮样式
```css
background: linear-gradient(135deg, #FF9F43, #FF6B6B);
box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35);
border-radius: 100px;
color: white;
font-size: 15px;
font-weight: 500;
padding: 15px;
width: 100%;
border: none;
```

### 卡片样式
```css
background: #FFFFFF;
border-radius: 14px;
box-shadow: 0 2px 12px rgba(58, 46, 46, 0.06);
padding: 20px;
margin: 0 16px 12px;
```

### 插画装饰元素（每个页面必须有）
所有页面顶部区域使用 SVG 绘制背景装饰：
- 彩色半透明圆形气泡（opacity 0.06-0.12）
- 彩色三角形星星点缀
- 彩色椭圆色块（营造童趣氛围）
- 云朵形状（白色椭圆组合）
- 小星星、小圆点散落
- 数字/文字不能被装饰遮挡（z-index 管理）

### 动画规范
```css
/* 页面入场 */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 数字弹跳 */
@keyframes bounce {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

/* 装饰浮动 */
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* 罗盘宇宙校准（核心动画！） */
@keyframes compassCalibrate {
  0%   { opacity: 0; transform: scale(0.8) rotate(-180deg); }
  70%  { transform: scale(1.05) rotate(10deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
/* 使用原则：页面加载时卡片依次 fadeUp，罗盘 compassCalibrate 入场，
   罗盘动画结束后激活节点依次 bounce */
```

---

## 核心计算逻辑（禁止修改）

文件位置：`/src/data/calculator.js`

### 生命主命数
```javascript
function calcLifeNumber(year, month, day) {
  // 所有位数相加，持续化减到1-9
  // 11/22/33 不做特殊处理，继续化减
  const digits = String(year) + String(month).padStart(2,'0') + String(day).padStart(2,'0');
  let sum = digits.split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}
```

### 流年个人年数
```javascript
function calcYearNumber(month, day, currentYear) {
  const digits = String(month).padStart(2,'0') + String(day).padStart(2,'0') + String(currentYear);
  let sum = digits.split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}
```

### 亲子合盘计算
```javascript
function calcCompatibility(childNum, momNum) {
  // 返回重合节点列表（母子相同数字视为共鸣点）
  // 返回相邻节点列表（数字相邻视为互补点）
  // 返回冲突节点列表（相差 >= 5 的数字对）
}
```

### 罗盘节点映射
```javascript
function getCompassSectors(activeNums) {
  // 输入：激活数字数组（孩子生命数 + 流年数 + 母子共鸣数）
  // 输出：9 个扇区对象数组 [{num, color, active, glowColor}]
  // 激活的数字使用对应 NUMBER_COLORS，未激活的使用默认色
}
```

### 数字颜色映射
```javascript
const NUMBER_COLORS = {
  1: { color: '#FF6B6B', name: '红色', theme: '领导力·开创·独立' },
  2: { color: '#FF9F43', name: '橙色', theme: '合作·感知·温柔' },
  3: { color: '#FFD93D', name: '黄色', theme: '表达·创造·活力' },
  4: { color: '#6BCB77', name: '绿色', theme: '稳定·建造·踏实' },
  5: { color: '#4D96FF', name: '蓝色', theme: '自由·变化·探索' },
  6: { color: '#9B72CF', name: '靛色', theme: '责任·爱·家庭' },
  7: { color: '#C77DFF', name: '紫色', theme: '智慧·探索·直觉' },
  8: { color: '#FFB830', name: '金色', theme: '丰盛·掌控·成就' },
  9: { color: '#C4B5A5', name: '银色', theme: '完成·慈悲·智慧' },
};
```

---

## 页面文件结构

```
/
├── index.html          首页/落地页
├── input.html          输入生日页
├── report-free.html    免费报告页（含彩虹天赋罗盘）
├── report-full.html    完整报告页（含三段式：先天盘 + 流年 + 合盘）
├── src/
│   ├── data/
│   │   ├── calculator.js    计算逻辑（含罗盘映射 + 合盘）
│   │   └── content.js       9个数字的全部文案内容
│   ├── css/
│   │   └── common.css       公共样式（含罗盘样式 + compassCalibrate 动画）
│   └── js/
│       ├── common.js        公共逻辑（页面跳转、参数传递）
│       └── compass.js       罗盘渲染组件（compassInit, compassRender）
└── assets/
    └── pay-qrcode.jpg       收款二维码图片
```

---

## 页面跳转与数据传递

用 URL 参数传递用户输入，不用 localStorage（微信有限制）。
**v2.0 更新：使用 c_ 前缀表示 child，m_ 前缀表示 mother。**

```
input.html
  → report-free.html?c_name=小宝&c_year=2020&c_month=6&c_day=27&c_gender=male
  → 用户输入妈妈生日后：
  → report-free.html?c_name=小宝&c_year=2020&c_month=6&c_day=27&c_gender=male&m_year=1993&m_month=5&m_day=16
  → 付费解锁：
  → report-full.html?c_name=小宝&c_year=2020&c_month=6&c_day=27&c_gender=male&m_year=1993&m_month=5&m_day=16&unlocked=true
```

### 报告页三段式结构

每个报告页（free / full）内部包含三个独立区块：

| 区块 | ID | 内容 | 免费可见 |
|---|---|---|---|
| 先天盘 | `#section-base-chart` | 彩虹天赋罗盘 + 生命数 + 天赋性格 | 罗盘 + 生命数可见，性格预览截断 |
| 流年盘 | `#section-year-chart` | 当前流年数字 + 季度养育指南 | 流年数字可见，季度详情模糊 |
| 合盘 | `#section-compatibility` | 亲子共鸣点 + 相处建议 | ⚠️ 仅 report-full.html 展示 |

---

## 支付方案

### 当前阶段：收款码（手动处理）
```
report-free.html 付费区域展示：
1. 显示微信收款二维码（assets/pay-qrcode.jpg）
2. 文案："扫码付款 ¥29，付款后截图发送到微信号：[你的微信]"
3. 文案："收到截图后1小时内发送完整报告链接"
```

### 下一阶段：微信H5支付（申请商户号后接入）
```
申请地址：pay.weixin.qq.com
所需材料：餐饮个体户营业执照 + 身份证 + 银行卡
审核周期：1-3个工作日
接入后：点击付款直接弹出微信支付，自动跳转完整报告页
```

---

## 文案风格要求

- 温暖、有感情、像朋友在说话
- 不用"命中注定""天命所归"等算命腔调
- 多用"这类孩子通常…""小宝天生就有…"
- 每条养育建议必须可执行，不说"多陪伴孩子"这种废话
- 说"这周可以带他参加一个有表演机会的活动"这种具体的

---

## 禁止事项

- 禁止在免费报告页展示完整付费内容
- 禁止修改 calculator.js 中的核心计算函数（除非明确要求）
- 禁止使用纯白色 #FFFFFF 作为页面背景
- 禁止使用 Inter、Roboto、Arial 等字体
- 禁止页面最大宽度超过 430px
- 所有页面必须无横向滚动条
- **禁止在免费报告中隐藏或模糊彩虹天赋罗盘（罗盘 100% 免费可见）**
- **禁止使用外部 Canvas/图表库实现罗盘（纯 CSS + SVG 实现）**

---

## 开发顺序（按此顺序来）

1. `src/data/calculator.js` — 计算逻辑 + 罗盘映射 + 合盘函数（最先写，最重要）
2. `src/data/content.js` — 9个数字文案内容
3. `src/css/common.css` — 公共样式 + 罗盘样式 + compassCalibrate 动画
4. `src/js/compass.js` — 罗盘渲染组件
5. `input.html` — 输入页（MVP核心）
6. `report-free.html` — 免费报告页（含罗盘 + 付费区域）
7. `index.html` — 首页
8. `report-full.html` — 完整报告页（三段式：先天盘 + 流年 + 合盘）

---

*版本：v2.0 · 核心更新：彩虹天赋罗盘 + 三段式报告 + 亲子合盘 · 确认后开始开发*
