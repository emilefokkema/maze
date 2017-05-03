define(["position", "space"],function(screenPosition, space){
	var easer = makeModule(function(setPosition, easiness, maxSpeed, _getNextGoal){
		var capAbs = function(x, cap){
			var abs = Math.min(Math.abs(x), cap);
			if(x < 0){
				return -abs;
			}
			return abs;
		};
		var goal, dx, dy, currentX = 0, currentY = 0, getNextGoal = _getNextGoal, interval;
		var update = function(){
			dx = goal.x - currentX;
			dy = goal.y - currentY;
			currentX += capAbs(dx / easiness, maxSpeed)
			currentY += capAbs(dy / easiness, maxSpeed)
			setPosition(screenPosition(currentX, currentY));
			if(space.representsSmallDistance(dx,dy)){
				goal = getNextGoal();
			}
		};
		var start = function(){
			goal = getNextGoal();
			currentX = goal.x;
			currentY = goal.y;
			interval = setInterval(update, 20);
		};
		var stop = function(){
			console.log("stopping easer");
			clearInterval(interval);
		};
		this.expose({
			start:start,
			stop:stop
		});
		this.extend('bufferEaser',function(){
			var goalBuffer = (function(){
				var q = [];
				var addGoal = function(){
					var newGoal = _getNextGoal();
					if(q.length < 2){
						q.push(newGoal);
					}else{
						var lastDirection = q[q.length - 1].minus(q[q.length - 2]);
						var newDirection = newGoal.minus(q[q.length - 1]);
						if(lastDirection.x * newDirection.x + lastDirection.y * newDirection.y > 0){
							q[q.length - 1] = newGoal;
						}else{
							q.push(newGoal);
						}
					}
				};
				var getNext = function(){
					while(q.length < 10){
						addGoal();
					}
					var n = q[0];
					q.splice(0,1);
					return n;
				};
				return {
					getNext:getNext
				};
			})();
			getNextGoal = goalBuffer.getNext;
		});
		
	});
	return easer;
});