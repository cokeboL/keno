const db = require('./db')
const log = require('log4js').getLogger()

module.exports.generateIssueNo = (code, begintime, endtime, spantime, firstissueno, spanissueno, action, timeoffset=0) => {
	log.info('generateIssueNo: ', code, begintime, endtime, spantime, firstissueno, spanissueno, action, timeoffset)
	if (!code) {
		return 'no code'
	}
	if (!begintime) {
	    return 'no begintime'
	}
	if (!endtime) {
		return 'no endtime'
	}
	if (!spantime) {
		return 'no spantime'
	}
	let begindate = new Date(begintime)
	let enddate = new Date(endtime)
	begintime = begindate.getTime() + timeoffset
	begintime -= begintime % 60
	endtime = enddate.getTime()
	let year = begindate.getFullYear()
	let month = begindate.getMonth() + 1
	let day = begindate.getDate()
	let firstIssueno = year*100000000 + month*1000000 + day*10000 + firstissueno
	let currtime = begintime
	let issueno = firstIssueno
	let infos = []
	while (currtime < endtime) {
		infos.push({
			code,				     /* code */
			issueno: issueno, 		 /* 彩票期号 */
			awardtime: currtime,  	 /* 开奖时间 */
			result: "",    			 /* 开奖结果 */
			flag: 0,     			 /* 是否已抓取 */
		})
		issueno += spanissueno
		currtime += spantime*1000
	}
	for (let i=0; i<infos.length; i++) {
		let info = infos[i]
		info.pageSize = infos.length
		if (action == 'add') {
			setTimeout(() => {
				db.insertIssueInfo(info)
			}, 50*i)
		} else {
			setTimeout(() => {
				db.deleteIssueInfo(info)
			}, 50*i)
		}
	}
	return null
}

const test = () => {
	module.exports.generateIssueNo('bjkl8', '2018-05-11 12:00:00', '2018-05-11 13:00:00', 1800, 'add')
	module.exports.generateIssueNo('canada', '2018-05-11 12:00:00', '2018-05-11 13:00:00', 1800, 'add')
	module.exports.generateIssueNo('west_canada', '2018-05-11 12:00:00', '2018-05-11 13:00:00', 1800, 'add')
	module.exports.generateIssueNo('slovakia', '2018-05-11 12:00:00', '2018-05-11 13:00:00', 1800, 'add')
	module.exports.generateIssueNo('taiwan', '2018-05-11 12:00:00', '2018-05-11 13:00:00', 1800, 'add')
}
// setTimeout(test, 1000)