import { defineConfig } from 'tinacms';

const branch =
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.CF_PAGES_BRANCH ||
  'main';

const slugifyTitle = (values: Record<string, any>) => {
  const raw = values?.title || 'untitled';
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'docs',
        label: 'Book Content',
        path: 'src/content/docs',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: slugifyTitle,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'SEO Description',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'datetime',
            name: 'pubDate',
            label: 'Publish Date',
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'number',
            name: 'weight',
            label: 'Order Weight',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [],
          },
        ],
      },
    ],
  },
});
