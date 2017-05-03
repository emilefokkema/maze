(function(){
	var timeoutWhile;
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
	var chooseRandom = function(arr, p){
		if(!p){
			return arr[Math.floor(Math.random() * arr.length)];
		}
		arr = arr.map(function(v){return {
			v:v,
			p:p(v)
		};});
		var currentI = 0, currentP = arr[0].p, total = arr.map(function(a){return a.p;}).reduce(function(a,b){return a+b;}), thres = Math.random() * total;
		while(currentP < thres){
			currentP += arr[++currentI].p;
		}
		return arr[currentI].v;
	};

	var direction = {TOP:0,LEFT:1,RIGHT:2,BOTTOM:3};

	var getPositionsWithNeighbors = function(maxX, maxY, update, done){
		var position = function(x,y){
			return {
				x:x,
				y:y,
				neighbors: [],
				freeDirections: [],
				neighborInDirection: function(d){
					if(d == direction.RIGHT){
						return this.neighbors.first(function(n){return n.x == x + 1;});
					}else if(d == direction.BOTTOM){
						return this.neighbors.first(function(n){return n.y == y + 1;});
					}else if(d == direction.LEFT){
						return this.neighbors.first(function(n){return n.x == x - 1;});
					}else if(d == direction.TOP){
						return this.neighbors.first(function(n){return n.y == y - 1;});
					}
				},
				distanceFrom: function(p){
					return Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
				}
			};
		};
		var positionArray = Array.apply(null, new Array(maxX)).map(function(){
			return Array.apply(null, new Array(maxY));
		});
		var currentPosition, size = maxX * maxY, result = [];
		var connectPositions = function(p1, p2){
			p1.neighbors.push(p2);
			p2.neighbors.push(p1);
		};
		var goToPosition = function(p){
			if(currentPosition){
				connectPositions(currentPosition, p);
			}
			result.push(p);
			positionArray[p.x][p.y] = p;
			currentPosition = p;
		};
		var moveInDirection = function(d){
			var newPosition;
			if(d == direction.LEFT){
				newPosition = position(currentPosition.x - 1, currentPosition.y);
				if(currentPosition.y > 0){
					connectPositions(newPosition, positionArray[newPosition.x][newPosition.y - 1]);
				}

			}else if(d == direction.RIGHT){
				newPosition = position(currentPosition.x + 1, currentPosition.y);
				if(currentPosition.y > 0){
					connectPositions(newPosition, positionArray[newPosition.x][newPosition.y - 1]);
				}
			}else if(d == direction.BOTTOM){
				newPosition = position(currentPosition.x, currentPosition.y + 1);
				
			}
			goToPosition(newPosition);
		};
		goToPosition(position(0,0));
		timeoutWhile(function(){return result.length < size}, function(update){
			if(currentPosition.y % 2 == 0){
				if(currentPosition.x == maxX - 1){
					moveInDirection(direction.BOTTOM);
				}else{
					moveInDirection(direction.RIGHT);
				}
			}else{
				if(currentPosition.x == 0){
					moveInDirection(direction.BOTTOM);
				}else{
					moveInDirection(direction.LEFT);
				}
			}
			update(result.length / size);
		}, 30, function(){
			done(result);
		}, update)
	};

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

	first(function(soFar, done){
		done(6);
	}).then(function(r, done){
		done(r + 1);
	})
	.then(function(r, done){
		done(2*r);
	})
	.then(function(r, done){
		console.log(r);
	})();


	window.getMazeMaker = function(_timeoutWhile){
		timeoutWhile = _timeoutWhile;
		var makeMaze = function(actionSequence, maxX, maxY, createProgress){
			var paths, x, y, allBorderParts = [],positions;
			var getModel = function(){
				return {
					maxX:maxX,
					maxY:maxY,
					borderParts:allBorderParts.slice(),
					paths:paths.slice(),
					positions:positions.slice()
				};
			};
			var borderPart = function(x,y,direction,length){
				length = length || 1;
				return {
					x:x,
					y:y,
					direction:direction,
					length: length
				};
			};
			var isExtensionOf = function(borderPart1, borderPart2){
				if(borderPart1.x != borderPart2.x && borderPart1.y != borderPart2.y){
					return false;
				}
				if(borderPart1.x == borderPart2.x){
					return (borderPart1.direction == direction.RIGHT && borderPart2.direction == direction.RIGHT && borderPart2.y == borderPart1.y + borderPart1.length) ||
							(borderPart1.direction == direction.LEFT && borderPart2.direction == direction.LEFT && borderPart2.y == borderPart1.y - borderPart1.length);
				}
				if(borderPart1.y == borderPart2.y){
					return (borderPart1.direction == direction.TOP && borderPart2.direction == direction.TOP && borderPart2.x == borderPart1.x + borderPart1.length) ||
							(borderPart1.direction == direction.BOTTOM && borderPart2.direction == direction.BOTTOM && borderPart2.x == borderPart1.x - borderPart1.length);
				}
			};
			var removeBorderPart = function(test){
				var partToRemove = allBorderParts.first(test);
				if(partToRemove){
					allBorderParts.splice(allBorderParts.indexOf(partToRemove),1);
				}
			};

			var mergeBorderParts = (function(){
				var findMemberForGroup = function(current, candidates, eq){
					var result;
					for(var i=0;i<candidates.length;i++){
						if(
							current.indexOf(candidates[i]) == -1 && 
							(
								current.some(function(c){return eq(c,candidates[i]);}) ||
								current.length == 0
							)
						){
							return candidates[i];
						}
					}
				};
				var mergeGroup = function(g){
					var first = g.first(function(p){return !g.some(function(pp){return p!=pp && isExtensionOf(pp,p);});});
					first.length = g.map(function(p){return p.length;}).reduce(function(a,b){return a+b;});
					g.filter(function(p){return p!=first;}).map(function(p){
						allBorderParts.splice(allBorderParts.indexOf(p),1);
					});
				};
				return function(update, done){
					var left = allBorderParts.slice();
					var leftLengthInitial = left.length;
					var match, currentGroup = [];
					var eq = function(p1,p2){return isExtensionOf(p1,p2) || isExtensionOf(p2,p1);};
					timeoutWhile(function(){return left.length > 0;},function(update){
						match = findMemberForGroup(currentGroup, left, eq);
						if(match){
							left.splice(left.indexOf(match),1);
							currentGroup.push(match);
						}else{
							if(currentGroup.length > 1){
								mergeGroup(currentGroup);
							}
							currentGroup = [];
						}
						update(1 - left.length / leftLengthInitial);
					},30,function(){
						if(currentGroup.length > 1){
							mergeGroup(currentGroup);
						}
						done();
					},update);
				};
			})();

			for(x = 0; x < maxX; x++){
				allBorderParts.push(borderPart(x,0,direction.TOP));
				for(y = 0; y < maxY; y++){
					allBorderParts.push(borderPart(x,y,direction.BOTTOM));
					allBorderParts.push(borderPart(x,y,direction.RIGHT));
				}
			}
			for(y = 0; y < maxY; y++){
				allBorderParts.push(borderPart(0,y,direction.LEFT));
			}
			var connectPositions = function(p1, p2){
				var x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
				if(x1 == x2 && Math.abs(y1 - y2) == 1){
					if(y1 > y2){
						removeBorderPart(function(p){return p.x == x1 && (p.y == y2 && p.direction == direction.BOTTOM || p.y == y1 && p.direction == direction.TOP);});
						p2.freeDirections.push(direction.BOTTOM);
						p1.freeDirections.push(direction.TOP);
					}else{
						removeBorderPart(function(p){return p.x == x1 && (p.y == y1 && p.direction == direction.BOTTOM || p.y == y2 && p.direction == direction.TOP);});
						p2.freeDirections.push(direction.TOP);
						p1.freeDirections.push(direction.BOTTOM);
					}
				}else if(y1 == y2 && Math.abs(x1 - x2) == 1){
					if(x1 > x2){
						removeBorderPart(function(p){return p.y == y1 && (p.x == x2 && p.direction == direction.RIGHT || p.x == x1 && p.direction == direction.LEFT);});
						p2.freeDirections.push(direction.RIGHT);
						p1.freeDirections.push(direction.LEFT);
					}else{
						removeBorderPart(function(p){return p.y == y1 && (p.x == x1 && p.direction == direction.RIGHT || p.x == x2 && p.direction == direction.LEFT);});
						p2.freeDirections.push(direction.LEFT);
						p1.freeDirections.push(direction.RIGHT);
					}
				}
			};
			var pathMaker = (function(){

				var make = function(update, done){
					var reachedEnd, nextPosition, currentPosition, visited = [], unvisitedNeighbors, unvisitedPositions = positions.slice(), currentPath = [], paths = [], currentDepth = 0;
					var visitPosition = function(p){
						unvisitedPositions.splice(unvisitedPositions.indexOf(p), 1);
						visited.push(p);
						currentPath.push(p);
						p.depth = currentDepth;
						p.visited = true;
					};
					var getUnvisitedNeighborsOf = function(p){
						return p.neighbors.filter(function(pp){return !pp.visited;})
					};
					var newPath = function(){
						paths.push(currentPath);
						currentPath = [];
					};
					currentPosition = chooseRandom(positions);
					visitPosition(currentPosition);
					var size = positions.length;
					timeoutWhile(function(){return unvisitedPositions.length > 0},function(update){
						reachedEnd = false;
						while((unvisitedNeighbors = getUnvisitedNeighborsOf(currentPosition)).length == 0){
							reachedEnd = true;
							visited.pop();
							currentPosition = visited[visited.length - 1];
						}
						if(reachedEnd){
							currentDepth = currentPosition.depth + 1;
							newPath();
						}
						nextPosition = chooseRandom(unvisitedNeighbors, function(p){
							var desiredDirection = visited.length >= 2 ? {x: currentPosition.x - visited[visited.length - 2].x, y: currentPosition.y - visited[visited.length - 2].y} : {x:0,y:0};
							return Math.pow(3 + currentPath.length / 10, (p.x - currentPosition.x) * desiredDirection.x + (p.y - currentPosition.y) * desiredDirection.y);
						});
						visitPosition(nextPosition);
						connectPositions(currentPosition, nextPosition);
						currentPosition = nextPosition;
						update(1 - unvisitedPositions.length / size);
					}, 30, function(){
						newPath();
						done(paths);
					}, update);
				};

				
				return {
					make:make
				};

			})();

			actionSequence
			.add(function(soFar, done, update){
				getPositionsWithNeighbors(maxX, maxY, update, done);
			}, createProgress("initializing"))
			.add(function(soFar, done, update){
				positions = soFar;
				pathMaker.make(update, done);
			}, createProgress("making paths"))
			.add(function(soFar, done, update){
				paths = soFar;
				mergeBorderParts(update, done);
			}, createProgress("merging borders"))
			.add(function(soFar, done, update){
				update(1);
				done(getModel());
			}, createProgress(""));
		};
		return {
			make:makeMaze,
			direction:direction
		};
	};


	
})()