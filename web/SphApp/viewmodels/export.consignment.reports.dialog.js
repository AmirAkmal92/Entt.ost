define(["plugins/dialog"],
    function (dialog) {
        var moduleType = ko.observable(),
            okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                dialog.close(this, "Cancel");
            };

        var vm = {
            moduleType: moduleType,
            okClick: okClick,
            cancelClick: cancelClick
        };

        return vm;
    });
