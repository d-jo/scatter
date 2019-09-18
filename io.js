const https = require("https")
const fs = require("fs")

const procurements = {
	"web_get": webget,
};

function loadFile(name) {
	try {
		let contents = fs.readFileSync(name, "utf8");
		return [JSON.parse(contents), null];
	} catch (err) {
		return [null, err];
	}
}

function webget(manifest_fr_entry) {
	return new Promise((resolve, reject) => {
		https.get(manifest_fr_entry["source"], (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				resolve(data);
			});
		}).on("error", (err) => {
			reject(err);
		});
	});
}

module.exports = {
	procurements,
	loadFile,
	webget,
};