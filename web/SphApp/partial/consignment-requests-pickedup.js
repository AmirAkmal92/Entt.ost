﻿define([], function () {
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
        showParcelsTrackTrace: showParcelsTrackTrace,
        showParcelTrackTrace: showParcelTrackTrace
    };

});