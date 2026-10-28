import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getCatalogue, categoryHref } from '../lib/catalogue';
import { canonicalUrl } from '../lib/urls';

/**
 * /llms.txt — a Markdown index of the site for language models (llmstxt.org).
 *
 * GENERATED FROM THE CATALOGUE, like the sitemap, the nav and the footer, so a
 * product that gains or loses its page changes this file on the same build and
 * the links in it always resolve. Required shape: one H1, a blockquote summary,
 * then H2 sections of `- [name](url): note` links.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('llms.txt: `site` must be set in astro.config.mjs.');

  const url = (path: string): string => canonicalUrl(path, site);
  const catalogue = await getCatalogue();

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
    `> ${SITE.description}`,
    '',
    ...sections.flatMap((section) => [section, '']),
    '## Company',
    '',
    `- [All products](${url('/products')}): The full range across cold chain, custom boxes and pharmacy formats`,
    `- [About](${url('/about')}): Our background in cold chain logistics`,
    `- [Contact](${url('/contact')}): Request a quote or samples, or email ${SITE.email}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
