(function () {
"use strict";


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
        console.log(building.upgradeTime);
        updateInterval = window.setInterval(update, 1000);
        update();
    }
    return $("<span class='building'>").append(img).append(level).append(upgradeTime).data("building", building).hover(function (e) {
        var building = $(this).data("building");
        var type = e.type.toLowerCase();
        if (type === "mouseenter") {
            $("#building-information").text("Level " + building.level + " " + building.type);
        } else if (type === "mouseleave") {
            $("#building-information").text("");
        } else {
            throw new Error("not a hover event");
        }
    });
};

window.display = function (data) {
    var $buildingRows = [[], [], [], [], [], [], [], [], []];
    $("#buildings > tbody > tr").each(function (index, row) {
        $buildingRows[index] = $(row).find("td > span");
    });
    
    $.each(data.buildings, function (index, buildingRow) {
        $.each(buildingRow, function (i, building) {
            $($buildingRows[index][i]).replaceWith(makeBuilding(building));
        });
    });
    $("#queues").html(data.queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace("\n", "<br>"));

    $.each(data.units, function (type, number) {
        $("#" + type).text(number);
    });

    var r = data.resources,
        rr = r.rates;
    $("#iron").text(r.iron + " @ " + rr.iron + "/hour");
    $("#wood").text(r.wood + " @ " + rr.wood + "/hour");
    $("#stone").text(r.stone + " @ " + rr.stone + "/hour");
    $("#gold").text(r.gold + " @ " + rr.gold + "/hour");
    $("#food").text(r.food + " @ " + rr.food + "/hour");
    $("#morale").text(r.morale + " @ " + rr.morale + "/hour");
};
}());
