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
