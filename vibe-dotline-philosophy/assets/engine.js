// ================= 引擎：时间、画布、点阵线稿、小人、字幕 =================
const FPS = 30, W = 1920, H = 1080;
const BEAT = 60 / 112.25, B0 = 0.134;
const beat = (k) => Math.round((B0 + k * BEAT) * FPS) / FPS;   // 对齐到帧
// 每一幕从第几拍开始（共 33 幕，最后一个数是片尾）
const SB = [0, 8, 18, 26, 34, 42, 50, 58, 66, 74, 80, 90, 100, 108, 114, 124, 130, 138, 148, 156, 164, 174, 182, 192, 198, 208, 216, 226, 234, 242, 250, 260, 272, 280];
const T = (n) => n <= 1 ? 0 : beat(SB[n - 1]);                // 第 n 幕开始的秒数；T(34) = 片尾
const END = T(34);                                             // 149.8
const GY = 860;                                                // 地面 / 地平线
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const mkRnd = (s) => () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (x, a, b) => clamp((x - a) / (b - a));
const eo = (p) => 1 - Math.pow(1 - p, 3);
const ei = (p) => p * p * p;
const eio = (p) => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

// ---------- 画布：只按时间画 ----------
const cv = $("#fx"), ctx = cv.getContext("2d");
// 发光层：每帧把线稿拷一份到下面这张画布，CSS 模糊后叠在下面
const gcv = $("#glow"), gctx = gcv ? gcv.getContext("2d") : null;
const painters = [];
function paint(t0, t1, fn, z = 0) { painters.push({ t0, t1, fn, z }); painters.sort((a, b) => a.z - b.z); }
// 渲染时 seek 会屏蔽 onUpdate，用属性 setter 驱动重画
const clock = { _t: 0, get t() { return this._t; }, set t(v) { this._t = v; render(); } };
function render() {
  const t = clock._t; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W, H);
  for (const p of painters) if (t >= p.t0 && t < p.t1) { ctx.save(); p.fn(ctx, t - p.t0, t, p.t1 - p.t0); ctx.restore(); }
  if (gctx) { gctx.globalAlpha = 1; gctx.clearRect(0, 0, W, H); gctx.drawImage(cv, 0, 0); }
}
function dot(c, x, y, r, a) { if (a <= .003) return; c.globalAlpha = clamp(a); c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
const WARM = (k) => `rgb(255,${Math.round(lerp(255, 226, k))},${Math.round(lerp(255, 176, k))})`;

// ---------- 点阵线稿 ----------
function mkDot(x, y, R, s = 0) {
  return { x: x + (R() - .5) * 1.0, y: y + (R() - .5) * 1.0, s, r: 2.0 + R() * .9, a: .88 + R() * .12, ph: R() * 6.28, d: R(),
    vx: (R() - .5) * 2.2, vy: -.3 - R() * 1.3, sx: x + (R() - .5) * 800, sy: y + (R() - .5) * 500 };
}
// 把折线按固定步长撒成点；s = 这颗点在整条线上的位置（0..1），用来"一笔笔画出来"
function dotPath(pts, step = 7, seed = 1) {
  step *= 1.6;   // 灯串：珠子间距拉开
  const R = mkRnd(seed), cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1] || 1, out = [];
  out.path = true;   // 线：珠子之间连一根细线
  let k = 1;
  for (let dd = 0; dd <= L; dd += step) {
    while (k < cum.length - 1 && cum[k] < dd) k++;
    const a = pts[k - 1], b = pts[k] || a, q = (dd - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1);
    out.push(mkDot(lerp(a[0], b[0], q), lerp(a[1], b[1], q), R, dd / L));
  }
  return out;
}
// 几条线拼成一幅：每条按顺序画
function dotPaths(list, step = 6, seed = 1) { return list.map((pts, i) => dotPath(pts, step, seed * 31 + i)); }
// 画点。p = 画到几成（笔尖更亮）；m = 粒子聚合进度（1 = 已就位）；q = 碎裂四散进度
function DD(c, dots, o = {}) {
  const p = o.p ?? 1, m = o.m ?? 1, q = o.q ?? 0, A = o.a ?? 1, t = o.t ?? 0;
  if (A <= .003 || p <= 0 || m <= 0) return;
  c.fillStyle = o.col || "#fff";
  // 灯串的细连线（只在线已就位、没散开时画）
  if (dots.path && m >= 1 && q <= 0 && dots.length > 1) {
    c.globalAlpha = A * .3; c.strokeStyle = o.col || "#fff"; c.lineWidth = 1; c.beginPath();
    let first = true;
    for (const d of dots) { if (d.s > p) break; if (first) { c.moveTo(d.x, d.y); first = false; } else c.lineTo(d.x, d.y); }
    c.stroke();
  }
  for (const d of dots) {
    if (d.s > p) break;
    let x = d.x, y = d.y, al = A * d.a * (.85 + .15 * Math.sin(t * 2.4 + d.ph)), r = d.r;
    if (m < 1) { const e = eio(clamp(m * 1.5 - d.d * .5)); x = lerp(d.sx, x, e); y = lerp(d.sy, y, e); al *= e; }
    if (q > 0) { const k = clamp(q * 1.4 - d.d * .4); x += d.vx * 170 * k * k; y += d.vy * 150 * k; al *= 1 - k; }
    if (p < 1) { const tip = clamp(1 - (p - d.s) / .025); r *= 1 + tip * .9; al += tip * .4 * A; }
    dot(c, x, y, r, al);
  }
}
const DDs = (c, groups, o) => groups.forEach((g) => DD(c, g, o));
const line = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
const ellipse = (cx, cy, rx, ry, a0 = 0, a1 = 6.2832, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const bez = (p0, p1, p2, p3, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });

// ---------- 点阵文字（字体到了再算，缓存） ----------
const TX = {};
function textPts(str, size, cx, cy, step, seed) {
  const cvs = document.createElement("canvas"); cvs.width = W; cvs.height = H; const g = cvs.getContext("2d");
  g.fillStyle = "#fff"; g.font = `600 ${size}px "Noto Serif SC", "SimSun", serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(str, cx, cy);
  const data = g.getImageData(0, 0, W, H).data, R = mkRnd(seed), pts = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const xi = x | 0, yi = y | 0;   // 步长允许小数时下标取整，否则 Uint8ClampedArray 返回 undefined
    if (data[(yi * W + xi) * 4 + 3] > 120) { const d = mkDot(x, y, R, 0); d.r = 1.05 + R() * .85; pts.push(d); }
  }
  return pts;
}
// 局部坐标版（以 cx, cy 为原点）
function textLocal(key, str, size, step, seed) {
  if (!TX[key]) TX[key] = textPts(str, size, 960, 540, step, seed).map((d) => Object.assign(d, { x: d.x - 960, y: d.y - 540, sx: d.sx - 960, sy: d.sy - 540 }));
  return TX[key];
}
const textAt = (key, str, size, cx, cy, step, seed) => TX[key] || (TX[key] = textPts(str, size, cx, cy, step, seed));
function vText(c, str, x, y0, size, gap, a) {   // 竖排普通字（竹简上用）
  if (a <= 0) return;
  c.globalAlpha = clamp(a); c.fillStyle = "#fff"; c.font = `500 ${size}px "Noto Serif SC", "SimSun", serif`; c.textAlign = "center"; c.textBaseline = "middle";
  [...str].forEach((ch, j) => c.fillText(ch, x, y0 + j * gap));
}

// ---------- 线团（局部坐标，半径 112） ----------
const TANG = (() => {
  const R = mkRnd(23), ph = [R() * 6, R() * 6, R() * 6], N = 1500, pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = u * 6.2832 * 11;
    const rr = 112 * Math.min(1, u / .05) * (.38 + .62 * Math.abs(Math.sin(u * 6.2832 * 2.3 + ph[0]))) * (.86 + .14 * Math.sin(u * 41 + ph[1]));
    pts.push([rr * Math.cos(a + .6 * Math.sin(u * 7 + ph[2])), rr * .84 * Math.sin(a)]);
  }
  const ds = dotPath(pts, 5, 16);
  // 每颗点在"茧"上的位置：竖长的乱线椭圆
  ds.forEach((d) => { const u = d.s, a = u * 6.2832 * 15 + 2.5 * Math.sin(u * 23), rr = .72 + .28 * Math.sin(u * 47 + 1); d.kx = 88 * Math.cos(a) * rr; d.ky = 142 * Math.sin(a + .9 * Math.sin(u * 13)) * rr; });
  return ds;
})();
function drawTangle(c, x, y, sc, rot, o = {}) {
  const g = o.ghosts || 0;
  for (let k = g; k >= 0; k--) {
    c.save(); c.translate(x, y); c.rotate(rot - k * .16); c.scale(sc, sc * (1 + .02 * Math.sin((o.t || 0) * 2.2)));
    DD(c, TANG, { p: o.p ?? 1, a: (o.a ?? 1) * (k ? .3 / k : 1), t: o.t, col: o.col });
    c.restore();
  }
}
// 线团 → 茧（w 0..1），茧再碎（q 0..1）
function drawCocoon(c, from, cx, cy, w, q, a, t) {
  const co = Math.cos(from.rot), si = Math.sin(from.rot);
  c.fillStyle = "#fff";
  for (const d of TANG) {
    const e = eio(clamp(w * 1.4 - d.d * .4));
    let x = lerp(from.x + (d.x * co - d.y * si) * from.sc, cx + d.kx, e), y = lerp(from.y + (d.x * si + d.y * co) * from.sc, cy + d.ky, e), al = a * d.a * (.85 + .15 * Math.sin(t * 2.4 + d.ph));
    if (q > 0) { const k = clamp(q * 1.4 - d.d * .4); x += d.vx * 260 * k * k; y += d.vy * 200 * k; al *= 1 - k; }
    dot(c, x, y, d.r, al);
  }
}

// ---------- 白熊 ----------
const BEAR_STAND = (() => { const R = mkRnd(51); const ds = dotPath([[130, -112], [122, -124], [110, -132], [100, -142], [92, -150], [84, -146], [80, -138], [70, -140], [40, -152], [0, -160], [-50, -158], [-95, -146], [-122, -124], [-136, -92], [-132, -52], [-124, 0], [-96, 0], [-94, -38], [-82, -54], [-40, -60], [10, -60], [30, -52], [34, 0], [62, 0], [64, -44], [80, -72], [96, -90], [114, -100], [130, -104], [130, -112]], 5, 51); const e = mkDot(108, -122, R, 1); e.r = 2.6; e.a = 1; ds.push(e); return ds; })();
const BEAR_SIT = (() => { const R = mkRnd(52); const ds = dotPath([[-74, -168], [-62, -184], [-44, -196], [-30, -210], [-18, -214], [-12, -204], [2, -196], [24, -176], [44, -132], [56, -80], [58, -36], [48, 0], [-4, 0], [-18, -8], [-14, -30], [-4, -46], [-14, -68], [-34, -80], [-42, -40], [-46, 0], [-70, 0], [-68, -24], [-60, -96], [-62, -130], [-64, -152], [-76, -160], [-74, -168]], 5, 52); const e = mkDot(-50, -180, R, 1); e.r = 2.6; e.a = 1; ds.push(e); return ds; })();
// 熊：m 聚合，g 被吸向 (tx, ty)，q 散开
function drawBear(c, dots, bx, by, s, o) {
  const A = o.a ?? 1, m = o.m ?? 1, g = o.g ?? 0, q = o.q ?? 0; if (A <= .003 || m <= 0) return;
  c.fillStyle = "#fff";
  for (const d of dots) {
    let x = bx + d.x * s, y = by + d.y * s, al = A * d.a * (.85 + .15 * Math.sin((o.t || 0) * 2.4 + d.ph));
    if (m < 1) { const e = eio(clamp(m * 1.5 - d.d * .5)); x = lerp(bx + d.sx * s, x, e); y = lerp(by + d.sy * s, y, e); al *= e; }
    if (g > 0) { const e = eio(clamp(g * 1.5 - d.d * .5)); x = lerp(x, o.tx + d.vx * 20, e); y = lerp(y, o.ty + d.vy * 16, e); al *= 1 - e * e; }
    if (q > 0) { const k = clamp(q * 1.4 - d.d * .4); x += d.vx * 90 * k; y += d.vy * 70 * k; al *= 1 - k; }
    dot(c, x, y, d.r * Math.max(.85, s * .85), al);
  }
}

// ---------- 虚线小人（脚底为原点，身高约 152） ----------
const STAND = { head: [0, -152], neck: [0, -132], hip: [0, -72], eL: [-27, -100], hL: [-33, -76], eR: [27, -100], hR: [33, -76], kL: [-9, -36], fL: [-13, 0], kR: [9, -36], fR: [13, 0] };
const POSE = {
  stand: STAND,
  cover: Object.assign({}, STAND, { eL: [-30, -118], hL: [-12, -146], eR: [30, -118], hR: [12, -146] }),
  sit: { head: [6, -140], neck: [4, -120], hip: [0, -62], eL: [16, -90], hL: [34, -68], eR: [20, -90], hR: [38, -66], kL: [36, -62], fL: [36, 0], kR: [42, -60], fR: [44, 0] },
  sitbent: { head: [42, -124], neck: [26, -110], hip: [0, -62], eL: [36, -88], hL: [44, -64], eR: [40, -86], hR: [50, -62], kL: [40, -62], fL: [40, 0], kR: [46, -60], fR: [48, 0] },
  walkA: { head: [3, -152], neck: [2, -132], hip: [0, -72], eL: [24, -100], hL: [34, -80], eR: [-24, -100], hR: [-32, -82], kL: [-10, -36], fL: [-26, 0], kR: [12, -38], fR: [24, 0] },
  walkB: { head: [3, -152], neck: [2, -132], hip: [0, -72], eL: [-24, -100], hL: [-32, -82], eR: [24, -100], hR: [34, -80], kL: [12, -38], fL: [24, 0], kR: [-10, -36], fR: [-26, 0] },
};
function lerpPose(A, B, p) { const o = {}; for (const k in A) o[k] = [lerp(A[k][0], B[k][0], p), lerp(A[k][1], B[k][1], p)]; return o; }
const walkPose = (ph, amp = 1) => lerpPose(POSE.stand, lerpPose(POSE.walkA, POSE.walkB, .5 + .5 * Math.sin(ph)), amp);
// 剪影小人（原片那种）：圆头 + 一整条外轮廓勾出身子、胳膊、腿（四肢有宽度）
function figParts(P) {
  const ax = P.neck[0] - P.hip[0], ay = P.neck[1] - P.hip[1], L = Math.hypot(ax, ay) || 1, nx = ax / L, ny = ay / L, px = -ny, py = nx;
  const top = [lerp(P.neck[0], P.hip[0], .38), lerp(P.neck[1], P.hip[1], .38)], bot = P.hip, rt = 15, rb = 17;
  const add = (a, x, y, k = 1) => [a[0] + x * k, a[1] + y * k];
  // 一条四肢 [起点, 关节, 末端] → 两侧偏移；outer = 离身体中轴远的那一侧
  function limb(J, w, side) {
    const nr = J.map((_, i) => { const a = J[Math.max(0, i - 1)], b = J[Math.min(J.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    const A = J.map((j, i) => add(j, nr[i][0], nr[i][1], w)), B = J.map((j, i) => add(j, nr[i][0], nr[i][1], -w));
    const sc = (c) => c.reduce((s, q) => s + ((q[0] - bot[0]) * px + (q[1] - bot[1]) * py), 0) * side;
    return sc(A) >= sc(B) ? { o: A, i: B } : { o: B, i: A };
  }
  const shR = add(top, px, py, rt), shL = add(top, px, py, -rt), apR = add(add(top, px, py, rt * .9), -nx, -ny, 18), apL = add(add(top, px, py, -rt * .9), -nx, -ny, 18);
  const aR = limb([add(top, px, py, rt * .8), P.eR, P.hR], 5.5, 1), aL = limb([add(top, px, py, -rt * .8), P.eL, P.hL], 5.5, -1);
  const hipR = add(bot, px, py, rb), hipL = add(bot, px, py, -rb), crotch = add(bot, -nx, -ny, rb * .7);
  const lR = limb([add(add(bot, px, py, 9), -nx, -ny, 8), P.kR, P.fR], 7.5, 1), lL = limb([add(add(bot, px, py, -9), -nx, -ny, 8), P.kL, P.fL], 7.5, -1);
  const rev = (a) => a.slice().reverse();
  const outline = [shR, ...aR.o, ...rev(aR.i), apR, hipR, ...lR.o, ...rev(lR.i), crotch, ...lL.i, ...rev(lL.o), hipL, apL, ...aL.i, ...rev(aL.o), shL];
  // 肩膀顶上一道弧（藏在脑袋下面）
  const ang = Math.atan2(py, px);
  for (let k = 1; k < 10; k++) { const a = ang + Math.PI + Math.PI * k / 10; outline.push([top[0] + rt * Math.cos(a), top[1] + rt * Math.sin(a)]); }
  outline.push(shR);
  return [ellipse(P.head[0], P.head[1], 20, 20, 1.5708, 7.854, 40), outline];
}
function drawFig(c, P, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  figParts(P).forEach((pts, i) => DD(c, dotPath(pts, 4.2, 300 + i), { p: o.p ?? 1, a: o.a ?? 1, t: o.t, col: o.col }));
  c.restore();
  return { hx: x + P.head[0] * s, hy: y + P.head[1] * s };   // 头的位置
}

// ---------- 字幕：底部居中，逐字糊入 ----------
function say(o) {
  const d = document.createElement("div"); d.className = "cap" + (o.cls ? " " + o.cls : ""); $("#sc1").appendChild(d);
  const parts = []; let rest = o.text;
  while (rest.length) {
    let bi = -1, bw = "";
    for (const w of (o.em || [])) { const i = rest.indexOf(w); if (i >= 0 && (bi < 0 || i < bi)) { bi = i; bw = w; } }
    if (bi < 0) { parts.push([rest, false]); break; }
    if (bi > 0) parts.push([rest.slice(0, bi), false]);
    parts.push([bw, true]); rest = rest.slice(bi + bw.length);
  }
  const chars = [];
  for (const [txt, hl] of parts) for (const ch of [...txt]) {
    const s = document.createElement("span"); s.className = "ch" + (hl ? " hl" : ""); s.textContent = ch; d.appendChild(s); chars.push(s);
  }
  tl.fromTo(chars, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: .5, ease: "power2.out", stagger: .045 }, o.t0);
  tl.fromTo(d, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(6px)", duration: .35, ease: "power1.in", immediateRender: false }, o.t1 - .35);
  tl.set(d, { autoAlpha: 0 }, o.t1);
}

// ---------- 背景细波浪流线：氛围，比灯串暗很多，无珠子 ----------
function waves(c, t, o = {}) {
  const n = o.n ?? 6, y0 = o.y0 ?? 620, gap = o.gap ?? 56, A = o.a ?? 1;
  c.save(); c.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const yb = y0 + i * gap;
    c.strokeStyle = `rgba(255,255,255,${(A * (.11 + .05 * (1 - i / n))).toFixed(3)})`;
    c.beginPath();
    for (let x = -60; x <= 1980; x += 36) {
      const y = yb + 30 * Math.sin(x * .0058 + t * .45 + i * 1.7) + 10 * Math.sin(x * .013 - t * .3 + i * 2.1);
      x === -60 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke();
  }
  c.restore();
}

// ---------- 关键字发光实心大字：悬在主体正上方居中，一幕最多一个 ----------
function bigWord(c, str, cx, cy, size, a, glow = 46) {
  if (a <= .003) return;
  c.save(); c.globalAlpha = clamp(a);
  c.font = `900 ${size}px "Noto Serif SC", "SimSun", serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.shadowColor = "rgba(255,255,255,.95)"; c.shadowBlur = glow;
  c.fillStyle = "#fff"; c.fillText(str, cx, cy);
  c.shadowBlur = 0; c.fillText(str, cx, cy);   // 再描一遍实心，防发光吃掉字形
  c.restore();
}

// ---------- 全片：漂浮微光 ----------
const DUST = (() => { const R = mkRnd(77); return Array.from({ length: 46 }, () => ({ x: R() * W, y: R() * H, vx: (R() - .5) * 14, vy: -4 - R() * 8, r: .7 + R() * 1.1, a: .12 + R() * .3, ph: R() * 6.28 })); })();
paint(0, END + 1, (c, lt, t) => {
  c.fillStyle = "#fff";
  for (const p of DUST) dot(c, ((p.x + p.vx * t) % W + W) % W, ((p.y + p.vy * t) % H + H) % H, p.r, p.a * (.6 + .4 * Math.sin(t * 1.7 + p.ph)));
}, 0);
