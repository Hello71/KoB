(function () {
    "use strict";

    window.update();
    $(document).ready(function () {
        $("button").button();
        $("#update").click(function () {
            var loading = $("#update #loading").show();
            window.update(function () {
                loading.hide();
            });
        });
    });
}());
