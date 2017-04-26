/**********************************************************************
 htmlgui_query.js

$Comment: provides JavaScript for map query fro html
$Source : htmlgui_query.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2006/02/03 $
$Author: guenter richter $
$Id: htmlgui_query.js 3 2007-01-31 15:42:55Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_query.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides functions to generate and execute SVGGIS map queries<br>
 * it also contains functions to display the query results 
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

(function( ixmaps, $, undefined ) {

	var foundNodes = null;
	var szSelectedTheme = null;
	var szAdvancedsearchSelectedTheme = null;
	var szDisplayField = null;
	var szDisplayFieldA = null;
	var fAllFields = false;
	var fNoPages   = false;
	var fDisplayMode = 'normal';
	var fSearchMode = 'normal';
	var outputWindow = null;

ixmaps.doSwitchMapTheme = function(szTheme,szFlag){
	try{
		return ixmaps.embeddedSVG.window.map.Api.switchMapTheme(szTheme,szFlag);
	}
	catch(e){
	}
}

ixmaps.doQueryActiveTheme = function(){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getActiveTheme();
	}
	catch(e){
		return null;
	}
}

ixmaps.doQueryThemes = function(){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getThemes();
	}
	catch(e){
		return null;
	}
}

ixmaps.doQueryThemesWithInfo = function(){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getThemesWithInfo();
	}
	catch(e){
		return null;
	}
}

ixmaps.doQueryThemesWithSelection = function(){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getThemesWithSelection();
	}
	catch(e){
		return null;
	}
}

ixmaps.doQueryFields = function(szTheme){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getFieldsOfTheme(szTheme);
	}
	catch(e){
		return (new Array(szTheme+" not found"));
	}
}
ixmaps.doQueryValues = function(szTheme,szField,nMaxCount){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getValuesOfFieldAndTheme(szTheme,szField,nMaxCount);
	}
	catch(e){
		return (new Array(szField+" not found"));
	}
}
ixmaps.doQuerySelectionValues = function(szTheme,nMaxCount){
	try{
		return ixmaps.embeddedSVG.window.map.Query.getSelectionValuesOfTheme(szTheme,nMaxCount);
	}
	catch(e){
		return (new Array(" not found"));
	}
}
ixmaps.doCreateChart = function(szTheme,szField,szField100,szType,szColorScheme,nClasses){
	var csMonoBlue  = new Array(5,"#eeeeff","#0000dd");
	var csMonoRed   = new Array(5,"#ffeeee","#dd0000");
	var csMonoGreen = new Array(5,"#eeffee","#00dd00");
	var csMonoCyan	= new Array("#888800","#aaaa00","#cccc00","#eeee00","#ffff00" );
	var csRedGreen  = new Array(5,"#ff8888","#88ff88" );
	var csGreenRed  = new Array(5,"#88ff88","#ff8888" );
	var csSpectrum  = new Array(5,"spectrum","" );
	var csOffice    = new Array(5,"office","" );
	var csMineral   = new Array(5,"mineral","" );
	var csHarvest   = new Array(5,"harvest","" );
	var colorSchemeA = {	monored:csMonoRed
						   ,monogreen:csMonoGreen
						   ,monoblue:csMonoBlue
		                   ,1:csMonoCyan
		                   ,2:csRedGreen
		                   ,3:csGreenRed
		                   ,4:csSpectrum
		                   ,5:csOffice
		                   ,6:csMineral
		                   ,7:csHarvest
		};

	try{
		if (szColorScheme.match(/Array/)){
			var colorScheme = eval(szColorScheme);
		}
		else {
			var colorScheme = colorSchemeA[szColorScheme];
		}
		if (nClasses){
			if ( typeof(colorScheme[0]) == "number" ){
				colorScheme[0] = Number(nClasses);
			}
			else{
				colorScheme[1] = colorScheme[0];
				colorScheme[2] = colorScheme[colorScheme.length-1];
				colorScheme[0] = Number(nClasses);
				colorScheme.length = 3;
			}
		}
		var themeObj = ixmaps.embeddedSVG.window.map.Api.newMapTheme(szTheme,szField,szField100,'type:'+szType+';colorscheme:'+colorScheme+';');
		//var themeObj = ixmaps.embeddedSVG.window.map.Api.createTheme(szTheme,szField,szField100,szType,colorScheme);
		if ( themeObj ){
			themeObj.makeVisible();
		}
		return themeObj;
	}
	catch(e){
		alert("Chart could not be created");
	}
}

/* ------------------------------------------------------------------ * 
	Init form fields 
 * ------------------------------------------------------------------ */
 
ixmaps.InitNormalSearch = function(){

	var themesA = this.doQueryThemes();
	if ( !themesA ){
		setTimeout("ixmaps.InitNormalSearch()",500);
		return;
	}
	var output      = window.document.getElementById("themeOptions");
	var szHTML = "";
	szHTML += "<select class='ifield' id='themeList' name='themeList[]' size='5' multiple='true' onmouseover=\"ShowTip('select theme\(s\) to search within; \(multiple select possible with CTRL\)');\" onmouseout=\"HideTip();\">";
	szHTML += "<option value='all' selected='true'>all themes&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<\/option>";

	for (var i=0;i<themesA.length;i++){
		szHTML += "<option value='"+themesA[i]+"'>"+themesA[i]+"<\/option>";
	}

//	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;
}

ixmaps.InitAdvancedSearch = function(szTheme){

	var themesA = this.doQueryThemesWithInfo();
	if ( !themesA ){
		setTimeout("InitChart()",500);
		return;
	}

	var output  = window.document.getElementById("advancedsearchThemeOptions");
	var szHTML = "";
	szHTML += "<select class='ifield' id='advancedsearchThemeList' name='advancedsearchThemeList[]' size='1' style='width:120px;' onmouseover=\"ShowTip('select theme\(s\) to search within; \(multiple select possible with CTRL\)');\" onmouseout=\"HideTip();\" onchange=\"ixmaps.InitAdvancedSearchFields();\">";
	for (var i=0;i<themesA.length;i++){
		szHTML += "<option value='"+themesA[i]+"'>"+themesA[i]+"<\/option>";
	}
//	szHTML += "<option value='_'>________________<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

	if ( !szTheme ){
		szTheme = themesA[0];
	}
	var advancedsearchForm  = window.document.getElementById("MapAdvancedSearchForm");
	themesA = advancedsearchForm.advancedsearchThemeList;
	for(var i=0; i<themesA.length; ++i) {
		themesA[i].selected = (themesA[i].value == szTheme)?true:false;
	}
	this.InitAdvancedSearchFields(szTheme);
}

ixmaps.InitAdvancedSearchFields = function(szTheme){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	var szTheme		= searchForm.advancedsearchThemeList.value;
	szAdvancedsearchSelectedTheme = szTheme;

	if( szTheme == null || szTheme == "" ){
		return;
	}

	szDisplayFieldA = this.doQueryFields(szTheme);
	var fieldsA = szDisplayFieldA.slice(0,szDisplayFieldA.length);
	fieldsA.sort();

	var output      = window.document.getElementById("fieldOptions");
	var szHTML = "";
	szHTML += "<select class='ifield' id='fieldList' name='fieldList[]' size='6' style='width:120px;' onclick=\"ixmaps.advancedSearchAddField();\">";
	for (var i=0;i<fieldsA.length;i++){
		if (fieldsA[i].length){
			szHTML += "<option value='"+fieldsA[i]+"'>"+fieldsA[i]+"<\/option>";
		}
	}
//	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

	var output      = window.document.getElementById("displayOptions");
	
	var szHTML = "";
	szHTML += "all Fields ";
	szHTML += "<input type='checkbox' name='allfields' onclick=\"ixmaps.advancedSearchChangeDisplay();\" />";

	szHTML += " Display Field ";
	szDisplayField = fieldsA[0];
	szHTML += "<select class='ifield' id='displayList' name='displayList[]' size='1' style='width:120px;'onchange=\"ixmaps.advancedSearchChangeDisplay();\">";
	for (var i=0;i<fieldsA.length;i++){
		if (fieldsA[i].length){
			szHTML += "<option value='"+fieldsA[i]+"'>"+fieldsA[i]+"<\/option>";
		}
	}
	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	searchForm.aquery.value = "";
}

ixmaps.InitAdvancedSearchValues = function(){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	var szField		= searchForm.fieldList.value;

	var valuesA = this.doQueryValues(szAdvancedsearchSelectedTheme,szField);
	var output      = window.document.getElementById("valueOptions");
	var szHTML = "";
	var szValue = "";
	szHTML += "<select class='ifield' id='valueList' name='valueList' size='6' style='width:120px;' onclick=\"ixmaps.advancedSearchAddValue();\">";

	var uniqueA = new Array(0);	
	for (var i=0;i<valuesA.length;i++){
		szValue = valuesA[i];
		if ( !uniqueA[String(szValue)] ){
			szHTML += "<option value='"+valuesA[i]+"'>"+szValue+"<\/option>";
			uniqueA[String(szValue)] = szValue;
		}
	}
//	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

}

ixmaps.InitChart = function(szTheme){

	var themesA = this.doQueryThemesWithInfo();
	if ( !themesA ){
		setTimeout("InitChart()",500);
		return;
	}

	var output  = window.document.getElementById("chartThemeOptions");
	var szHTML = "";
	szHTML += "<select class='ifield' id='chartThemeList' name='chartThemeList[]' size='1' onmouseover=\"ShowTip('select theme\(s\) to search within; \(multiple select possible with CTRL\)');\" onmouseout=\"HideTip();\" onchange=\"ixmaps.InitChartFields();\">";
	for (var i=0;i<themesA.length;i++){
		szHTML += "<option value='"+themesA[i]+"'>"+themesA[i]+"<\/option>";
	}
	szHTML += "<option value='_'>________________<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

	if ( !szTheme ){
		szTheme = themesA[0];
	}
	var chartForm  = window.document.getElementById("MapChartForm");
	themesA = chartForm.chartThemeList;
	for(var i=0; i<themesA.length; ++i) {
		themesA[i].selected = (themesA[i].value == szTheme)?true:false;
	}
	this.InitChartFields(szTheme);
}

ixmaps.InitChartFields = function(szTheme){

	var searchForm  = window.document.getElementById("MapChartForm");
	var szTheme		= searchForm.chartThemeList.value;
	szSelectedTheme = szTheme;

	if( szTheme == null || szTheme == "" ){
		return;
	}
	var szDisplayFieldA = this.doQueryFields(szTheme);
	var fieldsA = szDisplayFieldA.slice(0,szDisplayFieldA.length);
	fieldsA.sort();

	var output      = window.document.getElementById("chartFieldOptions");
	var szHTML = "";
	szHTML += "<select class='ifield' id='chartFieldList' name='chartFieldList[]' size='6' onclick=\"ixmaps.InitChartValues();\">";
	for (var i=0;i<fieldsA.length;i++){
		if (fieldsA[i].length){
			szHTML += "<option value='"+fieldsA[i]+"'>"+fieldsA[i]+"<\/option>";
		}
	}
	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;

	var output      = window.document.getElementById("chartField100Options");
	var szHTML = "";
	szHTML += "<select class='ifield' id='chartField100List' name='chartField100List[]' size='1' >";
	szHTML += "<option value=''>none<\/option>";
	for (var i=0;i<fieldsA.length;i++){
		if (fieldsA[i].length){
			szHTML += "<option value='"+fieldsA[i]+"'>"+fieldsA[i]+"<\/option>";
		}
	}
	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;
}

ixmaps.InitChartValues = function(){

	var searchForm  = window.document.getElementById("MapChartForm");
	var szField		= searchForm.chartFieldList.value;

	var valuesA = this.doQueryValues(szSelectedTheme,szField,10);
	var output      = window.document.getElementById("chartValueOptions");
	var szHTML = "";
	var szValue = "";
	szHTML += "<select class='ifield' id='chartValueList' name='chartValueList' size='6' >";
	
	for (var i=0;i<valuesA.length;i++){
		szValue = valuesA[i]; 
		szHTML += "<option value='"+valuesA[i]+"'>"+szValue+"<\/option>";
	}
	szHTML += "<option value='"+"---"+"'>"+"_______________"+"<\/option>";
	szHTML += "<\/select>";
	output.innerHTML = szHTML;
}

/* ------------------------------------------------------------------ * 
	build query
 * ------------------------------------------------------------------ */

var lastQueryAdd = 0;
var lastQueryValue = "";
ixmaps.advancedSearchClearQuery = function(){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	searchForm.aquery.value = "";
}

ixmaps.advancedSearchCheckQuery = function(nStep){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	if ( searchForm.aquery.value.length == 0 ){
		lastQueryValue = "";
		lastQueryAdd = 0;
	}
	if ( lastQueryAdd == (nStep + 1) ){
		searchForm.aquery.value = lastQueryValue;
		lastQueryAdd = nStep;
	}
	return (lastQueryAdd == nStep);
}

ixmaps.advancedSearchAddField = function(){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	var szField		= searchForm.fieldList.value;

	if ( this.advancedSearchCheckQuery(0) ){
		lastQueryAdd = 1;
		lastQueryValue = searchForm.aquery.value;
		searchForm.aquery.value += searchForm.aquery.value.length?" "+szField:szField;
	}
	this.InitAdvancedSearchValues();
}

ixmaps.advancedSearchAddValue = function(){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	var szValue		= searchForm.valueList.value;
	
	if ( this.advancedSearchCheckQuery(2) ){
		lastQueryAdd = 3;
		lastQueryValue = searchForm.aquery.value;
		searchForm.aquery.value += searchForm.aquery.value.length?" "+szValue:szValue;
	}
}

ixmaps.advancedSearchAddOperator = function(szOperator){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");

	if ( this.advancedSearchCheckQuery(1) ){
		lastQueryAdd = 2;
		lastQueryValue = searchForm.aquery.value;
		searchForm.aquery.value += searchForm.aquery.value.length?" "+szOperator:szOperator;
	}
	if ( (szOperator == "and" || szOperator == "or" ) && this.advancedSearchCheckQuery(3) ){
		lastQueryAdd = 0;
		lastQueryValue = searchForm.aquery.value;
		searchForm.aquery.value += searchForm.aquery.value.length?" "+szOperator:szOperator;
	}
}

ixmaps.advancedSearchChangeDisplay = function(szMode){

	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	szDisplayField   = searchForm.displayList.value;
	fAllFields       = searchForm.allfields.checked;
	fNoPages		 = (szMode != null && szMode == "all")?true:false;
	ixmaps.displaySearchMapResult(0);
}

ixmaps.advancedSearchGetStatistics = function(){
	clearFound();
	output   = window.document.getElementById("found");
	var szOutput="";
	szOutput += "<span colspan='3' align='right' class='foundtotal'>";
	szOutput += "Sorry :-( Statistics not yet implemented !";
	szOutput += "</span>";
	output.innerHTML = szOutput;
}

/* ------------------------------------------------------------------ * 
	execute map search, query, ...
 * ------------------------------------------------------------------ */

function clearFound(){

	if ( window.document.getElementById("foundtotal") ){
		outputWindow = window;
	}
	else{
		if (outputWindow){
			try{
				outputWindow.focus();
			}
			catch (e){
				outputWindow = null;
			}
		}
		if ( !outputWindow || outputWindow.closed ){
			szUrl = "../html/popupresult.html";
			if ( typeof(ixmaps.openDialog) == "function"  ){
				ixmaps.openDialog(null,"dialog",szUrl,"result","100,100",300,400,1);
				outputWindow = window.document.getElementById("dialogframe").contentWindow;
				outputWindow.ixmaps = ixmaps;
			}else{
				outputWindow = window.open(szUrl,"test","dependent=yes,alwaysRaised=yes,titlebar=no,width=350,height=300,resizable=yes,screenX=200,screenY=100");
				outputWindow.ixmaps = ixmaps;
			}
			return false;
		}
		else{
			outputWindow.document.getElementById("foundtotal").innerHTML = "";
			outputWindow.document.getElementById("found").innerHTML = "";
			outputWindow.document.getElementById("foundpaging").innerHTML = "";
		}
	}
	return true;
}

ixmaps.createChart = function(){

	var searchForm  = window.document.getElementById("MapChartForm");
	var szField		= window.document.getElementById("chartFieldList").value;
	var szField100	= window.document.getElementById("chartField100List").value;
	var szType		= window.document.getElementById("chartThemeType").value;
	var szMethod	= window.document.getElementById("chartMethod").value;
	var szColorScheme= window.document.getElementById("chartThemeColors").value;
	try{
		var nClasses     = window.document.getElementById("chartThemeNrClasses").value;
	}
	catch (e){
	}
	var szOvervType = window.document.getElementById("chartThemeOverviewType").value;

	var valuesA = this.doCreateChart(szSelectedTheme,szField,szField100,szType+"|"+szOvervType+"|"+szMethod,szColorScheme,nClasses);
}


ixmaps.searchMap = function(){

	if ( !clearFound() ){
		setTimeout("ixmaps.searchMap()",500);
		return;
	}
	var searchForm  = window.document.getElementById("MapSearchForm");
	var output      = outputWindow.document.getElementById("found");

	output.innerHTML = "please wait ... <img src='../images/magnifying-glass.gif' width='16' height='16' ALT='loading...' />";

	var szSearchMode = "any";
	if (searchForm && searchForm.searchmode){
		for ( var i=0; i<searchForm.searchmode.length; i++ ){
			if ( searchForm.searchmode[i].checked ){
				szSearchMode = searchForm.searchmode[i].value;
			}
		}
	}

	var selectedThemesA = new Array(0);
	var szTheme = "";
	if (searchForm && searchForm.themeList){
		var themesA = searchForm.themeList;
		for(var i=0; i<themesA.length; ++i) {
			if(themesA[i].selected) {
				if (szTheme.length){
					szTheme += "|";
				}
				szTheme += themesA[i].value;
			}
		}
	}
	else {
		szTheme = "all";
	}
	try{
		ixmaps.embeddedSVG.window.map.Api.displayMessage("searching ...",1000);
	}
	catch (e){
	}
	setTimeout("ixmaps.doSearchMap('"+searchForm.query.value+"','" +szSearchMode+"','" +szTheme+"')",100);
}

ixmaps.doSearchMap = function(szQuery,szMethod,szTheme){
	try{
		foundNodes  = ixmaps.embeddedSVG.window.map.Query.searchItem(szQuery,szMethod,szTheme);
	}
	catch(e){
		alert("Query could not be executed");
	}
	sortFoundNodes(0,1);
	if ( foundNodes.length ){
		clearFound();
		if ( fDisplayMode.match(/show/) ){
			this.gotoSearchMapResult(-1);
		}
		if ( fDisplayMode.match(/moveto/) ){
			this.gotoSearchMapResult((foundNodes.length > 1)?-1:0,"0");
		}
		if ( fDisplayMode.match(/zoomto/) ){
			if (foundNodes.length > 1){
				this.gotoSearchMapResult(-1);
			}
			this.gotoSearchMapResult(-1,"zoomto");
			return;
		}
		if ( fDisplayMode.match(/showonly/) ){
			return;
		}
	}
	ixmaps.displaySearchMapResult(0);
}

ixmaps.advancedSearchMap = function(){
	clearFound();
	var searchForm  = window.document.getElementById("MapAdvancedSearchForm");
	var output      = window.document.getElementById("found");

	output.innerHTML = "please wait ... <img src='../images/magnifying-glass.gif' width='16' height='16' ALT='loading...' />";

	setTimeout("ixmaps.doAdvancedSearchMap('"+searchForm.aquery.value+"','" +szAdvancedsearchSelectedTheme+"')",100);
}

ixmaps.doAdvancedSearchMap = function(szQuery,szTheme){
	try{
		foundNodes  = ixmaps.embeddedSVG.window.map.Query.searchItemAdvanced(szQuery,szTheme);
	}
	catch(e){
		alert("Query could not be executed");
	}
	ixmaps.displaySearchMapResult(0);
}

function doSearchMapForItemsOfClass(szClassname){
	try{
		if ( szClassname && szClassname.length ){
			foundNodes  = ixmaps.embeddedSVG.window.map.Query.searchItemByAttribute("class",szClassname);
			if ( !foundNodes || !foundNodes.length ){
				foundNodes  = ixmaps.embeddedSVG.window.map.Query.searchItemByAttribute("value",szClassname);
			}
		}
		else{
			alert("Empty query !");
		}
	}
	catch(e){
		alert("Query could not be executed");
	}
    ixmaps.displaySearchMapResult(0);
}


function contextualSearch(szField){
	var output      = window.document.getElementById("found");

	clearFound();
	fDisplayMode = 'fields';
	output.innerHTML = "please wait ... <img src='../images/magnifying-glass.gif' width='16' height='16' ALT='loading...' />";

	setTimeout("doContextualSearch('"+szField+"')",100);
}

function doContextualSearch(szField){

	var searchForm  = window.document.getElementById("MapSearchForm");

	try{
		var szId = ixmaps.embeddedSVG.window.map.Event.getContextMenuObjId();
		var szValue = null;
	
		var szTheme = szId.split('#')[0].split(':')[0];
		if ( szTheme == 'legend' ){
			szTheme = szId.split(':')[2];
			szValue = szId.split('::')[1];
		}
		else{
			var szClassname = ixmaps.embeddedSVG.window.map.Query.getClassnameOfItem(szId);
			fAllFields = 1;
			setTimeout("doSearchMapForItemsOfClass('"+szClassname+"')",10);
			return;
		}
		var themesA = searchForm.themeList;
		for(var i=0; i<themesA.length; ++i) {
			themesA[i].selected = (themesA[i].value == szTheme)?true:false;
		}

		szField = ixmaps.embeddedSVG.window.map.Api.getMapThemeRendererField(szId);
		if ( !szValue ){
			szValue = ixmaps.embeddedSVG.window.map.Query.getValueOfFieldAndItem(szId,szField);
		}

		var	szQuery = null;
		if ( szField ){
			szQuery = szField+' == '+szValue;
			searchForm.query.value = szQuery;
			fAllFields = 1;
			setTimeout("ixmaps.doAdvancedSearchMap('"+szQuery+"','"+szTheme+"')",10);
		}
		else{
			szQuery = '*';
			searchForm.query.value = szQuery;
			fAllFields = 1;
			setTimeout("ixmaps.doSearchMap('"+szQuery+"','whole','"+szTheme+"')",10);
		}
	}
	catch(e){
		alert("map api error!");
	}
}

function htmlgui_setInfoShape(szId){
	var debugDiv  = window.document.getElementById("debugdiv");
	if (debugDiv){
		debugDiv.innerHTML = szId;
	}
}
/* ------------------------------------------------------------------ * 
	display search results
 * ------------------------------------------------------------------ */

ixmaps.displaySearchMapResult = function(startIndex,szMode){

	var output   = null;
	var szOutput = "";

	// no search result object - clear display
	// ----------------------------------------
	if ( !foundNodes ){
		output   = outputWindow.document.getElementById("found");
		output.innerHTML = "";
		output   = outputWindow.document.getElementById("foundpaging");
		szOutput = "";
		output.innerHTML = "";
		return;
	}

	// some variables for thye paging
	// -------------------------------
	var endIndex = Math.min(foundNodes.length,startIndex+10);
	var maxRows	 = 10;

	// make summary line
	// -------------------------------
	output   = outputWindow.document.getElementById("foundtotal");
	szOutput = "";
	szOutput += "<span colspan='3' align='right' class='foundtotal'>";
	szOutput += foundNodes.length+' matches found';
	szOutput += "</span>";
	if ( foundNodes.length > 0 ){
		szOutput += " <a class='link' onclick='javascript:ixmaps.gotoSearchMapResult(-1,\"show\")'><img src='../images/highlight_big.gif' width='14' height='14' alt='highlight items'  title='highlight items' border='0'/><\/a>";
		szOutput += " <a class='link' onclick='javascript:ixmaps.gotoSearchMapResult(-1,\"zoomto\")'><img src='../images/magnifying-glass.gif' width='14' height='14' alt='zoom to items' title='zoom to items' border='0'/><\/a>";
		szOutput += " <a class='link' onclick='javascript:ixmaps.gotoSearchMapResult(-1,\"info\")'><img src='../images/bubble_2.gif' width='14' height='14' alt='show info of items' title='show info of items' border='0'/><\/a>";
		szOutput += " <a class='link' onclick='javascript:ixmaps.gotoSearchMapResult(-1,\"select\")'><img src='../images/select.gif' width='14' height='14' alt='select items' title='select items' border='0'/><\/a>";
	}
	output.innerHTML = szOutput;

	// search result has 0 elements (nothing found)
	// ----------------------------------------------
	if ( foundNodes.length == 0 ){
		output   = outputWindow.document.getElementById("found");
		output.innerHTML = "";
		output   = outputWindow.document.getElementById("foundpaging");
		szOutput = "";
		output.innerHTML = "";
		ixmaps.embeddedSVG.window.map.Api.displayMessage("not found ! ",3000);
		return;
	}
		
	// ok, we have elements, make result table
	// ----------------------------------------------
	output   = outputWindow.document.getElementById("found");

	if ( foundNodes[0].feature  == '*' ){
		fDisplayMode = 'fields';
		fAllFields = 1;
	}

	var style = output.style;
	style.width		= (fAllFields|fNoPages)?"370px":"";
	style.height	= (fAllFields|fNoPages)?"215px":"";
	style.overflow  = (fAllFields|fNoPages)?"scroll":"";
	maxRows			= (fNoPages)?10000:10;

	szOutput = "";
	szOutput += "<table id='resultTable' >";

	if( fSearchMode == 'advanced' || fDisplayMode == 'advanced' || fDisplayMode == 'fields' || foundNodes[0].feature  == '*' ){

		szDisplayFieldA = doQueryFields(foundNodes[0].theme);

		var nFieldIndex = 0;
		for (var i=0; i<szDisplayFieldA.length; i++ ){
			if ( szDisplayFieldA[i] == szDisplayField ){
				nFieldIndex = i;
			}
		}
		szOutput += "<tr class='foundheader'>";
		szOutput += "<td><\/td>";
		var nStart = fAllFields?0:nFieldIndex;
		var nEnd   = fAllFields?szDisplayFieldA.length:nStart+1;
		for ( var n=nStart; n<nEnd; n++ ){
			szOutput += "<td width='80px' bgcolor='#eeeeff' style='border:2'><a class='link' href='javascript:redisplayFoundNodesSorted("+n+")' title='click to sort' >"+szDisplayFieldA[n]+"<\/a><\/td>";
			}

		szOutput += "<\/tr>";
		for ( var i=startIndex; i<Math.min(foundNodes.length,startIndex+maxRows); i++ ){
			szEvent = "onclick='TROnClick(this,"+i+")' onmouseover='TROnOver(this)' onmouseout='TROnOut(this)' ";
			szOutput += "<tr bgcolor='#eeeeaa' id='resultTable_TR_"+i+"' "+szEvent+" ><td bgcolor='#eeeeee' >";
			szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",\"zoomto\",30)'><img src='../images/magnifying-glass.gif' width='14' height='14' ALT='zoom to item' border='0'/><\/a>";
			szOutput += "<\/td>";
			for ( var n=nStart; n<nEnd; n++ ){
				szOutput += "<td nowrap>";
				szOutput += "<span class='cell'>"+foundNodes[i].itemA[n]+"<\/span>";
				szOutput += "<\/td>";
			}
			if ( fAllFields ){
				szOutput += "<td nowrap>";
				szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",1,30)'><img src='../images/magnifying-glass.gif' width='14' height='14' ALT='zoom to item' border='0'/><\/a>";
				szOutput += "<\/td>";
			}
			szOutput += "<\/tr>";
		}
	}
	else{
		szOutput += "<tr class='foundheader'><td>Theme<\/td><td>Feature<\/td><td>Value<\/td><\/tr>";
		for ( var i=startIndex; i<Math.min(foundNodes.length,startIndex+maxRows); i++ ){
			szOutput += "<tr bgcolor='#eeeeaa' id='resultTable_TR_"+i+"'><td bgcolor='#eeeeee' >";
			szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",\"0\")' title='click to locate in map'>"+foundNodes[i].theme+"<\/a>";
			szOutput += "<\/td><td>";
			szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",\"0\")'>"+foundNodes[i].feature+"<\/a>";
			szOutput += "<\/td><td>";
			szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",\"0\")'>"+foundNodes[i].item+"<\/a>";
			szOutput += "<\/td><td>";
			szOutput += "<a class='link' href='javascript:ixmaps.gotoSearchMapResult("+i+",1,30)'><img src='../images/magnifying-glass.gif' width='14' height='14' ALT='zoom to item' border='0'/><\/a>";
			szOutput += "<\/td><\/tr>";
		}
	}
	szOutput += "<\/table>";

	output.innerHTML = szOutput;
	output   = outputWindow.document.getElementById("foundpaging");
	szOutput = "";

	szOutput += "<center>";
	szOutput += "<h4>";

	if ( fNoPages ){
		szOutput += "<table width='100%'><tr width='100%'><td align='right'>";
		szOutput += "<a class='link' href='javascript:advancedSearchChangeDisplay(\"pages\");'> [pages]<\/a>"; 
		szOutput += "</td></tr></table>";
	}
	else {
		if ( startIndex ){
			szOutput += "<a class='link' href='javascript:ixmaps.displaySearchMapResult("+(startIndex-10)+");'>prev<\/a>"; 
		}
		else{
			szOutput += "<span class='link'>&nbsp;&nbsp;&nbsp;&nbsp;<\/span>"; 
		}
		szOutput += "<span class='foundtotal'> "+startIndex+" - "+endIndex+" <\/span>"; 

		if ( foundNodes.length >startIndex+10 ){
			szOutput += "<a class='link' href='javascript:ixmaps.displaySearchMapResult("+(startIndex+10)+");'>next<\/a>"; 
		}
		szOutput += "&nbsp;&nbsp;&nbsp;&nbsp;<a class='link' style='font-weight:normal' href='javascript:advancedSearchChangeDisplay(\"all\");'>[all]<\/a>"; 
	}

		szOutput += "<\/center>";

		output.innerHTML = szOutput;
};

/* ------------------------------------------------------------------ * 
	handle table onover, out, click to give the row an unique background color
 * ------------------------------------------------------------------ */
var __oldElementBgColor = null;
var __clickElement = null;
var __oldClickElementBgColor = null;

function TROnOver(obj){
	__oldElementBgColor = obj.getAttribute("bgColor");
	if ( obj != __clickElement ){
		obj.setAttribute("bgColor","#eeeedd");
	}
}
function TROnOut(obj){
	if (__oldElementBgColor){
		if ( obj == __clickElement ){
			obj.setAttribute("bgColor","#ffff66");
		}
		else{
			obj.setAttribute("bgColor",__oldElementBgColor);
		}
	}
}
function TROnClick(obj,nr){
	if (__clickElement){
		if (__clickElement != obj){
			__clickElement.setAttribute("bgColor",__oldClickElementBgColor);
		}
	}
	if (__clickElement != obj){
		__clickElement = obj;
		__oldClickElementBgColor = __oldElementBgColor;
		ixmaps.gotoSearchMapResult(nr,"0");
		obj.setAttribute("bgColor","#ffff66");
	}
//	gotoSearchMapResult(nr,"0");
}

function highlightTD(nIndex){
	var tableNode = outputWindow.document.getElementById("resultTable_TR_"+nIndex+"");
	if (tableNode){
		tableNode.setAttribute("bgcolor","#ffffff");
	}
}

/* ------------------------------------------------------------------ * 
	helper
 * ------------------------------------------------------------------ */

ixmaps.gotoSearchMapResult = function(nIndex,mode,nZoom){
	highlightTD(nIndex);
	ixmaps.embeddedSVG.window.map.Query.gotoFoundItem(nIndex,mode,nZoom);
}

/* ------------------------------------------------------------------ * 
	sort columns in search results
 * ------------------------------------------------------------------ */

var nResortDir   = 1;
function redisplayFoundNodesSorted(nIndex){
	sortFoundNodes(nIndex,nResortDir);
	ixmaps.isplaySearchMapResult(0);
	nResortDir *= -1;
}
var nSortItemIndex = null;
var nSortItemDir   = 1;
function sortFoundNodes(nIndex,nDir){
	if ( nDir){
		nSortItemDir = nDir;
	}
	nSortItemIndex = nIndex;
	try{
		foundNodes.sort(sortFoundNodesCompare);
	}
	catch (e){
	}
}
function sortFoundNodesComparex(a, b) {
	if ( Number(a.itemA[nSortItemIndex]) > Number(b.itemA[nSortItemIndex]) ){
		return nSortItemDir;
	}
	if ( Number(a.itemA[nSortItemIndex]) < Number(b.itemA[nSortItemIndex]) ){
		return -nSortItemDir;
	}
	return 0;
}
function sortFoundNodesCompare(a, b) {
	if ( Number(a.itemA[nSortItemIndex]) && Number(b.itemA[nSortItemIndex]) ){
		return sortFoundNodesComparex(a, b);
	}
	if ( a.itemA[nSortItemIndex] > b.itemA[nSortItemIndex] ){
		return nSortItemDir;
	}
	if ( a.itemA[nSortItemIndex] < b.itemA[nSortItemIndex] ){
		return -nSortItemDir;
	}
	return 0;
}
}( window.ixmaps = window.ixmaps || {}, null ));

