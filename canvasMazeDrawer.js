(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getCanvasMazeDrawer = function(direction){
		var draw = function(m, ctx, boxSize, drawPaths){
			if(drawPaths){
				var baseHue = Math.floor(Math.random() * 40);
				m.paths.map(function(p, i){
					ctx.fillStyle = 'hsl('+(baseHue + p[0].depth * 3)+',60%,'+Math.floor(10 + 70 / (1 + p[0].depth / 2))+'%)';
					p.map(function(pp){
						ctx.fillRect(pp.x * boxSize, pp.y * boxSize, boxSize, boxSize);
					});
				});
			}
			m.borderParts.map(function(p){
				var x1, y1, x2, y2;
				if(p.direction == direction.TOP){
					x1 = p.x; x2 = p.x + p.length; y1 = y2 = p.y;
				}else if(p.direction == direction.BOTTOM){
					x1 = p.x + 1 - p.length; x2 = p.x + 1; y1 = y2 = p.y + 1;
				}else if(p.direction == direction.LEFT){
					y1 = p.y + 1; y2 = p.y + 1 - p.length; x1 = x2 = p.x;
				}else if(p.direction == direction.RIGHT){
					y1 = p.y; y2 = p.y + p.length; x1 = x2 = p.x + 1;
				}
				ctx.strokeStyle = '#000';
				ctx.beginPath();
				ctx.moveTo(x1 * boxSize, y1 * boxSize);
				ctx.lineTo(x2 * boxSize, y2 * boxSize);
				ctx.stroke();
			});
		};
		return {draw:draw};
	};
})();