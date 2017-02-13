define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        consignment = ko.observable(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid())),
        produk = ko.observable(new bespoke.Ost_consigmentRequest.domain.Produk(system.guid())),
        //pemberi = ko.observable(new bespoke.Ost_consigmentRequest.domain.Pemberi(system.guid())),
        //penerima = ko.observable(new bespoke.Ost_consigmentRequest.domain.Penerima(system.guid())),
        errors = ko.observableArray(),
        id = ko.observable(),
        crid = ko.observable(),
        cid = ko.observable(),
        jumlah = ko.observable(0),
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

                    if (!cId || cId === "0") {
                        consignment().Produk(produk());
                        entity().Consignments().push(consignment());
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
                    return app.showMessage("Parcel details has been successfully deleted", "POS Online Shipping Tools", ["OK"]);
                })
                .then(function (result) {
                    router.navigate("consignment-request-ringkasan/" + crid() + "/consignments/" + 0);
                });
        },
        deleteConsignment = function (consignment) {
            entity().Consignments.remove(consignment);
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
            console.log(entity().Consignments()[editIndex].Pemberi().Address().Postcode());
            console.log(entity().Consignments()[editIndex].Penerima().Address().Postcode());
            console.log(entity().Consignments()[editIndex].Produk().Weight());
            return context.get("ost/snb-services/products/?from=" + entity().Consignments()[editIndex].Pemberi().Address().Postcode() + "&to=" + entity().Consignments()[editIndex].Penerima().Address().Postcode() + "&weight=" + entity().Consignments()[editIndex].Produk().Weight() + "&height=" + entity().Consignments()[editIndex].Produk().Height() + "&length=" + entity().Consignments()[editIndex].Produk().Length() + "&width=" + entity().Consignments()[editIndex].Produk().Width())
                .then(function (list) {
                    // edit the = > back to => , the beatifier fucked up the ES2015 syntax
                    var list2 = list.map(function (v) {
                        var po = ko.mapping.fromJSON(v);
                        _(ko.unwrap(po.ValueAddedServices)).each(function (vas) {
                            vas.isBusy = ko.observable(false);
                            var vm = {
                                produk: v,
                                valueAddedService: vas,
                                request: entity().Consignments()[editIndex]
                            };
                            context.post(ko.mapping.toJSON(vm), "/ost/snb-services/calculate-value-added-service")
                                .done(function (result) {
                                    vas.Value(result);
                                    vas.isBusy(false);
                                });
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
                });
        },
        selectProduct = function (prd) {
            entity().Consignments()[editIndex].Produk().Code(prd.Code);
        },
        recalculatePrice = function (produk) {
            return function () {
                var request,
                editIndex = -1;
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
                console.log(entity().Consignments()[editIndex].Pemberi().Address().Postcode());
                console.log(entity().Consignments()[editIndex].Penerima().Address().Postcode());
                console.log(entity().Consignments()[editIndex].Produk().Weight());
                request = {
                    request: {
                        ItemCategory: "",
                        Weight: entity().Consignments()[editIndex].Produk().Weight(),
                        Width: entity().Consignments()[editIndex].Produk().Width(),
                        Length: entity().Consignments()[editIndex].Produk().Length(),
                        Height: entity().Consignments()[editIndex].Produk().Height(),
                        SenderPostcode: entity().Consignments()[editIndex].Pemberi().Address().Postcode(),
                        SenderCountry: entity().Consignments()[editIndex].Pemberi().Address().Country(),
                        ReceiverPostcode: entity().Consignments()[editIndex].Penerima().Address().Postcode(),
                        ReceiverCountry: entity().Consignments()[editIndex].Penerima().Address().Country()
                    },
                    product: {
                        Code: "PLD1001",
                        //Code: entity().Consignments()[editIndex].Produk().Code,
                        //Description: entity().Consignments()[editIndex].Produk().Description
                        Description: "NDD"
                    },
                    valueAddedServices: _(entity().Consignments()[editIndex].Produk().ValueAddedServices).filter(function (v) { return v.IsSelected; })
                };
                return context.post(ko.toJSON(request), "/ost/snb-services/calculate-published-rate")
                .done(function (result) {
                    console.log(result);
                    console.log(result.Total);
                    jumlah(result.Total);
                    consignment().Produk().Price(result.Total);
                });
            };
        };
    saveCommand = function () {
        return defaultCommand()
            .then(function (result) {
                if (result.success) {
                    return app.showMessage("Parcel details has been successfully saved", "POS Online Shipping Tools", ["OK"]);
                } else {
                    return Task.fromResult(false);
                }
            })
            .then(function (result) {
                if (result) {
                    router.navigate("consignment-request-ringkasan/" + crid() + "/consignments/" + 0);
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
        jumlah: jumlah,//temp
        consignment: consignment,
        deleteConsignment: deleteConsignment,
        findProductsAsync: findProductsAsync,
        recalculatePrice: recalculatePrice,
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