function levenshtein(str1, str2) {
    var cost = new Array(),
        n = str1.length,
        m = str2.length,
        i, j;

    var minimum = function(a, b, c) {
        var min = a;
        if (b < min) {
            min = b;
        }
        if (c < min) {
            min = c;
        }
        return min;
    }

    if (n == 0) {
        return;
    }
    if (m == 0) {
        return;
    }

    for (var i = 0; i <= n; i++) {
        cost[i] = new Array();
    }

    for (i = 0; i <= n; i++) {
        cost[i][0] = i;
    }

    for (j = 0; j <= m; j++) {
        cost[0][j] = j;
    }

    for (i = 1; i <= n; i++) {
        var x = str1.charAt(i - 1);

        for (j = 1; j <= m; j++) {
            var y = str2.charAt(j - 1);

            if (x == y) {
                cost[i][j] = cost[i - 1][j - 1];
            } else {
                cost[i][j] = 1 + minimum(cost[i - 1][j - 1], cost[i][j - 1], cost[i - 1][j]);
            }

        } //endfor

    } //endfor

    return cost[n][m];
}


function strSim(s,t) {
  return 1 - levenshtein(s,t) / Math.max(s.length,t.length);
}

var STR_SIM_THRESHOLD = 0.5;

function element(id){ return document.getElementById("comedogenic-" + id);  }


function analyze(s) {
  var a = null;
  var splitChars = "|,:;";
  for (var i=0;i<splitChars.length;i++)
    if (s.contains(splitChars[i])) { 
      s = s.split(splitChars[i]); 
      break; 
    }
  if (!s) { alert("No ingredient separator found."); s = [s]; }
  var badTable = "";
  for (var i=0;i<s.length;i++) {
    var names = splitParens(normalizeName(s[i]).replace(" ","","g")).split("/");
    var bad = {}; var isbad = false;
    for (var dseti=0;dseti<data.length;dseti++) {
      var bestMatchI = -1;
      var bestScore = 0;
      var dset = data[dseti];
      for (var j=0;j<dset.length;j++) {
        for (var k=0;k<dset[j][0].length;k++) {
          for (var l=0;l<names.length;l++) {
            var score = strSim(dset[j][0][k], names[l]);
            if (score > STR_SIM_THRESHOLD && score > bestScore) {
              bestScore = score;
              bestMatchI = j;
         //     alert(dset[j][0][k] + "|"+ names[l]);
            } 
          }
        }    
      }
    
      if (bestScore) {
        isbad = true;
        var matched = dset[bestMatchI];
        var code = (matched[1] + ":" + matched[2] + ":" + (matched[3] && matched[3] != "?" ? matched[3] : "")).toLowerCase();
        if (!bad[code]) bad[code] = [];
        bad[code].push([dseti, matched]);
      }
    }
    if (isbad) {
      if (!badTable) 
        badTable = "<thead><tr><th>Ingredient</th><th>Possible Match</th><th>Comedogenic rating</th><th>Irritation rating</th></tr></thead>";
      var first = true;
      for (prop in bad) {
        var matched = bad[prop][0][1];
        var sources = [];
        for (var j=0;j<bad[prop].length;j++) sources.push('<a href="'+dataSourceUrl[bad[prop][j][0]]+'">'+dataSourceSymbol[bad[prop][j][0]]+'</a>');
        maxed = matched[2];
        if (maxed.contains("-")) maxed = maxed.split("-")[maxed.split("-").length-1];
        badTable += '<tr class="comedogenic-rating'+maxed+'"><td>' + (first ? s[i] : "") + " </td> <td> => " + matched[1] + " ("+sources.join(", ")+')</td><td style="text-align:center">'+matched[2]+'</td><td style="text-align:center">'+(matched[3] && matched[3] != "?" ? matched[3] : "")+"</td>";
        first = false;
      }
      
    }
  }
  if (!badTable) badTable = '<tr class="comedogenic-score0"><td> => No comedogenic ingredients found</td></tr>';
  element("out").innerHTML = badTable;
}

/*while (true) {
  var s = prompt();
  if (!s) break;
  analyze(s);
}*/

var style=document.createElement("style");
style.textContent = ".comedogenic-rating0 { background-color: #11FF11 }" + 
  ".comedogenic-rating1 { background-color: #BBFF33 }" +
  ".comedogenic-rating2 { background-color: #FFFF33 }" +
  ".comedogenic-rating3 { background-color: #FFCC22 }" +
  ".comedogenic-rating4 { background-color: #FF8822 }" +
  ".comedogenic-rating5 { background-color: #FF4444 }" +
  "#comedogenic-out td {padding: 4px}" 
  ;
document.getElementsByTagName("head")[0].appendChild(style);

element("placeholder").innerHTML = (
  'Ingredient list: <input type="edit" id="comedogenic-in" style="display:block; width: 100%"/>' + 
  '<button onclick="javascript:analyze(element(\'in\').value)">Check ingredients</button> <span style="padding-left:3em">Matching threshold:</span> <input type="edit" id="comedogenic-score" value="'+STR_SIM_THRESHOLD+'" size="5" style="text-align: right"/> %'+ 
  '<table id="comedogenic-out" style="display:block; width: 100%"></table>' )
  ;

var args = /[?&]comedogenic-check=([^&]+)/.exec(location.toString());
if (args) { element("in").value = unescape(args[1]);  analyze(unescape(args[1])); }

/*

True ingredient => Matched 0-5 3 (HE,AC)
True ingredient 2 => Matched 3 ? (BB)
                  => Matched 0 0 (AC)*/
