/*global $:false */
(function () {
"use strict";

var _update = function (villageID, callback) {
    var documentReady = false;
    $(document).ready(function () {
        documentReady = true;
    });
    
    if (document.cookie.indexOf("SESSIONID") === -1) {
        $("#login").show();
        return;
    }
    
    $.ajax({
        cache: false,
        data: {
            villageID: villageID
        },
        dataType: "text",
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                $("#login").show();
            }
        },
        success: function (data, textStatus, jqXHR) {
            if (data.length === 0) {
                $("#no-data").show();
                return;
            }
            window.rawData = data;
            window.data = window.parse(window.rawData);
            if (documentReady) {
                window.display(window.data);
                callback();
            } else {
                $(document).ready(function () {
                    window.display(window.data);
                    callback(window.data, window.rawData);
                });
            }
        },
        url: "/villageData"
    });
};

window.updateVillages = function (callback) {
    $.ajax({
        cache: false,
        dataType: "json",
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                $("#login").show();
            }
        },
        success: function (data, textStatus, jqXHR) {
            if (Object.keys(data).length < 1) {
                $("#no-data").show();
                return;
            }
            window.villages = data;
            var village = /activeVillage=([0-9]*)/.exec(document.cookie);
            if (village === null) {
                if (typeof Object.keys !== "undefined") {
                    window.village = Object.keys(villages)[0];
                }
                $.each(villages, function (i, v) {
                    window.village = i;
                    return false;
                });
                document.cookie = "activeVillage=" + window.village + ";expires=Wed, 01 Jan 3000 00:00:00 GMT";
            } else {
                window.village = village[1];
            }
            window.displayVillages(villages);
            callback(window.village);
        },
        url: "/villages"
    });
};

window.update = function (callback) {
    _update(window.village, function () {
        $("#loading").hide();
        if (typeof callback !== "undefined") {
            callback();
        }
    });
    $("#loading").show();
};

}());
