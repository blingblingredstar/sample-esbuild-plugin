const { StatusCodes } = require('http-status-codes');
const { Plugin } = require('esbuild');

/**
 * Esbuild plugin that can bundle modules on CDN
 * like 'https://cdn.skypack.dev/react'
 * @returns {Plugin}
 */
module.exports = () => ({
  name: 'esbuild:http',
  setup(build) {
    const https = require('https');
    const http = require('http');

    // 1. 拦截 CDN 请求
    build.onResolve({ filter: /^https?:\/\// }, (args) => ({
      path: args.path,
      namespace: 'http-url',
    }));

    // 2. 通过 fetch 请求加载 CDN 资源
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      const contents = await new Promise((resolve, reject) => {
        const fetch = (url) => {
          if (typeof url !== 'string') return reject();
          console.log(`Downloading: ${url}`);
          const lib = url.startsWith('https') ? https : http;
          const req = lib
            .get(url, (res) => {
              if (
                [
                  StatusCodes.MOVED_PERMANENTLY,
                  StatusCodes.MOVED_TEMPORARILY,
                  StatusCodes.TEMPORARY_REDIRECT,
                ].includes(res.statusCode)
              ) {
                fetch(new URL(res.headers.location, url).toString());
                req.abort();
                return;
              }

              if (res.statusCode === StatusCodes.OK) {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                return;
              }

              reject(new Error(`GET ${url} failed, statue ${res.statusCode}`));
            })
            .on('error', reject);
        };
        fetch(args.path);
      });
      return { contents };
    });

    // 拦截间接依赖的路径，并重写路径
    // tip: 间接依赖同样会被自动带上 `http-url`的 namespace
    build.onResolve({ filter: /.*/, namespace: 'http-url' }, (args) => ({
      // 重写路径
      path: new URL(args.path, args.importer).toString(),
      namespace: 'http-url',
    }));
  },
});
