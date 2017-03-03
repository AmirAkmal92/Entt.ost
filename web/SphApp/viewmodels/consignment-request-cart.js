define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart"],

function (context, logger, router, system, chart, config, app, crCart) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),       
        grandTotal = ko.observable(),
        isPickupDateTimeValid = ko.observable(false),
        errors = ko.observableArray(),
        id = ko.observable(),
        headers = {},
        activate = function (entityId) {
            id(entityId);
            //return context.get("/api/consigment-requests/" + entityId)
            return $.ajax({
                url: "/api/consigment-requests/" + entityId,
                method: "GET",
                cache: false
            })
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
                    if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                    } else {
                        app.showMessage("Pickup has been scheduled. No more changes are allowed to the Shopping Cart. You may proceed to make Payment now.", "Ost", ["OK"]);
                        isPickupDateTimeValid(true);
                    }
                    calculateGrandTotal();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "Ost", ["OK"]);
                    }
                });

            crCart.activate();
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
            grandTotal(total.toFixed(2));
        },
        defaultCommand = function () {
            var data = ko.mapping.toJSON(entity),
                tcs = new $.Deferred();

            context.put(data, "/api/consigment-requests/" + ko.unwrap(entity().Id) + "", headers)
                .fail(function (response) {
                    var result = response.responseJSON;
                    errors.removeAll();
                    if (response.status === 428) {
                        // out of date conflict
                        logger.error(result.message);
                    }
                    if (response.status === 422 && _(result.rules).isArray()) {
                        _(result.rules).each(function (v) {
                            errors(v.ValidationErrors);
                        });
                    }
                    logger.error("There are errors in your entity, !!!");
                    tcs.resolve(false);
                })
                .then(function (result) {
                    logger.info(result.message);
                    entity().Id(result.id);
                    errors.removeAll();
                    tcs.resolve(result);
                });
            return tcs.promise();
        },
        deleteConsignment = function (consignment) {
            return app.showMessage("Are you sure you want to remove parcel? This action cannot be undone.", "OST", ["Yes", "No"])
                .done(function (dialogResult) {
                    if (dialogResult === "Yes") {
                        // delete selected consignment
                        entity().Consignments.remove(consignment);
                        return defaultCommand().then(function (result) {
                            if (result.success) {                                
                                app.showMessage("Parcel has been successfully removed.", "OST", ["OK"]).done(function () {
                                    calculateGrandTotal();
                                    crCart.activate();
                                });
                            } else {
                                return Task.fromResult(false);
                            }
                        });
                    } else {
                        tcs.resolve(false);
                    }
                });
        },
        emptyConsignmentRequest = function () {
            return app.showMessage("Are you sure you want to empty cart? This action cannot be undone.", "OST", ["Yes", "No"])
                .done(function (dialogResult) {
                    if (dialogResult === "Yes") {
                        // delete all consignments
                        entity().Consignments.removeAll();
                        // clear pickup information
                        entity().Pickup(new bespoke.Ost_consigmentRequest.domain.Pickup());
                        return defaultCommand().then(function (result) {
                            if (result.success) {
                                return app.showMessage("Cart has been successfully emptied.", "OST", ["OK"]).done(function () {
                                    calculateGrandTotal();
                                    crCart.activate();
                                });
                            } else {
                                return Task.fromResult(false);
                            }
                        });
                    } else {
                        return Task.fromResult(false);
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
        isPickupDateTimeValid: isPickupDateTimeValid,
        entity: entity,
        grandTotal: grandTotal,
        deleteConsignment: deleteConsignment,
        emptyConsignmentRequest: emptyConsignmentRequest
    };

    return vm;
});