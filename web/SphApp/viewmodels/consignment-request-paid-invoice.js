define(["services/datacontext", "services/logger", "plugins/router", "services/system", "services/_ko.list", objectbuilders.config, objectbuilders.app],
function (context, logger, router, system, koList, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        id = ko.observable(),
        totalDomestic = ko.observable(),
        totalInternational = ko.observable(),
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
                    calculateDomesticAndInternational();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        calculateDomesticAndInternational = function () {
            var dtotal = 0;
            var itotal = 0;
            _.each(entity().Consignments(), function (v) {
                if (!v.Produk().IsInternational()) {
                    if (!v.Produk().Price()) {
                        dtotal += 0;
                    } else {
                        dtotal += v.Produk().Price();
                    }
                }
            });
            _.each(entity().Consignments(), function (v) {
                if (v.Produk().IsInternational()) {
                    if (!v.Produk().Price()) {
                        itotal += 0;
                    } else {
                        itotal += v.Produk().Price();
                    }
                }
            });
            totalDomestic(dtotal);
            totalInternational(itotal);
        },
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        attached: attached,
        compositionComplete: compositionComplete,
        entity: entity,
        totalDomestic: totalDomestic,
        totalInternational: totalInternational
    };

    return vm;
});