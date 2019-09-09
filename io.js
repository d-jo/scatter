
const https = require("https")
const fs = require("fs")

var procurements = {
	"web_get": webget,
}
module.exports.Procurements = procurements

function loadFile(name) {
	try {
		let contents = fs.readFileSync(name, "utf8")
		return [JSON.parse(contents), null]
	} catch (err) {
		return [null, err]
	}
}
module.exports.LoadFile = loadFile

async function webget(manifest_fr_entry) {
	return new Promise((resolve, reject) => {
		https.get(manifest_fr_entry["source"], (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk
			})

			resp.on('end', () => {
				resolve(data)
			})
		}).on("error", (err) => {
			reject(err)
		})
	})
}
module.exports.Webget = webget
