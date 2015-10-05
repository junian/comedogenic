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



function analyze(s) {
  var a = null;
  var splitChars = "|,:;";
  for (var i=0;i<splitChars.length;i++)
    if (s.contains(splitChars[i])) { 
      s = s.split(splitChars[i]); 
      break; 
    }
  if (!s) { alert("No ingredient separator found."); s = [s]; }
  var bad = [];
  for (var i=0;i<s.length;i++) {
    var names = splitParens(normalizeName(s[i]).replace(" ","","g")).split("/");
          
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
        bad.push(s[i] + " => " + dset[bestMatchI]);
      }
    }
  }
  alert(bad.join("\n"));
}

while (true) {
  var s = prompt();
  if (!s) break;
  analyze(s);
}
