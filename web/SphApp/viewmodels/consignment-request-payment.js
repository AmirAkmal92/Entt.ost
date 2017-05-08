define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        id = ko.observable(),
        grandTotal = ko.observable(),
        totalDomestic = ko.observable(),
        totalDomesticNoGst = ko.observable(),
        totalDomesticGst = ko.observable(),
        totalInternational = ko.observable(),
        totalInternationalNoGst = ko.observable(),
        totalInternationalGst = ko.observable(),
        appId = ko.observable(),
        appData = ko.observable(),
        appUrl = ko.observable(),
        paymentGatewayReminder = ko.observable(false);
        activate = function (entityId) {
            id(entityId);
            return context.get("/api/consigment-requests/" + entityId)
                .then(function (b, textStatus, xhr) {
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                    calculateGrandTotal();
                    calculateDomesticAndInternational();
                    if (grandTotal() != entity().Payment().TotalPrice()) {
                        app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + entityId, "OST", ["Close"]).done(function () {
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
                                app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + entityId, "OST", ["Close"]).done(function () {
                                    return router.navigate("consignment-request-summary/" + entityId);
                                });
                            }
                        });
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "OST", ["Close"]);
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
            total += 5.3;
            grandTotal(total.toFixed(2));
        },
        calculateDomesticAndInternational = function () {
            var domesticTotalPrice = 0;
            var domesticSubTotalPrice = 0;
            var domesticGstTotal = 0;
            var internationalTotalPrice = 0;
            var internationalSubTotalPrice = 0;
            var internationalGstTotal = 0;
            _.each(entity().Consignments(), function (v) {
                if (!v.Produk().IsInternational()) {
                    if (!v.Produk().Price()) {
                        domesticTotalPrice += 0;
                    } else {
                        domesticTotalPrice += v.Produk().Price();
                    }
                    if (!v.Bill().SubTotal3()) {
                        domesticSubTotalPrice += 0;
                    } else {
                        domesticSubTotalPrice += v.Bill().SubTotal3();
                    }
                    if (!v.Bill().AddOnsD()[0].Charge()) {
                        domesticGstTotal += 0;
                    } else {
                        domesticGstTotal += v.Bill().AddOnsD()[0].Charge();
                    }
                }
                if (v.Produk().IsInternational()) {
                    if (!v.Produk().Price()) {
                        internationalTotalPrice += 0;
                    } else {
                        internationalTotalPrice += v.Produk().Price();
                    }
                    if (!v.Bill().SubTotal3()) {
                        internationalSubTotalPrice += 0;
                    } else {
                        internationalSubTotalPrice += v.Bill().SubTotal3();
                    }
                    if (!v.Bill().AddOnsD()[0].Charge()) {
                        internationalGstTotal += 0;
                    } else {
                        internationalGstTotal += v.Bill().AddOnsD()[0].Charge();
                    }
                }
            });
            totalDomestic(domesticTotalPrice);
            totalDomesticNoGst(domesticSubTotalPrice);
            totalDomesticGst(domesticGstTotal);
            totalInternational(internationalTotalPrice);
            totalInternationalNoGst(internationalSubTotalPrice);
            totalInternationalGst(internationalGstTotal);
        },
        paymentGatewayReminderDialog = function () {
            app.showMessage("You will be redirect to Pos Malaysia Payment Switch.<br /> Please do not leave or refresh your browser until payment is successful.", "OST", ["Close"]).done(function () {
                paymentGatewayReminder(true);
            });
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
        totalDomesticNoGst: totalDomesticNoGst,
        totalDomesticGst: totalDomesticGst,
        totalInternational: totalInternational,
        totalInternationalNoGst: totalInternationalNoGst,
        totalInternationalGst: totalInternationalGst,
        appId: appId,
        appData: appData,
        appUrl: appUrl,
        paymentGatewayReminder: paymentGatewayReminder,
        paymentGatewayReminderDialog: paymentGatewayReminderDialog
    };

    return vm;
});