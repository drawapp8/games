function MakeWinController(win) {
    var recLocalId = 0;
    var recServerId = 0;
    var isRecording = false;

    var MAN_LIST = ['man-1', 'man-2'];    
    var BKG_LIST = ['option_image_0', 'option_image_1'];
    var MAKE_CONTROL_LIST = ['recStatus', 'doRec', 'playRec', 'uploadRec', 'done', 'switch-next', 'switch-prev', 'share'];

    var manIndex = 0;
    var bkgIndex = 0;
    var isMaking = false;

    var beginMake = function() {
        for (var i=0; i < MAKE_CONTROL_LIST.length; i++){
            win.find(MAKE_CONTROL_LIST[i]).setVisible(true);
        }
        win.find('make').setVisible(false);
        isMaking = true;
    };

    var endMake = function() {
        for (var i=0; i < MAKE_CONTROL_LIST.length; i++){
            win.find(MAKE_CONTROL_LIST[i]).setVisible(false);
        }
        win.find('make').setVisible(true);
        isMaking = false;
    };
    
    var getUrlParam = function(param) {
        var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return unescape(r[2]); 
        else
            return null;
    };
        
    this.initWin = function() {
        console.log("current url = " + window.location);
        
        manIndex = getUrlParam("man");
        if (manIndex === null) manIndex = 0;
        bkgIndex = getUrlParam("bkg");
        if (bkgIndex === null) bkgIndex = 0;
        recServerId = getUrlParam("rec");
        if (recServerId === null) recServerId = 0;
                
        isRecording = false;
        win.find('recStatus').setText('Wait Record');
        endMake();
    };

    this.onPlayRecTimeout = function(){        
        if (! isWeiXin())
            return;
        if (! recServerId)
            return;

        wx.downloadVoice({
            serverId: recServerId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function (res) {
                wx.playVoice({localId: res.localId});
            }
        });
    };
    
    var mylog = function(msg) {
        //alert(msg);
    };
    
    this.doRecord = function() {        
        if (! isWeiXin())
            return;
        
        if (isRecording){
            //mylog('wx.stopRecord() begin');
            wx.stopRecord({
                success: function (res) {                    
                    recLocalId = res.localId;
                    
                    win.find('doRec').setText('StartRecord');
                    win.find('recStatus').setText('Record Done');
                    isRecording = false;
                }
            });
        } else {
            //mylog('wx.startRecord() begin');
            wx.startRecord();
            //mylog('wx.startRecord() end');
            
            win.find('doRec').setText('StopRecord');
            win.find('recStatus').setText('Recording...');
            isRecording = true;
        }
    };
    
    this.playRecord = function() {
        if (! isWeiXin())
            return;
        
        //mylog('recLocalId = ' + recLocalId);
        wx.playVoice({localId: recLocalId});
        
        win.find('recStatus').setText('Playing...');
        
        wx.onVoicePlayEnd({
            success: function (res) {
                //var localId = res.localId; // 返回音频的本地ID
                win.find('recStatus').setText('Play Done');
            }
        });
    };
    
    this.chooseImage = function() {
        function onSuccess(res) {
            if(res.localIds.length) {
                win.find("photo").setImageSrc(res.localIds[0]);
            }
        }
        wx.chooseImage({success: onSuccess});
    };
    
    this.startClip = function() {
        win.find('photo').setVisible(true);
        win.find('clip').setMode(Shape.MODE_EDITING);
        clip.setText("Drag Region");
    };
    
    this.endClip = function() {                
        var photo = win.find('photo');
        var clip = win.find('clip');
        
        clip.setMode(Shape.MODE_RUNNING);
        clip.setText("");
        photo.setVisible(false);
        
        clip.drawImage = function(canvas) {
        };
        
        clip.drawBgImage = function(canvas) {
            var image = photo.getBgHtmlImage();
            var rect = {x:this.x, y:this.y, w:this.getWidth(), h:this.getHeight()};
            
            rect.x = rect.x - photo.x;
            rect.y = rect.y - photo.y;
            
            this.ovalImage = clipOvalImage(image, rect, this.ovalImage);
            this.drawImageAt(canvas, this.ovalImage, this.images.display, 0, 0, this.w, this.h, null);    
            return;
        };
    };

    this.onShare = function() {
        var shareUrl = window.href + "&bkg=" + bkgIndex + "&man=" + manIndex + "&rec=" + recServerId;

        if (! isWeiXin())
            return;

        wx.onMenuShareAppMessage({
            title: 'card share title',
            desc: 'card share desc',
            link: shareUrl, // 分享链接
            imgUrl: 'https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon64_appwx_logo.png/', // 分享图标
            type: 'link', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () { 
                // 用户确认分享后执行的回调函数
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
            }
        });
    };

    this.onDone = function() {
        endMake();    
    };

    this.uploadRecord = function() {
        if (! isWeiXin())
            return;

        mylog('uploadRecord() begin');
        wx.uploadVoice({
            localId: recLocalId,
            isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    recServerId = res.serverId; //返回音频的服务器端ID
                    mylog('recServerId = ' + recServerId);
            }
        });
    };

    this.onNextBkg = function() {
        bkgIndex = (bkgIndex + 1) % BKG_LIST.length;
        var bkg = win.find('bkg');
        var image_url = bkg.getImageSrc(BKG_LIST[bkgIndex]);
        console.log("next img = " + image_url);
        bkg.setImageSrc(image_url);
    };

    this.onMan = function() {        
        manIndex = (manIndex + 1) % MAN_LIST.length;

        for (i=0; i < MAN_LIST.length; i++){
            console.log("man.name");
            var man = win.find(MAN_LIST[i]);
            //console.log("man.name = ", man.name);
            man.setVisible(i === manIndex);
        }
    };
    
    this.onMake = function() {
        beginMake();
    };
}

function CreateMakeWinController(win) {
    win.controller = new MakeWinController(win);
    win.controller.initWin();
    return win.controller;
}

CreateMakeWinController(this, initData);