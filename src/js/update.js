(function () {
"use strict";

window.update = function (callback) {
    var documentReady = false;
    $(document).ready(function () {
        documentReady = true;
    });
    $.ajax({
        accepts: "text/plain",
        cache: false,
        data: {
            villageID: 1444
        },
        dataType: "text",
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                $("#login").show();
            }
        },
        success: function (data, textStatus, jqXHR) {
            if (data.length === 0) {
                $("#no-data").show();
                return;
            }
            window.rawData = data;
            window.data = window.parse(window.rawData);
            if (documentReady) {
                window.display(window.data);
                callback();
            } else {
                $(document).ready(function () {
                    window.display(window.data);
                    callback();
                });
            }
        },
        url: "/villageData"
    });
};

}());
