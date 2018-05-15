module.exports = {
	listenPort: 8080,  //监听端口
	
	mysql: { //mysql配置项
		host     : 'localhost',
		user     : 'root',
		password : '123456',
		database : 'keno'
	},

	spiderMaxTryTimes: 10000, //爬虫爬取单个期号最多尝试次数

	admin: {
		username: "admin",
		password: "123qwe",
	},
	
	test: {
		nodb: true,	
	}
}