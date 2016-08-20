#/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/../../../manageUtils.sh

mirroredProject comedogenic

BASE=$HGROOT/programs/data/comedogenic

case "$1" in
mirror)
  syncHg  
;;
gatherdata)
  xidel --user-agent "Mozilla/5.0 (X11; Linux x86_64; rv:31.0) Gecko/20100101 Firefox/31.0 Iceweasel/31.5.3" http://www.acne.org/messageboard/topic/319593-the-bad-list-comedogenic-ingredients-and-products/ -e '"var dataAcneOrg = [" || join(css(".post.entry-content")[1]//text()[matches(.,"[0-9] *[;:][^P]+$")] ! replace(., "([^:;]*)[:;]? *([-0-9?]+) *[:;]+ *([-0-9?]+)", "[""$1"", ""$2"", ""$3""]"), ", ") || "]; "'  > dataAcneOrg.dump.js

  xidel 'https://www.beneficialbotanicals.com/facts-figures/comedogenic-rating.html' -e '"var dataBotanic = [" || join(css(".contentTD")//text()[matches(.,"- *[0-9]")] ! replace(.,"(.*)- *([0-9]+)","[""$1"",""$2""]"),", ")|| "]; "' > dataBotanic.dump.js

  xidel http://www.hautschutzengel.de/komedogene-inhaltsstoffe.html -e '"var dataHautschutzengel = [" || join(id("komedogene_inhaltsstoffe")/tbody[2]/tr[position() ne last()]/x" [""{td[1]} / {td[2]}"", ""{td[3]}""] ",", ")|| "]; " ' > dataHautschutzEngel.dump.js


  cat dataAcneOrg.dump.js dataBotanic.dump.js dataHautschutzEngel.dump.js data.join.js algo.join.js > comedogenic.js

;;
release)
  cat dataAcneOrg.dump.js dataBotanic.dump.js dataHautschutzEngel.dump.js data.join.js algo.join.js > comedogenic.js 
  cp comedogenic.js $HGROOT/sites/web5/_publish/bin/others	
  cd $HGROOT/sites/web5/
  make
;;
esac
