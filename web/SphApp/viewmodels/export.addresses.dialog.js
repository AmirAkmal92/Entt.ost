define(["plugins/dialog"],
    function (dialog) {
        var okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
        cancelClick = function () {
            dialog.close(this, "Cancel");
        };

        var vm = {
            okClick: okClick,
            cancelClick: cancelClick
        };
        return vm;
    });