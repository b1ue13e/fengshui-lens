# Vercel 部署修复指南

## 问题：代码已推送，但线上无变化

## 解决方案 A：强制刷新（最简单）

1. 访问 https://fengshui-lens.vercel.app/scan
2. 按 **Ctrl + Shift + R** 强制刷新
3. 或打开 **无痕模式** 访问

## 解决方案 B：Vercel 重新部署

1. 访问 https://vercel.com/b1ue13es-projects/fengshui-lens/deployments
2. 点击最新部署右侧的 **...**
3. 选择 **Redeploy**（不要勾选缓存）

## 解决方案 C：重新链接 GitHub（终极方案）

1. 访问 https://vercel.com/b1ue13es-projects/fengshui-lens/settings/git
2. 点击 **Disconnect** 断开 GitHub
3. 重新 **Connect** 同一个仓库
4. 等待自动部署

## 验证文件是否存在

访问以下链接检查文件是否在 GitHub：
- https://github.com/b1ue13e/fengshui-lens/tree/main/app/scan
- https://github.com/b1ue13e/fengshui-lens/blob/main/components/ui/animated-verdict.tsx

如果文件存在但 Vercel 不显示，说明是部署问题。
