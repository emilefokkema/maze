define(function(){
	var first = function(fSoFarDone, done){
		done = done || function(){};
		var res;
		var f = function(){
			fSoFarDone(res, done);
		};

		f.then = function(_fSoFarDone){
			return first(function(soFar, _done){
				fSoFarDone(soFar, function(r){
					_fSoFarDone(r, _done);
				});
			});
		};
		
		return f;
	};
	var makeFSoFarDone = function(fSoFarDoneUpdate, progress, stepIndex, nOfSteps, stopAllProgresses){
		return function(soFar, done){
			if(stepIndex == nOfSteps - 1){
				done = (function(_done){
					return function(x){
						stopAllProgresses();
						_done(x);
					};
				})(done);
			}
			fSoFarDoneUpdate(soFar, done, function(x){
				progress.update({
					partial:x,
					total:(stepIndex + x) / nOfSteps
				})
			});
		};
	};
	return function(){
		var all = [];

		var add = function(fSoFarDoneUpdate, progress){
			all.push({
				f:fSoFarDoneUpdate,
				progress:progress
			});
		};
		var execute = function(){
			if(all.length == 0){return;}
			var stopAllProgresses = function(){
				for(var i=0;i<all.length;i++){
					all[i].progress && all[i].progress.done();
				}
			};
			var s = first(makeFSoFarDone(all[0].f, all[0].progress, 0, all.length, stopAllProgresses));
			for(var i = 1;i<all.length;i++){
				s = s.then(makeFSoFarDone(all[i].f, all[i].progress, i, all.length, stopAllProgresses));
			}
			s();
		};
		return {
			add:function(){
				add.apply(null, arguments);
				return this;
			},
			execute:execute
		};
	};
});