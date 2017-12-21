const app = require('./server/dist/server')
const port = 3000

app.listen(port)
console.log(`listening on http://localhost:${port}`)
