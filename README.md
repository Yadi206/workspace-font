# workspace-font

Sidebar typography for DeepSeek Harness (dsh): the project rows in the sidebar's
**Workspace** section read bold, their session rows one step smaller, and both
kinds are adjustable — font family, size, bold, italic — on a Settings page.
A **Collapse all** control sits next to the Workspace title.

侧边栏字体插件，给 DeepSeek Harness 用：「工作区」里的项目文件夹加粗、会话行字号小一号，
两类行的字体、字号、加粗、斜体都能在设置页里分别调；「工作区」标题旁还有一个「全部折叠」按钮。

## 功能 / Features

- **项目行加粗** — 顶层项目文件夹用 600 半粗；嵌套在其它项目里的项目保持常规。
- **会话行小一号** — 默认 14px → 13px，形成层级。
- **设置页**（设置 → 工作区美化）— 两组（项目文件夹 / 会话行）各自选择字体（跟随界面 / 系统无衬线 / 等宽 / 衬线 / 楷体）、字号（11–20 px）、加粗、斜体，带实时预览和「恢复默认」。选择存在本浏览器的 `localStorage`。
- **全部折叠** — 位于「工作区」标题后面、放大镜前面；侧栏收成图标轨道或搜索展开时自动隐藏。
- 只改字体与新增这一个按钮：颜色、悬停底色、间距、图标都保持 dsh 原样。

- **Bold project rows** — top-level project folders at weight 600; nested projects stay regular.
- **Smaller session rows** — 14px → 13px by default.
- **Settings page** (Settings → Workspace polish) — per-group font family, size (11–20px), bold and italic, with a live preview and Restore defaults. The choice is saved in this browser's `localStorage`.
- **Collapse all** — between the Workspace title and the search button; hides itself in the icon rail and while search is open.
- Typography plus that one control only: colors, hover fills, spacing and glyphs stay as shipped.

## 安装 / Install

- 市场：收录后可在 **插件 → 插件市场** 里一键安装。
- 手动：把本仓库装进 profile（例如 `dsh plugin add github:Yadi206/workspace-font`，按你的 dsh 版本为准），或在 dsh 里装本地目录。

Install from the market once listed, or add this repository / a local checkout to a profile.

## 注意 / Notes

- 字体设置是**浏览器本地偏好**，清站点数据会回到默认。
- 「全部折叠」会逐个按下展开的项目表头，等同于你自己点一遍；折叠会重置 dsh 自己的分组水位线（这是 dsh 的折叠行为）。
- 按钮插在 dsh 的标题栏里（该处没有插件座位），dsh 改版后按钮可能静默消失，其余功能不受影响。

- Typography is a browser-local preference; clearing site data restores defaults.
- “Collapse all” presses each expanded project header, exactly like clicking them; dsh resets its own group watermarks on collapse.
- The button is inserted into dsh's section header, which has no plugin slot; a future dsh layout change may remove it silently while everything else keeps working.

## License

MIT — see [LICENSE](LICENSE).
