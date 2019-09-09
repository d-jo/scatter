
const minimist = require("minimist")
const util = require("util")
const io = require("./io.js")
const decoder = require("./decoding.js")

function displayJSON(manifest) {
	console.log(util.inspect(manifest, true, null))
}


var argv = minimist(process.argv.slice(2))
var manifest_file
var credential_file


let f
if (argv["manifest"]) {
	// load argv manifest
	f = io.LoadFile(argv["manifest"])
} else {
	// load default
	console.log("Default manifest file")
	f = io.LoadFile("manifest.json")
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
	c = io.LoadFile(argv["creds"])
} else {
	c = io.LoadFile("creds.json")
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
	decoder.Decode(manifest_file).then(sect => {
		console.log(sect)
		console.log(sect[0].length)
		console.log(sect[1].length)
	}).catch(err => {
		console.log(err.message)
	})
}


