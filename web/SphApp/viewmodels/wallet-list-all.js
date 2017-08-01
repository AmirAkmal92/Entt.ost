define(["services/datacontext", "services/logger", "plugins/router", "services/chart", objectbuilders.system, objectbuilders.app, objectbuilders.config, "services/_ko.list"],

    function (context, logger, router, chart, system, app, config, koList) {

        var appId = ko.observable(),
            appData = ko.observable(),
            appUrl = ko.observable(),
            paymentCode = ko.observable(''),
            paymentGatewayReminder = ko.observable(false),
            walletList = ko.observableArray([]),
            activate = function () {
                return $.ajax({
                    url: "/api/wallet",
                    method: "GET",
                    cache: false
                }).then(function (wList) {
                    console.log(wList._results);
                    walletList(wList._results);
                });
            },
            paymentGateWay = function (wallet) {
                app.showMessage("You will be redirected to Pos Malaysia Payment Switch.<br /> Do not leave or refresh your browser until payment is successful.<br /> Please click 'Pay Now'.", "OST", ["Close"]).done(function () {
                    return context.get("/ost-payment/ps-request-prepaid/" + wallet.Id).then(function (result) {
                        if (result.success) {
                            appId(result.id);
                            appData(result.data);
                            appUrl(result.url);
                            paymentGatewayReminder(true);
                            paymentCode(wallet.WalletCode);
                        }
                    }, function (e) {
                        if (e.status == 404) {
                            app.showMessage("Sorry, but we cannot process your Payment for the topup with WalletCode  : " + wallet.WalletCode, "OST", ["Close"]).done(function () {
                                return router.navigate("wallet-list-all");
                            });
                        }
                    });
                });                
            },
            attached = function () {
                
            };

        var vm = {
            activate: activate,
            walletList: walletList,
            attached: attached,
            paymentGateWay: paymentGateWay,
            appId: appId,
            appData: appData,
            appUrl: appUrl,
            paymentGatewayReminder: paymentGatewayReminder,
            paymentCode: paymentCode
        };

        return vm;

    }
);