// ================= 第 1–11 幕 =================

// ---------- 第 1 幕：点阵大字 → 散成粒子 ----------
const HORIZON0 = dotPath(line(260, GY, 1660, GY), 9, 5);
paint(0, T(2) + .25, (c, lt, t) => {
  const hook = textAt("hook", "想了一整夜，然后呢？", 124, 960, 470, 4, 11), D = T(2) + .25;
  c.fillStyle = "#fff";
  for (const p of hook) {
    const on = seg(lt, p.d * .6 - .3, p.d * .6);                    // 第 0 帧已有一半点亮着
    const q = eio(seg(lt, T(2) - 1.05 + p.d * .35, D));              // 散开
    dot(c, p.x + p.vx * 150 * q * q, p.y + p.vy * 130 * q, p.r * (1 - q * .4), on * p.a * (.85 + .15 * Math.sin(t * 3 + p.ph)) * (1 - q));
  }
  DD(c, HORIZON0, { a: .1 * (1 - seg(lt, T(2) - .4, D)), t });     // 几乎看不见的地平线，结尾才画全
}, 1);

// ---------- 第 2–4 幕：凌晨三点的房间，线越缠越多 ----------
{
  const T2 = T(2), T3 = T(3), HEAD = { x: 735, y: 658, r: 24 }, TB = { x: 790, y: 372 };
  const P = (pts, t0, t1, step = 7, seed = 1) => ({ dots: dotPath(pts, step, seed), t0, t1 });
  const ROOM = [
    P(line(520, 836, 1420, 836), T2 + .02, T2 + .75, 9, 2),
    P([[622, 836], [622, 612], [642, 594], [664, 612], [664, 700]], T2 + .15, T2 + .85, 6, 3),
    P([[664, 700], [1322, 700], [1322, 770], [622, 770]], T2 + .45, T2 + 1.35, 6, 4),
    P(line(1302, 770, 1302, 836), T2 + 1.2, T2 + 1.45, 6, 5),
    P(rect(1390, 250, 1620, 470), T2 + .9, T2 + 1.7, 7, 6),
    P(line(1505, 250, 1505, 470), T2 + 1.5, T2 + 1.8, 7, 7),
    P(line(1390, 360, 1620, 360), T2 + 1.6, T2 + 1.9, 7, 8),
    P(ellipse(1562, 305, 28, 28, -1.5708, 1.5708, 30), T2 + 1.8, T2 + 2.1, 5, 9),
    P(ellipse(1562, 305, 12, 28, -1.5708, 1.5708, 30), T2 + 2.0, T2 + 2.3, 5, 10),
    P(ellipse(720, 686, 50, 15), T2 + 1.0, T2 + 1.5, 5, 11),
    P(ellipse(HEAD.x, HEAD.y, HEAD.r, HEAD.r, 1.5708, 7.854, 50), T2 + 1.3, T2 + 1.8, 4, 12),
    P(bez([760, 694], [880, 628], [1110, 636], [1262, 700], 70), T2 + 1.55, T2 + 2.25, 5, 13),
    P(bez([1262, 700], [1250, 718], [1210, 726], [1180, 722], 12), T2 + 2.2, T2 + 2.4, 5, 14),
  ];
  const THREAD = P(Array.from({ length: 61 }, (_, i) => { const u = i / 60; return [lerp(HEAD.x, TB.x, u) + 16 * Math.sin(u * 9.5) * (1 - u * .6), lerp(HEAD.y - HEAD.r - 2, TB.y, u)]; }), T2 + 2.6, T3 + .3, 5, 15);
  paint(T2, T(5), (c, lt, t) => {
    const A = 1 - seg(t, T(5) - .25, T(5)), z = lerp(1, 1.15, eio(seg(t, T2, T(5))));
    c.translate(840, 560); c.scale(z, z); c.translate(-840, -560);
    for (const s of ROOM) DD(c, s.dots, { p: eo(seg(t, s.t0, s.t1)), a: A, t });
    const blink = t > T2 + 3.0 && t < T2 + 3.12 ? 0 : 1;
    c.fillStyle = "#fff"; dot(c, HEAD.x + 9, HEAD.y - 5, 2.6, A * seg(t, T2 + 1.85, T2 + 2.0) * blink);
    DD(c, THREAD.dots, { p: eio(seg(t, THREAD.t0, THREAD.t1)), a: .95 * A, t });
    const kp = seg(t, T3 + .2, T(5) - .4), rot = .28 * Math.max(0, t - T3) + .2 * Math.pow(Math.max(0, t - T(4)), 2);
    drawTangle(c, TB.x, TB.y, lerp(.55, 1.3, eo(kp)), rot, { p: eio(kp) * .98 + (kp > 0 ? .02 : 0), a: .9 * A, t, ghosts: t > T(4) ? 2 : 0 });
  }, 2);
}

// ---------- 第 5–7 幕：被线团压弯腰 → 「精神内耗」→ 一圈圈涟漪 ----------
{
  const FX = 700, S = 1.3, hipY = GY - 62 * S;
  const BED = dotPaths([[[FX - 300, GY], [FX - 300, hipY - 70]], [[FX - 300, hipY + 2], [FX + 6, hipY + 2], [FX + 6, hipY + 48], [FX - 300, hipY + 48]], line(FX - 10, hipY + 48, FX - 10, GY), line(300, GY, 1180, GY)], 6, 21);
  paint(T(5), T(8), (c, lt, t) => {
    const A = 1 - seg(t, T(8) - .4, T(8));
    DDs(c, BED, { p: eo(seg(t, T(5), T(5) + .6)), a: A, t });
    const bend = eio(seg(t, T(5) + .3, T(6) - .3));
    const h = drawFig(c, lerpPose(POSE.sit, POSE.sitbent, bend), FX, GY, S, { a: A, t, p: eo(seg(t, T(5), T(5) + .5)) });
    drawTangle(c, h.hx + 10, lerp(h.hy - 185, h.hy - 140, bend), 1.15, .9 * t, { a: .9 * A, t });
    // 第 6 幕：四个字由粒子聚成
    DD(c, textAt("jing", "精神内耗", 150, 1340, 470, 4, 31), { m: seg(t, T(6) + .1, T(6) + 2.0), a: A, t });
    // 第 7 幕：字周围一圈圈小点向外亮起
    if (t > T(7)) {
      c.fillStyle = "#fff";
      for (let k = 0; k < 4; k++) {
        const ph = ((t - T(7)) * .5 + k / 4) % 1, r = lerp(250, 760, ph), al = (1 - ph) * .55 * seg(t, T(7), T(7) + .5) * A * seg(ph, 0, .15);
        const n = Math.floor(6.2832 * r / 20);
        for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + k; dot(c, 1340 + r * 1.5 * Math.cos(a), 470 + r * .5 * Math.sin(a), 1.4, al * (.6 + .4 * Math.sin(i * 3.7 + t * 3))); }
      }
    }
  }, 2);
}

// ---------- 第 8–11 幕：三思而后行 → 问号长队 → 竹简「再，斯可矣」 ----------
{
  const NS = 7, SW = 66, X0 = 960 - NS * SW / 2, TOP = 200, BOT = 740;
  const STRIPS = Array.from({ length: NS }, (_, i) => dotPath(rect(X0 + i * SW + 4, TOP, X0 + (i + 1) * SW - 4, BOT), 6, 41 + i));
  paint(T(8), T(12), (c, lt, t) => {
    const A = 1 - seg(t, T(12) - .4, T(12)), QG = textLocal("q", "？", 210, 4, 41);
    // 问号：第 8 幕 3 个，第 9 幕镜头拉远、两边长出更多，第 10 幕淡出
    const qa = A * (1 - seg(t, T(10), T(10) + .8));
    if (qa > 0) {
      const z = lerp(1, .42, eio(seg(t, T(9), T(10) - .2)));
      c.save(); c.translate(960, 450); c.scale(z, z);
      for (let k = -10; k <= 10; k++) {
        const ak = Math.abs(k), t0 = ak <= 1 ? T(8) + .2 + (k + 1) * .45 : T(9) + .2 + (ak - 2) * .28;
        const m = seg(t, t0, t0 + 1.0); if (m <= 0) continue;
        c.save(); c.translate(k * 230, 0); DD(c, QG, { m, a: qa, t }); c.restore();
      }
      c.restore();
    }
    // 竹简：从右往左展开
    if (t > T(10)) {
      const u = eio(seg(t, T(10) + .3, T(10) + 2.2)) * NS;
      STRIPS.forEach((s, i) => DD(c, s, { p: clamp(u - (NS - 1 - i)), a: A * .85, t }));
      const xr = X0 + NS * SW, xl = xr - u * SW;
      [290, 650].forEach((y, j) => DD(c, dotPath(line(xr + 8, y, xl - 8, y), 7, 60 + j), { a: A * .7, t }));
      const colA = (i) => A * seg(clamp(u - (NS - 1 - i)), .8, 1);
      vText(c, "季文子三思而后行", X0 + 6.5 * SW, 250, 44, 58, colA(6) * .85);
      vText(c, "子闻之曰", X0 + 5.5 * SW, 250, 44, 58, colA(5) * .85);
      vText(c, "再斯可矣", X0 + 4.5 * SW, 290, 52, 74, A * seg(t, T(11) + .2, T(11) + 1.0));
      // 第 11 幕：左边三个小问号，擦掉一个
      if (t > T(11)) [300, 470, 640].forEach((y, j) => {
        c.save(); c.translate(560, y); c.scale(.42, .42);
        DD(c, QG, { m: seg(t, T(11) + .2 + j * .25, T(11) + 1.1 + j * .25), q: j === 2 ? seg(t, T(11) + 2.2, T(11) + 3.6) : 0, a: A, t });
        c.restore();
      });
    }
  }, 2);
}
