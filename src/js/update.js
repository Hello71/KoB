/*global $:false global:false*/
(function () {
"use strict";

var updateUnits = function (callback) {
        $.ajax({
            cache: true,
            data: {
                villageID: global.village
            },
            success: function (response) {
                global.data.units = response;
                callback();
            },
            url: "/units"
        });
    },
    updateVillages = function (callback) {
        $.ajax({
            success: function (data) {
                global.data.villages = data;

                var villageID = /villageID=(\d{1,5})/.exec(global.location.search);
                if (villageID !== null) {
                    global.village = villageID[1];
                } else if (typeof Object.keys !== "undefined") {
                    global.village = Object.keys(data)[0];
                } else {
                    $.each(data, function (i) {
                        global.village = i;
                        return false;
                    });
                }
                global.displayVillages(data);
                callback();
            },
            url: "/villages"
        });
    },
    updateVillage = function (force, callback, villageID) {
        var data = global.data,
            id,
            villageData = global.data.village,
            village;
        if (typeof villageID === "undefined") {
            id = global.village;
        } else {
            id = villageID;
        }
        village = villageData[id];
        // Use current version if update time is less than 1 minute
        if (!force && village && Date.now() - village.fetched < 60000) {
            global.setTimeout(callback, 0);
            return;
        }
        $.ajax({
            data: {
                villageID: id
            },
            success: function (response) {
                villageData[id] = response;
                villageData[id].fetched = Date.now();
                callback();
            },
            url: "/villageData"
        });
    },
    updateAllVillages = function (force, callback_) {
        var villageNum = 0,
            callback = function () {};
        if (typeof callback_ === "function") {
            callback = callback_;
        }
        $.each(global.data.villages, function (index, village) {
            villageNum++;
            updateVillage(force, function () {
                if (!(--villageNum)) {
                    callback();
                }
            }, index);
        });
    };
var firstUpdate = true;
global.update = function (force, callback) {
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
            global.display();
            if (typeof callback === "function") {
                callback();
            }
        };
    if (firstUpdate) {
        updateUnits(done);
        updateVillages(function () {
            updateAllVillages(true, done);
        });
    } else {
        updateVillage(force, function () {
            global.clearBuildings();
            finish();
        });
    }
    
    $("#loading").show();
};

}());
