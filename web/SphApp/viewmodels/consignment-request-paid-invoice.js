define(["services/datacontext", "services/logger", "plugins/router", "services/system", "services/_ko.list", objectbuilders.config, objectbuilders.app],
function (context, logger, router, system, koList, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        userDetail = ko.observable(new bespoke.Ost_userDetail.domain.UserDetail(system.guid())),
        id = ko.observable(),
        totalDomestic = ko.observable(),
        totalDomesticNoGst = ko.observable(),
        totalDomesticGst = ko.observable(),
        totalInternational = ko.observable(),
        totalInternationalNoGst = ko.observable(),
        totalInternationalGst = ko.observable(),
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
            totalDomesticNoGst(domesticTotalPrice);
            totalDomesticGst(totalDomesticNoGst() * 0.06);
            totalDomestic(totalDomesticNoGst() + totalDomesticGst());
            totalInternational(internationalTotalPrice);
            totalInternationalNoGst(internationalSubTotalPrice);
            totalInternationalGst(internationalGstTotal);
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
        totalInternationalGst: totalInternationalGst
    };

    return vm;
});