const io = require("./io.js")

const transforms = {
	"index": indexTransform,
	"keys": keyTransform,
	"regex": regexTransform,
};

const decoding = {
	// rsa
	// sha3
	// ...
	raw: rawDecode,
};

function regexTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			let ret;
			data.match(manifest_entry["regex"]).forEach(v => {
				ret += v;
			})
			resolve(ret);
		} catch (err) {
			reject(err);
		}
	});
}

function indexTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(manifest_entry["start"], manifest_entry["end"]));
		} catch (err) {
			reject(err);
		}
	})
}

function keyTransform(data, manifest_entry) {
	return new Promise((resolve, reject) => {
		try {
			resolve(data.substring(data.indexOf(manifest_entry["start"]), data.indexOf(manifest_entry["end"])));
		} catch (err) {
			reject(err);
		}
	})
}

function rawDecode(data) {
	return new Promise((resolve, reject) => {
		let str = data;
		resolve(str);
	});
}

function decode(mf) {
	return new Promise((resolve, reject) => {
		let sections = {};
		let index = 0;
		let retrieved = 0;
		let header = false;
		// for each fragment
		mf["fragments"].forEach((fr) => {
			// get retrival method and call it
			let retr = io.procurements[fr["source_type"]];
			console.log("Source      \t" + fr["source"]);
			console.log("Source type \t" + fr["source_type"]);
			console.log("Source size \t" + fr["size"]);
			console.log("==========");

			retr(fr).then(raw_data => {
				// go through the raw data from the fragmnet
				// and parse the different data sections
				if (!header) {
					console.log("Section\tSource\t\tSourceType\tActual\tExpected");
					header = true;
				}
				fr["datas"].forEach(datas_entry => {
					// get the transformation
					let transformation = transforms[datas_entry["type"]];
					// apply the transformation
					transformation(raw_data, datas_entry).then(section => {
						sections[datas_entry["order"]] = section;
						retrieved += section.length;
						console.log(datas_entry["order"] + "\t" + fr["source"].substring(12, 24) + "\t" + fr["source_type"] + "\t\t" + section.length + "\t" + datas_entry["size"]);
						if (retrieved >= mf["size"]) {
							resolve(sections);
						}
					}).catch(err2 => {
						console.log("Error extracing data section from source " + fr["source"]);
						console.log("Error message: " + err2.message);
						console.log(datas_entry["size"] + " Bits will be missing from data starting at " + retrieved);
						let str;
						for (let i = 0; i < datas_entry["size"]; i++) {
							str += "0";
						}
						sections[datas_entry["order"]] = str;
						retrieved += datas_entry["size"];
					});
				});
			}).catch(err => {
				console.log("Error fetching source " + fr["source"]);
				console.log("Error message: " + err.message);
				console.log(fr["size"] + " bits will be missing from data starting at " + retrieved);
				let str;
				for (let i = 0; i < datas_entry["size"]; i++) {
					str += "0";
				}
				sections[datas_entry["order"]] = str;
				retrieved += datas_entry["size"];
			});
		});
	});
}

module.exports = {
	transforms,
	decode,
	decoding,
	rawDecode,
	keyTransform,
	indexTransform,
	regexTransform,
};