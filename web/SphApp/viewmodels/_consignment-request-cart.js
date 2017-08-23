define(['services/datacontext', 'services/logger', 'plugins/router', objectbuilders.system, objectbuilders.config],
    function (context, logger, router, system, config) {
        var isBusy = ko.observable(true),
            consignmentRequest = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
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
                        consignmentRequest().UserId(config.userName);                        
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
            attached: attached,
            config: config
        };
        return vm;
    });
