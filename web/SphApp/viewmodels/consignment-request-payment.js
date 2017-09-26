define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart"],

    function (context, logger, router, system, chart, config, app, crCart) {

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
                    crCart.activate();
                    if (entity().Payment().IsPaid()) {
                        app.showMessage("Shipment has been paid. You may proceed to new Shipment now.", "OST", ["Close"]).done(function () {
                            return router.navigate("consignment-request-cart/" + crCart.consignmentRequest().Id());
                        });
                    } else {
                        calculateDomesticAndInternational();
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "OST", ["Close"]);
                    }
                });
        },
            calculateDomesticAndInternational = function () {
                var domesticTotalPrice = 0;
                var domesticGstTotal = 0;
                var internationalTotalPrice = 0;
                var internationalSubTotalPrice = 0;
                var internationalGstTotal = 0;
                _.each(entity().Consignments(), function (v) {
                    if (!v.Produk().IsInternational()) {
                        if (!v.Produk().Price()) {
                            domesticTotalPrice += 0;
                        } else {
                            domesticTotalPrice += v.Bill().SubTotal3();
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
                context.get("/consignment-request/calculate-gst/" + domesticTotalPrice + "/2")
                    .done(function (result) {
                        gstPrice = result;
                        totalDomesticNoGst(domesticTotalPrice);
                        totalDomesticGst(gstPrice);
                        var totalDom = (((gstPrice * 100) + (domesticTotalPrice * 100)) / 100);
                        totalDomestic(totalDom);
                        totalInternational(internationalTotalPrice);
                        totalInternationalNoGst(internationalSubTotalPrice);
                        totalInternationalGst(internationalGstTotal);
                        grandTotal((((totalDomestic() * 100) + (totalInternationalNoGst() * 100) + (totalInternationalGst() * 100) + (5.30 * 100)) / 100));
                        if (grandTotal() != entity().Payment().TotalPrice()) {
                            app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + id(), "OST", ["Close"]).done(function () {
                                return router.navigate("consignment-request-summary/" + id());
                            });
                        } else {
                            return context.get("/ost-payment/ps-request/" + id()).then(function (result) {
                                if (result.success) {
                                    appId(result.id);
                                    appData(result.data);
                                    appUrl(result.url);
                                }
                            }, function (e) {
                                if (e.status == 404) {
                                    app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id  : " + id(), "OST", ["Close"]).done(function () {
                                        return router.navigate("consignment-request-summary/" + id());
                                    });
                                }
                            });
                        }
                    }, function (e) {
                        if (e.status == 404) {
                            console.log("Cannot calculate gst at the moment.");
                        }
                    });
            },
            paymentGatewayReminderDialog = function () {
                app.showMessage("You will be redirected to Pos Malaysia Payment Switch.<br /> Do not leave or refresh your browser until payment is successful.<br /> Please click 'Pay Now' again.", "OST", ["Close"]).done(function () {
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