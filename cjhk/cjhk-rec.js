function RecordingWinController(win) {
    var isRecording = false;
    var isPlaying = false;
    var voiceLocalId = '';

    var btnVoice = win.find('voice');
    var btnDelete = win.find('voice-delete');
    var btnRecord = win.find('record');
    var btnBack = win.find('back');
    var wave = win.find('wave');
        
    var mylog = function(msg) {
        console.log(msg);
        //alert(msg);
    };

    var updateUI = function() {
        btnVoice.setVisible(voiceLocalId);
        btnDelete.setVisible(voiceLocalId);

        if (isRecording || isPlaying) {
            btnBack.setEnable(false);
            btnVoice.setEnable(false);
            btnDelete.setEnable(false);
            wave.play();
        } else {
            btnBack.setEnable(true);
            btnVoice.setEnable(true);
            btnDelete.setEnable(true);            
            wave.stop();
        }
    };

    var startRecord = function() {
        mylog('startRecord()');        
        isRecording = true;
        updateUI();
        if (! isWeiXin())
            return;
        
        mylog('wx.startRecord()');
        wx.startRecord();    
        wx.onVoiceRecordEnd({            
            complete: function (res) { // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                isRecording = false;
                voiceLocalId = res.localId;
                updateUI();
            }
        });
    };
    
    var stopRecord = function() {
        mylog('stopRecord()');
        isRecording = false;        
        if (! isWeiXin()){
            voiceLocalId = 'dummyVoiceId';
            updateUI();
            return;
        }
        
        mylog('wx.stopRecord()');
        wx.stopRecord({success: function (res) {
            mylog('wx.stopRecord() success, res.localId = ' + res.localId);
            voiceLocalId = res.localId;
            updateUI();
        }});
    };
    
    this.initWin = function(initData) {
        if (initData) {
            voiceLocalId = initData;            
        }
        updateUI();
    };

    this.onClickVoice = function() {
        console.log('onClickVoice()');
        if (! isWeiXin())
            return;
        if (! voiceLocalId)
            return;        

        wx.playVoice({localId: voiceLocalId});
        isPlaying = true;
        updateUI();
        
        wx.onVoicePlayEnd({
            success: function (res) {
                isPlaying = false;
                updateUI();
            }
        });
    };

    this.onClickVoiceDelete = function() {
        voiceLocalId = '';
        updateUI();
    };

    this.onClickRecord = function() {
        mylog('onClickRecordButton()');
        if (isRecording) {
            stopRecord();
        } else {
            startRecord();
        }
    };

    this.onClickBack = function() {
        win.closeWindow(voiceLocalId);
    };
}

function CreateRecordingWinController(win, initData) {
    win.controller = new RecordingWinController(win);
    win.controller.initWin(initData);
    return win.controller;
}

CreateRecordingWinController(this, initData);