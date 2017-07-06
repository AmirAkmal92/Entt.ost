define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config, "services/_ko.list"],
function (context, logger, router, chart, config, koList) {
    var isBusy = ko.observable(false),
        //query = "/api/consigment-requests/?q=Payment.IsPaid:'true'",
        query = "/api/consigment-requests/", //TODO: create dedicated endpoint for all paid consignments
        partial = partial || {},
        list = ko.observableArray([]),
        map = function (v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function () {
            if (typeof partial.activate === "function") {
                return partial.activate(list);
            }
            return true;
        },
        attached = function (view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }
        },
        compositionComplete = function () {
            $('.form-search').hide();
            $('#developers-log-panel-collapse').click();
        };

    var vm = {
        query: query,
        config: config,
        isBusy: isBusy,
        map: map,
        activate: activate,
        attached: attached,
        compositionComplete: compositionComplete,
        list: list
    };

    return vm;

});
