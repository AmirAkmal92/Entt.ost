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
                    var total = 0;
                    _.each(entity().Consignments(), function (v) {
                        total = total + parseFloat(v.Produk().Price());
                    })
                    grandTotal(total.toFixed(2));
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "Ost", ["OK"]).done(function () {
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
        grandTotal: grandTotal,
        entity: entity
    };

    return vm;
});