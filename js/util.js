import { getJson } from "./utils_helper.js";

// touch or mouse?
let mql = window.matchMedia("(pointer: fine)");
const pointerFine = mql.matches;
const SQUARE_METERS_PER_PARKING_SPACE = 35;  // just a guess for estimating parking spaces in a lot

const CITY_LAND_AREA = 27000000; // area in m^2 of land from wikipedia

const SQUARE_METERS_PER_STREET_PARKING_SPACE = 16.7;   // used to compute area occupied by on street parking
//https://usa.streetsblog.org/2016/07/05/parking-takes-up-more-space-than-you-think

const SFH_COUNT = 23945
// from DPO4 ACS 5 year 2023
// https://data.census.gov/table/ACSST5Y2023.S2504?q=vehicle&g=060XX00US0600190200
const OFFSTREET_HOUSING_PER_SFH = 1.5


// set default chart font color to black
Chart.defaults.color = '#000';
Chart.defaults.font.size = 14;

const selectData = document.querySelector('#selectData');
const selectMapTiles = document.querySelector('#selectMapTiles');



const checkMultilevel = document.querySelector('#checkMultilevel');
const checkUnderground = document.querySelector('#checkUnderground');
const checkSurface = document.querySelector('#checkSurface');


// street parking filters
const checkStreet = document.querySelector('#checkStreet');
const checkStreetNarrow = document.querySelector('#checkStreetNarrow');
const checkStreetVeryNarrow = document.querySelector('#checkStreetVeryNarrow');

// geo filters




const summary = document.querySelector('#summary');

const saveanchor = document.getElementById('saveanchor')

function getIcon(name) {
	const icon = new L.Icon({
		//	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/' + name,
		iconUrl: './images/' + name,
		//	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowUrl: './images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	return icon;

}

const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');

const w3_highway_brown = '#633517';
const w3_highway_red = '#a6001a';
const w3_highway_orange = '#e06000';
const w3_highway_schoolbus = '#ee9600';
const w3_highway_yellow = '#ffab00';
const w3_highway_green = '#004d33';
const w3_highway_blue = '#00477e';

const violet = "#9400d3";//"#EE82EE";

const black = "#000000";

const grey = "#101010";

//
"shop", "vacant", "land"
function getOptionsForMarker(markerType) {
	var colorValue;
	var rad = 4;
	var opa = 0.5;

	switch (markerType) {
		case 'active':
			colorValue = w3_highway_blue;

			break;

		case 'vacant':
			colorValue = w3_highway_red;
			rad = 3;
			opa = 1;
			break;

		case 'land':
			colorValue = w3_highway_brown;
			opa = 1;
			break;
		/*	case "Serious Injury":
		colorValue = w3_highway_orange;
		rad = 3;
		opa = 1;
		break;*/
		/*		case "Possible Injury":
					colorValue = w3_highway_yellow;
					break;
				
				case "Unspecified Injury":
					colorValue = violet;
					break;*/
		default:
			console.error("Unexpected market type ", markerType);
	}
	if (!pointerFine) {
		rad *= 1.5;
	}
	const retval = {
		color: colorValue,
		radius: rad,
		fill: true,
		fillOpacity: opa
	};
	return retval;

}


async function getDataFile(fName) {
	const file = './data/' + fName;
	const retval = await getJson(file);
	return retval;
}


async function getCityBoundary() {
	const file = './data/cityboundary/Land_Boundary.geojson';
	const retval = await getJson(file);
	return retval;
}

const cityGeoJson = await getCityBoundary();

/*

downtown .geojson
northside .geojson
fourth .geojson
gilman .geojson
westbrae .geojson
northbrae .geojson
solano .geojson
northshattuck .geojson

university .geojson
telegraph .geojson
elmwood .geojson
lorin .geojson
*/
// Business Districts 
const downtownGeoJson = await getDataFile('downtown.geojson');
const northsideGeoJson = await getDataFile('northside.geojson');

const fourthGeoJson = await getDataFile('fourth.geojson');
const gilmanGeoJson = await getDataFile('gilman.geojson');
const westbraeGeoJson = await getDataFile('westbrae.geojson');
const northbraeGeoJson = await getDataFile('northbrae.geojson');
const solanoGeoJson = await getDataFile('solano.geojson');
const northshattuckGeoJson = await getDataFile('northshattuck.geojson');
const universityGeoJson = await getDataFile('university.geojson');
const telegraphGeoJson = await getDataFile('telegraph.geojson');
const elmwoodGeoJson = await getDataFile('elmwood.geojson');
const lorinGeoJson = await getDataFile('lorin.geojson');

// street based areas
const sanpabloaveGeoJson = await getDataFile('sanpabloave.geojson');
const universityaveGeoJson = await getDataFile('universityave.geojson');
const sacramentoaveGeoJson = await getDataFile('sacramentoave.geojson');
const mlkwayGeoJson = await getDataFile('mlkway.geojson');
// ADD NEW GEO FILTER 
//const temescalGeoJson = await getDataFile('temescal.geojson');
//const valenciaGeoJson = await getDataFile('valencia.geojson');

// street network files
const narrowStreetsLT20GeoJson = await getDataFile('widthLT20Berkeley.geojson');
const narrowStreets2026GeoJson = await getDataFile('width20to26Berkeley.geojson');


var berkeleyTurfPolygon = turf.polygon(cityGeoJson.features[0].geometry.coordinates);
// make a turf polygon for the downtown busines district so we can clip points to it
var downtownTurfPolygon = turf.polygon(downtownGeoJson.features[0].geometry.coordinates);
var northsideTurfPolygon = turf.polygon(northsideGeoJson.features[0].geometry.coordinates);
var fourthTurfPolygon = turf.polygon(fourthGeoJson.features[0].geometry.coordinates);
var gilmanTurfPolygon = turf.polygon(gilmanGeoJson.features[0].geometry.coordinates);
var westbraeTurfPolygon = turf.polygon(westbraeGeoJson.features[0].geometry.coordinates);
var northbraeTurfPolygon = turf.polygon(northbraeGeoJson.features[0].geometry.coordinates);
var solanoTurfPolygon = turf.polygon(solanoGeoJson.features[0].geometry.coordinates);
var northshattuckTurfPolygon = turf.polygon(northshattuckGeoJson.features[0].geometry.coordinates);
var universityTurfPolygon = turf.polygon(universityGeoJson.features[0].geometry.coordinates);
var telegraphTurfPolygon = turf.polygon(telegraphGeoJson.features[0].geometry.coordinates);
var elmwoodTurfPolygon = turf.polygon(elmwoodGeoJson.features[0].geometry.coordinates);
var lorinTurfPolygon = turf.polygon(lorinGeoJson.features[0].geometry.coordinates);

var sanpabloaveTurfPolygon = turf.polygon(sanpabloaveGeoJson.features[0].geometry.coordinates);
var universityaveTurfPolygon = turf.polygon(universityaveGeoJson.features[0].geometry.coordinates);
var sacramentoaveTurfPolygon = turf.polygon(sacramentoaveGeoJson.features[0].geometry.coordinates);
var mlkwayTurfPolygon = turf.polygon(mlkwayGeoJson.features[0].geometry.coordinates);
// ADD NEW GEO FILTER 
//var temescalTurfPolygon = turf.polygon(temescalGeoJson.features[0].geometry.coordinates);
//var valenciaTurfPolygon = turf.polygon(valenciaGeoJson.features[0].geometry.coordinates);


var dataFileName = './data/overpass.parking.geojson';

const mapFileNameToJsonData = new Map();

async function getOsmGeoJsonData(dataFileName) {
	//const file = './data/osm.geojson';
	console.log("Loading data from ", dataFileName);

	if (!mapFileNameToJsonData.has(dataFileName)) {
		const data = await getJson(dataFileName);
		mapFileNameToJsonData.set(dataFileName, data);
	}
	const retval = mapFileNameToJsonData.get(dataFileName);
	return retval;
}

// changes whenever the date select changes

var osmGeoJson = await getOsmGeoJsonData(dataFileName);
/*
selectData.addEventListener("change", async (event) => {
	dataFileName = './data/osm' +  selectData.value + 'geojson';
	
	osmGeoJson = await getOsmGeoJsonData(dataFileName);
  });
*/
//console.log("Read ", osmShopJson.elements.length);

const popupFields = [
	'name',
	'addr:housenumber',
	'addr:street',
	'parking',
	'amenity',

	'building',
	'capacity',
	'computed_area',
	'computed_capacity',
	'building:levels',
	'type'
];
function nodePopup(tags) {
	var msg = "";

	for (const k of popupFields) {
		const v = tags[k];
		if (v) {
			msg += (k + ': ' + v + '<br>');
		}
	}
	if (msg == '') {
		msg = tags;
		console.log("missed popup ", msg);
	}
	return msg;
}

var map;
var tileLayerOSM;
var tileLayerGoogle;


function createMap() {
	// Where you want to render the map.
	var element = document.getElementById('osm-map');
	// Height has to be set. You can do this in CSS too.
	//element.style = 'height:100vh;';
	// Create Leaflet map on map element.
	map = L.map(element, {
		preferCanvas: true
	});
	// Add OSM tile layer to the Leaflet map.
	tileLayerOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	});

	const tileSpec = selectMapTiles.value;


	if (tileSpec == 'osm') {

		tileLayerOSM.addTo(map);

	}




	//tileLayerOSM.addTo(map);
	// Target's GPS coordinates.
	var target = L.latLng('37.87', '-122.27'); // berkeley 37°52′18″N 122°16′22″W
	// Set map's center to target with zoom 14.
	map.setView(target, 14);
	// add geojson precincts to map

	// add google aerial to map

	tileLayerGoogle = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
		maxZoom: 20,
		subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
	});

	if (tileSpec == 'google') {
		tileLayerGoogle.addTo(map);


	}


}

// changes whenever the tile selector

selectMapTiles.addEventListener("change", async (event) => {
	const tileSpec = selectMapTiles.value;

	if (tileSpec == 'none') {
		tileLayerGoogle.remove();
		tileLayerOSM.remove();
		return;
	}
	if (tileSpec == 'osm') {
		tileLayerGoogle.remove();
		tileLayerOSM.addTo(map);
		return;
	}
	if (tileSpec == 'google') {
		tileLayerGoogle.addTo(map);
		tileLayerOSM.remove();
		return;
	}

});


function createLegend() {
	const legend = L.control.Legend({
		position: "bottomleft",
		title: 'Open street map parking',
		collapsed: false,
		symbolWidth: 24,
		opacity: 0.8,
		column: 1,

		legends: [

			{
				label: "Active Commercial",
				type: "circle",
				color: w3_highway_blue,
				fillColor: w3_highway_blue
				//url: "./images/marker-highway-blue.png"
			},
			{
				label: "Vacant",
				type: "circle",
				color: w3_highway_red,
				fillColor: w3_highway_red

				//url: "./images/marker-highway-red.png",
			},
			{
				label: "Land",
				type: "circle",
				color: w3_highway_brown,
				fillColor: w3_highway_brown
				//url: "./images/marker-highway-blue.png"
			}
		]

	})
		.addTo(map);
}

createMap();

if (pointerFine) { // skip the legend for the mobile case.  maybe make a smaller legend?
	//	createLegend();
}

// add city boundary to map
L.geoJSON(cityGeoJson, { fillOpacity: 0.05 }).addTo(map);

// add downtown to map
L.geoJSON(downtownGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(northsideGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(fourthGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(gilmanGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(westbraeGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(northbraeGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(solanoGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(northshattuckGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(universityGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(telegraphGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(elmwoodGeoJson, { fillOpacity: 0.05 }).addTo(map);
L.geoJSON(lorinGeoJson, { fillOpacity: 0.05 }).addTo(map);

//L.geoJSON(sanpabloaveGeoJson, { fillOpacity: 0.05 }).addTo(map);
//L.geoJSON(universityaveGeoJson, { fillOpacity: 0.05 }).addTo(map);
// ADD NEW GEO FILTER

// add narrow streets
//   "PAV_WIDTH_RD": 15,
function onEachFeature(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.PAV_WIDTH_RD) {
		var msg = 'Width: ' + feature.properties.PAV_WIDTH_RD + ' feet';

		if (feature.properties.block_addr) {
			msg += '<br/>' + feature.properties.block_addr;
		}
		layer.bindPopup(msg);
	}
}


L.geoJSON(narrowStreetsLT20GeoJson, { color: w3_highway_red, fillOpacity: 0.05, onEachFeature: onEachFeature }).addTo(map);

L.geoJSON(narrowStreets2026GeoJson, { color: w3_highway_yellow, fillOpacity: 0.05, onEachFeature: onEachFeature }).addTo(map);




const resizeObserver = new ResizeObserver(() => {
	console.log("resize observer fired");
	map.invalidateSize();
});

resizeObserver.observe(document.getElementById('osm-map'));


// keep track of markers for removal
const markers = [];

function removeAllMakers() {
	for (const m of markers) {
		m.remove();
	}
}

const LatitudeDefault = 37.868412;
const LongitudeDefault = -122.349938;

function isStopAttr(a) {
	if (a.Stop_GlobalID) {
		return true;
	}
	return false;

}
function incrementMapKey(m, k) {
	m.set(k, m.get(k) + 1);
}

/*
Some amenties are not shops
*/
const nonShopAmenityValues = [
	'archive',
	'atm',
	'bbq',
	'bench',
	'bicycle_parking',
	'bicycle_rental',
	'bicycle_repair_station',
	'car_sharing',
	'clock',
	'drinking_water',
	'exhibit',
	'fountain',
	'give_box',
	//'fuel',
	'loading_dock',
	'locker',
	'motorcycle_parking',
	'parking',
	'parking_entrance',
	'parking_space',
	'polling_station',
	'post_box',
	'public_bookcase',
	'recycling',
	'relay_box',

	// TODO recycling_type==centre 

	'shelter',
	'table',
	'taxi',
	'telephone',
	'toilets',
	'vending_machine',
	'waste_basket',
	'waste_disposal',
	'wishing_tree'


];
function isShopLikeAmenity(amenityTag) {
	const bNonShop = nonShopAmenityValues.includes(amenityTag);


	const retval = !bNonShop;
	return retval
}

const shopLeisureValues = [
	'sports_centre',

	'fitness_centre',
	'sauna'
];

function isShopLikeLeisure(leisureTag) {
	const retval = shopLeisureValues.includes(leisureTag);


	return retval
}



function isShop(tags) {
	var bRetval = false;

	if (tags.shop || (tags.office) || (tags.craft)) {
		bRetval = true;
	}

	if (tags.healthcare) {
		bRetval = true;
	}

	if ((tags.leisure) && isShopLikeLeisure(tags.leisure)) {
		bRetval = true;
	}
	if (tags.amenity && isShopLikeAmenity(tags.amenity)) {
		bRetval = true;
	}
	if (tags.tourism == 'hotel') {
		bRetval = true;
	}
	return bRetval;
}

function isVacant(tags) {
	var bRetval = false;
	// include shops
	if (tags['disused:shop']) {
		bRetval = true;
	}

	if (tags['disused:amenity'] && isShopLikeAmenity(tags['disused:amenity'])) {
		bRetval = true;
	}
	if (tags['disused:leisure'] && isShopLikeAmenity(tags['disused:leisure'])) {
		bRetval = true;
	}
	if (tags['disused:office']) {
		bRetval = true;
	}
	if (tags['disused:healthcare']) {
		bRetval = true;
	}
	if (tags.vacant == 'yes') {
		bRetval = true;
	}
	if (tags.abandoned == 'yes') {
		bRetval = true;
	}

	if (tags.building && tags.disused == 'yes') {
		bRetval = true;
	}
	/*	if (tags.landuse == 'brownfield') {
			bRetval = true;
		}
		if (tags.landuse == 'greenfield') {
			bRetval = true;
		}*/
	return bRetval;
}

function isLand(tags) {
	if (tags.landuse == 'brownfield' || tags.landuse == 'greenfield') {
		return true;
	}
	if (tags.landuse == 'brownfield' || tags.landuse == 'greenfield') {
		return true;
	}
}

function getPointFromeature(feature) {
	const geom = feature.geometry;
	const fType = geom.type;
	var retval = null;

	if (fType == 'Point') {
		retval = geom.coordinates;
	} else if (fType == 'Polygon') {
		retval = geom.coordinates[0][0];
	} else if (fType == 'LineString') {
		retval = geom.coordinates[0][0];
	} else if (fType == 'MultiPolygon') {
		retval = geom.coordinates[0][0][0];
	}
	if (!retval) {
		console.log("no point for feature", feature)
	}
	return retval;
}


/*	if (!turf.booleanPointInPolygon(tp, downtownTurfPolygon)) {
					//console.log("Skipping item not in district ", tags)
					incrementMapKey(histShopData, arrShopKeys[2]);
					continue;
				}*/





var dataCapacityVsCalculated = [];

const carLength = 22;

const regStreetskm = 321;
const narrowStreetskm = 65;
const veryNarrowStreetskm = 14;

const ftPerKm = 1602;

const regStreetsft = regStreetskm * ftPerKm;
const narrowStreetsft = narrowStreetskm * ftPerKm;
const veryNarrowStreetsft = veryNarrowStreetskm * ftPerKm;

const parkability = 0.67;  // computed from sample blocks, percent of length usable for parking

const regStreetSides = 2;
const narrowStreetSides = 1;
const veryNarrowStreetSides = 0.5;

const regStreetsParking = Math.floor(regStreetsft * regStreetSides * parkability / carLength);
const narrowStreetsParking = Math.floor(narrowStreetsft * narrowStreetSides * parkability / carLength);
const veryNarrowStreetsParking = Math.floor(veryNarrowStreetsft * veryNarrowStreetSides * parkability / carLength);

function totalStreetParking() {
	return regStreetsParking + narrowStreetsParking + veryNarrowStreetsParking;
}
function areaStreetParking() {
	return Math.floor(totalStreetParking() * SQUARE_METERS_PER_STREET_PARKING_SPACE);
}
function makeStreetMsg() {

	var msg =

		'Street Parking >=26 feet: ' + regStreetsParking + '</br>' +
		'Street Parking 20-26 feet: ' + narrowStreetsParking + '</br>' +
		'Street Parking: <= 20 feet: ' + veryNarrowStreetsParking + '</br>' +
		'Street Parking Area (m^2): ' + areaStreetParking() + '</br>' +
		'Street Parking Area Percentage: ' + (100.0 * areaStreetParking() / CITY_LAND_AREA).toFixed(2) + '</br>'
	return msg;
}

function totalSFHParking() {
	return Math.floor(SFH_COUNT * OFFSTREET_HOUSING_PER_SFH);
}
function areaSFHParking() {
	return Math.floor(totalSFHParking() * SQUARE_METERS_PER_STREET_PARKING_SPACE);
}
function makeSFHMesg() {

	var msg =

		'Single Family Houses: ' + SFH_COUNT + '</br>' +
		'SFH Parking per House: ' + OFFSTREET_HOUSING_PER_SFH + '</br>' +
		'SFH Offstreet Parking: ' + totalSFHParking() + '</br>' +
		'SFH Parking Area (m^2): ' + areaSFHParking() + '</br>' +
		'SFH Parking Area Percentage: ' + (100.0 * areaSFHParking() / CITY_LAND_AREA).toFixed(2) + '</br>';
	return msg;
}

function addMarkers(osmJson) {
	//removeAllMakers();
	dataCapacityVsCalculated = [];
	const markersAtLocation = new Map();
	// add collisions to map
	var markerCount = 0
	var skipped = 0, plotted = 0;

	var arrMappedOsmItems = [];

	// Summary statistics
	var countParkingLots = 0;
	var countParkingSpaces = 0;
	var areaParking = 0;  // area in sq meters

	var checkComputed = 0;
	var checkCapacity = 0;

	for (const osmItem of osmJson.features) {
		//const attr = osmItem.elements; 
		//const tags = osmItem.tags;
		//	console.log(tags)



		const tags = osmItem.properties.tags;
		const bWay = (osmItem.properties.type == 'way');
		const bNode = (osmItem.properties.type == 'node');
		const bRelation = (osmItem.properties.type == 'relation');


		// Multilevel "parking": "multi-storey"
		const bMultilevel = (tags.parking == 'multi-storey');
		// Surface "parking": "surface"
		var bSurface = (tags.parking == 'surface' || !tags.parking);
		// underground "parking": "underground"
		const bUnderground = (tags.parking == 'underground');

		if (!bUnderground && !bMultilevel) {
			bSurface = true;  // default weird types to surface
		}


		if (bMultilevel && !checkMultilevel.checked) {
			continue
		}
		if (bSurface && !checkSurface.checked) {
			continue
		}
		if (bUnderground && !checkUnderground.checked) {
			continue
		}


		if (!tags) {
		
			continue;
		}

		var bInclude = true; //

		if (!bInclude) {
			//	console.log("Filtered out ", tags.name);
		
			continue;
		}

		plotted++;


		const point = getPointFromeature(osmItem);

		const lat = point[1];
		const long = point[0]

		if (lat && long) {
			const loc = [lat, long];
			const tp = turf.point([long, lat]);

			tags.lat = lat;
			tags.lon = long;
			const arrParkingKeys = ['Surface', 'Multilevel', 'Underground'];
			arrMappedOsmItems.push(tags); // add to array for export function

			if (bSurface) {
				incrementMapKey(histParkingData, arrParkingKeys[0]);
			} else if (bMultilevel) {
				incrementMapKey(histParkingData, arrParkingKeys[1]);
			} else if (bUnderground) {
				incrementMapKey(histParkingData, arrParkingKeys[2]);
			}



			var opt = getOptionsForMarker('active');


			if (bNode) {
				// can't estimate capacity from area
				if (!tags.capacity) {
					console.log("No capacity for node ", tags.id)
				}
				var marker = L.circleMarker([lat, long], opt);


				var msg = nodePopup(tags)


				marker.bindPopup(msg).openPopup();


				marker.addTo(map);
				markers.push(marker);  // used to remove anchor dots 
			}



			if (bWay) {
				opt = getOptionsForMarker('land');
				opt.fillOpacity = .3
				const polyMarker = L.geoJSON(osmItem, opt);

				polyMarker.addTo(map);
				markers.push(polyMarker);


				// compute surrounded area?

				if (osmItem.geometry.type == 'Polygon') {
					var polygon = turf.polygon(osmItem.geometry.coordinates);

					var area = turf.area(polygon); // area in square meters
					areaParking += area;

					if (tags.parking == 'multi-storey' && (tags['building:levels'] > 1)) {
						area = area * tags['building:levels'];
					}

					osmItem.properties.tags.computed_area = Math.floor(area);

					osmItem.properties.tags.computed_capacity = Math.floor(area / SQUARE_METERS_PER_PARKING_SPACE);

				}
				var msg = nodePopup(tags);
				polyMarker.bindPopup(msg);
			}
			if (bRelation) { // relations are for parking lots with holes aka multi-polygons

				opt = getOptionsForMarker('land');
				opt.fillOpacity = .3
				const polyMarker = L.geoJSON(osmItem, opt);
				polyMarker.addTo(map);
				polyMarker.bindPopup(msg);
				markers.push(polyMarker);

				if (osmItem.geometry.type == 'MultiPolygon') {
					var polygon = turf.multiPolygon(osmItem.geometry.coordinates);

					var area = turf.area(polygon); // area in square meters
					areaParking += area;

					if (tags.parking == 'multi-storey' && (tags['building:levels'] > 1)) {
						area = area * tags['building:levels'];
					}

					osmItem.properties.tags.computed_area = Math.floor(area);

					osmItem.properties.tags.computed_capacity = Math.floor(area / SQUARE_METERS_PER_PARKING_SPACE);
				}
				var msg = nodePopup(tags);
				polyMarker.bindPopup(msg);

			}


			if (tags.capacity && tags.computed_capacity) {
				const datum = { x: parseInt(tags.capacity), y: tags.computed_capacity };
				dataCapacityVsCalculated.push(datum);

				checkCapacity += parseInt(tags.capacity);
				checkComputed += tags.computed_capacity;

			}

			countParkingLots++;
			if (tags.capacity) {
				countParkingSpaces += parseInt(tags.capacity);
			} else {

				if (tags.computed_capacity) {
					countParkingSpaces += parseInt(tags.computed_capacity);
				}
			}


			markerCount++;
		} else {
			
			skipped++;
		}
	}
	console.log('Skipped', skipped);
	console.log('Plotted', plotted);
	console.log("markerCount ", markerCount)

	console.log("total computed ", checkComputed)
	console.log("total capacity ", checkCapacity)
	console.log("Check capacity estimate ", checkComputed / checkCapacity);



	const sfhMesg = makeSFHMesg();

	const streetMsg = makeStreetMsg();

	const countTotalSpaces = countParkingSpaces + totalStreetParking() + totalSFHParking();
	const areaTotalSpaces = areaParking + areaStreetParking() + areaSFHParking();


	const summaryMsg = '<br>Parking lots:' + countParkingLots +
		'<br>Parking Lot Spaces: ' + countParkingSpaces +
		'<br>Parking Area (m^2): ' + Math.floor(areaParking) +
		'<br>Parking Area percentage : ' + (100.0 * areaParking / CITY_LAND_AREA).toFixed(2)
		// 27.02 km2 city land area on wikipedia

		+ '<br>' + '<br>'
		+ streetMsg + '<br>'
		+ sfhMesg + '<br>'

		+
		'<br>Total Parking Spaces: ' + countTotalSpaces +
		'<br>Total Parking Area (m^2): ' + Math.floor(areaTotalSpaces) +
		'<br>Total Area percentage : ' + (100.0 * areaTotalSpaces / CITY_LAND_AREA).toFixed(2)



		+ '<br>';



	summary.innerHTML = summaryMsg;

	// set array for download
	const json = JSON.stringify(arrMappedOsmItems, null, 2);
	const inputblob = new Blob([json], {
		type: "application/json",
	});
	const u = URL.createObjectURL(inputblob);
	saveanchor.href = u;

}

// chart data variables
// ADD NEW CHART
var histParkingData = new Map();  // bars Shop, Vacant
const arrParkingKeys = ['Surface', 'Multilevel', 'Underground'];


/* histogram data */
function clearHistData(keys, data) {
	for (const f of keys) {
		data.set(f, 0);
	}
}

// ADD NEW CHART
clearHistData(arrParkingKeys, histParkingData);

// chart variables
// ADD NEW CHART
var histParkingChart;

var scatterCapacity;

function addData(chart, label, newData) {
	chart.data.labels.push(label);
	chart.data.datasets.forEach((dataset) => {
		dataset.data = newData;
	});
	chart.update();
}

function removeData(chart) {
	chart.data.labels.pop();
	chart.data.datasets.forEach((dataset) => {
		dataset.data = [];
	});
	chart.update();
}

function createOrUpdateScatterChart(xydata, chartVar, element, labelText) {
	// data should be an array of objects with integer members  x and y

	const data = {
		datasets: [
			{
				label: 'Parking Capacity',
				data: xydata
			}
		]
	};

	const config = {
		type: 'scatter',
		data: data,
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: 'top',
				},
				title: {
					display: false,
					text: 'Reported vs computed capacity'
				}
			},

			scales: {
				x: {
					min: 0,
					type: 'linear',
					position: 'bottom',
					title: {
						color: 'red',
						display: true,
						text: 'Reported Capacity'
					}
				},
				y: {
					min: 0,
					type: 'linear',
					position: 'left',
					title: {
						color: 'red',
						display: true,
						text: 'Calculated Capacity'
					}
				}
			}
		}

	};

	if (chartVar == undefined) {
		chartVar = new Chart(element, config);
	} else {

		removeData(chartVar);
		addData(chartVar, "updated label", xydata);
	}
	return chartVar;
}


function createOrUpdateChart(data, chartVar, element, labelText) {
	// data should be an array of objects with members bar and count
	if (chartVar == undefined) {
		chartVar = new Chart(element
			,
			{
				type: 'bar',
				data: {
					labels: data.map(row => row.bar),
					datasets: [
						{
							label: labelText,
							data: data.map(row => row.count)
						}
					]
				}
			}
		);
	} else {
		// update data

		const newData = {
			label: labelText,
			data: data.map(row => row.count)
		}

		chartVar.data.datasets.pop();
		chartVar.data.datasets.push(newData);
		//	console.log(newData);
		chartVar.update();
	}
	return chartVar;
}


function handleFilterClick() {
	// ADD NEW CHART
	clearHistData(arrParkingKeys, histParkingData);


	// reset summary counts 



	removeAllMakers();
	addMarkers(osmGeoJson

	);


	// ADD NEW CHART
	const dataParking = [];

	for (const k of arrParkingKeys) {
		dataParking.push({ bar: k, count: histParkingData.get(k) })
	}

	// ADD NEW CHART
	histParkingChart = createOrUpdateChart(dataParking, histParkingChart, document.getElementById('parkingHist'),
		'Parking');


	/* make scatter chart */


	scatterCapacity = createOrUpdateScatterChart(dataCapacityVsCalculated, scatterCapacity, document.getElementById('countVsCalculationScatter'),
		'Capacity vs Calculated Capacity');





}

function handleExportClick() {
	handleFilterClick();
}


saveanchor.addEventListener(
	"click", handleExportClick
	//	 (event) => (event.target.href = canvas.toDataURL()),
);


/* unused stuff

*/




export {


	map, handleFilterClick
};