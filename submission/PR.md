# 收录到 awesome-dsh-plugin

市场（dshmarket）和 awesome-dsh-plugin.com 都实时读 `awesome-dsh-plugin/awesome-dsh-plugin`
这份精选列表，所以上架 = 往那个仓库提一个只新增单个 YAML 文件的 PR。

## 这是干什么的

- `Yadi206__workspace-font.yml` 就是要提交的**唯一文件**，目标路径：
  `data/plugins/Yadi206__workspace-font.yml`
- 本目录只是我们仓库里的备份，不会被市场读取。

## 提交前清单

- [x] 仓库公开：<https://github.com/Yadi206/workspace-font>
- [x] `package.json` 声明 `dsh.bundle`（`./cordis.patch.yml`）与 `dsh.client`
- [x] 真实可用的代码，无占位
- [x] `category: ui`（侧边栏外观/字体，不是主题皮肤，所以不是 `theme`）
- [x] 描述只写功能、可由代码核对；`en` + `zh`
- [ ] 仓库创建满 1 天（CI 检查 `MIN_AGE_DAYS = 1`）
- [ ] GitHub 仓库 Topics 加 `dsh-plugin`

## PR 文案

**标题**

```
Add Yadi206/workspace-font
```

**正文**

```
- Added `data/plugins/Yadi206__workspace-font.yml` (one file; READMEs are generated, left untouched).
- Repo: https://github.com/Yadi206/workspace-font (public, topic `dsh-plugin`).
- `package.json` declares `dsh.bundle` (`./cordis.patch.yml`) and `dsh.client` (Web UI half), no build step.
- Category `ui`: it changes sidebar typography (bold top-level workspace folders, one-step-smaller session rows), adds a Settings page for font family/size/bold/italic, and a Collapse all control in the Workspace section header.
- Description claims are all verifiable in `client.js`.
```
