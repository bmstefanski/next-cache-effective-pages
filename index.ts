const { parse: parseQuery, stringify } = require('querystring')
const url = require('url')
import { NextApiRequest, NextApiResponse } from 'next'

type Handler = (ctxt: { req: NextApiRequest; res: NextApiResponse; query: Record<string, string> }) => Promise<any>
type Args = { res: NextApiResponse; req: NextApiRequest; options?: { secondsBeforeRevalidation?: number; allowedQueryParams?: string[] } }
type QueryParams = Record<string, string>

export default function withCacheEffectivePage(handler: Handler) {
  return ({ req, res, options = { secondsBeforeRevalidation: 60 * 30 } }: Args) => {
    const queryParams = parseQuery(url.parse(req.url).query)
    const allowedQueryParams = pick({ ...queryParams }, options.allowedQueryParams || [])

    const hasForbiddenQueryParams = Object.values(queryParams).length > 0
    const includesAllowedQueryParam = Object.values(allowedQueryParams).length > 0

    // res.setHeader('Cache-Control', `s-maxage=${options.secondsBeforeRevalidation}, stale-while-revalidate`)
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Content-Type', 'text/xml')

    if (includesAllowedQueryParam) {
      const urlWithAllowedQueryParams = makeUrlWithAllowedQueryParams(req.url, allowedQueryParams)
      const hasUrlChanged = urlWithAllowedQueryParams !== req.url
      if (hasUrlChanged) {
        return redirect(urlWithAllowedQueryParams)
      }
    } else if (hasForbiddenQueryParams) {
      return redirect(makeQuerylessUrl(req.url))
    }

    return handler({ req, res, query: queryParams }).then(() => ({ props: {} }))
  }
}

function pick<T>(obj: T, props: (keyof T)[]) {
  const picked = {} as Pick<T, keyof T>
  for (let prop of props) {
    if (obj[prop]) {
      picked[prop] = obj[prop]
    }
  }
  return picked
}

function makeUrlWithAllowedQueryParams(url: string, queryParams: QueryParams) {
  return makeQuerylessUrl(url) + '?' + stringify(queryParams)
}

function makeQuerylessUrl(url: string) {
  return url?.substr(0, url.indexOf('?'))
}

function redirect(url: string) {
  return {
    redirect: {
      destination: url,
      permanent: true,
    },
  }
}
