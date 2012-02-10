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
    updateVillage = function (callback, villageID) {
        var data = window.data,
            id,
            villageData = window.data.village,
            village;
        if (typeof villageID === "undefined") {
            id = window.village;
        } else {
            id = villageID;
        }
        village = villageData[id];
        $.ajax({
            data: {
                villageID: window.village
            },
            success: function (response) {
                villageData[id] = response;
                villageData[id].fetched = Date.now();
                callback();
            },
            url: "/villageData"
        });
    },
    updateAllVillages = function (callback_) {
        var villageNum = 0,
            callback = function () {};
        if (typeof callback_ === "function") {
            callback = callback_;
        }
        $.each(window.data.villages, function (index, village) {
            villageNum++;
            window.village = index;
            updateVillage(function () {
                if (!(--villageNum)) {
                    callback();
                }
            });
        });
    };
var firstUpdate = true;
window.update = function (force, callback) {
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
            updateAllVillages(done);
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
