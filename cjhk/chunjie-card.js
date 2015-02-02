function EditorWinController(win) {
    //  -- const data --
    var STEP_SELECT_THEME = 0;
    var STEP_SELECT_MAN = 1;
    var STEP_PREVIEW = 2;
    //shucai
    var MUSIC_LIST = ["01.mp3", "03.mp3", "04.mp3"];
    var MAN_LIST = ['man-old', 'man-kid', 'man-girl'];
    
    var editor = {
        step: STEP_SELECT_THEME,
        musicId: 0,
        manId: 0,
        bkgId: 0,
        greeting: {
            text: "",
            voiceLocalId: "",
            voiceServerId: ""
        },        
        photo: {
            localId: "",
            serverId: ""            
        }
    };

    var setSoftkey = function(step) {
        var sk1 = win.find('btn-sk1', true);
        var sk1Icon = sk1.find('ui-image');
        var iconRand = sk1Icon.getImageSrc('option_image_0');
        var iconBack = sk1Icon.getImageSrc('option_image_1');

        var sk2 = win.find('btn-sk2', true);
        var sk2Icon = sk2.find('ui-image');
        var iconGo = sk2Icon.getImageSrc('option_image_0');
        var iconShare = sk2Icon.getImageSrc('option_image_1');

        if (step === STEP_SELECT_THEME){
            sk1Icon.setImageSrc(iconRand);
        } else {
            sk1Icon.setImageSrc(iconBack);
        }
        if (step === STEP_PREVIEW){
            sk2Icon.setImageSrc(iconShare);
        } else {
            sk2Icon.setImageSrc(iconGo);
        }

        if (step === STEP_SELECT_THEME){
            sk1.setText('随机生成');            
            sk2.setText('更换形象');
        } else if (step === STEP_SELECT_MAN) {
            sk1.setText('更换主题');            
            sk2.setText('预览贺卡');
        } else if (step === STEP_PREVIEW) {
            sk1.setText('返回修改');            
            sk2.setText('发送贺卡');
        } else {
            alert('error step');
        }
        
        win.find('ui-page-indicator-number', true).setValue(step); //?
    };

    var setEditor = function(step) {
        var musicSelector = win.find('group-music-selector');
        var manSelector = win.find('group-man-selector');
        var bkgSlide = win.find('ui-image-slide-view');
        var tipBkgSlide = win.find('tip-bkg-slide');
        
        musicSelector.setVisible(false);
        manSelector.setVisible(false);
        bkgSlide.setVisible(true);
        tipBkgSlide.setVisible(true);
        
        if (step === STEP_SELECT_THEME){
            musicSelector.setVisible(true);
        } else if (step === STEP_SELECT_MAN) {
            manSelector.setVisible(true);
            manSelector.setPosition(manSelector.x, musicSelector.y);
        } else if (step === STEP_PREVIEW) {
            bkgSlide.setVisible(false);
            tipBkgSlide.setVisible(false);
            //todo: get slide show current image url and set to win as bkg
        } else {
            alert('error step');
        }
    };

    var showContent = function() {
        win.find('ui-image-slide-view').setValue(editor.bkgId);
        win.find('ui-sound-music').play(MUSIC_LIST[editor.musicId]);        

        var i = 0;
        for (i = 0; i < MAN_LIST; i++) {
            win.find(MAN_LIST[i]).setVisible(i === editor.manId);
        }
    };

    var randomNewCard = function(step) {
        editor.manId = 0;
        editor.musicId = 0;
        editor.bkgId = 0;
        //todo: rand init, restart music play
    };

    var sendCard = function() {
    };
    
    this.initWin = function() {
        setSoftkey(editor.step);
        setEditor(editor.step);
    };

    this.onSkLeft = function() {
        if (editor.step === STEP_SELECT_THEME){
            randomNewCard();
        } else {
            editor.step -= 1;
            setSoftkey(editor.step);
            setEditor(editor.step);
        }
    };

    this.onSkRight = function() {
        if (editor.step === STEP_PREVIEW){
            sendCard();
        } else {
            editor.step += 1;
            setSoftkey(editor.step);
            setEditor(editor.step);
        }
    };

    this.openGreetingEditorWin = function() {
        var initData = editor.greeting;
        this.openWindow("greeting-editor", 
            function (retData) {
                console.log("window closed.");
            }, false, initData);
    };
}

function CreateEditorWinController(win) {
    win.controller = new EditorWinController(win);
    win.controller.initWin();
    return win.controller;
}

CreateEditorWinController(this, initData);