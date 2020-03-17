const trie = require("./trie.js");

function CreateDenseSearchTermFromString(input) {
	let words = [input];
	let buf = input.split("");
	for (let i = 1; i < buf.length; i++) {
		let tmp = []
		for (let j = i; j < buf.length; j++) {
			tmp.push(buf[j]);
		}
		words.push(tmp.join(""));
	}
	return words;
}

function CreateSearchObject(inputFile) {
	return new Promise((resolve, reject) => {
		let searchObject = {"trie": new trie.Trie(), "coverage": {}, "locations": {}};
		let fragments = inputFile["message_data"].split(inputFile["fragmenter"]["l1"]);
		console.log(fragments);
		let loc = 0;
		fragments.forEach(item => {
			console.log(item);
			if (!searchObject["locations"][item]) {
				searchObject["locations"][item] = [];
			}
			searchObject["locations"][item].push(loc);

			if (!searchObject["coverage"][item]) {
				searchObject["coverage"][item] = 0;
			}

			let dense = CreateDenseSearchTermFromString(item);
			console.log(dense);
			dense.forEach(d => {
				trie.AddToTrie(searchObject["trie"], d); 
			});
		});
		resolve(searchObject);
	});
}

function Encode(inputFile) {
	return new Promise((resolve, reject) => {
		CreateSearchObject(inputFile).then((so) => {
			resolve(so)
		}).catch(err => {
			console.log("Error creating search file!")
			console.log(err.message)
			console.log(err.stack)
		});
	});
}

module.exports = {
	Encode,
	CreateSearchObject,
	CreateDenseSearchTermFromString,
}
