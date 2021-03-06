define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart",
    "services/app", "plugins/dialog"],
    function (context, logger, router, system, chart, config, app, crCart, app2, dialog) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            grandTotal = ko.observable(),
            isPickupDateTimeValid = ko.observable(false),
            selectedConsignments = ko.observableArray([]),
            checkAll = ko.observable(false),
            errors = ko.observableArray(),
            id = ko.observable(),
            headers = {},
            activate = function (entityId) {
                id(entityId);
                checkAll(false);
                //validate Personal Details, Default Billing Address, Default Pickup Address
                var goToDashboard = false;
                var userDetail = ko.observable();
                $.ajax({
                    url: "/api/user-details/user-profile",
                    method: "GET",
                    cache: false
                }).done(function (userDetailList) {

                    if (userDetailList._count == 0) {
                        goToDashboard = true;
                    } else {
                        userDetail(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                        if ((ko.unwrap(userDetail().Profile().Address().Postcode) == undefined)
                            || (ko.unwrap(userDetail().PickupAddress().Address().Postcode) == undefined)
                            || (ko.unwrap(userDetail().BillingAddress().Address().Postcode) == undefined)) {
                            goToDashboard = true;
                        }
                    }
                    if (goToDashboard) {
                        app.showMessage("Personal Details, Default Billing Address and Default Pickup Address must be set first before you can send any Parcel.", "OST", ["Close"]).done(function () {
                            router.navigate("customer-home");
                        });
                    }
                });
                //return context.get("/api/consigment-requests/" + entityId)
                return $.ajax({
                    url: "/api/consigment-requests/" + entityId,
                    method: "GET",
                    cache: false
                })
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
                        calculateGrandTotal();
                        crCart.activate();
                        if (entity().Payment().IsPaid()) {
                            app.showMessage("Shipment has been paid. You may proceed to new Shipment now.", "OST", ["Close"]).done(function () {
                                return router.navigate("consignment-request-cart/" + crCart.cartId());
                            });
                        } else {
                            if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                                isPickupDateTimeValid(false);
                            } else {
                                app.showMessage("Pickup has been scheduled. No changes are allowed to the Shipping Cart. You may proceed to make Payment now.", "OST", ["Close"]);
                                isPickupDateTimeValid(true);
                            }
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
                grandTotal(total.toFixed(2));
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
                return app.showMessage("Are you sure you want to remove parcel? This action cannot be undone.", "OST", ["Yes", "No"])
                    .done(function (dialogResult) {
                        if (dialogResult === "Yes") {
                            // delete selected consignment
                            entity().Consignments.remove(consignment);
                            return defaultCommand().then(function (result) {
                                if (result.success) {
                                    app.showMessage("Parcel has been successfully removed.", "OST", ["Close"]).done(function () {
                                        activate(id());
                                    });
                                } else {
                                    return Task.fromResult(false);
                                }
                            });
                        } else {
                            tcs.resolve(false);
                        }
                    });
            },
            deleteConsignments = function () {
                return app.showMessage("Are you sure you want to remove selected parcels? This action cannot be undone.", "OST", ["Yes", "No"])
                    .done(function (dialogResult) {
                        if (dialogResult === "Yes") {
                            // delete selected consignments
                            for (var i = 0; i < selectedConsignments().length; i++) {
                                entity().Consignments.remove(selectedConsignments()[i]);
                            }
                            selectedConsignments.removeAll();
                            return defaultCommand().then(function (result) {
                                if (result.success) {
                                    app.showMessage("Parcels has been successfully removed.", "OST", ["Close"]).done(function () {
                                        activate(id());
                                    });
                                }
                            });
                        }
                    })
            },
            toggleCheckAll = function () {
                var count = 0;
                $("input[name^='check-consignment-']").each(function () {
                    if (!checkAll()) {
                        if (!$(this).is(":checked")) {
                            $(this).click();
                        }
                    } else {
                        if ($(this).is(":checked")) {
                            $(this).click();
                        }
                    }
                    count++;
                });
                if (count) {
                    checkAll(!checkAll());
                }
            },
            emptyConsignmentRequest = function () {
                return app.showMessage("Are you sure you want to empty cart? This action cannot be undone.", "OST", ["Yes", "No"])
                    .done(function (dialogResult) {
                        if (dialogResult === "Yes") {
                            // delete all consignments
                            entity().Consignments.removeAll();
                            // clear pickup information
                            entity().Pickup(new bespoke.Ost_consigmentRequest.domain.Pickup());
                            return defaultCommand().then(function (result) {
                                if (result.success) {
                                    return app.showMessage("Cart has been successfully emptied.", "OST", ["Close"]).done(function () {
                                        activate(id());
                                    });
                                } else {
                                    return Task.fromResult(false);
                                }
                            });
                        } else {
                            return Task.fromResult(false);
                        }
                    });
            },
            importConsignments = function () {
                var tcs = new $.Deferred();
                // always check for pickup location
                if (entity().Pickup().Address().Postcode() === undefined) {
                    app.showMessage("You must set Pickup Location first before you can import any Parcel.", "OST", ["Close"]).done(function () {
                        tcs.resolve("OK");
                        router.navigate("consignment-request-pickup/" + id());
                    });
                } else {
                    require(['viewmodels/import.consignments.dialog', 'durandal/app'], function (dialog, app2) {
                        dialog.item().designation(ko.unwrap(entity().Designation));
                        app2.showDialog(dialog)
                            .done(function (result) {
                                tcs.resolve(result);
                                if (!result) return;
                                if (result === "OK") {
                                    var storeId = ko.unwrap(dialog.item().storeId);
                                    context.post("{}", "/consignment-request/import-consignments/" + id() + "/store-id/" + storeId).done(function (result) {
                                        console.log(result);
                                        var dialogMessage = "File successfully imported.";
                                        dialogMessage += " " + result.status;
                                        if (!result.success) {
                                            dialogMessage = "File unsuccessfully imported.";
                                            dialogMessage += " " + result.status;
                                        }
                                        app.showMessage(dialogMessage, "OST", ["Close"]).done(function () {
                                            if (result.success) {
                                                activate(id());
                                                context.put("", "/consignment-request/get-and-save-routing-code/" + ko.unwrap(entity().Id));
                                            }
                                        });
                                    });
                                }
                            });
                    });
                }
                return tcs.promise();
            },
            goToSummary = function () {
                var tcs = new $.Deferred();
                var needToCalculatePrice = false;
                for (var i = 0; i < entity().Consignments().length; i++) {
                    if (entity().Consignments()[i].Produk().Price() == null
                        || entity().Consignments()[i].Produk().Price() == 0) {
                        needToCalculatePrice = true;
                        break;
                    }
                }
                if (needToCalculatePrice) {
                    app.showMessage("Some parcels are yet to be finalized. Please verify Sender, Receiver, Parcel Information and Price before payment can be made.", "OST", ["Close"])
                        .done(function () {
                            tcs.resolve(false);
                        });
                } else {
                    tcs.resolve(true);
                    router.navigate("consignment-request-summary/" + id());
                }
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
            isPickupDateTimeValid: isPickupDateTimeValid,
            entity: entity,
            grandTotal: grandTotal,
            deleteConsignment: deleteConsignment,
            deleteConsignments: deleteConsignments,
            toggleCheckAll: toggleCheckAll,
            selectedConsignments: selectedConsignments,
            checkAll: checkAll,
            emptyConsignmentRequest: emptyConsignmentRequest,
            importConsignments: importConsignments,
            goToSummary: goToSummary
        };

        return vm;
    });