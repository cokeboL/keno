const spi_bjkl8 = require('./spider/spi_bjkl8')
const spi_canada = require('./spider/spi_canada')
const spi_west_canada = require('./spider/spi_west_canada')
const spi_slovakia = require('./spider/spi_slovakia')
const spi_taiwan = require('./spider/spi_taiwan')
const spi_oregon = require('./spider/spi_oregon')

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
	return spiders[code]
}