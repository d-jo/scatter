
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

function displayJSON(manifest) {
	console.log(util.inspect(manifest, true, null))
}

function loadFile(name) {
	try {
		let contents = fs.readFileSync(name, "utf8")
		return [JSON.parse(contents), null]
	} catch (err) {
		return [null, err]
	}
}

const decode = async (mf) => {
	return new Promise((resolve, reject) => {
		let sections = {}
		let index = 0
		let retrieved = 0
		let header = false
		// for each fragment
		mf["fragments"].forEach((fr) => {
			// get retrival method and call it
			let retr = procurements[fr["source_type"]]
			console.log("Source      \t" + fr["source"])
			console.log("Source type \t" + fr["source_type"])
			console.log("Source size \t" + fr["size"])
			console.log("==========")

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
						sections[datas_entry["order"]] = section
						retrieved += section.length
						console.log(datas_entry["order"] + "\t" + fr["source"].substring(12, 24) + "\t" + fr["source_type"] + "\t\t" + section.length + "\t" + datas_entry["size"])
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
var credential_file

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

var encoding


let f
if (argv["manifest"]) {
	// load argv manifest
	f = loadFile(argv["manifest"])
} else {
	// load default
	console.log("Default manifest file")
	f = loadFile("manifest.json")
}

if (f[1] == null) {
	// good, error is null
	manifest_file = f[0]
	console.log("Loaded manifest")
	displayJSON(manifest_file)
} else {
	// error
	console.log("Error loading manifest file: " + f[1].message)
}

let c
if (argv["creds"]) {
	c = loadFile(argv["creds"])
} else {
	c = loadFile("creds.json")
}

if (c[1] == null) {
	credential_file = c[0]
	console.log("Loaded credentials")
} else {
	console.log("Error loading credential file: " + c[1].message)
}

if (argv["decode"] || argv["d"]) { 
	startDecode()
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


