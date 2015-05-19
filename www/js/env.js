{
    var itru_isLogin = false;
    var itru_serviceUrl = "http://test.itrustoor.com:8080/api/";
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
}