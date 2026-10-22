// 10 秒样片：只播整片里 S0 起的 10 秒（第 13–15 幕：小人、白熊、熊变多）
// 预览某一刻：sample.html?s=秒数（样片里的秒数）
const S0 = T(13), SD = 10;
const outer = gsap.timeline({ paused: true });
outer.add(tl.tweenFromTo(S0, S0 + SD, { ease: "none" }), 0);
outer.fromTo("#fadeout", { opacity: 0 }, { opacity: 1, duration: .45, ease: "power1.in", immediateRender: false }, SD - .45);
window.__timelines.main = outer;
{
  const q = new URLSearchParams(location.search);
  if (q.has("s")) {
    const go = () => { outer.totalTime(.01, true); outer.totalTime(+q.get("s"), true); render(); };
    go(); if (document.fonts) document.fonts.ready.then(() => { for (const k in TX) delete TX[k]; go(); });
  }
}
