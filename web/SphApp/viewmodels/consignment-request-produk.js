define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

    function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            consignment = ko.observable(),
            produk = ko.observable(),
            bill = ko.observable(),
            products = ko.observableArray(),
            volumetric = ko.observable(0),
            errors = ko.observableArray(),
            id = ko.observable(),
            crid = ko.observable(),
            cid = ko.observable(),
            availableCountries = ko.observableArray(),
            selectedCountryMaxWeight = ko.observable(),
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
                //return context.get("/api/consigment-requests/" + crId)
                return $.ajax({
                    url: "/api/consigment-requests/" + crId,
                    method: "GET",
                    cache: false
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
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                    consignment(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid()));
                    produk(new bespoke.Ost_consigmentRequest.domain.Produk(system.guid()));
                    bill(new bespoke.Ost_consigmentRequest.domain.Bill(system.guid()));
                    products([]);
                    if (!cId || cId === "0") {
                        consignment().Produk(produk());
                        consignment().Bill(bill());
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
                            consignment().Bill(entity().Consignments()[editIndex].Bill());
                            consignment().Pemberi(entity().Consignments()[editIndex].Pemberi());
                            consignment().Penerima(entity().Consignments()[editIndex].Penerima());
                            cid(entity().Consignments()[i].WebId());
                        } else {
                            app.showMessage("Sorry, but we cannot find any Parcel with Id : " + cId, "OST", ["Close"]).done(function () {
                                router.navigate("consignment-request-cart/" + crId);
                            });
                        }
                    }
                    // reset price related fields
                    // always need to calculate price
                    consignment().Produk().Price(0);
                    consignment().Produk().Code("");
                    consignment().Produk().IsInternational(false);
                    consignment().Produk().ValueAddedCode("");
                    consignment().Produk().ValueAddedValue(0);
                    consignment().Produk().ValueAddedDeclaredValue(0);
                    volumetric(0);

                    // always check for pickup location 
                    if (entity().Pickup().Address().Postcode() === undefined) {
                        app.showMessage("You must set Pickup Location first before you can send any Parcel.", "OST", ["Close"]).done(function () {
                            router.navigate("consignment-request-pickup/" + crId);
                        });
                    }

                    // always check for pickup schedule
                    if (entity().Pickup().DateReady() === "0001-01-01T00:00:00" || entity().Pickup().DateClose() === "0001-01-01T00:00:00") {
                    } else {
                        app.showMessage("Pickup has been scheduled. No more changes are allowed to the Information. You may proceed to make Payment now.", "OST", ["Close"]).done(function () {
                            router.navigate("consignment-request-summary/" + crId);
                        });
                    }
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + crId, "OST", ["Close"]);
                    }
                }).always(function () {
                    context.get("/api/countries/available-country?size=300").done(function (cList) {
                        availableCountries(cList._results);
                    }).always(function () {
                        availableCountries().forEach(function (element) {
                            if (element.Abbreviation === consignment().Penerima().Address().Country()) {
                                selectedCountryMaxWeight(element.WeightLimit);
                            }
                        });
                    });
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
                if (!$("#consignment-request-produk-form").valid()) {
                    return Task.fromResult(false);
                }
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
                $("#consignment-request-produk-form").validate({
                    rules: {
                    },
                    messages: {
                    }
                });
                if (typeof partial.attached === "function") {
                    partial.attached(view);
                }

                consignment().Produk().Weight.subscribe(function (newWeight) {
                    if (consignment().Penerima().Address().Country() == "MY") { // domestic
                        // Max weight selectedCountryMaxWeight() kg
                        if (newWeight > 30) {
                    consignment().Produk().Weight(selectedCountryMaxWeight());
                        }
                        if (newWeight <= 0) {
                            consignment().Produk().Weight(null);
                        }
                    } else { // international
                        if (consignment().Produk().ItemCategory() == "Merchandise") {
                            // From 0.001 to selectedCountryMaxWeight() kg
                            if (newWeight > 30) {
                                consignment().Produk().Weight(selectedCountryMaxWeight());
                            }
                            if (newWeight <= 0) {
                                consignment().Produk().Weight(null);
                            }
                        } else if (consignment().Produk().ItemCategory() == "Document") {
                            // Less than 1.000kg
                            if (newWeight > 1) {
                                consignment().Produk().Weight(1.000);
                            }
                            if (newWeight <= 0) {
                                consignment().Produk().Weight(null);
                            }
                        } else {
                            // Max weight selectedCountryMaxWeight() kg
                            if (newWeight > 30) {
                                consignment().Produk().Weight(selectedCountryMaxWeight());
                            }
                        }
                    }
                    consignment().Produk().Price(0);
                    findProductsAsync();
                });
                consignment().Produk().Width.subscribe(function (newWidth) {
                    consignment().Produk().Price(0);
                    findProductsAsync();
                });
                consignment().Produk().Length.subscribe(function (newLength) {
                    consignment().Produk().Price(0);
                    findProductsAsync();
                });
                consignment().Produk().Height.subscribe(function (newHeight) {
                    consignment().Produk().Price(0);
                    findProductsAsync();
                });
            },
            compositionComplete = function () {

            },
            findProductsAsync = function () {
                if (!$("#consignment-request-produk-form").valid()) {
                    return;
                }
                return context.get("ost/snb-services/products/?from=" + consignment().Pemberi().Address().Postcode()
                    + "&to=" + consignment().Penerima().Address().Postcode()
                    + "&country=" + consignment().Penerima().Address().Country()
                    + "&weight=" + consignment().Produk().Weight()
                    + "&item-category=" + consignment().Produk().ItemCategory()
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
                                    consignment().Produk().Price(0);
                                    var vm = {
                                        product: v,
                                        valueAddedService: vas,
                                        consignment: consignment
                                    };
                                    context.post(ko.mapping.toJSON(vm), "/ost/snb-services/calculate-value-added-service")
                                        .done(function (result) {
                                            vas.Value(result);
                                            vas.isBusy(false);
                                            recalculatePrice(po)();
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
                    var model = ko.toJS(serviceModel),
                        request = {
                            request: {
                                ItemCategory: consignment().Produk().ItemCategory(),
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
                                Name: model.Name,
                                Description: model.Description
                            },
                            valueAddedServices: _(model.ValueAddedServices).filter(function (v) { return v.IsSelected; })
                        };
                    return context.post(ko.toJSON(request), "/ost/snb-services/calculate-published-rate")
                        .done(function (result) {
                            console.log(result.Total);
                            calculatvolumetric();
                            consignment().Produk().Price(result.Total);
                            consignment().Produk().Code(model.Code);
                            consignment().Produk().Name(model.Name);
                            consignment().Produk().IsInternational(model.IsInternational);
                            // always take the first VAS
                            if (model.ValueAddedServices[1].IsSelected) {
                                consignment().Produk().ValueAddedCode(model.ValueAddedServices[1].Code);
                                consignment().Produk().ValueAddedValue(model.ValueAddedServices[1].Value);
                                consignment().Produk().ValueAddedDeclaredValue(model.ValueAddedServices[1].UserInputs[0].Value);
                            } else {
                                consignment().Produk().ValueAddedCode("");
                                consignment().Produk().ValueAddedValue(0);
                                consignment().Produk().ValueAddedDeclaredValue(0);
                            }

                            consignment().Bill().ProductCode(result.ProductCode);
                            consignment().Bill().ProductName(result.ProductName);
                            consignment().Bill().ItemCategory(result.ItemCategory);
                            if (result.ItemCategory == "Document") {
                                consignment().Produk().ItemCategory("01");
                            } else if (result.ItemCategory == "Merchandise") {
                                consignment().Produk().ItemCategory("02");
                            }
                            consignment().Bill().RateStepInfo(result.RateStepInfo);
                            consignment().Bill().BaseRate(result.BaseRate);
                            consignment().Bill().AddOnsA(result.AddOnsA);
                            consignment().Bill().SubTotal1(result.SubTotal1);
                            consignment().Bill().AddOnsB(result.AddOnsB);
                            consignment().Bill().SubTotal2(result.SubTotal2);
                            consignment().Bill().AddOnsC(result.AddOnsC);
                            consignment().Bill().SubTotal3(result.SubTotal3);
                            consignment().Bill().AddOnsD(result.AddOnsD);
                            consignment().Bill().TotalBeforeDiscount(result.TotalBeforeDiscount);
                            consignment().Bill().Total(result.Total);
                            consignment().Bill().TaxRemark(result.TaxRemark);
                            consignment().Bill().Length(result.Length);
                            consignment().Bill().Width(result.Width);
                            consignment().Bill().Height(result.Height);
                            consignment().Bill().ActualWeight(result.ActualWeight);
                            consignment().Bill().VolumetricWeight(result.VolumetricWeight);
                            consignment().Bill().BranchCode(result.BranchCode);
                            consignment().Bill().SenderPostcode(result.SenderPostcode);
                            consignment().Bill().SenderCountryCode(result.SenderCountryCode);
                            consignment().Bill().ReceiverPostcode(result.ReceiverPostcode);
                            consignment().Bill().ReceiverCountryCode(result.ReceiverCountryCode);
                            consignment().Bill().ZoneName(result.ZoneName);
                        });
                };
            },
            calculatvolumetric = function () {
                var vlmtrc = 0;
                w = consignment().Produk().Width();
                l = consignment().Produk().Length();
                h = consignment().Produk().Height();
                vlmtrc = (w * l * h) / 6000;
                volumetric(vlmtrc);
            },
            saveCommand = function () {
                return defaultCommand()
                    .then(function (result) {
                        if (result.success) {
                            return app.showMessage("Parcel Information has been successfully saved.", "OST", ["Close"]);
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
            volumetric: volumetric,
            errors: errors,
            crid: crid,//temp
            cid: cid,//temp
            selectedCountryMaxWeight: selectedCountryMaxWeight,
            consignment: consignment,
            findProductsAsync: findProductsAsync,
            recalculatePrice: recalculatePrice,
            saveCommand: saveCommand
        };

        return vm;
    });