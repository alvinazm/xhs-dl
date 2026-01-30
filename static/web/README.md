# XHS-Downloader Web 使用说明

## 启动网页版

### 方法 1：使用 WEB 模式启动（推荐）

```bash
python main.py WEB
```

启动后，服务器会在 `http://127.0.0.0:5556` 运行，请在浏览器中访问 `http://127.0.0.1:5556`

### 方法 2：使用 API 模式启动

```bash
python main.py API
```

服务器会在 `http://127.0.0.0:5556` 运行，请在浏览器中访问 `http://127.0.0.1:5556`

## 网页功能

### 主要功能

- 📥 **下载作品**：输入小红书作品链接，获取作品信息并下载无水印文件
- 📋 **剪贴板支持**：一键从剪贴板粘贴作品链接
- 🏷️ **指定图片**：对于图文作品，可以指定下载特定序号的图片
- ⏭️ **跳过已下载**：自动跳过已经下载过的作品
- 📝 **下载记录**：查看历史下载记录（保存在浏览器本地）

### 支持的链接格式

- `https://www.xiaohongshu.com/explore/作品ID?xsec_token=XXX`
- `https://www.xiaohongshu.com/discovery/item/作品ID?xsec_token=XXX`
- `https://www.xiaohongshu.com/user/profile/作者ID/作品ID?xsec_token=XXX`
- `https://xhslink.com/分享码`

### 快捷键

- `Enter`：开始下载
- `Esc`：清空输入框
- `Ctrl + V`：粘贴剪贴板内容（当聚焦在输入框时）

## API 接口

### 获取作品数据及下载地址

```
POST /xhs/detail
Content-Type: application/json

{
  "url": "小红书作品链接",
  "download": true,
  "index": [1, 3, 5],
  "cookie": "",
  "proxy": "",
  "skip": true
}
```

**参数说明**:

- `url`：小红书作品链接，必需
- `download`：是否下载作品文件，默认 false
- `index`：下载指定序号的图片文件，仅对图文作品生效，可选
- `cookie`：请求数据时使用的 Cookie，可选
- `proxy`：请求数据时使用的代理，可选
- `skip`：是否跳过存在下载记录的作品，默认 true

## 文件下载位置

下载的文件默认保存在：`./Volume/Download`

## 注意事项

1. 确保 Python 版本 >= 3.12
2. 首次运行会自动创建必要的目录结构
3. 如需修改端口，请修改 `source/application/app.py` 中的 `run_api_server` 方法
4. 服务器默认监听所有网络接口（127.0.0.0），配置仅信任本地访问（127.0.0.1），请注意端口开启与安全
