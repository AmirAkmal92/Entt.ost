define([objectbuilders.dialog, objectbuilders.system,],
    function (dialog, system) {
        var Pickup = ko.observable(new bespoke.Ost_consigmentRequest.domain.Pickup(system.guid())),
            okClick = function (data, ev) {
                //console.log(ko.mapping.toJSON(Pickup));
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                //console.log(ko.mapping.toJSON(Pickup));
                dialog.close(this, "Cancel");
            };

        var vm = {
            Pickup: Pickup,
            okClick: okClick,
            cancelClick: cancelClick
        };

        return vm;
    });
