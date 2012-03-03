/*global $:false global:false*/
var $trainResponse, $trainResult;
global.train = function (amount, id) {
    "use strict";
    $.ajax({
        cache: false,
        data: {
            amount: amount,
            type: id,
            village: global.village
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            $trainResult.text("An error occurred while trying to train units. Please inform the developer or maintainer of the KoB HTML5 client of this issue. Further details have been logged to the Console.");
            $trainResponse.show();
        },
        success: function (data) {
            global.data.village[global.village].units = data.units;
            global.data.village[global.village].resources = data.resources;
            global.displayUnits();
            global.displayResources();
            $trainResult.text(data.msg);
            $trainResponse.show();
        },
        type: "POST",
        url: "/trainUnits"
    });
};

$(document).ready(function () {
    "use strict";
    $trainResponse = $("#unit-training-result");
    $trainResult = $($trainResponse.find("div")[0]);
    $("#unit-training-result-close").click(function () {
        $trainResponse.hide();
    });
    
    $("#units > div").click(function () {
        var village = global.data.village[global.village],
            unitType = this.id.replace("-container", ""),
            unit = global.data.units[unitType],
            $unitTraining = $("#unit-training"),
            $unitAttributes = $unitTraining.find("#unit-attributes"),
            $unitAmount = $unitTraining.find("#unit-amount"),
            $unitResources = $unitTraining.find("#unit-resources"),
            time = unit.time,
            villageUnit = village.units[unitType],
            $minutesToTrain = $unitTraining.find("#minutes-to-train"),
            $unitType = $("#unit-type"),
            $unitImage = $("#unit-image");

        global.unit = unit;

        if ($unitTraining.css("display") === "block") {
            if (unit.name.singular === $unitType.text()) {
                $unitTraining.hide();
                return;
            }
        }
        $unitType.text(unit.name.singular);
        $("#unit-description").text(unit.description);

        $.each(["attack", "carry", "defend", "hp", "morale", "siege", "speed"], function (index, prop) {
            $unitAttributes.find("#unit-" + prop).text(unit[prop]);
        });

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
        $unitImage.find("img").remove();
        $unitImage.append($("<img>").attr("src", "/images/units/" + unit.name.singular + ".png"));

        $unitTraining.show(); // Put here to reduce reflow
    });
    $("#unit-training-close").click(function () {
        $("#unit-training").hide();
    });
    $("#unit-train-button").click(function () {
        global.train($("#unit-train-amount").val(), global.unit.id);
    });
});

