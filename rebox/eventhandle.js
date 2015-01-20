/***
*/

function WinController(win) {
    var CLASSES_GOOD = [
        ["BoxYellowGood", "CircleYellowGood"]
    ];
    var CLASSES_EVIL = [
        ["BoxRedEvil",    "CircleRedEvil"],
        ["BoxRedEvil2",   "BoxRedEvil2"],
        ["BoxRedEvil3",   "CircleRedEvil3"]
    ];
    var LEVELS_EVIL_COUNT = [2,1,1,1,1,  1,2];
    
    var RESULT_NONE = 0;
    var RESULT_SUCCESS = 1;
    var RESULT_FAILED = 2;    
        
    var goodKickCount = 0;
    var evilKickCount = 0;
    var playResult = RESULT_NONE;
    var isStopClick = false; // 是否还能再点击: checking中，不能再点击，但物理引擎仍工作(球仍在滚动)

    var stopGame = function(){ //弹出结果提示框时调用：不能再点击，物理引擎也停止
        win.stop();
        isStopClick = true;
    };
    
    this.initGame = function(evilCount) {
        win.resetGame(); //恢复到初始状态

        isStopClick = false;
        playResult = RESULT_NONE;
        goodKickCount = 0;
        evilKickCount = 0;
    };

    var getCurrentLevelIndex = function () {
        var str = getNameTail(win.name);
        var i = Number(str.slice(1, str.length));
        console.log('getCurrentLevelIndex() = ' + i);
        return i - 1;
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

        playEffectSound('transform1.mp3');
        
        var anim = win.find('TransformEffect');
        setPositionCenterToRef(me, anim);
        anim.setVisible(true).play(null, 1, function(){
            anim.setVisible(false);
        });
    };
    
    this.doTransform = function(me) {
        if (isStopClick) return;

        console.log('doTransform()');
        playTransformAnimation(me);
        
        var destName = findTransformName(me.name);
        if (! destName || destName === me.name){            
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

        me.setVisible(false).setEnable(false);
        destObj.setPosition(me.x, me.y).setVisible(true).setEnable(true).setV(meV.x, meV.y);
    };

    var showResult = function(){
        stopGame();

        var checkAnim = win.find('Checking');
        
        if (checkAnim.isVisible()) { //checking中途good object掉落
            checkAnim.stop();
            checkAnim.setVisible(false);
        }

        if (playResult === RESULT_SUCCESS){
            playEffectSound("win_sound.mp3");
            win.find('ResultSuccess').setVisible(true).animate("bottom-in");
        } else {
            playEffectSound("fail_sound.mp3");
            win.find('ResultFailed').setVisible(true).animate("top-in");
        }
    };

    var setLevelPassed = function() {        
        localStorage.setItem(win.name, true);
    };
    
    var checkResult = function() {
        console.log('checkResult()');
        
        if (goodKickCount >= 1){
            playResult = RESULT_FAILED;
            showResult();
            return;
        }
        
        var levelIndex = getCurrentLevelIndex();
        if (evilKickCount < LEVELS_EVIL_COUNT[levelIndex]) 
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
                setLevelPassed();
            }
            showResult();
        });
        isStopClick = true;
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

    var playEffectSound = function(name){
        var sndEffect = win.find('SoundEffect');
        if (sndEffect.getValue()){
            sndEffect.playSoundEffect(name);
        }
    };

    this.onBeginContact = function(me, him) {
        if (findTransformClass(name2class(me.name), CLASSES_EVIL)){
            playEffectSound("werebox_hit.mp3");
        }
    };
    
    this.onRestart = function() {
        win.controller.initGame();
    };

    this.onNextLevel = function() {
        var nextLevelName = 'level-' + (getCurrentLevelIndex() + 1 + 1);
        win.openWindow(nextLevelName, null, true);
    };
}

function CreateWinController(win) {
    win.controller = new WinController(win);
    win.controller.initGame();
    return win.controller;
}
