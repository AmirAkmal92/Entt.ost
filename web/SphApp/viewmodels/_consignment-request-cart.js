define(['services/datacontext', 'services/logger', 'plugins/router', objectbuilders.system],
    function (context, logger, router, system) {
        var isBusy = ko.observable(true),
            consignmentRequest = ko.observable(),
            activate = function () {
                //return context.get("/api/consigment-requests/unpaid/")
                return $.ajax({
                    url: "/api/consigment-requests/unpaid/",
                    method: "GET",
                    cache: false
                }).done(function (crList) {
                    console.log(crList);
                    if (crList._count == 0) {
                        //create new cart
                        consignmentRequest(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid()));
                        consignmentRequest().ReferenceNo(system.guid());
                        var data = ko.mapping.toJSON(consignmentRequest);
                        context.post(data, "/api/consigment-requests/").done(function (result) {
                            consignmentRequest().Id(result.id);
                        });
                    } else {
                        //get the first one
                        consignmentRequest(crList._results[0]);
                    }
                });
            },
            attached = function (view) {

            };
        var vm = {
            isBusy: isBusy,
            consignmentRequest: consignmentRequest,
            activate: activate,
            attached: attached
        };
        return vm;
    });
