{
    var itru_isLogin = false;
    var itru_serviceUrl = "http://121.41.49.137:8080/api/";
    var itru_accessToken = "";
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
    var itru_encrypt = function (text) {
        var keyHex = CryptoJS.enc.Utf8.parse(itru_encryptKey);
        var encrypted = CryptoJS.DES.encrypt(text, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.ZeroPadding
        });
        return encrypted.toString();
    };
    var itru_builUrl = function (path, params) {
        var url = itru_serviceUrl + path + "?callback=JSON_CALLBACK";
        for (var item in params)
            url += "&" + item + "=" + encodeURIComponent(params[item]);
        return url;
    };
}