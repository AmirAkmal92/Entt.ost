define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, 'partial/address-book-update'],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app, partial) {

    var entity = ko.observable(new bespoke.Ost_addressBook.domain.AddressBook(system.guid())),
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
        watching = ko.observable(false),
        id = ko.observable(),
        partial = partial || {},
        i18n = null,
        headers = {},
        activate = function (entityId) {
            id(entityId);
            var tcs = new $.Deferred();
            context.loadOneAsync("EntityForm", "Route eq 'address-book-update'")
                .then(function (f) {
                    form(f);
                    return watcher.getIsWatchingAsync("AddressBook", entityId);
                })
                .then(function (w) {
                    watching(w);
                    return $.getJSON("i18n/" + config.lang + "/address-book-update");
                })
                .then(function (n) {
                    i18n = n[0];
                    if (!entityId || entityId === "0") {
                        return Task.fromResult({
                            WebId: system.guid()
                        });
                    }
                    return context.get("/api/address-books/" + entityId);
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
                    entity(new bespoke.Ost_addressBook.domain.AddressBook(b[0] || b));
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any AddressBook with location : " + "/api/address-books/" + entityId, "Reactive Developer platform showcase", ["OK"]);
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

            if (!validation.valid()) {
                return Task.fromResult(false);
            }

            var data = ko.mapping.toJSON(entity),
                tcs = new $.Deferred();

            context.put(data, "/api/address-books/" + ko.unwrap(entity().Id) + "", headers)
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
        }, remove = function () {
            return context.sendDelete("/api/address-books/" + ko.unwrap(entity().Id))
                .then(function (result) {
                    return app.showMessage("Your contact has been deleted", "Reactive Developer platform showcase", ["OK"]);
                })
                .then(function (result) {
                    router.navigate("address-book-home/-");
                });
        },

        attached = function (view) {
            // validation
            validation.init($('#address-book-update-form'), form());

            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        },

        compositionComplete = function () {
            $("[data-i18n]").each(function (i, v) {
                var $label = $(v),
                    text = $label.data("i18n");
                if (i18n && typeof i18n[text] === "string") {
                    $label.text(i18n[text]);
                }
            });
        },
        saveCommand = function () {
            return defaultCommand()
                .then(function (result) {
                    if (result.success) {
                        return app.showMessage("Your contact has been updated", ["OK"]);
                    } else {
                        return Task.fromResult(false);
                    }
                })
                .then(function (result) {
                    if (result) {
                        router.navigate("address-book-home/-");
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
        commands: ko.observableArray([])
    };

    return vm;
});