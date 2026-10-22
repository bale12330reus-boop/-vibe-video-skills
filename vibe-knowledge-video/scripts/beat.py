"""读出 BGM 的节拍和段落，给分镜卡点用。

用法：python beat.py <bgm.mp3>        （需要：pip install numpy miniaudio）
输出：时长、BPM、第一拍时间、每小节(4拍)起点、每 2 秒响度（找安静段/高潮段）。
看 loud_2s_db：相邻两格突然升高 6 dB 以上 = 音乐变强的"爆点"；持续偏低的一段 = 安静段，适合放讲原理的内容。
"""
import json
import sys

import miniaudio
import numpy as np

if len(sys.argv) < 2:
    sys.exit("用法：python beat.py <bgm.mp3>")
path = sys.argv[1]
with open(path, "rb") as fh:  # 先读成字节：miniaudio 直接开中文路径会失败
    dec = miniaudio.decode(fh.read(), output_format=miniaudio.SampleFormat.FLOAT32, nchannels=1, sample_rate=22050)
sr = dec.sample_rate
x = np.frombuffer(dec.samples, dtype=np.float32)
dur = len(x) / sr

# 短时频谱 -> 频谱通量（onset 强度）
hop, win = 512, 2048
n = 1 + (len(x) - win) // hop
frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop][:n] * np.hanning(win)
mag = np.log1p(10 * np.abs(np.fft.rfft(frames, axis=1)))
flux = np.maximum(0, np.diff(mag, axis=0)).sum(axis=1)
flux = np.concatenate([[0], flux])
flux = flux - np.convolve(flux, np.ones(16) / 16, mode="same")  # 去掉慢变化
flux = np.maximum(flux, 0)
fps = sr / hop

# 自相关找 BPM（偏好 70~160）
ac = np.correlate(flux, flux, mode="full")[len(flux) - 1:]
cands = []
for bpm in np.arange(60, 180.01, 0.25):
    lag = fps * 60 / bpm
    lo, hi = int(np.floor(lag)), int(np.ceil(lag))
    v = ac[lo] + (ac[hi] - ac[lo]) * (lag - lo)
    w = np.exp(-0.5 * (np.log2(bpm / 110) / 0.9) ** 2)  # 轻微偏好常见速度
    cands.append((v * w, bpm))
cands.sort(reverse=True)
bpm = cands[0][1]
period = fps * 60 / bpm

# 相位：让拍点落在 onset 峰上
best_ph, best_s = 0.0, -1
for ph in np.arange(0, period, 0.25):
    idx = np.round(np.arange(ph, len(flux), period)).astype(int)
    idx = idx[idx < len(flux)]
    s = flux[idx].sum()
    if s > best_s:
        best_s, best_ph = s, ph
beats = np.arange(best_ph, len(flux), period) / fps

# 每 2 秒响度（dB）
seg = int(2 * sr)
loud = [round(float(20 * np.log10(np.sqrt(np.mean(x[i:i + seg] ** 2)) + 1e-9)), 1) for i in range(0, len(x), seg)]

# 找小节的"重拍"：4 拍一组，看哪一组相位的 onset 最强
strength = [flux[min(len(flux) - 1, int(round(b * fps)))] for b in beats]
grp = [sum(strength[k::4]) for k in range(4)]
down = int(np.argmax(grp))
bars = [round(float(b), 3) for b in beats[down::4]]

print(json.dumps({
    "duration": round(dur, 2),
    "bpm": round(float(bpm), 2),
    "top_bpm": [round(float(b), 2) for _, b in cands[:6]],
    "beat_sec": round(60 / float(bpm), 4),
    "first_beat": round(float(beats[0]), 3),
    "first_downbeat": bars[0],
    "bar_starts": bars,
    "loud_2s_db": loud,
}, ensure_ascii=False))
