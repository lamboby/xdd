{
    var itru_isLogin = false;
    var itru_serviceUrl = "http://svr.itrustoor.com:8080/api/";
    var itru_accessToken = "";
    var itru_lastGetTokenTime = null;
    var itru_tokenExpires = 7200;
    var itru_encryptKey = "itrustor";
    var itru_dbName = "itrustor";
    var itru_dbVersion = "1.0";
    var itru_dbSize = 1000000;
    var itru_db = null;
    var itru_userName = "";
    var itru_userPicture = "";
    var itru_openId = "0";
    var itru_ossKey = "";
    var itru_ossSecret = "";
    var itru_ossBucket = "";
    var itru_isTest = false;
    var itru_reload = false;
	var itru_force=0;
	var itru_temp=false;//测试用,以后删除

    var itru_loginToken = function (token) {
        if (token == -1)
            window.localStorage.removeItem("LOGIN_TOKEN");
        else if (token)
            window.localStorage.setItem("LOGIN_TOKEN", token);
        return window.localStorage.getItem("LOGIN_TOKEN");
    };
    var itru_familyId = function (familyId) {
        if (familyId == -1)
            window.localStorage.removeItem("FAMILYID");
        else if (familyId)
            window.localStorage.setItem("FAMILYID", familyId);
        return window.localStorage.getItem("FAMILYID");
    };
    var itru_userId = function (userId) {
        if (userId == -1)
            window.localStorage.removeItem("USERID");
        else if (userId)
            window.localStorage.setItem("USERID", userId);
        return window.localStorage.getItem("USERID");
    };
    var itru_isPrimary = function (isPrimary) {
        if (isPrimary == -1)
            window.localStorage.removeItem("ISPRIMARY");
        else if (isPrimary != null && isPrimary != 'undefined')
            window.localStorage.setItem("ISPRIMARY", isPrimary);
        var val = window.localStorage.getItem("ISPRIMARY");
        return val != null && val === 'true';
    };
    var itru_supportDatePicker = function (isSupport) {
        if (isSupport != null && isSupport != 'undefined')
            window.localStorage.setItem("SUPPORTDATEPICKER", isSupport);
        var val = window.localStorage.getItem("SUPPORTDATEPICKER");
        return val != null && val === 'true';
    };
    var itru_isDbInit = function (isInit) {
        if (isInit == -1)
            window.localStorage.removeItem("ISDBINIT");
        else if (isInit != null && isInit != 'undefined')
            window.localStorage.setItem("ISDBINIT", isInit);
        var val = window.localStorage.getItem("ISDBINIT");
        return val != null && val === 'true';
    };
    var itru_ringtone = function (path) {
        if (path == -1)
            window.localStorage.removeItem("RINGTONEPATH");
        else if (path)
            window.localStorage.setItem("RINGTONEPATH", path);
        return window.localStorage.getItem("RINGTONEPATH");
    };
    var itru_ringtones = [
        new Object({ "name": "可爱宝宝", "path": "lovely_baby_1s.mp3" }),
        new Object({ "name": "舒缓", "path": "slow_4s.mp3" }),
        new Object({ "name": "儿童笑声", "path": "baby_smile_5s.mp3" }),
        new Object({ "name": "你好", "path": "hello_9s.mp3" }),
        new Object({ "name": "顽皮猫王", "path": "cat_11s.mp3" })
    ];
}