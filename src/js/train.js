/*global $:false */
window.train = function (amount, id) {
    "use strict";
    var $trainResponse = $("#unit-training-result > div");
    $.ajax({
        cache: false,
        data: {
            amount: amount,
            type: id,
            village: window.village
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            $trainResponse.text("An error occurred while trying to train units. Please inform the developer or maintainer of the KoB HTML5 client of this issue. Further details have been logged to the Console.");
            $trainResponse.show();
        },
        success: function (data) {
            window.data.village.units = data.units;
            $trainResponse.text(data.result);
            $trainResponse.show();
        },
        type: "POST",
        url: "/trainUnits"
    });
};
