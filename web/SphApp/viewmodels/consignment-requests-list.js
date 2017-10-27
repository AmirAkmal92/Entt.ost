define([objectbuilders.datacontext, objectbuilders.app], function (context, app) {
    var isBusy = ko.observable(false),
        page = ko.observable(1),
        size = ko.observable(20),
        count = ko.observable(0),
        availablePageSize = ko.observableArray([10, 20, 30, 50]),
        dateFrom = ko.observable(moment().format('YYYY-MM-DD')),
        dateTo = ko.observable(moment().format('YYYY-MM-DD')),
        hasNextPage = ko.observable(false),
        hasPreviousPage = ko.observable(false),
        executedQuery = ko.observable(),
        list = ko.observableArray([]),
        query = "/consignment-request/custom-search",
        elasticsearchQuery = {
            "filter": {
                "bool": {
                    "must": [
                        //push conditions in
                    ],
                    "must_not": [
                        //push conditions in
                    ],
                    "should": [
                        //push conditions in
                    ]
                }
            }
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
            if (dateFrom() == null || dateTo() == null
                || dateFrom() == '' || dateTo() == '') {
                console.log("Invalid search parameters.");
            } else {
                executedQuery("Pickup.DateReady:[" + dateFrom() + " TO " + dateTo() + "]");
                activate();
            }
        },
        clearSearch = function () {
            dateFrom(moment().format('YYYY-MM-DD'));
            dateTo(moment().format('YYYY-MM-DD'));
            executedQuery(null);
            activate();
        },
        activate = function () {
            elasticsearchQuery.filter.bool.should.push(
                { "exists": { "field": "Designation" } }
            );

            url = ko.unwrap(query) + "?page=" + page() + "&size=" + size();
            if (executedQuery() != null) url += "&q=" + executedQuery();
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
        dateFrom: dateFrom,
        dateTo: dateTo,
        nextPage: nextPage,
        previousPage: previousPage,
        reloadPage: reloadPage,
        search: search,
        clearSearch: clearSearch,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
    };
});
