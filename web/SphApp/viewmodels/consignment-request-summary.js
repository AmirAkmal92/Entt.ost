define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

    function (context, logger, router, system, chart, config, app) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            isPickupDateTimeValid = ko.observable(false),
            showPickupScheduleForm = ko.observable(false),
            pickupReadyHH = ko.observable(),
            pickupReadyMM = ko.observable(),
            pickupCloseHH = ko.observable(),
            pickupCloseMM = ko.observable(),
            grandTotal = ko.observable(),
            totalGst = ko.observable(),
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
                }).then(function (b, textStatus, xhr) {
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
                        isPickupDateTimeValid(false);
                        app.showMessage("Please Schedule Pickup before payment can be made.", "OST", ["Next"]);
                    } else {
                        isPickupDateTimeValid(true);
                    }
                    calculateGrandTotal();
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Order Summary with Id : " + entityId, "OST", ["Close"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
            },
            goToPayment = function () {
                var data = ko.mapping.toJSON(entity);
                context.put(data, "/consignment-request/calculate-total-price/" + ko.unwrap(entity().Id) + "")
                    .fail(function (response) {
                        app.showMessage("Sorry, but we cannot process your Payment for the Order Summary with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                            router.navigate("consignment-request-cart/" + ko.unwrap(entity().Id));
                        });
                    })
                    .then(function () {
                        router.navigate("consignment-request-payment/" + ko.unwrap(entity().Id));
                    });
            },
            schedulePickup = function () {
                var tReady = pickupReadyHH() + ":" + pickupReadyMM() + " PM";
                var tClose = pickupCloseHH() + ":" + pickupCloseMM() + " PM";
                var timeStart = moment(tReady, "hh:mm A");
                var timeEnd = moment(tClose, "hh:mm A");
                if (timeStart < timeEnd) {
                    var data = ko.mapping.toJSON(entity);
                    context.put(data, "/consignment-request/propose-pickup/" + ko.unwrap(entity().Id) + "?timeReady=" + tReady + "&timeClose=" + tClose)
                        .fail(function (response) {
                            app.showMessage("Sorry, but we cannot shedule a pickup for the Consignment Request with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                                router.navigate("consignment-requests-cart/" + ko.unwrap(entity().Id));
                            });
                        })
                        .then(function (result) {
                            console.log(result);
                            if (result.success) {
                                app.showMessage("Pickup successfully scheduled. You can now proceed with payment.", "OST", ["Close"]).done(function () {
                                    showPickupScheduleForm(false);
                                    router.activeItem().activate(result.id);
                                });
                            } else {
                                console.log(result.status);
                                app.showMessage("Sorry, but we cannot shedule a pickup for the Consignment Request with Id : " + result.id, "OST", ["Close"]).done(function () {
                                    router.navigate("consignment-requests-cart/" + result.id);
                                });
                            }
                        });
                } else {
                    app.showMessage("Pickup time is invalid. Please set a valid pickup time.", "OST", ["Close"]);
                }
            },
            toggleShowPickupScheduleForm = function () {
                showPickupScheduleForm(!showPickupScheduleForm());
            },
            calculateGrandTotal = function () {
                var total = 0;
                var totalInternational = 0;
                _.each(entity().Consignments(), function (v) {
                    if (!v.Bill().SubTotal3()) {
                        total += 0;
                    } else {
                        if (!v.Produk().IsInternational()) {
                            total += v.Bill().SubTotal3();
                        } else {
                            totalInternational += v.Bill().SubTotal3();
                        }
                    }
                });
                var gstPrice = 0.00;
                context.get("/consignment-request/calculate-gst/" + total + "/2")
                    .done(function (result) {
                        gstPrice = result;
                        totalGst(gstPrice);
                        total += gstPrice;
                        total += totalInternational;
                        if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                            grandTotal(total.toFixed(2));
                        } else {
                            total += 5.3;
                            grandTotal(total.toFixed(2));
                        }
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
            config: config,
            attached: attached,
            errors: errors,
            pickupReadyHH: pickupReadyHH,
            pickupReadyMM: pickupReadyMM,
            pickupCloseHH: pickupCloseHH,
            pickupCloseMM: pickupCloseMM,
            grandTotal: grandTotal,
            totalGst: totalGst,
            entity: entity,
            isPickupDateTimeValid: isPickupDateTimeValid,
            showPickupScheduleForm: showPickupScheduleForm,
            toggleShowPickupScheduleForm: toggleShowPickupScheduleForm,
            schedulePickup: schedulePickup,
            goToPayment: goToPayment
        };

        return vm;
    });