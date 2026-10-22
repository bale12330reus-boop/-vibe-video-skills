# vibe-video-skills

一套 AI agent 用的知识类短视频制作 skill（含 4 种视觉风格）。给 agent 一个主题，它按 skill 里的流程走完：查资料并附出处 → 写文案 → 读 BGM 节拍写分镜 → 用代码逐帧渲染动画（HyperFrames + GSAP，不是文生视频）→ 出成片、封面和投稿文案。

> A collection of AI-agent skills for producing knowledge explainer short videos in 4 visual styles. Give the agent a topic and it runs the full pipeline: research with sources → script → beat-mapped storyboard → code-rendered animation (HyperFrames + GSAP, not text-to-video) → final video, covers and posting copy.

## 四个 skill

| Skill | 风格 | 成片形态 | 触发语示例 |
|---|---|---|---|
| `vibe-particle-essay` | 暗黑剪影随笔 | 横屏约 2.5–3 分钟，无旁白，纯黑底＋极小剪影人物＋发光象征物（桥/钟摆/提线/跑道/光轨） | "用暗黑剪影风格做 X" |
| `vibe-dotline-philosophy` | 暗房灯串哲学短片 | 横屏约 2.5 分钟，无旁白，纯黑底＋白色灯串珠线稿，结尾一束暖光 | "用灯串风做 X" |
| `vibe-mascot-data-video` | 萌物数据短视频 | 竖屏约 80–90 秒，萌物第一人称＋数据动画，中英双语字幕 | "萌物数据视频做 X" |
| `vibe-knowledge-video` | 博物馆纪录片风 | 横屏约 2–2.5 分钟，无旁白，深黑棕＋金框＋馆藏图版 | "博物馆风做 X" |

每个 skill 目录结构相同：`SKILL.md`（主流程）＋ `assets/`（动画模板/引擎/字体）＋ `references/`（风格规范）＋ `scripts/`（节拍分析等）＋ `examples/`（真实成片的各步产出，照着抄）。

## 怎么用

1. 把某个 skill 文件夹放进你的 agent 的 skills 目录（Claude Code / Codex 等）。
2. 对 agent 说触发语，例如："用暗黑剪影风格做一条讲沉没成本的视频"。
3. 准备一首 BGM（mp3/wav/m4a/flac，**必须是你有使用权的音乐**，skill 不会替你下载）。
4. agent 按 `SKILL.md` 跑完，交付成片＋封面＋投稿文案。

默认全自动跑完；也可以要求分步确认（每步停下来等你点头）。

## 环境要求

- Node.js 20+、FFmpeg（含 ffprobe）、Python 3（numpy + miniaudio）
- HyperFrames（`npx hyperframes`）做代码渲染
- 一个 Chromium 内核浏览器（截图/样片核对用）
- 字体：思源宋体/黑体已随包放在各 skill 的 `assets/fonts/`（OFL 协议，可商用）

各 skill 的 `SKILL.md` 文末/开头有更细的环境说明，第一次用时照着装一遍即可。

## 仓库结构

```
vibe-video-skills/
  vibe-particle-essay/        暗黑剪影随笔
  vibe-dotline-philosophy/    暗房灯串哲学短片
  vibe-mascot-data-video/     萌物数据短视频
  vibe-knowledge-video/       博物馆纪录片风
  README.md
  LICENSE
```

## 说明

- 这套流程是从作者自己的真实成片里蒸馏出来的，每一步都有"自查清单"和"踩过的坑"，建议完整读一遍 `SKILL.md` 再用。
- 文案里的事实核查是硬性步骤：年份、人名、数字都要有出处，查不到就删。
- BGM 请使用你有授权的音乐或平台曲库，不要用无版权音乐发布。

## 二进制资源（未进仓库，自己补一下）

GitHub 推送走的是纯文本通道，下面几个二进制文件没推进来，不影响 skill 主体使用，按需补：

- **思源宋体可变字体 `NotoSerifSC-VF.ttf`**（OFL 协议，可商用）：去 [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Serif+SC) 下载，放到 `vibe-dotline-philosophy/assets/fonts/`；其他三个 skill 在渲染项目时按各自 `SKILL.md` 的说明放到 `<项目>/video/assets/fonts/`。
- **`assets/grain.png`**（噪点纹理，三个 skill 各一张）：任意一张灰度噪点图即可，或用 Python 生成：
  `python -c "import numpy as np; from PIL import Image; Image.fromarray((np.random.rand(256,256)*255).astype('uint8')).convert('L').save('assets/grain.png')"`
- **`references/原片截图/`、examples 里的封面 PNG**：只是风格参考和示例产出，不影响使用。

## License

MIT，见 [LICENSE](./LICENSE)。字体文件遵循各自的 OFL 协议。
