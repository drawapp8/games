/*
https://rawgit.com/os-games-html5/games/master/cjhk/chunjie-card.js

bug:
1.手势动画区域无法滑动选择背景图
2.预览
  1)动画手势要hide
  2)slide要disable
*/

function EditorWinController(win) {
    //  -- const data --
    var STEP_SELECT_THEME = 0;
    var STEP_SELECT_MAN = 1;
    var STEP_PREVIEW = 2;

    var MODE_EDITOR = 0;
    var MODE_VIEW = 1;

    //shucai
    var MUSIC_LIST = ["01.mp3", "03.mp3", "04.mp3"];
    var MAN_LIST = ['man-old', 'man-kid', 'man-girl', 'man-mama'];
    
    var mode = MODE_EDITOR;
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

    var soundMusic = win.find('ui-sound-music');

    var setSoftkey = function(step) {
        console.log('setSoftkey()');
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
        
        win.find('ui-page-indicator-number', true).setValue(step); //todo:?
    };

    var setEditor = function(step) {
        console.log('setEditor()');
        var musicSelector = win.find('group-music-selector');
        var manSelector = win.find('group-man-selector');
        var bkgSelector = win.find('ui-image-slide-view');
        var handAnim = win.find('hand-anim');
        var tipWinTitle = win.find('tip-win-title');
        var voiceButton = win.find('group-greeting').find('voice');
        var y = musicSelector.y;

        musicSelector.setVisible(false);
        manSelector.setVisible(false);
        bkgSelector.setEnable(false);
        handAnim.setVisible(false);
        tipWinTitle.setVisible(true);
        voiceButton.setVisible(false);

        if (step === STEP_SELECT_THEME){
            musicSelector.setVisible(true);
            bkgSelector.setEnable(true);
            handAnim.setVisible(true);
        } else if (step === STEP_SELECT_MAN) {
            manSelector.setVisible(true);
            manSelector.setPosition(manSelector.x, y);
        } else if (step === STEP_PREVIEW) {
            tipWinTitle.setVisible(false);            
        } else {
            alert('error step');
        }
    };

    var showContentForEditor = function() {
        console.log('showContentForEditor()');

        var group = win.find('group-greeting');    
        if (editor.greeting.text)
            group.find('text').setText(editor.greeting.text);
        else
            group.find('text').setText('点击输入祝福语');

        //restore music play
        if (soundMusic.getValue() && ! win.getWindowManager().isSoundMusicPlaying()) {
                soundMusic.play(MUSIC_LIST[editor.musicId]);
        }
        //win.find('ui-image-slide-view').setValue(editor.bkgId); //todo ?

        var i = 0;
        for (i = 0; i < MAN_LIST.length; i++) {
            win.find(MAN_LIST[i]).setVisible(i === editor.manId);
        }
    };

    var showContentForPreview = function() {
        console.log('showContentForPreview()');

        //show greeting
        var group = win.find('group-greeting');
        if (! editor.greeting.text && ! editor.greeting.voiceServerId) {
            group.setVisible(false);
        }
        group.find('text').setText(editor.greeting.text);
        group.find('voice').setVisible(editor.greeting.voiceServerId);

        //restart music
        if (soundMusic.getValue()) {
            soundMusic.stop();
            soundMusic.play(MUSIC_LIST[editor.musicId]);
        }

        //play voice
        if (editor.greeting.voiceServerId) {
            if (! isWeiXin())
                return;
            wx.playVoice({localId: greeting.voiceLocalId});
        }
    };

    var showContentForView = function() {
        console.log('showContentForView()');
    };

    var showContent = function() {
        if (mode === MODE_VIEW){
            showContentForView();
        } else if (mode === MODE_EDITOR){
            if (editor.step === STEP_PREVIEW) {
                showContentForPreview();
            } else {
                showContentForEditor();
            }
        } else {
            alert('error mode');
        }
    };

    var randomNewCard = function(step) {
        console.log('randomNewCard()');
        editor.manId = 0;
        //editor.musicId = 0;
        editor.bkgId = 0;
        
        showContent();
    };

    var sendCard = function() {
        console.log('sendCard()');
    };
    
    this.initWin = function() {
        console.log('initWin()');
        setSoftkey(editor.step);
        setEditor(editor.step);
        showContent();
    };

    this.onSkLeft = function() {
        if (editor.step === STEP_SELECT_THEME){
            randomNewCard();
        } else {
            editor.step -= 1;
            setSoftkey(editor.step);
            setEditor(editor.step);
            showContent();
        }
    };

    this.onSkRight = function() {
        if (editor.step === STEP_PREVIEW){
            sendCard();
        } else {
            editor.step += 1;
            setSoftkey(editor.step);
            setEditor(editor.step);
            showContent();
        }
    };

    this.manSelectorOnClick = function(man) {
        console.log('manSelectorOnClick()');
        var oldman = win.find('man-old');
        var x = oldman.x;
        var y = oldman.y;
        var i = 0;

        for (i = 0; i < MAN_LIST.length; i++) {
            if (man.name === MAN_LIST[i])
                editor.manId = i;
        }

        for (i = 0; i < MAN_LIST.length; i++) {
            var curMan = win.find(MAN_LIST[i]);
            curMan.x = x;
            curMan.y = y;
            curMan.setVisible(i === editor.manId);
        }
    };

    this.musicSelectorOnClick = function(button) {
        console.log('musicSelectorOnClick()');
        if (button.name === 'prev') {
            if (editor.musicId > 0)
                editor.musicId -= 1;
            else
                editor.musicId = MUSIC_LIST.length - 1;
        } else if (button.name === 'next') {
            if (editor.musicId >= MUSIC_LIST.length - 1)
                editor.musicId = 0;
            else 
                editor.musicId += 1;
        }
        console.log("musicId = " + editor.musicId);

        if (soundMusic.getValue()) {
            soundMusic.stop();
            soundMusic.play(MUSIC_LIST[editor.musicId]);            
        }
    };

    this.onEditGreeting = function(button) {
        console.log('onEditGreeting()');
        win.openWindow('greeting-editor', function(retData){
            console.log('greeting-editor window closed. retData = ' + retData);            
            if (retData){
                editor.greeting = retData;
                if (editor.greeting.text) {
                    win.find('group-greeting').find('text').setText(text);
                }
            }
        }, false, editor.greeting);
    };

    this.onSwitchToFront = function(button) {
        showContent();
    };

    this.onClickVoice = function(button) {
        //play voice
        if (editor.greeting.voiceServerId) {
            if (! isWeiXin())
                return;
            wx.playVoice({localId: greeting.voiceLocalId});
        }
    };
    /*
    this.onClickMusic = function(soundMusic) { //? no used
        console.log('onClickMusic()');
        soundMusic.stop();
        if (soundMusic.getValue()) {            
            soundMusic.play(MUSIC_LIST[editor.musicId]);            
        }
        if (editor.step === STEP_SELECT_THEME){
            win.find('group-music-selector').setVisible(soundMusic.getValue());
        }
    };
    */
}

function CreateEditorWinController(win) {
    win.controller = new EditorWinController(win);
    win.controller.initWin();
    return win.controller;
}

/*
greeting editor
*/
function GreetingWinController(win) {
    var greeting = null;
    var isPlaying = false;

    var mylog = function(msg) {
        console.log(msg);
        //alert(msg);
    };

    this.initWin = function(initData) {
        mylog('initWin(), initData = ' + initData);
        greeting = initData;
        win.find('ui-mledit', true).setText(greeting.text);
        win.find('delete', true).setVisible(greeting.voiceLocalId);
    };

    this.onDelete = function() {
        greeting.voiceLocalId = '';
        greeting.voiceServerId = '';
        win.find('delete', true).setVisible(false);
    };

    this.onRecord = function() {
        if (isPlaying)
            return;

        this.onDelete();

        win.openWindow("recording", function (retData) {
            console.log("recording window closed. retData = " + retData);
            if (! retData)
                return;
            if (! isWeiXin())
                return;

            greeting.voiceLocalId = retData;
            win.find('delete', true).setVisible(true);
            console.log('begin upload voice');
            
            wx.uploadVoice({
                localId: greeting.voiceLocalId,
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    greeting.voiceServerId = res.serverId; //返回音频的服务器端ID
                    mylog('recServerId = ' + recServerId);
                }
            });
        }, false);
    };

    this.onPlay = function() {
        if (! isWeiXin())
            return;
        if (! greeting.voiceLocalId)
            return;
        mylog('greeting.voiceLocalId = ' + greeting.voiceLocalId);
        wx.playVoice({localId: greeting.voiceLocalId});
        isPlaying = true;
        wx.onVoicePlayEnd({
            success: function (res) {
                isPlaying = false;
            }
        });
    };

    this.onChoose = function() {        
        win.openWindow('greeting-list', function(retData){
            var text = retData;
            console.log('greeting-list window retData = ' + retData);
            win.find('ui-mledit', true).setText(text);
        }, false);
    };
}

function CreateGreetingWinController(win, initData) {
    win.controller = new GreetingWinController(win);
    win.controller.initWin(initData);
    return win.controller;
}

/*
recording
*/
function RecordingWinController(win) {
    var isRecording = false;
    
    var mylog = function(msg) {
        console.log(msg);
        //alert(msg);
    };

    var startRecord = function() {
        win.getWindowManager().stopSoundMusic();

        mylog('startRecord()');
        if (! isWeiXin())
            return;
        wx.startRecord();
        isRecording = true;

        wx.onVoiceRecordEnd({
            // 录音时间超过一分钟没有停止的时候会执行 complete 回调
            complete: function (res) {
                isRecording = false;
                win.closeWindow(res.localId);
            }
        });
    };

    this.initWin = function(initData) {
        startRecord();
    };

    this.onPause = function() {
        mylog('onPause()');
        if (! isWeiXin() || ! isRecording){
            win.closeWindow('');
            return;
        }
        mylog('wx.stopRecord() begin');
        wx.stopRecord({success: function (res) {
            mylog('wx.stopRecord() success, res.localId = ' + res.localId);
            isRecording = false;
            win.closeWindow(res.localId);
        }});
    };
}

function CreateRecordingWinController(win, initData) {
    win.controller = new RecordingWinController(win);
    win.controller.initWin(initData);
    return win.controller;
}
