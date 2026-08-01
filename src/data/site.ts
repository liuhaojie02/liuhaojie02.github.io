export function withBasePath(path: string, base = import.meta.env.BASE_URL): string {
  const baseWithTrailingSlash = base.endsWith('/') ? base : `${base}/`;

  return `${baseWithTrailingSlash}${path.replace(/^\/+/, '')}`;
}

export function toBaseAwareAssetUrl(assetUrl: string, base = import.meta.env.BASE_URL): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(assetUrl) || assetUrl.startsWith('//')) return assetUrl;

  return withBasePath(assetUrl, base);
}

interface SiteAuthor {
  name: string;
  intro: string;
  bio: string;
  location?: string;
}

const author: SiteAuthor = {
  name: 'liuhaojie',
  intro: '你好，这里是 liuhaojie 的个人博客，记录技术实践、写作方法与持续完成的作品。',
  bio: '我在这里整理项目实践中学到的方法，也记录对技术、工具、写作与个人工作流的思考。',
};

export const site = {
  title: 'liuhaojie 的个人博客',
  description: '记录技术实践、日常思考与持续完成的作品。',
  author,
  navigation: [
    { label: '首页', href: withBasePath('') },
    { label: '文章', href: withBasePath('articles/') },
    { label: '随笔', href: withBasePath('notes/') },
    { label: '作品', href: withBasePath('projects/') },
    { label: '关于', href: withBasePath('about/') },
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/liuhaojie02' },
  ],
} as const;
