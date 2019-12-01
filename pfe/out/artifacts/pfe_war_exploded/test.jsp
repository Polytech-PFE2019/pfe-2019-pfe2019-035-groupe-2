<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>ThingML parser</title>
</head>
<label for="fileinput">Choose your ThingML file</label>
<input type="file" id="fileinput" />
<script type="text/javascript">
    var components = [];
    var stateCharts = [];
    var resIn = [];
    var resOut = [];
    var resBoth = [];
    var id = 0;
    var linkId = 0;
    function readSingleFile(evt) {
        document.getElementById('input').innerHTML = "";
        document.getElementById('output').innerHTML = "";
        var f = evt.target.files[0];
        if (f) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                var ct = r.result;
                var words = ct.split('\n').join(' ').split('{').join(' { ').split('}').join(' } ').split('\t').join('').split(' ');
                for( var i = 0; i < words.length; i++){
                    if ( words[i] ==  ''){
                        words.splice(i, 1);
                    }
                }
                for( var i = 0; i < words.length; i++){
                    if ( words[i] ==  'port'){
                        components.push(words[i+1]);
                    }
                    if ( words[i] ==  'thing' && words[i+1] != "fragment"){
                        stateCharts.push(words[i+1]);
                    }
                }
                for (var i = 0; i < words.length; i++) {
                    if(words[i] == "sends"){
                        var tmp = "";
                        var tmpi = i;
                        while(words[tmpi] != "port"){
                            --tmpi;
                        }
                        tmp = words[tmpi+1];
                        var j = i;
                        while(words[j] != "}"){
                            if(words[j] == "receives"){
                                if(components.includes(tmp))
                                    resBoth.push(tmp);
                            }
                            ++j;
                        }
                        if(components.includes(tmp))
                            resOut.push(tmp);
                    } else if(words[i] == "receives"){
                        var tmp = "";
                        var tmpi = i;
                        while(words[tmpi] != "port"){
                            --tmpi;
                        }
                        tmp = words[tmpi+1];
                        var j = i;
                        while(words[j] != "}"){
                            if(words[j] == "sends"){
                                if(components.includes(tmp))
                                    resBoth.push(tmp);
                            }
                            ++j;
                        }
                        if(components.includes(tmp))
                            resIn.push(tmp);
                    }
                }
                for(var x = 0; x < resIn.length; ++x){
                    if(resBoth.includes(resIn[x])){
                        resIn.splice(x,1);
                    }
                    document.getElementById('input').innerHTML += resIn[x];
                    document.getElementById('input').innerHTML += "<br>";
                }
                for(var x = 0; x < resOut.length; ++x){
                    if(resBoth.includes(resOut[x])){
                        resOut.splice(x,1);
                    }
                    document.getElementById('output').innerHTML += resOut[x];
                    document.getElementById('output').innerHTML += "<br>";
                }
                for(var x = 0; x < resBoth.length; ++x){
                    document.getElementById('both').innerHTML += resBoth[x];
                    document.getElementById('both').innerHTML += "<br>";
                }
            }
            r.readAsText(f);
            var x = document.getElementById("div2");
            if (x.style.display === "none") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        } else {
            alert("Failed to load file");
        }
    }

    document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
</script>
</head>
<body>
<h3>Input :</h3>
<div id="input"></div>
<h3>Output :</h3>
<div id="output"></div>
<h3>Both :</h3>
<div id="both"></div><br>

<div id="div2" style="display: none;">
    <label for="fileinput2">Choose your PlantUML file</label>
    <input type="file" id="fileinput2" />
    <h3>Graph :</h3>
    <h4>PlantUML</h4>
    <div id="graph"></div><br>
    <h4>Node-Red</h4>
    <div id="graph2"></div><br>
</div>

<div id="div3" style="display: none;">
    <%--@declare id="file-select-label"--%><label for="file-select-label">Choose a file to download:</label>
    <select id="file-select">
        <option value="null">--Please choose an option--</option>
        <option value="json">Json</option>
        <option value="uml">PlantUML</option>
    </select>
    <input type="button" id="dl" value ="Download file"/><br>
</div><br><br>
<div id="div4" style="display: none;">
    <input type="button" id="scan" value ="Scan for conflicts"/><br>
    <h3>Conflicts :</h3>
    <div id="conflits"></div><br>
</div>
<script type="text/javascript">
    var res = "";
    var res2 = "";
    var resWithConflicts = "";
    var couple = [];
    var nextsIn = [];
    var nextsOut = [];
    var nextsBoth = [];
    var psm = [];
    var psmCouple = [];
    var compoWithType = [];
    var realName = [];
    var words = [];
    var compoConflict = [];
    function readSingleFile2(evt) {
        var compos = [];
        var compos2 = [];
        var port1 = [];
        var port2 = [];
        document.getElementById('graph').innerHTML = "";
        var f = evt.target.files[0];
        if (f) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                var ct = r.result;
                words = ct.split('[').join(' [ ').split(']').join(' ] ').split(':').join(' : ').split('\n').join(' ').split(' ');
                for (var i = 0; i < words.length; i++) {
                    if(words[i] == "<<PSM>>"){
                        var j = i;
                        var str = "";
                        while(words[j] != "["){
                            --j;
                        }
                        while(words[j+1] != "]"){
                            ++j;
                            str = str + ' ' + words[j];
                        }
                        str = str.split(']').join('');
                        psm.push(str);
                    }

                    if(words[i] == "<<PSM>>" || words[i] == "<<PIM>>"){
                        var j = i;
                        var str = "";
                        while(words[j] != "["){
                            --j;
                        }
                        while(words[j+1] != "]"){
                            ++j;
                            str = str + ' ' + words[j];
                        }
                        str = str.split(']').join('');
                        compoWithType.push(obj = {compo : str, id : ''});
                    }

                    if (words[i] == "-(0-"){
                        var j = i;
                        var str = "";
                        while(words[j] != "["){
                            --j;
                        }
                        while(words[j+1] != "]"){
                            ++j;
                            str = str + ' ' + words[j];
                        }
                        str = str.split(']').join('');
                        compos.push(str);

                        var k = i;
                        var str2 = "";
                        while(words[k] != "["){
                            ++k;
                        }
                        while(words[k+1] != "]"){
                            ++k;
                            str2 = str2 + ' ' + words[k];
                        }
                        str2 = str2.split('[').join('');
                        compos2.push(str2);

                        var l = i;
                        var str3 = "";
                        var str4 = "";
                        while(words[l] != "=>"){
                            ++l;
                        }
                        str3 = words[l-1];
                        str4 = words[l+1];
                        port1.push(str3);
                        port2.push(str4);

                    }
                }

                for (var i = 0; i < words.length; i++) {

                    if (words[i] == "-(0-"){
                        var j = i;
                        var str = "";
                        while(words[j] != "["){
                            --j;
                        }
                        while(words[j+1] != "]"){
                            ++j;
                            str = str + ' ' + words[j];
                        }
                        str = str.split(']').join('');

                        if(str.toUpperCase().search(stateCharts[0].toUpperCase()) != -1){
                            var k = i;
                            var str2 = "";
                            var str3 = "";
                            while(words[k] != "["){
                                ++k;
                            }
                            while(words[k+1] != "]"){
                                ++k;
                                str2 = str2 + ' ' + words[k];
                            }
                            str2 = str2.split('[').join('');
                            while(words[k] != "=>"){
                                ++k;
                            }
                            while(words[k-1] != ":"){
                                --k;
                                str3 = str3 + ' ' + words[k];
                            }
                            var obj = {compoType : str2, name : str3};
                            realName.push(obj)
                        }
                    }
                }

                for(var x = 0; x < compos.length; ++x){
                    if(!psm.includes(compos[x]) && !psm.includes(compos2[x])){
                        var obj = {compo1 : compos[x], compo2 : compos2[x], portCompo1 : port1[x], portCompo2 : port2[x], view : false};
                        couple.push(obj);
                    }else{
                        var obj = {compo1 : compos[x], compo2 : compos2[x], portCompo1 : port1[x], portCompo2 : port2[x], view : false};
                        psmCouple.push(obj);
                    }
                }

                sortGen(couple);


                for (var i = 0; i < resIn.length; ++i) {
                    nextsIn.push({input : resIn[i], nexts : getReachable(resIn[i])});
                }
                for (var i = 0; i < resOut.length; ++i) {
                    nextsOut.push({output : resOut[i], nexts : getReachable(resOut[i])});
                }
                for (var i = 0; i < resBoth.length; ++i) {
                    nextsBoth.push({both : resBoth[i], nexts : getReachable(resBoth[i])});
                }

                nextsIn.forEach(function(element){
                    clean(element.nexts)
                })
                nextsOut.forEach(function(element){
                    clean(element.nexts)
                })
                nextsBoth.forEach(function(element){
                    clean(element.nexts)
                })

                sortIn(nextsIn);
                sortOut(nextsOut);
                sortBoth(nextsBoth);

                nextsIn.forEach(function(element) {
                    for (var i = 0; i < element.nexts.length; ++i) {
                        components.forEach(function(e){
                            if(element.input != undefined){
                                if(e.toUpperCase() != element.input.toUpperCase() && element.nexts[i] != undefined){
                                    if( element.nexts[i].toUpperCase().search(e.toUpperCase()) != -1){
                                        element.nexts.splice(i,1);
                                        --i;
                                    }
                                }
                            }
                        });
                    }
                });
                nextsOut.forEach(function(element) {
                    for (var i = 0; i < element.nexts.length; ++i) {
                        components.forEach(function(e){
                            if(element.output != undefined){
                                if(e.toUpperCase() != element.output.toUpperCase() && element.nexts[i] != undefined){
                                    if( element.nexts[i].toUpperCase().search(e.toUpperCase()) != -1){
                                        element.nexts.splice(i,1);
                                        --i;
                                    }
                                }
                            }
                        });
                    }
                });
                nextsBoth.forEach(function(element) {
                    for (var i = 0; i < element.nexts.length; ++i) {
                        components.forEach(function(e){
                            if(element.both != undefined){
                                if(e.toUpperCase() != element.both.toUpperCase() && element.nexts[i] != undefined){
                                    if( element.nexts[i].toUpperCase().search(e.toUpperCase()) != -1){
                                        element.nexts.splice(i,1);
                                        --i;
                                    }
                                }
                            }
                        });
                    }
                });

                display();
                displayJson();
                var x = document.getElementById("div3");
                var y = document.getElementById("div4");
                if (x.style.display === "none") {
                    x.style.display = "block";
                    y.style.display = "block";
                } else {
                    x.style.display = "none";
                    y.style.display = "none";
                }
            }
            r.readAsText(f);
        } else {
            alert("Failed to load file");
        }
    }
    function download() {
        var e = document.getElementById("file-select");
        var strUser = e.options[e.selectedIndex].value;
        var filename;
        var text;
        if(strUser != 'null' && strUser != ''){
            if(strUser == 'json'){
                filename = stateCharts[0] + ".json";
                text = JSON.stringify(toNodeRedJson(res2));
                //text = toString(res2);
            }else if(strUser == 'uml'){
                filename = stateCharts[0] + ".plantuml";
                text = res;
            }else if(strUser == 'umlC'){
                filename = stateCharts[0] + "-Conflicts.plantuml";
                text = resWithConflicts;
            }
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }else{
            alert("No file selected");
        }
    }

    function sortGen(tab){
        var resu = [];

        resIn.forEach(function(element){
            for(var i = 0; i < couple.length; ++i){
                if(couple[i].portCompo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].portCompo2.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo2.toUpperCase().search(element.toUpperCase()) != -1 && couple[i].compo1.toUpperCase().search(stateCharts[0].toUpperCase()) == -1 && couple[i].compo2.toUpperCase().search(stateCharts[0].toUpperCase()) == -1){
                    resu.push(couple[i])
                    tab.splice(i,1);
                    console.log(couple[i]);
                }
            }
        });

        resOut.forEach(function(element){
            for(var i = 0; i < couple.length; ++i){
                if(couple[i].portCompo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].portCompo2.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo2.toUpperCase().search(element.toUpperCase()) != -1 && couple[i].compo1.toUpperCase().search(stateCharts[0].toUpperCase()) == -1 && couple[i].compo2.toUpperCase().search(stateCharts[0].toUpperCase()) == -1){
                    resu.push(couple[i])
                    tab.splice(i,1);
                    console.log(couple[i]);
                }
            }
        });

        resBoth.forEach(function(element){
            for(var i = 0; i < couple.length; ++i){
                if(couple[i].portCompo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].portCompo2.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo1.toUpperCase().search(element.toUpperCase()) != -1 || couple[i].compo2.toUpperCase().search(element.toUpperCase()) != -1 && couple[i].compo1.toUpperCase().search(stateCharts[0].toUpperCase()) == -1 && couple[i].compo2.toUpperCase().search(stateCharts[0].toUpperCase()) == -1){
                    resu.push(couple[i])
                    tab.splice(i,1);
                    console.log(couple[i]);
                }
            }
        });
        tab.forEach(function(element){
            resu.push(element);
        });

        couple = resu;
    }

    function getReachable(node) {
        currents = [findTypeByRealname(node)];
        reachable = [findTypeByRealname(node)];
        while (currents.length != 0) {
            nexts=[];
            currents.forEach(function(node) {
                couple.forEach(function(element){
                    if((element.portCompo1.toUpperCase().search(node.toUpperCase()) != -1) || (element.compo1.toUpperCase().search(node.toUpperCase()) != -1 && element.compo1.toUpperCase().search(stateCharts[0].toUpperCase()) == -1) && element.view == false){
                        if(element.compo2.toUpperCase().search(stateCharts[0].toUpperCase()) == -1){
                            var adj = element.compo2;
                            if (!reachable.includes(adj)) {
                                nexts.push(adj);
                                reachable.push(adj)
                            }
                        }else{
                            var adj = element.compo1;
                            if (!reachable.includes(adj)) {
                                nexts.push(adj);
                                reachable.push(adj)
                            }
                        }
                    }else if ((element.portCompo2.toUpperCase().search(node.toUpperCase()) != -1) || (element.compo2.toUpperCase().search(node.toUpperCase()) != -1 && element.compo2.toUpperCase().search(stateCharts[0].toUpperCase()) == -1)&& element.view == false){
                        if(element.compo1.toUpperCase().search(stateCharts[0].toUpperCase()) == -1){
                            var adj = element.compo1;
                            if (!reachable.includes(adj)) {
                                nexts.push(adj);
                                reachable.push(adj)
                            }
                        }else{
                            var adj = element.compo2;
                            if (!reachable.includes(adj)) {
                                nexts.push(adj);
                                reachable.push(adj)
                            }
                        }
                    }
                });
            });
            currents=nexts.slice();
        }
        return reachable;
    }

    function clean(tab){
        for (var x = 0; x < tab.length; ++x) {
            if(tab[x].length == 0){
                tab.splice(x,1);
            }
        }
    }

    function display() {
        for (var i = 0; i < resIn.length; ++i) {
            nextsIn.forEach(function(nextsi) {
                if(nextsi.input == resIn[i] && nextsi.input != "undefined"){
                    var name = findTypeByRealname(resIn[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextsi.nexts.length; ++j) {
                            if(nextsi.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                document.getElementById('graph').innerHTML += '['+ stateCharts[0] + ']' + ' <-- ' + '['+ nextsi.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ stateCharts[0] + ']' + ' <-- ' + '['+ nextsi.nexts[j] + ']';
                                res += "\n";
                            }else{
                                document.getElementById('graph').innerHTML += '['+ nextsi.nexts[j-1] + ']' + ' <-- ' + '['+ nextsi.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ nextsi.nexts[j-1] + ']' + ' <-- ' + '['+ nextsi.nexts[j] + ']';
                                res += "\n";
                            }
                        }
                    }
                }
            });

        }
        for (var i = 0; i < resOut.length; ++i) {
            nextsOut.forEach(function(nextso) {
                if(nextso.output == resOut[i] && nextso.output != "undefined"){
                    var name = findTypeByRealname(resOut[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextso.nexts.length; ++j) {
                            if(nextso.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                document.getElementById('graph').innerHTML += '['+ stateCharts[0] + ']' + ' --> ' + '['+ nextso.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ stateCharts[0] + ']' + ' --> ' + '['+ nextso.nexts[j] + ']';
                                res += "\n";
                            }else{
                                document.getElementById('graph').innerHTML += '['+ nextso.nexts[j-1] + ']' + ' --> ' + '['+ nextso.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ nextso.nexts[j-1] + ']' + ' --> ' + '['+ nextso.nexts[j] + ']';
                                res += "\n";
                            }
                        }
                    }
                }
            });

        }
        for (var i = 0; i < resBoth.length; ++i) {
            nextsBoth.forEach(function(nextsb) {
                if(nextsb.both == resBoth[i] && nextsb.both != "undefined"){
                    var name = findTypeByRealname(resBoth[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextsb.nexts.length; ++j) {
                            if(nextsb.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                document.getElementById('graph').innerHTML += '['+ stateCharts[0] + ']' + ' <--> ' + '['+ nextsb.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ stateCharts[0] + ']' + ' <--> ' + '['+ nextsb.nexts[j] + ']';
                                res += "\n";
                            }else{
                                document.getElementById('graph').innerHTML += '['+ nextsb.nexts[j-1] + ']' + ' <--> ' + '['+ nextsb.nexts[j] + ']';
                                document.getElementById('graph').innerHTML += "<br>";
                                res += '['+ nextsb.nexts[j-1] + ']' + ' <--> ' + '['+ nextsb.nexts[j] + ']';
                                res += "\n";
                            }
                        }
                    }
                }
            });
        }

        for (var i = 0; i < psmCouple.length; ++i) {
            if(psmCouple[i].compo1.toUpperCase().search(stateCharts[0].toUpperCase()) != -1){
                document.getElementById('graph').innerHTML += '['+ stateCharts[0] + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                document.getElementById('graph').innerHTML += "<br>";
                res += '['+ stateCharts[0] + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                res += "\n";
            }else if(psmCouple[i].compo2.toUpperCase().search(stateCharts[0].toUpperCase()) != -1){
                document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ stateCharts[0] + ']';
                document.getElementById('graph').innerHTML += "<br>";
                res += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ stateCharts[0] + ']';
                res += "\n";
            }else{
                nextsIn.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1)){
                        document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                        document.getElementById('graph').innerHTML += "<br>";
                        res += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                        res += "\n";
                    }else if(findIn(element.nexts,psmCouple[i].compo2)){
                        document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' --> ' + '['+ psmCouple[i].compo2 + ']';
                        document.getElementById('graph').innerHTML += "<br>";
                        res += '['+ psmCouple[i].compo1 + ']' + ' --> ' + '['+ psmCouple[i].compo2 + ']';
                        res += "\n";
                    }
                });
                nextsOut.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1)){
                        document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' --> ' + '['+ psmCouple[i].compo2 + ']';
                        document.getElementById('graph').innerHTML += "<br>";
                        res += '['+ psmCouple[i].compo1 + ']' + ' --> ' + '['+ psmCouple[i].compo2 + ']';
                        res += "\n";
                    }else if(findIn(element.nexts,psmCouple[i].compo2)){
                        document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                        document.getElementById('graph').innerHTML += "<br>";
                        res += '['+ psmCouple[i].compo1 + ']' + ' <-- ' + '['+ psmCouple[i].compo2 + ']';
                        res += "\n";
                    }
                });
                nextsBoth.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1) || findIn(element.nexts,psmCouple[i].compo2)){
                        document.getElementById('graph').innerHTML += '['+ psmCouple[i].compo1 + ']' + ' <--> ' + '['+ psmCouple[i].compo2 + ']';
                        document.getElementById('graph').innerHTML += "<br>";
                        res += '['+ psmCouple[i].compo1 + ']' + ' <--> ' + '['+ psmCouple[i].compo2 + ']';
                        res += "\n";
                    }
                });
            }
        }
    }

    function displayJson() {
        var metamodel = {Metamodel : {components : [], links : []}};
        compoWithType.forEach(function(element){
            var SoftwareComponent = {SoftwareComponent : {name : element.compo, id : stateCharts[0] + '#' + id, x: undefined, y: undefined, type: 'function', id_parent: stateCharts[0]}};
            element.id = stateCharts[0] + '#' + id;
            metamodel.Metamodel.components.push(SoftwareComponent)
            ++id;
        });

        for (var i = 0; i < resIn.length; ++i) {
            var link = {};
            nextsIn.forEach(function(nextsi) {
                if(nextsi.input == resIn[i] && nextsi.input != "undefined"){
                    var name = findTypeByRealname(resIn[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextsi.nexts.length; ++j) {
                            if(nextsi.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                link = {Link: {name :nextsi.nexts[j] + ' to ' + stateCharts[0], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                console.log(findCompoInMetaM(metamodel,stateCharts[0]));
                                console.log(findCompoInMetaM(metamodel,nextsi.nexts[j]));
                                link.Link.to = findCompoInMetaM(metamodel,stateCharts[0]);
                                link.Link.from = findCompoInMetaM(metamodel,nextsi.nexts[j]);
                            }else{
                                link = {Link: {name :nextsi.nexts[j] + ' to ' + nextsi.nexts[j-1], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                console.log(findCompoInMetaM(metamodel,nextsi.nexts[j-1]));
                                console.log(findCompoInMetaM(metamodel,nextsi.nexts[j]));
                                link.Link.to = findCompoInMetaM(metamodel,nextsi.nexts[j-1]);
                                link.Link.from = findCompoInMetaM(metamodel,nextsi.nexts[j]);
                            }
                            ++linkId;
                            metamodel.Metamodel.links.push(link);
                        }
                    }
                }
            });

        }
        for (var i = 0; i < resOut.length; ++i) {
            var link = {};
            nextsOut.forEach(function(nextso) {
                if(nextso.output == resOut[i] && nextso.output != "undefined"){
                    var name = findTypeByRealname(resOut[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextso.nexts.length; ++j) {
                            if(nextso.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                link = {Link: {name : stateCharts[0] + ' to ' + nextso.nexts[j], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                console.log(findCompoInMetaM(metamodel,stateCharts[0]));
                                console.log(findCompoInMetaM(metamodel,nextso.nexts[j]));
                                link.Link.from = findCompoInMetaM(metamodel,stateCharts[0]);
                                link.Link.to = findCompoInMetaM(metamodel,nextso.nexts[j]);
                            }else{
                                link = {Link: {name : nextso.nexts[j] + ' to ' + nextso.nexts[j-1], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                console.log(findCompoInMetaM(metamodel,nextso.nexts[j-1]));
                                console.log(findCompoInMetaM(metamodel,nextso.nexts[j]));
                                link.Link.to = findCompoInMetaM(metamodel,nextso.nexts[j]);
                                link.Link.from = findCompoInMetaM(metamodel,nextso.nexts[j-1]);
                            }
                            ++linkId;
                            metamodel.Metamodel.links.push(link);
                        }
                    }
                }
            });
        }
        for (var i = 0; i < resBoth.length; ++i) {
            var link = {};
            var link2 = {};
            nextsBoth.forEach(function(nextsb) {
                if(nextsb.both == resBoth[i] && nextsb.both != "undefined"){
                    var name = findTypeByRealname(resBoth[i]);
                    if(name != "nothing"){
                        for (var j = 0; j < nextsb.nexts.length; ++j) {
                            if(nextsb.nexts[j].toUpperCase().search(name.toUpperCase()) != -1){
                                link = {Link: {name : stateCharts[0] + ' to ' + nextsb.nexts[j], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                link.Link.from = findCompoInMetaM(metamodel,stateCharts[0]);
                                link.Link.to = findCompoInMetaM(metamodel,nextsb.nexts[j]);
                                ++linkId;
                                link2 = {Link: {name : nextsb.nexts[j] + ' to ' + stateCharts[0], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                link2.Link.to = findCompoInMetaM(metamodel,stateCharts[0]);
                                link2.Link.from = findCompoInMetaM(metamodel,nextsb.nexts[j]);
                            }else{
                                link = {Link: {name : nextsb.nexts[j-1] + ' to ' + nextsb.nexts[j], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                link.Link.from = findCompoInMetaM(metamodel,nextsb.nexts[j-1]);
                                link.Link.to = findCompoInMetaM(metamodel,nextsb.nexts[j]);
                                ++linkId;
                                link2 = {Link: {name : nextsb.nexts[j] + ' to ' + nextsb.nexts[j-1], id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
                                link2.Link.to = findCompoInMetaM(metamodel,nextsb.nexts[j-1]);
                                link2.Link.from = findCompoInMetaM(metamodel,nextsb.nexts[j]);
                            }
                            ++linkId;
                            metamodel.Metamodel.links.push(link);
                            metamodel.Metamodel.links.push(link2);
                        }
                    }
                }
            });
        }

        for (var i = 0; i < psmCouple.length; ++i) {
            var bool = false;
            var link = {Link: {name :psmCouple[i].compo1 + ' to ' + psmCouple[i].compo2, id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
            ++linkId;
            var link2 = {Link: {name :psmCouple[i].compo2 + ' to ' + psmCouple[i].compo1, id : 'Lnk_' + stateCharts[0] + '#' + linkId, x: undefined, y: undefined,from: {}, to: {}}};
            if(psmCouple[i].compo1.toUpperCase().search(stateCharts[0].toUpperCase()) != -1){
                link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                link.Link.to = findCompoInMetaM(metamodel,stateCharts[0]);
            }else if(psmCouple[i].compo2.toUpperCase().search(stateCharts[0].toUpperCase()) != -1){
                link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                link.Link.from = findCompoInMetaM(metamodel,stateCharts[0]);
            }else{
                nextsIn.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1)){
                        console.log("psm In if");
                        link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                        link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                    }else if(findIn(element.nexts,psmCouple[i].compo2)){
                        console.log("psm In else");
                        link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                        link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                    }
                });
                nextsOut.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1)){
                        console.log("psm Out if");
                        link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                        link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                    }else if(findIn(element.nexts,psmCouple[i].compo2)){
                        console.log("psm Out else");
                        link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                        link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                    }
                });
                nextsBoth.forEach(function(element){
                    if(findIn(element.nexts,psmCouple[i].compo1) || findIn(element.nexts,psmCouple[i].compo2)){
                        console.log("psm Both");
                        link.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                        link.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                        link2.Link.from = findCompoInMetaM(metamodel,psmCouple[i].compo2);
                        link2.Link.to = findCompoInMetaM(metamodel,psmCouple[i].compo1);
                        bool = true;
                    }
                });
            }
            ++linkId;
            metamodel.Metamodel.links.push(link);
            if(bool){
                metamodel.Metamodel.links.push(link2);
                bool = false;
            }
        }

        res2 = metamodel;
        document.getElementById('graph2').innerHTML += JSON.stringify(toNodeRedJson(res2));
    }

    function findIn(tab, element){
        for (var x = 0; x < tab.length; ++x) {
            if(tab[x].toUpperCase().search(element.toUpperCase()) != -1){
                return true;
            }
        }
        return false;
    }
    function findCompoInMetaM(metamodel, compo){
        var resultCompo = {};
        metamodel.Metamodel.components.forEach(function(element){
            if (element.SoftwareComponent.name.toUpperCase().search(compo.toUpperCase()) != -1) {
                resultCompo = element;
            }
        });
        return resultCompo;
    }

    function sortIn(tab){
        var tab2 = tab;
        var res = [];
        var bool = false;
        tab.forEach(function(element){
            var tmp = "";
            for (var x = 0; x < element.nexts.length; ++x) {
                if(x == 0 && element.nexts[x].toUpperCase().search(element.input.toUpperCase()) != -1){
                    bool = true;
                    break;
                }else if(element.nexts[x].toUpperCase().search(element.input.toUpperCase()) != -1){
                    tmp = element.nexts[x];
                    element.nexts.splice(x,1);
                    res.push(tmp);
                    element.nexts.forEach(function(e){
                        res.push(e);
                    });
                    element.nexts = res;
                    bool = true;
                    break;
                }
            }
            if(bool == false){
                realName.forEach(function(e){
                    if (e.name.toUpperCase().search(element.input.toUpperCase()) != -1 ){
                        res.push(e.compoType);
                        element.nexts.forEach(function(e){
                            res.push(e);
                        });
                        element.nexts = res;
                    }
                });
            }
        });
    }

    function sortOut(tab){
        var tab2 = tab;
        var res = [];
        var bool = false;
        tab.forEach(function(element){
            var tmp = "";
            for (var x = 0; x < element.nexts.length; ++x) {
                if(x == 0 && element.nexts[x].toUpperCase().search(element.output.toUpperCase()) != -1){
                    bool = true;
                    break;
                }else if(element.nexts[x].toUpperCase().search(element.output.toUpperCase()) != -1){
                    tmp = element.nexts[x];
                    element.nexts.splice(x,1);
                    res.push(tmp);
                    element.nexts.forEach(function(e){
                        res.push(e);
                    });
                    element.nexts = res;
                    bool = true;
                    break;
                }
            }
            if(bool == false){
                realName.forEach(function(e){
                    if (e.name.toUpperCase().search(element.output.toUpperCase()) != -1 ){
                        res.push(e.compoType);
                        element.nexts.forEach(function(e){
                            res.push(e);
                        });
                        element.nexts = res;
                    }
                });
            }
        });
    }

    function sortBoth(tab){
        var tab2 = tab;
        var res = [];
        var bool = false;
        tab.forEach(function(element){
            var tmp = "";
            for (var x = 0; x < element.nexts.length; ++x) {
                if(x == 0 && element.nexts[x].toUpperCase().search(element.both.toUpperCase()) != -1){
                    bool = true;
                    break;
                }else if(element.nexts[x].toUpperCase().search(element.both.toUpperCase()) != -1){
                    tmp = element.nexts[x];
                    element.nexts.splice(x,1);
                    res.push(tmp);
                    element.nexts.forEach(function(e){
                        res.push(e);
                    });
                    element.nexts = res;
                    bool = true;
                    break;
                }
            }
            if(bool == false){
                realName.forEach(function(e){
                    if (e.name.toUpperCase().search(element.both.toUpperCase()) != -1 ){
                        res.push(e.compoType);
                        element.nexts.forEach(function(e){
                            res.push(e);
                        });
                        element.nexts = res;
                    }
                });
            }
        });
    }

    function stillView(tab){
        var bool = false;
        for (var x = 0; x < tab.length; ++x) {
            if(tab[x].view == false){
                bool =  true;
            }
        }
        return bool;
    }

    function findTypeByRealname(real){
        var res = "nothing";
        realName.forEach(function(element){
            var test = element.name.split(" ").join("");
            if(real.toUpperCase().search(test.toUpperCase()) != -1){
                var tab = real.toUpperCase().split(test.toUpperCase());
                console.log(tab);
                var bool = true;
                tab.forEach(function(elem){
                    console.log(elem.length);
                    if(elem.length>1){
                        bool = false;
                        console.log("false");
                    }
                });
                if(bool){
                    res = element.compoType;
                }
            }
        });
        return res;
    }

    function toNodeRedJson(obj){
        var result = [];
        var object = {id : stateCharts[0], type : "tab", label : stateCharts[0], disable : false, info : ""};
        result.push(object);

        obj.Metamodel.components.forEach(function(element){
            var object = {id : element.SoftwareComponent.id, type : "function", z : stateCharts[0], name : element.SoftwareComponent.name, func : "", output : 1, noerr : 0, x : element.SoftwareComponent.x, y : element.SoftwareComponent.y, wires : []};
            result.push(object);
        });

        obj.Metamodel.links.forEach(function(element){
            result.forEach(function(elem){
                console.log(element.Link.from.SoftwareComponent.id);
                if(element.Link.from.SoftwareComponent.id == elem.id){
                    elem.wires.push(element.Link.to.SoftwareComponent.id);
                }
            });
        });

        result.forEach(function(elem){
            if(elem.wires != undefined){
                elem.output = elem.wires.length;
            }
        });

        return result;
    }

    function searchConflicts(){
        compoWithType.forEach(function(element){
            if(element.compo.search(stateCharts[0]) == -1){
                var obj = {compo : element.compo, nbIn : 0};
                compoConflict.push(obj);
            }
        });
        var words2 = res.split('[').join(' [ ').split(']').join(' ] ').split(':').join(' : ').split('\n').join(' \n ').split('-->').join(' --> ').split('<--').join(' <-- ').split('<-->').join(' <--> ').split(' ');

        for (var i = 0; i < words2.length; i++) {
            if (words2[i] == "<--"){
                var j = i;
                var str = "";
                while(words2[j] != "["){
                    --j;
                }
                while(words2[j+1] != "]"){
                    ++j;
                    str = str + ' ' + words2[j];
                }
                str = str.split(']').join('');
                compoConflict.forEach(function(element){
                    if(str.split(" ").join('').toUpperCase().search(element.compo.split(" ").join('').toUpperCase()) != -1){
                        element.nbIn += 1;
                    }
                });
            }
            if (words2[i] == "-->"){
                var j = i;
                var str = "";
                while(words2[j] != "["){
                    ++j;
                }
                while(words2[j+1] != "]"){
                    ++j;
                    str = str + ' ' + words2[j];
                }
                str = str.split('[').join('');
                compoConflict.forEach(function(element){
                    if(str.split(" ").join('').toUpperCase().search(element.compo.split(" ").join('').toUpperCase()) != -1){
                        element.nbIn += 1;
                    }
                });
            }
            if (words2[i] == "<-->"){
                var k = i;
                var str = "";
                while(words2[k] != "["){
                    --k;
                }
                while(words2[k+1] != "]"){
                    ++k;
                    str = str + ' ' + words2[k];
                }
                str = str.split(']').join('');
                compoConflict.forEach(function(element){
                    if(str.split(" ").join('').toUpperCase().search(element.compo.split(" ").join('').toUpperCase()) != -1){
                        element.nbIn += 1;
                    }
                });
                var j = i;
                var str2 = "";
                while(words2[j] != "["){
                    ++j;
                }
                while(words2[j+1] != "]"){
                    ++j;
                    str2 = str2 + ' ' + words2[j];
                }
                str2 = str2.split('[').join('');
                compoConflict.forEach(function(element){
                    if(str2.split(" ").join('').toUpperCase().search(element.compo.split(" ").join('').toUpperCase()) != -1){
                        element.nbIn += 1;
                    }
                });
            }
        }
        if(checkConflicts()){
            compoConflict.forEach(function(element){
                if(element.nbIn > 1){
                    document.getElementById('conflits').innerHTML += "component [" + element.compo + "] #red";
                    resWithConflicts += "component [" + element.compo + "] #red";
                    document.getElementById('conflits').innerHTML += "<br>";
                    resWithConflicts += "\n";
                }
            });
            document.getElementById('conflits').innerHTML += document.getElementById('graph').innerHTML;
            resWithConflicts += res;
            var select = document.getElementById("file-select");
            var option = document.createElement('option');
            option.text = "PlantUML with Conflicts";
            option.value = 'umlC';
            select.add(option, select.options.length);
        }else{
            document.getElementById('conflits').innerHTML += "Aucun conflit"
        }
    }

    function checkConflicts(){
        var bool = false;
        compoConflict.forEach(function(element){
            if(element.nbIn > 1){
                bool = true;
            }
        });
        return bool;
    }

    document.getElementById('fileinput2').addEventListener('change', readSingleFile2, false);
    document.getElementById('dl').addEventListener('click', function() {download()}, false);
    document.getElementById('scan').addEventListener('click', function() {searchConflicts()}, false);
</script>
</body>
</html>