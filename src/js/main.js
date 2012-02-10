/*global $:false */
(function () {
    "use strict";

    $.ajaxSetup({
        dataType: "json"
    });
    $(document).ajaxComplete(function (e, jqXHR) {
        if (jqXHR.status === 401) {
            $("#login").show();
            e.stopPropagation();
        } else if (jqXHR.status === 418) {
            $("#re-login").show();
            e.stopPropagation();
        } else if (jqXHR.responseText === "") {
            $("#no-data").show();
            e.stopPropagation();
        }
    });

    window.data = {village: {}};
    window.update(true);
    window.setInterval(function () {
        window.update();
    }, 60000);
    $(document).ready(function () {
        $("button").button();
        $("#update").click(function () {
            window.update(true);
        });
        $("#buildings-done").dialog({
            position: [200, 400],
            title: "Buildings complete.",
            autoOpen: false
        });
    });
}());
