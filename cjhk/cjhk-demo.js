function WinController(win) {
    var recLocalId = 0;
    var isRecording = false;
    
    this.initWin = function() {
        isRecording = false;
        win.find('recStatus').setText('Wait Record');
    };
    
    var mylog = function(msg) {
        //alert(msg);
    };
    
    this.doRecord = function() {        
        if (! isWeiXin())
            return;
        
        if (isRecording){
            mylog('wx.stopRecord() begin');
            wx.stopRecord({
                success: function (res) {                    
                    recLocalId = res.localId;
                    
                    win.find('doRec').setText('StartRecord');
                    win.find('recStatus').setText('Record Done');
                    isRecording = false;
                }
            });
        } else {
            mylog('wx.startRecord() begin');
            wx.startRecord();            
            mylog('wx.startRecord() end');
            
            win.find('doRec').setText('StopRecord');
            win.find('recStatus').setText('Recording...');
            isRecording = true;
        }
    };
    
    this.playRecord = function() {
        if (! isWeiXin())
            return;
        
        mylog('recLocalId = ' + recLocalId);
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
}

function CreateWinController(win) {
    win.controller = new WinController(win);
    win.controller.initWin();
    return win.controller;
}

CreateWinController(this, initData);