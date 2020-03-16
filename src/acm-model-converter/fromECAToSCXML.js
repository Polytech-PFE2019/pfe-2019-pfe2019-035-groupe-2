/*
	TODO:
	on utilise pas le datamodel. A voir si c'est génant.
	on ne gère pas l'état initial. à gérer 
*/
const fs = require('fs');

/*
//VERSION 0.0

On Init(0) IF true DO State("doingWarm")
On Init(1) IF true DO State("doingWarm")

ON Input(0, "doWarm") IF !State(1,"doingCold") DO State(0,"doingWarm"), Output(0, "doWarm")
ON Input(0, "doCold") IF !State(1,"doingWarm") DO State(0,"doingCold"), Output(0, "doCold")
ON Input(1, "doWarm") IF !State(0,"doingCold") DO State(1,"doingWarm"), Output(1, "doWarm")
ON Input(1, "doCold") IF !State(0,"doingWarm") DO State(1,"doingCold"), Output(1, "doCold")
*/


let eca = fs.readFileSync("turbine-old.eca", "utf8");

var rules = eca.split("\n");
var initStates = []
var states = []
var transitions = []

for (var i = 0; i < rules.length; i++) {
	if (rules[i] != "") {

		var onIndex = 3 //it's always 3 since it's the start of a rule
		var ifIndex = rules[i].search("IF")
		var doIndex = rules[i].search("DO")

		var onValue = rules[i].slice(onIndex, ifIndex);
		var ifValue = rules[i].slice(ifIndex + 3, doIndex);
		var doValue = rules[i].slice(doIndex + 3, rules[i].length);


		//console.log("on " + onValue)
		//console.log("if " + ifValue)
		//console.log("do " + doValue)


		var event = onValue.split("(")
		if (event[0] == "Init") {
			//parse DO
			var entryParenthesisIndex = doValue.indexOf("(")
			var exitParenthesisIndex = doValue.indexOf(")")
			var init = doValue.slice(entryParenthesisIndex + 1, exitParenthesisIndex);

			initStates[event[1][0]] = init.substring(1,init.length-1)+"_"+event[1][0];
			states[event[1][0]] = [init.substring(1,init.length-1)+"_"+event[1][0]];
		}
		if (event[0] == "Input") {

			//automaton, event, condition, destination, output. 

			//parse ON
			var entryParenthesisIndex = onValue.indexOf("(")
			var exitParenthesisIndex = onValue.indexOf(")")
			//automaton	
			var automatonNumber = onValue.slice(entryParenthesisIndex + 1, exitParenthesisIndex).split(",")[0];
			var eventName = onValue.slice(entryParenthesisIndex + 1, exitParenthesisIndex).split(",")[1];
			//event
			//remove the additionnal "
			var event = eventName.substring(2,eventName.length-1) + "_" + automatonNumber + ""			

			//parse IF
			//condition
			var isEqualSign;
			if(ifValue[0]=="!"){
				isEqualSign = false;
			}
			else{
				isEqualSign = true;
			}
			ifValue = ifValue.split(",");
			var newStateName = ifValue[1].substring(0,ifValue[1].length-2)+"_"+ifValue[0][ifValue[0].length-1]
			var condition = "automaton_"+ifValue[0][ifValue[0].length-1]+(isEqualSign ? "==" : "!=")+newStateName

			//parse DO
			var destination = "self"
			var output = ""

			var entryParenthesisIndex = doValue.indexOf("(")
			var exitParenthesisIndex = doValue.indexOf(")")
			var functionName = doValue.slice(0, entryParenthesisIndex);
			if(functionName=="State"){
				var stateTabs = doValue.slice(entryParenthesisIndex + 1, exitParenthesisIndex).split(",");
				destination = stateTabs[1].substring(1,stateTabs[1].length-1)+"_"+stateTabs[0]
				//console.log(destination)
			}
			doValue = doValue.slice(exitParenthesisIndex+3,doValue.length)
			entryParenthesisIndex = doValue.indexOf("(")
			exitParenthesisIndex = doValue.indexOf(")")
			functionName = doValue.slice(0, entryParenthesisIndex);
			if(functionName=="Output"){
				var OutputTabs = doValue.slice(entryParenthesisIndex + 1, exitParenthesisIndex).split(",");
				output = OutputTabs[1].substring(2,OutputTabs[1].length-1)+"_"+OutputTabs[0]
				//console.log(output)
			}

			//if destination unknown
			if(!states[automatonNumber].includes(destination) && destination != "self"){
				states[automatonNumber].push(destination)
			}

			//automaton, event, condition, destination, output. 

			var newTrans = {}
			newTrans.automatonNumber = automatonNumber;
			newTrans.event = event;
			newTrans.condition = condition;
			newTrans.destination = destination;
			newTrans.output = output;
			transitions.push(newTrans)
		}

	}
}


var builder = require('xmlbuilder');
 
var root = builder.create('scxml').att("xmlns","http://www.w3.org/2005/07/scxml").att("version","1.0");
var parallel = root.ele("parallel").att("id","Parallel_1")
var datamodel = root.ele("datamodel");
for (var i = 0; i < initStates.length; i++) {
	var data = datamodel.ele("data").att("id","automaton_"+i).att("expr","\""+initStates[i]+"\"");
}
for (var i = 0; i < states.length; i++) {
    var automaton = parallel.ele("state").att("id","automaton_"+i).att("initial",initStates[i])
	for (var j = 0; j < states[i].length; j++) {
        var state = automaton.ele("state").att("id",states[i][j])
		//applying each transition
		for (var k = 0; k < transitions.length; k++) {
			if(transitions[k].automatonNumber == i){
				//create transition
                var transition = state.ele("transition").att("type","external").att("event",transitions[k].event).att("target",transitions[k].destination).att("cond",transitions[k].condition)
				var send_output = transition.ele("send").att("event",transitions[k].output);
				var assign = transition.ele("assign").att("location","automaton_"+i).att("expr","\""+transitions[k].destination+"\"");
			}
		}

        var onentry = state.ele("onentry").ele("log").att("label","entering state").att("expr","\""+states[i][j]+"\"");
	}
}

//datamodel

var xml = root.end({ pretty: true});
console.log(xml);