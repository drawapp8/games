//todo: 
//1.url add image rotate

// -- egg --
function Stinger() {
    this.curIndex = 0;
    this.itemNum = 0;
    this.initStinger = function(num) {
        this.itemNum = num;
        this.curIndex = Math.floor(Math.random() * num);
    };
    this.switchStinger = function(win, index) {
        if(typeof index === "undefined") {
            this.curIndex = (this.curIndex + 1) % this.itemNum;
        } else {
            this.curIndex = index;
        }
        if(typeof this.onSwitchStinger == "function") {
            this.onSwitchStinger(win, this.curIndex);
        }
    };
    this.getCurIndex = function () {
        return this.curIndex;
    };
    this.onSwitchStinger = function (win, index) {
        return;  
    };
}

SpriteStinger = function() {
    return;
};
SpriteStinger.prototype = new Stinger();
SpriteStinger.prototype.initSpriteStinger = function(uiName) {
    this.snowmen = ["http://osgames1.b0.upaiyun.com/games/YinLijun/wxhk/snowman.png",
                    "http://osgames1.b0.upaiyun.com/games/YinLijun/wxhk/snowoman.png"];
    this.sheep =  ["http://osgames1.b0.upaiyun.com/games/YinLijun/wxhk/sheep1.png",
                    "http://osgames1.b0.upaiyun.com/games/YinLijun/wxhk/sheep2.png"];
    
    this.imageArray = [this.sheep, this.snowmen];
    this.imageClass = Math.floor(Math.random() * 2);
    this.imageList = this.imageArray[this.imageClass];
    this.initStinger(this.imageList.length);
    this.uiName = uiName;
};
SpriteStinger.prototype.onSwitchStinger = function(win, index) {
    win.find(this.uiName, true).setImageSrc(this.imageList[index]);
};

// -- on open --

//todo:
//1.微信的onReady放到窗口的onLoad中
//2.微信的语音和图片下载，应该放到wx.onReady中
function EditorWinController(win) {
    //  -- const data --
    var MODE_EDITOR = 0;
    var MODE_PREVIEW = 1;
    var MODE_VIEW = 2;

    //shucai
    var bgMusic_LIST = ["01.mp3", "03.mp3", "04.mp3"];
    var MAN_LIST = ['man-mama', 'man-baba', 'man-boy', 'man-girl', 'man-gfa', 'man-gma'];
    
    var controller = this;
    var mode = MODE_EDITOR;
    var editor = {
        bgMusicId: 0,
        manId: 0,
        bkgId: 0,
        greeting: {
            //text: "",
            voiceLocalId: "",
            voiceServerId: ""
        },
        photo: {
            faceCanvas: null,
            faceRect: {x:0, y:0, w:0, h:0},
            origWidth: 0,
            origRotation: 0,
            imgLocalId: "",
            imgServerId: ""
        }
    };    
    var isFaceDelayChange = false; //骨骼未加载时换脸会失败，延迟到ggOnLoadDone再换
    var ss = new SpriteStinger(); //random egg

    var playMusic = function() {       
        //if (win.find('ui-sound-Music').getValue()) { //todo: fixme
        win.getWindowManager().playSoundMusic();
        //}        
    };

    var stopMusic = function() {
        win.getWindowManager().stopSoundMusic();
    };
    
    var getUrlParam = function(param) {
        var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return unescape(r[2]); 
        else
            return null;
    };
        
    var hideControls = function(ctrList) {
        for (var i=0; i <ctrList.length; i++) {
            win.find(ctrList[i], true).setVisible(false);
        }
    };

    var showControls = function(ctrList) {
        for (var i=0; i <ctrList.length; i++) {
            win.find(ctrList[i], true).setVisible(true);
        }
    };

    var playVoiceDelayCallback = function() {
        console.log('playVoiceDelayCallback()');

        var wm = win.getWindowManager();
        if (wm.getCurrentWindow().name !== win.name) {
            setTimeout(playVoiceDelayCallback, 2000);
            return;
        }

        if (! isWeiXin() || ! editor.greeting.voiceLocalId){
            return;
        }

        stopMusic();
        console.log('wx playVoice begin');
        wx.playVoice({localId: editor.greeting.voiceLocalId});
        wx.onVoicePlayEnd({
            success: function (res) {
                console.log('wx playVoice done');
                playMusic();
            }
        });
    };

    //延迟到场景切到前台(大门已开启)，再播放语音
    //2秒检测一次是否为前台窗口，是则播放
    var playVoice = function() {
        console.log('playVoice() timer setted');
        setTimeout(playVoiceDelayCallback, 2000);
    };

    var isDownloadingVoice = false; // 经测试声音和图片同时下载，前一个会被后一个打断；改为先下载声音再下载图片
    var wxDowloadVoice = function() {
        console.log('wxDowloadVoice()');
        if (! editor.greeting.voiceServerId) return;
        if (! isWeiXin()) {
            editor.greeting.voiceLocalId = "dummyVoiceLocalId";                
            playVoice();
        } else {
            if (editor.greeting.voiceLocalId) {
                playVoice();
            } else {
                console.log('wx dowload voice start');
                isDownloadingVoice = true;
                wx.downloadVoice({
                    serverId: editor.greeting.voiceServerId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    fail: function (res) {console.log('wx dowload voice fail = ' + JSON.stringify(res));},
                    complete: function (res) {
                        console.log('wx dowload voice complete' + JSON.stringify(res)); 
                        isDownloadingVoice = false;

                        wxDowloadImage();
                    },
                    success: function (res) {
                        console.log('wx dowload voice success = ' + res.localId);
                        editor.greeting.voiceLocalId = res.localId;
                        playVoice();
                    }
                }); 
            }
        }
    };

    var wxDowloadImage = function() {
        console.log('wxDowloadImage() 1');
        if (isDownloadingVoice) return; //call in voice download complete callback

        console.log('wxDowloadImage() 2');
        if (! editor.photo.imgServerId) return;
        if (! isWeiXin()) {
            editor.photo.imgLocalId = editor.photo.imgServerId; 
            clipFaceFromPhoto(editor.photo.imgLocalId, editor.photo.faceRect);
        } else {
            if (editor.photo.imgLocalId) {
                clipFaceFromPhoto(editor.photo.imgLocalId, editor.photo.faceRect);
            } else {
                console.log('wx dowload photo start');
                wx.downloadImage({
                    serverId: editor.photo.imgServerId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    fail: function (res) {console.log('wx dowload image fail = ' + JSON.stringify(res));},
                    complete: function (res) {console.log('wx dowload image complete' + JSON.stringify(res));},
                    success: function (res) {
                        console.log('wx dowload photo success = ' + res.localId);
                        editor.photo.imgLocalId = res.localId; // 返回图片下载后的本地ID
                        clipFaceFromPhoto(editor.photo.imgLocalId, editor.photo.faceRect);
                    }
                });
            }
         }
    };
    
    var wxDownloadRes = function() {
        console.log('wxDownloadRes()');
        wxDowloadVoice();
        wxDowloadImage();
    };

    //status transform: VIEW -> EDITOR <> PREVIEW
    var EDITOR_CTRS = ['intro-bkg', 'intro-man', 'group-man', 'camera-wrap', 'record-wrap', 'preview'];
    var BAOZHU_CTRS = ['baozhu-left', 'baozhu-right', 'lizhi-l1', 'lizhi-l2', 'lizhi-r1', 'lizhi-r2'];
    var VIEW_CTRS = ['down-anim', 'replay'];
    var PREVIEW_CTRS = ['edit', 'share'];

    var initPreviewMode = function() {
        console.log('initPreviewMode()');        
        hideControls(EDITOR_CTRS);
        showControls(PREVIEW_CTRS);
        showControls(BAOZHU_CTRS);
        playVoice();
    };

    var initEditorMode = function() {
        console.log('initEditorMode()');
        hideControls(VIEW_CTRS);
        hideControls(PREVIEW_CTRS);
        hideControls(BAOZHU_CTRS);
        showControls(EDITOR_CTRS);
        win.find('bkg-list').setEnable(true);
    };

    var initViewMode = function() {
        console.log('initViewMode()');
        hideControls(EDITOR_CTRS);        
        showControls(VIEW_CTRS);
        
        //get param from url
        var manId = getUrlParam('man');
        var bkgId = getUrlParam('bkg');
        var bgMusicId = getUrlParam('bgMusic');
        var voiceServerId = getUrlParam('gvoice');
        var photoServerId = getUrlParam('gphoto');

        var rect = {x:0, y:0, w:0, h:0};
        rect.x = Number(getUrlParam('fx'));
        rect.y = Number(getUrlParam('fy'));
        rect.w = Number(getUrlParam('fw'));
        rect.h = Number(getUrlParam('fh'));
        editor.photo.origWidth = Number(getUrlParam('ow'));
        editor.photo.origRotation = Number(getUrlParam('or'));

        
        if (manId)
            editor.manId = Number(manId);
        if (bkgId)
            editor.bkgId = Number(bkgId);
        if (bgMusicId)
            editor.bgMusicId = Number(bgMusicId);
        if (voiceServerId)
            editor.greeting.voiceServerId = unescape(voiceServerId);
        if (photoServerId)
            editor.photo.imgServerId = unescape(photoServerId);
        editor.photo.faceRect = rect;
        
        //if (isWeiXin()) {//test            
        //    console.log('set test id');
        //    editor.photo.imgServerId = 'MFlrNwcBfyXKpSF6SpheeVDR4KQfe_llTZuCoeVDlG_Ko1PNWAw3qRrBuNIJ0fvc';
        //}        
            
        console.log("editor: manId=" + editor.manId + 
                    ", bkgId=" + editor.bkgId + 
                    ", bgMusicId=" + editor.bgMusicId + 
                    ", voiceServerId=" + editor.greeting.voiceServerId + 
                    ", photoServerId=" + editor.photo.imgServerId + 
                    ", ow=" + editor.photo.origWidth + 
                    ", or=" + editor.photo.origRotation +
                    ", fx=" + editor.photo.faceRect.x + 
                    ", fy=" + editor.photo.faceRect.y + 
                    ", fw=" + editor.photo.faceRect.w + 
                    ", fh=" + editor.photo.faceRect.h);
        
        if (! isWeiXin()) {
            wxDownloadRes();
        } else {            
            console.log('register wx.ready()');
            wx.ready(function () {
                console.log("initViewMode() wx.ready");
                wxDownloadRes();
            });
            wx.error(function (res) {
               console.log("initViewMode() wx.error");
            });        
        }        
    };    
    
    var showMan = function() {
        console.log('showMan()');
        var mama = win.find('man-mama-img');
        
        for (var i=0; i<MAN_LIST.length; i++) {
            var man = win.find(MAN_LIST[i]+'-img');
            var manX = mama.x + (mama.getWidth() - man.getWidth());  //以妈妈为准，靠右下对齐
            var manY = mama.y + (mama.getHeight() - man.getHeight());
            man.setPosition(manX, manY).setVisible(i === editor.manId);
        }

        if (editor.photo.faceCanvas) {
            ggChangeFace(editor.photo.faceCanvas);
        }
    };

    var removeUrlParams = function (url, paramList){
        for (var i=0; i < paramList.length; i++) {
            var re = eval('/('+ paramList[i] + '=)([^]*)/gi');
            url = url.replace(re, '');
            console.log('after step ' + i + ', ' + 'url = ' + url);
        }

        return url;
    };
    
    var getWeixinShareUrl = function() {
        //remove url param
        var url = String(window.location);
        console.log('original url = ' + url);
        url = removeUrlParams(url, ['&bkg', '&bgMusic', '&man', '&gvoice', 'gphoto', 'fx', 'fy', 'fw', 'fh']);
        console.log('removed, url = ' + url);

        editor.bkgId = win.find('bkg-list').getCurrent();

        //append url param
        url = url + 
                '&man=' + editor.manId + 
                '&bgMusic=' + editor.bgMusicId + 
                '&bkg=' + editor.bkgId + 
                '&gvoice=' + escape(editor.greeting.voiceServerId) + 
                '&gphoto=' + escape(editor.photo.imgServerId) + 
                '&ow=' + Math.floor(editor.photo.origWidth) +
                '&or=' + Math.floor(editor.photo.origRotation) + 
                '&fx=' + Math.floor(editor.photo.faceRect.x) +  
                '&fy=' + Math.floor(editor.photo.faceRect.y) +  
                '&fw=' + Math.floor(editor.photo.faceRect.w) +  
                '&fh=' + Math.floor(editor.photo.faceRect.h);
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

    this.initWin = function(initData) {                
        console.log('initWin(), manId=' + editor.manId + ', bkgId=' + editor.bkgId);        

        if (initData === 'mode=preview'){
            mode = MODE_PREVIEW;
            initPreviewMode();
            win.openWindow('dlg-door');
        } else if (initData === 'mode=editor'){
            mode = MODE_EDITOR;
            initEditorMode();
        } else { //default is view mode
            mode = MODE_VIEW;
            initViewMode();
            win.openWindow('dlg-door');
        }
        
        showMan();
        win.find('bkg-list').setCurrent(editor.bkgId);

        if (mode === MODE_VIEW || mode === MODE_PREVIEW) {            
            ss.initSpriteStinger("snowman");
            ss.switchStinger(win, 0);
        }
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
    
    this.onClickPreview = function() {
        console.log('onClickPreview()');

        initWeixinShare();
        controller.initWin('mode=preview');
    };

    this.onClickShare = function() {
        console.log('onClickShare()');
        initWeixinShare();
        win.openWindow('win-share-guide');
    };

    this.onClickReplay = function() {
        console.log('onClickReplay()');
        controller.initWin('mode=view');
    };
    
    this.onClickBackEdit = function() {
        controller.initWin('mode=editor');
    };

    this.onClickSnowman = function() {
        if (mode !== MODE_EDITOR)
            ss.switchStinger(win);
    };
    
    this.onClickRecord = function() {
        stopMusic();

        win.openWindow('win-record', function(resId) {
            playMusic();

            console.log("record window resId = " + resId);
            if (! resId) { // record deleted
                editor.greeting.voiceLocalId = '';
                editor.greeting.voiceServerId = '';
                return;
            } else if (editor.greeting.voiceLocalId === resId) { // not changed
                return;
            }

            if (! isWeiXin()){
                editor.greeting.voiceLocalId = resId;
                editor.greeting.voiceServerId = "dummyVoiceSererId";                
                return;
            }

            editor.greeting.voiceLocalId = resId;
            console.log('begin upload voice');
            
            wx.uploadVoice({
                localId: editor.greeting.voiceLocalId,
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    editor.greeting.voiceServerId = res.serverId; //返回音频的服务器端ID
                    console.log('recServerId = ' + recServerId);
                }
            });            
        }, false, editor.greeting.voiceLocalId);
    };  

    var ggChangeFace = function(faceCanvas) {
        var ggWrapName = MAN_LIST[editor.manId] + '-img';
        var robot = win.find(ggWrapName).find('gg');
        var r = robot.getSlotRect("transparent-face");
        if (! r) {
            isFaceDelayChange = true;
            return;
        }
        
        var rect = {x:0, y:0, width:r.width, height:r.height};
        var canvas = document.createElement("canvas");
        canvas.width = r.width;
        canvas.height = r.height;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, r.width, r.height);
        ctx.save();
        ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
        ctx.rotate(editor.photo.origRotation * Math.PI / 180);
        ctx.drawImage(faceCanvas, 0, 0, faceCanvas.width, faceCanvas.height, 
                canvas.width * -0.5,canvas.height * -0.5 , canvas.width, canvas.height);
        ctx.restore();

        robot.replaceSlotImage("transparent-face", canvas, rect);
    };

    //first download image by imageServerId
    var clipFaceFromPhoto = function(imgLocalId, faceRect) {
        var loadRetryTimes = 0;
        var clipCallback = function() {
            loadRetryTimes += 1;
            console.log('clipCallback(), loadRetryTimes = ' + loadRetryTimes);

            var img = new Image();
            img.onload = function () {
                console.log('wx img onload');
                if(!faceRect.w) {
                    faceRect.w = img.width;
                } 
                if(!faceRect.h) {
                    faceRect.h = img.height;
                }
                var ow = editor.photo.origWidth;
                if(ow > 0 && ow != img.width) {
                    var factor = img.width / ow;
                    faceRect.x *= factor;
                    faceRect.y *= factor;
                    faceRect.w *= factor;
                    faceRect.h *= factor;
                }
                var ovalImage = clipOvalImage(img, faceRect, null);
                if (! ovalImage) return;
                
                editor.photo.faceCanvas = ovalImage;
                ggChangeFace(editor.photo.faceCanvas);
                img.onload = null;
            };
            img.onerror = function (e) {
                console.log('wx img onerror');
                console.log(JSON.stringify(e));
                //if (loadRetryTimes < 10) 
                //setTimeout(clipCallback, 1000);
            };            
            img.src = imgLocalId;
            if (img.complete){
                console.log('wx img compelte!!');
            }
        };

        console.log('clipFaceFromPhoto()');
        setTimeout(clipCallback, 1000);
    };

    this.onClickCamera = function() {
        win.openWindow("win-replace-face", 
            function (retData) {
                if (retData && retData.canvas) {

                    // 上传头像，朋友收到贺卡时再下载和换头
                    if (retData.imageId) {
                        editor.photo.imgLocalId = retData.imageId;

                        wx.uploadImage({
                            localId: editor.photo.imgLocalId, // 需要上传的图片的本地ID，由chooseImage接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function (res) {
                                //editor.photo.imgLocalId = res.serverId; // 返回图片的服务器端ID
                                editor.photo.imgServerId = res.serverId; // 返回图片的服务器端ID
                            }
                        });
                    }

                    editor.photo.faceCanvas = retData.canvas;
                    editor.photo.faceRect = retData.rect;
                    editor.photo.origWidth = retData.origWidth;
                    editor.photo.origRotation = 180 * retData.rotation / Math.PI;
                    ggChangeFace(retData.canvas);
                }
            }, false, initData);
    };
    
    this.ggOnLoadDone = function(gg) {
        console.log('ggOnLoadDone(), parent = ' + gg.getParent().name);

        var curName = MAN_LIST[editor.manId] + '-img';
        if (gg.getParent().name != curName) {
            return;
        }

        if (editor.photo.faceCanvas && isFaceDelayChange) {
            ggChangeFace(editor.photo.faceCanvas);
            isFaceDelayChange = false; // only once
        }
    };

    this.onSwipeUp = function() {
        console.log('onSwipeUp()');
        if (mode === MODE_VIEW) {
            win.openWindow('win-logo', null, true);
        }
    };
}

function CreateEditorWinController(win) {
    console.log('CreateEditorWinController()');
    win.controller = new EditorWinController(win); 
    //console.log = win.find('log').setText;
    win.controller.initWin(initData);
    return win.controller;
}

CreateEditorWinController(this);

