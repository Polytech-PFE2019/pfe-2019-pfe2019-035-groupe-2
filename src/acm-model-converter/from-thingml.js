var exports = module.exports = {};

const search = require('recursive-search');
const fs = require('fs');
const unzipper = require('unzipper');
const TMLGO = require("./ThingMLGraphOrientation");
const SoftwareComponent = require("../acm-metamodel/SoftwareComponent.js");
const Link = require("../acm-metamodel/Link.js");
const Metamodel = require("../acm-metamodel/Metamodel.js");
let exec = require('child_process').exec, child;

let sourcePath = "B:/Ali/PFE/sos2.zip";
let destinationPath = "B:/Ali/PFE/Unzipped";
let compilationDirectory = "B:/Ali/PFE";

function fromFilePath(sourcePath, destinationPath, compilationDirectory)
{
	let softwarecomponents = [];
	let links = [];
	let model;

	function first(sourcePath, destinationPath, callback) {
		fs.createReadStream(sourcePath)//Path à récupérer depuis le modèle GeneSIS
			.pipe(unzipper.Extract({path: destinationPath})); // Path d'extraction à définir de façon relative
		return callback();
	}

	function second() {
		return search.recursiveSearchSync('simple_buzzer.thingml', destinationPath);
	}

	let res = first(sourcePath, destinationPath, second);
	console.log(res);

	function compile(compilationDirectory, callback) {
		child = exec('java -jar ./ThingML2CLI.jar -o ' + compilationDirectory + ' -c uml -s ' + res[1],
			function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
			});
		return callback;
	}

	function orient(compilationDirectory, callback) {
		let str = TMLGO.readSingleFile2(res[0], compilationDirectory + "/SimpleBuzzerArduino.plantuml");
		callback(str);
	}

	let str = orient(compilationDirectory, compile);

	function fromContent(fileContent) {

		let lines = String(fileContent).split("\n");
		for (let index = 0; index < lines.length; index++) {
			if (lines[index].includes("-->")) {
				let words = lines[index].split("-->");
				let name = words[0].concat("-").concat(words[1]);
				let from;
				let to;
				let comp1 = new SoftwareComponent(softwarecomponents.length, words[0].slice(0), 0, 0, "SoftwareComponent", "id_parent");
				//console.log(comp1.toString);
				let comp2 = new SoftwareComponent(softwarecomponents.length, words[1].slice(0), 0, 0, "SoftwareComponent", "id_parent");
				if (softwarecomponents.includes(comp1) != true) {
					softwarecomponents.push(comp1);
				}
				if (softwarecomponents.includes(comp2) != true) {
					softwarecomponents.push(comp2);
				}
				from = softwarecomponents[softwarecomponents.indexOf(comp1)];
				to = softwarecomponents[softwarecomponents.indexOf(comp2)];
				links.push(new Link(links.length, name, 0, 0, from, to));
			} else if (lines[index].includes("<--")) {
				let words = lines[index].split("<--");
				let name = words[0].concat("-").concat(words[1]);
				let from;
				let to;
				let comp1 = new SoftwareComponent(softwarecomponents.length, words[0].slice(0), 0, 0, "SoftwareComponent", "id_parent");
				let comp2 = new SoftwareComponent(softwarecomponents.length, words[1].slice(0), 0, 0, "SoftwareComponent", "id_parent");
				if (softwarecomponents.includes(comp1) != true) {
					softwarecomponents.push(comp1);
				}
				if (softwarecomponents.includes(comp2) != true) {
					softwarecomponents.push(comp2);
				}
				from = softwarecomponents[softwarecomponents.indexOf(comp2)];
				to = softwarecomponents[softwarecomponents.indexOf(comp1)]
				links.push(new Link(links.length, name, 0, 0, from, to));
			} else {
				console.log(lines[index].concat(" n'est pas conforme au format."));
			}
		}
		//console.log(softwarecomponents);
		console.log(links);
		model = new Metamodel(softwarecomponents, links);
	}
	fromContent(str);
	callback(model);
}
fromFilePath(sourcePath,destinationPath,compilationDirectory)
