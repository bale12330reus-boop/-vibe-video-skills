// ================= 第 12–24 幕 =================

// ---------- 第 12–18 幕：白熊实验 → 越想越想不通 → 茧 ----------
const FE = { x: 760, s: 1.25 };                 // 这一段小人的位置（脚踩 GY）
const COCOON = { x: 760, y: GY - 76 * 1.25 };    // 茧的中心 = 小人身体中间
const rotE = (t) => .5 * Math.max(0, t - T(16)) + .55 * Math.pow(clamp(t - T(17), 0, 12), 2);
const tangE = (t) => ({ x: FE.x + 10, y: GY - 152 * FE.s - 190, sc: 1, rot: rotE(t) });
{
  const BEARS = [[1240, GY, 1.2, 0], [380, 560, .7, .3], [1560, 420, .65, .6], [260, 1010, .95, .9], [1690, 930, 1.05, 1.1], [640, 360, .55, 1.4], [1120, 400, .7, 1.6], [1560, 690, .85, 1.9], [470, 820, .8, 2.1]];
  paint(T(12), T(19), (c, lt, t) => {
    const tg = tangE(t), g = seg(t, T(16), T(16) + 1.8);
    // 主熊：第 12 幕聚在正中，第 13 幕退到小人身后
    const bp = eio(seg(t, T(13), T(13) + .9));
    drawBear(c, BEAR_STAND, lerp(960, BEARS[0][0], bp), GY, lerp(1.6, BEARS[0][2], bp), { m: seg(t, T(12) + .1, T(12) + 2.4), g, tx: tg.x, ty: tg.y, t });
    // 第 15 幕：熊一只只复制出来，往中间挤
    const crowd = seg(t, T(15), T(16));
    for (let k = 1; k < BEARS.length; k++) {
      const [bx, by, s, d] = BEARS[k];
      drawBear(c, BEAR_STAND, lerp(bx, FE.x, .08 * crowd), lerp(by, GY - 100, .08 * crowd), s, { m: seg(t, T(15) + d, T(15) + d + 1.1), g, tx: tg.x, ty: tg.y, t });
    }
    // 小人：第 13 幕出现、捂眼，第 14 幕放下手；第 18 幕被茧裹住
    const cover = seg(t, T(13) + .6, T(13) + 1.3) - seg(t, T(14), T(14) + .7), w = seg(t, T(18) + .2, T(18) + 3.4);
    if (t > T(13)) drawFig(c, lerpPose(POSE.stand, POSE.cover, eio(cover)), FE.x, GY, FE.s, { p: eo(seg(t, T(13), T(13) + .7)), a: 1 - .8 * w, t });
    // 第 16 幕起：线团从熊的粒子里长出来，第 17 幕越转越快，第 18 幕往下把人裹成茧
    if (t > T(16)) {
      if (t < T(18) + .2) drawTangle(c, tg.x, tg.y, tg.sc, tg.rot, { p: eio(seg(t, T(16) + .3, T(17))), a: .92, t, ghosts: t > T(17) ? 3 : 0 });
      else drawCocoon(c, tg, COCOON.x, COCOON.y, w, 0, .92 - .25 * seg(t, T(18) + 3.4, T(19)), t);
    }
  }, 2);
}

// ---------- 第 19–24 幕：茧碎 → 站台 → 「我不行」开过去 → 白熊坐下 → 站起来 ----------
{
  const FF = { x: 700, s: 1.25 }, seatY = GY - 62 * FF.s;
  const PLATFORM = dotPaths([line(120, GY, 1800, GY), line(120, GY + 40, 1800, GY + 40)], 8, 81);
  const BENCH = dotPaths([line(640, seatY, 780, seatY), line(650, seatY, 650, GY), line(770, seatY, 770, GY), line(646, seatY, 646, seatY - 62)], 6, 82);
  const SIGN = dotPaths([line(300, GY, 300, 610), rect(230, 560, 370, 610)], 6, 83);
  const RAIL = dotPath(line(0, 604, 1920, 604), 8, 84);
  const TRAIN = dotPaths([rect(-260, -100, 260, 100), rect(-220, -72, -90, -14), rect(-65, -72, 65, -14), rect(90, -72, 220, -14), ellipse(-170, 114, 18, 18), ellipse(170, 114, 18, 18)], 6, 85);
  paint(T(19), T(25), (c, lt, t) => {
    const A = 1 - seg(t, T(25) - .35, T(25));
    // 茧裂开、碎片四散
    if (t < T(19) + 1.4) drawCocoon(c, tangE(T(18) + 3.4), COCOON.x, COCOON.y, 1, seg(t, T(19), T(19) + 1.3), .7, t);
    const pl = eo(seg(t, T(19) + .5, T(19) + 1.6));
    DDs(c, PLATFORM, { p: pl, a: A, t }); DDs(c, BENCH, { p: pl, a: A, t }); DDs(c, SIGN, { p: eo(seg(t, T(19) + .9, T(19) + 1.9)), a: A * .8, t });
    DD(c, RAIL, { p: eo(seg(t, T(19) + 1.2, T(19) + 2.4)), a: A * .6, t });
    // 车厢：第 20 幕减速开进来，第 21 幕不停，开走
    if (t > T(20) && t < T(22)) {
      const tx = t < T(21) + .8 ? lerp(2300, 1300, eo(seg(t, T(20), T(20) + 2.8))) : lerp(1300, -500, ei(seg(t, T(21) + .8, T(22) - .2)));
      c.save(); c.translate(tx, 472); DDs(c, TRAIN, { a: A * .9, t });
      c.globalAlpha = A * .9; c.fillStyle = "#fff"; c.font = '600 64px "Noto Serif SC", "SimSun", serif'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("我不行", 0, 44);
      c.restore();
    }
    // 小人：坐着，第 24 幕站起来
    const up = eio(seg(t, T(24) + .3, T(24) + 1.5));
    drawFig(c, lerpPose(POSE.sit, POSE.stand, up), FF.x + 20 * up, GY - (1 - up) * 0, FF.s, { p: eo(seg(t, T(19) + .7, T(19) + 1.5)), a: A, t });
    // 白熊：第 22 幕聚起来、走近、坐下；第 23 幕慢慢变淡漂走
    if (t > T(22) && t < T(24)) {
      const bx = lerp(1250, 900, eio(seg(t, T(22) + 1.4, T(23) - .3)));
      drawBear(c, BEAR_SIT, bx, GY, 1.1, { m: seg(t, T(22) + .2, T(22) + 2.0), q: .5 * seg(t, T(23) + 1.2, T(24) - .2), a: A * (1 - seg(t, T(23) + 1.2, T(24) - .2)), t });
    }
  }, 2);
}
