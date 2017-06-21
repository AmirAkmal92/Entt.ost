define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],

    function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {
        //TODO - refactor to external file/module  
        var initialData = [
            {
                "Category": "DOCUMENT",
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
                                "name": "Insurance Zurich",
                                "None": false,
                                "isTrue": true
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
                "Category": "MERCHANDISE",
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
            IsMPS = ko.observable(false),
            errors = ko.observableArray(),
            volumetric = ko.observable(0),
            id = ko.observable(),
            crid = ko.observable(),
            cid = ko.observable(),
            partial = partial || {},
            headers = {},

            estProductService = ko.observableArray(ko.utils.arrayMap(initialData, function (data) {
                return { Category: data.Category, CategoryCode: data.CategoryCode, Products: ko.observableArray(data.Products) };
            })),

            activate = function (crId, cId) {
                id(crId);
                crid(crId);
                cid(cId);
                volumetric(0.00);
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

                            if (consignment().Penerima().Address().Country() != "MY") {
                                consignment().Produk().IsInternational(true);
                            }

                            if (consignment().Produk().Est().ValueAddedService1() == undefined) {
                                consignment().Produk().Est().ValueAddedService1("none");
                            }

                            if (consignment().Produk().Est().ValueAddedService2() == undefined) {
                                consignment().Produk().Est().ValueAddedService2("none");
                            }

                            if (consignment().Produk().Est().ValueAddedService3() == undefined) {
                                consignment().Produk().Est().ValueAddedService3("none");
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
                            if (config.profile.Designation == "Contract customer") {
                                router.navigate("consignment-request-cart-est/" + id());
                            } else {
                                router.navigate("consignment-request-cart/" + id());
                            }
                        }
                    });
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
            consignment: consignment,
            saveCommand: saveCommand,
            IsMPS: IsMPS,
            estProductService: estProductService,
        };
        return vm;
    });
