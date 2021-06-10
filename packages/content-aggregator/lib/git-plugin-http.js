'use strict'

const get = require('simple-get')

function distillResponse (res) {
  const { url, method, statusCode, statusMessage, headers } = res
  return { url, method, statusCode, statusMessage, headers, body: res }
}

async function mergeBuffers (data) {
  if (!Array.isArray(data)) return data
  if (data.length === 1 && data[0] instanceof Buffer) return data[0]
  const buffers = []
  let offset = 0
  let size = 0
  for await (const chunk of data) {
    buffers.push(chunk)
    size += chunk.byteLength
  }
  data = new Uint8Array(size)
  for (const buffer of buffers) {
    data.set(buffer, offset)
    offset += buffer.byteLength
  }
  return Buffer.from(data.buffer)
}

module.exports = ({ httpProxy, httpsProxy, noProxy }) => {
  if (httpsProxy || httpProxy) {
    const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')
    const shouldProxy = require('should-proxy')
    return {
      async request ({ url, method, headers, body }) {
        body = await mergeBuffers(body)
        const proxy = url.startsWith('https:')
          ? { ProxyAgent: HttpsProxyAgent, url: httpsProxy }
          : { ProxyAgent: HttpProxyAgent, url: httpProxy }
        let agent
        if (proxy.url && shouldProxy(url, { no_proxy: noProxy })) {
          // see https://github.com/delvedor/hpagent/issues/18
          const { protocol, hostname, port, username, password } = new URL(proxy.url)
          const proxyUrl = { protocol, hostname, port, username: username || null, password: password || null }
          agent = new proxy.ProxyAgent({ proxy: proxyUrl })
        }
        return new Promise((resolve, reject) =>
          get({ url, method, agent, headers, body }, (err, res) => (err ? reject(err) : resolve(distillResponse(res))))
        )
      },
    }
  } else {
    return {
      async request ({ url, method, headers, body }) {
        body = await mergeBuffers(body)
        return new Promise((resolve, reject) =>
          get({ url, method, headers, body }, (err, res) => (err ? reject(err) : resolve(distillResponse(res))))
        )
      },
    }
  }
}
