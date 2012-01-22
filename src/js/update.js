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

var getUnits = function (callback) {
        $.ajax({
            data: {
                villageID: villageID
            },
            success: function (response) {
                window.data.units = response;
                callback();
            },
            url: "/units"
        });
    },
    updateVillages = function (callback) {
        $.ajax({
            success: function (data) {
                window.villages = data;
                if (typeof Object.keys !== "undefined") {
                    window.village = Object.keys(data)[0];
                }
                $.each(data, function (i) {
                    window.village = i;
                    return false;
                });
                window.displayVillages(data);
                callback();
            },
            url: "/villages"
        });
    },
    updateVillage = function (callback) {
        $.ajax({
            data: {
                villageID: window.village
            },
            success: function (response) {
                window.data.village = response;
                done();
            },
            url: "/villageData"
        });
    };
var firstUpdate = true;
window.update = function (callback) {
    var halfFinished = false,
        done = function () {
            if (halfFinished) {
                if (!firstUpdate) {
                    window.clearBuildings();
                } else {
                    firstUpdate = false;
                }
                $(document).ready(function () {
                    window.display();
                    if (success) {
                        $("#loading").hide();
                    }
                    if (typeof callback !== "undefined") {
                        callback();
                    }
                });
            } else {
                halfFinished = true;
            }
        };
    if (firstUpdate) {
        updateUnits(done);
        updateVillages(function () {
            updateVillage(done);
        });
    }
    
    $("#loading").show();
};

}());
