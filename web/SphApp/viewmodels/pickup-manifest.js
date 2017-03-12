define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.system, objectbuilders.app], function (context, logger, router, system, app) {
    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        pickupNumber = ko.observable(),
        activate = function () {
            console.log(entity());
        },
        attached = function (view) {

        },
        searchPickupByNumber = function () {
            context.get("api/consigment-requests?page=1&size=20&q=Pickup.Number='" + ko.unwrap(pickupNumber) + "'")
                .done(function (result) {
                    console.log(result);
                    if (result._count > 0) {
                        entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(result._results[0]));
                    } else {
                        app.showMessage("Sorry, but we cannot find any Consignment with Pickup Number : " + ko.unwrap(pickupNumber), "Ost", ["OK"]).done(function () {
                            entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid()));
                        });
                    }
                });
        };

    return {
        entity: entity,
        pickupNumber: pickupNumber,
        activate: activate,
        attached: attached,
        searchPickupByNumber: searchPickupByNumber
    };

});