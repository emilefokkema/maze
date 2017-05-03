requirejs([
	"levelProvider",
	"progressBar",
	"mazeMaker",
	"space",
	"svgMazeDrawer",
	"positionableThing",
	"thingWalker",
	"joystick",
	"showPopup",
	"actionsequence"],
	function(levelProvider, progressBar, mazeMaker, space, svgMazeDrawer,positionableThing,thingWalker,makeJoystick,showPopup,actionSequence){
		var h = window.innerHeight;
		var w = window.innerWidth;
		Array.prototype.first = function(test){
			var res, found = false;
			for(var i=0;i<this.length;i++){
				if(test(res = this[i])){
					found = true;
					break;
				}
			}
			if(found){
				return res;
			}
			return null;
		};
		
		var joystick;
		

		
		var weAreOnMobile = function(){
			return h > w;
		};

		if(weAreOnMobile()){
			var joystickSize = 350;
			space.setBottomPadding(joystickSize);
			joystick = makeJoystick((w - joystickSize)/2,space.getInnerHeight(),joystickSize);
			document.body.appendChild(joystick.svg);
		}

		var playLevelWithModel = function(svg, l, model, onSucceed, onFail, joystick){
			var succeed, fail, succeeded = false, failed = false;
			var circleThing = function(color, onMeeting){
				var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle.setAttribute('r',space.getBoxSize() * 0.25);
				circle.setAttribute('fill',color);
				var setPosition = function(p){
					circle.setAttribute('cx',p.x);
					circle.setAttribute('cy',p.y);
				};
				svg.appendChild(circle);
				return positionableThing(setPosition, onMeeting);
			};
			var initialYellowPosition = {x:0,y:0};
			var yellowCircle = circleThing('#ff0');
			yellowCircle.setPosition(space.positionFromMazePosition(initialYellowPosition));

			var redCircle = circleThing('#f00',function(c){
				if(c == yellowCircle){
					console.log("succeed level "+l.number);
					succeed();
				}
			});
			var initialRedPosition = model.positions.first(function(p){return p.x == model.maxX - 2 && p.y == model.maxY - 1;});
			redCircle.setPosition(space.positionFromMazePosition(initialRedPosition));

			var initialGreenPosition = model.positions.first(function(p){return p.x == model.maxX - 1 && p.y == model.maxY - 1;});
			var greenCircle = circleThing('#0f0', function(c){
				if(c == yellowCircle){
					console.log("fail level "+l.number);
					fail();
				}
			});
			greenCircle.setPosition(space.positionFromMazePosition(initialGreenPosition));
			var walkers = [
				thingWalker.controllableThingWalker(model, redCircle.setPosition, initialRedPosition, 2, 10, joystick),
				thingWalker.autonomousThingWalker(model, greenCircle.setPosition,initialGreenPosition, 2,l.greenSpeed)
				];

			var teardown = function(){
				walkers.map(function(w){
					w.stop();
				});
				redCircle.remove();
				greenCircle.remove();
				yellowCircle.remove();
				try{
					console.log("removing svg");
					document.body.removeChild(svg);
				}catch(e){
					console.log("svg had already been removed");
				}
				
			};

			succeed = function(){
				if(!failed){
					teardown();
					onSucceed();
					succeeded = true;
				}
			};

			fail = function(){
				if(!succeeded){
					teardown();
					onFail();
					failed=true;
				}
			};
			
			document.body.appendChild(svg);
			
			var start = function(){
				walkers.map(function(w){
					w.start();
				});
			};
			
			if(l.message){
				showPopup(l.message, start);
			}else{
				start();
			}
		};

		var playLevel = function(l, onSucceed, onFail, joystick){
			console.log("beginning to play level "+l.number);
			space.setBoxSize(l.boxSize);
			var createProgress = progressBar().createProgressPart;
			var seq = actionSequence();
			mazeMaker.make(seq, space.getMaxX(), space.getMaxY(), createProgress);
			svgMazeDrawer.draw(seq, createProgress, space.getBoxSize(), false, w, space.getInnerHeight());
			seq.add(function(soFar, done, update){
				playLevelWithModel(soFar.svg, l, soFar.model, onSucceed, onFail, joystick);
				update(1);
				done();
			},createProgress(""));
			seq.execute();
		};

		var playAgain = function(){
			var l = levelProvider.getNext();
			playLevel(l,function(){
				showPopup("You win level "+l.number+"! Go again?",function(){
					playAgain();
				},function(){});
			},function(){
				showPopup("You lose! Go again?",function(){
					levelProvider.reset();
					playAgain();
				},function(){});
			}, joystick);
		};

		playAgain();
	});