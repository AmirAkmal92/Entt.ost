define([objectbuilders.datacontext, objectbuilders.app], function (context, app) {
    var isBusy = ko.observable(false),
        page = ko.observable(1),
        size = ko.observable(20),
        count = ko.observable(0),
        availablePageSize = ko.observableArray([10, 20, 30, 50, 100]),
        useDate = ko.observable(false),
        dateFrom = ko.observable(moment().format('YYYY-MM-DD')),
        dateTo = ko.observable(moment().format('YYYY-MM-DD')),
        useField = ko.observable(false),
        fieldType = ko.observable(),
        fieldValue = ko.observable(),
        hasNextPage = ko.observable(false),
        hasPreviousPage = ko.observable(false),
        list = ko.observableArray([]),
        query = "/consignment-request/custom-search",
        availableQueries = ko.observableArray([
            { "fieldName": "Reference No", "fieldText": "ReferenceNo" },
            { "fieldName": "User Id", "fieldText": "UserId" },
            { "fieldName": "Pickup No", "fieldText": "Pickup.Number" },
            { "fieldName": "Pickup Date", "fieldText": "Pickup.DateReady" },
            { "fieldName": "Connote No", "fieldText": "Consignments.ConNote" },
            { "fieldName": "Designation", "fieldText": "Designation" }
        ]),
        elasticsearchQuery = {
            "query": {
                "bool": {
                    "must": [],
                    "must_not": []
                }
            },
            "filter": {
                "bool": {
                    "must": [],
                    "must_not": [
                        {
                            "missing": {
                                "field": "Designation"
                            }
                        }
                    ]
                }
            },
            "sort": [
                {
                    "ChangedDate": {
                        "order": "desc"
                    }
                }
            ]
        },
        firstPage = function () {
            page(1);
            count(0);
            activate();
        },
        nextPage = function () {
            if (hasNextPage()) {
                page(page() + 1);
                activate();
            }
        },
        previousPage = function () {
            if (hasPreviousPage()) {
                page(page() - 1);
                activate();
            }
        },
        reloadPage = function () {
            window.location.reload(true);
        },
        search = function () {
            elasticsearchQuery.query.bool.must = [];
            elasticsearchQuery.query.bool.must_not = [];
            if (useDate()) {
                if (dateFrom() == null || dateTo() == null
                    || dateFrom() == '' || dateTo() == '') {
                    console.log("Invalid search parameters.");
                    return;
                } else {
                    elasticsearchQuery.query.bool.must.push(
                        { "range": { "ChangedDate": { "from": `${dateFrom()}`, "to": `${dateTo()}` } } }
                    );
                }
            }
            if (useField()) {
                if (fieldType() != undefined && fieldValue() != undefined) {
                    if (fieldType() == "Pickup.DateReady") {
                        elasticsearchQuery.query.bool.must.push(
                            { "range": { [`${fieldType()}`]: { "gte": `${fieldValue()}`, "lte": `${fieldValue()}` } } }
                        );
                    } else {
                        elasticsearchQuery.query.bool.must.push(
                            { "term": { [`${fieldType()}`]: `${fieldValue()}` } }
                        );
                    }
                }
            }
            activate();
        },
        clearSearch = function () {
            useDate(false);
            dateFrom(moment().format('YYYY-MM-DD'));
            dateTo(moment().format('YYYY-MM-DD'));
            useField(false);
            fieldType(null);
            fieldValue(null);
            elasticsearchQuery.query.bool.must_not = [];
            elasticsearchQuery.query.bool.must = [];
            activate();
        },
        showConsignmentDetailsDialog = function (consignment) {
            require(['viewmodels/show.consignment.details.dialog', 'durandal/app'], function (dialog, app2) {
                dialog.Consignment(new bespoke.Ost_consigmentRequest.domain.Consignment(consignment));
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (!result) return;
                        if (result === "OK") {
                        }
                    });
            });
        },
        showPickupDetailsDialog = function (consignmentRequest) {
            require(['viewmodels/show.pickup.details.dialog', 'durandal/app'], function (dialog, app2) {
                dialog.Pickup(new bespoke.Ost_consigmentRequest.domain.Pickup(consignmentRequest.Pickup));
                app2.showDialog(dialog)
                    .done(function (result) {
                        if (!result) return;
                        if (result === "OK") {
                        }
                    });
            });
        },
        activate = function () {
            url = ko.unwrap(query) + "?page=" + page() + "&size=" + size();
            var data = ko.toJSON(elasticsearchQuery);
            return $.ajax({
                url: url,
                data: data,
                method: "POST",
                contentType: "application/json; charset=utf-8",
                cache: false
            })
                .then(function (lo) {
                    list(lo._results);
                    count(lo._count);
                    hasNextPage(count() > size() * page());
                    hasPreviousPage(page() > 1);
                });
        },
        attached = function (view) {
            $('#pager-page-size').change(function () {
                firstPage();
            });
            $("#DateFrom").kendoDatePicker({
                dateInput: true,
                format: "yyyy-MM-dd"
            });
            $("#DateTo").kendoDatePicker({
                dateInput: true,
                format: "yyyy-MM-dd"
            });
        },
        compositionComplete = function () {
            $('#developers-log-panel-collapse').click();
        };

    return {
        query: query,
        isBusy: isBusy,
        activate: activate,
        attached: attached,
        compositionComplete: compositionComplete,
        list: list,
        page: page,
        size: size,
        count: count,
        availablePageSize: availablePageSize,
        useDate: useDate,
        dateFrom: dateFrom,
        dateTo: dateTo,
        useField: useField,
        fieldType: fieldType,
        fieldValue: fieldValue,
        nextPage: nextPage,
        previousPage: previousPage,
        reloadPage: reloadPage,
        search: search,
        clearSearch: clearSearch,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        showConsignmentDetailsDialog: showConsignmentDetailsDialog,
        showPickupDetailsDialog: showPickupDetailsDialog,
        availableQueries: availableQueries,
    };
});
