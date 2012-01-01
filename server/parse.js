"use strict";

exports.parse = function (data) {
    var fields = data.substring(1).split("&"),
        res = fields.shift().substring(10).split(":"),
        resourceRates = fields.shift().substring(15).split(":"),
        resources = {
            iron: Math.round(parseInt(res[0], 10)),
            wood: Math.round(parseInt(res[1], 10)),
            stone: Math.round(parseInt(res[2], 10)),
            gold: Math.round(parseInt(res[3], 10)),
            food: Math.round(parseInt(res[4], 10)),
            morale: Math.round(parseInt(res[5], 10)),
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
};
