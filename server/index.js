const Bundler = require('parcel-bundler')
const app = require('express')()
const arg = process.argv[2] || '*'

const bundler = new Bundler(`./src/${arg}.pug`, {
  sourceMaps: false,
  cache: false
})

app.use(bundler.middleware())
app.listen(1234)

console.log('Running at Port 1234')
