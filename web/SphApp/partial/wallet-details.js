define([objectbuilders.system], function (system) {
    var wallet = null,
        activate = function (entity) {

            wallet = entity;

            if (wallet.Id() === "0") {
                var guid = system.guid();
                wallet.Id(guid);
            }

            var tcs = new $.Deferred();
            setTimeout(function () {
                tcs.resolve(true);
            }, 500);

            return tcs.promise();


        },
        attached = function (view) {

        };

    return {
        activate: activate,
        attached: attached
    };

});