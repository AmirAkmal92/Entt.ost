define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "services/app"],

function (context, logger, router, system, chart, config, app, app2) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
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
                    for (var i = 0; i < entity().Consignments().length; i++) {
                        var showDetails = ko.observable(false);
                        entity().Consignments()[i].showDetails = showDetails;
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "OST", ["Close"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        schedulePickup = function () {
            var data = ko.mapping.toJSON(entity);
            return context.put(data, "/consignment-request/schedule-pickup/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                        router.navigate("consignment-requests-paid");
                    });
                })
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        app.showMessage("Pickup successfully scheduled.", "OST", ["Close"]).done(function () {
                            router.activeItem().activate(result.id);
                        });
                    } else {
                        console.log(result.status);
                        app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + result.id, "OST", ["Close"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        generateConNotes = function () {
            var data = ko.mapping.toJSON(entity);
            return context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + ko.unwrap(entity().Id), "OST", ["Close"]).done(function () {
                        router.navigate("consignment-requests-paid");
                    });
                })
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        app.showMessage("Tracking number successfully generated.", "OST", ["Close"]).done(function () {
                            router.activeItem().activate(result.id);
                        });
                    } else {
                        console.log(result.status);
                        app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + result.id, "OST", ["Close"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        showParcelTrackTrace = function (consignment) {
            require(['viewmodels/show.parcel.track.trace.dialog', 'durandal/app'], function (dialog, app2) {
                dialog.conNote(consignment.ConNote());
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (!result) return;
                        if (result === "OK") {
                        }
                    });
            });
        },
        toggleShowParcelDetails = function (parcel) {
            parcel.showDetails(!parcel.showDetails());
        },
        toggleShowBusyLoadingDialog = function (dialogtText) {
            //toggle busy loading dialog
            $('#show-busy-loading-dialog-text').text(dialogtText);
            $('#show-busy-loading-dialog').modal('toggle');
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
                window.open('http://localhost:50230/ost/print-domestic-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
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
                window.open('http://localhost:50230/ost/print-international-connote/consignment-requests/' + id() + '/consignments/' + data.WebId());
            });
        },
        attached = function (view) {
            //initialize busy loading dialog
            $('#show-busy-loading-dialog').modal({
                keyboard: false,
                show: false,
                backdrop: 'static'
            });
        },
        compositionComplete = function () {
            if ((entity().Payment().IsPaid()) && (!entity().Payment().IsConNoteReady()) && (!entity().Payment().IsPickupScheduled())) {
                app.showMessage("Payment has been accepted. Please wait a while we generate your Pickup Number and Tracking Number (s). Thank you.", "OST", ["Close"]).done(function () {
                    var data = ko.mapping.toJSON(entity);
                    if (entity().Pickup().Number() === undefined) {
                        console.log("Schedule Pickup");
                        toggleShowBusyLoadingDialog("Scheduling Pickup");
                        context.put(data, "/consignment-request/schedule-pickup/" + ko.unwrap(entity().Id) + "").done(function (result) {
                            toggleShowBusyLoadingDialog("Done");
                            if (result.success) {
                                app.showMessage("Pickup Number successfully generated.", "OST", ["Close"]).done(function () {
                                    if (entity().Consignments()[0].ConNote() === undefined) {
                                        console.log("Generate Connotes");
                                        toggleShowBusyLoadingDialog("Generating Tracking Number(s)");
                                        context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "").done(function (result) {
                                            toggleShowBusyLoadingDialog("Done");
                                            if (result.success) {
                                                app.showMessage("Tracking Number(s) successfully generated.", "OST", ["Close"]).done(function () {
                                                    //router.activeItem().activate(result.id);
                                                    toggleShowBusyLoadingDialog("Finalizing");
                                                    setTimeout(function () {
                                                        toggleShowBusyLoadingDialog("Done");
                                                        window.location.reload(true);
                                                    }, 5000);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        };
    var vm = {
        activate: activate,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        errors: errors,
        schedulePickup: schedulePickup,
        generateConNotes: generateConNotes,
        showParcelTrackTrace: showParcelTrackTrace,
        toggleShowParcelDetails: toggleShowParcelDetails,
        toggleShowBusyLoadingDialog: toggleShowBusyLoadingDialog,
        entity: entity,
        printNddConnote: printNddConnote,
        printEmsConnote: printEmsConnote
    };

    return vm;
});