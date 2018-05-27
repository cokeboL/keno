const log = require('log4js').getLogger()
const util = require('./util')
const mysql = require('mysql')
const spider = require('../spider')
const config = require('../config')

const SPIDER_MAX_TRY_TIMES = config.spiderMaxTryTimes || 0

let mysqlPool = null

let _doing = {}

let _calcDate = ''

const getIssueInfo = (info) => {
	let key = info.code + info.issueno
	if (_doing[key]) {
		return
	}

	_doing[key] = true
	let trytimes = 0
	info = Object.assign({}, info)
	const get = () => {
		setTimeout(() => {
			if (!_doing[key]) {
				return
			}
			info.awardtime = new Date(info.awardtime)
			let getter = spider.geter(info.code)
			if (!!getter && !!getter.get) {
				trytimes++
				if (SPIDER_MAX_TRY_TIMES > 0 && trytimes > SPIDER_MAX_TRY_TIMES) {
					delete(_doing[key])
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
		}, parseInt(Math.random()*500)+5000)
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
		return
	}

	let sqlstr = 'select id,code,issueno,originissueno,awardtime,result,flag from issue where flag=0';

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, (err, result) => {
				connection.release()
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
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}
module.exports.getCalcData = (resolve, reject) => {
	log.info('getCalcData()')
	if (!!config.test && !!config.test.nodb) {
		return
	}

	let sqlstr = 'select a.calcdate calcdate, a.data data from calculate a, (select max(calcdate) calcdate from calculate) b where a.calcdate=b.calcdate'

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, (err, result) => {
				connection.release()
		        if(!!err) {
					log.error('[getCalcData select error] - ', err.message);
					log.info('start current calcDate: ', _calcDate)
					return;
		        }
		        if (result.length <= 0) {
		        	log.info('start current calcDate: ', _calcDate)
		        	resolve()
		        	return
		        }
		        let row = result[0]
				_calcDate = row.calcdate || _calcDate
				resolve(row.data)
				log.info('start current calcDate: ', _calcDate)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}
module.exports.initMysql = (info) => {
	if (!!config.test && !!config.test.nodb) {
		return
	}

	info.host = info.host || 'localhost'
	info.port = info.port || 3306
	//msqlConnection = mysql.createConnection(info);
 	mysqlPool = mysql.createPool(info)
 	// 	mysqlPool.on('connection', (connection) => {
	// 	updateUngetIssues()
	// })

	// mysqlPool.getConnection((err, connection) => {
	// 	if (!!err) {
	// 		throw err
	// 	}
		updateUngetIssues()
		//getCalcDate()
	// })
	// msqlConnection.connect((err) => {
	// 	if (!!err) {
	// 		log.error(`mysql connect to ${info.host}:${info.port} failed: ${err}`)
	// 		throw(err)
	// 	}
	// 	updateUngetIssues()
	// })
}

const updateIssueInfo = (info) => {
	let key = info.code + info.issueno
	delete(_doing[key])

	if (!!config.test && !!config.test.nodb) {
		return
	}

	let sqlstr = `update issue set originissueno=?,result=?,flag=? where code=? and issueno=?`
	let params = [''+info.originissueno, ''+info.result, 1, info.code, info.issueno]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result) => {
				connection.release()
		        if(!!err) {
					log.info('[update issue error] - ', err.message)
					return
		        }
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}

module.exports.insertIssueInfo = (info) => {
	log.info(`insertIssueInfo: {code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}`)
	if (!!config.test && !!config.test.nodb) {
		getIssueInfo(info)
		return
	}

	let sqlstr = 'insert into issue(code,issueno,originissueno,awardtime,result,flag) values(?,?,?,?,?,?)'
	let params = [info.code, info.issueno, "", info.awardtime, info.result, 0]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result) => {
				connection.release()
				getIssueInfo(info)
		        if(!!err) {
					log.error('[insert issue error] - ', err.message)
					return
		        }
				log.info(`insert success: {id: ${result.insertId}, code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}, result: ${info.result}, flag: ${info.flag}`)        
				info.id = result.insertId
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}

module.exports.deleteIssueInfo = (info) => {
	log.info(`deleteIssueInfo: {code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}`)
	let key = info.code + info.issueno
	delete((_doing[key]))

	if (!!config.test && !!config.test.nodb) {
		return
	}

	let sqlstr = 'delete from issue where code=? and issueno=?'
	//let sqlstr = 'delete from issue where code=? and issueno=? and flag=0'
	let params = [info.code, info.issueno]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result) => {
				connection.release()
		        if(!!err) {
					log.error('[delete issue error] - ', err.message)
					return
		        }
				log.info(`delete success: {code: ${info.code}, issueno: ${info.issueno}, awardtime: ${info.awardtime}`);        
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}

module.exports.queryCurrIssueInfo = (code, resolve, reject) => {
	let ret = {
		error: null,
		code: code,
		curr: {
			issueno: '',
			originissueno: '',
			awardtime: '',
			awardtimestr: '',
			result: '',
		},
		next: {
			issueno: '',
			awardtime: '',
		}
	}

	if (!!config.test && !!config.test.nodb) {
		resolve(ret)
		return
	}

	// let sqlstr1 = `select issueno,originissueno,awardtime,result from issue where code=? and flag=1 order by awardtime desc limit 1` //当期
	// let sqlstr2 = `select issueno,awardtime from issue where code=? and flag=0 order by awardtime asc limit 1` //下一期
	let sqlstr = `select a.*, b.* from 
				(select issueno a_issueno,originissueno,awardtime a_awardtime,result 
				 from issue
				 where code=? and flag=1 order by awardtime desc limit 1
				) a,
				(select issueno b_issueno,awardtime b_awardtime 
				 from issue
				 where code=? and flag=0 order by awardtime asc limit 1
				) b`
	let params = [code, code]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result, fields) => {
				connection.release()
		        if(!!err) {
					log.error('[queryCurrIssueInfo error] - ', err.message)
					ret.error = err
					resolve(ret)
					return
		        }
		        if (result.length <= 0) {
		        	ret.error = "no data"
		        	resolve(ret)
		        	return
		        }
		        let row = result[0]
		        ret.curr.issueno = row.a_issueno
		        ret.curr.originissueno = row.originissueno
		        ret.curr.awardtime = row.a_awardtime
		        ret.curr.awardtimestr = util.localTime(row.a_awardtime)
		        ret.curr.result = row.result

		        ret.next.issueno = row.b_issueno
		        ret.next.awardtime = row.b_awardtime
		        ret.next.awardtimestr = util.localTime(row.b_awardtime)
		        resolve(ret)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
			ret.error = err
			resolve(ret)
			return
		}
	})
}

module.exports.queryIssueInfoByIssueno = (code, issueno, resolve, reject) => {
	let ret = {
		error: null,
		code: code,
		issueno: '',
		originissueno: '',
		awardtime: '',
		awardtimestr: '',
		result: '',
	}

	if (!!config.test && !!config.test.nodb) {
		resolve(ret)
		return
	}

	let sqlstr = `select issueno,originissueno,awardtime,result from issue where code=? and issueno=? and flag=1`
	let params = [code, issueno]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result, fields) => {
				connection.release()

		        if(!!err) {
		        	connection.release()
					log.error('[queryIssueInfoByIssueno error] - ', err.message)
					ret.error = err
					resolve(ret)
					return
		        }
		        if (result.length <= 0) {
		        	ret.error = "no data"
		        	resolve(ret)
		        	return
		        }
		        let row = result[0]
		        ret.code = code
		        ret.issueno = row.issueno
		        ret.originissueno = row.originissueno
		        ret.awardtime = row.awardtime
		        ret.awardtimestr = util.localTime(row.awardtime),
		        ret.result = row.result
			    resolve(ret)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
			ret.error = err
			resolve(ret)
			return
		}
	})
}


module.exports.queryIssuesInfo = (code, issueno, begintime, endtime, page, num, resolve, reject) => {
	let ret = {
		error: null,
		code: code,
		issues: [],
	}

	if (!!config.test && !!config.test.nodb) {
		resolve(ret)
		return
	}

	let where = ' where code=? and flag=1 '
	let params = [code]
	if (!!issueno) {
		where += 'and issueno=? or originissueno=?'
		params.push(issueno)
		params.push(issueno)
	} else {
		where += 'and awardtime>=? and awardtime<=?'
		params.push(begintime)
		params.push(endtime)
	}
	let sqlstr = `select issueno,originissueno,awardtime,result from issue ` + where + ' order by issueno desc'
	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result, fields) => {
				connection.release()

		        if(!!err) {
					log.error('[queryIssuesByTimerange error] - ', err.message)
					ret.error = err
					resolve(ret)
					return
		        }
		        if (result.length <= 0) {
		        	ret.error = "no data"
		        	resolve(ret)
		        	return
		        }
		        for (let i=0; i<result.length; i++) {
		        	let row = result[i]
		        	ret.issues.push({
		        		issueno: row.issueno,
						originissueno: row.originissueno,
						awardtime: row.awardtime,
						awardtimestr: util.localTime(row.awardtime),
						result: row.result,
		        	})
		        }
			    resolve(ret)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
			ret.error = err
			resolve(ret)
			return
		}
	})
}

module.exports.queryCalcInfoByDate = (date, resolve, reject) => {
	let ret = {error:null}

	if (!!config.test && !!config.test.nodb) {
		resolve(ret)
		return
	}

	let dbdate = util.localDate(date)
	let sqlstr = `select data from calculate where calcdate=?`
	let params = [dbdate]

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result, fields) => {
				connection.release()
		        if(!!err) {
		        	connection.release()
					log.error('[queryCalcInfoByDate error] - ', err.message)
					ret.error = err
					resolve(ret)
					return
		        }
		        if (result.length <= 0) {
		        	ret.error = "no data"
		        	resolve(ret)
		        	return
		        }
		        let row = result[0]
		        try {
		        	ret = JSON.parse(row.data)
		        	ret.error = null
		        } catch(e) {

		        }
			    resolve(ret)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
			ret.error = err
			resolve(ret)
			return
		}
	})
}


module.exports.queryCalcInfoByTimerange = (begindate, enddate, resolve, reject) => {
	let ret = {
		error: null,
		data: [],
	}

	if (!!config.test && !!config.test.nodb) {
		resolve(ret)
		return
	}

	let dbbegindate = util.localDate(begindate)
	let dbenddate = util.localDate(enddate)
	let sqlstr = `select calcdate, data from calculate where calcdate>=? and calcdate<=?`
	let params = [dbbegindate, dbenddate]
	
	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			connection.query(sqlstr, params, (err, result, fields) => {
				connection.release()

		        if(!!err) {
		        	connection.release()
					log.error('[queryCalcInfoByTimerange error] - ', err.message)
					ret.error = err
					resolve(ret)
					return
		        }
		        if (result.length <= 0) {
		        	ret.error = "no data"
		        	resolve(ret)
		        	return
		        }
		        for (let i=0; i<result.length; i++) {
		        	let row = result[0]
		        	try {
		        		let item = JSON.parse(row.data)
		        		item.date = row.calcdate
		        		ret.data.push(item)
		        	} catch(e) {

		        	}
		        }
			    resolve(ret)
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
			ret.error = err
			resolve(ret)
			return
		}
	})
}

module.exports.saveCalc = (currDate, data) => {
	if (!!config.test && !!config.test.nodb) {
		return
	}

	mysqlPool.getConnection((err, connection) => {
		if (!err) {
			let sqlstr = `update calculate set data=? where calcdate=?`
			let params = [data, currDate]
			if (currDate != _calcDate) {
				sqlstr = `insert into calculate(calcdate, data) values(?,?)`
				params = [currDate, data]
				_calcDate = currDate
			} else {
				
			}
			connection.query(sqlstr, params, (err, result) => {
				connection.release()
		        if(!!err) {
					log.info('[saveCalc error] - ', err.message)
					return
		        }
			})
		} else {
			log.error('mysqlPool.getConnection() error: ', err)
		}
	})
}
