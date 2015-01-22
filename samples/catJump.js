function WinMainController(win) {
	var controller = this;
	var ST_INIT = 0;
	var ST_RUNNING = 1;
	var ST_STOP = 2;

	this.init = function() {
		for(var i = 0; i < win.children.length; i++) {
			var iter = win.children[i];
			if(iter.name === "ui-bird") {
				var c = {frequency:3, random:i*100, offsetYFrom:-30, offsetYTo:30};
				iter.setHighlightConfig(c);

			}
			else if(iter.name === "ui-kite") {
				var c = {frequency:1, random:i*100, rotationFrom:0, rotationTo:2*Math.PI};
				iter.setHighlightConfig(c);        
			}
			else if(iter.name === "ui-cat") {
				iter.gotoAndPlay(0, 11, 10000);        
			}    
		}	

		this.replayButton = win.find("ui-replay");
		this.replayButton.setVisible(false);
		this.gameState = ST_INIT;
	}

	this.handleJump = function() {
		controller.gameState = ST_RUNNING;
		var cat = win.find("ui-cat", true);
		cat.gotoAndPlay(12, 14, 1, function() {
			cat.gotoAndPlay(15, 15, 1000);
			});

		var pointer = win.find("ui-pointer", true);
		var gauge = win.find("ui-guage", true);
		var angle = Math.abs(pointer.rotation) * 180/Math.PI;
		var percent = Math.abs(100 - angle)/100;
		cat.setV(15*percent+10, 5*percent+5);
	}

	this.handleOnCatMoved = function(cat) {
		win.setOffset(cat.x - 200, undefined);
		var v =  cat.body.GetLinearVelocity();
		if(v.x < 0.5 && controller.gameState == ST_RUNNING) {
			cat.body.SetAngle(0);
			cat.body.SetLinearVelocity({x:0, y:0});
			cat.body.SetActive(false);
			cat.gotoAndPlay(28, 39, 1, function() {
				cat.gotoAndPlay(16, 27, 1, function() {
					var replayButton = controller.replayButton;
					replayButton.x = win.xOffset + ((win.w - replayButton.w) >> 1);
					replayButton.y = (win.h - replayButton.h) >> 1;
					replayButton.setVisible(true);
				});
			});

			controller.gameState = ST_STOP;
		}

		var distance = Math.round(win.toMeter(cat.x)) + "m";
		var elDistance = cat.find("ui-distance");
		elDistance.setText(distance);
		elDistance.setVisible(controller.gameState != ST_INIT);
		win.find("ui-cat-shadow").x = cat.x;
	}

	this.init();

	return this;
}

function createWinMainController(win) {
	win.controller = new WinMainController(win);

	return win.controller;
}
