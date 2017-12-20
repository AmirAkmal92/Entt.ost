define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart",
    "services/app", "plugins/dialog"],
    function (context, logger, router, system, chart, config, app, crCart, app2, dialog) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            isBusy = ko.observable(false),
            page = ko.observable(0),
            size = ko.observable(20),
            count = ko.observable(0),
            pageNumber = ko.observable(0),
            totalPerPage = ko.observable(0),
            firstOfPage = ko.observable(0),
            availablePageSize = ko.observableArray([10, 20, 50, 100]),
            errors = ko.observableArray(),
            sumWeight = ko.observable(0.00),
            sumConsignment = ko.observable(0),
            showPickupScheduler = ko.observable(false),
            pickupReadyHH = ko.observable(),
            pickupReadyMM = ko.observable(),
            pickupCloseHH = ko.observable(),
            pickupCloseMM = ko.observable(),
            hasIntParcel = ko.observable(false),
            selectedConsignments = ko.observableArray([]),
            checkAll = ko.observable(false),
            errorNum = ko.observable(-1),
            id = ko.observable(),
            headers = {},
            activate = function (entityId) {
                id(entityId);
                //validate Personal Details, Default Billing Address, Default Pickup Address
                var goToDashboard = false;
                var userDetail = ko.observable();
                hasIntParcel(false);
                checkAll(false);
                firstPage();
                errorNum(-1);
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
                        crCart.activate();
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "OST", ["Close"])
                                .done(function () {
                                    router.navigate("customer-home");
                                });
                        }
                    });
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
                                }
                            });
                        }
                    });
            },
            firstPage = function () {
                page(0);
                count(0);
            },
            nextPage = function () {
                var tmpCount = count();
                count(page() * size());
                if (count() + size() > entity().Consignments().length) {
                    count(tmpCount);
                } else {
                    page(page() + 1);
                    count(page() * size());
                }
            },
            previousPage = function () {
                if (page() >= 1) {
                    page(page() - 1);
                    count(page() * size());
                }
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
            toggleShowBusyLoadingDialog = function (dialogtText) {
                //toggle busy loading dialog
                $('#show-busy-loading-dialog-text').text(dialogtText);
                $('#show-busy-loading-dialog').modal('toggle');
            },
            generateConNotes = function () {
                var notComplete = false;
                var connotesFilled = false;
                for (var i = 0; i < entity().Consignments().length; i++) {
                    if (entity().Consignments()[i].ConNote() == null) {
                        if (entity().Consignments()[i].Produk().Weight() == null || entity().Consignments()[i].Produk().Length() == null
                            || entity().Consignments()[i].Produk().Width() == null || entity().Consignments()[i].Produk().Height() == null
                            || entity().Consignments()[i].Produk().ItemCategory() == null || entity().Consignments()[i].Produk().Width() == null
                            || entity().Consignments()[i].Produk().Height() == null || entity().Consignments()[i].Produk().Length() == null

                            || entity().Consignments()[i].Pemberi().ContactPerson() == null || entity().Consignments()[i].Pemberi().ContactInformation().ContactNumber() == null
                            || entity().Consignments()[i].Pemberi().ContactInformation().Email() == null || entity().Consignments()[i].Pemberi().Address().City() == null
                            || entity().Consignments()[i].Pemberi().Address().State() == null || entity().Consignments()[i].Pemberi().Address().Country() == null
                            || entity().Consignments()[i].Pemberi().Address().Address1() == null || entity().Consignments()[i].Pemberi().Address().Address2() == null
                            || entity().Consignments()[i].Pemberi().Address().State() == null || entity().Consignments()[i].Pemberi().Address().Country() == null

                            || entity().Consignments()[i].Penerima().Address().Postcode() == null
                            || entity().Consignments()[i].Penerima().ContactPerson() == null || entity().Consignments()[i].Penerima().ContactInformation().ContactNumber() == null
                            || entity().Consignments()[i].Penerima().ContactInformation().Email() == null || entity().Consignments()[i].Penerima().Address().City() == null
                            || entity().Consignments()[i].Penerima().Address().State() == null || entity().Consignments()[i].Penerima().Address().Country() == null
                            || entity().Consignments()[i].Penerima().Address().Address1() == null || entity().Consignments()[i].Penerima().Address().Address2() == null
                            || entity().Consignments()[i].Penerima().Address().State() == null || entity().Consignments()[i].Penerima().Address().Country() == null) {
                            notComplete = true;
                            errorNum(i);
                            break;
                        }
                        if (entity().Consignments()[i].Penerima().Address().Country() != "MY") {
                            if (entity().Consignments()[i].Produk().CustomDeclaration().ContentDescription1() == null
                                || entity().Consignments()[i].Produk().CustomDeclaration().Quantity1() == null
                                || entity().Consignments()[i].Produk().CustomDeclaration().Weight1() == null
                                || entity().Consignments()[i].Produk().CustomDeclaration().Value1() == null
                                || entity().Consignments()[i].Produk().CustomDeclaration().OriginCountry1() == null) {
                                notComplete = true;
                                errorNum(i);
                                break;
                            }
                        } else {
                            if ((entity().Consignments()[i].Penerima().Address().State() == "Sabah" || entity().Consignments()[i].Penerima().Address().State() == "Wilayah Persekutuan Labuan"
                                || entity().Consignments()[i].Penerima().Address().State() == "Sarawak")
                                && (entity().Consignments()[i].Produk().Weight() > 50)) {
                                if (entity().Consignments()[i].Produk().CustomDeclaration().ContentDescription1() == null
                                    || entity().Consignments()[i].Produk().CustomDeclaration().Quantity1() == null
                                    || entity().Consignments()[i].Produk().CustomDeclaration().Weight1() == null
                                    || entity().Consignments()[i].Produk().CustomDeclaration().Value1() == null
                                    || entity().Consignments()[i].Produk().CustomDeclaration().OriginCountry1() == null) {
                                    notComplete = true;
                                    errorNum(i);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (notComplete) {
                    app.showMessage("Parcel no " + (errorNum() + 1) + " are yet to be finalized. Please verify Sender, Receiver and Parcel Information before consignment note can be generated.", "OST", ["Close"]);

                }
                else {
                    for (var i = 0; i < entity().Consignments().length; i++) {
                        if (entity().Consignments()[i].ConNote() == null) {
                            connotesFilled = true;
                            break;
                        }
                    }
                    if (connotesFilled) {
                        var data = ko.mapping.toJSON(entity);
                        toggleShowBusyLoadingDialog("Generating Tracking Number(s)");
                        return context.put(data, "/consignment-request/generate-con-notes-est/" + ko.unwrap(entity().Id) + "")
                            .fail(function (response) {
                                app.showMessage("Sorry, but we cannot process tracking number for the Order with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                                    router.activeItem().activate(result.id);
                                });
                            })
                            .then(function (result) {
                                toggleShowBusyLoadingDialog("Done");
                                console.log(result);
                                if (result.success) {
                                    app.showMessage("Tracking number(s) successfully generated.", "OST", ["Close"]).done(function () {
                                        toggleShowBusyLoadingDialog("Finalizing");
                                        context.put(data, "/consignment-request/get-and-save-zones/" + ko.unwrap(entity().Id) + "").always(function () {
                                            toggleShowBusyLoadingDialog("Done");
                                            router.activeItem().activate(id());
                                            for (var i = 0; i < entity().Consignments().length; i++) {
                                                if (entity().Consignments()[i].Produk().IsInternational()) {
                                                    hasIntParcel(true);
                                                    break;
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    console.log(result.status);
                                    app.showMessage("Sorry, but we cannot process tracking number for the Order with Id : " + result.id, "OST", ["Close"]).done(function () {
                                        router.activeItem().activate(result.id);
                                    });
                                }
                            });
                    }
                    else {
                        app.showMessage("All parcels' consignment notes have been generated.", "OST", ["Close"]);
                    }
                }
            },
            printNddConnote = function (data) {
                window.open('/ost/print-domestic-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
            },
            printEmsConnote = function (data) {
                window.open('/ost/print-international-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
            },
            printCommercialInvoice = function (data) {
                window.open('/ost/print-commercial-invoice/consignment-requests/' + id() + '/consignments/' + data.WebId());
            },
            downloadLableConnotePDF = function (data) {
                toggleShowBusyLoadingDialog("Generating Thermal Label");
                context.put("", "/ost/print-lable-download/consignment-requests/" + id() + "/consignments/" + data.WebId())
                    .fail(function (response) {
                        logger.error("There are errors in your entity, !!!");
                    })
                    .then(function (result) {
                        if (result.status === "OK") {
                            if (result.success) {
                                window.open("/print-excel/file-path-pdf/" + result.path + "/file-name/" + data.ConNote());
                                toggleShowBusyLoadingDialog("Done");
                            }
                        }
                    });
            },
            downloadLableConnotePDFAll = function (data) {
                var textButton, textGrandTotal, pageSize = 50, total = 0, countInt = 0;
                for (var i = 0; i < data.Consignments().length; i++) {
                    if (data.Consignments()[i].ConNote() == null || data.Consignments()[i].Produk().IsInternational()) { countInt += 1; }
                }
                total = data.Consignments().length - countInt;
                firstOfPage((pageSize * pageNumber()) + 1);
                pageNumber(pageNumber() + 1);
                if (pageNumber() < Math.ceil(total / pageSize)) {
                    totalPerPage(pageSize * pageNumber());
                    textGrandTotal = total;
                    textButton = "Proceed";
                } else {
                    totalPerPage(total);
                    textGrandTotal = "Final Batch";
                    textButton = "Close";
                }
                toggleShowBusyLoadingDialog("Generating " + firstOfPage() + " - " + totalPerPage() + " of " + textGrandTotal + " Thermal Labels");
                context.put("", "/ost/print-all-lable-download/consignment-requests/" + id() + "/page/" + pageNumber())
                    .fail(function (response) {
                        logger.error("There are errors in your entity, !!!");
                    })
                    .then(function (result) {
                        if (result.status === "OK") {
                            if (result.success) {
                                window.open("/print-excel/file-path-pdf/" + result.path + "/file-name/" + data.UserId() + "_" + firstOfPage() + "_" + totalPerPage());
                                toggleShowBusyLoadingDialog("Done");
                                app.showMessage("Successfully Generated " + firstOfPage() + " - " + totalPerPage() + " of " + textGrandTotal + " Thermal Labels", "OST", [textButton]).done(function () {
                                    if (pageNumber() < Math.ceil(total / pageSize)) {
                                        setTimeout(downloadLableConnotePDFAll(data), 1500);
                                    } else {
                                        pageNumber(0),
                                            totalPerPage(0),
                                            firstOfPage(0);
                                    }
                                });
                            }
                        }
                    });
            },
            launchSchedulerDetailDialog = function () {
                // always check for pickup location before scheduling
                if (entity().Pickup().Address().Postcode() === undefined) {
                    app.showMessage("You must set Pickup Location first before you can send any Parcel.", "OST", ["Close"]).done(function () {
                        router.navigate("consignment-request-pickup/" + id());
                    });
                } else {
                    var totalParcelWeight = 0.00;
                    var totalValidConsignment = 0;
                    for (var i = 0; i < entity().Consignments().length; i++) {
                        if (entity().Consignments()[i].Produk().Weight() != null && entity().Consignments()[i].ConNote() != null) {
                            totalParcelWeight += entity().Consignments()[i].Produk().Weight();
                            totalValidConsignment += 1;
                        }
                    }
                    sumWeight(totalParcelWeight.toFixed(2));
                    sumConsignment(totalValidConsignment);

                    if (entity().Pickup().TotalParcel() == undefined) {
                        entity().Pickup().TotalParcel(sumConsignment());
                    }
                    if (entity().Pickup().TotalWeight() == undefined) {
                        entity().Pickup().TotalWeight(sumWeight());
                    }

                    if (sumConsignment() == 0) {
                        app.showMessage("Some parcels are yet to be finalized. At least one Consignment Note must be generated/printed.", "OST", ["Close"]).done(function () {
                            router.navigate("consignment-request-cart-est/" + ko.unwrap(entity().Id));
                        });
                    } else {
                        if (entity().Pickup().Number() != null) {
                            app.showMessage("Sorry, schedule for pickup already being set.", "OST", ["Close"]).done(function () {
                                router.navigate("consignment-request-cart-est/" + ko.unwrap(entity().Id));
                            });
                        } else {
                            $("#scheduler-detail-dialog").modal("show");
                        }
                    }
                }
            },
            schedulePickup = function () {
                var data = ko.mapping.toJSON(entity);
                $("#scheduler-detail-dialog").modal("hide");
                toggleShowBusyLoadingDialog("Generating Pickup Number");
                return context.put(data, "/consignment-request/schedule-pickup")
                    .fail(function (response) {
                        toggleShowBusyLoadingDialog("Done");
                        app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                            router.navigate("consignment-request-cart-est/" + result.id);
                        });
                    })
                    .then(function (result) {
                        toggleShowBusyLoadingDialog("Done");
                        console.log(result);
                        if (result.success) {
                            app.showMessage("Pickup successfully scheduled.", "OST", ["Close"]).done(function () {
                                router.activeItem().activate(result.id);
                            });
                        } else {
                            console.log(result.status);
                            app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + result.id, "OST", ["Close"]).done(function () {
                                router.navigate("consignment-request-cart-est/" + result.id);
                            });
                        }
                    });
            },
            importConsignments = function () {
                var tcs = new $.Deferred();
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
                return tcs.promise();
            },
            exportTallysheetShipment = function () {
                require(['viewmodels/export.consignment.reports.dialog', 'durandal/app'], function (dialog, app2) {
                    dialog.moduleType("shipments");
                    app2.showDialog(dialog)
                        .done(function (result) {
                            if (!result) return;
                            if (result === "OK") {
                                var location = "/consignment-request/export-tallysheet/" + ko.unwrap(entity().Id);
                                var filename = "Shipments_Tallysheet";
                                generateReportsFromConsignments(location, filename);
                            }
                        });
                });
            },
            exportPickupManifest = function () {
                require(['viewmodels/export.consignment.reports.dialog', 'durandal/app'], function (dialog, app2) {
                    dialog.moduleType("pickup-manifest");
                    app2.showDialog(dialog)
                        .done(function (result) {
                            if (!result) return;
                            if (result === "OK") {
                                var location = "/consignment-request/export-pickup-manifest/" + ko.unwrap(entity().Id);
                                var filename = "Pickup_Manifest";
                                generateReportsFromConsignments(location, filename);
                            }
                        });
                });
            },
            generateReportsFromConsignments = function (location, fileName) {
                context.put({}, location)
                    .fail(function (response) {
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
                    })
                    .then(function (result) {
                        if (result.status === "OK") {
                            if (result.success) {
                                window.open("/print-excel/file-path/" + result.path + "/file-name/" + fileName);
                            }
                        }
                    });
            },
            toggleShowPickupScheduler = function () {
                showPickupScheduler(!showPickupScheduler());
            },
            attached = function (view) {
                size.subscribe(function () {
                    activate(id());
                });
            },
            compositionComplete = function () {

            },
            saveCommand = function () {
                return defaultCommand()
                    .then(function (result) {
                        if (result.success) {
                            return app.showMessage("Parcel details has been successfully saved.", "OST", ["Close"]).done(function () {
                                activate(id());
                            });
                        } else {
                            return Task.fromResult(false);
                        }
                    });
            },
            submitPickup = function () {
                var tReady = pickupReadyHH() + ":" + pickupReadyMM() + " PM";
                var tClose = pickupCloseHH() + ":" + pickupCloseMM() + " PM";
                var timeStart = moment(tReady, "hh:mm A");
                var timeEnd = moment(tClose, "hh:mm A");
                if (timeStart < timeEnd) {
                    entity().Pickup().TotalQuantity(entity().Pickup().TotalParcel());
                    entity().Pickup().DateReady(tReady);
                    entity().Pickup().DateClose(tClose);
                    $("#scheduler-detail-dialog").modal("hide");
                    return schedulePickup();
                } else {
                    app.showMessage("Pickup time is invalid. Please set a valid pickup time.", "OST", ["Close"]);
                }
            };

        var vm = {
            activate: activate,
            config: config,
            attached: attached,
            errors: errors,
            entity: entity,
            deleteConsignment: deleteConsignment,
            deleteConsignments: deleteConsignments,
            toggleCheckAll: toggleCheckAll,
            generateConNotes: generateConNotes,
            printNddConnote: printNddConnote,
            printEmsConnote: printEmsConnote,
            printCommercialInvoice: printCommercialInvoice,
            downloadLableConnotePDF: downloadLableConnotePDF,
            downloadLableConnotePDFAll: downloadLableConnotePDFAll,
            toggleShowBusyLoadingDialog: toggleShowBusyLoadingDialog,
            launchSchedulerDetailDialog: launchSchedulerDetailDialog,
            sumWeight: sumWeight,
            sumConsignment: sumConsignment,
            importConsignments: importConsignments,
            exportTallysheetShipment: exportTallysheetShipment,
            exportPickupManifest: exportPickupManifest,
            showPickupScheduler: showPickupScheduler,
            toggleShowPickupScheduler: toggleShowPickupScheduler,
            pickupReadyHH: pickupReadyHH,
            pickupReadyMM: pickupReadyMM,
            pickupCloseHH: pickupCloseHH,
            pickupCloseMM: pickupCloseMM,
            hasIntParcel: hasIntParcel,
            selectedConsignments: selectedConsignments,
            checkAll: checkAll,
            errorNum: errorNum,
            isBusy: isBusy,
            page: page,
            size: size,
            count: count,
            availablePageSize: availablePageSize,
            nextPage: nextPage,
            previousPage: previousPage,
            saveCommand: saveCommand,
            submitPickup: submitPickup
        };
        return vm;
    });