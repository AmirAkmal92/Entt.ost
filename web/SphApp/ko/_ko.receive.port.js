///<reference path="../../Scripts/jstree.min.js"/>
///<reference path="../../Scripts/require.js"/>
///<reference path="../../Scripts/underscore.js"/>
///<reference path="../../SphApp/objectbuilders.js"/>
///<reference path="../../SphApp/schemas/form.designer.g.js"/>
///<reference path="../../SphApp/partial/ReceivePortPartial.js"/>
///<reference path="../../Scripts/jquery-2.2.0.intellisense.js"/>
/**
 * @param {{Id,TableDefinitionCollection:function, ControllerActionCollection:function, OperationDefinitionCollection:function,ColumnCollection:function,ChildRelationCollection,Table, Schema, Name}} adapter
 * @param{{create_node:function, get_node:function, jstree:function, rename_node, set_type: function, delete_node:function, get_type:function, get_selected:function, set_selected:function}} jstree
 * @param{{system:string, searchTextBox:string}} objectbuilders
 * @param{{RequestMemberCollection:function,ResponseMemberCollection:function, Uuid:string , IsSelected : function, Order: function}} OperationDefinition
 * @param{{LookupColumnTable:function, IsEnabled, IsComplex, Ignore, IsComputed, IsPrimaryKey:boolean, Unsupported:boolean}} column
 * @param {{ port: object, MemberCollection:function}} port
 * @param {{ debounce:function}} _
 */

/*globals define, console */
define(["knockout", "objectbuilders", "underscore"], function (ko, objectbuilders, _) {
    "use strict";

    ko.bindingHandlers.portTree = {
        init: function (element, valueAccessor) {
            var system = require(objectbuilders.system),
                value = valueAccessor(),
                port = ko.unwrap(value.port),
                searchbox = ko.unwrap(value.searchbox),
                selectedField = value.selected,
                jsTreeData = {
                    text: port.Entity(),
                    state: {
                        opened: true,
                        selected: true
                    }
                },
                getNodeMemberType = function (v) {
                    var type = ko.unwrap(v.TypeName) || ko.unwrap(v.$type);
                    if (type.indexOf(",") < 0) {
                        type = ko.unwrap(v.$type);
                    }
                    // complex
                    if (v.FieldMappingCollection().length > 0) {
                        return "complex";
                    }

                    return type;
                },
                computeNodeText = function (fieldMapping, $index) {
                    const field = ko.toJS(fieldMapping),
                        uri = field.$type === "Bespoke.Sph.Domain.UriFieldMapping, domain.sph"
                            ? " <i class='fa fa-link column-icon' style='margin-left:5px;color:orange' title='Uri information'></i>"
                            : "",
                        header = field.$type === "Bespoke.Sph.Domain.HeaderFieldMapping, domain.sph"
                            ? " <i class='fa fa-envelope-o column-icon' style='margin-left:5px;color:orange' title='Header information'></i>"
                            : "",
                        nullable = field.IsNullable
                            ? " <i class='fa fa-question column-icon' style='margin-left:5px;color:darkgreen' title='Nullable'></i>"
                            : "",
                        ignore = field.Ignore
                            ? " <i class='fa fa-eye-slash column-icon' style='margin-left:5px;color:grey' title='Ignored : will not serialized into Json object for submitting to API'></i>"
                            : "",
                        sample = field.SampleValue;
                    if ($index)
                        return `${$index}. ${field.Name}${nullable}${ignore} (${sample}) ${uri} ${header}`;
                    return `${field.Name}${nullable}${ignore} (${sample})`;
                },
                nullableSubscription = null,
                ignoreSubscription = null,
                nameSubscription = null,
                typeNameSubscription = null,
                mapFieldsToNodes = function (fields) {
                    let $index = 0;
                    return ko.unwrap(fields).map(function (v) {
                        const type = getNodeMemberType(v);
                        if (type !== "complex") {
                            $index++;
                        }
                        return {
                            text: computeNodeText(v, $index),
                            state: "open",
                            type: type,
                            data: v,
                            $index: $index,
                            webid : ko.unwrap(v.WebId)
                        };
                    });
                },
                recurseChildMember = function (node) {
                    node.children = mapFieldsToNodes(node.data.FieldMappingCollection);
                    _(node.children).each(recurseChildMember);
                },
                disposeSubscriptions = function (...subs) {
                    subs.forEach(v => {
                        if (v) {
                            v.dispose();
                            v = null;
                        }
                    });
                },
                loadJsTree = function () {
                    jsTreeData.children = mapFieldsToNodes(port.FieldMappingCollection);
                    _(jsTreeData.children).each(recurseChildMember);
                    $(element)
                        .on("select_node.jstree", function (node, selected) {
                            if (typeof selectedField !== "function") {
                                return;
                            }
                            disposeSubscriptions(nameSubscription, nullableSubscription, ignoreSubscription, typeNameSubscription);

                            const $node = selected.node,
                                 field = $node.data,
                                 ref = $(element).jstree(true),
                                 $index =$node.original.$index;
                            if (field && $node.type !== "default") {
                                selectedField(field);

                                const nodeTextChanged = function () {
                                    const text = computeNodeText(field, $index);
                                    $(`#${$node.id}`).find(`>a.jstree-anchor>i.column-icon`).remove();
                                    ref.rename_node($node, text);
                                };
                                nameSubscription = field.Name.subscribe(nodeTextChanged);
                                ignoreSubscription = field.Ignore.subscribe(nodeTextChanged);
                                nullableSubscription = field.IsNullable.subscribe(nodeTextChanged);
                                // type
                                if (ko.isObservable(field.TypeName)) {
                                    typeNameSubscription = field.TypeName.subscribe( t => ref.set_type($node, t));
                                }
                            }
                        })
                        .on("create_node.jstree", function (event, node) {
                            console.log(node, "node");
                        })
                        .jstree({
                            "core": {
                                "animation": 0,
                                "check_callback": function (operation, node, nodeParent, nodePosition, more) {
                                    if (operation === "move_node") {
                                        var mbr = node.data,
                                            ref = $(element).jstree(true),
                                            target = ref.get_node(nodeParent);
                                        if (!mbr) {
                                            return false;
                                        }
                                        if (!target) {
                                            return false;
                                        }

                                        return true;
                                    }
                                    return true;
                                },
                                "themes": { "stripes": true },
                                'data': jsTreeData
                            },
                            "contextmenu": {
                                "items": function ($node) {

                                    const field = $node.data,
                                        $index = $node.original.$index,
                                        ref = $(element).jstree(true),
                                        setNodeText = function(col) {
                                            const text = computeNodeText(col, $index);
                                            $(`#${$node.id}`).find(`>a.jstree-anchor>i.column-icon`).remove();
                                            ref.rename_node($node, text);
                                        };

                                    let  sel = ref.get_selected();

                                    if ($node.type === "default") {
                                        const addHeaderField = {
                                                  label:"Add header field",
                                                  action : function() {
                                                      port.addHeaderFieldMapping().done(function(f) {
                                                          if (!f) {
                                                              return false;
                                                          }
                                                          const headerNode = {
                                                                    text: computeNodeText(f, $node.children.length + 1),
                                                                    state: "open",
                                                                    type: getNodeMemberType(f),
                                                                    data: f,
                                                                    $index: $node.children.length + 1,
                                                                    webid: ko.unwrap(f.WebId)
                                                                };;
                                                          if (!sel.length) {
                                                              return false;
                                                          }
                                                          sel = sel[0];
                                                          sel = ref.create_node(sel, headerNode);
                                                          return true;

                                                      });
                                                  }
                                              },
                                          addUriField = {
                                              label: "Add uri field",
                                              action: function () {
                                                  port.addUriFieldMapping();
                                              }
                                          };
                                        return [addHeaderField, addUriField];
                                    }

                                    const removeField = {
                                        label: "Remove",
                                        action: function () {
                                            const field2 = port.FieldMappingCollection()
                                                .find(x => ko.unwrap(field.WebId) === ko.unwrap(x.WebId));
                                            port.FieldMappingCollection.remove(field2);
                                            ref.delete_node($node);
                                            selectedField(null);

                                        }
                                    },ignore = {
                                        label: "Ignore",
                                        action: function () {
                                            field.Ignore(true);
                                            setNodeText($node.data);

                                        }
                                    }, include = {
                                        label: "Include",
                                        action: function () {
                                            field.Ignore(false);
                                            setNodeText($node.data);
                                        }
                                    },
                                    makeNullable = {
                                        label: "Nullable",
                                        action: function () {
                                            field.IsNullable(true);
                                            setNodeText($node.data);

                                        }
                                    },
                                    makeNonNullable = {
                                        label: "Make non nullable",
                                        action: function () {
                                            field.IsNullable(false);
                                            setNodeText($node.data);
                                        }
                                    };


                                    const items = [];
                                    if ($node.type !== "complex") {
                                        if (ko.unwrap(field.Ignore)) {
                                            items.push(include);
                                        }
                                        else {
                                            items.push(ignore);
                                        }
                                        if (ko.unwrap(field.IsNullable)) {
                                            items.push(makeNonNullable);
                                        }
                                        else {
                                            items.push(makeNullable);
                                        }
                                    }

                                    if (ko.unwrap(field.$type )=== "Bespoke.Sph.Domain.HeaderFieldMapping, domain.sph") {
                                        items.push(removeField);
                                    }
                                    if (ko.unwrap(field.$type )=== "Bespoke.Sph.Domain.UriFieldMapping, domain.sph") {
                                        items.push(removeField);
                                    }

                                    return items;
                                }
                            },
                            "types": {
                                "default": {
                                    "icon": "fa fa-clipboard"
                                },
                                "complex": {
                                    "icon": "fa fa-object-group"
                                },
                                "System.String, mscorlib": {
                                    "icon": "glyphicon glyphicon-bold",
                                    "valid_children": []
                                },
                                "System.DateTime, mscorlib": {
                                    "icon": "glyphicon glyphicon-calendar",
                                    "valid_children": []
                                },
                                "System.Int32, mscorlib": {
                                    "icon": "fa fa-sort-numeric-asc",
                                    "valid_children": []
                                },
                                "System.Decimal, mscorlib": {
                                    "icon": "glyphicon glyphicon-usd",
                                    "valid_children": []
                                },
                                "System.Boolean, mscorlib": {
                                    "icon": "glyphicon glyphicon-ok",
                                    "valid_children": []
                                }
                            },
                            "plugins": ["contextmenu", "types", "search"]
                        });
                };
            loadJsTree();

            var to = false;
            $(searchbox).keyup(function () {
                if (to) {
                    clearTimeout(to);
                }
                to = setTimeout(function () {
                    var v = $(searchbox).val();
                    $(element).jstree(true).search(v);
                }, 250);
            });

        }
    };

});
