const log = require('log4js').getLogger()
const tool = require('./tool')
const config = require('../config')
// const multipart = require('connect-multiparty');
// const multipartMiddleware = multipart();
var crypto = require('crypto');

const response = (res, result) => {
	res.writeHead(200, {'Content-Type': 'text/json'})
    res.write(JSON.stringify(result))
    res.end();
}

const login =  (req, res) => {
	if (!req.body.username) {
		response(res, {error:'invalid username'})
		return
	}
	if (!req.body.password) {
		response(res, {error:'invalid password'})
		return
	}
	if (req.body.username != config.admin.username) {
		response(res, {error:'invalid username'})
		return
	}

	let md5 = crypto.createHash('md5')
	let hash = md5.update(config.admin.password).digest('hex')
	if (hash != req.body.password) {
		response(res, {error:'invalid password'})
		return
	}

	res.cookie('username', req.body.username, { maxAge: 900000, httpOnly: true })
	res.cookie('password', req.body.password, { maxAge: 900000, httpOnly: true })

    response(res, {error:null});
}

const addCode =  (req, res) => {
	let code = req.body.code
	let begintime = req.body.begintime
	let endtime = req.body.endtime
	let spantime = parseInt(req.body.spantime)
	let timeoffset = parseInt(req.body.timeoffset) || 0

	if (!code) {
		response(res, {error:'invalid code'})
		return
	}
	if (!begintime) {
	    response(res, {error:'invalid begintime'})
	    return
	}
	if (!endtime) {
		response(res, {error:'invalid endtime'})
		return
	}
	if (!spantime) {
		response(res, {error:'invalid spantime'})
		return
	}
	let md5 = crypto.createHash('md5')
	let hash = md5.update(config.admin.password).digest('hex')
	if (hash != req.body.hash) {
		response(res, {error:'invalid hash'})
		return
	}
	
	//log.info('--- addCode: ', JSON.stringify(req.body))
	let error = tool.generateIssueNo(code, begintime, endtime, spantime, timeoffset)
	response(res, {error})
}

const currInfo =  (req, res) => {

}

const issueInfoByNo =  (req, res) => {

}

const issueInfoByTimerange =  (req, res) => {

}

module.exports.initRouters =  (app) => {
	//admin tool
	app.post('/admin/login', login)
	app.post('/admin/addCode', addCode)

	//app query
	app.post('/query/currInfo', currInfo)
	app.post('/query/issueInfoByNo', issueInfoByNo)
	app.post('/query/issueInfoByTimerange', issueInfoByTimerange)
}