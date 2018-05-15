const log = require('log4js').getLogger()
const mysql = require('mysql')
const spider = require('../spider')
const config = require('../config')

const SPIDER_MAX_TRY_TIMES = config.spiderMaxTryTimes || 0

let msqlConnection = null

let _doing = {}

const getIssueInfo = (info) => {
	let key = info.code + info.issueno
	if (_doing[key]) {
		return
	}

	_doing[key] = true
	let trytimes = 0
	info = Object.assign({}, info)
	const get = () => {
		info.awardtime = new Date(info.awardtime)
		let getter = spider.geter(info.code)
		if (!!getter && !!getter.get) {
			trytimes++
			if (SPIDER_MAX_TRY_TIMES > 0 && trytimes > SPIDER_MAX_TRY_TIMES) {
				return
			}
			new Promise((resolve, reject) => {
				getter.get(info, resolve, reject)
			}).then(ret => {
				if (!ret.error) {
					ret.trytimes = trytimes
					updateIssueInfo(ret)
					log.info(`getIssueInfo success: {trytimes: ${ret.trytimes}, code: ${ret.code}, issueno: ${ret.issueno}, originissueno: ${ret.originissueno}, result: ${ret.result}`);
				} else {
					log.info(`getIssueInfo failed: {error: ${ret.error}, trytimes: ${trytimes}, code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}\nretry...`)
					get()
				}
			}).catch(err => {
				log.info(`getIssueInfo failed: {error: ${err}, trytimes: ${trytimes}, code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}\nretry...`)
				get()
			})
		}
	}
	let now = new Date().getTime()
	if (now < info.awardtime) {
		setTimeout(() => {
			get()
		}, (info.awardtime-now))
	} else {
		get()
	}
}

const updateUngetIssues = () => {
	log.info('start updateUngetIssues()...')
	if (!!config.test && !!config.test.nodb) {
		getIssueInfo(info)
		return
	}

	let sqlstr = 'select id,code,issueno,originissueno,awardtime,result,flag from issue where flag=0';

	msqlConnection.query(sqlstr, (err, result) => {
        if(!!err) {
			log.error('[updateUngetIssues select error] - ', err.message);
			return;
        }
		//getIssueInfo(info)
		for (let i=0; i<result.length; i++) {
			let row = result[i]
			let info = {
				id: row.id,
				code: row.code,
				issueno: row.issueno,
				originissueno: row.originissueno,
				awardtime: row.awardtime,
				result: row.result,
				flag: row.flag,
			}
			getIssueInfo(info)
		}
	});
}
module.exports.initMysql = (info) => {
	if (!!config.test && !!config.test.nodb) {
		return
	}

	info.port = info.port || 3306
	msqlConnection = mysql.createConnection(info);
 
	msqlConnection.connect((err) => {
		if (!!err) {
			log.error(`mysql connect to ${info.host}:${info.port} failed: ${err}`)
			throw(err)
		}
		updateUngetIssues()
	});
}

const updateIssueInfo = (info) => {
	if (!!config.test && !!config.test.nodb) {
		return
	}

	let sqlstr = `update issue set originissueno=?,result=?,flag=? where code=? and issueno=?`
	let params = [info.originissueno, info.result, 1, info.code, info.issueno];

	msqlConnection.query(sqlstr, params, (err, result) => {
        if(!!err) {
			log.info('[update issue error] - ', err.message);
			return;
        }
        delete(_doing[key])
	});
}

module.exports.insertIssueInfo = (info) => {
	if (!!config.test && !!config.test.nodb) {
		getIssueInfo(info)
		return
	}

	let sqlstr = 'insert into issue(code,issueno,originissueno,awardtime,result,flag) values(?,?,?,?,?,?)';
	let params = [info.code, info.issueno, "", info.awardtime, info.result, 0];

	msqlConnection.query(sqlstr, params, (err, result) => {
        if(!!err) {
			log.error('[insert issue error] - ', err.message);
			return;
        }
		log.info(`insert success: {id: ${result.insertId}, code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}, result: ${info.result}, flag: ${info.flag}`);        
		info.id = result.insertId
		getIssueInfo(info)
	});
}
