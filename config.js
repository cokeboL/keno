module.exports = {
    listenPort: 8080,            //监听端口
	
    mysql: { //mysql配置项
        host     : 'localhost',  //数据库host，如果不配置，默认localhost
        port     : 3306,         //数据库端口，如果不配置，默认3306
        user     : 'root',       //数据库账号
        password : '123456',     //数据库密码
        database : 'keno',       //数据库，与 sql/init.sql create database 保持一致
        connectionLimit: 100,    //数据库连接池大小，建议不小于100
    },

    spiderMaxTryTimes: 100,     //爬虫爬取单个期号最多尝试次数

    admin: {             
        username: "admin",       //管理后台账号
        password: "123qwe",      //管理后台密码
    },

    enablecalc: true,            //统计功能，true：启用 | false：禁用
    calcSaveInterval: 1000*300,  //统计数据落地到 mysql 时间间隔，此处为300秒，不配置默认60秒
}
