/// <reference path="../../Scripts/jquery-2.1.3.intellisense.js" />
/// <reference path="../../Scripts/knockout-3.4.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../schema/sph.domain.g.js" />


define(["plugins/dialog"],
    function(dialog) {

        var page = ko.observable(1),
            isDelimiter = ko.observable(false),
            backEnable = ko.computed(function() {
                return ko.unwrap(page) > 1;
            }),
            nextEnable  = ko.computed(function() {
                return ko.unwrap(page) < 5;
            }),
            okEnable = ko.observable(false),
            backClick = function() {
                page(ko.unwrap(page) -1);
            },
            nextClick = function() {
                page(ko.unwrap(page) + 1);
            },
            okClick = function (data, ev) {
                if (bespoke.utils.form.checkValidity(ev.target)) {
                    dialog.close(this, "OK");
                }

            },
            cancelClick = function() {
                dialog.close(this, "Cancel");
            };

        var vm = {
            adapter: ko.observable(new bespoke.sph.domain.FlatFileAdapter()),
            backClick: backClick,
            nextClick: nextClick,
            okClick: okClick,
            backEnable: backEnable,
            nextEnable: nextEnable,
            okEnable: okEnable,
            isDelimiter: isDelimiter,
            page : page,

            cancelClick: cancelClick
        };


        return vm;

    });
