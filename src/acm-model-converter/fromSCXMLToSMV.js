/*
	TODO:
	on utilise pas le datamodel. A voir si c'est génant.
	on ne gère pas l'état initial. à gérer 
*/
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

// this example reads the file synchronously
// you can read it asynchronously also
let xml_string = fs.readFileSync("output.scxml", "utf8");

parser.parseString(xml_string, function (error, result) {
	if (error === null) {
		//console.log(result.scxml.parallel[0].state[0].state[0].transition[0]);

		var fsm = result.scxml.parallel[0].state;
		var listOfEvents = []
		var statesOfSubAutomaton = []
		var listOfTransitions = [] //sub automaton, from, to , event , condition


		for (var i = 0; i < fsm.length; i++) {
			var subAutomaton = fsm[i];
			var subAutomatonName = subAutomaton.ATTR.id;
			var subAutomatonInitial = subAutomaton.ATTR.initial;

			statesOfSubAutomaton.push([subAutomatonName])
			if (subAutomatonInitial != undefined)
				statesOfSubAutomaton[i].push(subAutomatonInitial)

			for (var j = 0; j < fsm[i].state.length; j++) {
				var currentState = fsm[i].state[j].ATTR.id

				if (!statesOfSubAutomaton[i].includes(fsm[i].state[j].ATTR.id)) {
					statesOfSubAutomaton[i].push(fsm[i].state[j].ATTR.id);
				}

				for (var k = 0; k < fsm[i].state[j].transition.length; k++) {
					//var newLink = [subAutomatonName, currentState, fsm[i].state[j].transition[k].ATTR.target,fsm[i].state[j].transition[k].ATTR.event,fsm[i].state[j].transition[k].ATTR.cond]
					var newLink = {};
					newLink.subAutomatonName = subAutomatonName;
					newLink.from = currentState;
					newLink.to = fsm[i].state[j].transition[k].ATTR.target;
					newLink.event = fsm[i].state[j].transition[k].ATTR.event
					newLink.cond = fsm[i].state[j].transition[k].ATTR.cond
					newLink.output = fsm[i].state[j].transition[k].send[0].ATTR.event

					listOfTransitions.push(newLink)
					if (!listOfEvents.includes(fsm[i].state[j].transition[k].ATTR.event)) {
						listOfEvents.push(fsm[i].state[j].transition[k].ATTR.event);
					}
				}
			}



		}

		//console.log(statesOfSubAutomaton)
		//console.log(listOfTransitions.length)
		//console.log(listOfEvents);

		//VAR
		//list events
		var smvText = "MODULE main\nVAR\n";
		for (var i = 0; i < listOfEvents.length; i++) {
			smvText += "\t" + listOfEvents[i] + ": boolean;\n"
		}
		//list état d'un sous automate 				e.g. turb2_automaton: {doingWarm2,doingCold2,doingStop2};
		for (var i = 0; i < statesOfSubAutomaton.length; i++) {
			smvText += "\t" + statesOfSubAutomaton[i][0] + ":{"
			for (var j = 1; j < statesOfSubAutomaton[i].length; j++) {
				if (j != 1) {
					smvText += ", "
				}
				smvText += statesOfSubAutomaton[i][j]
			}
			smvText += "};\n"
		}

		//DEFINE

		//list events pour le stable
		smvText += "DEFINE\n"
		smvText += "\tstable := count("
		for (var i = 0; i < listOfEvents.length; i++) {
			if (i != 0) {
				smvText += ", "
			}
			smvText += listOfEvents[i]
		}
		smvText += ") = 1;\n"

		//liste états d'un sous automate
		for (var i = 0; i < statesOfSubAutomaton.length; i++) {
			for (var j = 1; j < statesOfSubAutomaton[i].length; j++) {
				smvText += "\tin-" + statesOfSubAutomaton[i][j] + " := " + statesOfSubAutomaton[i][0] + " = " + statesOfSubAutomaton[i][j] + ";\n"
			}
		}
		//liste de toutes les transitions pour chaque automate et leur paramètre from, event , condition
		for (var i = 0; i < listOfTransitions.length; i++) {
			//smvText+=listOfTransitions.length
			smvText += "\tt" + i + " := stable & in-" + listOfTransitions[i].from + " & " + listOfTransitions[i].event
			if (listOfTransitions[i].cond != undefined) {
				smvText += " & " + listOfTransitions[i].cond
			}
			smvText += ";\n"
		}

		//To rework probably
		listOfOutput = {}
		for (var i = 0; i < listOfTransitions.length; i++) {
			if (listOfOutput[listOfTransitions[i].output]) {
				listOfOutput[listOfTransitions[i].output].push("t" + i)
			}
			else {
				listOfOutput[listOfTransitions[i].output] = ["t" + i];
			}
		}
		for(var json in listOfOutput){
			smvText+="\toutput_"+json+" := "
			for(var transition in listOfOutput[json]){
				if(transition!=0)
					smvText+=" | "			
				smvText+=listOfOutput[json][transition]			
			}
			smvText+=";\n"
		}

		//ASSIGN
		smvText += "ASSIGN\n"
		//list transition sous automate -> to 
		//init and next
		for (var i = 0; i < statesOfSubAutomaton.length; i++) {
			var currentAutomaton = statesOfSubAutomaton[i]
			//console.log(currentAutomaton)
			smvText += "\tinit(" + currentAutomaton[0] + ") := " + currentAutomaton[1] + ";\n"
			smvText += "\tnext(" + currentAutomaton[0] + ") :=\n"
			smvText += "\t\tcase\n"
			for (var j = 0; j < listOfTransitions.length; j++) {
				//console.log(listOfTransitions[j][0])
				if (currentAutomaton[0] == listOfTransitions[j].subAutomatonName) {
					smvText += "\t\t\tt" + j + ": " + listOfTransitions[j].to + ";\n"
				}
			}
			smvText += "\t\t\tTRUE: " + currentAutomaton[0] + ";\n"
			smvText += "\t\tesac;\n"

		}

		//contraintes.

		console.log(smvText)

	}
	else {
		console.log(error);
	}
});