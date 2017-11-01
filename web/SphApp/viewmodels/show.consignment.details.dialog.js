define([objectbuilders.dialog, objectbuilders.system,],
    function (dialog, system) {
        var Consignment = ko.observable(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid())),
            okClick = function (data, ev) {
                //console.log(ko.mapping.toJSON(Consignment));
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                //console.log(ko.mapping.toJSON(Consignment));
                dialog.close(this, "Cancel");
            };

        var vm = {
            Consignment: Consignment,
            okClick: okClick,
            cancelClick: cancelClick
        };

        return vm;
    });
