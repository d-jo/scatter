

function recursiveTreeBuild(trie, sections, index) {
	let last = sections.length - 1;
	if (index == last) {
		// base case, return object
		let key = sections[last];
		// this doesnt work, it interprets key literally
		return {key: {}};
	} else {
		// curr is actually next
		let dest = trie[sections[index]];
		// TODO fiinish this, not working
		if (!dest) {
			// path does not exist, create
			trie[sections[index]] = {};
			curr = trie[sections[index]];
			return recursiveTreeBuild(curr[sections[index]], sections, index + 1);
		} else {
			// path does exist, do not modify curr
			return recursiveTreeBuild(curr[sections[index]], sections, index + 1);
		}
	}
}


function createSearchObject(inputFile) {
	return new Promise((resolve, reject) => {
		let searchObject = {"trie": {}, "coverage": {}, "locations": {}};
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
			searchObject["trie"] = recursiveTreeBuild(searchObject["trie"], sections, 0);
		});
		resolve(searchObject)
	});
}

function encode(inputFile) {
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
	encode
}
