
function Node(data) {
	this.data = data;
	this.parent = null;
	this.children = {};
}

function Trie() {
	let node = new Node("");
	this._root = node;
}

function AddToTrie(trie, dataArr) {
	// start with root node
	let currNode = trie._root;
	// for each element in input dataArr
	outter:
	for (let i = 0; i < dataArr.length; i++) {
		// check to see if node has children given current element
		if (!currNode.children[dataArr[i]]) {
			// node does not have children of this input word
			let newChild = new Node(dataArr[i]);
			newChild.parent = currNode;
			currNode.children[dataArr[i]] = [newChild];
			currNode = newChild;
		} else {
			// a list of children of this input word exists
			// search it
			let childNodes = currNode.children[dataArr[i]];
			for (let j = 0; j < childNodes.length; j++) {
				let n = childNodes[j];
				if (n.data == dataArr[i]) {
					// input word match
					// advance without changes
					currNode = n;
					continue outter;
				}
			}
			// getting here means the children 
			// array does not contain a path for 
			// this input word
			let newChild = new Node(dataArr[i]);
			newChild.parent = currNode;
			currNode.children.push(newChild);
			currNode = newChild;
		}
	}
}


function PrintTrie(node, d) {
	//console.log(d + "|" + node.data)
	process.stdout.write(d + " |");
	for (let i = 0; i < d; i++) {
		process.stdout.write("  ");
	}
	process.stdout.write(node.data + "\n");
	Object.keys(node.children).forEach(c => {
		node.children[c].forEach(nc => {
			PrintTrie(nc, d+1);
		})
	})
}

// let t = new Trie();
// ["horsing", "horse", "home", "hope", "hose", "hoses", "hosed"].forEach(e => {
// 	let cs = e.split("");
// 	AddToTrie(t, cs);
// });
// PrintTrie(t._root, 0)


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
