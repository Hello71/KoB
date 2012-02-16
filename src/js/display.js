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
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            $($buildingRows[i][j]).append($("<a class=\"empty-building\" href='/build.cfm?x=" + (j + 1) + "&y=" + (i + 1) + "&villageID=" + encodeURIComponent(window.village) + "' target='_top'>"));
        }
    }
    $.each(window.data.village[window.village].buildings, function (index, buildingRow) {
        $.each(buildingRow, function (i, building) {
            if (building === null) {
                return;
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
                            $("#buildings-done").dialog("open");
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
            $($buildingRows[index][i]).find(".empty-building").remove();
            $($buildingRows[index][i]).append($("<a class='building' href='/mapDetail.cfm?x=" + encodeURIComponent(building.horizontal) + "&y=" + encodeURIComponent(building.vertical) + "&villageID=" + encodeURIComponent(window.village) + "' target='_top'>").append(img).append(level).append(upgradeTime).hover(function () {
                $("#building-information").text("Level " + building.level + " " + building.type);
            }, function () {
                $("#building-information").text("");
            }));
        });
    });
};

window.display = function () {
    $("body").hide();
    var village = window.data.village[window.village];
    $("#queues").html(village.queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\r\n]/g, "<br>"));

    displayBuildings();
    $("#units .ui-state-highlight").removeClass("ui-state-highlight");
    $.each(village.units, function (type, amount) {
        $("#" + type).text(amount.current.toLocaleString());
        if (amount.training > 0) {
            $("#" + type + "-container").addClass("ui-state-highlight");
        }
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
    $("body").show();
};

window.displayVillages = function () {
    var villageList = $("<ul>"),
        villages = $("#villages").append(villageList),
        activeVillage,
        i = -1;
    $.each(window.data.villages, function (index, value) {
        i++;
        if (window.village === index) {
            activeVillage = i;
        }
        $("<li>").append($("<a>").attr("href", "#village-" + index).text(value)).appendTo(villageList);
        villages.append($("<div>").attr("id", "village-" + index));
    });
    $("#villages").tabs({
        select: function (e, ui) {
            window.village = $(ui.tab).attr("href").replace("#village-", "");
            window.update(false);
        },
        selected: activeVillage
    });
};

window.clearBuildings = function () {
    $(".building, .empty-building").remove();
};
}());
