const fs = require("fs");
const encoder = require("./encoding.js");

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
			currNode.children[dataArr[i]].push(newChild);
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
// let data = "hello";
// data = data.split(" ");
// data.forEach(term => {
// 	let tdata = encoder.CreateDenseSearchTerm(data);
// 	tdata.forEach(item =>{
// 		AddToTrie(t, item);
// 	});
// 
// })
// PrintTrie(t._root, -1);
// fs.readFile("data", "utf8", function(err, content) {
// 	data = content;
// 	let elements = data.split("\n");
// 	console.log(data)
// 
// 	elements.forEach(e => {
// 		let cs = e.split("");
// 		cs = encoder.CreateDenseSearchTerm(e);
// 		cs.forEach(ps => {
// 			AddToTrie(t, ps);
// 		})
// 	});
// 	PrintTrie(t._root, 0)
// });

module.exports = {
	Node,
	Trie,
	AddToTrie,
	PrintTrie,
}
