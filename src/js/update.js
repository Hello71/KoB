/*global $:false */
(function () {
"use strict";

var updateUnits = function (callback) {
        $.ajax({
            data: {
                villageID: window.village
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
                window.data.villages = data;
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
                window.data.village[window.village] = response;
                callback();
            },
            url: "/villageData"
        });
    };
var firstUpdate = true;
window.update = function (callback) {
    var halfFinished = false,
        done = function () {
            if (halfFinished) {
                firstUpdate = false;
                $(document).ready(function () {
                    finish();
                });
            } else {
                halfFinished = true;
            }
        },
        finish = function () {
            $("#loading").hide();
            window.display();
            if (typeof callback === "function") {
                callback();
            }
        };
    if (firstUpdate) {
        updateUnits(done);
        updateVillages(function () {
            updateVillage(done);
        });
    } else {
        updateVillage(function () {
            window.clearBuildings();
            finish();
        });
    }
    
    $("#loading").show();
};

}());
