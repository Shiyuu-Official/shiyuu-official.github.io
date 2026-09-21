# 用 Markdown 更新作品集

## 只改内容，不改代码

网站现在分成 **内容、页面源码、生成结果** 三层：

- content/：你平时写作的地方。
- src/：页面结构、样式、动效；日常更新作品不用修改。
- scripts/：自动构建脚本。
- templates/：新作品的文件夹模板。
- dist/：自动生成的网站；不要手动改这里，构建会覆盖它。
- .openai/hosting.json：现有 Sites 私有站点配置。

## 新增一个 Demo

1. 复制 templates/project 文件夹到 content/projects/，将文件夹改名为你的项目，例如 puzzle-demo（中文文件夹名也支持）。
2. 编辑里面的 index.md。
3. 把截图、视频和 PDF 放在该文件夹里，建议放 assets/ 子目录。
4. 准备好后将开头的 draft: true 改为 draft: false。
5. 本地预览运行期间，保存即自动重建，浏览器自动刷新。首页、列表、详情与文章目录都会更新。

分析案的步骤相同：复制 templates/analysis 到 content/analyses/。

每个作品目录必须有 index.md。文件夹名就是文章地址的一部分，发布后尽量保持不变。所有以 _ 或 . 开头的目录都会被忽略。没有 index.md 的目录也不会发布。

## Markdown 写法

支持普通段落、标题、粗体、引用、列表、代码块、表格、图片和链接。二级、三级标题会自动成为详情页目录。

图片写作：![图片说明](./assets/截图.png)

PDF 链接：[下载设计案](./assets/设计案.pdf)

视频：<video controls src="./assets/demo.mp4"></video>

也可以使用 <audio controls src="./assets/audio.mp3"></audio>。HTML 只保留文章和媒体所需标签，不执行脚本、iframe 或事件属性。若要展示外部播放器，请链接到相应视频页面。大型视频和安装包建议托管在外部平台，Markdown 中放完整 HTTPS 链接。

路径相对当前 index.md 所在目录。中文和空格可以使用；带空格的 Markdown URL 请用尖括号包裹，例如 ![截图](<./assets/my screenshot.png>)。链接文件必须存在；拼错路径会提示错误并保留上一次正常页面。不支持引用文章目录以外的本地路径。

## 开头的配置字段

配置写在首尾两行 --- 之间（YAML 格式）。普通文本含冒号时加双引号；日期请始终加引号。

| 字段 | 用途 | 默认 |
| --- | --- | --- |
| title | 文章标题 | 第一条一级标题或目录名 |
| category | 卡片和详情的类型 | Demo 项目 / 拆解分析 |
| summary | 一两句简介 | 空 |
| date | YYYY-MM-DD 更新日期 | 不显示 |
| tags | 数组，例如 ["关卡设计", "Unity"] | 空 |
| featured | 是否优先展示在首页 Demo 区 | false |
| order | 排序数字，越小越靠前 | 1000 |
| draft | true 时完全不进入生成站点，包括附件 | false |
| placeholder | true 时显示“占位”标记；正式作品不用写 | false |
| role | 个人职责，或分析的游戏对象 | 不显示 |
| author | 作者名 | 网站个人信息里的姓名 |
| cover | 封面相对路径，例如 ./assets/cover.png | 几何示意封面 |
| demo | 在线体验或同目录 HTML Demo 入口 | 不显示按钮 |
| video | 演示视频或视频页面链接 | 不显示按钮 |
| download | 附件路径或外部下载链接 | 不显示按钮 |
| theme | 无封面时的配色：paper / olive / ink | paper |

不需要的配置可以删掉。也可以不写 YAML，仅写普通 Markdown，网站会用目录名或一级标题作为标题。

排序先按 order 升序，再按 date 倒序，最后按目录名。首页最多展示两个精选 Demo；没有 featured 时展示前两个项目。分析案出现在分析列表和首页索引。

删除某个作品目录，下次构建后列表、详情和附件一起移除。将 draft 改回 true 也会撤下它。草稿仍在本地 Git 源码中，但不会包含在发布站点资源内。

## 个人信息

- content/site.json：姓名 name、英文名 alias、求职方向 direction，以及是否显示个人信息占位提示 placeholder。
- content/about/index.md：个人介绍、经历、简历和联系方式。
- 简历文件可以放 content/about/，在关于页 Markdown 中用相对链接引用。

## 本地运行

需要 Node.js 20 或更新版本和 pnpm。首次安装依赖：

pnpm install --frozen-lockfile

启动带自动更新的预览：

pnpm dev

等价命令：node server.mjs。打开终端显示的 http://127.0.0.1:4173。

此后只需保存 Markdown 或附件，浏览器会自动刷新。若 YAML 或路径出错，页面底部会显示具体错误；修好后自动恢复，不必重启。新增和删除文件夹也会检测到。

生成正式发布文件：

pnpm build

等价命令：node scripts/build.mjs。结果在 dist/。构建失败时不覆盖原有 dist/。

检查已经生成的版本：

pnpm preview

## 本地自动更新 ≠ 线上自动发布

保存本地 Markdown 不会直接修改互联网上的网站。现有 Sites 链接需要在构建成功后发布新版本；你可以让 Codex“发布我新增的作品集内容”。发布成功后沿用同一链接。

本项目没有偷偷设置后台上传或自动发布任务。以后若迁移到 GitHub Pages / Vercel 等，可配置“推送仓库后自动构建发布”；目前没有给未连接的 GitHub 仓库添加无效工作流。

Windows 当前电脑也可以双击根目录的‘启动预览.cmd’开始写作，或‘生成网站.cmd’更新 dist/。首次在其他电脑使用时，仍需先安装 Node.js、pnpm 和项目依赖。



## 项目封面与 Markdown 介绍

项目列表和首页使用双列封面卡片。没有 cover 时显示几何图示；设置 cover: "./assets/cover.png" 后显示自己的封面。

点击卡片进入 Markdown 介绍页，正文和章节目录根据 index.md 自动生成。图片、视频、PDF 继续放在项目文件夹内，不需要修改 JavaScript。

文件放法：content/projects/项目名/index.md；配图放同目录 assets/，正文写 ![截图](./assets/截图.png)。保存后本地预览自动刷新；线上版本需要重新发布。

## 分析栏目

content/analyses/文章名/index.md 自动生成分析列表和文章详情。title、summary、date、tags 分别决定标题、摘要、日期和标签；右侧标签栏自动汇总并可筛选。可选 cover 指向同目录配图，作为文章卡片的淡化背景；没有封面时显示轨道图示。示例文章标记 placeholder: true，替换成真实内容后可删除该字段。复制 templates/analysis/index.md 开始新增。

当前默认仅本地预览，不自动部署；需要上线时再明确要求发布。

## 可嵌套的分析文件夹

文章使用 index.md；文件夹使用 _folder.md。二者不要放在同一目录。

content/analyses/设计专题/_folder.md
content/analyses/设计专题/文章一/index.md
content/analyses/设计专题/关卡研究/_folder.md
content/analyses/设计专题/关卡研究/文章二/index.md

_folder.md 使用与文章相同的 YAML 头部，支持 title、summary、order、tags、draft、placeholder。可从 templates/folder/_folder.md 复制。不写 _folder.md 时，包含文章子目录的目录也会自动作为文件夹显示，标题使用目录名；显式 _folder.md 可显示空文件夹。文章目录内只放正文和附件，继续分组请放在文件夹下。

外部卡片显示文件夹内全部公开文章数量，包含所有层级的子文件夹，草稿不计入。draft: true 的文件夹连同全部子目录一起隐藏，附件不进入发布结果。点击文件夹进入同样的列表，文章可返回所在文件夹。标签筛选仅作用于当前层级，文件夹会汇总后代文章标签。更改目录位置会改变文章地址。

## 文章封面与阅读目录

在 index.md 头部写 cover: "./assets/cover.png"，即可显示顶部清晰封面及同图模糊背景，不需要准备第二张图。图片按原比例显示；没有 cover 时直接显示文章信息。正文二级至六级标题自动生成右侧目录，随滚动高亮视口内的章节，并标识当前阅读位置。手机端采用单列正文。嵌套文章仍可返回所属文件夹。

## 随想

随想内容放在 content/thinking/文章名/index.md，格式与分析完全一致，支持同级图片、封面、标签、草稿和嵌套文件夹。文件夹使用 _folder.md。入口为 #/thinking，内容与分析栏目独立。
