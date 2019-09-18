
const io = require("./io.js")

var transforms = {
	"index": indexTransform,
	"keys": keyTransform,
	"regex": regexTransform,
}
module.exports.Transformations = transforms

var decodings = {
	// rsa
	// sha3
	// ...
	raw: raw_decode,
}
module.exports.Decodings = decodings

async function regexTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			let ret
			data.match(manifest_entry["regex"]).forEach(v => {
				ret += v
			})
			resolve(ret)
		} catch (err) {
			reject(err)
		}
	})
}
module.exports.RegexTransform = regexTransform

async function indexTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(manifest_entry["start"], manifest_entry["end"]))
		} catch (err) {
			reject(err)
		}
	})
}
module.exports.IndexTransform = indexTransform

async function keyTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(data.indexOf(manifest_entry["start"]), data.indexOf(manifest_entry["end"])))
		} catch(err) {
			reject(err)
		}
	})
}
module.exports.KeyTansform = keyTransform

async function raw_decode(data) {
	return new Promise((resolve, reject) => {
		let str = data
		resolve(str)
	})
}
module.exports.RawDecode = raw_decode


async function decode(mf) {
	return new Promise((resolve, reject) => {
		let sections = {}
		let index = 0
		let retrieved = 0
		let header = false
		// for each fragment
		mf["fragments"].forEach((fr) => {
			// get retrival method and call it
			let retr = io.Procurements[fr["source_type"]]

			retr(fr).then(raw_data => {
				// go through the raw data from the fragmnet
				// and parse the different data sections
				if (!header) {
					console.log("Section\tSource\t\tSourceType\tActual\tExpected")
					header = true
				}
				fr["datas"].forEach(datas_entry => {
					// get the transformation
					let transformation = transforms[datas_entry["type"]]
					// apply the transformation
					transformation(raw_data, datas_entry).then(section => {
						let decod = decodings[datas_entry["decoding"]]
						decod(section).then(fd => {
							sections[datas_entry["order"]] = fd
							retrieved += fd.length // ADD DECODING HERE
							console.log(datas_entry["order"] + "\t" + fr["source"].substring(12, 24) + "\t" + fr["source_type"] + "\t\t" + section.length + "\t" + datas_entry["size"])
							if (retrieved >= mf["size"]) {
								resolve(sections)
							}
						}).catch(err3 => {
							console.log("Error decoding data section " + datas_entry["order"])
							console.log("Using raw_decode as default")
						
						})
					}).catch(err2 => {
						console.log("Error extracing data section from source " + fr["source"])
						console.log("Error message: " + err2.message)
						console.log(datas_entry["size"] + " Bits will be missing from data starting at " + retrieved)
						let str
						for(let i = 0; i < datas_entry["size"]; i++) {
							str += "0"
						}
						sections[datas_entry["order"]] = str
						retrieved += datas_entry["size"]
					})
				})
			}).catch(err => {
				console.log("Error fetching source " + fr["source"])
				console.log("Error message: " + err.message)	
				console.log(fr["size"] + " bits will be missing from data starting at " + retrieved)
				let str
				for(let i = 0; i < datas_entry["size"]; i++) {
					str += "0"
				}
				sections[datas_entry["order"]] = str
				retrieved += datas_entry["size"]
			})
		})
	})
}
module.exports.Decode = decode

