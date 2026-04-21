# 小红书下载工具：图文、视频等都可以下载

- 下载后内容保存在Volume/Download 里面
- 无需登录小红书

原因很简单：小红书在 HTML 页面中直接嵌入了作品数据（服务端渲染），不需要调用任何需要登录的接口。
技术原理
1. 抓取公开 HTML 页面
# source/application/request.py
response = await self.client.get(url, headers=headers)
# headers 只有: User-Agent + Referer，没有登录 Cookie
2. 从 HTML <script> 中提取 window.__INITIAL_STATE__
# source/expansion/converter.py
scripts = html_tree.xpath("//script/text()")
# 找到: window.__INITIAL_STATE__= { ...noteData: { ... } }
# 用 YAML 解析成 dict
这个 __INITIAL_STATE__ 是小红书服务端直接渲染到 HTML 里的，包含了笔记的：
- 作者信息
- 标题、描述
- 点赞/收藏/评论数
- 图片/视频直链下载地址
3. 从中提取媒体直链
# source/application/video.py / image.py
# 从 __INITIAL_STATE__ 里取出 media_url
# 这些直链本身就是公开可访问的 CDN 链接