define(["services/datacontext", "services/logger", "plugins/router", "services/system", "services/_ko.list", objectbuilders.config, objectbuilders.app],
    function (context, logger, router, system, koList, config, app) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            userDetail = ko.observable(new bespoke.Ost_userDetail.domain.UserDetail(system.guid())),
            id = ko.observable(),
            totalDomestic = ko.observable(0.0),
            totalDomesticNoGst = ko.observable(0.0),
            totalDomesticGst = ko.observable(0.0),
            totalInternational = ko.observable(0.0),
            totalInternationalNoGst = ko.observable(0.0),
            totalInternationalGst = ko.observable(0.0),
            intInsuranceTotal = ko.observable(0.0),
            intFuelSurchargeTotal = ko.observable(0.0),
            intHandlingSurchargeTotal = ko.observable(0.0),
            domInsuranceTotal = ko.observable(0.0),
            domFuelSurchargeTotal = ko.observable(0.0),
            domHandlingSurchargeTotal = ko.observable(0.0),

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
                        calculateOthersCharge();
                        calculateDomesticAndInternational();
                        context.get("/api/user-details/user-profile")
                            .done(function (userDetailList) {
                                if (userDetailList._count > 0) {
                                    userDetail(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                                }
                            });
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "OST", ["Close"]).done(function () {
                                router.navigate("consignment-requests-paid");
                            });
                        }
                    });
            },
            calculateOthersCharge = function () {
                var domesticGrandTotal = 0.0,
                    domesticSubTotal = 0.0,
                    domesticBaseRateTotal = 0.0,
                    domesticHandlingSurchargeTotal = 0.0,
                    domesticFuelSurchargeTotal = 0.0,
                    domesticGstTotal = 0.0,
                    domesticInsuranceTotal = 0.0,

                    internationalGrandTotal = 0.0,
                    internationalSubTotal = 0.0,
                    internationalBaseRateTotal = 0.0,
                    internationalHandlingSurchargeTotal = 0.0,
                    internationalFuelSurchargeTotal = 0.0,
                    internationalGstTotal = 0.0,
                    internationalInsuranceTotal = 0.0;

                _.each(entity().Consignments(), function (z) {

                    _.each(z.Bill().AddOnsA(), function (a) {
                        if (z.Produk().IsInternational()) {
                            if (a.Code() === 'V29') {
                                internationalInsuranceTotal += a.Charge();
                            }
                        } else {
                            if (a.Code() === 'V29') {
                                domesticInsuranceTotal += a.Charge();
                            }
                        }
                    });
                    _.each(z.Bill().AddOnsC(), function (c) {
                        if (z.Produk().IsInternational()) {
                            if (c.Code() === 'S13') {
                                internationalFuelSurchargeTotal += c.Charge();
                            }
                            if (c.Code() === 'S14') {
                                internationalHandlingSurchargeTotal += c.Charge();
                            }
                        } else {
                            if (c.Code() === 'S12') {
                                domesticFuelSurchargeTotal += c.Charge();
                            }
                            if (c.Code() === 'S11') {
                                domesticHandlingSurchargeTotal += c.Charge();
                            }
                        }
                    });
                });

                intInsuranceTotal(internationalInsuranceTotal);
                intFuelSurchargeTotal(internationalFuelSurchargeTotal);
                intHandlingSurchargeTotal(internationalHandlingSurchargeTotal);

                domInsuranceTotal(domesticInsuranceTotal);
                domFuelSurchargeTotal(domesticFuelSurchargeTotal);
                domHandlingSurchargeTotal(domesticHandlingSurchargeTotal);
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
                var gstPrice = 0.00;
                context.get("/consignment-request/calculate-gst/" + domesticTotalPrice + "/2")
                    .done(function (result) {
                        gstPrice = result;
                        totalDomesticNoGst(domesticTotalPrice);
                        totalDomesticGst(gstPrice);
                        totalDomestic(totalDomesticNoGst() + totalDomesticGst());
                        totalInternational(internationalTotalPrice);
                        totalInternationalNoGst(internationalSubTotalPrice);
                        totalInternationalGst(internationalGstTotal);
                    }, function (e) {
                        if (e.status == 404) {
                            console.log("Cannot calculate gst at the moment.");
                        }
                    });
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
            userDetail: userDetail,
            totalDomestic: totalDomestic,
            totalDomesticNoGst: totalDomesticNoGst,
            totalDomesticGst: totalDomesticGst,
            totalInternational: totalInternational,
            totalInternationalNoGst: totalInternationalNoGst,
            totalInternationalGst: totalInternationalGst,
            intInsuranceTotal: intInsuranceTotal,
            intFuelSurchargeTotal: intFuelSurchargeTotal,
            intHandlingSurchargeTotal: intHandlingSurchargeTotal,
            domInsuranceTotal: domInsuranceTotal,
            domFuelSurchargeTotal: domFuelSurchargeTotal,
            domHandlingSurchargeTotal: domHandlingSurchargeTotal
        };

        return vm;
    });