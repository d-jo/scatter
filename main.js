
const fs = require("fs")
const minimist = require("minimist")
const util = require("util")
const https = require("https")


const webget = async (manifest_fr_entry) => {
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

const regexTransform = async (data, manifest_entry) => {
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

const indexTransform = async (data, manifest_entry) => {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(manifest_entry["start"], manifest_entry["end"]))
		} catch (err) {
			reject(err)
		}
	})
}

const keyTransform = async (data, manifest_entry) => {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(data.indexOf(manifest_entry["start"]), data.indexOf(manifest_entry["end"])))
		} catch(err) {
			reject(err)
		}
	})
}

const raw_decode = async (data) => {
	return new Promise((resolve, reject) => {
		let str = data
		resolve(str)
	})
}

function displayManifest(manifest) {
	console.log(util.inspect(manifest, true, null))
}

const loadManifestFile = async (name) => {
	return new Promise((resolve, reject) => {
		let file
		fs.readFile(name, "utf8", (err, contents) => {
			if (err) {
				reject(err)
			} else {
				resolve(JSON.parse(contents))
			}
		})
	})
}

const decode = async (mf) => {
	return new Promise((resolve, reject) => {
		let sections = {}
		let index = 0
		let retrieved = 0
		// for each fragment
		mf["fragments"].forEach((fr) => {
			// get retrival method and call it
			let retr = procurements[fr["source_type"]]
			console.log("Source      \t" + fr["source"])
			console.log("Source type \t" + fr["source_type"])
			console.log("Source size \t" + fr["size"])
			console.log("==========")
			console.log("Section\tActual\tExpected")
			retr(fr).then(raw_data => {
				// go through the raw data from the fragmnet
				// and parse the different data sections
				fr["datas"].forEach(datas_entry => {
					// get the transformation
					let transformation = transforms[datas_entry["type"]]
					// apply the transformation
					transformation(raw_data, datas_entry).then(section => {
						sections[datas_entry["order"]] = section
						retrieved += section.length
						console.log(datas_entry["order"] + "\t" + section.length + "\t" + datas_entry["size"])
						if (retrieved >= mf["size"]) {
							resolve(sections)
						}
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


var argv = minimist(process.argv.slice(2))
var manifest_file

var procurements = {
	"web_get": webget,
}

var transforms = {
	"index": indexTransform,
	"keys": keyTransform,
	"regex": regexTransform,
}

var decoding = {
	// rsa
	// sha3
	// ...
	raw: raw_decode,
}

if (argv["manifest"]) {
	loadManifestFile(argv["manifest"]).then(file => {
		manifest_file = file	
		displayManifest(manifest_file)
		postStart()
	}).catch(err => {
		console.log(err)
	})
} else {
	loadManifestFile("manifest.json").then(file => {
		manifest_file = file	
		displayManifest(manifest_file)
		postStart()
	}).catch(err => {
		console.log(err)
	})
}

function postStart() {
	if (argv["decode"] || argv["d"]) { 
		startDecode()
	}
}

function startDecode() {
	console.log("Decoding")
	decode(manifest_file).then(sect => {
		console.log(sect)
		console.log(sect[0].length)
		console.log(sect[1].length)
	}).catch(err => {
		console.log(err.message)
	})
}






