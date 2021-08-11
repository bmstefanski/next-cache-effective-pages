<div align="center">
  <h1>Next.js cache-effective pages</h1>
  <br />
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/next-cache-effective-pages"><img alt="npm version badge" src="https://img.shields.io/npm/v/next-cache-effective-pages"></a>  
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/next-cache-effective-pages">
  <img alt="license badge" src="https://img.shields.io/npm/l/next-cache-effective-pages">
</div>

<br />

## What it does

Let's say you want to re-generate a static file (e.g. public/sitemap.xml) every 15 minutes.
The first solution that comes to mind is doing this at build time and it's great and simple, but.... it wouldn't work for mid and big-scale applications (considering that you're rebuilding your app every time there's a change in CMS).
And this is where `next-cache-effective-pages` comes into the picture.  
It makes it easier to change your static file into a regeneratable page without you worrying about effective caching and bandwidth attacks.

## Features

- [x] 🙉 Effective caching
- [x] 🚚 Bandwidth attack proofed
- [x] 🤠 Simple and flexible API
- [x] 🐄 No dependencies

## Installation

```
$ npm i --save next-cache-effective-pages

# or

$ yarn add next-cache-effective-pages
```

## Example use cases

### Sitemap

```typescript
// pages/sitemap.xml.js

export default function Sitemap() {}

export async function getServerSideProps(ctxt) {
  return withCacheEffectivePage(async ({ res }) => {
    res.setHeader('Content-Type', 'text/xml')
    res.write(await getAllPosts())
    res.end()
  })({ ...ctxt, options: { secondsBeforeRevalidation: 60 * 15 } }) // Re-generate the page every 15 minutes
}
```

### Sitemap with pagination

```typescript
// pages/sitemap.xml.js

export default function Sitemap() {}

export async function getServerSideProps(ctxt) {
  return withCacheEffectivePage(async ({ res, query }) => {
    const maxPages = await getMaxPages()

    if (query.page > maxPages) {
      // redirect to last
    }

    res.setHeader('Content-Type', 'text/xml')
    res.write(await getPostsByPage(query.page))
    res.end()
  })({ ...ctxt, options: { secondsBeforeRevalidation: 60 * 15, allowedQueryParams: ['page'] } }) // You can whitelist a query parameter
}
```

## Options

```typescript
{
  secondsBeforeRevalidation?: number; # Self-descriptive
  allowedQueryParams?: string[]; # These won't be removed from the url while redirecting
}
```

## FAQ

### How does it prevent bandwidth attacks?

The easiest way to attack an app's bandwidth quota is by adding the current timestamp to a request, like so:

```
$ curl -s -I -X GET "https://bstefanski.com/sitemap.xml?$(date +%s)"
```

If your site is server-side rendered it will probably miss the cached entry and create a new one.
This library prevents from returning an uncached big chunk of data by redirecting to a query-less url (`https://bstefanski.com/sitemap.xml?43534543=0` -> `https://bstefanski.com/sitemap.xml`)

### How are you caching this?

By setting `Cache-Control` header to `s-maxage=${secondsBeforeRevalidation}, stale-while-revalidate`.

> `stale-while-revalidate` - Indicates the client will accept a stale response, while asynchronously checking in the background for a fresh one.
