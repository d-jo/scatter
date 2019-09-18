


function createSearchObject(inputFile) {
	return new Promise((resolve, reject) => {
		let searchObject = {"trie": [], "coverage": {}, "locations": {}};
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

			let sections = item.split(inputFile["l2_separator"]):
			sections.forEach(sect => {
				
			});


			
		});
	});
}

function encode(inputFile) {
	

}
