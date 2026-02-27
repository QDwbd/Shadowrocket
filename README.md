## 旧版只能手动更新内核..我就拿代码改完自建了仓库打包
[需要安装](https://git-scm.com)
[需要安装](https://releases.llvm.org)
[需要安装](https://tauri.app/v1/guides/getting-started/prerequisites)
[需要安装](https://pnpm.io/installation)
## 修改了背景模板 删除了除mihomo以外的内核
```
npm install -g pnpm
```
```
pnpm i
```
```
pnpm check
```
```
pnpm run build
```
下面这俩可不用
```
pnpm dev
pnpm dev:diff
```
```
pnpm build
```