define(["space","copyset"],function(space, copySet){
	var all = [], copies = copySet([], function(o){
		var c = {
			setPosition:o.setPosition
		};
		return c;
	});
	var areClose = function(p1,p2){
		return space.representsSmallDistance(p1.x - p2.x, p1.y - p2.y);
	};
	var check = function(){
		for(var i=0;i<all.length;i++){
			for(var j = i+1;j<all.length;j++){
				if(areClose(all[i].getPosition(), all[j].getPosition())){
					all[i].onMeeting(copies.copyOf(all[j]));
					all[j].onMeeting(copies.copyOf(all[i]));
				}else{
					all[i].onCeasingToMeet(copies.copyOf(all[j]));
					all[j].onCeasingToMeet(copies.copyOf(all[i]));
				}
			}
		}
	};
	var makeNew = function(_setPosition, _onMeeting){
		_onMeeting = _onMeeting || function(){};
		var alreadyMeeting = [];
		var onMeeting = function(other){
			if(alreadyMeeting.indexOf(other) == -1){
				_onMeeting(other);
				alreadyMeeting.push(other);
			}
		};
		var onCeasingToMeet = function(other){
			var index;
			if((index = alreadyMeeting.indexOf(other)) != -1){
				alreadyMeeting.splice(index,1);
			}
		};
		var currentPosition;
		var setPosition = function(p){
			currentPosition = p;
			_setPosition(p);
			check();
		};
		return {
			setPosition:setPosition,
			getPosition:function(){return currentPosition;},
			onMeeting:onMeeting,
			onCeasingToMeet:onCeasingToMeet
		};
	};
	return function(_setPosition, onMeeting){
		var n = makeNew(_setPosition, onMeeting);
		all.push(n);
		var c = copies.addFor(n);
		c.remove = function(){
			copies.removeFor(n);
			all.splice(all.indexOf(n),1);
		};
		return c;
	};
});