define([objectbuilders.datacontext, objectbuilders.logger, objectbuilders.router,
objectbuilders.system, objectbuilders.validation, objectbuilders.eximp,
objectbuilders.dialog, objectbuilders.watcher, objectbuilders.config,
objectbuilders.app],
    function (context, logger, router, system, validation, eximp, dialog, watcher, config, app) {
        var consignment = ko.observable(),
            consignments = ko.observableArray(),
            activate = function (id) {
                consignment(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid()));
                //console.log(ko.toJSON(consignment));
                return true;
            },
            attached = function (view) {
                jQuery(document).ready(function () {
                    $("#export-consignments-form").validate({
                        rules: {
                            PemberiName: {
                                required: true
                            },
                            PenerimaName: {
                                required: true
                            },
                            productWeight: {
                                required: true,
                                number: true
                            },
                            productLength: {
                                required: true,
                                number: true
                            },
                            productWidth: {
                                required: true,
                                number: true
                            },
                            productHeight: {
                                required: true,
                                number: true
                            },
                            productDescription: {
                                required: true
                            },
                        },
                        messages: {
                            PemberiName: {
                                required: "Please select Sender."
                            },
                            PenerimaName: {
                                required: "Please select Receiver."
                            },
                            productWeight: {
                                required: "Please enter Weight.",
                                number: "Weight must be a number."
                            },
                            productLength: {
                                required: "Please enter Length.",
                                number: "Length must be a number."
                            },
                            productWidth: {
                                required: "Please enter Width.",
                                number: "Width must be a number."
                            },
                            productHeight: {
                                required: "Please enter Height.",
                                number: "Height must be a number."
                            },
                            productDescription: {
                                required: "Please enter Description."
                            },
                        }
                    });
                });

                $("#sender-company-name").select2({
                    ajax: {
                        url: "/api/address-books/",
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                q: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function (data, params) {
                            params.page = params.page || 1;
                            var results = _(data._results).map(function (v) {
                                v.id = v.Id;
                                return v;
                            });
                            return {
                                results: results,
                                pagination: {
                                    more: (params.page * 30) < data._count
                                }
                            };
                        },
                        cache: false
                    },
                    escapeMarkup: function (markup) { return markup; },
                    minimumInputLength: 3,
                    templateResult: formatRepo,
                    templateSelection: function (o) { return o.ContactPerson || o.text; }
                })
                    .on("select2:select", function (e) {
                        console.log(e);
                        var contact = e.params.data;
                        if (!contact) {
                            return;
                        }
                        fillUpContact(contact);
                    });

                //penerima lookup
                $("#receiver-company-name").select2({
                    ajax: {
                        url: "/api/address-books/",
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                q: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function (data, params) {
                            params.page = params.page || 1;
                            var results = _(data._results).map(function (v) {
                                v.id = v.Id;
                                return v;
                            });
                            return {
                                results: results,
                                pagination: {
                                    more: (params.page * 30) < data._count
                                }
                            };
                        },
                        cache: false
                    },
                    escapeMarkup: function (markup) { return markup; },
                    minimumInputLength: 3,
                    templateResult: formatRepo,
                    templateSelection: function (o) { return o.ContactPerson || o.text; }
                })
                    .on("select2:select", function (e) {
                        console.log(e);
                        var contact = e.params.data;
                        if (!contact) {
                            return;
                        }
                        fillUpContactReceiver(contact);
                    });
            },
            formatRepo = function (contact) {
                if (!contact) return "";
                if (contact.loading) return contact.text;
                var markup = "<div class='select2-result-repository clearfix'>" +
                    "<div class='select2-result-repository__avatar'><img src='/assets/admin/pages/img/avatars/user_default.png' /></div>" +
                    "<div class='select2-result-repository__meta'>" +
                    "<div class='select2-result-repository__title'>" + contact.ContactPerson + "</div>";

                markup += "<div class='select2-result-repository__description'>" + contact.CompanyName + "</div>";


                markup += "<div class='select2-result-repository__statistics'>" +
                    "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + contact.ReferenceNo + " Ref</div>" +
                    "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + contact.ContactInformation.Email + " Email</div>" +
                    "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + contact.ContactInformation.ContactNumber + " Phone</div>" +
                    "</div>" +
                    "</div></div>";

                return markup;
            },
            fillUpContact = function (contact) {
                consignment().Pemberi().CompanyName(contact.CompanyName);
                consignment().Pemberi().ContactPerson(contact.ContactPerson);
                consignment().Pemberi().Address().Address1(contact.Address.Address1);
                consignment().Pemberi().Address().Address2(contact.Address.Address2);
                consignment().Pemberi().Address().Address3(contact.Address.Address3);
                consignment().Pemberi().Address().Address4(contact.Address.Address4);
                consignment().Pemberi().Address().Postcode(contact.Address.Postcode);
                consignment().Pemberi().Address().City(contact.Address.City);
                consignment().Pemberi().Address().State(contact.Address.State);
                consignment().Pemberi().Address().Country(contact.Address.Country);
                consignment().Pemberi().ContactInformation().Email(contact.ContactInformation.Email);
                consignment().Pemberi().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                consignment().Pemberi().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
            },
            fillUpContactReceiver = function (contact) {
                consignment().Penerima().CompanyName(contact.CompanyName);
                consignment().Penerima().ContactPerson(contact.ContactPerson);
                consignment().Penerima().Address().Address1(contact.Address.Address1);
                consignment().Penerima().Address().Address2(contact.Address.Address2);
                consignment().Penerima().Address().Address3(contact.Address.Address3);
                consignment().Penerima().Address().Address4(contact.Address.Address4);
                consignment().Penerima().Address().Postcode(contact.Address.Postcode);
                consignment().Penerima().Address().City(contact.Address.City);
                consignment().Penerima().Address().State(contact.Address.State);
                consignment().Penerima().Address().Country(contact.Address.Country);
                consignment().Penerima().ContactInformation().Email(contact.ContactInformation.Email);
                consignment().Penerima().ContactInformation().AlternativeContactNumber(contact.ContactInformation.AlternativeContactNumber);
                consignment().Penerima().ContactInformation().ContactNumber(contact.ContactInformation.ContactNumber);
            },
            addConsignment = function (item) {
                if (!$("#export-consignments-form").valid()) {
                    console.log("satisfy required fields.");
                    return;
                }
                var cloneItem = ko.toJS(item);
                consignments.push(cloneItem);
            },
            deleteConsignment = function (item) {
                consignments.remove(item);
            },
            clearConsignments = function () {
                consignments.removeAll();
            },
            exportToCsv = function () {
                require(['viewmodels/export.consignments.dialog', 'durandal/app'], function (dialog, app2) {
                    app2.showDialog(dialog)
                        .done(function (result) {
                            if (!result) return;
                            if (result === "OK") {
                                generateCsvFromConsignments();
                            }
                        });
                });
            },
            compositionComplete = function () {

            },
            generateCsvFromConsignments = function () {
                var data = ko.mapping.toJSON(consignments);
                context.post(data, "consignment-request/export-consignments")
                    .fail(function (response) {
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
                    })
                    .then(function (result) {
                        if (result.status === "OK") {
                            if (result.success) {
                                var fileName = "Consignments_List";
                                window.open("/print-excel/file-path/" + result.path + "/file-name/" + fileName);
                            }
                        }
                    });
            };

        return {
            activate: activate,
            attached: attached,
            consignment: consignment,
            consignments: consignments,
            addConsignment: addConsignment,
            deleteConsignment: deleteConsignment,
            clearConsignments: clearConsignments,
            exportToCsv: exportToCsv
        };
    });
