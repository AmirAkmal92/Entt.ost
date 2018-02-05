define(['services/datacontext', 'services/logger', 'plugins/router', objectbuilders.system, objectbuilders.config],
    function (context, logger, router, system, config) {
        var isBusy = ko.observable(true),
            parcelCount = ko.observable(),
            cartId = ko.observable(),
            consignmentRequest = new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid()),
            activate = function () {
                //return context.get("/api/consigment-requests/unpaid/")
                return $.ajax({
                    url: "/api/consigment-requests/unpaid/",
                    method: "GET",
                    cache: false
                }).done(function (crList) {
                    //console.log(crList);
                    if (crList._count == 0) {
                        //create new cart
                        consignmentRequest.UserId(config.userName);
                        consignmentRequest.Designation(config.profile.Designation);
                        var data = ko.mapping.toJSON(consignmentRequest);
                        context.post(data, "/api/consigment-requests/").done(function (result) {
                            cartId(result.id);
                            parcelCount("0");
                        });
                    } else {
                        //get the first one
                        context.get("/consignment-request/get-total-consignment/" + ko.unwrap(crList._results[0].Id)).done(function (result) {
                            cartId(result.id);
                            parcelCount(result.totalConsignment);
                        });
                    }
                });
            },
            attached = function (view) {

            };
        var vm = {
            isBusy: isBusy,
            parcelCount: parcelCount,
            cartId: cartId,
            activate: activate,
            attached: attached,
            config: config
        };
        return vm;
    });
