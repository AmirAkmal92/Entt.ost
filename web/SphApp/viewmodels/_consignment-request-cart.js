define(['services/datacontext', 'services/logger', 'plugins/router'],
    function (context, logger, router) {
        var isBusy = ko.observable(true),
            consignmentRequest = ko.observable(),
            activate = function () {
                return context.get("/api/consigment-requests/unpaid/").done(function (crList) {
                    console.log(crList);
                    if (crList._count == 0) {
                        //create new cart
                        //TODO:
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
