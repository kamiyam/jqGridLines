/**
 * jqGridLines
 *
 * @version      v0.1
 * @author       kamiyam (http://twitter.com/kamiyam)
 * @copyright    (c) 2011 Canvasを使ったGrid表示用jQueryプラグイン
 * @license      The MIT License
 * @link         https://github.com/kamiyam/jqGridLines
 *
 */


(function($){
  if( $ == null )	alert( "must be loading jQuery" );
	
//start
$.jqGridLines = function( options )
{
	if (!(this instanceof $.jqGridLines)) return new $.jqGridLines( options );
	var o = this;
	var c = o.config = $.extend( $.jqGridLines.defaults, options );
	var fn = o.fn = $.jqGridLines.fn;
	
	var p = $( "body" ).data( "jqGridLines" );
	if (p) return p;
	
	$( "body" ).data( "jqGridLines", o );
	 
	$.event.add( window, "load.jqGridLines", function(){ if ( c.auto ) o.draw(); });

	//
	$(document).bind( 'keydown.jqGridLines keyup.jqGridLines', 
		function(evt){
			
			var isKeyDown = ( evt.type == 'keydown' );
//console.log(evt.keyCode);

			//サブキー押し下げ状態
			if ( evt.keyCode == c.keybind.subKey ) c.keybind.subKeyAlt = isKeyDown;
			
			if ( isKeyDown && c.keybind.subKeyAlt ){
				if( evt.keyCode == c.keybind.toggleKey  )	 o.toggle();
				if( evt.keyCode == c.keybind.upKey )	o.nodeUp();
				if( evt.keyCode == c.keybind.downKey )	o.nodeDown();
			}
		});

	$( window ).resize( function () {
		 o.clear();
		 o.draw();
	});
	
	$.event.add( window, "close.jqGridLines", o.dispose );

	return this;
};

$.extend( $.jqGridLines.prototype,{
	drawLine : function(){
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;

		var canvas = o.canvas[0];
	    if( !canvas || !canvas.getContext) {
			return;
	    }

		var ctx = o.ctx = canvas.getContext('2d');
					
		ctx.strokeStyle = c.innerLine.color;
		ctx.lineWidth = c.innerLine.width;
		
		
		var span = c.innerLine.span;
		
		// 横線 
		for( var pointY = 1; pointY <= c.view.height; pointY += span.y) {
		    ctx.beginPath();

		    ctx.moveTo( 0, pointY );
		    ctx.lineTo( c.view.width, pointY );
		    ctx.closePath();
		    ctx.stroke();
		}
				
		//縦線 
		for(var pointX = 1; pointX <= c.view.width; pointX += span.x ) {
		    ctx.beginPath();

		    ctx.moveTo( pointX, 0 );
		    ctx.lineTo( pointX, c.view.height );
		    ctx.closePath();
		    ctx.stroke();

		}
		
		ctx.strokeStyle = c.outerLine.color;
		ctx.lineWidth = c.outerLine.width;
		
		ctx.beginPath();
		ctx.strokeRect(0, 0, c.view.width, c.view.height);
		ctx.closePath();
		ctx.stroke();
	},
	
	clearLine : function(){
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;
		o.ctx.clearRect(0, 0, o.canvas.get(0).width, o.canvas.get(0).height);
	},

	toggle : function(){
		$("#jqGridLines_canvas").length ? this.clear() : this.draw();
	},
	
	draw : function() {
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;
	
    	o.canvas = $( "<canvas></canvas>" );
		o.canvas.appendTo( $("body") );

		//o.canvas = document.getElementById( "cv" );
    	o.canvas.attr( "id", "jqGridLines_canvas" ).css( c.canvasCss );

		if ( c.target == null || c.target.length == 0 )	 c.target = $( document );

		var view = c.view = $.jqGridLines.fn.getPosition( c.target );
	
		//キャンバス領域
		o.canvas.get(0).height = view.height;
		o.canvas.get(0).width = view.width;
      	o.canvas.css({	"top" : view.top,
						"left" : view.left }).show().fadeTo( 1000, 0.8 );
		
  		this.drawLine();
	},
	
	clear : function(){
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;
	 	o.canvas.hide().remove();
	},
	
	dispose : function() {
		$('body').removeData("jqGridLines");
	},
	
	nodeUp : function () {
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;
		o.clear();
		c.target = o.fn.recursionPrev( c.target );
		o.draw();
	},
	nodeDown : function () {
		var o = $( "body" ).data( "jqGridLines" ), c = o.config;
		o.clear();
		c.target = o.fn.recursionNext( c.target );
		o.draw();
	}
});

$.jqGridLines.fn = {
		getPosition : function(jObj){
			var pos = {
				top : 0,
				bottom : 0,
				left : 0,
				right : 0,
				height : 0,
				width : 0			
			};

			var o = jObj.get(0);
			pos.top = o.offsetTop;
			pos.left = o.offsetLeft;
			
			pos.top = o.scrollTop > o.offsetTop ?
						o.scrollTop : o.offsetTop;
			pos.left = o.scrollLeft > o.offsetLeft ?
						o.scrollLeft : o.offsetLeft;
			
			//
			pos.height = o.scrollHeight > o.offsetHeight ?
							o.scrollHeight : o.offsetHeight;

			//
			pos.width = o.scrollWidth > o.offsetWidth ?
							o.scrollWidth : o.offsetWidth;

			pos.bottom = pos.top + pos.height;
			pos.right = pos.left + pos.width;

			return pos;
		},
		getNextDom : function () {
			
		},
		getPrevDom : function () {
			
		},
		
		lastDom : function( target ){
			
		},
		recursionPrev :	function ( target ){
			var o = $( "body" ).data( "jqGridLines" ), c = o.config;
			var exclude = c.exclude;

			if ( ! target.is( "body" ))	{
				//前要素検索
				var prev = target.prev();
				if( ! prev.get(0) )		return  target.parent(); 
				
				target = prev;
			}

			//最終子要素検索
			var newTarget = target;
			var nodes = newTarget.children().not( exclude );
			var count = nodes.size();

			while( count > 0 ){
				newTarget = $( nodes[count-1] );
				nodes = newTarget.children().not( exclude );
				count = nodes.size();
			}

			return newTarget;
		},
		
		recursionNext :	function ( target ){
			var o = $( "body" ).data( "jqGridLines" ), c = o.config;
			var exclude = c.exclude;

			if( ! target.is("table") ){
				
			//子要素検索
			var nodes = $( target ).children().not( exclude );
			var count = nodes.size();
			if ( count > 0 )	return( $( nodes[0] ) );

			//次要素検索
			var next = target.next();
			while ( next.get(0) ){
				if( ! next.is( exclude ) )		return next;
				next = next.next();
			}
			}
			
			//親要素チェック 
			var parent = target.parent();

			while( ! parent.is("body") ){
				//親要素 + 次要素 検索		
				var newTarget = parent.next();
				if ( newTarget.get(0) )		return newTarget;

				parent = parent.parent();
				
			}
			return $("body");
		}
};

$.jqGridLines.defaults = {
	auto: true,
	view : {
		top:-1,
		bottom:-1,
		left:-1,
		right :-1,
		height : -1,
		width : -1
	},
	
	innerLine : {
		span : { x : 100, y : 100 },
		color: "#F00",
		width: 0.5
	},
	
	outerLine :{
		color : "#000",
		width : 1.0
	},
	
	keybind : {
		subKey : 16,	// shift
		toggleKey : 32,	//space
		upKey : 38,		//up
		downKey : 40	//down
	},

	canvasCss : {
		//"background": "#fff",
		"z-index": 9999,
		"position" : "absolute",
		"margin" : 0,
		"padding" : 0,
		"border": 0,
		"outline": 0,
		"top": 0,
		"left": 0,
		"opacity": "0",
		"display": "none"
	},
	exclude : "script,br"
};

$.fn.jqGridLines = function( options ){

	var c = $.extend( {}, $.jqGridLines.defaults, options );
	c.target = $(this).first();
	
	$.jqGridLines( c );

	return this;
};
		
//end
})(jQuery)