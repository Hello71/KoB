"use strict";
var data = "&Resources=634101.308333:140699.308333:685585.975:426232.411667:803160.744167:525000&ResourceRates=7210:7210:8010:-1738:-1111:22524&Map=36:1444:51&Line_1=1:1:2082598:102:5:1:Y:1:Farm:0&Line_2=1:2:2082598:102:5:1:Y:1:Farm:0&Line_3=1:3:2082598:102:5:1:Y:1:Farm:0&Line_4=1:5:2082598:101:4:7:Y:7:Warehouse:0&Line_5=1:6:2082598:105:3:1:Y:1:Sawmill:0&Line_6=1:7:2082598:105:3:1:Y:1:Sawmill:0&Line_7=1:8:2082598:106:9:1:Y:1:Stone Quarry:0&Line_8=1:9:2082598:106:9:1:Y:1:Stone Quarry:0&Line_9=2:1:2082598:102:5:1:Y:1:Farm:0&Line_10=2:2:2082598:102:5:1:Y:1:Farm:0&Line_11=2:5:2082598:101:4:7:Y:7:Warehouse:0&Line_12=2:6:2082598:105:3:1:Y:1:Sawmill:0&Line_13=2:7:2082598:105:3:1:Y:1:Sawmill:0&Line_14=2:8:2082598:106:9:1:Y:1:Stone Quarry:0&Line_15=2:9:2082598:106:9:1:Y:1:Stone Quarry:0&Line_16=3:1:2082598:102:5:1:Y:1:Farm:0&Line_17=3:3:2082598:102:5:1:Y:1:Farm:0&Line_18=3:7:2082598:106:9:1:Y:1:Stone Quarry:0&Line_19=3:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_20=3:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_21=4:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_22=4:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_23=5:1:2082598:101:4:7:Y:7:Warehouse:0&Line_24=5:2:2082598:101:4:7:Y:7:Warehouse:0&Line_25=5:5:2082598:114:11:11:Y:11:Town Square:0&Line_26=5:8:2082598:101:4:6:Y:6:Warehouse:0&Line_27=5:9:2082598:101:4:7:Y:7:Warehouse:0&Line_28=6:7:2082598:112:8:10:Y:10:Stable:0&Line_29=6:8:2082598:101:4:6:Y:6:Warehouse:0&Line_30=6:9:2082598:101:4:7:Y:7:Warehouse:0&Line_31=7:1:2082598:103:2:1:Y:1:Market:0&Line_32=7:3:2082598:103:2:1:Y:1:Market:0&Line_33=7:6:2082598:112:8:10:N:10:Stable:4148&Line_34=7:7:2082598:111:7:5:Y:5:Barracks:0&Line_35=7:8:2082598:112:8:11:Y:11:Stable:0&Line_36=7:9:2082598:111:7:5:Y:5:Barracks:0&Line_37=8:1:2082598:103:2:1:Y:1:Market:0&Line_38=8:2:2082598:103:2:1:Y:1:Market:0&Line_39=8:5:2082598:101:4:7:Y:7:Warehouse:0&Line_40=8:6:2082598:115:12:2:Y:2:Magic Carpet Factory:0&Line_41=8:7:2082598:112:8:11:Y:11:Stable:0&Line_42=8:8:2082598:112:8:11:Y:11:Stable:0&Line_43=8:9:2082598:111:7:5:Y:5:Barracks:0&Line_44=9:1:2082598:103:2:1:Y:1:Market:0&Line_45=9:2:2082598:103:2:1:Y:1:Market:0&Line_46=9:3:2082598:103:2:1:Y:1:Market:0&Line_47=9:5:2082598:101:4:7:Y:7:Warehouse:0&Line_48=9:6:2082598:116:13:3:Y:3:Operations Center:0&Line_49=9:7:2082598:112:8:11:Y:11:Stable:0&Line_50=9:8:2082598:112:8:11:Y:11:Stable:0&Line_51=9:9:2082598:111:7:5:Y:5:Barracks:0&Troops=1-1200-0:2-900-0:3-1000-0:4-900-0:5-0-0:6-1200-0:7-635-0:8-3-0:9-96-0:10-100-0:11-0-0:12-9-0:13-0-0:14-0-0:15-1-0:16-0-0:17-258-123:18-0-0:19-0-0:20-4-0:21-0-0&Queue=Buildings Queued:\nUpgrade Stable @ 6,7 to 11\n\n&quad=NW&duh=1 ";
var fields = data.substring(1).split("&");
var resources = fields.shift().substring(10).split(":"),
    resourceRates = fields.shift().substring(15).split(":");
var resources = {
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
    rawBuildings = [[], [], [], [], [], [], [], [], []],
    units = [],
    queue = "";

function makeBuilding(building) {
    if (typeof building === "undefined") {
        return $("<span class=\"empty-building\">");
    }
    var img = $("<img>").attr("src", "images/buildings/" + building.type + ".png"),
        levelContainer = $("<span class='building-level-container'>"),
        level = $("<span>").addClass("building-level").text(building.level).appendTo(levelContainer);

    return $("<span class='building'>").append(img).append(levelContainer).data("building", building);
}

while (fields[0].substring(0, 5) === "Line_") {
    let building = fields.shift().replace(/Line_\d{1,2}=/, "").split(":");
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
    let o = {
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
    rawBuildings[o.horizontal][o.vertical] = o;
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

$(document).ready(function () {

    var $buildingRows = [[], [], [], [], [], [], [], [], []];
    $("#buildings > tbody > tr").each(function (index, row) {
        $buildingRows[index] = $(row).find("td > span");
    });
    
    $.each(rawBuildings, function (index, buildingRow) {
        $.each(buildingRow, function (i, building) {
            $($buildingRows[index][i]).replaceWith(makeBuilding(building));
        });
    });
    $("#queues").html(queue.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace("\n", "<br>"));

    $.each(units, function (type, number) {
        $("#" + type).text(number);
    });
    $(".building").hover(function (e) {
        var building = $(this).data("building");
        $("#building-information").text("Level " + building.level + " " + building.type);
    }, function (e) {
        $("#building-information").text("");
    });

    var r = resources,
        rr = resources.rates;
    $("#iron").text(r.iron + " @ " + rr.iron + "/hour");
    $("#wood").text(r.wood + " @ " + rr.wood + "/hour");
    $("#stone").text(r.stone + " @ " + rr.stone + "/hour");
    $("#gold").text(r.gold + " @ " + rr.gold + "/hour");
    $("#food").text(r.food + " @ " + rr.food + "/hour");
    $("#morale").text(r.morale + " @ " + rr.morale + "/hour");
});
