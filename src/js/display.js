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
}
window.displayBuildings = function () {
    var $buildingRows = [[], [], [], [], [], [], [], [], []];
    $("#buildings > tbody > tr").each(function (index, row) {
        row = $(row).find("td");
        $buildingRows[index] = row;
    });
    
    $.each(window.data.village[window.village].buildings, function (index, buildingRow) {
        $.each(buildingRow, function (i, building) {
            if (typeof building === "undefined" || building === null) {
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
                            window.update(true);
                            $("#buildings-done-village").text(window.data.villages[window.village]);
                            $("#buildings-done").dialog();
                        } else {
                            upTime--;
                            var hours = pad(Math.floor(upTime / 3600).toString(), 2),
                                minutes = pad(Math.floor((upTime % 3600) / 60).toString(), 2),
                                seconds = pad(Math.floor(upTime % 60).toString(), 2);
                            upgradeTimeElm.text(hours + ":" + minutes + ":" + seconds);
                        }
                    };
                updateInterval = window.setInterval(update, 1000);
                update();
            }
            $($buildingRows[index][i]).append($("<span class='building'>").append(img).append(level).append(upgradeTime).hover(function () {
                $("#building-information").text("Level " + building.level + " " + building.type);
            }, function () {
                $("#building-information").text("");
            }));
        });
    });
};

window.display = function () {
    var village = window.data.village[window.village];
    $("#queues").html(village.queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\r\n]/g, "<br>"));

    displayBuildings();
    $.each(village.units, function (type, amount) {
        $("#" + type).text(amount.current.toLocaleString());
    });

    var r = village.resources,
        rr = r.rates;
    $.each(r, function (i, v) {
        if (i === "rates") {
            return;
        }
        $("#" + i).text(v.toLocaleString());
        $("#" + i + "-rate").text(rr[i].toLocaleString() + "/hour");
    });

};

window.displayVillages = function () {
    var villageCombo = $("#villages");
    villageCombo.html("");
    $.each(window.data.villages, function (index, value) {
        $("<option>").attr("value", index).text(value).appendTo(villageCombo);
    });
    villageCombo.change(function () {
        window.village = $(this).attr("value");
        window.update(false);
    });
};

window.clearBuildings = function () {
    $(".building").remove();
};
}());
