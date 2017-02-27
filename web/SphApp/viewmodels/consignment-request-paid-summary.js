define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        isPickupNumberValid = ko.observable(false),
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
                    if (entity().Pickup().Number() === undefined) {                        
                    } else {
                        isPickupNumberValid(true);
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any Paid Order with Id : " + entityId, "Ost", ["OK"]).done(function () {
                            router.navigate("consignment-requests-paid");
                        });
                    }
                });
        },
        deactivate = function () {
            isPickupNumberValid(false);
        },
        schedulePickup = function () {
            var data = ko.mapping.toJSON(entity);
            context.put(data, "/consignment-request/schedule-pickup/" + ko.unwrap(entity().Id) + "")
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
            context.put(data, "/consignment-request/generate-con-notes/" + ko.unwrap(entity().Id) + "")
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
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        deactivate: deactivate,
        config: config,
        attached: attached,
        errors: errors,
        isPickupNumberValid: isPickupNumberValid,
        schedulePickup: schedulePickup,
        generateConNotes: generateConNotes,
        entity: entity
    };

    return vm;
});