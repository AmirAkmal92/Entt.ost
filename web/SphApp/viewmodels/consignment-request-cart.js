define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart"],

function (context, logger, router, system, chart, config, app, crCart) {

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
                    var total = 0;
                    _.each(entity().Consignments(), function (v) {
                        total = total + parseFloat(v.Produk().Price());
                    })
                    grandTotal(total.toFixed(2));
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "Ost", ["OK"]);
                    }
                });

            crCart.activate();
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
            var tcs = $.Deferred();
            app.showMessage(`Are you sure you want to remove parcel, this action cannot be undone`, "POS Online Shipping Tools", ["Yes", "No"])
                .done(function (dialogResult) {
                    if (dialogResult === "Yes") {
                        entity().Consignments.remove(consignment);
                        return defaultCommand().then(function (result) {
                            if (result.success) {                                
                                return app.showMessage("Parcel has been successfully removed", "POS Online Shipping Tools", ["OK"]).done(function () {
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

            return tcs.promise();
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
        entity: entity,
        grandTotal: grandTotal,
        deleteConsignment: deleteConsignment
    };

    return vm;
});