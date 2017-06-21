define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "viewmodels/_consignment-request-cart",
    "services/app", "plugins/dialog"],
    function (context, logger, router, system, chart, config, app, crCart, app2, dialog) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            errors = ko.observableArray(),
            id = ko.observable(),
            headers = {},
            activate = function (entityId) {
                id(entityId);
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
                        crCart.activate();
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "OST", ["Close"]);
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
                                } else {
                                    return Task.fromResult(false);
                                }
                            });
                        } else {
                            tcs.resolve(false);
                        }
                    });
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
                    if (entity().Consignments()[i].Produk().Weight() == null
                        || entity().Consignments()[i].Penerima().Address().Postcode() == null) {
                        notComplete = true;
                        break;
                    }
                }
                if (notComplete) {
                    app.showMessage("Some parcels are yet to be finalized. Please verify Sender, Receiver, Parcel Information and Price before payment can be made.", "OST", ["Close"]);
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
                                app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                                    router.activeItem().activate(result.id);
                                });
                            })
                            .then(function (result) {
                                toggleShowBusyLoadingDialog("Done");
                                console.log(result);
                                if (result.success) {
                                    app.showMessage("Tracking number(s) successfully generated.", "OST", ["Close"]).done(function () {
                                        router.activeItem().activate(result.id);
                                    });
                                } else {
                                    console.log(result.status);
                                    app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + result.id, "OST", ["Close"]).done(function () {
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
                var msg = "";
                msg += "    <p>Before you start printing, please set your printer setting as below:</p>";
                msg += "    <ul class='list-unstyled'>";
                msg += "        <li><i class='fa fa-chrome'></i> <a href='../../Content/Files/Chrome_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Chrome guide</li>";
                msg += "        <li><i class='fa fa-firefox'></i> <a href='../../Content/Files/FireFox_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Firefox guide</li>";
                msg += "        <li><i class='fa fa-opera'></i> <a href='../../Content/Files/Opera_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Opera guide</li>";
                msg += "    </ul>";
                app.showMessage(msg, "OST", ["Close"]).done(function () {
                    window.open('/ost/print-domestic-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
                });
            },
            printEmsConnote = function (data) {
                var msg = "";
                msg += "    <p>Before you start printing, please set your printer setting as below:</p>";
                msg += "    <ul class='list-unstyled'>";
                msg += "        <li><i class='fa fa-chrome'></i> <a href='../../Content/Files/Chrome_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Chrome guide</li>";
                msg += "        <li><i class='fa fa-firefox'></i> <a href='../../Content/Files/FireFox_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Firefox guide</li>";
                msg += "        <li><i class='fa fa-opera'></i> <a href='../../Content/Files/Opera_Browser_Printer_Setting.pdf' target='_blank'>Donwload</a> Opera guide</li>";
                msg += "    </ul>";
                app.showMessage(msg, "OST", ["Close"]).done(function () {
                    window.open('/ost/print-international-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
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
            entity: entity,
            deleteConsignment: deleteConsignment,
            generateConNotes: generateConNotes,
            printNddConnote: printNddConnote,
            printEmsConnote: printEmsConnote,
            toggleShowBusyLoadingDialog: toggleShowBusyLoadingDialog
        };
        return vm;
    });