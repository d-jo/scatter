const trie = require("./trie.js");

function CreateDenseSearchTermFromString(input) {
	let words = [input];
	for (let i = 1; i < input.length; i++) {
		for (let l = 1; l <= input.length - i; l++) {
			let str = [];
			for (let k = 0; k < l; k++) {
				str.push(input[i + k]);
			}
			words.push(str.join(""));
		}
	}
	return words;
}

function CreateSearchObject(inputFile) {
	return new Promise((resolve, reject) => {
		let searchObject = {"trie": new Trie(), "coverage": {}, "locations": {}};
		let fragments = inputFile["message_data"].split(inputFile["l1_separator"]);
		let loc = 0;
		fragments.forEach(item => {
			if (!searchObject["locations"][item]) {
				searchObject["locations"][item] = [];
			}
			searchObject["locations"][item].push(loc);

			if (!searchObject["coverage"][item]) {
				searchObject["coverage"][item] = 0;
			}

			let sections = item.split(inputFile["l2_separator"]);
			trie.AddToTrie(searchObject["trie"], sections);
		});
		resolve(searchObject);
	});
}

function Encode(inputFile) {
	return new Promise((resolve, reject) => {
		createSearchObject(inputFile).then((so) => {
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
	CreateDenseSearchTerm,
	CreateSearchObject,
}
