define(["services/datacontext"], function (context) {
    var isBusy = ko.observable(false),
        page = ko.observable(1),
        size = ko.observable(20),
        count = ko.observable(0),
        availablePageSize = ko.observableArray([10, 20, 30, 50]),
        hasNextPage = ko.observable(false),
        hasPreviousPage = ko.observable(false),
        query = "/api/consigment-requests/paid-all",
        list = ko.observableArray([]),
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
        activate = function () {
            url = ko.unwrap(query) + "?page=" + page() + "&size=" + size();
            return $.ajax({
                url: url,
                method: "GET",
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
        nextPage: nextPage,
        previousPage: previousPage,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
    };
});
