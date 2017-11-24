define([objectbuilders.datacontext, objectbuilders.dialog, objectbuilders.system, objectbuilders.app],
    function (context, dialog, system, app) {
        var ConsignmentRequestId = ko.observable(),
            Consignment = ko.observable(new bespoke.Ost_consigmentRequest.domain.Consignment(system.guid())),
            printA4 = function (item) {
                if (ConsignmentRequestId() == "" || ConsignmentRequestId() == undefined) return;
                if (item.Penerima().Address().Country() === "MY") {
                    window.open('/ost/print-domestic-connote/consignment-requests/' + ConsignmentRequestId() + '/consignments/' + item.WebId());
                } else {
                    window.open('/ost/print-international-connote/consignment-requests/' + ConsignmentRequestId() + '/consignments/' + item.WebId());
                }
            },
            printThermal = function (item) {
                if (ConsignmentRequestId() == "" || ConsignmentRequestId() == undefined) return;
                context.put("", "/ost/print-lable-download/consignment-requests/" + ConsignmentRequestId() + "/consignments/" + item.WebId())
                    .fail(function (response) {
                        logger.error("There are errors in your consignment !!!");
                    })
                    .then(function (result) {
                        if (result.status === "OK") {
                            if (result.success) {
                                window.open("/print-excel/file-path-pdf/" + result.path + "/file-name/" + item.ConNote());
                            }
                        }
                    });
            },
            showRtsPickupFormatDetails = function (item) {
                return $.ajax({
                    url: "/api/rts-pickup-formats/consignment-no/" + item.ConNote(),
                    method: "GET",
                    cache: false
                }).done(function (rPFList) {
                    console.log(rPFList);
                    if (rPFList._count == 0) {                        
                        app.showMessage("No pickup event can be found for " + item.ConNote() + ".", "OST", ["Close"])
                    } else {
                        //get the first one                        
                        window.open("/sph#rts-pickup-format-details/" + rPFList._results[0].Id);
                    }
                });
            },
            okClick = function (data, ev) {
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                dialog.close(this, "Cancel");
            };

        var vm = {
            ConsignmentRequestId: ConsignmentRequestId,
            Consignment: Consignment,
            printA4: printA4,
            printThermal: printThermal,
            showRtsPickupFormatDetails: showRtsPickupFormatDetails,
            okClick: okClick,
            cancelClick: cancelClick
        };

        return vm;
    });
