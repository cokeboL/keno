const db = require('./db')
const util = require('./util')
const config = require('../config')

const SAVE_INTERVAL = config.calcSaveInterval || 1000*60

module.exports = () => {
	let calcPaths = {
		'/': '/',
		'/index.html': '/',
		'/query/currIssueInfo': '/query/currIssueInfo',
		'/query/issueInfoByNo': '/query/issueInfoByNo',
		'/query/issueInfoByTimerange': '/query/issueInfoByTimerange',
	}

	let reqs = {}
	let reqips = {}
	let currDate = ''

	const reset = (nowDate) => {
		reqs = {
			ipCount: 0,
			reqCount: 0,
			pathCount: {}
		}
		reqips = {}
		currDate = nowDate || util.localDate()
	}
	const save = () => {
		db.saveCalc(currDate, JSON.stringify(reqs))
	}
	reset()
	
	new Promise((resolve, reject) => {
		db.getCalcData(resolve, reject)
	}).then(ret => {
		try {
			if (!!ret) {
				let data = JSON.parse(ret)
				reqs = data
				reqs.ipCount = 0
			}
			setInterval(save, SAVE_INTERVAL)
		} catch(e) {
			setInterval(save, SAVE_INTERVAL)
		}
	}).catch(err => {
		setInterval(save, SAVE_INTERVAL)
	})

	return (req, res, next) => {
		let nowDate = util.localDate()
		if (nowDate != currDate) {
			save()
			reset(nowDate)
		}

		let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		let path = req.path
		if (!reqips[ip]) {
			reqips[ip] = true
			reqs.ipCount++
		}
		reqs.reqCount++
		let realpath = calcPaths[path]
		if (!!realpath) {
			reqs.pathCount[realpath] = reqs.pathCount[realpath] || 0
			reqs.pathCount[realpath]++
		}
		next()
	}
}