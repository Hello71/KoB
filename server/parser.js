"use strict";

var assert = require("assert"),
    parseUnits, parseResources;

parseUnits = function (data) {
    var units = data.substring(8).split(":").map(function (str) {
        var split = str.split("-");
        return {
            current: parseInt(split[1], 10),
            training: parseInt(split[2], 10)
        };
    });

    return {
        farmers: units[0],
        lumberjacks: units[1],
        stonemasons: units[2],
        ironminers: units[3],
        peasants: units[4],
        merchants: units[5],
        swordsmen: units[6],
        archers: units[7],
        janissaries: units[8],
        paladins: units[9],
        mameluks: units[10],
        spies: units[11],
        emissaries: units[12],
        catapults: units[13],
        sultans: units[14],
        villagers: units[15],
        "war-elephants": units[16],
        chariots: units[17],
        mongols: units[18],
        "camel-riders": units[19],
        hussars: units[20]
    };
};

parseResources = function (ires, resRates) {
    var res = ires.substring(10).split(":"),
        resourceRates = resRates.substring(15).split(":");
    return {
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
    };
};
exports.parseVillage = function (data) {
    var fields = data.substring(1).split("&"),
        resources = parseResources(fields.shift(), fields.shift()),
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
            horizontal: parseInt(building[0], 10),
            vertical: parseInt(building[1], 10),
            player: parseInt(building[2], 10),
            level: parseInt(building[5], 10),
            upgrading: building[6],
            type: building[8]
        }, upgradeTime = parseInt(building[9], 10);
        if (upgradeTime > 0) {
            o.upgradeTime = upgradeTime;
        }
        assert(o.vertical < 11 && o.horizontal < 11 && o.level < 12);
        buildings[o.vertical - 1][o.horizontal - 1] = o;
    }

    units = parseUnits(fields.shift());

    queue = fields.shift().substring(6);
    return {
        buildings: buildings,
        units: units,
        resources: resources,
        map: map,
        queue: queue
    };
};

exports.parseTrainUnits = function (data) {
    var fields = data.split("&");
    fields.shift();
    if (fields.shift() === "trainSuccess=1") {
        return {
            success: true,
            units: parseUnits(fields.shift()),
            resources: parseResources(fields.shift(), fields.shift()),
            msg: fields.shift().substring(4)
        };
    } else {
        return {
            success: false,
            msg: fields[0].substring(4)
        };
    }
};

exports.parseVillages = function (data, response) {
    if (data.length === 0) {
        var err = "no villages";
        response.writeHead(500, {
            "Content-Length": err.length,
            "Content-Type": "text/plain"
        });
        response.end(err);
        return;
    }
    var villages = {},
        re = /<option value="(\d{1,5})"( selected="selected")?>([A-Za-z0-9 ]*)/g,
        match;
    while ((match = re.exec(data)) !== null) {
        villages[match[1]] = match[3];
    }
    return villages;
};
