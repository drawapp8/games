/***
todo:
1.success/failed 过场动画
2.add sound: 1) bkg 2)transform effect
*/


function WinController(win) {
    var CLASSES_GOOD = [
        ["BoxYellowGood", "CircleYellowGood"]
    ];
    var CLASSES_EVIL = [
        ["BoxRedEvil", "CircleRedEvil"]
    ];
    
    var RESULT_NONE = 0;
    var RESULT_SUCCESS = 1;
    var RESULT_FAILED = 2;
    var EVIL_NR = 2;
    
    var goodKickCount = 0;
    var evilKickCount = 0;
    var playResult = RESULT_NONE;
    
    this.initGame = function() {
        playResult = RESULT_NONE;
        goodKickCount = 0;
        evilKickCount = 0;
    };
        
    var name2class = function(name){
        for (var i = name.length - 1; i >= 0; i--){
            if (name.charAt(i) === '-')
                return name.slice(0, i);
        }
        alert("name2Class() failed!");
    };

    var getNameTail = function(name){    
        for (var i = name.length - 1; i >= 0; i--){
            if (name.charAt(i) === '-'){
                return name.slice(i);
            }
        }
        alert("getNameTail() failed!");
    };

    var findTransformClass = function(cls, classPairs) {
        for (var i in classPairs){
            if (classPairs[i][0] === cls){                         
                return classPairs[i][1];
            } else if (classPairs[i][1] === cls){
                return classPairs[i][0];
            }
        }
    };

    var findTransformName = function(name) {
        var cls = name2class(name);
        var destClass = findTransformClass(cls, CLASSES_GOOD);
        if (destClass)
            return destClass + getNameTail(name);
            
        destClass = findTransformClass(cls, CLASSES_EVIL);
        if (destClass)
            return destClass + getNameTail(name);
    };
    
    var setPositionCenterToRef = function(objRef, objMove) {
        console.log("setPositionCenterToRef()");
        var x = objRef.x + (objRef.getWidth() - objMove.getWidth()) / 2;
        var y = objRef.y + (objRef.getHeight() - objMove.getHeight()) / 2;
        return objMove.setPosition(x, y);
    };

    var setPositionWinCenter = function(obj) {
        console.log("setPositionWinCenter()");
        var x = (win.getWidth() - obj.getWidth()) / 2;
        var y = (win.getHeight() - obj.getHeight()) / 2;
        return obj.setPosition(x, y);
    };

    var playTransformAnimation = function(me) {
        console.log('playTransformAnimation()');
        
        var anim = win.find('TransformEffect');
        setPositionCenterToRef(me, anim);
        anim.setVisible(true).play(null, 1, function(){
            anim.setVisible(false);
        });
    };
    
    this.doTransform = function(me) {
        console.log('doTransform()');
        playTransformAnimation(me);
        
        var destName = findTransformName(me.name);
        if (! destName){
            console.log("find transform dest name failed!");
            return;
        }
        console.log('destName = ' + destName);

        var destObj = win.find(destName);
        var meV = me.body.GetLinearVelocity();
        var destV = destObj.body.GetLinearVelocity();
        
        console.log('JustBeforeTransform');
        console.log('me.pos=[' + me.x + ',' + me.y + ']'
            + ' me.speed=[' + meV.x + ',' + meV.y + ']');
        console.log('dest.pos=[' + destObj.x + ',' + destObj.y + ']'
            + ' dest.speed=[' + destV.x + ',' + destV.y + ']');

        destObj.setPosition(me.x, me.y);        
        me.setVisible(false);
        me.body.SetActive(false);
        destObj.setVisible(true);
        destObj.body.SetActive(true);
        destObj.setV(meV.x, meV.y);
    };
    
    var showResult = function(){
        var checkAnim = win.find('Checking');
        
        if (checkAnim.isVisible()) { //checking中途good object掉落
            checkAnim.stop();
            checkAnim.setVisible(false);
        }
                
        if (playResult === RESULT_SUCCESS){
            win.find('ResultSuccess').setVisible(true).animate("bottom-in");
        } else {
            win.find('ResultFailed').setVisible(true).animate("top-in");
        }
    };
    
    var checkResult = function() {
        console.log('checkResult()');
        
        if (goodKickCount >= 1){
            playResult = RESULT_FAILED;
            showResult();
            return;
        }
        
        if (evilKickCount < EVIL_NR) 
            return;
            
        var anim = win.find('Checking');
        setPositionWinCenter(anim);
        anim.setVisible(true).play(null, 1, function(){
            console.log('check anim play');
            anim.stop();
            anim.setVisible(false);
            
            if (goodKickCount >= 1){
                playResult = RESULT_FAILED;
            } else {
                playResult = RESULT_SUCCESS;
            }
            showResult();
        });
    };
    
    this.onMoved = function(me) {
        var someoneKicked = false;
        
        if (me.y >= win.h){
            me.body.SetActive(false);
            
            if (findTransformClass(name2class(me.name), CLASSES_GOOD)){
                goodKickCount++;
                someoneKicked = true;
            } else if (findTransformClass(name2class(me.name), CLASSES_EVIL)){
                evilKickCount++;
                someoneKicked = true;                
            }
        }
        
        if (someoneKicked)
            checkResult();
    };
    
    this.onRestart = function() {
        win.resetGame();
        win.controller.initGame();
    };
}

function CreateWinController(win) {
    win.controller = new WinController(win);
    win.controller.initGame();
    return win.controller;
}
