define(function(){
	var position = function(x,y){
		return {
			x:x,
			y:y,
			minus:function(p){
				return position(x - p.x, y - p.y);
			},
			plus:function(p){
				return position(x + p.x, y + p.y);
			},
			scale:function(r){
				return position(r*x, r*y);
			}
		};
	};
	return position;
});