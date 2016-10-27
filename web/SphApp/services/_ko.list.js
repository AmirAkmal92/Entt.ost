/// <reference path="../../Scripts/knockout-3.4.0.debug.js" />
/// <reference path="../../../core.sph/SphApp/schemas/form.designer.g.js" />
/// <reference path="../../../core.sph/SphApp/objectbuilders.js" />
/// <reference path="../../../core.sph/Scripts/jstree.min.js" />
/// <reference path="../../../core.sph/Scripts/complete.ly.1.0.1.js" />
/// <reference path="../../../core.sph/Scripts/require.js" />
/// <reference path="../../../core.sph/Scripts/jquery-2.2.0.intellisense.js" />

define([objectbuilders.datacontext, objectbuilders.logger], function (context, logger) {

/* 

<div class="input-group">
    <div class="input-icon">
        <i class="fa fa-lock fa-fw"></i>
        <input id="newpassword" class="form-control" type="text" name="password" placeholder="password"> </div>
        <span class="input-group-btn">
        <button id="genpassword" class="btn btn-success" type="button"><i class="fa fa-arrow-left fa-fw"></i> Random</button>
        </span>
    </div>
</div>

*/
    var initQueryFilter = function (element, options, search) {
        var path = options.path,
            placeholder =  options.placeholder || "Filter....",
            tooltip = options.tooltip || "Type to filter current page or type and [ENTER] to apply _all in remote query",
            $element = $(element),
            $filterInput = $("<input data-toggle=\"tooltip\" title=\"" + tooltip + "\" type=\"search\" class=\"search-query input-medium form-control\" placeholder=\"" + placeholder + "\">"),
            $serverLoadButton = $("<a href='/#' title='Carian server'><i class='add-on icon-search'></i><a>"),
            $form = $("<form class='form-search row'>" +
                "   <div class='input-group pull-right' style='width:300px'>" +
                '       <div class="input-icon">' +
                '           <i class="fa fa-search fa-fw"></i>'+
                "           <span class='input-group-btn'>" +
                '               <button id="clear-search" class="btn btn-success" type="button"><i class="fa fa-times fa-fw"></i></button>' +
                "           </span> " +
                "</div>" +
                " </form>");


        $form.find("span.input-group-btn").before($filterInput);
        $form.find("span.glyphicon-remove").after($serverLoadButton);
        $element.before($form);

        $form.submit(function (e) {
            e.preventDefault();
            var filter = $filterInput.val(),
                tcs = new $.Deferred();
            if (!filter) {
                return tcs.promise();
            }
            if (typeof search === "function") {
                return search(filter);
            }
            return tcs.promise();
        });



        var dofilter = function () {
            var $rows = $element.find(path),
                filter = $filterInput.val().toLowerCase();
            $rows.each(function () {
                var $tr = $(this),
                    text = $tr.text().trim().toLowerCase();
                if (!text) {
                    $("input", $tr).each(function (i, v) { text += " " + $(v).val() });
                    text = text.trim().toLowerCase();
                }
                if (text.indexOf(filter) > -1) {
                    $tr.show();
                } else {
                    $tr.hide();
                }
            });


        },
        throttled = _.throttle(dofilter, 800);

        $filterInput.on("keyup", throttled).siblings("span.input-group-btn")
            .click(function () {
                $filterInput.val("");
                dofilter();
            });

        if ($filterInput.val()) {
            dofilter();
        }
        $filterInput.tooltip();

    };


    ko.bindingHandlers.workflowFormPathIntellisense = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = valueAccessor(),
                schema = ko.unwrap(value.schema),
                allBindings = allBindingsAccessor(),
                setup = function () {
                    var input = $(element),
                             div = $("<div></div>").css({
                                 "height": "28px"
                             });
                    input.hide().before(div);

                    var c = completely(div[0], {
                        fontSize: "12px",
                        color: "#555;",
                        fontFamily: "\"Open Sans\", Arial, Helvetica, sans-serif"
                    });

                    c.setText(ko.unwrap(allBindings.value));
                    for (var ix in schema) {
                        if (schema.hasOwnProperty(ix)) {
                            if (ix === "$type") continue;
                            if (ix === "addChildItem") continue;
                            if (ix === "removeChildItem") continue;
                            if (ix === "Empty") continue;
                            if (ix === "WebId") continue;
                            c.options.push("" + ix);
                        }
                    }
                    c.options.sort();

                    var currentObject = schema;
                    c.onChange = function (text) {
                        if (text.lastIndexOf(".") === text.length - 1) {
                            c.options = [];
                            var props = text.split(".");

                            currentObject = schema;
                            _(props).each(function (v) {
                                if (v === "") { return; }
                                currentObject = currentObject[v];
                            });
                            console.log("currentObject", currentObject);
                            for (var i in currentObject) {
                                if (currentObject.hasOwnProperty(i)) {
                                    if (i === "$type") continue;
                                    if (i === "addChildItem") continue;
                                    if (i === "removeChildItem") continue;
                                    if (i === "Empty") continue;
                                    if (i === "WebId") continue;
                                    c.options.push("" + i);
                                }
                            }
                            c.options.sort();
                            c.startFrom = text.lastIndexOf(".") + 1;
                        }
                        c.repaint();
                    };

                    c.repaint();
                    $(c.input)
                        .attr("autocomplete", "off")
                        .blur(function () {
                            allBindings.value($(this).val());
                        }).parent().find("input")
                        .css({ "padding": "6px 12px", "height": "28px" });

                    if ($(element).prop("required")) {
                        $(c.input).prop("required", true);
                    }


                };


            setup();
        }
    };

    ko.bindingHandlers.queryPaging = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor(),
                query = value.query,
                enableReload = value.enableReload,                
                hasCommands = ko.isObservable((viewModel.toolbar || {}).commands),
                executedQuery = null,
                list = value.list,
                map = value.map,
                filterTooltip = value.filterTooltip,
                filterPlaceholder = value.filterPlaceholder,
                pagerHidden = value.pagerHidden || false,
                searchButton = value.searchButton,
                $element = $(element),
                logger = require("services/logger"),
                cultures = require(objectbuilders.cultures),
                $pagerPanel = $("<div></div>"),
                $spinner = $("<img src=\"/assets/layouts/layout/img/loading.gif\" alt=\"loading\" class=\"pull-right\" />"),
                startLoad = function () {
                    $spinner.show();
                    $element.fadeTo("fast", 0.33);
                },
                endLoad = function () {
                    $spinner.hide();
                    $element.fadeTo("fast", 1);
                },
                pager = null,
                setItemsSource = function (items) {

                    if (!pagerHidden) {
                        _(items).each(function (v) {
                            v.pager = {
                                page: pager.page(),
                                size: pager.pageSize()
                            };
                        });
                    }

                    if (map) {
                        items = _(items).map(map);
                    }
                    
                    if (ko.isObservable(list) && typeof list.push === "function") {
                        list.removeAll();
                        list(items);
                    }
                    if (typeof list === "string") {
                        viewModel[list](items);
                    }
                },
                pageChanged = function (page, size) {
                    startLoad();
                    var url = ko.unwrap(query) + "?page=" + (page || 1) + "&size=" + (size || 20);
                    if (executedQuery) url += "&q=" + executedQuery;
                    return $.getJSON(url)
                         .then(function (lo) {
                             setItemsSource(lo._results);
                             endLoad();
                         });
                },
                search = function (page, size) {
                    var tcs1 = new $.Deferred();
                    startLoad();
                    var url = ko.unwrap(query) + "?page=" + (page || 1) + "&size=" + (size || 20);
                    if (ko.unwrap(query).indexOf("?") > -1) url = ko.unwrap(query) + "&page=" + (page || 1) + "&size=" + (size || 20);
                    if (executedQuery) url += "&q=" + executedQuery;
                    $.getJSON(url)
                        .then(function (lo) {
                            if (pager) {
                                pager.update(lo._count);
                            } else {
                                var pagerOptions = {
                                    element: $pagerPanel,
                                    count: lo._count,
                                    changed: pageChanged,
                                    hidden: pagerHidden
                                };
                                pager = new bespoke.utils.ServerPager(pagerOptions);

                            }

                            setTimeout(function () {
                                setItemsSource(lo._results);
                                tcs1.resolve(lo);
                                endLoad();
                            }, 500);

                        });
                    return tcs1.promise();
                },
                filterAndSearch = function (text) {
                    pager.destroy();
                    pager = null;
                    executedQuery = text;
                    return search();
                },
                filter = ko.unwrap(value.filter) || {};

            //exposed the search function
            initQueryFilter(element, { path: filter.path || 'tbody>tr', placeholder : filterPlaceholder, tooltip : filterTooltip }, filterAndSearch);

            $element.after($pagerPanel).after($spinner)
                .fadeTo("slow", 0.33);

            if (searchButton) {
                $(document).on("click", searchButton, function (e) {
                    e.preventDefault();
                    if (!$(this).parents("form")[0].checkValidity()) {
                        logger.error(cultures.messages.FORM_IS_NOT_VALID);
                        return;
                    }
                    search(ko.toJS(query), 1, pager.pageSize());
                });

            }


            search(ko.toJS(executedQuery));


            
            if (enableReload && hasCommands) {
                const commandId = "server-paging-reload",
                    reloadCommand = viewModel.toolbar.commands().find(x => x.id === commandId);
                if (!reloadCommand) {
                    viewModel.toolbar.commands.push({
                        command: function () {
                            executedQuery = "";
                            return filterAndSearch();
                        },
                        caption: "Reload",
                        icon: "fa fa-refresh",
                        id: commandId
                    });

                }
            }

            if (enableReload && !hasCommands) {
                console.error("Please provide a toolbar with commands : ko.observableArray(), in your viewModel");
            }
            return {
                search: search,
                filterAndSearch: filterAndSearch
            };

        }
    };

    ko.bindingHandlers.treeCheckbox = {
        init: function (element, valueAccessor) {
            var value = valueAccessor(),
                entity = ko.unwrap(value.entity),
                selectedItems = value.selectedItems,
                searchbox = ko.unwrap(value.searchbox),
                jsTreeData = {
                    text: entity.Name(),
                    state: {
                        opened: true,
                        selected: true
                    }
                },
                recurseChildMember = function (node, parentPath) {
                    var parent = "";
                    if (node.data && node.data.Name && parentPath)
                        parent = parentPath + "-" + ko.unwrap(node.data.Name()) + "-";
                    if (node.data && node.data.Name && !parentPath)
                        parent = ko.unwrap(node.data.Name()) + "-";

                    parent = parent.replace(/--/g, "-");

                    node.children = _(node.data.MemberCollection()).map(function (v) {

                        var type = ko.unwrap(v.TypeName) || ko.unwrap(v.$type);
                        return {
                            text: v.Name(),
                            state: "open",
                            type: type,
                            data: v,
                            id: parent + v.Name()
                        };
                    });
                    _(node.children).each(function (n) {
                        recurseChildMember(n, parent);
                    });
                },
                loadJsTree = function () {
                    entity.MemberCollection.unshift(new bespoke.sph.domain.SimpleMember({ Name: "Id", TypeName: "System.String, mscorlib" }));
                    jsTreeData.children = _(entity.MemberCollection()).map(function (v) {
                        return {
                            text: ko.unwrap(v.Name),
                            state: "open",
                            type: ko.unwrap(v.TypeName) || ko.unwrap(v.$type),
                            data: v,
                            id: ko.unwrap(v.Name)
                        };
                    });
                    _(jsTreeData.children).each(function (n) {
                        recurseChildMember(n, "");
                    });
                    $(element)
                        .jstree({
                            "core": {
                                "animation": 0,
                                "check_callback": true,
                                "themes": { "stripes": true },
                                'data': jsTreeData
                            },
                            "types": {

                                "default": {
                                    "icon": "fa fa-clipboard"
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
                                },
                                "Bespoke.Sph.Domain.ValueObjectMember, domain.sph": {
                                    "icon": "fa fa-object-ungroup"
                                },
                                "Bespoke.Sph.Domain.ComplexMember, domain.sph": {
                                    "icon": "fa fa-building-o"
                                }
                            },
                            "plugins": ["checkbox", "types", "search"]
                        });

                    var $tree = $(element).jstree(true);
                    $tree.deselect_all();
                    _(ko.unwrap(selectedItems)).each(function (n) {
                        var id = n.replace(/\./g, "-"),
                            ref = $tree.get_node(id);
                        if (ref) {
                            $tree.select_node(ref);
                        }
                    });

                    $(element)
                        .on("select_node.jstree", function (node, selected) {
                            var id = selected.node.id;
                            var path = id.replace(/-/g, ".");
                            $.getJSON("/entity-definition/" + ko.unwrap(entity.Id) + "/members/" + path)
                                .done(function (member) {
                                    if (ko.unwrap(member.$type).indexOf("SimpleMember") > -1) {
                                        selectedItems.push(path);
                                    } else {
                                        logger.error("You cannot select comple member or value object");
                                    }
                                });
                        })
                        .on("deselect_node.jstree", function (node, selected) {
                            var id = selected.node.id;
                            selectedItems.remove(id.replace(/-/g, "."));
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


    return {
        init: function () { }
    };

});
