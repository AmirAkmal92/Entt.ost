define(["plugins/dialog"],
    function (dialog) {
        var item = ko.observable({
            storeId: ko.observable(),
            designation: ko.observable()
        }),
            okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                dialog.close(this, "Cancel");
            };

        var vm = {
            item: item,
            okClick: okClick,
            cancelClick: cancelClick
        };


        return vm;

    });