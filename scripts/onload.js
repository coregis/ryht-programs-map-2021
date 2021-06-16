map.on('click', 'school_house_senate_districts_UNION-poly', function (e) {
	var pointFeatures = map.queryRenderedFeatures(e.point, {layers: loadedPointLayerNames});
	if (pointFeatures.length === 0) {
		new mapboxgl.Popup()
			.setLngLat(e.lngLat)
			.setHTML(fillpopup(e.features[0].properties))
			.addTo(map);
	}
});

// Change the cursor to a pointer when the mouse is over the house districts layer.
map.on('mouseenter', 'school_house_senate_districts_UNION-poly', function () {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'school_house_senate_districts_UNION-poly', function () {
	map.getCanvas().style.cursor = '';
});
