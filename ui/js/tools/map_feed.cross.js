/**********************************************************************
map_feed.cross.js

$Comment: provides JavaScript for cross domain import of feeds
$Source :map_feed.cross.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2012/01/15 $
$Author: guenter richter $
$Id:map_pipe.js 1 2012-01-15 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log:map_feed.cross.js,v $
**********************************************************************/

/** 
 * @fileoverview This file is a plugin for ixmaps.jsapi top import cross domain feeds
 *
 * @author Guenter Richter guenter.richter@ixmaps.com
 * @version 0.9
 */

/**
 * define namespace ixmaps
 */

window.ixmaps = window.ixmaps || {};
ixmaps.jsapi = ixmaps.jsapi || {};
ixmaps.feed = ixmaps.feed || {};
ixmaps.feed.parse = ixmaps.feed.parse || {};
(function() {

var debug = false;

/**
 * add a cross domain feed to the map  
 * @param szSource the URL of the feed
 * @param opt optional parameter object
 * @type void
 */
	ixmaps.feed.crossDomain = function(szSource,opt,callback){

		console.log("ixmaps.feed.crossDomain: "+szSource);
		
		// check origin and get around cross domain restrictions by using a proxy
		// ----------------------------------------------------------------------
		var rootA = szSource.split('?')[0].split('#')[0].split('/');
		if ( rootA[0] == "http:" || rootA[0] == "https:" ){
			rootA.length = 3;
			szDomain = rootA.join('/');
			if ( szDomain != document.location.host ){

				// check type
				// ----------
				switch (opt.type){
					case "kml": 
					case "Google_Maps_My_Map_KML_YQL":
					case "Google_Maps_My_Map_KML":
						opt.format = "xml";
						opt.type = "kml_json";
					break;
				}
				
				var outputFormat = opt.type.match(/GeoRSS/)?"xml":"json";

				// cross domain !!
				// at the moment we use yahoo query api as a proxy 
				// -----------------------------------------------
				var szUrl  = "http:\/\/query.yahooapis.com\/v1\/public\/yql?q=select%20*%20from%20"+opt.format+"%20where%20url%3D";
					szUrl += "'"+encodeURIComponent(szSource)+"'";
					szUrl += opt.type.match(/GeoRSS/)?"&format=rss&diagnostics=true":"&format="+outputFormat+"&diagnostics=true";
				szSource = szUrl;

				// YQL has been told to respond with json, so change type
				opt.format = outputFormat;

				// flag that we have a proxy
				opt.proxy = "yql";

				ixmaps.message("loading",true);

				$.ajax({
					 type: "GET",
					 url: szSource,
					 dataType: opt.format,
					 success: function(data) {

						if ( (opt.format == "json") && !data.query.results ){
							console.log(data);
							ixmaps.errorMessage(data.query.diagnostics.url.error);
							callback(false);
						}

						// undo proxy (YQL) wrapping
						// -------------------------
						if ( opt.proxy == "yql" ){
							if ( opt.format == "json" ){
								data = 	ixmaps.feed.unwrapYQLjson(data.query.results);
							}
							if ( opt.format == "xml" ){
							}
							opt.proxy = false;
						}
						callback(ixmaps.feed.processFeed(data,opt));
					 },
					 error: function(data) {
						ixmaps.message("loading",false,"x5");
						callback(false);
					}
				});

				return true;
			}
		}
		return false;
	};


/**
 * YQL adds a json object for nested arrays 
 * here we try to unwrap this
 * @param node the original node
 * @type object
 * @return stripped node
 */
	ixmaps.feed.unwrapYQLjson = function(node){
		if ( node.json ){
			node = node.json;
		}
		if ( typeof(node) == 'object' ){
			for ( a in node ){
				if ( node[a] ){
					node[a] = ixmaps.feed.unwrapYQLjson(node[a]);	
				}
			}
		}else
		if ( typeof(node) == 'array' ){
			for ( var a=0; a<node.length; a++ ){
				if ( node[a] ){
					node[a] = ixmaps.feed.unwrapYQLjson(node[a]);
				}
			}
		}
		return node;
	};

/**
 * end of namespace
 */

})();

// -----------------------------
// EOF
// -----------------------------
