const log = require('log4js').getLogger()
const express = require('express')
const db = require('./app/db')
const config = require('./config')
const router = require('./app/router')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')



log.level = 'debug'

db.initMysql(config.mysql)

let app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({    
  extended: true
}));
router.initRouters(app)

const server = app.listen(config.listenPort, function () {
  const host = server.address().address
  const port = server.address().port
  log.info(`running on http://${host}:${port}`)
})