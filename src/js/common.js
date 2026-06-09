/**
 * 公共工具函数
 */

/** 从 URL 参数读取（支持 v1 旧格式和 v2 c_/m_ 新格式） */
function getParams() {
  var p = new URLSearchParams(window.location.search);
  return {
    // v2 c_ prefix (child)
    c_name:   p.get('c_name') || '',
    c_year:   parseInt(p.get('c_year')) || 0,
    c_month:  parseInt(p.get('c_month')) || 0,
    c_day:    parseInt(p.get('c_day')) || 0,
    c_gender: p.get('c_gender') || '',
    c_hour:   parseInt(p.get('hour')) || -1,
    // v2 m_ prefix (mother)
    m_year:   parseInt(p.get('m_year')) || 0,
    m_month:  parseInt(p.get('m_month')) || 0,
    m_day:    parseInt(p.get('m_day')) || 0,
    // type (baby/adult)
    type:     p.get('type') || 'baby',
    // v1 backwards compat (fallback when c_ not present)
    name:     p.get('c_name') || p.get('name') || '',
    year:     parseInt(p.get('c_year') || p.get('year')) || 0,
    month:    parseInt(p.get('c_month') || p.get('month')) || 0,
    day:      parseInt(p.get('c_day') || p.get('day')) || 0,
    gender:   p.get('c_gender') || p.get('gender') || '',
    unlocked: p.get('unlocked') === 'true',
    momYear:  parseInt(p.get('m_year') || p.get('momYear')) || 0,
    momMonth: parseInt(p.get('m_month') || p.get('momMonth')) || 0,
    momDay:   parseInt(p.get('m_day') || p.get('momDay')) || 0,
  };
}

/** 构建 URL 参数字符串 */
function buildParams(obj) {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v !== 0 && v !== false && v !== null && v !== undefined) {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.join('&');
}

/** 跳转页面并携带参数 */
function navigate(page, params) {
  const qs = buildParams(params);
  window.location.href = qs ? `${page}?${qs}` : page;
}

/** 获取当前年份 */
function getCurrentYear() {
  return new Date().getFullYear();
}

/** 生成年份选项 */
function generateYearOptions(start, end, selected) {
  let html = '<option value="">请选择</option>';
  for (let y = end; y >= start; y--) {
    const sel = y === selected ? ' selected' : '';
    html += `<option value="${y}"${sel}>${y}年</option>`;
  }
  return html;
}

/** 生成月份选项 */
function generateMonthOptions(selected) {
  let html = '<option value="">请选择</option>';
  for (let m = 1; m <= 12; m++) {
    const sel = m === selected ? ' selected' : '';
    html += `<option value="${m}"${sel}>${m}月</option>`;
  }
  return html;
}

/** 生成日期选项 */
function generateDayOptions(selected) {
  let html = '<option value="">请选择</option>';
  for (let d = 1; d <= 31; d++) {
    const sel = d === selected ? ' selected' : '';
    html += `<option value="${d}"${sel}>${d}日</option>`;
  }
  return html;
}

/** 复制到剪贴板 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

/** 分享（优先用 Web Share API） */
async function shareContent(data) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch { return false; }
  }
  return false;
}

/** 获取季度 */
function getCurrentQuarter() {
  const m = new Date().getMonth() + 1;
  if (m <= 3) return 'Q1';
  if (m <= 6) return 'Q2';
  if (m <= 9) return 'Q3';
  return 'Q4';
}
