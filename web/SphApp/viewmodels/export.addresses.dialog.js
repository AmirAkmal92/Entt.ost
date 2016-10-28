define(["plugins/dialog"],
    function (dialog) {
        var options = ko.observable({
            companyName: ko.observable(false),
            contactPerson: ko.observable(false),
            premiseNoMailbox: ko.observable(false),
            block: ko.observable(false),
            buildingName: ko.observable(false),
            roadName: ko.observable(false),
            areaVillage: ko.observable(false),
            subDistrict: ko.observable(false),
            districtCity: ko.observable(false),
            state: ko.observable(false),
            country: ko.observable(false),
            phoneNo: ko.observable(false),
            faxNumber: ko.observable(false),
            email: ko.observable(false),
            gpsLocation: ko.observable(false),
            referenceNo: ko.observable(false),
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