/*global $:false */
(function () {
    "use strict";

    window.update();
    $(document).ready(function () {
        $("button").button();
        $("#update").click(window.update);
    });
}());
