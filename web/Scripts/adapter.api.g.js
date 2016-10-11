
/// <reference path="~/scripts/knockout-3.4.0.debug.js" />
/// <reference path="~/Scripts/underscore.js" />
/// <reference path="~/Scripts/moment.js" />

var bespoke = bespoke || {};
bespoke.sph = bespoke.sph || {};
bespoke.sph.domain = bespoke.sph.domain || {};
bespoke.sph.domain.api = bespoke.sph.domain.api || {};


bespoke.sph.domain.api.TableDefinition = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.TableDefinition, domain.sph",
        Name: ko.observable(""),
        IsSelected: ko.observable(false),
        AllowRead: ko.observable(false),
        AllowInsert: ko.observable(false),
        AllowUpdate: ko.observable(false),
        AllowDelete: ko.observable(false),
        Schema: ko.observable(""),
        VersionColumn: ko.observable(""),
        ModifiedDateColumn: ko.observable(""),
        ColumnCollection: ko.observableArray([]),
        ChildRelationCollection: ko.observableArray([]),
        ParentRelationCollection: ko.observableArray([]),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.TableDefinitionPartial) {
        return _(model).extend(new bespoke.sph.domain.api.TableDefinitionPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.Column = function (optionOrWebid) {

    var v = new bespoke.sph.domain.api.Member(optionOrWebid);

    v.IsPrimaryKey = ko.observable(false);

    v.IsVersion = ko.observable(false);

    v.IsModifiedDate = ko.observable(false);

    v.IsComputed = ko.observable(false);

    v.IsIdentity = ko.observable(false);

    v["$type"] = "Bespoke.Sph.Domain.Api.Column, domain.sph";


    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof v[n] === "function") {
                    v[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        v.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.ColumnPartial) {
        return _(v).extend(new bespoke.sph.domain.api.ColumnPartial(v));
    }
    return v;
};



bespoke.sph.domain.api.ColumnMetadata = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.ColumnMetadata, domain.sph",
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.ColumnMetadataPartial) {
        return _(model).extend(new bespoke.sph.domain.api.ColumnMetadataPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.OperationDefinition = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.OperationDefinition, domain.sph",
        Name: ko.observable(""),
        MethodName: ko.observable(""),
        IsOneWay: ko.observable(false),
        IsSelected: ko.observable(false),
        Schema: ko.observable(""),
        ParameterDefinition: ko.observable(new bespoke.sph.domain.api.ParameterDefinition()),
        RequestMemberCollection: ko.observableArray([]),
        ResponseMemberCollection: ko.observableArray([]),
        ErrorRetry: ko.observable(new bespoke.sph.domain.api.ErrorRetry()),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.OperationDefinitionPartial) {
        return _(model).extend(new bespoke.sph.domain.api.OperationDefinitionPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.ErrorRetry = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.ErrorRetry, domain.sph",
        Attempt: ko.observable(0),
        IsEnabled: ko.observable(false),
        Wait: ko.observable(0),
        Algorithm: ko.observable('WaitAlgorithm'),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.ErrorRetryPartial) {
        return _(model).extend(new bespoke.sph.domain.api.ErrorRetryPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.ParameterDefinition = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.ParameterDefinition, domain.sph",
        Name: ko.observable(""),
        IsRequest: ko.observable(false),
        IsResponse: ko.observable(false),
        CodeNamespace: ko.observable(""),
        MemberCollection: ko.observableArray([]),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.ParameterDefinitionPartial) {
        return _(model).extend(new bespoke.sph.domain.api.ParameterDefinitionPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.TableRelation = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.TableRelation, domain.sph",
        Table: ko.observable(""),
        Constraint: ko.observable(""),
        Column: ko.observable(""),
        ForeignColumn: ko.observable(""),
        IsSelected: ko.observable(false),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.TableRelationPartial) {
        return _(model).extend(new bespoke.sph.domain.api.TableRelationPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.Adapter = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.Adapter, domain.sph",
        Name: ko.observable(""),
        Description: ko.observable(""),
        TableDefinitionCollection: ko.observableArray([]),
        OperationDefinitionCollection: ko.observableArray([]),
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.AdapterPartial) {
        return _(model).extend(new bespoke.sph.domain.api.AdapterPartial(model));
    }
    return model;
};



bespoke.sph.domain.api.Member = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.Member, domain.sph",
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }


    if (bespoke.sph.domain.api.MemberPartial) {
        return _(model).extend(new bespoke.sph.domain.api.MemberPartial(model));
    }
    return model;
};


bespoke.sph.domain.api.Member = function (optionOrWebid) {

    var model = {
        "$type": "Bespoke.Sph.Domain.Api.Member, domain.sph",
        isBusy: ko.observable(false),
        WebId: ko.observable()
    };
    if (optionOrWebid && typeof optionOrWebid === "object") {
        for (var n in optionOrWebid) {
            if (optionOrWebid.hasOwnProperty(n)) {
                if (typeof model[n] === "function") {
                    model[n](optionOrWebid[n]);
                }
            }
        }
    }
    if (optionOrWebid && typeof optionOrWebid === "string") {
        model.WebId(optionOrWebid);
    }

    if (bespoke.sph.domain.api.MemberPartial) {
        return _(model).extend(new bespoke.sph.domain.api.MemberPartial(model));
    }
    return model;
};


bespoke.sph.domain.api.WaitAlgorithm = function () {
    return {
        CONSTANT: 'Constant',
        LINEAR: 'Linear',
        EXPONENTIAL: 'Exponential',

        DO_NOT_SELECT: 'DONTDOTHIS'
    };
}();

