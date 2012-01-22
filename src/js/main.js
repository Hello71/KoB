/*global $:false */
(function () {
    "use strict";

    window.data = {};
    window.update();
    window.setInterval(function () {
        window.update();
    }, 60000);
    $(document).ready(function () {
        $("button").button();
        $("#update").click(function () {
            window.update();
        });

        $(".building").hover(function (e) {
            var building = $(this).data("building");
            var type = e.type.toLowerCase();
            if (type === "mouseenter") {
                $("#building-information").text("Level " + building.level + " " + building.type);
            } else if (type === "mouseleave") {
                $("#building-information").text("");
            }
        });
        $("#villages").change(function () {
            window.village = $(this).attr("value");
            window.update();
        });
    });
}());
