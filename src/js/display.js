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
    
    $.each(window.data.village.buildings, function (index, buildingRow) {
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
            $($buildingRows[index][i]).append($("<span class='building'>").append(img).append(level).append(upgradeTime).hover(function () {
                $("#building-information").text("Level " + building.level + " " + building.type);
            }, function () {
                $("#building-information").text("");
            }));
        });
    });
};

window.display = function () {
    var village = window.data.village;
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

    $("#units > div").click(function () {
        $("#unit-training").show();
        var unitType = this.id.replace("-container", ""),
            unit = window.data.units[unitType],
            $unitTraining = $("#unit-training"),
            $unitAttributes = $unitTraining.find("#unit-attributes"),
            $unitAmount = $unitTraining.find("#unit-amount"),
            $unitResources = $unitTraining.find("#unit-resources"),
            time = unit.time,
            villageUnit,
            $minutesToTrain = $unitTraining.find("#minutes-to-train");

        $("#unit-type").text(unit.name.singular);
        $("#unit-description").text(unit.description);

        $.each(["attack", "carry", "defend", "hp", "morale", "siege", "speed"], function (index, prop) {
            $unitAttributes.find("#unit-" + prop).text(unit[prop]);
        });

        var villageUnit = window.data.village.units[unitType];
        $unitAmount.find("#unit-amount-current").text(villageUnit.current.toLocaleString());
        $unitAmount.find("#unit-amount-training").text(villageUnit.training.toLocaleString());

        $unitTraining.find("#unit-train-time").text(time);
        if (unit.time === 1) {
            $minutesToTrain.text("minute to train");
        } else {
            $minutesToTrain.text("minutes to train");
        }

        $.each(["food", "gold", "wood", "stone", "iron", "morale"], function (index, resource) {
            var production = unit.production[resource];
            if (production !== 0) {
                $unitResources.find("#unit-production-" + resource).text(production.toLocaleString());
            }
            if (resource !== "morale") {
                var cost = unit.cost[resource],
                    $cost = $unitResources.find("#unit-cost-" + resource);
                if (cost !== 0) {
                    $cost.text(cost.toLocaleString());
                } else {
                    $cost.text("");
                }
            }
        });
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
        window.update();
    });
};

window.clearBuildings = function () {
    $(".building").remove();
};
}());
