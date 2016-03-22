# auth

# scripts

```
"scripts": {
    "build":"export NODE_ENV=production && webpack --config client/webpack.config.js --progress --hide-modules",
    "predev": "webpack-dev-server --inline --hot --quiet --port 8082 --config client/webpack.config.js --content-base http://0.0.0.0:3000/&",
    "dev": "export NODE_ENV=dev && pm2-dev start ecosystem.json",
  },
```
## npm run dev

## npm run build
