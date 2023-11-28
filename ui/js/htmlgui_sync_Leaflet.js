/**********************************************************************
	 htmlgui_sync_Leaflet.js

$Comment: provides an interface to Leaflet API functions to svggis
$Source : htmlgui_sync_Mapstratcion.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2017/09/19 $
$Author: guenter richter $
$Id: htmlgui_sync_Leaflet.js 1 2017-09-19 22:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_sync_Leaflet.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides an interface to the Leaflet API for html maps. It maps htmlgui calls to the Leaflet API<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

(function (window, document, undefined) {

	function expose() {
		var oldIxmaps = window.ixmaps;

		ixmaps.noConflict = function () {
			window.ixmaps = oldIxmaps;
			return this;
		};

		window.ixmaps = ixmaps;
	}

	// define Data for Node module pattern loaders, including Browserify
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = ixmaps;

		// define Data as an AMD module
	} else if (typeof define === 'function' && define.amd) {
		define(ixmaps);
	}

	// define Data as a global variable, saving the original Data to restore later if needed
	if (typeof window !== 'undefined') {
		expose();
	}

	ixmaps.htmlMap_Api = "Leaflet";

	ixmaps.tmp = ixmaps.tmp || {};

	/* ------------------------------------------------------------------ * 
		local variables
	 * ------------------------------------------------------------------ */

	var geocoder = null;
	var ptLatLonInitGMap = null;
	var newZoomInitGMap = null;
	var lastLeafletLayer = null;

	var LMap;

	/* ------------------------------------------------------------------ * 
		local helper
	 * ------------------------------------------------------------------ */

	var __addTileLayer = function (tile_url, options) {
		var layerName;
		if (options && options.name) {
			layerName = options.name;
			delete options.name;
		} else {
			layerName = 'Tiles';
		}
		ixmaps.layers[layerName] = L.tileLayer(tile_url, options || {});
	};

	ixmaps.addControls = function (args) {
		if (args.zoom) {
			if (ixmaps.lastZoomControl) {
				LMap.removeControl(ixmaps.lastZoomControl);
			}
			var zoom = new L.Control.Zoom();
			if (args.zoom.position) {
				zoom = new L.Control.Zoom({
					position: args.zoom.position
				});
			}
			LMap.addControl(zoom);
			ixmaps.lastZoomControl = zoom;
		} else {
			if (ixmaps.lastZoomControl) {
				LMap.removeControl(ixmaps.lastZoomControl);
				ixmaps.lastZoomControl = null;
			}
		}
		if (args.map_type) {
			var layersControl = new L.Control.Layers(ixmaps.layers, ixmaps.features);
			LMap.addControl(layersControl);
			ixmaps.lastLayerControl = layersControl;
		} else {
			if (ixmaps.lastLayerControl) {
				LMap.removeControl(ixmaps.lastLayerControl);
			}
		}
	};

	/* ------------------------------------------------------------------ * 
		h e r e   w e   g o
	 * ------------------------------------------------------------------ */

	ixmaps.loadGMap = function (szMapService) {

		if (!this.szGmapDiv) {
			return;
		}
		if ((typeof (szMapService) == "undefined") || (szMapService.length == 0)) {
			szMapService = "leaflet";
		}

		// ---------------------
		// create map
		// ---------------------

		LMap = L.map(this.szGmapDiv, {
			zoomControl: false,
			zoomSnap: 0,
			gestureHandling: ((ixmaps.scrollsafe | ixmaps.scrollsafesilent) ? true : false),
			gestureHandlingOptions: {
				duration: ixmaps.scrollsafesilent ? 0 : 1000
			}
		});

		// ---------------------
		// define event handler
		// ---------------------

		LMap.on('zoomstart', function (n, s, a) {
			ixmaps.tmp.inZoom = true;
			ixmaps.embeddedSVG.window.map.Api.freezeMap(true);
		});
		LMap.on('zoom', function (n, s, a) {
			ixmaps.htmlgui_synchronizeSVG();
		});
		LMap.on('zoomend', function (n, s, a) {
			ixmaps.tmp.inZoom = false;
			ixmaps.embeddedSVG.window.map.Api.freezeMap(false);
			ixmaps.htmlgui_synchronizeSVG();
		});

		LMap.on('movestart', function (n, s, a) {
			ixmaps.htmlgui_panSVGStart();
		});
		LMap.on('move', function (n, s, a) {
			if (!ixmaps.tmp.inZoom) {
				ixmaps.htmlgui_panSVG();
			}
		});
		LMap.on('moveend', function (n, s, a) {
			ixmaps.htmlgui_panSVGEnd();
			ixmaps.embeddedSVG.window.map.Api.freezeMap(false);
			ixmaps.htmlgui_synchronizeSVG();
		});


		ixmaps.layers = [];

		// ---------------------
		// define the tile layer
		// ---------------------

		/** Nokia OVI Maps */

		__addTileLayer("http://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8", {
			name: "NOKIA",
			myname: "NOKIA",
			minZoom: 2,
			attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			subdomains: ['khm0', 'khm1', 'khm2', 'khm3']
		});
		__addTileLayer("http://maptile.maps.svc.ovi.com/maptiler/maptile/newest/normal.day.transit/{z}/{x}/{y}/256/png8", {
			name: "NOKIA OVI - transit",
			myname: "NOKIA OVI - transit",
			minZoom: 2,
			attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			subdomains: ['khm0', 'khm1', 'khm2', 'khm3']
		});
		__addTileLayer("http://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=IhE4BDSYudkb1itnuARB&token=5636fffT2ok28aFX4lciGg&lg=ENG", {
			name: "NOKIA - satellite",
			myname: "NOKIA - satellite",
			minZoom: 2,
			maxZoom: 22,
			attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			subdomains: ['1', '2', '3', '4']
		});
		__addTileLayer("http://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?app_id=IhE4BDSYudkb1itnuARB&token=5636fffT2ok28aFX4lciGg&lg=ENG", {
			name: "NOKIA - terrain",
			myname: "NOKIA - terrain",
			minZoom: 2,
			attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			subdomains: ['1', '2', '3', '4']
		});

		/** WAZE */

		__addTileLayer("http://worldtiles3.waze.com/tiles/{z}/{x}/{y}.png", {
			name: "WAZE",
			myname: "WAZE",
			minZoom: 2,
			attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			subdomains: ['khm0', 'khm1', 'khm2', 'khm3']
		});

		/** mapbox */

		__addTileLayer("http://{s}.tiles.mapbox.com/v3/examples.bc17bb2a/{z}/{x}/{y}.png", {
			name: "MapBox - OSM",
			myname: "MapBox - OSM",
			minZoom: 2,
			attribution: '<a href="https://www.mapbox.com/about/maps">© Mapbox</a> <a href="http://openstreetmap.org/copyright">© OpenStreetMap</a> | <a href="http://mapbox.com/map-feedback/" class="mapbox-improve-map">Improve this map</a>',
			subdomains: ['a', 'b', 'c', 'd']
		});

		/** open street map */

		__addTileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			name: "OpenStreetMap - Osmarenderer",
			myname: "OpenStreetMap - Osmarenderer",
			minZoom: 2,
			maxZoom: 22,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", {
			name: "OpenStreetMap - wikipedia",
			myname: "OpenStreetMap - wikipedia",
			minZoom: 2,
			attribution: 'Wikimedia maps beta | Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
			subdomains: ['a', 'b', 'c'],
			maxZoom: 20
		});
		__addTileLayer("http://korona.geog.uni-heidelberg.de:8008/tms_rg.ashx?x={x}&y={y}&z={z}", {
			name: "OpenStreetMap - gray",
			myname: "OpenStreetMap - gray",
			minZoom: 2,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['tiles1', 'tiles2', 'tiles3', 'tiles4']
		});
		__addTileLayer("http://korona.geog.uni-heidelberg.de:8001/tms_r.ashx?x={x}&y={y}&z={z} ", {
			name: "OpenStreetMap - roads",
			myname: "OpenStreetMap - roads",
			minZoom: 2,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['tiles1', 'tiles2', 'tiles3', 'tiles4']
		});
		__addTileLayer("http://korona.geog.uni-heidelberg.de:8007/tms_b.ashx?x={x}&y={y}&z={z}", {
			name: "OpenStreetMap - admin",
			myname: "OpenStreetMap - admin",
			minZoom: 2,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['tiles1', 'tiles2', 'tiles3', 'tiles4']
		});
		__addTileLayer("http://korona.geog.uni-heidelberg.de:8007/tms_b.ashx?x={x}&y={y}&z={z}", {
			name: "OpenStreetMap - admin - dark",
			myname: "OpenStreetMap - admin - dark",
			minZoom: 2,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['tiles1', 'tiles2', 'tiles3', 'tiles4']
		});
		__addTileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			name: "OpenStreetMap - FR",
			myname: "OpenStreetMap - FR",
			minZoom: 2,
			maxZoom: 19,
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['a', 'b', 'c']
		});
		__addTileLayer("http://tile.opencyclemap.org/transport/{z}/{x}/{y}.png", {
			name: "OpenStreetMap - Transport",
			myname: "OpenStreetMap - Transport",
			minZoom: 2,
			attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});

		/** MapQuest */

		__addTileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
			name: "MapQuest - OSM (EU)",
			myname: "MapQuest - OSM (EU)",
			minZoom: 2,
			attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});

		/** ArcGis */

		__addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png", {
			name: "ArcGIS - Topo",
			myname: "ArcGIS - Topo",
			minZoom: 2,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.png", {
			name: "ArcGIS - Light Gray Base",
			myname: "ArcGIS - Light Gray Base",
			minZoom: 2,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});

		__addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}.png", {
			name: "ArcGIS - Ocean Basemap",
			myname: "ArcGIS - Ocean Basemap",
			minZoom: 2,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.png", {
			name: "ArcGIS - Hillshade",
			myname: "ArcGIS - Hillshade",
			minZoom: 2,
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});

		__addTileLayer("http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
			name: "OpenTopoMap",
			myname: "OpenTopoMap",
			minZoom: 2,
			maxZoom: 17,
			attribution: "Kartendaten: © <a href='https://openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © <a href='http://opentopomap.org' target='_blank'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/' target='_blank'>CC-BY-SA</a>)",
			subdomains: ['a', 'b', 'c']
		});

		__addTileLayer("http://openptmap.org/tiles/{z}/{x}/{y}.png", {
			name: "OpenPtMap",
			myname: "OpenPtMap",
			minZoom: 2,
			maxZoom: 17,
			attribution: "OpenPtMap",
			subdomains: ['a', 'b', 'c']
		});

		__addTileLayer("http://{s}.openpistemap.org/landshaded/{z}/{x}/{y}.png", {
			name: "Openpistemap landschaded",
			myname: "Openpistemap landschaded",
			minZoom: 2,
			attribution: "openpistemap",
			subdomains: ['tiles2', 'tiles2', 'tiles2', 'tiles2']
		});

		__addTileLayer("#", {
			name: "Black",
			myname: "Black",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "White",
			myname: "White",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "Gray",
			myname: "Gray",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "black",
			myname: "black",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "white",
			myname: "white",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "gray",
			myname: "gray",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});
		__addTileLayer("#", {
			name: "transparent",
			myname: "transparent",
			minZoom: 0,
			attribution: ".",
			subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
		});

		/** Stamen Design */

		__addTileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png", {
			name: "Stamen - toner",
			myname: "Stamen - toner",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://www.stamen.com/' target='_blank'>Stamen Design</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/about/' target='_blank'>OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		__addTileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
			name: "Stamen - toner-lite",
			myname: "Stamen - toner-lite",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://www.stamen.com/' target='_blank'>Stamen Design</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/about/' target='_blank'>OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		__addTileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png", {
			name: "Stamen - toner-hybrid",
			myname: "Stamen - toner-hybrid",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://www.stamen.com/' target='_blank'>Stamen Design</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/about/' target='_blank'>OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		__addTileLayer("https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg", {
			name: "Stamen - watercolor",
			myname: "Stamen - watercolor",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://www.stamen.com/' target='_blank'>Stamen Design</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/about/' target='_blank'>OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});
		__addTileLayer("https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg", {
			name: "Stamen - terrain",
			myname: "Stamen - terrain",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://www.stamen.com/' target='_blank'>Stamen Design</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/about/' target='_blank'>OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		/** CartoDB */

		__addTileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
			name: "CartoDB - Positron",
			myname: "CartoDB - Positron",
			minZoom: 2,
			attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a></a>",
			subdomains: ['a', 'b', 'c', 'd']
		});
		__addTileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
			name: "CartoDB - Dark matter",
			myname: "CartoDB - Dark matter",
			minZoom: 2,
			attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a></a>",
			subdomains: ['a', 'b', 'c', 'd']
		});
		__addTileLayer("http://demographics.virginia.edu/DotMap/tiles4/{z}/{x}/{y}.png", {
			name: "RaceDotMap",
			myname: "RaceDotMap",
			minZoom: 2,
			attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a></a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		/** MapTiler.org */

		__addTileLayer("https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=LudxviPEVIlE5TvReqTC", {
			name: "MapTiler - Positron",
			myname: "MapTiler - Positron",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.maptiler.com/copyright/' target='_blank'>© MapTiler</a> <a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});
		__addTileLayer("https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=LudxviPEVIlE5TvReqTC", {
			name: "MapTiler - Dark Matter",
			myname: "MapTiler - Dark Matter",
			minZoom: 2,
			attribution: "&copy; <a href='https://www.maptiler.com/copyright/' target='_blank'>© MapTiler</a> <a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
			subdomains: ['a', 'b', 'c', 'd']
		});

		__cssControls = function (szId) {
			if (!szId) {
				return;
			}
			if (szId.match(/dark/i) || szId.match(/black/i) || szId.match(/satellite/i)) {

				$("#attribution").css("background-color", "rgba(0,0,0,1)");

				$(".leaflet-bar a").css("opacity", "0.7");
				$(".leaflet-bar a").css("background-color", "#333333");
				$(".leaflet-bar a").css("color", "#888888");
				$(".leaflet-bar a").css("border", "solid #888888 0.5px");

				setTimeout('$(".leaflet-control-attribution a").css("color","#ddd")', 50);
				setTimeout('$(".leaflet-control-attribution").css("color","#888")', 50);
				setTimeout('$(".leaflet-control-attribution").css("background","#000")', 50);
				setTimeout('$(".leaflet-control-attribution").css("opacity","1")', 50);
				setTimeout('$(".leaflet-control-zoom").css("opacity","0.9")', 50);
				setTimeout('$(".leaflet-control-zoom").css("border","solid black 1px")', 50);

			} else {
				$("#attribution").css("background-color", "rgba(255,255,255,0.5)");

				$(".leaflet-bar a").css("opacity", "0.7");
				$(".leaflet-bar a").css("background-color", "#ffffff");
				$(".leaflet-bar a").css("color", "#888888");
				$(".leaflet-bar a").css("border", "solid #dddddd 1px");

				setTimeout('$(".leaflet-control-attribution").css("background","#fff")', 50);
				setTimeout('$(".leaflet-control-attribution").css("opacity","0.8")', 50);
				setTimeout('$(".leaflet-control-zoom").css("opacity","0.8")', 50);
				setTimeout('$(".leaflet-control-zoom").css("border","solid #aaaaaa 1px")', 50);
			}
		};

		// ----------------------
		// set the active layer
		// ----------------------
		/**
		if (!ixmaps.fMapType || !ixmaps.layers[ixmaps.fMapType]) {
			ixmaps.message("leaflet map type \"" + ixmaps.fMapType + "\" unknown! -> set to default: \"Stamen - toner-lite\"");
			ixmaps.fMapType = "Stamen - toner-lite";
		}
		**/
		htmlMap_setMapTypeId(ixmaps.fMapType);
		ixmaps.htmlgui_setMapTypeBG(ixmaps.fMapType);

		/**
		LMap.addLayer(ixmaps.layers[ixmaps.fMapType]);

		lastLeafletLayer = ixmaps.fMapType;
		try {
			ixmaps.htmlgui_setMapTypeBG(lastLeafletLayer);
		} catch (e) {}
		**/
		__cssControls(lastLeafletLayer);
		
		// --------------------
		// map controls
		// --------------------

		if (ixmaps.fMapControls) {
			ixmaps.addControls({
				pan: false,
				zoom: {
					position: 'bottomleft'
				},
				map_type: (ixmaps.mapTypeSelection ? true : false)
			});
		}

		if (ixmaps.scrollWheelZoom) {
			LMap.scrollWheelZoom.enable();
		}

		// hook on 'baselayerchange' to get the actual layer name
		// while Leaflet doesn't publish the option 'name',
		// we must use a workaround and set a private layer name in .myname (see above)
		// ------------------------------------------------------------------------------------------
		LMap.on('baselayerchange', function (e) {
			lastLeafletLayer = e.layer.options.myname;
			try {
				ixmaps.htmlgui_setMapTypeBG(lastLeafletLayer);
			} catch (e) {}
			__cssControls(lastLeafletLayer);
		});


		htmlMap_setZoom(2);

		return LMap;
	}

	/* ------------------------------------------------------------------ * 
		Synchronization of SVG and Leaflet map
	* ------------------------------------------------------------------ */

	/** 
	 * interchange format of bounds is an array of 2 lat/lon point objects
	 * array({lat:p1.lat,lng:p1.lng},{lat:p2.lat,lng:p2.lng}); 
	 * p1 = south/west point; p2 = north/east point
	 */

	htmlMap_getZoom = function () {
		return LMap.getZoom();
	}
	htmlMap_setZoom = function (nZoom) {
		return LMap.setZoom(nZoom, {
			animate: true
		});
	}
	htmlMap_getCenter = function () {
		var center = LMap.getCenter();
		return {
			lat: center.lat,
			lng: center.lng
		};
	}
	xhtmlMap_getCenter = function () {
		var bounds = LMap.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		return {
			lat: swPoint.lat + (nePoint.lat - swPoint.lat) / 2,
			lng: swPoint.lng + (nePoint.lng - swPoint.lng) / 2
		};
	}

	htmlMap_getBounds = function () {
		var bounds = LMap.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		return new Array({
			lat: swPoint.lat,
			lng: swPoint.lng
		}, {
			lat: nePoint.lat,
			lng: nePoint.lng
		});
	}

	htmlMap_setCenter = function (ptLatLon) {
		LMap.panTo(
			new L.latLng(ptLatLon.lat,
				ptLatLon.lng), {
				animate: false
			}
		);
	}

	htmlMap_flyTo = function (ptLatLon, zoom) {
		LMap.flyTo([ptLatLon.lat, ptLatLon.lng], zoom);
	}

	// new parameter fZoomTo
	// necessary because setBounds() used also for setCenter()
	// in mapstraction setBounds() executes correct, while setCenter() fails position 
	// to be verified later
	htmlMap_setBounds = function (arrayPtLatLon, fZoomTo) {

		if (arrayPtLatLon && (arrayPtLatLon.length == 2)) {
			console.log("here we go");

			ixmaps.embeddedSVG.window._TRACE("<========= htmlgui: do adapt HTML map ! to sw:" + arrayPtLatLon[0].lat + "," + arrayPtLatLon[0].lng + " ne:" + arrayPtLatLon[1].lat + "," + arrayPtLatLon[1].lng);

			// store old zoom, in case we emulate setCenter() wirth setBounds(), we have to restore it
			var nZoom = htmlMap_getZoom();

			LMap.fitBounds(
				new L.latLngBounds(L.latLng(arrayPtLatLon[0].lat, arrayPtLatLon[0].lng),
					L.latLng(arrayPtLatLon[1].lat, arrayPtLatLon[1].lng)
				), {
					animate: false
				}
			);

			// restore old zoom, in case we emulate setCenter()
			if (typeof (fZoomTo) != "undefined" && !fZoomTo) {
				htmlMap_setZoom(nZoom);
			}

		}
	}

	htmlMap_setSize = function (width, height) {
		if (LMap) {
			LMap.invalidateSize();
		}
	}

	htmlMap_getMapTypeId = function () {
		return lastLeafletLayer;
	}

	var mapTypeTranslate = new Array();
	mapTypeTranslate["roadmap"] = "Street (Google)";
	mapTypeTranslate["satellite"] = "NOKIA OVI - satellite";
	mapTypeTranslate["terrain"] = "ArcGIS - Topo";
	mapTypeTranslate["pale"] = "CloudMade - pale dawn";
	mapTypeTranslate["gray"] = "grey";
	mapTypeTranslate["grey"] = "grey";
	mapTypeTranslate["white"] = "white";
	mapTypeTranslate["dark"] = "dark";
	mapTypeTranslate["transparent"] = "transparent";
	mapTypeTranslate["BW"] = "Stamen - toner-lite";

	htmlMap_setMapTypeId = function (szMapType) {
		try {
			// here we select the layer we want to be active
			// ------------------------------------------------
			if (lastLeafletLayer) {
				try {
					LMap.removeLayer(ixmaps.layers[lastLeafletLayer]);
				} catch (e) {}
			}
			if (szMapType.match(/#/)){
				szMapType = "transparent";
			}
			lastLeafletLayer = mapTypeTranslate[szMapType] || szMapType;
			LMap.addLayer(ixmaps.layers[mapTypeTranslate[szMapType] || szMapType]);
			lastLeafletLayer = mapTypeTranslate[szMapType] || szMapType;
			// GR 05.03.2021 make sure something is visible while panning
			if (lastLeafletLayer.match(/gray|white|black|transparent/)) {
				ixmaps.panHidden = false;
			}
		} catch (e) {
			return null;
		}
	};

	htmlMap_enableScrollWheelZoom = function () {
		ixmaps.scrollWheelZoom = true;
		if (LMap) {
			LMap.scrollWheelZoom.enable();
		}
	};

	htmlMap_showMapTypeControl = function () {
		ixmaps.mapTypeSelection = !ixmaps.mapTypeSelection;
		if (LMap) {
			ixmaps.addControls({
				map_type: ixmaps.mapTypeSelection
			});
		}
	};

	htmlMap_hideMapControl = function () {
		if (LMap) {
			ixmaps.addControls({
				zoom: false,
				map_type: false
			});
		}
	};

	htmlMap_showMapControl = function () {
		if (LMap) {
			ixmaps.addControls({
				zoom: {
					position: 'bottomleft'
				},
				map_type: ixmaps.mapTypeSelection
			});
		}
	};


}(window, document));

// .............................................................................
// EOF
// .............................................................................
