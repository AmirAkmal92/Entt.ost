define([objectbuilders.system], function (system) {
    var estregistration = null,
        activate = function (entity) {

            poslajubranch = entity;

            if (poslajubranch.Id() === "0") {
                var guid = system.guid();
                poslajubranch.Id(guid);
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