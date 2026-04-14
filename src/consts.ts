// 在此文件中放置全站的全局数据
// 你可以在站点的任何地方通过 `import` 引入这些数据

import type { AnalyticsConfig } from "./types/analyticsTypes"

type NavItem = {
  name: string;
  iconClass: string;
  href: string;
  target?: '_self' | '_blank';
  children?: NavItem[];
};

type SocialLink = {
  icon: string;
  name: string;
  outlink: string;
};

type FriendshipLink = {
  name: string;
  url: string;
  avatar?: string;
  description: string;
};

type CommentConfig = {
  enable: boolean;
  type: 'waline' | 'giscus';
  walineConfig: {
    serverUrl: string;
    lang: string;
    pageSize: number;
    wordLimit: string;
    count: number;
    pageview: boolean;
    reaction: boolean;
    requiredMeta: string[];
    whiteList: string[];
  };
  giscusConfig: Record<string, string>;
};

/**
 * title {string} 网站标题
 * favicon {string} 网站图标地址
 * description {string} 网站描述
 * author {string} 作者
 * avatar {string} 个人头像
 * motto {string} 个性签名
 * url {string} 网站访问地址
 * baseUrl {string} 使用 GitHub Pages 时需要填写仓库名，以 / 开头，例如 /repo_name
 * recentBlogSize {number} 侧边栏显示的最新文章数量
 * archivePageSize {number} 归档页每页显示的文章数量
 * postPageSize {number} 博客页每页显示的文章数量
 * feedPageSize {number} 动态流页每页显示的文章数量
 * beian {string} 备案号（中国大陆）
 * asideTagsMaxSize {number}
 *    0：禁用
 *    >0：侧边栏最多显示多少个标签
 *    所有标签会在 /tags 页面中完整展示
 * mobileMenuCategoryMaxSize {number}
 *    0：移动端个人侧栏显示全部分类
 *    >0：最多显示多少个分类，并保留“全部分类”入口
 * mobileMenuTagMaxSize {number}
 *    0：移动端个人侧栏显示全部标签
 *    >0：最多显示多少个标签，并保留“全部标签”入口
 */
export const site = {
  title: 'W Blog', // 名字
  favicon: '/images/favicon.svg', // 站点符号
  description: '欢迎来到我的博客!',
  author: "W", // 必填
  avatar: '/images/avatar.webp', // 头像
  url: 'https://wdxzf.github.io', // 站点链接
  baseUrl: '', // 使用 GitHub Pages 时填写，例如 '/astro-blog'
  motto: '恰同学少年，风华正茂',
  recentBlogSize: 5,
  archivePageSize: 25,
  postPageSize: 10,
  feedPageSize: 20,
  beian: '',
  asideTagsMaxSize: 0,
  mobileMenuCategoryMaxSize: 6,
  mobileMenuTagMaxSize: 10,
}

/**
 * busuanzi {boolean} 访问统计 https://busuanzi.ibruce.info/
 * lang {string} 默认网站语言
 * codeFoldingStartLines {number} 超过多少行代码默认折叠
 * search.includeContent {boolean} 搜索索引是否包含全文
 * ga {string|false} Google Analytics ID
 * memosUrl {string} memos 服务地址
 * memosUsername {string} memos 登录用户名
 * memosPageSize {number} 每页 memos 数量，默认 10
 */
export const config = {
  lang: 'zh-cn', // en | zh-cn | zh-Hant | cs
  codeFoldingStartLines: 16, // 需要重新运行项目才能生效
  search: {
    includeContent: false,
  },

  // memos 配置
  memosUrl: '', // https://xxxx.xxx.xx
  memosUsername: '', // 登录名
  memosPageSize: 10, // 数量
}

const giscusLangMap: Record<string, string> = {
  en: 'en',
  'zh-cn': 'zh-CN',
  'zh-Hant': 'zh-TW',
  cs: 'cs',
};
const giscusLang = giscusLangMap[config.lang] || 'en';

/**
 * 导航菜单
 * name {string} 显示名称
 * iconClass {string} 图标样式
 * href {string} 链接地址
 * target {string} 可选 "_self|_blank" 在当前窗口或新窗口打开
 */
export const categories: NavItem[] = [
  {
    name: "博客",
    iconClass: "ri-draft-line",
    href: "/blog/1",
  },
  {
    name: "动态",
    iconClass: "ri-lightbulb-flash-line",
    href: "/feed/1",
  },
  // {
  //   name: "Memos",
  //   iconClass: "ri-quill-pen-line",
  //   href: "/memos",
  // },
  {
    name: "归档",
    iconClass: "ri-archive-line",
    href: "/archive/1",
  },
  {
    name: "留言",
    iconClass: "ri-chat-1-line",
    href: "/message",
  },
  {
    name: "搜索",
    iconClass: "ri-search-line",
    href: "/search",
  },
  {
    name: "更多",
    iconClass: "ri-more-fill",
    href: "javascript:void(0);",
    children: [
      {
        name: '关于',
        iconClass: 'ri-information-line',
        href: '/about',
      },
      {
        name: '友链',
        iconClass: 'ri-user-5-line',
        href: '/friends',
        target: '_self',
      },
    ]
  }
]

/**
 * 个人社交链接
 */
export const infoLinks: SocialLink[] = [
  {
    icon: 'ri-telegram-fill',
    name: 'telegram',
    outlink: '',
  },
  {
    icon: 'ri-wechat-fill',
    name: 'wechat',
    outlink: `${site.baseUrl || ''}/images/contact/wechat.webp`,
  },
  {
    icon: 'ri-qq-fill',
    name: 'QQ',
    outlink: `${site.baseUrl || ''}/images/contact/qq.webp`,
  },
  {
    icon: 'ri-bilibili-fill',
    name: 'bilibili',
    outlink: 'https://space.bilibili.com/1751089388',
  },
  {
    icon: 'ri-github-fill',
    name: 'github',
    outlink: 'https://github.com/wdxzf',
  },
  {
    icon: 'ri-rss-fill',
    name: 'rss',
    outlink: `${site.url}${site.baseUrl}/rss.xml`,
  }
]

/**
 * 打赏配置
 * enable {boolean} 是否启用
 * tip {string} 提示文字
 * wechatQRCode 微信收款码（放在 public 目录）
 * alipayQRCode 支付宝收款码（放在 public 目录）
 * paypalUrl {string} PayPal 地址
 */
export const donate = {
  enable: false,
  tip: "Thanks for the coffee !!!☕",
  wechatQRCode: "/WeChatQR.png",
  alipayQRCode: "/AliPayQR.png",
  paypalUrl: "https://paypal.me/xxxxxxxxxx",
}

/**
 * 友情链接页面
 * name {string} 名称
 * url {string} 链接
 * avatar {string} 头像
 * description {string} 描述
 */
export const friendshipLinks: FriendshipLink[] =
  [
    // {
    //   name: "Cirry's Blog",
    //   url: 'https://cirry.cn',
    //   avatar: "https://cirry.cn/avatar.png",
    //   description: '前端开发的日常'
    // },
  ]

/**
 * 评论功能
 * enable {boolean} 是否启用
 * type {string} 必填 waline | giscus
 * walineConfig.serverUrl {string} 服务端地址
 * walineConfig.lang {string} 语言
 * walineConfig.pageSize {number} 每页评论数
 * walineConfig.wordLimit {number} 评论字数限制，0 表示不限制
 * walineConfig.count {number} 最近评论数量
 * walineConfig.pageview {boolean} 是否显示阅读量和评论数
 * walineConfig.reaction {string | string[]} 是否启用表情互动
 * walineConfig.requiredMeta {string[]} 必填字段
 * walineConfig.whiteList {string[]} 不显示表情的页面
 */
export const comment: CommentConfig = {
  enable: true,
  type: 'giscus', // waline | giscus
  walineConfig: {
    serverUrl: "",
    lang: 'en',
    pageSize: 20,
    wordLimit: '',
    count: 5,
    pageview: true,
    reaction: true,
    requiredMeta: ["nick", "mail"],
    whiteList: ['/message/', '/friends/'],
  },

  // giscus 配置
  giscusConfig: {
    'data-repo': 'wdxzf/blog-comments',
    'data-repo-id': 'R_kgDORf47fw',
    'data-category': 'Announcements',
    'data-category-id': 'DIC_kwDORf47f84C3zZC',
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': 'preferred_color_scheme',
    'data-lang': giscusLang,
    'data-loading': 'lazy',
    'crossorigin': 'anonymous',
  }
}

/**
 * 统计分析配置
 *
 * 本文件统一管理 Umami 与 Google Analytics 的配置
 */
export const analytics: AnalyticsConfig = {
  enable: false,
  umamiConfig: {
    enable: false,
    id: "",
    url: ""
  },
  gaConfig: {
    enable: false,
    id: ""
  },
  busuanzi: false,
};
