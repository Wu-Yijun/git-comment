# git-comment
在静态页面中利用 github 的 issues 功能形成评论区

### 进度
未完成

我准备在个人主页加入一个评论区的功能，但是由于我没有自己的服务器，因此只能依托于github的issue功能，将在issue下方的评论转变为blog中的评论。

### 要点

第一，为保证各方面安全，blog中保存的为字符串信息，在 github 中储存为 encodeURIComponent 编码，保证不会失真
第二，使用 Oauth 登录github账户以发表issue
第三，不需要登录即可查看评论。
第四，切换排序方式，包括按时间/引用次数/点赞次数/举报次数/用户活跃度进行升序/降序排列，且允许筛选（屏蔽，范围等）

### 进展

现在已经完成了一个评论条目的基本框架，可以自行管理条目。

接下来读取和更新 github issues.

#### 读取

这是比较简单的，下面两个请求即可获取到对应的数据 `https://api.github.com/repos/Wu-Yijun/git-comment/issues/2` 获取标题和题头内容，而其中的具体每一条回复在 `https://api.github.com/repos/Wu-Yijun/git-comment/issues/2/comments?per_page=10&page=1` 下可见。

考虑到github issue只能本人修改，因此不能在开头存储索引。方便部分下载以节约资源。

先尝试从 `https://api.github.com/repos/Wu-Yijun/git-comment/issues/2/comments` 中提取单纯的文本信息。

大致的结构如下
![alt text](images/image.png)

存储在body结构体里。

然后对它进行分析处理。