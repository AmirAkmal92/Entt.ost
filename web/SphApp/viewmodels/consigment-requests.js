define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.config, "services/_ko.list", "partial/consigment-requests", "services/app", "services/datatable"],

function (context, logger, router, chart, config, koList, partial, appAll, datatable) {

    var isBusy = ko.observable(false),
        query = "/api/consignment-requests/",
        partial = partial || {},
        appAlls = appAlls || {},
        datatable = datatable || {},
        list = ko.observableArray([]),
        App = ko.observable(),
        Datatable = ko.observable(),
        map = function (v) {
            if (typeof partial.map === "function") {
                return partial.map(v);
            }
            return v;
        },
        activate = function () {
            if (typeof partial.activate === "function") {
                //return partial.activate(list);
                return appAlls(App);
            }
            return true;
        },
        attached = function (view) {
            if (typeof partial.attached === "function") {
                partial.attached(view);
            }
        };

    var vm = {
        query: query,
        config: config,
        isBusy: isBusy,
        map: map,
        activate: activate,
        appAlls: appAlls,
        datatable: datatable,
        list: list,
        App: App,
        toolbar: {
            commands: ko.observableArray([])
        }
    };

    return vm;

});