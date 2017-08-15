define(["services/datacontext"], function (context) {
    var activate = function (list) {

        var tcs = new $.Deferred();
        setTimeout(function () {
            tcs.resolve(true);
        }, 500);

        return tcs.promise();


    },
    attached = function (view) {

    },
    map = function (v) {
        return v;
    },
    exportTallysheetPickup = function (consignment) {
        require(['viewmodels/export.tallysheet.dialog', 'durandal/app'], function (dialog, app2) {
            dialog.moduleType("pickups");
            app2.showDialog(dialog)
                .done(function (result) {
                    if (!result) return;
                    if (result === "OK") {
                        generateTallysheetFromConsignments(consignment.Id);
                    }
                });
        });
    },
    generateTallysheetFromConsignments = function (id) {
        context.put({}, "/consignment-request/export-tallysheet/" + id)
            .fail(function (response) {
                if (response.status === 428) {
                    // out of date conflict
                    logger.error(result.message);
                }
                if (response.status === 422 && _(result.rules).isArray()) {
                    _(result.rules).each(function (v) {
                        errors(v.ValidationErrors);
                    });
                }
                logger.error("There are errors in your entity, !!!");
            })
            .then(function (result) {
                if (result.status === "OK") {
                    if (result.success) {
                        var fileName = "Pickups_Tallysheet";
                        window.open("/print-excel/file-path/" + result.path + "/file-name/" + fileName);
                    }
                }
            });
    },
    showParcelsTrackTrace = function (consignmentRequest) {
        console.log(consignmentRequest);
        var tmpConNotes = "";
        var cnList = consignmentRequest.Consignments;
        for (var i = 0; i < cnList.length; i++) {
            tmpConNotes = tmpConNotes.concat(cnList[i].ConNote + "; ");
        }
        require(['viewmodels/show.parcels.track.trace.dialog', 'durandal/app'], function (dialog, app2) {
            dialog.conNotes(tmpConNotes);
            app2.showDialog(dialog)
                .done(function (result) {
                    if (!result) return;
                    if (result === "OK") {
                    }
                });
        });
    },
    showParcelTrackTrace = function (consignmentRequest) {
        require(['viewmodels/show.parcel.track.trace.dialog', 'durandal/app'], function (dialog, app2) {
            console.log(consignmentRequest);
            dialog.conNote(consignmentRequest.ConNote);
            app2.showDialog(dialog)
                .done(function (result) {
                    if (!result) return;
                    if (result === "OK") {
                    }
                });
        });
    };

    return {
        activate: activate,
        attached: attached,
        map: map,
        exportTallysheetPickup: exportTallysheetPickup,
        showParcelsTrackTrace: showParcelsTrackTrace,
        showParcelTrackTrace: showParcelTrackTrace
    };

});