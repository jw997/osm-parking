import overpass
import geojson

api = overpass.API(timeout=100)


# api.get already returns a FeatureCollection, a GeoJSON type
res = api.get("""
(
   area["gnis:feature_id"="2409837"]->.searchArea;
  
 

  // nwr["parking"="multi-storey"][!capacity](area.searchArea);
//nwr["parking"="underground"][!capacity](area.searchArea);
//nwr["amenity"="parking"](area.searchArea);
//nwr["amenity"="parking_entrance"](area.searchArea);
//node["amenity"="parking"](area.searchArea);

//way["amenity"="parking"][capacity](area.searchArea);
//nwr["parking"][capacity](area.searchArea);

nwr["amenity"="parking"](area.searchArea);


);
(._;>;);
""")

# if you want a str, then use dumps function
#geojson_str = geojson.dumps(res)

# dump as file, if you want to save it in file
with open("../data/overpass.parking.geojson",mode="w") as f:
  geojson.dump(res,f)
