/**
 * 彩虹天赋罗盘 v3 · 渲染组件
 * 设计：300x300 SVG，中心80px生命数 + 6射线 + 6端点 + 2旋转虚线环
 * 依赖：calculator.js（NUMBER_COLORS）, content.js（DIMENSION_SCORES, DIMENSION_COLORS）
 */

var Compass = (function() {
  'use strict';

  var CX = 150;
  var CY = 150;
  var CENTER_R = 40;      // 中心圆半径 (80px直径)
  var DOT_R = 5;          // 端点圆点半径 (10px直径)
  var ENDPOINT_R = 105;   // 端点圆心轨道半径
  var LABEL_R = 122;      // 标签文字轨道半径（端点外12px: 105+5+12）
  var RING_INNER_R = 72;  // 内虚线环半径
  var RING_OUTER_R = 90;  // 外虚线环半径
  var RAY_START_R = 43;   // 射线起点（中心圆边缘外）

  var DIM_ORDER = ['领导力', '创造力', '共情力', '执行力', '探索力', '表达力'];

  function _toRad(deg) { return deg * Math.PI / 180; }

  function _pt(angleDeg, radius) {
    var a = _toRad(angleDeg);
    return {
      x: (CX + radius * Math.cos(a)).toFixed(1),
      y: (CY + radius * Math.sin(a)).toFixed(1),
    };
  }

  function _ringsSVG() {
    return (
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + RING_INNER_R +
      '" fill="none" stroke="#D4C4B2" stroke-width="1" stroke-dasharray="5,7" class="compass-ring-inner"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + RING_OUTER_R +
      '" fill="none" stroke="#D4C4B2" stroke-width="1" stroke-dasharray="3,9" class="compass-ring-outer"/>'
    );
  }

  function _raysSVG() {
    var lines = '';
    for (var i = 0; i < 6; i++) {
      var angleDeg = i * 60 - 90;
      var start = _pt(angleDeg, RAY_START_R);
      var end = _pt(angleDeg, ENDPOINT_R);
      var color = DIMENSION_COLORS[DIM_ORDER[i]];
      lines += '<line x1="' + start.x + '" y1="' + start.y +
               '" x2="' + end.x + '" y2="' + end.y +
               '" stroke="' + color + '" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>';
    }
    return lines;
  }

  function _endpointsSVG(scores) {
    var els = '';
    for (var i = 0; i < 6; i++) {
      var angleDeg = i * 60 - 90;
      var name = DIM_ORDER[i];
      var score = scores[name] || 5;
      var color = DIMENSION_COLORS[name];
      var dot = _pt(angleDeg, ENDPOINT_R);
      var lbl = _pt(angleDeg, LABEL_R);

      // Endpoint dot
      els += '<circle cx="' + dot.x + '" cy="' + dot.y + '" r="' + DOT_R +
             '" fill="' + color + '"/>';
      // Score inside or near the dot — place at same radius as name
      els += '<text x="' + lbl.x + '" y="' + (parseFloat(lbl.y) - 5) +
             '" text-anchor="middle" dominant-baseline="alphabetic" ' +
             'fill="' + color + '" font-size="9" font-weight="600" ' +
             'font-family="system-ui, -apple-system, sans-serif">' + score + '分</text>';
      // Dimension name below score
      els += '<text x="' + lbl.x + '" y="' + (parseFloat(lbl.y) + 7) +
             '" text-anchor="middle" dominant-baseline="hanging" ' +
             'fill="#3A2E2E" font-size="10" font-weight="500" ' +
             'font-family="\'Noto Sans SC\', system-ui, sans-serif">' + name + '</text>';
    }
    return els;
  }

  function _tickMarks() {
    var marks = '';
    for (var i = 0; i < 12; i++) {
      var a = _toRad(i * 30 - 90);
      var r1 = 133;
      var r2 = 139;
      marks += '<line x1="' + (CX + r1 * Math.cos(a)).toFixed(1) +
               '" y1="' + (CY + r1 * Math.sin(a)).toFixed(1) +
               '" x2="' + (CX + r2 * Math.cos(a)).toFixed(1) +
               '" y2="' + (CY + r2 * Math.sin(a)).toFixed(1) +
               '" stroke="#D4C4B2" stroke-width="0.8" opacity="0.3"/>';
    }
    return marks;
  }

  function _badgeHTML(lifeNum) {
    var nc = NUMBER_COLORS[lifeNum] || NUMBER_COLORS[1];
    return (
      '<div class="compass-center-ring"></div>' +
      '<div class="compass-center-badge" style="background:' + nc.color + ';">' +
        lifeNum +
      '</div>'
    );
  }

  function render(target, opts) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    var lifeNum = opts.lifeNum || 1;
    var scores = getDimensionScores(lifeNum);
    var content = getContent(lifeNum);
    var childName = opts.childName || '孩子';

    var svg =
      '<svg class="compass-main-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">' +
        _ringsSVG() +
        _raysSVG() +
        _endpointsSVG(scores) +
        _tickMarks() +
      '</svg>';

    var summaryText = '';
    if (content) {
      summaryText = childName + '的能量核心是' + content.coreTheme + '，' + content.coreDesc;
    }

    var html =
      '<div class="compass-wrapper">' +
        '<div class="compass-container">' +
          svg +
          '<div class="compass-center">' +
            _badgeHTML(lifeNum) +
          '</div>' +
        '</div>' +
        '<p class="compass-summary">' + summaryText + '</p>' +
      '</div>';

    el.innerHTML = html;

    // Animation: bounce center badge after calibration
    var container = el.querySelector('.compass-container');
    var center = el.querySelector('.compass-center-badge');

    function triggerBounce() {
      if (center) {
        center.style.animation = 'numberBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both';
      }
      if (typeof opts.onCalibrated === 'function') {
        setTimeout(function() { opts.onCalibrated(); }, 550);
      }
    }

    if (container) {
      container.addEventListener('animationend', function onEnd(e) {
        if (e.target === container && e.animationName === 'compassCalibrate') {
          container.removeEventListener('animationend', onEnd);
          triggerBounce();
        }
      });
      setTimeout(function() {
        if (!container.dataset.calibrated) {
          container.dataset.calibrated = '1';
          triggerBounce();
        }
      }, 1600);
    }
  }

  return { render: render };
})();
