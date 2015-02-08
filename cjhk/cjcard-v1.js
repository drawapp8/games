function EditorWinController(win) {
    //  -- const data --
    var MODE_EDITOR = 0;
    var MODE_PREVIVIEW = 1;
    var MODE_VIEW = 2;

    //shucai
    var MUSIC_LIST = ["01.mp3", "03.mp3", "04.mp3"];
    var MAN_LIST = ['man-mama', 'man-baba', 'man-boy', 'man-girl', 'man-gfa', 'man-gma'];
    
    var controller = this;
    var mode = MODE_EDITOR;
    var editor = {
        musicId: 0,
        manId: 0,
        bkgId: 0,
        greeting: {
            //text: "",
            voiceLocalId: "",
            voiceServerId: ""
        },
        head: {
            clipCanvas: null,
            localId: "",
            serverId: ""
        }
    };
    
    var getUrlParam = function(param) {
        var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return unescape(r[2]); 
        else
            return null;
    };
    
    var initEditorMode = function() {
        console.log('initEditorMode()');      
        win.find('bkg-list').setEnable(true);
        if (editor.greeting.voiceLocalId) {
            win.find('voice').setVisible('true');
            win.find('voice-delete').setVisible('true');
        }
    };
    
    var hideControls = function(ctrList) {
        for (var i=0; i <ctrList.length; i++) {
            win.find(ctrList[i], true).setVisible(false);
        }
    };
    
    var initPreviewMode = function() {
        console.log('initPreviewMode()');
        
        // hide editor controls
        var HIDE_LIST1 = ['intro-bkg', 'intro-man', 'group-man', 'camera-wrap', 'record-wrap'];
        var HIDE_LIST2 = ['music-prev', 'music-next', 'preview'];
        hideControls(HIDE_LIST1);
        hideControls(HIDE_LIST2);
        
        win.find('edit', true).setVisible(true);
        
        if (editor.greeting.voiceLocalId) {
            win.find('voice').setVisible('true');
            if (isWeiXin)
                wx.playVoice({localId: editor.greeting.voiceLocalId});
        }        
    };
    
    var initViewMode = function() {
        console.log('initViewMode()');
        
        // hide editor controls
        var HIDE_LIST1 = ['intro-bkg', 'intro-man', 'group-man', 
            'camera-wrap', 'record-wrap', 'voice', 'voice-delete'];
        var HIDE_LIST2 = ['music-prev', 'music-next', 'preview', 'share'];
        hideControls(HIDE_LIST1);
        hideControls(HIDE_LIST2);                
        win.find('down-anim').setVisible('true');        
        
        //get param from url
        var manId = getUrlParam('man');
        var bkgId = getUrlParam('bkg');
        var musicId = getUrlParam('music');
        var voiceServerId = getUrlParam('gvoice');
                
        if (manId)
            editor.manId = Number(manId);
        if (bkgId)
            editor.bkgId = Number(bkgId);
        if (musicId)
            editor.musicId = Number(musicId);
        if (voiceServerId)
            editor.greeting.voiceServerId = unescape(voiceServerId);
            
        console.log("editor: manId=" + editor.manId + 
                    ", bkgId=" + editor.bkgId + 
                    ", musicId=" + editor.musicId + 
                    ", voiceServerId=" + editor.greeting.voiceServerId);
        
        //download wx voice
        if (editor.greeting.voiceServerId){
            if (! isWeiXin){
                editor.greeting.voiceLocalId = "dummyVoiceLocalId";
                win.find('voice').setVisible('true');
            }
            
            wx.downloadVoice({
                serverId: editor.greeting.voiceServerId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    editor.greeting.voiceLocalId = res.localId;
                    win.find('voice').setVisible('true');
                    wx.playVoice({localId: editor.greeting.voiceLocalId});
                }
            }); 
        }
    };
    
    var showMan = function() {
        console.log('showMan()');
        var mama = win.find('man-mama-img');
        
        for (var i=0; i<MAN_LIST.length; i++) {            
            win.find(MAN_LIST[i]+'-img').setPosition(mama.x, mama.y).setVisible(i === editor.manId);
        }

        if (editor.head.clipCanvas) {
            changeHead(editor.head.clipCanvas);
        }
    };

    var removeUrlParams = function (url, paramList){
        for (var i=0; i < paramList.length; i++) {
            var re = eval('/('+ paramList[i] + '=)([^&]*)/gi');
            url = url.replace(re, '');
            console.log('after step ' + i + ', ' + 'url = ' + url);
        }

        return url;
    };
    
    var getWeixinShareUrl = function() {
        //remove url param
        var url = String(window.location);
        console.log('original url = ' + url);        
        url = removeUrlParams(url, ['&bkg', '&music', '&man', '&gvoice']);
        console.log('removed, url = ' + url);

        editor.bkgId = win.find('bkg-list').getCurrent();

        //append url param
        url = url + 
                '&man=' + editor.manId + 
                '&music=' + editor.musicId + 
                '&bkg=' + editor.bkgId + 
                '&gvoice=' + escape(editor.greeting.voiceServerId);
        console.log('appended, url = ' + url);
        return url;
    };

    var initWeixinShare = function() {
        url = getWeixinShareUrl();
        console.log('initWeixinShare(), url =', url);
        if (! isWeiXin()){
            return;
        }        

        var ti = '2015春节贺卡';
        var de = '喜气洋洋祝福来';
        var imageUrl = "http://file.market.xiaomi.com/thumbnail/PNG/l114/c8c/92831985ac381d011aeb3fadc8c85afe480b1d99";
        wx.onMenuShareTimeline({ //分享到朋友圈
            title: ti, 
            link: url,
            imgUrl: imageUrl
        });
        wx.onMenuShareAppMessage({ //发送给朋友
            title: ti,
            desc: de,
            link: url,
            imgUrl: imageUrl
        });
        wx.onMenuShareQQ({
            title: ti,
            desc: de,
            link: url,
            imgUrl: imageUrl
        });        
    };

    this.initWin = function(initData, editorSave) {
        if (editorSave) {
            editor = editorSave;
        }        
        console.log('initWin(), manId=' + editor.manId + ', bkgId=' + editor.bkgId);
        
        win.resetGame();
        
        if (initData === 'mode=view'){
            mode = MODE_VIEW;
            initViewMode();
        } else if (initData === 'mode=preview'){
            mode = MODE_PREVIVIEW;
            initPreviewMode();
        } else if (initData === 'mode=editor'){
            mode = MODE_EDITOR;
            initEditorMode();
        } else {
            alert('error mode');
        }
        
        showMan();
        win.find('bkg-list').setCurrent(editor.bkgId);
    };
    
    this.manBarOnClick = function(button) {
        console.log('manBarOnClick()');
        for (var i=0; i<MAN_LIST.length; i++) {
            if (MAN_LIST[i] === button.name) {
                editor.manId = i;
                break;
            }
        }
        
        showMan();
    };
    
    this.manImageOnClick = function(img) {
        console.log('manImageOnClick()');
        if (mode !== MODE_EDITOR) return;
        win.find('intro-man').setVisible(false);
        editor.manId = (editor.manId + 1) % MAN_LIST.length;
        showMan();        
    };
    
    //deep copy
    var deepCopy = function(source) {
        var result={};
        for (var key in source) {
            result[key] = typeof source[key]==='object'? deepCopy(source[key]): source[key];
        }
        return result;
    };

    this.onClickPreview = function() {
        console.log('onClickPreview()');

        initWeixinShare();
        
        //save editor state
        editor.bkgId = win.find('bkg-list').getCurrent();
        window.myEditorSave = editor; //save status to global
                
        win.openWindow('win-door', null, true, 'mode=preview');
    };

    this.onClickShare = function() {
        console.log('onClickShare()');
        initWeixinShare();
        //win.openWindow('win-tip-share', null, true, 'mode=preview');
    };
    
    this.onClickBackEdit = function() {
        controller.initWin('mode=editor', null);
    };
    
    this.onClickRecord = function() {
        win.openWindow('win-record', function(retData) {
            console.log("record window retData = " + retData);
            if (! retData)
                return;
            if (! isWeiXin()){
                editor.greeting.voiceLocalId = retData;
                editor.greeting.voiceServerId = "dummyVoiceSererId";
                win.find('voice', true).setVisible(true);
                win.find('voice-delete', true).setVisible(true);
                return;
            }                

            editor.greeting.voiceLocalId = retData;
            win.find('voice', true).setVisible(true);
            win.find('voice-delete', true).setVisible(true);
            console.log('begin upload voice');
            
            wx.uploadVoice({
                localId: editor.greeting.voiceLocalId,
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    editor.greeting.voiceServerId = res.serverId; //返回音频的服务器端ID
                    console.log('recServerId = ' + recServerId);
                }
            });            
        }, false);
    };
    
    var isPlayingVoice = false;
    this.onClickPlayVoice = function() {
        if (! isWeiXin())
            return;
        if (! editor.greeting.voiceLocalId || isPlayingVoice)
            return;
        console.log('editor.greeting.voiceLocalId = ' + editor.greeting.voiceLocalId);
        wx.playVoice({localId: editor.greeting.voiceLocalId});
        isPlayingVoice = true;
        wx.onVoicePlayEnd({
            success: function (res) {
                isPlayingVoice = false;
            }
        });
    };
    
    this.onClickDeleteVoice = function() {
        editor.greeting.voiceLocalId = '';
        editor.greeting.voiceServerId = '';
        win.find('voice', true).setVisible(false);
        win.find('voice-delete', true).setVisible(false);
    };

    var changeHead = function(clipCanvas) {
        console.log('changeHead()');
        var ggWrapName = MAN_LIST[editor.manId] + '-img';
        var robot = win.find(ggWrapName).find('gg');
        var r = robot.getSlotRect("transparent-face");
        var rect = {x:0, y:0, width:r.width, height:r.height};
        var ctx = clipCanvas.getContext("2d");
        ctx.scale(0.1, 0.1);
        ctx.restore();
        var canvas = document.createElement("canvas");
        canvas.width = r.width;
        canvas.height = r.height;
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, r.width, r.height);
        ctx.save();
        ctx.drawImage(clipCanvas, 0, 0, clipCanvas.width, clipCanvas.height, 0, 0, r.width, r.height);
        ctx.restore();
        robot.replaceSlotImage("transparent-face", canvas, rect);
    };

    //first download image by imageServerId
    var getHeadImageClipCanvas = function(imageLocalId, rect) {
        console.log('getNewclipCanvas()');
        var ovalImage = clipOvalImage(imageLocalId, rect, null);
        return ovalImage;
    };

    this.onClickCamera = function() {
        win.openWindow("win-replace-head", 
            function (retData) {
                if (retData && retData.canvas) {
                    console.log('changeHead() begin');
                    editor.head.clipCanvas = retData.canvas;
                    changeHead(retData.canvas);
                }
            }, false, initData);
    };
}

function CreateEditorWinController(win, initData) {
    console.log('CreateEditorWinController()');
    win.controller = new EditorWinController(win);    
    win.controller.initWin(initData, window.myEditorSave);
    return win.controller;
}

CreateEditorWinController(this, initData);