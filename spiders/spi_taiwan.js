const log = require('log4js').getLogger()
const http = require('http')
const https = require('https')
const { URL } = require('url');
// var FormData = require('form-data');
 
const timeformat = (date) => {
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	let hour = date.getHours()
	let minute = date.getMinutes()
	return `${year}-${month}-${day} ${hour}:${minute}`
}
module.exports.get = (info, resolve, reject) => {
	let year = info.awardtime.getFullYear()
	let month = info.awardtime.getMonth() + 1
	let day = info.awardtime.getDate()
	let pageSize = 60*24
	let url = `https://www.1399klc.com/issuehistory/historyList?lotteryCode=${info.code}&issue_no=0&date=${year}-${month}-${day}&pageIndex=1&pageSize=${pageSize}&t=0.39445912482429435`
	const options = new URL(url);
	let request = https.get(options, function(res) {
	    let size = 0
	    let chunks = []
		res.on('data', function(chunk){
		    size += chunk.length
		    chunks.push(chunk)
		})
		res.on('end', function(){
			let data = Buffer.concat(chunks, size)
			if (data.length <= 0) {
				reject("get failed")
				return
			}
			try {
				data = JSON.parse(data)
				info.error = data.Error
				let found = false
				for (let i=0; i<data.Data.rows.length; i++) {
					let row = data.Data.rows[i]
					if (timeformat(new Date(row.AwardDate)) == timeformat(info.awardtime)) {
						info.originissueno = row.IssueNo
						//info.result = row.Result
						info.result = row.Result.split('|')[0]
						found = true
						//console.log("-- found: ", i, new Date(row.AwardDate), info.awardtime)
						break
					}
				}
				if (found) {
					resolve(info)
					return
				}
			    reject("get failed")
			} catch(e) {
				reject(e)
			}
		});
	}).on('error', function(e) {
		reject(e)
	});
	request.setTimeout(1000*5, function( ) {
	    reject('request timeout')
	});
}