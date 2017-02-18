define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        grandTotal = ko.observable(),
        errors = ko.observableArray(),
        id = ko.observable(),
        headers = {},
        activate = function (entityId) {
            id(entityId);
            return context.get("/api/consigment-requests/" + entityId)
                .then(function (b, textStatus, xhr) {
                    if (xhr) {
                        var etag = xhr.getResponseHeader("ETag"),
                            lastModified = xhr.getResponseHeader("Last-Modified");
                        if (etag) {
                            headers["If-Match"] = etag;
                        }
                        if (lastModified) {
                            headers["If-Modified-Since"] = lastModified;
                        }
                    }
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                    calculateGrandTotal();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Order Summary with Id : " + entityId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        goToPayment = function () {
            var data = ko.mapping.toJSON(entity);
            context.put(data, "/consignment-request/calculate-total-price/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id : " + ko.unwrap(entity().Id), "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-request-cart/" + ko.unwrap(entity().Id));
                    });
                })
                .then(function () {
                    router.navigate("consignment-request-payment/" + ko.unwrap(entity().Id));
                });
        },
        calculateGrandTotal = function () {
            var total = 0;
            _.each(entity().Consignments(), function (v) {
                if (!v.Produk().Price()) {
                    total += 0;
                } else {
                    total += v.Produk().Price();

                }
            })
            grandTotal(total.toFixed(2));
        },
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        config: config,
        attached: attached,
        errors: errors,
        grandTotal: grandTotal,
        entity: entity,
        goToPayment: goToPayment
    };

    return vm;
});