define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

    function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {
        //TODO - refactor to external file/module  
        var initialData = [
            {
                "Category": "Document",
                "CategoryCode": "01",
                "Products": [
                    {
                        "Product": "DOMESTIC",
                        "ProductCode": "80000000",
                        "AdditionalProduct": [
                            {
                                "name": "SDD (Local Town)",
                            },
                            {
                                "name": "SDD (Cross Town)",
                            },
                            {
                                "name": "TCS (Domestic)",
                            },
                            {
                                "name": "VIP (Normal)",
                            }
                        ],
                        "AdditionalService": [
                            {
                                "name": "Zurich Insurance",
                                "None": false,
                                "isTrue": true
                            },
                            {
                                "name": "Etiqa Insurance",
                                "None": true,
                                "isTrue": false
                            }
                            //{
                            //    "name": "DO Acknowledgement",
                            //    "None": true,
                            //    "isTrue": false
                            //}
                        ]
                    },
                    {
                        "Product": "BORNEO ECONOMY EXPRESS",
                        "ProductCode": "80001128",
                        "AdditionalProduct": [],
                        "AdditionalService": [
                            {
                                "name": "Insurance Zurich",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    },
                    {
                        "Product": "HAMPER",
                        "ProductCode": "80001149",
                        "AdditionalProduct": [],
                        "AdditionalService": []
                    },
                    {
                        "Product": "PUTRAJAYA EXPRES",
                        "ProductCode": "80000004",
                        "AdditionalProduct": [
                            {
                                "name": "VIP (Normal)",
                                "Vip": false
                            }
                        ],
                        "AdditionalService": [
                            {
                                "name": "Insurance Zurich",
                                "None": true,
                                "isTrue": false
                            },
                            {
                                "name": "Packaging",
                                "None": true,
                                "isTrue": false
                            },
                            {
                                "name": "DO Acknowledgement",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    },
                    {
                        "Product": "ECONFAST 2.0",
                        "ProductCode": "80001198",
                        "AdditionalProduct": [],
                        "AdditionalService": [
                            {
                                "name": "Insurance",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    }
                ]
            },
            {
                "Category": "Merchandise",
                "CategoryCode": "02",
                "Products": [
                    {
                        "Product": "DOMESTIC",
                        "ProductCode": "80000000",
                        "AdditionalProduct": [
                            {
                                "name": "TCS (Domestic)",
                                "Tcs": false
                            },
                            {
                                "name": "VIP (Normal)",
                                "Vip": false
                            }
                        ],
                        "AdditionalService": [
                            {
                                "name": "Zurich Insurance",
                                "None": true,
                                "isTrue": false
                            },
                            {
                                "name": "Etiqa Insurance",
                                "None": true,
                                "isTrue": false
                            }
                            //{
                            //    "name": "DO Acknowledgement",
                            //    "None": true,
                            //    "isTrue": false
                            //}
                        ]
                    },
                    {
                        "Product": "BORNEO ECONOMY EXPRESS",
                        "ProductCode": "80001128",
                        "AdditionalProduct": [],
                        "AdditionalService": [
                            {
                                "name": "Insurance Zurich",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    },
                    {
                        "Product": "HAMPER",
                        "ProductCode": "80001149",
                        "AdditionalProduct": [],
                        "AdditionalService": []
                    },
                    {
                        "Product": "PEP",
                        "ProductCode": "80000002",
                        "AdditionalProduct": [],
                        "AdditionalService": [
                            {
                                "name": "Insurance Zurich",
                                "None": true,
                                "isTrue": false
                            },
                            {
                                "name": "Packaging",
                                "None": true,
                                "isTrue": false
                            },
                            {
                                "name": "DO Acknowledgement",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    },
                    {
                        "Product": "ECONFAST 2.0",
                        "ProductCode": "80001198",
                        "AdditionalProduct": [],
                        "AdditionalService": [
                            {
                                "name": "Insurance",
                                "None": true,
                                "isTrue": false
                            }
                        ]
                    }
                ]
            }
        ];

        var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
            consignment = ko.observable(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid())),
            produk = ko.observable(new bespoke.Ost_consigmentRequest.domain.Produk(system.guid())),
            errors = ko.observableArray(),
            volumetric = ko.observable(0),
            isInsuredValueAdded = ko.observable(false),
            id = ko.observable(),
            crid = ko.observable(),
            cid = ko.observable(),
            availableCountries = ko.observableArray(),
            selectedCountryMaxWeight = ko.observable(),
            method = ko.observable('none'),
            isHasInsurance = ko.observable(false),
            selectPod = ko.observable(''),
            partial = partial || {},
            headers = {},
            isBorneo = ko.observable(false),

            estProductService = ko.observableArray(ko.utils.arrayMap(initialData, function (data) {
                return { Category: data.Category, CategoryCode: data.CategoryCode, Products: ko.observableArray(data.Products) };
            })),

            activate = function (crId, cId) {
                id(crId);
                crid(crId);
                cid(cId);
                isInsuredValueAdded(false);
                isHasInsurance(false);
                volumetric(0.00);
                method('none');
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
                                consignment().BabyConnotesTotal = entity().Consignments()[editIndex].BabyConnotesTotal;
                                consignment().IsMps = entity().Consignments()[editIndex].IsMps;
                            }

                            if (consignment().Penerima().Address().Country() != "MY") {
                                consignment().Produk().IsInternational(true);
                            } else {
                                consignment().Produk().IsInternational(false);
                                if (consignment().Penerima().Address().State() === "Sabah"
                                    || consignment().Penerima().Address().State() === "Sarawak"
                                    || consignment().Penerima().Address().State() === "Wilayah Persekutuan Labuan") {
                                    isBorneo(true);
                                } else {
                                    isBorneo(false);
                                }
                            }

                            if (consignment().Produk().ValueAddedDeclaredValue() != undefined) {
                                isInsuredValueAdded(true);
                                isHasInsurance(true);
                            }

                            if (consignment().Produk().Est().ValueAddedService() == undefined) {
                                consignment().Produk().Est().ValueAddedService("none");
                            }

                            if (consignment().Produk().Height != null && consignment().Produk().Length != null
                                && consignment().Produk().Width != null) {
                                calculateVolumetric();
                            }

                            if (consignment().IsMps() === true) {
                                method('mps');
                            } else if (consignment().Produk().Est().CodAmount() > 0 || consignment().Produk().Est().CcodAmount() > 0) {
                                method('pod');
                            }

                            if (consignment().Produk().Est().CodAmount() > 0 && consignment().Produk().Est().CcodAmount() === undefined) {
                                selectPod('cod');
                            } else if (consignment().Produk().Est().CcodAmount() > 0 && consignment().Produk().Est().CodAmount() === undefined) {
                                selectPod('ccod');
                            }
                        }
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + crId, "Ost", ["OK"]);
                        }
                    }).always(function () {
                        context.get("/api/countries/available-country?size=300").done(function (cList) {
                            availableCountries(cList._results);
                        }).always(function () {
                            availableCountries().forEach(function (element) {
                                if (element.Abbreviation === consignment().Penerima().Address().Country()) {
                                    selectedCountryMaxWeight(element.WeightLimit);
                                    if (consignment().Penerima().Address().Country() === "MY") {
                                        selectedCountryMaxWeight(999.999);
                                    }
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
                if (typeof partial.attached === "function") {
                    partial.attached(view);
                }
                jQuery(document).ready(function () {
                    $("#consignment-request-produk-form").validate({
                        rules: {
                            BabyConnotesTotal: {
                                required: true,
                                digits: true,
                            }
                        },
                        messages: {
                            BabyConnotesTotal: {
                                required: "Please enter digits only."
                            }
                        }
                    });
                });

                consignment().Produk().Est().ValueAddedService.subscribe(function (value) {
                    if (value == 'none') {
                        consignment().Produk().ValueAddedDeclaredValue(null);
                    }
                });

                consignment().IsMps.subscribe(function (value) {
                    if (value == false) {
                        consignment().BabyConnotesTotal(0);
                    }
                });

                consignment().Produk().ItemCategory.subscribe(function (itemCode) {
                    consignment().Produk().Weight(null);
                });

                consignment().Produk().Weight.subscribe(function (newWeight) {
                    if (consignment().Penerima().Address().Country() == "MY") {
                        if (consignment().Produk().ItemCategory() == "02") {
                            if (isBorneo() == true && newWeight > 50) {
                                consignment().Produk().Est().IsBorneo(true);
                            } else {
                                consignment().Produk().Est().IsBorneo(false);
                            }
                            // From 0.001 to selectedCountryMaxWeight kg
                            if (newWeight > selectedCountryMaxWeight()) {
                                consignment().Produk().Weight(selectedCountryMaxWeight());
                            }
                            if (newWeight <= 0) {
                                consignment().Produk().Weight(null);
                            }
                        } else if (consignment().Produk().ItemCategory() == "01") {
                            // Less than 1.000kg
                            if (newWeight > 2) {
                                consignment().Produk().Weight(2.000);
                            }
                            if (newWeight <= 0) {
                                consignment().Produk().Weight(null);
                            }
                        } else {
                            // Max weight selectedCountryMaxWeight() kg
                            if (newWeight > selectedCountryMaxWeight()) {
                                consignment().Produk().Weight(selectedCountryMaxWeight());
                            }
                        }
                    }
                    else { //IsInternational
                        if (consignment().Produk().ItemCategory() == "02") {
                            // From 0.001 to selectedCountryMaxWeight() kg
                            if (newWeight > selectedCountryMaxWeight()) {
                                consignment().Produk().Weight(selectedCountryMaxWeight());
                            }
                            if (newWeight <= 0) {
                                consignment().Produk().Weight(null);
                            }
                        } else if (consignment().Produk().ItemCategory() == "01") {
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
                });
                consignment().Produk().Height.subscribe(function (value) {
                    if (consignment().Produk().Height != null
                        && consignment().Produk().Length != null
                        && consignment().Produk().Width != null) {
                        calculateVolumetric();
                    }
                });
                consignment().Produk().Length.subscribe(function (value) {
                    if (consignment().Produk().Height != null
                        && consignment().Produk().Length != null
                        && consignment().Produk().Width != null) {
                        calculateVolumetric();
                    }
                });
                consignment().Produk().Width.subscribe(function (value) {
                    if (consignment().Produk().Height != null
                        && consignment().Produk().Length != null
                        && consignment().Produk().Width != null) {
                        calculateVolumetric();
                    }
                });

                consignment().Produk().Est().ValueAddedService.subscribe(function (value) {
                    if (value === "none") {
                        isInsuredValueAdded(false);
                    } else {
                        isInsuredValueAdded(true);
                    }
                });

                consignment().IsMps.subscribe(function (value) {
                    if (value == true) {
                        consignment().Produk().Est().CodAmount(0);
                        consignment().Produk().Est().CcodAmount(0);
                    }
                });

                consignment().Produk().Est().CodAmount.subscribe(function (value) {
                    if (value > 0) {
                        consignment().IsMps(false);
                        consignment().BabyConnotesTotal(0);
                        consignment().Produk().Est().CcodAmount(0);
                    }
                });

                consignment().Produk().Est().CcodAmount.subscribe(function (value) {
                    if (value > 0) {
                        consignment().IsMps(false);
                        consignment().BabyConnotesTotal(0);
                        consignment().Produk().Est().CodAmount(0);
                    }
                });

                isHasInsurance.subscribe(function (value) {
                    if (value == false) {
                        consignment().Produk().Est().ValueAddedService('none');
                        consignment().Produk().Est().ValueAddedServicePackage('none');
                        consignment().Produk().ValueAddedDeclaredValue(0);
                        consignment().Produk().ValueAddedValue(0);
                    }
                });

                consignment().Produk().Est().ValueAddedService.subscribe(function (value) {
                    if (value == 'zurich' || value == 'etiqa') {
                        consignment().Produk().Est().ValueAddedServicePackage('none');
                        consignment().Produk().ValueAddedDeclaredValue(0);
                        consignment().Produk().ValueAddedValue(0);
                    }
                });

                consignment().Produk().Est().ValueAddedServicePackage.subscribe(function (value) {
                    if (value == 'normal' || value == 'valuable') {
                        consignment().Produk().ValueAddedDeclaredValue(0);
                        consignment().Produk().ValueAddedValue(0);
                    }
                });

                consignment().Produk().ValueAddedDeclaredValue.subscribe(function (value) {
                    if (value > 0) {
                        if (consignment().Produk().Est().ValueAddedService() == 'zurich') {
                            if (consignment().Produk().ValueAddedDeclaredValue() > 0 && consignment().Produk().ValueAddedDeclaredValue() <= 1000) {
                                consignment().Produk().ValueAddedValue(0.50);
                            }
                            if (consignment().Produk().ValueAddedDeclaredValue() > 1000 && consignment().Produk().ValueAddedDeclaredValue() <= 2000) {
                                consignment().Produk().ValueAddedValue(0.60);
                            }
                            if (consignment().Produk().ValueAddedDeclaredValue() > 2000 && consignment().Produk().ValueAddedDeclaredValue() <= 3000) {
                                consignment().Produk().ValueAddedValue(0.70);
                            }
                            if (consignment().Produk().ValueAddedDeclaredValue() > 3000) {
                                consignment().Produk().ValueAddedValue(0.80);
                            }
                        }
                        if (consignment().Produk().Est().ValueAddedService() == 'etiqa' && consignment().Produk().Est().ValueAddedServicePackage() == 'normal') {
                            if (value > 0) {
                                var valueDeclared = 0;
                                valueDeclared = (consignment().Produk().ValueAddedDeclaredValue() * 0.15) / 100;
                                if (valueDeclared < 1.50) {
                                    consignment().Produk().ValueAddedValue(1.50);
                                }
                                else {
                                    consignment().Produk().ValueAddedValue(valueDeclared);
                                }
                            }
                        }
                        if (consignment().Produk().Est().ValueAddedService() == 'etiqa' && consignment().Produk().Est().ValueAddedServicePackage() == 'valuable') {
                            if (value > 0) {
                                var valueDeclared = 0;
                                valueDeclared = (consignment().Produk().ValueAddedDeclaredValue() * 2.15) / 100;
                                consignment().Produk().ValueAddedValue(valueDeclared);
                            }
                        }
                    }
                    else {
                        consignment().Produk().ValueAddedValue(0);
                    }
                });
            },
            compositionComplete = function () {

            },
            calculateVolumetric = function () {
                var totalVolumetric = 0.00;
                if (consignment().Produk().Width() > 0 && consignment().Produk().Length() > 0 && consignment().Produk().Height() > 0) {
                    totalVolumetric = consignment().Produk().Width() * consignment().Produk().Length() * consignment().Produk().Height();
                    totalVolumetric = totalVolumetric / 6000;
                    volumetric(totalVolumetric);
                }
            },
            saveCommand = function () {
                return defaultCommand()
                    .then(function (result) {
                        if (result.success) {
                            return app.showMessage("Parcel details has been successfully saved.", "OST", ["Close"]);
                        } else {
                            return Task.fromResult(false);
                        }
                    })
                    .then(function (result) {
                        if (result) {
                            context.put("", "/consignment-request/get-and-save-routing-code/" + id());
                            if (config.profile.Designation == "Contract customer") {
                                router.navigate("consignment-request-cart-est/" + id());
                            } else {
                                router.navigate("consignment-request-cart/" + id());
                            }
                        }
                    });
            },
            launchInsuranceInfoDialog = function () {
                $("#info-dialog").modal("show");
            };

        var vm = {
            partial: partial,
            activate: activate,
            config: config,
            attached: attached,
            compositionComplete: compositionComplete,
            calculateVolumetric: calculateVolumetric,
            volumetric: volumetric,
            entity: entity,
            errors: errors,
            crid: crid,//temp
            cid: cid,//temp
            isInsuredValueAdded: isInsuredValueAdded,
            consignment: consignment,
            saveCommand: saveCommand,
            estProductService: estProductService,
            selectedCountryMaxWeight: selectedCountryMaxWeight,
            method: method,
            isHasInsurance: isHasInsurance,
            selectPod: selectPod,
            launchInsuranceInfoDialog: launchInsuranceInfoDialog
        };
        return vm;
    });
