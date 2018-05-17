const config = require('./config')

const spi_bjkl8 = require('./spiders/spi_bjkl8')
const spi_canada = require('./spiders/spi_canada')
const spi_west_canada = require('./spiders/spi_west_canada')
const spi_slovakia = require('./spiders/spi_slovakia')
const spi_taiwan = require('./spiders/spi_taiwan')
const spi_oregon = require('./spiders/spi_oregon')

let spiders = {
	//北京
	"bjkl8": {
		get: spi_bjkl8.get,
	},
	//加拿大
	"canada": {
		get: spi_canada.get,
	},
	//加拿大西
	"west_canada": {
		get: spi_west_canada.get,
	},
	//斯洛伐克
	"slovakia": {
		get: spi_slovakia.get,
	},
	//台湾
	"taiwan": {
		get: spi_taiwan.get,
	},
	//俄勒冈
	"oregon": {
		get: spi_oregon.get,
	},
}

module.exports.geter = (code) => {
	if (!!config.test && !!config.test.nonet) {
		return {
			get: (info, resolve, reject) => {
				info.originissueno = '999999'
				info.result = '10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10'
				resolve(info)
			}
		}
	}
	return spiders[code]
}