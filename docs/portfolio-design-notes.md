# 页面与播放约束

本次参考 [Taste Skill](https://github.com/Leonxlnx/taste-skill) 的信息层级、对齐、文字可读性和移动适配方法。用户明确要求保留既有美术基调与动效，因此其优先级高于技能默认的浅色、无渐变、无滚动入场等风格规则。

- 保留深色底、彩色抽象首屏、激光渐变标题、玻璃导航、背景光效、边框光效与现有入场动画。
- 使用统一内容边界、两列核心项目、等高封面和可自然增长的正文。手机单列展示完整内容，保留导航入口。
- 不改写项目经历与数据，不将持续开发中的工具描述为成熟上线产品。
- 溯剪的对外介绍不得出现已禁用的旧业务名称；内部兼容字段不在本次更名范围内。

## 视频播放

手机和微信内置浏览器优先使用 MP4，在原始点击事件内启动播放；桌面优先使用现有 HLS。HLS 不受支持或发生致命错误时自动回退到 MP4，并尽量保留已观看位置。关闭弹窗会释放旧播放会话，避免异步初始化重新打开旧视频。

AI 视频保留完整 11 分 06 秒的原画质 HLS，另提供 768×432、H.264 Baseline / AAC 的手机流畅版；流畅版低于 Cloudflare Pages 的单文件 25 MiB 限制。播放器提供画质切换、重试和直接打开入口。

校园视频修复重复备用元素 ID，并始终提供有效的独立播放链接。信息流与王朝视频沿用原 MP4，保留原生播放控件。

线上复验发现静态 MP4 请求的 `Range` 被返回为 `200`，手机拖动到未缓冲位置会回到开头。`public/_worker.js` 为 MP4 提供精确的 `206 Content-Range`，按流截取字节，不将整个视频读入内存。构建过程生成精确的 `_routes.json`，仅 MP4 请求进入函数，其他页面和资源继续静态托管。

实现依据：[Pages Advanced Mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)、[函数路由](https://developers.cloudflare.com/pages/functions/routing/)、[FixedLengthStream 与 Content-Length](https://developers.cloudflare.com/workers/runtime-apis/response/)。

验证命令：

```sh
node --test scripts/copy-runtime-assets.test.mjs
node --experimental-vm-modules --test scripts/video-source.test.mjs
node --test scripts/video-range.test.mjs
pnpm run build
```

模拟移动设备的浏览器检查不能代替真实 iPhone Safari、安卓系统浏览器或微信内置播放器的实机验证。
