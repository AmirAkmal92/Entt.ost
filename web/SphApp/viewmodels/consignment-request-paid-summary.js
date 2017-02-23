define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        grandTotal = ko.observable(),
        isPickupNumberValid = ko.observable(false),
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
                    if (entity().Pickup().Number() === undefined) {                        
                    } else {
                        isPickupNumberValid(true);
                    }
                    calculateGrandTotal();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
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
            });
            if (entity().Pickup().Number() === undefined) {
                grandTotal(total.toFixed(2));
            } else {
                total += 5.3;
                grandTotal(total.toFixed(2));
            }
        },
        generateConNotes = function () {
            var data = ko.mapping.toJSON(entity);
            context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + ko.unwrap(entity().Id), "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-requests-paid");
                    });
                })
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        app.showMessage("Tracking number genrated. You can now print your Consignment Note.", "Ost", ["OK"]).done(function () {
                            router.activeItem().activate(result.id);
                        });                        
                    } else {
                        console.log(result.status);
                        app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + result.id, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
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
        isPickupNumberValid: isPickupNumberValid,
        grandTotal: grandTotal,
        generateConNotes: generateConNotes,
        entity: entity
    };

    return vm;
});