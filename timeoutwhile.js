define(function(){
	return function(cond, toDo, batchSize, done, update){
		var step = function(){
			setTimeout(function(){
				var count = 0;
				if(cond()){
					do{
						toDo(update);
						count++;
					}while(cond() && count < batchSize);
					step();
				}else{
					done();
				}
			}, 1);
		};
		step();
	};
});