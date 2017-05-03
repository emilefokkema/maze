(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getMazeStringifier = function(direction){
		var stringPicture = function(w,h){
			var rows = Array.apply(null, new Array(h)).map(function(){
				return Array.apply(null, new Array(w)).map(function(){return " ";}).join("");
			});
			var put = function(x,y,str){
				rows[y] = rows[y].substr(0,x) + str + rows[y].substr(x+1);
			};
			var toString = function(){
				return rows.join("\n");
			};
			return {
				put:function(x,y,str){
					put(x,y,str);
					return this;
				},
				toString:toString
			};
		};
		var intersectionCharacters = {
			"0123" : "\u253c",
			"012" : "\u2534",
			"013" : "\u2524",
			"01" : "\u2518",
			"023" : "\u251c",
			"02" : "\u2514",
			"03" : "\u2502",
			"0" : "\u2502",
			"123" :"\u252c",
			"12" : "\u2500",
			"13" :"\u2510",
			"1": "\u2500",
			"23" :"\u250c",
			"2": "\u2500",
			"3" :"\u2502"
		};
		var stringify = function(m){
			var pic = stringPicture(2*m.maxX + 1, 2*m.maxY + 1);
			var borderDirections = Array.apply(null, new Array(m.maxX + 1)).map(function(){
				return Array.apply(null, new Array(m.maxY + 1)).map(function(){return [];});
			});
			m.borderParts.map(function(p){
				var x = 2*p.x + 1,y = 2*p.y + 1,str = p.direction == direction.LEFT || p.direction == direction.RIGHT ? "\u2502" : "\u2500";
				if(p.direction == direction.LEFT){
					x -= 1;
					borderDirections[p.x][p.y + 1].push(direction.TOP);
					borderDirections[p.x][p.y].push(direction.BOTTOM);
				}else if(p.direction == direction.RIGHT){
					x += 1;
					borderDirections[p.x + 1][p.y + 1].push(direction.TOP);
					borderDirections[p.x + 1][p.y].push(direction.BOTTOM);
				}else if(p.direction == direction.TOP){
					y -= 1;
					borderDirections[p.x + 1][p.y].push(direction.LEFT);
					borderDirections[p.x][p.y].push(direction.RIGHT);
				}else if(p.direction == direction.BOTTOM){
					y += 1;
					borderDirections[p.x + 1][p.y + 1].push(direction.LEFT);
					borderDirections[p.x][p.y + 1].push(direction.RIGHT);
				}
				pic.put(x,y,str);
			});
			borderDirections.map(function(c, x){
				c.map(function(b,y){
					if(b.length > 0){
						pic.put(2*x, 2*y, intersectionCharacters[b.sort(function(a,b){return a-b;}).map(function(a){return a.toString();}).join('')]);
					}
				});
			});

			return pic.toString();
		};
		return {stringify:stringify};
	};
})();