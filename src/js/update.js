/*global $:false */
(function () {
"use strict";

$.ajaxSetup({
    cache: false,
    dataType: "json"
});
$(document).ajaxComplete(function (e, jqXHR) {
    if (jqXHR.status === 401) {
        $("#login").show();
        e.stopPropagation();
    } else if (jqXHR.responseText === "") {
        $("#no-data").show();
        e.stopPropagation();
    }
});
var _update = function (villageID, callback) {
    var documentReady = false;
    $(document).ready(function () {
        documentReady = true;
    });

    var halfFinished = false,
        finish = function () {
            if (!halfFinished) {
                halfFinished = true;
            } else {
                if (documentReady) {
                    window.clearBuildings();
                    window.display();
                    callback(true);
                } else {
                    $(document).ready(function () {
                        window.display();
                        callback(true);
                    });
                }
            }
        };
    $.ajax({
        data: {
            villageID: villageID
        },
        success: function (response) {
            window.data = response;
            finish();
        },
        url: "/villageData"
    });
    $.ajax({
        data: {
            villageID: villageID
        },
        success: function (response) {
            window.unitData = response;
            finish();
        },
        url: "/units"
    });
};

window.updateVillages = function (callback) {
    $.ajax({
        success: function (data) {
            if (Object.keys(data).length < 1) {
                $("#no-data").show();
                return;
            }
            window.villages = data;
            var village = /activeVillage=([0-9]*)/.exec(document.cookie);
            if (village === null) {
                if (typeof Object.keys !== "undefined") {
                    village = Object.keys(window.villages)[0];
                }
                $.each(window.villages, function (i) {
                    village = i;
                    return false;
                });
                document.cookie = "activeVillage=" + village + ";expires=Wed, 01 Jan 3000 00:00:00 GMT";
            } else {
                village = village[1];
            }
            window.village = village;
            window.displayVillages(window.villages);
            callback(village);
        },
        url: "/villages"
    });
};

window.update = function (callback) {
    _update(window.village, function (success) {
        if (success) {
            $("#loading").hide();
        }
        if (typeof callback !== "undefined") {
            callback.apply(this, arguments);
        }
    });
    $("#loading").show();
};

}());
