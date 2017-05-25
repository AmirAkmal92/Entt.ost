/// <reference path="../../Scripts/jquery-2.1.0.intellisense.js" />
/// <reference path="../../Scripts/knockout-3.0.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../schema/sph.domain.g.js" />


define(["plugins/dialog"],
    function (dialog) {

        var copy = function () {
                $("#prompt-value").focus()
                        .select();
                document.execCommand("copy");
            },
            canCopy = ko.observable(false),
            value = ko.observable(),
            okClick = function () {
                dialog.close(this, "OK");
            },
            cancelClick = function () {
                dialog.close(this, "Cancel");
            },
            attached = function () {
                setTimeout(function () {
                    $("#prompt-value").focus()
                    .select();
                }, 500);
            };

        var vm = {
            title: ko.observable("Ezisend"),
            copy: copy,
            canCopy: canCopy,
            label: ko.observable(""),
            value: value,
            attached: attached,
            okClick: okClick,
            cancelClick: cancelClick
        };


        return vm;

    });
