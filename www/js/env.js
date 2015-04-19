{
    var itru_isLogin = false;
    var itru_serviceUrl = "http://121.41.49.137:8080/api/";
    var itru_accessToken = "";
    var itru_lastGetTokenTime = null;
    var itru_tokenExpires = 7200;
    var itru_encryptKey = "itrustor";

    var itru_loginToken = function (token) {
        if (token)
            window.localStorage.setItem("LOGIN_TOKEN", token);
        return window.localStorage.getItem("LOGIN_TOKEN");
    };
    var itru_familyId = function (familyId) {
        if (familyId)
            window.localStorage.setItem("FAMILYID", familyId);
        return window.localStorage.getItem("FAMILYID");
    };
    var itru_userId = function (userId) {
        if (userId)
            window.localStorage.setItem("USERID", userId);
        return window.localStorage.getItem("USERID");
    };
}