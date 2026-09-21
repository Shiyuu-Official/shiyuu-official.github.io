# 知序 · Markdown 游戏策划作品集

原生 HTML / CSS / JavaScript 页面 + Node.js Markdown 构建器。保留 Rhine 风格、开屏动效、响应式布局与详情导航。

## 常用命令

首次：pnpm install --frozen-lockfile

写作预览：pnpm dev（也可 node server.mjs）

正式构建：pnpm build（也可 node scripts/build.mjs）

验证：pnpm test

## 内容目录

content/projects/项目名/index.md：Demo 项目。

content/analyses/文章名/index.md：拆解分析。

content/about/index.md：个人介绍。

content/site.json：姓名、昵称和求职方向。

图片、视频和 PDF 就放在对应文章文件夹内。新增、删除、修改内容会在本地预览中自动更新列表、详情与目录。draft: true 的文章及其附件不会进入 dist/。

从 templates/project 或 templates/analysis 复制文件夹开始写作。详细字段、图片写法与发布流程见 docs/CONTENT_GUIDE.md。

src/ 是页面源码；scripts/ 是构建工具；dist/ 是生成结果，不要手工编辑 dist/。线上 Sites 版本需要重新发布，保存本地文件不会自动上传。

## 设计来源

页面构图、轨道图形与开屏基于 entropy622/entropy622.github.io（Apache-2.0）。莱茵生命开屏标志源于 LBEILC/RhineLabUI（MIT）。许可证保留在 src/licenses/ 并随站点发布；站内「设计致谢」提供来源。品牌权利归原权利人所有。

现有六篇文章为明确标记的占位，不代表已经完成的项目。

Windows 快捷入口：双击‘启动预览.cmd’；生成发布文件时双击‘生成网站.cmd’。

