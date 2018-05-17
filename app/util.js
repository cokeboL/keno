const formatter = new Intl.DateTimeFormat([], {
    //timeZone: "America/New_York", //美东，不设置timeZone默认用本机时区
    timeZone: require('../config').timeZone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
})

module.exports.localTime = (t) => {
	return formatter.format(new Date(t))
}

module.exports.localDate = (t) => {
	let date = new Date()
	if (!!t) {
		date = new Date(t)
	}
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	return `${year}-${month}-${day}`
}