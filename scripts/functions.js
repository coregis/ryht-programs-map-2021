function setVisibilityState(params) {
	if ((params.visibleOnLoad === undefined) || (params.visibleOnLoad === false)) {
		if ((params.legendID !== undefined) && (params.legendID !== false)) {
			document.getElementById(params.legendID).classList.add('inactive');
		}
		return 'none';
	} else {
		if ((params.legendID !== undefined) && (params.legendID !== false)) {
			document.getElementById(params.legendID).classList.remove('inactive');
		}
		return 'visible';
	}
}

function addPointLayer(map, params) {
	gus_api(params.gusID, params.gusPage, function(jsondata) {
		var visibilityState = setVisibilityState(params);
		if (params.scalingFactor === undefined) { params.scalingFactor = 2.5; }
		map.addSource(params.sourceName, {
			type: 'geojson',
			data: jsondata
		});
		map.addLayer({
			'id': params.layerName,
			'type': 'symbol',
			'source': params.sourceName,
			'layout': {
				'icon-image': params.icon,
				'icon-size': params.iconSize,
				'icon-allow-overlap': true,
				'visibility': visibilityState
			}
		});
		map.on("zoomend", function(){
			map.setLayoutProperty(params.layerName, 'icon-size', (1 + (map.getZoom() / originalZoomLevel - 1) * params.scalingFactor) * params.iconSize);
		});
		loadedPointLayers.push([params.layerName, params.legendID]);
		loadedPointLayerNames.push(params.layerName)
	});
}

function addVectorLayer(map, params) {
	var visibilityState = setVisibilityState(params);
	map.addSource(params.sourceName, {
		type: 'vector',
		url: params.sourceURL
	});
	if ((params.lineLayerName !== undefined) && (params.lineLayerName !== false)) {
		map.addLayer(
			{
				'id': params.lineLayerName,
				'type': 'line',
				'source': params.sourceName,
				'source-layer': params.sourceID,
				'layout': {
					'visibility': visibilityState,
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': params.lineColor,
					'line-width': 1
				},
			},
			params.displayBehind
		);
		if (params.legendID !== undefined) {
			loadedLineLayers.push([params.lineLayerName, params.legendID]);
		}
	}
	if ((params.polygonLayerName !== undefined) && (params.polygonLayerName !== false)) {
		if (params.usedInZoomControl) { visibilityState = 'visible'; }
		map.addLayer(
			{
				'id': params.polygonLayerName,
				'type': 'fill',
				'source': params.sourceName,
				'source-layer': params.sourceID,
				'layout': {
					'visibility': visibilityState
				},
				'paint': {
					'fill-color': params.polygonFillColor,
					'fill-outline-color': params.polygonOutlineColor
				},
			}
		);
		if (params.legendID !== undefined) {
			loadedPolygonLayers.push([params.polygonLayerName, params.legendID]);
		}
	}
}




// These are the popups for the polygon district layers, using Eldan's House/Senate 'show' logic
// When a click event occurs on a feature in the unioned districts layer, open a popup for
// the correct district type at the location of the click, with description HTML from its properties.
function fillpopup(data) {
	var html = "<span class='varname'>";
// the shorthand in this next line is just a compressed if...then.
// "if showHouseDistricts is true then use the first string, else the second"
	html += showHouseDistricts ? "House District: " : "Senate District: ";
	html += "</span><span class='attribute'>";
	html += showHouseDistricts ? data.HseDistNum : data.SenDistNum;
	html += "</span>";
	return html; //this will return the string to the calling function
}




function fetchJSONFile(path, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var data = JSON.parse(httpRequest.responseText);
				if (callback) callback(data);
			}
		}
	};
	httpRequest.open('GET', path);
	httpRequest.send();
}



function gus_api(id, page='od6', callback) {
	const url = `https://spreadsheets.google.com/feeds/cells/${id}/${page}/public/basic?alt=json`;

	fetchJSONFile(url, function(data) {

		let headers = {};
		let entries = {};

		data.feed.entry.forEach((e) => {
			// get the row number
			const row = parseInt(e.title['$t'].match(/\d+/g)[0]);
			const column = e.title['$t'].match(/[a-zA-Z]+/g)[0];
			const content = e.content['$t'];

			// it's a header
			if (row === 1) {
				headers[column] = content;
			} else {
				if (!entries[row]) entries[row] = {};
				entries[row][headers[column]] = content;
			}
		});

		const gj = { type: 'FeatureCollection', features: [] };
		for (let e in entries) {

			const feature = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [0, 0]
				},
				properties: entries[e]
			};

			for (let p in entries[e]) {
				switch(p.toLowerCase()) {
					case 'longitude':
					case 'long':
					case 'lng':
					case 'lon':
					case 'x':
					case 'xcoord':
						feature.geometry.coordinates[0] = parseFloat(entries[e][p]);
					case 'latitude':
					case 'lat':
					case 'y':
					case 'ycoord':
						feature.geometry.coordinates[1] = parseFloat(entries[e][p]);
				}
			}

			gj.features.push(feature);
		}

		callback(gj);
	});
};
