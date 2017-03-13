define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        id = ko.observable(),
        grandTotal = ko.observable(),
        totalDomestic = ko.observable(),
        totalInternational = ko.observable(),
        totalGst = ko.observable(),
        appId = ko.observable(),
        appData = ko.observable(),
        appUrl = ko.observable(),
        activate = function (entityId) {
            id(entityId);
            return context.get("/api/consigment-requests/" + entityId)
                .then(function (b, textStatus, xhr) {
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                    calculateGrandTotal();
                    calculateDomesticAndInternational();
                    if (grandTotal() != entity().Payment().TotalPrice()) {
                        app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + entityId, "Ost", ["OK"]).done(function () {
                            return router.navigate("consignment-request-summary/" + entityId);
                        });
                    } else {
                        return context.get("/ost-payment/ps-request/" + entityId).then(function (result) {
                            if (result.success) {
                                appId(result.id);
                                appData(result.data);
                                appUrl(result.url);
                            }
                        }, function (e) {
                            if (e.status == 404) {
                                app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + entityId, "Ost", ["OK"]).done(function () {
                                    return router.navigate("consignment-request-summary/" + entityId);
                                });
                            }
                        });
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "Ost", ["OK"]);
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
            if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                grandTotal(total.toFixed(2));
            } else {
                total += 5.3;
                grandTotal(total.toFixed(2));
            }
            grandTotal(total.toFixed(2));
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
            totalGst(((dtotal + 5.30)/1.06)*0.06)
        },
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        attached: attached,
        entity: entity,
        config: config,
        grandTotal: grandTotal,
        totalDomestic: totalDomestic,
        totalInternational: totalInternational,
        totalGst: totalGst,
        appId: appId,
        appData: appData,
        appUrl: appUrl
    };

    return vm;
});