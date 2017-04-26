/**********************************************************************
	 htmlgui_sync_GoogleV3.js

$Comment: provides an interface to Google API V3 functions to svggis
$Source : htmlgui_sync_GoogleV3.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2010/09/19 $
$Author: guenter richter $
$Id: htmlgui_sync_GoogleV3.js 1 2010-09-19 22:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_sync_GoogleV3.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides an interface to the Google V3 API for html maps. It maps htmlgui calls to the Google V3 API<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

(function( ixmaps, $, undefined ) {

	ixmaps.htmlMap_Api = "GoogleV3";

	/* ------------------------------------------------------------------ * 
			local variables
	 * ------------------------------------------------------------------ */

	var gmap = null;
	var geocoder = null;
	var ptLatLonInitGMap = null;
	var newZoomInitGMap = null;

	/* ------------------------------------------------------------------ * 
			Initialize google map (v3)
	 * ------------------------------------------------------------------ */

	ixmaps.loadGMap = function() {

		if ( (typeof(google) == "undefined") || !google.maps || !this.gmapDiv ){
			return null;
		}
		var myLatlng = new google.maps.LatLng(-34.397, 150.644);
		var myOptions = {
			zoom: 8,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		if (1) {
			gmap = createMyMap();

			if (ptLatLonInitGMap){
				gmap.setCenter(new google.maps.LatLng(ptLatLonInitGMap.y,ptLatLonInitGMap.x),newZoomInitGMap);		
			}else{
				gmap.setCenter(new google.maps.LatLng(43.3742,13.1268), 15);		
			}
			geocoder = new google.maps.Geocoder();

			google.maps.event.addListener(gmap, "bounds_changed", htmlgui_synchronizeSVG );
			google.maps.event.addListener(gmap, "dragend",  htmlgui_panSVGEnd );
			google.maps.event.addListener(gmap, "dragstart", htmlgui_panSVGStart );
			google.maps.event.addListener(gmap, "zoom_changed", htmlgui_panSVGStart );
			google.maps.event.addListener(gmap, "drag", htmlgui_panSVG );
			if ( ixmaps.fMapType){
				switch ( ixmaps.fMapType ){
					case 'TERRAIN': gmap.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
					case 'ROADMAP': gmap.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
					case 'SATELLITE': gmap.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
					case 'HYBRID': gmap.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
					default:
						gmap.setMapTypeId(ixmaps.fMapType);
						break;
				}
			}
		}

		// first call of
		// workaround because there is no event when entering in street view mode 
		htmlgui_checkStreetView();

		return gmap;
	}

	// workaround to detect street view mode
	// is called every second 

	var __streetViewVisible = false;

	htmlgui_checkStreetView = function(){
		if ( gmap.getStreetView().getVisible() != __streetViewVisible ){
			__streetViewVisible = gmap.getStreetView().getVisible();
			// make map controlls hidable; normally we want them to be in front of all (SVG), but not in street view
			htmlgui_pinGoogleControls(__streetViewVisible?false:true);
		}
		setTimeout("htmlgui_checkStreetView()",1000);
	}

	/* ------------------------------------------------------------------ * 
			local function to create a styled map
	 * ------------------------------------------------------------------ */

	function createMyMap() {

		var map;

		// black and white styler
		// ----------------------
		var bw_stylez = [
		  {
			featureType: "all",
			elementType: "all",
			stylers: [
			  { saturation: -99 }
			]
		  },{
			featureType: "poi",
			elementType: "all",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "landscape.natural",
			elementType: "geometry",
			stylers: [
			  { visibility: "on" },
			  { lightness: 98 }
			]
		  },{
			featureType: "water",
			stylers: [
			  { lightness: 70}
			]
		  },{
			featureType: "road",
			elementType: "labels",
			stylers: [
			  { visibility: "on" }
			]
		  },{
			featureType: "road",
			elementType: "geometry",
			stylers: [
			  { lightness: 50 }
			]
		  },{
			featureType: "poi",
			elementType: "all",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "water",
			elementType: "all",
			stylers: [
			  { visibility: "on" }
			]
		  },{
			featureType: "administrative",
			elementType: "geometry",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "administrative.province",
			elementType: "labels",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "landscape.man_made",
			elementType: "geometry",
			stylers: [
			  { visibility: "off" }
			]
		  }
			];
		
		var white_stylez = [
		  {
			featureType: "all",
			elementType: "all",
			stylers: [
			  { saturation: -99 }
			]
		  },{
			featureType: "poi",
			elementType: "all",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "landscape.natural",
			elementType: "geometry",
			stylers: [
			  { visibility: "on" },
			  { lightness: 98 }
			]
		  },{
			featureType: "water",
			stylers: [
			  { lightness: 70}
			]
		  },{
			featureType: "road",
			elementType: "labels",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "road",
			elementType: "geometry",
			stylers: [
			  { lightness: 90 }
			]
		  },{
			featureType: "poi",
			elementType: "all",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "water",
			elementType: "all",
			stylers: [
			  { lightness: 0 }
			]
		  },{
			featureType: "administrative",
			elementType: "geometry",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "administrative",
			elementType: "labels",
			stylers: [
			  { lightness: 70 }
			]
		  },{
			featureType: "administrative.province",
			elementType: "labels",
			stylers: [
			  { visibility: "off" }
			]
		  },{
			featureType: "landscape.man_made",
			elementType: "geometry",
			stylers: [
			  { visibility: "off" }
			]
		  }
			];

		// gray map styler
		// ---------------
		var gray_stylez = [
				{
				featureType: "all",
				stylers: [
					{ saturation: -100 },
					{ lightness: 50}
					]
				},
				{
				featureType: "administrative.locality",
				elementType: "labels",
				stylers: [
					{ lightness: 10}
					]
				},
				{
				featureType: "poi.park",
				elementType: "all",
				stylers: [
					{ visibility: "off" }
					]
				}
			];

		// grayII map styler
		// ---------------
		var grayII_stylez = [
			{
			featureType: "all",
			stylers: [
				{ saturation: -100 },
				{ lightness: 50}
				]
			},{
				featureType:"water",
				stylers: [
					{hue:"#ECE8E3"},
					{saturation:-100},
					{lightness:100}
				]
			},{
				featureType:"landscape",
				stylers: [
					{hue:"#000"},
					{saturation:-100},
					{lightness:35}
				]
			},{
				featureType:"administrative",
					stylers: [
						{visibility:"on"}
					]
			},{
				featureType:"administrative.country",
					stylers: [
						{visibility:"on"},
						{lightness:50}
					]
			},{
				featureType:"poi",
				stylers: [
					{visibility:"on"}
				]
			},{
				featureType:"road",
				stylers: [
					{visibility:"on"}
				]
			},{
				featureType:"transit",
				stylers: [
					{visibility:"off"}
				]
			},{
				featureType:"landscape.natural",
				stylers: [
					{visibility:"off"}
				]
			},{
				featureType:"landscape.man_made",
				stylers: [
					{visibility:"on"}
				]
			}
		];
	
		// dark map styler
		// ---------------
		var dark_stylez = [
				{
				featureType: "all",
				stylers: [
					{ saturation: -100 },
					{ lightness: -75}
					]
				}
			];
		// dark map styler
		// ---------------
		var dark2_stylez = [
				{
				featureType: "all",
				stylers: [
					{ saturation: -100 },
					{ lightness: -83}
					]
				}
			];
		// pale map styler
		// ---------------
		var pale_stylez = [
				{
				featureType: "all",
				stylers: [
					{ saturation: -20 },
					{ lightness: 60}
					]
				}
			];

		// define my map styles
		// --------------------
		var MY_MAPTYPE_BW_ID = 'BW'; 
		var MY_MAPTYPE_GRAY_ID = 'gray'; 
		var MY_MAPTYPE_DARK_ID = 'dark'; 
		var MY_MAPTYPE_DARK2_ID = 'black'; 
		var MY_MAPTYPE_PALE_ID = 'pale'; 
		var MY_MAPTYPE_WHITE_ID = 'white'; 

		var mapLargeOptions = {
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN, MY_MAPTYPE_BW_ID, MY_MAPTYPE_WHITE_ID, MY_MAPTYPE_GRAY_ID, MY_MAPTYPE_PALE_ID, MY_MAPTYPE_DARK_ID, MY_MAPTYPE_DARK2_ID]
				},
			mapTypeId: google.maps.MapTypeId.ROADMAP		
			,
			panControl: true,
			panControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			scaleControl: true,
			scaleControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_LEFT
			},
			streetViewControl: true,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			rotateControl: true,
			rotateControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			}
			,minZoom: 2

			};
		var mapSmallOptions = {
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN, MY_MAPTYPE_BW_ID, MY_MAPTYPE_WHITE_ID, MY_MAPTYPE_GRAY_ID, MY_MAPTYPE_PALE_ID, MY_MAPTYPE_DARK_ID, MY_MAPTYPE_DARK2_ID],
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
				},
			mapTypeId: google.maps.MapTypeId.ROADMAP,		

			panControl: false,
			panControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			scaleControl: true,
			scaleControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_LEFT
			},
			streetViewControl: false,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			},
			rotateControl: false,
			rotateControlOptions: {
				position: google.maps.ControlPosition.RIGHT_TOP
			}
			,minZoom: 2
			};

		var mapMobileOptions = {
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN, MY_MAPTYPE_BW_ID, MY_MAPTYPE_WHITE_ID, MY_MAPTYPE_GRAY_ID, MY_MAPTYPE_PALE_ID, MY_MAPTYPE_DARK_ID, MY_MAPTYPE_DARK2_ID],
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
				},
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			panControl: false,
			streetViewControl: false,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			minZoom: 2
			};

		// create map
		// ----------
		var opt = mapLargeOptions;
		if ( ixmaps.fMapControlStyle=="small" ){
			opt = mapSmallOptions;
		}else
		if ( ixmaps.fMapControlStyle=="mobile" ){
			opt = mapMobileOptions;
		}
		map = new google.maps.Map(ixmaps.gmapDiv, (opt) );	

		map.mapTypes.set(MY_MAPTYPE_WHITE_ID, new google.maps.StyledMapType(white_stylez,{name: "White" }));
		map.mapTypes.set(MY_MAPTYPE_GRAY_ID, new google.maps.StyledMapType(gray_stylez,{name: "Gray" }));
		map.mapTypes.set(MY_MAPTYPE_PALE_ID, new google.maps.StyledMapType(pale_stylez,{name: "Pale" }));
		map.mapTypes.set(MY_MAPTYPE_DARK_ID, new google.maps.StyledMapType(dark_stylez,{name: "Dark" }));
		map.mapTypes.set(MY_MAPTYPE_DARK2_ID, new google.maps.StyledMapType(dark2_stylez,{name: "Black" }));
		map.mapTypes.set(MY_MAPTYPE_BW_ID, new google.maps.StyledMapType(bw_stylez,{name: "BW" }));

		setTimeout("htmlgui_pinGoogleControls(true)",10);

		return map;
	}

	var gmapZindex = null;
	var gmapZindex1 = null;
	var pinGoogleControls_timeout = null;

	// funtional til 08.2011 
	htmlgui_pinGoogleControls_old = function(flag){
		var gmapDiv = ixmaps.gmapDiv;
		if ( flag == true ){
			try {
				gmapZindex = gmapDiv.style["z-index"];
				gmapZindex1 = gmapDiv.firstChild.style["z-index"];
				gmapDiv.style["z-index"] = null;
				gmapDiv.firstChild.style["z-index"] = null;
			} catch (e){}	
		}else{
			try {
				gmapDiv.style["z-index"] = gmapZindex;
				gmapDiv.firstChild.style["z-index"] = gmapZindex1;
			} catch (e){}	
		}
	}
	// no we have these divs
	htmlgui_pinGoogleControls = function(flag){return;
		var gmapDiv = ixmaps.gmapDiv;
		if ( flag == true ){
			try {
				// look for gmap controls, they have the class 'gmnoprint'
				$(".gmnoprint").parent().css("z-index","");
				$(".gmnoprint").css("z-index","9");
				pinGoogleControls_timeout = setTimeout("htmlgui_pinGoogleControls(true)",2000);
			} catch (e){}	
		}else{
			if ( pinGoogleControls_timeout ){
				clearTimeout(pinGoogleControls_timeout);
			}
			try {
				gmapDiv.firstChild.style["z-index"] = 0;
				gmapDiv.firstChild.lastChild.style["z-index"] = 0;
			} catch (e){}	
		}
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
		try {return gmap.getZoom();}
		catch (e){return 0;}
	}

	htmlMap_setZoom = function(nZoom){
		try {gmap.setZoom(nZoom);}
		catch (e){}
	}

	htmlMap_getCenter = function(){
		try{
			var center = gmap.getCenter();
			return {lat:center.lat(),lng:center.lng()};
		}
		catch (e){
			return null;
		}
	}

	htmlMap_getBounds = function(){
		try {
			var bounds = gmap.getBounds();
			var swPoint = bounds.getSouthWest();
			var nePoint = bounds.getNorthEast();
			ixmaps.embeddedSVG.window._TRACE("<========= htmlgui: htmlMap_getBounds ! ");
			return new Array({lat:swPoint.lat(),lng:swPoint.lng()},{lat:nePoint.lat(),lng:nePoint.lng()});
		} catch (e){
			return null;
		}
	}

	htmlMap_setCenter = function(ptLatLon){
		try	{
			if ( ptLatLon ){
				gmap.setCenter(new google.maps.LatLng(ptLatLon.lat,ptLatLon.lng));		
			}
		} catch (e){}
	}

	htmlMap_setBounds = function(arrayPtLatLon){
		try	{
			if (arrayPtLatLon && (arrayPtLatLon.length == 2) ){
				var dLat = (arrayPtLatLon[0].lat - arrayPtLatLon[1].lat)*0.1;
				var dLng = (arrayPtLatLon[1].lng - arrayPtLatLon[0].lng)*0.1;
				gmap.fitBounds(new google.maps.LatLngBounds(
					new google.maps.LatLng(arrayPtLatLon[0].lat-dLat,arrayPtLatLon[0].lng+dLng),
					new google.maps.LatLng(arrayPtLatLon[1].lat+dLat,arrayPtLatLon[1].lng-dLng)
					)
				);		
			}
		} catch (e){}
	}
		 
	htmlMap_setSize = function(width,height){
		try	{
			if ( typeof(google) != "undefined" && typeof(google.maps) != "undefined" ){
				google.maps.event.trigger(gmap, 'resize');
			}
		} catch (e){}
	}

	htmlMap_getMapTypeId = function(){
		try	{
			return gmap.getMapTypeId();		
		} catch (e){return null;}
	}

	htmlMap_setMapTypeId = function(szMapType){
		try	{
			gmap.setMapTypeId(szMapType);		
		} catch (e){return null;}
	}
	 
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

