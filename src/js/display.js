(function () {
"use strict";

/*global $:false global:false*/

var pad = function (strnum, amount) {
    if (typeof strnum === "string") {
        strnum = strnum.toString();
    }
    amount = amount - strnum.length;
    while (amount--) {
        strnum = "0" + strnum;
    }
    return strnum;
},
    displayBuildings = function () {
        var $buildingRows = [[], [], [], [], [], [], [], [], []];
        $("#buildings > tbody > tr").each(function (index, row) {
            row = $(row).find("td");
            $buildingRows[index] = row;
        });
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                $($buildingRows[i][j]).append($("<a class=\"empty-building\" href='/build.cfm?x=" + (j + 1) + "&y=" + (i + 1) + "&villageID=" + encodeURIComponent(global.village) + "' target='_top'>"));
            }
        }
        $.each(global.data.village[global.village].buildings, function (index, buildingRow) {
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
                                global.clearInterval(updateInterval);
                                global.update(true);
                                $("#buildings-done-village").text(global.data.villages[global.village]);
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
                $($buildingRows[index][i]).append($("<span class='building'>").append(img).append(level).append(upgradeTime).hover(function () {
                    $("#building-information").text("Level " + building.level + " " + building.type);
                }, function () {
                    $("#building-information").html("&nbsp;");
                })).data("href", "/mapDetail.cfm?x=" + encodeURIComponent(building.horizontal) + "&y=" + encodeURIComponent(building.vertical) + "&villageID=" + encodeURIComponent(global.village));
            });
        });
        $(".building").click(function () {
            top.location.href = $(this).data("href");
        });
    };

global.displayUnits = function () {
    var village = global.data.village[global.village];
    $("#units .ui-state-highlight").removeClass("ui-state-highlight");
    $.each(village.units, function (type, amount) {
        $("#" + type).text(amount.current.toLocaleString());
        if (amount.training > 0) {
            $("#" + type + "-container").addClass("ui-state-highlight");
        }
    });
};
global.display = function () {
    $("body").hide();
    var village = global.data.village[global.village];
    $("#queues").html(village.queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\r\n]/g, "<br>"));

    displayBuildings();
    
    global.displayUnits();
    global.displayResources();
};
global.displayResources = function () {
    var village = global.data.village[global.village];
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

global.displayVillages = function () {
    var villageList = $("<ul>"),
        villages = $("#villages").append(villageList),
        activeVillage,
        i = -1;
    $.each(global.data.villages, function (index, value) {
        i++;
        if (global.village === index) {
            activeVillage = i;
        }
        $("<li>").append($("<a>").attr("href", "#village-" + index).text(value)).appendTo(villageList);
        villages.append($("<div>").attr("id", "village-" + index));
    });
    $("#villages").tabs({
        select: function (e, ui) {
            global.village = $(ui.tab).attr("href").replace("#village-", "");
            global.update(false);
        },
        selected: activeVillage
    });
};

global.clearBuildings = function () {
    $(".building, .empty-building").remove();
};
}());
