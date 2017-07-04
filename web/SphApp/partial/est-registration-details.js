define([objectbuilders.system], function (system) {
    var estregistration = null,
        activate = function (entity) {

            estregistration = entity;

            if (estregistration.Id() === "0") {
                var guid = system.guid();
                estregistration.Id(guid);
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