define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        id = ko.observable(),
        grandTotal = ko.observable(),
        totalDomestic = ko.observable(),
        totalInternational = ko.observable(),
        creditCardNo = ko.observable(),
        creditCardName = ko.observable(),
        creditCardExpMM = ko.observable(),
        creditCardExpYY = ko.observable(),
        creditCardCvv2 = ko.observable(),
        pxVersion = ko.observable(),
        pxTransactionType = ko.observable(),
        pxPurchaseDate = ko.observable(),
        pxPurchaseId = ko.observableArray(),
        pxPurchaseAmount = ko.observable(),
        pxMerchantId = ko.observable(),
        pxRef = ko.observable(),
        pxSig = ko.observable(),
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
                        return context.get("/consignment-request/generate-px-req-fields/" + entityId).then(function (res) {
                            //console.log(res.pxreq);
                            pxVersion(res.pxreq.PX_VERSION);
                            pxTransactionType(res.pxreq.PX_TRANSACTION_TYPE);                            
                            pxPurchaseDate(res.pxreq.PX_PURCHASE_DATE);
                            pxPurchaseId(res.pxreq.PX_PURCHASE_ID);
                            pxPurchaseAmount(res.pxreq.PX_PURCHASE_AMOUNT);
                            pxMerchantId(res.pxreq.PX_MERCHANT_ID);
                            pxRef(res.pxreq.PX_REF);
                            pxSig(res.pxreq.PX_SIG);
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
        },
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        attached: attached,
        entity: entity,
        creditCardNo: creditCardNo,
        creditCardName: creditCardName,
        creditCardExpMM: creditCardExpMM,
        creditCardExpYY: creditCardExpYY,
        creditCardCvv2: creditCardCvv2,
        pxVersion: pxVersion,
        pxTransactionType: pxTransactionType,
        pxPurchaseDate: pxPurchaseDate,
        pxPurchaseId: pxPurchaseId,
        pxPurchaseAmount: pxPurchaseAmount,
        pxMerchantId: pxMerchantId,
        pxRef: pxRef,
        pxSig: pxSig,
        grandTotal: grandTotal,
        totalDomestic: totalDomestic,
        totalInternational: totalInternational
    };

    return vm;
});