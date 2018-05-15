const log = require('log4js').getLogger()
const https = require('https')

module.exports.get = (info, resolve, reject) => {
	let year = info.awardtime.getFullYear()
	let month = info.awardtime.getMonth() + 1
	if (month < 10) {
		month = '0' + month
	}
	let day = info.awardtime.getDate()
	if (day < 10) {
		day = '0' + day
	}

	var options = {
		"method": "POST",
		"hostname": "www.oregonlottery.org",
		"path": "/games/draw-games/keno/past-results",
		"headers": {
			"content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
			"Cache-Control": "no-cache",
			"Postman-Token": "6ae3a0a7-5dd6-481b-ba8f-c05c54e74555"
		}
	};

	let req = https.request(options, function (res) {
		let chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
		    let data = Buffer.concat(chunks)
		    let hour = parseInt(info.awardtime.getHours())
			let minute = parseInt(info.awardtime.getMinutes())
			if (minute < 10) {
				minute = '0' + minute
			}
			let tail = 'AM'
			if (hour == 0) {
				hour = 12
			} else if (hour == 12) {
				tail = 'PM'
			} else if (hour > 12) {
				hour -= 12
				tail = 'PM'
			}
			if (hour < 10) {
				hour = '0' + hour
			}
			//<td>5/11/2018 12:5AM</td>
			let timeStr = `<td>${month}/${day}/${year} ${hour}:${minute}${tail}</td>`
			if (data.length <= 0) {
				reject("get failed")
				return
			}
			try {
				data = data.toString()
				let pos = data.indexOf(timeStr)
				if (pos >= 0) {
					data = data.substr(pos+timeStr.length)
					//<td>2714635</td>
					let pos1 = data.indexOf('<td>')
					let pos2 = data.indexOf('</td>')
					if (pos1 >= 0 && pos2 >= 0) {
						let originissueno = data.substring(pos1+4, pos2)
						let result = ''
						for (let i=0; i<20; i++) {
							data = data.substr(pos2+5)
							pos1 = data.indexOf('<td>')
							pos2 = data.indexOf('</td>')
							if (pos1 >= 0 && pos2 >= 0) {
								let num = parseInt(data.substring(pos1+4, pos2))
								if (num < 10) {
									num = '0' + num
								}
								result += num
								if (i < 19) {
									result += ','
								}
							} else {
								reject("get failed")
								return
							}
						}
						info.originissueno = originissueno
						info.result = result
						resolve(info)
						return
					}
				} else {
				}
			    reject("get failed")
			} catch(e) {
				reject(e)
			}
		});
	})
	req.write(`------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"CurrentPageIndex\"\r\n\r\n0\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"GameCode\"\r\n\r\nKE\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"PrintPage\"\r\n\r\nfalse\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"FromDate\"\r\n\r\n${month}/${day}/${year}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"ToDate\"\r\n\r\n${month}/${day}/${year}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"PageSize\"\r\n\r\n0\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"CurrentPageIndex\"\r\n\r\n0\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--`);
	req.end();
	req.setTimeout(1000*5, function() {
	    reject('request timeout')
	});
}
