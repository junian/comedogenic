var data = [dataAcneOrg, dataBotanic, dataHautschutzengel];

String.prototype.contains = function(searchFor) {
  return this.indexOf(searchFor) >= 0;
}
String.prototype.containsAny = function(searchFor) {
  for (var i=0;i<searchFor.length;i++) if (this.contains(searchFor[i])) return true;
  return false;
}
String.prototype.count = function(searchFor) {
  var res = 0;
  var i = this.indexOf(searchFor);
  while (i >= 0) {
    res++;
    i = this.indexOf(searchFor, i + searchFor.length);
  }
  return res;
}
Array.prototype.contains = function(searchFor) {
  return this.indexOf(searchFor) >= 0;
}

function normalizeName(name){
  return name.toLowerCase().replace(/[ *]/,"","g");
}
function splitParens(name)  {
  while (name.contains("(")) {
    var nobra = /(.*)\((.*)\)?(.*)/.exec(name);
    name = nobra[1]+"/"+nobra[2].split(",").join("/");
    if (nobra[3]) name += "/" + nobra[3];
  }
  return name;
}

for (var d=0;d<data.length;d++) {
  var subdata = data[d];
  for (var i=0;i<subdata.length;i++) {
    var name = splitParens(normalizeName(subdata[i][0]));    
    subdata[i] = [name.split("/")].concat(subdata[i]); 
  }
}




