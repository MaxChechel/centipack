import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getCatalogue, categoryHref } from '../lib/catalogue';
import { getPages, getSite } from '../lib/site';
import { canonicalUrl } from '../lib/urls';

/**
 * /llms.txt — a Markdown index of the site for language models (llmstxt.org).
 *
 * GENERATED FROM THE CATALOGUE, like the sitemap, the nav and the footer, so a
 * product that gains or loses its page changes this file on the same build and
 * the links in it always resolve. Required shape: one H1, a blockquote summary,
 * then H2 sections of `- [name](url): note` links.
 *
 * THE COMPANY SECTION IS THE PAGES COLLECTION (WORKLOG 183): every page with a
 * `listing`, in its `order`. A page the client adds
 * is listed under its label and description unless its entry says otherwise,
 * and the notes are content, so nothing here can drift from the site.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('llms.txt: `site` must be set in astro.config.mjs.');

  const url = (path: string): string => canonicalUrl(path, site);
  const [catalogue, siteEntry, pages] = await Promise.all([getCatalogue(), getSite(), getPages()]);
  const listed = [];
  for (const page of pages) {
    if (page.listing) listed.push({ ...page.listing, path: page.path });
  }
  listed.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  const sections = catalogue.map(({ category, products }) => {
    const lines = [
      `## ${category.title}`,
      '',
      `- [${category.title}](${url(categoryHref(category.slug))}): ${category.summary}`,
      ...products
        .filter((product) => product.href)
        .map((product) => `- [${product.title}](${url(product.href!)}): ${product.summary}`),
    ];
    return lines.join('\n');
  });

  const body = [
    `# ${SITE.name}`,
    '',
    `> ${siteEntry.description}`,
    '',
    ...sections.flatMap((section) => [section, '']),
    '## Company',
    '',
    ...listed.map((item) => `- [${item.label}](${url(item.path)}): ${item.note}`),
    '',
  ].join('\n');

  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
