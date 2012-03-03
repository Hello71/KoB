/*global $:false global:false*/
(function () {
    "use strict";

    if (typeof console === "undefined") {
        console = {
            log: function () {}
        };
    } else if (typeof console.log === "undefined") {
        console.log = function () {};
    }
    $.ajaxSetup({
        cache: false,
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

    if (window.location.href.indexOf("iframe") > -1) {
        global.iframe = true;
    }
    global.data = {village: {}};
    global.update(true);
    window.setInterval(function () {
        global.update();
    }, 60000);
    $(document).ready(function () {
        if (global.iframe) {
            document.body.style.background = "transparent";
        }
        $("button, input[type='submit'], input[type='button']").button();
        $("#update").click(function () {
            global.update(true);
        });
        $("#buildings-done").dialog({
            position: [200, 400],
            title: "Buildings complete.",
            autoOpen: false
        });
    });
}());
