define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        consignment = ko.observable(),
        produk = ko.observable(),
        products = ko.observableArray(),
        errors = ko.observableArray(),
        id = ko.observable(),
        crid = ko.observable(),
        cid = ko.observable(),
        partial = partial || {},
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
            return context.get("/api/consigment-requests/" + crId)
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
                    consignment(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid()));
                    produk(new bespoke.Ost_consigmentRequest.domain.Produk(system.guid()));                   
                    products([]);
                    if (!cId || cId === "0") {
                        consignment().Produk(produk());
                        entity().Consignments().push(consignment());
                        cid(consignment().WebId());
                    } else {
                        var editIndex = -1;
                        for (var i = 0; i < entity().Consignments().length; i++) {
                            if (entity().Consignments()[i].WebId() === cId) {
                                editIndex = i;
                                break;
                            }
                        }
                        if (editIndex != -1) {
                            consignment().Produk(entity().Consignments()[editIndex].Produk());
                            consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                            consignment().Penerima(entity().Consignments()[editIndex].Penerima());
                            cid(entity().Consignments()[i].WebId());
                        } else {
                            app.showMessage("Sorry, but we cannot find any Parcel with Id : " + cId, "Ost", ["OK"]).done(function () {
                                router.navigate("consignment-request-cart/" + crId);
                            });
                        }
                    }
                    consignment().Produk().Price(0);

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
        attached = function (view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }

        },
        compositionComplete = function () {

        },
        findProductsAsync = function () {
            var editIndex = -1;
            for (var i = 0; i < entity().Consignments().length; i++) {
                if (entity().Consignments()[i].WebId() === cid()) {
                    editIndex = i;
                    break;
                }
            }
            if (editIndex != -1) {
                consignment().Produk(entity().Consignments()[editIndex].Produk());
                consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                consignment().Penerima(entity().Consignments()[editIndex].Penerima());
            }
            return context.get("ost/snb-services/products/?from=" + consignment().Pemberi().Address().Postcode()
                                + "&to=" + consignment().Penerima().Address().Postcode()
                                + "&country=" + consignment().Penerima().Address().Country()
                                + "&weight=" + consignment().Produk().Weight()
                                + "&height=" + consignment().Produk().Height()
                                + "&length=" + consignment().Produk().Length()
                                + "&width=" + consignment().Produk().Width()).then(function (list) {
                                    // edit the = > back to => , the beatifier fucked up the ES2015 syntax
                                    var list2 = list.map(function (v) {

                                        var po = ko.mapping.fromJS(v);
                                        _(ko.unwrap(po.ValueAddedServices)).each(function (vas) {
                                            vas.isBusy = ko.observable(false);
                                            var evaluateValue = function () {

                                                vas.isBusy(true);
                                                var vm = {
                                                    product: v,
                                                    valueAddedService: vas,
                                                    request: entity
                                                };
                                                context.post(ko.mapping.toJSON(vm), "/ost/snb-services/calculate-value-added-service")
                                                    .done(function (result) {
                                                        vas.Value(result);
                                                        vas.isBusy(false);
                                                    });
                                            };

                                            if (ko.unwrap(vas.UserInputs).length === 0) {
                                                vas.IsSelected.subscribe(function (selected) {
                                                    if (selected) {
                                                        evaluateValue();
                                                    } else {
                                                        vas.Value(0);
                                                    }
                                                });

                                            } else {
                                                _(ko.unwrap(vas.UserInputs)).each(function (uv) {
                                                    uv.Value.subscribe(evaluateValue);
                                                });

                                            }
                                        });

                                        po.TotalCost = ko.observable();
                                        // TODO -> go and get the rate
                                        recalculatePrice(po)();
                                        return po;

                                    });
                                    products(list2);
                                });
        },
        recalculatePrice = function (serviceModel) {
            console.log(ko.toJS(serviceModel));

            return function () {

                var editIndex = -1;
                for (var i = 0; i < entity().Consignments().length; i++) {
                    if (entity().Consignments()[i].WebId() === cid()) {
                        editIndex = i;
                        break;
                    }
                }
                if (editIndex != -1) {
                    consignment().Produk(entity().Consignments()[editIndex].Produk());
                    consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                    consignment().Penerima(entity().Consignments()[editIndex].Penerima());
                }
                var model = ko.toJS(serviceModel),
                request = {
                    request: {
                        ItemCategory: "",
                        Weight: consignment().Produk().Weight(),
                        Width: consignment().Produk().Width(),
                        Length: consignment().Produk().Length(),
                        Height: consignment().Produk().Height(),
                        SenderPostcode: consignment().Pemberi().Address().Postcode(),
                        SenderCountry: consignment().Pemberi().Address().Country(),
                        ReceiverPostcode: consignment().Penerima().Address().Postcode(),
                        ReceiverCountry: consignment().Penerima().Address().Country()
                    },
                    product: {
                        Code: model.Code,
                        Description: model.Description
                    },
                    valueAddedServices: _(model.ValueAddedServices).filter(function (v) { return v.IsSelected; })
                };
                return context.post(ko.toJSON(request), "/ost/snb-services/calculate-published-rate")
                .done(function (result) {
                    console.log(result.Total);
                    consignment().Produk().Price(result.Total);
                });
            };
        };
    saveCommand = function () {
        return defaultCommand()
            .then(function (result) {
                if (result.success) {
                    return app.showMessage("Parcel Information has been successfully saved", "POS Online Shipping Tools", ["OK"]);
                } else {
                    return Task.fromResult(false);
                }
            })
            .then(function (result) {
                if (result) {
                    router.navigate("consignment-request-cart/" + crid());
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
        products: products,
        errors: errors,
        crid: crid,//temp
        cid: cid,//temp
        consignment: consignment,
        findProductsAsync: findProductsAsync,
        recalculatePrice: recalculatePrice,
        saveCommand: saveCommand
    };

    return vm;
});