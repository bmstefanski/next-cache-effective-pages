import withCacheEffectivePage from '../../index'

export default function Test() {}

export async function getServerSideProps(ctxt) {
  return withCacheEffectivePage(async ({ res }) => {
    res.write('hello world this is txt')
    res.end()
  })(ctxt)
}
