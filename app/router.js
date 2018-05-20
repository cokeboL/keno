const log = require('log4js').getLogger()
const db = require('./db')
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

const addIssues =  (req, res) => {
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
	if (!spantime || spantime <= 0) {
		response(res, {error:'invalid spantime'})
		return
	}
	spantime -= spantime % 10
	let md5 = crypto.createHash('md5')
	let hash = md5.update(config.admin.password).digest('hex')
	if (hash != req.body.hash) {
		response(res, {error:'invalid hash'})
		return
	}
	
	log.info('addIssues: ', JSON.stringify(req.body))
	let error = tool.generateIssueNo(code, begintime, endtime, spantime, 'add', timeoffset)
	response(res, {error})
}

const deleIssues =  (req, res) => {
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
	if (!spantime || spantime <= 0) {
		response(res, {error:'invalid spantime'})
		return
	}
	spantime -= spantime % 10
	let md5 = crypto.createHash('md5')
	let hash = md5.update(config.admin.password).digest('hex')
	if (hash != req.body.hash) {
		response(res, {error:'invalid hash'})
		return
	}
	
	log.info('deleIssues: ', JSON.stringify(req.body))
	let error = tool.generateIssueNo(code, begintime, endtime, spantime, 'delete', timeoffset)
	response(res, {error})
}

const currIssueInfo =  (req, res) => {
	let code = req.query.code
	if (!code) {
		response(res, {error:'invalid code'})
		return
	}

	new Promise((resolve, reject) => {
		db.queryCurrIssueInfo(code, resolve, reject)
	}).then(ret => {
		response(res, ret)
	}).catch(err => {
		response(res, {error:err})
	})
}

const issueInfoByNo =  (req, res) => {
	let code = req.query.code
	if (!code) {
		response(res, {error:'invalid code'})
		return
	}
	let issueno = req.query.issueno
	if (!issueno) {
		response(res, {error:'invalid issueno'})
		return
	}

	new Promise((resolve, reject) => {
		db.queryIssueInfoByIssueno(code, issueno, resolve, reject)
	}).then(ret => {
		response(res, ret)
	}).catch(err => {
		response(res, {error:err})
	})
}

const issueInfo =  (req, res) => {
	console.log('router issueInfo():')
	let code = req.query.code
	if (!code) {
		response(res, {error:'invalid code'})
		return
	}
	let issueno = req.query.issueno
	let begintime = req.query.begintime
	let endtime = req.query.endtime
	// let page = req.query.page || 1
	// let num = req.query.num || 50
	
	if (!issueno) {
		if (!begintime) {
			response(res, {error:'invalid begintime'})
			return
		}
		if (!endtime) {
			response(res, {error:'invalid endtime'})
			return
		}
	} else {
		begintime = new Date(begintime).getTime()
		if (isNaN(begintime)) {
			response(res, {error:'invalid begintime'})
			return
		}
		endtime = new Date(endtime).getTime()
		if (isNaN(endtime)) {
			response(res, {error:'invalid endtime'})
			return
		}
		if (endtime - begintime > (3600*24*2*1000)) {
			response(res, {error:'invalid timerange'})
			return
		}
	}

	new Promise((resolve, reject) => {
		db.queryIssuesInfo(code, issueno, begintime, endtime, page, num, resolve, reject)
		console.log('router issueInfo:', code, issueno, begintime, endtime, page, num, resolve, reject)
	}).then(ret => {
		response(res, ret)
	}).catch(err => {
		response(res, {error:err})
	})
}

const calcInfoByDate =  (req, res) => {
	let date = req.query.date
	if (!date) {
		response(res, {error:'invalid date'})
		return
	}

	new Promise((resolve, reject) => {
		db.queryCalcInfoByDate(date, resolve, reject)
	}).then(ret => {
		response(res, ret)
	}).catch(err => {
		response(res, {error:err})
	})
}

const calcInfoByTimerange =  (req, res) => {
	let begindate = req.query.begindate
	if (!begindate) {
		response(res, {error:'invalid begindate'})
		return
	}
	let enddate = req.query.enddate
	if (!enddate) {
		response(res, {error:'invalid enddate'})
		return
	}

	new Promise((resolve, reject) => {
		db.queryCalcInfoByTimerange(begindate, enddate, resolve, reject)
	}).then(ret => {
		response(res, ret)
	}).catch(err => {
		response(res, {error:err})
	})
}

module.exports.initRouters =  (app) => {
	//admin tool
	app.post('/admin/login', login)
	app.post('/admin/addIssues', addIssues)
	app.post('/admin/deleIssues', deleIssues)

	//app query
	app.get('/query/currIssueInfo', currIssueInfo)
	// app.get('/query/issueInfoByNo', issueInfoByNo)
	app.get('/query/issueInfo', issueInfo)

	//calc query
	app.get('/query/calcInfoByDate', calcInfoByDate)
	app.get('/query/calcInfoByTimerange', calcInfoByTimerange)
}