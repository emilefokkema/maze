define(["position"],function(position){
	var shift = position(0,0);
	var w = window.innerWidth;
	var h = window.innerHeight;
	var boxSize, maxY, maxX, bottomPadding;
	var getInnerHeight = function(){return h - (bottomPadding || 0);};
	var setBoxSize = function(s){
		boxSize = w * s;
		maxY = Math.floor(getInnerHeight() / boxSize);
		maxX = Math.floor(w / boxSize);
	};
	var mazePositionToScreenPosition = function(p){
		if(p==null){
			console.log("oeps");
		}
		return position(boxSize * (p.x + 1/2), boxSize * (p.y + 1/2)).plus(shift);
	};

	var representsSmallDistance = function(dx, dy){
		return Math.abs(dx) + Math.abs(dy) < boxSize / 3;
	};
	var setBottomPadding = function(p){bottomPadding = p;};
	return {
		positionFromMazePosition:mazePositionToScreenPosition,
		representsSmallDistance:representsSmallDistance,
		getMaxX:function(){return maxX;},
		getMaxY:function(){return maxY;},
		setBoxSize:setBoxSize,
		getBoxSize:function(){return boxSize;},
		setShift:function(s){shift = s;},
		setBottomPadding:setBottomPadding,
		getInnerHeight:getInnerHeight
	};
});