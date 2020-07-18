/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true*/
/* globals 
	window, document,
	movieobject, moviename, loadobject, nextobject, anzobjects, loadedobject, zoomname, map_zoomframe_level, _level, map_pan_level,
	map_extent
	*/
var zoom = 1;
var xoff = 0;
var yoff = 0;
var xlen = 640;
var ylen = 480;
var zoomframe = 0;
var lastzoom = new Array(0);
var lastzoomCount = 0;

function set_zoom(newzoom,newxoff,newyoff)
{
  zoom=newzoom;
xoff=newxoff;
 yoff=newyoff;
if ( zoomframe === 0 && zoomname )
   movieobject(zoomname).LoadMovie(1,"swf/basics/zoomframe640x480.swf");
else
do_zoom();
}
function change_zoom(value)
{
  zoom += value*Math.ceil(zoom/10);
if ( value === 0 || zoom < 1 ) zoom = 1;
if ( zoomframe === 0 && zoomname )
   movieobject(zoomname).LoadMovie(1,"swf/basics/zoomframe640x480.swf");
else
do_zoom();
}
function do_zoom_level(level)
{
  var xrad = xlen/2/zoom;
  var yrad = ylen/2/zoom;
  movieobject(moviename).TSetProperty(level,0,"-"+eval((xoff-xrad)*zoom));
  movieobject(moviename).TSetProperty(level,1,"-"+eval((yoff-yrad)*zoom));
  movieobject(moviename).TSetProperty(level,2,eval(100*zoom));
  movieobject(moviename).TSetProperty(level,3,eval(100*zoom));
}
function do_offset_level(level)
{
  var xrad = xlen/2/zoom;
  var yrad = ylen/2/zoom;
  movieobject(moviename).TSetProperty(level,0,"-"+eval((xoff-xrad)*zoom));
  movieobject(moviename).TSetProperty(level,1,"-"+eval((yoff-yrad)*zoom));
}
function do_zoom()
{
  var xrad = xlen/2/zoom;
  var yrad = ylen/2/zoom;
if ( xoff < xrad ) xoff=xrad;
if ( yoff < yrad ) yoff=yrad;
if ( xoff > xlen-xrad ) xoff = xlen-xrad;
if ( yoff > ylen-yrad ) yoff = ylen-yrad;
do_zoom_zoommovie();
  if ( zoom != 1 )
  movieobject(moviename).TSetProperty(_level(map_pan_level),7,1);
else
  movieobject(moviename).TSetProperty(_level(map_pan_level),7,0);
  do_zoom_level("_level0/");
do_zoom_level("_level1/");
  for ( var nr = 0; nr < anzobjects; nr++ )
     {
  var level = null;
  if ( (level = loadedobject[nr].level) != -1 )
      do_zoom_level("_level"+eval(level));
  }
}
function do_zoom_zoommovie()
{ 
  var xrad = xlen/2/zoom;
  var yrad = xlen/2/zoom;
  var izoom = Math.floor(zoom/10);
if ( !zoomname ) return;
  movieobject(zoomname).TSetProperty("_level0",0,"-"+eval((xoff-xrad)*izoom));
  movieobject(zoomname).TSetProperty("_level0",1,"-"+eval((yoff-yrad)*izoom));
  movieobject(zoomname).TSetProperty("_level1",0,"-"+eval((xoff-xrad)*izoom));
  movieobject(zoomname).TSetProperty("_level1",1,"-"+eval((yoff-yrad)*izoom));
  movieobject(zoomname).TSetProperty("_level0",2,eval(100*(izoom+1)));
  movieobject(zoomname).TSetProperty("_level0",3,eval(100*(izoom+1)));
  movieobject(zoomname).TSetProperty("_level1",2,eval(100*(izoom+1)));
  movieobject(zoomname).TSetProperty("_level1",3,eval(100*(izoom+1)));
  movieobject(zoomname).TSetProperty("_level1/zoom_frame",2,eval(Math.ceil(100/zoom)));
  movieobject(zoomname).TSetProperty("_level1/zoom_frame",3,eval(Math.ceil(100/zoom)));
  movieobject(zoomname).TSetProperty("_level1/zoom_frame",0,eval(parseInt(xoff)));
  movieobject(zoomname).TSetProperty("_level1/zoom_frame",1,eval(parseInt(yoff)));
}
function do_pan(args)
  {
if ( args == 'left' )
  xoff -= 10;
if ( args == 'right' )
  xoff += 10;
if ( args == 'up' )
  yoff -= 10;
if ( args == 'down' )
  yoff += 10;
if ( zoomframe === 0 && zoomname )
   movieobject(zoomname).LoadMovie(1,"swf/basics/zoomframe.swf");
else
do_zoom();
}
function do_map_zoomframe()
  {  
var xanf = parseFloat(movieobject(moviename).GetVariable(_level(map_zoomframe_level)+":startx"));
var yanf = parseFloat(movieobject(moviename).GetVariable(_level(map_zoomframe_level)+":starty"));
var xend = parseFloat(movieobject(moviename).GetVariable(_level(map_zoomframe_level)+":endx"));
var yend = parseFloat(movieobject(moviename).GetVariable(_level(map_zoomframe_level)+":endy"));
var delta;
if ( (delta = Math.max(xend-xanf,yend-yanf)) > 20/zoom )
   { 
   xoff = eval(xanf+((xend-xanf)/2));
   yoff = eval(yanf+((yend-yanf)/2));
   zoom = Math.floor(map_extent.x/delta);
   lastzoom[lastzoomCount++]={xoff:xoff,yoff:yoff,zoom:zoom};
   do_zoom();  
   }
else 
   { 
   xoff = eval(xanf+((xend-xanf)/2));
   yoff = eval(yanf+((yend-yanf)/2));
   do_zoom();  
   }
}
function doLastZoomframe(){
	if(lastzoomCount>0)lastzoomCount--;
	xoff = lastzoom[lastzoomCount].xoff;
	yoff = lastzoom[lastzoomCount].yoff;
	zoom = lastzoom[lastzoomCount].zoom;
	do_zoom();
}

