(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getShowPopup = function(body, h){
		return function(html, confirm, reject){
			var div;
			disappear = function(){
				body.removeChild(div.node);
			};
			div = makeNode("<div id='2' class='popup popup-container' style='top:"+(2*h)+"px'><div>"+html+"</div><div id='1'></div></div>",function(buttonDiv, container){
				var ok, cancel;
				if(confirm){
					ok = makeNode("<input type='button' class='popup popup-button right' value='OK'/>");
					buttonDiv.appendChild(ok);
					ok.onclick = function(){
						disappear();
						confirm();
					};
				}
				if(reject){
					cancel = makeNode("<input type='button' class='popup popup-button left' value='Cancel'/>");
					buttonDiv.appendChild(cancel);
					cancel.onclick = function(){
						disappear();
						reject();
					};
				}
				return {
					node:container,
					focus:function(){
						ok.focus();
					},
					setTop:function(p){
						container.style.top = p;
					}
				};
			});
			body.appendChild(div.node);
			div.focus();
			setTimeout(function(){
				div.setTop((h/4)+"px");
			},1);
			
		};
	};
})();