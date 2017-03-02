define(["plugins/dialog"],
    function (dialog) {
        var options = ko.observable({
                companyName: ko.observable(false),
                contactPerson: ko.observable(false),
                address1: ko.observable(false),
                address2: ko.observable(false),
                address3: ko.observable(false),
                address4: ko.observable(false),
                postcode: ko.observable(false),
                city: ko.observable(false),
                state: ko.observable(false),
                country: ko.observable(false),
                contactNumber: ko.observable(false),
                altContactNumber: ko.observable(false),
                email: ko.observable(false),
                gpsLocation: ko.observable(false),
                addressGroup: ko.observable(false)
            }),
            okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
        cancelClick = function () {
            dialog.close(this, "Cancel");
        };

        var vm = {
            options: options,
            okClick: okClick,
            cancelClick: cancelClick
        };
        return vm;
    });