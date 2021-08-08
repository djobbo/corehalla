/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa')

/**
 * @type {import('next').NextConfig}
 */
const config = {
    webpack5: true,
    webpack: config => ({
        ...config,
        module: {
            ...config.module,
            rules: [
                ...(config?.module?.rules || []),
                {
                    test: '/.exe/',
                    type: 'asset/source',
                },
            ],
        },
    }),
}

module.exports =
    process.env.NODE_ENV === 'production'
        ? withPWA({
              ...config,
              pwa: {
                  dest: 'public',
              },
          })
        : config
