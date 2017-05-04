define(function(){
	var progressMaker = function(setup, done){
		done = done || function(){};
		setup = setup();
		var stopped = false;
		return {
			update:function(x){
				if(!stopped){
					setup.update(x);
				}
			},
			done:function(){setup.teardown();stopped = true;done();}
		};
	};
	var body = document.body;
	return function(){
		var started = false, currentPercentage = 0, done = false;
		var bar = makeNode("<div id='1' class='progress-container'><div class='progress-text' id='3'></div><div class='progress-total'><div id='2' class='progress-part'></div></div></div>",function(tot,part,text){
			return {
				append:function(){
					body.appendChild(tot);
				},
				remove:function(){
					body.removeChild(tot);
				},
				setPercentage:function(x){
					part.style.width = Math.floor(100 * x) + "%";
				},
				setText:function(t){
					text.innerHTML = t;
				}
			};
		});
		var updateGlobal = function(x){
			if(!started){
				bar.append();
			}
			started = true;
			currentPercentage = x;
			bar.setPercentage(x);
		};
		var createProgressPart = function(text){
			var textSet = false;
			return progressMaker(function(){
				return {
					update:function(x){
						if(!textSet){
							bar.setText(text);
							textSet = true;
						}
						updateGlobal(x.total);
					},
					teardown:function(){
						if(!done && currentPercentage > 0.99){
							bar.remove();
							done = true;
						}
					}
				};
			});
		};
		return {createProgressPart:createProgressPart};
	};
});