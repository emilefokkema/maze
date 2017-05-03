define(["sender","direction"],function(sender, direction){
	var body = document.body;
	return function(left, top, size){
		var thickness = size/10, color = '#444';
		var onSteer = sender();
		var onRelease = sender();
		var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		svg.setAttribute('width', size);
		svg.setAttribute('height', size);
		svg.setAttribute('style', 'position:fixed;left:'+left+'px;top:'+top+'px;');
		var outerRing = (function(svg){
			var ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
			ring.setAttribute('cx',size/2);
			ring.setAttribute('cy',size/2);
			ring.setAttribute('r',size/2 - thickness/2);
			ring.setAttribute('stroke-width', thickness);
			ring.setAttribute('fill','transparent');
			ring.setAttribute('stroke', color);
			svg.appendChild(ring);
			return ring;
		})(svg);
		var stick = (function(){
			var ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
			ring.setAttribute('cx',size/2);
			ring.setAttribute('cy',size/2);
			ring.setAttribute('r',thickness);
			ring.setAttribute('fill',color);
			svg.appendChild(ring);
			var maxR = size/2 - thickness;
			var setPosition = function(x,y){
				var d = Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2));
				if(d > maxR){
					var r = maxR / d;
					x = size/2 + (x - size/2) * r;
					y = size/2 + (y - size/2) * r;
				}
				ring.setAttribute('cx',x);
				ring.setAttribute('cy',y);
				return d > size/8;
			};
			return {
				setPosition:setPosition
			};
		})(svg);
		var directionOf = function(x,y){
			var dx = x - size/2, dy = y - size/2;
			if(Math.abs(dx) >= Math.abs(dy)){
				if(dx >= 0){
					return direction.RIGHT;
				}
				return direction.LEFT;
			}
			if(dy >= 0){
				return direction.BOTTOM;
			}
			return direction.TOP;
		};
		body.addEventListener('touchmove',function(e){
			var t = e.changedTouches.item(0);
			var x = t.clientX - left, y = t.clientY - top;
			if(stick.setPosition(x, y)){
				onSteer(directionOf(x,y));
			}
		});
		body.addEventListener('touchend',function(){
			stick.setPosition(size/2, size/2);
			onRelease();
		});
		return {
			svg:svg,
			onSteer:function(f, add){
				if(add){
					onSteer.add(f);
				}else{
					onSteer.remove(f);
				}
			},
			onRelease:function(f, add){
				if(add){
					onRelease.add(f);
				}else{
					onRelease.remove(f);
				}
			}
		};
	};
});