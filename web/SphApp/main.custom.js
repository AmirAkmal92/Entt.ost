/**
 * @license RequireJS text 2.0.7 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text', ['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.7',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) { }

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node)) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                errback(e);
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes,
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');

        text.get = function (url, callback) {
            var inStream, convertStream,
                readData = {},
                fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});
/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The composition module encapsulates all functionality related to visual composition.
 * @module composition
 * @requires system
 * @requires viewLocator
 * @requires binder
 * @requires viewEngine
 * @requires activator
 * @requires jquery
 * @requires knockout
 */
define('durandal/composition', ['durandal/system', 'durandal/viewLocator', 'durandal/binder', 'durandal/viewEngine', 'durandal/activator', 'jquery', 'knockout'], function (system, viewLocator, binder, viewEngine, activator, $, ko) {
    var dummyModel = {},
        activeViewAttributeName = 'data-active-view',
        composition,
        compositionCompleteCallbacks = [],
        compositionCount = 0,
        compositionDataKey = 'durandal-composition-data',
        partAttributeName = 'data-part',
        bindableSettings = ['model', 'view', 'transition', 'area', 'strategy', 'activationData', 'onError'],
        visibilityKey = "durandal-visibility-data",
        composeBindings = ['compose:'];

    function onError(context, error, element) {
        try {
            if (context.onError) {
                try {
                    context.onError(error, element);
                } catch (e) {
                    system.error(e);
                }
            } else {
                system.error(error);
            }
        } finally {
            endComposition(context, element, true);
        }
    }

    function getHostState(parent) {
        var elements = [];
        var state = {
            childElements: elements,
            activeView: null
        };

        var child = ko.virtualElements.firstChild(parent);

        while (child) {
            if (child.nodeType == 1) {
                elements.push(child);
                if (child.getAttribute(activeViewAttributeName)) {
                    state.activeView = child;
                }
            }

            child = ko.virtualElements.nextSibling(child);
        }

        if (!state.activeView) {
            state.activeView = elements[0];
        }

        return state;
    }

    function endComposition(context, element, error) {
        compositionCount--;

        if (compositionCount === 0) {
            var callBacks = compositionCompleteCallbacks;
            compositionCompleteCallbacks = [];

            if (!error) {
                setTimeout(function () {
                    var i = callBacks.length;

                    while (i--) {
                        try {
                            callBacks[i]();
                        } catch (e) {
                            onError(context, e, element);
                        }
                    }
                }, 1);
            }
        }

        cleanUp(context);
    }

    function cleanUp(context) {
        delete context.activeView;
        delete context.viewElements;
    }

    function tryActivate(context, successCallback, skipActivation, element) {
        if (skipActivation) {
            successCallback();
        } else if (context.activate && context.model && context.model.activate) {
            var result;

            try {
                if (system.isArray(context.activationData)) {
                    result = context.model.activate.apply(context.model, context.activationData);
                } else {
                    result = context.model.activate(context.activationData);
                }

                if (result && result.then) {
                    result.then(successCallback, function (reason) {
                        onError(context, reason, element);
                        successCallback();
                    });
                } else if (result || result === undefined) {
                    successCallback();
                } else {
                    endComposition(context, element);
                }
            }
            catch (e) {
                onError(context, e, element);
            }
        } else {
            successCallback();
        }
    }

    function triggerAttach(context, element) {
        var context = this;

        if (context.activeView) {
            context.activeView.removeAttribute(activeViewAttributeName);
        }

        if (context.child) {
            try {
                if (context.model && context.model.attached) {
                    if (context.composingNewView || context.alwaysTriggerAttach) {
                        context.model.attached(context.child, context.parent, context);
                    }
                }

                if (context.attached) {
                    context.attached(context.child, context.parent, context);
                }

                context.child.setAttribute(activeViewAttributeName, true);

                if (context.composingNewView && context.model && context.model.detached) {
                    ko.utils.domNodeDisposal.addDisposeCallback(context.child, function () {
                        try {
                            context.model.detached(context.child, context.parent, context);
                        } catch (e2) {
                            onError(context, e2, element);
                        }
                    });
                }
            } catch (e) {
                onError(context, e, element);
            }
        }

        context.triggerAttach = system.noop;
    }

    function shouldTransition(context) {
        if (system.isString(context.transition)) {
            if (context.activeView) {
                if (context.activeView == context.child) {
                    return false;
                }

                if (!context.child) {
                    return true;
                }

                if (context.skipTransitionOnSameViewId) {
                    var currentViewId = context.activeView.getAttribute('data-view');
                    var newViewId = context.child.getAttribute('data-view');
                    return currentViewId != newViewId;
                }
            }

            return true;
        }

        return false;
    }

    function cloneNodes(nodesArray) {
        for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
            var clonedNode = nodesArray[i].cloneNode(true);
            newNodesArray.push(clonedNode);
        }
        return newNodesArray;
    }

    function replaceParts(context) {
        var parts = cloneNodes(context.parts);
        var replacementParts = composition.getParts(parts);
        var standardParts = composition.getParts(context.child);

        for (var partId in replacementParts) {
            var toReplace = standardParts[partId];
            if (!toReplace) {
                toReplace = $('[data-part="' + partId + '"]', context.child).get(0);
                if (!toReplace) {
                    system.log('Could not find part to override: ' + partId);
                    continue;
                }
            }

            toReplace.parentNode.replaceChild(replacementParts[partId], toReplace);
        }
    }

    function removePreviousView(context) {
        var children = ko.virtualElements.childNodes(context.parent), i, len;

        if (!system.isArray(children)) {
            var arrayChildren = [];
            for (i = 0, len = children.length; i < len; i++) {
                arrayChildren[i] = children[i];
            }
            children = arrayChildren;
        }

        for (i = 1, len = children.length; i < len; i++) {
            ko.removeNode(children[i]);
        }
    }

    function hide(view) {
        ko.utils.domData.set(view, visibilityKey, view.style.display);
        view.style.display = 'none';
    }

    function show(view) {
        var displayStyle = ko.utils.domData.get(view, visibilityKey);
        view.style.display = displayStyle === 'none' ? 'block' : displayStyle;
    }

    function hasComposition(element) {
        var dataBind = element.getAttribute('data-bind');
        if (!dataBind) {
            return false;
        }

        for (var i = 0, length = composeBindings.length; i < length; i++) {
            if (dataBind.indexOf(composeBindings[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    /**
     * @class CompositionTransaction
     * @static
     */
    var compositionTransaction = {
        /**
         * Registers a callback which will be invoked when the current composition transaction has completed. The transaction includes all parent and children compositions.
         * @method complete
         * @param {function} callback The callback to be invoked when composition is complete.
         */
        complete: function (callback) {
            compositionCompleteCallbacks.push(callback);
        }
    };

    /**
     * @class CompositionModule
     * @static
     */
    composition = {
        /**
         * An array of all the binding handler names (includeing :) that trigger a composition.
         * @property {string} composeBindings
         * @default ['compose:']
         */
        composeBindings: composeBindings,
        /**
         * Converts a transition name to its moduleId.
         * @method convertTransitionToModuleId
         * @param {string} name The name of the transtion.
         * @return {string} The moduleId.
         */
        convertTransitionToModuleId: function (name) {
            return 'transitions/' + name;
        },
        /**
         * The name of the transition to use in all compositions.
         * @property {string} defaultTransitionName
         * @default null
         */
        defaultTransitionName: null,
        /**
         * Represents the currently executing composition transaction.
         * @property {CompositionTransaction} current
         */
        current: compositionTransaction,
        /**
         * Registers a binding handler that will be invoked when the current composition transaction is complete.
         * @method addBindingHandler
         * @param {string} name The name of the binding handler.
         * @param {object} [config] The binding handler instance. If none is provided, the name will be used to look up an existing handler which will then be converted to a composition handler.
         * @param {function} [initOptionsFactory] If the registered binding needs to return options from its init call back to knockout, this function will server as a factory for those options. It will receive the same parameters that the init function does.
         */
        addBindingHandler: function (name, config, initOptionsFactory) {
            var key,
                dataKey = 'composition-handler-' + name,
                handler;

            config = config || ko.bindingHandlers[name];
            initOptionsFactory = initOptionsFactory || function () { return undefined; };

            handler = ko.bindingHandlers[name] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    if (compositionCount > 0) {
                        var data = {
                            trigger: ko.observable(null)
                        };

                        composition.current.complete(function () {
                            if (config.init) {
                                config.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                            }

                            if (config.update) {
                                ko.utils.domData.set(element, dataKey, config);
                                data.trigger('trigger');
                            }
                        });

                        ko.utils.domData.set(element, dataKey, data);
                    } else {
                        ko.utils.domData.set(element, dataKey, config);

                        if (config.init) {
                            config.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                        }
                    }

                    return initOptionsFactory(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var data = ko.utils.domData.get(element, dataKey);

                    if (data.update) {
                        return data.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    }

                    if (data.trigger) {
                        data.trigger();
                    }
                }
            };

            for (key in config) {
                if (key !== "init" && key !== "update") {
                    handler[key] = config[key];
                }
            }
        },
        /**
         * Gets an object keyed with all the elements that are replacable parts, found within the supplied elements. The key will be the part name and the value will be the element itself.
         * @method getParts
         * @param {DOMElement\DOMElement[]} elements The element(s) to search for parts.
         * @return {object} An object keyed by part.
         */
        getParts: function (elements, parts) {
            parts = parts || {};

            if (!elements) {
                return parts;
            }

            if (elements.length === undefined) {
                elements = [elements];
            }

            for (var i = 0, length = elements.length; i < length; i++) {
                var element = elements[i],
                    id;

                if (element.getAttribute) {
                    id = element.getAttribute(partAttributeName);
                    if (id) {
                        parts[id] = element;
                    }

                    if (element.hasChildNodes() && !hasComposition(element)) {
                        composition.getParts(element.childNodes, parts);
                    }
                }
            }

            return parts;
        },
        cloneNodes: cloneNodes,
        finalize: function (context, element) {
            if (context.transition === undefined) {
                context.transition = this.defaultTransitionName;
            }

            if (!context.child && !context.activeView) {
                if (!context.cacheViews) {
                    ko.virtualElements.emptyNode(context.parent);
                }

                context.triggerAttach(context, element);
                endComposition(context, element);
            } else if (shouldTransition(context)) {
                var transitionModuleId = this.convertTransitionToModuleId(context.transition);

                system.acquire(transitionModuleId).then(function (transition) {
                    context.transition = transition;

                    transition(context).then(function () {
                        if (!context.cacheViews) {
                            if (!context.child) {
                                ko.virtualElements.emptyNode(context.parent);
                            } else {
                                removePreviousView(context);
                            }
                        } else if (context.activeView) {
                            var instruction = binder.getBindingInstruction(context.activeView);
                            if (instruction && instruction.cacheViews != undefined && !instruction.cacheViews) {
                                ko.removeNode(context.activeView);
                            } else {
                                hide(context.activeView);
                            }
                        }

                        if (context.child) {
                            show(context.child);
                        }

                        context.triggerAttach(context, element);
                        endComposition(context, element);
                    });
                }).fail(function (err) {
                    onError(context, 'Failed to load transition (' + transitionModuleId + '). Details: ' + err.message, element);
                });
            } else {
                if (context.child != context.activeView) {
                    if (context.cacheViews && context.activeView) {
                        var instruction = binder.getBindingInstruction(context.activeView);
                        if (!instruction || (instruction.cacheViews != undefined && !instruction.cacheViews)) {
                            ko.removeNode(context.activeView);
                        } else {
                            hide(context.activeView);
                        }
                    }

                    if (!context.child) {
                        if (!context.cacheViews) {
                            ko.virtualElements.emptyNode(context.parent);
                        }
                    } else {
                        if (!context.cacheViews) {
                            removePreviousView(context);
                        }

                        show(context.child);
                    }
                }

                context.triggerAttach(context, element);
                endComposition(context, element);
            }
        },
        bindAndShow: function (child, element, context, skipActivation) {
            context.child = child;
            context.parent.__composition_context = context;

            if (context.cacheViews) {
                context.composingNewView = (ko.utils.arrayIndexOf(context.viewElements, child) == -1);
            } else {
                context.composingNewView = true;
            }

            tryActivate(context, function () {
                if (context.parent.__composition_context == context) {
                    delete context.parent.__composition_context;

                    if (context.binding) {
                        context.binding(context.child, context.parent, context);
                    }

                    if (context.preserveContext && context.bindingContext) {
                        if (context.composingNewView) {
                            if (context.parts) {
                                replaceParts(context);
                            }

                            hide(child);
                            ko.virtualElements.prepend(context.parent, child);

                            binder.bindContext(context.bindingContext, child, context.model, context.as);
                        }
                    } else if (child) {
                        var modelToBind = context.model || dummyModel;
                        var currentModel = ko.dataFor(child);

                        if (currentModel != modelToBind) {
                            if (!context.composingNewView) {
                                ko.removeNode(child);
                                viewEngine.createView(child.getAttribute('data-view')).then(function (recreatedView) {
                                    composition.bindAndShow(recreatedView, element, context, true);
                                });
                                return;
                            }

                            if (context.parts) {
                                replaceParts(context);
                            }

                            hide(child);
                            ko.virtualElements.prepend(context.parent, child);

                            binder.bind(modelToBind, child);
                        }
                    }

                    composition.finalize(context, element);
                } else {
                    endComposition(context, element);
                }
            }, skipActivation, element);
        },
        /**
         * Eecutes the default view location strategy.
         * @method defaultStrategy
         * @param {object} context The composition context containing the model and possibly existing viewElements.
         * @return {promise} A promise for the view.
         */
        defaultStrategy: function (context) {
            return viewLocator.locateViewForObject(context.model, context.area, context.viewElements);
        },
        getSettings: function (valueAccessor, element) {
            var value = valueAccessor(),
                settings = ko.utils.unwrapObservable(value) || {},
                activatorPresent = activator.isActivator(value),
                moduleId;

            if (system.isString(settings)) {
                if (viewEngine.isViewUrl(settings)) {
                    settings = {
                        view: settings
                    };
                } else {
                    settings = {
                        model: settings,
                        activate: !activatorPresent
                    };
                }

                return settings;
            }

            moduleId = system.getModuleId(settings);
            if (moduleId) {
                settings = {
                    model: settings,
                    activate: !activatorPresent
                };

                return settings;
            }

            if (!activatorPresent && settings.model) {
                activatorPresent = activator.isActivator(settings.model);
            }

            for (var attrName in settings) {
                if (ko.utils.arrayIndexOf(bindableSettings, attrName) != -1) {
                    settings[attrName] = ko.utils.unwrapObservable(settings[attrName]);
                } else {
                    settings[attrName] = settings[attrName];
                }
            }

            if (activatorPresent) {
                settings.activate = false;
            } else if (settings.activate === undefined) {
                settings.activate = true;
            }

            return settings;
        },
        executeStrategy: function (context, element) {
            context.strategy(context).then(function (child) {
                composition.bindAndShow(child, element, context);
            });
        },
        inject: function (context, element) {
            if (!context.model) {
                this.bindAndShow(null, element, context);
                return;
            }

            if (context.view) {
                viewLocator.locateView(context.view, context.area, context.viewElements).then(function (child) {
                    composition.bindAndShow(child, element, context);
                });
                return;
            }

            if (!context.strategy) {
                context.strategy = this.defaultStrategy;
            }

            if (system.isString(context.strategy)) {
                system.acquire(context.strategy).then(function (strategy) {
                    context.strategy = strategy;
                    composition.executeStrategy(context, element);
                }).fail(function (err) {
                    onError(context, 'Failed to load view strategy (' + context.strategy + '). Details: ' + err.message, element);
                });
            } else {
                this.executeStrategy(context, element);
            }
        },
        /**
         * Initiates a composition.
         * @method compose
         * @param {DOMElement} element The DOMElement or knockout virtual element that serves as the parent for the composition.
         * @param {object} settings The composition settings.
         * @param {object} [bindingContext] The current binding context.
         */
        compose: function (element, settings, bindingContext, fromBinding) {
            compositionCount++;

            if (!fromBinding) {
                settings = composition.getSettings(function () { return settings; }, element);
            }

            if (settings.compositionComplete) {
                compositionCompleteCallbacks.push(function () {
                    settings.compositionComplete(settings.child, settings.parent, settings);
                });
            }

            compositionCompleteCallbacks.push(function () {
                if (settings.composingNewView && settings.model && settings.model.compositionComplete) {
                    settings.model.compositionComplete(settings.child, settings.parent, settings);
                }
            });

            var hostState = getHostState(element);

            settings.activeView = hostState.activeView;
            settings.parent = element;
            settings.triggerAttach = triggerAttach;
            settings.bindingContext = bindingContext;

            if (settings.cacheViews && !settings.viewElements) {
                settings.viewElements = hostState.childElements;
            }

            if (!settings.model) {
                if (!settings.view) {
                    this.bindAndShow(null, element, settings);
                } else {
                    settings.area = settings.area || 'partial';
                    settings.preserveContext = true;

                    viewLocator.locateView(settings.view, settings.area, settings.viewElements).then(function (child) {
                        composition.bindAndShow(child, element, settings);
                    });
                }
            } else if (system.isString(settings.model)) {
                system.acquire(settings.model).then(function (module) {
                    settings.model = system.resolveObject(module);
                    composition.inject(settings, element);
                }).fail(function (err) {
                    onError(settings, 'Failed to load composed module (' + settings.model + '). Details: ' + err.message, element);
                });
            } else {
                composition.inject(settings, element);
            }
        }
    };

    ko.bindingHandlers.compose = {
        init: function () {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var settings = composition.getSettings(valueAccessor, element);
            if (settings.mode) {
                var data = ko.utils.domData.get(element, compositionDataKey);
                if (!data) {
                    var childNodes = ko.virtualElements.childNodes(element);
                    data = {};

                    if (settings.mode === 'inline') {
                        data.view = viewEngine.ensureSingleElement(childNodes);
                    } else if (settings.mode === 'templated') {
                        data.parts = cloneNodes(childNodes);
                    }

                    ko.virtualElements.emptyNode(element);
                    ko.utils.domData.set(element, compositionDataKey, data);
                }

                if (settings.mode === 'inline') {
                    settings.view = data.view.cloneNode(true);
                } else if (settings.mode === 'templated') {
                    settings.parts = data.parts;
                }

                settings.preserveContext = true;
            }

            composition.compose(element, settings, bindingContext, true);
        }
    };

    ko.virtualElements.allowedBindings.compose = true;

    return composition;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Durandal events originate from backbone.js but also combine some ideas from signals.js as well as some additional improvements.
 * Events can be installed into any object and are installed into the `app` module by default for convenient app-wide eventing.
 * @module events
 * @requires system
 */
define('durandal/events', ['durandal/system'], function (system) {
    var eventSplitter = /\s+/;
    var Events = function () { };

    /**
     * Represents an event subscription.
     * @class Subscription
     */
    var Subscription = function (owner, events) {
        this.owner = owner;
        this.events = events;
    };

    /**
     * Attaches a callback to the event subscription.
     * @method then
     * @param {function} callback The callback function to invoke when the event is triggered.
     * @param {object} [context] An object to use as `this` when invoking the `callback`.
     * @chainable
     */
    Subscription.prototype.then = function (callback, context) {
        this.callback = callback || this.callback;
        this.context = context || this.context;

        if (!this.callback) {
            return this;
        }

        this.owner.on(this.events, this.callback, this.context);
        return this;
    };

    /**
     * Attaches a callback to the event subscription.
     * @method on
     * @param {function} [callback] The callback function to invoke when the event is triggered. If `callback` is not provided, the previous callback will be re-activated.
     * @param {object} [context] An object to use as `this` when invoking the `callback`.
     * @chainable
     */
    Subscription.prototype.on = Subscription.prototype.then;

    /**
     * Cancels the subscription.
     * @method off
     * @chainable
     */
    Subscription.prototype.off = function () {
        this.owner.off(this.events, this.callback, this.context);
        return this;
    };

    /**
     * Creates an object with eventing capabilities.
     * @class Events
     */

    /**
     * Creates a subscription or registers a callback for the specified event.
     * @method on
     * @param {string} events One or more events, separated by white space.
     * @param {function} [callback] The callback function to invoke when the event is triggered. If `callback` is not provided, a subscription instance is returned.
     * @param {object} [context] An object to use as `this` when invoking the `callback`.
     * @return {Subscription|Events} A subscription is returned if no callback is supplied, otherwise the events object is returned for chaining.
     */
    Events.prototype.on = function (events, callback, context) {
        var calls, event, list;

        if (!callback) {
            return new Subscription(this, events);
        } else {
            calls = this.callbacks || (this.callbacks = {});
            events = events.split(eventSplitter);

            while (event = events.shift()) {
                list = calls[event] || (calls[event] = []);
                list.push(callback, context);
            }

            return this;
        }
    };

    /**
     * Removes the callbacks for the specified events.
     * @method off
     * @param {string} [events] One or more events, separated by white space to turn off. If no events are specified, then the callbacks will be removed.
     * @param {function} [callback] The callback function to remove. If `callback` is not provided, all callbacks for the specified events will be removed.
     * @param {object} [context] The object that was used as `this`. Callbacks with this context will be removed.
     * @chainable
     */
    Events.prototype.off = function (events, callback, context) {
        var event, calls, list, i;

        // No events
        if (!(calls = this.callbacks)) {
            return this;
        }

        //removing all
        if (!(events || callback || context)) {
            delete this.callbacks;
            return this;
        }

        events = events ? events.split(eventSplitter) : system.keys(calls);

        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            if (!(list = calls[event]) || !(callback || context)) {
                delete calls[event];
                continue;
            }

            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }

        return this;
    };

    /**
     * Triggers the specified events.
     * @method trigger
     * @param {string} [events] One or more events, separated by white space to trigger.
     * @chainable
     */
    Events.prototype.trigger = function (events) {
        var event, calls, list, i, length, args, all, rest;
        if (!(calls = this.callbacks)) {
            return this;
        }

        rest = [];
        events = events.split(eventSplitter);
        for (i = 1, length = arguments.length; i < length; i++) {
            rest[i - 1] = arguments[i];
        }

        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            // Copy callback lists to prevent modification.
            if (all = calls.all) {
                all = all.slice();
            }

            if (list = calls[event]) {
                list = list.slice();
            }

            // Execute event callbacks.
            if (list) {
                for (i = 0, length = list.length; i < length; i += 2) {
                    list[i].apply(list[i + 1] || this, rest);
                }
            }

            // Execute "all" callbacks.
            if (all) {
                args = [event].concat(rest);
                for (i = 0, length = all.length; i < length; i += 2) {
                    all[i].apply(all[i + 1] || this, args);
                }
            }
        }

        return this;
    };

    /**
     * Creates a function that will trigger the specified events when called. Simplifies proxying jQuery (or other) events through to the events object.
     * @method proxy
     * @param {string} events One or more events, separated by white space to trigger by invoking the returned function.
     * @return {function} Calling the function will invoke the previously specified events on the events object.
     */
    Events.prototype.proxy = function (events) {
        var that = this;
        return (function (arg) {
            that.trigger(events, arg);
        });
    };

    /**
     * Creates an object with eventing capabilities.
     * @class EventsModule
     * @static
     */

    /**
     * Adds eventing capabilities to the specified object.
     * @method includeIn
     * @param {object} targetObject The object to add eventing capabilities to.
     */
    Events.includeIn = function (targetObject) {
        targetObject.on = Events.prototype.on;
        targetObject.off = Events.prototype.off;
        targetObject.trigger = Events.prototype.trigger;
        targetObject.proxy = Events.prototype.proxy;
    };

    return Events;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The viewEngine module provides information to the viewLocator module which is used to locate the view's source file. The viewEngine also transforms a view id into a view instance.
 * @module viewEngine
 * @requires system
 * @requires jquery
 */
define('durandal/viewEngine', ['durandal/system', 'jquery'], function (system, $) {
    var parseMarkup;

    if ($.parseHTML) {
        parseMarkup = function (html) {
            return $.parseHTML(html);
        };
    } else {
        parseMarkup = function (html) {
            return $(html).get();
        };
    }

    /**
     * @class ViewEngineModule
     * @static
     */
    return {
        cache: {},
        /**
         * The file extension that view source files are expected to have.
         * @property {string} viewExtension
         * @default .html
         */
        viewExtension: '.html',
        /**
         * The name of the RequireJS loader plugin used by the viewLocator to obtain the view source. (Use requirejs to map the plugin's full path).
         * @property {string} viewPlugin
         * @default text
         */
        viewPlugin: 'text',
        /**
         * Parameters passed to the RequireJS loader plugin used by the viewLocator to obtain the view source.
         * @property {string} viewPluginParameters
         * @default The empty string by default.
         */
        viewPluginParameters: '',
        /**
         * Determines if the url is a url for a view, according to the view engine.
         * @method isViewUrl
         * @param {string} url The potential view url.
         * @return {boolean} True if the url is a view url, false otherwise.
         */
        isViewUrl: function (url) {
            return url.indexOf(this.viewExtension, url.length - this.viewExtension.length) !== -1;
        },
        /**
         * Converts a view url into a view id.
         * @method convertViewUrlToViewId
         * @param {string} url The url to convert.
         * @return {string} The view id.
         */
        convertViewUrlToViewId: function (url) {
            return url.substring(0, url.length - this.viewExtension.length);
        },
        /**
         * Converts a view id into a full RequireJS path.
         * @method convertViewIdToRequirePath
         * @param {string} viewId The view id to convert.
         * @return {string} The require path.
         */
        convertViewIdToRequirePath: function (viewId) {
            var plugin = this.viewPlugin ? this.viewPlugin + '!' : '';
            return plugin + viewId + this.viewExtension + this.viewPluginParameters;
        },
        /**
         * Parses the view engine recognized markup and returns DOM elements.
         * @method parseMarkup
         * @param {string} markup The markup to parse.
         * @return {DOMElement[]} The elements.
         */
        parseMarkup: parseMarkup,
        /**
         * Calls `parseMarkup` and then pipes the results through `ensureSingleElement`.
         * @method processMarkup
         * @param {string} markup The markup to process.
         * @return {DOMElement} The view.
         */
        processMarkup: function (markup) {
            var allElements = this.parseMarkup(markup);
            return this.ensureSingleElement(allElements);
        },
        /**
         * Converts an array of elements into a single element. White space and comments are removed. If a single element does not remain, then the elements are wrapped.
         * @method ensureSingleElement
         * @param {DOMElement[]} allElements The elements.
         * @return {DOMElement} A single element.
         */
        ensureSingleElement: function (allElements) {
            if (allElements.length == 1) {
                return allElements[0];
            }

            var withoutCommentsOrEmptyText = [];

            for (var i = 0; i < allElements.length; i++) {
                var current = allElements[i];
                if (current.nodeType != 8) {
                    if (current.nodeType == 3) {
                        var result = /\S/.test(current.nodeValue);
                        if (!result) {
                            continue;
                        }
                    }

                    withoutCommentsOrEmptyText.push(current);
                }
            }

            if (withoutCommentsOrEmptyText.length > 1) {
                return $(withoutCommentsOrEmptyText).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0);
            }

            return withoutCommentsOrEmptyText[0];
        },
        /**
         * Gets the view associated with the id from the cache of parsed views.
         * @method tryGetViewFromCache
         * @param {string} id The view id to lookup in the cache.
         * @return {DOMElement|null} The cached view or null if it's not in the cache.
         */
        tryGetViewFromCache: function (id) {
            return this.cache[id];
        },
        /**
         * Puts the view associated with the id into the cache of parsed views.
         * @method putViewInCache
         * @param {string} id The view id whose view should be cached.
         * @param {DOMElement} view The view to cache.
         */
        putViewInCache: function (id, view) {
            this.cache[id] = view;
        },
        /**
         * Creates the view associated with the view id.
         * @method createView
         * @param {string} viewId The view id whose view should be created.
         * @return {Promise} A promise of the view.
         */
        createView: function (viewId) {
            var that = this;
            var requirePath = this.convertViewIdToRequirePath(viewId);
            var existing = this.tryGetViewFromCache(requirePath);

            if (existing) {
                return system.defer(function (dfd) {
                    dfd.resolve(existing.cloneNode(true));
                }).promise();
            }

            return system.defer(function (dfd) {
                system.acquire(requirePath).then(function (markup) {
                    var element = that.processMarkup(markup);
                    element.setAttribute('data-view', viewId);
                    that.putViewInCache(requirePath, element);
                    dfd.resolve(element.cloneNode(true));
                }).fail(function (err) {
                    that.createFallbackView(viewId, requirePath, err).then(function (element) {
                        element.setAttribute('data-view', viewId);
                        that.cache[requirePath] = element;
                        dfd.resolve(element.cloneNode(true));
                    });
                });
            }).promise();
        },
        /**
         * Called when a view cannot be found to provide the opportunity to locate or generate a fallback view. Mainly used to ease development.
         * @method createFallbackView
         * @param {string} viewId The view id whose view should be created.
         * @param {string} requirePath The require path that was attempted.
         * @param {Error} requirePath The error that was returned from the attempt to locate the default view.
         * @return {Promise} A promise for the fallback view.
         */
        createFallbackView: function (viewId, requirePath, err) {
            var that = this,
                message = 'View Not Found. Searched for "' + viewId + '" via path "' + requirePath + '".';

            return system.defer(function (dfd) {
                dfd.resolve(that.processMarkup('<div class="durandal-view-404">' + message + '</div>'));
            }).promise();
        }
    };
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The binder joins an object instance and a DOM element tree by applying databinding and/or invoking binding lifecycle callbacks (binding and bindingComplete).
 * @module binder
 * @requires system
 * @requires knockout
 */
define('durandal/binder', ['durandal/system', 'knockout'], function (system, ko) {
    var binder,
        insufficientInfoMessage = 'Insufficient Information to Bind',
        unexpectedViewMessage = 'Unexpected View Type',
        bindingInstructionKey = 'durandal-binding-instruction',
        koBindingContextKey = '__ko_bindingContext__';

    function normalizeBindingInstruction(result) {
        if (result === undefined) {
            return { applyBindings: true };
        }

        if (system.isBoolean(result)) {
            return { applyBindings: result };
        }

        if (result.applyBindings === undefined) {
            result.applyBindings = true;
        }

        return result;
    }

    function doBind(obj, view, bindingTarget, data) {
        if (!view || !bindingTarget) {
            if (binder.throwOnErrors) {
                system.error(insufficientInfoMessage);
            } else {
                system.log(insufficientInfoMessage, view, data);
            }
            return;
        }

        if (!view.getAttribute) {
            if (binder.throwOnErrors) {
                system.error(unexpectedViewMessage);
            } else {
                system.log(unexpectedViewMessage, view, data);
            }
            return;
        }

        var viewName = view.getAttribute('data-view');

        try {
            var instruction;

            if (obj && obj.binding) {
                instruction = obj.binding(view);
            }

            instruction = normalizeBindingInstruction(instruction);
            binder.binding(data, view, instruction);

            if (instruction.applyBindings) {
                system.log('Binding', viewName, data);
                ko.applyBindings(bindingTarget, view);
            } else if (obj) {
                ko.utils.domData.set(view, koBindingContextKey, { $data: obj });
            }

            binder.bindingComplete(data, view, instruction);

            if (obj && obj.bindingComplete) {
                obj.bindingComplete(view);
            }

            ko.utils.domData.set(view, bindingInstructionKey, instruction);
            return instruction;
        } catch (e) {
            e.message = e.message + ';\nView: ' + viewName + ";\nModuleId: " + system.getModuleId(data);
            if (binder.throwOnErrors) {
                system.error(e);
            } else {
                system.log(e.message);
            }
            console.error(e.message);
            //toastr.error(e.message);
        }
    }

    /**
     * @class BinderModule
     * @static
     */
    return binder = {
        /**
         * Called before every binding operation. Does nothing by default.
         * @method binding
         * @param {object} data The data that is about to be bound.
         * @param {DOMElement} view The view that is about to be bound.
         * @param {object} instruction The object that carries the binding instructions.
         */
        binding: system.noop,
        /**
         * Called after every binding operation. Does nothing by default.
         * @method bindingComplete
         * @param {object} data The data that has just been bound.
         * @param {DOMElement} view The view that has just been bound.
         * @param {object} instruction The object that carries the binding instructions.
         */
        bindingComplete: system.noop,
        /**
         * Indicates whether or not the binding system should throw errors or not.
         * @property {boolean} throwOnErrors
         * @default false The binding system will not throw errors by default. Instead it will log them.
         */
        throwOnErrors: false,
        /**
         * Gets the binding instruction that was associated with a view when it was bound.
         * @method getBindingInstruction
         * @param {DOMElement} view The view that was previously bound.
         * @return {object} The object that carries the binding instructions.
         */
        getBindingInstruction: function (view) {
            return ko.utils.domData.get(view, bindingInstructionKey);
        },
        /**
         * Binds the view, preserving the existing binding context. Optionally, a new context can be created, parented to the previous context.
         * @method bindContext
         * @param {KnockoutBindingContext} bindingContext The current binding context.
         * @param {DOMElement} view The view to bind.
         * @param {object} [obj] The data to bind to, causing the creation of a child binding context if present.
         * @param {string} [dataAlias] An alias for $data if present.
         */
        bindContext: function (bindingContext, view, obj, dataAlias) {
            if (obj && bindingContext) {
                bindingContext = bindingContext.createChildContext(obj, typeof (dataAlias) === 'string' ? dataAlias : null);
            }

            return doBind(obj, view, bindingContext, obj || (bindingContext ? bindingContext.$data : null));
        },
        /**
         * Binds the view, preserving the existing binding context. Optionally, a new context can be created, parented to the previous context.
         * @method bind
         * @param {object} obj The data to bind to.
         * @param {DOMElement} view The view to bind.
         */
        bind: function (obj, view) {
            return doBind(obj, view, obj, obj);
        }
    };
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The activator module encapsulates all logic related to screen/component activation.
 * An activator is essentially an asynchronous state machine that understands a particular state transition protocol.
 * The protocol ensures that the following series of events always occur: `canDeactivate` (previous state), `canActivate` (new state), `deactivate` (previous state), `activate` (new state).
 * Each of the _can_ callbacks may return a boolean, affirmative value or promise for one of those. If either of the _can_ functions yields a false result, then activation halts.
 * @module activator
 * @requires system
 * @requires knockout
 */
define('durandal/activator', ['durandal/system', 'knockout'], function (system, ko) {
    var activator;
    var defaultOptions = {
        canDeactivate: true
    };

    function ensureSettings(settings) {
        if (settings == undefined) {
            settings = {};
        }

        if (!system.isBoolean(settings.closeOnDeactivate)) {
            settings.closeOnDeactivate = activator.defaults.closeOnDeactivate;
        }

        if (!settings.beforeActivate) {
            settings.beforeActivate = activator.defaults.beforeActivate;
        }

        if (!settings.afterDeactivate) {
            settings.afterDeactivate = activator.defaults.afterDeactivate;
        }

        if (!settings.affirmations) {
            settings.affirmations = activator.defaults.affirmations;
        }

        if (!settings.interpretResponse) {
            settings.interpretResponse = activator.defaults.interpretResponse;
        }

        if (!settings.areSameItem) {
            settings.areSameItem = activator.defaults.areSameItem;
        }

        if (!settings.findChildActivator) {
            settings.findChildActivator = activator.defaults.findChildActivator;
        }

        return settings;
    }

    function invoke(target, method, data) {
        if (system.isArray(data)) {
            return target[method].apply(target, data);
        }

        return target[method](data);
    }

    function deactivate(item, close, settings, dfd, setter) {
        if (item && item.deactivate) {
            system.log('Deactivating', item);

            var result;
            try {
                result = item.deactivate(close);
            } catch (error) {
                system.log('ERROR: ' + error.message, error);
                dfd.resolve(false);
                return;
            }

            if (result && result.then) {
                result.then(function () {
                    settings.afterDeactivate(item, close, setter);
                    dfd.resolve(true);
                }, function (reason) {
                    system.log(reason);
                    dfd.resolve(false);
                });
            } else {
                settings.afterDeactivate(item, close, setter);
                dfd.resolve(true);
            }
        } else {
            if (item) {
                settings.afterDeactivate(item, close, setter);
            }

            dfd.resolve(true);
        }
    }

    function activate(newItem, activeItem, callback, activationData) {
        var result;

        if (newItem && newItem.activate) {
            system.log('Activating', newItem);

            try {
                result = invoke(newItem, 'activate', activationData);
            } catch (error) {
                system.log('ERROR: ' + error.message, error);
                callback(false);
                return;
            }
        }

        if (result && result.then) {
            result.then(function () {
                activeItem(newItem);
                callback(true);
            }, function (reason) {
                system.log('ERROR: ' + reason.message, reason);
                callback(false);
            });
        } else {
            activeItem(newItem);
            callback(true);
        }
    }

    function canDeactivateItem(item, close, settings, options) {
        options = system.extend({}, defaultOptions, options);
        settings.lifecycleData = null;

        return system.defer(function (dfd) {
            function continueCanDeactivate() {
                if (item && item.canDeactivate && options.canDeactivate) {
                    var resultOrPromise;
                    try {
                        resultOrPromise = item.canDeactivate(close);
                    } catch (error) {
                        system.log('ERROR: ' + error.message, error);
                        dfd.resolve(false);
                        return;
                    }

                    if (resultOrPromise.then) {
                        resultOrPromise.then(function (result) {
                            settings.lifecycleData = result;
                            dfd.resolve(settings.interpretResponse(result));
                        }, function (reason) {
                            system.log('ERROR: ' + reason.message, reason);
                            dfd.resolve(false);
                        });
                    } else {
                        settings.lifecycleData = resultOrPromise;
                        dfd.resolve(settings.interpretResponse(resultOrPromise));
                    }
                } else {
                    dfd.resolve(true);
                }
            }

            var childActivator = settings.findChildActivator(item);
            if (childActivator) {
                childActivator.canDeactivate().then(function (result) {
                    if (result) {
                        continueCanDeactivate();
                    } else {
                        dfd.resolve(false);
                    }
                });
            } else {
                continueCanDeactivate();
            }
        }).promise();
    };

    function canActivateItem(newItem, activeItem, settings, activeData, newActivationData) {
        settings.lifecycleData = null;

        return system.defer(function (dfd) {
            if (settings.areSameItem(activeItem(), newItem, activeData, newActivationData)) {
                dfd.resolve(true);
                return;
            }

            if (newItem && newItem.canActivate) {
                var resultOrPromise;
                try {
                    resultOrPromise = invoke(newItem, 'canActivate', newActivationData);
                } catch (error) {
                    system.log('ERROR: ' + error.message, error);
                    dfd.resolve(false);
                    return;
                }

                if (resultOrPromise.then) {
                    resultOrPromise.then(function (result) {
                        settings.lifecycleData = result;
                        dfd.resolve(settings.interpretResponse(result));
                    }, function (reason) {
                        system.log('ERROR: ' + reason.message, reason);
                        dfd.resolve(false);
                    });
                } else {
                    settings.lifecycleData = resultOrPromise;
                    dfd.resolve(settings.interpretResponse(resultOrPromise));
                }
            } else {
                dfd.resolve(true);
            }
        }).promise();
    };

    /**
     * An activator is a read/write computed observable that enforces the activation lifecycle whenever changing values.
     * @class Activator
     */
    function createActivator(initialActiveItem, settings) {
        var activeItem = ko.observable(null);
        var activeData;

        settings = ensureSettings(settings);

        var computed = ko.computed({
            read: function () {
                return activeItem();
            },
            write: function (newValue) {
                computed.viaSetter = true;
                computed.activateItem(newValue);
            }
        });

        computed.__activator__ = true;

        /**
         * The settings for this activator.
         * @property {ActivatorSettings} settings
         */
        computed.settings = settings;
        settings.activator = computed;

        /**
         * An observable which indicates whether or not the activator is currently in the process of activating an instance.
         * @method isActivating
         * @return {boolean}
         */
        computed.isActivating = ko.observable(false);

        computed.forceActiveItem = function (item) {
            activeItem(item);
        };

        /**
         * Determines whether or not the specified item can be deactivated.
         * @method canDeactivateItem
         * @param {object} item The item to check.
         * @param {boolean} close Whether or not to check if close is possible.
         * @param {object} options Options for controlling the activation process.
         * @return {promise}
         */
        computed.canDeactivateItem = function (item, close, options) {
            return canDeactivateItem(item, close, settings, options);
        };

        /**
         * Deactivates the specified item.
         * @method deactivateItem
         * @param {object} item The item to deactivate.
         * @param {boolean} close Whether or not to close the item.
         * @return {promise}
         */
        computed.deactivateItem = function (item, close) {
            return system.defer(function (dfd) {
                computed.canDeactivateItem(item, close).then(function (canDeactivate) {
                    if (canDeactivate) {
                        deactivate(item, close, settings, dfd, activeItem);
                    } else {
                        computed.notifySubscribers();
                        dfd.resolve(false);
                    }
                });
            }).promise();
        };

        /**
         * Determines whether or not the specified item can be activated.
         * @method canActivateItem
         * @param {object} item The item to check.
         * @param {object} activationData Data associated with the activation.
         * @return {promise}
         */
        computed.canActivateItem = function (newItem, activationData) {
            return canActivateItem(newItem, activeItem, settings, activeData, activationData);
        };

        /**
         * Activates the specified item.
         * @method activateItem
         * @param {object} newItem The item to activate.
         * @param {object} newActivationData Data associated with the activation.
         * @param {object} options Options for controlling the activation process.
         * @return {promise}
         */
        computed.activateItem = function (newItem, newActivationData, options) {
            var viaSetter = computed.viaSetter;
            computed.viaSetter = false;

            return system.defer(function (dfd) {
                if (computed.isActivating()) {
                    dfd.resolve(false);
                    return;
                }

                computed.isActivating(true);

                var currentItem = activeItem();
                if (settings.areSameItem(currentItem, newItem, activeData, newActivationData)) {
                    computed.isActivating(false);
                    dfd.resolve(true);
                    return;
                }

                computed.canDeactivateItem(currentItem, settings.closeOnDeactivate, options).then(function (canDeactivate) {
                    if (canDeactivate) {
                        computed.canActivateItem(newItem, newActivationData).then(function (canActivate) {
                            if (canActivate) {
                                system.defer(function (dfd2) {
                                    deactivate(currentItem, settings.closeOnDeactivate, settings, dfd2);
                                }).promise().then(function () {
                                    newItem = settings.beforeActivate(newItem, newActivationData);
                                    activate(newItem, activeItem, function (result) {
                                        activeData = newActivationData;
                                        computed.isActivating(false);
                                        dfd.resolve(result);
                                    }, newActivationData);
                                });
                            } else {
                                if (viaSetter) {
                                    computed.notifySubscribers();
                                }

                                computed.isActivating(false);
                                dfd.resolve(false);
                            }
                        });
                    } else {
                        if (viaSetter) {
                            computed.notifySubscribers();
                        }

                        computed.isActivating(false);
                        dfd.resolve(false);
                    }
                });
            }).promise();
        };

        /**
         * Determines whether or not the activator, in its current state, can be activated.
         * @method canActivate
         * @return {promise}
         */
        computed.canActivate = function () {
            var toCheck;

            if (initialActiveItem) {
                toCheck = initialActiveItem;
                initialActiveItem = false;
            } else {
                toCheck = computed();
            }

            return computed.canActivateItem(toCheck);
        };

        /**
         * Activates the activator, in its current state.
         * @method activate
         * @return {promise}
         */
        computed.activate = function () {
            var toActivate;

            if (initialActiveItem) {
                toActivate = initialActiveItem;
                initialActiveItem = false;
            } else {
                toActivate = computed();
            }

            return computed.activateItem(toActivate);
        };

        /**
         * Determines whether or not the activator, in its current state, can be deactivated.
         * @method canDeactivate
         * @return {promise}
         */
        computed.canDeactivate = function (close) {
            return computed.canDeactivateItem(computed(), close);
        };

        /**
         * Deactivates the activator, in its current state.
         * @method deactivate
         * @return {promise}
         */
        computed.deactivate = function (close) {
            return computed.deactivateItem(computed(), close);
        };

        computed.includeIn = function (includeIn) {
            includeIn.canActivate = function () {
                return computed.canActivate();
            };

            includeIn.activate = function () {
                return computed.activate();
            };

            includeIn.canDeactivate = function (close) {
                return computed.canDeactivate(close);
            };

            includeIn.deactivate = function (close) {
                return computed.deactivate(close);
            };
        };

        if (settings.includeIn) {
            computed.includeIn(settings.includeIn);
        } else if (initialActiveItem) {
            computed.activate();
        }

        computed.forItems = function (items) {
            settings.closeOnDeactivate = false;

            settings.determineNextItemToActivate = function (list, lastIndex) {
                var toRemoveAt = lastIndex - 1;

                if (toRemoveAt == -1 && list.length > 1) {
                    return list[1];
                }

                if (toRemoveAt > -1 && toRemoveAt < list.length - 1) {
                    return list[toRemoveAt];
                }

                return null;
            };

            settings.beforeActivate = function (newItem) {
                var currentItem = computed();

                if (!newItem) {
                    newItem = settings.determineNextItemToActivate(items, currentItem ? items.indexOf(currentItem) : 0);
                } else {
                    var index = items.indexOf(newItem);

                    if (index == -1) {
                        items.push(newItem);
                    } else {
                        newItem = items()[index];
                    }
                }

                return newItem;
            };

            settings.afterDeactivate = function (oldItem, close) {
                if (close) {
                    items.remove(oldItem);
                }
            };

            var originalCanDeactivate = computed.canDeactivate;
            computed.canDeactivate = function (close) {
                if (close) {
                    return system.defer(function (dfd) {
                        var list = items();
                        var results = [];

                        function finish() {
                            for (var j = 0; j < results.length; j++) {
                                if (!results[j]) {
                                    dfd.resolve(false);
                                    return;
                                }
                            }

                            dfd.resolve(true);
                        }

                        for (var i = 0; i < list.length; i++) {
                            computed.canDeactivateItem(list[i], close).then(function (result) {
                                results.push(result);
                                if (results.length == list.length) {
                                    finish();
                                }
                            });
                        }
                    }).promise();
                } else {
                    return originalCanDeactivate();
                }
            };

            var originalDeactivate = computed.deactivate;
            computed.deactivate = function (close) {
                if (close) {
                    return system.defer(function (dfd) {
                        var list = items();
                        var results = 0;
                        var listLength = list.length;

                        function doDeactivate(item) {
                            setTimeout(function () {
                                computed.deactivateItem(item, close).then(function () {
                                    results++;
                                    items.remove(item);
                                    if (results == listLength) {
                                        dfd.resolve();
                                    }
                                });
                            }, 1);
                        }

                        for (var i = 0; i < listLength; i++) {
                            doDeactivate(list[i]);
                        }
                    }).promise();
                } else {
                    return originalDeactivate();
                }
            };

            return computed;
        };

        return computed;
    }

    /**
     * @class ActivatorSettings
     * @static
     */
    var activatorSettings = {
        /**
         * The default value passed to an object's deactivate function as its close parameter.
         * @property {boolean} closeOnDeactivate
         * @default true
         */
        closeOnDeactivate: true,
        /**
         * Lower-cased words which represent a truthy value.
         * @property {string[]} affirmations
         * @default ['yes', 'ok', 'true']
         */
        affirmations: ['yes', 'ok', 'true'],
        /**
         * Interprets the response of a `canActivate` or `canDeactivate` call using the known affirmative values in the `affirmations` array.
         * @method interpretResponse
         * @param {object} value
         * @return {boolean}
         */
        interpretResponse: function (value) {
            if (system.isObject(value)) {
                value = value.can || false;
            }

            if (system.isString(value)) {
                return ko.utils.arrayIndexOf(this.affirmations, value.toLowerCase()) !== -1;
            }

            return value;
        },
        /**
         * Determines whether or not the current item and the new item are the same.
         * @method areSameItem
         * @param {object} currentItem
         * @param {object} newItem
         * @param {object} currentActivationData
         * @param {object} newActivationData
         * @return {boolean}
         */
        areSameItem: function (currentItem, newItem, currentActivationData, newActivationData) {
            return currentItem == newItem;
        },
        /**
         * Called immediately before the new item is activated.
         * @method beforeActivate
         * @param {object} newItem
         */
        beforeActivate: function (newItem) {
            return newItem;
        },
        /**
         * Called immediately after the old item is deactivated.
         * @method afterDeactivate
         * @param {object} oldItem The previous item.
         * @param {boolean} close Whether or not the previous item was closed.
         * @param {function} setter The activate item setter function.
         */
        afterDeactivate: function (oldItem, close, setter) {
            if (close && setter) {
                setter(null);
            }
        },
        findChildActivator: function (item) {
            return null;
        }
    };

    /**
     * @class ActivatorModule
     * @static
     */
    activator = {
        /**
         * The default settings used by activators.
         * @property {ActivatorSettings} defaults
         */
        defaults: activatorSettings,
        /**
         * Creates a new activator.
         * @method create
         * @param {object} [initialActiveItem] The item which should be immediately activated upon creation of the ativator.
         * @param {ActivatorSettings} [settings] Per activator overrides of the default activator settings.
         * @return {Activator} The created activator.
         */
        create: createActivator,
        /**
         * Determines whether or not the provided object is an activator or not.
         * @method isActivator
         * @param {object} object Any object you wish to verify as an activator or not.
         * @return {boolean} True if the object is an activator; false otherwise.
         */
        isActivator: function (object) {
            return object && object.__activator__;
        }
    };

    return activator;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The viewLocator module collaborates with the viewEngine module to provide views (literally dom sub-trees) to other parts of the framework as needed. The primary consumer of the viewLocator is the composition module.
 * @module viewLocator
 * @requires system
 * @requires viewEngine
 */
define('durandal/viewLocator', ['durandal/system', 'durandal/viewEngine'], function (system, viewEngine) {
    function findInElements(nodes, url) {
        for (var i = 0; i < nodes.length; i++) {
            var current = nodes[i];
            var existingUrl = current.getAttribute('data-view');
            if (existingUrl == url) {
                return current;
            }
        }
    }

    function escape(str) {
        return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    }

    /**
     * @class ViewLocatorModule
     * @static
     */
    return {
        /**
         * Allows you to set up a convention for mapping module folders to view folders. It is a convenience method that customizes `convertModuleIdToViewId` and `translateViewIdToArea` under the covers.
         * @method useConvention
         * @param {string} [modulesPath] A string to match in the path and replace with the viewsPath. If not specified, the match is 'viewmodels'.
         * @param {string} [viewsPath] The replacement for the modulesPath. If not specified, the replacement is 'views'.
         * @param {string} [areasPath] Partial views are mapped to the "views" folder if not specified. Use this parameter to change their location.
         */
        useConvention: function (modulesPath, viewsPath, areasPath) {
            modulesPath = modulesPath || 'viewmodels';
            viewsPath = viewsPath || 'views';
            areasPath = areasPath || viewsPath;

            var reg = new RegExp(escape(modulesPath), 'gi');

            this.convertModuleIdToViewId = function (moduleId) {
                return moduleId.replace(reg, viewsPath);
            };

            this.translateViewIdToArea = function (viewId, area) {
                if (!area || area == 'partial') {
                    return areasPath + '/' + viewId;
                }

                return areasPath + '/' + area + '/' + viewId;
            };
        },
        /**
         * Maps an object instance to a view instance.
         * @method locateViewForObject
         * @param {object} obj The object to locate the view for.
         * @param {string} [area] The area to translate the view to.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateViewForObject: function (obj, area, elementsToSearch) {
            var view;

            if (obj.getView) {
                view = obj.getView();
                if (view) {
                    return this.locateView(view, area, elementsToSearch);
                }
            }

            if (obj.viewUrl) {
                return this.locateView(obj.viewUrl, area, elementsToSearch);
            }

            var id = system.getModuleId(obj);
            if (id) {
                return this.locateView(this.convertModuleIdToViewId(id), area, elementsToSearch);
            }

            return this.locateView(this.determineFallbackViewId(obj), area, elementsToSearch);
        },
        /**
         * Converts a module id into a view id. By default the ids are the same.
         * @method convertModuleIdToViewId
         * @param {string} moduleId The module id.
         * @return {string} The view id.
         */
        convertModuleIdToViewId: function (moduleId) {
            return moduleId;
        },
        /**
         * If no view id can be determined, this function is called to genreate one. By default it attempts to determine the object's type and use that.
         * @method determineFallbackViewId
         * @param {object} obj The object to determine the fallback id for.
         * @return {string} The view id.
         */
        determineFallbackViewId: function (obj) {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((obj).constructor.toString());
            var typeName = (results && results.length > 1) ? results[1] : "";
            typeName = typeName.trim();
            return 'views/' + typeName;
        },
        /**
         * Takes a view id and translates it into a particular area. By default, no translation occurs.
         * @method translateViewIdToArea
         * @param {string} viewId The view id.
         * @param {string} area The area to translate the view to.
         * @return {string} The translated view id.
         */
        translateViewIdToArea: function (viewId, area) {
            return viewId;
        },
        /**
         * Locates the specified view.
         * @method locateView
         * @param {string|DOMElement} viewOrUrlOrId A view, view url or view id to locate.
         * @param {string} [area] The area to translate the view to.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateView: function (viewOrUrlOrId, area, elementsToSearch) {
            if (typeof viewOrUrlOrId === 'string') {
                var viewId;

                if (viewEngine.isViewUrl(viewOrUrlOrId)) {
                    viewId = viewEngine.convertViewUrlToViewId(viewOrUrlOrId);
                } else {
                    viewId = viewOrUrlOrId;
                }

                if (area) {
                    viewId = this.translateViewIdToArea(viewId, area);
                }

                if (elementsToSearch) {
                    var existing = findInElements(elementsToSearch, viewId);
                    if (existing) {
                        return system.defer(function (dfd) {
                            dfd.resolve(existing);
                        }).promise();
                    }
                }

                return viewEngine.createView(viewId);
            }

            return system.defer(function (dfd) {
                dfd.resolve(viewOrUrlOrId);
            }).promise();
        }
    };
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The app module controls app startup, plugin loading/configuration and root visual display.
 * @module app
 * @requires system
 * @requires viewEngine
 * @requires composition
 * @requires events
 * @requires jquery
 */
define("durandal/app", ['durandal/system', 'durandal/viewEngine', 'durandal/composition', 'durandal/events', 'jquery'], function (system, viewEngine, composition, Events, $) {
    var app,
        allPluginIds = [],
        allPluginConfigs = [];

    function loadPlugins() {
        return system.defer(function (dfd) {
            if (allPluginIds.length == 0) {
                dfd.resolve();
                return;
            }

            system.acquire(allPluginIds).then(function (loaded) {
                for (var i = 0; i < loaded.length; i++) {
                    var currentModule = loaded[i];

                    if (currentModule.install) {
                        var config = allPluginConfigs[i];
                        if (!system.isObject(config)) {
                            config = {};
                        }

                        currentModule.install(config);
                        system.log('Plugin:Installed ' + allPluginIds[i]);
                    } else {
                        system.log('Plugin:Loaded ' + allPluginIds[i]);
                    }
                }

                dfd.resolve();
            }).fail(function (err) {
                system.error('Failed to load plugin(s). Details: ' + err.message);
            });
        }).promise();
    }

    /**
     * @class AppModule
     * @static
     * @uses Events
     */
    app = {
        /**
         * The title of your application.
         * @property {string} title
         */
        title: 'Application',
        /**
         * Configures one or more plugins to be loaded and installed into the application.
         * @method configurePlugins
         * @param {object} config Keys are plugin names. Values can be truthy, to simply install the plugin, or a configuration object to pass to the plugin.
         * @param {string} [baseUrl] The base url to load the plugins from.
         */
        configurePlugins: function (config, baseUrl) {
            var pluginIds = system.keys(config);
            baseUrl = baseUrl || 'plugins/';

            if (baseUrl.indexOf('/', baseUrl.length - 1) === -1) {
                baseUrl += '/';
            }

            for (var i = 0; i < pluginIds.length; i++) {
                var key = pluginIds[i];
                allPluginIds.push(baseUrl + key);
                allPluginConfigs.push(config[key]);
            }
        },
        /**
         * Starts the application.
         * @method start
         * @return {promise}
         */
        start: function () {
            system.log('Application:Starting');

            if (this.title) {
                document.title = this.title;
            }

            return system.defer(function (dfd) {
                $(function () {
                    loadPlugins().then(function () {
                        dfd.resolve();
                        system.log('Application:Started');
                    });
                });
            }).promise();
        },
        /**
         * Sets the root module/view for the application.
         * @method setRoot
         * @param {string} root The root view or module.
         * @param {string} [transition] The transition to use from the previous root (or splash screen) into the new root.
         * @param {string} [applicationHost] The application host element or id. By default the id 'applicationHost' will be used.
         */
        setRoot: function (root, transition, applicationHost) {
            var hostElement, settings = { activate: true, transition: transition };

            if (!applicationHost || system.isString(applicationHost)) {
                hostElement = document.getElementById(applicationHost || 'applicationHost');
            } else {
                hostElement = applicationHost;
            }

            if (system.isString(root)) {
                if (viewEngine.isViewUrl(root)) {
                    settings.view = root;
                } else {
                    settings.model = root;
                }
            } else {
                settings.model = root;
            }

            function finishComposition() {
                if (settings.model) {
                    if (settings.model.canActivate) {
                        try {
                            var result = settings.model.canActivate();
                            if (result && result.then) {
                                result.then(function (actualResult) {
                                    if (actualResult) {
                                        composition.compose(hostElement, settings);
                                    }
                                }).fail(function (err) {
                                    system.error(err);
                                });
                            } else if (result) {
                                composition.compose(hostElement, settings);
                            }
                        } catch (er) {
                            system.error(er);
                        }
                    } else {
                        composition.compose(hostElement, settings);
                    }
                } else {
                    composition.compose(hostElement, settings);
                }
            }

            if (system.isString(settings.model)) {
                system.acquire(settings.model).then(function (module) {
                    settings.model = system.resolveObject(module);
                    finishComposition();
                }).fail(function (err) {
                    system.error('Failed to load root module (' + settings.model + '). Details: ' + err.message);
                });
            } else {
                finishComposition();
            }
        }
    };

    Events.includeIn(app);

    return app;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The system module encapsulates the most basic features used by other modules.
 * @module system
 * @requires require
 * @requires jquery
 */
define('durandal/system', ['require', 'jquery'], function (require, $) {
    var isDebugging = false,
        nativeKeys = Object.keys,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        system,
        treatAsIE8 = false,
        nativeIsArray = Array.isArray,
        slice = Array.prototype.slice;

    //polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    //see http://patik.com/blog/complete-cross-browser-console-log/
    // Tell IE9 to use its built-in console
    if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function') && typeof console.log == 'object') {
        try {
            ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd']
                .forEach(function (method) {
                    console[method] = this.call(console[method], console);
                }, Function.prototype.bind);
        } catch (ex) {
            treatAsIE8 = true;
        }
    }

    // callback for dojo's loader 
    // note: if you wish to use Durandal with dojo's AMD loader,
    // currently you must fork the dojo source with the following
    // dojo/dojo.js, line 1187, the last line of the finishExec() function: 
    //  (add) signal("moduleLoaded", [module.result, module.mid]);
    // an enhancement request has been submitted to dojo to make this
    // a permanent change. To view the status of this request, visit:
    // http://bugs.dojotoolkit.org/ticket/16727

    if (require.on) {
        require.on("moduleLoaded", function (module, mid) {
            system.setModuleId(module, mid);
        });
    }

    // callback for require.js loader
    if (typeof requirejs !== 'undefined') {
        requirejs.onResourceLoad = function (context, map, depArray) {
            system.setModuleId(context.defined[map.id], map.id);
        };
    }

    var noop = function () { };

    var log = function () {
        try {
            // Modern browsers
            if (typeof console != 'undefined' && typeof console.log == 'function') {
                // Opera 11
                if (window.opera) {
                    var i = 0;
                    while (i < arguments.length) {
                        console.log('Item ' + (i + 1) + ': ' + arguments[i]);
                        i++;
                    }
                }
                    // All other modern browsers
                else if ((slice.call(arguments)).length == 1 && typeof slice.call(arguments)[0] == 'string') {
                    console.log((slice.call(arguments)).toString());
                } else {
                    console.log.apply(console, slice.call(arguments));
                }
            }
                // IE8
            else if ((!Function.prototype.bind || treatAsIE8) && typeof console != 'undefined' && typeof console.log == 'object') {
                Function.prototype.call.call(console.log, console, slice.call(arguments));
            }

            // IE7 and lower, and other old browsers
        } catch (ignore) { }
    };

    var logError = function (error, err) {
        var exception;

        if (error instanceof Error) {
            exception = error;
        } else {
            exception = new Error(error);
        }

        exception.innerError = err;

        //Report the error as an error, not as a log
        try {
            // Modern browsers (it's only a single item, no need for argument splitting as in log() above)
            if (typeof console != 'undefined' && typeof console.error == 'function') {
                console.error(exception);
            }
                // IE8
            else if ((!Function.prototype.bind || treatAsIE8) && typeof console != 'undefined' && typeof console.error == 'object') {
                Function.prototype.call.call(console.error, console, exception);
            }
            // IE7 and lower, and other old browsers
        } catch (ignore) { }

        throw exception;
    };

    /**
     * @class SystemModule
     * @static
     */
    system = {
        /**
         * Durandal's version.
         * @property {string} version
         */
        version: "2.1.0",
        /**
         * A noop function.
         * @method noop
         */
        noop: noop,
        /**
         * Gets the module id for the specified object.
         * @method getModuleId
         * @param {object} obj The object whose module id you wish to determine.
         * @return {string} The module id.
         */
        getModuleId: function (obj) {
            if (!obj) {
                return null;
            }

            if (typeof obj == 'function' && obj.prototype) {
                return obj.prototype.__moduleId__;
            }

            if (typeof obj == 'string') {
                return null;
            }

            return obj.__moduleId__;
        },
        /**
         * Sets the module id for the specified object.
         * @method setModuleId
         * @param {object} obj The object whose module id you wish to set.
         * @param {string} id The id to set for the specified object.
         */
        setModuleId: function (obj, id) {
            if (!obj) {
                return;
            }

            if (typeof obj == 'function' && obj.prototype) {
                obj.prototype.__moduleId__ = id;
                return;
            }

            if (typeof obj == 'string') {
                return;
            }

            obj.__moduleId__ = id;
        },
        /**
         * Resolves the default object instance for a module. If the module is an object, the module is returned. If the module is a function, that function is called with `new` and it's result is returned.
         * @method resolveObject
         * @param {object} module The module to use to get/create the default object for.
         * @return {object} The default object for the module.
         */
        resolveObject: function (module) {
            if (system.isFunction(module)) {
                return new module();
            } else {
                return module;
            }
        },
        /**
         * Gets/Sets whether or not Durandal is in debug mode.
         * @method debug
         * @param {boolean} [enable] Turns on/off debugging.
         * @return {boolean} Whether or not Durandal is current debugging.
         */
        debug: function (enable) {
            if (arguments.length == 1) {
                isDebugging = enable;
                if (isDebugging) {
                    this.log = log;
                    this.error = logError;
                    this.log('Debug:Enabled');
                } else {
                    this.log('Debug:Disabled');
                    this.log = noop;
                    this.error = noop;
                }
            }

            return isDebugging;
        },
        /**
         * Logs data to the console. Pass any number of parameters to be logged. Log output is not processed if the framework is not running in debug mode.
         * @method log
         * @param {object} info* The objects to log.
         */
        log: noop,
        /**
         * Logs an error.
         * @method error
         * @param {string|Error} obj The error to report.
         */
        error: noop,
        /**
         * Asserts a condition by throwing an error if the condition fails.
         * @method assert
         * @param {boolean} condition The condition to check.
         * @param {string} message The message to report in the error if the condition check fails.
         */
        assert: function (condition, message) {
            if (!condition) {
                system.error(new Error(message || 'Assert:Failed'));
            }
        },
        /**
         * Creates a deferred object which can be used to create a promise. Optionally pass a function action to perform which will be passed an object used in resolving the promise.
         * @method defer
         * @param {function} [action] The action to defer. You will be passed the deferred object as a paramter.
         * @return {Deferred} The deferred object.
         */
        defer: function (action) {
            return $.Deferred(action);
        },
        /**
         * Creates a simple V4 UUID. This should not be used as a PK in your database. It can be used to generate internal, unique ids. For a more robust solution see [node-uuid](https://github.com/broofa/node-uuid).
         * @method guid
         * @return {string} The guid.
         */
        guid: function () {
            var d = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
        },
        /**
         * Uses require.js to obtain a module. This function returns a promise which resolves with the module instance. You can pass more than one module id to this function or an array of ids. If more than one or an array is passed, then the promise will resolve with an array of module instances.
         * @method acquire
         * @param {string|string[]} moduleId The id(s) of the modules to load.
         * @return {Promise} A promise for the loaded module(s).
         */
        acquire: function () {
            var modules,
                first = arguments[0],
                arrayRequest = false;

            if (system.isArray(first)) {
                modules = first;
                arrayRequest = true;
            } else {
                modules = slice.call(arguments, 0);
            }

            return this.defer(function (dfd) {
                require(modules, function () {
                    var args = arguments;
                    setTimeout(function () {
                        if (args.length > 1 || arrayRequest) {
                            dfd.resolve(slice.call(args, 0));
                        } else {
                            dfd.resolve(args[0]);
                        }
                    }, 1);
                }, function (err) {
                    dfd.reject(err);
                });
            }).promise();
        },
        /**
         * Extends the first object with the properties of the following objects.
         * @method extend
         * @param {object} obj The target object to extend.
         * @param {object} extension* Uses to extend the target object.
         */
        extend: function (obj) {
            var rest = slice.call(arguments, 1);

            for (var i = 0; i < rest.length; i++) {
                var source = rest[i];

                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            }

            return obj;
        },
        /**
         * Uses a setTimeout to wait the specified milliseconds.
         * @method wait
         * @param {number} milliseconds The number of milliseconds to wait.
         * @return {Promise}
         */
        wait: function (milliseconds) {
            return system.defer(function (dfd) {
                setTimeout(dfd.resolve, milliseconds);
            }).promise();
        }
    };

    /**
     * Gets all the owned keys of the specified object.
     * @method keys
     * @param {object} object The object whose owned keys should be returned.
     * @return {string[]} The keys.
     */
    system.keys = nativeKeys || function (obj) {
        if (obj !== Object(obj)) {
            throw new TypeError('Invalid object');
        }

        var keys = [];

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                keys[keys.length] = key;
            }
        }

        return keys;
    };

    /**
     * Determines if the specified object is an html element.
     * @method isElement
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    /**
     * Determines if the specified object is an array.
     * @method isArray
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) == '[object Array]';
    };

    /**
     * Determines if the specified object is...an object. ie. Not an array, string, etc.
     * @method isObject
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isObject = function (obj) {
        return obj === Object(obj);
    };

    /**
     * Determines if the specified object is a boolean.
     * @method isBoolean
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isBoolean = function (obj) {
        return typeof (obj) === "boolean";
    };

    /**
     * Determines if the specified object is a promise.
     * @method isPromise
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */
    system.isPromise = function (obj) {
        return obj && system.isFunction(obj.then);
    };

    /**
     * Determines if the specified object is a function arguments object.
     * @method isArguments
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a function.
     * @method isFunction
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a string.
     * @method isString
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a number.
     * @method isNumber
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a date.
     * @method isDate
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    /**
     * Determines if the specified object is a boolean.
     * @method isBoolean
     * @param {object} object The object to check.
     * @return {boolean} True if matches the type, false otherwise.
     */

    //isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    var isChecks = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];

    function makeIsFunction(name) {
        var value = '[object ' + name + ']';
        system['is' + name] = function (obj) {
            return toString.call(obj) == value;
        };
    }

    for (var i = 0; i < isChecks.length; i++) {
        makeIsFunction(isChecks[i]);
    }

    return system;
});

/*!
 * Knockout JavaScript library v3.4.0
 * (c) Steven Sanderson - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function () {
    (function (n) {
        var x = this || (0, eval)("this"), u = x.document, M = x.navigator, v = x.jQuery, F = x.JSON; (function (n) { "function" === typeof define && define.amd ? define('durandal/knockout', ["exports", "require"], n) : "object" === typeof exports && "object" === typeof module ? n(module.exports || exports) : n(x.ko = {}) })(function (N, O) {
            function J(a, c) { return null === a || typeof a in T ? a === c : !1 } function U(b, c) { var d; return function () { d || (d = a.a.setTimeout(function () { d = n; b() }, c)) } } function V(b, c) { var d; return function () { clearTimeout(d); d = a.a.setTimeout(b, c) } } function W(a,
            c) { c && c !== I ? "beforeChange" === c ? this.Kb(a) : this.Ha(a, c) : this.Lb(a) } function X(a, c) { null !== c && c.k && c.k() } function Y(a, c) { var d = this.Hc, e = d[s]; e.R || (this.lb && this.Ma[c] ? (d.Pb(c, a, this.Ma[c]), this.Ma[c] = null, --this.lb) : e.r[c] || d.Pb(c, a, e.s ? { ia: a } : d.uc(a))) } function K(b, c, d, e) {
                a.d[b] = { init: function (b, g, k, l, m) { var h, r; a.m(function () { var q = a.a.c(g()), p = !d !== !q, A = !r; if (A || c || p !== h) A && a.va.Aa() && (r = a.a.ua(a.f.childNodes(b), !0)), p ? (A || a.f.da(b, a.a.ua(r)), a.eb(e ? e(m, q) : m, b)) : a.f.xa(b), h = p }, null, { i: b }); return { controlsDescendantBindings: !0 } } };
                a.h.ta[b] = !1; a.f.Z[b] = !0
            } var a = "undefined" !== typeof N ? N : {}; a.b = function (b, c) { for (var d = b.split("."), e = a, f = 0; f < d.length - 1; f++) e = e[d[f]]; e[d[d.length - 1]] = c }; a.G = function (a, c, d) { a[c] = d }; a.version = "3.4.0"; a.b("version", a.version); a.options = { deferUpdates: !1, useOnlyNativeEvents: !1 }; a.a = function () {
                function b(a, b) { for (var c in a) a.hasOwnProperty(c) && b(c, a[c]) } function c(a, b) { if (b) for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]); return a } function d(a, b) { a.__proto__ = b; return a } function e(b, c, d, e) {
                    var h = b[c].match(r) ||
                    []; a.a.q(d.match(r), function (b) { a.a.pa(h, b, e) }); b[c] = h.join(" ")
                } var f = { __proto__: [] } instanceof Array, g = "function" === typeof Symbol, k = {}, l = {}; k[M && /Firefox\/2/i.test(M.userAgent) ? "KeyboardEvent" : "UIEvents"] = ["keyup", "keydown", "keypress"]; k.MouseEvents = "click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" "); b(k, function (a, b) { if (b.length) for (var c = 0, d = b.length; c < d; c++) l[b[c]] = a }); var m = { propertychange: !0 }, h = u && function () {
                    for (var a = 3, b = u.createElement("div"), c =
                    b.getElementsByTagName("i") ; b.innerHTML = "\x3c!--[if gt IE " + ++a + "]><i></i><![endif]--\x3e", c[0];); return 4 < a ? a : n
                }(), r = /\S+/g; return {
                    cc: ["authenticity_token", /^__RequestVerificationToken(_.*)?$/], q: function (a, b) { for (var c = 0, d = a.length; c < d; c++) b(a[c], c) }, o: function (a, b) { if ("function" == typeof Array.prototype.indexOf) return Array.prototype.indexOf.call(a, b); for (var c = 0, d = a.length; c < d; c++) if (a[c] === b) return c; return -1 }, Sb: function (a, b, c) {
                        for (var d = 0, e = a.length; d < e; d++) if (b.call(c, a[d], d)) return a[d];
                        return null
                    }, La: function (b, c) { var d = a.a.o(b, c); 0 < d ? b.splice(d, 1) : 0 === d && b.shift() }, Tb: function (b) { b = b || []; for (var c = [], d = 0, e = b.length; d < e; d++) 0 > a.a.o(c, b[d]) && c.push(b[d]); return c }, fb: function (a, b) { a = a || []; for (var c = [], d = 0, e = a.length; d < e; d++) c.push(b(a[d], d)); return c }, Ka: function (a, b) { a = a || []; for (var c = [], d = 0, e = a.length; d < e; d++) b(a[d], d) && c.push(a[d]); return c }, ra: function (a, b) { if (b instanceof Array) a.push.apply(a, b); else for (var c = 0, d = b.length; c < d; c++) a.push(b[c]); return a }, pa: function (b, c, d) {
                        var e =
                        a.a.o(a.a.zb(b), c); 0 > e ? d && b.push(c) : d || b.splice(e, 1)
                    }, ka: f, extend: c, Xa: d, Ya: f ? d : c, D: b, Ca: function (a, b) { if (!a) return a; var c = {}, d; for (d in a) a.hasOwnProperty(d) && (c[d] = b(a[d], d, a)); return c }, ob: function (b) { for (; b.firstChild;) a.removeNode(b.firstChild) }, jc: function (b) { b = a.a.V(b); for (var c = (b[0] && b[0].ownerDocument || u).createElement("div"), d = 0, e = b.length; d < e; d++) c.appendChild(a.$(b[d])); return c }, ua: function (b, c) { for (var d = 0, e = b.length, h = []; d < e; d++) { var m = b[d].cloneNode(!0); h.push(c ? a.$(m) : m) } return h },
                    da: function (b, c) { a.a.ob(b); if (c) for (var d = 0, e = c.length; d < e; d++) b.appendChild(c[d]) }, qc: function (b, c) { var d = b.nodeType ? [b] : b; if (0 < d.length) { for (var e = d[0], h = e.parentNode, m = 0, l = c.length; m < l; m++) h.insertBefore(c[m], e); m = 0; for (l = d.length; m < l; m++) a.removeNode(d[m]) } }, za: function (a, b) {
                        if (a.length) {
                            for (b = 8 === b.nodeType && b.parentNode || b; a.length && a[0].parentNode !== b;) a.splice(0, 1); for (; 1 < a.length && a[a.length - 1].parentNode !== b;) a.length--; if (1 < a.length) {
                                var c = a[0], d = a[a.length - 1]; for (a.length = 0; c !== d;) a.push(c),
                                c = c.nextSibling; a.push(d)
                            }
                        } return a
                    }, sc: function (a, b) { 7 > h ? a.setAttribute("selected", b) : a.selected = b }, $a: function (a) { return null === a || a === n ? "" : a.trim ? a.trim() : a.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, "") }, nd: function (a, b) { a = a || ""; return b.length > a.length ? !1 : a.substring(0, b.length) === b }, Mc: function (a, b) {
                        if (a === b) return !0; if (11 === a.nodeType) return !1; if (b.contains) return b.contains(3 === a.nodeType ? a.parentNode : a); if (b.compareDocumentPosition) return 16 == (b.compareDocumentPosition(a) & 16); for (; a && a !=
                        b;) a = a.parentNode; return !!a
                    }, nb: function (b) { return a.a.Mc(b, b.ownerDocument.documentElement) }, Qb: function (b) { return !!a.a.Sb(b, a.a.nb) }, A: function (a) { return a && a.tagName && a.tagName.toLowerCase() }, Wb: function (b) { return a.onError ? function () { try { return b.apply(this, arguments) } catch (c) { throw a.onError && a.onError(c), c; } } : b }, setTimeout: function (b, c) { return setTimeout(a.a.Wb(b), c) }, $b: function (b) { setTimeout(function () { a.onError && a.onError(b); throw b; }, 0) }, p: function (b, c, d) {
                        var e = a.a.Wb(d); d = h && m[c]; if (a.options.useOnlyNativeEvents ||
                        d || !v) if (d || "function" != typeof b.addEventListener) if ("undefined" != typeof b.attachEvent) { var l = function (a) { e.call(b, a) }, f = "on" + c; b.attachEvent(f, l); a.a.F.oa(b, function () { b.detachEvent(f, l) }) } else throw Error("Browser doesn't support addEventListener or attachEvent"); else b.addEventListener(c, e, !1); else v(b).bind(c, e)
                    }, Da: function (b, c) {
                        if (!b || !b.nodeType) throw Error("element must be a DOM node when calling triggerEvent"); var d; "input" === a.a.A(b) && b.type && "click" == c.toLowerCase() ? (d = b.type, d = "checkbox" ==
                        d || "radio" == d) : d = !1; if (a.options.useOnlyNativeEvents || !v || d) if ("function" == typeof u.createEvent) if ("function" == typeof b.dispatchEvent) d = u.createEvent(l[c] || "HTMLEvents"), d.initEvent(c, !0, !0, x, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, b), b.dispatchEvent(d); else throw Error("The supplied element doesn't support dispatchEvent"); else if (d && b.click) b.click(); else if ("undefined" != typeof b.fireEvent) b.fireEvent("on" + c); else throw Error("Browser doesn't support triggering events"); else v(b).trigger(c)
                    }, c: function (b) {
                        return a.H(b) ?
                        b() : b
                    }, zb: function (b) { return a.H(b) ? b.t() : b }, bb: function (b, c, d) { var h; c && ("object" === typeof b.classList ? (h = b.classList[d ? "add" : "remove"], a.a.q(c.match(r), function (a) { h.call(b.classList, a) })) : "string" === typeof b.className.baseVal ? e(b.className, "baseVal", c, d) : e(b, "className", c, d)) }, Za: function (b, c) { var d = a.a.c(c); if (null === d || d === n) d = ""; var e = a.f.firstChild(b); !e || 3 != e.nodeType || a.f.nextSibling(e) ? a.f.da(b, [b.ownerDocument.createTextNode(d)]) : e.data = d; a.a.Rc(b) }, rc: function (a, b) {
                        a.name = b; if (7 >= h) try {
                            a.mergeAttributes(u.createElement("<input name='" +
                            a.name + "'/>"), !1)
                        } catch (c) { }
                    }, Rc: function (a) { 9 <= h && (a = 1 == a.nodeType ? a : a.parentNode, a.style && (a.style.zoom = a.style.zoom)) }, Nc: function (a) { if (h) { var b = a.style.width; a.style.width = 0; a.style.width = b } }, hd: function (b, c) { b = a.a.c(b); c = a.a.c(c); for (var d = [], e = b; e <= c; e++) d.push(e); return d }, V: function (a) { for (var b = [], c = 0, d = a.length; c < d; c++) b.push(a[c]); return b }, Yb: function (a) { return g ? Symbol(a) : a }, rd: 6 === h, sd: 7 === h, C: h, ec: function (b, c) {
                        for (var d = a.a.V(b.getElementsByTagName("input")).concat(a.a.V(b.getElementsByTagName("textarea"))),
                        e = "string" == typeof c ? function (a) { return a.name === c } : function (a) { return c.test(a.name) }, h = [], m = d.length - 1; 0 <= m; m--) e(d[m]) && h.push(d[m]); return h
                    }, ed: function (b) { return "string" == typeof b && (b = a.a.$a(b)) ? F && F.parse ? F.parse(b) : (new Function("return " + b))() : null }, Eb: function (b, c, d) {
                        if (!F || !F.stringify) throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
                        return F.stringify(a.a.c(b), c, d)
                    }, fd: function (c, d, e) {
                        e = e || {}; var h = e.params || {}, m = e.includeFields || this.cc, l = c; if ("object" == typeof c && "form" === a.a.A(c)) for (var l = c.action, f = m.length - 1; 0 <= f; f--) for (var g = a.a.ec(c, m[f]), k = g.length - 1; 0 <= k; k--) h[g[k].name] = g[k].value; d = a.a.c(d); var r = u.createElement("form"); r.style.display = "none"; r.action = l; r.method = "post"; for (var n in d) c = u.createElement("input"), c.type = "hidden", c.name = n, c.value = a.a.Eb(a.a.c(d[n])), r.appendChild(c); b(h, function (a, b) {
                            var c = u.createElement("input");
                            c.type = "hidden"; c.name = a; c.value = b; r.appendChild(c)
                        }); u.body.appendChild(r); e.submitter ? e.submitter(r) : r.submit(); setTimeout(function () { r.parentNode.removeChild(r) }, 0)
                    }
                }
            }(); a.b("utils", a.a); a.b("utils.arrayForEach", a.a.q); a.b("utils.arrayFirst", a.a.Sb); a.b("utils.arrayFilter", a.a.Ka); a.b("utils.arrayGetDistinctValues", a.a.Tb); a.b("utils.arrayIndexOf", a.a.o); a.b("utils.arrayMap", a.a.fb); a.b("utils.arrayPushAll", a.a.ra); a.b("utils.arrayRemoveItem", a.a.La); a.b("utils.extend", a.a.extend); a.b("utils.fieldsIncludedWithJsonPost",
            a.a.cc); a.b("utils.getFormFields", a.a.ec); a.b("utils.peekObservable", a.a.zb); a.b("utils.postJson", a.a.fd); a.b("utils.parseJson", a.a.ed); a.b("utils.registerEventHandler", a.a.p); a.b("utils.stringifyJson", a.a.Eb); a.b("utils.range", a.a.hd); a.b("utils.toggleDomNodeCssClass", a.a.bb); a.b("utils.triggerEvent", a.a.Da); a.b("utils.unwrapObservable", a.a.c); a.b("utils.objectForEach", a.a.D); a.b("utils.addOrRemoveItem", a.a.pa); a.b("utils.setTextContent", a.a.Za); a.b("unwrap", a.a.c); Function.prototype.bind || (Function.prototype.bind =
            function (a) { var c = this; if (1 === arguments.length) return function () { return c.apply(a, arguments) }; var d = Array.prototype.slice.call(arguments, 1); return function () { var e = d.slice(0); e.push.apply(e, arguments); return c.apply(a, e) } }); a.a.e = new function () {
                function a(b, g) { var k = b[d]; if (!k || "null" === k || !e[k]) { if (!g) return n; k = b[d] = "ko" + c++; e[k] = {} } return e[k] } var c = 0, d = "__ko__" + (new Date).getTime(), e = {}; return {
                    get: function (c, d) { var e = a(c, !1); return e === n ? n : e[d] }, set: function (c, d, e) {
                        if (e !== n || a(c, !1) !== n) a(c, !0)[d] =
                        e
                    }, clear: function (a) { var b = a[d]; return b ? (delete e[b], a[d] = null, !0) : !1 }, I: function () { return c++ + d }
                }
            }; a.b("utils.domData", a.a.e); a.b("utils.domData.clear", a.a.e.clear); a.a.F = new function () {
                function b(b, c) { var e = a.a.e.get(b, d); e === n && c && (e = [], a.a.e.set(b, d, e)); return e } function c(d) { var e = b(d, !1); if (e) for (var e = e.slice(0), l = 0; l < e.length; l++) e[l](d); a.a.e.clear(d); a.a.F.cleanExternalData(d); if (f[d.nodeType]) for (e = d.firstChild; d = e;) e = d.nextSibling, 8 === d.nodeType && c(d) } var d = a.a.e.I(), e = { 1: !0, 8: !0, 9: !0 },
                f = { 1: !0, 9: !0 }; return { oa: function (a, c) { if ("function" != typeof c) throw Error("Callback must be a function"); b(a, !0).push(c) }, pc: function (c, e) { var l = b(c, !1); l && (a.a.La(l, e), 0 == l.length && a.a.e.set(c, d, n)) }, $: function (b) { if (e[b.nodeType] && (c(b), f[b.nodeType])) { var d = []; a.a.ra(d, b.getElementsByTagName("*")); for (var l = 0, m = d.length; l < m; l++) c(d[l]) } return b }, removeNode: function (b) { a.$(b); b.parentNode && b.parentNode.removeChild(b) }, cleanExternalData: function (a) { v && "function" == typeof v.cleanData && v.cleanData([a]) } }
            };
            a.$ = a.a.F.$; a.removeNode = a.a.F.removeNode; a.b("cleanNode", a.$); a.b("removeNode", a.removeNode); a.b("utils.domNodeDisposal", a.a.F); a.b("utils.domNodeDisposal.addDisposeCallback", a.a.F.oa); a.b("utils.domNodeDisposal.removeDisposeCallback", a.a.F.pc); (function () {
                var b = [0, "", ""], c = [1, "<table>", "</table>"], d = [3, "<table><tbody><tr>", "</tr></tbody></table>"], e = [1, "<select multiple='multiple'>", "</select>"], f = { thead: c, tbody: c, tfoot: c, tr: [2, "<table><tbody>", "</tbody></table>"], td: d, th: d, option: e, optgroup: e },
                g = 8 >= a.a.C; a.a.ma = function (c, d) {
                    var e; if (v) if (v.parseHTML) e = v.parseHTML(c, d) || []; else { if ((e = v.clean([c], d)) && e[0]) { for (var h = e[0]; h.parentNode && 11 !== h.parentNode.nodeType;) h = h.parentNode; h.parentNode && h.parentNode.removeChild(h) } } else {
                        (e = d) || (e = u); var h = e.parentWindow || e.defaultView || x, r = a.a.$a(c).toLowerCase(), q = e.createElement("div"), p; p = (r = r.match(/^<([a-z]+)[ >]/)) && f[r[1]] || b; r = p[0]; p = "ignored<div>" + p[1] + c + p[2] + "</div>"; "function" == typeof h.innerShiv ? q.appendChild(h.innerShiv(p)) : (g && e.appendChild(q),
                        q.innerHTML = p, g && q.parentNode.removeChild(q)); for (; r--;) q = q.lastChild; e = a.a.V(q.lastChild.childNodes)
                    } return e
                }; a.a.Cb = function (b, c) { a.a.ob(b); c = a.a.c(c); if (null !== c && c !== n) if ("string" != typeof c && (c = c.toString()), v) v(b).html(c); else for (var d = a.a.ma(c, b.ownerDocument), e = 0; e < d.length; e++) b.appendChild(d[e]) }
            })(); a.b("utils.parseHtmlFragment", a.a.ma); a.b("utils.setHtml", a.a.Cb); a.M = function () {
                function b(c, e) {
                    if (c) if (8 == c.nodeType) { var f = a.M.lc(c.nodeValue); null != f && e.push({ Lc: c, cd: f }) } else if (1 == c.nodeType) for (var f =
                    0, g = c.childNodes, k = g.length; f < k; f++) b(g[f], e)
                } var c = {}; return {
                    wb: function (a) { if ("function" != typeof a) throw Error("You can only pass a function to ko.memoization.memoize()"); var b = (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1) + (4294967296 * (1 + Math.random()) | 0).toString(16).substring(1); c[b] = a; return "\x3c!--[ko_memo:" + b + "]--\x3e" }, xc: function (a, b) {
                        var f = c[a]; if (f === n) throw Error("Couldn't find any memo with ID " + a + ". Perhaps it's already been unmemoized."); try {
                            return f.apply(null, b || []),
                            !0
                        } finally { delete c[a] }
                    }, yc: function (c, e) { var f = []; b(c, f); for (var g = 0, k = f.length; g < k; g++) { var l = f[g].Lc, m = [l]; e && a.a.ra(m, e); a.M.xc(f[g].cd, m); l.nodeValue = ""; l.parentNode && l.parentNode.removeChild(l) } }, lc: function (a) { return (a = a.match(/^\[ko_memo\:(.*?)\]$/)) ? a[1] : null }
                }
            }(); a.b("memoization", a.M); a.b("memoization.memoize", a.M.wb); a.b("memoization.unmemoize", a.M.xc); a.b("memoization.parseMemoText", a.M.lc); a.b("memoization.unmemoizeDomNodeAndDescendants", a.M.yc); a.Y = function () {
                function b() {
                    if (e) for (var b =
                    e, c = 0, m; g < e;) if (m = d[g++]) { if (g > b) { if (5E3 <= ++c) { g = e; a.a.$b(Error("'Too much recursion' after processing " + c + " task groups.")); break } b = e } try { m() } catch (h) { a.a.$b(h) } }
                } function c() { b(); g = e = d.length = 0 } var d = [], e = 0, f = 1, g = 0; return {
                    scheduler: x.MutationObserver ? function (a) { var b = u.createElement("div"); (new MutationObserver(a)).observe(b, { attributes: !0 }); return function () { b.classList.toggle("foo") } }(c) : u && "onreadystatechange" in u.createElement("script") ? function (a) {
                        var b = u.createElement("script"); b.onreadystatechange =
                        function () { b.onreadystatechange = null; u.documentElement.removeChild(b); b = null; a() }; u.documentElement.appendChild(b)
                    } : function (a) { setTimeout(a, 0) }, Wa: function (b) { e || a.Y.scheduler(c); d[e++] = b; return f++ }, cancel: function (a) { a -= f - e; a >= g && a < e && (d[a] = null) }, resetForTesting: function () { var a = e - g; g = e = d.length = 0; return a }, md: b
                }
            }(); a.b("tasks", a.Y); a.b("tasks.schedule", a.Y.Wa); a.b("tasks.runEarly", a.Y.md); a.ya = {
                throttle: function (b, c) {
                    b.throttleEvaluation = c; var d = null; return a.B({
                        read: b, write: function (e) {
                            clearTimeout(d);
                            d = a.a.setTimeout(function () { b(e) }, c)
                        }
                    })
                }, rateLimit: function (a, c) { var d, e, f; "number" == typeof c ? d = c : (d = c.timeout, e = c.method); a.cb = !1; f = "notifyWhenChangesStop" == e ? V : U; a.Ta(function (a) { return f(a, d) }) }, deferred: function (b, c) { if (!0 !== c) throw Error("The 'deferred' extender only accepts the value 'true', because it is not supported to turn deferral off once enabled."); b.cb || (b.cb = !0, b.Ta(function (c) { var e; return function () { a.Y.cancel(e); e = a.Y.Wa(c); b.notifySubscribers(n, "dirty") } })) }, notify: function (a, c) {
                    a.equalityComparer =
                    "always" == c ? null : J
                }
            }; var T = { undefined: 1, "boolean": 1, number: 1, string: 1 }; a.b("extenders", a.ya); a.vc = function (b, c, d) { this.ia = b; this.gb = c; this.Kc = d; this.R = !1; a.G(this, "dispose", this.k) }; a.vc.prototype.k = function () { this.R = !0; this.Kc() }; a.J = function () { a.a.Ya(this, D); D.rb(this) }; var I = "change", D = {
                rb: function (a) { a.K = {}; a.Nb = 1 }, X: function (b, c, d) { var e = this; d = d || I; var f = new a.vc(e, c ? b.bind(c) : b, function () { a.a.La(e.K[d], f); e.Ia && e.Ia(d) }); e.sa && e.sa(d); e.K[d] || (e.K[d] = []); e.K[d].push(f); return f }, notifySubscribers: function (b,
                c) { c = c || I; c === I && this.zc(); if (this.Pa(c)) try { a.l.Ub(); for (var d = this.K[c].slice(0), e = 0, f; f = d[e]; ++e) f.R || f.gb(b) } finally { a.l.end() } }, Na: function () { return this.Nb }, Uc: function (a) { return this.Na() !== a }, zc: function () { ++this.Nb }, Ta: function (b) { var c = this, d = a.H(c), e, f, g; c.Ha || (c.Ha = c.notifySubscribers, c.notifySubscribers = W); var k = b(function () { c.Mb = !1; d && g === c && (g = c()); e = !1; c.tb(f, g) && c.Ha(f = g) }); c.Lb = function (a) { c.Mb = e = !0; g = a; k() }; c.Kb = function (a) { e || (f = a, c.Ha(a, "beforeChange")) } }, Pa: function (a) {
                    return this.K[a] &&
                    this.K[a].length
                }, Sc: function (b) { if (b) return this.K[b] && this.K[b].length || 0; var c = 0; a.a.D(this.K, function (a, b) { "dirty" !== a && (c += b.length) }); return c }, tb: function (a, c) { return !this.equalityComparer || !this.equalityComparer(a, c) }, extend: function (b) { var c = this; b && a.a.D(b, function (b, e) { var f = a.ya[b]; "function" == typeof f && (c = f(c, e) || c) }); return c }
            }; a.G(D, "subscribe", D.X); a.G(D, "extend", D.extend); a.G(D, "getSubscriptionsCount", D.Sc); a.a.ka && a.a.Xa(D, Function.prototype); a.J.fn = D; a.hc = function (a) {
                return null !=
                a && "function" == typeof a.X && "function" == typeof a.notifySubscribers
            }; a.b("subscribable", a.J); a.b("isSubscribable", a.hc); a.va = a.l = function () { function b(a) { d.push(e); e = a } function c() { e = d.pop() } var d = [], e, f = 0; return { Ub: b, end: c, oc: function (b) { if (e) { if (!a.hc(b)) throw Error("Only subscribable things can act as dependencies"); e.gb.call(e.Gc, b, b.Cc || (b.Cc = ++f)) } }, w: function (a, d, e) { try { return b(), a.apply(d, e || []) } finally { c() } }, Aa: function () { if (e) return e.m.Aa() }, Sa: function () { if (e) return e.Sa } } }(); a.b("computedContext",
            a.va); a.b("computedContext.getDependenciesCount", a.va.Aa); a.b("computedContext.isInitial", a.va.Sa); a.b("ignoreDependencies", a.qd = a.l.w); var E = a.a.Yb("_latestValue"); a.N = function (b) { function c() { if (0 < arguments.length) return c.tb(c[E], arguments[0]) && (c.ga(), c[E] = arguments[0], c.fa()), this; a.l.oc(c); return c[E] } c[E] = b; a.a.ka || a.a.extend(c, a.J.fn); a.J.fn.rb(c); a.a.Ya(c, B); a.options.deferUpdates && a.ya.deferred(c, !0); return c }; var B = {
                equalityComparer: J, t: function () { return this[E] }, fa: function () { this.notifySubscribers(this[E]) },
                ga: function () { this.notifySubscribers(this[E], "beforeChange") }
            }; a.a.ka && a.a.Xa(B, a.J.fn); var H = a.N.gd = "__ko_proto__"; B[H] = a.N; a.Oa = function (b, c) { return null === b || b === n || b[H] === n ? !1 : b[H] === c ? !0 : a.Oa(b[H], c) }; a.H = function (b) { return a.Oa(b, a.N) }; a.Ba = function (b) { return "function" == typeof b && b[H] === a.N || "function" == typeof b && b[H] === a.B && b.Vc ? !0 : !1 }; a.b("observable", a.N); a.b("isObservable", a.H); a.b("isWriteableObservable", a.Ba); a.b("isWritableObservable", a.Ba); a.b("observable.fn", B); a.G(B, "peek", B.t); a.G(B,
            "valueHasMutated", B.fa); a.G(B, "valueWillMutate", B.ga); a.la = function (b) { b = b || []; if ("object" != typeof b || !("length" in b)) throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined."); b = a.N(b); a.a.Ya(b, a.la.fn); return b.extend({ trackArrayChanges: !0 }) }; a.la.fn = {
                remove: function (b) {
                    for (var c = this.t(), d = [], e = "function" != typeof b || a.H(b) ? function (a) { return a === b } : b, f = 0; f < c.length; f++) { var g = c[f]; e(g) && (0 === d.length && this.ga(), d.push(g), c.splice(f, 1), f--) } d.length &&
                    this.fa(); return d
                }, removeAll: function (b) { if (b === n) { var c = this.t(), d = c.slice(0); this.ga(); c.splice(0, c.length); this.fa(); return d } return b ? this.remove(function (c) { return 0 <= a.a.o(b, c) }) : [] }, destroy: function (b) { var c = this.t(), d = "function" != typeof b || a.H(b) ? function (a) { return a === b } : b; this.ga(); for (var e = c.length - 1; 0 <= e; e--) d(c[e]) && (c[e]._destroy = !0); this.fa() }, destroyAll: function (b) { return b === n ? this.destroy(function () { return !0 }) : b ? this.destroy(function (c) { return 0 <= a.a.o(b, c) }) : [] }, indexOf: function (b) {
                    var c =
                    this(); return a.a.o(c, b)
                }, replace: function (a, c) { var d = this.indexOf(a); 0 <= d && (this.ga(), this.t()[d] = c, this.fa()) }
            }; a.a.ka && a.a.Xa(a.la.fn, a.N.fn); a.a.q("pop push reverse shift sort splice unshift".split(" "), function (b) { a.la.fn[b] = function () { var a = this.t(); this.ga(); this.Vb(a, b, arguments); var d = a[b].apply(a, arguments); this.fa(); return d === a ? this : d } }); a.a.q(["slice"], function (b) { a.la.fn[b] = function () { var a = this(); return a[b].apply(a, arguments) } }); a.b("observableArray", a.la); a.ya.trackArrayChanges = function (b,
            c) {
                function d() { if (!e) { e = !0; var c = b.notifySubscribers; b.notifySubscribers = function (a, b) { b && b !== I || ++k; return c.apply(this, arguments) }; var d = [].concat(b.t() || []); f = null; g = b.X(function (c) { c = [].concat(c || []); if (b.Pa("arrayChange")) { var e; if (!f || 1 < k) f = a.a.ib(d, c, b.hb); e = f } d = c; f = null; k = 0; e && e.length && b.notifySubscribers(e, "arrayChange") }) } } b.hb = {}; c && "object" == typeof c && a.a.extend(b.hb, c); b.hb.sparse = !0; if (!b.Vb) {
                    var e = !1, f = null, g, k = 0, l = b.sa, m = b.Ia; b.sa = function (a) { l && l.call(b, a); "arrayChange" === a && d() };
                    b.Ia = function (a) { m && m.call(b, a); "arrayChange" !== a || b.Pa("arrayChange") || (g.k(), e = !1) }; b.Vb = function (b, c, d) {
                        function m(a, b, c) { return l[l.length] = { status: a, value: b, index: c } } if (e && !k) {
                            var l = [], g = b.length, t = d.length, G = 0; switch (c) {
                                case "push": G = g; case "unshift": for (c = 0; c < t; c++) m("added", d[c], G + c); break; case "pop": G = g - 1; case "shift": g && m("deleted", b[G], G); break; case "splice": c = Math.min(Math.max(0, 0 > d[0] ? g + d[0] : d[0]), g); for (var g = 1 === t ? g : Math.min(c + (d[1] || 0), g), t = c + t - 2, G = Math.max(g, t), P = [], n = [], Q = 2; c < G; ++c,
                                ++Q) c < g && n.push(m("deleted", b[c], c)), c < t && P.push(m("added", d[Q], c)); a.a.dc(n, P); break; default: return
                            } f = l
                        }
                    }
                }
            }; var s = a.a.Yb("_state"); a.m = a.B = function (b, c, d) {
                function e() { if (0 < arguments.length) { if ("function" === typeof f) f.apply(g.pb, arguments); else throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters."); return this } a.l.oc(e); (g.S || g.s && e.Qa()) && e.aa(); return g.T } "object" === typeof b ? d = b : (d = d || {}, b && (d.read =
                b)); if ("function" != typeof d.read) throw Error("Pass a function that returns the value of the ko.computed"); var f = d.write, g = { T: n, S: !0, Ra: !1, Fb: !1, R: !1, Va: !1, s: !1, jd: d.read, pb: c || d.owner, i: d.disposeWhenNodeIsRemoved || d.i || null, wa: d.disposeWhen || d.wa, mb: null, r: {}, L: 0, bc: null }; e[s] = g; e.Vc = "function" === typeof f; a.a.ka || a.a.extend(e, a.J.fn); a.J.fn.rb(e); a.a.Ya(e, z); d.pure ? (g.Va = !0, g.s = !0, a.a.extend(e, $)) : d.deferEvaluation && a.a.extend(e, aa); a.options.deferUpdates && a.ya.deferred(e, !0); g.i && (g.Fb = !0, g.i.nodeType ||
                (g.i = null)); g.s || d.deferEvaluation || e.aa(); g.i && e.ba() && a.a.F.oa(g.i, g.mb = function () { e.k() }); return e
            }; var z = {
                equalityComparer: J, Aa: function () { return this[s].L }, Pb: function (a, c, d) { if (this[s].Va && c === this) throw Error("A 'pure' computed must not be called recursively"); this[s].r[a] = d; d.Ga = this[s].L++; d.na = c.Na() }, Qa: function () { var a, c, d = this[s].r; for (a in d) if (d.hasOwnProperty(a) && (c = d[a], c.ia.Uc(c.na))) return !0 }, bd: function () { this.Fa && !this[s].Ra && this.Fa() }, ba: function () { return this[s].S || 0 < this[s].L },
                ld: function () { this.Mb || this.ac() }, uc: function (a) { if (a.cb && !this[s].i) { var c = a.X(this.bd, this, "dirty"), d = a.X(this.ld, this); return { ia: a, k: function () { c.k(); d.k() } } } return a.X(this.ac, this) }, ac: function () { var b = this, c = b.throttleEvaluation; c && 0 <= c ? (clearTimeout(this[s].bc), this[s].bc = a.a.setTimeout(function () { b.aa(!0) }, c)) : b.Fa ? b.Fa() : b.aa(!0) }, aa: function (b) {
                    var c = this[s], d = c.wa; if (!c.Ra && !c.R) {
                        if (c.i && !a.a.nb(c.i) || d && d()) { if (!c.Fb) { this.k(); return } } else c.Fb = !1; c.Ra = !0; try { this.Qc(b) } finally { c.Ra = !1 } c.L ||
                        this.k()
                    }
                }, Qc: function (b) { var c = this[s], d = c.Va ? n : !c.L, e = { Hc: this, Ma: c.r, lb: c.L }; a.l.Ub({ Gc: e, gb: Y, m: this, Sa: d }); c.r = {}; c.L = 0; e = this.Pc(c, e); this.tb(c.T, e) && (c.s || this.notifySubscribers(c.T, "beforeChange"), c.T = e, c.s ? this.zc() : b && this.notifySubscribers(c.T)); d && this.notifySubscribers(c.T, "awake") }, Pc: function (b, c) { try { var d = b.jd; return b.pb ? d.call(b.pb) : d() } finally { a.l.end(), c.lb && !b.s && a.a.D(c.Ma, X), b.S = !1 } }, t: function () { var a = this[s]; (a.S && !a.L || a.s && this.Qa()) && this.aa(); return a.T }, Ta: function (b) {
                    a.J.fn.Ta.call(this,
                    b); this.Fa = function () { this.Kb(this[s].T); this[s].S = !0; this.Lb(this) }
                }, k: function () { var b = this[s]; !b.s && b.r && a.a.D(b.r, function (a, b) { b.k && b.k() }); b.i && b.mb && a.a.F.pc(b.i, b.mb); b.r = null; b.L = 0; b.R = !0; b.S = !1; b.s = !1; b.i = null }
            }, $ = {
                sa: function (b) { var c = this, d = c[s]; if (!d.R && d.s && "change" == b) { d.s = !1; if (d.S || c.Qa()) d.r = null, d.L = 0, d.S = !0, c.aa(); else { var e = []; a.a.D(d.r, function (a, b) { e[b.Ga] = a }); a.a.q(e, function (a, b) { var e = d.r[a], l = c.uc(e.ia); l.Ga = b; l.na = e.na; d.r[a] = l }) } d.R || c.notifySubscribers(d.T, "awake") } },
                Ia: function (b) { var c = this[s]; c.R || "change" != b || this.Pa("change") || (a.a.D(c.r, function (a, b) { b.k && (c.r[a] = { ia: b.ia, Ga: b.Ga, na: b.na }, b.k()) }), c.s = !0, this.notifySubscribers(n, "asleep")) }, Na: function () { var b = this[s]; b.s && (b.S || this.Qa()) && this.aa(); return a.J.fn.Na.call(this) }
            }, aa = { sa: function (a) { "change" != a && "beforeChange" != a || this.t() } }; a.a.ka && a.a.Xa(z, a.J.fn); var R = a.N.gd; a.m[R] = a.N; z[R] = a.m; a.Xc = function (b) { return a.Oa(b, a.m) }; a.Yc = function (b) { return a.Oa(b, a.m) && b[s] && b[s].Va }; a.b("computed", a.m);
            a.b("dependentObservable", a.m); a.b("isComputed", a.Xc); a.b("isPureComputed", a.Yc); a.b("computed.fn", z); a.G(z, "peek", z.t); a.G(z, "dispose", z.k); a.G(z, "isActive", z.ba); a.G(z, "getDependenciesCount", z.Aa); a.nc = function (b, c) { if ("function" === typeof b) return a.m(b, c, { pure: !0 }); b = a.a.extend({}, b); b.pure = !0; return a.m(b, c) }; a.b("pureComputed", a.nc); (function () {
                function b(a, f, g) {
                    g = g || new d; a = f(a); if ("object" != typeof a || null === a || a === n || a instanceof RegExp || a instanceof Date || a instanceof String || a instanceof
                    Number || a instanceof Boolean) return a; var k = a instanceof Array ? [] : {}; g.save(a, k); c(a, function (c) { var d = f(a[c]); switch (typeof d) { case "boolean": case "number": case "string": case "function": k[c] = d; break; case "object": case "undefined": var h = g.get(d); k[c] = h !== n ? h : b(d, f, g) } }); return k
                } function c(a, b) { if (a instanceof Array) { for (var c = 0; c < a.length; c++) b(c); "function" == typeof a.toJSON && b("toJSON") } else for (c in a) b(c) } function d() { this.keys = []; this.Ib = [] } a.wc = function (c) {
                    if (0 == arguments.length) throw Error("When calling ko.toJS, pass the object you want to convert.");
                    return b(c, function (b) { for (var c = 0; a.H(b) && 10 > c; c++) b = b(); return b })
                }; a.toJSON = function (b, c, d) { b = a.wc(b); return a.a.Eb(b, c, d) }; d.prototype = { save: function (b, c) { var d = a.a.o(this.keys, b); 0 <= d ? this.Ib[d] = c : (this.keys.push(b), this.Ib.push(c)) }, get: function (b) { b = a.a.o(this.keys, b); return 0 <= b ? this.Ib[b] : n } }
            })(); a.b("toJS", a.wc); a.b("toJSON", a.toJSON); (function () {
                a.j = {
                    u: function (b) {
                        switch (a.a.A(b)) {
                            case "option": return !0 === b.__ko__hasDomDataOptionValue__ ? a.a.e.get(b, a.d.options.xb) : 7 >= a.a.C ? b.getAttributeNode("value") &&
                            b.getAttributeNode("value").specified ? b.value : b.text : b.value; case "select": return 0 <= b.selectedIndex ? a.j.u(b.options[b.selectedIndex]) : n; default: return b.value
                        }
                    }, ha: function (b, c, d) {
                        switch (a.a.A(b)) {
                            case "option": switch (typeof c) { case "string": a.a.e.set(b, a.d.options.xb, n); "__ko__hasDomDataOptionValue__" in b && delete b.__ko__hasDomDataOptionValue__; b.value = c; break; default: a.a.e.set(b, a.d.options.xb, c), b.__ko__hasDomDataOptionValue__ = !0, b.value = "number" === typeof c ? c : "" } break; case "select": if ("" === c ||
                            null === c) c = n; for (var e = -1, f = 0, g = b.options.length, k; f < g; ++f) if (k = a.j.u(b.options[f]), k == c || "" == k && c === n) { e = f; break } if (d || 0 <= e || c === n && 1 < b.size) b.selectedIndex = e; break; default: if (null === c || c === n) c = ""; b.value = c
                        }
                    }
                }
            })(); a.b("selectExtensions", a.j); a.b("selectExtensions.readValue", a.j.u); a.b("selectExtensions.writeValue", a.j.ha); a.h = function () {
                function b(b) {
                    b = a.a.$a(b); 123 === b.charCodeAt(0) && (b = b.slice(1, -1)); var c = [], d = b.match(e), r, k = [], p = 0; if (d) {
                        d.push(","); for (var A = 0, y; y = d[A]; ++A) {
                            var t = y.charCodeAt(0);
                            if (44 === t) { if (0 >= p) { c.push(r && k.length ? { key: r, value: k.join("") } : { unknown: r || k.join("") }); r = p = 0; k = []; continue } } else if (58 === t) { if (!p && !r && 1 === k.length) { r = k.pop(); continue } } else 47 === t && A && 1 < y.length ? (t = d[A - 1].match(f)) && !g[t[0]] && (b = b.substr(b.indexOf(y) + 1), d = b.match(e), d.push(","), A = -1, y = "/") : 40 === t || 123 === t || 91 === t ? ++p : 41 === t || 125 === t || 93 === t ? --p : r || k.length || 34 !== t && 39 !== t || (y = y.slice(1, -1)); k.push(y)
                        }
                    } return c
                } var c = ["true", "false", "null", "undefined"], d = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i,
                e = RegExp("\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|/(?:[^/\\\\]|\\\\.)*/w*|[^\\s:,/][^,\"'{}()/:[\\]]*[^\\s,\"'{}()/:[\\]]|[^\\s]", "g"), f = /[\])"'A-Za-z0-9_$]+$/, g = { "in": 1, "return": 1, "typeof": 1 }, k = {}; return {
                    ta: [], ea: k, yb: b, Ua: function (e, m) {
                        function h(b, e) {
                            var m; if (!A) { var l = a.getBindingHandler(b); if (l && l.preprocess && !(e = l.preprocess(e, b, h))) return; if (l = k[b]) m = e, 0 <= a.a.o(c, m) ? m = !1 : (l = m.match(d), m = null === l ? !1 : l[1] ? "Object(" + l[1] + ")" + l[2] : m), l = m; l && g.push("'" + b + "':function(_z){" + m + "=_z}") } p && (e =
                            "function(){return " + e + " }"); f.push("'" + b + "':" + e)
                        } m = m || {}; var f = [], g = [], p = m.valueAccessors, A = m.bindingParams, y = "string" === typeof e ? b(e) : e; a.a.q(y, function (a) { h(a.key || a.unknown, a.value) }); g.length && h("_ko_property_writers", "{" + g.join(",") + " }"); return f.join(",")
                    }, ad: function (a, b) { for (var c = 0; c < a.length; c++) if (a[c].key == b) return !0; return !1 }, Ea: function (b, c, d, e, f) { if (b && a.H(b)) !a.Ba(b) || f && b.t() === e || b(e); else if ((b = c.get("_ko_property_writers")) && b[d]) b[d](e) }
                }
            }(); a.b("expressionRewriting", a.h); a.b("expressionRewriting.bindingRewriteValidators",
            a.h.ta); a.b("expressionRewriting.parseObjectLiteral", a.h.yb); a.b("expressionRewriting.preProcessBindings", a.h.Ua); a.b("expressionRewriting._twoWayBindings", a.h.ea); a.b("jsonExpressionRewriting", a.h); a.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson", a.h.Ua); (function () {
                function b(a) { return 8 == a.nodeType && g.test(f ? a.text : a.nodeValue) } function c(a) { return 8 == a.nodeType && k.test(f ? a.text : a.nodeValue) } function d(a, d) {
                    for (var e = a, f = 1, l = []; e = e.nextSibling;) {
                        if (c(e) && (f--, 0 === f)) return l; l.push(e);
                        b(e) && f++
                    } if (!d) throw Error("Cannot find closing comment tag to match: " + a.nodeValue); return null
                } function e(a, b) { var c = d(a, b); return c ? 0 < c.length ? c[c.length - 1].nextSibling : a.nextSibling : null } var f = u && "\x3c!--test--\x3e" === u.createComment("test").text, g = f ? /^\x3c!--\s*ko(?:\s+([\s\S]+))?\s*--\x3e$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/, k = f ? /^\x3c!--\s*\/ko\s*--\x3e$/ : /^\s*\/ko\s*$/, l = { ul: !0, ol: !0 }; a.f = {
                    Z: {}, childNodes: function (a) { return b(a) ? d(a) : a.childNodes }, xa: function (c) {
                        if (b(c)) {
                            c = a.f.childNodes(c); for (var d =
                            0, e = c.length; d < e; d++) a.removeNode(c[d])
                        } else a.a.ob(c)
                    }, da: function (c, d) { if (b(c)) { a.f.xa(c); for (var e = c.nextSibling, f = 0, l = d.length; f < l; f++) e.parentNode.insertBefore(d[f], e) } else a.a.da(c, d) }, mc: function (a, c) { b(a) ? a.parentNode.insertBefore(c, a.nextSibling) : a.firstChild ? a.insertBefore(c, a.firstChild) : a.appendChild(c) }, gc: function (c, d, e) { e ? b(c) ? c.parentNode.insertBefore(d, e.nextSibling) : e.nextSibling ? c.insertBefore(d, e.nextSibling) : c.appendChild(d) : a.f.mc(c, d) }, firstChild: function (a) {
                        return b(a) ? !a.nextSibling ||
                        c(a.nextSibling) ? null : a.nextSibling : a.firstChild
                    }, nextSibling: function (a) { b(a) && (a = e(a)); return a.nextSibling && c(a.nextSibling) ? null : a.nextSibling }, Tc: b, pd: function (a) { return (a = (f ? a.text : a.nodeValue).match(g)) ? a[1] : null }, kc: function (d) {
                        if (l[a.a.A(d)]) {
                            var h = d.firstChild; if (h) {
                                do if (1 === h.nodeType) {
                                    var f; f = h.firstChild; var g = null; if (f) { do if (g) g.push(f); else if (b(f)) { var k = e(f, !0); k ? f = k : g = [f] } else c(f) && (g = [f]); while (f = f.nextSibling) } if (f = g) for (g = h.nextSibling, k = 0; k < f.length; k++) g ? d.insertBefore(f[k],
                                    g) : d.appendChild(f[k])
                                } while (h = h.nextSibling)
                            }
                        }
                    }
                }
            })(); a.b("virtualElements", a.f); a.b("virtualElements.allowedBindings", a.f.Z); a.b("virtualElements.emptyNode", a.f.xa); a.b("virtualElements.insertAfter", a.f.gc); a.b("virtualElements.prepend", a.f.mc); a.b("virtualElements.setDomNodeChildren", a.f.da); (function () {
                a.Q = function () { this.Fc = {} }; a.a.extend(a.Q.prototype, {
                    nodeHasBindings: function (b) {
                        switch (b.nodeType) {
                            case 1: return null != b.getAttribute("data-bind") || a.g.getComponentNameForNode(b); case 8: return a.f.Tc(b);
                            default: return !1
                        }
                    }, getBindings: function (b, c) { var d = this.getBindingsString(b, c), d = d ? this.parseBindingsString(d, c, b) : null; return a.g.Ob(d, b, c, !1) }, getBindingAccessors: function (b, c) { var d = this.getBindingsString(b, c), d = d ? this.parseBindingsString(d, c, b, { valueAccessors: !0 }) : null; return a.g.Ob(d, b, c, !0) }, getBindingsString: function (b) { switch (b.nodeType) { case 1: return b.getAttribute("data-bind"); case 8: return a.f.pd(b); default: return null } }, parseBindingsString: function (b, c, d, e) {
                        try {
                            var f = this.Fc, g = b + (e && e.valueAccessors ||
                            ""), k; if (!(k = f[g])) { var l, m = "with($context){with($data||{}){return{" + a.h.Ua(b, e) + "}}}"; l = new Function("$context", "$element", m); k = f[g] = l } return k(c, d)
                        } catch (h) { throw h.message = "Unable to parse bindings.\nBindings value: " + b + "\nMessage: " + h.message, h; }
                    }
                }); a.Q.instance = new a.Q
            })(); a.b("bindingProvider", a.Q); (function () {
                function b(a) { return function () { return a } } function c(a) { return a() } function d(b) { return a.a.Ca(a.l.w(b), function (a, c) { return function () { return b()[c] } }) } function e(c, e, h) {
                    return "function" ===
                    typeof c ? d(c.bind(null, e, h)) : a.a.Ca(c, b)
                } function f(a, b) { return d(this.getBindings.bind(this, a, b)) } function g(b, c, d) { var e, h = a.f.firstChild(c), f = a.Q.instance, m = f.preprocessNode; if (m) { for (; e = h;) h = a.f.nextSibling(e), m.call(f, e); h = a.f.firstChild(c) } for (; e = h;) h = a.f.nextSibling(e), k(b, e, d) } function k(b, c, d) { var e = !0, h = 1 === c.nodeType; h && a.f.kc(c); if (h && d || a.Q.instance.nodeHasBindings(c)) e = m(c, null, b, d).shouldBindDescendants; e && !r[a.a.A(c)] && g(b, c, !h) } function l(b) {
                    var c = [], d = {}, e = []; a.a.D(b, function Z(h) {
                        if (!d[h]) {
                            var f =
                            a.getBindingHandler(h); f && (f.after && (e.push(h), a.a.q(f.after, function (c) { if (b[c]) { if (-1 !== a.a.o(e, c)) throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + e.join(", ")); Z(c) } }), e.length--), c.push({ key: h, fc: f })); d[h] = !0
                        }
                    }); return c
                } function m(b, d, e, h) {
                    var m = a.a.e.get(b, q); if (!d) { if (m) throw Error("You cannot apply bindings multiple times to the same element."); a.a.e.set(b, q, !0) } !m && h && a.tc(b, e); var g; if (d && "function" !== typeof d) g = d; else {
                        var k = a.Q.instance, r = k.getBindingAccessors ||
                        f, p = a.B(function () { (g = d ? d(e, b) : r.call(k, b, e)) && e.P && e.P(); return g }, null, { i: b }); g && p.ba() || (p = null)
                    } var u; if (g) {
                        var v = p ? function (a) { return function () { return c(p()[a]) } } : function (a) { return g[a] }, s = function () { return a.a.Ca(p ? p() : g, c) }; s.get = function (a) { return g[a] && c(v(a)) }; s.has = function (a) { return a in g }; h = l(g); a.a.q(h, function (c) {
                            var d = c.fc.init, h = c.fc.update, f = c.key; if (8 === b.nodeType && !a.f.Z[f]) throw Error("The binding '" + f + "' cannot be used with virtual elements"); try {
                                "function" == typeof d && a.l.w(function () {
                                    var a =
                                    d(b, v(f), s, e.$data, e); if (a && a.controlsDescendantBindings) { if (u !== n) throw Error("Multiple bindings (" + u + " and " + f + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element."); u = f }
                                }), "function" == typeof h && a.B(function () { h(b, v(f), s, e.$data, e) }, null, { i: b })
                            } catch (m) { throw m.message = 'Unable to process binding "' + f + ": " + g[f] + '"\nMessage: ' + m.message, m; }
                        })
                    } return { shouldBindDescendants: u === n }
                } function h(b) { return b && b instanceof a.U ? b : new a.U(b) }
                a.d = {}; var r = { script: !0, textarea: !0, template: !0 }; a.getBindingHandler = function (b) { return a.d[b] }; a.U = function (b, c, d, e) {
                    var h = this, f = "function" == typeof b && !a.H(b), m, g = a.B(function () { var m = f ? b() : b, l = a.a.c(m); c ? (c.P && c.P(), a.a.extend(h, c), g && (h.P = g)) : (h.$parents = [], h.$root = l, h.ko = a); h.$rawData = m; h.$data = l; d && (h[d] = l); e && e(h, c, l); return h.$data }, null, { wa: function () { return m && !a.a.Qb(m) }, i: !0 }); g.ba() && (h.P = g, g.equalityComparer = null, m = [], g.Ac = function (b) {
                        m.push(b); a.a.F.oa(b, function (b) {
                            a.a.La(m, b); m.length ||
                            (g.k(), h.P = g = n)
                        })
                    })
                }; a.U.prototype.createChildContext = function (b, c, d) { return new a.U(b, this, c, function (a, b) { a.$parentContext = b; a.$parent = b.$data; a.$parents = (b.$parents || []).slice(0); a.$parents.unshift(a.$parent); d && d(a) }) }; a.U.prototype.extend = function (b) { return new a.U(this.P || this.$data, this, null, function (c, d) { c.$rawData = d.$rawData; a.a.extend(c, "function" == typeof b ? b() : b) }) }; var q = a.a.e.I(), p = a.a.e.I(); a.tc = function (b, c) {
                    if (2 == arguments.length) a.a.e.set(b, p, c), c.P && c.P.Ac(b); else return a.a.e.get(b,
                    p)
                }; a.Ja = function (b, c, d) { 1 === b.nodeType && a.f.kc(b); return m(b, c, h(d), !0) }; a.Dc = function (b, c, d) { d = h(d); return a.Ja(b, e(c, d, b), d) }; a.eb = function (a, b) { 1 !== b.nodeType && 8 !== b.nodeType || g(h(a), b, !0) }; a.Rb = function (a, b) { !v && x.jQuery && (v = x.jQuery); if (b && 1 !== b.nodeType && 8 !== b.nodeType) throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node"); b = b || x.document.body; k(h(a), b, !0) }; a.kb = function (b) {
                    switch (b.nodeType) {
                        case 1: case 8: var c = a.tc(b); if (c) return c;
                            if (b.parentNode) return a.kb(b.parentNode)
                    } return n
                }; a.Jc = function (b) { return (b = a.kb(b)) ? b.$data : n }; a.b("bindingHandlers", a.d); a.b("applyBindings", a.Rb); a.b("applyBindingsToDescendants", a.eb); a.b("applyBindingAccessorsToNode", a.Ja); a.b("applyBindingsToNode", a.Dc); a.b("contextFor", a.kb); a.b("dataFor", a.Jc)
            })(); (function (b) {
                function c(c, e) {
                    var m = f.hasOwnProperty(c) ? f[c] : b, h; m ? m.X(e) : (m = f[c] = new a.J, m.X(e), d(c, function (b, d) {
                        var e = !(!d || !d.synchronous); g[c] = { definition: b, Zc: e }; delete f[c]; h || e ? m.notifySubscribers(b) :
                        a.Y.Wa(function () { m.notifySubscribers(b) })
                    }), h = !0)
                } function d(a, b) { e("getConfig", [a], function (c) { c ? e("loadComponent", [a, c], function (a) { b(a, c) }) : b(null, null) }) } function e(c, d, f, h) { h || (h = a.g.loaders.slice(0)); var g = h.shift(); if (g) { var q = g[c]; if (q) { var p = !1; if (q.apply(g, d.concat(function (a) { p ? f(null) : null !== a ? f(a) : e(c, d, f, h) })) !== b && (p = !0, !g.suppressLoaderExceptions)) throw Error("Component loaders must supply values by invoking the callback, not by returning values synchronously."); } else e(c, d, f, h) } else f(null) }
                var f = {}, g = {}; a.g = { get: function (d, e) { var f = g.hasOwnProperty(d) ? g[d] : b; f ? f.Zc ? a.l.w(function () { e(f.definition) }) : a.Y.Wa(function () { e(f.definition) }) : c(d, e) }, Xb: function (a) { delete g[a] }, Jb: e }; a.g.loaders = []; a.b("components", a.g); a.b("components.get", a.g.get); a.b("components.clearCachedDefinition", a.g.Xb)
            })(); (function () {
                function b(b, c, d, e) {
                    function g() { 0 === --y && e(k) } var k = {}, y = 2, t = d.template; d = d.viewModel; t ? f(c, t, function (c) { a.g.Jb("loadTemplate", [b, c], function (a) { k.template = a; g() }) }) : g(); d ? f(c, d, function (c) {
                        a.g.Jb("loadViewModel",
                        [b, c], function (a) { k[l] = a; g() })
                    }) : g()
                } function c(a, b, d) { if ("function" === typeof b) d(function (a) { return new b(a) }); else if ("function" === typeof b[l]) d(b[l]); else if ("instance" in b) { var e = b.instance; d(function () { return e }) } else "viewModel" in b ? c(a, b.viewModel, d) : a("Unknown viewModel value: " + b) } function d(b) { switch (a.a.A(b)) { case "script": return a.a.ma(b.text); case "textarea": return a.a.ma(b.value); case "template": if (e(b.content)) return a.a.ua(b.content.childNodes) } return a.a.ua(b.childNodes) } function e(a) {
                    return x.DocumentFragment ?
                    a instanceof DocumentFragment : a && 11 === a.nodeType
                } function f(a, b, c) { "string" === typeof b.require ? O || x.require ? (O || x.require)([b.require], c) : a("Uses require, but no AMD loader is present") : c(b) } function g(a) { return function (b) { throw Error("Component '" + a + "': " + b); } } var k = {}; a.g.register = function (b, c) { if (!c) throw Error("Invalid configuration for " + b); if (a.g.ub(b)) throw Error("Component " + b + " is already registered"); k[b] = c }; a.g.ub = function (a) { return k.hasOwnProperty(a) }; a.g.od = function (b) {
                    delete k[b];
                    a.g.Xb(b)
                }; a.g.Zb = {
                    getConfig: function (a, b) { b(k.hasOwnProperty(a) ? k[a] : null) }, loadComponent: function (a, c, d) { var e = g(a); f(e, c, function (c) { b(a, e, c, d) }) }, loadTemplate: function (b, c, f) {
                        b = g(b); if ("string" === typeof c) f(a.a.ma(c)); else if (c instanceof Array) f(c); else if (e(c)) f(a.a.V(c.childNodes)); else if (c.element) if (c = c.element, x.HTMLElement ? c instanceof HTMLElement : c && c.tagName && 1 === c.nodeType) f(d(c)); else if ("string" === typeof c) { var l = u.getElementById(c); l ? f(d(l)) : b("Cannot find element with ID " + c) } else b("Unknown element type: " +
                        c); else b("Unknown template value: " + c)
                    }, loadViewModel: function (a, b, d) { c(g(a), b, d) }
                }; var l = "createViewModel"; a.b("components.register", a.g.register); a.b("components.isRegistered", a.g.ub); a.b("components.unregister", a.g.od); a.b("components.defaultLoader", a.g.Zb); a.g.loaders.push(a.g.Zb); a.g.Bc = k
            })(); (function () {
                function b(b, e) {
                    var f = b.getAttribute("params"); if (f) {
                        var f = c.parseBindingsString(f, e, b, { valueAccessors: !0, bindingParams: !0 }), f = a.a.Ca(f, function (c) { return a.m(c, null, { i: b }) }), g = a.a.Ca(f, function (c) {
                            var e =
                            c.t(); return c.ba() ? a.m({ read: function () { return a.a.c(c()) }, write: a.Ba(e) && function (a) { c()(a) }, i: b }) : e
                        }); g.hasOwnProperty("$raw") || (g.$raw = f); return g
                    } return { $raw: {} }
                } a.g.getComponentNameForNode = function (b) { var c = a.a.A(b); if (a.g.ub(c) && (-1 != c.indexOf("-") || "[object HTMLUnknownElement]" == "" + b || 8 >= a.a.C && b.tagName === c)) return c }; a.g.Ob = function (c, e, f, g) {
                    if (1 === e.nodeType) {
                        var k = a.g.getComponentNameForNode(e); if (k) {
                            c = c || {}; if (c.component) throw Error('Cannot use the "component" binding on a custom element matching a component');
                            var l = { name: k, params: b(e, f) }; c.component = g ? function () { return l } : l
                        }
                    } return c
                }; var c = new a.Q; 9 > a.a.C && (a.g.register = function (a) { return function (b) { u.createElement(b); return a.apply(this, arguments) } }(a.g.register), u.createDocumentFragment = function (b) { return function () { var c = b(), f = a.g.Bc, g; for (g in f) f.hasOwnProperty(g) && c.createElement(g); return c } }(u.createDocumentFragment))
            })(); (function (b) {
                function c(b, c, d) { c = c.template; if (!c) throw Error("Component '" + b + "' has no template"); b = a.a.ua(c); a.f.da(d, b) }
                function d(a, b, c, d) { var e = a.createViewModel; return e ? e.call(a, d, { element: b, templateNodes: c }) : d } var e = 0; a.d.component = {
                    init: function (f, g, k, l, m) {
                        function h() { var a = r && r.dispose; "function" === typeof a && a.call(r); q = r = null } var r, q, p = a.a.V(a.f.childNodes(f)); a.a.F.oa(f, h); a.m(function () {
                            var l = a.a.c(g()), k, t; "string" === typeof l ? k = l : (k = a.a.c(l.name), t = a.a.c(l.params)); if (!k) throw Error("No component name specified"); var n = q = ++e; a.g.get(k, function (e) {
                                if (q === n) {
                                    h(); if (!e) throw Error("Unknown component '" + k +
                                    "'"); c(k, e, f); var g = d(e, f, p, t); e = m.createChildContext(g, b, function (a) { a.$component = g; a.$componentTemplateNodes = p }); r = g; a.eb(e, f)
                                }
                            })
                        }, null, { i: f }); return { controlsDescendantBindings: !0 }
                    }
                }; a.f.Z.component = !0
            })(); var S = { "class": "className", "for": "htmlFor" }; a.d.attr = {
                update: function (b, c) {
                    var d = a.a.c(c()) || {}; a.a.D(d, function (c, d) {
                        d = a.a.c(d); var g = !1 === d || null === d || d === n; g && b.removeAttribute(c); 8 >= a.a.C && c in S ? (c = S[c], g ? b.removeAttribute(c) : b[c] = d) : g || b.setAttribute(c, d.toString()); "name" === c && a.a.rc(b,
                        g ? "" : d.toString())
                    })
                }
            }; (function () {
                a.d.checked = {
                    after: ["value", "attr"], init: function (b, c, d) {
                        function e() { var e = b.checked, f = p ? g() : e; if (!a.va.Sa() && (!l || e)) { var m = a.l.w(c); if (h) { var k = r ? m.t() : m; q !== f ? (e && (a.a.pa(k, f, !0), a.a.pa(k, q, !1)), q = f) : a.a.pa(k, f, e); r && a.Ba(m) && m(k) } else a.h.Ea(m, d, "checked", f, !0) } } function f() { var d = a.a.c(c()); b.checked = h ? 0 <= a.a.o(d, g()) : k ? d : g() === d } var g = a.nc(function () { return d.has("checkedValue") ? a.a.c(d.get("checkedValue")) : d.has("value") ? a.a.c(d.get("value")) : b.value }), k =
                        "checkbox" == b.type, l = "radio" == b.type; if (k || l) { var m = c(), h = k && a.a.c(m) instanceof Array, r = !(h && m.push && m.splice), q = h ? g() : n, p = l || h; l && !b.name && a.d.uniqueName.init(b, function () { return !0 }); a.m(e, null, { i: b }); a.a.p(b, "click", e); a.m(f, null, { i: b }); m = n }
                    }
                }; a.h.ea.checked = !0; a.d.checkedValue = { update: function (b, c) { b.value = a.a.c(c()) } }
            })(); a.d.css = {
                update: function (b, c) {
                    var d = a.a.c(c()); null !== d && "object" == typeof d ? a.a.D(d, function (c, d) { d = a.a.c(d); a.a.bb(b, c, d) }) : (d = a.a.$a(String(d || "")), a.a.bb(b, b.__ko__cssValue,
                    !1), b.__ko__cssValue = d, a.a.bb(b, d, !0))
                }
            }; a.d.enable = { update: function (b, c) { var d = a.a.c(c()); d && b.disabled ? b.removeAttribute("disabled") : d || b.disabled || (b.disabled = !0) } }; a.d.disable = { update: function (b, c) { a.d.enable.update(b, function () { return !a.a.c(c()) }) } }; a.d.event = {
                init: function (b, c, d, e, f) {
                    var g = c() || {}; a.a.D(g, function (g) {
                        "string" == typeof g && a.a.p(b, g, function (b) {
                            var m, h = c()[g]; if (h) {
                                try { var r = a.a.V(arguments); e = f.$data; r.unshift(e); m = h.apply(e, r) } finally {
                                    !0 !== m && (b.preventDefault ? b.preventDefault() :
                                    b.returnValue = !1)
                                } !1 === d.get(g + "Bubble") && (b.cancelBubble = !0, b.stopPropagation && b.stopPropagation())
                            }
                        })
                    })
                }
            }; a.d.foreach = {
                ic: function (b) { return function () { var c = b(), d = a.a.zb(c); if (!d || "number" == typeof d.length) return { foreach: c, templateEngine: a.W.sb }; a.a.c(c); return { foreach: d.data, as: d.as, includeDestroyed: d.includeDestroyed, afterAdd: d.afterAdd, beforeRemove: d.beforeRemove, afterRender: d.afterRender, beforeMove: d.beforeMove, afterMove: d.afterMove, templateEngine: a.W.sb } } }, init: function (b, c) {
                    return a.d.template.init(b,
                    a.d.foreach.ic(c))
                }, update: function (b, c, d, e, f) { return a.d.template.update(b, a.d.foreach.ic(c), d, e, f) }
            }; a.h.ta.foreach = !1; a.f.Z.foreach = !0; a.d.hasfocus = {
                init: function (b, c, d) {
                    function e(e) { b.__ko_hasfocusUpdating = !0; var f = b.ownerDocument; if ("activeElement" in f) { var g; try { g = f.activeElement } catch (h) { g = f.body } e = g === b } f = c(); a.h.Ea(f, d, "hasfocus", e, !0); b.__ko_hasfocusLastValue = e; b.__ko_hasfocusUpdating = !1 } var f = e.bind(null, !0), g = e.bind(null, !1); a.a.p(b, "focus", f); a.a.p(b, "focusin", f); a.a.p(b, "blur", g); a.a.p(b,
                    "focusout", g)
                }, update: function (b, c) { var d = !!a.a.c(c()); b.__ko_hasfocusUpdating || b.__ko_hasfocusLastValue === d || (d ? b.focus() : b.blur(), !d && b.__ko_hasfocusLastValue && b.ownerDocument.body.focus(), a.l.w(a.a.Da, null, [b, d ? "focusin" : "focusout"])) }
            }; a.h.ea.hasfocus = !0; a.d.hasFocus = a.d.hasfocus; a.h.ea.hasFocus = !0; a.d.html = { init: function () { return { controlsDescendantBindings: !0 } }, update: function (b, c) { a.a.Cb(b, c()) } }; K("if"); K("ifnot", !1, !0); K("with", !0, !1, function (a, c) { return a.createChildContext(c) }); var L = {};
            a.d.options = {
                init: function (b) { if ("select" !== a.a.A(b)) throw Error("options binding applies only to SELECT elements"); for (; 0 < b.length;) b.remove(0); return { controlsDescendantBindings: !0 } }, update: function (b, c, d) {
                    function e() { return a.a.Ka(b.options, function (a) { return a.selected }) } function f(a, b, c) { var d = typeof b; return "function" == d ? b(a) : "string" == d ? a[b] : c } function g(c, e) {
                        if (A && h) a.j.ha(b, a.a.c(d.get("value")), !0); else if (p.length) {
                            var f = 0 <= a.a.o(p, a.j.u(e[0])); a.a.sc(e[0], f); A && !f && a.l.w(a.a.Da, null, [b,
                            "change"])
                        }
                    } var k = b.multiple, l = 0 != b.length && k ? b.scrollTop : null, m = a.a.c(c()), h = d.get("valueAllowUnset") && d.has("value"), r = d.get("optionsIncludeDestroyed"); c = {}; var q, p = []; h || (k ? p = a.a.fb(e(), a.j.u) : 0 <= b.selectedIndex && p.push(a.j.u(b.options[b.selectedIndex]))); m && ("undefined" == typeof m.length && (m = [m]), q = a.a.Ka(m, function (b) { return r || b === n || null === b || !a.a.c(b._destroy) }), d.has("optionsCaption") && (m = a.a.c(d.get("optionsCaption")), null !== m && m !== n && q.unshift(L))); var A = !1; c.beforeRemove = function (a) { b.removeChild(a) };
                    m = g; d.has("optionsAfterRender") && "function" == typeof d.get("optionsAfterRender") && (m = function (b, c) { g(0, c); a.l.w(d.get("optionsAfterRender"), null, [c[0], b !== L ? b : n]) }); a.a.Bb(b, q, function (c, e, g) { g.length && (p = !h && g[0].selected ? [a.j.u(g[0])] : [], A = !0); e = b.ownerDocument.createElement("option"); c === L ? (a.a.Za(e, d.get("optionsCaption")), a.j.ha(e, n)) : (g = f(c, d.get("optionsValue"), c), a.j.ha(e, a.a.c(g)), c = f(c, d.get("optionsText"), g), a.a.Za(e, c)); return [e] }, c, m); a.l.w(function () {
                        h ? a.j.ha(b, a.a.c(d.get("value")),
                        !0) : (k ? p.length && e().length < p.length : p.length && 0 <= b.selectedIndex ? a.j.u(b.options[b.selectedIndex]) !== p[0] : p.length || 0 <= b.selectedIndex) && a.a.Da(b, "change")
                    }); a.a.Nc(b); l && 20 < Math.abs(l - b.scrollTop) && (b.scrollTop = l)
                }
            }; a.d.options.xb = a.a.e.I(); a.d.selectedOptions = {
                after: ["options", "foreach"], init: function (b, c, d) { a.a.p(b, "change", function () { var e = c(), f = []; a.a.q(b.getElementsByTagName("option"), function (b) { b.selected && f.push(a.j.u(b)) }); a.h.Ea(e, d, "selectedOptions", f) }) }, update: function (b, c) {
                    if ("select" !=
                    a.a.A(b)) throw Error("values binding applies only to SELECT elements"); var d = a.a.c(c()), e = b.scrollTop; d && "number" == typeof d.length && a.a.q(b.getElementsByTagName("option"), function (b) { var c = 0 <= a.a.o(d, a.j.u(b)); b.selected != c && a.a.sc(b, c) }); b.scrollTop = e
                }
            }; a.h.ea.selectedOptions = !0; a.d.style = { update: function (b, c) { var d = a.a.c(c() || {}); a.a.D(d, function (c, d) { d = a.a.c(d); if (null === d || d === n || !1 === d) d = ""; b.style[c] = d }) } }; a.d.submit = {
                init: function (b, c, d, e, f) {
                    if ("function" != typeof c()) throw Error("The value for a submit binding must be a function");
                    a.a.p(b, "submit", function (a) { var d, e = c(); try { d = e.call(f.$data, b) } finally { !0 !== d && (a.preventDefault ? a.preventDefault() : a.returnValue = !1) } })
                }
            }; a.d.text = { init: function () { return { controlsDescendantBindings: !0 } }, update: function (b, c) { a.a.Za(b, c()) } }; a.f.Z.text = !0; (function () {
                if (x && x.navigator) var b = function (a) { if (a) return parseFloat(a[1]) }, c = x.opera && x.opera.version && parseInt(x.opera.version()), d = x.navigator.userAgent, e = b(d.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)), f = b(d.match(/Firefox\/([^ ]*)/));
                if (10 > a.a.C) var g = a.a.e.I(), k = a.a.e.I(), l = function (b) { var c = this.activeElement; (c = c && a.a.e.get(c, k)) && c(b) }, m = function (b, c) { var d = b.ownerDocument; a.a.e.get(d, g) || (a.a.e.set(d, g, !0), a.a.p(d, "selectionchange", l)); a.a.e.set(b, k, c) }; a.d.textInput = {
                    init: function (b, d, g) {
                        function l(c, d) { a.a.p(b, c, d) } function k() { var c = a.a.c(d()); if (null === c || c === n) c = ""; v !== n && c === v ? a.a.setTimeout(k, 4) : b.value !== c && (u = c, b.value = c) } function y() { s || (v = b.value, s = a.a.setTimeout(t, 4)) } function t() {
                            clearTimeout(s); v = s = n; var c =
                            b.value; u !== c && (u = c, a.h.Ea(d(), g, "textInput", c))
                        } var u = b.value, s, v, x = 9 == a.a.C ? y : t; 10 > a.a.C ? (l("propertychange", function (a) { "value" === a.propertyName && x(a) }), 8 == a.a.C && (l("keyup", t), l("keydown", t)), 8 <= a.a.C && (m(b, x), l("dragend", y))) : (l("input", t), 5 > e && "textarea" === a.a.A(b) ? (l("keydown", y), l("paste", y), l("cut", y)) : 11 > c ? l("keydown", y) : 4 > f && (l("DOMAutoComplete", t), l("dragdrop", t), l("drop", t))); l("change", t); a.m(k, null, { i: b })
                    }
                }; a.h.ea.textInput = !0; a.d.textinput = {
                    preprocess: function (a, b, c) {
                        c("textInput",
                        a)
                    }
                }
            })(); a.d.uniqueName = { init: function (b, c) { if (c()) { var d = "ko_unique_" + ++a.d.uniqueName.Ic; a.a.rc(b, d) } } }; a.d.uniqueName.Ic = 0; a.d.value = {
                after: ["options", "foreach"], init: function (b, c, d) {
                    if ("input" != b.tagName.toLowerCase() || "checkbox" != b.type && "radio" != b.type) {
                        var e = ["change"], f = d.get("valueUpdate"), g = !1, k = null; f && ("string" == typeof f && (f = [f]), a.a.ra(e, f), e = a.a.Tb(e)); var l = function () { k = null; g = !1; var e = c(), f = a.j.u(b); a.h.Ea(e, d, "value", f) }; !a.a.C || "input" != b.tagName.toLowerCase() || "text" != b.type ||
                        "off" == b.autocomplete || b.form && "off" == b.form.autocomplete || -1 != a.a.o(e, "propertychange") || (a.a.p(b, "propertychange", function () { g = !0 }), a.a.p(b, "focus", function () { g = !1 }), a.a.p(b, "blur", function () { g && l() })); a.a.q(e, function (c) { var d = l; a.a.nd(c, "after") && (d = function () { k = a.j.u(b); a.a.setTimeout(l, 0) }, c = c.substring(5)); a.a.p(b, c, d) }); var m = function () {
                            var e = a.a.c(c()), f = a.j.u(b); if (null !== k && e === k) a.a.setTimeout(m, 0); else if (e !== f) if ("select" === a.a.A(b)) {
                                var g = d.get("valueAllowUnset"), f = function () {
                                    a.j.ha(b,
                                    e, g)
                                }; f(); g || e === a.j.u(b) ? a.a.setTimeout(f, 0) : a.l.w(a.a.Da, null, [b, "change"])
                            } else a.j.ha(b, e)
                        }; a.m(m, null, { i: b })
                    } else a.Ja(b, { checkedValue: c })
                }, update: function () { }
            }; a.h.ea.value = !0; a.d.visible = { update: function (b, c) { var d = a.a.c(c()), e = "none" != b.style.display; d && !e ? b.style.display = "" : !d && e && (b.style.display = "none") } }; (function (b) { a.d[b] = { init: function (c, d, e, f, g) { return a.d.event.init.call(this, c, function () { var a = {}; a[b] = d(); return a }, e, f, g) } } })("click"); a.O = function () { }; a.O.prototype.renderTemplateSource =
            function () { throw Error("Override renderTemplateSource"); }; a.O.prototype.createJavaScriptEvaluatorBlock = function () { throw Error("Override createJavaScriptEvaluatorBlock"); }; a.O.prototype.makeTemplateSource = function (b, c) { if ("string" == typeof b) { c = c || u; var d = c.getElementById(b); if (!d) throw Error("Cannot find template with ID " + b); return new a.v.n(d) } if (1 == b.nodeType || 8 == b.nodeType) return new a.v.qa(b); throw Error("Unknown template type: " + b); }; a.O.prototype.renderTemplate = function (a, c, d, e) {
                a = this.makeTemplateSource(a,
                e); return this.renderTemplateSource(a, c, d, e)
            }; a.O.prototype.isTemplateRewritten = function (a, c) { return !1 === this.allowTemplateRewriting ? !0 : this.makeTemplateSource(a, c).data("isRewritten") }; a.O.prototype.rewriteTemplate = function (a, c, d) { a = this.makeTemplateSource(a, d); c = c(a.text()); a.text(c); a.data("isRewritten", !0) }; a.b("templateEngine", a.O); a.Gb = function () {
                function b(b, c, d, k) {
                    b = a.h.yb(b); for (var l = a.h.ta, m = 0; m < b.length; m++) {
                        var h = b[m].key; if (l.hasOwnProperty(h)) {
                            var r = l[h]; if ("function" === typeof r) {
                                if (h =
                                r(b[m].value)) throw Error(h);
                            } else if (!r) throw Error("This template engine does not support the '" + h + "' binding within its templates");
                        }
                    } d = "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + a.h.Ua(b, { valueAccessors: !0 }) + " } })()},'" + d.toLowerCase() + "')"; return k.createJavaScriptEvaluatorBlock(d) + c
                } var c = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi, d = /\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g; return {
                    Oc: function (b,
                    c, d) { c.isTemplateRewritten(b, d) || c.rewriteTemplate(b, function (b) { return a.Gb.dd(b, c) }, d) }, dd: function (a, f) { return a.replace(c, function (a, c, d, e, h) { return b(h, c, d, f) }).replace(d, function (a, c) { return b(c, "\x3c!-- ko --\x3e", "#comment", f) }) }, Ec: function (b, c) { return a.M.wb(function (d, k) { var l = d.nextSibling; l && l.nodeName.toLowerCase() === c && a.Ja(l, b, k) }) }
                }
            }(); a.b("__tr_ambtns", a.Gb.Ec); (function () {
                a.v = {}; a.v.n = function (b) {
                    if (this.n = b) {
                        var c = a.a.A(b); this.ab = "script" === c ? 1 : "textarea" === c ? 2 : "template" == c &&
                        b.content && 11 === b.content.nodeType ? 3 : 4
                    }
                }; a.v.n.prototype.text = function () { var b = 1 === this.ab ? "text" : 2 === this.ab ? "value" : "innerHTML"; if (0 == arguments.length) return this.n[b]; var c = arguments[0]; "innerHTML" === b ? a.a.Cb(this.n, c) : this.n[b] = c }; var b = a.a.e.I() + "_"; a.v.n.prototype.data = function (c) { if (1 === arguments.length) return a.a.e.get(this.n, b + c); a.a.e.set(this.n, b + c, arguments[1]) }; var c = a.a.e.I(); a.v.n.prototype.nodes = function () {
                    var b = this.n; if (0 == arguments.length) return (a.a.e.get(b, c) || {}).jb || (3 === this.ab ?
                    b.content : 4 === this.ab ? b : n); a.a.e.set(b, c, { jb: arguments[0] })
                }; a.v.qa = function (a) { this.n = a }; a.v.qa.prototype = new a.v.n; a.v.qa.prototype.text = function () { if (0 == arguments.length) { var b = a.a.e.get(this.n, c) || {}; b.Hb === n && b.jb && (b.Hb = b.jb.innerHTML); return b.Hb } a.a.e.set(this.n, c, { Hb: arguments[0] }) }; a.b("templateSources", a.v); a.b("templateSources.domElement", a.v.n); a.b("templateSources.anonymousTemplate", a.v.qa)
            })(); (function () {
                function b(b, c, d) {
                    var e; for (c = a.f.nextSibling(c) ; b && (e = b) !== c;) b = a.f.nextSibling(e),
                    d(e, b)
                } function c(c, d) { if (c.length) { var e = c[0], f = c[c.length - 1], g = e.parentNode, k = a.Q.instance, n = k.preprocessNode; if (n) { b(e, f, function (a, b) { var c = a.previousSibling, d = n.call(k, a); d && (a === e && (e = d[0] || b), a === f && (f = d[d.length - 1] || c)) }); c.length = 0; if (!e) return; e === f ? c.push(e) : (c.push(e, f), a.a.za(c, g)) } b(e, f, function (b) { 1 !== b.nodeType && 8 !== b.nodeType || a.Rb(d, b) }); b(e, f, function (b) { 1 !== b.nodeType && 8 !== b.nodeType || a.M.yc(b, [d]) }); a.a.za(c, g) } } function d(a) { return a.nodeType ? a : 0 < a.length ? a[0] : null } function e(b,
                e, f, k, q) {
                    q = q || {}; var p = (b && d(b) || f || {}).ownerDocument, n = q.templateEngine || g; a.Gb.Oc(f, n, p); f = n.renderTemplate(f, k, q, p); if ("number" != typeof f.length || 0 < f.length && "number" != typeof f[0].nodeType) throw Error("Template engine must return an array of DOM nodes"); p = !1; switch (e) { case "replaceChildren": a.f.da(b, f); p = !0; break; case "replaceNode": a.a.qc(b, f); p = !0; break; case "ignoreTargetNode": break; default: throw Error("Unknown renderMode: " + e); } p && (c(f, k), q.afterRender && a.l.w(q.afterRender, null, [f, k.$data]));
                    return f
                } function f(b, c, d) { return a.H(b) ? b() : "function" === typeof b ? b(c, d) : b } var g; a.Db = function (b) { if (b != n && !(b instanceof a.O)) throw Error("templateEngine must inherit from ko.templateEngine"); g = b }; a.Ab = function (b, c, h, k, q) {
                    h = h || {}; if ((h.templateEngine || g) == n) throw Error("Set a template engine before calling renderTemplate"); q = q || "replaceChildren"; if (k) {
                        var p = d(k); return a.B(function () { var g = c && c instanceof a.U ? c : new a.U(a.a.c(c)), n = f(b, g.$data, g), g = e(k, q, n, g, h); "replaceNode" == q && (k = g, p = d(k)) }, null,
                        { wa: function () { return !p || !a.a.nb(p) }, i: p && "replaceNode" == q ? p.parentNode : p })
                    } return a.M.wb(function (d) { a.Ab(b, c, h, d, "replaceNode") })
                }; a.kd = function (b, d, g, k, q) {
                    function p(a, b) { c(b, s); g.afterRender && g.afterRender(b, a); s = null } function u(a, c) { s = q.createChildContext(a, g.as, function (a) { a.$index = c }); var d = f(b, a, s); return e(null, "ignoreTargetNode", d, s, g) } var s; return a.B(function () {
                        var b = a.a.c(d) || []; "undefined" == typeof b.length && (b = [b]); b = a.a.Ka(b, function (b) { return g.includeDestroyed || b === n || null === b || !a.a.c(b._destroy) });
                        a.l.w(a.a.Bb, null, [k, b, u, g, p])
                    }, null, { i: k })
                }; var k = a.a.e.I(); a.d.template = {
                    init: function (b, c) { var d = a.a.c(c()); if ("string" == typeof d || d.name) a.f.xa(b); else { if ("nodes" in d) { if (d = d.nodes || [], a.H(d)) throw Error('The "nodes" option must be a plain, non-observable array.'); } else d = a.f.childNodes(b); d = a.a.jc(d); (new a.v.qa(b)).nodes(d) } return { controlsDescendantBindings: !0 } }, update: function (b, c, d, e, f) {
                        var g = c(), s; c = a.a.c(g); d = !0; e = null; "string" == typeof c ? c = {} : (g = c.name, "if" in c && (d = a.a.c(c["if"])), d && "ifnot" in
                        c && (d = !a.a.c(c.ifnot)), s = a.a.c(c.data)); "foreach" in c ? e = a.kd(g || b, d && c.foreach || [], c, b, f) : d ? (f = "data" in c ? f.createChildContext(s, c.as) : f, e = a.Ab(g || b, f, c, b)) : a.f.xa(b); f = e; (s = a.a.e.get(b, k)) && "function" == typeof s.k && s.k(); a.a.e.set(b, k, f && f.ba() ? f : n)
                    }
                }; a.h.ta.template = function (b) { b = a.h.yb(b); return 1 == b.length && b[0].unknown || a.h.ad(b, "name") ? null : "This template engine does not support anonymous templates nested within its templates" }; a.f.Z.template = !0
            })(); a.b("setTemplateEngine", a.Db); a.b("renderTemplate",
            a.Ab); a.a.dc = function (a, c, d) { if (a.length && c.length) { var e, f, g, k, l; for (e = f = 0; (!d || e < d) && (k = a[f]) ; ++f) { for (g = 0; l = c[g]; ++g) if (k.value === l.value) { k.moved = l.index; l.moved = k.index; c.splice(g, 1); e = g = 0; break } e += g } } }; a.a.ib = function () {
                function b(b, d, e, f, g) {
                    var k = Math.min, l = Math.max, m = [], h, n = b.length, q, p = d.length, s = p - n || 1, u = n + p + 1, t, v, x; for (h = 0; h <= n; h++) for (v = t, m.push(t = []), x = k(p, h + s), q = l(0, h - 1) ; q <= x; q++) t[q] = q ? h ? b[h - 1] === d[q - 1] ? v[q - 1] : k(v[q] || u, t[q - 1] || u) + 1 : q + 1 : h + 1; k = []; l = []; s = []; h = n; for (q = p; h || q;) p = m[h][q] -
                    1, q && p === m[h][q - 1] ? l.push(k[k.length] = { status: e, value: d[--q], index: q }) : h && p === m[h - 1][q] ? s.push(k[k.length] = { status: f, value: b[--h], index: h }) : (--q, --h, g.sparse || k.push({ status: "retained", value: d[q] })); a.a.dc(s, l, !g.dontLimitMoves && 10 * n); return k.reverse()
                } return function (a, d, e) { e = "boolean" === typeof e ? { dontLimitMoves: e } : e || {}; a = a || []; d = d || []; return a.length < d.length ? b(a, d, "added", "deleted", e) : b(d, a, "deleted", "added", e) }
            }(); a.b("utils.compareArrays", a.a.ib); (function () {
                function b(b, c, d, k, l) {
                    var m = [],
                    h = a.B(function () { var h = c(d, l, a.a.za(m, b)) || []; 0 < m.length && (a.a.qc(m, h), k && a.l.w(k, null, [d, h, l])); m.length = 0; a.a.ra(m, h) }, null, { i: b, wa: function () { return !a.a.Qb(m) } }); return { ca: m, B: h.ba() ? h : n }
                } var c = a.a.e.I(), d = a.a.e.I(); a.a.Bb = function (e, f, g, k, l) {
                    function m(b, c) { w = q[c]; v !== c && (D[b] = w); w.qb(v++); a.a.za(w.ca, e); u.push(w); z.push(w) } function h(b, c) { if (b) for (var d = 0, e = c.length; d < e; d++) c[d] && a.a.q(c[d].ca, function (a) { b(a, d, c[d].ja) }) } f = f || []; k = k || {}; var r = a.a.e.get(e, c) === n, q = a.a.e.get(e, c) || [], p = a.a.fb(q,
                    function (a) { return a.ja }), s = a.a.ib(p, f, k.dontLimitMoves), u = [], t = 0, v = 0, x = [], z = []; f = []; for (var D = [], p = [], w, C = 0, B, E; B = s[C]; C++) switch (E = B.moved, B.status) { case "deleted": E === n && (w = q[t], w.B && (w.B.k(), w.B = n), a.a.za(w.ca, e).length && (k.beforeRemove && (u.push(w), z.push(w), w.ja === d ? w = null : f[C] = w), w && x.push.apply(x, w.ca))); t++; break; case "retained": m(C, t++); break; case "added": E !== n ? m(C, E) : (w = { ja: B.value, qb: a.N(v++) }, u.push(w), z.push(w), r || (p[C] = w)) } a.a.e.set(e, c, u); h(k.beforeMove, D); a.a.q(x, k.beforeRemove ? a.$ :
                    a.removeNode); for (var C = 0, r = a.f.firstChild(e), F; w = z[C]; C++) { w.ca || a.a.extend(w, b(e, g, w.ja, l, w.qb)); for (t = 0; s = w.ca[t]; r = s.nextSibling, F = s, t++) s !== r && a.f.gc(e, s, F); !w.Wc && l && (l(w.ja, w.ca, w.qb), w.Wc = !0) } h(k.beforeRemove, f); for (C = 0; C < f.length; ++C) f[C] && (f[C].ja = d); h(k.afterMove, D); h(k.afterAdd, p)
                }
            })(); a.b("utils.setDomNodeChildrenFromArrayMapping", a.a.Bb); a.W = function () { this.allowTemplateRewriting = !1 }; a.W.prototype = new a.O; a.W.prototype.renderTemplateSource = function (b, c, d, e) {
                if (c = (9 > a.a.C ? 0 : b.nodes) ?
                b.nodes() : null) return a.a.V(c.cloneNode(!0).childNodes); b = b.text(); return a.a.ma(b, e)
            }; a.W.sb = new a.W; a.Db(a.W.sb); a.b("nativeTemplateEngine", a.W); (function () {
                a.vb = function () {
                    var a = this.$c = function () { if (!v || !v.tmpl) return 0; try { if (0 <= v.tmpl.tag.tmpl.open.toString().indexOf("__")) return 2 } catch (a) { } return 1 }(); this.renderTemplateSource = function (b, e, f, g) {
                        g = g || u; f = f || {}; if (2 > a) throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later."); var k = b.data("precompiled");
                        k || (k = b.text() || "", k = v.template(null, "{{ko_with $item.koBindingContext}}" + k + "{{/ko_with}}"), b.data("precompiled", k)); b = [e.$data]; e = v.extend({ koBindingContext: e }, f.templateOptions); e = v.tmpl(k, b, e); e.appendTo(g.createElement("div")); v.fragments = {}; return e
                    }; this.createJavaScriptEvaluatorBlock = function (a) { return "{{ko_code ((function() { return " + a + " })()) }}" }; this.addTemplate = function (a, b) { u.write("<script type='text/html' id='" + a + "'>" + b + "\x3c/script>") }; 0 < a && (v.tmpl.tag.ko_code = { open: "__.push($1 || '');" },
                    v.tmpl.tag.ko_with = { open: "with($1) {", close: "} " })
                }; a.vb.prototype = new a.O; var b = new a.vb; 0 < b.$c && a.Db(b); a.b("jqueryTmplTemplateEngine", a.vb)
            })()
        })
    })();
})();

require.config({
    paths: {
        //'sweetalert': '../assets/global/plugins/bootstrap-sweetalert/sweetalert.min',
        "text": "/Scripts/text",
        'durandal': "/Scripts/durandal",
        'plugins': "/Scripts/durandal/plugins",
        'transitions': "/Scripts/durandal/transitions",
        "jquery.contextmenu": "/scripts/jquery.contextMenu",
        "jquery.ui.position": "/scripts/jquery.ui.position",
        "jsPlumb": "../Scripts/jsPlumb/bundle",
        'bootstrap': "../Scripts/bootstrap"
    },
    shim: {
        'bootstrap': {
            deps: ["jquery"],
            exports: "jQuery"
        },
        //'sweetalert': {
        //    exports: "sweetalert.min"
        //},
        "jsPlumb": {
            exports: "jsPlumb"
        }
    }
});

//require(['sweetalert'], function (sweetalert) { });

define("jquery", function () { return jQuery; });
define("knockout", ko);
define("underscore", function () { return _; });
define("objectbuilders", objectbuilders);
define("Task", Task);
define("bespoke", bespoke || {});
define("string", String);

define('main.custom', ["durandal/app", "durandal/viewLocator", "durandal/system", objectbuilders.config],
    function (app, viewLocator, system, config) {
        system.debug(true);
        app.title = config.applicationFullName;

        //specify which plugins to install and their configuration
        app.configurePlugins({
            router: true,
            dialog: true,
            widget: {
                kinds: ["expander"]
            }
        });

        app.start().then(function () {
            viewLocator.useConvention();
            app.setRoot("viewmodels/shell.custom", "entrance");
        });
    });
/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Connects the history module's url and history tracking support to Durandal's activation and composition engine allowing you to easily build navigation-style applications.
 * @module router
 * @requires system
 * @requires app
 * @requires activator
 * @requires events
 * @requires composition
 * @requires history
 * @requires knockout
 * @requires jquery
 */
define('plugins/router', ['durandal/system', 'durandal/app', 'durandal/activator', 'durandal/events', 'durandal/composition', 'plugins/history', 'knockout', 'jquery'], function (system, app, activator, events, composition, history, ko, $) {
    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    var startDeferred, rootRouter;
    var trailingSlash = /\/$/;
    var routesAreCaseSensitive = false;
    var lastUrl = '/', lastTryUrl = '/';

    function routeStringToRegExp(routeString) {
        routeString = routeString.replace(escapeRegExp, '\\$&')
            .replace(optionalParam, '(?:$1)?')
            .replace(namedParam, function (match, optional) {
                return optional ? match : '([^\/]+)';
            })
            .replace(splatParam, '(.*?)');

        return new RegExp('^' + routeString + '$', routesAreCaseSensitive ? undefined : 'i');
    }

    function stripParametersFromRoute(route) {
        var colonIndex = route.indexOf(':');
        var length = colonIndex > 0 ? colonIndex - 1 : route.length;
        return route.substring(0, length);
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function compareArrays(first, second) {
        if (!first || !second) {
            return false;
        }

        if (first.length != second.length) {
            return false;
        }

        for (var i = 0, len = first.length; i < len; i++) {
            if (first[i] != second[i]) {
                return false;
            }
        }

        return true;
    }

    function reconstructUrl(instruction) {
        if (!instruction.queryString) {
            return instruction.fragment;
        }

        return instruction.fragment + '?' + instruction.queryString;
    }

    /**
     * @class Router
     * @uses Events
     */

    /**
     * Triggered when the navigation logic has completed.
     * @event router:navigation:complete
     * @param {object} instance The activated instance.
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered when the navigation has been cancelled.
     * @event router:navigation:cancelled
     * @param {object} instance The activated instance.
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered when navigation begins.
     * @event router:navigation:processing
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered right before a route is activated.
     * @event router:route:activating
     * @param {object} instance The activated instance.
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered right before a route is configured.
     * @event router:route:before-config
     * @param {object} config The route config.
     * @param {Router} router The router.
     */

    /**
     * Triggered just after a route is configured.
     * @event router:route:after-config
     * @param {object} config The route config.
     * @param {Router} router The router.
     */

    /**
     * Triggered when the view for the activated instance is attached.
     * @event router:navigation:attached
     * @param {object} instance The activated instance.
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered when the composition that the activated instance participates in is complete.
     * @event router:navigation:composition-complete
     * @param {object} instance The activated instance.
     * @param {object} instruction The routing instruction.
     * @param {Router} router The router.
     */

    /**
     * Triggered when the router does not find a matching route.
     * @event router:route:not-found
     * @param {string} fragment The url fragment.
     * @param {Router} router The router.
     */

    var createRouter = function () {
        var queue = [],
            isProcessing = ko.observable(false),
            currentActivation,
            currentInstruction,
            activeItem = activator.create();

        var router = {
            /**
             * The route handlers that are registered. Each handler consists of a `routePattern` and a `callback`.
             * @property {object[]} handlers
             */
            handlers: [],
            /**
             * The route configs that are registered.
             * @property {object[]} routes
             */
            routes: [],
            /**
             * The route configurations that have been designated as displayable in a nav ui (nav:true).
             * @property {KnockoutObservableArray} navigationModel
             */
            navigationModel: ko.observableArray([]),
            /**
             * The active item/screen based on the current navigation state.
             * @property {Activator} activeItem
             */
            activeItem: activeItem,
            /**
             * Indicates that the router (or a child router) is currently in the process of navigating.
             * @property {KnockoutComputed} isNavigating
             */
            isNavigating: ko.computed(function () {
                var current = activeItem();
                var processing = isProcessing();
                var currentRouterIsProcesing = current
                    && current.router
                    && current.router != router
                    && current.router.isNavigating() ? true : false;
                return processing || currentRouterIsProcesing;
            }),
            /**
             * An observable surfacing the active routing instruction that is currently being processed or has recently finished processing.
             * The instruction object has `config`, `fragment`, `queryString`, `params` and `queryParams` properties.
             * @property {KnockoutObservable} activeInstruction
             */
            activeInstruction: ko.observable(null),
            __router__: true
        };

        events.includeIn(router);

        activeItem.settings.areSameItem = function (currentItem, newItem, currentActivationData, newActivationData) {
            if (currentItem == newItem) {
                return compareArrays(currentActivationData, newActivationData);
            }

            return false;
        };

        activeItem.settings.findChildActivator = function (item) {
            if (item && item.router && item.router.parent == router) {
                return item.router.activeItem;
            }

            return null;
        };

        function hasChildRouter(instance, parentRouter) {
            return instance.router && instance.router.parent == parentRouter;
        }

        function setCurrentInstructionRouteIsActive(flag) {
            if (currentInstruction && currentInstruction.config.isActive) {
                currentInstruction.config.isActive(flag);
            }
        }

        function completeNavigation(instance, instruction, mode) {
            system.log('Navigation Complete', instance, instruction);

            var fromModuleId = system.getModuleId(currentActivation);
            if (fromModuleId) {
                router.trigger('router:navigation:from:' + fromModuleId);
            }

            currentActivation = instance;

            setCurrentInstructionRouteIsActive(false);
            currentInstruction = instruction;
            setCurrentInstructionRouteIsActive(true);

            var toModuleId = system.getModuleId(currentActivation);
            if (toModuleId) {
                router.trigger('router:navigation:to:' + toModuleId);
            }

            if (!hasChildRouter(instance, router)) {
                router.updateDocumentTitle(instance, instruction);
            }

            switch (mode) {
                case 'rootRouter':
                    lastUrl = reconstructUrl(currentInstruction);
                    break;
                case 'rootRouterWithChild':
                    lastTryUrl = reconstructUrl(currentInstruction);
                    break;
                case 'lastChildRouter':
                    lastUrl = lastTryUrl;
                    break;
            }

            rootRouter.explicitNavigation = false;
            rootRouter.navigatingBack = false;

            router.trigger('router:navigation:complete', instance, instruction, router);
        }

        function cancelNavigation(instance, instruction) {
            system.log('Navigation Cancelled');

            router.activeInstruction(currentInstruction);

            router.navigate(lastUrl, false);

            isProcessing(false);
            rootRouter.explicitNavigation = false;
            rootRouter.navigatingBack = false;
            router.trigger('router:navigation:cancelled', instance, instruction, router);
        }

        function redirect(url) {
            system.log('Navigation Redirecting');

            isProcessing(false);
            rootRouter.explicitNavigation = false;
            rootRouter.navigatingBack = false;
            router.navigate(url, { trigger: true, replace: true });
        }

        function activateRoute(activator, instance, instruction) {
            rootRouter.navigatingBack = !rootRouter.explicitNavigation && currentActivation != instruction.fragment;
            router.trigger('router:route:activating', instance, instruction, router);

            var options = {
                canDeactivate: !router.parent
            };

            activator.activateItem(instance, instruction.params, options).then(function (succeeded) {
                if (succeeded) {
                    var previousActivation = currentActivation;
                    var withChild = hasChildRouter(instance, router);
                    var mode = '';

                    if (router.parent) {
                        if (!withChild) {
                            mode = 'lastChildRouter';
                        }
                    } else {
                        if (withChild) {
                            mode = 'rootRouterWithChild';
                        } else {
                            mode = 'rootRouter';
                        }
                    }

                    completeNavigation(instance, instruction, mode);

                    if (withChild) {
                        instance.router.trigger('router:route:before-child-routes', instance, instruction, router);

                        var fullFragment = instruction.fragment;
                        if (instruction.queryString) {
                            fullFragment += "?" + instruction.queryString;
                        }

                        instance.router.loadUrl(fullFragment);
                    }

                    if (previousActivation == instance) {
                        router.attached();
                        router.compositionComplete();
                    }
                } else if (activator.settings.lifecycleData && activator.settings.lifecycleData.redirect) {
                    redirect(activator.settings.lifecycleData.redirect);
                } else {
                    cancelNavigation(instance, instruction);
                }

                if (startDeferred) {
                    startDeferred.resolve();
                    startDeferred = null;
                }
            }).fail(function (err) {
                system.error(err);
            });
        }

        /**
         * Inspects routes and modules before activation. Can be used to protect access by cancelling navigation or redirecting.
         * @method guardRoute
         * @param {object} instance The module instance that is about to be activated by the router.
         * @param {object} instruction The route instruction. The instruction object has config, fragment, queryString, params and queryParams properties.
         * @return {Promise|Boolean|String} If a boolean, determines whether or not the route should activate or be cancelled. If a string, causes a redirect to the specified route. Can also be a promise for either of these value types.
         */
        function handleGuardedRoute(activator, instance, instruction) {
            var resultOrPromise = router.guardRoute(instance, instruction);
            if (resultOrPromise || resultOrPromise === '') {
                if (resultOrPromise.then) {
                    resultOrPromise.then(function (result) {
                        if (result) {
                            if (system.isString(result)) {
                                redirect(result);
                            } else {
                                activateRoute(activator, instance, instruction);
                            }
                        } else {
                            cancelNavigation(instance, instruction);
                        }
                    });
                } else {
                    if (system.isString(resultOrPromise)) {
                        redirect(resultOrPromise);
                    } else {
                        activateRoute(activator, instance, instruction);
                    }
                }
            } else {
                cancelNavigation(instance, instruction);
            }
        }

        function ensureActivation(activator, instance, instruction) {
            if (router.guardRoute) {
                handleGuardedRoute(activator, instance, instruction);
            } else {
                activateRoute(activator, instance, instruction);
            }
        }

        function canReuseCurrentActivation(instruction) {
            return currentInstruction
                && currentInstruction.config.moduleId == instruction.config.moduleId
                && currentActivation
                && ((currentActivation.canReuseForRoute && currentActivation.canReuseForRoute.apply(currentActivation, instruction.params))
                || (!currentActivation.canReuseForRoute && currentActivation.router && currentActivation.router.loadUrl));
        }

        function dequeueInstruction() {
            if (isProcessing()) {
                return;
            }

            var instruction = queue.shift();
            queue = [];

            if (!instruction) {
                return;
            }

            isProcessing(true);
            router.activeInstruction(instruction);
            router.trigger('router:navigation:processing', instruction, router);

            if (canReuseCurrentActivation(instruction)) {
                var tempActivator = activator.create();
                tempActivator.forceActiveItem(currentActivation); //enforce lifecycle without re-compose
                tempActivator.settings.areSameItem = activeItem.settings.areSameItem;
                tempActivator.settings.findChildActivator = activeItem.settings.findChildActivator;
                ensureActivation(tempActivator, currentActivation, instruction);
            } else if (!instruction.config.moduleId) {
                ensureActivation(activeItem, {
                    viewUrl: instruction.config.viewUrl,
                    canReuseForRoute: function () {
                        return true;
                    }
                }, instruction);
            } else {
                system.acquire(instruction.config.moduleId).then(function (m) {
                    var instance = system.resolveObject(m);

                    if (instruction.config.viewUrl) {
                        instance.viewUrl = instruction.config.viewUrl;
                    }

                    ensureActivation(activeItem, instance, instruction);
                }).fail(function (err) {
                    system.error('Failed to load routed module (' + instruction.config.moduleId + '). Details: ' + err.message, err);
                });
            }
        }

        function queueInstruction(instruction) {
            queue.unshift(instruction);
            dequeueInstruction();
        }

        // Given a route, and a URL fragment that it matches, return the array of
        // extracted decoded parameters. Empty or unmatched parameters will be
        // treated as `null` to normalize cross-browser behavior.
        function createParams(routePattern, fragment, queryString) {
            var params = routePattern.exec(fragment).slice(1);

            for (var i = 0; i < params.length; i++) {
                var current = params[i];
                params[i] = current ? decodeURIComponent(current) : null;
            }

            var queryParams = router.parseQueryString(queryString);
            if (queryParams) {
                params.push(queryParams);
            }

            return {
                params: params,
                queryParams: queryParams
            };
        }

        function configureRoute(config) {
            router.trigger('router:route:before-config', config, router);

            if (!system.isRegExp(config.route)) {
                config.title = config.title || router.convertRouteToTitle(config.route);

                if (!config.viewUrl) {
                    config.moduleId = config.moduleId || router.convertRouteToModuleId(config.route);
                }

                config.hash = config.hash || router.convertRouteToHash(config.route);

                if (config.hasChildRoutes) {
                    config.route = config.route + '*childRoutes';
                }

                config.routePattern = routeStringToRegExp(config.route);
            } else {
                config.routePattern = config.route;
            }

            config.isActive = config.isActive || ko.observable(false);
            router.trigger('router:route:after-config', config, router);
            router.routes.push(config);

            router.route(config.routePattern, function (fragment, queryString) {
                var paramInfo = createParams(config.routePattern, fragment, queryString);
                queueInstruction({
                    fragment: fragment,
                    queryString: queryString,
                    config: config,
                    params: paramInfo.params,
                    queryParams: paramInfo.queryParams
                });
            });
        };

        function mapRoute(config) {
            if (system.isArray(config.route)) {
                var isActive = config.isActive || ko.observable(false);

                for (var i = 0, length = config.route.length; i < length; i++) {
                    var current = system.extend({}, config);

                    current.route = config.route[i];
                    current.isActive = isActive;

                    if (i > 0) {
                        delete current.nav;
                    }

                    configureRoute(current);
                }
            } else {
                configureRoute(config);
            }

            return router;
        }

        /**
         * Parses a query string into an object.
         * @method parseQueryString
         * @param {string} queryString The query string to parse.
         * @return {object} An object keyed according to the query string parameters.
         */
        router.parseQueryString = function (queryString) {
            var queryObject, pairs;

            if (!queryString) {
                return null;
            }

            pairs = queryString.split('&');

            if (pairs.length == 0) {
                return null;
            }

            queryObject = {};

            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair === '') {
                    continue;
                }

                var parts = pair.split(/=(.+)?/),
                    key = parts[0],
                    value = parts[1] && decodeURIComponent(parts[1].replace(/\+/g, ' '));

                var existing = queryObject[key];

                if (existing) {
                    if (system.isArray(existing)) {
                        existing.push(value);
                    } else {
                        queryObject[key] = [existing, value];
                    }
                }
                else {
                    queryObject[key] = value;
                }
            }

            return queryObject;
        };

        /**
         * Add a route to be tested when the url fragment changes.
         * @method route
         * @param {RegEx} routePattern The route pattern to test against.
         * @param {function} callback The callback to execute when the route pattern is matched.
         */
        router.route = function (routePattern, callback) {
            router.handlers.push({ routePattern: routePattern, callback: callback });
        };

        /**
         * Attempt to load the specified URL fragment. If a route succeeds with a match, returns `true`. If no defined routes matches the fragment, returns `false`.
         * @method loadUrl
         * @param {string} fragment The URL fragment to find a match for.
         * @return {boolean} True if a match was found, false otherwise.
         */
        router.loadUrl = function (fragment) {
            var handlers = router.handlers,
                queryString = null,
                coreFragment = fragment,
                queryIndex = fragment.indexOf('?');

            if (queryIndex != -1) {
                coreFragment = fragment.substring(0, queryIndex);
                queryString = fragment.substr(queryIndex + 1);
            }

            if (router.relativeToParentRouter) {
                var instruction = this.parent.activeInstruction();
                coreFragment = queryIndex == -1 ? instruction.params.join('/') : instruction.params.slice(0, -1).join('/');

                if (coreFragment && coreFragment.charAt(0) == '/') {
                    coreFragment = coreFragment.substr(1);
                }

                if (!coreFragment) {
                    coreFragment = '';
                }

                coreFragment = coreFragment.replace('//', '/').replace('//', '/');
            }

            coreFragment = coreFragment.replace(trailingSlash, '');

            for (var i = 0; i < handlers.length; i++) {
                var current = handlers[i];
                if (current.routePattern.test(coreFragment)) {
                    current.callback(coreFragment, queryString);
                    return true;
                }
            }

            system.log('Route Not Found', fragment, currentInstruction);
            router.trigger('router:route:not-found', fragment, router);

            if (router.parent) {
                lastUrl = lastTryUrl;
            }

            history.navigate(lastUrl, { trigger: false, replace: true });

            rootRouter.explicitNavigation = false;
            rootRouter.navigatingBack = false;

            return false;
        };

        var titleSubscription;
        function setTitle(value) {
            var appTitle = ko.unwrap(app.title);

            if (appTitle) {
                document.title = value + " | " + appTitle;
            } else {
                document.title = value;
            }
        }

        // Allow observable to be used for app.title
        if (ko.isObservable(app.title)) {
            app.title.subscribe(function () {
                var instruction = router.activeInstruction();
                var title = instruction != null ? ko.unwrap(instruction.config.title) : '';
                setTitle(title);
            });
        }

        /**
         * Updates the document title based on the activated module instance, the routing instruction and the app.title.
         * @method updateDocumentTitle
         * @param {object} instance The activated module.
         * @param {object} instruction The routing instruction associated with the action. It has a `config` property that references the original route mapping config.
         */
        router.updateDocumentTitle = function (instance, instruction) {
            var appTitle = ko.unwrap(app.title),
                title = instruction.config.title;

            if (titleSubscription) {
                titleSubscription.dispose();
            }

            if (title) {
                if (ko.isObservable(title)) {
                    titleSubscription = title.subscribe(setTitle);
                    setTitle(title());
                } else {
                    setTitle(title);
                }
            } else if (appTitle) {
                document.title = appTitle;
            }
        };

        /**
         * Save a fragment into the hash history, or replace the URL state if the
         * 'replace' option is passed. You are responsible for properly URL-encoding
         * the fragment in advance.
         * The options object can contain `trigger: false` if you wish to not have the
         * route callback be fired, or `replace: true`, if
         * you wish to modify the current URL without adding an entry to the history.
         * @method navigate
         * @param {string} fragment The url fragment to navigate to.
         * @param {object|boolean} options An options object with optional trigger and replace flags. You can also pass a boolean directly to set the trigger option. Trigger is `true` by default.
         * @return {boolean} Returns true/false from loading the url.
         */
        router.navigate = function (fragment, options) {
            if (fragment && fragment.indexOf('://') != -1) {
                window.location.href = fragment;
                return true;
            }

            if (options === undefined || (system.isBoolean(options) && options) || (system.isObject(options) && options.trigger)) {
                rootRouter.explicitNavigation = true;
            }

            if ((system.isBoolean(options) && !options) || (options && options.trigger != undefined && !options.trigger)) {
                lastUrl = fragment;
            }

            return history.navigate(fragment, options);
        };

        /**
         * Navigates back in the browser history.
         * @method navigateBack
         */
        router.navigateBack = function () {
            history.navigateBack();
        };

        router.attached = function () {
            router.trigger('router:navigation:attached', currentActivation, currentInstruction, router);
        };

        router.compositionComplete = function () {
            isProcessing(false);
            router.trigger('router:navigation:composition-complete', currentActivation, currentInstruction, router);
            dequeueInstruction();
        };

        /**
         * Converts a route to a hash suitable for binding to a link's href.
         * @method convertRouteToHash
         * @param {string} route
         * @return {string} The hash.
         */
        router.convertRouteToHash = function (route) {
            route = route.replace(/\*.*$/, '');

            if (router.relativeToParentRouter) {
                var instruction = router.parent.activeInstruction(),
                    hash = route ? instruction.config.hash + '/' + route : instruction.config.hash;

                if (history._hasPushState) {
                    hash = '/' + hash;
                }

                hash = hash.replace('//', '/').replace('//', '/');
                return hash;
            }

            if (history._hasPushState) {
                return route;
            }

            return "#" + route;
        };

        /**
         * Converts a route to a module id. This is only called if no module id is supplied as part of the route mapping.
         * @method convertRouteToModuleId
         * @param {string} route
         * @return {string} The module id.
         */
        router.convertRouteToModuleId = function (route) {
            return stripParametersFromRoute(route);
        };

        /**
         * Converts a route to a displayable title. This is only called if no title is specified as part of the route mapping.
         * @method convertRouteToTitle
         * @param {string} route
         * @return {string} The title.
         */
        router.convertRouteToTitle = function (route) {
            var value = stripParametersFromRoute(route);
            return value.substring(0, 1).toUpperCase() + value.substring(1);
        };

        /**
         * Maps route patterns to modules.
         * @method map
         * @param {string|object|object[]} route A route, config or array of configs.
         * @param {object} [config] The config for the specified route.
         * @chainable
         * @example
         router.map([
         { route: '', title:'Home', moduleId: 'homeScreen', nav: true },
         { route: 'customer/:id', moduleId: 'customerDetails'}
         ]);
         */
        router.map = function (route, config) {
            if (system.isArray(route)) {
                for (var i = 0; i < route.length; i++) {
                    router.map(route[i]);
                }

                return router;
            }

            if (system.isString(route) || system.isRegExp(route)) {
                if (!config) {
                    config = {};
                } else if (system.isString(config)) {
                    config = { moduleId: config };
                }

                config.route = route;
            } else {
                config = route;
            }

            return mapRoute(config);
        };

        /**
         * Builds an observable array designed to bind a navigation UI to. The model will exist in the `navigationModel` property.
         * @method buildNavigationModel
         * @param {number} defaultOrder The default order to use for navigation visible routes that don't specify an order. The default is 100 and each successive route will be one more than that.
         * @chainable
         */
        router.buildNavigationModel = function (defaultOrder) {
            var nav = [], routes = router.routes;
            var fallbackOrder = defaultOrder || 100;

            for (var i = 0; i < routes.length; i++) {
                var current = routes[i];

                if (current.nav) {
                    if (!system.isNumber(current.nav)) {
                        current.nav = ++fallbackOrder;
                    }

                    nav.push(current);
                }
            }

            nav.sort(function (a, b) { return a.nav - b.nav; });
            router.navigationModel(nav);

            return router;
        };

        /**
         * Configures how the router will handle unknown routes.
         * @method mapUnknownRoutes
         * @param {string|function} [config] If not supplied, then the router will map routes to modules with the same name.
         * If a string is supplied, it represents the module id to route all unknown routes to.
         * Finally, if config is a function, it will be called back with the route instruction containing the route info. The function can then modify the instruction by adding a moduleId and the router will take over from there.
         * @param {string} [replaceRoute] If config is a module id, then you can optionally provide a route to replace the url with.
         * @chainable
         */
        router.mapUnknownRoutes = function (config, replaceRoute) {
            var catchAllRoute = "*catchall";
            var catchAllPattern = routeStringToRegExp(catchAllRoute);

            router.route(catchAllPattern, function (fragment, queryString) {
                var paramInfo = createParams(catchAllPattern, fragment, queryString);
                var instruction = {
                    fragment: fragment,
                    queryString: queryString,
                    config: {
                        route: catchAllRoute,
                        routePattern: catchAllPattern
                    },
                    params: paramInfo.params,
                    queryParams: paramInfo.queryParams
                };

                if (!config) {
                    instruction.config.moduleId = fragment;
                } else if (system.isString(config)) {
                    instruction.config.moduleId = config;
                    if (replaceRoute) {
                        history.navigate(replaceRoute, { trigger: false, replace: true });
                    }
                } else if (system.isFunction(config)) {
                    var result = config(instruction);
                    if (result && result.then) {
                        result.then(function () {
                            router.trigger('router:route:before-config', instruction.config, router);
                            router.trigger('router:route:after-config', instruction.config, router);
                            queueInstruction(instruction);
                        });
                        return;
                    }
                } else {
                    instruction.config = config;
                    instruction.config.route = catchAllRoute;
                    instruction.config.routePattern = catchAllPattern;
                }

                router.trigger('router:route:before-config', instruction.config, router);
                router.trigger('router:route:after-config', instruction.config, router);
                queueInstruction(instruction);
            });

            return router;
        };

        /**
         * Resets the router by removing handlers, routes, event handlers and previously configured options.
         * @method reset
         * @chainable
         */
        router.reset = function () {
            currentInstruction = currentActivation = undefined;
            router.handlers = [];
            router.routes = [];
            router.off();
            delete router.options;
            return router;
        };

        /**
         * Makes all configured routes and/or module ids relative to a certain base url.
         * @method makeRelative
         * @param {string|object} settings If string, the value is used as the base for routes and module ids. If an object, you can specify `route` and `moduleId` separately. In place of specifying route, you can set `fromParent:true` to make routes automatically relative to the parent router's active route.
         * @chainable
         */
        router.makeRelative = function (settings) {
            if (system.isString(settings)) {
                settings = {
                    moduleId: settings,
                    route: settings
                };
            }

            if (settings.moduleId && !endsWith(settings.moduleId, '/')) {
                settings.moduleId += '/';
            }

            if (settings.route && !endsWith(settings.route, '/')) {
                settings.route += '/';
            }

            if (settings.fromParent) {
                router.relativeToParentRouter = true;
            }

            router.on('router:route:before-config').then(function (config) {
                if (settings.moduleId) {
                    config.moduleId = settings.moduleId + config.moduleId;
                }

                if (settings.route) {
                    if (config.route === '') {
                        config.route = settings.route.substring(0, settings.route.length - 1);
                    } else {
                        config.route = settings.route + config.route;
                    }
                }
            });

            if (settings.dynamicHash) {
                router.on('router:route:after-config').then(function (config) {
                    config.routePattern = routeStringToRegExp(config.route ? settings.dynamicHash + '/' + config.route : settings.dynamicHash);
                    config.dynamicHash = config.dynamicHash || ko.observable(config.hash);
                });

                router.on('router:route:before-child-routes').then(function (instance, instruction, parentRouter) {
                    var childRouter = instance.router;

                    for (var i = 0; i < childRouter.routes.length; i++) {
                        var route = childRouter.routes[i];
                        var params = instruction.params.slice(0);

                        route.hash = childRouter.convertRouteToHash(route.route)
                            .replace(namedParam, function (match) {
                                return params.length > 0 ? params.shift() : match;
                            });

                        route.dynamicHash(route.hash);
                    }
                });
            }

            return router;
        };

        /**
         * Creates a child router.
         * @method createChildRouter
         * @return {Router} The child router.
         */
        router.createChildRouter = function () {
            var childRouter = createRouter();
            childRouter.parent = router;
            return childRouter;
        };

        return router;
    };

    /**
     * @class RouterModule
     * @extends Router
     * @static
     */
    rootRouter = createRouter();
    rootRouter.explicitNavigation = false;
    rootRouter.navigatingBack = false;

    /**
     * Makes the RegExp generated for routes case sensitive, rather than the default of case insensitive.
     * @method makeRoutesCaseSensitive
     */
    rootRouter.makeRoutesCaseSensitive = function () {
        routesAreCaseSensitive = true;
    };

    /**
     * Verify that the target is the current window
     * @method targetIsThisWindow
     * @return {boolean} True if the event's target is the current window, false otherwise.
     */
    rootRouter.targetIsThisWindow = function (event) {
        var targetWindow = $(event.target).attr('target');

        if (!targetWindow ||
            targetWindow === window.name ||
            targetWindow === '_self' ||
            (targetWindow === 'top' && window === window.top)) { return true; }

        return false;
    };

    /**
     * Activates the router and the underlying history tracking mechanism.
     * @method activate
     * @return {Promise} A promise that resolves when the router is ready.
     */
    rootRouter.activate = function (options) {
        return system.defer(function (dfd) {
            startDeferred = dfd;
            rootRouter.options = system.extend({ routeHandler: rootRouter.loadUrl }, rootRouter.options, options);

            history.activate(rootRouter.options);

            if (history._hasPushState) {
                var routes = rootRouter.routes,
                    i = routes.length;

                while (i--) {
                    var current = routes[i];
                    current.hash = current.hash.replace('#', '/');
                }
            }

            var rootStripper = rootRouter.options.root && new RegExp("^" + rootRouter.options.root + "/");

            $(document).delegate("a", 'click', function (evt) {
                if (history._hasPushState) {
                    if (!evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && rootRouter.targetIsThisWindow(evt)) {
                        var href = $(this).attr("href");

                        // Ensure the protocol is not part of URL, meaning its relative.
                        // Stop the event bubbling to ensure the link will not cause a page refresh.
                        if (href != null && !(href.charAt(0) === "#" || /^[a-z]+:/i.test(href))) {
                            rootRouter.explicitNavigation = true;
                            evt.preventDefault();

                            if (rootStripper) {
                                href = href.replace(rootStripper, "");
                            }

                            history.navigate(href);
                        }
                    }
                } else {
                    rootRouter.explicitNavigation = true;
                }
            });

            if (history.options.silent && startDeferred) {
                startDeferred.resolve();
                startDeferred = null;
            }
        }).promise();
    };

    /**
     * Disable history, perhaps temporarily. Not useful in a real app, but possibly useful for unit testing Routers.
     * @method deactivate
     */
    rootRouter.deactivate = function () {
        history.deactivate();
    };

    /**
     * Installs the router's custom ko binding handler.
     * @method install
     */
    rootRouter.install = function () {
        ko.bindingHandlers.router = {
            init: function () {
                return { controlsDescendantBindings: true };
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

                if (settings.__router__) {
                    settings = {
                        model: settings.activeItem(),
                        attached: settings.attached,
                        compositionComplete: settings.compositionComplete,
                        activate: false
                    };
                } else {
                    var theRouter = ko.utils.unwrapObservable(settings.router || viewModel.router) || rootRouter;
                    settings.model = theRouter.activeItem();
                    settings.attached = theRouter.attached;
                    settings.compositionComplete = theRouter.compositionComplete;
                    settings.activate = false;
                }

                composition.compose(element, settings, bindingContext);
            }
        };

        ko.virtualElements.allowedBindings.router = true;
    };

    return rootRouter;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The dialog module enables the display of message boxes, custom modal dialogs and other overlays or slide-out UI abstractions. Dialogs are constructed by the composition system which interacts with a user defined dialog context. The dialog module enforced the activator lifecycle.
 * @module dialog
 * @requires system
 * @requires app
 * @requires composition
 * @requires activator
 * @requires viewEngine
 * @requires jquery
 * @requires knockout
 */
define('plugins/dialog', ['durandal/system', 'durandal/app', 'durandal/composition', 'durandal/activator', 'durandal/viewEngine', 'jquery', 'knockout'], function (system, app, composition, activator, viewEngine, $, ko) {
    var contexts = {},
        dialogCount = ko.observable(0),
        dialog;

    /**
     * Models a message box's message, title and options.
     * @class MessageBox
     */
    var MessageBox = function (message, title, options, autoclose, settings) {
        this.message = message;
        this.title = title || MessageBox.defaultTitle;
        this.options = options || MessageBox.defaultOptions;
        this.autoclose = autoclose || false;
        this.settings = $.extend({}, MessageBox.defaultSettings, settings);
    };

    /**
     * Selects an option and closes the message box, returning the selected option through the dialog system's promise.
     * @method selectOption
     * @param {string} dialogResult The result to select.
     */
    MessageBox.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    /**
     * Provides the view to the composition system.
     * @method getView
     * @return {DOMElement} The view of the message box.
     */
    MessageBox.prototype.getView = function () {
        return viewEngine.processMarkup(MessageBox.defaultViewMarkup);
    };

    /**
     * Configures a custom view to use when displaying message boxes.
     * @method setViewUrl
     * @param {string} viewUrl The view url relative to the base url which the view locator will use to find the message box's view.
     * @static
     */
    MessageBox.setViewUrl = function (viewUrl) {
        delete MessageBox.prototype.getView;
        MessageBox.prototype.viewUrl = viewUrl;
    };

    /**
     * The title to be used for the message box if one is not provided.
     * @property {string} defaultTitle
     * @default Application
     * @static
     */
    MessageBox.defaultTitle = app.title || 'Application';

    /**
     * The options to display in the message box if none are specified.
     * @property {string[]} defaultOptions
     * @default ['Ok']
     * @static
     */
    MessageBox.defaultOptions = ['Ok'];


    MessageBox.defaultSettings = { buttonClass: "btn btn-default", primaryButtonClass: "btn-default autofocus", secondaryButtonClass: "", "class": "modal-content messageBox" };

    /**
    * Sets the classes and styles used throughout the message box markup.
    * @method setDefaults
    * @param {object} settings A settings object containing the following optional properties: buttonClass, primaryButtonClass, secondaryButtonClass, class, style.
    */
    MessageBox.setDefaults = function (settings) {
        $.extend(MessageBox.defaultSettings, settings);
    };

    MessageBox.prototype.getButtonClass = function ($index) {
        var c = "";
        if (this.settings) {
            if (this.settings.buttonClass) {
                c = this.settings.buttonClass;
            }
            if ($index() === 0 && this.settings.primaryButtonClass) {
                if (c.length > 0) {
                    c += " ";
                }
                c += this.settings.primaryButtonClass;
            }
            if ($index() > 0 && this.settings.secondaryButtonClass) {
                if (c.length > 0) {
                    c += " ";
                }
                c += this.settings.secondaryButtonClass;
            }
        }
        return c;
    };

    MessageBox.prototype.getClass = function () {
        if (this.settings) {
            return this.settings["class"];
        }
        return "messageBox";
    };

    MessageBox.prototype.getStyle = function () {
        if (this.settings) {
            return this.settings.style;
        }
        return null;
    };

    MessageBox.prototype.getButtonText = function (stringOrObject) {
        var t = $.type(stringOrObject);
        if (t === "string") {
            return stringOrObject;
        }
        else if (t === "object") {
            if ($.type(stringOrObject.text) === "string") {
                return stringOrObject.text;
            } else {
                system.error('The object for a MessageBox button does not have a text property that is a string.');
                return null;
            }
        }
        system.error('Object for a MessageBox button is not a string or object but ' + t + '.');
        return null;
    };

    MessageBox.prototype.getButtonValue = function (stringOrObject) {
        var t = $.type(stringOrObject);
        if (t === "string") {
            return stringOrObject;
        }
        else if (t === "object") {
            if ($.type(stringOrObject.text) === "undefined") {
                system.error('The object for a MessageBox button does not have a value property defined.');
                return null;
            } else {
                return stringOrObject.value;
            }
        }
        system.error('Object for a MessageBox button is not a string or object but ' + t + '.');
        return null;
    };

    /**
     * The markup for the message box's view.
     * @property {string} defaultViewMarkup
     * @static
     */
    MessageBox.defaultViewMarkup = [
        //'<div data-view="plugins/messageBox" data-bind="css: getClass(), style: getStyle()">',
        //'<div class="modal fade in" tabindex="-1" role="basic" aria-hidden="true">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header">',
                        '<h3 data-bind="html: title"></h3>',
                    '</div>',
                    '<div class="modal-body">',
                        '<p class="message" data-bind="html: message"></p>',
                    '</div>',
                    '<div class="modal-footer">',
                        '<!-- ko foreach: options -->',
                        '<button data-bind="click: function () { $parent.selectOption($parent.getButtonValue($data)); }, text: $parent.getButtonText($data), css: $parent.getButtonClass($index)"></button>',
                        '<!-- /ko -->',
                        '<div style="clear:both;"></div>',
                    '</div>',
                '</div>',
            '</div>'
        //'</div>',
        //'</div>'
    ].join('\n');

    function ensureDialogInstance(objOrModuleId) {
        return system.defer(function (dfd) {
            if (system.isString(objOrModuleId)) {
                system.acquire(objOrModuleId).then(function (module) {
                    dfd.resolve(system.resolveObject(module));
                }).fail(function (err) {
                    system.error('Failed to load dialog module (' + objOrModuleId + '). Details: ' + err.message);
                });
            } else {
                dfd.resolve(objOrModuleId);
            }
        }).promise();
    }

    /**
     * @class DialogModule
     * @static
     */
    dialog = {
        /**
         * The constructor function used to create message boxes.
         * @property {MessageBox} MessageBox
         */
        MessageBox: MessageBox,
        /**
         * The css zIndex that the last dialog was displayed at.
         * @property {number} currentZIndex
         */
        currentZIndex: 1050,
        /**
         * Gets the next css zIndex at which a dialog should be displayed.
         * @method getNextZIndex
         * @return {number} The next usable zIndex.
         */
        getNextZIndex: function () {
            return ++this.currentZIndex;
        },
        /**
         * Determines whether or not there are any dialogs open.
         * @method isOpen
         * @return {boolean} True if a dialog is open. false otherwise.
         */
        isOpen: ko.computed(function () {
            return dialogCount() > 0;
        }),
        /**
         * Gets the dialog context by name or returns the default context if no name is specified.
         * @method getContext
         * @param {string} [name] The name of the context to retrieve.
         * @return {DialogContext} True context.
         */
        getContext: function (name) {
            return contexts[name || 'default'];
        },
        /**
         * Adds (or replaces) a dialog context.
         * @method addContext
         * @param {string} name The name of the context to add.
         * @param {DialogContext} dialogContext The context to add.
         */
        addContext: function (name, dialogContext) {
            dialogContext.name = name;
            contexts[name] = dialogContext;

            var helperName = 'show' + name.substr(0, 1).toUpperCase() + name.substr(1);
            this[helperName] = function (obj, activationData) {
                return this.show(obj, activationData, name);
            };
        },
        createCompositionSettings: function (obj, dialogContext) {
            var settings = {
                model: obj,
                activate: false,
                transition: false
            };

            if (dialogContext.binding) {
                settings.binding = dialogContext.binding;
            }

            if (dialogContext.attached) {
                settings.attached = dialogContext.attached;
            }

            if (dialogContext.compositionComplete) {
                settings.compositionComplete = dialogContext.compositionComplete;
            }

            return settings;
        },
        /**
         * Gets the dialog model that is associated with the specified object.
         * @method getDialog
         * @param {object} obj The object for whom to retrieve the dialog.
         * @return {Dialog} The dialog model.
         */
        getDialog: function (obj) {
            if (obj) {
                return obj.__dialog__;
            }

            return undefined;
        },
        /**
         * Closes the dialog associated with the specified object.
         * @method close
         * @param {object} obj The object whose dialog should be closed.
         * @param {object} results* The results to return back to the dialog caller after closing.
         */
        close: function (obj) {
            var theDialog = this.getDialog(obj);
            if (theDialog) {
                var rest = Array.prototype.slice.call(arguments, 1);
                theDialog.close.apply(theDialog, rest);
            }
        },
        /**
         * Shows a dialog.
         * @method show
         * @param {object|string} obj The object (or moduleId) to display as a dialog.
         * @param {object} [activationData] The data that should be passed to the object upon activation.
         * @param {string} [context] The name of the dialog context to use. Uses the default context if none is specified.
         * @return {Promise} A promise that resolves when the dialog is closed and returns any data passed at the time of closing.
         */
        show: function (obj, activationData, context) {
            var that = this;
            var dialogContext = contexts[context || 'default'];

            return system.defer(function (dfd) {
                ensureDialogInstance(obj).then(function (instance) {
                    var dialogActivator = activator.create();

                    dialogActivator.activateItem(instance, activationData).then(function (success) {
                        if (success) {
                            var theDialog = instance.__dialog__ = {
                                owner: instance,
                                context: dialogContext,
                                activator: dialogActivator,
                                close: function () {
                                    var args = arguments;
                                    dialogActivator.deactivateItem(instance, true).then(function (closeSuccess) {
                                        if (closeSuccess) {
                                            dialogCount(dialogCount() - 1);
                                            dialogContext.removeHost(theDialog);
                                            delete instance.__dialog__;

                                            if (args.length === 0) {
                                                dfd.resolve();
                                            } else if (args.length === 1) {
                                                dfd.resolve(args[0]);
                                            } else {
                                                dfd.resolve.apply(dfd, args);
                                            }
                                        }
                                    });
                                }
                            };

                            theDialog.settings = that.createCompositionSettings(instance, dialogContext);
                            dialogContext.addHost(theDialog);

                            dialogCount(dialogCount() + 1);
                            composition.compose(theDialog.host, theDialog.settings);
                        } else {
                            dfd.resolve(false);
                        }
                    });
                });
            }).promise();
        },
        /**
         * Shows a message box.
         * @method showMessage
         * @param {string} message The message to display in the dialog.
         * @param {string} [title] The title message.
         * @param {string[]} [options] The options to provide to the user.
         * @param {boolean} [autoclose] Automatically close the the message box when clicking outside?
         * @param {Object} [settings] Custom settings for this instance of the messsage box, used to change classes and styles.
         * @return {Promise} A promise that resolves when the message box is closed and returns the selected option.
         */
        showMessage: function (message, title, options, autoclose, settings) {
            if (system.isString(this.MessageBox)) {
                return dialog.show(this.MessageBox, [
                    message,
                    title || MessageBox.defaultTitle,
                    options || MessageBox.defaultOptions,
                    autoclose || false,
                    settings || {}
                ]);
            }

            return dialog.show(new this.MessageBox(message, title, options, autoclose, settings));
        },
        /**
         * Installs this module into Durandal; called by the framework. Adds `app.showDialog` and `app.showMessage` convenience methods.
         * @method install
         * @param {object} [config] Add a `messageBox` property to supply a custom message box constructor. Add a `messageBoxView` property to supply custom view markup for the built-in message box. You can also use messageBoxViewUrl to specify the view url.
         */
        install: function (config) {
            app.showDialog = function (obj, activationData, context) {
                return dialog.show(obj, activationData, context);
            };

            app.closeDialog = function () {
                return dialog.close.apply(dialog, arguments);
            };

            app.showMessage = function (message, title, options, autoclose, settings) {
                return dialog.showMessage(message, title, options, autoclose, settings);
            };

            if (config.messageBox) {
                dialog.MessageBox = config.messageBox;
            }

            if (config.messageBoxView) {
                dialog.MessageBox.prototype.getView = function () {
                    return viewEngine.processMarkup(config.messageBoxView);
                };
            }

            if (config.messageBoxViewUrl) {
                dialog.MessageBox.setViewUrl(config.messageBoxViewUrl);
            }
        }
    };

    /**
     * @class DialogContext
     */
    dialog.addContext('default', {
        blockoutOpacity: 0.2,
        removeDelay: 200,
        /**
         * In this function, you are expected to add a DOM element to the tree which will serve as the "host" for the modal's composed view. You must add a property called host to the modalWindow object which references the dom element. It is this host which is passed to the composition module.
         * @method addHost
         * @param {Dialog} theDialog The dialog model.
         */
        addHost: function (theDialog) {
            var body = $('body');
            //var blockout = $('<div class="modalBlockout"></div>')
            var blockout = $('<div class="modalBlockout modal-backdrop fade in"></div>')
                //.css({ 'z-index': dialog.getNextZIndex(), 'opacity': this.blockoutOpacity })
                .appendTo(body);

            //var host = $('<div class="modalHost modal fade in" tabindex="-1" role="basic" aria-hidden="true" >')
            var host = $('<div class="modalHost modal fade in" tabindex="-1" role="basic" aria-hidden="true" style="display: block;padding-right: 16px;" >')
                //.css({ 'z-index': dialog.getNextZIndex() })
                .appendTo(body);

            theDialog.host = host.get(0);
            theDialog.blockout = blockout.get(0);

            //if (!dialog.isOpen()) {
            //    theDialog.oldBodyMarginRight = body.css("margin-right");
            //    theDialog.oldInlineMarginRight = body.get(0).style.marginRight;

            //    var html = $("html");
            //    var oldBodyOuterWidth = body.outerWidth(true);
            //    var oldScrollTop = html.scrollTop();
            //    $("html").css("overflow-y", "hidden");
            //    var newBodyOuterWidth = $("body").outerWidth(true);
            //    body.css("margin-right", (newBodyOuterWidth - oldBodyOuterWidth + parseInt(theDialog.oldBodyMarginRight, 10)) + "px");
            //    html.scrollTop(oldScrollTop); // necessary for Firefox
            //}
        },
        /**
         * This function is expected to remove any DOM machinery associated with the specified dialog and do any other necessary cleanup.
         * @method removeHost
         * @param {Dialog} theDialog The dialog model.
         */
        removeHost: function (theDialog) {
            $(theDialog.host).css('opacity', 0);
            $(theDialog.blockout).css('opacity', 0);

            setTimeout(function () {
                ko.removeNode(theDialog.host);
                ko.removeNode(theDialog.blockout);
            }, this.removeDelay);

            //if (!dialog.isOpen()) {
            //    var html = $("html");
            //    var oldScrollTop = html.scrollTop(); // necessary for Firefox.
            //    html.css("overflow-y", "").scrollTop(oldScrollTop);

            //    if (theDialog.oldInlineMarginRight) {
            //        $("body").css("margin-right", theDialog.oldBodyMarginRight);
            //    } else {
            //        $("body").css("margin-right", '');
            //    }
            //}
        },
        attached: function (view) {
            //To prevent flickering in IE8, we set visibility to hidden first, and later restore it
            //$(view).css("visibility", "hidden");
            $(view).css("display: block", "padding-right: 16px");
        },
        /**
         * This function is called after the modal is fully composed into the DOM, allowing your implementation to do any final modifications, such as positioning or animation. You can obtain the original dialog object by using `getDialog` on context.model.
         * @method compositionComplete
         * @param {DOMElement} child The dialog view.
         * @param {DOMElement} parent The parent view.
         * @param {object} context The composition context.
         */
        compositionComplete: function (child, parent, context) {
            var theDialog = dialog.getDialog(context.model);
            var $child = $(child);
            var loadables = $child.find("img").filter(function () {
                //Remove images with known width and height
                var $this = $(this);
                return !(this.style.width && this.style.height) && !($this.attr("width") && $this.attr("height"));
            });

            //$child.data("predefinedWidth", $child.get(0).style.width);

            //var setDialogPosition = function (childView, objDialog) {
            //    //Setting a short timeout is need in IE8, otherwise we could do this straight away
            //    setTimeout(function () {
            //        var $childView = $(childView);

            //        objDialog.context.reposition(childView);

            //        $(objDialog.host).css('opacity', 1);
            //        $childView.css("visibility", "visible");

            //        $childView.find('.autofocus').first().focus();
            //    }, 1);
            //};

            //setDialogPosition(child, theDialog);
            //loadables.load(function () {
            //    setDialogPosition(child, theDialog);
            //});

            //if ($child.hasClass('autoclose') || context.model.autoclose) {
            //    $(theDialog.blockout).click(function () {
            //        theDialog.close();
            //    });
            //}
        },
        /**
         * This function is called to reposition the model view.
         * @method reposition
         * @param {DOMElement} view The dialog view.
         */
        reposition: function (view) {
            var $view = $(view),
                $window = $(window);

            //We will clear and then set width for dialogs without width set 
            if (!$view.data("predefinedWidth")) {
                $view.css({ width: '' }); //Reset width
            }
            var width = $view.outerWidth(false),
                height = $view.outerHeight(false),
                windowHeight = $window.height() - 10, //leave at least 10 pixels free
                windowWidth = $window.width() - 10, //leave at least 10 pixels free
                constrainedHeight = Math.min(height, windowHeight),
                constrainedWidth = Math.min(width, windowWidth);

            $view.css({
                'margin-top': (-constrainedHeight / 2).toString() + 'px',
                'margin-left': (-constrainedWidth / 2).toString() + 'px'
            });

            if (height > windowHeight) {
                $view.css("overflow-y", "auto").outerHeight(windowHeight);
            } else {
                $view.css({
                    "overflow-y": "",
                    "height": ""
                });
            }

            if (width > windowWidth) {
                $view.css("overflow-x", "auto").outerWidth(windowWidth);
            } else {
                $view.css("overflow-x", "");

                if (!$view.data("predefinedWidth")) {
                    //Ensure the correct width after margin-left has been set
                    $view.outerWidth(constrainedWidth);
                } else {
                    $view.css("width", $view.data("predefinedWidth"));
                }
            }
        }
    });

    return dialog;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * This module is based on Backbone's core history support. It abstracts away the low level details of working with browser history and url changes in order to provide a solid foundation for a router.
 * @module history
 * @requires system
 * @requires jquery
 */
define('plugins/history', ['durandal/system', 'jquery'], function (system, $) {
    // Cached regex for stripping a leading hash/slash and trailing space.
    var routeStripper = /^[#\/]|\s+$/g;

    // Cached regex for stripping leading and trailing slashes.
    var rootStripper = /^\/+|\/+$/g;

    // Cached regex for detecting MSIE.
    var isExplorer = /msie [\w.]+/;

    // Cached regex for removing a trailing slash.
    var trailingSlash = /\/$/;

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    function updateHash(location, fragment, replace) {
        if (replace) {
            var href = location.href.replace(/(javascript:|#).*$/, '');

            if (history.history.replaceState) {
                history.history.replaceState({}, document.title, href + '#' + fragment); // using history.replaceState instead of location.replace to work around chrom bug
            } else {
                location.replace(href + '#' + fragment);
            }
        } else {
            // Some browsers require that `hash` contains a leading #.
            location.hash = '#' + fragment;
        }
    };

    /**
     * @class HistoryModule
     * @static
     */
    var history = {
        /**
         * The setTimeout interval used when the browser does not support hash change events.
         * @property {string} interval
         * @default 50
         */
        interval: 50,
        /**
         * Indicates whether or not the history module is actively tracking history.
         * @property {string} active
         */
        active: false
    };

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
        history.location = window.location;
        history.history = window.history;
    }

    /**
     * Gets the true hash value. Cannot use location.hash directly due to a bug in Firefox where location.hash will always be decoded.
     * @method getHash
     * @param {string} [window] The optional window instance
     * @return {string} The hash.
     */
    history.getHash = function (window) {
        var match = (window || history).location.href.match(/#(.*)$/);
        return match ? match[1] : '';
    };

    /**
     * Get the cross-browser normalized URL fragment, either from the URL, the hash, or the override.
     * @method getFragment
     * @param {string} fragment The fragment.
     * @param {boolean} forcePushState Should we force push state?
     * @return {string} he fragment.
     */
    history.getFragment = function (fragment, forcePushState) {
        if (fragment == null) {
            if (history._hasPushState || !history._wantsHashChange || forcePushState) {
                fragment = history.location.pathname + history.location.search;
                var root = history.root.replace(trailingSlash, '');
                if (!fragment.indexOf(root)) {
                    fragment = fragment.substr(root.length);
                }
            } else {
                fragment = history.getHash();
            }
        }

        return fragment.replace(routeStripper, '');
    };

    /**
     * Activate the hash change handling, returning `true` if the current URL matches an existing route, and `false` otherwise.
     * @method activate
     * @param {HistoryOptions} options.
     * @return {boolean|undefined} Returns true/false from loading the url unless the silent option was selected.
     */
    history.activate = function (options) {
        if (history.active) {
            system.error("History has already been activated.");
        }

        history.active = true;

        // Figure out the initial configuration. Do we need an iframe?
        // Is pushState desired ... is it available?
        history.options = system.extend({}, { root: '/' }, history.options, options);
        history.root = history.options.root;
        history._wantsHashChange = history.options.hashChange !== false;
        history._wantsPushState = !!history.options.pushState;
        history._hasPushState = !!(history.options.pushState && history.history && history.history.pushState);

        var fragment = history.getFragment();
        var docMode = document.documentMode;
        var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

        // Normalize root to always include a leading and trailing slash.
        history.root = ('/' + history.root + '/').replace(rootStripper, '/');

        if (oldIE && history._wantsHashChange) {
            history.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
            history.navigate(fragment, false);
        }

        // Depending on whether we're using pushState or hashes, and whether
        // 'onhashchange' is supported, determine how we check the URL state.
        if (history._hasPushState) {
            $(window).on('popstate', history.checkUrl);
        } else if (history._wantsHashChange && ('onhashchange' in window) && !oldIE) {
            $(window).on('hashchange', history.checkUrl);
        } else if (history._wantsHashChange) {
            history._checkUrlInterval = setInterval(history.checkUrl, history.interval);
        }

        // Determine if we need to change the base url, for a pushState link
        // opened by a non-pushState browser.
        history.fragment = fragment;
        var loc = history.location;
        var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === history.root;

        // Transition from hashChange to pushState or vice versa if both are requested.
        if (history._wantsHashChange && history._wantsPushState) {
            // If we've started off with a route from a `pushState`-enabled
            // browser, but we're currently in a browser that doesn't support it...
            if (!history._hasPushState && !atRoot) {
                history.fragment = history.getFragment(null, true);
                history.location.replace(history.root + history.location.search + '#' + history.fragment);
                // Return immediately as browser will do redirect to new url
                return true;

                // Or if we've started out with a hash-based route, but we're currently
                // in a browser where it could be `pushState`-based instead...
            } else if (history._hasPushState && atRoot && loc.hash) {
                this.fragment = history.getHash().replace(routeStripper, '');
                this.history.replaceState({}, document.title, history.root + history.fragment + loc.search);
            }
        }

        if (!history.options.silent) {
            return history.loadUrl(options.startRoute);
        }
    };

    /**
     * Disable history, perhaps temporarily. Not useful in a real app, but possibly useful for unit testing Routers.
     * @method deactivate
     */
    history.deactivate = function () {
        $(window).off('popstate', history.checkUrl).off('hashchange', history.checkUrl);
        clearInterval(history._checkUrlInterval);
        history.active = false;
    };

    /**
     * Checks the current URL to see if it has changed, and if it has, calls `loadUrl`, normalizing across the hidden iframe.
     * @method checkUrl
     * @return {boolean} Returns true/false from loading the url.
     */
    history.checkUrl = function () {
        var current = history.getFragment();
        if (current === history.fragment && history.iframe) {
            current = history.getFragment(history.getHash(history.iframe));
        }

        if (current === history.fragment) {
            return false;
        }

        if (history.iframe) {
            history.navigate(current, false);
        }

        history.loadUrl();
    };

    /**
     * Attempts to load the current URL fragment. A pass-through to options.routeHandler.
     * @method loadUrl
     * @return {boolean} Returns true/false from the route handler.
     */
    history.loadUrl = function (fragmentOverride) {
        var fragment = history.fragment = history.getFragment(fragmentOverride);

        return history.options.routeHandler ?
            history.options.routeHandler(fragment) :
            false;
    };

    /**
     * Save a fragment into the hash history, or replace the URL state if the
     * 'replace' option is passed. You are responsible for properly URL-encoding
     * the fragment in advance.
     * The options object can contain `trigger: false` if you wish to not have the
     * route callback be fired, or `replace: true`, if
     * you wish to modify the current URL without adding an entry to the history.
     * @method navigate
     * @param {string} fragment The url fragment to navigate to.
     * @param {object|boolean} options An options object with optional trigger and replace flags. You can also pass a boolean directly to set the trigger option. Trigger is `true` by default.
     * @return {boolean} Returns true/false from loading the url.
     */
    history.navigate = function (fragment, options) {
        if (!history.active) {
            return false;
        }

        if (options === undefined) {
            options = {
                trigger: true
            };
        } else if (system.isBoolean(options)) {
            options = {
                trigger: options
            };
        }

        fragment = history.getFragment(fragment || '');

        if (history.fragment === fragment) {
            return;
        }

        history.fragment = fragment;

        var url = history.root + fragment;

        // Don't include a trailing slash on the root.
        if (fragment === '' && url !== '/') {
            url = url.slice(0, -1);
        }

        // If pushState is available, we use it to set the fragment as a real URL.
        if (history._hasPushState) {
            history.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

            // If hash changes haven't been explicitly disabled, update the hash
            // fragment to store history.
        } else if (history._wantsHashChange) {
            updateHash(history.location, fragment, options.replace);

            if (history.iframe && (fragment !== history.getFragment(history.getHash(history.iframe)))) {
                // Opening and closing the iframe tricks IE7 and earlier to push a
                // history entry on hash-tag change.  When replace is true, we don't
                // want history.
                if (!options.replace) {
                    history.iframe.document.open().close();
                }

                updateHash(history.iframe.location, fragment, options.replace);
            }

            // If you've told us that you explicitly don't want fallback hashchange-
            // based history, then `navigate` becomes a page refresh.
        } else {
            return history.location.assign(url);
        }

        if (options.trigger) {
            return history.loadUrl(fragment);
        }
    };

    /**
     * Navigates back in the browser history.
     * @method navigateBack
     */
    history.navigateBack = function () {
        history.history.back();
    };

    /**
     * @class HistoryOptions
     * @static
     */

    /**
     * The function that will be called back when the fragment changes.
     * @property {function} routeHandler
     */

    /**
     * The url root used to extract the fragment when using push state.
     * @property {string} root
     */

    /**
     * Use hash change when present.
     * @property {boolean} hashChange
     * @default true
     */

    /**
     * Use push state when present.
     * @property {boolean} pushState
     * @default false
     */

    /**
     * Prevents loading of the current url when activating history.
     * @property {boolean} silent
     * @default false
     */

    return history;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Layers the widget sugar on top of the composition system.
 * @module widget
 * @requires system
 * @requires composition
 * @requires jquery
 * @requires knockout
 */
define('plugins/widget', ['durandal/system', 'durandal/composition', 'jquery', 'knockout'], function (system, composition, $, ko) {
    var kindModuleMaps = {},
        kindViewMaps = {},
        bindableSettings = ['model', 'view', 'kind'],
        widgetDataKey = 'durandal-widget-data';

    function extractParts(element, settings) {
        var data = ko.utils.domData.get(element, widgetDataKey);

        if (!data) {
            data = {
                parts: composition.cloneNodes(ko.virtualElements.childNodes(element))
            };

            ko.virtualElements.emptyNode(element);
            ko.utils.domData.set(element, widgetDataKey, data);
        }

        settings.parts = data.parts;
    }

    /**
     * @class WidgetModule
     * @static
     */
    var widget = {
        getSettings: function (valueAccessor) {
            var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

            if (system.isString(settings)) {
                return { kind: settings };
            }

            for (var attrName in settings) {
                if (ko.utils.arrayIndexOf(bindableSettings, attrName) != -1) {
                    settings[attrName] = ko.utils.unwrapObservable(settings[attrName]);
                } else {
                    settings[attrName] = settings[attrName];
                }
            }

            return settings;
        },
        /**
         * Creates a ko binding handler for the specified kind.
         * @method registerKind
         * @param {string} kind The kind to create a custom binding handler for.
         */
        registerKind: function (kind) {
            ko.bindingHandlers[kind] = {
                init: function () {
                    return { controlsDescendantBindings: true };
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var settings = widget.getSettings(valueAccessor);
                    settings.kind = kind;
                    extractParts(element, settings);
                    widget.create(element, settings, bindingContext, true);
                }
            };

            ko.virtualElements.allowedBindings[kind] = true;
            composition.composeBindings.push(kind + ':');
        },
        /**
         * Maps views and module to the kind identifier if a non-standard pattern is desired.
         * @method mapKind
         * @param {string} kind The kind name.
         * @param {string} [viewId] The unconventional view id to map the kind to.
         * @param {string} [moduleId] The unconventional module id to map the kind to.
         */
        mapKind: function (kind, viewId, moduleId) {
            if (viewId) {
                kindViewMaps[kind] = viewId;
            }

            if (moduleId) {
                kindModuleMaps[kind] = moduleId;
            }
        },
        /**
         * Maps a kind name to it's module id. First it looks up a custom mapped kind, then falls back to `convertKindToModulePath`.
         * @method mapKindToModuleId
         * @param {string} kind The kind name.
         * @return {string} The module id.
         */
        mapKindToModuleId: function (kind) {
            return kindModuleMaps[kind] || widget.convertKindToModulePath(kind);
        },
        /**
         * Converts a kind name to it's module path. Used to conventionally map kinds who aren't explicitly mapped through `mapKind`.
         * @method convertKindToModulePath
         * @param {string} kind The kind name.
         * @return {string} The module path.
         */
        convertKindToModulePath: function (kind) {
            return 'widgets/' + kind + '/viewmodel';
        },
        /**
         * Maps a kind name to it's view id. First it looks up a custom mapped kind, then falls back to `convertKindToViewPath`.
         * @method mapKindToViewId
         * @param {string} kind The kind name.
         * @return {string} The view id.
         */
        mapKindToViewId: function (kind) {
            return kindViewMaps[kind] || widget.convertKindToViewPath(kind);
        },
        /**
         * Converts a kind name to it's view id. Used to conventionally map kinds who aren't explicitly mapped through `mapKind`.
         * @method convertKindToViewPath
         * @param {string} kind The kind name.
         * @return {string} The view id.
         */
        convertKindToViewPath: function (kind) {
            return 'widgets/' + kind + '/view';
        },
        createCompositionSettings: function (element, settings) {
            if (!settings.model) {
                settings.model = this.mapKindToModuleId(settings.kind);
            }

            if (!settings.view) {
                settings.view = this.mapKindToViewId(settings.kind);
            }

            settings.preserveContext = true;
            settings.activate = true;
            settings.activationData = settings;
            settings.mode = 'templated';

            return settings;
        },
        /**
         * Creates a widget.
         * @method create
         * @param {DOMElement} element The DOMElement or knockout virtual element that serves as the target element for the widget.
         * @param {object} settings The widget settings.
         * @param {object} [bindingContext] The current binding context.
         */
        create: function (element, settings, bindingContext, fromBinding) {
            if (!fromBinding) {
                settings = widget.getSettings(function () { return settings; }, element);
            }

            var compositionSettings = widget.createCompositionSettings(element, settings);

            composition.compose(element, compositionSettings, bindingContext);
        },
        /**
         * Installs the widget module by adding the widget binding handler and optionally registering kinds.
         * @method install
         * @param {object} config The module config. Add a `kinds` array with the names of widgets to automatically register. You can also specify a `bindingName` if you wish to use another name for the widget binding, such as "control" for example.
         */
        install: function (config) {
            config.bindingName = config.bindingName || 'widget';

            if (config.kinds) {
                var toRegister = config.kinds;

                for (var i = 0; i < toRegister.length; i++) {
                    widget.registerKind(toRegister[i]);
                }
            }

            ko.bindingHandlers[config.bindingName] = {
                init: function () {
                    return { controlsDescendantBindings: true };
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var settings = widget.getSettings(valueAccessor);
                    extractParts(element, settings);
                    widget.create(element, settings, bindingContext, true);
                }
            };

            composition.composeBindings.push(config.bindingName + ':');
            ko.virtualElements.allowedBindings[config.bindingName] = true;
        }
    };

    return widget;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Serializes and deserializes data to/from JSON.
 * @module serializer
 * @requires system
 */
define('plugins/serializer', ['durandal/system'], function (system) {
    /**
     * @class SerializerModule
     * @static
     */
    return {
        /**
         * The name of the attribute that the serializer should use to identify an object's type.
         * @property {string} typeAttribute
         * @default type
         */
        typeAttribute: 'type',
        /**
         * The amount of space to use for indentation when writing out JSON.
         * @property {string|number} space
         * @default undefined
         */
        space: undefined,
        /**
         * The default replacer function used during serialization. By default properties starting with '_' or '$' are removed from the serialized object.
         * @method replacer
         * @param {string} key The object key to check.
         * @param {object} value The object value to check.
         * @return {object} The value to serialize.
         */
        replacer: function (key, value) {
            if (key) {
                var first = key[0];
                if (first === '_' || first === '$') {
                    return undefined;
                }
            }

            return value;
        },
        /**
         * Serializes the object.
         * @method serialize
         * @param {object} object The object to serialize.
         * @param {object} [settings] Settings can specify a replacer or space to override the serializer defaults.
         * @return {string} The JSON string.
         */
        serialize: function (object, settings) {
            settings = (settings === undefined) ? {} : settings;

            if (system.isString(settings) || system.isNumber(settings)) {
                settings = { space: settings };
            }

            return JSON.stringify(object, settings.replacer || this.replacer, settings.space || this.space);
        },
        /**
         * Gets the type id for an object instance, using the configured `typeAttribute`.
         * @method getTypeId
         * @param {object} object The object to serialize.
         * @return {string} The type.
         */
        getTypeId: function (object) {
            if (object) {
                return object[this.typeAttribute];
            }

            return undefined;
        },
        /**
         * Maps type ids to object constructor functions. Keys are type ids and values are functions.
         * @property {object} typeMap.
         */
        typeMap: {},
        /**
         * Adds a type id/constructor function mampping to the `typeMap`.
         * @method registerType
         * @param {string} typeId The type id.
         * @param {function} constructor The constructor.
         */
        registerType: function () {
            var first = arguments[0];

            if (arguments.length == 1) {
                var id = first[this.typeAttribute] || system.getModuleId(first);
                this.typeMap[id] = first;
            } else {
                this.typeMap[first] = arguments[1];
            }
        },
        /**
         * The default reviver function used during deserialization. By default is detects type properties on objects and uses them to re-construct the correct object using the provided constructor mapping.
         * @method reviver
         * @param {string} key The attribute key.
         * @param {object} value The object value associated with the key.
         * @param {function} getTypeId A custom function used to get the type id from a value.
         * @param {object} getConstructor A custom function used to get the constructor function associated with a type id.
         * @return {object} The value.
         */
        reviver: function (key, value, getTypeId, getConstructor) {
            var typeId = getTypeId(value);
            if (typeId) {
                var ctor = getConstructor(typeId);
                if (ctor) {
                    if (ctor.fromJSON) {
                        return ctor.fromJSON(value);
                    }

                    return new ctor(value);
                }
            }

            return value;
        },
        /**
         * Deserialize the JSON.
         * @method deserialize
         * @param {string} text The JSON string.
         * @param {object} [settings] Settings can specify a reviver, getTypeId function or getConstructor function.
         * @return {object} The deserialized object.
         */
        deserialize: function (text, settings) {
            var that = this;
            settings = settings || {};

            var getTypeId = settings.getTypeId || function (object) { return that.getTypeId(object); };
            var getConstructor = settings.getConstructor || function (id) { return that.typeMap[id]; };
            var reviver = settings.reviver || function (key, value) { return that.reviver(key, value, getTypeId, getConstructor); };

            return JSON.parse(text, reviver);
        },
        /**
         * Clone the object.
         * @method clone
         * @param {object} obj The object to clone.
         * @param {object} [settings] Settings can specify any of the options allowed by the serialize or deserialize methods.
         * @return {object} The new clone.
         */
        clone: function (obj, settings) {
            return this.deserialize(this.serialize(obj, settings), settings);
        }
    };
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Enables automatic observability of plain javascript object for ES5 compatible browsers. Also, converts promise properties into observables that are updated when the promise resolves.
 * @module observable
 * @requires system
 * @requires binder
 * @requires knockout
 */
define('plugins/observable', ['durandal/system', 'durandal/binder', 'knockout'], function (system, binder, ko) {
    var observableModule,
        toString = Object.prototype.toString,
        nonObservableTypes = ['[object Function]', '[object String]', '[object Boolean]', '[object Number]', '[object Date]', '[object RegExp]'],
        observableArrayMethods = ['remove', 'removeAll', 'destroy', 'destroyAll', 'replace'],
        arrayMethods = ['pop', 'reverse', 'sort', 'shift', 'slice'],
        additiveArrayFunctions = ['push', 'unshift'],
        es5Functions = ['filter', 'map', 'reduce', 'reduceRight', 'forEach', 'every', 'some'],
        arrayProto = Array.prototype,
        observableArrayFunctions = ko.observableArray.fn,
        logConversion = false,
        changeDetectionMethod = undefined,
        skipPromises = false,
        shouldIgnorePropertyName;

    /**
     * You can call observable(obj, propertyName) to get the observable function for the specified property on the object.
     * @class ObservableModule
     */

    if (!('getPropertyDescriptor' in Object)) {
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        var getPrototypeOf = Object.getPrototypeOf;

        Object['getPropertyDescriptor'] = function (o, name) {
            var proto = o, descriptor;

            while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))) {
                proto = getPrototypeOf(proto);
            }

            return descriptor;
        };
    }

    function defaultShouldIgnorePropertyName(propertyName) {
        var first = propertyName[0];
        return first === '_' || first === '$' || (changeDetectionMethod && propertyName === changeDetectionMethod);
    }

    function isNode(obj) {
        return !!(obj && obj.nodeType !== undefined && system.isNumber(obj.nodeType));
    }

    function canConvertType(value) {
        if (!value || isNode(value) || value.ko === ko || value.jquery) {
            return false;
        }

        var type = toString.call(value);

        return nonObservableTypes.indexOf(type) == -1 && !(value === true || value === false);
    }

    function createLookup(obj) {
        var value = {};

        Object.defineProperty(obj, "__observable__", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        });

        return value;
    }

    function makeObservableArray(original, observable, hasChanged) {
        var lookup = original.__observable__, notify = true;

        if (lookup && lookup.__full__) {
            return;
        }

        lookup = lookup || createLookup(original);
        lookup.__full__ = true;

        es5Functions.forEach(function (methodName) {
            observable[methodName] = function () {
                return arrayProto[methodName].apply(original, arguments);
            };
        });

        observableArrayMethods.forEach(function (methodName) {
            original[methodName] = function () {
                notify = false;
                var methodCallResult = observableArrayFunctions[methodName].apply(observable, arguments);
                notify = true;
                return methodCallResult;
            };
        });

        arrayMethods.forEach(function (methodName) {
            original[methodName] = function () {
                if (notify) {
                    observable.valueWillMutate();
                }

                var methodCallResult = arrayProto[methodName].apply(original, arguments);

                if (notify) {
                    observable.valueHasMutated();
                }

                return methodCallResult;
            };
        });

        additiveArrayFunctions.forEach(function (methodName) {
            original[methodName] = function () {
                for (var i = 0, len = arguments.length; i < len; i++) {
                    convertObject(arguments[i], hasChanged);
                }

                if (notify) {
                    observable.valueWillMutate();
                }

                var methodCallResult = arrayProto[methodName].apply(original, arguments);

                if (notify) {
                    observable.valueHasMutated();
                }

                return methodCallResult;
            };
        });

        original['splice'] = function () {
            for (var i = 2, len = arguments.length; i < len; i++) {
                convertObject(arguments[i], hasChanged);
            }

            if (notify) {
                observable.valueWillMutate();
            }

            var methodCallResult = arrayProto['splice'].apply(original, arguments);

            if (notify) {
                observable.valueHasMutated();
            }

            return methodCallResult;
        };

        for (var i = 0, len = original.length; i < len; i++) {
            convertObject(original[i], hasChanged);
        }
    }

    /**
     * Converts an entire object into an observable object by re-writing its attributes using ES5 getters and setters. Attributes beginning with '_' or '$' are ignored.
     * @method convertObject
     * @param {object} obj The target object to convert.
     */
    function convertObject(obj, hasChanged) {
        var lookup, value;

        if (changeDetectionMethod) {
            if (obj && obj[changeDetectionMethod]) {
                if (hasChanged) {
                    hasChanged = hasChanged.slice(0);
                } else {
                    hasChanged = [];
                }
                hasChanged.push(obj[changeDetectionMethod]);
            }
        }

        if (!canConvertType(obj)) {
            return;
        }

        lookup = obj.__observable__;

        if (lookup && lookup.__full__) {
            return;
        }

        lookup = lookup || createLookup(obj);
        lookup.__full__ = true;

        if (system.isArray(obj)) {
            var observable = ko.observableArray(obj);
            makeObservableArray(obj, observable, hasChanged);
        } else {
            for (var propertyName in obj) {
                if (shouldIgnorePropertyName(propertyName)) {
                    continue;
                }

                if (!lookup[propertyName]) {
                    var descriptor = Object.getPropertyDescriptor(obj, propertyName);
                    if (descriptor && (descriptor.get || descriptor.set)) {
                        defineProperty(obj, propertyName, {
                            get: descriptor.get,
                            set: descriptor.set
                        });
                    } else {
                        value = obj[propertyName];

                        if (!system.isFunction(value)) {
                            convertProperty(obj, propertyName, value, hasChanged);
                        }
                    }
                }
            }
        }

        if (logConversion) {
            system.log('Converted', obj);
        }
    }

    function innerSetter(observable, newValue, isArray) {
        //if this was originally an observableArray, then always check to see if we need to add/replace the array methods (if newValue was an entirely new array)
        if (isArray) {
            if (!newValue) {
                //don't allow null, force to an empty array
                newValue = [];
                makeObservableArray(newValue, observable);
            }
            else if (!newValue.destroyAll) {
                makeObservableArray(newValue, observable);
            }
        } else {
            convertObject(newValue);
        }

        //call the update to the observable after the array as been updated.
        observable(newValue);
    }

    /**
     * Converts a normal property into an observable property using ES5 getters and setters.
     * @method convertProperty
     * @param {object} obj The target object on which the property to convert lives.
     * @param {string} propertyName The name of the property to convert.
     * @param {object} [original] The original value of the property. If not specified, it will be retrieved from the object.
     * @return {KnockoutObservable} The underlying observable.
     */
    function convertProperty(obj, propertyName, original, hasChanged) {
        var observable,
            isArray,
            lookup = obj.__observable__ || createLookup(obj);

        if (original === undefined) {
            original = obj[propertyName];
        }

        if (system.isArray(original)) {
            observable = ko.observableArray(original);
            makeObservableArray(original, observable, hasChanged);
            isArray = true;
        } else if (typeof original == "function") {
            if (ko.isObservable(original)) {
                observable = original;
            } else {
                return null;
            }
        } else if (!skipPromises && system.isPromise(original)) {
            observable = ko.observable();

            original.then(function (result) {
                if (system.isArray(result)) {
                    var oa = ko.observableArray(result);
                    makeObservableArray(result, oa, hasChanged);
                    result = oa;
                }

                observable(result);
            });
        } else {
            observable = ko.observable(original);
            convertObject(original, hasChanged);
        }

        if (hasChanged && hasChanged.length > 0) {
            hasChanged.forEach(function (func) {
                if (system.isArray(original)) {
                    observable.subscribe(function (arrayChanges) {
                        func(obj, propertyName, null, arrayChanges);
                    }, null, "arrayChange");
                } else {
                    observable.subscribe(function (newValue) {
                        func(obj, propertyName, newValue, null);
                    });
                }
            });
        }

        Object.defineProperty(obj, propertyName, {
            configurable: true,
            enumerable: true,
            get: observable,
            set: ko.isWriteableObservable(observable) ? (function (newValue) {
                if (newValue && system.isPromise(newValue) && !skipPromises) {
                    newValue.then(function (result) {
                        innerSetter(observable, result, system.isArray(result));
                    });
                } else {
                    innerSetter(observable, newValue, isArray);
                }
            }) : undefined
        });

        lookup[propertyName] = observable;
        return observable;
    }

    /**
     * Defines a computed property using ES5 getters and setters.
     * @method defineProperty
     * @param {object} obj The target object on which to create the property.
     * @param {string} propertyName The name of the property to define.
     * @param {function|object} evaluatorOrOptions The Knockout computed function or computed options object.
     * @return {KnockoutObservable} The underlying computed observable.
     */
    function defineProperty(obj, propertyName, evaluatorOrOptions) {
        var computedOptions = { owner: obj, deferEvaluation: true },
            computed;

        if (typeof evaluatorOrOptions === 'function') {
            computedOptions.read = evaluatorOrOptions;
        } else {
            if ('value' in evaluatorOrOptions) {
                system.error('For defineProperty, you must not specify a "value" for the property. You must provide a "get" function.');
            }

            if (typeof evaluatorOrOptions.get !== 'function' && typeof evaluatorOrOptions.read !== 'function') {
                system.error('For defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".');
            }

            computedOptions.read = evaluatorOrOptions.get || evaluatorOrOptions.read;
            computedOptions.write = evaluatorOrOptions.set || evaluatorOrOptions.write;
        }

        computed = ko.computed(computedOptions);
        obj[propertyName] = computed;

        return convertProperty(obj, propertyName, computed);
    }

    observableModule = function (obj, propertyName) {
        var lookup, observable, value;

        if (!obj) {
            return null;
        }

        lookup = obj.__observable__;
        if (lookup) {
            observable = lookup[propertyName];
            if (observable) {
                return observable;
            }
        }

        value = obj[propertyName];

        if (ko.isObservable(value)) {
            return value;
        }

        return convertProperty(obj, propertyName, value);
    };

    observableModule.defineProperty = defineProperty;
    observableModule.convertProperty = convertProperty;
    observableModule.convertObject = convertObject;

    /**
     * Installs the plugin into the view model binder's `beforeBind` hook so that objects are automatically converted before being bound.
     * @method install
     */
    observableModule.install = function (options) {
        var original = binder.binding;

        binder.binding = function (obj, view, instruction) {
            if (instruction.applyBindings && !instruction.skipConversion) {
                convertObject(obj);
            }

            original(obj, view);
        };

        logConversion = options.logConversion;
        if (options.changeDetection) {
            changeDetectionMethod = options.changeDetection;
        }

        skipPromises = options.skipPromises;
        shouldIgnorePropertyName = options.shouldIgnorePropertyName || defaultShouldIgnorePropertyName;
    };

    return observableModule;
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * Enables common http request scenarios.
 * @module http
 * @requires jquery
 * @requires knockout
 */
define('plugins/http', ['jquery', 'knockout'], function ($, ko) {
    /**
     * @class HTTPModule
     * @static
     */
    return {
        /**
         * The name of the callback parameter to inject into jsonp requests by default.
         * @property {string} callbackParam
         * @default callback
         */
        callbackParam: 'callback',
        /**
         * Converts the data to JSON.
         * @method toJSON
         * @param {object} data The data to convert to JSON.
         * @return {string} JSON.
         */
        toJSON: function (data) {
            return ko.toJSON(data);
        },
        /**
         * Makes an HTTP GET request.
         * @method get
         * @param {string} url The url to send the get request to.
         * @param {object} [query] An optional key/value object to transform into query string parameters.
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the get response data.
         */
        get: function (url, query, headers) {
            return $.ajax(url, { data: query, headers: ko.toJS(headers) });
        },
        /**
         * Makes an JSONP request.
         * @method jsonp
         * @param {string} url The url to send the get request to.
         * @param {object} [query] An optional key/value object to transform into query string parameters.
         * @param {string} [callbackParam] The name of the callback parameter the api expects (overrides the default callbackParam).
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the response data.
         */
        jsonp: function (url, query, callbackParam, headers) {
            if (url.indexOf('=?') == -1) {
                callbackParam = callbackParam || this.callbackParam;

                if (url.indexOf('?') == -1) {
                    url += '?';
                } else {
                    url += '&';
                }

                url += callbackParam + '=?';
            }

            return $.ajax({
                url: url,
                dataType: 'jsonp',
                data: query,
                headers: ko.toJS(headers)
            });
        },
        /**
         * Makes an HTTP PUT request.
         * @method put
         * @param {string} url The url to send the put request to.
         * @param {object} data The data to put. It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the response data.
         */
        put: function (url, data, headers) {
            return $.ajax({
                url: url,
                data: this.toJSON(data),
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
                headers: ko.toJS(headers)
            });
        },
        /**
         * Makes an HTTP POST request.
         * @method post
         * @param {string} url The url to send the post request to.
         * @param {object} data The data to post. It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the response data.
         */
        post: function (url, data, headers) {
            return $.ajax({
                url: url,
                data: this.toJSON(data),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                headers: ko.toJS(headers)
            });
        },
        /**
         * Makes an HTTP DELETE request.
         * @method remove
         * @param {string} url The url to send the delete request to.
         * @param {object} [query] An optional key/value object to transform into query string parameters.
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the get response data.
         */
        remove: function (url, query, headers) {
            return $.ajax({
                url: url,
                data: query,
                type: 'DELETE',
                headers: ko.toJS(headers)
            });
        }
    };
});

/**
 * Durandal 2.1.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
/**
 * The entrance transition module.
 * @module entrance
 * @requires system
 * @requires composition
 * @requires jquery
 */
define('transitions/entrance', ['durandal/system', 'durandal/composition', 'jquery'], function (system, composition, $) {
    var entrance = function (context) {
        return system.defer(function (dfd) {
            setTimeout(function () { dfd.resolve(); }, 200);
        }).promise();
    };

    return entrance;
});

define('viewmodels/messages', [objectbuilders.datacontext, objectbuilders.config, objectbuilders.logger],
  function (context, config, logger) {

      var isBusy = ko.observable(false),
        messages = ko.observableArray(),
        unread = ko.observable(),
        query = String.format("UserName eq '{0}' and IsRead eq 0", config.userName),
        activate = function () {

            return context.loadAsync({
                entity: "Message",
                includeTotal: true
            }, query)
              .then(function (lo) {
                  messages(lo.itemCollection);
                  unread(lo.rows);

                  if (typeof $.connection !== "function") {
                      return $.getScript("/scripts/jquery.signalR-2.2.0.min.js");
                  }
                  return Task.fromResult(true);
              });

        },
        getTimeSpan = function (m) {
            var date = moment(ko.unwrap(m.CreatedDate), "YYYY-MM-DDTHH:mm.ss");
            var ms = moment().diff(date);
            var d = moment.duration(ms);
            return d.humanize();
        },
        attached = function () {

            return activate()
            .done(function () {
                var connection = $.connection("/signalr_message");

                connection.received(function (data) {
                    if (typeof data.unread === "number") {
                        messages(data.messages);
                        unread(data.unread);
                    }
                    if (typeof data === "string") {
                        logger.info(data);
                    }
                });

                connection.start().done(function (e) {
                    console.log("started...connection to message connection");
                    console.log(e);
                });

            });
        };


      var vm = {
          isBusy: isBusy,
          getTimeSpan: getTimeSpan,
          unread: unread,
          activate: activate,
          attached: attached,
          messages: messages
      };

      return vm;

  });

define('viewmodels/search', ['durandal/system', 'services/logger', objectbuilders.config, 'services/datacontext'],
    function (system, logger, config, context) {

        var isBusy = ko.observable(),
            text = ko.observable(),
            entities = ko.observableArray(),
            activate = function () {
                var query = String.format("IsPublished eq {0}", 1),
                    tcs = new $.Deferred();

                context.loadAsync({
                    entity: "EntityDefinition",
                    query: query
                })
                    .then(function (lo) {
                        isBusy(false);
                        entities(lo.itemCollection);
                        tcs.resolve(true);
                    });
                return tcs.promise();

            },
            attached = function (view) {
                $(view).on('click', '#close-search-result', function (e) {
                    e.preventDefault();
                    vm.searchResults.removeAll();
                });

            },
            search = function () {
                var tcs = new $.Deferred();
                isBusy(true);

                context.get("search/" + ko.unwrap(vm.searchText))
                    .then(function (result) {
                        isBusy(false);
                        var hits = _(result.hits.hits).map(function (v) {
                            var record = _(entities()).find(function (x) {
                                return ko.unwrap(x.Name).toLowerCase() === v._type.toLowerCase();
                            });
                            if (!record) {
                                console.log("whoaa cannot find", v);
                                return {
                                    type: v._type,
                                    id: v._id,
                                    title: "",
                                    iconClass: ko.unwrap(v.IconClass)
                                };
                            }
                            var rn = ko.unwrap(record.RecordName),
                                title = v._source[rn];
                            if (v.highlight) {
                                if (v.highlight[rn]) {
                                    title = v.highlight[rn][0];
                                } else {
                                    title = v.highlight[Object.keys(v.highlight)[0]][0];
                                }
                            }

                            return {
                                type: v._type,
                                id: v._id,
                                title: title,
                                iconClass: ko.unwrap(record.IconClass)
                            };
                        });
                        vm.searchResults(hits);
                        tcs.resolve(hits);
                    });
                return tcs.promise();
            },
            navigateSearch = function (sr) {
                var query = String.format("Name eq '{0}'", sr.type),
                    tcs = new $.Deferred();
                context.loadOneAsync("EntityDefinition", query)
                    .done(function (b) {
                        // get the default form
                        var query2 = String.format("EntityDefinitionId eq {0}", b.EntityDefinitionId());
                        context.loadOneAsync("EntityForm", query2)
                            .done(function (f) {
                                window.location = String.format("/sph#{0}/{1}", f.Route(), sr.id);
                                tcs.resolve(true);
                            });
                    });

                return tcs.promise();
            };

        text.subscribe(function (t) {
            console.log(t);
        });

        var vm = {
            entities: entities,
            activate: activate,
            searchCommand: search,
            searchResults: ko.observableArray(),
            navigateSearch: navigateSearch,
            isBusy: isBusy,
            searchText: text,
            attached: attached
        };

        return vm;


    });
/// <reference path="../objectbuilders.js" />
/// <reference path="../schemas/sph.domain.g.js" />
/// <reference path="../../Scripts/knockout-3.1.0.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/_task.js" />
/// <reference path="../../Scripts/jquery-2.2.0.intellisense.js" />

define('viewmodels/shell.custom', ["durandal/system", "services/system", "plugins/router", "services/logger", "services/datacontext", objectbuilders.config, objectbuilders.cultures, "viewmodels/messages", "viewmodels/_address-book-groups"],
    function (system, system2, router, logger, context, config, cultures, messagesConfig, contactGroups) {

        var activeItem = ko.observable({ caption: "Test 123" }),
            activate = function () {
                return router.map(config.routes)
                    .buildNavigationModel()
                    .mapUnknownRoutes("viewmodels/not.found", "not.found")
                    .activate();
            },
            attached = function (view) {
                $(document).on("click", "a#rx-context-help", function (e) {
                    e.preventDefault();
                    var topic = window.location.hash;
                    window.open("/docs/" + topic);
                });
                $(document).on("click", "a#help-dialog", function (e) {
                    e.preventDefault();
                    var topic = $(this).data("dialog");
                    window.open("/docs/#" + topic);
                });

                var dropDown = function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var button = $(this);
                    button.parent().addClass("open");

                    $(document).one("click", function () {
                        button.parent().removeClass("open");
                    });
                };

                //$(document).on("mouseenter", ".view-model-modal .modal-header", function (e) {
                //    e.preventDefault();
                //    var elem = $(this).parents(".view-model-modal"),
                //        draggable = elem.data("draggable") || elem.data("ui-draggable") || elem.data("uiDraggable");

                //    if (!draggable) {
                //        elem.draggable({
                //            handle: ".modal-header"
                //        });
                //        $(".modal-header").css("cursor", "move");
                //        console.log("draggagle modal");
                //        elem.find("div.modal-header>button").
                //            after("<a class=\"pull-right\" id=\"help-dialog\" data-dialog=\"" + elem.attr("id") + "\" href=\"#\" title=\"see help on this topic\" style=\"margin-right:10px; color:gray\"><i class=\"fa fa-question-circle\"></i></a>");
                //    }
                //});

                $(document).on("click", "a.dropdown-toggle", dropDown);

                $(document).on("click", "table.table-striped th", function (e) {
                    e.preventDefault();
                    var table = $(this).parents("table.table-striped");
                    if (table && !table.prop("sorted")) {
                        console.dir(e);
                        table.tablesorter();
                        table.prop("sorted", "1");
                        $(this).trigger("click");
                    }
                });

                $("body").on("keyup", "div.modal-dialog", function (e) {
                    if (e.which === 27) {
                        $("div.modal-header>button.close").trigger("click");
                    }
                });

                contactGroups.activate().done(function () {
                    if (!ko.dataFor(document.getElementById("contact-group-list"))) {
                        ko.applyBindings(contactGroups, document.getElementById("contact-group-list"));
                    }
                });

                return messagesConfig.attached(view).done(function () {
                    var inboxHeader = document.getElementById("header_inbox_bar");

                    if (inboxHeader && !ko.dataFor(inboxHeader)) {
                        ko.applyBindings(messagesConfig, inboxHeader);
                    }
                });

            },

            print = function (commandParameter) {
                var parameter = typeof commandParameter === "function" ? commandParameter() : commandParameter,
                    url = String.format("/print-out/{0}/{1}", parameter.entity, parameter.id());
                window.open(url);
                return Task.fromResult(true);
            },
            email = function (commandParameter) {
                var parameter = typeof commandParameter === "function" ? commandParameter() : commandParameter,
                    url = String.format("/sph/print/{0}/{1}", parameter.entity, parameter.id()),
                    tcs = new $.Deferred();

                require(["viewmodels/email.entity.dialog", "durandal/app"], function (dialog, app2) {
                    dialog.entity(parameter.entity);
                    dialog.id(parameter.id());
                    if (typeof dialog.wd === "function") {
                        dialog.wd(self);
                    }
                    app2.showDialog(dialog)
                        .done(function (result) {
                            if (!result) return;
                            if (result === "OK") {

                            }
                            tcs.resolve(true);
                        });

                });
                return tcs.promise();
            };

        router.activeItem.subscribe(function (r) {
            var rt = _(config.routes).find(function (v) {
                return ko.unwrap(v.moduleId) === r.__moduleId__;
            });
            if (rt) {
                activeItem(rt);
            }

        });

        var shell = {
            config: config,
            activate: activate,
            attached: attached,
            router: router,
            printCommand: print,
            emailCommand: email,
            activeItem: activeItem
        };

        return shell;


    });

define('services/cultures.my', [],
    function () {
        var cultures = {
            messages: {
                SAVE_SUCCESS: "{0} sudah berjaya di simpan",
                SAVE_ERROR: "Ada masalah untuk menyimpan data anda",
                FORM_IS_NOT_VALID: "Sila pastikan input anda betul",
                DELETE_SUCCESS: "{0} sudah berjaya dihapuskan"
            },
            application: {
                TEMPLATE_NAME: "Templat Permohonan"
            },
            pager: {
                messages: {
                    display: "{0} - {1} of {2} rekod",
                    empty: "Tiada rekod",
                    page: "Muka",
                    of: "dari {0}",
                    itemsPerPage: "rekod setiap mukasurat",
                    first: "Pergi mukasurat pertama",
                    previous: "Pergi ke mukasurat belakang",
                    next: "Sergi mukasurat depan",
                    last: "Pergi mukasurat terakhir",
                    refresh: "Muat"
                }
            }
        };

        return cultures;

    });

define('services/logger', ["durandal/system", objectbuilders.config],
    function (system) {


        function logIt(message, data, source, showToast, toastType) {
            source = source ? "[" + source + "] " : "";
            if (data) {
                system.log(source, message, data);
            } else {
                system.log(source, message);
            }
            //if (showToast) {
            //    if (toastType === "error") {
            //        toastr.error(message);
            //    } else {
            //        toastr.success(message);
            //    }

            //}

        }

        function info(message) {
            logIt(message, null, null, true, "info");
        }

        function log(message, data, source, showToast) {
            logIt(message, data, source, showToast, "info");
        }

        function error(message) {
            logIt(message, null, null, true, "error");
        }
        function logError(message, data, source, showToast) {
            logIt(message, data, source, showToast, "error");
        }

        var logger = {
            log: log,
            info: info,
            error: error,
            logError: logError
        };

        return logger;

    });
/// <reference path="../../Scripts/jquery-2.2.0.intellisense.js" />
/// <reference path="../../Scripts/knockout-3.4.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/loadoperation.js" />
/// <reference path="../../Scripts/modernizr-2.7.2.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="logger.js" />
/// <reference path="../objectbuilders.js" />
/// <reference path="/SphApp/schemas/sph.domain.g.js" />

define('services/datacontext', ["services/logger", objectbuilders.system, "durandal/knockout"],
function (logger, system, ko2) {
    if (!window.ko && typeof ko2 === "object") {
        window.ko = ko2;
    }
    var arrayTypeNamePattern = /\[/,
        toObservable = function (item) {
            if (typeof item === "function") return item;
            if (typeof item === "number") return item;
            if (typeof item === "string") return item;
            if (typeof item.$type === "undefined") return item;
            if (_(item.$type).isNull()) return item;

            var $typeFieldValue = ko.unwrap(item.$type),
                observableObject = {
                    "$type": $typeFieldValue
                },
                pattern = /Bespoke\..*?\..*?\.(.*?),/,
                type = "",
                partial = null;

            if (typeof $typeFieldValue === "string") {
                var bespokeTypeMatch = pattern.exec($typeFieldValue);
                if (bespokeTypeMatch) {
                    type = bespokeTypeMatch[1];
                } else {
                    return item;
                }
            }

            var typeNames = type.split("."),
                root = bespoke.sph.domain,
                Ctor = function () { };

            while (typeNames.length > 0) {
                root = root[typeNames.splice(0, 1)];
                if (typeof root === "undefined") {
                    Ctor = function () { };
                    break;
                }
                Ctor = root;
            }
            observableObject = new Ctor(item);


            for (var name in item) {
                (function (prop) {

                    var _propertyValue = _(item[prop]);

                    if (_propertyValue.isArray()) {

                        var children = _propertyValue.map(function (x) {
                            return toObservable(x, pattern);
                        });

                        observableObject[prop] = ko.observableArray(children);
                        return;
                    }

                    if (_propertyValue.isNumber() || _propertyValue.isNull() || _propertyValue.isNaN() ||
                        _propertyValue.isDate() || _propertyValue.isBoolean() || _propertyValue.isString()) {
                        if (!observableObject[prop]) {
                            observableObject[prop] = ko.observable(item[prop]);
                        }
                        return;
                    }

                    if (_propertyValue.isObject()) {
                        var $typeFieldValue2 = item[prop].$type;

                        // for array and list it has $type and $value fields
                        if ($typeFieldValue2 && arrayTypeNamePattern.exec($typeFieldValue2)) {
                            if (_(item[prop].$values).isArray()) {
                                var childItems = _(item[prop].$values).map(function (v) {
                                    return toObservable(v, pattern);
                                });
                                observableObject[prop] = ko.observableArray(childItems);
                            }
                            return;
                        }

                        if (typeof item[prop] === "function") {
                            return;
                        }

                        var child = toObservable(item[prop], pattern);
                        observableObject[prop] = ko.observable(child);
                        return;
                    }

                })(name);
            }

            if (bespoke.sph.domain[type + "Partial"]) {
                partial = new bespoke.sph.domain[type + "Partial"](observableObject, item);
            }
            if (partial) {
                // NOTE :copy all the partial, DO NOT use _extend as it will override the original value 
                // if there is item with the same key
                for (var prop1 in partial) {
                    if (!observableObject[prop1]) {
                        observableObject[prop1] = partial[prop1];
                    }
                }
            }

            // if there are new fields added, chances are it will not be present in the json,
            // even it is, it would be nice to add WebId for those that are still missing one
            if (bespoke.sph.domain[type]) {
                var ent = new bespoke.sph.domain[type](system.guid());
                for (var prop2 in ent) {
                    if (!observableObject[prop2]) {
                        observableObject[prop2] = ent[prop2];
                    }
                }
            }
            // addChildItemFunction
            observableObject.addChildItem = function (list, childType) {
                return function () {
                    if (typeof childType === "function") {
                        list.push(new childType(system.guid()));
                        return;
                    }
                    console.log("Whoaaaaa");
                };
            };

            observableObject.removeChildItem = function (list, obj) {
                return function () {
                    list.remove(obj);
                };
            };


            return observableObject;

        },
        clone = function (item) {
            var item2 = ko.mapping.toJS(item);
            return this.toObservable(item2);
        },
        commit = function (source, destination) {
            for (var gp in destination) {
                if (typeof destination[gp] === "function" && destination[gp].name === "observable") {
                    destination[gp](ko.unwrap(source[gp]));
                } else {
                    destination[gp] = source[gp];
                }
            }
        },
      updateOnlineStatus = function (event) {
          var condition = navigator.onLine ? "online" : "offline";
          logger.info("Event: " + event.type + "; Status: " + condition);
      };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);


    function send(json, url, verb) {
        var tcs = new $.Deferred();
        $.ajax({
            type: verb,
            data: json,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }

    function sendDelete(url) {

        var tcs = new $.Deferred();
        $.ajax({
            type: "DELETE",
            data: "{}",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }
    function post(json, url, headers) {


        var tcs = new $.Deferred();
        $.ajax({
            type: "POST",
            data: json,
            headers: headers,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }
    function patch(json, url, headers) {


        var tcs = new $.Deferred();
        $.ajax({
            type: "PATCH",
            data: json,
            headers: headers,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }
    function put(json, url, headers) {


        var tcs = new $.Deferred();
        $.ajax({
            type: "PUT",
            data: json,
            headers: headers,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }

    function get(url, cache, headers) {
        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: cache,
            headers: headers,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: tcs.resolve
        });

        return tcs.promise();
    }

    function loadOneAsync(entity, query) {
        var tcs = new $.Deferred();
        loadAsync(entity, query)
            .fail(function () {
                tcs.reject();
            })
            .done(function (lo) {
                if (lo.itemCollection.length) {
                    var item = lo.itemCollection[0];
                    tcs.resolve(item);
                } else {
                    tcs.resolve(null);
                }
            });

        return tcs.promise();
    }

    function loadAsync(entityOrOptions, query) {

        if (!entityOrOptions) throw "This cannot be happending, you have to have entity or option";
        var entity = entityOrOptions,
            includeTotal = false,
            size = 10,
            page = 1,
            orderby = null;
        if (typeof entityOrOptions === "object") {
            entity = entityOrOptions.entity;
            includeTotal = entityOrOptions.includeTotal || false;
            page = entityOrOptions.page || 1;
            size = entityOrOptions.size || 10;
            orderby = entityOrOptions.orderby || entityOrOptions.sort;
        }

        var url = "/api/systems/" + encodeURIComponent(entity);
        url += "/?filter=" + encodeURIComponent(query || "");
        url += "&page=" + page;
        url += "&includeTotal=" + includeTotal;
        url += "&size=" + size;
        if (orderby) {
            url += "&$orderby=" + orderby;
        }

        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {
                var rows = _(msg.results).map(function (v) {
                    return toObservable(v);
                });
                var lo = new LoadOperation();
                lo.itemCollection = rows;
                lo.page = msg.page;
                lo.nextPageToken = msg.nextPageToken;
                lo.previousPageToken = msg.previousPageToken;
                lo.size = msg.size;
                lo.rows = msg.rows;

                tcs.resolve(lo);
            }
        });


        return tcs.promise();

    }

    function searchAsync(entityOrOptions, query) {

        if (!entityOrOptions) throw "This cannot be happening, you have to have entity or option";

        var entity = entityOrOptions,
           size = 10,
           page = 1;

        if (typeof entityOrOptions === "object") {
            entity = entityOrOptions.entity;
            page = entityOrOptions.page || 1;
            size = entityOrOptions.size || 10;
        }

        var url = "/search/" + entity.toLowerCase() + "/";
        //NOTE: for workflows
        if (entity.indexOf("_") > 0) {
            url = entity.toLowerCase() + "/search/";
        }
        query.from = (page - 1) * size;
        query.size = size;

        var tcs = new $.Deferred();
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(query),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {

                var hits = _(msg.hits.hits).chain()
                    .map(function (h) {
                        return h._source;
                    })
                .value();

                var lo = new LoadOperation();
                lo.itemCollection = hits;
                lo.page = page;
                lo.size = size;
                lo.rows = msg.hits.total;
                lo.facets = msg.facets;
                lo.aggregations = msg.aggregations;

                tcs.resolve(lo);
            }
        });


        return tcs.promise();
    }

    function getTuplesAsync(entityOrOptions, query, field, field2, field3, field4) {

        var entity = entityOrOptions;
        if (entityOrOptions && typeof entityOrOptions === "object") {
            entity = entityOrOptions.entity;
            query = entityOrOptions.query;
            field = entityOrOptions.field;
            field2 = entityOrOptions.field2;
        }

        var url = "/api/list/tuple?";
        if (query) {
            url += "filter=" + encodeURIComponent(query) + "&";
        }
        url += "column=";
        url += encodeURIComponent(field);
        url += "&column2=";
        url += encodeURIComponent(field2);
        if (field3) {
            url += "&column3=" + encodeURIComponent(field3);
        }
        if (field4) {
            url += "&column4=" + encodeURIComponent(field4);
        }
        url += "&table=" + encodeURIComponent(entity);

        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {
                tcs.resolve(msg);
            }
        });


        return tcs.promise();

    }

    function getListAsync(entity, query, field) {
        var url = "/api/list/?";
        if (query) {
            url += "filter=" + encodeURIComponent(query) + "&";
        }
        url += "column=";
        url += encodeURIComponent(field);
        url += "&table=" + encodeURIComponent(entity);

        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {
                tcs.resolve(msg);
            }
        });


        return tcs.promise();


    }
    function getDistinctAsync(entity, query, field) {
        var url = "/api/list/distinct";
        url += "?filter=";
        url += encodeURIComponent(query);
        url += "&column=";
        url += encodeURIComponent(field);
        url += "&table=" + encodeURIComponent(entity);

        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {
                tcs.resolve(msg);
            }
        });


        return tcs.promise();

    }

    function getAggregateAsync(aggregate, entity, query, field) {
        var url = "/aggregate/" + aggregate;
        url += "/?filter=";
        url += encodeURIComponent(query);
        url += "&column=";
        url += encodeURIComponent(field);
        url += "&table=" + encodeURIComponent(entity);

        var tcs = new $.Deferred();
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: tcs.reject,
            success: function (msg) {
                if (aggregate === "scalar") {
                    tcs.resolve(msg);
                } else {
                    tcs.resolve(parseFloat(msg));
                }
            }
        });


        return tcs.promise();

    }


    function getScalarAsync(entity, query, field) {
        return getAggregateAsync("scalar", entity, query, field);
    }
    function getMaxAsync(entity, query, field) {
        return getAggregateAsync("max", entity, query, field);
    }
    function getMinAsync(entity, query, field) {
        return getAggregateAsync("min", entity, query, field);
    }
    function getSumAsync(entity, query, field) {
        return getAggregateAsync("sum", entity, query, field);
    }
    function getCountAsync(entity, query, field) {
        return getAggregateAsync("count", entity, query, field);
    }


    // ReSharper disable InconsistentNaming
    function LoadOperation() {
        // ReSharper restore InconsistentNaming
        var self = this;
        self.hasNextPage = false;
        self.itemCollection = [];
        self.page = 1;
        self.size = 40;
        self.rows = null;
        self.nextPageToken = "";
        self.previousPageToken = "";
    }


    return {
        searchAsync: searchAsync,
        loadAsync: loadAsync,
        loadOneAsync: loadOneAsync,
        getScalarAsync: getScalarAsync,
        getMaxAsync: getMaxAsync,
        getMinAsync: getMinAsync,
        getSumAsync: getSumAsync,
        getCountAsync: getCountAsync,
        getListAsync: getListAsync,
        getDistinctAsync: getDistinctAsync,
        getTuplesAsync: getTuplesAsync,
        sendDelete: sendDelete,
        patch: patch,
        post: post,
        put: put,
        send: send,
        get: get,
        clone: clone,
        commit: commit,
        toObservable: toObservable
    };
});
/// <reference path="../../Scripts/jquery-2.0.3.intellisense.js" />
/// <reference path="../../Scripts/knockout-2.3.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../services/domain.g.js" />

define('services/jsonimportexport', [],
    function () {

        var
            exportJson = function (filename, text) {

                var tcs = new $.Deferred();
                function download() {
                    var pom = document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                    tcs.resolve(true);
                }

                download(filename, text);
                return tcs.promise();

            },

         importJson = function () {

             var tcs = new $.Deferred();

             function handleFileSelect(evt) {
                 var files = evt.target.files;
                 for (var i = 0, f; f = files[i]; i++) {
                     var reader = new FileReader();

                     reader.onload = (function () {
                         return function (e) {
                             tcs.resolve(e.target.result);
                         };
                     })(f);

                     reader.readAsText(f);
                 }
             }

             var upload = function () {
                 var pom = document.createElement('input');
                 pom.setAttribute('type', 'file');
                 pom.setAttribute('id', 'files');
                 pom.setAttribute('name', 'files[]');
                 pom.addEventListener('change', handleFileSelect, false);
                 pom.click();
             };

             upload();


             return tcs.promise();
         };

        var vm = {
            importJson: importJson,
            exportJson: exportJson
        };

        return vm;

    });

/// <reference path="../../Scripts/jquery-2.1.0.intellisense.js" />
/// <reference path="../../Scripts/knockout-3.1.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../schemas/form.designer.g.js" />
/// <reference path="../../Scripts/bootstrap.js" />


define('services/validation', [],
    function () {

        var m_form, m_template,
            validationOptions = ko.observable,
            init = function (form, template) {
                m_form = form;
                m_template = template;

                var validation = { ignore: "*:not([name])", debug: true, rules: {}, messages: {} };
                _(template.FormDesign().FormElementCollection()).each(function (f) {
                    var path = f.Path(),
                        v = ko.unwrap(f.FieldValidation);
                    if (!v) {
                        return;
                    }
                    if (v.Mode() === "digit") {
                        v.Mode("digits");
                    }

                    validation.rules[path] = { required: v.IsRequired() };
                    if (v.Message()) {
                        validation.messages[path] = v.Message();
                    }

                    if (v.MaxLength()) {
                        validation.rules[path].maxlength = v.MaxLength();
                    }
                    if (v.MinLength()) {
                        validation.rules[path].minlength = v.MinLength();
                    }
                    if (v.Max()) {
                        validation.rules[path].max = v.Max();
                    }
                    if (v.Min()) {
                        validation.rules[path].min = v.Min();
                    }
                    if (v.Mode()) {
                        validation.rules[path][v.Mode()] = true;
                    }

                    // TODO : for ListView which contains child FormElementCollection
                    //#1812
                    if (typeof f.ListViewColumnCollection === "function") {
                        var cols = ko.unwrap(f.ListViewColumnCollection);
                        _(cols).each(function (c) {
                            console.log(typeof ko.unwrap(c.Input));
                        });
                    }


                });
                validationOptions(validation);
                m_form.validate(validation);
            };

        var vm = {
            init: init,
            valid: function () {

                if (typeof m_form[0].checkValidity === "function") {
                    return m_form.valid() && m_form[0].checkValidity();
                }

                return m_form.valid();
            },
            validationOptions: validationOptions
        };

        return vm;

    });

/// <reference path="../../Scripts/jquery-2.0.3.intellisense.js" />
/// <reference path="../../Scripts/knockout-2.3.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../services/domain.g.js" />
/// <reference path="../../Scripts/bootstrap.js" />


define('services/watcher', ['services/datacontext', 'services/logger', objectbuilders.config],
    function (context, logger, config) {

        var watch = function (entity, id) {
            var tcs = new $.Deferred(),
                data = JSON.stringify({ id: id, entity: entity });

            context.post(data, "/Sph/Watch/Register")
                .then(function (result) {
                    tcs.resolve(result);
                    logger.log("Your watch has been registered", data, "watcher", true);
                });
            return tcs.promise();
        },
            unwatch = function (entity, id) {
                var tcs = new $.Deferred(),
                    data = JSON.stringify({ id: id, entity: entity });

                context.post(data, "/Sph/Watch/Deregister")
                    .then(function (result) {
                        tcs.resolve(result);
                        logger.log("Your watch has been de-registered", data, "watcher", true);
                    });
                return tcs.promise();
            },
            getIsWatchingAsync = function (entity, id) {
                var tcs = new $.Deferred(),
                    query = String.format("EntityName eq '{0}' and EntityId eq '{1}' and User eq '{2}'", entity, id, config.userName);

                context.loadOneAsync("Watcher", query)
                   .done(function (w) {
                       tcs.resolve(null !== w);
                   });
                return tcs.promise();
            };

        var vm = {
            watch: watch,
            unwatch: unwatch,
            getIsWatchingAsync: getIsWatchingAsync
        };

        return vm;

    });

define(function () {
    var guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var system = {
        guid: guid
    };
    return system;
});