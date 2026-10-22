// ================= 第 25–33 幕 + 字幕 + 注册 =================

// ---------- 第 25–27 幕：先动起来 → 线团跟在身后 → 松开拖成直线 ----------
const FW = { x: 1050, s: 1.2 }, HEADY = GY - 152 * FW.s;
const tangW = (t) => ({ x: FW.x - 230 + 6 * Math.sin(t * 1.3), y: HEADY - 70 + 10 * Math.sin(t * 1.7) });
const unravel = (t) => eio(seg(t, T(27) + .3, T(28) - .6));
{
  const R = mkRnd(91), GR = Array.from({ length: 210 }, () => ({ jx: (R() - .5) * 1.4, jy: (R() - .5) * 1.4, r: 1.25 + R() * .9, a: .6 + R() * .4 }));
  const SHIRT = dotPaths([rect(610, GY - 26, 690, GY), [[630, GY - 26], [650, GY - 12], [670, GY - 26]]], 5, 92);
  const DOOR = dotPaths([[[890, GY], [890, GY - 200], [980, GY - 200], [980, GY]]], 6, 93);
  paint(T(25), T(28), (c, lt, t) => {
    const A = seg(t, T(25), T(25) + .4);
    if (t < T(26)) {
      // 第 25 幕：边走边把路画出来，路边一件叠好的衣服、一扇门
      const fx = lerp(420, 1080, seg(t, T(25) + .6, T(26)));
      DD(c, dotPath(line(380, GY, fx + 30, GY), 8, 61), { a: A, t });
      DDs(c, SHIRT, { p: seg(fx, 560, 640), a: A, t });
      DDs(c, DOOR, { p: seg(fx, 740, 880), a: A, t });
      c.fillStyle = "#fff"; dot(c, 965, GY - 100, 2.4, A * seg(fx, 870, 890));
      const amp = seg(t, T(25) + .2, T(25) + .8);
      drawFig(c, walkPose((fx - 420) / 26, amp), fx, GY - 3 * amp * Math.abs(Math.cos((fx - 420) / 26)), FW.s, { p: eo(seg(t, T(25), T(25) + .5)), a: 1, t });
      return;
    }
    // 第 26–27 幕：镜头跟着走，地面往后退，线团挂在身后
    const sc = 110 * (t - T(26)), ph = (660 / 26) + (t - T(26)) * 4.2;
    c.fillStyle = "#fff";
    GR.forEach((g, i) => dot(c, ((i * 10 - sc) % 2100 + 2100) % 2100 - 60 + g.jx, GY + g.jy, g.r, g.a * (.85 + .15 * Math.sin(t * 2.4 + i))));
    const h = drawFig(c, walkPose(ph), FW.x, GY - 3 * Math.abs(Math.cos(ph)), FW.s, { t });
    const tw = tangW(t), u = unravel(t);
    DD(c, dotPath(bez([h.hx - 6, h.hy - 18], [h.hx - 60, h.hy - 90], [tw.x + 60, tw.y + 40], [tw.x, tw.y], 40), 5, 62), { a: .9, t });
    drawTangle(c, tw.x, tw.y, lerp(.85, .35, u), .4 * t, { p: 1 - u, a: .9, t });
    if (u > 0) DD(c, dotPath(line(tw.x, tw.y, lerp(tw.x, -60, u), tw.y), 8, 71), { a: .9, t });
  }, 2);
}

// ---------- 第 28–32 幕：直线落成地平线 → 鸟叫 → 早餐铺热气 → 日出 → 大字 ----------
{
  const STEAMER = dotPaths([[[1380, GY], [1520, GY], [1512, GY - 38], [1388, GY - 38], [1380, GY]], [[1388, GY - 38], [1394, GY - 74], [1506, GY - 74], [1512, GY - 38]], ellipse(1450, GY - 74, 58, 20, 3.1416, 6.2832, 30), ellipse(1450, GY - 100, 6, 6, 0, 6.2832, 12)], 5, 94);
  const SUN = Array.from({ length: 96 }, (_, i) => i / 96 * 6.2832);
  paint(T(28), T(33), (c, lt, t) => {
    const A = 1 - seg(t, T(33) - 1.6, T(33)), wm = eio(seg(t, T(31) + .2, T(32) + 1.5)), col = WARM(wm);
    // 日出的暖光（全片唯一的颜色）
    if (wm > 0) {
      const gr = c.createRadialGradient(960, GY + 40, 0, 960, GY + 40, lerp(80, 1150, wm));
      gr.addColorStop(0, `rgba(255,196,110,${.55 * wm * A})`); gr.addColorStop(.45, `rgba(255,170,90,${.22 * wm * A})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      c.globalAlpha = 1; c.fillStyle = gr; c.fillRect(0, 0, W, H);
    }
    const z = lerp(1, 1.12, eio(seg(t, T(30), T(33))));
    c.save(); c.translate(FW.x, 700); c.scale(z, z); c.translate(-FW.x, -700);
    // 太阳：从地平线下慢慢升起，只画地平线以上的部分
    if (wm > 0) { c.fillStyle = col; const sy = GY + 150 - 260 * wm; SUN.forEach((a, i) => { const y = sy + 130 * Math.sin(a); if (y < GY - 3) dot(c, 640 + 130 * Math.cos(a), y, 1.6, A * wm * (.7 + .3 * Math.sin(t * 2 + i))); }); }
    // 那根直线落下来，横过整个画面
    const L = eio(seg(t, T(28), T(28) + 2.2)), tw = tangW(T(28));
    DD(c, dotPath(line(lerp(tw.x, 1980, L), lerp(tw.y, GY, L), -60, lerp(tw.y, GY, L)), 8, 71), { a: A, t, col });
    // 小人：走着停下来，站在地平线上（背影）
    const stop = seg(t, T(28), T(28) + 1.0), ph = (660 / 26) + (T(28) - T(26) + stop * .5) * 4.2;
    drawFig(c, walkPose(ph, 1 - stop), FW.x, GY, FW.s, { a: A, t, col });
    // 第 28 幕：一只小鸟飞过
    if (t < T(29) + .8) {
      const bu = seg(t, T(28) + .8, T(29) + .6), bx = lerp(250, 1750, bu), by = 300 - 60 * bu + 8 * Math.sin(t * 2), f = .2 + .8 * (.5 + .5 * Math.sin(t * 9));
      if (bu > 0 && bu < 1) DD(c, dotPath([[bx - 16, by - 7 * f], [bx - 7, by - 1], [bx, by + 3], [bx + 7, by - 1], [bx + 16, by - 7 * f]], 3, 95), { a: A, t });
    }
    // 第 29 幕起：早餐铺的蒸笼和热气
    DDs(c, STEAMER, { p: eo(seg(t, T(29) + .2, T(29) + 1.4)), a: A, t, col });
    const st = seg(t, T(29) + 1.0, T(29) + 2.2);
    if (st > 0) for (let i = 0; i < 3; i++) {
      const x0 = 1428 + i * 22, pts = Array.from({ length: 30 }, (_, j) => { const y = GY - 112 - j * 5; return [x0 + 9 * Math.sin(y * .045 + t * 2.2 + i * 2), y]; });
      DD(c, dotPath(pts, 6, 96 + i), { p: st, a: A * .7, t, col });
    }
    c.restore();
    // 第 32 幕：暖光里的大字
    DD(c, textAt("end", "然后，去吃早饭吧。", 118, 960, 400, 3, 97), { m: seg(t, T(32) + .2, T(32) + 1.6), a: A, t, col: WARM(wm * .45) });
  }, 2);
}

// ---------- 字幕 ----------
[
  [2, "凌晨三点，你还醒着。"], [3, "那句话，他是不是在点我？"], [4, "明天要是搞砸了，怎么办？"], [5, "什么都没做，却累得像打了一仗。"],
  [6, "这种感觉，有个名字：精神内耗。"], [7, "2022 年，它成了年度十大流行语。"], [8, "我们从小听说：三思而后行。"], [9, "好像想得越多，就越不会错。"],
  [10, "可孔子听到这句，只说了一句——"], [11, "“再，斯可矣。”想两遍，就够了。"], [12, "1987 年，心理学家韦格纳做了个实验。"], [13, "他先让一组人：别去想白熊。"],
  [14, "后来再让他们随便想——"], [15, "这组人想到白熊的次数，反而更多。"], [16, "另一位心理学家发现："], [17, "一遍遍琢磨“我为什么难受”，"],
  [18, "往往让难受拖得更久。"], [19, "第一步：看见它。"], [20, "在念头前面，加一句“我注意到”。"], [21, "“我注意到，我有个念头：我不行。”"],
  [22, "第二步：让白熊坐下。"], [23, "不赶它，不跟它吵，它就只是一只熊。"], [24, "第三步：先动起来。"], [25, "叠一件衣服，下楼走五分钟。"],
  [26, "我们总以为，要先想通，才能往前走。"], [27, "其实往前走了，很多事自己就通了。"], [28, "窗外，第一声鸟叫。"], [29, "楼下早餐铺，冒出第一笼热气。"],
  [30, "你不用吵赢脑子里的声音。"], [31, "想了一整夜，然后呢？"],
].forEach(([n, text]) => say({ t0: T(n) + .3, t1: T(n + 1) - .02, text }));
say({ t0: T(33) + .4, t1: END - .3, text: "难受很久都走不出来的话，记得找专业的人聊聊。", cls: "s" });
tl.fromTo("#fadeout", { opacity: 0 }, { opacity: 1, duration: .5, ease: "power1.in", immediateRender: false }, END - .5);

// ================= 注册（不要改） =================
tl.fromTo(clock, { t: 0 }, { t: END, duration: END, ease: "none" }, 0);
tl.set({}, {}, END);
window.__timelines = window.__timelines || {};
window.__timelines.main = tl;
// 字体到了以后重算点阵字，免得用了后备字体
if (document.fonts) document.fonts.load('600 124px "Noto Serif SC"', "想了一整夜然后呢精神内耗？去吃早饭吧").then(() => { for (const k in TX) delete TX[k]; render(); }).catch(() => {});
{
  const q = new URLSearchParams(location.search);
  if (q.has("t")) {
    const go = () => { ctx.clearRect(0, 0, W, H); tl.totalTime(.01, true); tl.totalTime(+q.get("t"), true); render(); };
    go(); if (document.fonts) document.fonts.ready.then(() => { for (const k in TX) delete TX[k]; go(); });
  }
}
