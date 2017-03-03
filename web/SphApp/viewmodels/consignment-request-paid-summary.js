define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app, "services/app"],

function (context, logger, router, system, chart, config, app, app2) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        errors = ko.observableArray(),
        id = ko.observable(),
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
                    //if (entity().Payment().IsPaid()) {
                    //    if (!entity().Payment().IsPickupScheduled()) {
                    //        if (entity().Pickup().Number() === undefined) {
                    //            console.log("Schedule Pickup");
                    //            schedulePickup();
                    //        }
                    //    }
                    //    if (!entity().Payment().IsConNoteReady()) {
                    //        if (entity().Consignments()[0].ConNote() === undefined) {
                    //            console.log("Generate Connotes");
                    //            generateConNotes();
                    //        }
                    //    }
                    //}
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        schedulePickup = function () {
            var data = ko.mapping.toJSON(entity);
            return context.put(data, "/consignment-request/schedule-pickup/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + ko.unwrap(entity().Id), "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-requests-paid");
                    });
                })
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        app.showMessage("Pickup successfully scheduled.", "Ost", ["OK"]).done(function () {
                            router.activeItem().activate(result.id);
                        });
                    } else {
                        console.log(result.status);
                        app.showMessage("Sorry, but we cannot process pickup for the Paid Order with Id : " + result.id, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        generateConNotes = function () {
            var data = ko.mapping.toJSON(entity);
            return context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "")
                .fail(function (response) {
                    app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + ko.unwrap(entity().Id), "Ost", ["OK"]).done(function () {
                        router.navigate("consignment-requests-paid");
                    });
                })
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        app.showMessage("Tracking number successfully generated.", "Ost", ["OK"]).done(function () {
                            router.activeItem().activate(result.id);
                        });
                    } else {
                        console.log(result.status);
                        app.showMessage("Sorry, but we cannot process tracking number for the Paid Order with Id : " + result.id, "Ost", ["OK"]).done(function () {
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
        attached = function (view) {

        },
        compositionComplete = function () {
            if (entity().Payment().IsPaid()) {
                var data = ko.mapping.toJSON(entity);
                if (!entity().Payment().IsPickupScheduled()) {
                    if (entity().Pickup().Number() === undefined) {
                        console.log("Schedule Pickup");
                        context.put(data, "/consignment-request/schedule-pickup/" + ko.unwrap(entity().Id) + "").done(function (result) {
                            if (result.success) {
                                app.showMessage("Pickup successfully scheduled.", "Ost", ["OK"]).done(function () {
                                    if (!entity().Payment().IsConNoteReady()) {
                                        if (entity().Consignments()[0].ConNote() === undefined) {
                                            console.log("Generate Connotes");
                                            context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "").done(function (result) {
                                                if (result.success) {
                                                    app.showMessage("Tracking number successfully generated.", "Ost", ["OK"]).done(function () {
                                                        router.activeItem().activate(result.id);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
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
        entity: entity
    };

    return vm;
});