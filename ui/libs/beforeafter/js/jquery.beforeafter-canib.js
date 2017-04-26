/*
 * jQuery beforeafter plugin
 * @author admin@catchmyfame.com - http://www.catchmyfame.com
 * @version 1.3
 * @date May 21, 2011
 * @category jQuery plugin
 * @copyright (c) 2009 admin@catchmyfame.com (www.catchmyfame.com)
 * @license CC Attribution-NoDerivs 3.0 Unported - http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function($){
	$.fn.extend({ 
		beforeAfter: function(options)
		{
			var defaults = 
			{
				animateIntro : false,
				introDelay : 1000,
				introDuration : 1000,
				introPosition : .5,
				showFullLinks : true,
				beforeLinkText: 'Show only before',
				afterLinkText: 'Show only after',
				imagePath : './js/',
				cursor: 'pointer',
				clickSpeed: 600,
				linkDisplaySpeed: 200,
				dividerColor: '#888',
				onReady: function(){},
				onMove: function(nWidth){}
			};
		var options = $.extend(defaults, options);

		var randID =  Math.round(Math.random()*100000000);

    		return this.each(function() {
			var o=options;
			var obj = $(this);

			var imgWidth = $('img:first', obj).width();
			var imgHeight = $('img:first', obj).height();

			if( $('div',obj).length != 2 ) $('img',obj).wrap('<div>'); // For backwards compatability. Used to require images to be wrapped in div tags.

			$(obj)
			.width(imgWidth)
			.height(imgHeight)
			.css({'overflow':'hidden','position':'absolute','padding':'0'});

			// Create an inner div wrapper (dragwrapper) to hold the images.
			$(obj).prepend('<div id="dragwrapper'+randID+'"><div id="drag'+randID+'"><img width="8" height="56" alt="handle" src="'+o.imagePath+'handle.gif" id="handle'+randID+'" /></div></div>'); // Create drag handle
			$('#dragwrapper'+randID).css({'opacity':.25,'pointer-events':'all','position':'absolute','padding':'0','left':(imgWidth*o.introPosition)-($('#handle'+randID).width()/2)+'px','z-index':'20'}).width($('#handle'+randID).width()).height(imgHeight);

			$('div:eq(2)', obj).height(imgHeight).width(imgWidth*o.introPosition).css({'position':'absolute','overflow':'hidden','left':'0px','z-index':'10'}); // Set CSS properties of the before image div
			$('div:eq(3)', obj).height(imgHeight).width(imgWidth).css({'position':'absolute','overflow':'hidden','right':'0px'});	// Set CSS properties of the after image div
			$('#drag'+randID).width(2).height(imgHeight).css({'background':o.dividerColor,'position':'absolute','left':'3px'});	// Set drag handle CSS properties
			$('#beforeimage'+randID).css({'position':'absolute','top':'0px','left':'0px'});
			$('#afterimage'+randID).css({'position':'absolute','top':'0px','right':'0px'});
			$('#handle'+randID).css({'z-index':'100','position':'relative','cursor':o.cursor,'top':(imgHeight/2)-($('#handle'+randID).height()/2)+'px','left':'-3px'})

			$(obj).append('<img src="'+o.imagePath+'lt-small.png" width="7" height="15" id="lt-arrow'+randID+'"><img src="'+o.imagePath+'rt-small.png" width="7" height="15" id="rt-arrow'+randID+'">');

			if(o.showFullLinks)
			{	
				$(obj).after('<div class="balinks" id="links'+randID+'" style="position:relative"><span class="balinks"><a id="showleft'+randID+'" href="javascript:void(0)">'+o.beforeLinkText+'</a></span><span class="balinks"><a id="showright'+randID+'" href="javascript:void(0)">'+o.afterLinkText+'</a></span></div>');
				$('#links'+randID).width(imgWidth);
				$('#showleft'+randID).css({'position':'relative','left':'0px'}).click(function(){
					$('div:eq(2)', obj).animate({width:imgWidth},o.linkDisplaySpeed);
					$('#dragwrapper'+randID).animate({left:imgWidth-$('#dragwrapper'+randID).width()+'px'},o.linkDisplaySpeed);
				});
				$('#showright'+randID).css({'position':'relative','right':'0px'}).click(function(){
					$('div:eq(2)', obj).animate({width:0},o.linkDisplaySpeed);
					$('#dragwrapper'+randID).animate({left:'0px'},o.linkDisplaySpeed);
				});
			}

			$('#dragwrapper'+randID).draggable( { containment:obj,drag:drag,stop:drag });

			function drag()
			{
				$('#lt-arrow'+randID+', #rt-arrow'+randID).stop().css('opacity',0);
				$('div:eq(2)', obj).width( parseInt( $(this).css('left') ) + 4 );
				o.onMove.call(this,$('div:eq(2)', obj).width());
			}

			if(o.animateIntro)
			{
				$('div:eq(2)', obj).width(imgWidth);
				$('#dragwrapper'+randID).css('left',imgWidth-($('#dragwrapper'+randID).width()/2)+'px');
				setTimeout(function(){
					$('#dragwrapper'+randID).css({'opacity':1}).animate({'left':(imgWidth*o.introPosition)-($('#dragwrapper'+randID).width()/2)+'px'},o.introDuration,function(){$('#dragwrapper'+randID).animate({'opacity':.25},1000)});
					$('div:eq(2)', obj).width(imgWidth).animate({'width':imgWidth*o.introPosition+'px'},o.introDuration,function(){clickit();o.onReady.call(this);});
				},o.introDelay);
			}
			else
			{
				clickit();
				o.onReady.call(this,$('div:eq(2)', obj).width());
			}

			function clickit()
			{
				$('#dragwrapper'+randID).hover(function(){
						$('#lt-arrow'+randID).stop().css({'z-index':'20','position':'absolute','top':imgHeight/2-$('#lt-arrow'+randID).height()/2+'px','left':parseInt($('#dragwrapper'+randID).css('left'))-10+'px'}).animate({opacity:1,left:parseInt($('#lt-arrow'+randID).css('left'))-6+'px'},200);
						$('#rt-arrow'+randID).stop().css({'position':'absolute','top':imgHeight/2-$('#lt-arrow'+randID).height()/2+'px','left':parseInt($('#dragwrapper'+randID).css('left'))+10+'px'}).animate({opacity:1,left:parseInt($('#rt-arrow'+randID).css('left'))+6+'px'},200);
						$('#dragwrapper'+randID).animate({'opacity':1},200);
					},function(){
						$('#lt-arrow'+randID).animate({opacity:0,left:parseInt($('#lt-arrow'+randID).css('left'))-6+'px'},350);
						$('#rt-arrow'+randID).animate({opacity:0,left:parseInt($('#rt-arrow'+randID).css('left'))+6+'px'},350);
						$('#dragwrapper'+randID).animate({'opacity':.25},350);
					}
				);

				$(obj).one('mousemove', function(){$('#dragwrapper'+randID).stop().animate({'opacity':1},500);}); // If the mouse is over the container and we animate the intro, we run this to change the opacity when the mouse moves since the hover event doesnt get triggered yet
			}
  		});
    	}
	});
})(jQuery);