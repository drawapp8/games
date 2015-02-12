// 1. clear voiceIdNew
function RecordingWinController(win) {
    var isRecording = false;
    var isPlaying = false;
    var voiceIdSave = '';
    var voiceIdNew = '';

    var btnVoice = win.find('voice', true);
    var btnDelete = win.find('voice-delete', true);
    var btnRecord = win.find('record', true);
    var btnBack = win.find('back', true);
    var btnSave = win.find('save', true);
    var wave = win.find('wave', true);
        
    var updateUI = function() {
        if (isRecording || isPlaying) {
            wave.play();

            //播放或者录音中，不能执行任何操作，隐藏操作按钮
            btnBack.setVisible(false);
            btnDelete.setVisible(false);
            btnSave.setVisible(false);            

            if (isRecording) { //录音时隐藏播放按钮，显示录音按钮
                btnRecord.setVisible(true);
                btnVoice.setVisible(false);
            } else if (isPlaying) { //播放时隐藏录音按钮和播放按钮
                btnRecord.setVisible(false);
                btnVoice.setVisible(false);
            } else {
                alert('updateUI() error');
            }
        } else {
            wave.stop();
            btnBack.setVisible(true);
            btnVoice.setVisible(voiceIdSave || voiceIdNew);
            btnDelete.setVisible(voiceIdSave || voiceIdNew);
            btnSave.setVisible(voiceIdNew);
        }
        
        if (btnSave.isVisible()) {
            btnBack.x = 60;
        } else {
            btnBack.x = 157; //保存不显示时，取消按钮居中
        }
    };

    var startRecord = function() {
        console.log('startRecord()');        
        if (! isWeiXin()) {
            isRecording = true;
            updateUI();
            return;
        }

        console.log('wx.startRecord()');
        wx.startRecord({
            fail: function (res) {
                alert('录音失败, ' + JSON.stringify(res));
                win.closeWindow('');
            },
            cancel: function (res) {//授权确认对话框，用户点了否
                console.log('wx.startRecord() cancel, ' + JSON.stringify(res));
                win.closeWindow('');
            },
            success: function (res) {
                console.log('wx.startRecord() success');                
                isRecording = true;
                updateUI();
            }
        });

        wx.onVoiceRecordEnd({// 录音时间超过一分钟没有停止的时候会自动停止并执行 complete 回调            
            complete: function (res) {
                console.log('wx.onVoiceRecordEnd() complete, ' + JSON.stringify(res));
                isRecording = false;
                voiceIdNew = res.localId;
                updateUI();
            }            
        });
    };
    
    var stopRecord = function() {
        console.log('stopRecord()');        
        if (! isWeiXin()){
            isRecording = false;
            voiceIdNew = 'dummyVoiceId';
            updateUI();
            return;
        }        
        
        console.log('wx.stopRecord()');
        wx.stopRecord({
            fail: function (res) {
                alert('停止录音失败, ' + JSON.stringify(res));                
            },
            success: function (res) {
                console.log('wx.stopRecord() success, res.localId = ' + res.localId);
                isRecording = false;
                voiceIdNew = res.localId;
                updateUI();
        }});
    };
    
    this.initWin = function(initData) {
        if (initData) {
            voiceIdSave = initData;            
        }
         
        updateUI();
        
        if (! voiceIdSave) startRecord();
    };

    this.onClickVoice = function() {
        console.log('onClickVoice()');
        if (! isWeiXin())
            return;
        if (! voiceIdNew && ! voiceIdSave){
            alert('error: none voice exist');
            return;
        }

        var vid = voiceIdSave;
        if (voiceIdNew) vid = voiceIdNew;
        wx.playVoice({localId: vid});
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
        voiceIdNew = '';
        voiceIdSave = '';
        updateUI();
    };

    this.onClickRecord = function() {
        console.log('onClickRecordButton()');
        if (isRecording) {
            stopRecord();
        } else {
            startRecord();
        }
    };

    this.onClickBack = function() {
        win.closeWindow(voiceIdSave);
    };

    this.onClickSave = function() {
        voiceIdSave = voiceIdNew;
        win.closeWindow(voiceIdSave);
    };
}

function CreateRecordingWinController(win, initData) {
    win.controller = new RecordingWinController(win);
    win.controller.initWin(initData);
    return win.controller;
}

CreateRecordingWinController(this, initData);