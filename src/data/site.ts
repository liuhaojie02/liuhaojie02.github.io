export const site = {
  title: 'liuhaojie 的个人博客',
  description: '记录技术实践、日常思考与持续完成的作品。',
  author: {
    name: 'liuhaojie',
    intro: '你好，我是 liuhaojie，一名持续学习、写作和创造的开发者。',
    bio: '这里是个人简介占位文字。请替换为你的经历、关注方向，以及希望读者了解的信息。',
    location: '请替换为你的所在地',
  },
  navigation: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/articles/' },
    { label: '随笔', href: '/notes/' },
    { label: '作品', href: '/projects/' },
    { label: '关于', href: '/about/' },
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/liuhaojie' },
    // 请在发布前替换成你的真实邮箱。
    { label: '邮箱', href: 'mailto:your-email@example.com' },
  ],
} as const;
