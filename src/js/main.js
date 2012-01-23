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
    });
}());
