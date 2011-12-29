(function () {
"use strict";

/*global $:false*/

var pad = function (strnum, amount) {
    if (typeof strnum === "string") {
        strnum = strnum.toString();
    }
    amount = amount - strnum.length;
    while (amount--) {
        strnum = "0" + strnum;
    }
    return strnum;
};
var makeBuilding = function (building) {
    if (typeof building === "undefined") {
        return $("<span class=\"empty-building\">");
    }
    var img = $("<img>").attr("src", "images/buildings/" + building.type + ".png"),
        level = $("<span class='building-level-container'>").append($("<span>").addClass("building-level").text(building.level)),
        upgradeTime = $("<span class='building-upgrade-time-container'>");
    if (building.upgradeTime > 0) {
        var upgradeTimeElm = $("<span class='building-upgrade-time'>").appendTo(upgradeTime),
            upTime = building.upgradeTime,
            updateInterval = 0,
            update = function () {
            if (upTime === 0) {
                window.clearInterval(updateInterval);
                window.update();
                return;
            }
            upTime--;
            var hours = pad(Math.floor(upTime / 3600).toString(), 2),
                minutes = pad(Math.floor((upTime % 3600) / 60).toString(), 2),
                seconds = pad(Math.floor(upTime % 60).toString(), 2);
            upgradeTimeElm.text(hours + ":" + minutes + ":" + seconds);
        };
        updateInterval = window.setInterval(update, 1000);
        update();
    }
    return $("<span class='building'>").append(img).append(level).append(upgradeTime).data("building", building);
};

window.display = function (data) {
    var $buildingRows = [[], [], [], [], [], [], [], [], []];
    $("#buildings > tbody > tr").each(function (index, row) {
        var row = $(row).find("td");
        row.find("span").remove();
        $buildingRows[index] = row;
    });
    
    $.each(data.buildings, function (index, buildingRow) {
        $.each(buildingRow, function (i, building) {
            $($buildingRows[index][i]).append(makeBuilding(building));
        });
    });
    $("#queues").html(data.queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace("\n", "<br>"));

    $.each(data.units, function (type, number) {
        $("#" + type).text(number);
    });

    var r = data.resources,
        rr = r.rates;
    $.each(r, function (i, v) {
        $("#" + i).text(v.toLocaleString() + " @ " + rr[i].toLocaleString() + "/hour");
    });
};
}());

window.displayVillages = function (villages) {
    var villageCombo = $("#villages");
    villageCombo.html("");
    $.each(villages, function (index, value) {
        $("<option>").attr("value", index).text(value).appendTo(villageCombo);
    });
};
