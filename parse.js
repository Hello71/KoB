"use strict";

function makeBuilding(building) {
    if (typeof building === "undefined") {
        return $("<span class=\"empty-building\">");
    }
    var img = $("<img>").attr("src", "images/buildings/" + building.type + ".png"),
        levelContainer = $("<span class='building-level-container'>"),
        level = $("<span>").addClass("building-level").text(building.level).appendTo(levelContainer);

    return $("<span class='building'>").append(img).append(levelContainer).data("building", building);
}


function parse(data) {
    var fields = data.substring(1).split("&"),
        resources = fields.shift().substring(10).split(":"),
        resourceRates = fields.shift().substring(15).split(":"),
        resources = {
            iron: Math.round(parseInt(resources[0], 10)),
            wood: Math.round(parseInt(resources[1], 10)),
            stone: Math.round(parseInt(resources[2], 10)),
            gold: Math.round(parseInt(resources[3], 10)),
            food: Math.round(parseInt(resources[4], 10)),
            morale: Math.round(parseInt(resources[5], 10)),
            rates: {
                iron: parseInt(resourceRates[0], 10),
                wood: parseInt(resourceRates[1], 10),
                stone: parseInt(resourceRates[2], 10),
                gold: parseInt(resourceRates[3], 10),
                food: parseInt(resourceRates[4], 10),
                morale: parseInt(resourceRates[5], 10)
            }
        },
        map = fields.shift(),
        buildings = [[], [], [], [], [], [], [], [], []],
        units = [],
        queue = "";

    while (fields[0].substring(0, 5) === "Line_") {
        var building = fields.shift().replace(/Line_\d{1,2}=/, "").split(":");
        if (building[6] === "Y") {
            building[6] = false;
        } else if (building[6] === "N") {
            building[6] = true;
        } else {
            throw new Error("building not upgrading and not upgrading?");
        }
        if (building[5] !== building[7]) {
            throw new Error("levels do not match up");
        }
        var o = {
            vertical: parseInt(building[0], 10) - 1,
            horizontal: parseInt(building[1], 10) - 1,
            player: parseInt(building[2], 10),
            level: parseInt(building[5], 10),
            upgrading: building[6],
            type: building[8],
            upgradeTime: parseInt(building[9], 10)
        };
        if (o.vertical > 10 || o.horizontal > 10 || o.level > 11) {
            throw new Error("building parser broken");
        }
        buildings[o.horizontal][o.vertical] = o;
    }

    units = fields.shift().substring(8).split(":").map(function (str) {
        return str.split("-")[1];
    });

    units = {
        farmers: parseInt(units[0], 10),
        lumberjacks: parseInt(units[1], 10),
        "stone-masons": parseInt(units[2], 10),
        "iron-miners": parseInt(units[3], 10),
        peasants: parseInt(units[4], 10),
        merchants: parseInt(units[5], 10),
        swordsmen: parseInt(units[6], 10),
        archers: parseInt(units[7], 10),
        janissaries: parseInt(units[8], 10),
        paladins: parseInt(units[9], 10),
        mameluks: parseInt(units[10], 10),
        spies: parseInt(units[11], 10),
        emissaries: parseInt(units[12], 10),
        catapults: parseInt(units[13], 10),
        sultans: parseInt(units[14], 10),
        villagers: parseInt(units[15], 10),
        elephants: parseInt(units[16], 10),
        chariots: parseInt(units[17], 10),
        mongols: parseInt(units[18], 10),
        "camel-riders": parseInt(units[19], 10),
        hussars: parseInt(units[20], 10)
    };

    queue = fields.shift().substring(6);
    return {
        buildings: buildings,
        units: units,
        resources: resources,
        map: map,
        queue: queue
    };
}

function display(data) {
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
    $(".building").hover(function (e) {
        var building = $(this).data("building");
        $("#building-information").text("Level " + building.level + " " + building.type);
    }, function (e) {
        $("#building-information").text("");
    });

    var r = data.resources,
        rr = r.rates;
    $("#iron").text(r.iron + " @ " + rr.iron + "/hour");
    $("#wood").text(r.wood + " @ " + rr.wood + "/hour");
    $("#stone").text(r.stone + " @ " + rr.stone + "/hour");
    $("#gold").text(r.gold + " @ " + rr.gold + "/hour");
    $("#food").text(r.food + " @ " + rr.food + "/hour");
    $("#morale").text(r.morale + " @ " + rr.morale + "/hour");
}
