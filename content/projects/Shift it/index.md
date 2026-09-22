---
title: "Shift it"
summary: "第一次Gamejam尝试，复盘和思路总结"
date: "2026-09-20"
order: 1
featured: true
draft: false
tags: ["Gamejam","平台跳跃"]
cover: "./Shift_it.png"
---
在项目中担任策划的工作，负责了整张地图的设计及大部分能力的提炼设计，也负责了部分程序~~AI代打~~。获得**2026腾讯IEG72h极限开发大赛·南京赛点第一名**。

[视频介绍](https://www.bilibili.com/video/BV1gQui62ELR/?spm_id_from=333.337.search-card.all.click&vd_source=d0aa82139430917f39e9d2917c8cc208)&nbsp;&nbsp;&nbsp;&nbsp;[Github仓库](https://github.com/cds1111/gameJamTencent)&nbsp;&nbsp;&nbsp;&nbsp;[在线游玩](https://15532.itch.io/shift-it)

---

## 游戏介绍

**Shift_it** 是一款**平台跳跃闯关**游戏，每一小关的地图相同，但给予玩家的能力不同。玩家需要通过实操理解本关的能力内容，并利用能力收集金币打开闸门，最终通关。灵感来源于[《This Is The Only Level》](https://www.bilibili.com/video/BV1mV411X7zq/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=d0aa82139430917f39e9d2917c8cc208)，每关的能力则围绕Gamejam主题“**Shift**”进行设计。

![截图](<./images/01.png>)

## 流程复盘

> 很多碎碎念......写给自己看

* 开赛前一天，大量翻阅Gamejam作品，大概理解Gamejam项目的体量和亮点。考虑到队伍组成特殊（四个程序出身且0经验），思考后得出模糊的方向：做一款提供“**尤里卡时刻**”的游戏，靠并不复杂的小巧思打动玩家，放弃靠美术、文案资源出彩的方向~~因为队里根本没有文案美术~~。翻到了[《能不能不要再做推箱子游戏了！》](https://www.bilibili.com/video/BV1aZ421z7Ta/?share_source=copy_web&vd_source=749c7a81c9800ce1e93df46e4c460d17)和[《This Is The Only Level》](https://www.bilibili.com/video/BV1mV411X7zq/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=d0aa82139430917f39e9d2917c8cc208)，为后续设计埋下伏笔。
* 开赛当天中午公布主题“Shift”。略加讨论后提出：脑暴4小时，记录下期间所有的点子内容。如果没能得出满意的方案，就参考《This Is The Only Level》的形式，并将脑暴期间的各种废案回收利用，提炼成为每一关的能力内容。期间四人各自提出对Shift一词的解读，也提出了非常多点子（时间倒流、表里世界、shift冲刺、RTS战场视角切换、能力锁逐步解放......）但总归没能得出成熟的方案。最后按我提出的小关卡集锦的形式去做了。
* 然后开始动工，四人都是第一次接触游戏开发，现学现做~~现问AI~~。组长规划代码框架，我花一晚上设计地图的初稿，另外两名程序研究godot实现和tilemap之类，以及找免费公用的美术音效素材，我也跟着看点。中间还有沟通不当、组员临时有事等各种意外情况。迫于各种现实因素实际只用了一天半的时间，急匆匆的交了稿。
* 最后意料之外的拿到第一名，复盘下来也许是我们的游戏最“点题”。总归还是有很多待完善内容。

## 游戏设计

### 极简留白

界面、操作设计均进行了简化留白：操作只保留AD左右移动、空格跳跃、shift使用能力、R重置关卡，保证玩家快速上手。按键提示仅在地图左上角给出图标，其中闪烁其驰关卡禁用跳跃键，相应的space图标也会虚化。固定地图和美术资源也让玩家更专注于能力的理解和运用，而不被其他因素分散zhu'yi'li

### 尤里卡时刻

赛制要求三天内完成，而组内没有美术、文案，也没人有游戏开发经验。因此相比在剧情沉浸感、音画体验、玩法深度上做出彩，我们选择了[尤里卡时刻](https://www.bilibili.com/video/BV1V4421f7d1/?spm_id_from=333.337.search-card.all.click&vd_source=d0aa82139430917f39e9d2917c8cc208)的设计理念,尝试给玩家“顿悟”式的游玩体验。



