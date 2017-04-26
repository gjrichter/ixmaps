/**********************************************************************
	 htmlgui_sync.js

$Comment: provides Google Sync functiuons to svggis
$Source : htmlgui_sync.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2010/09/19 $
$Author: guenter richter $
$Id: htmlgui_sync.js 1 2010-09-19 22:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_sync.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides the Google Maps <-> SVGGIS HTML interface functions for map synchronisatation<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/* ------------------------------------------------------------------ * 
		Initialization on load
 * ------------------------------------------------------------------ */

    var gmap = null;
    var geocoder = null;
	var fSynchronized = false;
	var ptLatLonInitGMap = null;
	var newZoomInitGMap = null;

    function loadGMap() {
		if (GBrowserIsCompatible()) {
			gmap = new GMap2(document.getElementById("gmap"));
			gmap.addControl(new GSmallMapControl());
			gmap.enableScrollWheelZoom();
			gmap.addMapType(G_PHYSICAL_MAP);
			gmap.removeMapType(G_HYBRID_MAP);
			gmap.addControl(new GMapTypeControl());
			gmap.addControl(new GOverviewMapControl());
			gmap.addMapType(G_SATELLITE_3D_MAP);
			if (ptLatLonInitGMap){
				gmap.setCenter(new GLatLng(ptLatLonInitGMap.y,ptLatLonInitGMap.x),newZoomInitGMap+1);		
			}else{
				gmap.setCenter(new GLatLng(43.3742,13.1268), 6);		
			}
			geocoder = new GClientGeocoder();

			GEvent.addListener(gmap, "moveend", autoSynchronize );
			GEvent.addListener(gmap, "move", panParentMap );
			GEvent.addListener(gmap, "movestart", do_mapmousedown );
		}
	}

	 /* ------------------------------------------------------------------ * 
			Synchronization of SVG and Google map
	 * ------------------------------------------------------------------ */

	var fEnableEventsOnSVG = true;
	function activateSVGElements(flag){
		var div = window.document.getElementById("svgmap");
		if (div){
			div.style.setProperty("pointer-events",flag?"all":"none");
		}
	}
	function do_mapmousedown(){
		fEnableEventsOnSVG = false;
	}
	function do_mapmouseup(){
		fEnableEventsOnSVG = true;
	}
	function do_mapmouseout(){
		if (fEnableEventsOnSVG)	{
			activateSVGElements(true);
		}
	}
	var nMapMouseMove = 0;
	function do_mapmousemove(){return;
		if ( ++nMapMouseMove > 10 ){
			nMapMouseMove = 0;
			if (fEnableEventsOnSVG)	{
				activateSVGElements(true);
			}
		}
	}
	function do_enableSVG(){
		if (fEnableEventsOnSVG)	{
			activateSVGElements(true);
		}
		setTimeout("do_enableSVG()",1000);
	}

	function hideParentMap(){
		fEnableEventsOnSVG = false;
		hideAll();
//			 setTimeout("hideAll();",100);
	}
		
		
		
	var synchronizeTimeout = null;
	function autoSynchronize() {
		if ( fSynchronized ){
			fSynchronized = false;
			return;
		}
		if (synchronizeTimeout){
			clearTimeout(synchronizeTimeout);
		}
		synchronizeTimeout = setTimeout("doAutoSynchronize()",100);
	}
	function doAutoSynchronize() {
		synchronizeParentMap();
		synchronizeTimeout = null;
		setTimeout("showAll()",500);
	}
	function synchronizeParentMap() {
		if ( !window ){
			return;
		}
		var bounds = gmap.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		window.setBoundsLatLon(swPoint.lat(),swPoint.lng(),nePoint.lat(),nePoint.lng());
	}

	function 	htmlgui_synchronizeMap(callback){
		if ( !window ){
			return;
		}
		fSynchronized = true;
		var arrayPtLatLon = window.getBoundsLatLon();
		if (arrayPtLatLon && (arrayPtLatLon.length == 2) ){
			newZoomInitGMap = gmap.getBoundsZoomLevel(new GLatLngBounds(new GLatLng(arrayPtLatLon[0].y,arrayPtLatLon[0].x),new GLatLng(arrayPtLatLon[1].y,arrayPtLatLon[1].x)));		
			ptLatLonInitGMap = window.getCenterLatLon();
			if (ptLatLonInitGMap){
				gmap.setCenter(new GLatLng(ptLatLonInitGMap.y,ptLatLonInitGMap.x),newZoomInitGMap);		
			}
			if (callback){
				synchronizeParentMap();
			}
		}
	}
	function 	htmlgui_getEnvelope(){
		var bounds = gmap.getBounds();
		var swPoint = bounds.getSouthWest();
		var nePoint = bounds.getNorthEast();
		fSynchronized = true;
		return ("a='"+String(swPoint.lat())+"' b='"+String(swPoint.lng())+"' b='"+String(nePoint.lat())+"' b='"+String(nePoint.lng())+"'");
	}

	
	function panParentMap() {
		if ( !window ){
			return;
		}
		var center = gmap.getCenter();
		window.setCenterLatLon(center.lat(),center.lng());
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

		function hideAll(){
			embeddedSVG.window.map.hideMap();
		}
		function showAll(lat,lon){
			embeddedSVG.window.map.showMap();
		}
		function setCenterLatLon(lat,lon){
			embeddedSVG.window.map.Api.doCenterMapToGeoPosition(lat,lon);
		}
		function setBoundsLatLon(latSW,lonSW,latNE,lonNE){
			embeddedSVG.window.map.Api.doZoomMapToGeoBounds(latSW,lonSW,latNE,lonNE);
		}
		function getCenterLatLon(){
			return embeddedSVG.window.map.Api.getCenterOfMapInGeoPosition();
		}
		function getBoundsLatLon(){
			return embeddedSVG.window.map.Api.getBoundsOfMapInGeoBounds();
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

// .............................................................................
// EOF
// .............................................................................

