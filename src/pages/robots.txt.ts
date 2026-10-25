// robots.txt, generated from the NOINDEX flag in src/config.ts.
import type { APIRoute } from 'astro';
import { NOINDEX } from '../config';

export const GET: APIRoute = () =>
  new Response(NOINDEX ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
