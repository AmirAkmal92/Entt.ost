define(["services/datacontext", "services/logger", "plugins/router", "services/system",
    "services/chart", objectbuilders.config, objectbuilders.app],

function (context, logger, router, system, chart, config, app) {

    var entity = ko.observable(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(system.guid())),
        errors = ko.observableArray(),
        id = ko.observable(),
        creditCardNo = ko.observable(),
        nameCard = ko.observable(),
        expNo = ko.observable(),
        cvvNo = ko.observable(),
        headers = {},
        activate = function (entityId) {
            id(entityId);
            return context.get("/api/consigment-requests/" + entityId)
                .then(function (b, textStatus, xhr) {
                    if (xhr) {
                        var etag = xhr.getResponseHeader("ETag"),
                            lastModified = xhr.getResponseHeader("Last-Modified");
                        if (etag) {
                            headers["If-Match"] = etag;
                        }
                        if (lastModified) {
                            headers["If-Modified-Since"] = lastModified;
                        }
                    }
                    entity(new bespoke.Ost_consigmentRequest.domain.ConsigmentRequest(b[0] || b));
                }, function (e) {
                    if (e.status == 404) {
                        app.showMessage("Sorry, but we cannot find any ConsigmentRequest with location : " + "/api/consigment-requests/" + entityId, "Ost", ["OK"]);
                    }
                });

        },
        attached = function (view) {

        },
        compositionComplete = function () {

        };
    var vm = {
        activate: activate,
        config: config,
        attached: attached,
        errors: errors,
        entity: entity,
        creditCardNo: creditCardNo,
        nameCard: nameCard,
        expNo: expNo,
        cvvNo: cvvNo
    };

    return vm;
});