import withCacheEffectivePage from 'next-cache-effective-pages'

export default function Test() {}

export async function getServerSideProps(ctxt) {
  return withCacheEffectivePage(async ({ res }) => {
    res.write('hello world this is txt')
    res.end()
  })({ ...ctxt, options: { secondsBeforeRevalidation: 60 * 10, allowedQueryParams: ['userId'] } })
}
