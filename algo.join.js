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

var STR_SIM_THRESHOLD = 0.75;

function element(id){ return document.getElementById("comedogenic-" + id);  }

function sourceLink(i) { return '<a href="'+dataSourceUrl[i]+'">'+dataSourceSymbol[i]+'</a>' }
function sourceLinks(sources) { return "(" + sources.map(sourceLink).join(", ") + ")"; }

function analyze(s) {
  STR_SIM_THRESHOLD = element("score").value * 1;
  var a = null;
  var splitChars = "|,:;";
  for (var i=0;i<splitChars.length;i++)
    if (s.contains(splitChars[i])) { 
      s = s.split(splitChars[i]); 
      break; 
    }
  if (!s) { alert("No ingredient separator found."); s = [s]; }
  var hasAnyBad = false;
  var badRows = ["","","","","",""];
  var enabledSources = [];
  for (var i=0;i<dataSourceSymbol.length;i++) enabledSources.push(element("source"+i).checked);
  for (var i=0;i<s.length;i++) {
    var names = splitParens(normalizeName(s[i]).replace(" ","","g")).split("/");
    var bad = {}; var isbad = false;
    for (var dseti=0;dseti<data.length;dseti++) { 
      if (!enabledSources[dseti]) continue;
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
        var code1 = normalizeName(matched[1] + ":" + matched[2]  );
        var code2 = normalizeName(matched[0][0] + ":" + matched[2] );
        var code = code1;
        if (!bad[code1] && bad[code2]) code = code2;
        if (!bad[code]) bad[code] = [];
        bad[code].push([dseti, matched]);
      }
    }
    if (isbad) {
      hasAnyBad = true;
      var ratingScore = {};
      var maxRatingScore = 0;
      for (prop in bad) {
        var matched = bad[prop][0][1];
        var maxed = matched[2];
        if (maxed.contains("-")) maxed = maxed.split("-")[maxed.split("-").length-1];
        maxed = maxed * 1;
        if (!(maxed  >= 0 && maxed < badRows.length)) maxed = badRows.length-1;
        ratingScore[prop] = maxed; 
        if (maxed > maxRatingScore) maxRatingScore = maxed;
      }
 
      function foldWithSourcesOnColumn(list,column) {
        var sources = {}; var names = {};
        for (var i=0;i<list.length;i++) { 
          var v = list[i][1][column];
          if (typeof v == "undefined") continue;
          var w = v.toString().toLowerCase();
          if (!sources[w]) sources[w] = [];
          sources[w].push(list[i][0]);
          names[w] = v;
        }
        var result = [];
        for (var prop in sources) if (names[prop]) result.push(names[prop] + " " + sourceLinks(sources[prop]));
        return result.join(", ");
      }
      var first = true;
      for (prop in bad) { 
        var matched = bad[prop][0][1];
        badRows[maxRatingScore] += '<tr class="comedogenic-rating'+ratingScore[prop]+'"><td class="comedogenic-rating'+maxRatingScore+'">' + (first ? s[i] : "") + " </td> <td> => " + foldWithSourcesOnColumn(bad[prop],1)+'</td><td style="text-align:center">'+matched[2]+'</td><td style="text-align:center">'+foldWithSourcesOnColumn(bad[prop],3)+"</td>" ;
        first = false;
      }
      
    }
  }
  var badTable;
  if (hasAnyBad) {
    badTable = "<thead><tr><th>Ingredient</th><th>Possible Match</th><th>Comedogenic rating</th><th>Irritation rating</th></tr></thead>";
    for (var i=badRows.length-1;i>=0;i--) badTable += badRows[i];
  } else {
    badTable = '<tr class="comedogenic-rating0"><td> => No comedogenic ingredients found</td></tr>';
  }
  element("out").innerHTML = badTable;
}

/*while (true) {
  var s = prompt();
  if (!s) break;
  analyze(s);
}*/

var style=document.createElement("style");
style.textContent = ".comedogenic-rating0 { background-color: #99FF99 }" + 
  ".comedogenic-rating1 { background-color: #BBFF33 }" +
  ".comedogenic-rating2 { background-color: #FFFF33 }" +
  ".comedogenic-rating3 { background-color: #FFCC22 }" +
  ".comedogenic-rating4 { background-color: #FF8822 }" +
  ".comedogenic-rating5 { background-color: #FF4444 }" +
  "#comedogenic-out td {padding: 4px}" 
  ;
document.getElementsByTagName("head")[0].appendChild(style);

var sourceshtml="";
for (var i=0;i<dataSourceSymbol.length;i++)
  sourceshtml += '<input id="comedogenic-source'+i+'" type="checkbox" checked> '+sourceLink(i);

element("placeholder").innerHTML = '<h3>Comedogenic Ingredient Tester</h3>' +
  'Ingredient list: <input type="edit" id="comedogenic-in" style="display:block; width: 100%"/>' + 
  '<button onclick="javascript:analyze(element(\'in\').value)">Check ingredients</button> <span style="padding-left:2em">Matching threshold:</span> <input type="edit" id="comedogenic-score" value="'+STR_SIM_THRESHOLD+'" size="5" style="text-align: right"/> % <span style="padding-left:2em">Databases:</span>'+sourceshtml+ 
  '<h4>Test result</h4>' +
  '<table id="comedogenic-out" style="display:block; width: 100%"></table>' + "<br><br><br>" +
  '<h3>Questions</h3>'+
  '<h4>How do I use this?</h4><p>Copy a list of ingredients in the top edit field and click the "check" button. Ingredients with low comedogenic rating (0) are safe, ingredients with high rating (5) are dangerous.</p>' +
  '<h4>Why does it output nonsensical matches?</h4><p>It uses a very simple text similarity score to find the match. If you have ingredients in the list that are not in the source database, it will find a random ingredient with similar name. Increase the threshold value to discard less similar matches.</p>' + 
  '<h4>Why is there one row saying the ingredient is safe and one row saying that it is unsafe?</h4><p>This tool only lists the ratings from the source databases. If those databases do not agree with each other, it reports it accordingly.</p>' 

  ;

var args = /[?&]comedogenic-check=([^&]+)/.exec(location.toString());
if (args) { element("in").value = unescape(args[1]);  analyze(unescape(args[1])); }

/*

True ingredient => Matched 0-5 3 (HE,AC)
True ingredient 2 => Matched 3 ? (BB)
                  => Matched 0 0 (AC)*/
