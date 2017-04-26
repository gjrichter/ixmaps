/**********************************************************************
	 htmlgui_sync_Mapstraction.js

$Comment: provides an interface to Mapstratcion API functions to svggis
$Source : htmlgui_sync_Mapstratcion.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2010/09/19 $
$Author: guenter richter $
$Id: htmlgui_sync_Mapstratcion.js 1 2010-09-19 22:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_sync_Mapstratcion.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides an interface to the Mapstraction API for html maps. It maps htmlgui calls to the Mapstration API<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

(function( ixmaps, $, undefined ) {

	ixmaps.htmlMap_Api = "Mapstraction";

	/* ------------------------------------------------------------------ * 
			local variables
	 * ------------------------------------------------------------------ */

	var mapstraction = null;
	var geocoder = null;
	var ptLatLonInitGMap = null;
	var newZoomInitGMap = null;
	var lastLeafletLayer = null;

	var mapstraction;

	ixmaps.loadGMap = function(szMapService) {

		if ( !mxn || !this.szGmapDiv ){
			return;
		}
		if ( (typeof(szMapService) == "undefined") || (szMapService.length == 0) ){
			szMapService = "openlayers";
		}
		mapstraction = new mxn.Mapstraction(this.szGmapDiv,szMapService);

		// GR 28.02.2013 workaround: inserted htmlgui_panSVGStart(); to hide SVG overlay
		mapstraction.changeZoom.addHandler(function(n, s, a) { htmlgui_hideAll();htmlgui_synchronizeSVG();});
		mapstraction.endPan.addHandler(function(n, s, a) { htmlgui_panSVGEnd(); });
		mapstraction.doPan.addHandler(function(n, s, a) { htmlgui_panSVG(); });

		if ( szMapService == "leaflet" ){

		/** Google */
		  /**

		  mapstraction.addTileLayer("http://{s}.google.com/vt/?hl=it&x={x}&y={y}&z={z}&s={s}", {
			 name: "Google - Street",
			 myname: "Google - Street",
			 attribution: "Map data: Copyright Google, 2013",
			 subdomains: ['mt0','mt1','mt2','mt3']
		  });
		  mapstraction.addTileLayer("http://{s}.google.com/vt/?lyrs=y&x={x}&y={y}&z={z}&s={s}", {
			 name: "Google - Terrain",
			 myname: "Google - Terrain",
			 attribution: "Map data: Copyright Google, 2013",
			 subdomains: ['mt0','mt1','mt2','mt3']
		  });
		  **/

		/** Nokia OVI Maps */
		  /**	
		  mapstraction.addTileLayer("http://maptile.maps.svc.ovi.com/maptiler/maptile/newest/normal.day/{z}/{x}/{y}/256/png8", {
			 name: "NOKIA OVI - normal",
			 myname: "NOKIA OVI - normal",
			 attribution: "Map data: Copyright Nokia, 2013",
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("http://maptile.maps.svc.ovi.com/maptiler/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8", {
			 name: "NOKIA OVI - satellite",
			 myname: "NOKIA OVI - satellite",
			 attribution: "Map data: Copyright Nokia, 2013",
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("http://maptile.maps.svc.ovi.com/maptiler/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8", {
			 name: "NOKIA OVI - terrain",
			 myname: "NOKIA OVI - terrain",
			 attribution: "Map data: Copyright Nokia, 2013",
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("../../maps/tiles/italia_2011_eta_white/{z}/{x}/{y}.png", {
			 name: "IT age",
			 myname: "IT age",
             maxZoom: "9",
			 attribution: "Map data: iXmaps",
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("../../maps/tiles/FB_SOD/{z}/{x}/{y}.png", {
			 name: "SOD",
			 myname: "SOD",
			 attribution: "Map data: SOD14",
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  **/
		  mapstraction.addTileLayer("http://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8", {
			 name: "NOKIA",
			 myname: "NOKIA",
			 minZoom: 2,
			 attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("http://maptile.maps.svc.ovi.com/maptiler/maptile/newest/normal.day.transit/{z}/{x}/{y}/256/png8", {
			 name: "NOKIA OVI - transit",
			 myname: "NOKIA OVI - transit",
			 minZoom: 2,
			 attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });
		  mapstraction.addTileLayer("http://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=IhE4BDSYudkb1itnuARB&token=5636fffT2ok28aFX4lciGg&lg=ENG", {
			 name: "NOKIA - satellite",
			 myname: "NOKIA - satellite",
			 minZoom: 2,
			 attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			 subdomains: ['1','2','3','4']
		  });
		  mapstraction.addTileLayer("http://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?app_id=IhE4BDSYudkb1itnuARB&token=5636fffT2ok28aFX4lciGg&lg=ENG", {
			 name: "NOKIA - terrain",
			 myname: "NOKIA - terrain",
			 minZoom: 2,
			 attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			 subdomains: ['1','2','3','4']
		  });

		  mapstraction.addTileLayer("http://worldtiles3.waze.com/tiles/{z}/{x}/{y}.png", {
			 name: "WAZE",
			 myname: "WAZE",
			 minZoom: 2,
			 attribution: 'Map tiles &copy; <a href="http://here.com/">HERE Maps</a>',
			 subdomains: ['khm0','khm1','khm2','khm3']
		  });

		/**
		  mapstraction.addTileLayer("http://{s}.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png", {
			 name: "MapBox - OSM",
			 myname: "MapBox - OSM",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2013 OpenStreetMap",
			 subdomains: ['a','b','c','d']
		  });
		**/
		  mapstraction.addTileLayer("http://{s}.tiles.mapbox.com/v3/examples.bc17bb2a/{z}/{x}/{y}.png", {
			 name: "MapBox - OSM",
			 myname: "MapBox - OSM",
			 minZoom: 2,
			 attribution: '<a href="https://www.mapbox.com/about/maps">© Mapbox</a> <a href="http://openstreetmap.org/copyright">© OpenStreetMap</a> | <a href="http://mapbox.com/map-feedback/" class="mapbox-improve-map">Improve this map</a>',
			 subdomains: ['a','b','c','d']
		  });

		  mapstraction.addTileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - Osmarenderer",
			 myname: "OpenStreetMap - Osmarenderer",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - wikipedia",
			 myname: "OpenStreetMap - wikipedia",
			 minZoom: 2,
			 attribution: 'Wikimedia maps beta | Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
			 subdomains: ['a','b','c'],
			 maxZoom: 20
		  });
		  /**	
		  mapstraction.addTileLayer("http://tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - Cycle Map",
			 myname: "OpenStreetMap - Cycle Map",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - b&w",
			 myname: "OpenStreetMap - b&w",
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['a','b','c','d']
		  });
		  **/
		  mapstraction.addTileLayer("http://korona.geog.uni-heidelberg.de:8008/tms_rg.ashx?x={x}&y={y}&z={z}", {
			 name: "OpenStreetMap - gray",
			 myname: "OpenStreetMap - gray",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['tiles1','tiles2','tiles3','tiles4']
		  });
		  mapstraction.addTileLayer("http://korona.geog.uni-heidelberg.de:8001/tms_r.ashx?x={x}&y={y}&z={z} ", {
			 name: "OpenStreetMap - roads",
			 myname: "OpenStreetMap - roads",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['tiles1','tiles2','tiles3','tiles4']
		  });
		  mapstraction.addTileLayer("http://korona.geog.uni-heidelberg.de:8007/tms_b.ashx?x={x}&y={y}&z={z}", {
			 name: "OpenStreetMap - admin",
			 myname: "OpenStreetMap - admin",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['tiles1','tiles2','tiles3','tiles4']
		  });
		  mapstraction.addTileLayer("http://korona.geog.uni-heidelberg.de:8007/tms_b.ashx?x={x}&y={y}&z={z}", {
			 name: "OpenStreetMap - admin - dark",
			 myname: "OpenStreetMap - admin - dark",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['tiles1','tiles2','tiles3','tiles4']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - FR",
			 myname: "OpenStreetMap - FR",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://tile.opencyclemap.org/transport/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - Transport",
			 myname: "OpenStreetMap - Transport",
			 minZoom: 2,
			 attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		/** GeoFabrik */
		/**
		  mapstraction.addTileLayer("http://{s}.tile.geofabrik.de/15173cf79060ee4a66573954f6017ab0/{z}/{x}/{y}.png", {
			 name: "OpenStreetMap - GeoFabrik",
			 myname: "OpenStreetMap - GeoFabrik",
			 attribution: '&copy; <a href="http://www.geofabrik.de">Geofabrik Topo</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['a','b','c','d']
		  });
		  **/
		/** MapQuest */
		/**
		  mapstraction.addTileLayer("http://{s}.mqcdn.com/tiles/1.0.0/vy/map/{z}/{x}/{y}.png", {
			 name: "MapQuest - OSM",
			 myname: "MapQuest - OSM",
			 attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['mtile01','mtile02','mtile03','mtile04']
		  });
		  **/
		  mapstraction.addTileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
			 name: "MapQuest - OSM (EU)",
			 myname: "MapQuest - OSM (EU)",
			 minZoom: 2,
			 attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });

		/** ArcGis */
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Topo",
			 myname: "ArcGIS - Topo",
			 minZoom: 2,
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Light Gray Base",
			 myname: "ArcGIS - Light Gray Base",
			 minZoom: 2,
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  /**	
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Light Gray Reference",
			 myname: "ArcGIS - Light Gray Reference",
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Terrain Basemap",
			 myname: "ArcGIS - Terrain Basemap",
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  **/
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Ocean Basemap",
			 myname: "ArcGIS - Ocean Basemap",
			 minZoom: 2,
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Hillshade",
			 myname: "ArcGIS - Hillshade",
			 minZoom: 2,
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  
		  /**
		  mapstraction.addTileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}.png", {
			 name: "ArcGIS - Reference Overlay",
			 myname: "ArcGIS - Reference Overlay",
			 attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("http://{s}.maptoolkit.net/terrain/{z}/{x}/{y}.png", {
			 name: "Map Toolkit",
			 myname: "Map Toolkit",
			 attribution: "Map Toolkit",
			 subdomains: ['tile1','tile2','tile3','tile4']
		  });
		  **/
		  mapstraction.addTileLayer("http://{s}.openpistemap.org/landshaded/{z}/{x}/{y}.png", {
			 name: "Openpistemap landschaded",
			 myname: "Openpistemap landschaded",
			 minZoom: 2,
			 attribution: "openpistemap",
			 subdomains: ['tiles2','tiles2','tiles2','tiles2']
		  });

		  mapstraction.addTileLayer("#", {
			 name: "Black",
			 myname: "Black",
			 minZoom: 2,
			 attribution: ".",
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });
		  mapstraction.addTileLayer("#", {
			 name: "White",
			 myname: "White",
			 minZoom: 2,
			 attribution: ".",
			 subdomains: ['otile1','otile2','otile3','otile4']
		  });

		/** GeoIQ */
		/**
		  mapstraction.addTileLayer("http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png", {
			 name: "GeoIQ - gray",
			 myname: "GeoIQ - gray",
			 attribution: "Acetate tileset from <a href='http://stamen.com'>GeoIq</a>",
			 subdomains: ['a','b','c','d']
		  });
		  mapstraction.addTileLayer("http://a.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png", {
			 name: "GeoIQ - all",
			 myname: "GeoIQ - all",
			 attribution: "&copy;2012 Esri & Stamen, Data from OSM and Natural Earth",
			 subdomains: ['a','b','c','d']
		  });
		**/

		/** OpenMapSurfer */
		/**
		  mapstraction.addTileLayer("http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}", {
			 name: "OpenMapSurfer - roads",
			 myname: "OpenMapSurfer - roads",
			 attribution: "Imagery from <a href='http://giscience.uni-hd.de/'>GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>",
			 subdomains: ['a','b','c','d']
		  });

		var OpenMapSurfer_Roads = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
			minZoom: 0,
			maxZoom: 20,
			attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
		});
		**/

		/** Stamen */
		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {
			 name: "Stamen - toner",
			 myname: "Stamen - toner",
			 minZoom: 2,
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>",
			 subdomains: ['a','b','c','d']
		  });

		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
			 name: "Stamen - toner-lite",
			 myname: "Stamen - toner-lite",
			 minZoom: 2,
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.",
			 subdomains: ['a','b','c','d']
		  });

		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/toner-hybrid/{z}/{x}/{y}.png", {
			 name: "Stamen - toner-hybrid",
			 myname: "Stamen - toner-hybrid",
			 minZoom: 2,
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.",
			 subdomains: ['a','b','c','d']
		  });
		/**
		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/toner-hybrid/{z}/{x}/{y}.png", {
			 name: "Stamen - toner-hybrid",
			 myname: "Stamen - toner-hybrid",
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>",
			 subdomains: ['a','b','c','d']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/toner-lines/{z}/{x}/{y}.png", {
			 name: "Stamen - toner-lines",
			 myname: "Stamen - toner-lines",
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>",
			 subdomains: ['a','b','c','d']
		  });
		  **/
		  mapstraction.addTileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png", {
			 name: "Stamen - watercolor",
			 myname: "Stamen - watercolor",
			 minZoom: 2,
			 attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.",
			 subdomains: ['a','b','c','d']
		  });

		/** CartoDB */

		  mapstraction.addTileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
			 name: "CartoDB - Positron",
			 myname: "CartoDB - Positron",
			 minZoom: 2,
			 attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a></a>",
			 subdomains: ['a','b','c','d']
		  });
		  mapstraction.addTileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
			 name: "CartoDB - Dark matter",
			 myname: "CartoDB - Dark matter",
			 minZoom: 2,
			 attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='http://cartodb.com/attributions'>CartoDB</a></a>",
			 subdomains: ['a','b','c','d']
		  });

		/** thunderforest */
		/**
		  mapstraction.addTileLayer("https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png", {
			 name: "ThunderForest - pioneer",
			 myname: "ThunderForest - pioneer",
			 minZoom: 2,
			 attribution: "Map data &copy; 2015 OpenStreetMap contributors, Imagery &copy; 2015 ThunderForest",
			 subdomains: ['a','b','c']
		  });
		**/

		/** Cloudmade */
		/** shut down of free tile service on April 2014

		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/81703/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - white",
			 myname: "CloudMade - white",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/117180/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - white river",
			 myname: "CloudMade - white river",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/66675/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey",
			 myname: "CloudMade - grey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/117179/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey 1",
			 myname: "CloudMade - grey grey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/117178/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey 2",
			 myname: "CloudMade - grey grey2",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/82102/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - dark grey",
			 myname: "CloudMade - dark grey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/48535/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - light grey",
			 myname: "CloudMade - light grey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/117146/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey honey",
			 myname: "CloudMade - grey honey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/120791/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey city",
			 myname: "CloudMade - grey city",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/115087/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - black city",
			 myname: "CloudMade - black city",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
          /** 
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/114170/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey no streets",
			 myname: "CloudMade - grey no streets",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/81650/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - dark",
			 myname: "CloudMade - dark",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/117151/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - black black",
			 myname: "CloudMade - black black",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/77736/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - clean dark",
			 myname: "CloudMade - clean dark",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/51278/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - clean black",
			 myname: "CloudMade - clean black",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/114028/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - black",
			 myname: "CloudMade - black",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/60324/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - mint",
			 myname: "CloudMade - mint big streets",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/997/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - fresh",
			 myname: "CloudMade - fresh",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/121667/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - fresh-no-places",
			 myname: "CloudMade - fresh",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/112290/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - water",
			 myname: "CloudMade - water",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/55211/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - pale gray",
			 myname: "CloudMade - pale grey",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/998/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - pale dawn",
			 myname: "CloudMade - pale dawn",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/114241/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - grey green",
			 myname: "CloudMade - grey green",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/115239/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - blue green",
			 myname: "CloudMade - blue green",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/54912/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - green",
			 myname: "CloudMade - green",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/82946/256/{z}/{x}/{y}.png", {
			 name: "CloudMade - beige",
			 myname: "CloudMade - beige",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/997/256/{z}/{x}/{y}.png", {
			 name: "cloudmade",
			 attribution: "Map data &copy; 2013 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  997	= fresh (good)
		  998	= pale dawn (good)
		  999	= midnight commander
		  1714	= Ride the City II (clean warm gray, green)
		  63843 = darkltest
		  9986  = victorian
		  61848 = dark grey residential
		  32024 = geovis
		  48523 = negative grey
		  62811 = light grey
		  79229 = BW (ok)
		  79058 = Label_skin1 (ok)
		  64657 = animaa (da clonare)
		  66675 = bd (good)
		  29208 = thin roads on gothick french (ok)
		  16387 = new grey (ok)
		  41167 = waterways (good)
		  57232 = dark background
		  80748 = deviousgenius
		  49318 = vademecum (ok)
		  81650	= my dark background
		  mapstraction.addTileLayer("http://{s}.tile.cloudmade.com/8280c6eed82b4bb8a62b5ab47725925f/999/256/{z}/{x}/{y}.png", {
			 name: "simple",
			 attribution: "Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade",
			 subdomains: ['a','b','c']
		  });
		  **/
		  /**
			var nexrad = new L.tileLayer.wms("http://129.206.228.72/cached/hillshade?", {
				layers: 'europe_wms:hs_srtm_europa',
				srs: 'EPSG:900913',
				format: 'image/jpeg',
				transparent: true,
				attribution: "www.osm-wms.de"
			});
		  **/
			mapstraction.addControls({
				pan: false, 
				zoom: {position:'bottomleft'},
				map_type: (ixmaps.mapTypeSelection?true:false)
				});

			if ( ixmaps.scrollWheelZoom ){
				mapstraction.enableScrollWheelZoom();
			}

			// here we select the layer we want to be active
			// ------------------------------------------------

			ixmaps.fMapType = ixmaps.fMapType || "Stamen - toner-lite";

			// 21.03.2014 CloudMade shuts down free tile service, so we have to remap the maptype here
			if ( ixmaps.fMapType.match(/CloudMade/) ){
				ixmaps.fMapType = "ArcGIS - Light Gray Base";
			}
			if ( ixmaps.fMapType.match(/GeoIQ/) ){
				ixmaps.fMapType = "ArcGIS - Light Gray Base";
			}

			var map = mapstraction.maps[mapstraction.api];
			try	{
				map.addLayer(mapstraction.layers[ixmaps.fMapType]);
			}catch (e){}
			lastLeafletLayer = ixmaps.fMapType;

			ixmaps.htmlgui_setMapTypeBG(lastLeafletLayer);
			/**
			map.addLayer(nexrad);
			**/

			// hook on 'baselayerchange' to get the actual layer name
			// while Leaflet doesn't publish the option 'name',
			// we must use a workaround and set a private layer name in .myname (see above)
			// ------------------------------------------------------------------------------------------
			map.on('baselayerchange', function(e) {
				lastLeafletLayer = e.layer.options.myname; 
				ixmaps.htmlgui_setMapTypeBG(lastLeafletLayer);
			});		
		}

	
	htmlMap_setZoom(2);

	return mapstraction;
	}

	/* ------------------------------------------------------------------ * 
		Synchronization of SVG and Google map
	* ------------------------------------------------------------------ */

	/** 
	 * interchange format of bounds is an array of 2 lat/lon point objects
	 * array({lat:p1.lat,lng:p1.lng},{lat:p2.lat,lng:p2.lng}); 
	 * p1 = south/west point; p2 = north/east point
	 */

	htmlMap_getZoom = function(){
		return mapstraction.getZoom();
	}
	htmlMap_setZoom = function(nZoom){
		return mapstraction.setZoom(nZoom);
	}
	htmlMap_getCenter = function(){
		var center = mapstraction.getCenter();
		return {lat:center.lat,lng:center.lng||center.lon};
	}
	xhtmlMap_getCenter = function(){
		var bounds = mapstraction.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		return {lat:swPoint.lat+(nePoint.lat-swPoint.lat)/2,lng:swPoint.lng+(nePoint.lng-swPoint.lng)/2};
	}

	htmlMap_getBounds = function(){
		var bounds = mapstraction.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		return new Array({lat:swPoint.lat,lng:swPoint.lng},{lat:nePoint.lat,lng:nePoint.lng});
	}

	htmlMap_setCenter = function(ptLatLon){
		mapstraction.setCenter(
			new mxn.LatLonPoint(ptLatLon.lat,
								ptLatLon.lng) , {pan:true}
		);		
	}

	// new parameter fZoomTo
	// necessary because setBounds() used also for setCenter()
	// in mapstraction setBounds() executes correct, while setCenter() fails position 
	// to be verified later
	htmlMap_setBounds = function(arrayPtLatLon,fZoomTo){

		if (arrayPtLatLon && (arrayPtLatLon.length == 2) ){

			ixmaps.embeddedSVG.window._TRACE("<========= htmlgui: do adapt HTML map ! to sw:"+arrayPtLatLon[0].lat+","+arrayPtLatLon[0].lng+" ne:"+arrayPtLatLon[1].lat+","+arrayPtLatLon[1].lng);

			// store old zoom, in case we emulate setCenter() wirth setBounds(), we have to restore it
			var nZoom = htmlMap_getZoom();
			
			mapstraction.setBounds(
				new mxn.BoundingBox(arrayPtLatLon[0].lat,
									arrayPtLatLon[0].lng,
									arrayPtLatLon[1].lat,
									arrayPtLatLon[1].lng
				)
			);

			// restore old zoom, in case we emulate setCenter()
			if ( typeof(fZoomTo) != "undefined" && !fZoomTo ){
				htmlMap_setZoom(nZoom);
			}

			/** was an old try to correct false center settings; obsolet
			mapstraction.setCenter(
				new mxn.LatLonPoint(arrayPtLatLon[1].lat + (arrayPtLatLon[0].lat - arrayPtLatLon[1].lat)/2,
									arrayPtLatLon[0].lng + (arrayPtLatLon[1].lng - arrayPtLatLon[0].lng)/2 ),{pan:true}
			);	
			**/
		}
	}

	htmlMap_setSize = function(width,height){
		if ( mapstraction ){
			mapstraction.resizeTo(width,height);
		}
	}
	
	htmlMap_getMapTypeId = function(){
		return lastLeafletLayer;		
	}

	var mapTypeTranslate = new Array();
		mapTypeTranslate ["roadmap"]	= "Street (Google)";
		mapTypeTranslate ["satellite"]	= "NOKIA OVI - satellite";
		mapTypeTranslate ["terrain"]	= "ArcGIS - Topo";
		mapTypeTranslate ["pale"]		= "CloudMade - pale dawn";
		mapTypeTranslate ["gray"]		= "CloudMade - grey";
		mapTypeTranslate ["grey"]		= "CloudMade - grey";
		mapTypeTranslate ["white"]		= "CloudMade - white";
		mapTypeTranslate ["dark"]		= "CloudMade - dark";
		mapTypeTranslate ["BW"]			= "Stamen - toner-lite";

	htmlMap_setMapTypeId = function(szMapType){
		try	{
			// here we select the layer we want to be active
			// ------------------------------------------------
			var map = mapstraction.maps[mapstraction.api];
			map.removeLayer(mapstraction.layers[lastLeafletLayer]);
			map.addLayer(mapstraction.layers[mapTypeTranslate[szMapType]||szMapType]);
			lastLeafletLayer = mapTypeTranslate[szMapType]||szMapType;
		} catch (e){return null;}
	};

	htmlMap_enableScrollWheelZoom = function(){
		ixmaps.scrollWheelZoom = true;
		if ( mapstraction ){
			mapstraction.enableScrollWheelZoom();
		}
	};

	htmlMap_showMapTypeControl = function(){
		ixmaps.mapTypeSelection = !ixmaps.mapTypeSelection;
		if ( mapstraction ){
			mapstraction.addControls({
				map_type: ixmaps.mapTypeSelection
				});
		}
	};

	htmlMap_hideMapControl = function(){
		if ( mapstraction ){
			mapstraction.addControls({
				zoom: false,
				map_type: false
				});
		}
	};

	htmlMap_showMapControl = function(){
		if ( mapstraction ){
			mapstraction.addControls({
				zoom: {position:'bottomleft'},
				map_type: ixmaps.mapTypeSelection
				});
		}
	};

	/* ------------------------------------------------------------------ * 
		Google maps search functions
	* ------------------------------------------------------------------ */

	function showAddress(address) {
		if ( !address.match(",") ){
		  address += ", San Benedetto del Tronto, Italia";
		}
		if (geocoder) {
			geocoder.getLatLng(
				address,
				function(point) {
					if (!point) {
						alert(address + " not found");
					} else {
						gmap.setCenter(point, 17);
						var marker = new GMarker(point);
						gmap.addOverlay(marker);
						marker.openInfoWindowHtml(address+"</br>"+point.lat()+","+point.lng());
						synchronizeParentMap();
					}
				}
			);
		}
	}

	/* ------------------------------------------------------------------ * 
		Google Maps api functions
	* ------------------------------------------------------------------ */

	// addAddressToMap() is called when the geocoder returns an
	// answer.  It adds a marker to the map with an open info window
	// showing the nicely formatted version of the address and the country code.
	function addAddressToMap(response) {
		if (!response || response.Status.code != 200) {
			alert("Sorry, we were unable to geocode that address");
		} else {
			place = response.Placemark[0];
			point = new GLatLng(place.Point.coordinates[1],
													place.Point.coordinates[0]);
			embeddedSVG.window.map.Api.doCenterMapToGeoPosition(place.Point.coordinates[1],place.Point.coordinates[0])
		}
	}

	// showLocation() is called when you click on the Search button
	// in the form.  It geocodes the address entered into the form
	// and adds a marker to the map at that location.
	function showLocation() {
		var searchForm  = window.document.getElementById("MapSearchForm");
		var address = searchForm.query.value + "," + __GoogleAddressSearchSuffix;
		geocoder.getLocations(address, addAddressToMap);
	}

	function mypoint(x,y) {
		this.x = x;
		this.y = y;
		}

	function htmlgui_getGeocode(szAddress) {
		if (geocoder) {
			var retCode = 0;
			var ptResult = null;
			geocoder.getLatLng(
				szAddress,
				function(point) {
					if (!point) {
						retCode = -1;
					} else {
						retCode = 1;
						ptResult = new mypoint(point.lng(),point.lat());
					}
				}
			);
			while ( retCode == 0 ){
				;
			}
			return ptResult;
		}
		return null;
	}

}( window.ixmaps = window.ixmaps || {}, jQuery ));

// .............................................................................
// EOF
// .............................................................................

