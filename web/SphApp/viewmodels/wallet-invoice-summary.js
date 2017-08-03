define(["services/datacontext", "services/logger", "plugins/router", objectbuilders.system, objectbuilders.app], function (context, logger, router, system, app) {

    var entity = ko.observableArray(),
        totalIncludeGst = ko.observableArray(),
        gstValue = ko.observableArray(),
        userDetail = ko.observable(new bespoke.Ost_userDetail.domain.UserDetail(system.guid())),
        activate = function (entityId) {
            return $.ajax({
                url: "/api/general-ledgers/" + entityId,
                method: "GET",
                cache: false
            }).then(function (wList) {
                console.log(wList);
                entity(wList);

                var gstAmount = entity().Amount * 0.06;
                var totalWithGst = entity().Amount + gstAmount;
                totalIncludeGst(totalWithGst);
                gstValue(gstAmount);

                context.get("/api/user-details/user-profile")
                    .done(function (userDetailList) {
                        if (userDetailList._count > 0) {
                            userDetail(new bespoke.Ost_userDetail.domain.UserDetail(userDetailList._results[0]));
                        }
                    });
            }, function (e) {
                if (e.status == 404) {
                    app.showMessage("Sorry, but we cannot find any Invoice with Id : " + entityId, "OST", ["Close"]).done(function () {
                        router.navigate("wallet-history");
                    });
                }
            });
        },
        attached = function (view) {

        };

    return {
        activate: activate,
        attached: attached,
        entity: entity,
        gstValue: gstValue,
        totalIncludeGst: totalIncludeGst,
        userDetail: userDetail
    };

});