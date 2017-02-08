define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        consignment = ko.observable(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid())),
        pemberi = ko.observable(new bespoke.Ost_consigmentRequest.domain.Pemberi(system.guid())),
        errors = ko.observableArray(),
        //form = ko.observable(new bespoke.sph.domain.EntityForm()),
        //watching = ko.observable(false),
        id = ko.observable(),
        crid = ko.observable(),
        cid = ko.observable(),
        partial = partial || {},
        //i18n = null,
        headers = {},
        activate = function (crId, cId) {
            id(crId);
            crid(crId);
            cid(cId);
            var tcs = new $.Deferred();
            if (!crId || crId === "0") {
                return Task.fromResult({
                    WebId: system.guid()
                });
            }
            //context.loadOneAsync("EntityForm", "Route eq 'consigment-request-test'")
            //    .then(function (f) {
            //        form(f);
            //        return watcher.getIsWatchingAsync("ConsigmentRequest", crId);
            //    })
            //    .then(function (w) {
            //        watching(w);
            //        return $.getJSON("i18n/" + config.lang + "/consigment-request-test");
            //    })
            //    .then(function (n) {
            //        i18n = n[0];
            //        if (!crId || crId === "0") {
            //            return Task.fromResult({
            //                WebId: system.guid()
            //            });
            //        }
            //          return context.get("/api/consigment-requests/" + crId);
            return context.get("/api/consigment-requests/" + crId)
                //}).then(function (b, textStatus, xhr) {
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

                    if (!cId || cId === "0") {
                        //add pemberi (new)                    
                        consignment().Pemberi(pemberi());
                        entity().Consignments().push(consignment());
                    } else {
                        //edit pemberi (existing)
                        var editIndex = -1;
                        for (var i = 0; i < entity().Consignments().length; i++) {
                            if (entity().Consignments()[i].WebId() === cId) {
                                editIndex = i;
                                break;
                            }
                        }
                        if (editIndex != -1) {
                            consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                        }
                    }

                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + crId, "Ost", ["OK"]);
                    }
                }).always(function () {
                    if (typeof partial.activate === "function") {
                        partial.activate(ko.unwrap(entity))
                            .done(tcs.resolve)
                            .fail(tcs.reject);
                    } else {
                        tcs.resolve(true);
                    }
                });
            return tcs.promise();

        },

        defaultCommand = function () {

            //if (!validation.valid()) {
            //    return Task.fromResult(false);
            //}

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
        remove = function () {
            return context.sendDelete("/api/consigment-requests/" + ko.unwrap(entity().Id))
                .then(function (result) {
                    return app.showMessage("Successfully deleted", "Ost", ["OK"]);
                })
                .then(function (result) {
                    router.navigate("yyy");
                });
        },
        deleteConsignment = function (consignment) {
            //prompt confirmation
            entity().Consignments.remove(consignment);
            //call save
        },

        attached = function (view) {
            // validation
            //validation.init($('#consigment-request-pemberi-form'), form());

            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        },

        compositionComplete = function () {
            //$("[data-i18n]").each(function (i, v) {
            //    var $label = $(v),
            //        text = $label.data("i18n");
            //    if (i18n && typeof i18n[text] === "string") {
            //        $label.text(i18n[text]);
            //    }
            //});
        },
        saveCommand = function () {
            return defaultCommand()
                .then(function (result) {
                    if (result.success) {
                        return app.showMessage("Successfully edited", ["OK"]);
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        router.navigate("xxx");
                    }
                });
        };
    var vm = {
        partial: partial,
        activate: activate,
        config: config,
        attached: attached,
        compositionComplete: compositionComplete,
        entity: entity,
        errors: errors,
        crid: crid,//temp
        cid: cid,//temp
        consignment: consignment,
        deleteConsignment: deleteConsignment,
        toolbar: {
            removeCommand: remove,
            canExecuteRemoveCommand: ko.computed(function () {
                return entity().Id();
            }),
            saveCommand: saveCommand,
            canExecuteSaveCommand: ko.computed(function () {
                if (typeof partial.canExecuteSaveCommand === "function") {
                    return partial.canExecuteSaveCommand();
                }
                return true;
            }),

        }, // end toolbar

        commands: ko.observableArray([])
    };

    return vm;
});