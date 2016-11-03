define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app, 'partial/consignment-request-product'],

function(context, logger, router, system, validation, eximp, dialog, watcher, config, app, partial) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        errors = ko.observableArray(),
        form = ko.observable(new bespoke.sph.domain.EntityForm()),
        watching = ko.observable(false),
        id = ko.observable(),
        partial = partial || {},
        i18n = null,
        headers = {},
        activate = function(entityId) {
            id(entityId);
            var tcs = new $.Deferred();
            context.loadOneAsync("EntityForm", "Route eq 'consignment-request-product'")
                .then(function(f) {
                form(f);
                return watcher.getIsWatchingAsync("ConsigmentRequest", entityId);
            })
                .then(function(w) {
                watching(w);
                return $.getJSON("i18n/" + config.lang + "/consignment-request-product");
            })
                .then(function(n) {
                i18n = n[0];
                if (!entityId || entityId === "0") {
                    return Task.fromResult({
                        WebId: system.guid()
                    });
                }
                return context.get("/api/consigment-requests/" + entityId);
            }).then(function(b, textStatus, xhr) {

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
            }, function(e) {
                if (e.status == 404) {
                    app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "Reactive Developer platform showcase", ["OK"]);
                }
            }).always(function() {
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

        attached = function(view) {
            // validation
            validation.init($('#consignment-request-product-form'), form());

            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        },

        findProductsAsync = function() {

            var cons = ko.toJS(entity);
            return context.get("snb-services/products/?from=" + cons.Sender.Address.Postcode + "&to=" + cons.Receivers[0].Address.Postcode + "&country=" + cons.Receivers[0].Address.Country + "&weight=" + cons.Product.Weight + "&height=" + cons.Product.Volume.Height + "&length=" + cons.Product.Volume.Length + "&width=" + cons.Product.Volume.Width)
                .then(function(list) {
                // edit the = > back to => , the beatifier fucked up the ES2015 syntax
                var list2 = list.map(function(v) {

                    var po = ko.mapping.fromJS(v);
                    _(ko.unwrap(po.ValueAddedServices)).each(function(vas) {
                        vas.isBusy = ko.observable(false);
                        var evaluateValue = function() {

                            vas.isBusy(true);
                            var vm = {
                                product: v,
                                valueAddedService: vas,
                                request: entity
                            };
                            context.post(ko.mapping.toJSON(vm), "/snb-services/calculate-value-added-service")
                                .done(function(result) {
                                vas.Value(result);
                                vas.isBusy(false);
                            });
                        };

                        if (ko.unwrap(vas.UserInputs).length === 0) {
                            vas.IsSelected.subscribe(function(selected) {
                                if (selected) {
                                    evaluateValue();
                                } else {
                                    vas.Value(0);
                                }
                            });

                        } else {
                            _(ko.unwrap(vas.UserInputs)).each(function(uv) {
                                uv.Value.subscribe(evaluateValue);
                            });

                        }
                    });

                    return po;

                });
                partial.products(list2);
            });
        },

        addReceiversCommand = function() {

            if (!validation.valid()) {
                return Task.fromResult(false);
            }

            var data = ko.mapping.toJSON(entity),
                tcs = new $.Deferred();

            context.put(data, "/api/consigment-requests/" + ko.unwrap(entity().Id) + "/actions/add-receivers", headers)
                .fail(function(response) {
                var result = response.responseJSON;
                errors.removeAll();
                if (response.status === 428) {
                    // out of date conflict
                    logger.error(result.message);
                }
                if (response.status === 422 && _(result.rules).isArray()) {
                    _(result.rules).each(function(v) {
                        errors(v.ValidationErrors);
                    });
                }
                logger.error("There are errors in your entity, !!!");
                tcs.resolve(false);
            })
                .then(function(result) {
                logger.info(result.message);
                entity().Id(result.id);
                errors.removeAll();
                tcs.resolve(result);
            });
            return tcs.promise();
        },
        putAddReceiversCommand = function() {
            return addReceiversCommand()
                .then(function(result) {
                if (result) {
                    router.navigate("consignment-request-custom-declaration/" + entity().Id());
                }
            });
        },
        compositionComplete = function() {
            $("[data-i18n]").each(function(i, v) {
                var $label = $(v),
                    text = $label.data("i18n");
                if (i18n && typeof i18n[text] === "string") {
                    $label.text(i18n[text]);
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
        findProductsAsync: findProductsAsync,
        putAddReceiversCommand: putAddReceiversCommand,
        toolbar: {

        }, // end toolbar

        commands: ko.observableArray([])
    };

    return vm;
});