define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.system, objectbuilders.app, objectbuilders.config, "services/_ko.list"],

    function (context, logger, router, chart, system, app, config, koList) {

        var isBusy = ko.observable(false),
            query = "/api/general-ledgers/by-type/Prepaid",
            partial = partial || {},
            list = ko.observableArray([]),
            walletList = ko.observableArray([]),
            userDetail = ko.observable(new bespoke.Ost_userDetail.domain.UserDetail(system.guid())),
            id = ko.observable(),
            activate = function () {
                return $.ajax({
                    url: "/api/general-ledgers/by-type/Prepaid",
                    method: "GET",
                    cache: false
                }).then(function (wList) {
                    console.log(wList._results);
                    walletList(wList._results);
                    context.get("/api/user-details/user-profile")
                        .done(function (userDetailList) {
                            if (userDetailList._count > 0) {
                                userDetail(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                            }
                        });
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any History", "OST", ["Close"]).done(function () {
                            router.navigate("ost");
                        });
                    }
                });
            },

            printInvoice = function (item) {
                router.navigate("wallet-invoice-summary/" + item.Id);
            },

            attached = function () {

            };

        var vm = {
            query: query,
            config: config,
            isBusy: isBusy,
            activate: activate,
            attached: attached,
            walletList: walletList,
            userDetail: userDetail,
            printInvoice: printInvoice
        };

        return vm;

    });