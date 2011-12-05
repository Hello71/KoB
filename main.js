"use strict";
var data = "&Resources=450566.202778:98664.2027778:157708.202778:777887.656111:846247.775278:525000&ResourceRates=7210:7210:7210:-11606:-9233:22423&Map=36:1444:50&Line_1=1:1:2082598:102:5:1:Y:1:Farm:0&Line_2=1:2:2082598:102:5:1:Y:1:Farm:0&Line_3=1:3:2082598:102:5:1:Y:1:Farm:0&Line_4=1:5:2082598:101:4:7:Y:7:Warehouse:0&Line_5=1:6:2082598:105:3:1:Y:1:Sawmill:0&Line_6=1:7:2082598:105:3:1:Y:1:Sawmill:0&Line_7=1:8:2082598:106:9:1:Y:1:Stone Quarry:0&Line_8=1:9:2082598:106:9:1:Y:1:Stone Quarry:0&Line_9=2:1:2082598:102:5:1:Y:1:Farm:0&Line_10=2:2:2082598:102:5:1:Y:1:Farm:0&Line_11=2:5:2082598:101:4:7:Y:7:Warehouse:0&Line_12=2:6:2082598:105:3:1:Y:1:Sawmill:0&Line_13=2:7:2082598:105:3:1:Y:1:Sawmill:0&Line_14=2:8:2082598:106:9:1:Y:1:Stone Quarry:0&Line_15=2:9:2082598:106:9:1:Y:1:Stone Quarry:0&Line_16=3:1:2082598:102:5:1:Y:1:Farm:0&Line_17=3:3:2082598:102:5:1:Y:1:Farm:0&Line_18=3:7:2082598:106:9:1:Y:1:Stone Quarry:0&Line_19=3:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_20=3:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_21=4:8:2082598:104:6:1:Y:1:Iron Mine:0&Line_22=4:9:2082598:104:6:1:Y:1:Iron Mine:0&Line_23=5:1:2082598:101:4:7:Y:7:Warehouse:0&Line_24=5:2:2082598:101:4:7:Y:7:Warehouse:0&Line_25=5:5:2082598:114:11:11:Y:11:Town Square:0&Line_26=5:8:2082598:101:4:6:Y:6:Warehouse:0&Line_27=5:9:2082598:101:4:7:Y:7:Warehouse:0&Line_28=6:7:2082598:112:8:9:N:9:Stable:20926&Line_29=6:8:2082598:101:4:6:Y:6:Warehouse:0&Line_30=6:9:2082598:101:4:7:Y:7:Warehouse:0&Line_31=7:1:2082598:103:2:1:Y:1:Market:0&Line_32=7:3:2082598:103:2:1:Y:1:Market:0&Line_33=7:7:2082598:111:7:5:Y:5:Barracks:0&Line_34=7:8:2082598:112:8:11:Y:11:Stable:0&Line_35=7:9:2082598:111:7:5:Y:5:Barracks:0&Line_36=8:1:2082598:103:2:1:Y:1:Market:0&Line_37=8:2:2082598:103:2:1:Y:1:Market:0&Line_38=8:5:2082598:101:4:7:Y:7:Warehouse:0&Line_39=8:6:2082598:115:12:2:Y:2:Magic Carpet Factory:0&Line_40=8:7:2082598:112:8:11:Y:11:Stable:0&Line_41=8:8:2082598:112:8:11:Y:11:Stable:0&Line_42=8:9:2082598:111:7:5:Y:5:Barracks:0&Line_43=9:1:2082598:103:2:1:Y:1:Market:0&Line_44=9:2:2082598:103:2:1:Y:1:Market:0&Line_45=9:3:2082598:103:2:1:Y:1:Market:0&Line_46=9:5:2082598:101:4:7:Y:7:Warehouse:0&Line_47=9:6:2082598:116:13:3:Y:3:Operations Center:0&Line_48=9:7:2082598:112:8:11:Y:11:Stable:0&Line_49=9:8:2082598:112:8:11:Y:11:Stable:0&Line_50=9:9:2082598:111:7:5:Y:5:Barracks:0&Troops=1-1200-0:2-900-0:3-900-0:4-900-0:5-0-0:6-1200-0:7-80-0:8-0-0:9-90-0:10-100-0:11-0-0:12-9-0:13-0-0:14-0-0:15-0-0:16-0-0:17-840-11:18-0-0:19-0-0:20-0-0:21-0-0&Queue=Buildings Queued:\nBuild Stable @ 7,6\n\n&quad=NW&duh=1 ";
var fields = data.substring(1).split("&");
var resources = fields.shift().substring(10).split(":"),
    resourceRates = fields.shift().substring(15).split(":");
var resources = {
        iron: resources[0],
        wood: resources[1],
        stone: resources[2],
        gold: resources[3],
        food: resources[4],
        morale: resources[5],
        rates: {
            iron: resourceRates[0],
            wood: resourceRates[1],
            stone: resourceRates[2],
            gold: resourceRates[3],
            food: resourceRates[4],
            morale: resourceRates[5]
        }
    },
    map = fields.shift(),
    rawBuildings = [[], [], [], [], [], [], [], [], []];

function makeBuilding(building) {
    if (typeof building === "undefined") {
        return $("<span class=\"empty-building\">");
    }
    var img = $("<img>").attr("src", "images/buildings/" + building.type + ".png"),
        levelContainer = $("<span class='building-level-container'>"),
        level = $("<span>").addClass("building-level").text(building.level).appendTo(levelContainer);

    return $("<span class='building'>").append(img).append(levelContainer);
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

    var r = resources,
        rr = resources.rates;
    $("#iron").text(r.iron + " @ " + rr.iron + "/hour");
    $("#wood").text(r.wood + " @ " + rr.wood + "/hour");
    $("#stone").text(r.stone + " @ " + rr.stone + "/hour");
    $("#gold").text(r.gold + " @ " + rr.gold + "/hour");
    $("#food").text(r.food + " @ " + rr.food + "/hour");
    $("#morale").text(r.morale + " @ " + rr.morale + "/hour");
});
