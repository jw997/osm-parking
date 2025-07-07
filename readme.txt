how many parking spaces are there in Berkeley?

Off street parking
underground
multilevel
surface

open street map (OSM) has an optional capacity tag for the number of spaces.

For larger public lots here, you can look up the number of spots.
For some private lots, the number of spots exists in planning documents.

In OSM parking lots can be represent by ways or nodes.
In the case of a surface lot, the way is usually the outline of the lot.

The area of that lot can be used to estimate the nubmer of spots using a conversion factor of 100 parking spaces per acre.

Accoring to 
https://www.epa.gov/system/files/documents/2021-11/bmp-right-sized-residential-streets.pdf

roads less than 20 feet wide should have no parking, and roads 20 to 26 feet should have parking one side only.  >26 is wide enough for parking on both sides.

According to open street map.
Berkeley seems to have 400 km of roads.

Using berkeley gis, we can get a list of narrow roads, which can be filtered to Berkeley only.

wget -O narrowRoads.json 'https://gis.cityofberkeley.info/arcgis3/rest/services/Public/Portal_Planning/MapServer/18/quer
y?where=1%3D1&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&i
nSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&
returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=f
alse&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&r
eturnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&pa
rameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson'



14km less than 20 feet wide
65km 20 to 26 feet wide
320km >= 26 feet wide

1600 La Vereda 15 feet wide, but has parking one side in real life

 "FROMRIGHT": 1450,
      "TORIGHT": 1498,
      "FULLNAME": "PAGE ST",
      
      does not exist
      
      


