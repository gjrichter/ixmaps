/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true*/
/* globals 
	window,
	movieobject, moviename, loadobject, nextobject, do_zoom_level
	*/
var loadedobject = new Array(100);
var anzobjects = 0;
var first_object_level = 15;
var first_clear_level = 15;
var next_object_level = 15;
var fLoadingObject = 0;

function load_object(theObject)
	{
	fLoadingObject = 1;
	if ( theObject.level == null || theObject.level <= 0 )
		theObject.level = next_object_level++;	 
    movieobject(moviename).LoadMovie(theObject.level,theObject.swf);
	nextobject = theObject.nextobject;
	loadobject = theObject;
	loadedobject[anzobjects++] = theObject;
}
function initialize_loadobject() 
    {		 
   	position_object(loadobject,"/object");
	display_object(loadobject,"/object");
	init_object(loadobject,"/object");
    if ( loadobject.nextobject !== 0 )
		load_object(loadobject.nextobject);
	else
		fLoadingObject = 0;		
	}	 
function init_loadobject() 
    {		 
	init_object(loadobject,"/object");
    if ( loadobject.nextobject !== 0 )
		load_object(loadobject.nextobject);
	else
		fLoadingObject = 0;		
	}	 
function loading_object()
    {
	return fLoadingObject;
	}

function position_object_by_clip(level,object,clip,dx,dy)
{
 	   var x,y;
	   x = parseInt(movieobject(moviename).TGetProperty(clip,0));
       movieobject(moviename).TSetProperty(level+object,0,eval("x+dx"));
	   y = parseInt(movieobject(moviename).TGetProperty(clip,1));
       movieobject(moviename).TSetProperty(level+object,1,eval("y+dy"));
}
function position_object_by_xypos(level,object,xpos,ypos)
{
       movieobject(moviename).TSetProperty(level+object,0,eval("xpos"));
       movieobject(moviename).TSetProperty(level+object,1,eval("ypos"));
}
function set_object_null_by_clip(level,object,clip,dx,dy)
{
 	   var x,y;
	   x = parseInt(movieobject(moviename).TGetProperty(clip,0));
       movieobject(moviename).SetVariable(level+":xnull",eval("x+dx"));
	   y = parseInt(movieobject(moviename).TGetProperty(clip,1));
       movieobject(moviename).SetVariable(level+":ynull",eval("y+dy"));
}
function position_object(theObject,name)
	{	 
	if ( theObject.level == -1 )
	   return; 
	var level = "_level"+eval(theObject.level);
	if ( theObject.position )		 
	   {
       movieobject(moviename).TSetProperty(level,7,"0");
	   if ( theObject.position.clip ) {
		  if ( theObject.position.xpos ) 
		  	 position_object_by_xypos(level,name,theObject.position.xpos,theObject.position.ypos);
		  else	 
   	   	     position_object_by_clip(level,name,theObject.position.clip.name,theObject.position.xoff,theObject.position.yoff);
   	   	  set_object_null_by_clip(level,name,theObject.position.clip.name,0,0);
		  }
   	   else
	   	   {
		   movieobject(moviename).TSetProperty(level,0,eval(theObject.position.xoff));
		   movieobject(moviename).TSetProperty(level,1,eval(theObject.position.yoff));
		   }
	   if ( theObject.position.base ) {
           movieobject(moviename).SetVariable(level+":xbase",eval(theObject.position.base.xpos));
           movieobject(moviename).SetVariable(level+":ybase",eval(theObject.position.base.ypos));
           }	   																						 
       movieobject(moviename).SetVariable(level+":level",level);
	   movieobject(moviename).SetVariable(level+":wait","0");
       do_zoom_level(level);
	   }
	}

function display_object(theObject,name)
    {
	if ( theObject.level == -1 )
	   return; 
	var level = "_level"+eval(theObject.level);
	if ( theObject.attribute )		 
	    {
 	   	movieobject(moviename).TSetProperty(level+name,2,eval(theObject.attribute.xscale));
 	   	movieobject(moviename).TSetProperty(level+name,3,eval(theObject.attribute.yscale));
 	   	movieobject(moviename).TSetProperty(level+name,6,eval(theObject.attribute.alpha));
 	   	movieobject(moviename).TSetProperty(level+name+"/bg",6,eval(theObject.attribute.bgalpha));
		}																				  
   	movieobject(moviename).TSetProperty(level,7,"1");
   	movieobject(moviename).TSetProperty(level+name,7,"1");
	}
function init_object(theObject,name)
   {
	if ( theObject.level == -1 )
	   return; 
	if ( theObject.init )		 
	    {
 	   	theObject.init.funct(theObject.level,theObject.init.node,theObject.init.xml);
		theObject.loaded = 1;
		}																				  
	}
function remove_object(level)
    {
    for ( var nr = 0; nr < anzobjects; nr++ ) 
   	   {
	   if ( level == "_level"+eval(loadedobject[nr].level) )
	   	   {
			movieobject(moviename).LoadMovie(loadedobject[nr].level,"swf/basics/clear.swf");
			loadedobject[nr].level = -1;
		   }
	   }
	}	
function remove_allobjects()
   {		 
   for ( var nr = 0; nr < anzobjects; nr++ ) 
   	   {
   	   if ( loadedobject[nr].level != -1 && loadedobject[nr].level >= first_clear_level )
  	   	  movieobject(moviename).LoadMovie(loadedobject[nr].level,"swf/basics/clear.swf");
	   }
   next_object_level  = first_object_level;
   anzobjects = 0;
   }	
function actualize_allobjects() 
   {		 
   for ( var nr = 0; nr < anzobjects; nr++ )
   	   {
	   var theObject;
	   if ( (loadedobject[nr].level != -1) && (theObject = loadedobject[nr]) && theObject.act )		 
       	  {
   		  theObject.act.funct(theObject.level,theObject.act.node,theObject.act.xml);
		  }
	   }	  																				  
   }
   
function object(swf,position,attribute,nextobject)
{
    this.swf 	     = swf;
    this.position    = position;
    this.attribute   = attribute;
    this.nextobject  = nextobject;
	this.level       = -1;
} 
function attribute(alpha,bgalpha,xscale,yscale)
{
    this.alpha 	     = alpha;
    this.bgalpha     = bgalpha;
    this.xscale      = xscale;
    this.yscale      = yscale;
} 
function position(clip,xpos,ypos,xoff,yoff,base)
{
    this.clip 	     = clip;
    this.xpos        = xpos;
    this.ypos        = ypos;
    this.xoff        = xoff;
    this.yoff        = yoff;
    this.base        = base;
} 
function clip(name)
{
    this.name 	     = name;
} 