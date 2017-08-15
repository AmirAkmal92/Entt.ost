/*! jQuery UI - v1.11.2 - 2015-01-25
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, draggable.js, droppable.js, resizable.js, selectable.js, sortable.js, accordion.js, autocomplete.js, button.js, datepicker.js, dialog.js, menu.js, progressbar.js, selectmenu.js, slider.js, spinner.js, tabs.js, tooltip.js, effect.js, effect-blind.js, effect-bounce.js, effect-clip.js, effect-drop.js, effect-explode.js, effect-fade.js, effect-fold.js, effect-highlight.js, effect-puff.js, effect-pulsate.js, effect-scale.js, effect-shake.js, effect-size.js, effect-slide.js, effect-transfer.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : e(jQuery) })(function (e) {
    function t(t, s) { var n, a, o, r = t.nodeName.toLowerCase(); return "area" === r ? (n = t.parentNode, a = n.name, t.href && a && "map" === n.nodeName.toLowerCase() ? (o = e("img[usemap='#" + a + "']")[0], !!o && i(o)) : !1) : (/input|select|textarea|button|object/.test(r) ? !t.disabled : "a" === r ? t.href || s : s) && i(t) } function i(t) { return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function () { return "hidden" === e.css(this, "visibility") }).length } function s(e) { for (var t, i; e.length && e[0] !== document;) { if (t = e.css("position"), ("absolute" === t || "relative" === t || "fixed" === t) && (i = parseInt(e.css("zIndex"), 10), !isNaN(i) && 0 !== i)) return i; e = e.parent() } return 0 } function n() { this._curInst = null, this._keyEvent = !1, this._disabledInputs = [], this._datepickerShowing = !1, this._inDialog = !1, this._mainDivId = "ui-datepicker-div", this._inlineClass = "ui-datepicker-inline", this._appendClass = "ui-datepicker-append", this._triggerClass = "ui-datepicker-trigger", this._dialogClass = "ui-datepicker-dialog", this._disableClass = "ui-datepicker-disabled", this._unselectableClass = "ui-datepicker-unselectable", this._currentClass = "ui-datepicker-current-day", this._dayOverClass = "ui-datepicker-days-cell-over", this.regional = [], this.regional[""] = { closeText: "Done", prevText: "Prev", nextText: "Next", currentText: "Today", monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], weekHeader: "Wk", dateFormat: "mm/dd/yy", firstDay: 0, isRTL: !1, showMonthAfterYear: !1, yearSuffix: "" }, this._defaults = { showOn: "focus", showAnim: "fadeIn", showOptions: {}, defaultDate: null, appendText: "", buttonText: "...", buttonImage: "", buttonImageOnly: !1, hideIfNoPrevNext: !1, navigationAsDateFormat: !1, gotoCurrent: !1, changeMonth: !1, changeYear: !1, yearRange: "c-10:c+10", showOtherMonths: !1, selectOtherMonths: !1, showWeek: !1, calculateWeek: this.iso8601Week, shortYearCutoff: "+10", minDate: null, maxDate: null, duration: "fast", beforeShowDay: null, beforeShow: null, onSelect: null, onChangeMonthYear: null, onClose: null, numberOfMonths: 1, showCurrentAtPos: 0, stepMonths: 1, stepBigMonths: 12, altField: "", altFormat: "", constrainInput: !0, showButtonPanel: !1, autoSize: !1, disabled: !1 }, e.extend(this._defaults, this.regional[""]), this.regional.en = e.extend(!0, {}, this.regional[""]), this.regional["en-US"] = e.extend(!0, {}, this.regional.en), this.dpDiv = a(e("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) } function a(t) { var i = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a"; return t.delegate(i, "mouseout", function () { e(this).removeClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && e(this).removeClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && e(this).removeClass("ui-datepicker-next-hover") }).delegate(i, "mouseover", o) } function o() { e.datepicker._isDisabledDatepicker(v.inline ? v.dpDiv.parent()[0] : v.input[0]) || (e(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"), e(this).addClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && e(this).addClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && e(this).addClass("ui-datepicker-next-hover")) } function r(t, i) { e.extend(t, i); for (var s in i) null == i[s] && (t[s] = i[s]); return t } function h(e) { return function () { var t = this.element.val(); e.apply(this, arguments), this._refresh(), t !== this.element.val() && this._trigger("change") } } e.ui = e.ui || {}, e.extend(e.ui, { version: "1.11.2", keyCode: { BACKSPACE: 8, COMMA: 188, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, LEFT: 37, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SPACE: 32, TAB: 9, UP: 38 } }), e.fn.extend({ scrollParent: function (t) { var i = this.css("position"), s = "absolute" === i, n = t ? /(auto|scroll|hidden)/ : /(auto|scroll)/, a = this.parents().filter(function () { var t = e(this); return s && "static" === t.css("position") ? !1 : n.test(t.css("overflow") + t.css("overflow-y") + t.css("overflow-x")) }).eq(0); return "fixed" !== i && a.length ? a : e(this[0].ownerDocument || document) }, uniqueId: function () { var e = 0; return function () { return this.each(function () { this.id || (this.id = "ui-id-" + ++e) }) } }(), removeUniqueId: function () { return this.each(function () { /^ui-id-\d+$/.test(this.id) && e(this).removeAttr("id") }) } }), e.extend(e.expr[":"], { data: e.expr.createPseudo ? e.expr.createPseudo(function (t) { return function (i) { return !!e.data(i, t) } }) : function (t, i, s) { return !!e.data(t, s[3]) }, focusable: function (i) { return t(i, !isNaN(e.attr(i, "tabindex"))) }, tabbable: function (i) { var s = e.attr(i, "tabindex"), n = isNaN(s); return (n || s >= 0) && t(i, !n) } }), e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function (t, i) { function s(t, i, s, a) { return e.each(n, function () { i -= parseFloat(e.css(t, "padding" + this)) || 0, s && (i -= parseFloat(e.css(t, "border" + this + "Width")) || 0), a && (i -= parseFloat(e.css(t, "margin" + this)) || 0) }), i } var n = "Width" === i ? ["Left", "Right"] : ["Top", "Bottom"], a = i.toLowerCase(), o = { innerWidth: e.fn.innerWidth, innerHeight: e.fn.innerHeight, outerWidth: e.fn.outerWidth, outerHeight: e.fn.outerHeight }; e.fn["inner" + i] = function (t) { return void 0 === t ? o["inner" + i].call(this) : this.each(function () { e(this).css(a, s(this, t) + "px") }) }, e.fn["outer" + i] = function (t, n) { return "number" != typeof t ? o["outer" + i].call(this, t) : this.each(function () { e(this).css(a, s(this, t, !0, n) + "px") }) } }), e.fn.addBack || (e.fn.addBack = function (e) { return this.add(null == e ? this.prevObject : this.prevObject.filter(e)) }), e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function (t) { return function (i) { return arguments.length ? t.call(this, e.camelCase(i)) : t.call(this) } }(e.fn.removeData)), e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), e.fn.extend({ focus: function (t) { return function (i, s) { return "number" == typeof i ? this.each(function () { var t = this; setTimeout(function () { e(t).focus(), s && s.call(t) }, i) }) : t.apply(this, arguments) } }(e.fn.focus), disableSelection: function () { var e = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown"; return function () { return this.bind(e + ".ui-disableSelection", function (e) { e.preventDefault() }) } }(), enableSelection: function () { return this.unbind(".ui-disableSelection") }, zIndex: function (t) { if (void 0 !== t) return this.css("zIndex", t); if (this.length) for (var i, s, n = e(this[0]) ; n.length && n[0] !== document;) { if (i = n.css("position"), ("absolute" === i || "relative" === i || "fixed" === i) && (s = parseInt(n.css("zIndex"), 10), !isNaN(s) && 0 !== s)) return s; n = n.parent() } return 0 } }), e.ui.plugin = { add: function (t, i, s) { var n, a = e.ui[t].prototype; for (n in s) a.plugins[n] = a.plugins[n] || [], a.plugins[n].push([i, s[n]]) }, call: function (e, t, i, s) { var n, a = e.plugins[t]; if (a && (s || e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType)) for (n = 0; a.length > n; n++) e.options[a[n][0]] && a[n][1].apply(e.element, i) } }; var l = 0, u = Array.prototype.slice; e.cleanData = function (t) { return function (i) { var s, n, a; for (a = 0; null != (n = i[a]) ; a++) try { s = e._data(n, "events"), s && s.remove && e(n).triggerHandler("remove") } catch (o) { } t(i) } }(e.cleanData), e.widget = function (t, i, s) { var n, a, o, r, h = {}, l = t.split(".")[0]; return t = t.split(".")[1], n = l + "-" + t, s || (s = i, i = e.Widget), e.expr[":"][n.toLowerCase()] = function (t) { return !!e.data(t, n) }, e[l] = e[l] || {}, a = e[l][t], o = e[l][t] = function (e, t) { return this._createWidget ? (arguments.length && this._createWidget(e, t), void 0) : new o(e, t) }, e.extend(o, a, { version: s.version, _proto: e.extend({}, s), _childConstructors: [] }), r = new i, r.options = e.widget.extend({}, r.options), e.each(s, function (t, s) { return e.isFunction(s) ? (h[t] = function () { var e = function () { return i.prototype[t].apply(this, arguments) }, n = function (e) { return i.prototype[t].apply(this, e) }; return function () { var t, i = this._super, a = this._superApply; return this._super = e, this._superApply = n, t = s.apply(this, arguments), this._super = i, this._superApply = a, t } }(), void 0) : (h[t] = s, void 0) }), o.prototype = e.widget.extend(r, { widgetEventPrefix: a ? r.widgetEventPrefix || t : t }, h, { constructor: o, namespace: l, widgetName: t, widgetFullName: n }), a ? (e.each(a._childConstructors, function (t, i) { var s = i.prototype; e.widget(s.namespace + "." + s.widgetName, o, i._proto) }), delete a._childConstructors) : i._childConstructors.push(o), e.widget.bridge(t, o), o }, e.widget.extend = function (t) { for (var i, s, n = u.call(arguments, 1), a = 0, o = n.length; o > a; a++) for (i in n[a]) s = n[a][i], n[a].hasOwnProperty(i) && void 0 !== s && (t[i] = e.isPlainObject(s) ? e.isPlainObject(t[i]) ? e.widget.extend({}, t[i], s) : e.widget.extend({}, s) : s); return t }, e.widget.bridge = function (t, i) { var s = i.prototype.widgetFullName || t; e.fn[t] = function (n) { var a = "string" == typeof n, o = u.call(arguments, 1), r = this; return n = !a && o.length ? e.widget.extend.apply(null, [n].concat(o)) : n, a ? this.each(function () { var i, a = e.data(this, s); return "instance" === n ? (r = a, !1) : a ? e.isFunction(a[n]) && "_" !== n.charAt(0) ? (i = a[n].apply(a, o), i !== a && void 0 !== i ? (r = i && i.jquery ? r.pushStack(i.get()) : i, !1) : void 0) : e.error("no such method '" + n + "' for " + t + " widget instance") : e.error("cannot call methods on " + t + " prior to initialization; " + "attempted to call method '" + n + "'") }) : this.each(function () { var t = e.data(this, s); t ? (t.option(n || {}), t._init && t._init()) : e.data(this, s, new i(n, this)) }), r } }, e.Widget = function () { }, e.Widget._childConstructors = [], e.Widget.prototype = { widgetName: "widget", widgetEventPrefix: "", defaultElement: "<div>", options: { disabled: !1, create: null }, _createWidget: function (t, i) { i = e(i || this.defaultElement || this)[0], this.element = e(i), this.uuid = l++, this.eventNamespace = "." + this.widgetName + this.uuid, this.bindings = e(), this.hoverable = e(), this.focusable = e(), i !== this && (e.data(i, this.widgetFullName, this), this._on(!0, this.element, { remove: function (e) { e.target === i && this.destroy() } }), this.document = e(i.style ? i.ownerDocument : i.document || i), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)), this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t), this._create(), this._trigger("create", null, this._getCreateEventData()), this._init() }, _getCreateOptions: e.noop, _getCreateEventData: e.noop, _create: e.noop, _init: e.noop, destroy: function () { this._destroy(), this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)), this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"), this.bindings.unbind(this.eventNamespace), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus") }, _destroy: e.noop, widget: function () { return this.element }, option: function (t, i) { var s, n, a, o = t; if (0 === arguments.length) return e.widget.extend({}, this.options); if ("string" == typeof t) if (o = {}, s = t.split("."), t = s.shift(), s.length) { for (n = o[t] = e.widget.extend({}, this.options[t]), a = 0; s.length - 1 > a; a++) n[s[a]] = n[s[a]] || {}, n = n[s[a]]; if (t = s.pop(), 1 === arguments.length) return void 0 === n[t] ? null : n[t]; n[t] = i } else { if (1 === arguments.length) return void 0 === this.options[t] ? null : this.options[t]; o[t] = i } return this._setOptions(o), this }, _setOptions: function (e) { var t; for (t in e) this._setOption(t, e[t]); return this }, _setOption: function (e, t) { return this.options[e] = t, "disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled", !!t), t && (this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus"))), this }, enable: function () { return this._setOptions({ disabled: !1 }) }, disable: function () { return this._setOptions({ disabled: !0 }) }, _on: function (t, i, s) { var n, a = this; "boolean" != typeof t && (s = i, i = t, t = !1), s ? (i = n = e(i), this.bindings = this.bindings.add(i)) : (s = i, i = this.element, n = this.widget()), e.each(s, function (s, o) { function r() { return t || a.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof o ? a[o] : o).apply(a, arguments) : void 0 } "string" != typeof o && (r.guid = o.guid = o.guid || r.guid || e.guid++); var h = s.match(/^([\w:-]*)\s*(.*)$/), l = h[1] + a.eventNamespace, u = h[2]; u ? n.delegate(u, l, r) : i.bind(l, r) }) }, _off: function (t, i) { i = (i || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, t.unbind(i).undelegate(i), this.bindings = e(this.bindings.not(t).get()), this.focusable = e(this.focusable.not(t).get()), this.hoverable = e(this.hoverable.not(t).get()) }, _delay: function (e, t) { function i() { return ("string" == typeof e ? s[e] : e).apply(s, arguments) } var s = this; return setTimeout(i, t || 0) }, _hoverable: function (t) { this.hoverable = this.hoverable.add(t), this._on(t, { mouseenter: function (t) { e(t.currentTarget).addClass("ui-state-hover") }, mouseleave: function (t) { e(t.currentTarget).removeClass("ui-state-hover") } }) }, _focusable: function (t) { this.focusable = this.focusable.add(t), this._on(t, { focusin: function (t) { e(t.currentTarget).addClass("ui-state-focus") }, focusout: function (t) { e(t.currentTarget).removeClass("ui-state-focus") } }) }, _trigger: function (t, i, s) { var n, a, o = this.options[t]; if (s = s || {}, i = e.Event(i), i.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), i.target = this.element[0], a = i.originalEvent) for (n in a) n in i || (i[n] = a[n]); return this.element.trigger(i, s), !(e.isFunction(o) && o.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented()) } }, e.each({ show: "fadeIn", hide: "fadeOut" }, function (t, i) { e.Widget.prototype["_" + t] = function (s, n, a) { "string" == typeof n && (n = { effect: n }); var o, r = n ? n === !0 || "number" == typeof n ? i : n.effect || i : t; n = n || {}, "number" == typeof n && (n = { duration: n }), o = !e.isEmptyObject(n), n.complete = a, n.delay && s.delay(n.delay), o && e.effects && e.effects.effect[r] ? s[t](n) : r !== t && s[r] ? s[r](n.duration, n.easing, a) : s.queue(function (i) { e(this)[t](), a && a.call(s[0]), i() }) } }), e.widget; var d = !1; e(document).mouseup(function () { d = !1 }), e.widget("ui.mouse", { version: "1.11.2", options: { cancel: "input,textarea,button,select,option", distance: 1, delay: 0 }, _mouseInit: function () { var t = this; this.element.bind("mousedown." + this.widgetName, function (e) { return t._mouseDown(e) }).bind("click." + this.widgetName, function (i) { return !0 === e.data(i.target, t.widgetName + ".preventClickEvent") ? (e.removeData(i.target, t.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : void 0 }), this.started = !1 }, _mouseDestroy: function () { this.element.unbind("." + this.widgetName), this._mouseMoveDelegate && this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate) }, _mouseDown: function (t) { if (!d) { this._mouseMoved = !1, this._mouseStarted && this._mouseUp(t), this._mouseDownEvent = t; var i = this, s = 1 === t.which, n = "string" == typeof this.options.cancel && t.target.nodeName ? e(t.target).closest(this.options.cancel).length : !1; return s && !n && this._mouseCapture(t) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () { i.mouseDelayMet = !0 }, this.options.delay)), this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(t) !== !1, !this._mouseStarted) ? (t.preventDefault(), !0) : (!0 === e.data(t.target, this.widgetName + ".preventClickEvent") && e.removeData(t.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (e) { return i._mouseMove(e) }, this._mouseUpDelegate = function (e) { return i._mouseUp(e) }, this.document.bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), t.preventDefault(), d = !0, !0)) : !0 } }, _mouseMove: function (t) { if (this._mouseMoved) { if (e.ui.ie && (!document.documentMode || 9 > document.documentMode) && !t.button) return this._mouseUp(t); if (!t.which) return this._mouseUp(t) } return (t.which || t.button) && (this._mouseMoved = !0), this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, t) !== !1, this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted) }, _mouseUp: function (t) { return this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && e.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)), d = !1, !1 }, _mouseDistanceMet: function (e) { return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.options.distance }, _mouseDelayMet: function () { return this.mouseDelayMet }, _mouseStart: function () { }, _mouseDrag: function () { }, _mouseStop: function () { }, _mouseCapture: function () { return !0 } }), function () { function t(e, t, i) { return [parseFloat(e[0]) * (p.test(e[0]) ? t / 100 : 1), parseFloat(e[1]) * (p.test(e[1]) ? i / 100 : 1)] } function i(t, i) { return parseInt(e.css(t, i), 10) || 0 } function s(t) { var i = t[0]; return 9 === i.nodeType ? { width: t.width(), height: t.height(), offset: { top: 0, left: 0 } } : e.isWindow(i) ? { width: t.width(), height: t.height(), offset: { top: t.scrollTop(), left: t.scrollLeft() } } : i.preventDefault ? { width: 0, height: 0, offset: { top: i.pageY, left: i.pageX } } : { width: t.outerWidth(), height: t.outerHeight(), offset: t.offset() } } e.ui = e.ui || {}; var n, a, o = Math.max, r = Math.abs, h = Math.round, l = /left|center|right/, u = /top|center|bottom/, d = /[\+\-]\d+(\.[\d]+)?%?/, c = /^\w+/, p = /%$/, f = e.fn.position; e.position = { scrollbarWidth: function () { if (void 0 !== n) return n; var t, i, s = e("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"), a = s.children()[0]; return e("body").append(s), t = a.offsetWidth, s.css("overflow", "scroll"), i = a.offsetWidth, t === i && (i = s[0].clientWidth), s.remove(), n = t - i }, getScrollInfo: function (t) { var i = t.isWindow || t.isDocument ? "" : t.element.css("overflow-x"), s = t.isWindow || t.isDocument ? "" : t.element.css("overflow-y"), n = "scroll" === i || "auto" === i && t.width < t.element[0].scrollWidth, a = "scroll" === s || "auto" === s && t.height < t.element[0].scrollHeight; return { width: a ? e.position.scrollbarWidth() : 0, height: n ? e.position.scrollbarWidth() : 0 } }, getWithinInfo: function (t) { var i = e(t || window), s = e.isWindow(i[0]), n = !!i[0] && 9 === i[0].nodeType; return { element: i, isWindow: s, isDocument: n, offset: i.offset() || { left: 0, top: 0 }, scrollLeft: i.scrollLeft(), scrollTop: i.scrollTop(), width: s || n ? i.width() : i.outerWidth(), height: s || n ? i.height() : i.outerHeight() } } }, e.fn.position = function (n) { if (!n || !n.of) return f.apply(this, arguments); n = e.extend({}, n); var p, m, g, v, y, b, _ = e(n.of), x = e.position.getWithinInfo(n.within), w = e.position.getScrollInfo(x), k = (n.collision || "flip").split(" "), T = {}; return b = s(_), _[0].preventDefault && (n.at = "left top"), m = b.width, g = b.height, v = b.offset, y = e.extend({}, v), e.each(["my", "at"], function () { var e, t, i = (n[this] || "").split(" "); 1 === i.length && (i = l.test(i[0]) ? i.concat(["center"]) : u.test(i[0]) ? ["center"].concat(i) : ["center", "center"]), i[0] = l.test(i[0]) ? i[0] : "center", i[1] = u.test(i[1]) ? i[1] : "center", e = d.exec(i[0]), t = d.exec(i[1]), T[this] = [e ? e[0] : 0, t ? t[0] : 0], n[this] = [c.exec(i[0])[0], c.exec(i[1])[0]] }), 1 === k.length && (k[1] = k[0]), "right" === n.at[0] ? y.left += m : "center" === n.at[0] && (y.left += m / 2), "bottom" === n.at[1] ? y.top += g : "center" === n.at[1] && (y.top += g / 2), p = t(T.at, m, g), y.left += p[0], y.top += p[1], this.each(function () { var s, l, u = e(this), d = u.outerWidth(), c = u.outerHeight(), f = i(this, "marginLeft"), b = i(this, "marginTop"), D = d + f + i(this, "marginRight") + w.width, S = c + b + i(this, "marginBottom") + w.height, M = e.extend({}, y), C = t(T.my, u.outerWidth(), u.outerHeight()); "right" === n.my[0] ? M.left -= d : "center" === n.my[0] && (M.left -= d / 2), "bottom" === n.my[1] ? M.top -= c : "center" === n.my[1] && (M.top -= c / 2), M.left += C[0], M.top += C[1], a || (M.left = h(M.left), M.top = h(M.top)), s = { marginLeft: f, marginTop: b }, e.each(["left", "top"], function (t, i) { e.ui.position[k[t]] && e.ui.position[k[t]][i](M, { targetWidth: m, targetHeight: g, elemWidth: d, elemHeight: c, collisionPosition: s, collisionWidth: D, collisionHeight: S, offset: [p[0] + C[0], p[1] + C[1]], my: n.my, at: n.at, within: x, elem: u }) }), n.using && (l = function (e) { var t = v.left - M.left, i = t + m - d, s = v.top - M.top, a = s + g - c, h = { target: { element: _, left: v.left, top: v.top, width: m, height: g }, element: { element: u, left: M.left, top: M.top, width: d, height: c }, horizontal: 0 > i ? "left" : t > 0 ? "right" : "center", vertical: 0 > a ? "top" : s > 0 ? "bottom" : "middle" }; d > m && m > r(t + i) && (h.horizontal = "center"), c > g && g > r(s + a) && (h.vertical = "middle"), h.important = o(r(t), r(i)) > o(r(s), r(a)) ? "horizontal" : "vertical", n.using.call(this, e, h) }), u.offset(e.extend(M, { using: l })) }) }, e.ui.position = { fit: { left: function (e, t) { var i, s = t.within, n = s.isWindow ? s.scrollLeft : s.offset.left, a = s.width, r = e.left - t.collisionPosition.marginLeft, h = n - r, l = r + t.collisionWidth - a - n; t.collisionWidth > a ? h > 0 && 0 >= l ? (i = e.left + h + t.collisionWidth - a - n, e.left += h - i) : e.left = l > 0 && 0 >= h ? n : h > l ? n + a - t.collisionWidth : n : h > 0 ? e.left += h : l > 0 ? e.left -= l : e.left = o(e.left - r, e.left) }, top: function (e, t) { var i, s = t.within, n = s.isWindow ? s.scrollTop : s.offset.top, a = t.within.height, r = e.top - t.collisionPosition.marginTop, h = n - r, l = r + t.collisionHeight - a - n; t.collisionHeight > a ? h > 0 && 0 >= l ? (i = e.top + h + t.collisionHeight - a - n, e.top += h - i) : e.top = l > 0 && 0 >= h ? n : h > l ? n + a - t.collisionHeight : n : h > 0 ? e.top += h : l > 0 ? e.top -= l : e.top = o(e.top - r, e.top) } }, flip: { left: function (e, t) { var i, s, n = t.within, a = n.offset.left + n.scrollLeft, o = n.width, h = n.isWindow ? n.scrollLeft : n.offset.left, l = e.left - t.collisionPosition.marginLeft, u = l - h, d = l + t.collisionWidth - o - h, c = "left" === t.my[0] ? -t.elemWidth : "right" === t.my[0] ? t.elemWidth : 0, p = "left" === t.at[0] ? t.targetWidth : "right" === t.at[0] ? -t.targetWidth : 0, f = -2 * t.offset[0]; 0 > u ? (i = e.left + c + p + f + t.collisionWidth - o - a, (0 > i || r(u) > i) && (e.left += c + p + f)) : d > 0 && (s = e.left - t.collisionPosition.marginLeft + c + p + f - h, (s > 0 || d > r(s)) && (e.left += c + p + f)) }, top: function (e, t) { var i, s, n = t.within, a = n.offset.top + n.scrollTop, o = n.height, h = n.isWindow ? n.scrollTop : n.offset.top, l = e.top - t.collisionPosition.marginTop, u = l - h, d = l + t.collisionHeight - o - h, c = "top" === t.my[1], p = c ? -t.elemHeight : "bottom" === t.my[1] ? t.elemHeight : 0, f = "top" === t.at[1] ? t.targetHeight : "bottom" === t.at[1] ? -t.targetHeight : 0, m = -2 * t.offset[1]; 0 > u ? (s = e.top + p + f + m + t.collisionHeight - o - a, e.top + p + f + m > u && (0 > s || r(u) > s) && (e.top += p + f + m)) : d > 0 && (i = e.top - t.collisionPosition.marginTop + p + f + m - h, e.top + p + f + m > d && (i > 0 || d > r(i)) && (e.top += p + f + m)) } }, flipfit: { left: function () { e.ui.position.flip.left.apply(this, arguments), e.ui.position.fit.left.apply(this, arguments) }, top: function () { e.ui.position.flip.top.apply(this, arguments), e.ui.position.fit.top.apply(this, arguments) } } }, function () { var t, i, s, n, o, r = document.getElementsByTagName("body")[0], h = document.createElement("div"); t = document.createElement(r ? "div" : "body"), s = { visibility: "hidden", width: 0, height: 0, border: 0, margin: 0, background: "none" }, r && e.extend(s, { position: "absolute", left: "-1000px", top: "-1000px" }); for (o in s) t.style[o] = s[o]; t.appendChild(h), i = r || document.documentElement, i.insertBefore(t, i.firstChild), h.style.cssText = "position: absolute; left: 10.7432222px;", n = e(h).offset().left, a = n > 10 && 11 > n, t.innerHTML = "", i.removeChild(t) }() }(), e.ui.position, e.widget("ui.draggable", e.ui.mouse, {
        version: "1.11.2", widgetEventPrefix: "drag", options: { addClasses: !0, appendTo: "parent", axis: !1, connectToSortable: !1, containment: !1, cursor: "auto", cursorAt: !1, grid: !1, handle: !1, helper: "original", iframeFix: !1, opacity: !1, refreshPositions: !1, revert: !1, revertDuration: 500, scope: "default", scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, snap: !1, snapMode: "both", snapTolerance: 20, stack: !1, zIndex: !1, drag: null, start: null, stop: null }, _create: function () { "original" === this.options.helper && this._setPositionRelative(), this.options.addClasses && this.element.addClass("ui-draggable"), this.options.disabled && this.element.addClass("ui-draggable-disabled"), this._setHandleClassName(), this._mouseInit() }, _setOption: function (e, t) { this._super(e, t), "handle" === e && (this._removeHandleClassName(), this._setHandleClassName()) }, _destroy: function () { return (this.helper || this.element).is(".ui-draggable-dragging") ? (this.destroyOnClear = !0, void 0) : (this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"), this._removeHandleClassName(), this._mouseDestroy(), void 0) }, _mouseCapture: function (t) { var i = this.options; return this._blurActiveElement(t), this.helper || i.disabled || e(t.target).closest(".ui-resizable-handle").length > 0 ? !1 : (this.handle = this._getHandle(t), this.handle ? (this._blockFrames(i.iframeFix === !0 ? "iframe" : i.iframeFix), !0) : !1) }, _blockFrames: function (t) { this.iframeBlocks = this.document.find(t).map(function () { var t = e(this); return e("<div>").css("position", "absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0] }) }, _unblockFrames: function () { this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks) }, _blurActiveElement: function (t) { var i = this.document[0]; if (this.handleElement.is(t.target)) try { i.activeElement && "body" !== i.activeElement.nodeName.toLowerCase() && e(i.activeElement).blur() } catch (s) { } }, _mouseStart: function (t) { var i = this.options; return this.helper = this._createHelper(t), this.helper.addClass("ui-draggable-dragging"), this._cacheHelperProportions(), e.ui.ddmanager && (e.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(!0), this.offsetParent = this.helper.offsetParent(), this.hasFixedAncestor = this.helper.parents().filter(function () { return "fixed" === e(this).css("position") }).length > 0, this.positionAbs = this.element.offset(), this._refreshOffsets(t), this.originalPosition = this.position = this._generatePosition(t, !1), this.originalPageX = t.pageX, this.originalPageY = t.pageY, i.cursorAt && this._adjustOffsetFromHelper(i.cursorAt), this._setContainment(), this._trigger("start", t) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), e.ui.ddmanager && !i.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this._normalizeRightBottom(), this._mouseDrag(t, !0), e.ui.ddmanager && e.ui.ddmanager.dragStart(this, t), !0) }, _refreshOffsets: function (e) { this.offset = { top: this.positionAbs.top - this.margins.top, left: this.positionAbs.left - this.margins.left, scroll: !1, parent: this._getParentOffset(), relative: this._getRelativeOffset() }, this.offset.click = { left: e.pageX - this.offset.left, top: e.pageY - this.offset.top } }, _mouseDrag: function (t, i) { if (this.hasFixedAncestor && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(t, !0), this.positionAbs = this._convertPositionTo("absolute"), !i) { var s = this._uiHash(); if (this._trigger("drag", t, s) === !1) return this._mouseUp({}), !1; this.position = s.position } return this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", e.ui.ddmanager && e.ui.ddmanager.drag(this, t), !1 }, _mouseStop: function (t) { var i = this, s = !1; return e.ui.ddmanager && !this.options.dropBehaviour && (s = e.ui.ddmanager.drop(this, t)), this.dropped && (s = this.dropped, this.dropped = !1), "invalid" === this.options.revert && !s || "valid" === this.options.revert && s || this.options.revert === !0 || e.isFunction(this.options.revert) && this.options.revert.call(this.element, s) ? e(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () { i._trigger("stop", t) !== !1 && i._clear() }) : this._trigger("stop", t) !== !1 && this._clear(), !1 }, _mouseUp: function (t) { return this._unblockFrames(), e.ui.ddmanager && e.ui.ddmanager.dragStop(this, t), this.handleElement.is(t.target) && this.element.focus(), e.ui.mouse.prototype._mouseUp.call(this, t) }, cancel: function () { return this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear(), this }, _getHandle: function (t) { return this.options.handle ? !!e(t.target).closest(this.element.find(this.options.handle)).length : !0 }, _setHandleClassName: function () { this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element, this.handleElement.addClass("ui-draggable-handle") }, _removeHandleClassName: function () { this.handleElement.removeClass("ui-draggable-handle") }, _createHelper: function (t) { var i = this.options, s = e.isFunction(i.helper), n = s ? e(i.helper.apply(this.element[0], [t])) : "clone" === i.helper ? this.element.clone().removeAttr("id") : this.element; return n.parents("body").length || n.appendTo("parent" === i.appendTo ? this.element[0].parentNode : i.appendTo), s && n[0] === this.element[0] && this._setPositionRelative(), n[0] === this.element[0] || /(fixed|absolute)/.test(n.css("position")) || n.css("position", "absolute"), n }, _setPositionRelative: function () { /^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative") }, _adjustOffsetFromHelper: function (t) { "string" == typeof t && (t = t.split(" ")), e.isArray(t) && (t = { left: +t[0], top: +t[1] || 0 }), "left" in t && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top) }, _isRootNode: function (e) { return /(html|body)/i.test(e.tagName) || e === this.document[0] }, _getParentOffset: function () { var t = this.offsetParent.offset(), i = this.document[0]; return "absolute" === this.cssPosition && this.scrollParent[0] !== i && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), this._isRootNode(this.offsetParent[0]) && (t = { top: 0, left: 0 }), { top: t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) } }, _getRelativeOffset: function () { if ("relative" !== this.cssPosition) return { top: 0, left: 0 }; var e = this.element.position(), t = this._isRootNode(this.scrollParent[0]); return { top: e.top - (parseInt(this.helper.css("top"), 10) || 0) + (t ? 0 : this.scrollParent.scrollTop()), left: e.left - (parseInt(this.helper.css("left"), 10) || 0) + (t ? 0 : this.scrollParent.scrollLeft()) } }, _cacheMargins: function () { this.margins = { left: parseInt(this.element.css("marginLeft"), 10) || 0, top: parseInt(this.element.css("marginTop"), 10) || 0, right: parseInt(this.element.css("marginRight"), 10) || 0, bottom: parseInt(this.element.css("marginBottom"), 10) || 0 } }, _cacheHelperProportions: function () { this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() } }, _setContainment: function () { var t, i, s, n = this.options, a = this.document[0]; return this.relativeContainer = null, n.containment ? "window" === n.containment ? (this.containment = [e(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, e(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, e(window).scrollLeft() + e(window).width() - this.helperProportions.width - this.margins.left, e(window).scrollTop() + (e(window).height() || a.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : "document" === n.containment ? (this.containment = [0, 0, e(a).width() - this.helperProportions.width - this.margins.left, (e(a).height() || a.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : n.containment.constructor === Array ? (this.containment = n.containment, void 0) : ("parent" === n.containment && (n.containment = this.helper[0].parentNode), i = e(n.containment), s = i[0], s && (t = /(scroll|auto)/.test(i.css("overflow")), this.containment = [(parseInt(i.css("borderLeftWidth"), 10) || 0) + (parseInt(i.css("paddingLeft"), 10) || 0), (parseInt(i.css("borderTopWidth"), 10) || 0) + (parseInt(i.css("paddingTop"), 10) || 0), (t ? Math.max(s.scrollWidth, s.offsetWidth) : s.offsetWidth) - (parseInt(i.css("borderRightWidth"), 10) || 0) - (parseInt(i.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (t ? Math.max(s.scrollHeight, s.offsetHeight) : s.offsetHeight) - (parseInt(i.css("borderBottomWidth"), 10) || 0) - (parseInt(i.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relativeContainer = i), void 0) : (this.containment = null, void 0) }, _convertPositionTo: function (e, t) { t || (t = this.position); var i = "absolute" === e ? 1 : -1, s = this._isRootNode(this.scrollParent[0]); return { top: t.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : s ? 0 : this.offset.scroll.top) * i, left: t.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : s ? 0 : this.offset.scroll.left) * i } }, _generatePosition: function (e, t) {
            var i, s, n, a, o = this.options, r = this._isRootNode(this.scrollParent[0]), h = e.pageX, l = e.pageY; return r && this.offset.scroll || (this.offset.scroll = { top: this.scrollParent.scrollTop(), left: this.scrollParent.scrollLeft() }), t && (this.containment && (this.relativeContainer ? (s = this.relativeContainer.offset(), i = [this.containment[0] + s.left, this.containment[1] + s.top, this.containment[2] + s.left, this.containment[3] + s.top]) : i = this.containment, e.pageX - this.offset.click.left < i[0] && (h = i[0] + this.offset.click.left), e.pageY - this.offset.click.top < i[1] && (l = i[1] + this.offset.click.top), e.pageX - this.offset.click.left > i[2] && (h = i[2] + this.offset.click.left), e.pageY - this.offset.click.top > i[3] && (l = i[3] + this.offset.click.top)), o.grid && (n = o.grid[1] ? this.originalPageY + Math.round((l - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY, l = i ? n - this.offset.click.top >= i[1] || n - this.offset.click.top > i[3] ? n : n - this.offset.click.top >= i[1] ? n - o.grid[1] : n + o.grid[1] : n, a = o.grid[0] ? this.originalPageX + Math.round((h - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX, h = i ? a - this.offset.click.left >= i[0] || a - this.offset.click.left > i[2] ? a : a - this.offset.click.left >= i[0] ? a - o.grid[0] : a + o.grid[0] : a), "y" === o.axis && (h = this.originalPageX), "x" === o.axis && (l = this.originalPageY)), { top: l - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : r ? 0 : this.offset.scroll.top), left: h - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : r ? 0 : this.offset.scroll.left) }
        }, _clear: function () { this.helper.removeClass("ui-draggable-dragging"), this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1, this.destroyOnClear && this.destroy() }, _normalizeRightBottom: function () { "y" !== this.options.axis && "auto" !== this.helper.css("right") && (this.helper.width(this.helper.width()), this.helper.css("right", "auto")), "x" !== this.options.axis && "auto" !== this.helper.css("bottom") && (this.helper.height(this.helper.height()), this.helper.css("bottom", "auto")) }, _trigger: function (t, i, s) { return s = s || this._uiHash(), e.ui.plugin.call(this, t, [i, s, this], !0), /^(drag|start|stop)/.test(t) && (this.positionAbs = this._convertPositionTo("absolute"), s.offset = this.positionAbs), e.Widget.prototype._trigger.call(this, t, i, s) }, plugins: {}, _uiHash: function () { return { helper: this.helper, position: this.position, originalPosition: this.originalPosition, offset: this.positionAbs } }
    }), e.ui.plugin.add("draggable", "connectToSortable", { start: function (t, i, s) { var n = e.extend({}, i, { item: s.element }); s.sortables = [], e(s.options.connectToSortable).each(function () { var i = e(this).sortable("instance"); i && !i.options.disabled && (s.sortables.push(i), i.refreshPositions(), i._trigger("activate", t, n)) }) }, stop: function (t, i, s) { var n = e.extend({}, i, { item: s.element }); s.cancelHelperRemoval = !1, e.each(s.sortables, function () { var e = this; e.isOver ? (e.isOver = 0, s.cancelHelperRemoval = !0, e.cancelHelperRemoval = !1, e._storedCSS = { position: e.placeholder.css("position"), top: e.placeholder.css("top"), left: e.placeholder.css("left") }, e._mouseStop(t), e.options.helper = e.options._helper) : (e.cancelHelperRemoval = !0, e._trigger("deactivate", t, n)) }) }, drag: function (t, i, s) { e.each(s.sortables, function () { var n = !1, a = this; a.positionAbs = s.positionAbs, a.helperProportions = s.helperProportions, a.offset.click = s.offset.click, a._intersectsWith(a.containerCache) && (n = !0, e.each(s.sortables, function () { return this.positionAbs = s.positionAbs, this.helperProportions = s.helperProportions, this.offset.click = s.offset.click, this !== a && this._intersectsWith(this.containerCache) && e.contains(a.element[0], this.element[0]) && (n = !1), n })), n ? (a.isOver || (a.isOver = 1, a.currentItem = i.helper.appendTo(a.element).data("ui-sortable-item", !0), a.options._helper = a.options.helper, a.options.helper = function () { return i.helper[0] }, t.target = a.currentItem[0], a._mouseCapture(t, !0), a._mouseStart(t, !0, !0), a.offset.click.top = s.offset.click.top, a.offset.click.left = s.offset.click.left, a.offset.parent.left -= s.offset.parent.left - a.offset.parent.left, a.offset.parent.top -= s.offset.parent.top - a.offset.parent.top, s._trigger("toSortable", t), s.dropped = a.element, e.each(s.sortables, function () { this.refreshPositions() }), s.currentItem = s.element, a.fromOutside = s), a.currentItem && (a._mouseDrag(t), i.position = a.position)) : a.isOver && (a.isOver = 0, a.cancelHelperRemoval = !0, a.options._revert = a.options.revert, a.options.revert = !1, a._trigger("out", t, a._uiHash(a)), a._mouseStop(t, !0), a.options.revert = a.options._revert, a.options.helper = a.options._helper, a.placeholder && a.placeholder.remove(), s._refreshOffsets(t), i.position = s._generatePosition(t, !0), s._trigger("fromSortable", t), s.dropped = !1, e.each(s.sortables, function () { this.refreshPositions() })) }) } }), e.ui.plugin.add("draggable", "cursor", { start: function (t, i, s) { var n = e("body"), a = s.options; n.css("cursor") && (a._cursor = n.css("cursor")), n.css("cursor", a.cursor) }, stop: function (t, i, s) { var n = s.options; n._cursor && e("body").css("cursor", n._cursor) } }), e.ui.plugin.add("draggable", "opacity", { start: function (t, i, s) { var n = e(i.helper), a = s.options; n.css("opacity") && (a._opacity = n.css("opacity")), n.css("opacity", a.opacity) }, stop: function (t, i, s) { var n = s.options; n._opacity && e(i.helper).css("opacity", n._opacity) } }), e.ui.plugin.add("draggable", "scroll", { start: function (e, t, i) { i.scrollParentNotHidden || (i.scrollParentNotHidden = i.helper.scrollParent(!1)), i.scrollParentNotHidden[0] !== i.document[0] && "HTML" !== i.scrollParentNotHidden[0].tagName && (i.overflowOffset = i.scrollParentNotHidden.offset()) }, drag: function (t, i, s) { var n = s.options, a = !1, o = s.scrollParentNotHidden[0], r = s.document[0]; o !== r && "HTML" !== o.tagName ? (n.axis && "x" === n.axis || (s.overflowOffset.top + o.offsetHeight - t.pageY < n.scrollSensitivity ? o.scrollTop = a = o.scrollTop + n.scrollSpeed : t.pageY - s.overflowOffset.top < n.scrollSensitivity && (o.scrollTop = a = o.scrollTop - n.scrollSpeed)), n.axis && "y" === n.axis || (s.overflowOffset.left + o.offsetWidth - t.pageX < n.scrollSensitivity ? o.scrollLeft = a = o.scrollLeft + n.scrollSpeed : t.pageX - s.overflowOffset.left < n.scrollSensitivity && (o.scrollLeft = a = o.scrollLeft - n.scrollSpeed))) : (n.axis && "x" === n.axis || (t.pageY - e(r).scrollTop() < n.scrollSensitivity ? a = e(r).scrollTop(e(r).scrollTop() - n.scrollSpeed) : e(window).height() - (t.pageY - e(r).scrollTop()) < n.scrollSensitivity && (a = e(r).scrollTop(e(r).scrollTop() + n.scrollSpeed))), n.axis && "y" === n.axis || (t.pageX - e(r).scrollLeft() < n.scrollSensitivity ? a = e(r).scrollLeft(e(r).scrollLeft() - n.scrollSpeed) : e(window).width() - (t.pageX - e(r).scrollLeft()) < n.scrollSensitivity && (a = e(r).scrollLeft(e(r).scrollLeft() + n.scrollSpeed)))), a !== !1 && e.ui.ddmanager && !n.dropBehaviour && e.ui.ddmanager.prepareOffsets(s, t) } }), e.ui.plugin.add("draggable", "snap", { start: function (t, i, s) { var n = s.options; s.snapElements = [], e(n.snap.constructor !== String ? n.snap.items || ":data(ui-draggable)" : n.snap).each(function () { var t = e(this), i = t.offset(); this !== s.element[0] && s.snapElements.push({ item: this, width: t.outerWidth(), height: t.outerHeight(), top: i.top, left: i.left }) }) }, drag: function (t, i, s) { var n, a, o, r, h, l, u, d, c, p, f = s.options, m = f.snapTolerance, g = i.offset.left, v = g + s.helperProportions.width, y = i.offset.top, b = y + s.helperProportions.height; for (c = s.snapElements.length - 1; c >= 0; c--) h = s.snapElements[c].left - s.margins.left, l = h + s.snapElements[c].width, u = s.snapElements[c].top - s.margins.top, d = u + s.snapElements[c].height, h - m > v || g > l + m || u - m > b || y > d + m || !e.contains(s.snapElements[c].item.ownerDocument, s.snapElements[c].item) ? (s.snapElements[c].snapping && s.options.snap.release && s.options.snap.release.call(s.element, t, e.extend(s._uiHash(), { snapItem: s.snapElements[c].item })), s.snapElements[c].snapping = !1) : ("inner" !== f.snapMode && (n = m >= Math.abs(u - b), a = m >= Math.abs(d - y), o = m >= Math.abs(h - v), r = m >= Math.abs(l - g), n && (i.position.top = s._convertPositionTo("relative", { top: u - s.helperProportions.height, left: 0 }).top), a && (i.position.top = s._convertPositionTo("relative", { top: d, left: 0 }).top), o && (i.position.left = s._convertPositionTo("relative", { top: 0, left: h - s.helperProportions.width }).left), r && (i.position.left = s._convertPositionTo("relative", { top: 0, left: l }).left)), p = n || a || o || r, "outer" !== f.snapMode && (n = m >= Math.abs(u - y), a = m >= Math.abs(d - b), o = m >= Math.abs(h - g), r = m >= Math.abs(l - v), n && (i.position.top = s._convertPositionTo("relative", { top: u, left: 0 }).top), a && (i.position.top = s._convertPositionTo("relative", { top: d - s.helperProportions.height, left: 0 }).top), o && (i.position.left = s._convertPositionTo("relative", { top: 0, left: h }).left), r && (i.position.left = s._convertPositionTo("relative", { top: 0, left: l - s.helperProportions.width }).left)), !s.snapElements[c].snapping && (n || a || o || r || p) && s.options.snap.snap && s.options.snap.snap.call(s.element, t, e.extend(s._uiHash(), { snapItem: s.snapElements[c].item })), s.snapElements[c].snapping = n || a || o || r || p) } }), e.ui.plugin.add("draggable", "stack", { start: function (t, i, s) { var n, a = s.options, o = e.makeArray(e(a.stack)).sort(function (t, i) { return (parseInt(e(t).css("zIndex"), 10) || 0) - (parseInt(e(i).css("zIndex"), 10) || 0) }); o.length && (n = parseInt(e(o[0]).css("zIndex"), 10) || 0, e(o).each(function (t) { e(this).css("zIndex", n + t) }), this.css("zIndex", n + o.length)) } }), e.ui.plugin.add("draggable", "zIndex", { start: function (t, i, s) { var n = e(i.helper), a = s.options; n.css("zIndex") && (a._zIndex = n.css("zIndex")), n.css("zIndex", a.zIndex) }, stop: function (t, i, s) { var n = s.options; n._zIndex && e(i.helper).css("zIndex", n._zIndex) } }), e.ui.draggable, e.widget("ui.droppable", { version: "1.11.2", widgetEventPrefix: "drop", options: { accept: "*", activeClass: !1, addClasses: !0, greedy: !1, hoverClass: !1, scope: "default", tolerance: "intersect", activate: null, deactivate: null, drop: null, out: null, over: null }, _create: function () { var t, i = this.options, s = i.accept; this.isover = !1, this.isout = !0, this.accept = e.isFunction(s) ? s : function (e) { return e.is(s) }, this.proportions = function () { return arguments.length ? (t = arguments[0], void 0) : t ? t : t = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight } }, this._addToManager(i.scope), i.addClasses && this.element.addClass("ui-droppable") }, _addToManager: function (t) { e.ui.ddmanager.droppables[t] = e.ui.ddmanager.droppables[t] || [], e.ui.ddmanager.droppables[t].push(this) }, _splice: function (e) { for (var t = 0; e.length > t; t++) e[t] === this && e.splice(t, 1) }, _destroy: function () { var t = e.ui.ddmanager.droppables[this.options.scope]; this._splice(t), this.element.removeClass("ui-droppable ui-droppable-disabled") }, _setOption: function (t, i) { if ("accept" === t) this.accept = e.isFunction(i) ? i : function (e) { return e.is(i) }; else if ("scope" === t) { var s = e.ui.ddmanager.droppables[this.options.scope]; this._splice(s), this._addToManager(i) } this._super(t, i) }, _activate: function (t) { var i = e.ui.ddmanager.current; this.options.activeClass && this.element.addClass(this.options.activeClass), i && this._trigger("activate", t, this.ui(i)) }, _deactivate: function (t) { var i = e.ui.ddmanager.current; this.options.activeClass && this.element.removeClass(this.options.activeClass), i && this._trigger("deactivate", t, this.ui(i)) }, _over: function (t) { var i = e.ui.ddmanager.current; i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.addClass(this.options.hoverClass), this._trigger("over", t, this.ui(i))) }, _out: function (t) { var i = e.ui.ddmanager.current; i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("out", t, this.ui(i))) }, _drop: function (t, i) { var s = i || e.ui.ddmanager.current, n = !1; return s && (s.currentItem || s.element)[0] !== this.element[0] ? (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function () { var i = e(this).droppable("instance"); return i.options.greedy && !i.options.disabled && i.options.scope === s.options.scope && i.accept.call(i.element[0], s.currentItem || s.element) && e.ui.intersect(s, e.extend(i, { offset: i.element.offset() }), i.options.tolerance, t) ? (n = !0, !1) : void 0 }), n ? !1 : this.accept.call(this.element[0], s.currentItem || s.element) ? (this.options.activeClass && this.element.removeClass(this.options.activeClass), this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("drop", t, this.ui(s)), this.element) : !1) : !1 }, ui: function (e) { return { draggable: e.currentItem || e.element, helper: e.helper, position: e.position, offset: e.positionAbs } } }), e.ui.intersect = function () { function e(e, t, i) { return e >= t && t + i > e } return function (t, i, s, n) { if (!i.offset) return !1; var a = (t.positionAbs || t.position.absolute).left + t.margins.left, o = (t.positionAbs || t.position.absolute).top + t.margins.top, r = a + t.helperProportions.width, h = o + t.helperProportions.height, l = i.offset.left, u = i.offset.top, d = l + i.proportions().width, c = u + i.proportions().height; switch (s) { case "fit": return a >= l && d >= r && o >= u && c >= h; case "intersect": return a + t.helperProportions.width / 2 > l && d > r - t.helperProportions.width / 2 && o + t.helperProportions.height / 2 > u && c > h - t.helperProportions.height / 2; case "pointer": return e(n.pageY, u, i.proportions().height) && e(n.pageX, l, i.proportions().width); case "touch": return (o >= u && c >= o || h >= u && c >= h || u > o && h > c) && (a >= l && d >= a || r >= l && d >= r || l > a && r > d); default: return !1 } } }(), e.ui.ddmanager = { current: null, droppables: { "default": [] }, prepareOffsets: function (t, i) { var s, n, a = e.ui.ddmanager.droppables[t.options.scope] || [], o = i ? i.type : null, r = (t.currentItem || t.element).find(":data(ui-droppable)").addBack(); e: for (s = 0; a.length > s; s++) if (!(a[s].options.disabled || t && !a[s].accept.call(a[s].element[0], t.currentItem || t.element))) { for (n = 0; r.length > n; n++) if (r[n] === a[s].element[0]) { a[s].proportions().height = 0; continue e } a[s].visible = "none" !== a[s].element.css("display"), a[s].visible && ("mousedown" === o && a[s]._activate.call(a[s], i), a[s].offset = a[s].element.offset(), a[s].proportions({ width: a[s].element[0].offsetWidth, height: a[s].element[0].offsetHeight })) } }, drop: function (t, i) { var s = !1; return e.each((e.ui.ddmanager.droppables[t.options.scope] || []).slice(), function () { this.options && (!this.options.disabled && this.visible && e.ui.intersect(t, this, this.options.tolerance, i) && (s = this._drop.call(this, i) || s), !this.options.disabled && this.visible && this.accept.call(this.element[0], t.currentItem || t.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, i))) }), s }, dragStart: function (t, i) { t.element.parentsUntil("body").bind("scroll.droppable", function () { t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i) }) }, drag: function (t, i) { t.options.refreshPositions && e.ui.ddmanager.prepareOffsets(t, i), e.each(e.ui.ddmanager.droppables[t.options.scope] || [], function () { if (!this.options.disabled && !this.greedyChild && this.visible) { var s, n, a, o = e.ui.intersect(t, this, this.options.tolerance, i), r = !o && this.isover ? "isout" : o && !this.isover ? "isover" : null; r && (this.options.greedy && (n = this.options.scope, a = this.element.parents(":data(ui-droppable)").filter(function () { return e(this).droppable("instance").options.scope === n }), a.length && (s = e(a[0]).droppable("instance"), s.greedyChild = "isover" === r)), s && "isover" === r && (s.isover = !1, s.isout = !0, s._out.call(s, i)), this[r] = !0, this["isout" === r ? "isover" : "isout"] = !1, this["isover" === r ? "_over" : "_out"].call(this, i), s && "isout" === r && (s.isout = !1, s.isover = !0, s._over.call(s, i))) } }) }, dragStop: function (t, i) { t.element.parentsUntil("body").unbind("scroll.droppable"), t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i) } }, e.ui.droppable, e.widget("ui.resizable", e.ui.mouse, { version: "1.11.2", widgetEventPrefix: "resize", options: { alsoResize: !1, animate: !1, animateDuration: "slow", animateEasing: "swing", aspectRatio: !1, autoHide: !1, containment: !1, ghost: !1, grid: !1, handles: "e,s,se", helper: !1, maxHeight: null, maxWidth: null, minHeight: 10, minWidth: 10, zIndex: 90, resize: null, start: null, stop: null }, _num: function (e) { return parseInt(e, 10) || 0 }, _isNumber: function (e) { return !isNaN(parseInt(e, 10)) }, _hasScroll: function (t, i) { if ("hidden" === e(t).css("overflow")) return !1; var s = i && "left" === i ? "scrollLeft" : "scrollTop", n = !1; return t[s] > 0 ? !0 : (t[s] = 1, n = t[s] > 0, t[s] = 0, n) }, _create: function () { var t, i, s, n, a, o = this, r = this.options; if (this.element.addClass("ui-resizable"), e.extend(this, { _aspectRatio: !!r.aspectRatio, aspectRatio: r.aspectRatio, originalElement: this.element, _proportionallyResizeElements: [], _helper: r.helper || r.ghost || r.animate ? r.helper || "ui-resizable-helper" : null }), this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i) && (this.element.wrap(e("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({ position: this.element.css("position"), width: this.element.outerWidth(), height: this.element.outerHeight(), top: this.element.css("top"), left: this.element.css("left") })), this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance")), this.elementIsWrapper = !0, this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") }), this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0 }), this.originalResizeStyle = this.originalElement.css("resize"), this.originalElement.css("resize", "none"), this._proportionallyResizeElements.push(this.originalElement.css({ position: "static", zoom: 1, display: "block" })), this.originalElement.css({ margin: this.originalElement.css("margin") }), this._proportionallyResize()), this.handles = r.handles || (e(".ui-resizable-handle", this.element).length ? { n: ".ui-resizable-n", e: ".ui-resizable-e", s: ".ui-resizable-s", w: ".ui-resizable-w", se: ".ui-resizable-se", sw: ".ui-resizable-sw", ne: ".ui-resizable-ne", nw: ".ui-resizable-nw" } : "e,s,se"), this.handles.constructor === String) for ("all" === this.handles && (this.handles = "n,e,s,w,se,sw,ne,nw"), t = this.handles.split(","), this.handles = {}, i = 0; t.length > i; i++) s = e.trim(t[i]), a = "ui-resizable-" + s, n = e("<div class='ui-resizable-handle " + a + "'></div>"), n.css({ zIndex: r.zIndex }), "se" === s && n.addClass("ui-icon ui-icon-gripsmall-diagonal-se"), this.handles[s] = ".ui-resizable-" + s, this.element.append(n); this._renderAxis = function (t) { var i, s, n, a; t = t || this.element; for (i in this.handles) this.handles[i].constructor === String && (this.handles[i] = this.element.children(this.handles[i]).first().show()), this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i) && (s = e(this.handles[i], this.element), a = /sw|ne|nw|se|n|s/.test(i) ? s.outerHeight() : s.outerWidth(), n = ["padding", /ne|nw|n/.test(i) ? "Top" : /se|sw|s/.test(i) ? "Bottom" : /^e$/.test(i) ? "Right" : "Left"].join(""), t.css(n, a), this._proportionallyResize()), e(this.handles[i]).length }, this._renderAxis(this.element), this._handles = e(".ui-resizable-handle", this.element).disableSelection(), this._handles.mouseover(function () { o.resizing || (this.className && (n = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)), o.axis = n && n[1] ? n[1] : "se") }), r.autoHide && (this._handles.hide(), e(this.element).addClass("ui-resizable-autohide").mouseenter(function () { r.disabled || (e(this).removeClass("ui-resizable-autohide"), o._handles.show()) }).mouseleave(function () { r.disabled || o.resizing || (e(this).addClass("ui-resizable-autohide"), o._handles.hide()) })), this._mouseInit() }, _destroy: function () { this._mouseDestroy(); var t, i = function (t) { e(t).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove() }; return this.elementIsWrapper && (i(this.element), t = this.element, this.originalElement.css({ position: t.css("position"), width: t.outerWidth(), height: t.outerHeight(), top: t.css("top"), left: t.css("left") }).insertAfter(t), t.remove()), this.originalElement.css("resize", this.originalResizeStyle), i(this.originalElement), this }, _mouseCapture: function (t) { var i, s, n = !1; for (i in this.handles) s = e(this.handles[i])[0], (s === t.target || e.contains(s, t.target)) && (n = !0); return !this.options.disabled && n }, _mouseStart: function (t) { var i, s, n, a = this.options, o = this.element; return this.resizing = !0, this._renderProxy(), i = this._num(this.helper.css("left")), s = this._num(this.helper.css("top")), a.containment && (i += e(a.containment).scrollLeft() || 0, s += e(a.containment).scrollTop() || 0), this.offset = this.helper.offset(), this.position = { left: i, top: s }, this.size = this._helper ? { width: this.helper.width(), height: this.helper.height() } : { width: o.width(), height: o.height() }, this.originalSize = this._helper ? { width: o.outerWidth(), height: o.outerHeight() } : { width: o.width(), height: o.height() }, this.sizeDiff = { width: o.outerWidth() - o.width(), height: o.outerHeight() - o.height() }, this.originalPosition = { left: i, top: s }, this.originalMousePosition = { left: t.pageX, top: t.pageY }, this.aspectRatio = "number" == typeof a.aspectRatio ? a.aspectRatio : this.originalSize.width / this.originalSize.height || 1, n = e(".ui-resizable-" + this.axis).css("cursor"), e("body").css("cursor", "auto" === n ? this.axis + "-resize" : n), o.addClass("ui-resizable-resizing"), this._propagate("start", t), !0 }, _mouseDrag: function (t) { var i, s, n = this.originalMousePosition, a = this.axis, o = t.pageX - n.left || 0, r = t.pageY - n.top || 0, h = this._change[a]; return this._updatePrevProperties(), h ? (i = h.apply(this, [t, o, r]), this._updateVirtualBoundaries(t.shiftKey), (this._aspectRatio || t.shiftKey) && (i = this._updateRatio(i, t)), i = this._respectSize(i, t), this._updateCache(i), this._propagate("resize", t), s = this._applyChanges(), !this._helper && this._proportionallyResizeElements.length && this._proportionallyResize(), e.isEmptyObject(s) || (this._updatePrevProperties(), this._trigger("resize", t, this.ui()), this._applyChanges()), !1) : !1 }, _mouseStop: function (t) { this.resizing = !1; var i, s, n, a, o, r, h, l = this.options, u = this; return this._helper && (i = this._proportionallyResizeElements, s = i.length && /textarea/i.test(i[0].nodeName), n = s && this._hasScroll(i[0], "left") ? 0 : u.sizeDiff.height, a = s ? 0 : u.sizeDiff.width, o = { width: u.helper.width() - a, height: u.helper.height() - n }, r = parseInt(u.element.css("left"), 10) + (u.position.left - u.originalPosition.left) || null, h = parseInt(u.element.css("top"), 10) + (u.position.top - u.originalPosition.top) || null, l.animate || this.element.css(e.extend(o, { top: h, left: r })), u.helper.height(u.size.height), u.helper.width(u.size.width), this._helper && !l.animate && this._proportionallyResize()), e("body").css("cursor", "auto"), this.element.removeClass("ui-resizable-resizing"), this._propagate("stop", t), this._helper && this.helper.remove(), !1 }, _updatePrevProperties: function () { this.prevPosition = { top: this.position.top, left: this.position.left }, this.prevSize = { width: this.size.width, height: this.size.height } }, _applyChanges: function () { var e = {}; return this.position.top !== this.prevPosition.top && (e.top = this.position.top + "px"), this.position.left !== this.prevPosition.left && (e.left = this.position.left + "px"), this.size.width !== this.prevSize.width && (e.width = this.size.width + "px"), this.size.height !== this.prevSize.height && (e.height = this.size.height + "px"), this.helper.css(e), e }, _updateVirtualBoundaries: function (e) { var t, i, s, n, a, o = this.options; a = { minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0, maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : 1 / 0, minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0, maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : 1 / 0 }, (this._aspectRatio || e) && (t = a.minHeight * this.aspectRatio, s = a.minWidth / this.aspectRatio, i = a.maxHeight * this.aspectRatio, n = a.maxWidth / this.aspectRatio, t > a.minWidth && (a.minWidth = t), s > a.minHeight && (a.minHeight = s), a.maxWidth > i && (a.maxWidth = i), a.maxHeight > n && (a.maxHeight = n)), this._vBoundaries = a }, _updateCache: function (e) { this.offset = this.helper.offset(), this._isNumber(e.left) && (this.position.left = e.left), this._isNumber(e.top) && (this.position.top = e.top), this._isNumber(e.height) && (this.size.height = e.height), this._isNumber(e.width) && (this.size.width = e.width) }, _updateRatio: function (e) { var t = this.position, i = this.size, s = this.axis; return this._isNumber(e.height) ? e.width = e.height * this.aspectRatio : this._isNumber(e.width) && (e.height = e.width / this.aspectRatio), "sw" === s && (e.left = t.left + (i.width - e.width), e.top = null), "nw" === s && (e.top = t.top + (i.height - e.height), e.left = t.left + (i.width - e.width)), e }, _respectSize: function (e) { var t = this._vBoundaries, i = this.axis, s = this._isNumber(e.width) && t.maxWidth && t.maxWidth < e.width, n = this._isNumber(e.height) && t.maxHeight && t.maxHeight < e.height, a = this._isNumber(e.width) && t.minWidth && t.minWidth > e.width, o = this._isNumber(e.height) && t.minHeight && t.minHeight > e.height, r = this.originalPosition.left + this.originalSize.width, h = this.position.top + this.size.height, l = /sw|nw|w/.test(i), u = /nw|ne|n/.test(i); return a && (e.width = t.minWidth), o && (e.height = t.minHeight), s && (e.width = t.maxWidth), n && (e.height = t.maxHeight), a && l && (e.left = r - t.minWidth), s && l && (e.left = r - t.maxWidth), o && u && (e.top = h - t.minHeight), n && u && (e.top = h - t.maxHeight), e.width || e.height || e.left || !e.top ? e.width || e.height || e.top || !e.left || (e.left = null) : e.top = null, e }, _getPaddingPlusBorderDimensions: function (e) { for (var t = 0, i = [], s = [e.css("borderTopWidth"), e.css("borderRightWidth"), e.css("borderBottomWidth"), e.css("borderLeftWidth")], n = [e.css("paddingTop"), e.css("paddingRight"), e.css("paddingBottom"), e.css("paddingLeft")]; 4 > t; t++) i[t] = parseInt(s[t], 10) || 0, i[t] += parseInt(n[t], 10) || 0; return { height: i[0] + i[2], width: i[1] + i[3] } }, _proportionallyResize: function () { if (this._proportionallyResizeElements.length) for (var e, t = 0, i = this.helper || this.element; this._proportionallyResizeElements.length > t; t++) e = this._proportionallyResizeElements[t], this.outerDimensions || (this.outerDimensions = this._getPaddingPlusBorderDimensions(e)), e.css({ height: i.height() - this.outerDimensions.height || 0, width: i.width() - this.outerDimensions.width || 0 }) }, _renderProxy: function () { var t = this.element, i = this.options; this.elementOffset = t.offset(), this._helper ? (this.helper = this.helper || e("<div style='overflow:hidden;'></div>"), this.helper.addClass(this._helper).css({ width: this.element.outerWidth() - 1, height: this.element.outerHeight() - 1, position: "absolute", left: this.elementOffset.left + "px", top: this.elementOffset.top + "px", zIndex: ++i.zIndex }), this.helper.appendTo("body").disableSelection()) : this.helper = this.element }, _change: { e: function (e, t) { return { width: this.originalSize.width + t } }, w: function (e, t) { var i = this.originalSize, s = this.originalPosition; return { left: s.left + t, width: i.width - t } }, n: function (e, t, i) { var s = this.originalSize, n = this.originalPosition; return { top: n.top + i, height: s.height - i } }, s: function (e, t, i) { return { height: this.originalSize.height + i } }, se: function (t, i, s) { return e.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [t, i, s])) }, sw: function (t, i, s) { return e.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [t, i, s])) }, ne: function (t, i, s) { return e.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [t, i, s])) }, nw: function (t, i, s) { return e.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [t, i, s])) } }, _propagate: function (t, i) { e.ui.plugin.call(this, t, [i, this.ui()]), "resize" !== t && this._trigger(t, i, this.ui()) }, plugins: {}, ui: function () { return { originalElement: this.originalElement, element: this.element, helper: this.helper, position: this.position, size: this.size, originalSize: this.originalSize, originalPosition: this.originalPosition } } }), e.ui.plugin.add("resizable", "animate", { stop: function (t) { var i = e(this).resizable("instance"), s = i.options, n = i._proportionallyResizeElements, a = n.length && /textarea/i.test(n[0].nodeName), o = a && i._hasScroll(n[0], "left") ? 0 : i.sizeDiff.height, r = a ? 0 : i.sizeDiff.width, h = { width: i.size.width - r, height: i.size.height - o }, l = parseInt(i.element.css("left"), 10) + (i.position.left - i.originalPosition.left) || null, u = parseInt(i.element.css("top"), 10) + (i.position.top - i.originalPosition.top) || null; i.element.animate(e.extend(h, u && l ? { top: u, left: l } : {}), { duration: s.animateDuration, easing: s.animateEasing, step: function () { var s = { width: parseInt(i.element.css("width"), 10), height: parseInt(i.element.css("height"), 10), top: parseInt(i.element.css("top"), 10), left: parseInt(i.element.css("left"), 10) }; n && n.length && e(n[0]).css({ width: s.width, height: s.height }), i._updateCache(s), i._propagate("resize", t) } }) } }), e.ui.plugin.add("resizable", "containment", { start: function () { var t, i, s, n, a, o, r, h = e(this).resizable("instance"), l = h.options, u = h.element, d = l.containment, c = d instanceof e ? d.get(0) : /parent/.test(d) ? u.parent().get(0) : d; c && (h.containerElement = e(c), /document/.test(d) || d === document ? (h.containerOffset = { left: 0, top: 0 }, h.containerPosition = { left: 0, top: 0 }, h.parentData = { element: e(document), left: 0, top: 0, width: e(document).width(), height: e(document).height() || document.body.parentNode.scrollHeight }) : (t = e(c), i = [], e(["Top", "Right", "Left", "Bottom"]).each(function (e, s) { i[e] = h._num(t.css("padding" + s)) }), h.containerOffset = t.offset(), h.containerPosition = t.position(), h.containerSize = { height: t.innerHeight() - i[3], width: t.innerWidth() - i[1] }, s = h.containerOffset, n = h.containerSize.height, a = h.containerSize.width, o = h._hasScroll(c, "left") ? c.scrollWidth : a, r = h._hasScroll(c) ? c.scrollHeight : n, h.parentData = { element: c, left: s.left, top: s.top, width: o, height: r })) }, resize: function (t) { var i, s, n, a, o = e(this).resizable("instance"), r = o.options, h = o.containerOffset, l = o.position, u = o._aspectRatio || t.shiftKey, d = { top: 0, left: 0 }, c = o.containerElement, p = !0; c[0] !== document && /static/.test(c.css("position")) && (d = h), l.left < (o._helper ? h.left : 0) && (o.size.width = o.size.width + (o._helper ? o.position.left - h.left : o.position.left - d.left), u && (o.size.height = o.size.width / o.aspectRatio, p = !1), o.position.left = r.helper ? h.left : 0), l.top < (o._helper ? h.top : 0) && (o.size.height = o.size.height + (o._helper ? o.position.top - h.top : o.position.top), u && (o.size.width = o.size.height * o.aspectRatio, p = !1), o.position.top = o._helper ? h.top : 0), n = o.containerElement.get(0) === o.element.parent().get(0), a = /relative|absolute/.test(o.containerElement.css("position")), n && a ? (o.offset.left = o.parentData.left + o.position.left, o.offset.top = o.parentData.top + o.position.top) : (o.offset.left = o.element.offset().left, o.offset.top = o.element.offset().top), i = Math.abs(o.sizeDiff.width + (o._helper ? o.offset.left - d.left : o.offset.left - h.left)), s = Math.abs(o.sizeDiff.height + (o._helper ? o.offset.top - d.top : o.offset.top - h.top)), i + o.size.width >= o.parentData.width && (o.size.width = o.parentData.width - i, u && (o.size.height = o.size.width / o.aspectRatio, p = !1)), s + o.size.height >= o.parentData.height && (o.size.height = o.parentData.height - s, u && (o.size.width = o.size.height * o.aspectRatio, p = !1)), p || (o.position.left = o.prevPosition.left, o.position.top = o.prevPosition.top, o.size.width = o.prevSize.width, o.size.height = o.prevSize.height) }, stop: function () { var t = e(this).resizable("instance"), i = t.options, s = t.containerOffset, n = t.containerPosition, a = t.containerElement, o = e(t.helper), r = o.offset(), h = o.outerWidth() - t.sizeDiff.width, l = o.outerHeight() - t.sizeDiff.height; t._helper && !i.animate && /relative/.test(a.css("position")) && e(this).css({ left: r.left - n.left - s.left, width: h, height: l }), t._helper && !i.animate && /static/.test(a.css("position")) && e(this).css({ left: r.left - n.left - s.left, width: h, height: l }) } }), e.ui.plugin.add("resizable", "alsoResize", { start: function () { var t = e(this).resizable("instance"), i = t.options, s = function (t) { e(t).each(function () { var t = e(this); t.data("ui-resizable-alsoresize", { width: parseInt(t.width(), 10), height: parseInt(t.height(), 10), left: parseInt(t.css("left"), 10), top: parseInt(t.css("top"), 10) }) }) }; "object" != typeof i.alsoResize || i.alsoResize.parentNode ? s(i.alsoResize) : i.alsoResize.length ? (i.alsoResize = i.alsoResize[0], s(i.alsoResize)) : e.each(i.alsoResize, function (e) { s(e) }) }, resize: function (t, i) { var s = e(this).resizable("instance"), n = s.options, a = s.originalSize, o = s.originalPosition, r = { height: s.size.height - a.height || 0, width: s.size.width - a.width || 0, top: s.position.top - o.top || 0, left: s.position.left - o.left || 0 }, h = function (t, s) { e(t).each(function () { var t = e(this), n = e(this).data("ui-resizable-alsoresize"), a = {}, o = s && s.length ? s : t.parents(i.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"]; e.each(o, function (e, t) { var i = (n[t] || 0) + (r[t] || 0); i && i >= 0 && (a[t] = i || null) }), t.css(a) }) }; "object" != typeof n.alsoResize || n.alsoResize.nodeType ? h(n.alsoResize) : e.each(n.alsoResize, function (e, t) { h(e, t) }) }, stop: function () { e(this).removeData("resizable-alsoresize") } }), e.ui.plugin.add("resizable", "ghost", { start: function () { var t = e(this).resizable("instance"), i = t.options, s = t.size; t.ghost = t.originalElement.clone(), t.ghost.css({ opacity: .25, display: "block", position: "relative", height: s.height, width: s.width, margin: 0, left: 0, top: 0 }).addClass("ui-resizable-ghost").addClass("string" == typeof i.ghost ? i.ghost : ""), t.ghost.appendTo(t.helper) }, resize: function () { var t = e(this).resizable("instance"); t.ghost && t.ghost.css({ position: "relative", height: t.size.height, width: t.size.width }) }, stop: function () { var t = e(this).resizable("instance"); t.ghost && t.helper && t.helper.get(0).removeChild(t.ghost.get(0)) } }), e.ui.plugin.add("resizable", "grid", { resize: function () { var t, i = e(this).resizable("instance"), s = i.options, n = i.size, a = i.originalSize, o = i.originalPosition, r = i.axis, h = "number" == typeof s.grid ? [s.grid, s.grid] : s.grid, l = h[0] || 1, u = h[1] || 1, d = Math.round((n.width - a.width) / l) * l, c = Math.round((n.height - a.height) / u) * u, p = a.width + d, f = a.height + c, m = s.maxWidth && p > s.maxWidth, g = s.maxHeight && f > s.maxHeight, v = s.minWidth && s.minWidth > p, y = s.minHeight && s.minHeight > f; s.grid = h, v && (p += l), y && (f += u), m && (p -= l), g && (f -= u), /^(se|s|e)$/.test(r) ? (i.size.width = p, i.size.height = f) : /^(ne)$/.test(r) ? (i.size.width = p, i.size.height = f, i.position.top = o.top - c) : /^(sw)$/.test(r) ? (i.size.width = p, i.size.height = f, i.position.left = o.left - d) : ((0 >= f - u || 0 >= p - l) && (t = i._getPaddingPlusBorderDimensions(this)), f - u > 0 ? (i.size.height = f, i.position.top = o.top - c) : (f = u - t.height, i.size.height = f, i.position.top = o.top + a.height - f), p - l > 0 ? (i.size.width = p, i.position.left = o.left - d) : (p = u - t.height, i.size.width = p, i.position.left = o.left + a.width - p)) } }), e.ui.resizable, e.widget("ui.selectable", e.ui.mouse, {
        version: "1.11.2", options: { appendTo: "body", autoRefresh: !0, distance: 0, filter: "*", tolerance: "touch", selected: null, selecting: null, start: null, stop: null, unselected: null, unselecting: null }, _create: function () {
            var t, i = this;
            this.element.addClass("ui-selectable"), this.dragged = !1, this.refresh = function () { t = e(i.options.filter, i.element[0]), t.addClass("ui-selectee"), t.each(function () { var t = e(this), i = t.offset(); e.data(this, "selectable-item", { element: this, $element: t, left: i.left, top: i.top, right: i.left + t.outerWidth(), bottom: i.top + t.outerHeight(), startselected: !1, selected: t.hasClass("ui-selected"), selecting: t.hasClass("ui-selecting"), unselecting: t.hasClass("ui-unselecting") }) }) }, this.refresh(), this.selectees = t.addClass("ui-selectee"), this._mouseInit(), this.helper = e("<div class='ui-selectable-helper'></div>")
        }, _destroy: function () { this.selectees.removeClass("ui-selectee").removeData("selectable-item"), this.element.removeClass("ui-selectable ui-selectable-disabled"), this._mouseDestroy() }, _mouseStart: function (t) { var i = this, s = this.options; this.opos = [t.pageX, t.pageY], this.options.disabled || (this.selectees = e(s.filter, this.element[0]), this._trigger("start", t), e(s.appendTo).append(this.helper), this.helper.css({ left: t.pageX, top: t.pageY, width: 0, height: 0 }), s.autoRefresh && this.refresh(), this.selectees.filter(".ui-selected").each(function () { var s = e.data(this, "selectable-item"); s.startselected = !0, t.metaKey || t.ctrlKey || (s.$element.removeClass("ui-selected"), s.selected = !1, s.$element.addClass("ui-unselecting"), s.unselecting = !0, i._trigger("unselecting", t, { unselecting: s.element })) }), e(t.target).parents().addBack().each(function () { var s, n = e.data(this, "selectable-item"); return n ? (s = !t.metaKey && !t.ctrlKey || !n.$element.hasClass("ui-selected"), n.$element.removeClass(s ? "ui-unselecting" : "ui-selected").addClass(s ? "ui-selecting" : "ui-unselecting"), n.unselecting = !s, n.selecting = s, n.selected = s, s ? i._trigger("selecting", t, { selecting: n.element }) : i._trigger("unselecting", t, { unselecting: n.element }), !1) : void 0 })) }, _mouseDrag: function (t) { if (this.dragged = !0, !this.options.disabled) { var i, s = this, n = this.options, a = this.opos[0], o = this.opos[1], r = t.pageX, h = t.pageY; return a > r && (i = r, r = a, a = i), o > h && (i = h, h = o, o = i), this.helper.css({ left: a, top: o, width: r - a, height: h - o }), this.selectees.each(function () { var i = e.data(this, "selectable-item"), l = !1; i && i.element !== s.element[0] && ("touch" === n.tolerance ? l = !(i.left > r || a > i.right || i.top > h || o > i.bottom) : "fit" === n.tolerance && (l = i.left > a && r > i.right && i.top > o && h > i.bottom), l ? (i.selected && (i.$element.removeClass("ui-selected"), i.selected = !1), i.unselecting && (i.$element.removeClass("ui-unselecting"), i.unselecting = !1), i.selecting || (i.$element.addClass("ui-selecting"), i.selecting = !0, s._trigger("selecting", t, { selecting: i.element }))) : (i.selecting && ((t.metaKey || t.ctrlKey) && i.startselected ? (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.$element.addClass("ui-selected"), i.selected = !0) : (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.startselected && (i.$element.addClass("ui-unselecting"), i.unselecting = !0), s._trigger("unselecting", t, { unselecting: i.element }))), i.selected && (t.metaKey || t.ctrlKey || i.startselected || (i.$element.removeClass("ui-selected"), i.selected = !1, i.$element.addClass("ui-unselecting"), i.unselecting = !0, s._trigger("unselecting", t, { unselecting: i.element }))))) }), !1 } }, _mouseStop: function (t) { var i = this; return this.dragged = !1, e(".ui-unselecting", this.element[0]).each(function () { var s = e.data(this, "selectable-item"); s.$element.removeClass("ui-unselecting"), s.unselecting = !1, s.startselected = !1, i._trigger("unselected", t, { unselected: s.element }) }), e(".ui-selecting", this.element[0]).each(function () { var s = e.data(this, "selectable-item"); s.$element.removeClass("ui-selecting").addClass("ui-selected"), s.selecting = !1, s.selected = !0, s.startselected = !0, i._trigger("selected", t, { selected: s.element }) }), this._trigger("stop", t), this.helper.remove(), !1 }
    }), e.widget("ui.sortable", e.ui.mouse, { version: "1.11.2", widgetEventPrefix: "sort", ready: !1, options: { appendTo: "parent", axis: !1, connectWith: !1, containment: !1, cursor: "auto", cursorAt: !1, dropOnEmpty: !0, forcePlaceholderSize: !1, forceHelperSize: !1, grid: !1, handle: !1, helper: "original", items: "> *", opacity: !1, placeholder: !1, revert: !1, scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, scope: "default", tolerance: "intersect", zIndex: 1e3, activate: null, beforeStop: null, change: null, deactivate: null, out: null, over: null, receive: null, remove: null, sort: null, start: null, stop: null, update: null }, _isOverAxis: function (e, t, i) { return e >= t && t + i > e }, _isFloating: function (e) { return /left|right/.test(e.css("float")) || /inline|table-cell/.test(e.css("display")) }, _create: function () { var e = this.options; this.containerCache = {}, this.element.addClass("ui-sortable"), this.refresh(), this.floating = this.items.length ? "x" === e.axis || this._isFloating(this.items[0].item) : !1, this.offset = this.element.offset(), this._mouseInit(), this._setHandleClassName(), this.ready = !0 }, _setOption: function (e, t) { this._super(e, t), "handle" === e && this._setHandleClassName() }, _setHandleClassName: function () { this.element.find(".ui-sortable-handle").removeClass("ui-sortable-handle"), e.each(this.items, function () { (this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item).addClass("ui-sortable-handle") }) }, _destroy: function () { this.element.removeClass("ui-sortable ui-sortable-disabled").find(".ui-sortable-handle").removeClass("ui-sortable-handle"), this._mouseDestroy(); for (var e = this.items.length - 1; e >= 0; e--) this.items[e].item.removeData(this.widgetName + "-item"); return this }, _mouseCapture: function (t, i) { var s = null, n = !1, a = this; return this.reverting ? !1 : this.options.disabled || "static" === this.options.type ? !1 : (this._refreshItems(t), e(t.target).parents().each(function () { return e.data(this, a.widgetName + "-item") === a ? (s = e(this), !1) : void 0 }), e.data(t.target, a.widgetName + "-item") === a && (s = e(t.target)), s ? !this.options.handle || i || (e(this.options.handle, s).find("*").addBack().each(function () { this === t.target && (n = !0) }), n) ? (this.currentItem = s, this._removeCurrentsFromItems(), !0) : !1 : !1) }, _mouseStart: function (t, i, s) { var n, a, o = this.options; if (this.currentContainer = this, this.refreshPositions(), this.helper = this._createHelper(t), this._cacheHelperProportions(), this._cacheMargins(), this.scrollParent = this.helper.scrollParent(), this.offset = this.currentItem.offset(), this.offset = { top: this.offset.top - this.margins.top, left: this.offset.left - this.margins.left }, e.extend(this.offset, { click: { left: t.pageX - this.offset.left, top: t.pageY - this.offset.top }, parent: this._getParentOffset(), relative: this._getRelativeOffset() }), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), this.originalPosition = this._generatePosition(t), this.originalPageX = t.pageX, this.originalPageY = t.pageY, o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt), this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] }, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), o.containment && this._setContainment(), o.cursor && "auto" !== o.cursor && (a = this.document.find("body"), this.storedCursor = a.css("cursor"), a.css("cursor", o.cursor), this.storedStylesheet = e("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(a)), o.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", o.opacity)), o.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", o.zIndex)), this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", t, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !s) for (n = this.containers.length - 1; n >= 0; n--) this.containers[n]._trigger("activate", t, this._uiHash(this)); return e.ui.ddmanager && (e.ui.ddmanager.current = this), e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this.dragging = !0, this.helper.addClass("ui-sortable-helper"), this._mouseDrag(t), !0 }, _mouseDrag: function (t) { var i, s, n, a, o = this.options, r = !1; for (this.position = this._generatePosition(t), this.positionAbs = this._convertPositionTo("absolute"), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.options.scroll && (this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - t.pageY < o.scrollSensitivity ? this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop + o.scrollSpeed : t.pageY - this.overflowOffset.top < o.scrollSensitivity && (this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop - o.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - t.pageX < o.scrollSensitivity ? this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft + o.scrollSpeed : t.pageX - this.overflowOffset.left < o.scrollSensitivity && (this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft - o.scrollSpeed)) : (t.pageY - e(document).scrollTop() < o.scrollSensitivity ? r = e(document).scrollTop(e(document).scrollTop() - o.scrollSpeed) : e(window).height() - (t.pageY - e(document).scrollTop()) < o.scrollSensitivity && (r = e(document).scrollTop(e(document).scrollTop() + o.scrollSpeed)), t.pageX - e(document).scrollLeft() < o.scrollSensitivity ? r = e(document).scrollLeft(e(document).scrollLeft() - o.scrollSpeed) : e(window).width() - (t.pageX - e(document).scrollLeft()) < o.scrollSensitivity && (r = e(document).scrollLeft(e(document).scrollLeft() + o.scrollSpeed))), r !== !1 && e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t)), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), i = this.items.length - 1; i >= 0; i--) if (s = this.items[i], n = s.item[0], a = this._intersectsWithPointer(s), a && s.instance === this.currentContainer && n !== this.currentItem[0] && this.placeholder[1 === a ? "next" : "prev"]()[0] !== n && !e.contains(this.placeholder[0], n) && ("semi-dynamic" === this.options.type ? !e.contains(this.element[0], n) : !0)) { if (this.direction = 1 === a ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(s)) break; this._rearrange(t, s), this._trigger("change", t, this._uiHash()); break } return this._contactContainers(t), e.ui.ddmanager && e.ui.ddmanager.drag(this, t), this._trigger("sort", t, this._uiHash()), this.lastPositionAbs = this.positionAbs, !1 }, _mouseStop: function (t, i) { if (t) { if (e.ui.ddmanager && !this.options.dropBehaviour && e.ui.ddmanager.drop(this, t), this.options.revert) { var s = this, n = this.placeholder.offset(), a = this.options.axis, o = {}; a && "x" !== a || (o.left = n.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft)), a && "y" !== a || (o.top = n.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop)), this.reverting = !0, e(this.helper).animate(o, parseInt(this.options.revert, 10) || 500, function () { s._clear(t) }) } else this._clear(t, i); return !1 } }, cancel: function () { if (this.dragging) { this._mouseUp({ target: null }), "original" === this.options.helper ? this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") : this.currentItem.show(); for (var t = this.containers.length - 1; t >= 0; t--) this.containers[t]._trigger("deactivate", null, this._uiHash(this)), this.containers[t].containerCache.over && (this.containers[t]._trigger("out", null, this._uiHash(this)), this.containers[t].containerCache.over = 0) } return this.placeholder && (this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]), "original" !== this.options.helper && this.helper && this.helper[0].parentNode && this.helper.remove(), e.extend(this, { helper: null, dragging: !1, reverting: !1, _noFinalSort: null }), this.domPosition.prev ? e(this.domPosition.prev).after(this.currentItem) : e(this.domPosition.parent).prepend(this.currentItem)), this }, serialize: function (t) { var i = this._getItemsAsjQuery(t && t.connected), s = []; return t = t || {}, e(i).each(function () { var i = (e(t.item || this).attr(t.attribute || "id") || "").match(t.expression || /(.+)[\-=_](.+)/); i && s.push((t.key || i[1] + "[]") + "=" + (t.key && t.expression ? i[1] : i[2])) }), !s.length && t.key && s.push(t.key + "="), s.join("&") }, toArray: function (t) { var i = this._getItemsAsjQuery(t && t.connected), s = []; return t = t || {}, i.each(function () { s.push(e(t.item || this).attr(t.attribute || "id") || "") }), s }, _intersectsWith: function (e) { var t = this.positionAbs.left, i = t + this.helperProportions.width, s = this.positionAbs.top, n = s + this.helperProportions.height, a = e.left, o = a + e.width, r = e.top, h = r + e.height, l = this.offset.click.top, u = this.offset.click.left, d = "x" === this.options.axis || s + l > r && h > s + l, c = "y" === this.options.axis || t + u > a && o > t + u, p = d && c; return "pointer" === this.options.tolerance || this.options.forcePointerForContainers || "pointer" !== this.options.tolerance && this.helperProportions[this.floating ? "width" : "height"] > e[this.floating ? "width" : "height"] ? p : t + this.helperProportions.width / 2 > a && o > i - this.helperProportions.width / 2 && s + this.helperProportions.height / 2 > r && h > n - this.helperProportions.height / 2 }, _intersectsWithPointer: function (e) { var t = "x" === this.options.axis || this._isOverAxis(this.positionAbs.top + this.offset.click.top, e.top, e.height), i = "y" === this.options.axis || this._isOverAxis(this.positionAbs.left + this.offset.click.left, e.left, e.width), s = t && i, n = this._getDragVerticalDirection(), a = this._getDragHorizontalDirection(); return s ? this.floating ? a && "right" === a || "down" === n ? 2 : 1 : n && ("down" === n ? 2 : 1) : !1 }, _intersectsWithSides: function (e) { var t = this._isOverAxis(this.positionAbs.top + this.offset.click.top, e.top + e.height / 2, e.height), i = this._isOverAxis(this.positionAbs.left + this.offset.click.left, e.left + e.width / 2, e.width), s = this._getDragVerticalDirection(), n = this._getDragHorizontalDirection(); return this.floating && n ? "right" === n && i || "left" === n && !i : s && ("down" === s && t || "up" === s && !t) }, _getDragVerticalDirection: function () { var e = this.positionAbs.top - this.lastPositionAbs.top; return 0 !== e && (e > 0 ? "down" : "up") }, _getDragHorizontalDirection: function () { var e = this.positionAbs.left - this.lastPositionAbs.left; return 0 !== e && (e > 0 ? "right" : "left") }, refresh: function (e) { return this._refreshItems(e), this._setHandleClassName(), this.refreshPositions(), this }, _connectWith: function () { var e = this.options; return e.connectWith.constructor === String ? [e.connectWith] : e.connectWith }, _getItemsAsjQuery: function (t) { function i() { r.push(this) } var s, n, a, o, r = [], h = [], l = this._connectWith(); if (l && t) for (s = l.length - 1; s >= 0; s--) for (a = e(l[s]), n = a.length - 1; n >= 0; n--) o = e.data(a[n], this.widgetFullName), o && o !== this && !o.options.disabled && h.push([e.isFunction(o.options.items) ? o.options.items.call(o.element) : e(o.options.items, o.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), o]); for (h.push([e.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : e(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]), s = h.length - 1; s >= 0; s--) h[s][0].each(i); return e(r) }, _removeCurrentsFromItems: function () { var t = this.currentItem.find(":data(" + this.widgetName + "-item)"); this.items = e.grep(this.items, function (e) { for (var i = 0; t.length > i; i++) if (t[i] === e.item[0]) return !1; return !0 }) }, _refreshItems: function (t) { this.items = [], this.containers = [this]; var i, s, n, a, o, r, h, l, u = this.items, d = [[e.isFunction(this.options.items) ? this.options.items.call(this.element[0], t, { item: this.currentItem }) : e(this.options.items, this.element), this]], c = this._connectWith(); if (c && this.ready) for (i = c.length - 1; i >= 0; i--) for (n = e(c[i]), s = n.length - 1; s >= 0; s--) a = e.data(n[s], this.widgetFullName), a && a !== this && !a.options.disabled && (d.push([e.isFunction(a.options.items) ? a.options.items.call(a.element[0], t, { item: this.currentItem }) : e(a.options.items, a.element), a]), this.containers.push(a)); for (i = d.length - 1; i >= 0; i--) for (o = d[i][1], r = d[i][0], s = 0, l = r.length; l > s; s++) h = e(r[s]), h.data(this.widgetName + "-item", o), u.push({ item: h, instance: o, width: 0, height: 0, left: 0, top: 0 }) }, refreshPositions: function (t) { this.offsetParent && this.helper && (this.offset.parent = this._getParentOffset()); var i, s, n, a; for (i = this.items.length - 1; i >= 0; i--) s = this.items[i], s.instance !== this.currentContainer && this.currentContainer && s.item[0] !== this.currentItem[0] || (n = this.options.toleranceElement ? e(this.options.toleranceElement, s.item) : s.item, t || (s.width = n.outerWidth(), s.height = n.outerHeight()), a = n.offset(), s.left = a.left, s.top = a.top); if (this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this); else for (i = this.containers.length - 1; i >= 0; i--) a = this.containers[i].element.offset(), this.containers[i].containerCache.left = a.left, this.containers[i].containerCache.top = a.top, this.containers[i].containerCache.width = this.containers[i].element.outerWidth(), this.containers[i].containerCache.height = this.containers[i].element.outerHeight(); return this }, _createPlaceholder: function (t) { t = t || this; var i, s = t.options; s.placeholder && s.placeholder.constructor !== String || (i = s.placeholder, s.placeholder = { element: function () { var s = t.currentItem[0].nodeName.toLowerCase(), n = e("<" + s + ">", t.document[0]).addClass(i || t.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper"); return "tr" === s ? t.currentItem.children().each(function () { e("<td>&#160;</td>", t.document[0]).attr("colspan", e(this).attr("colspan") || 1).appendTo(n) }) : "img" === s && n.attr("src", t.currentItem.attr("src")), i || n.css("visibility", "hidden"), n }, update: function (e, n) { (!i || s.forcePlaceholderSize) && (n.height() || n.height(t.currentItem.innerHeight() - parseInt(t.currentItem.css("paddingTop") || 0, 10) - parseInt(t.currentItem.css("paddingBottom") || 0, 10)), n.width() || n.width(t.currentItem.innerWidth() - parseInt(t.currentItem.css("paddingLeft") || 0, 10) - parseInt(t.currentItem.css("paddingRight") || 0, 10))) } }), t.placeholder = e(s.placeholder.element.call(t.element, t.currentItem)), t.currentItem.after(t.placeholder), s.placeholder.update(t, t.placeholder) }, _contactContainers: function (t) { var i, s, n, a, o, r, h, l, u, d, c = null, p = null; for (i = this.containers.length - 1; i >= 0; i--) if (!e.contains(this.currentItem[0], this.containers[i].element[0])) if (this._intersectsWith(this.containers[i].containerCache)) { if (c && e.contains(this.containers[i].element[0], c.element[0])) continue; c = this.containers[i], p = i } else this.containers[i].containerCache.over && (this.containers[i]._trigger("out", t, this._uiHash(this)), this.containers[i].containerCache.over = 0); if (c) if (1 === this.containers.length) this.containers[p].containerCache.over || (this.containers[p]._trigger("over", t, this._uiHash(this)), this.containers[p].containerCache.over = 1); else { for (n = 1e4, a = null, u = c.floating || this._isFloating(this.currentItem), o = u ? "left" : "top", r = u ? "width" : "height", d = u ? "clientX" : "clientY", s = this.items.length - 1; s >= 0; s--) e.contains(this.containers[p].element[0], this.items[s].item[0]) && this.items[s].item[0] !== this.currentItem[0] && (h = this.items[s].item.offset()[o], l = !1, t[d] - h > this.items[s][r] / 2 && (l = !0), n > Math.abs(t[d] - h) && (n = Math.abs(t[d] - h), a = this.items[s], this.direction = l ? "up" : "down")); if (!a && !this.options.dropOnEmpty) return; if (this.currentContainer === this.containers[p]) return this.currentContainer.containerCache.over || (this.containers[p]._trigger("over", t, this._uiHash()), this.currentContainer.containerCache.over = 1), void 0; a ? this._rearrange(t, a, null, !0) : this._rearrange(t, null, this.containers[p].element, !0), this._trigger("change", t, this._uiHash()), this.containers[p]._trigger("change", t, this._uiHash(this)), this.currentContainer = this.containers[p], this.options.placeholder.update(this.currentContainer, this.placeholder), this.containers[p]._trigger("over", t, this._uiHash(this)), this.containers[p].containerCache.over = 1 } }, _createHelper: function (t) { var i = this.options, s = e.isFunction(i.helper) ? e(i.helper.apply(this.element[0], [t, this.currentItem])) : "clone" === i.helper ? this.currentItem.clone() : this.currentItem; return s.parents("body").length || e("parent" !== i.appendTo ? i.appendTo : this.currentItem[0].parentNode)[0].appendChild(s[0]), s[0] === this.currentItem[0] && (this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") }), (!s[0].style.width || i.forceHelperSize) && s.width(this.currentItem.width()), (!s[0].style.height || i.forceHelperSize) && s.height(this.currentItem.height()), s }, _adjustOffsetFromHelper: function (t) { "string" == typeof t && (t = t.split(" ")), e.isArray(t) && (t = { left: +t[0], top: +t[1] || 0 }), "left" in t && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top) }, _getParentOffset: function () { this.offsetParent = this.helper.offsetParent(); var t = this.offsetParent.offset(); return "absolute" === this.cssPosition && this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), (this.offsetParent[0] === document.body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && e.ui.ie) && (t = { top: 0, left: 0 }), { top: t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) } }, _getRelativeOffset: function () { if ("relative" === this.cssPosition) { var e = this.currentItem.position(); return { top: e.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(), left: e.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft() } } return { top: 0, left: 0 } }, _cacheMargins: function () { this.margins = { left: parseInt(this.currentItem.css("marginLeft"), 10) || 0, top: parseInt(this.currentItem.css("marginTop"), 10) || 0 } }, _cacheHelperProportions: function () { this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() } }, _setContainment: function () { var t, i, s, n = this.options; "parent" === n.containment && (n.containment = this.helper[0].parentNode), ("document" === n.containment || "window" === n.containment) && (this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, e("document" === n.containment ? document : window).width() - this.helperProportions.width - this.margins.left, (e("document" === n.containment ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]), /^(document|window|parent)$/.test(n.containment) || (t = e(n.containment)[0], i = e(n.containment).offset(), s = "hidden" !== e(t).css("overflow"), this.containment = [i.left + (parseInt(e(t).css("borderLeftWidth"), 10) || 0) + (parseInt(e(t).css("paddingLeft"), 10) || 0) - this.margins.left, i.top + (parseInt(e(t).css("borderTopWidth"), 10) || 0) + (parseInt(e(t).css("paddingTop"), 10) || 0) - this.margins.top, i.left + (s ? Math.max(t.scrollWidth, t.offsetWidth) : t.offsetWidth) - (parseInt(e(t).css("borderLeftWidth"), 10) || 0) - (parseInt(e(t).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, i.top + (s ? Math.max(t.scrollHeight, t.offsetHeight) : t.offsetHeight) - (parseInt(e(t).css("borderTopWidth"), 10) || 0) - (parseInt(e(t).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]) }, _convertPositionTo: function (t, i) { i || (i = this.position); var s = "absolute" === t ? 1 : -1, n = "absolute" !== this.cssPosition || this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, a = /(html|body)/i.test(n[0].tagName); return { top: i.top + this.offset.relative.top * s + this.offset.parent.top * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : a ? 0 : n.scrollTop()) * s, left: i.left + this.offset.relative.left * s + this.offset.parent.left * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : a ? 0 : n.scrollLeft()) * s } }, _generatePosition: function (t) { var i, s, n = this.options, a = t.pageX, o = t.pageY, r = "absolute" !== this.cssPosition || this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, h = /(html|body)/i.test(r[0].tagName); return "relative" !== this.cssPosition || this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0] || (this.offset.relative = this._getRelativeOffset()), this.originalPosition && (this.containment && (t.pageX - this.offset.click.left < this.containment[0] && (a = this.containment[0] + this.offset.click.left), t.pageY - this.offset.click.top < this.containment[1] && (o = this.containment[1] + this.offset.click.top), t.pageX - this.offset.click.left > this.containment[2] && (a = this.containment[2] + this.offset.click.left), t.pageY - this.offset.click.top > this.containment[3] && (o = this.containment[3] + this.offset.click.top)), n.grid && (i = this.originalPageY + Math.round((o - this.originalPageY) / n.grid[1]) * n.grid[1], o = this.containment ? i - this.offset.click.top >= this.containment[1] && i - this.offset.click.top <= this.containment[3] ? i : i - this.offset.click.top >= this.containment[1] ? i - n.grid[1] : i + n.grid[1] : i, s = this.originalPageX + Math.round((a - this.originalPageX) / n.grid[0]) * n.grid[0], a = this.containment ? s - this.offset.click.left >= this.containment[0] && s - this.offset.click.left <= this.containment[2] ? s : s - this.offset.click.left >= this.containment[0] ? s - n.grid[0] : s + n.grid[0] : s)), { top: o - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : h ? 0 : r.scrollTop()), left: a - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : h ? 0 : r.scrollLeft()) } }, _rearrange: function (e, t, i, s) { i ? i[0].appendChild(this.placeholder[0]) : t.item[0].parentNode.insertBefore(this.placeholder[0], "down" === this.direction ? t.item[0] : t.item[0].nextSibling), this.counter = this.counter ? ++this.counter : 1; var n = this.counter; this._delay(function () { n === this.counter && this.refreshPositions(!s) }) }, _clear: function (e, t) { function i(e, t, i) { return function (s) { i._trigger(e, s, t._uiHash(t)) } } this.reverting = !1; var s, n = []; if (!this._noFinalSort && this.currentItem.parent().length && this.placeholder.before(this.currentItem), this._noFinalSort = null, this.helper[0] === this.currentItem[0]) { for (s in this._storedCSS) ("auto" === this._storedCSS[s] || "static" === this._storedCSS[s]) && (this._storedCSS[s] = ""); this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") } else this.currentItem.show(); for (this.fromOutside && !t && n.push(function (e) { this._trigger("receive", e, this._uiHash(this.fromOutside)) }), !this.fromOutside && this.domPosition.prev === this.currentItem.prev().not(".ui-sortable-helper")[0] && this.domPosition.parent === this.currentItem.parent()[0] || t || n.push(function (e) { this._trigger("update", e, this._uiHash()) }), this !== this.currentContainer && (t || (n.push(function (e) { this._trigger("remove", e, this._uiHash()) }), n.push(function (e) { return function (t) { e._trigger("receive", t, this._uiHash(this)) } }.call(this, this.currentContainer)), n.push(function (e) { return function (t) { e._trigger("update", t, this._uiHash(this)) } }.call(this, this.currentContainer)))), s = this.containers.length - 1; s >= 0; s--) t || n.push(i("deactivate", this, this.containers[s])), this.containers[s].containerCache.over && (n.push(i("out", this, this.containers[s])), this.containers[s].containerCache.over = 0); if (this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), this._storedOpacity && this.helper.css("opacity", this._storedOpacity), this._storedZIndex && this.helper.css("zIndex", "auto" === this._storedZIndex ? "" : this._storedZIndex), this.dragging = !1, t || this._trigger("beforeStop", e, this._uiHash()), this.placeholder[0].parentNode.removeChild(this.placeholder[0]), this.cancelHelperRemoval || (this.helper[0] !== this.currentItem[0] && this.helper.remove(), this.helper = null), !t) { for (s = 0; n.length > s; s++) n[s].call(this, e); this._trigger("stop", e, this._uiHash()) } return this.fromOutside = !1, !this.cancelHelperRemoval }, _trigger: function () { e.Widget.prototype._trigger.apply(this, arguments) === !1 && this.cancel() }, _uiHash: function (t) { var i = t || this; return { helper: i.helper, placeholder: i.placeholder || e([]), position: i.position, originalPosition: i.originalPosition, offset: i.positionAbs, item: i.currentItem, sender: t ? t.element : null } } }), e.widget("ui.accordion", {
        version: "1.11.2", options: { active: 0, animate: {}, collapsible: !1, event: "click", header: "> li > :first-child,> :not(li):even", heightStyle: "auto", icons: { activeHeader: "ui-icon-triangle-1-s", header: "ui-icon-triangle-1-e" }, activate: null, beforeActivate: null }, hideProps: { borderTopWidth: "hide", borderBottomWidth: "hide", paddingTop: "hide", paddingBottom: "hide", height: "hide" }, showProps: { borderTopWidth: "show", borderBottomWidth: "show", paddingTop: "show", paddingBottom: "show", height: "show" }, _create: function () { var t = this.options; this.prevShow = this.prevHide = e(), this.element.addClass("ui-accordion ui-widget ui-helper-reset").attr("role", "tablist"), t.collapsible || t.active !== !1 && null != t.active || (t.active = 0), this._processPanels(), 0 > t.active && (t.active += this.headers.length), this._refresh() }, _getCreateEventData: function () { return { header: this.active, panel: this.active.length ? this.active.next() : e() } }, _createIcons: function () { var t = this.options.icons; t && (e("<span>").addClass("ui-accordion-header-icon ui-icon " + t.header).prependTo(this.headers), this.active.children(".ui-accordion-header-icon").removeClass(t.header).addClass(t.activeHeader), this.headers.addClass("ui-accordion-icons")) }, _destroyIcons: function () { this.headers.removeClass("ui-accordion-icons").children(".ui-accordion-header-icon").remove() }, _destroy: function () { var e; this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role"), this.headers.removeClass("ui-accordion-header ui-accordion-header-active ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("aria-controls").removeAttr("tabIndex").removeUniqueId(), this._destroyIcons(), e = this.headers.next().removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-state-disabled").css("display", "").removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-labelledby").removeUniqueId(), "content" !== this.options.heightStyle && e.css("height", "") }, _setOption: function (e, t) { return "active" === e ? (this._activate(t), void 0) : ("event" === e && (this.options.event && this._off(this.headers, this.options.event), this._setupEvents(t)), this._super(e, t), "collapsible" !== e || t || this.options.active !== !1 || this._activate(0), "icons" === e && (this._destroyIcons(), t && this._createIcons()), "disabled" === e && (this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t), this.headers.add(this.headers.next()).toggleClass("ui-state-disabled", !!t)), void 0) }, _keydown: function (t) { if (!t.altKey && !t.ctrlKey) { var i = e.ui.keyCode, s = this.headers.length, n = this.headers.index(t.target), a = !1; switch (t.keyCode) { case i.RIGHT: case i.DOWN: a = this.headers[(n + 1) % s]; break; case i.LEFT: case i.UP: a = this.headers[(n - 1 + s) % s]; break; case i.SPACE: case i.ENTER: this._eventHandler(t); break; case i.HOME: a = this.headers[0]; break; case i.END: a = this.headers[s - 1] } a && (e(t.target).attr("tabIndex", -1), e(a).attr("tabIndex", 0), a.focus(), t.preventDefault()) } }, _panelKeyDown: function (t) { t.keyCode === e.ui.keyCode.UP && t.ctrlKey && e(t.currentTarget).prev().focus() }, refresh: function () { var t = this.options; this._processPanels(), t.active === !1 && t.collapsible === !0 || !this.headers.length ? (t.active = !1, this.active = e()) : t.active === !1 ? this._activate(0) : this.active.length && !e.contains(this.element[0], this.active[0]) ? this.headers.length === this.headers.find(".ui-state-disabled").length ? (t.active = !1, this.active = e()) : this._activate(Math.max(0, t.active - 1)) : t.active = this.headers.index(this.active), this._destroyIcons(), this._refresh() }, _processPanels: function () { var e = this.headers, t = this.panels; this.headers = this.element.find(this.options.header).addClass("ui-accordion-header ui-state-default ui-corner-all"), this.panels = this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").filter(":not(.ui-accordion-content-active)").hide(), t && (this._off(e.not(this.headers)), this._off(t.not(this.panels))) }, _refresh: function () {
            var t, i = this.options, s = i.heightStyle, n = this.element.parent(); this.active = this._findActive(i.active).addClass("ui-accordion-header-active ui-state-active ui-corner-top").removeClass("ui-corner-all"), this.active.next().addClass("ui-accordion-content-active").show(), this.headers.attr("role", "tab").each(function () {
                var t = e(this), i = t.uniqueId().attr("id"), s = t.next(), n = s.uniqueId().attr("id");
                t.attr("aria-controls", n), s.attr("aria-labelledby", i)
            }).next().attr("role", "tabpanel"), this.headers.not(this.active).attr({ "aria-selected": "false", "aria-expanded": "false", tabIndex: -1 }).next().attr({ "aria-hidden": "true" }).hide(), this.active.length ? this.active.attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }).next().attr({ "aria-hidden": "false" }) : this.headers.eq(0).attr("tabIndex", 0), this._createIcons(), this._setupEvents(i.event), "fill" === s ? (t = n.height(), this.element.siblings(":visible").each(function () { var i = e(this), s = i.css("position"); "absolute" !== s && "fixed" !== s && (t -= i.outerHeight(!0)) }), this.headers.each(function () { t -= e(this).outerHeight(!0) }), this.headers.next().each(function () { e(this).height(Math.max(0, t - e(this).innerHeight() + e(this).height())) }).css("overflow", "auto")) : "auto" === s && (t = 0, this.headers.next().each(function () { t = Math.max(t, e(this).css("height", "").height()) }).height(t))
        }, _activate: function (t) { var i = this._findActive(t)[0]; i !== this.active[0] && (i = i || this.active[0], this._eventHandler({ target: i, currentTarget: i, preventDefault: e.noop })) }, _findActive: function (t) { return "number" == typeof t ? this.headers.eq(t) : e() }, _setupEvents: function (t) { var i = { keydown: "_keydown" }; t && e.each(t.split(" "), function (e, t) { i[t] = "_eventHandler" }), this._off(this.headers.add(this.headers.next())), this._on(this.headers, i), this._on(this.headers.next(), { keydown: "_panelKeyDown" }), this._hoverable(this.headers), this._focusable(this.headers) }, _eventHandler: function (t) { var i = this.options, s = this.active, n = e(t.currentTarget), a = n[0] === s[0], o = a && i.collapsible, r = o ? e() : n.next(), h = s.next(), l = { oldHeader: s, oldPanel: h, newHeader: o ? e() : n, newPanel: r }; t.preventDefault(), a && !i.collapsible || this._trigger("beforeActivate", t, l) === !1 || (i.active = o ? !1 : this.headers.index(n), this.active = a ? e() : n, this._toggle(l), s.removeClass("ui-accordion-header-active ui-state-active"), i.icons && s.children(".ui-accordion-header-icon").removeClass(i.icons.activeHeader).addClass(i.icons.header), a || (n.removeClass("ui-corner-all").addClass("ui-accordion-header-active ui-state-active ui-corner-top"), i.icons && n.children(".ui-accordion-header-icon").removeClass(i.icons.header).addClass(i.icons.activeHeader), n.next().addClass("ui-accordion-content-active"))) }, _toggle: function (t) { var i = t.newPanel, s = this.prevShow.length ? this.prevShow : t.oldPanel; this.prevShow.add(this.prevHide).stop(!0, !0), this.prevShow = i, this.prevHide = s, this.options.animate ? this._animate(i, s, t) : (s.hide(), i.show(), this._toggleComplete(t)), s.attr({ "aria-hidden": "true" }), s.prev().attr("aria-selected", "false"), i.length && s.length ? s.prev().attr({ tabIndex: -1, "aria-expanded": "false" }) : i.length && this.headers.filter(function () { return 0 === e(this).attr("tabIndex") }).attr("tabIndex", -1), i.attr("aria-hidden", "false").prev().attr({ "aria-selected": "true", tabIndex: 0, "aria-expanded": "true" }) }, _animate: function (e, t, i) { var s, n, a, o = this, r = 0, h = e.length && (!t.length || e.index() < t.index()), l = this.options.animate || {}, u = h && l.down || l, d = function () { o._toggleComplete(i) }; return "number" == typeof u && (a = u), "string" == typeof u && (n = u), n = n || u.easing || l.easing, a = a || u.duration || l.duration, t.length ? e.length ? (s = e.show().outerHeight(), t.animate(this.hideProps, { duration: a, easing: n, step: function (e, t) { t.now = Math.round(e) } }), e.hide().animate(this.showProps, { duration: a, easing: n, complete: d, step: function (e, i) { i.now = Math.round(e), "height" !== i.prop ? r += i.now : "content" !== o.options.heightStyle && (i.now = Math.round(s - t.outerHeight() - r), r = 0) } }), void 0) : t.animate(this.hideProps, a, n, d) : e.animate(this.showProps, a, n, d) }, _toggleComplete: function (e) { var t = e.oldPanel; t.removeClass("ui-accordion-content-active").prev().removeClass("ui-corner-top").addClass("ui-corner-all"), t.length && (t.parent()[0].className = t.parent()[0].className), this._trigger("activate", null, e) }
    }), e.widget("ui.menu", { version: "1.11.2", defaultElement: "<ul>", delay: 300, options: { icons: { submenu: "ui-icon-carat-1-e" }, items: "> *", menus: "ul", position: { my: "left-1 top", at: "right top" }, role: "menu", blur: null, focus: null, select: null }, _create: function () { this.activeMenu = this.element, this.mouseHandled = !1, this.element.uniqueId().addClass("ui-menu ui-widget ui-widget-content").toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length).attr({ role: this.options.role, tabIndex: 0 }), this.options.disabled && this.element.addClass("ui-state-disabled").attr("aria-disabled", "true"), this._on({ "mousedown .ui-menu-item": function (e) { e.preventDefault() }, "click .ui-menu-item": function (t) { var i = e(t.target); !this.mouseHandled && i.not(".ui-state-disabled").length && (this.select(t), t.isPropagationStopped() || (this.mouseHandled = !0), i.has(".ui-menu").length ? this.expand(t) : !this.element.is(":focus") && e(this.document[0].activeElement).closest(".ui-menu").length && (this.element.trigger("focus", [!0]), this.active && 1 === this.active.parents(".ui-menu").length && clearTimeout(this.timer))) }, "mouseenter .ui-menu-item": function (t) { if (!this.previousFilter) { var i = e(t.currentTarget); i.siblings(".ui-state-active").removeClass("ui-state-active"), this.focus(t, i) } }, mouseleave: "collapseAll", "mouseleave .ui-menu": "collapseAll", focus: function (e, t) { var i = this.active || this.element.find(this.options.items).eq(0); t || this.focus(e, i) }, blur: function (t) { this._delay(function () { e.contains(this.element[0], this.document[0].activeElement) || this.collapseAll(t) }) }, keydown: "_keydown" }), this.refresh(), this._on(this.document, { click: function (e) { this._closeOnDocumentClick(e) && this.collapseAll(e), this.mouseHandled = !1 } }) }, _destroy: function () { this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeClass("ui-menu ui-widget ui-widget-content ui-menu-icons ui-front").removeAttr("role").removeAttr("tabIndex").removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeAttr("aria-disabled").removeUniqueId().show(), this.element.find(".ui-menu-item").removeClass("ui-menu-item").removeAttr("role").removeAttr("aria-disabled").removeUniqueId().removeClass("ui-state-hover").removeAttr("tabIndex").removeAttr("role").removeAttr("aria-haspopup").children().each(function () { var t = e(this); t.data("ui-menu-submenu-carat") && t.remove() }), this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content") }, _keydown: function (t) { var i, s, n, a, o = !0; switch (t.keyCode) { case e.ui.keyCode.PAGE_UP: this.previousPage(t); break; case e.ui.keyCode.PAGE_DOWN: this.nextPage(t); break; case e.ui.keyCode.HOME: this._move("first", "first", t); break; case e.ui.keyCode.END: this._move("last", "last", t); break; case e.ui.keyCode.UP: this.previous(t); break; case e.ui.keyCode.DOWN: this.next(t); break; case e.ui.keyCode.LEFT: this.collapse(t); break; case e.ui.keyCode.RIGHT: this.active && !this.active.is(".ui-state-disabled") && this.expand(t); break; case e.ui.keyCode.ENTER: case e.ui.keyCode.SPACE: this._activate(t); break; case e.ui.keyCode.ESCAPE: this.collapse(t); break; default: o = !1, s = this.previousFilter || "", n = String.fromCharCode(t.keyCode), a = !1, clearTimeout(this.filterTimer), n === s ? a = !0 : n = s + n, i = this._filterMenuItems(n), i = a && -1 !== i.index(this.active.next()) ? this.active.nextAll(".ui-menu-item") : i, i.length || (n = String.fromCharCode(t.keyCode), i = this._filterMenuItems(n)), i.length ? (this.focus(t, i), this.previousFilter = n, this.filterTimer = this._delay(function () { delete this.previousFilter }, 1e3)) : delete this.previousFilter } o && t.preventDefault() }, _activate: function (e) { this.active.is(".ui-state-disabled") || (this.active.is("[aria-haspopup='true']") ? this.expand(e) : this.select(e)) }, refresh: function () { var t, i, s = this, n = this.options.icons.submenu, a = this.element.find(this.options.menus); this.element.toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length), a.filter(":not(.ui-menu)").addClass("ui-menu ui-widget ui-widget-content ui-front").hide().attr({ role: this.options.role, "aria-hidden": "true", "aria-expanded": "false" }).each(function () { var t = e(this), i = t.parent(), s = e("<span>").addClass("ui-menu-icon ui-icon " + n).data("ui-menu-submenu-carat", !0); i.attr("aria-haspopup", "true").prepend(s), t.attr("aria-labelledby", i.attr("id")) }), t = a.add(this.element), i = t.find(this.options.items), i.not(".ui-menu-item").each(function () { var t = e(this); s._isDivider(t) && t.addClass("ui-widget-content ui-menu-divider") }), i.not(".ui-menu-item, .ui-menu-divider").addClass("ui-menu-item").uniqueId().attr({ tabIndex: -1, role: this._itemRole() }), i.filter(".ui-state-disabled").attr("aria-disabled", "true"), this.active && !e.contains(this.element[0], this.active[0]) && this.blur() }, _itemRole: function () { return { menu: "menuitem", listbox: "option" }[this.options.role] }, _setOption: function (e, t) { "icons" === e && this.element.find(".ui-menu-icon").removeClass(this.options.icons.submenu).addClass(t.submenu), "disabled" === e && this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t), this._super(e, t) }, focus: function (e, t) { var i, s; this.blur(e, e && "focus" === e.type), this._scrollIntoView(t), this.active = t.first(), s = this.active.addClass("ui-state-focus").removeClass("ui-state-active"), this.options.role && this.element.attr("aria-activedescendant", s.attr("id")), this.active.parent().closest(".ui-menu-item").addClass("ui-state-active"), e && "keydown" === e.type ? this._close() : this.timer = this._delay(function () { this._close() }, this.delay), i = t.children(".ui-menu"), i.length && e && /^mouse/.test(e.type) && this._startOpening(i), this.activeMenu = t.parent(), this._trigger("focus", e, { item: t }) }, _scrollIntoView: function (t) { var i, s, n, a, o, r; this._hasScroll() && (i = parseFloat(e.css(this.activeMenu[0], "borderTopWidth")) || 0, s = parseFloat(e.css(this.activeMenu[0], "paddingTop")) || 0, n = t.offset().top - this.activeMenu.offset().top - i - s, a = this.activeMenu.scrollTop(), o = this.activeMenu.height(), r = t.outerHeight(), 0 > n ? this.activeMenu.scrollTop(a + n) : n + r > o && this.activeMenu.scrollTop(a + n - o + r)) }, blur: function (e, t) { t || clearTimeout(this.timer), this.active && (this.active.removeClass("ui-state-focus"), this.active = null, this._trigger("blur", e, { item: this.active })) }, _startOpening: function (e) { clearTimeout(this.timer), "true" === e.attr("aria-hidden") && (this.timer = this._delay(function () { this._close(), this._open(e) }, this.delay)) }, _open: function (t) { var i = e.extend({ of: this.active }, this.options.position); clearTimeout(this.timer), this.element.find(".ui-menu").not(t.parents(".ui-menu")).hide().attr("aria-hidden", "true"), t.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(i) }, collapseAll: function (t, i) { clearTimeout(this.timer), this.timer = this._delay(function () { var s = i ? this.element : e(t && t.target).closest(this.element.find(".ui-menu")); s.length || (s = this.element), this._close(s), this.blur(t), this.activeMenu = s }, this.delay) }, _close: function (e) { e || (e = this.active ? this.active.parent() : this.element), e.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false").end().find(".ui-state-active").not(".ui-state-focus").removeClass("ui-state-active") }, _closeOnDocumentClick: function (t) { return !e(t.target).closest(".ui-menu").length }, _isDivider: function (e) { return !/[^\-\u2014\u2013\s]/.test(e.text()) }, collapse: function (e) { var t = this.active && this.active.parent().closest(".ui-menu-item", this.element); t && t.length && (this._close(), this.focus(e, t)) }, expand: function (e) { var t = this.active && this.active.children(".ui-menu ").find(this.options.items).first(); t && t.length && (this._open(t.parent()), this._delay(function () { this.focus(e, t) })) }, next: function (e) { this._move("next", "first", e) }, previous: function (e) { this._move("prev", "last", e) }, isFirstItem: function () { return this.active && !this.active.prevAll(".ui-menu-item").length }, isLastItem: function () { return this.active && !this.active.nextAll(".ui-menu-item").length }, _move: function (e, t, i) { var s; this.active && (s = "first" === e || "last" === e ? this.active["first" === e ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1) : this.active[e + "All"](".ui-menu-item").eq(0)), s && s.length && this.active || (s = this.activeMenu.find(this.options.items)[t]()), this.focus(i, s) }, nextPage: function (t) { var i, s, n; return this.active ? (this.isLastItem() || (this._hasScroll() ? (s = this.active.offset().top, n = this.element.height(), this.active.nextAll(".ui-menu-item").each(function () { return i = e(this), 0 > i.offset().top - s - n }), this.focus(t, i)) : this.focus(t, this.activeMenu.find(this.options.items)[this.active ? "last" : "first"]())), void 0) : (this.next(t), void 0) }, previousPage: function (t) { var i, s, n; return this.active ? (this.isFirstItem() || (this._hasScroll() ? (s = this.active.offset().top, n = this.element.height(), this.active.prevAll(".ui-menu-item").each(function () { return i = e(this), i.offset().top - s + n > 0 }), this.focus(t, i)) : this.focus(t, this.activeMenu.find(this.options.items).first())), void 0) : (this.next(t), void 0) }, _hasScroll: function () { return this.element.outerHeight() < this.element.prop("scrollHeight") }, select: function (t) { this.active = this.active || e(t.target).closest(".ui-menu-item"); var i = { item: this.active }; this.active.has(".ui-menu").length || this.collapseAll(t, !0), this._trigger("select", t, i) }, _filterMenuItems: function (t) { var i = t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), s = RegExp("^" + i, "i"); return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function () { return s.test(e.trim(e(this).text())) }) } }), e.widget("ui.autocomplete", { version: "1.11.2", defaultElement: "<input>", options: { appendTo: null, autoFocus: !1, delay: 300, minLength: 1, position: { my: "left top", at: "left bottom", collision: "none" }, source: null, change: null, close: null, focus: null, open: null, response: null, search: null, select: null }, requestIndex: 0, pending: 0, _create: function () { var t, i, s, n = this.element[0].nodeName.toLowerCase(), a = "textarea" === n, o = "input" === n; this.isMultiLine = a ? !0 : o ? !1 : this.element.prop("isContentEditable"), this.valueMethod = this.element[a || o ? "val" : "text"], this.isNewMenu = !0, this.element.addClass("ui-autocomplete-input").attr("autocomplete", "off"), this._on(this.element, { keydown: function (n) { if (this.element.prop("readOnly")) return t = !0, s = !0, i = !0, void 0; t = !1, s = !1, i = !1; var a = e.ui.keyCode; switch (n.keyCode) { case a.PAGE_UP: t = !0, this._move("previousPage", n); break; case a.PAGE_DOWN: t = !0, this._move("nextPage", n); break; case a.UP: t = !0, this._keyEvent("previous", n); break; case a.DOWN: t = !0, this._keyEvent("next", n); break; case a.ENTER: this.menu.active && (t = !0, n.preventDefault(), this.menu.select(n)); break; case a.TAB: this.menu.active && this.menu.select(n); break; case a.ESCAPE: this.menu.element.is(":visible") && (this.isMultiLine || this._value(this.term), this.close(n), n.preventDefault()); break; default: i = !0, this._searchTimeout(n) } }, keypress: function (s) { if (t) return t = !1, (!this.isMultiLine || this.menu.element.is(":visible")) && s.preventDefault(), void 0; if (!i) { var n = e.ui.keyCode; switch (s.keyCode) { case n.PAGE_UP: this._move("previousPage", s); break; case n.PAGE_DOWN: this._move("nextPage", s); break; case n.UP: this._keyEvent("previous", s); break; case n.DOWN: this._keyEvent("next", s) } } }, input: function (e) { return s ? (s = !1, e.preventDefault(), void 0) : (this._searchTimeout(e), void 0) }, focus: function () { this.selectedItem = null, this.previous = this._value() }, blur: function (e) { return this.cancelBlur ? (delete this.cancelBlur, void 0) : (clearTimeout(this.searching), this.close(e), this._change(e), void 0) } }), this._initSource(), this.menu = e("<ul>").addClass("ui-autocomplete ui-front").appendTo(this._appendTo()).menu({ role: null }).hide().menu("instance"), this._on(this.menu.element, { mousedown: function (t) { t.preventDefault(), this.cancelBlur = !0, this._delay(function () { delete this.cancelBlur }); var i = this.menu.element[0]; e(t.target).closest(".ui-menu-item").length || this._delay(function () { var t = this; this.document.one("mousedown", function (s) { s.target === t.element[0] || s.target === i || e.contains(i, s.target) || t.close() }) }) }, menufocus: function (t, i) { var s, n; return this.isNewMenu && (this.isNewMenu = !1, t.originalEvent && /^mouse/.test(t.originalEvent.type)) ? (this.menu.blur(), this.document.one("mousemove", function () { e(t.target).trigger(t.originalEvent) }), void 0) : (n = i.item.data("ui-autocomplete-item"), !1 !== this._trigger("focus", t, { item: n }) && t.originalEvent && /^key/.test(t.originalEvent.type) && this._value(n.value), s = i.item.attr("aria-label") || n.value, s && e.trim(s).length && (this.liveRegion.children().hide(), e("<div>").text(s).appendTo(this.liveRegion)), void 0) }, menuselect: function (e, t) { var i = t.item.data("ui-autocomplete-item"), s = this.previous; this.element[0] !== this.document[0].activeElement && (this.element.focus(), this.previous = s, this._delay(function () { this.previous = s, this.selectedItem = i })), !1 !== this._trigger("select", e, { item: i }) && this._value(i.value), this.term = this._value(), this.close(e), this.selectedItem = i } }), this.liveRegion = e("<span>", { role: "status", "aria-live": "assertive", "aria-relevant": "additions" }).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body), this._on(this.window, { beforeunload: function () { this.element.removeAttr("autocomplete") } }) }, _destroy: function () { clearTimeout(this.searching), this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete"), this.menu.element.remove(), this.liveRegion.remove() }, _setOption: function (e, t) { this._super(e, t), "source" === e && this._initSource(), "appendTo" === e && this.menu.element.appendTo(this._appendTo()), "disabled" === e && t && this.xhr && this.xhr.abort() }, _appendTo: function () { var t = this.options.appendTo; return t && (t = t.jquery || t.nodeType ? e(t) : this.document.find(t).eq(0)), t && t[0] || (t = this.element.closest(".ui-front")), t.length || (t = this.document[0].body), t }, _initSource: function () { var t, i, s = this; e.isArray(this.options.source) ? (t = this.options.source, this.source = function (i, s) { s(e.ui.autocomplete.filter(t, i.term)) }) : "string" == typeof this.options.source ? (i = this.options.source, this.source = function (t, n) { s.xhr && s.xhr.abort(), s.xhr = e.ajax({ url: i, data: t, dataType: "json", success: function (e) { n(e) }, error: function () { n([]) } }) }) : this.source = this.options.source }, _searchTimeout: function (e) { clearTimeout(this.searching), this.searching = this._delay(function () { var t = this.term === this._value(), i = this.menu.element.is(":visible"), s = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey; (!t || t && !i && !s) && (this.selectedItem = null, this.search(null, e)) }, this.options.delay) }, search: function (e, t) { return e = null != e ? e : this._value(), this.term = this._value(), e.length < this.options.minLength ? this.close(t) : this._trigger("search", t) !== !1 ? this._search(e) : void 0 }, _search: function (e) { this.pending++, this.element.addClass("ui-autocomplete-loading"), this.cancelSearch = !1, this.source({ term: e }, this._response()) }, _response: function () { var t = ++this.requestIndex; return e.proxy(function (e) { t === this.requestIndex && this.__response(e), this.pending--, this.pending || this.element.removeClass("ui-autocomplete-loading") }, this) }, __response: function (e) { e && (e = this._normalize(e)), this._trigger("response", null, { content: e }), !this.options.disabled && e && e.length && !this.cancelSearch ? (this._suggest(e), this._trigger("open")) : this._close() }, close: function (e) { this.cancelSearch = !0, this._close(e) }, _close: function (e) { this.menu.element.is(":visible") && (this.menu.element.hide(), this.menu.blur(), this.isNewMenu = !0, this._trigger("close", e)) }, _change: function (e) { this.previous !== this._value() && this._trigger("change", e, { item: this.selectedItem }) }, _normalize: function (t) { return t.length && t[0].label && t[0].value ? t : e.map(t, function (t) { return "string" == typeof t ? { label: t, value: t } : e.extend({}, t, { label: t.label || t.value, value: t.value || t.label }) }) }, _suggest: function (t) { var i = this.menu.element.empty(); this._renderMenu(i, t), this.isNewMenu = !0, this.menu.refresh(), i.show(), this._resizeMenu(), i.position(e.extend({ of: this.element }, this.options.position)), this.options.autoFocus && this.menu.next() }, _resizeMenu: function () { var e = this.menu.element; e.outerWidth(Math.max(e.width("").outerWidth() + 1, this.element.outerWidth())) }, _renderMenu: function (t, i) { var s = this; e.each(i, function (e, i) { s._renderItemData(t, i) }) }, _renderItemData: function (e, t) { return this._renderItem(e, t).data("ui-autocomplete-item", t) }, _renderItem: function (t, i) { return e("<li>").text(i.label).appendTo(t) }, _move: function (e, t) { return this.menu.element.is(":visible") ? this.menu.isFirstItem() && /^previous/.test(e) || this.menu.isLastItem() && /^next/.test(e) ? (this.isMultiLine || this._value(this.term), this.menu.blur(), void 0) : (this.menu[e](t), void 0) : (this.search(null, t), void 0) }, widget: function () { return this.menu.element }, _value: function () { return this.valueMethod.apply(this.element, arguments) }, _keyEvent: function (e, t) { (!this.isMultiLine || this.menu.element.is(":visible")) && (this._move(e, t), t.preventDefault()) } }), e.extend(e.ui.autocomplete, { escapeRegex: function (e) { return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&") }, filter: function (t, i) { var s = RegExp(e.ui.autocomplete.escapeRegex(i), "i"); return e.grep(t, function (e) { return s.test(e.label || e.value || e) }) } }), e.widget("ui.autocomplete", e.ui.autocomplete, { options: { messages: { noResults: "No search results.", results: function (e) { return e + (e > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate." } } }, __response: function (t) { var i; this._superApply(arguments), this.options.disabled || this.cancelSearch || (i = t && t.length ? this.options.messages.results(t.length) : this.options.messages.noResults, this.liveRegion.children().hide(), e("<div>").text(i).appendTo(this.liveRegion)) } }), e.ui.autocomplete; var c, p = "ui-button ui-widget ui-state-default ui-corner-all", f = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only", m = function () { var t = e(this); setTimeout(function () { t.find(":ui-button").button("refresh") }, 1) }, g = function (t) { var i = t.name, s = t.form, n = e([]); return i && (i = i.replace(/'/g, "\\'"), n = s ? e(s).find("[name='" + i + "'][type=radio]") : e("[name='" + i + "'][type=radio]", t.ownerDocument).filter(function () { return !this.form })), n }; e.widget("ui.button", { version: "1.11.2", defaultElement: "<button>", options: { disabled: null, text: !0, label: null, icons: { primary: null, secondary: null } }, _create: function () { this.element.closest("form").unbind("reset" + this.eventNamespace).bind("reset" + this.eventNamespace, m), "boolean" != typeof this.options.disabled ? this.options.disabled = !!this.element.prop("disabled") : this.element.prop("disabled", this.options.disabled), this._determineButtonType(), this.hasTitle = !!this.buttonElement.attr("title"); var t = this, i = this.options, s = "checkbox" === this.type || "radio" === this.type, n = s ? "" : "ui-state-active"; null === i.label && (i.label = "input" === this.type ? this.buttonElement.val() : this.buttonElement.html()), this._hoverable(this.buttonElement), this.buttonElement.addClass(p).attr("role", "button").bind("mouseenter" + this.eventNamespace, function () { i.disabled || this === c && e(this).addClass("ui-state-active") }).bind("mouseleave" + this.eventNamespace, function () { i.disabled || e(this).removeClass(n) }).bind("click" + this.eventNamespace, function (e) { i.disabled && (e.preventDefault(), e.stopImmediatePropagation()) }), this._on({ focus: function () { this.buttonElement.addClass("ui-state-focus") }, blur: function () { this.buttonElement.removeClass("ui-state-focus") } }), s && this.element.bind("change" + this.eventNamespace, function () { t.refresh() }), "checkbox" === this.type ? this.buttonElement.bind("click" + this.eventNamespace, function () { return i.disabled ? !1 : void 0 }) : "radio" === this.type ? this.buttonElement.bind("click" + this.eventNamespace, function () { if (i.disabled) return !1; e(this).addClass("ui-state-active"), t.buttonElement.attr("aria-pressed", "true"); var s = t.element[0]; g(s).not(s).map(function () { return e(this).button("widget")[0] }).removeClass("ui-state-active").attr("aria-pressed", "false") }) : (this.buttonElement.bind("mousedown" + this.eventNamespace, function () { return i.disabled ? !1 : (e(this).addClass("ui-state-active"), c = this, t.document.one("mouseup", function () { c = null }), void 0) }).bind("mouseup" + this.eventNamespace, function () { return i.disabled ? !1 : (e(this).removeClass("ui-state-active"), void 0) }).bind("keydown" + this.eventNamespace, function (t) { return i.disabled ? !1 : ((t.keyCode === e.ui.keyCode.SPACE || t.keyCode === e.ui.keyCode.ENTER) && e(this).addClass("ui-state-active"), void 0) }).bind("keyup" + this.eventNamespace + " blur" + this.eventNamespace, function () { e(this).removeClass("ui-state-active") }), this.buttonElement.is("a") && this.buttonElement.keyup(function (t) { t.keyCode === e.ui.keyCode.SPACE && e(this).click() })), this._setOption("disabled", i.disabled), this._resetButton() }, _determineButtonType: function () { var e, t, i; this.type = this.element.is("[type=checkbox]") ? "checkbox" : this.element.is("[type=radio]") ? "radio" : this.element.is("input") ? "input" : "button", "checkbox" === this.type || "radio" === this.type ? (e = this.element.parents().last(), t = "label[for='" + this.element.attr("id") + "']", this.buttonElement = e.find(t), this.buttonElement.length || (e = e.length ? e.siblings() : this.element.siblings(), this.buttonElement = e.filter(t), this.buttonElement.length || (this.buttonElement = e.find(t))), this.element.addClass("ui-helper-hidden-accessible"), i = this.element.is(":checked"), i && this.buttonElement.addClass("ui-state-active"), this.buttonElement.prop("aria-pressed", i)) : this.buttonElement = this.element }, widget: function () { return this.buttonElement }, _destroy: function () { this.element.removeClass("ui-helper-hidden-accessible"), this.buttonElement.removeClass(p + " ui-state-active " + f).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html()), this.hasTitle || this.buttonElement.removeAttr("title") }, _setOption: function (e, t) { return this._super(e, t), "disabled" === e ? (this.widget().toggleClass("ui-state-disabled", !!t), this.element.prop("disabled", !!t), t && ("checkbox" === this.type || "radio" === this.type ? this.buttonElement.removeClass("ui-state-focus") : this.buttonElement.removeClass("ui-state-focus ui-state-active")), void 0) : (this._resetButton(), void 0) }, refresh: function () { var t = this.element.is("input, button") ? this.element.is(":disabled") : this.element.hasClass("ui-button-disabled"); t !== this.options.disabled && this._setOption("disabled", t), "radio" === this.type ? g(this.element[0]).each(function () { e(this).is(":checked") ? e(this).button("widget").addClass("ui-state-active").attr("aria-pressed", "true") : e(this).button("widget").removeClass("ui-state-active").attr("aria-pressed", "false") }) : "checkbox" === this.type && (this.element.is(":checked") ? this.buttonElement.addClass("ui-state-active").attr("aria-pressed", "true") : this.buttonElement.removeClass("ui-state-active").attr("aria-pressed", "false")) }, _resetButton: function () { if ("input" === this.type) return this.options.label && this.element.val(this.options.label), void 0; var t = this.buttonElement.removeClass(f), i = e("<span></span>", this.document[0]).addClass("ui-button-text").html(this.options.label).appendTo(t.empty()).text(), s = this.options.icons, n = s.primary && s.secondary, a = []; s.primary || s.secondary ? (this.options.text && a.push("ui-button-text-icon" + (n ? "s" : s.primary ? "-primary" : "-secondary")), s.primary && t.prepend("<span class='ui-button-icon-primary ui-icon " + s.primary + "'></span>"), s.secondary && t.append("<span class='ui-button-icon-secondary ui-icon " + s.secondary + "'></span>"), this.options.text || (a.push(n ? "ui-button-icons-only" : "ui-button-icon-only"), this.hasTitle || t.attr("title", e.trim(i)))) : a.push("ui-button-text-only"), t.addClass(a.join(" ")) } }), e.widget("ui.buttonset", { version: "1.11.2", options: { items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(ui-button)" }, _create: function () { this.element.addClass("ui-buttonset") }, _init: function () { this.refresh() }, _setOption: function (e, t) { "disabled" === e && this.buttons.button("option", e, t), this._super(e, t) }, refresh: function () { var t = "rtl" === this.element.css("direction"), i = this.element.find(this.options.items), s = i.filter(":ui-button"); i.not(":ui-button").button(), s.button("refresh"), this.buttons = i.map(function () { return e(this).button("widget")[0] }).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(t ? "ui-corner-right" : "ui-corner-left").end().filter(":last").addClass(t ? "ui-corner-left" : "ui-corner-right").end().end() }, _destroy: function () { this.element.removeClass("ui-buttonset"), this.buttons.map(function () { return e(this).button("widget")[0] }).removeClass("ui-corner-left ui-corner-right").end().button("destroy") } }), e.ui.button, e.extend(e.ui, { datepicker: { version: "1.11.2" } }); var v; e.extend(n.prototype, {
        markerClassName: "hasDatepicker", maxRows: 4, _widgetDatepicker: function () { return this.dpDiv }, setDefaults: function (e) { return r(this._defaults, e || {}), this }, _attachDatepicker: function (t, i) { var s, n, a; s = t.nodeName.toLowerCase(), n = "div" === s || "span" === s, t.id || (this.uuid += 1, t.id = "dp" + this.uuid), a = this._newInst(e(t), n), a.settings = e.extend({}, i || {}), "input" === s ? this._connectDatepicker(t, a) : n && this._inlineDatepicker(t, a) }, _newInst: function (t, i) { var s = t[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"); return { id: s, input: t, selectedDay: 0, selectedMonth: 0, selectedYear: 0, drawMonth: 0, drawYear: 0, inline: i, dpDiv: i ? a(e("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) : this.dpDiv } }, _connectDatepicker: function (t, i) { var s = e(t); i.append = e([]), i.trigger = e([]), s.hasClass(this.markerClassName) || (this._attachments(s, i), s.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp), this._autoSize(i), e.data(t, "datepicker", i), i.settings.disabled && this._disableDatepicker(t)) }, _attachments: function (t, i) { var s, n, a, o = this._get(i, "appendText"), r = this._get(i, "isRTL"); i.append && i.append.remove(), o && (i.append = e("<span class='" + this._appendClass + "'>" + o + "</span>"), t[r ? "before" : "after"](i.append)), t.unbind("focus", this._showDatepicker), i.trigger && i.trigger.remove(), s = this._get(i, "showOn"), ("focus" === s || "both" === s) && t.focus(this._showDatepicker), ("button" === s || "both" === s) && (n = this._get(i, "buttonText"), a = this._get(i, "buttonImage"), i.trigger = e(this._get(i, "buttonImageOnly") ? e("<img/>").addClass(this._triggerClass).attr({ src: a, alt: n, title: n }) : e("<button type='button'></button>").addClass(this._triggerClass).html(a ? e("<img/>").attr({ src: a, alt: n, title: n }) : n)), t[r ? "before" : "after"](i.trigger), i.trigger.click(function () { return e.datepicker._datepickerShowing && e.datepicker._lastInput === t[0] ? e.datepicker._hideDatepicker() : e.datepicker._datepickerShowing && e.datepicker._lastInput !== t[0] ? (e.datepicker._hideDatepicker(), e.datepicker._showDatepicker(t[0])) : e.datepicker._showDatepicker(t[0]), !1 })) }, _autoSize: function (e) { if (this._get(e, "autoSize") && !e.inline) { var t, i, s, n, a = new Date(2009, 11, 20), o = this._get(e, "dateFormat"); o.match(/[DM]/) && (t = function (e) { for (i = 0, s = 0, n = 0; e.length > n; n++) e[n].length > i && (i = e[n].length, s = n); return s }, a.setMonth(t(this._get(e, o.match(/MM/) ? "monthNames" : "monthNamesShort"))), a.setDate(t(this._get(e, o.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - a.getDay())), e.input.attr("size", this._formatDate(e, a).length) } }, _inlineDatepicker: function (t, i) { var s = e(t); s.hasClass(this.markerClassName) || (s.addClass(this.markerClassName).append(i.dpDiv), e.data(t, "datepicker", i), this._setDate(i, this._getDefaultDate(i), !0), this._updateDatepicker(i), this._updateAlternate(i), i.settings.disabled && this._disableDatepicker(t), i.dpDiv.css("display", "block")) }, _dialogDatepicker: function (t, i, s, n, a) { var o, h, l, u, d, c = this._dialogInst; return c || (this.uuid += 1, o = "dp" + this.uuid, this._dialogInput = e("<input type='text' id='" + o + "' style='position: absolute; top: -100px; width: 0px;'/>"), this._dialogInput.keydown(this._doKeyDown), e("body").append(this._dialogInput), c = this._dialogInst = this._newInst(this._dialogInput, !1), c.settings = {}, e.data(this._dialogInput[0], "datepicker", c)), r(c.settings, n || {}), i = i && i.constructor === Date ? this._formatDate(c, i) : i, this._dialogInput.val(i), this._pos = a ? a.length ? a : [a.pageX, a.pageY] : null, this._pos || (h = document.documentElement.clientWidth, l = document.documentElement.clientHeight, u = document.documentElement.scrollLeft || document.body.scrollLeft, d = document.documentElement.scrollTop || document.body.scrollTop, this._pos = [h / 2 - 100 + u, l / 2 - 150 + d]), this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px"), c.settings.onSelect = s, this._inDialog = !0, this.dpDiv.addClass(this._dialogClass), this._showDatepicker(this._dialogInput[0]), e.blockUI && e.blockUI(this.dpDiv), e.data(this._dialogInput[0], "datepicker", c), this }, _destroyDatepicker: function (t) {
            var i, s = e(t), n = e.data(t, "datepicker"); s.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), e.removeData(t, "datepicker"), "input" === i ? (n.append.remove(), n.trigger.remove(), s.removeClass(this.markerClassName).unbind("focus", this._showDatepicker).unbind("keydown", this._doKeyDown).unbind("keypress", this._doKeyPress).unbind("keyup", this._doKeyUp)) : ("div" === i || "span" === i) && s.removeClass(this.markerClassName).empty())
        }, _enableDatepicker: function (t) { var i, s, n = e(t), a = e.data(t, "datepicker"); n.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), "input" === i ? (t.disabled = !1, a.trigger.filter("button").each(function () { this.disabled = !1 }).end().filter("img").css({ opacity: "1.0", cursor: "" })) : ("div" === i || "span" === i) && (s = n.children("." + this._inlineClass), s.children().removeClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !1)), this._disabledInputs = e.map(this._disabledInputs, function (e) { return e === t ? null : e })) }, _disableDatepicker: function (t) { var i, s, n = e(t), a = e.data(t, "datepicker"); n.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), "input" === i ? (t.disabled = !0, a.trigger.filter("button").each(function () { this.disabled = !0 }).end().filter("img").css({ opacity: "0.5", cursor: "default" })) : ("div" === i || "span" === i) && (s = n.children("." + this._inlineClass), s.children().addClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !0)), this._disabledInputs = e.map(this._disabledInputs, function (e) { return e === t ? null : e }), this._disabledInputs[this._disabledInputs.length] = t) }, _isDisabledDatepicker: function (e) { if (!e) return !1; for (var t = 0; this._disabledInputs.length > t; t++) if (this._disabledInputs[t] === e) return !0; return !1 }, _getInst: function (t) { try { return e.data(t, "datepicker") } catch (i) { throw "Missing instance data for this datepicker" } }, _optionDatepicker: function (t, i, s) { var n, a, o, h, l = this._getInst(t); return 2 === arguments.length && "string" == typeof i ? "defaults" === i ? e.extend({}, e.datepicker._defaults) : l ? "all" === i ? e.extend({}, l.settings) : this._get(l, i) : null : (n = i || {}, "string" == typeof i && (n = {}, n[i] = s), l && (this._curInst === l && this._hideDatepicker(), a = this._getDateDatepicker(t, !0), o = this._getMinMaxDate(l, "min"), h = this._getMinMaxDate(l, "max"), r(l.settings, n), null !== o && void 0 !== n.dateFormat && void 0 === n.minDate && (l.settings.minDate = this._formatDate(l, o)), null !== h && void 0 !== n.dateFormat && void 0 === n.maxDate && (l.settings.maxDate = this._formatDate(l, h)), "disabled" in n && (n.disabled ? this._disableDatepicker(t) : this._enableDatepicker(t)), this._attachments(e(t), l), this._autoSize(l), this._setDate(l, a), this._updateAlternate(l), this._updateDatepicker(l)), void 0) }, _changeDatepicker: function (e, t, i) { this._optionDatepicker(e, t, i) }, _refreshDatepicker: function (e) { var t = this._getInst(e); t && this._updateDatepicker(t) }, _setDateDatepicker: function (e, t) { var i = this._getInst(e); i && (this._setDate(i, t), this._updateDatepicker(i), this._updateAlternate(i)) }, _getDateDatepicker: function (e, t) { var i = this._getInst(e); return i && !i.inline && this._setDateFromField(i, t), i ? this._getDate(i) : null }, _doKeyDown: function (t) { var i, s, n, a = e.datepicker._getInst(t.target), o = !0, r = a.dpDiv.is(".ui-datepicker-rtl"); if (a._keyEvent = !0, e.datepicker._datepickerShowing) switch (t.keyCode) { case 9: e.datepicker._hideDatepicker(), o = !1; break; case 13: return n = e("td." + e.datepicker._dayOverClass + ":not(." + e.datepicker._currentClass + ")", a.dpDiv), n[0] && e.datepicker._selectDay(t.target, a.selectedMonth, a.selectedYear, n[0]), i = e.datepicker._get(a, "onSelect"), i ? (s = e.datepicker._formatDate(a), i.apply(a.input ? a.input[0] : null, [s, a])) : e.datepicker._hideDatepicker(), !1; case 27: e.datepicker._hideDatepicker(); break; case 33: e.datepicker._adjustDate(t.target, t.ctrlKey ? -e.datepicker._get(a, "stepBigMonths") : -e.datepicker._get(a, "stepMonths"), "M"); break; case 34: e.datepicker._adjustDate(t.target, t.ctrlKey ? +e.datepicker._get(a, "stepBigMonths") : +e.datepicker._get(a, "stepMonths"), "M"); break; case 35: (t.ctrlKey || t.metaKey) && e.datepicker._clearDate(t.target), o = t.ctrlKey || t.metaKey; break; case 36: (t.ctrlKey || t.metaKey) && e.datepicker._gotoToday(t.target), o = t.ctrlKey || t.metaKey; break; case 37: (t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, r ? 1 : -1, "D"), o = t.ctrlKey || t.metaKey, t.originalEvent.altKey && e.datepicker._adjustDate(t.target, t.ctrlKey ? -e.datepicker._get(a, "stepBigMonths") : -e.datepicker._get(a, "stepMonths"), "M"); break; case 38: (t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, -7, "D"), o = t.ctrlKey || t.metaKey; break; case 39: (t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, r ? -1 : 1, "D"), o = t.ctrlKey || t.metaKey, t.originalEvent.altKey && e.datepicker._adjustDate(t.target, t.ctrlKey ? +e.datepicker._get(a, "stepBigMonths") : +e.datepicker._get(a, "stepMonths"), "M"); break; case 40: (t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, 7, "D"), o = t.ctrlKey || t.metaKey; break; default: o = !1 } else 36 === t.keyCode && t.ctrlKey ? e.datepicker._showDatepicker(this) : o = !1; o && (t.preventDefault(), t.stopPropagation()) }, _doKeyPress: function (t) { var i, s, n = e.datepicker._getInst(t.target); return e.datepicker._get(n, "constrainInput") ? (i = e.datepicker._possibleChars(e.datepicker._get(n, "dateFormat")), s = String.fromCharCode(null == t.charCode ? t.keyCode : t.charCode), t.ctrlKey || t.metaKey || " " > s || !i || i.indexOf(s) > -1) : void 0 }, _doKeyUp: function (t) { var i, s = e.datepicker._getInst(t.target); if (s.input.val() !== s.lastVal) try { i = e.datepicker.parseDate(e.datepicker._get(s, "dateFormat"), s.input ? s.input.val() : null, e.datepicker._getFormatConfig(s)), i && (e.datepicker._setDateFromField(s), e.datepicker._updateAlternate(s), e.datepicker._updateDatepicker(s)) } catch (n) { } return !0 }, _showDatepicker: function (t) { if (t = t.target || t, "input" !== t.nodeName.toLowerCase() && (t = e("input", t.parentNode)[0]), !e.datepicker._isDisabledDatepicker(t) && e.datepicker._lastInput !== t) { var i, n, a, o, h, l, u; i = e.datepicker._getInst(t), e.datepicker._curInst && e.datepicker._curInst !== i && (e.datepicker._curInst.dpDiv.stop(!0, !0), i && e.datepicker._datepickerShowing && e.datepicker._hideDatepicker(e.datepicker._curInst.input[0])), n = e.datepicker._get(i, "beforeShow"), a = n ? n.apply(t, [t, i]) : {}, a !== !1 && (r(i.settings, a), i.lastVal = null, e.datepicker._lastInput = t, e.datepicker._setDateFromField(i), e.datepicker._inDialog && (t.value = ""), e.datepicker._pos || (e.datepicker._pos = e.datepicker._findPos(t), e.datepicker._pos[1] += t.offsetHeight), o = !1, e(t).parents().each(function () { return o |= "fixed" === e(this).css("position"), !o }), h = { left: e.datepicker._pos[0], top: e.datepicker._pos[1] }, e.datepicker._pos = null, i.dpDiv.empty(), i.dpDiv.css({ position: "absolute", display: "block", top: "-1000px" }), e.datepicker._updateDatepicker(i), h = e.datepicker._checkOffset(i, h, o), i.dpDiv.css({ position: e.datepicker._inDialog && e.blockUI ? "static" : o ? "fixed" : "absolute", display: "none", left: h.left + "px", top: h.top + "px" }), i.inline || (l = e.datepicker._get(i, "showAnim"), u = e.datepicker._get(i, "duration"), i.dpDiv.css("z-index", s(e(t)) + 1), e.datepicker._datepickerShowing = !0, e.effects && e.effects.effect[l] ? i.dpDiv.show(l, e.datepicker._get(i, "showOptions"), u) : i.dpDiv[l || "show"](l ? u : null), e.datepicker._shouldFocusInput(i) && i.input.focus(), e.datepicker._curInst = i)) } }, _updateDatepicker: function (t) { this.maxRows = 4, v = t, t.dpDiv.empty().append(this._generateHTML(t)), this._attachHandlers(t); var i, s = this._getNumberOfMonths(t), n = s[1], a = 17, r = t.dpDiv.find("." + this._dayOverClass + " a"); r.length > 0 && o.apply(r.get(0)), t.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""), n > 1 && t.dpDiv.addClass("ui-datepicker-multi-" + n).css("width", a * n + "em"), t.dpDiv[(1 !== s[0] || 1 !== s[1] ? "add" : "remove") + "Class"]("ui-datepicker-multi"), t.dpDiv[(this._get(t, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl"), t === e.datepicker._curInst && e.datepicker._datepickerShowing && e.datepicker._shouldFocusInput(t) && t.input.focus(), t.yearshtml && (i = t.yearshtml, setTimeout(function () { i === t.yearshtml && t.yearshtml && t.dpDiv.find("select.ui-datepicker-year:first").replaceWith(t.yearshtml), i = t.yearshtml = null }, 0)) }, _shouldFocusInput: function (e) { return e.input && e.input.is(":visible") && !e.input.is(":disabled") && !e.input.is(":focus") }, _checkOffset: function (t, i, s) { var n = t.dpDiv.outerWidth(), a = t.dpDiv.outerHeight(), o = t.input ? t.input.outerWidth() : 0, r = t.input ? t.input.outerHeight() : 0, h = document.documentElement.clientWidth + (s ? 0 : e(document).scrollLeft()), l = document.documentElement.clientHeight + (s ? 0 : e(document).scrollTop()); return i.left -= this._get(t, "isRTL") ? n - o : 0, i.left -= s && i.left === t.input.offset().left ? e(document).scrollLeft() : 0, i.top -= s && i.top === t.input.offset().top + r ? e(document).scrollTop() : 0, i.left -= Math.min(i.left, i.left + n > h && h > n ? Math.abs(i.left + n - h) : 0), i.top -= Math.min(i.top, i.top + a > l && l > a ? Math.abs(a + r) : 0), i }, _findPos: function (t) { for (var i, s = this._getInst(t), n = this._get(s, "isRTL") ; t && ("hidden" === t.type || 1 !== t.nodeType || e.expr.filters.hidden(t)) ;) t = t[n ? "previousSibling" : "nextSibling"]; return i = e(t).offset(), [i.left, i.top] }, _hideDatepicker: function (t) { var i, s, n, a, o = this._curInst; !o || t && o !== e.data(t, "datepicker") || this._datepickerShowing && (i = this._get(o, "showAnim"), s = this._get(o, "duration"), n = function () { e.datepicker._tidyDialog(o) }, e.effects && (e.effects.effect[i] || e.effects[i]) ? o.dpDiv.hide(i, e.datepicker._get(o, "showOptions"), s, n) : o.dpDiv["slideDown" === i ? "slideUp" : "fadeIn" === i ? "fadeOut" : "hide"](i ? s : null, n), i || n(), this._datepickerShowing = !1, a = this._get(o, "onClose"), a && a.apply(o.input ? o.input[0] : null, [o.input ? o.input.val() : "", o]), this._lastInput = null, this._inDialog && (this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" }), e.blockUI && (e.unblockUI(), e("body").append(this.dpDiv))), this._inDialog = !1) }, _tidyDialog: function (e) { e.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar") }, _checkExternalClick: function (t) { if (e.datepicker._curInst) { var i = e(t.target), s = e.datepicker._getInst(i[0]); (i[0].id !== e.datepicker._mainDivId && 0 === i.parents("#" + e.datepicker._mainDivId).length && !i.hasClass(e.datepicker.markerClassName) && !i.closest("." + e.datepicker._triggerClass).length && e.datepicker._datepickerShowing && (!e.datepicker._inDialog || !e.blockUI) || i.hasClass(e.datepicker.markerClassName) && e.datepicker._curInst !== s) && e.datepicker._hideDatepicker() } }, _adjustDate: function (t, i, s) { var n = e(t), a = this._getInst(n[0]); this._isDisabledDatepicker(n[0]) || (this._adjustInstDate(a, i + ("M" === s ? this._get(a, "showCurrentAtPos") : 0), s), this._updateDatepicker(a)) }, _gotoToday: function (t) { var i, s = e(t), n = this._getInst(s[0]); this._get(n, "gotoCurrent") && n.currentDay ? (n.selectedDay = n.currentDay, n.drawMonth = n.selectedMonth = n.currentMonth, n.drawYear = n.selectedYear = n.currentYear) : (i = new Date, n.selectedDay = i.getDate(), n.drawMonth = n.selectedMonth = i.getMonth(), n.drawYear = n.selectedYear = i.getFullYear()), this._notifyChange(n), this._adjustDate(s) }, _selectMonthYear: function (t, i, s) { var n = e(t), a = this._getInst(n[0]); a["selected" + ("M" === s ? "Month" : "Year")] = a["draw" + ("M" === s ? "Month" : "Year")] = parseInt(i.options[i.selectedIndex].value, 10), this._notifyChange(a), this._adjustDate(n) }, _selectDay: function (t, i, s, n) { var a, o = e(t); e(n).hasClass(this._unselectableClass) || this._isDisabledDatepicker(o[0]) || (a = this._getInst(o[0]), a.selectedDay = a.currentDay = e("a", n).html(), a.selectedMonth = a.currentMonth = i, a.selectedYear = a.currentYear = s, this._selectDate(t, this._formatDate(a, a.currentDay, a.currentMonth, a.currentYear))) }, _clearDate: function (t) { var i = e(t); this._selectDate(i, "") }, _selectDate: function (t, i) { var s, n = e(t), a = this._getInst(n[0]); i = null != i ? i : this._formatDate(a), a.input && a.input.val(i), this._updateAlternate(a), s = this._get(a, "onSelect"), s ? s.apply(a.input ? a.input[0] : null, [i, a]) : a.input && a.input.trigger("change"), a.inline ? this._updateDatepicker(a) : (this._hideDatepicker(), this._lastInput = a.input[0], "object" != typeof a.input[0] && a.input.focus(), this._lastInput = null) }, _updateAlternate: function (t) { var i, s, n, a = this._get(t, "altField"); a && (i = this._get(t, "altFormat") || this._get(t, "dateFormat"), s = this._getDate(t), n = this.formatDate(i, s, this._getFormatConfig(t)), e(a).each(function () { e(this).val(n) })) }, noWeekends: function (e) { var t = e.getDay(); return [t > 0 && 6 > t, ""] }, iso8601Week: function (e) { var t, i = new Date(e.getTime()); return i.setDate(i.getDate() + 4 - (i.getDay() || 7)), t = i.getTime(), i.setMonth(0), i.setDate(1), Math.floor(Math.round((t - i) / 864e5) / 7) + 1 }, parseDate: function (t, i, s) { if (null == t || null == i) throw "Invalid arguments"; if (i = "object" == typeof i ? "" + i : i + "", "" === i) return null; var n, a, o, r, h = 0, l = (s ? s.shortYearCutoff : null) || this._defaults.shortYearCutoff, u = "string" != typeof l ? l : (new Date).getFullYear() % 100 + parseInt(l, 10), d = (s ? s.dayNamesShort : null) || this._defaults.dayNamesShort, c = (s ? s.dayNames : null) || this._defaults.dayNames, p = (s ? s.monthNamesShort : null) || this._defaults.monthNamesShort, f = (s ? s.monthNames : null) || this._defaults.monthNames, m = -1, g = -1, v = -1, y = -1, b = !1, _ = function (e) { var i = t.length > n + 1 && t.charAt(n + 1) === e; return i && n++, i }, x = function (e) { var t = _(e), s = "@" === e ? 14 : "!" === e ? 20 : "y" === e && t ? 4 : "o" === e ? 3 : 2, n = "y" === e ? s : 1, a = RegExp("^\\d{" + n + "," + s + "}"), o = i.substring(h).match(a); if (!o) throw "Missing number at position " + h; return h += o[0].length, parseInt(o[0], 10) }, w = function (t, s, n) { var a = -1, o = e.map(_(t) ? n : s, function (e, t) { return [[t, e]] }).sort(function (e, t) { return -(e[1].length - t[1].length) }); if (e.each(o, function (e, t) { var s = t[1]; return i.substr(h, s.length).toLowerCase() === s.toLowerCase() ? (a = t[0], h += s.length, !1) : void 0 }), -1 !== a) return a + 1; throw "Unknown name at position " + h }, k = function () { if (i.charAt(h) !== t.charAt(n)) throw "Unexpected literal at position " + h; h++ }; for (n = 0; t.length > n; n++) if (b) "'" !== t.charAt(n) || _("'") ? k() : b = !1; else switch (t.charAt(n)) { case "d": v = x("d"); break; case "D": w("D", d, c); break; case "o": y = x("o"); break; case "m": g = x("m"); break; case "M": g = w("M", p, f); break; case "y": m = x("y"); break; case "@": r = new Date(x("@")), m = r.getFullYear(), g = r.getMonth() + 1, v = r.getDate(); break; case "!": r = new Date((x("!") - this._ticksTo1970) / 1e4), m = r.getFullYear(), g = r.getMonth() + 1, v = r.getDate(); break; case "'": _("'") ? k() : b = !0; break; default: k() } if (i.length > h && (o = i.substr(h), !/^\s+/.test(o))) throw "Extra/unparsed characters found in date: " + o; if (-1 === m ? m = (new Date).getFullYear() : 100 > m && (m += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (u >= m ? 0 : -100)), y > -1) for (g = 1, v = y; ;) { if (a = this._getDaysInMonth(m, g - 1), a >= v) break; g++, v -= a } if (r = this._daylightSavingAdjust(new Date(m, g - 1, v)), r.getFullYear() !== m || r.getMonth() + 1 !== g || r.getDate() !== v) throw "Invalid date"; return r }, ATOM: "yy-mm-dd", COOKIE: "D, dd M yy", ISO_8601: "yy-mm-dd", RFC_822: "D, d M y", RFC_850: "DD, dd-M-y", RFC_1036: "D, d M y", RFC_1123: "D, d M yy", RFC_2822: "D, d M yy", RSS: "D, d M y", TICKS: "!", TIMESTAMP: "@", W3C: "yy-mm-dd", _ticksTo1970: 1e7 * 60 * 60 * 24 * (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)), formatDate: function (e, t, i) { if (!t) return ""; var s, n = (i ? i.dayNamesShort : null) || this._defaults.dayNamesShort, a = (i ? i.dayNames : null) || this._defaults.dayNames, o = (i ? i.monthNamesShort : null) || this._defaults.monthNamesShort, r = (i ? i.monthNames : null) || this._defaults.monthNames, h = function (t) { var i = e.length > s + 1 && e.charAt(s + 1) === t; return i && s++, i }, l = function (e, t, i) { var s = "" + t; if (h(e)) for (; i > s.length;) s = "0" + s; return s }, u = function (e, t, i, s) { return h(e) ? s[t] : i[t] }, d = "", c = !1; if (t) for (s = 0; e.length > s; s++) if (c) "'" !== e.charAt(s) || h("'") ? d += e.charAt(s) : c = !1; else switch (e.charAt(s)) { case "d": d += l("d", t.getDate(), 2); break; case "D": d += u("D", t.getDay(), n, a); break; case "o": d += l("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3); break; case "m": d += l("m", t.getMonth() + 1, 2); break; case "M": d += u("M", t.getMonth(), o, r); break; case "y": d += h("y") ? t.getFullYear() : (10 > t.getYear() % 100 ? "0" : "") + t.getYear() % 100; break; case "@": d += t.getTime(); break; case "!": d += 1e4 * t.getTime() + this._ticksTo1970; break; case "'": h("'") ? d += "'" : c = !0; break; default: d += e.charAt(s) } return d }, _possibleChars: function (e) { var t, i = "", s = !1, n = function (i) { var s = e.length > t + 1 && e.charAt(t + 1) === i; return s && t++, s }; for (t = 0; e.length > t; t++) if (s) "'" !== e.charAt(t) || n("'") ? i += e.charAt(t) : s = !1; else switch (e.charAt(t)) { case "d": case "m": case "y": case "@": i += "0123456789"; break; case "D": case "M": return null; case "'": n("'") ? i += "'" : s = !0; break; default: i += e.charAt(t) } return i }, _get: function (e, t) { return void 0 !== e.settings[t] ? e.settings[t] : this._defaults[t] }, _setDateFromField: function (e, t) { if (e.input.val() !== e.lastVal) { var i = this._get(e, "dateFormat"), s = e.lastVal = e.input ? e.input.val() : null, n = this._getDefaultDate(e), a = n, o = this._getFormatConfig(e); try { a = this.parseDate(i, s, o) || n } catch (r) { s = t ? "" : s } e.selectedDay = a.getDate(), e.drawMonth = e.selectedMonth = a.getMonth(), e.drawYear = e.selectedYear = a.getFullYear(), e.currentDay = s ? a.getDate() : 0, e.currentMonth = s ? a.getMonth() : 0, e.currentYear = s ? a.getFullYear() : 0, this._adjustInstDate(e) } }, _getDefaultDate: function (e) { return this._restrictMinMax(e, this._determineDate(e, this._get(e, "defaultDate"), new Date)) }, _determineDate: function (t, i, s) { var n = function (e) { var t = new Date; return t.setDate(t.getDate() + e), t }, a = function (i) { try { return e.datepicker.parseDate(e.datepicker._get(t, "dateFormat"), i, e.datepicker._getFormatConfig(t)) } catch (s) { } for (var n = (i.toLowerCase().match(/^c/) ? e.datepicker._getDate(t) : null) || new Date, a = n.getFullYear(), o = n.getMonth(), r = n.getDate(), h = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, l = h.exec(i) ; l;) { switch (l[2] || "d") { case "d": case "D": r += parseInt(l[1], 10); break; case "w": case "W": r += 7 * parseInt(l[1], 10); break; case "m": case "M": o += parseInt(l[1], 10), r = Math.min(r, e.datepicker._getDaysInMonth(a, o)); break; case "y": case "Y": a += parseInt(l[1], 10), r = Math.min(r, e.datepicker._getDaysInMonth(a, o)) } l = h.exec(i) } return new Date(a, o, r) }, o = null == i || "" === i ? s : "string" == typeof i ? a(i) : "number" == typeof i ? isNaN(i) ? s : n(i) : new Date(i.getTime()); return o = o && "Invalid Date" == "" + o ? s : o, o && (o.setHours(0), o.setMinutes(0), o.setSeconds(0), o.setMilliseconds(0)), this._daylightSavingAdjust(o) }, _daylightSavingAdjust: function (e) { return e ? (e.setHours(e.getHours() > 12 ? e.getHours() + 2 : 0), e) : null }, _setDate: function (e, t, i) { var s = !t, n = e.selectedMonth, a = e.selectedYear, o = this._restrictMinMax(e, this._determineDate(e, t, new Date)); e.selectedDay = e.currentDay = o.getDate(), e.drawMonth = e.selectedMonth = e.currentMonth = o.getMonth(), e.drawYear = e.selectedYear = e.currentYear = o.getFullYear(), n === e.selectedMonth && a === e.selectedYear || i || this._notifyChange(e), this._adjustInstDate(e), e.input && e.input.val(s ? "" : this._formatDate(e)) }, _getDate: function (e) { var t = !e.currentYear || e.input && "" === e.input.val() ? null : this._daylightSavingAdjust(new Date(e.currentYear, e.currentMonth, e.currentDay)); return t }, _attachHandlers: function (t) { var i = this._get(t, "stepMonths"), s = "#" + t.id.replace(/\\\\/g, "\\"); t.dpDiv.find("[data-handler]").map(function () { var t = { prev: function () { e.datepicker._adjustDate(s, -i, "M") }, next: function () { e.datepicker._adjustDate(s, +i, "M") }, hide: function () { e.datepicker._hideDatepicker() }, today: function () { e.datepicker._gotoToday(s) }, selectDay: function () { return e.datepicker._selectDay(s, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this), !1 }, selectMonth: function () { return e.datepicker._selectMonthYear(s, this, "M"), !1 }, selectYear: function () { return e.datepicker._selectMonthYear(s, this, "Y"), !1 } }; e(this).bind(this.getAttribute("data-event"), t[this.getAttribute("data-handler")]) }) }, _generateHTML: function (e) { var t, i, s, n, a, o, r, h, l, u, d, c, p, f, m, g, v, y, b, _, x, w, k, T, D, S, M, C, N, A, P, I, z, H, F, E, O, j, W, L = new Date, R = this._daylightSavingAdjust(new Date(L.getFullYear(), L.getMonth(), L.getDate())), Y = this._get(e, "isRTL"), B = this._get(e, "showButtonPanel"), J = this._get(e, "hideIfNoPrevNext"), q = this._get(e, "navigationAsDateFormat"), K = this._getNumberOfMonths(e), V = this._get(e, "showCurrentAtPos"), U = this._get(e, "stepMonths"), Q = 1 !== K[0] || 1 !== K[1], G = this._daylightSavingAdjust(e.currentDay ? new Date(e.currentYear, e.currentMonth, e.currentDay) : new Date(9999, 9, 9)), X = this._getMinMaxDate(e, "min"), $ = this._getMinMaxDate(e, "max"), Z = e.drawMonth - V, et = e.drawYear; if (0 > Z && (Z += 12, et--), $) for (t = this._daylightSavingAdjust(new Date($.getFullYear(), $.getMonth() - K[0] * K[1] + 1, $.getDate())), t = X && X > t ? X : t; this._daylightSavingAdjust(new Date(et, Z, 1)) > t;) Z--, 0 > Z && (Z = 11, et--); for (e.drawMonth = Z, e.drawYear = et, i = this._get(e, "prevText"), i = q ? this.formatDate(i, this._daylightSavingAdjust(new Date(et, Z - U, 1)), this._getFormatConfig(e)) : i, s = this._canAdjustMonth(e, -1, et, Z) ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>" : J ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>", n = this._get(e, "nextText"), n = q ? this.formatDate(n, this._daylightSavingAdjust(new Date(et, Z + U, 1)), this._getFormatConfig(e)) : n, a = this._canAdjustMonth(e, 1, et, Z) ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='" + n + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + n + "</span></a>" : J ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + n + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + n + "</span></a>", o = this._get(e, "currentText"), r = this._get(e, "gotoCurrent") && e.currentDay ? G : R, o = q ? this.formatDate(o, r, this._getFormatConfig(e)) : o, h = e.inline ? "" : "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" + this._get(e, "closeText") + "</button>", l = B ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (Y ? h : "") + (this._isInRange(e, r) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>" + o + "</button>" : "") + (Y ? "" : h) + "</div>" : "", u = parseInt(this._get(e, "firstDay"), 10), u = isNaN(u) ? 0 : u, d = this._get(e, "showWeek"), c = this._get(e, "dayNames"), p = this._get(e, "dayNamesMin"), f = this._get(e, "monthNames"), m = this._get(e, "monthNamesShort"), g = this._get(e, "beforeShowDay"), v = this._get(e, "showOtherMonths"), y = this._get(e, "selectOtherMonths"), b = this._getDefaultDate(e), _ = "", w = 0; K[0] > w; w++) { for (k = "", this.maxRows = 4, T = 0; K[1] > T; T++) { if (D = this._daylightSavingAdjust(new Date(et, Z, e.selectedDay)), S = " ui-corner-all", M = "", Q) { if (M += "<div class='ui-datepicker-group", K[1] > 1) switch (T) { case 0: M += " ui-datepicker-group-first", S = " ui-corner-" + (Y ? "right" : "left"); break; case K[1] - 1: M += " ui-datepicker-group-last", S = " ui-corner-" + (Y ? "left" : "right"); break; default: M += " ui-datepicker-group-middle", S = "" } M += "'>" } for (M += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + S + "'>" + (/all|left/.test(S) && 0 === w ? Y ? a : s : "") + (/all|right/.test(S) && 0 === w ? Y ? s : a : "") + this._generateMonthYearHeader(e, Z, et, X, $, w > 0 || T > 0, f, m) + "</div><table class='ui-datepicker-calendar'><thead>" + "<tr>", C = d ? "<th class='ui-datepicker-week-col'>" + this._get(e, "weekHeader") + "</th>" : "", x = 0; 7 > x; x++) N = (x + u) % 7, C += "<th scope='col'" + ((x + u + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" + "<span title='" + c[N] + "'>" + p[N] + "</span></th>"; for (M += C + "</tr></thead><tbody>", A = this._getDaysInMonth(et, Z), et === e.selectedYear && Z === e.selectedMonth && (e.selectedDay = Math.min(e.selectedDay, A)), P = (this._getFirstDayOfMonth(et, Z) - u + 7) % 7, I = Math.ceil((P + A) / 7), z = Q ? this.maxRows > I ? this.maxRows : I : I, this.maxRows = z, H = this._daylightSavingAdjust(new Date(et, Z, 1 - P)), F = 0; z > F; F++) { for (M += "<tr>", E = d ? "<td class='ui-datepicker-week-col'>" + this._get(e, "calculateWeek")(H) + "</td>" : "", x = 0; 7 > x; x++) O = g ? g.apply(e.input ? e.input[0] : null, [H]) : [!0, ""], j = H.getMonth() !== Z, W = j && !y || !O[0] || X && X > H || $ && H > $, E += "<td class='" + ((x + u + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + (j ? " ui-datepicker-other-month" : "") + (H.getTime() === D.getTime() && Z === e.selectedMonth && e._keyEvent || b.getTime() === H.getTime() && b.getTime() === D.getTime() ? " " + this._dayOverClass : "") + (W ? " " + this._unselectableClass + " ui-state-disabled" : "") + (j && !v ? "" : " " + O[1] + (H.getTime() === G.getTime() ? " " + this._currentClass : "") + (H.getTime() === R.getTime() ? " ui-datepicker-today" : "")) + "'" + (j && !v || !O[2] ? "" : " title='" + O[2].replace(/'/g, "&#39;") + "'") + (W ? "" : " data-handler='selectDay' data-event='click' data-month='" + H.getMonth() + "' data-year='" + H.getFullYear() + "'") + ">" + (j && !v ? "&#xa0;" : W ? "<span class='ui-state-default'>" + H.getDate() + "</span>" : "<a class='ui-state-default" + (H.getTime() === R.getTime() ? " ui-state-highlight" : "") + (H.getTime() === G.getTime() ? " ui-state-active" : "") + (j ? " ui-priority-secondary" : "") + "' href='#'>" + H.getDate() + "</a>") + "</td>", H.setDate(H.getDate() + 1), H = this._daylightSavingAdjust(H); M += E + "</tr>" } Z++, Z > 11 && (Z = 0, et++), M += "</tbody></table>" + (Q ? "</div>" + (K[0] > 0 && T === K[1] - 1 ? "<div class='ui-datepicker-row-break'></div>" : "") : ""), k += M } _ += k } return _ += l, e._keyEvent = !1, _ }, _generateMonthYearHeader: function (e, t, i, s, n, a, o, r) { var h, l, u, d, c, p, f, m, g = this._get(e, "changeMonth"), v = this._get(e, "changeYear"), y = this._get(e, "showMonthAfterYear"), b = "<div class='ui-datepicker-title'>", _ = ""; if (a || !g) _ += "<span class='ui-datepicker-month'>" + o[t] + "</span>"; else { for (h = s && s.getFullYear() === i, l = n && n.getFullYear() === i, _ += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>", u = 0; 12 > u; u++) (!h || u >= s.getMonth()) && (!l || n.getMonth() >= u) && (_ += "<option value='" + u + "'" + (u === t ? " selected='selected'" : "") + ">" + r[u] + "</option>"); _ += "</select>" } if (y || (b += _ + (!a && g && v ? "" : "&#xa0;")), !e.yearshtml) if (e.yearshtml = "", a || !v) b += "<span class='ui-datepicker-year'>" + i + "</span>"; else { for (d = this._get(e, "yearRange").split(":"), c = (new Date).getFullYear(), p = function (e) { var t = e.match(/c[+\-].*/) ? i + parseInt(e.substring(1), 10) : e.match(/[+\-].*/) ? c + parseInt(e, 10) : parseInt(e, 10); return isNaN(t) ? c : t }, f = p(d[0]), m = Math.max(f, p(d[1] || "")), f = s ? Math.max(f, s.getFullYear()) : f, m = n ? Math.min(m, n.getFullYear()) : m, e.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>"; m >= f; f++) e.yearshtml += "<option value='" + f + "'" + (f === i ? " selected='selected'" : "") + ">" + f + "</option>"; e.yearshtml += "</select>", b += e.yearshtml, e.yearshtml = null } return b += this._get(e, "yearSuffix"), y && (b += (!a && g && v ? "" : "&#xa0;") + _), b += "</div>" }, _adjustInstDate: function (e, t, i) { var s = e.drawYear + ("Y" === i ? t : 0), n = e.drawMonth + ("M" === i ? t : 0), a = Math.min(e.selectedDay, this._getDaysInMonth(s, n)) + ("D" === i ? t : 0), o = this._restrictMinMax(e, this._daylightSavingAdjust(new Date(s, n, a))); e.selectedDay = o.getDate(), e.drawMonth = e.selectedMonth = o.getMonth(), e.drawYear = e.selectedYear = o.getFullYear(), ("M" === i || "Y" === i) && this._notifyChange(e) }, _restrictMinMax: function (e, t) { var i = this._getMinMaxDate(e, "min"), s = this._getMinMaxDate(e, "max"), n = i && i > t ? i : t; return s && n > s ? s : n }, _notifyChange: function (e) { var t = this._get(e, "onChangeMonthYear"); t && t.apply(e.input ? e.input[0] : null, [e.selectedYear, e.selectedMonth + 1, e]) }, _getNumberOfMonths: function (e) { var t = this._get(e, "numberOfMonths"); return null == t ? [1, 1] : "number" == typeof t ? [1, t] : t }, _getMinMaxDate: function (e, t) { return this._determineDate(e, this._get(e, t + "Date"), null) }, _getDaysInMonth: function (e, t) { return 32 - this._daylightSavingAdjust(new Date(e, t, 32)).getDate() }, _getFirstDayOfMonth: function (e, t) { return new Date(e, t, 1).getDay() }, _canAdjustMonth: function (e, t, i, s) { var n = this._getNumberOfMonths(e), a = this._daylightSavingAdjust(new Date(i, s + (0 > t ? t : n[0] * n[1]), 1)); return 0 > t && a.setDate(this._getDaysInMonth(a.getFullYear(), a.getMonth())), this._isInRange(e, a) }, _isInRange: function (e, t) { var i, s, n = this._getMinMaxDate(e, "min"), a = this._getMinMaxDate(e, "max"), o = null, r = null, h = this._get(e, "yearRange"); return h && (i = h.split(":"), s = (new Date).getFullYear(), o = parseInt(i[0], 10), r = parseInt(i[1], 10), i[0].match(/[+\-].*/) && (o += s), i[1].match(/[+\-].*/) && (r += s)), (!n || t.getTime() >= n.getTime()) && (!a || t.getTime() <= a.getTime()) && (!o || t.getFullYear() >= o) && (!r || r >= t.getFullYear()) }, _getFormatConfig: function (e) { var t = this._get(e, "shortYearCutoff"); return t = "string" != typeof t ? t : (new Date).getFullYear() % 100 + parseInt(t, 10), { shortYearCutoff: t, dayNamesShort: this._get(e, "dayNamesShort"), dayNames: this._get(e, "dayNames"), monthNamesShort: this._get(e, "monthNamesShort"), monthNames: this._get(e, "monthNames") } }, _formatDate: function (e, t, i, s) { t || (e.currentDay = e.selectedDay, e.currentMonth = e.selectedMonth, e.currentYear = e.selectedYear); var n = t ? "object" == typeof t ? t : this._daylightSavingAdjust(new Date(s, i, t)) : this._daylightSavingAdjust(new Date(e.currentYear, e.currentMonth, e.currentDay)); return this.formatDate(this._get(e, "dateFormat"), n, this._getFormatConfig(e)) }
    }), e.fn.datepicker = function (t) { if (!this.length) return this; e.datepicker.initialized || (e(document).mousedown(e.datepicker._checkExternalClick), e.datepicker.initialized = !0), 0 === e("#" + e.datepicker._mainDivId).length && e("body").append(e.datepicker.dpDiv); var i = Array.prototype.slice.call(arguments, 1); return "string" != typeof t || "isDisabled" !== t && "getDate" !== t && "widget" !== t ? "option" === t && 2 === arguments.length && "string" == typeof arguments[1] ? e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this[0]].concat(i)) : this.each(function () { "string" == typeof t ? e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this].concat(i)) : e.datepicker._attachDatepicker(this, t) }) : e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this[0]].concat(i)) }, e.datepicker = new n, e.datepicker.initialized = !1, e.datepicker.uuid = (new Date).getTime(), e.datepicker.version = "1.11.2", e.datepicker, e.widget("ui.dialog", {
        version: "1.11.2", options: { appendTo: "body", autoOpen: !0, buttons: [], closeOnEscape: !0, closeText: "Close", dialogClass: "", draggable: !0, hide: null, height: "auto", maxHeight: null, maxWidth: null, minHeight: 150, minWidth: 150, modal: !1, position: { my: "center", at: "center", of: window, collision: "fit", using: function (t) { var i = e(this).css(t).offset().top; 0 > i && e(this).css("top", t.top - i) } }, resizable: !0, show: null, title: null, width: 300, beforeClose: null, close: null, drag: null, dragStart: null, dragStop: null, focus: null, open: null, resize: null, resizeStart: null, resizeStop: null }, sizeRelatedOptions: { buttons: !0, height: !0, maxHeight: !0, maxWidth: !0, minHeight: !0, minWidth: !0, width: !0 }, resizableRelatedOptions: { maxHeight: !0, maxWidth: !0, minHeight: !0, minWidth: !0 }, _create: function () { this.originalCss = { display: this.element[0].style.display, width: this.element[0].style.width, minHeight: this.element[0].style.minHeight, maxHeight: this.element[0].style.maxHeight, height: this.element[0].style.height }, this.originalPosition = { parent: this.element.parent(), index: this.element.parent().children().index(this.element) }, this.originalTitle = this.element.attr("title"), this.options.title = this.options.title || this.originalTitle, this._createWrapper(), this.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(this.uiDialog), this._createTitlebar(), this._createButtonPane(), this.options.draggable && e.fn.draggable && this._makeDraggable(), this.options.resizable && e.fn.resizable && this._makeResizable(), this._isOpen = !1, this._trackFocus() }, _init: function () { this.options.autoOpen && this.open() }, _appendTo: function () { var t = this.options.appendTo; return t && (t.jquery || t.nodeType) ? e(t) : this.document.find(t || "body").eq(0) }, _destroy: function () { var e, t = this.originalPosition; this._destroyOverlay(), this.element.removeUniqueId().removeClass("ui-dialog-content ui-widget-content").css(this.originalCss).detach(), this.uiDialog.stop(!0, !0).remove(), this.originalTitle && this.element.attr("title", this.originalTitle), e = t.parent.children().eq(t.index), e.length && e[0] !== this.element[0] ? e.before(this.element) : t.parent.append(this.element) }, widget: function () { return this.uiDialog }, disable: e.noop, enable: e.noop, close: function (t) { var i, s = this; if (this._isOpen && this._trigger("beforeClose", t) !== !1) { if (this._isOpen = !1, this._focusedElement = null, this._destroyOverlay(), this._untrackInstance(), !this.opener.filter(":focusable").focus().length) try { i = this.document[0].activeElement, i && "body" !== i.nodeName.toLowerCase() && e(i).blur() } catch (n) { } this._hide(this.uiDialog, this.options.hide, function () { s._trigger("close", t) }) } }, isOpen: function () { return this._isOpen }, moveToTop: function () { this._moveToTop() }, _moveToTop: function (t, i) { var s = !1, n = this.uiDialog.siblings(".ui-front:visible").map(function () { return +e(this).css("z-index") }).get(), a = Math.max.apply(null, n); return a >= +this.uiDialog.css("z-index") && (this.uiDialog.css("z-index", a + 1), s = !0), s && !i && this._trigger("focus", t), s }, open: function () { var t = this; return this._isOpen ? (this._moveToTop() && this._focusTabbable(), void 0) : (this._isOpen = !0, this.opener = e(this.document[0].activeElement), this._size(), this._position(), this._createOverlay(), this._moveToTop(null, !0), this.overlay && this.overlay.css("z-index", this.uiDialog.css("z-index") - 1), this._show(this.uiDialog, this.options.show, function () { t._focusTabbable(), t._trigger("focus") }), this._makeFocusTarget(), this._trigger("open"), void 0) }, _focusTabbable: function () {
            var e = this._focusedElement;
            e || (e = this.element.find("[autofocus]")), e.length || (e = this.element.find(":tabbable")), e.length || (e = this.uiDialogButtonPane.find(":tabbable")), e.length || (e = this.uiDialogTitlebarClose.filter(":tabbable")), e.length || (e = this.uiDialog), e.eq(0).focus()
        }, _keepFocus: function (t) { function i() { var t = this.document[0].activeElement, i = this.uiDialog[0] === t || e.contains(this.uiDialog[0], t); i || this._focusTabbable() } t.preventDefault(), i.call(this), this._delay(i) }, _createWrapper: function () { this.uiDialog = e("<div>").addClass("ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " + this.options.dialogClass).hide().attr({ tabIndex: -1, role: "dialog" }).appendTo(this._appendTo()), this._on(this.uiDialog, { keydown: function (t) { if (this.options.closeOnEscape && !t.isDefaultPrevented() && t.keyCode && t.keyCode === e.ui.keyCode.ESCAPE) return t.preventDefault(), this.close(t), void 0; if (t.keyCode === e.ui.keyCode.TAB && !t.isDefaultPrevented()) { var i = this.uiDialog.find(":tabbable"), s = i.filter(":first"), n = i.filter(":last"); t.target !== n[0] && t.target !== this.uiDialog[0] || t.shiftKey ? t.target !== s[0] && t.target !== this.uiDialog[0] || !t.shiftKey || (this._delay(function () { n.focus() }), t.preventDefault()) : (this._delay(function () { s.focus() }), t.preventDefault()) } }, mousedown: function (e) { this._moveToTop(e) && this._focusTabbable() } }), this.element.find("[aria-describedby]").length || this.uiDialog.attr({ "aria-describedby": this.element.uniqueId().attr("id") }) }, _createTitlebar: function () { var t; this.uiDialogTitlebar = e("<div>").addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(this.uiDialog), this._on(this.uiDialogTitlebar, { mousedown: function (t) { e(t.target).closest(".ui-dialog-titlebar-close") || this.uiDialog.focus() } }), this.uiDialogTitlebarClose = e("<button type='button'></button>").button({ label: this.options.closeText, icons: { primary: "ui-icon-closethick" }, text: !1 }).addClass("ui-dialog-titlebar-close").appendTo(this.uiDialogTitlebar), this._on(this.uiDialogTitlebarClose, { click: function (e) { e.preventDefault(), this.close(e) } }), t = e("<span>").uniqueId().addClass("ui-dialog-title").prependTo(this.uiDialogTitlebar), this._title(t), this.uiDialog.attr({ "aria-labelledby": t.attr("id") }) }, _title: function (e) { this.options.title || e.html("&#160;"), e.text(this.options.title) }, _createButtonPane: function () { this.uiDialogButtonPane = e("<div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"), this.uiButtonSet = e("<div>").addClass("ui-dialog-buttonset").appendTo(this.uiDialogButtonPane), this._createButtons() }, _createButtons: function () { var t = this, i = this.options.buttons; return this.uiDialogButtonPane.remove(), this.uiButtonSet.empty(), e.isEmptyObject(i) || e.isArray(i) && !i.length ? (this.uiDialog.removeClass("ui-dialog-buttons"), void 0) : (e.each(i, function (i, s) { var n, a; s = e.isFunction(s) ? { click: s, text: i } : s, s = e.extend({ type: "button" }, s), n = s.click, s.click = function () { n.apply(t.element[0], arguments) }, a = { icons: s.icons, text: s.showText }, delete s.icons, delete s.showText, e("<button></button>", s).button(a).appendTo(t.uiButtonSet) }), this.uiDialog.addClass("ui-dialog-buttons"), this.uiDialogButtonPane.appendTo(this.uiDialog), void 0) }, _makeDraggable: function () { function t(e) { return { position: e.position, offset: e.offset } } var i = this, s = this.options; this.uiDialog.draggable({ cancel: ".ui-dialog-content, .ui-dialog-titlebar-close", handle: ".ui-dialog-titlebar", containment: "document", start: function (s, n) { e(this).addClass("ui-dialog-dragging"), i._blockFrames(), i._trigger("dragStart", s, t(n)) }, drag: function (e, s) { i._trigger("drag", e, t(s)) }, stop: function (n, a) { var o = a.offset.left - i.document.scrollLeft(), r = a.offset.top - i.document.scrollTop(); s.position = { my: "left top", at: "left" + (o >= 0 ? "+" : "") + o + " " + "top" + (r >= 0 ? "+" : "") + r, of: i.window }, e(this).removeClass("ui-dialog-dragging"), i._unblockFrames(), i._trigger("dragStop", n, t(a)) } }) }, _makeResizable: function () { function t(e) { return { originalPosition: e.originalPosition, originalSize: e.originalSize, position: e.position, size: e.size } } var i = this, s = this.options, n = s.resizable, a = this.uiDialog.css("position"), o = "string" == typeof n ? n : "n,e,s,w,se,sw,ne,nw"; this.uiDialog.resizable({ cancel: ".ui-dialog-content", containment: "document", alsoResize: this.element, maxWidth: s.maxWidth, maxHeight: s.maxHeight, minWidth: s.minWidth, minHeight: this._minHeight(), handles: o, start: function (s, n) { e(this).addClass("ui-dialog-resizing"), i._blockFrames(), i._trigger("resizeStart", s, t(n)) }, resize: function (e, s) { i._trigger("resize", e, t(s)) }, stop: function (n, a) { var o = i.uiDialog.offset(), r = o.left - i.document.scrollLeft(), h = o.top - i.document.scrollTop(); s.height = i.uiDialog.height(), s.width = i.uiDialog.width(), s.position = { my: "left top", at: "left" + (r >= 0 ? "+" : "") + r + " " + "top" + (h >= 0 ? "+" : "") + h, of: i.window }, e(this).removeClass("ui-dialog-resizing"), i._unblockFrames(), i._trigger("resizeStop", n, t(a)) } }).css("position", a) }, _trackFocus: function () { this._on(this.widget(), { focusin: function (t) { this._makeFocusTarget(), this._focusedElement = e(t.target) } }) }, _makeFocusTarget: function () { this._untrackInstance(), this._trackingInstances().unshift(this) }, _untrackInstance: function () { var t = this._trackingInstances(), i = e.inArray(this, t); -1 !== i && t.splice(i, 1) }, _trackingInstances: function () { var e = this.document.data("ui-dialog-instances"); return e || (e = [], this.document.data("ui-dialog-instances", e)), e }, _minHeight: function () { var e = this.options; return "auto" === e.height ? e.minHeight : Math.min(e.minHeight, e.height) }, _position: function () { var e = this.uiDialog.is(":visible"); e || this.uiDialog.show(), this.uiDialog.position(this.options.position), e || this.uiDialog.hide() }, _setOptions: function (t) { var i = this, s = !1, n = {}; e.each(t, function (e, t) { i._setOption(e, t), e in i.sizeRelatedOptions && (s = !0), e in i.resizableRelatedOptions && (n[e] = t) }), s && (this._size(), this._position()), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", n) }, _setOption: function (e, t) { var i, s, n = this.uiDialog; "dialogClass" === e && n.removeClass(this.options.dialogClass).addClass(t), "disabled" !== e && (this._super(e, t), "appendTo" === e && this.uiDialog.appendTo(this._appendTo()), "buttons" === e && this._createButtons(), "closeText" === e && this.uiDialogTitlebarClose.button({ label: "" + t }), "draggable" === e && (i = n.is(":data(ui-draggable)"), i && !t && n.draggable("destroy"), !i && t && this._makeDraggable()), "position" === e && this._position(), "resizable" === e && (s = n.is(":data(ui-resizable)"), s && !t && n.resizable("destroy"), s && "string" == typeof t && n.resizable("option", "handles", t), s || t === !1 || this._makeResizable()), "title" === e && this._title(this.uiDialogTitlebar.find(".ui-dialog-title"))) }, _size: function () { var e, t, i, s = this.options; this.element.show().css({ width: "auto", minHeight: 0, maxHeight: "none", height: 0 }), s.minWidth > s.width && (s.width = s.minWidth), e = this.uiDialog.css({ height: "auto", width: s.width }).outerHeight(), t = Math.max(0, s.minHeight - e), i = "number" == typeof s.maxHeight ? Math.max(0, s.maxHeight - e) : "none", "auto" === s.height ? this.element.css({ minHeight: t, maxHeight: i, height: "auto" }) : this.element.height(Math.max(0, s.height - e)), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", "minHeight", this._minHeight()) }, _blockFrames: function () { this.iframeBlocks = this.document.find("iframe").map(function () { var t = e(this); return e("<div>").css({ position: "absolute", width: t.outerWidth(), height: t.outerHeight() }).appendTo(t.parent()).offset(t.offset())[0] }) }, _unblockFrames: function () { this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks) }, _allowInteraction: function (t) { return e(t.target).closest(".ui-dialog").length ? !0 : !!e(t.target).closest(".ui-datepicker").length }, _createOverlay: function () { if (this.options.modal) { var t = !0; this._delay(function () { t = !1 }), this.document.data("ui-dialog-overlays") || this._on(this.document, { focusin: function (e) { t || this._allowInteraction(e) || (e.preventDefault(), this._trackingInstances()[0]._focusTabbable()) } }), this.overlay = e("<div>").addClass("ui-widget-overlay ui-front").appendTo(this._appendTo()), this._on(this.overlay, { mousedown: "_keepFocus" }), this.document.data("ui-dialog-overlays", (this.document.data("ui-dialog-overlays") || 0) + 1) } }, _destroyOverlay: function () { if (this.options.modal && this.overlay) { var e = this.document.data("ui-dialog-overlays") - 1; e ? this.document.data("ui-dialog-overlays", e) : this.document.unbind("focusin").removeData("ui-dialog-overlays"), this.overlay.remove(), this.overlay = null } }
    }), e.widget("ui.progressbar", { version: "1.11.2", options: { max: 100, value: 0, change: null, complete: null }, min: 0, _create: function () { this.oldValue = this.options.value = this._constrainedValue(), this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({ role: "progressbar", "aria-valuemin": this.min }), this.valueDiv = e("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element), this._refreshValue() }, _destroy: function () { this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow"), this.valueDiv.remove() }, value: function (e) { return void 0 === e ? this.options.value : (this.options.value = this._constrainedValue(e), this._refreshValue(), void 0) }, _constrainedValue: function (e) { return void 0 === e && (e = this.options.value), this.indeterminate = e === !1, "number" != typeof e && (e = 0), this.indeterminate ? !1 : Math.min(this.options.max, Math.max(this.min, e)) }, _setOptions: function (e) { var t = e.value; delete e.value, this._super(e), this.options.value = this._constrainedValue(t), this._refreshValue() }, _setOption: function (e, t) { "max" === e && (t = Math.max(this.min, t)), "disabled" === e && this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t), this._super(e, t) }, _percentage: function () { return this.indeterminate ? 100 : 100 * (this.options.value - this.min) / (this.options.max - this.min) }, _refreshValue: function () { var t = this.options.value, i = this._percentage(); this.valueDiv.toggle(this.indeterminate || t > this.min).toggleClass("ui-corner-right", t === this.options.max).width(i.toFixed(0) + "%"), this.element.toggleClass("ui-progressbar-indeterminate", this.indeterminate), this.indeterminate ? (this.element.removeAttr("aria-valuenow"), this.overlayDiv || (this.overlayDiv = e("<div class='ui-progressbar-overlay'></div>").appendTo(this.valueDiv))) : (this.element.attr({ "aria-valuemax": this.options.max, "aria-valuenow": t }), this.overlayDiv && (this.overlayDiv.remove(), this.overlayDiv = null)), this.oldValue !== t && (this.oldValue = t, this._trigger("change")), t === this.options.max && this._trigger("complete") } }), e.widget("ui.selectmenu", { version: "1.11.2", defaultElement: "<select>", options: { appendTo: null, disabled: null, icons: { button: "ui-icon-triangle-1-s" }, position: { my: "left top", at: "left bottom", collision: "none" }, width: null, change: null, close: null, focus: null, open: null, select: null }, _create: function () { var e = this.element.uniqueId().attr("id"); this.ids = { element: e, button: e + "-button", menu: e + "-menu" }, this._drawButton(), this._drawMenu(), this.options.disabled && this.disable() }, _drawButton: function () { var t = this, i = this.element.attr("tabindex"); this.label = e("label[for='" + this.ids.element + "']").attr("for", this.ids.button), this._on(this.label, { click: function (e) { this.button.focus(), e.preventDefault() } }), this.element.hide(), this.button = e("<span>", { "class": "ui-selectmenu-button ui-widget ui-state-default ui-corner-all", tabindex: i || this.options.disabled ? -1 : 0, id: this.ids.button, role: "combobox", "aria-expanded": "false", "aria-autocomplete": "list", "aria-owns": this.ids.menu, "aria-haspopup": "true" }).insertAfter(this.element), e("<span>", { "class": "ui-icon " + this.options.icons.button }).prependTo(this.button), this.buttonText = e("<span>", { "class": "ui-selectmenu-text" }).appendTo(this.button), this._setText(this.buttonText, this.element.find("option:selected").text()), this._resizeButton(), this._on(this.button, this._buttonEvents), this.button.one("focusin", function () { t.menuItems || t._refreshMenu() }), this._hoverable(this.button), this._focusable(this.button) }, _drawMenu: function () { var t = this; this.menu = e("<ul>", { "aria-hidden": "true", "aria-labelledby": this.ids.button, id: this.ids.menu }), this.menuWrap = e("<div>", { "class": "ui-selectmenu-menu ui-front" }).append(this.menu).appendTo(this._appendTo()), this.menuInstance = this.menu.menu({ role: "listbox", select: function (e, i) { e.preventDefault(), t._setSelection(), t._select(i.item.data("ui-selectmenu-item"), e) }, focus: function (e, i) { var s = i.item.data("ui-selectmenu-item"); null != t.focusIndex && s.index !== t.focusIndex && (t._trigger("focus", e, { item: s }), t.isOpen || t._select(s, e)), t.focusIndex = s.index, t.button.attr("aria-activedescendant", t.menuItems.eq(s.index).attr("id")) } }).menu("instance"), this.menu.addClass("ui-corner-bottom").removeClass("ui-corner-all"), this.menuInstance._off(this.menu, "mouseleave"), this.menuInstance._closeOnDocumentClick = function () { return !1 }, this.menuInstance._isDivider = function () { return !1 } }, refresh: function () { this._refreshMenu(), this._setText(this.buttonText, this._getSelectedItem().text()), this.options.width || this._resizeButton() }, _refreshMenu: function () { this.menu.empty(); var e, t = this.element.find("option"); t.length && (this._parseOptions(t), this._renderMenu(this.menu, this.items), this.menuInstance.refresh(), this.menuItems = this.menu.find("li").not(".ui-selectmenu-optgroup"), e = this._getSelectedItem(), this.menuInstance.focus(null, e), this._setAria(e.data("ui-selectmenu-item")), this._setOption("disabled", this.element.prop("disabled"))) }, open: function (e) { this.options.disabled || (this.menuItems ? (this.menu.find(".ui-state-focus").removeClass("ui-state-focus"), this.menuInstance.focus(null, this._getSelectedItem())) : this._refreshMenu(), this.isOpen = !0, this._toggleAttr(), this._resizeMenu(), this._position(), this._on(this.document, this._documentClick), this._trigger("open", e)) }, _position: function () { this.menuWrap.position(e.extend({ of: this.button }, this.options.position)) }, close: function (e) { this.isOpen && (this.isOpen = !1, this._toggleAttr(), this.range = null, this._off(this.document), this._trigger("close", e)) }, widget: function () { return this.button }, menuWidget: function () { return this.menu }, _renderMenu: function (t, i) { var s = this, n = ""; e.each(i, function (i, a) { a.optgroup !== n && (e("<li>", { "class": "ui-selectmenu-optgroup ui-menu-divider" + (a.element.parent("optgroup").prop("disabled") ? " ui-state-disabled" : ""), text: a.optgroup }).appendTo(t), n = a.optgroup), s._renderItemData(t, a) }) }, _renderItemData: function (e, t) { return this._renderItem(e, t).data("ui-selectmenu-item", t) }, _renderItem: function (t, i) { var s = e("<li>"); return i.disabled && s.addClass("ui-state-disabled"), this._setText(s, i.label), s.appendTo(t) }, _setText: function (e, t) { t ? e.text(t) : e.html("&#160;") }, _move: function (e, t) { var i, s, n = ".ui-menu-item"; this.isOpen ? i = this.menuItems.eq(this.focusIndex) : (i = this.menuItems.eq(this.element[0].selectedIndex), n += ":not(.ui-state-disabled)"), s = "first" === e || "last" === e ? i["first" === e ? "prevAll" : "nextAll"](n).eq(-1) : i[e + "All"](n).eq(0), s.length && this.menuInstance.focus(t, s) }, _getSelectedItem: function () { return this.menuItems.eq(this.element[0].selectedIndex) }, _toggle: function (e) { this[this.isOpen ? "close" : "open"](e) }, _setSelection: function () { var e; this.range && (window.getSelection ? (e = window.getSelection(), e.removeAllRanges(), e.addRange(this.range)) : this.range.select(), this.button.focus()) }, _documentClick: { mousedown: function (t) { this.isOpen && (e(t.target).closest(".ui-selectmenu-menu, #" + this.ids.button).length || this.close(t)) } }, _buttonEvents: { mousedown: function () { var e; window.getSelection ? (e = window.getSelection(), e.rangeCount && (this.range = e.getRangeAt(0))) : this.range = document.selection.createRange() }, click: function (e) { this._setSelection(), this._toggle(e) }, keydown: function (t) { var i = !0; switch (t.keyCode) { case e.ui.keyCode.TAB: case e.ui.keyCode.ESCAPE: this.close(t), i = !1; break; case e.ui.keyCode.ENTER: this.isOpen && this._selectFocusedItem(t); break; case e.ui.keyCode.UP: t.altKey ? this._toggle(t) : this._move("prev", t); break; case e.ui.keyCode.DOWN: t.altKey ? this._toggle(t) : this._move("next", t); break; case e.ui.keyCode.SPACE: this.isOpen ? this._selectFocusedItem(t) : this._toggle(t); break; case e.ui.keyCode.LEFT: this._move("prev", t); break; case e.ui.keyCode.RIGHT: this._move("next", t); break; case e.ui.keyCode.HOME: case e.ui.keyCode.PAGE_UP: this._move("first", t); break; case e.ui.keyCode.END: case e.ui.keyCode.PAGE_DOWN: this._move("last", t); break; default: this.menu.trigger(t), i = !1 } i && t.preventDefault() } }, _selectFocusedItem: function (e) { var t = this.menuItems.eq(this.focusIndex); t.hasClass("ui-state-disabled") || this._select(t.data("ui-selectmenu-item"), e) }, _select: function (e, t) { var i = this.element[0].selectedIndex; this.element[0].selectedIndex = e.index, this._setText(this.buttonText, e.label), this._setAria(e), this._trigger("select", t, { item: e }), e.index !== i && this._trigger("change", t, { item: e }), this.close(t) }, _setAria: function (e) { var t = this.menuItems.eq(e.index).attr("id"); this.button.attr({ "aria-labelledby": t, "aria-activedescendant": t }), this.menu.attr("aria-activedescendant", t) }, _setOption: function (e, t) { "icons" === e && this.button.find("span.ui-icon").removeClass(this.options.icons.button).addClass(t.button), this._super(e, t), "appendTo" === e && this.menuWrap.appendTo(this._appendTo()), "disabled" === e && (this.menuInstance.option("disabled", t), this.button.toggleClass("ui-state-disabled", t).attr("aria-disabled", t), this.element.prop("disabled", t), t ? (this.button.attr("tabindex", -1), this.close()) : this.button.attr("tabindex", 0)), "width" === e && this._resizeButton() }, _appendTo: function () { var t = this.options.appendTo; return t && (t = t.jquery || t.nodeType ? e(t) : this.document.find(t).eq(0)), t && t[0] || (t = this.element.closest(".ui-front")), t.length || (t = this.document[0].body), t }, _toggleAttr: function () { this.button.toggleClass("ui-corner-top", this.isOpen).toggleClass("ui-corner-all", !this.isOpen).attr("aria-expanded", this.isOpen), this.menuWrap.toggleClass("ui-selectmenu-open", this.isOpen), this.menu.attr("aria-hidden", !this.isOpen) }, _resizeButton: function () { var e = this.options.width; e || (e = this.element.show().outerWidth(), this.element.hide()), this.button.outerWidth(e) }, _resizeMenu: function () { this.menu.outerWidth(Math.max(this.button.outerWidth(), this.menu.width("").outerWidth() + 1)) }, _getCreateOptions: function () { return { disabled: this.element.prop("disabled") } }, _parseOptions: function (t) { var i = []; t.each(function (t, s) { var n = e(s), a = n.parent("optgroup"); i.push({ element: n, index: t, value: n.attr("value"), label: n.text(), optgroup: a.attr("label") || "", disabled: a.prop("disabled") || n.prop("disabled") }) }), this.items = i }, _destroy: function () { this.menuWrap.remove(), this.button.remove(), this.element.show(), this.element.removeUniqueId(), this.label.attr("for", this.ids.element) } }), e.widget("ui.slider", e.ui.mouse, { version: "1.11.2", widgetEventPrefix: "slide", options: { animate: !1, distance: 0, max: 100, min: 0, orientation: "horizontal", range: !1, step: 1, value: 0, values: null, change: null, slide: null, start: null, stop: null }, numPages: 5, _create: function () { this._keySliding = !1, this._mouseSliding = !1, this._animateOff = !0, this._handleIndex = null, this._detectOrientation(), this._mouseInit(), this._calculateNewMax(), this.element.addClass("ui-slider ui-slider-" + this.orientation + " ui-widget" + " ui-widget-content" + " ui-corner-all"), this._refresh(), this._setOption("disabled", this.options.disabled), this._animateOff = !1 }, _refresh: function () { this._createRange(), this._createHandles(), this._setupEvents(), this._refreshValue() }, _createHandles: function () { var t, i, s = this.options, n = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"), a = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>", o = []; for (i = s.values && s.values.length || 1, n.length > i && (n.slice(i).remove(), n = n.slice(0, i)), t = n.length; i > t; t++) o.push(a); this.handles = n.add(e(o.join("")).appendTo(this.element)), this.handle = this.handles.eq(0), this.handles.each(function (t) { e(this).data("ui-slider-handle-index", t) }) }, _createRange: function () { var t = this.options, i = ""; t.range ? (t.range === !0 && (t.values ? t.values.length && 2 !== t.values.length ? t.values = [t.values[0], t.values[0]] : e.isArray(t.values) && (t.values = t.values.slice(0)) : t.values = [this._valueMin(), this._valueMin()]), this.range && this.range.length ? this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({ left: "", bottom: "" }) : (this.range = e("<div></div>").appendTo(this.element), i = "ui-slider-range ui-widget-header ui-corner-all"), this.range.addClass(i + ("min" === t.range || "max" === t.range ? " ui-slider-range-" + t.range : ""))) : (this.range && this.range.remove(), this.range = null) }, _setupEvents: function () { this._off(this.handles), this._on(this.handles, this._handleEvents), this._hoverable(this.handles), this._focusable(this.handles) }, _destroy: function () { this.handles.remove(), this.range && this.range.remove(), this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"), this._mouseDestroy() }, _mouseCapture: function (t) { var i, s, n, a, o, r, h, l, u = this, d = this.options; return d.disabled ? !1 : (this.elementSize = { width: this.element.outerWidth(), height: this.element.outerHeight() }, this.elementOffset = this.element.offset(), i = { x: t.pageX, y: t.pageY }, s = this._normValueFromMouse(i), n = this._valueMax() - this._valueMin() + 1, this.handles.each(function (t) { var i = Math.abs(s - u.values(t)); (n > i || n === i && (t === u._lastChangedValue || u.values(t) === d.min)) && (n = i, a = e(this), o = t) }), r = this._start(t, o), r === !1 ? !1 : (this._mouseSliding = !0, this._handleIndex = o, a.addClass("ui-state-active").focus(), h = a.offset(), l = !e(t.target).parents().addBack().is(".ui-slider-handle"), this._clickOffset = l ? { left: 0, top: 0 } : { left: t.pageX - h.left - a.width() / 2, top: t.pageY - h.top - a.height() / 2 - (parseInt(a.css("borderTopWidth"), 10) || 0) - (parseInt(a.css("borderBottomWidth"), 10) || 0) + (parseInt(a.css("marginTop"), 10) || 0) }, this.handles.hasClass("ui-state-hover") || this._slide(t, o, s), this._animateOff = !0, !0)) }, _mouseStart: function () { return !0 }, _mouseDrag: function (e) { var t = { x: e.pageX, y: e.pageY }, i = this._normValueFromMouse(t); return this._slide(e, this._handleIndex, i), !1 }, _mouseStop: function (e) { return this.handles.removeClass("ui-state-active"), this._mouseSliding = !1, this._stop(e, this._handleIndex), this._change(e, this._handleIndex), this._handleIndex = null, this._clickOffset = null, this._animateOff = !1, !1 }, _detectOrientation: function () { this.orientation = "vertical" === this.options.orientation ? "vertical" : "horizontal" }, _normValueFromMouse: function (e) { var t, i, s, n, a; return "horizontal" === this.orientation ? (t = this.elementSize.width, i = e.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)) : (t = this.elementSize.height, i = e.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)), s = i / t, s > 1 && (s = 1), 0 > s && (s = 0), "vertical" === this.orientation && (s = 1 - s), n = this._valueMax() - this._valueMin(), a = this._valueMin() + s * n, this._trimAlignValue(a) }, _start: function (e, t) { var i = { handle: this.handles[t], value: this.value() }; return this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._trigger("start", e, i) }, _slide: function (e, t, i) { var s, n, a; this.options.values && this.options.values.length ? (s = this.values(t ? 0 : 1), 2 === this.options.values.length && this.options.range === !0 && (0 === t && i > s || 1 === t && s > i) && (i = s), i !== this.values(t) && (n = this.values(), n[t] = i, a = this._trigger("slide", e, { handle: this.handles[t], value: i, values: n }), s = this.values(t ? 0 : 1), a !== !1 && this.values(t, i))) : i !== this.value() && (a = this._trigger("slide", e, { handle: this.handles[t], value: i }), a !== !1 && this.value(i)) }, _stop: function (e, t) { var i = { handle: this.handles[t], value: this.value() }; this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._trigger("stop", e, i) }, _change: function (e, t) { if (!this._keySliding && !this._mouseSliding) { var i = { handle: this.handles[t], value: this.value() }; this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._lastChangedValue = t, this._trigger("change", e, i) } }, value: function (e) { return arguments.length ? (this.options.value = this._trimAlignValue(e), this._refreshValue(), this._change(null, 0), void 0) : this._value() }, values: function (t, i) { var s, n, a; if (arguments.length > 1) return this.options.values[t] = this._trimAlignValue(i), this._refreshValue(), this._change(null, t), void 0; if (!arguments.length) return this._values(); if (!e.isArray(arguments[0])) return this.options.values && this.options.values.length ? this._values(t) : this.value(); for (s = this.options.values, n = arguments[0], a = 0; s.length > a; a += 1) s[a] = this._trimAlignValue(n[a]), this._change(null, a); this._refreshValue() }, _setOption: function (t, i) { var s, n = 0; switch ("range" === t && this.options.range === !0 && ("min" === i ? (this.options.value = this._values(0), this.options.values = null) : "max" === i && (this.options.value = this._values(this.options.values.length - 1), this.options.values = null)), e.isArray(this.options.values) && (n = this.options.values.length), "disabled" === t && this.element.toggleClass("ui-state-disabled", !!i), this._super(t, i), t) { case "orientation": this._detectOrientation(), this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation), this._refreshValue(), this.handles.css("horizontal" === i ? "bottom" : "left", ""); break; case "value": this._animateOff = !0, this._refreshValue(), this._change(null, 0), this._animateOff = !1; break; case "values": for (this._animateOff = !0, this._refreshValue(), s = 0; n > s; s += 1) this._change(null, s); this._animateOff = !1; break; case "step": case "min": case "max": this._animateOff = !0, this._calculateNewMax(), this._refreshValue(), this._animateOff = !1; break; case "range": this._animateOff = !0, this._refresh(), this._animateOff = !1 } }, _value: function () { var e = this.options.value; return e = this._trimAlignValue(e) }, _values: function (e) { var t, i, s; if (arguments.length) return t = this.options.values[e], t = this._trimAlignValue(t); if (this.options.values && this.options.values.length) { for (i = this.options.values.slice(), s = 0; i.length > s; s += 1) i[s] = this._trimAlignValue(i[s]); return i } return [] }, _trimAlignValue: function (e) { if (this._valueMin() >= e) return this._valueMin(); if (e >= this._valueMax()) return this._valueMax(); var t = this.options.step > 0 ? this.options.step : 1, i = (e - this._valueMin()) % t, s = e - i; return 2 * Math.abs(i) >= t && (s += i > 0 ? t : -t), parseFloat(s.toFixed(5)) }, _calculateNewMax: function () { var e = (this.options.max - this._valueMin()) % this.options.step; this.max = this.options.max - e }, _valueMin: function () { return this.options.min }, _valueMax: function () { return this.max }, _refreshValue: function () { var t, i, s, n, a, o = this.options.range, r = this.options, h = this, l = this._animateOff ? !1 : r.animate, u = {}; this.options.values && this.options.values.length ? this.handles.each(function (s) { i = 100 * ((h.values(s) - h._valueMin()) / (h._valueMax() - h._valueMin())), u["horizontal" === h.orientation ? "left" : "bottom"] = i + "%", e(this).stop(1, 1)[l ? "animate" : "css"](u, r.animate), h.options.range === !0 && ("horizontal" === h.orientation ? (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({ left: i + "%" }, r.animate), 1 === s && h.range[l ? "animate" : "css"]({ width: i - t + "%" }, { queue: !1, duration: r.animate })) : (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({ bottom: i + "%" }, r.animate), 1 === s && h.range[l ? "animate" : "css"]({ height: i - t + "%" }, { queue: !1, duration: r.animate }))), t = i }) : (s = this.value(), n = this._valueMin(), a = this._valueMax(), i = a !== n ? 100 * ((s - n) / (a - n)) : 0, u["horizontal" === this.orientation ? "left" : "bottom"] = i + "%", this.handle.stop(1, 1)[l ? "animate" : "css"](u, r.animate), "min" === o && "horizontal" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ width: i + "%" }, r.animate), "max" === o && "horizontal" === this.orientation && this.range[l ? "animate" : "css"]({ width: 100 - i + "%" }, { queue: !1, duration: r.animate }), "min" === o && "vertical" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ height: i + "%" }, r.animate), "max" === o && "vertical" === this.orientation && this.range[l ? "animate" : "css"]({ height: 100 - i + "%" }, { queue: !1, duration: r.animate })) }, _handleEvents: { keydown: function (t) { var i, s, n, a, o = e(t.target).data("ui-slider-handle-index"); switch (t.keyCode) { case e.ui.keyCode.HOME: case e.ui.keyCode.END: case e.ui.keyCode.PAGE_UP: case e.ui.keyCode.PAGE_DOWN: case e.ui.keyCode.UP: case e.ui.keyCode.RIGHT: case e.ui.keyCode.DOWN: case e.ui.keyCode.LEFT: if (t.preventDefault(), !this._keySliding && (this._keySliding = !0, e(t.target).addClass("ui-state-active"), i = this._start(t, o), i === !1)) return } switch (a = this.options.step, s = n = this.options.values && this.options.values.length ? this.values(o) : this.value(), t.keyCode) { case e.ui.keyCode.HOME: n = this._valueMin(); break; case e.ui.keyCode.END: n = this._valueMax(); break; case e.ui.keyCode.PAGE_UP: n = this._trimAlignValue(s + (this._valueMax() - this._valueMin()) / this.numPages); break; case e.ui.keyCode.PAGE_DOWN: n = this._trimAlignValue(s - (this._valueMax() - this._valueMin()) / this.numPages); break; case e.ui.keyCode.UP: case e.ui.keyCode.RIGHT: if (s === this._valueMax()) return; n = this._trimAlignValue(s + a); break; case e.ui.keyCode.DOWN: case e.ui.keyCode.LEFT: if (s === this._valueMin()) return; n = this._trimAlignValue(s - a) } this._slide(t, o, n) }, keyup: function (t) { var i = e(t.target).data("ui-slider-handle-index"); this._keySliding && (this._keySliding = !1, this._stop(t, i), this._change(t, i), e(t.target).removeClass("ui-state-active")) } } }), e.widget("ui.spinner", {
        version: "1.11.2", defaultElement: "<input>", widgetEventPrefix: "spin", options: { culture: null, icons: { down: "ui-icon-triangle-1-s", up: "ui-icon-triangle-1-n" }, incremental: !0, max: null, min: null, numberFormat: null, page: 10, step: 1, change: null, spin: null, start: null, stop: null }, _create: function () { this._setOption("max", this.options.max), this._setOption("min", this.options.min), this._setOption("step", this.options.step), "" !== this.value() && this._value(this.element.val(), !0), this._draw(), this._on(this._events), this._refresh(), this._on(this.window, { beforeunload: function () { this.element.removeAttr("autocomplete") } }) }, _getCreateOptions: function () { var t = {}, i = this.element; return e.each(["min", "max", "step"], function (e, s) { var n = i.attr(s); void 0 !== n && n.length && (t[s] = n) }), t }, _events: { keydown: function (e) { this._start(e) && this._keydown(e) && e.preventDefault() }, keyup: "_stop", focus: function () { this.previous = this.element.val() }, blur: function (e) { return this.cancelBlur ? (delete this.cancelBlur, void 0) : (this._stop(), this._refresh(), this.previous !== this.element.val() && this._trigger("change", e), void 0) }, mousewheel: function (e, t) { if (t) { if (!this.spinning && !this._start(e)) return !1; this._spin((t > 0 ? 1 : -1) * this.options.step, e), clearTimeout(this.mousewheelTimer), this.mousewheelTimer = this._delay(function () { this.spinning && this._stop(e) }, 100), e.preventDefault() } }, "mousedown .ui-spinner-button": function (t) { function i() { var e = this.element[0] === this.document[0].activeElement; e || (this.element.focus(), this.previous = s, this._delay(function () { this.previous = s })) } var s; s = this.element[0] === this.document[0].activeElement ? this.previous : this.element.val(), t.preventDefault(), i.call(this), this.cancelBlur = !0, this._delay(function () { delete this.cancelBlur, i.call(this) }), this._start(t) !== !1 && this._repeat(null, e(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t) }, "mouseup .ui-spinner-button": "_stop", "mouseenter .ui-spinner-button": function (t) { return e(t.currentTarget).hasClass("ui-state-active") ? this._start(t) === !1 ? !1 : (this._repeat(null, e(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t), void 0) : void 0 }, "mouseleave .ui-spinner-button": "_stop" }, _draw: function () { var e = this.uiSpinner = this.element.addClass("ui-spinner-input").attr("autocomplete", "off").wrap(this._uiSpinnerHtml()).parent().append(this._buttonHtml()); this.element.attr("role", "spinbutton"), this.buttons = e.find(".ui-spinner-button").attr("tabIndex", -1).button().removeClass("ui-corner-all"), this.buttons.height() > Math.ceil(.5 * e.height()) && e.height() > 0 && e.height(e.height()), this.options.disabled && this.disable() }, _keydown: function (t) { var i = this.options, s = e.ui.keyCode; switch (t.keyCode) { case s.UP: return this._repeat(null, 1, t), !0; case s.DOWN: return this._repeat(null, -1, t), !0; case s.PAGE_UP: return this._repeat(null, i.page, t), !0; case s.PAGE_DOWN: return this._repeat(null, -i.page, t), !0 } return !1 }, _uiSpinnerHtml: function () { return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>" }, _buttonHtml: function () {
            return "<a class='ui-spinner-button ui-spinner-up ui-corner-tr'><span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" + "</a>" + "<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" + "<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" + "</a>"
        }, _start: function (e) { return this.spinning || this._trigger("start", e) !== !1 ? (this.counter || (this.counter = 1), this.spinning = !0, !0) : !1 }, _repeat: function (e, t, i) { e = e || 500, clearTimeout(this.timer), this.timer = this._delay(function () { this._repeat(40, t, i) }, e), this._spin(t * this.options.step, i) }, _spin: function (e, t) { var i = this.value() || 0; this.counter || (this.counter = 1), i = this._adjustValue(i + e * this._increment(this.counter)), this.spinning && this._trigger("spin", t, { value: i }) === !1 || (this._value(i), this.counter++) }, _increment: function (t) { var i = this.options.incremental; return i ? e.isFunction(i) ? i(t) : Math.floor(t * t * t / 5e4 - t * t / 500 + 17 * t / 200 + 1) : 1 }, _precision: function () { var e = this._precisionOf(this.options.step); return null !== this.options.min && (e = Math.max(e, this._precisionOf(this.options.min))), e }, _precisionOf: function (e) { var t = "" + e, i = t.indexOf("."); return -1 === i ? 0 : t.length - i - 1 }, _adjustValue: function (e) { var t, i, s = this.options; return t = null !== s.min ? s.min : 0, i = e - t, i = Math.round(i / s.step) * s.step, e = t + i, e = parseFloat(e.toFixed(this._precision())), null !== s.max && e > s.max ? s.max : null !== s.min && s.min > e ? s.min : e }, _stop: function (e) { this.spinning && (clearTimeout(this.timer), clearTimeout(this.mousewheelTimer), this.counter = 0, this.spinning = !1, this._trigger("stop", e)) }, _setOption: function (e, t) { if ("culture" === e || "numberFormat" === e) { var i = this._parse(this.element.val()); return this.options[e] = t, this.element.val(this._format(i)), void 0 } ("max" === e || "min" === e || "step" === e) && "string" == typeof t && (t = this._parse(t)), "icons" === e && (this.buttons.first().find(".ui-icon").removeClass(this.options.icons.up).addClass(t.up), this.buttons.last().find(".ui-icon").removeClass(this.options.icons.down).addClass(t.down)), this._super(e, t), "disabled" === e && (this.widget().toggleClass("ui-state-disabled", !!t), this.element.prop("disabled", !!t), this.buttons.button(t ? "disable" : "enable")) }, _setOptions: h(function (e) { this._super(e) }), _parse: function (e) { return "string" == typeof e && "" !== e && (e = window.Globalize && this.options.numberFormat ? Globalize.parseFloat(e, 10, this.options.culture) : +e), "" === e || isNaN(e) ? null : e }, _format: function (e) { return "" === e ? "" : window.Globalize && this.options.numberFormat ? Globalize.format(e, this.options.numberFormat, this.options.culture) : e }, _refresh: function () { this.element.attr({ "aria-valuemin": this.options.min, "aria-valuemax": this.options.max, "aria-valuenow": this._parse(this.element.val()) }) }, isValid: function () { var e = this.value(); return null === e ? !1 : e === this._adjustValue(e) }, _value: function (e, t) { var i; "" !== e && (i = this._parse(e), null !== i && (t || (i = this._adjustValue(i)), e = this._format(i))), this.element.val(e), this._refresh() }, _destroy: function () { this.element.removeClass("ui-spinner-input").prop("disabled", !1).removeAttr("autocomplete").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow"), this.uiSpinner.replaceWith(this.element) }, stepUp: h(function (e) { this._stepUp(e) }), _stepUp: function (e) { this._start() && (this._spin((e || 1) * this.options.step), this._stop()) }, stepDown: h(function (e) { this._stepDown(e) }), _stepDown: function (e) { this._start() && (this._spin((e || 1) * -this.options.step), this._stop()) }, pageUp: h(function (e) { this._stepUp((e || 1) * this.options.page) }), pageDown: h(function (e) { this._stepDown((e || 1) * this.options.page) }), value: function (e) { return arguments.length ? (h(this._value).call(this, e), void 0) : this._parse(this.element.val()) }, widget: function () { return this.uiSpinner }
    }), e.widget("ui.tabs", { version: "1.11.2", delay: 300, options: { active: null, collapsible: !1, event: "click", heightStyle: "content", hide: null, show: null, activate: null, beforeActivate: null, beforeLoad: null, load: null }, _isLocal: function () { var e = /#.*$/; return function (t) { var i, s; t = t.cloneNode(!1), i = t.href.replace(e, ""), s = location.href.replace(e, ""); try { i = decodeURIComponent(i) } catch (n) { } try { s = decodeURIComponent(s) } catch (n) { } return t.hash.length > 1 && i === s } }(), _create: function () { var t = this, i = this.options; this.running = !1, this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all").toggleClass("ui-tabs-collapsible", i.collapsible), this._processTabs(), i.active = this._initialActive(), e.isArray(i.disabled) && (i.disabled = e.unique(i.disabled.concat(e.map(this.tabs.filter(".ui-state-disabled"), function (e) { return t.tabs.index(e) }))).sort()), this.active = this.options.active !== !1 && this.anchors.length ? this._findActive(i.active) : e(), this._refresh(), this.active.length && this.load(i.active) }, _initialActive: function () { var t = this.options.active, i = this.options.collapsible, s = location.hash.substring(1); return null === t && (s && this.tabs.each(function (i, n) { return e(n).attr("aria-controls") === s ? (t = i, !1) : void 0 }), null === t && (t = this.tabs.index(this.tabs.filter(".ui-tabs-active"))), (null === t || -1 === t) && (t = this.tabs.length ? 0 : !1)), t !== !1 && (t = this.tabs.index(this.tabs.eq(t)), -1 === t && (t = i ? !1 : 0)), !i && t === !1 && this.anchors.length && (t = 0), t }, _getCreateEventData: function () { return { tab: this.active, panel: this.active.length ? this._getPanelForTab(this.active) : e() } }, _tabKeydown: function (t) { var i = e(this.document[0].activeElement).closest("li"), s = this.tabs.index(i), n = !0; if (!this._handlePageNav(t)) { switch (t.keyCode) { case e.ui.keyCode.RIGHT: case e.ui.keyCode.DOWN: s++; break; case e.ui.keyCode.UP: case e.ui.keyCode.LEFT: n = !1, s--; break; case e.ui.keyCode.END: s = this.anchors.length - 1; break; case e.ui.keyCode.HOME: s = 0; break; case e.ui.keyCode.SPACE: return t.preventDefault(), clearTimeout(this.activating), this._activate(s), void 0; case e.ui.keyCode.ENTER: return t.preventDefault(), clearTimeout(this.activating), this._activate(s === this.options.active ? !1 : s), void 0; default: return } t.preventDefault(), clearTimeout(this.activating), s = this._focusNextTab(s, n), t.ctrlKey || (i.attr("aria-selected", "false"), this.tabs.eq(s).attr("aria-selected", "true"), this.activating = this._delay(function () { this.option("active", s) }, this.delay)) } }, _panelKeydown: function (t) { this._handlePageNav(t) || t.ctrlKey && t.keyCode === e.ui.keyCode.UP && (t.preventDefault(), this.active.focus()) }, _handlePageNav: function (t) { return t.altKey && t.keyCode === e.ui.keyCode.PAGE_UP ? (this._activate(this._focusNextTab(this.options.active - 1, !1)), !0) : t.altKey && t.keyCode === e.ui.keyCode.PAGE_DOWN ? (this._activate(this._focusNextTab(this.options.active + 1, !0)), !0) : void 0 }, _findNextTab: function (t, i) { function s() { return t > n && (t = 0), 0 > t && (t = n), t } for (var n = this.tabs.length - 1; -1 !== e.inArray(s(), this.options.disabled) ;) t = i ? t + 1 : t - 1; return t }, _focusNextTab: function (e, t) { return e = this._findNextTab(e, t), this.tabs.eq(e).focus(), e }, _setOption: function (e, t) { return "active" === e ? (this._activate(t), void 0) : "disabled" === e ? (this._setupDisabled(t), void 0) : (this._super(e, t), "collapsible" === e && (this.element.toggleClass("ui-tabs-collapsible", t), t || this.options.active !== !1 || this._activate(0)), "event" === e && this._setupEvents(t), "heightStyle" === e && this._setupHeightStyle(t), void 0) }, _sanitizeSelector: function (e) { return e ? e.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : "" }, refresh: function () { var t = this.options, i = this.tablist.children(":has(a[href])"); t.disabled = e.map(i.filter(".ui-state-disabled"), function (e) { return i.index(e) }), this._processTabs(), t.active !== !1 && this.anchors.length ? this.active.length && !e.contains(this.tablist[0], this.active[0]) ? this.tabs.length === t.disabled.length ? (t.active = !1, this.active = e()) : this._activate(this._findNextTab(Math.max(0, t.active - 1), !1)) : t.active = this.tabs.index(this.active) : (t.active = !1, this.active = e()), this._refresh() }, _refresh: function () { this._setupDisabled(this.options.disabled), this._setupEvents(this.options.event), this._setupHeightStyle(this.options.heightStyle), this.tabs.not(this.active).attr({ "aria-selected": "false", "aria-expanded": "false", tabIndex: -1 }), this.panels.not(this._getPanelForTab(this.active)).hide().attr({ "aria-hidden": "true" }), this.active.length ? (this.active.addClass("ui-tabs-active ui-state-active").attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }), this._getPanelForTab(this.active).show().attr({ "aria-hidden": "false" })) : this.tabs.eq(0).attr("tabIndex", 0) }, _processTabs: function () { var t = this, i = this.tabs, s = this.anchors, n = this.panels; this.tablist = this._getList().addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").attr("role", "tablist").delegate("> li", "mousedown" + this.eventNamespace, function (t) { e(this).is(".ui-state-disabled") && t.preventDefault() }).delegate(".ui-tabs-anchor", "focus" + this.eventNamespace, function () { e(this).closest("li").is(".ui-state-disabled") && this.blur() }), this.tabs = this.tablist.find("> li:has(a[href])").addClass("ui-state-default ui-corner-top").attr({ role: "tab", tabIndex: -1 }), this.anchors = this.tabs.map(function () { return e("a", this)[0] }).addClass("ui-tabs-anchor").attr({ role: "presentation", tabIndex: -1 }), this.panels = e(), this.anchors.each(function (i, s) { var n, a, o, r = e(s).uniqueId().attr("id"), h = e(s).closest("li"), l = h.attr("aria-controls"); t._isLocal(s) ? (n = s.hash, o = n.substring(1), a = t.element.find(t._sanitizeSelector(n))) : (o = h.attr("aria-controls") || e({}).uniqueId()[0].id, n = "#" + o, a = t.element.find(n), a.length || (a = t._createPanel(o), a.insertAfter(t.panels[i - 1] || t.tablist)), a.attr("aria-live", "polite")), a.length && (t.panels = t.panels.add(a)), l && h.data("ui-tabs-aria-controls", l), h.attr({ "aria-controls": o, "aria-labelledby": r }), a.attr("aria-labelledby", r) }), this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").attr("role", "tabpanel"), i && (this._off(i.not(this.tabs)), this._off(s.not(this.anchors)), this._off(n.not(this.panels))) }, _getList: function () { return this.tablist || this.element.find("ol,ul").eq(0) }, _createPanel: function (t) { return e("<div>").attr("id", t).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").data("ui-tabs-destroy", !0) }, _setupDisabled: function (t) { e.isArray(t) && (t.length ? t.length === this.anchors.length && (t = !0) : t = !1); for (var i, s = 0; i = this.tabs[s]; s++) t === !0 || -1 !== e.inArray(s, t) ? e(i).addClass("ui-state-disabled").attr("aria-disabled", "true") : e(i).removeClass("ui-state-disabled").removeAttr("aria-disabled"); this.options.disabled = t }, _setupEvents: function (t) { var i = {}; t && e.each(t.split(" "), function (e, t) { i[t] = "_eventHandler" }), this._off(this.anchors.add(this.tabs).add(this.panels)), this._on(!0, this.anchors, { click: function (e) { e.preventDefault() } }), this._on(this.anchors, i), this._on(this.tabs, { keydown: "_tabKeydown" }), this._on(this.panels, { keydown: "_panelKeydown" }), this._focusable(this.tabs), this._hoverable(this.tabs) }, _setupHeightStyle: function (t) { var i, s = this.element.parent(); "fill" === t ? (i = s.height(), i -= this.element.outerHeight() - this.element.height(), this.element.siblings(":visible").each(function () { var t = e(this), s = t.css("position"); "absolute" !== s && "fixed" !== s && (i -= t.outerHeight(!0)) }), this.element.children().not(this.panels).each(function () { i -= e(this).outerHeight(!0) }), this.panels.each(function () { e(this).height(Math.max(0, i - e(this).innerHeight() + e(this).height())) }).css("overflow", "auto")) : "auto" === t && (i = 0, this.panels.each(function () { i = Math.max(i, e(this).height("").height()) }).height(i)) }, _eventHandler: function (t) { var i = this.options, s = this.active, n = e(t.currentTarget), a = n.closest("li"), o = a[0] === s[0], r = o && i.collapsible, h = r ? e() : this._getPanelForTab(a), l = s.length ? this._getPanelForTab(s) : e(), u = { oldTab: s, oldPanel: l, newTab: r ? e() : a, newPanel: h }; t.preventDefault(), a.hasClass("ui-state-disabled") || a.hasClass("ui-tabs-loading") || this.running || o && !i.collapsible || this._trigger("beforeActivate", t, u) === !1 || (i.active = r ? !1 : this.tabs.index(a), this.active = o ? e() : a, this.xhr && this.xhr.abort(), l.length || h.length || e.error("jQuery UI Tabs: Mismatching fragment identifier."), h.length && this.load(this.tabs.index(a), t), this._toggle(t, u)) }, _toggle: function (t, i) { function s() { a.running = !1, a._trigger("activate", t, i) } function n() { i.newTab.closest("li").addClass("ui-tabs-active ui-state-active"), o.length && a.options.show ? a._show(o, a.options.show, s) : (o.show(), s()) } var a = this, o = i.newPanel, r = i.oldPanel; this.running = !0, r.length && this.options.hide ? this._hide(r, this.options.hide, function () { i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"), n() }) : (i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"), r.hide(), n()), r.attr("aria-hidden", "true"), i.oldTab.attr({ "aria-selected": "false", "aria-expanded": "false" }), o.length && r.length ? i.oldTab.attr("tabIndex", -1) : o.length && this.tabs.filter(function () { return 0 === e(this).attr("tabIndex") }).attr("tabIndex", -1), o.attr("aria-hidden", "false"), i.newTab.attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }) }, _activate: function (t) { var i, s = this._findActive(t); s[0] !== this.active[0] && (s.length || (s = this.active), i = s.find(".ui-tabs-anchor")[0], this._eventHandler({ target: i, currentTarget: i, preventDefault: e.noop })) }, _findActive: function (t) { return t === !1 ? e() : this.tabs.eq(t) }, _getIndex: function (e) { return "string" == typeof e && (e = this.anchors.index(this.anchors.filter("[href$='" + e + "']"))), e }, _destroy: function () { this.xhr && this.xhr.abort(), this.element.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible"), this.tablist.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").removeAttr("role"), this.anchors.removeClass("ui-tabs-anchor").removeAttr("role").removeAttr("tabIndex").removeUniqueId(), this.tablist.unbind(this.eventNamespace), this.tabs.add(this.panels).each(function () { e.data(this, "ui-tabs-destroy") ? e(this).remove() : e(this).removeClass("ui-state-default ui-state-active ui-state-disabled ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel").removeAttr("tabIndex").removeAttr("aria-live").removeAttr("aria-busy").removeAttr("aria-selected").removeAttr("aria-labelledby").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("role") }), this.tabs.each(function () { var t = e(this), i = t.data("ui-tabs-aria-controls"); i ? t.attr("aria-controls", i).removeData("ui-tabs-aria-controls") : t.removeAttr("aria-controls") }), this.panels.show(), "content" !== this.options.heightStyle && this.panels.css("height", "") }, enable: function (t) { var i = this.options.disabled; i !== !1 && (void 0 === t ? i = !1 : (t = this._getIndex(t), i = e.isArray(i) ? e.map(i, function (e) { return e !== t ? e : null }) : e.map(this.tabs, function (e, i) { return i !== t ? i : null })), this._setupDisabled(i)) }, disable: function (t) { var i = this.options.disabled; if (i !== !0) { if (void 0 === t) i = !0; else { if (t = this._getIndex(t), -1 !== e.inArray(t, i)) return; i = e.isArray(i) ? e.merge([t], i).sort() : [t] } this._setupDisabled(i) } }, load: function (t, i) { t = this._getIndex(t); var s = this, n = this.tabs.eq(t), a = n.find(".ui-tabs-anchor"), o = this._getPanelForTab(n), r = { tab: n, panel: o }; this._isLocal(a[0]) || (this.xhr = e.ajax(this._ajaxSettings(a, i, r)), this.xhr && "canceled" !== this.xhr.statusText && (n.addClass("ui-tabs-loading"), o.attr("aria-busy", "true"), this.xhr.success(function (e) { setTimeout(function () { o.html(e), s._trigger("load", i, r) }, 1) }).complete(function (e, t) { setTimeout(function () { "abort" === t && s.panels.stop(!1, !0), n.removeClass("ui-tabs-loading"), o.removeAttr("aria-busy"), e === s.xhr && delete s.xhr }, 1) }))) }, _ajaxSettings: function (t, i, s) { var n = this; return { url: t.attr("href"), beforeSend: function (t, a) { return n._trigger("beforeLoad", i, e.extend({ jqXHR: t, ajaxSettings: a }, s)) } } }, _getPanelForTab: function (t) { var i = e(t).attr("aria-controls"); return this.element.find(this._sanitizeSelector("#" + i)) } }), e.widget("ui.tooltip", { version: "1.11.2", options: { content: function () { var t = e(this).attr("title") || ""; return e("<a>").text(t).html() }, hide: !0, items: "[title]:not([disabled])", position: { my: "left top+15", at: "left bottom", collision: "flipfit flip" }, show: !0, tooltipClass: null, track: !1, close: null, open: null }, _addDescribedBy: function (t, i) { var s = (t.attr("aria-describedby") || "").split(/\s+/); s.push(i), t.data("ui-tooltip-id", i).attr("aria-describedby", e.trim(s.join(" "))) }, _removeDescribedBy: function (t) { var i = t.data("ui-tooltip-id"), s = (t.attr("aria-describedby") || "").split(/\s+/), n = e.inArray(i, s); -1 !== n && s.splice(n, 1), t.removeData("ui-tooltip-id"), s = e.trim(s.join(" ")), s ? t.attr("aria-describedby", s) : t.removeAttr("aria-describedby") }, _create: function () { this._on({ mouseover: "open", focusin: "open" }), this.tooltips = {}, this.parents = {}, this.options.disabled && this._disable(), this.liveRegion = e("<div>").attr({ role: "log", "aria-live": "assertive", "aria-relevant": "additions" }).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body) }, _setOption: function (t, i) { var s = this; return "disabled" === t ? (this[i ? "_disable" : "_enable"](), this.options[t] = i, void 0) : (this._super(t, i), "content" === t && e.each(this.tooltips, function (e, t) { s._updateContent(t.element) }), void 0) }, _disable: function () { var t = this; e.each(this.tooltips, function (i, s) { var n = e.Event("blur"); n.target = n.currentTarget = s.element[0], t.close(n, !0) }), this.element.find(this.options.items).addBack().each(function () { var t = e(this); t.is("[title]") && t.data("ui-tooltip-title", t.attr("title")).removeAttr("title") }) }, _enable: function () { this.element.find(this.options.items).addBack().each(function () { var t = e(this); t.data("ui-tooltip-title") && t.attr("title", t.data("ui-tooltip-title")) }) }, open: function (t) { var i = this, s = e(t ? t.target : this.element).closest(this.options.items); s.length && !s.data("ui-tooltip-id") && (s.attr("title") && s.data("ui-tooltip-title", s.attr("title")), s.data("ui-tooltip-open", !0), t && "mouseover" === t.type && s.parents().each(function () { var t, s = e(this); s.data("ui-tooltip-open") && (t = e.Event("blur"), t.target = t.currentTarget = this, i.close(t, !0)), s.attr("title") && (s.uniqueId(), i.parents[this.id] = { element: this, title: s.attr("title") }, s.attr("title", "")) }), this._updateContent(s, t)) }, _updateContent: function (e, t) { var i, s = this.options.content, n = this, a = t ? t.type : null; return "string" == typeof s ? this._open(t, e, s) : (i = s.call(e[0], function (i) { e.data("ui-tooltip-open") && n._delay(function () { t && (t.type = a), this._open(t, e, i) }) }), i && this._open(t, e, i), void 0) }, _open: function (t, i, s) { function n(e) { u.of = e, o.is(":hidden") || o.position(u) } var a, o, r, h, l, u = e.extend({}, this.options.position); if (s) { if (a = this._find(i)) return a.tooltip.find(".ui-tooltip-content").html(s), void 0; i.is("[title]") && (t && "mouseover" === t.type ? i.attr("title", "") : i.removeAttr("title")), a = this._tooltip(i), o = a.tooltip, this._addDescribedBy(i, o.attr("id")), o.find(".ui-tooltip-content").html(s), this.liveRegion.children().hide(), s.clone ? (l = s.clone(), l.removeAttr("id").find("[id]").removeAttr("id")) : l = s, e("<div>").html(l).appendTo(this.liveRegion), this.options.track && t && /^mouse/.test(t.type) ? (this._on(this.document, { mousemove: n }), n(t)) : o.position(e.extend({ of: i }, this.options.position)), o.hide(), this._show(o, this.options.show), this.options.show && this.options.show.delay && (h = this.delayedShow = setInterval(function () { o.is(":visible") && (n(u.of), clearInterval(h)) }, e.fx.interval)), this._trigger("open", t, { tooltip: o }), r = { keyup: function (t) { if (t.keyCode === e.ui.keyCode.ESCAPE) { var s = e.Event(t); s.currentTarget = i[0], this.close(s, !0) } } }, i[0] !== this.element[0] && (r.remove = function () { this._removeTooltip(o) }), t && "mouseover" !== t.type || (r.mouseleave = "close"), t && "focusin" !== t.type || (r.focusout = "close"), this._on(!0, i, r) } }, close: function (t) { var i, s = this, n = e(t ? t.currentTarget : this.element), a = this._find(n); a && (i = a.tooltip, a.closing || (clearInterval(this.delayedShow), n.data("ui-tooltip-title") && !n.attr("title") && n.attr("title", n.data("ui-tooltip-title")), this._removeDescribedBy(n), a.hiding = !0, i.stop(!0), this._hide(i, this.options.hide, function () { s._removeTooltip(e(this)) }), n.removeData("ui-tooltip-open"), this._off(n, "mouseleave focusout keyup"), n[0] !== this.element[0] && this._off(n, "remove"), this._off(this.document, "mousemove"), t && "mouseleave" === t.type && e.each(this.parents, function (t, i) { e(i.element).attr("title", i.title), delete s.parents[t] }), a.closing = !0, this._trigger("close", t, { tooltip: i }), a.hiding || (a.closing = !1))) }, _tooltip: function (t) { var i = e("<div>").attr("role", "tooltip").addClass("ui-tooltip ui-widget ui-corner-all ui-widget-content " + (this.options.tooltipClass || "")), s = i.uniqueId().attr("id"); return e("<div>").addClass("ui-tooltip-content").appendTo(i), i.appendTo(this.document[0].body), this.tooltips[s] = { element: t, tooltip: i } }, _find: function (e) { var t = e.data("ui-tooltip-id"); return t ? this.tooltips[t] : null }, _removeTooltip: function (e) { e.remove(), delete this.tooltips[e.attr("id")] }, _destroy: function () { var t = this; e.each(this.tooltips, function (i, s) { var n = e.Event("blur"), a = s.element; n.target = n.currentTarget = a[0], t.close(n, !0), e("#" + i).remove(), a.data("ui-tooltip-title") && (a.attr("title") || a.attr("title", a.data("ui-tooltip-title")), a.removeData("ui-tooltip-title")) }), this.liveRegion.remove() } }); var y = "ui-effects-", b = e; e.effects = { effect: {} }, function (e, t) { function i(e, t, i) { var s = d[t.type] || {}; return null == e ? i || !t.def ? null : t.def : (e = s.floor ? ~~e : parseFloat(e), isNaN(e) ? t.def : s.mod ? (e + s.mod) % s.mod : 0 > e ? 0 : e > s.max ? s.max : e) } function s(i) { var s = l(), n = s._rgba = []; return i = i.toLowerCase(), f(h, function (e, a) { var o, r = a.re.exec(i), h = r && a.parse(r), l = a.space || "rgba"; return h ? (o = s[l](h), s[u[l].cache] = o[u[l].cache], n = s._rgba = o._rgba, !1) : t }), n.length ? ("0,0,0,0" === n.join() && e.extend(n, a.transparent), s) : a[i] } function n(e, t, i) { return i = (i + 1) % 1, 1 > 6 * i ? e + 6 * (t - e) * i : 1 > 2 * i ? t : 2 > 3 * i ? e + 6 * (t - e) * (2 / 3 - i) : e } var a, o = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor", r = /^([\-+])=\s*(\d+\.?\d*)/, h = [{ re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function (e) { return [e[1], e[2], e[3], e[4]] } }, { re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function (e) { return [2.55 * e[1], 2.55 * e[2], 2.55 * e[3], e[4]] } }, { re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/, parse: function (e) { return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)] } }, { re: /#([a-f0-9])([a-f0-9])([a-f0-9])/, parse: function (e) { return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)] } }, { re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, space: "hsla", parse: function (e) { return [e[1], e[2] / 100, e[3] / 100, e[4]] } }], l = e.Color = function (t, i, s, n) { return new e.Color.fn.parse(t, i, s, n) }, u = { rgba: { props: { red: { idx: 0, type: "byte" }, green: { idx: 1, type: "byte" }, blue: { idx: 2, type: "byte" } } }, hsla: { props: { hue: { idx: 0, type: "degrees" }, saturation: { idx: 1, type: "percent" }, lightness: { idx: 2, type: "percent" } } } }, d = { "byte": { floor: !0, max: 255 }, percent: { max: 1 }, degrees: { mod: 360, floor: !0 } }, c = l.support = {}, p = e("<p>")[0], f = e.each; p.style.cssText = "background-color:rgba(1,1,1,.5)", c.rgba = p.style.backgroundColor.indexOf("rgba") > -1, f(u, function (e, t) { t.cache = "_" + e, t.props.alpha = { idx: 3, type: "percent", def: 1 } }), l.fn = e.extend(l.prototype, { parse: function (n, o, r, h) { if (n === t) return this._rgba = [null, null, null, null], this; (n.jquery || n.nodeType) && (n = e(n).css(o), o = t); var d = this, c = e.type(n), p = this._rgba = []; return o !== t && (n = [n, o, r, h], c = "array"), "string" === c ? this.parse(s(n) || a._default) : "array" === c ? (f(u.rgba.props, function (e, t) { p[t.idx] = i(n[t.idx], t) }), this) : "object" === c ? (n instanceof l ? f(u, function (e, t) { n[t.cache] && (d[t.cache] = n[t.cache].slice()) }) : f(u, function (t, s) { var a = s.cache; f(s.props, function (e, t) { if (!d[a] && s.to) { if ("alpha" === e || null == n[e]) return; d[a] = s.to(d._rgba) } d[a][t.idx] = i(n[e], t, !0) }), d[a] && 0 > e.inArray(null, d[a].slice(0, 3)) && (d[a][3] = 1, s.from && (d._rgba = s.from(d[a]))) }), this) : t }, is: function (e) { var i = l(e), s = !0, n = this; return f(u, function (e, a) { var o, r = i[a.cache]; return r && (o = n[a.cache] || a.to && a.to(n._rgba) || [], f(a.props, function (e, i) { return null != r[i.idx] ? s = r[i.idx] === o[i.idx] : t })), s }), s }, _space: function () { var e = [], t = this; return f(u, function (i, s) { t[s.cache] && e.push(i) }), e.pop() }, transition: function (e, t) { var s = l(e), n = s._space(), a = u[n], o = 0 === this.alpha() ? l("transparent") : this, r = o[a.cache] || a.to(o._rgba), h = r.slice(); return s = s[a.cache], f(a.props, function (e, n) { var a = n.idx, o = r[a], l = s[a], u = d[n.type] || {}; null !== l && (null === o ? h[a] = l : (u.mod && (l - o > u.mod / 2 ? o += u.mod : o - l > u.mod / 2 && (o -= u.mod)), h[a] = i((l - o) * t + o, n))) }), this[n](h) }, blend: function (t) { if (1 === this._rgba[3]) return this; var i = this._rgba.slice(), s = i.pop(), n = l(t)._rgba; return l(e.map(i, function (e, t) { return (1 - s) * n[t] + s * e })) }, toRgbaString: function () { var t = "rgba(", i = e.map(this._rgba, function (e, t) { return null == e ? t > 2 ? 1 : 0 : e }); return 1 === i[3] && (i.pop(), t = "rgb("), t + i.join() + ")" }, toHslaString: function () { var t = "hsla(", i = e.map(this.hsla(), function (e, t) { return null == e && (e = t > 2 ? 1 : 0), t && 3 > t && (e = Math.round(100 * e) + "%"), e }); return 1 === i[3] && (i.pop(), t = "hsl("), t + i.join() + ")" }, toHexString: function (t) { var i = this._rgba.slice(), s = i.pop(); return t && i.push(~~(255 * s)), "#" + e.map(i, function (e) { return e = (e || 0).toString(16), 1 === e.length ? "0" + e : e }).join("") }, toString: function () { return 0 === this._rgba[3] ? "transparent" : this.toRgbaString() } }), l.fn.parse.prototype = l.fn, u.hsla.to = function (e) { if (null == e[0] || null == e[1] || null == e[2]) return [null, null, null, e[3]]; var t, i, s = e[0] / 255, n = e[1] / 255, a = e[2] / 255, o = e[3], r = Math.max(s, n, a), h = Math.min(s, n, a), l = r - h, u = r + h, d = .5 * u; return t = h === r ? 0 : s === r ? 60 * (n - a) / l + 360 : n === r ? 60 * (a - s) / l + 120 : 60 * (s - n) / l + 240, i = 0 === l ? 0 : .5 >= d ? l / u : l / (2 - u), [Math.round(t) % 360, i, d, null == o ? 1 : o] }, u.hsla.from = function (e) { if (null == e[0] || null == e[1] || null == e[2]) return [null, null, null, e[3]]; var t = e[0] / 360, i = e[1], s = e[2], a = e[3], o = .5 >= s ? s * (1 + i) : s + i - s * i, r = 2 * s - o; return [Math.round(255 * n(r, o, t + 1 / 3)), Math.round(255 * n(r, o, t)), Math.round(255 * n(r, o, t - 1 / 3)), a] }, f(u, function (s, n) { var a = n.props, o = n.cache, h = n.to, u = n.from; l.fn[s] = function (s) { if (h && !this[o] && (this[o] = h(this._rgba)), s === t) return this[o].slice(); var n, r = e.type(s), d = "array" === r || "object" === r ? s : arguments, c = this[o].slice(); return f(a, function (e, t) { var s = d["object" === r ? e : t.idx]; null == s && (s = c[t.idx]), c[t.idx] = i(s, t) }), u ? (n = l(u(c)), n[o] = c, n) : l(c) }, f(a, function (t, i) { l.fn[t] || (l.fn[t] = function (n) { var a, o = e.type(n), h = "alpha" === t ? this._hsla ? "hsla" : "rgba" : s, l = this[h](), u = l[i.idx]; return "undefined" === o ? u : ("function" === o && (n = n.call(this, u), o = e.type(n)), null == n && i.empty ? this : ("string" === o && (a = r.exec(n), a && (n = u + parseFloat(a[2]) * ("+" === a[1] ? 1 : -1))), l[i.idx] = n, this[h](l))) }) }) }), l.hook = function (t) { var i = t.split(" "); f(i, function (t, i) { e.cssHooks[i] = { set: function (t, n) { var a, o, r = ""; if ("transparent" !== n && ("string" !== e.type(n) || (a = s(n)))) { if (n = l(a || n), !c.rgba && 1 !== n._rgba[3]) { for (o = "backgroundColor" === i ? t.parentNode : t; ("" === r || "transparent" === r) && o && o.style;) try { r = e.css(o, "backgroundColor"), o = o.parentNode } catch (h) { } n = n.blend(r && "transparent" !== r ? r : "_default") } n = n.toRgbaString() } try { t.style[i] = n } catch (h) { } } }, e.fx.step[i] = function (t) { t.colorInit || (t.start = l(t.elem, i), t.end = l(t.end), t.colorInit = !0), e.cssHooks[i].set(t.elem, t.start.transition(t.end, t.pos)) } }) }, l.hook(o), e.cssHooks.borderColor = { expand: function (e) { var t = {}; return f(["Top", "Right", "Bottom", "Left"], function (i, s) { t["border" + s + "Color"] = e }), t } }, a = e.Color.names = { aqua: "#00ffff", black: "#000000", blue: "#0000ff", fuchsia: "#ff00ff", gray: "#808080", green: "#008000", lime: "#00ff00", maroon: "#800000", navy: "#000080", olive: "#808000", purple: "#800080", red: "#ff0000", silver: "#c0c0c0", teal: "#008080", white: "#ffffff", yellow: "#ffff00", transparent: [null, null, null, 0], _default: "#ffffff" } }(b), function () { function t(t) { var i, s, n = t.ownerDocument.defaultView ? t.ownerDocument.defaultView.getComputedStyle(t, null) : t.currentStyle, a = {}; if (n && n.length && n[0] && n[n[0]]) for (s = n.length; s--;) i = n[s], "string" == typeof n[i] && (a[e.camelCase(i)] = n[i]); else for (i in n) "string" == typeof n[i] && (a[i] = n[i]); return a } function i(t, i) { var s, a, o = {}; for (s in i) a = i[s], t[s] !== a && (n[s] || (e.fx.step[s] || !isNaN(parseFloat(a))) && (o[s] = a)); return o } var s = ["add", "remove", "toggle"], n = { border: 1, borderBottom: 1, borderColor: 1, borderLeft: 1, borderRight: 1, borderTop: 1, borderWidth: 1, margin: 1, padding: 1 }; e.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function (t, i) { e.fx.step[i] = function (e) { ("none" !== e.end && !e.setAttr || 1 === e.pos && !e.setAttr) && (b.style(e.elem, i, e.end), e.setAttr = !0) } }), e.fn.addBack || (e.fn.addBack = function (e) { return this.add(null == e ? this.prevObject : this.prevObject.filter(e)) }), e.effects.animateClass = function (n, a, o, r) { var h = e.speed(a, o, r); return this.queue(function () { var a, o = e(this), r = o.attr("class") || "", l = h.children ? o.find("*").addBack() : o; l = l.map(function () { var i = e(this); return { el: i, start: t(this) } }), a = function () { e.each(s, function (e, t) { n[t] && o[t + "Class"](n[t]) }) }, a(), l = l.map(function () { return this.end = t(this.el[0]), this.diff = i(this.start, this.end), this }), o.attr("class", r), l = l.map(function () { var t = this, i = e.Deferred(), s = e.extend({}, h, { queue: !1, complete: function () { i.resolve(t) } }); return this.el.animate(this.diff, s), i.promise() }), e.when.apply(e, l.get()).done(function () { a(), e.each(arguments, function () { var t = this.el; e.each(this.diff, function (e) { t.css(e, "") }) }), h.complete.call(o[0]) }) }) }, e.fn.extend({ addClass: function (t) { return function (i, s, n, a) { return s ? e.effects.animateClass.call(this, { add: i }, s, n, a) : t.apply(this, arguments) } }(e.fn.addClass), removeClass: function (t) { return function (i, s, n, a) { return arguments.length > 1 ? e.effects.animateClass.call(this, { remove: i }, s, n, a) : t.apply(this, arguments) } }(e.fn.removeClass), toggleClass: function (t) { return function (i, s, n, a, o) { return "boolean" == typeof s || void 0 === s ? n ? e.effects.animateClass.call(this, s ? { add: i } : { remove: i }, n, a, o) : t.apply(this, arguments) : e.effects.animateClass.call(this, { toggle: i }, s, n, a) } }(e.fn.toggleClass), switchClass: function (t, i, s, n, a) { return e.effects.animateClass.call(this, { add: i, remove: t }, s, n, a) } }) }(), function () {
        function t(t, i, s, n) { return e.isPlainObject(t) && (i = t, t = t.effect), t = { effect: t }, null == i && (i = {}), e.isFunction(i) && (n = i, s = null, i = {}), ("number" == typeof i || e.fx.speeds[i]) && (n = s, s = i, i = {}), e.isFunction(s) && (n = s, s = null), i && e.extend(t, i), s = s || i.duration, t.duration = e.fx.off ? 0 : "number" == typeof s ? s : s in e.fx.speeds ? e.fx.speeds[s] : e.fx.speeds._default, t.complete = n || i.complete, t } function i(t) { return !t || "number" == typeof t || e.fx.speeds[t] ? !0 : "string" != typeof t || e.effects.effect[t] ? e.isFunction(t) ? !0 : "object" != typeof t || t.effect ? !1 : !0 : !0 } e.extend(e.effects, { version: "1.11.2", save: function (e, t) { for (var i = 0; t.length > i; i++) null !== t[i] && e.data(y + t[i], e[0].style[t[i]]) }, restore: function (e, t) { var i, s; for (s = 0; t.length > s; s++) null !== t[s] && (i = e.data(y + t[s]), void 0 === i && (i = ""), e.css(t[s], i)) }, setMode: function (e, t) { return "toggle" === t && (t = e.is(":hidden") ? "show" : "hide"), t }, getBaseline: function (e, t) { var i, s; switch (e[0]) { case "top": i = 0; break; case "middle": i = .5; break; case "bottom": i = 1; break; default: i = e[0] / t.height } switch (e[1]) { case "left": s = 0; break; case "center": s = .5; break; case "right": s = 1; break; default: s = e[1] / t.width } return { x: s, y: i } }, createWrapper: function (t) { if (t.parent().is(".ui-effects-wrapper")) return t.parent(); var i = { width: t.outerWidth(!0), height: t.outerHeight(!0), "float": t.css("float") }, s = e("<div></div>").addClass("ui-effects-wrapper").css({ fontSize: "100%", background: "transparent", border: "none", margin: 0, padding: 0 }), n = { width: t.width(), height: t.height() }, a = document.activeElement; try { a.id } catch (o) { a = document.body } return t.wrap(s), (t[0] === a || e.contains(t[0], a)) && e(a).focus(), s = t.parent(), "static" === t.css("position") ? (s.css({ position: "relative" }), t.css({ position: "relative" })) : (e.extend(i, { position: t.css("position"), zIndex: t.css("z-index") }), e.each(["top", "left", "bottom", "right"], function (e, s) { i[s] = t.css(s), isNaN(parseInt(i[s], 10)) && (i[s] = "auto") }), t.css({ position: "relative", top: 0, left: 0, right: "auto", bottom: "auto" })), t.css(n), s.css(i).show() }, removeWrapper: function (t) { var i = document.activeElement; return t.parent().is(".ui-effects-wrapper") && (t.parent().replaceWith(t), (t[0] === i || e.contains(t[0], i)) && e(i).focus()), t }, setTransition: function (t, i, s, n) { return n = n || {}, e.each(i, function (e, i) { var a = t.cssUnit(i); a[0] > 0 && (n[i] = a[0] * s + a[1]) }), n } }), e.fn.extend({
            effect: function () { function i(t) { function i() { e.isFunction(a) && a.call(n[0]), e.isFunction(t) && t() } var n = e(this), a = s.complete, r = s.mode; (n.is(":hidden") ? "hide" === r : "show" === r) ? (n[r](), i()) : o.call(n[0], s, i) } var s = t.apply(this, arguments), n = s.mode, a = s.queue, o = e.effects.effect[s.effect]; return e.fx.off || !o ? n ? this[n](s.duration, s.complete) : this.each(function () { s.complete && s.complete.call(this) }) : a === !1 ? this.each(i) : this.queue(a || "fx", i) }, show: function (e) { return function (s) { if (i(s)) return e.apply(this, arguments); var n = t.apply(this, arguments); return n.mode = "show", this.effect.call(this, n) } }(e.fn.show), hide: function (e) {
                return function (s) {
                    if (i(s)) return e.apply(this, arguments);
                    var n = t.apply(this, arguments); return n.mode = "hide", this.effect.call(this, n)
                }
            }(e.fn.hide), toggle: function (e) { return function (s) { if (i(s) || "boolean" == typeof s) return e.apply(this, arguments); var n = t.apply(this, arguments); return n.mode = "toggle", this.effect.call(this, n) } }(e.fn.toggle), cssUnit: function (t) { var i = this.css(t), s = []; return e.each(["em", "px", "%", "pt"], function (e, t) { i.indexOf(t) > 0 && (s = [parseFloat(i), t]) }), s }
        })
    }(), function () { var t = {}; e.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (e, i) { t[i] = function (t) { return Math.pow(t, e + 2) } }), e.extend(t, { Sine: function (e) { return 1 - Math.cos(e * Math.PI / 2) }, Circ: function (e) { return 1 - Math.sqrt(1 - e * e) }, Elastic: function (e) { return 0 === e || 1 === e ? e : -Math.pow(2, 8 * (e - 1)) * Math.sin((80 * (e - 1) - 7.5) * Math.PI / 15) }, Back: function (e) { return e * e * (3 * e - 2) }, Bounce: function (e) { for (var t, i = 4; ((t = Math.pow(2, --i)) - 1) / 11 > e;); return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((3 * t - 2) / 22 - e, 2) } }), e.each(t, function (t, i) { e.easing["easeIn" + t] = i, e.easing["easeOut" + t] = function (e) { return 1 - i(1 - e) }, e.easing["easeInOut" + t] = function (e) { return .5 > e ? i(2 * e) / 2 : 1 - i(-2 * e + 2) / 2 } }) }(), e.effects, e.effects.effect.blind = function (t, i) { var s, n, a, o = e(this), r = /up|down|vertical/, h = /up|left|vertical|horizontal/, l = ["position", "top", "bottom", "left", "right", "height", "width"], u = e.effects.setMode(o, t.mode || "hide"), d = t.direction || "up", c = r.test(d), p = c ? "height" : "width", f = c ? "top" : "left", m = h.test(d), g = {}, v = "show" === u; o.parent().is(".ui-effects-wrapper") ? e.effects.save(o.parent(), l) : e.effects.save(o, l), o.show(), s = e.effects.createWrapper(o).css({ overflow: "hidden" }), n = s[p](), a = parseFloat(s.css(f)) || 0, g[p] = v ? n : 0, m || (o.css(c ? "bottom" : "right", 0).css(c ? "top" : "left", "auto").css({ position: "absolute" }), g[f] = v ? a : n + a), v && (s.css(p, 0), m || s.css(f, a + n)), s.animate(g, { duration: t.duration, easing: t.easing, queue: !1, complete: function () { "hide" === u && o.hide(), e.effects.restore(o, l), e.effects.removeWrapper(o), i() } }) }, e.effects.effect.bounce = function (t, i) { var s, n, a, o = e(this), r = ["position", "top", "bottom", "left", "right", "height", "width"], h = e.effects.setMode(o, t.mode || "effect"), l = "hide" === h, u = "show" === h, d = t.direction || "up", c = t.distance, p = t.times || 5, f = 2 * p + (u || l ? 1 : 0), m = t.duration / f, g = t.easing, v = "up" === d || "down" === d ? "top" : "left", y = "up" === d || "left" === d, b = o.queue(), _ = b.length; for ((u || l) && r.push("opacity"), e.effects.save(o, r), o.show(), e.effects.createWrapper(o), c || (c = o["top" === v ? "outerHeight" : "outerWidth"]() / 3), u && (a = { opacity: 1 }, a[v] = 0, o.css("opacity", 0).css(v, y ? 2 * -c : 2 * c).animate(a, m, g)), l && (c /= Math.pow(2, p - 1)), a = {}, a[v] = 0, s = 0; p > s; s++) n = {}, n[v] = (y ? "-=" : "+=") + c, o.animate(n, m, g).animate(a, m, g), c = l ? 2 * c : c / 2; l && (n = { opacity: 0 }, n[v] = (y ? "-=" : "+=") + c, o.animate(n, m, g)), o.queue(function () { l && o.hide(), e.effects.restore(o, r), e.effects.removeWrapper(o), i() }), _ > 1 && b.splice.apply(b, [1, 0].concat(b.splice(_, f + 1))), o.dequeue() }, e.effects.effect.clip = function (t, i) { var s, n, a, o = e(this), r = ["position", "top", "bottom", "left", "right", "height", "width"], h = e.effects.setMode(o, t.mode || "hide"), l = "show" === h, u = t.direction || "vertical", d = "vertical" === u, c = d ? "height" : "width", p = d ? "top" : "left", f = {}; e.effects.save(o, r), o.show(), s = e.effects.createWrapper(o).css({ overflow: "hidden" }), n = "IMG" === o[0].tagName ? s : o, a = n[c](), l && (n.css(c, 0), n.css(p, a / 2)), f[c] = l ? a : 0, f[p] = l ? 0 : a / 2, n.animate(f, { queue: !1, duration: t.duration, easing: t.easing, complete: function () { l || o.hide(), e.effects.restore(o, r), e.effects.removeWrapper(o), i() } }) }, e.effects.effect.drop = function (t, i) { var s, n = e(this), a = ["position", "top", "bottom", "left", "right", "opacity", "height", "width"], o = e.effects.setMode(n, t.mode || "hide"), r = "show" === o, h = t.direction || "left", l = "up" === h || "down" === h ? "top" : "left", u = "up" === h || "left" === h ? "pos" : "neg", d = { opacity: r ? 1 : 0 }; e.effects.save(n, a), n.show(), e.effects.createWrapper(n), s = t.distance || n["top" === l ? "outerHeight" : "outerWidth"](!0) / 2, r && n.css("opacity", 0).css(l, "pos" === u ? -s : s), d[l] = (r ? "pos" === u ? "+=" : "-=" : "pos" === u ? "-=" : "+=") + s, n.animate(d, { queue: !1, duration: t.duration, easing: t.easing, complete: function () { "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i() } }) }, e.effects.effect.explode = function (t, i) { function s() { b.push(this), b.length === d * c && n() } function n() { p.css({ visibility: "visible" }), e(b).remove(), m || p.hide(), i() } var a, o, r, h, l, u, d = t.pieces ? Math.round(Math.sqrt(t.pieces)) : 3, c = d, p = e(this), f = e.effects.setMode(p, t.mode || "hide"), m = "show" === f, g = p.show().css("visibility", "hidden").offset(), v = Math.ceil(p.outerWidth() / c), y = Math.ceil(p.outerHeight() / d), b = []; for (a = 0; d > a; a++) for (h = g.top + a * y, u = a - (d - 1) / 2, o = 0; c > o; o++) r = g.left + o * v, l = o - (c - 1) / 2, p.clone().appendTo("body").wrap("<div></div>").css({ position: "absolute", visibility: "visible", left: -o * v, top: -a * y }).parent().addClass("ui-effects-explode").css({ position: "absolute", overflow: "hidden", width: v, height: y, left: r + (m ? l * v : 0), top: h + (m ? u * y : 0), opacity: m ? 0 : 1 }).animate({ left: r + (m ? 0 : l * v), top: h + (m ? 0 : u * y), opacity: m ? 1 : 0 }, t.duration || 500, t.easing, s) }, e.effects.effect.fade = function (t, i) { var s = e(this), n = e.effects.setMode(s, t.mode || "toggle"); s.animate({ opacity: n }, { queue: !1, duration: t.duration, easing: t.easing, complete: i }) }, e.effects.effect.fold = function (t, i) { var s, n, a = e(this), o = ["position", "top", "bottom", "left", "right", "height", "width"], r = e.effects.setMode(a, t.mode || "hide"), h = "show" === r, l = "hide" === r, u = t.size || 15, d = /([0-9]+)%/.exec(u), c = !!t.horizFirst, p = h !== c, f = p ? ["width", "height"] : ["height", "width"], m = t.duration / 2, g = {}, v = {}; e.effects.save(a, o), a.show(), s = e.effects.createWrapper(a).css({ overflow: "hidden" }), n = p ? [s.width(), s.height()] : [s.height(), s.width()], d && (u = parseInt(d[1], 10) / 100 * n[l ? 0 : 1]), h && s.css(c ? { height: 0, width: u } : { height: u, width: 0 }), g[f[0]] = h ? n[0] : u, v[f[1]] = h ? n[1] : 0, s.animate(g, m, t.easing).animate(v, m, t.easing, function () { l && a.hide(), e.effects.restore(a, o), e.effects.removeWrapper(a), i() }) }, e.effects.effect.highlight = function (t, i) { var s = e(this), n = ["backgroundImage", "backgroundColor", "opacity"], a = e.effects.setMode(s, t.mode || "show"), o = { backgroundColor: s.css("backgroundColor") }; "hide" === a && (o.opacity = 0), e.effects.save(s, n), s.show().css({ backgroundImage: "none", backgroundColor: t.color || "#ffff99" }).animate(o, { queue: !1, duration: t.duration, easing: t.easing, complete: function () { "hide" === a && s.hide(), e.effects.restore(s, n), i() } }) }, e.effects.effect.size = function (t, i) { var s, n, a, o = e(this), r = ["position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity"], h = ["position", "top", "bottom", "left", "right", "overflow", "opacity"], l = ["width", "height", "overflow"], u = ["fontSize"], d = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"], c = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"], p = e.effects.setMode(o, t.mode || "effect"), f = t.restore || "effect" !== p, m = t.scale || "both", g = t.origin || ["middle", "center"], v = o.css("position"), y = f ? r : h, b = { height: 0, width: 0, outerHeight: 0, outerWidth: 0 }; "show" === p && o.show(), s = { height: o.height(), width: o.width(), outerHeight: o.outerHeight(), outerWidth: o.outerWidth() }, "toggle" === t.mode && "show" === p ? (o.from = t.to || b, o.to = t.from || s) : (o.from = t.from || ("show" === p ? b : s), o.to = t.to || ("hide" === p ? b : s)), a = { from: { y: o.from.height / s.height, x: o.from.width / s.width }, to: { y: o.to.height / s.height, x: o.to.width / s.width } }, ("box" === m || "both" === m) && (a.from.y !== a.to.y && (y = y.concat(d), o.from = e.effects.setTransition(o, d, a.from.y, o.from), o.to = e.effects.setTransition(o, d, a.to.y, o.to)), a.from.x !== a.to.x && (y = y.concat(c), o.from = e.effects.setTransition(o, c, a.from.x, o.from), o.to = e.effects.setTransition(o, c, a.to.x, o.to))), ("content" === m || "both" === m) && a.from.y !== a.to.y && (y = y.concat(u).concat(l), o.from = e.effects.setTransition(o, u, a.from.y, o.from), o.to = e.effects.setTransition(o, u, a.to.y, o.to)), e.effects.save(o, y), o.show(), e.effects.createWrapper(o), o.css("overflow", "hidden").css(o.from), g && (n = e.effects.getBaseline(g, s), o.from.top = (s.outerHeight - o.outerHeight()) * n.y, o.from.left = (s.outerWidth - o.outerWidth()) * n.x, o.to.top = (s.outerHeight - o.to.outerHeight) * n.y, o.to.left = (s.outerWidth - o.to.outerWidth) * n.x), o.css(o.from), ("content" === m || "both" === m) && (d = d.concat(["marginTop", "marginBottom"]).concat(u), c = c.concat(["marginLeft", "marginRight"]), l = r.concat(d).concat(c), o.find("*[width]").each(function () { var i = e(this), s = { height: i.height(), width: i.width(), outerHeight: i.outerHeight(), outerWidth: i.outerWidth() }; f && e.effects.save(i, l), i.from = { height: s.height * a.from.y, width: s.width * a.from.x, outerHeight: s.outerHeight * a.from.y, outerWidth: s.outerWidth * a.from.x }, i.to = { height: s.height * a.to.y, width: s.width * a.to.x, outerHeight: s.height * a.to.y, outerWidth: s.width * a.to.x }, a.from.y !== a.to.y && (i.from = e.effects.setTransition(i, d, a.from.y, i.from), i.to = e.effects.setTransition(i, d, a.to.y, i.to)), a.from.x !== a.to.x && (i.from = e.effects.setTransition(i, c, a.from.x, i.from), i.to = e.effects.setTransition(i, c, a.to.x, i.to)), i.css(i.from), i.animate(i.to, t.duration, t.easing, function () { f && e.effects.restore(i, l) }) })), o.animate(o.to, { queue: !1, duration: t.duration, easing: t.easing, complete: function () { 0 === o.to.opacity && o.css("opacity", o.from.opacity), "hide" === p && o.hide(), e.effects.restore(o, y), f || ("static" === v ? o.css({ position: "relative", top: o.to.top, left: o.to.left }) : e.each(["top", "left"], function (e, t) { o.css(t, function (t, i) { var s = parseInt(i, 10), n = e ? o.to.left : o.to.top; return "auto" === i ? n + "px" : s + n + "px" }) })), e.effects.removeWrapper(o), i() } }) }, e.effects.effect.scale = function (t, i) { var s = e(this), n = e.extend(!0, {}, t), a = e.effects.setMode(s, t.mode || "effect"), o = parseInt(t.percent, 10) || (0 === parseInt(t.percent, 10) ? 0 : "hide" === a ? 0 : 100), r = t.direction || "both", h = t.origin, l = { height: s.height(), width: s.width(), outerHeight: s.outerHeight(), outerWidth: s.outerWidth() }, u = { y: "horizontal" !== r ? o / 100 : 1, x: "vertical" !== r ? o / 100 : 1 }; n.effect = "size", n.queue = !1, n.complete = i, "effect" !== a && (n.origin = h || ["middle", "center"], n.restore = !0), n.from = t.from || ("show" === a ? { height: 0, width: 0, outerHeight: 0, outerWidth: 0 } : l), n.to = { height: l.height * u.y, width: l.width * u.x, outerHeight: l.outerHeight * u.y, outerWidth: l.outerWidth * u.x }, n.fade && ("show" === a && (n.from.opacity = 0, n.to.opacity = 1), "hide" === a && (n.from.opacity = 1, n.to.opacity = 0)), s.effect(n) }, e.effects.effect.puff = function (t, i) { var s = e(this), n = e.effects.setMode(s, t.mode || "hide"), a = "hide" === n, o = parseInt(t.percent, 10) || 150, r = o / 100, h = { height: s.height(), width: s.width(), outerHeight: s.outerHeight(), outerWidth: s.outerWidth() }; e.extend(t, { effect: "scale", queue: !1, fade: !0, mode: n, complete: i, percent: a ? o : 100, from: a ? h : { height: h.height * r, width: h.width * r, outerHeight: h.outerHeight * r, outerWidth: h.outerWidth * r } }), s.effect(t) }, e.effects.effect.pulsate = function (t, i) { var s, n = e(this), a = e.effects.setMode(n, t.mode || "show"), o = "show" === a, r = "hide" === a, h = o || "hide" === a, l = 2 * (t.times || 5) + (h ? 1 : 0), u = t.duration / l, d = 0, c = n.queue(), p = c.length; for ((o || !n.is(":visible")) && (n.css("opacity", 0).show(), d = 1), s = 1; l > s; s++) n.animate({ opacity: d }, u, t.easing), d = 1 - d; n.animate({ opacity: d }, u, t.easing), n.queue(function () { r && n.hide(), i() }), p > 1 && c.splice.apply(c, [1, 0].concat(c.splice(p, l + 1))), n.dequeue() }, e.effects.effect.shake = function (t, i) { var s, n = e(this), a = ["position", "top", "bottom", "left", "right", "height", "width"], o = e.effects.setMode(n, t.mode || "effect"), r = t.direction || "left", h = t.distance || 20, l = t.times || 3, u = 2 * l + 1, d = Math.round(t.duration / u), c = "up" === r || "down" === r ? "top" : "left", p = "up" === r || "left" === r, f = {}, m = {}, g = {}, v = n.queue(), y = v.length; for (e.effects.save(n, a), n.show(), e.effects.createWrapper(n), f[c] = (p ? "-=" : "+=") + h, m[c] = (p ? "+=" : "-=") + 2 * h, g[c] = (p ? "-=" : "+=") + 2 * h, n.animate(f, d, t.easing), s = 1; l > s; s++) n.animate(m, d, t.easing).animate(g, d, t.easing); n.animate(m, d, t.easing).animate(f, d / 2, t.easing).queue(function () { "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i() }), y > 1 && v.splice.apply(v, [1, 0].concat(v.splice(y, u + 1))), n.dequeue() }, e.effects.effect.slide = function (t, i) { var s, n = e(this), a = ["position", "top", "bottom", "left", "right", "width", "height"], o = e.effects.setMode(n, t.mode || "show"), r = "show" === o, h = t.direction || "left", l = "up" === h || "down" === h ? "top" : "left", u = "up" === h || "left" === h, d = {}; e.effects.save(n, a), n.show(), s = t.distance || n["top" === l ? "outerHeight" : "outerWidth"](!0), e.effects.createWrapper(n).css({ overflow: "hidden" }), r && n.css(l, u ? isNaN(s) ? "-" + s : -s : s), d[l] = (r ? u ? "+=" : "-=" : u ? "-=" : "+=") + s, n.animate(d, { queue: !1, duration: t.duration, easing: t.easing, complete: function () { "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i() } }) }, e.effects.effect.transfer = function (t, i) { var s = e(this), n = e(t.to), a = "fixed" === n.css("position"), o = e("body"), r = a ? o.scrollTop() : 0, h = a ? o.scrollLeft() : 0, l = n.offset(), u = { top: l.top - r, left: l.left - h, height: n.innerHeight(), width: n.innerWidth() }, d = s.offset(), c = e("<div class='ui-effects-transfer'></div>").appendTo(document.body).addClass(t.className).css({ top: d.top - r, left: d.left - h, height: s.innerHeight(), width: s.innerWidth(), position: a ? "fixed" : "absolute" }).animate(u, t.duration, t.easing, function () { c.remove(), i() }) }
});
/*!
 * Bootstrap v3.3.5 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under the MIT license
 */
if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery"); +function (a) { "use strict"; var b = a.fn.jquery.split(" ")[0].split("."); if (b[0] < 2 && b[1] < 9 || 1 == b[0] && 9 == b[1] && b[2] < 1) throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher") }(jQuery), +function (a) { "use strict"; function b() { var a = document.createElement("bootstrap"), b = { WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd otransitionend", transition: "transitionend" }; for (var c in b) if (void 0 !== a.style[c]) return { end: b[c] }; return !1 } a.fn.emulateTransitionEnd = function (b) { var c = !1, d = this; a(this).one("bsTransitionEnd", function () { c = !0 }); var e = function () { c || a(d).trigger(a.support.transition.end) }; return setTimeout(e, b), this }, a(function () { a.support.transition = b(), a.support.transition && (a.event.special.bsTransitionEnd = { bindType: a.support.transition.end, delegateType: a.support.transition.end, handle: function (b) { return a(b.target).is(this) ? b.handleObj.handler.apply(this, arguments) : void 0 } }) }) }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var c = a(this), e = c.data("bs.alert"); e || c.data("bs.alert", e = new d(this)), "string" == typeof b && e[b].call(c) }) } var c = '[data-dismiss="alert"]', d = function (b) { a(b).on("click", c, this.close) }; d.VERSION = "3.3.5", d.TRANSITION_DURATION = 150, d.prototype.close = function (b) { function c() { g.detach().trigger("closed.bs.alert").remove() } var e = a(this), f = e.attr("data-target"); f || (f = e.attr("href"), f = f && f.replace(/.*(?=#[^\s]*$)/, "")); var g = a(f); b && b.preventDefault(), g.length || (g = e.closest(".alert")), g.trigger(b = a.Event("close.bs.alert")), b.isDefaultPrevented() || (g.removeClass("in"), a.support.transition && g.hasClass("fade") ? g.one("bsTransitionEnd", c).emulateTransitionEnd(d.TRANSITION_DURATION) : c()) }; var e = a.fn.alert; a.fn.alert = b, a.fn.alert.Constructor = d, a.fn.alert.noConflict = function () { return a.fn.alert = e, this }, a(document).on("click.bs.alert.data-api", c, d.prototype.close) }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.button"), f = "object" == typeof b && b; e || d.data("bs.button", e = new c(this, f)), "toggle" == b ? e.toggle() : b && e.setState(b) }) } var c = function (b, d) { this.$element = a(b), this.options = a.extend({}, c.DEFAULTS, d), this.isLoading = !1 }; c.VERSION = "3.3.5", c.DEFAULTS = { loadingText: "loading..." }, c.prototype.setState = function (b) { var c = "disabled", d = this.$element, e = d.is("input") ? "val" : "html", f = d.data(); b += "Text", null == f.resetText && d.data("resetText", d[e]()), setTimeout(a.proxy(function () { d[e](null == f[b] ? this.options[b] : f[b]), "loadingText" == b ? (this.isLoading = !0, d.addClass(c).attr(c, c)) : this.isLoading && (this.isLoading = !1, d.removeClass(c).removeAttr(c)) }, this), 0) }, c.prototype.toggle = function () { var a = !0, b = this.$element.closest('[data-toggle="buttons"]'); if (b.length) { var c = this.$element.find("input"); "radio" == c.prop("type") ? (c.prop("checked") && (a = !1), b.find(".active").removeClass("active"), this.$element.addClass("active")) : "checkbox" == c.prop("type") && (c.prop("checked") !== this.$element.hasClass("active") && (a = !1), this.$element.toggleClass("active")), c.prop("checked", this.$element.hasClass("active")), a && c.trigger("change") } else this.$element.attr("aria-pressed", !this.$element.hasClass("active")), this.$element.toggleClass("active") }; var d = a.fn.button; a.fn.button = b, a.fn.button.Constructor = c, a.fn.button.noConflict = function () { return a.fn.button = d, this }, a(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function (c) { var d = a(c.target); d.hasClass("btn") || (d = d.closest(".btn")), b.call(d, "toggle"), a(c.target).is('input[type="radio"]') || a(c.target).is('input[type="checkbox"]') || c.preventDefault() }).on("focus.bs.button.data-api blur.bs.button.data-api", '[data-toggle^="button"]', function (b) { a(b.target).closest(".btn").toggleClass("focus", /^focus(in)?$/.test(b.type)) }) }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.carousel"), f = a.extend({}, c.DEFAULTS, d.data(), "object" == typeof b && b), g = "string" == typeof b ? b : f.slide; e || d.data("bs.carousel", e = new c(this, f)), "number" == typeof b ? e.to(b) : g ? e[g]() : f.interval && e.pause().cycle() }) } var c = function (b, c) { this.$element = a(b), this.$indicators = this.$element.find(".carousel-indicators"), this.options = c, this.paused = null, this.sliding = null, this.interval = null, this.$active = null, this.$items = null, this.options.keyboard && this.$element.on("keydown.bs.carousel", a.proxy(this.keydown, this)), "hover" == this.options.pause && !("ontouchstart" in document.documentElement) && this.$element.on("mouseenter.bs.carousel", a.proxy(this.pause, this)).on("mouseleave.bs.carousel", a.proxy(this.cycle, this)) }; c.VERSION = "3.3.5", c.TRANSITION_DURATION = 600, c.DEFAULTS = { interval: 5e3, pause: "hover", wrap: !0, keyboard: !0 }, c.prototype.keydown = function (a) { if (!/input|textarea/i.test(a.target.tagName)) { switch (a.which) { case 37: this.prev(); break; case 39: this.next(); break; default: return } a.preventDefault() } }, c.prototype.cycle = function (b) { return b || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(a.proxy(this.next, this), this.options.interval)), this }, c.prototype.getItemIndex = function (a) { return this.$items = a.parent().children(".item"), this.$items.index(a || this.$active) }, c.prototype.getItemForDirection = function (a, b) { var c = this.getItemIndex(b), d = "prev" == a && 0 === c || "next" == a && c == this.$items.length - 1; if (d && !this.options.wrap) return b; var e = "prev" == a ? -1 : 1, f = (c + e) % this.$items.length; return this.$items.eq(f) }, c.prototype.to = function (a) { var b = this, c = this.getItemIndex(this.$active = this.$element.find(".item.active")); return a > this.$items.length - 1 || 0 > a ? void 0 : this.sliding ? this.$element.one("slid.bs.carousel", function () { b.to(a) }) : c == a ? this.pause().cycle() : this.slide(a > c ? "next" : "prev", this.$items.eq(a)) }, c.prototype.pause = function (b) { return b || (this.paused = !0), this.$element.find(".next, .prev").length && a.support.transition && (this.$element.trigger(a.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this }, c.prototype.next = function () { return this.sliding ? void 0 : this.slide("next") }, c.prototype.prev = function () { return this.sliding ? void 0 : this.slide("prev") }, c.prototype.slide = function (b, d) { var e = this.$element.find(".item.active"), f = d || this.getItemForDirection(b, e), g = this.interval, h = "next" == b ? "left" : "right", i = this; if (f.hasClass("active")) return this.sliding = !1; var j = f[0], k = a.Event("slide.bs.carousel", { relatedTarget: j, direction: h }); if (this.$element.trigger(k), !k.isDefaultPrevented()) { if (this.sliding = !0, g && this.pause(), this.$indicators.length) { this.$indicators.find(".active").removeClass("active"); var l = a(this.$indicators.children()[this.getItemIndex(f)]); l && l.addClass("active") } var m = a.Event("slid.bs.carousel", { relatedTarget: j, direction: h }); return a.support.transition && this.$element.hasClass("slide") ? (f.addClass(b), f[0].offsetWidth, e.addClass(h), f.addClass(h), e.one("bsTransitionEnd", function () { f.removeClass([b, h].join(" ")).addClass("active"), e.removeClass(["active", h].join(" ")), i.sliding = !1, setTimeout(function () { i.$element.trigger(m) }, 0) }).emulateTransitionEnd(c.TRANSITION_DURATION)) : (e.removeClass("active"), f.addClass("active"), this.sliding = !1, this.$element.trigger(m)), g && this.cycle(), this } }; var d = a.fn.carousel; a.fn.carousel = b, a.fn.carousel.Constructor = c, a.fn.carousel.noConflict = function () { return a.fn.carousel = d, this }; var e = function (c) { var d, e = a(this), f = a(e.attr("data-target") || (d = e.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, "")); if (f.hasClass("carousel")) { var g = a.extend({}, f.data(), e.data()), h = e.attr("data-slide-to"); h && (g.interval = !1), b.call(f, g), h && f.data("bs.carousel").to(h), c.preventDefault() } }; a(document).on("click.bs.carousel.data-api", "[data-slide]", e).on("click.bs.carousel.data-api", "[data-slide-to]", e), a(window).on("load", function () { a('[data-ride="carousel"]').each(function () { var c = a(this); b.call(c, c.data()) }) }) }(jQuery), +function (a) { "use strict"; function b(b) { var c, d = b.attr("data-target") || (c = b.attr("href")) && c.replace(/.*(?=#[^\s]+$)/, ""); return a(d) } function c(b) { return this.each(function () { var c = a(this), e = c.data("bs.collapse"), f = a.extend({}, d.DEFAULTS, c.data(), "object" == typeof b && b); !e && f.toggle && /show|hide/.test(b) && (f.toggle = !1), e || c.data("bs.collapse", e = new d(this, f)), "string" == typeof b && e[b]() }) } var d = function (b, c) { this.$element = a(b), this.options = a.extend({}, d.DEFAULTS, c), this.$trigger = a('[data-toggle="collapse"][href="#' + b.id + '"],[data-toggle="collapse"][data-target="#' + b.id + '"]'), this.transitioning = null, this.options.parent ? this.$parent = this.getParent() : this.addAriaAndCollapsedClass(this.$element, this.$trigger), this.options.toggle && this.toggle() }; d.VERSION = "3.3.5", d.TRANSITION_DURATION = 350, d.DEFAULTS = { toggle: !0 }, d.prototype.dimension = function () { var a = this.$element.hasClass("width"); return a ? "width" : "height" }, d.prototype.show = function () { if (!this.transitioning && !this.$element.hasClass("in")) { var b, e = this.$parent && this.$parent.children(".panel").children(".in, .collapsing"); if (!(e && e.length && (b = e.data("bs.collapse"), b && b.transitioning))) { var f = a.Event("show.bs.collapse"); if (this.$element.trigger(f), !f.isDefaultPrevented()) { e && e.length && (c.call(e, "hide"), b || e.data("bs.collapse", null)); var g = this.dimension(); this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded", !0), this.$trigger.removeClass("collapsed").attr("aria-expanded", !0), this.transitioning = 1; var h = function () { this.$element.removeClass("collapsing").addClass("collapse in")[g](""), this.transitioning = 0, this.$element.trigger("shown.bs.collapse") }; if (!a.support.transition) return h.call(this); var i = a.camelCase(["scroll", g].join("-")); this.$element.one("bsTransitionEnd", a.proxy(h, this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i]) } } } }, d.prototype.hide = function () { if (!this.transitioning && this.$element.hasClass("in")) { var b = a.Event("hide.bs.collapse"); if (this.$element.trigger(b), !b.isDefaultPrevented()) { var c = this.dimension(); this.$element[c](this.$element[c]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded", !1), this.$trigger.addClass("collapsed").attr("aria-expanded", !1), this.transitioning = 1; var e = function () { this.transitioning = 0, this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse") }; return a.support.transition ? void this.$element[c](0).one("bsTransitionEnd", a.proxy(e, this)).emulateTransitionEnd(d.TRANSITION_DURATION) : e.call(this) } } }, d.prototype.toggle = function () { this[this.$element.hasClass("in") ? "hide" : "show"]() }, d.prototype.getParent = function () { return a(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each(a.proxy(function (c, d) { var e = a(d); this.addAriaAndCollapsedClass(b(e), e) }, this)).end() }, d.prototype.addAriaAndCollapsedClass = function (a, b) { var c = a.hasClass("in"); a.attr("aria-expanded", c), b.toggleClass("collapsed", !c).attr("aria-expanded", c) }; var e = a.fn.collapse; a.fn.collapse = c, a.fn.collapse.Constructor = d, a.fn.collapse.noConflict = function () { return a.fn.collapse = e, this }, a(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function (d) { var e = a(this); e.attr("data-target") || d.preventDefault(); var f = b(e), g = f.data("bs.collapse"), h = g ? "toggle" : e.data(); c.call(f, h) }) }(jQuery), +function (a) { "use strict"; function b(b) { var c = b.attr("data-target"); c || (c = b.attr("href"), c = c && /#[A-Za-z]/.test(c) && c.replace(/.*(?=#[^\s]*$)/, "")); var d = c && a(c); return d && d.length ? d : b.parent() } function c(c) { c && 3 === c.which || (a(e).remove(), a(f).each(function () { var d = a(this), e = b(d), f = { relatedTarget: this }; e.hasClass("open") && (c && "click" == c.type && /input|textarea/i.test(c.target.tagName) && a.contains(e[0], c.target) || (e.trigger(c = a.Event("hide.bs.dropdown", f)), c.isDefaultPrevented() || (d.attr("aria-expanded", "false"), e.removeClass("open").trigger("hidden.bs.dropdown", f)))) })) } function d(b) { return this.each(function () { var c = a(this), d = c.data("bs.dropdown"); d || c.data("bs.dropdown", d = new g(this)), "string" == typeof b && d[b].call(c) }) } var e = ".dropdown-backdrop", f = '[data-toggle="dropdown"]', g = function (b) { a(b).on("click.bs.dropdown", this.toggle) }; g.VERSION = "3.3.5", g.prototype.toggle = function (d) { var e = a(this); if (!e.is(".disabled, :disabled")) { var f = b(e), g = f.hasClass("open"); if (c(), !g) { "ontouchstart" in document.documentElement && !f.closest(".navbar-nav").length && a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click", c); var h = { relatedTarget: this }; if (f.trigger(d = a.Event("show.bs.dropdown", h)), d.isDefaultPrevented()) return; e.trigger("focus").attr("aria-expanded", "true"), f.toggleClass("open").trigger("shown.bs.dropdown", h) } return !1 } }, g.prototype.keydown = function (c) { if (/(38|40|27|32)/.test(c.which) && !/input|textarea/i.test(c.target.tagName)) { var d = a(this); if (c.preventDefault(), c.stopPropagation(), !d.is(".disabled, :disabled")) { var e = b(d), g = e.hasClass("open"); if (!g && 27 != c.which || g && 27 == c.which) return 27 == c.which && e.find(f).trigger("focus"), d.trigger("click"); var h = " li:not(.disabled):visible a", i = e.find(".dropdown-menu" + h); if (i.length) { var j = i.index(c.target); 38 == c.which && j > 0 && j--, 40 == c.which && j < i.length - 1 && j++, ~j || (j = 0), i.eq(j).trigger("focus") } } } }; var h = a.fn.dropdown; a.fn.dropdown = d, a.fn.dropdown.Constructor = g, a.fn.dropdown.noConflict = function () { return a.fn.dropdown = h, this }, a(document).on("click.bs.dropdown.data-api", c).on("click.bs.dropdown.data-api", ".dropdown form", function (a) { a.stopPropagation() }).on("click.bs.dropdown.data-api", f, g.prototype.toggle).on("keydown.bs.dropdown.data-api", f, g.prototype.keydown).on("keydown.bs.dropdown.data-api", ".dropdown-menu", g.prototype.keydown) }(jQuery), +function (a) { "use strict"; function b(b, d) { return this.each(function () { var e = a(this), f = e.data("bs.modal"), g = a.extend({}, c.DEFAULTS, e.data(), "object" == typeof b && b); f || e.data("bs.modal", f = new c(this, g)), "string" == typeof b ? f[b](d) : g.show && f.show(d) }) } var c = function (b, c) { this.options = c, this.$body = a(document.body), this.$element = a(b), this.$dialog = this.$element.find(".modal-dialog"), this.$backdrop = null, this.isShown = null, this.originalBodyPad = null, this.scrollbarWidth = 0, this.ignoreBackdropClick = !1, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, a.proxy(function () { this.$element.trigger("loaded.bs.modal") }, this)) }; c.VERSION = "3.3.5", c.TRANSITION_DURATION = 300, c.BACKDROP_TRANSITION_DURATION = 150, c.DEFAULTS = { backdrop: !0, keyboard: !0, show: !0 }, c.prototype.toggle = function (a) { return this.isShown ? this.hide() : this.show(a) }, c.prototype.show = function (b) { var d = this, e = a.Event("show.bs.modal", { relatedTarget: b }); this.$element.trigger(e), this.isShown || e.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.setScrollbar(), this.$body.addClass("modal-open"), this.escape(), this.resize(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', a.proxy(this.hide, this)), this.$dialog.on("mousedown.dismiss.bs.modal", function () { d.$element.one("mouseup.dismiss.bs.modal", function (b) { a(b.target).is(d.$element) && (d.ignoreBackdropClick = !0) }) }), this.backdrop(function () { var e = a.support.transition && d.$element.hasClass("fade"); d.$element.parent().length || d.$element.appendTo(d.$body), d.$element.show().scrollTop(0), d.adjustDialog(), e && d.$element[0].offsetWidth, d.$element.addClass("in"), d.enforceFocus(); var f = a.Event("shown.bs.modal", { relatedTarget: b }); e ? d.$dialog.one("bsTransitionEnd", function () { d.$element.trigger("focus").trigger(f) }).emulateTransitionEnd(c.TRANSITION_DURATION) : d.$element.trigger("focus").trigger(f) })) }, c.prototype.hide = function (b) { b && b.preventDefault(), b = a.Event("hide.bs.modal"), this.$element.trigger(b), this.isShown && !b.isDefaultPrevented() && (this.isShown = !1, this.escape(), this.resize(), a(document).off("focusin.bs.modal"), this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"), this.$dialog.off("mousedown.dismiss.bs.modal"), a.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", a.proxy(this.hideModal, this)).emulateTransitionEnd(c.TRANSITION_DURATION) : this.hideModal()) }, c.prototype.enforceFocus = function () { a(document).off("focusin.bs.modal").on("focusin.bs.modal", a.proxy(function (a) { this.$element[0] === a.target || this.$element.has(a.target).length || this.$element.trigger("focus") }, this)) }, c.prototype.escape = function () { this.isShown && this.options.keyboard ? this.$element.on("keydown.dismiss.bs.modal", a.proxy(function (a) { 27 == a.which && this.hide() }, this)) : this.isShown || this.$element.off("keydown.dismiss.bs.modal") }, c.prototype.resize = function () { this.isShown ? a(window).on("resize.bs.modal", a.proxy(this.handleUpdate, this)) : a(window).off("resize.bs.modal") }, c.prototype.hideModal = function () { var a = this; this.$element.hide(), this.backdrop(function () { a.$body.removeClass("modal-open"), a.resetAdjustments(), a.resetScrollbar(), a.$element.trigger("hidden.bs.modal") }) }, c.prototype.removeBackdrop = function () { this.$backdrop && this.$backdrop.remove(), this.$backdrop = null }, c.prototype.backdrop = function (b) { var d = this, e = this.$element.hasClass("fade") ? "fade" : ""; if (this.isShown && this.options.backdrop) { var f = a.support.transition && e; if (this.$backdrop = a(document.createElement("div")).addClass("modal-backdrop " + e).appendTo(this.$body), this.$element.on("click.dismiss.bs.modal", a.proxy(function (a) { return this.ignoreBackdropClick ? void (this.ignoreBackdropClick = !1) : void (a.target === a.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus() : this.hide())) }, this)), f && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !b) return; f ? this.$backdrop.one("bsTransitionEnd", b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION) : b() } else if (!this.isShown && this.$backdrop) { this.$backdrop.removeClass("in"); var g = function () { d.removeBackdrop(), b && b() }; a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION) : g() } else b && b() }, c.prototype.handleUpdate = function () { this.adjustDialog() }, c.prototype.adjustDialog = function () { var a = this.$element[0].scrollHeight > document.documentElement.clientHeight; this.$element.css({ paddingLeft: !this.bodyIsOverflowing && a ? this.scrollbarWidth : "", paddingRight: this.bodyIsOverflowing && !a ? this.scrollbarWidth : "" }) }, c.prototype.resetAdjustments = function () { this.$element.css({ paddingLeft: "", paddingRight: "" }) }, c.prototype.checkScrollbar = function () { var a = window.innerWidth; if (!a) { var b = document.documentElement.getBoundingClientRect(); a = b.right - Math.abs(b.left) } this.bodyIsOverflowing = document.body.clientWidth < a, this.scrollbarWidth = this.measureScrollbar() }, c.prototype.setScrollbar = function () { var a = parseInt(this.$body.css("padding-right") || 0, 10); this.originalBodyPad = document.body.style.paddingRight || "", this.bodyIsOverflowing && this.$body.css("padding-right", a + this.scrollbarWidth) }, c.prototype.resetScrollbar = function () { this.$body.css("padding-right", this.originalBodyPad) }, c.prototype.measureScrollbar = function () { var a = document.createElement("div"); a.className = "modal-scrollbar-measure", this.$body.append(a); var b = a.offsetWidth - a.clientWidth; return this.$body[0].removeChild(a), b }; var d = a.fn.modal; a.fn.modal = b, a.fn.modal.Constructor = c, a.fn.modal.noConflict = function () { return a.fn.modal = d, this }, a(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (c) { var d = a(this), e = d.attr("href"), f = a(d.attr("data-target") || e && e.replace(/.*(?=#[^\s]+$)/, "")), g = f.data("bs.modal") ? "toggle" : a.extend({ remote: !/#/.test(e) && e }, f.data(), d.data()); d.is("a") && c.preventDefault(), f.one("show.bs.modal", function (a) { a.isDefaultPrevented() || f.one("hidden.bs.modal", function () { d.is(":visible") && d.trigger("focus") }) }), b.call(f, g, this) }) }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.tooltip"), f = "object" == typeof b && b; (e || !/destroy|hide/.test(b)) && (e || d.data("bs.tooltip", e = new c(this, f)), "string" == typeof b && e[b]()) }) } var c = function (a, b) { this.type = null, this.options = null, this.enabled = null, this.timeout = null, this.hoverState = null, this.$element = null, this.inState = null, this.init("tooltip", a, b) }; c.VERSION = "3.3.5", c.TRANSITION_DURATION = 150, c.DEFAULTS = { animation: !0, placement: "top", selector: !1, template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1, viewport: { selector: "body", padding: 0 } }, c.prototype.init = function (b, c, d) { if (this.enabled = !0, this.type = b, this.$element = a(c), this.options = this.getOptions(d), this.$viewport = this.options.viewport && a(a.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport), this.inState = { click: !1, hover: !1, focus: !1 }, this.$element[0] instanceof document.constructor && !this.options.selector) throw new Error("`selector` option must be specified when initializing " + this.type + " on the window.document object!"); for (var e = this.options.trigger.split(" "), f = e.length; f--;) { var g = e[f]; if ("click" == g) this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this)); else if ("manual" != g) { var h = "hover" == g ? "mouseenter" : "focusin", i = "hover" == g ? "mouseleave" : "focusout"; this.$element.on(h + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(i + "." + this.type, this.options.selector, a.proxy(this.leave, this)) } } this.options.selector ? this._options = a.extend({}, this.options, { trigger: "manual", selector: "" }) : this.fixTitle() }, c.prototype.getDefaults = function () { return c.DEFAULTS }, c.prototype.getOptions = function (b) { return b = a.extend({}, this.getDefaults(), this.$element.data(), b), b.delay && "number" == typeof b.delay && (b.delay = { show: b.delay, hide: b.delay }), b }, c.prototype.getDelegateOptions = function () { var b = {}, c = this.getDefaults(); return this._options && a.each(this._options, function (a, d) { c[a] != d && (b[a] = d) }), b }, c.prototype.enter = function (b) { var c = b instanceof this.constructor ? b : a(b.currentTarget).data("bs." + this.type); return c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c)), b instanceof a.Event && (c.inState["focusin" == b.type ? "focus" : "hover"] = !0), c.tip().hasClass("in") || "in" == c.hoverState ? void (c.hoverState = "in") : (clearTimeout(c.timeout), c.hoverState = "in", c.options.delay && c.options.delay.show ? void (c.timeout = setTimeout(function () { "in" == c.hoverState && c.show() }, c.options.delay.show)) : c.show()) }, c.prototype.isInStateTrue = function () { for (var a in this.inState) if (this.inState[a]) return !0; return !1 }, c.prototype.leave = function (b) { var c = b instanceof this.constructor ? b : a(b.currentTarget).data("bs." + this.type); return c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c)), b instanceof a.Event && (c.inState["focusout" == b.type ? "focus" : "hover"] = !1), c.isInStateTrue() ? void 0 : (clearTimeout(c.timeout), c.hoverState = "out", c.options.delay && c.options.delay.hide ? void (c.timeout = setTimeout(function () { "out" == c.hoverState && c.hide() }, c.options.delay.hide)) : c.hide()) }, c.prototype.show = function () { var b = a.Event("show.bs." + this.type); if (this.hasContent() && this.enabled) { this.$element.trigger(b); var d = a.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]); if (b.isDefaultPrevented() || !d) return; var e = this, f = this.tip(), g = this.getUID(this.type); this.setContent(), f.attr("id", g), this.$element.attr("aria-describedby", g), this.options.animation && f.addClass("fade"); var h = "function" == typeof this.options.placement ? this.options.placement.call(this, f[0], this.$element[0]) : this.options.placement, i = /\s?auto?\s?/i, j = i.test(h); j && (h = h.replace(i, "") || "top"), f.detach().css({ top: 0, left: 0, display: "block" }).addClass(h).data("bs." + this.type, this), this.options.container ? f.appendTo(this.options.container) : f.insertAfter(this.$element), this.$element.trigger("inserted.bs." + this.type); var k = this.getPosition(), l = f[0].offsetWidth, m = f[0].offsetHeight; if (j) { var n = h, o = this.getPosition(this.$viewport); h = "bottom" == h && k.bottom + m > o.bottom ? "top" : "top" == h && k.top - m < o.top ? "bottom" : "right" == h && k.right + l > o.width ? "left" : "left" == h && k.left - l < o.left ? "right" : h, f.removeClass(n).addClass(h) } var p = this.getCalculatedOffset(h, k, l, m); this.applyPlacement(p, h); var q = function () { var a = e.hoverState; e.$element.trigger("shown.bs." + e.type), e.hoverState = null, "out" == a && e.leave(e) }; a.support.transition && this.$tip.hasClass("fade") ? f.one("bsTransitionEnd", q).emulateTransitionEnd(c.TRANSITION_DURATION) : q() } }, c.prototype.applyPlacement = function (b, c) { var d = this.tip(), e = d[0].offsetWidth, f = d[0].offsetHeight, g = parseInt(d.css("margin-top"), 10), h = parseInt(d.css("margin-left"), 10); isNaN(g) && (g = 0), isNaN(h) && (h = 0), b.top += g, b.left += h, a.offset.setOffset(d[0], a.extend({ using: function (a) { d.css({ top: Math.round(a.top), left: Math.round(a.left) }) } }, b), 0), d.addClass("in"); var i = d[0].offsetWidth, j = d[0].offsetHeight; "top" == c && j != f && (b.top = b.top + f - j); var k = this.getViewportAdjustedDelta(c, b, i, j); k.left ? b.left += k.left : b.top += k.top; var l = /top|bottom/.test(c), m = l ? 2 * k.left - e + i : 2 * k.top - f + j, n = l ? "offsetWidth" : "offsetHeight"; d.offset(b), this.replaceArrow(m, d[0][n], l) }, c.prototype.replaceArrow = function (a, b, c) { this.arrow().css(c ? "left" : "top", 50 * (1 - a / b) + "%").css(c ? "top" : "left", "") }, c.prototype.setContent = function () { var a = this.tip(), b = this.getTitle(); a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right") }, c.prototype.hide = function (b) { function d() { "in" != e.hoverState && f.detach(), e.$element.removeAttr("aria-describedby").trigger("hidden.bs." + e.type), b && b() } var e = this, f = a(this.$tip), g = a.Event("hide.bs." + this.type); return this.$element.trigger(g), g.isDefaultPrevented() ? void 0 : (f.removeClass("in"), a.support.transition && f.hasClass("fade") ? f.one("bsTransitionEnd", d).emulateTransitionEnd(c.TRANSITION_DURATION) : d(), this.hoverState = null, this) }, c.prototype.fixTitle = function () { var a = this.$element; (a.attr("title") || "string" != typeof a.attr("data-original-title")) && a.attr("data-original-title", a.attr("title") || "").attr("title", "") }, c.prototype.hasContent = function () { return this.getTitle() }, c.prototype.getPosition = function (b) { b = b || this.$element; var c = b[0], d = "BODY" == c.tagName, e = c.getBoundingClientRect(); null == e.width && (e = a.extend({}, e, { width: e.right - e.left, height: e.bottom - e.top })); var f = d ? { top: 0, left: 0 } : b.offset(), g = { scroll: d ? document.documentElement.scrollTop || document.body.scrollTop : b.scrollTop() }, h = d ? { width: a(window).width(), height: a(window).height() } : null; return a.extend({}, e, g, h, f) }, c.prototype.getCalculatedOffset = function (a, b, c, d) { return "bottom" == a ? { top: b.top + b.height, left: b.left + b.width / 2 - c / 2 } : "top" == a ? { top: b.top - d, left: b.left + b.width / 2 - c / 2 } : "left" == a ? { top: b.top + b.height / 2 - d / 2, left: b.left - c } : { top: b.top + b.height / 2 - d / 2, left: b.left + b.width } }, c.prototype.getViewportAdjustedDelta = function (a, b, c, d) { var e = { top: 0, left: 0 }; if (!this.$viewport) return e; var f = this.options.viewport && this.options.viewport.padding || 0, g = this.getPosition(this.$viewport); if (/right|left/.test(a)) { var h = b.top - f - g.scroll, i = b.top + f - g.scroll + d; h < g.top ? e.top = g.top - h : i > g.top + g.height && (e.top = g.top + g.height - i) } else { var j = b.left - f, k = b.left + f + c; j < g.left ? e.left = g.left - j : k > g.right && (e.left = g.left + g.width - k) } return e }, c.prototype.getTitle = function () { var a, b = this.$element, c = this.options; return a = b.attr("data-original-title") || ("function" == typeof c.title ? c.title.call(b[0]) : c.title) }, c.prototype.getUID = function (a) { do a += ~~(1e6 * Math.random()); while (document.getElementById(a)); return a }, c.prototype.tip = function () { if (!this.$tip && (this.$tip = a(this.options.template), 1 != this.$tip.length)) throw new Error(this.type + " `template` option must consist of exactly 1 top-level element!"); return this.$tip }, c.prototype.arrow = function () { return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow") }, c.prototype.enable = function () { this.enabled = !0 }, c.prototype.disable = function () { this.enabled = !1 }, c.prototype.toggleEnabled = function () { this.enabled = !this.enabled }, c.prototype.toggle = function (b) { var c = this; b && (c = a(b.currentTarget).data("bs." + this.type), c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c))), b ? (c.inState.click = !c.inState.click, c.isInStateTrue() ? c.enter(c) : c.leave(c)) : c.tip().hasClass("in") ? c.leave(c) : c.enter(c) }, c.prototype.destroy = function () { var a = this; clearTimeout(this.timeout), this.hide(function () { a.$element.off("." + a.type).removeData("bs." + a.type), a.$tip && a.$tip.detach(), a.$tip = null, a.$arrow = null, a.$viewport = null }) }; var d = a.fn.tooltip; a.fn.tooltip = b, a.fn.tooltip.Constructor = c, a.fn.tooltip.noConflict = function () { return a.fn.tooltip = d, this } }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.popover"), f = "object" == typeof b && b; (e || !/destroy|hide/.test(b)) && (e || d.data("bs.popover", e = new c(this, f)), "string" == typeof b && e[b]()) }) } var c = function (a, b) { this.init("popover", a, b) }; if (!a.fn.tooltip) throw new Error("Popover requires tooltip.js"); c.VERSION = "3.3.5", c.DEFAULTS = a.extend({}, a.fn.tooltip.Constructor.DEFAULTS, { placement: "right", trigger: "click", content: "", template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>' }), c.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype), c.prototype.constructor = c, c.prototype.getDefaults = function () { return c.DEFAULTS }, c.prototype.setContent = function () { var a = this.tip(), b = this.getTitle(), c = this.getContent(); a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content").children().detach().end()[this.options.html ? "string" == typeof c ? "html" : "append" : "text"](c), a.removeClass("fade top bottom left right in"), a.find(".popover-title").html() || a.find(".popover-title").hide() }, c.prototype.hasContent = function () { return this.getTitle() || this.getContent() }, c.prototype.getContent = function () { var a = this.$element, b = this.options; return a.attr("data-content") || ("function" == typeof b.content ? b.content.call(a[0]) : b.content) }, c.prototype.arrow = function () { return this.$arrow = this.$arrow || this.tip().find(".arrow") }; var d = a.fn.popover; a.fn.popover = b, a.fn.popover.Constructor = c, a.fn.popover.noConflict = function () { return a.fn.popover = d, this } }(jQuery), +function (a) {
    "use strict"; function b(c, d) { this.$body = a(document.body), this.$scrollElement = a(a(c).is(document.body) ? window : c), this.options = a.extend({}, b.DEFAULTS, d), this.selector = (this.options.target || "") + " .nav li > a", this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, this.$scrollElement.on("scroll.bs.scrollspy", a.proxy(this.process, this)), this.refresh(), this.process() } function c(c) { return this.each(function () { var d = a(this), e = d.data("bs.scrollspy"), f = "object" == typeof c && c; e || d.data("bs.scrollspy", e = new b(this, f)), "string" == typeof c && e[c]() }) } b.VERSION = "3.3.5", b.DEFAULTS = { offset: 10 }, b.prototype.getScrollHeight = function () { return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight) }, b.prototype.refresh = function () { var b = this, c = "offset", d = 0; this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight(), a.isWindow(this.$scrollElement[0]) || (c = "position", d = this.$scrollElement.scrollTop()), this.$body.find(this.selector).map(function () { var b = a(this), e = b.data("target") || b.attr("href"), f = /^#./.test(e) && a(e); return f && f.length && f.is(":visible") && [[f[c]().top + d, e]] || null }).sort(function (a, b) { return a[0] - b[0] }).each(function () { b.offsets.push(this[0]), b.targets.push(this[1]) }) }, b.prototype.process = function () { var a, b = this.$scrollElement.scrollTop() + this.options.offset, c = this.getScrollHeight(), d = this.options.offset + c - this.$scrollElement.height(), e = this.offsets, f = this.targets, g = this.activeTarget; if (this.scrollHeight != c && this.refresh(), b >= d) return g != (a = f[f.length - 1]) && this.activate(a); if (g && b < e[0]) return this.activeTarget = null, this.clear(); for (a = e.length; a--;) g != f[a] && b >= e[a] && (void 0 === e[a + 1] || b < e[a + 1]) && this.activate(f[a]) }, b.prototype.activate = function (b) {
        this.activeTarget = b, this.clear(); var c = this.selector + '[data-target="' + b + '"],' + this.selector + '[href="' + b + '"]', d = a(c).parents("li").addClass("active"); d.parent(".dropdown-menu").length && (d = d.closest("li.dropdown").addClass("active")),
        d.trigger("activate.bs.scrollspy")
    }, b.prototype.clear = function () { a(this.selector).parentsUntil(this.options.target, ".active").removeClass("active") }; var d = a.fn.scrollspy; a.fn.scrollspy = c, a.fn.scrollspy.Constructor = b, a.fn.scrollspy.noConflict = function () { return a.fn.scrollspy = d, this }, a(window).on("load.bs.scrollspy.data-api", function () { a('[data-spy="scroll"]').each(function () { var b = a(this); c.call(b, b.data()) }) })
}(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.tab"); e || d.data("bs.tab", e = new c(this)), "string" == typeof b && e[b]() }) } var c = function (b) { this.element = a(b) }; c.VERSION = "3.3.5", c.TRANSITION_DURATION = 150, c.prototype.show = function () { var b = this.element, c = b.closest("ul:not(.dropdown-menu)"), d = b.data("target"); if (d || (d = b.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, "")), !b.parent("li").hasClass("active")) { var e = c.find(".active:last a"), f = a.Event("hide.bs.tab", { relatedTarget: b[0] }), g = a.Event("show.bs.tab", { relatedTarget: e[0] }); if (e.trigger(f), b.trigger(g), !g.isDefaultPrevented() && !f.isDefaultPrevented()) { var h = a(d); this.activate(b.closest("li"), c), this.activate(h, h.parent(), function () { e.trigger({ type: "hidden.bs.tab", relatedTarget: b[0] }), b.trigger({ type: "shown.bs.tab", relatedTarget: e[0] }) }) } } }, c.prototype.activate = function (b, d, e) { function f() { g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !1), b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded", !0), h ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"), b.parent(".dropdown-menu").length && b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !0), e && e() } var g = d.find("> .active"), h = e && a.support.transition && (g.length && g.hasClass("fade") || !!d.find("> .fade").length); g.length && h ? g.one("bsTransitionEnd", f).emulateTransitionEnd(c.TRANSITION_DURATION) : f(), g.removeClass("in") }; var d = a.fn.tab; a.fn.tab = b, a.fn.tab.Constructor = c, a.fn.tab.noConflict = function () { return a.fn.tab = d, this }; var e = function (c) { c.preventDefault(), b.call(a(this), "show") }; a(document).on("click.bs.tab.data-api", '[data-toggle="tab"]', e).on("click.bs.tab.data-api", '[data-toggle="pill"]', e) }(jQuery), +function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.affix"), f = "object" == typeof b && b; e || d.data("bs.affix", e = new c(this, f)), "string" == typeof b && e[b]() }) } var c = function (b, d) { this.options = a.extend({}, c.DEFAULTS, d), this.$target = a(this.options.target).on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", a.proxy(this.checkPositionWithEventLoop, this)), this.$element = a(b), this.affixed = null, this.unpin = null, this.pinnedOffset = null, this.checkPosition() }; c.VERSION = "3.3.5", c.RESET = "affix affix-top affix-bottom", c.DEFAULTS = { offset: 0, target: window }, c.prototype.getState = function (a, b, c, d) { var e = this.$target.scrollTop(), f = this.$element.offset(), g = this.$target.height(); if (null != c && "top" == this.affixed) return c > e ? "top" : !1; if ("bottom" == this.affixed) return null != c ? e + this.unpin <= f.top ? !1 : "bottom" : a - d >= e + g ? !1 : "bottom"; var h = null == this.affixed, i = h ? e : f.top, j = h ? g : b; return null != c && c >= e ? "top" : null != d && i + j >= a - d ? "bottom" : !1 }, c.prototype.getPinnedOffset = function () { if (this.pinnedOffset) return this.pinnedOffset; this.$element.removeClass(c.RESET).addClass("affix"); var a = this.$target.scrollTop(), b = this.$element.offset(); return this.pinnedOffset = b.top - a }, c.prototype.checkPositionWithEventLoop = function () { setTimeout(a.proxy(this.checkPosition, this), 1) }, c.prototype.checkPosition = function () { if (this.$element.is(":visible")) { var b = this.$element.height(), d = this.options.offset, e = d.top, f = d.bottom, g = Math.max(a(document).height(), a(document.body).height()); "object" != typeof d && (f = e = d), "function" == typeof e && (e = d.top(this.$element)), "function" == typeof f && (f = d.bottom(this.$element)); var h = this.getState(g, b, e, f); if (this.affixed != h) { null != this.unpin && this.$element.css("top", ""); var i = "affix" + (h ? "-" + h : ""), j = a.Event(i + ".bs.affix"); if (this.$element.trigger(j), j.isDefaultPrevented()) return; this.affixed = h, this.unpin = "bottom" == h ? this.getPinnedOffset() : null, this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix", "affixed") + ".bs.affix") } "bottom" == h && this.$element.offset({ top: g - b - f }) } }; var d = a.fn.affix; a.fn.affix = b, a.fn.affix.Constructor = c, a.fn.affix.noConflict = function () { return a.fn.affix = d, this }, a(window).on("load", function () { a('[data-spy="affix"]').each(function () { var c = a(this), d = c.data(); d.offset = d.offset || {}, null != d.offsetBottom && (d.offset.bottom = d.offsetBottom), null != d.offsetTop && (d.offset.top = d.offsetTop), b.call(c, d) }) }) }(jQuery);
/**
 * Project: Bootstrap Hover Dropdown
 * Author: Cameron Spear
 * Contributors: Mattia Larentis
 *
 * Dependencies: Bootstrap's Dropdown plugin, jQuery
 *
 * A simple plugin to enable Bootstrap dropdowns to active on hover and provide a nice user experience.
 *
 * License: MIT
 *
 * http://cameronspear.com/blog/bootstrap-dropdown-on-hover-plugin/
 */(function (b, a, c) { var d = b(); b.fn.dropdownHover = function (e) { if ("ontouchstart" in document) { return this } d = d.add(this.parent()); return this.each(function () { var m = b(this), l = m.parent(), k = { delay: 500, instantlyCloseOthers: true }, i = { delay: b(this).data("delay"), instantlyCloseOthers: b(this).data("close-others") }, f = "show.bs.dropdown", j = "hide.bs.dropdown", g = b.extend(true, {}, k, e, i), h; l.hover(function (n) { if (!l.hasClass("open") && !m.is(n.target)) { return true } d.find(":focus").blur(); if (g.instantlyCloseOthers === true) { d.removeClass("open") } a.clearTimeout(h); l.addClass("open"); m.trigger(f) }, function () { h = a.setTimeout(function () { l.removeClass("open"); m.trigger(j) }, g.delay) }); m.hover(function () { d.find(":focus").blur(); if (g.instantlyCloseOthers === true) { d.removeClass("open") } a.clearTimeout(h); l.addClass("open"); m.trigger(f) }); l.find(".dropdown-submenu").each(function () { var o = b(this); var n; o.hover(function () { a.clearTimeout(n); o.children(".dropdown-menu").show(); o.siblings().children(".dropdown-menu").hide() }, function () { var p = o.children(".dropdown-menu"); n = a.setTimeout(function () { p.hide() }, g.delay) }) }) }) }; b(document).ready(function () { b('[data-hover="dropdown"]').dropdownHover() }) })(jQuery, this);
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Improved by keenthemes for Metronic Theme
 * Version: 1.3.2
 *
 */
!function (e) { jQuery.fn.extend({ slimScroll: function (i) { var o = { width: "auto", height: "250px", size: "7px", color: "#000", position: "right", distance: "1px", start: "top", opacity: .4, alwaysVisible: !1, disableFadeOut: !1, railVisible: !1, railColor: "#333", railOpacity: .2, railDraggable: !0, railClass: "slimScrollRail", barClass: "slimScrollBar", wrapperClass: "slimScrollDiv", allowPageScroll: !1, wheelStep: 20, touchScrollStep: 200, borderRadius: "7px", railBorderRadius: "7px", animate: !0 }, a = e.extend(o, i); return this.each(function () { function o(t) { if (u) { var t = t || window.event, i = 0; t.wheelDelta && (i = -t.wheelDelta / 120), t.detail && (i = t.detail / 3); var o = t.target || t.srcTarget || t.srcElement; e(o).closest("." + a.wrapperClass).is(S.parent()) && r(i, !0), t.preventDefault && !y && t.preventDefault(), y || (t.returnValue = !1) } } function r(e, t, i) { y = !1; var o = e, r = S.outerHeight() - M.outerHeight(); if (t && (o = parseInt(M.css("top")) + e * parseInt(a.wheelStep) / 100 * M.outerHeight(), o = Math.min(Math.max(o, 0), r), o = e > 0 ? Math.ceil(o) : Math.floor(o), M.css({ top: o + "px" })), v = parseInt(M.css("top")) / (S.outerHeight() - M.outerHeight()), o = v * (S[0].scrollHeight - S.outerHeight()), i) { o = e; var s = o / S[0].scrollHeight * S.outerHeight(); s = Math.min(Math.max(s, 0), r), M.css({ top: s + "px" }) } "scrollTo" in a && a.animate ? S.animate({ scrollTop: o }) : S.scrollTop(o), S.trigger("slimscrolling", ~~o), l(), c() } function s() { window.addEventListener ? (this.addEventListener("DOMMouseScroll", o, !1), this.addEventListener("mousewheel", o, !1)) : document.attachEvent("onmousewheel", o) } function n() { f = Math.max(S.outerHeight() / S[0].scrollHeight * S.outerHeight(), m), M.css({ height: f + "px" }); var e = f == S.outerHeight() ? "none" : "block"; M.css({ display: e }) } function l() { if (n(), clearTimeout(p), v == ~~v) { if (y = a.allowPageScroll, b != v) { var e = 0 == ~~v ? "top" : "bottom"; S.trigger("slimscroll", e) } } else y = !1; return b = v, f >= S.outerHeight() ? void (y = !0) : (M.stop(!0, !0).fadeIn("fast"), void (a.railVisible && H.stop(!0, !0).fadeIn("fast"))) } function c() { a.alwaysVisible || (p = setTimeout(function () { a.disableFadeOut && u || h || d || (M.fadeOut("slow"), H.fadeOut("slow")) }, 1e3)) } var u, h, d, p, g, f, v, b, w = "<div></div>", m = 30, y = !1, S = e(this); if ("ontouchstart" in window && window.navigator.msPointerEnabled && S.css("-ms-touch-action", "none"), S.parent().hasClass(a.wrapperClass)) { var E = S.scrollTop(); if (M = S.parent().find("." + a.barClass), H = S.parent().find("." + a.railClass), n(), e.isPlainObject(i)) { if ("height" in i && "auto" == i.height) { S.parent().css("height", "auto"), S.css("height", "auto"); var x = S.parent().parent().height(); S.parent().css("height", x), S.css("height", x) } if ("scrollTo" in i) E = parseInt(a.scrollTo); else if ("scrollBy" in i) E += parseInt(a.scrollBy); else if ("destroy" in i) return M.remove(), H.remove(), void S.unwrap(); r(E, !1, !0) } } else { a.height = "auto" == i.height ? S.parent().height() : i.height; var C = e(w).addClass(a.wrapperClass).css({ position: "relative", overflow: "hidden", width: a.width, height: a.height }); S.css({ overflow: "hidden", width: a.width, height: a.height }); var H = e(w).addClass(a.railClass).css({ width: a.size, height: "100%", position: "absolute", top: 0, display: a.alwaysVisible && a.railVisible ? "block" : "none", "border-radius": a.railBorderRadius, background: a.railColor, opacity: a.railOpacity, zIndex: 90 }), M = e(w).addClass(a.barClass).css({ background: a.color, width: a.size, position: "absolute", top: 0, opacity: a.opacity, display: a.alwaysVisible ? "block" : "none", "border-radius": a.borderRadius, BorderRadius: a.borderRadius, MozBorderRadius: a.borderRadius, WebkitBorderRadius: a.borderRadius, zIndex: 99 }), D = "right" == a.position ? { right: a.distance } : { left: a.distance }; H.css(D), M.css(D), S.wrap(C), S.parent().append(M), S.parent().append(H), a.railDraggable && M.bind("mousedown", function (i) { var o = e(document); return d = !0, t = parseFloat(M.css("top")), pageY = i.pageY, o.bind("mousemove.slimscroll", function (e) { currTop = t + e.pageY - pageY, M.css("top", currTop), r(0, M.position().top, !1) }), o.bind("mouseup.slimscroll", function () { d = !1, c(), o.unbind(".slimscroll") }), !1 }).bind("selectstart.slimscroll", function (e) { return e.stopPropagation(), e.preventDefault(), !1 }), "ontouchstart" in window && window.navigator.msPointerEnabled && (S.bind("MSPointerDown", function (e) { g = e.originalEvent.pageY }), S.bind("MSPointerMove", function (e) { e.originalEvent.preventDefault(); var t = (g - e.originalEvent.pageY) / a.touchScrollStep; r(t, !0), g = e.originalEvent.pageY })), H.hover(function () { l() }, function () { c() }), M.hover(function () { h = !0 }, function () { h = !1 }), S.hover(function () { u = !0, l(), c() }, function () { u = !1, c() }), S.bind("touchstart", function (e) { e.originalEvent.touches.length && (g = e.originalEvent.touches[0].pageY) }), S.bind("touchmove", function (e) { if (y || e.originalEvent.preventDefault(), e.originalEvent.touches.length) { var t = (g - e.originalEvent.touches[0].pageY) / a.touchScrollStep; r(t, !0), g = e.originalEvent.touches[0].pageY } }), n(), "bottom" === a.start ? (M.css({ top: S.outerHeight() - M.outerHeight() }), r(0, !0)) : "top" !== a.start && (r(e(a.start).position().top, null, !0), a.alwaysVisible || M.hide()), s() } }), this } }), jQuery.fn.extend({ slimscroll: jQuery.fn.slimScroll }) }(jQuery);
/*!
 * jQuery blockUI plugin
 * Version 2.66.0-2013.10.09
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

!function () { "use strict"; function e(e) { function t(t, n) { var s, h, k = t == window, y = n && void 0 !== n.message ? n.message : void 0; if (n = e.extend({}, e.blockUI.defaults, n || {}), !n.ignoreIfBlocked || !e(t).data("blockUI.isBlocked")) { if (n.overlayCSS = e.extend({}, e.blockUI.defaults.overlayCSS, n.overlayCSS || {}), s = e.extend({}, e.blockUI.defaults.css, n.css || {}), n.onOverlayClick && (n.overlayCSS.cursor = "pointer"), h = e.extend({}, e.blockUI.defaults.themedCSS, n.themedCSS || {}), y = void 0 === y ? n.message : y, k && p && o(window, { fadeOut: 0 }), y && "string" != typeof y && (y.parentNode || y.jquery)) { var m = y.jquery ? y[0] : y, v = {}; e(t).data("blockUI.history", v), v.el = m, v.parent = m.parentNode, v.display = m.style.display, v.position = m.style.position, v.parent && v.parent.removeChild(m) } e(t).data("blockUI.onUnblock", n.onUnblock); var g, I, w, U, x = n.baseZ; g = r || n.forceIframe ? e('<iframe class="blockUI" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + n.iframeSrc + '"></iframe>') : e('<div class="blockUI" style="display:none"></div>'), I = n.theme ? e('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + x++ + ';display:none"></div>') : e('<div class="blockUI blockOverlay" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'), n.theme && k ? (U = '<div class="blockUI ' + n.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:fixed">', n.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (n.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : n.theme ? (U = '<div class="blockUI ' + n.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:absolute">', n.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (n.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : U = k ? '<div class="blockUI ' + n.blockMsgClass + ' blockPage" style="z-index:' + (x + 10) + ';display:none;position:fixed"></div>' : '<div class="blockUI ' + n.blockMsgClass + ' blockElement" style="z-index:' + (x + 10) + ';display:none;position:absolute"></div>', w = e(U), y && (n.theme ? (w.css(h), w.addClass("ui-widget-content")) : w.css(s)), n.theme || I.css(n.overlayCSS), I.css("position", k ? "fixed" : "absolute"), (r || n.forceIframe) && g.css("opacity", 0); var C = [g, I, w], S = k ? e("body") : e(t); e.each(C, function () { this.appendTo(S) }), n.theme && n.draggable && e.fn.draggable && w.draggable({ handle: ".ui-dialog-titlebar", cancel: "li" }); var O = f && (!e.support.boxModel || e("object,embed", k ? null : t).length > 0); if (u || O) { if (k && n.allowBodyStretch && e.support.boxModel && e("html,body").css("height", "100%"), (u || !e.support.boxModel) && !k) var E = d(t, "borderTopWidth"), T = d(t, "borderLeftWidth"), M = E ? "(0 - " + E + ")" : 0, B = T ? "(0 - " + T + ")" : 0; e.each(C, function (e, t) { var o = t[0].style; if (o.position = "absolute", 2 > e) k ? o.setExpression("height", "Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:" + n.quirksmodeOffsetHack + ') + "px"') : o.setExpression("height", 'this.parentNode.offsetHeight + "px"'), k ? o.setExpression("width", 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"') : o.setExpression("width", 'this.parentNode.offsetWidth + "px"'), B && o.setExpression("left", B), M && o.setExpression("top", M); else if (n.centerY) k && o.setExpression("top", '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'), o.marginTop = 0; else if (!n.centerY && k) { var i = n.css && n.css.top ? parseInt(n.css.top, 10) : 0, s = "((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + " + i + ') + "px"'; o.setExpression("top", s) } }) } if (y && (n.theme ? w.find(".ui-widget-content").append(y) : w.append(y), (y.jquery || y.nodeType) && e(y).show()), (r || n.forceIframe) && n.showOverlay && g.show(), n.fadeIn) { var j = n.onBlock ? n.onBlock : c, H = n.showOverlay && !y ? j : c, z = y ? j : c; n.showOverlay && I._fadeIn(n.fadeIn, H), y && w._fadeIn(n.fadeIn, z) } else n.showOverlay && I.show(), y && w.show(), n.onBlock && n.onBlock(); if (i(1, t, n), k ? (p = w[0], b = e(n.focusableElements, p), n.focusInput && setTimeout(l, 20)) : a(w[0], n.centerX, n.centerY), n.timeout) { var W = setTimeout(function () { k ? e.unblockUI(n) : e(t).unblock(n) }, n.timeout); e(t).data("blockUI.timeout", W) } } } function o(t, o) { var s, l = t == window, a = e(t), d = a.data("blockUI.history"), c = a.data("blockUI.timeout"); c && (clearTimeout(c), a.removeData("blockUI.timeout")), o = e.extend({}, e.blockUI.defaults, o || {}), i(0, t, o), null === o.onUnblock && (o.onUnblock = a.data("blockUI.onUnblock"), a.removeData("blockUI.onUnblock")); var r; r = l ? e("body").children().filter(".blockUI").add("body > .blockUI") : a.find(">.blockUI"), o.cursorReset && (r.length > 1 && (r[1].style.cursor = o.cursorReset), r.length > 2 && (r[2].style.cursor = o.cursorReset)), l && (p = b = null), o.fadeOut ? (s = r.length, r.stop().fadeOut(o.fadeOut, function () { 0 === --s && n(r, d, o, t) })) : n(r, d, o, t) } function n(t, o, n, i) { var s = e(i); if (!s.data("blockUI.isBlocked")) { t.each(function () { this.parentNode && this.parentNode.removeChild(this) }), o && o.el && (o.el.style.display = o.display, o.el.style.position = o.position, o.parent && o.parent.appendChild(o.el), s.removeData("blockUI.history")), s.data("blockUI.static") && s.css("position", "static"), "function" == typeof n.onUnblock && n.onUnblock(i, n); var l = e(document.body), a = l.width(), d = l[0].style.width; l.width(a - 1).width(a), l[0].style.width = d } } function i(t, o, n) { var i = o == window, l = e(o); if ((t || (!i || p) && (i || l.data("blockUI.isBlocked"))) && (l.data("blockUI.isBlocked", t), i && n.bindEvents && (!t || n.showOverlay))) { var a = "mousedown mouseup keydown keypress keyup touchstart touchend touchmove"; t ? e(document).bind(a, n, s) : e(document).unbind(a, s) } } function s(t) { if ("keydown" === t.type && t.keyCode && 9 == t.keyCode && p && t.data.constrainTabKey) { var o = b, n = !t.shiftKey && t.target === o[o.length - 1], i = t.shiftKey && t.target === o[0]; if (n || i) return setTimeout(function () { l(i) }, 10), !1 } var s = t.data, a = e(t.target); return a.hasClass("blockOverlay") && s.onOverlayClick && s.onOverlayClick(t), a.parents("div." + s.blockMsgClass).length > 0 ? !0 : 0 === a.parents().children().filter("div.blockUI").length } function l(e) { if (b) { var t = b[e === !0 ? b.length - 1 : 0]; t && t.focus() } } function a(e, t, o) { var n = e.parentNode, i = e.style, s = (n.offsetWidth - e.offsetWidth) / 2 - d(n, "borderLeftWidth"), l = (n.offsetHeight - e.offsetHeight) / 2 - d(n, "borderTopWidth"); t && (i.left = s > 0 ? s + "px" : "0"), o && (i.top = l > 0 ? l + "px" : "0") } function d(t, o) { return parseInt(e.css(t, o), 10) || 0 } e.fn._fadeIn = e.fn.fadeIn; var c = e.noop || function () { }, r = /MSIE/.test(navigator.userAgent), u = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent), f = (document.documentMode || 0, e.isFunction(document.createElement("div").style.setExpression)); e.blockUI = function (e) { t(window, e) }, e.unblockUI = function (e) { o(window, e) }, e.growlUI = function (t, o, n, i) { var s = e('<div class="growlUI"></div>'); t && s.append("<h1>" + t + "</h1>"), o && s.append("<h2>" + o + "</h2>"), void 0 === n && (n = 3e3); var l = function (t) { t = t || {}, e.blockUI({ message: s, fadeIn: "undefined" != typeof t.fadeIn ? t.fadeIn : 700, fadeOut: "undefined" != typeof t.fadeOut ? t.fadeOut : 1e3, timeout: "undefined" != typeof t.timeout ? t.timeout : n, centerY: !1, showOverlay: !1, onUnblock: i, css: e.blockUI.defaults.growlCSS }) }; l(); s.css("opacity"); s.mouseover(function () { l({ fadeIn: 0, timeout: 3e4 }); var t = e(".blockMsg"); t.stop(), t.fadeTo(300, 1) }).mouseout(function () { e(".blockMsg").fadeOut(1e3) }) }, e.fn.block = function (o) { if (this[0] === window) return e.blockUI(o), this; var n = e.extend({}, e.blockUI.defaults, o || {}); return this.each(function () { var t = e(this); n.ignoreIfBlocked && t.data("blockUI.isBlocked") || t.unblock({ fadeOut: 0 }) }), this.each(function () { "static" == e.css(this, "position") && (this.style.position = "relative", e(this).data("blockUI.static", !0)), this.style.zoom = 1, t(this, o) }) }, e.fn.unblock = function (t) { return this[0] === window ? (e.unblockUI(t), this) : this.each(function () { o(this, t) }) }, e.blockUI.version = 2.66, e.blockUI.defaults = { message: "<h1>Please wait...</h1>", title: null, draggable: !0, theme: !1, css: { padding: 0, margin: 0, width: "30%", top: "40%", left: "35%", textAlign: "center", color: "#000", border: "3px solid #aaa", backgroundColor: "#fff", cursor: "wait" }, themedCSS: { width: "30%", top: "40%", left: "35%" }, overlayCSS: { backgroundColor: "#000", opacity: .6, cursor: "wait" }, cursorReset: "default", growlCSS: { width: "350px", top: "10px", left: "", right: "10px", border: "none", padding: "5px", opacity: .6, cursor: "default", color: "#fff", backgroundColor: "#000", "-webkit-border-radius": "10px", "-moz-border-radius": "10px", "border-radius": "10px" }, iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank", forceIframe: !1, baseZ: 1e3, centerX: !0, centerY: !0, allowBodyStretch: !0, bindEvents: !0, constrainTabKey: !0, fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: !0, focusInput: !0, focusableElements: ":input:enabled:visible", onBlock: null, onUnblock: null, onOverlayClick: null, quirksmodeOffsetHack: 4, blockMsgClass: "blockMsg", ignoreIfBlocked: !1 }; var p = null, b = [] } "function" == typeof define && define.amd && define.amd.jQuery ? define(["jquery"], e) : e(jQuery) }();
/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 * Plugin file name changed to jquery.cokie.min to prevent blocking by ModSecurity module
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (a) { if (typeof define === "function" && define.amd) { define(["jquery"], a) } else { a(jQuery) } }(function (e) { var a = /\+/g; function d(g) { return g } function b(g) { return decodeURIComponent(g.replace(a, " ")) } function f(g) { if (g.indexOf('"') === 0) { g = g.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\") } try { return c.json ? JSON.parse(g) : g } catch (h) { } } var c = e.cookie = function (p, o, u) { if (o !== undefined) { u = e.extend({}, c.defaults, u); if (typeof u.expires === "number") { var q = u.expires, s = u.expires = new Date(); s.setDate(s.getDate() + q) } o = c.json ? JSON.stringify(o) : String(o); return (document.cookie = [c.raw ? p : encodeURIComponent(p), "=", c.raw ? o : encodeURIComponent(o), u.expires ? "; expires=" + u.expires.toUTCString() : "", u.path ? "; path=" + u.path : "", u.domain ? "; domain=" + u.domain : "", u.secure ? "; secure" : ""].join("")) } var g = c.raw ? d : b; var r = document.cookie.split("; "); var v = p ? undefined : {}; for (var n = 0, k = r.length; n < k; n++) { var m = r[n].split("="); var h = g(m.shift()); var j = g(m.join("=")); if (p && p === h) { v = f(j); break } if (!p) { v[h] = f(j) } } return v }; c.defaults = {}; e.removeCookie = function (h, g) { if (e.cookie(h) !== undefined) { e.cookie(h, "", e.extend({}, g, { expires: -1 })); return true } return false } }));
(function (e, t) { "use strict"; function n(e) { var t = Array.prototype.slice.call(arguments, 1); return e.prop ? e.prop.apply(e, t) : e.attr.apply(e, t) } function s(e, t, n) { var s, a; for (s in n) n.hasOwnProperty(s) && (a = s.replace(/ |$/g, t.eventNamespace), e.bind(a, n[s])) } function a(e, t, n) { s(e, n, { focus: function () { t.addClass(n.focusClass) }, blur: function () { t.removeClass(n.focusClass), t.removeClass(n.activeClass) }, mouseenter: function () { t.addClass(n.hoverClass) }, mouseleave: function () { t.removeClass(n.hoverClass), t.removeClass(n.activeClass) }, "mousedown touchbegin": function () { e.is(":disabled") || t.addClass(n.activeClass) }, "mouseup touchend": function () { t.removeClass(n.activeClass) } }) } function i(e, t) { e.removeClass(t.hoverClass + " " + t.focusClass + " " + t.activeClass) } function r(e, t, n) { n ? e.addClass(t) : e.removeClass(t) } function l(e, t, n) { var s = "checked", a = t.is(":" + s); t.prop ? t.prop(s, a) : a ? t.attr(s, s) : t.removeAttr(s), r(e, n.checkedClass, a) } function u(e, t, n) { r(e, n.disabledClass, t.is(":disabled")) } function o(e, t, n) { switch (n) { case "after": return e.after(t), e.next(); case "before": return e.before(t), e.prev(); case "wrap": return e.wrap(t), e.parent() } return null } function c(t, s, a) { var i, r, l; return a || (a = {}), a = e.extend({ bind: {}, divClass: null, divWrap: "wrap", spanClass: null, spanHtml: null, spanWrap: "wrap" }, a), i = e("<div />"), r = e("<span />"), s.autoHide && t.is(":hidden") && "none" === t.css("display") && i.hide(), a.divClass && i.addClass(a.divClass), s.wrapperClass && i.addClass(s.wrapperClass), a.spanClass && r.addClass(a.spanClass), l = n(t, "id"), s.useID && l && n(i, "id", s.idPrefix + "-" + l), a.spanHtml && r.html(a.spanHtml), i = o(t, i, a.divWrap), r = o(t, r, a.spanWrap), u(i, t, s), { div: i, span: r } } function d(t, n) { var s; return n.wrapperClass ? (s = e("<span />").addClass(n.wrapperClass), s = o(t, s, "wrap")) : null } function f() { var t, n, s, a; return a = "rgb(120,2,153)", n = e('<div style="width:0;height:0;color:' + a + '">'), e("body").append(n), s = n.get(0), t = window.getComputedStyle ? window.getComputedStyle(s, "").color : (s.currentStyle || s.style || {}).color, n.remove(), t.replace(/ /g, "") !== a } function p(t) { return t ? e("<span />").text(t).html() : "" } function m() { return navigator.cpuClass && !navigator.product } function v() { return window.XMLHttpRequest !== void 0 ? !0 : !1 } function h(e) { var t; return e[0].multiple ? !0 : (t = n(e, "size"), !t || 1 >= t ? !1 : !0) } function C() { return !1 } function w(e, t) { var n = "none"; s(e, t, { "selectstart dragstart mousedown": C }), e.css({ MozUserSelect: n, msUserSelect: n, webkitUserSelect: n, userSelect: n }) } function b(e, t, n) { var s = e.val(); "" === s ? s = n.fileDefaultHtml : (s = s.split(/[\/\\]+/), s = s[s.length - 1]), t.text(s) } function y(e, t, n) { var s, a; for (s = [], e.each(function () { var e; for (e in t) Object.prototype.hasOwnProperty.call(t, e) && (s.push({ el: this, name: e, old: this.style[e] }), this.style[e] = t[e]) }), n() ; s.length;) a = s.pop(), a.el.style[a.name] = a.old } function g(e, t) { var n; n = e.parents(), n.push(e[0]), n = n.not(":visible"), y(n, { visibility: "hidden", display: "block", position: "absolute" }, t) } function k(e, t) { return function () { e.unwrap().unwrap().unbind(t.eventNamespace) } } var H = !0, x = !1, A = [{ match: function (e) { return e.is("a, button, :submit, :reset, input[type='button']") }, apply: function (e, t) { var r, l, o, d, f; return l = t.submitDefaultHtml, e.is(":reset") && (l = t.resetDefaultHtml), d = e.is("a, button") ? function () { return e.html() || l } : function () { return p(n(e, "value")) || l }, o = c(e, t, { divClass: t.buttonClass, spanHtml: d() }), r = o.div, a(e, r, t), f = !1, s(r, t, { "click touchend": function () { var t, s, a, i; f || e.is(":disabled") || (f = !0, e[0].dispatchEvent ? (t = document.createEvent("MouseEvents"), t.initEvent("click", !0, !0), s = e[0].dispatchEvent(t), e.is("a") && s && (a = n(e, "target"), i = n(e, "href"), a && "_self" !== a ? window.open(i, a) : document.location.href = i)) : e.click(), f = !1) } }), w(r, t), { remove: function () { return r.after(e), r.remove(), e.unbind(t.eventNamespace), e }, update: function () { i(r, t), u(r, e, t), e.detach(), o.span.html(d()).append(e) } } } }, { match: function (e) { return e.is(":checkbox") }, apply: function (e, t) { var n, r, o; return n = c(e, t, { divClass: t.checkboxClass }), r = n.div, o = n.span, a(e, r, t), s(e, t, { "click touchend": function () { l(o, e, t) } }), l(o, e, t), { remove: k(e, t), update: function () { i(r, t), o.removeClass(t.checkedClass), l(o, e, t), u(r, e, t) } } } }, { match: function (e) { return e.is(":file") }, apply: function (t, r) { function l() { b(t, p, r) } var d, f, p, v; return d = c(t, r, { divClass: r.fileClass, spanClass: r.fileButtonClass, spanHtml: r.fileButtonHtml, spanWrap: "after" }), f = d.div, v = d.span, p = e("<span />").html(r.fileDefaultHtml), p.addClass(r.filenameClass), p = o(t, p, "after"), n(t, "size") || n(t, "size", f.width() / 10), a(t, f, r), l(), m() ? s(t, r, { click: function () { t.trigger("change"), setTimeout(l, 0) } }) : s(t, r, { change: l }), w(p, r), w(v, r), { remove: function () { return p.remove(), v.remove(), t.unwrap().unbind(r.eventNamespace) }, update: function () { i(f, r), b(t, p, r), u(f, t, r) } } } }, { match: function (e) { if (e.is("input")) { var t = (" " + n(e, "type") + " ").toLowerCase(), s = " color date datetime datetime-local email month number password search tel text time url week "; return s.indexOf(t) >= 0 } return !1 }, apply: function (e, t) { var s, i; return s = n(e, "type"), e.addClass(t.inputClass), i = d(e, t), a(e, e, t), t.inputAddTypeAsClass && e.addClass(s), { remove: function () { e.removeClass(t.inputClass), t.inputAddTypeAsClass && e.removeClass(s), i && e.unwrap() }, update: C } } }, { match: function (e) { return e.is(":radio") }, apply: function (t, r) { var o, d, f; return o = c(t, r, { divClass: r.radioClass }), d = o.div, f = o.span, a(t, d, r), s(t, r, { "click touchend": function () { e.uniform.update(e(':radio[name="' + n(t, "name") + '"]')) } }), l(f, t, r), { remove: k(t, r), update: function () { i(d, r), l(f, t, r), u(d, t, r) } } } }, { match: function (e) { return e.is("select") && !h(e) ? !0 : !1 }, apply: function (t, n) { var r, l, o, d; return n.selectAutoWidth && g(t, function () { d = t.width() }), r = c(t, n, { divClass: n.selectClass, spanHtml: (t.find(":selected:first") || t.find("option:first")).html(), spanWrap: "before" }), l = r.div, o = r.span, n.selectAutoWidth ? g(t, function () { y(e([o[0], l[0]]), { display: "block" }, function () { var e; e = o.outerWidth() - o.width(), l.width(d + e), o.width(d) }) }) : l.addClass("fixedWidth"), a(t, l, n), s(t, n, { change: function () { o.html(t.find(":selected").html()), l.removeClass(n.activeClass) }, "click touchend": function () { var e = t.find(":selected").html(); o.html() !== e && t.trigger("change") }, keyup: function () { o.html(t.find(":selected").html()) } }), w(o, n), { remove: function () { return o.remove(), t.unwrap().unbind(n.eventNamespace), t }, update: function () { n.selectAutoWidth ? (e.uniform.restore(t), t.uniform(n)) : (i(l, n), o.html(t.find(":selected").html()), u(l, t, n)) } } } }, { match: function (e) { return e.is("select") && h(e) ? !0 : !1 }, apply: function (e, t) { var n; return e.addClass(t.selectMultiClass), n = d(e, t), a(e, e, t), { remove: function () { e.removeClass(t.selectMultiClass), n && e.unwrap() }, update: C } } }, { match: function (e) { return e.is("textarea") }, apply: function (e, t) { var n; return e.addClass(t.textareaClass), n = d(e, t), a(e, e, t), { remove: function () { e.removeClass(t.textareaClass), n && e.unwrap() }, update: C } } }]; m() && !v() && (H = !1), e.uniform = { defaults: { activeClass: "active", autoHide: !0, buttonClass: "button", checkboxClass: "checker", checkedClass: "checked", disabledClass: "disabled", eventNamespace: ".uniform", fileButtonClass: "action", fileButtonHtml: "Choose File", fileClass: "uploader", fileDefaultHtml: "No file selected", filenameClass: "filename", focusClass: "focus", hoverClass: "hover", idPrefix: "uniform", inputAddTypeAsClass: !0, inputClass: "uniform-input", radioClass: "radio", resetDefaultHtml: "Reset", resetSelector: !1, selectAutoWidth: !0, selectClass: "selector", selectMultiClass: "uniform-multiselect", submitDefaultHtml: "Submit", textareaClass: "uniform", useID: !0, wrapperClass: null }, elements: [] }, e.fn.uniform = function (t) { var n = this; return t = e.extend({}, e.uniform.defaults, t), x || (x = !0, f() && (H = !1)), H ? (t.resetSelector && e(t.resetSelector).mouseup(function () { window.setTimeout(function () { e.uniform.update(n) }, 10) }), this.each(function () { var n, s, a, i = e(this); if (i.data("uniformed")) return e.uniform.update(i), void 0; for (n = 0; A.length > n; n += 1) if (s = A[n], s.match(i, t)) return a = s.apply(i, t), i.data("uniformed", a), e.uniform.elements.push(i.get(0)), void 0 })) : this }, e.uniform.restore = e.fn.uniform.restore = function (n) { n === t && (n = e.uniform.elements), e(n).each(function () { var t, n, s = e(this); n = s.data("uniformed"), n && (n.remove(), t = e.inArray(this, e.uniform.elements), t >= 0 && e.uniform.elements.splice(t, 1), s.removeData("uniformed")) }) }, e.uniform.update = e.fn.uniform.update = function (n) { n === t && (n = e.uniform.elements), e(n).each(function () { var t, n = e(this); t = n.data("uniformed"), t && t.update(n, t.options) }) } })(jQuery);
/* ========================================================================
 * bootstrap-switch - v3.3.2
 * http://www.bootstrap-switch.org
 * ========================================================================
 * Copyright 2012-2013 Mattia Larentis
 *
 * ========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================================
 */

(function () { var t = [].slice; !function (e, i) { "use strict"; var n; return n = function () { function t(t, i) { null == i && (i = {}), this.$element = e(t), this.options = e.extend({}, e.fn.bootstrapSwitch.defaults, { state: this.$element.is(":checked"), size: this.$element.data("size"), animate: this.$element.data("animate"), disabled: this.$element.is(":disabled"), readonly: this.$element.is("[readonly]"), indeterminate: this.$element.data("indeterminate"), inverse: this.$element.data("inverse"), radioAllOff: this.$element.data("radio-all-off"), onColor: this.$element.data("on-color"), offColor: this.$element.data("off-color"), onText: this.$element.data("on-text"), offText: this.$element.data("off-text"), labelText: this.$element.data("label-text"), handleWidth: this.$element.data("handle-width"), labelWidth: this.$element.data("label-width"), baseClass: this.$element.data("base-class"), wrapperClass: this.$element.data("wrapper-class") }, i), this.$wrapper = e("<div>", { "class": function (t) { return function () { var e; return e = ["" + t.options.baseClass].concat(t._getClasses(t.options.wrapperClass)), e.push(t.options.state ? "" + t.options.baseClass + "-on" : "" + t.options.baseClass + "-off"), null != t.options.size && e.push("" + t.options.baseClass + "-" + t.options.size), t.options.disabled && e.push("" + t.options.baseClass + "-disabled"), t.options.readonly && e.push("" + t.options.baseClass + "-readonly"), t.options.indeterminate && e.push("" + t.options.baseClass + "-indeterminate"), t.options.inverse && e.push("" + t.options.baseClass + "-inverse"), t.$element.attr("id") && e.push("" + t.options.baseClass + "-id-" + t.$element.attr("id")), e.join(" ") } }(this)() }), this.$container = e("<div>", { "class": "" + this.options.baseClass + "-container" }), this.$on = e("<span>", { html: this.options.onText, "class": "" + this.options.baseClass + "-handle-on " + this.options.baseClass + "-" + this.options.onColor }), this.$off = e("<span>", { html: this.options.offText, "class": "" + this.options.baseClass + "-handle-off " + this.options.baseClass + "-" + this.options.offColor }), this.$label = e("<span>", { html: this.options.labelText, "class": "" + this.options.baseClass + "-label" }), this.$element.on("init.bootstrapSwitch", function (e) { return function () { return e.options.onInit.apply(t, arguments) } }(this)), this.$element.on("switchChange.bootstrapSwitch", function (e) { return function () { return e.options.onSwitchChange.apply(t, arguments) } }(this)), this.$container = this.$element.wrap(this.$container).parent(), this.$wrapper = this.$container.wrap(this.$wrapper).parent(), this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off), this.options.indeterminate && this.$element.prop("indeterminate", !0), this._init(), this._elementHandlers(), this._handleHandlers(), this._labelHandlers(), this._formHandler(), this._externalLabelHandler(), this.$element.trigger("init.bootstrapSwitch") } return t.prototype._constructor = t, t.prototype.state = function (t, e) { return "undefined" == typeof t ? this.options.state : this.options.disabled || this.options.readonly ? this.$element : this.options.state && !this.options.radioAllOff && this.$element.is(":radio") ? this.$element : (this.options.indeterminate && this.indeterminate(!1), t = !!t, this.$element.prop("checked", t).trigger("change.bootstrapSwitch", e), this.$element) }, t.prototype.toggleState = function (t) { return this.options.disabled || this.options.readonly ? this.$element : this.options.indeterminate ? (this.indeterminate(!1), this.state(!0)) : this.$element.prop("checked", !this.options.state).trigger("change.bootstrapSwitch", t) }, t.prototype.size = function (t) { return "undefined" == typeof t ? this.options.size : (null != this.options.size && this.$wrapper.removeClass("" + this.options.baseClass + "-" + this.options.size), t && this.$wrapper.addClass("" + this.options.baseClass + "-" + t), this._width(), this._containerPosition(), this.options.size = t, this.$element) }, t.prototype.animate = function (t) { return "undefined" == typeof t ? this.options.animate : (t = !!t, t === this.options.animate ? this.$element : this.toggleAnimate()) }, t.prototype.toggleAnimate = function () { return this.options.animate = !this.options.animate, this.$wrapper.toggleClass("" + this.options.baseClass + "-animate"), this.$element }, t.prototype.disabled = function (t) { return "undefined" == typeof t ? this.options.disabled : (t = !!t, t === this.options.disabled ? this.$element : this.toggleDisabled()) }, t.prototype.toggleDisabled = function () { return this.options.disabled = !this.options.disabled, this.$element.prop("disabled", this.options.disabled), this.$wrapper.toggleClass("" + this.options.baseClass + "-disabled"), this.$element }, t.prototype.readonly = function (t) { return "undefined" == typeof t ? this.options.readonly : (t = !!t, t === this.options.readonly ? this.$element : this.toggleReadonly()) }, t.prototype.toggleReadonly = function () { return this.options.readonly = !this.options.readonly, this.$element.prop("readonly", this.options.readonly), this.$wrapper.toggleClass("" + this.options.baseClass + "-readonly"), this.$element }, t.prototype.indeterminate = function (t) { return "undefined" == typeof t ? this.options.indeterminate : (t = !!t, t === this.options.indeterminate ? this.$element : this.toggleIndeterminate()) }, t.prototype.toggleIndeterminate = function () { return this.options.indeterminate = !this.options.indeterminate, this.$element.prop("indeterminate", this.options.indeterminate), this.$wrapper.toggleClass("" + this.options.baseClass + "-indeterminate"), this._containerPosition(), this.$element }, t.prototype.inverse = function (t) { return "undefined" == typeof t ? this.options.inverse : (t = !!t, t === this.options.inverse ? this.$element : this.toggleInverse()) }, t.prototype.toggleInverse = function () { var t, e; return this.$wrapper.toggleClass("" + this.options.baseClass + "-inverse"), e = this.$on.clone(!0), t = this.$off.clone(!0), this.$on.replaceWith(t), this.$off.replaceWith(e), this.$on = t, this.$off = e, this.options.inverse = !this.options.inverse, this.$element }, t.prototype.onColor = function (t) { var e; return e = this.options.onColor, "undefined" == typeof t ? e : (null != e && this.$on.removeClass("" + this.options.baseClass + "-" + e), this.$on.addClass("" + this.options.baseClass + "-" + t), this.options.onColor = t, this.$element) }, t.prototype.offColor = function (t) { var e; return e = this.options.offColor, "undefined" == typeof t ? e : (null != e && this.$off.removeClass("" + this.options.baseClass + "-" + e), this.$off.addClass("" + this.options.baseClass + "-" + t), this.options.offColor = t, this.$element) }, t.prototype.onText = function (t) { return "undefined" == typeof t ? this.options.onText : (this.$on.html(t), this._width(), this._containerPosition(), this.options.onText = t, this.$element) }, t.prototype.offText = function (t) { return "undefined" == typeof t ? this.options.offText : (this.$off.html(t), this._width(), this._containerPosition(), this.options.offText = t, this.$element) }, t.prototype.labelText = function (t) { return "undefined" == typeof t ? this.options.labelText : (this.$label.html(t), this._width(), this.options.labelText = t, this.$element) }, t.prototype.handleWidth = function (t) { return "undefined" == typeof t ? this.options.handleWidth : (this.options.handleWidth = t, this._width(), this._containerPosition(), this.$element) }, t.prototype.labelWidth = function (t) { return "undefined" == typeof t ? this.options.labelWidth : (this.options.labelWidth = t, this._width(), this._containerPosition(), this.$element) }, t.prototype.baseClass = function () { return this.options.baseClass }, t.prototype.wrapperClass = function (t) { return "undefined" == typeof t ? this.options.wrapperClass : (t || (t = e.fn.bootstrapSwitch.defaults.wrapperClass), this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" ")), this.$wrapper.addClass(this._getClasses(t).join(" ")), this.options.wrapperClass = t, this.$element) }, t.prototype.radioAllOff = function (t) { return "undefined" == typeof t ? this.options.radioAllOff : (t = !!t, t === this.options.radioAllOff ? this.$element : (this.options.radioAllOff = t, this.$element)) }, t.prototype.onInit = function (t) { return "undefined" == typeof t ? this.options.onInit : (t || (t = e.fn.bootstrapSwitch.defaults.onInit), this.options.onInit = t, this.$element) }, t.prototype.onSwitchChange = function (t) { return "undefined" == typeof t ? this.options.onSwitchChange : (t || (t = e.fn.bootstrapSwitch.defaults.onSwitchChange), this.options.onSwitchChange = t, this.$element) }, t.prototype.destroy = function () { var t; return t = this.$element.closest("form"), t.length && t.off("reset.bootstrapSwitch").removeData("bootstrap-switch"), this.$container.children().not(this.$element).remove(), this.$element.unwrap().unwrap().off(".bootstrapSwitch").removeData("bootstrap-switch"), this.$element }, t.prototype._width = function () { var t, e; return t = this.$on.add(this.$off), t.add(this.$label).css("width", ""), e = "auto" === this.options.handleWidth ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth, t.width(e), this.$label.width(function (t) { return function (i, n) { return "auto" !== t.options.labelWidth ? t.options.labelWidth : e > n ? e : n } }(this)), this._handleWidth = this.$on.outerWidth(), this._labelWidth = this.$label.outerWidth(), this.$container.width(2 * this._handleWidth + this._labelWidth), this.$wrapper.width(this._handleWidth + this._labelWidth) }, t.prototype._containerPosition = function (t, e) { return null == t && (t = this.options.state), this.$container.css("margin-left", function (e) { return function () { var i; return i = [0, "-" + e._handleWidth + "px"], e.options.indeterminate ? "-" + e._handleWidth / 2 + "px" : t ? e.options.inverse ? i[1] : i[0] : e.options.inverse ? i[0] : i[1] } }(this)), e ? setTimeout(function () { return e() }, 50) : void 0 }, t.prototype._init = function () { var t, e; return t = function (t) { return function () { return t._width(), t._containerPosition(null, function () { return t.options.animate ? t.$wrapper.addClass("" + t.options.baseClass + "-animate") : void 0 }) } }(this), this.$wrapper.is(":visible") ? t() : e = i.setInterval(function (n) { return function () { return n.$wrapper.is(":visible") ? (t(), i.clearInterval(e)) : void 0 } }(this), 50) }, t.prototype._elementHandlers = function () { return this.$element.on({ "change.bootstrapSwitch": function (t) { return function (i, n) { var o; return i.preventDefault(), i.stopImmediatePropagation(), o = t.$element.is(":checked"), t._containerPosition(o), o !== t.options.state ? (t.options.state = o, t.$wrapper.toggleClass("" + t.options.baseClass + "-off").toggleClass("" + t.options.baseClass + "-on"), n ? void 0 : (t.$element.is(":radio") && e("[name='" + t.$element.attr("name") + "']").not(t.$element).prop("checked", !1).trigger("change.bootstrapSwitch", !0), t.$element.trigger("switchChange.bootstrapSwitch", [o]))) : void 0 } }(this), "focus.bootstrapSwitch": function (t) { return function (e) { return e.preventDefault(), t.$wrapper.addClass("" + t.options.baseClass + "-focused") } }(this), "blur.bootstrapSwitch": function (t) { return function (e) { return e.preventDefault(), t.$wrapper.removeClass("" + t.options.baseClass + "-focused") } }(this), "keydown.bootstrapSwitch": function (t) { return function (e) { if (e.which && !t.options.disabled && !t.options.readonly) switch (e.which) { case 37: return e.preventDefault(), e.stopImmediatePropagation(), t.state(!1); case 39: return e.preventDefault(), e.stopImmediatePropagation(), t.state(!0) } } }(this) }) }, t.prototype._handleHandlers = function () { return this.$on.on("click.bootstrapSwitch", function (t) { return function (e) { return e.preventDefault(), e.stopPropagation(), t.state(!1), t.$element.trigger("focus.bootstrapSwitch") } }(this)), this.$off.on("click.bootstrapSwitch", function (t) { return function (e) { return e.preventDefault(), e.stopPropagation(), t.state(!0), t.$element.trigger("focus.bootstrapSwitch") } }(this)) }, t.prototype._labelHandlers = function () { return this.$label.on({ "mousedown.bootstrapSwitch touchstart.bootstrapSwitch": function (t) { return function (e) { return t._dragStart || t.options.disabled || t.options.readonly ? void 0 : (e.preventDefault(), e.stopPropagation(), t._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(t.$container.css("margin-left"), 10), t.options.animate && t.$wrapper.removeClass("" + t.options.baseClass + "-animate"), t.$element.trigger("focus.bootstrapSwitch")) } }(this), "mousemove.bootstrapSwitch touchmove.bootstrapSwitch": function (t) { return function (e) { var i; if (null != t._dragStart && (e.preventDefault(), i = (e.pageX || e.originalEvent.touches[0].pageX) - t._dragStart, !(i < -t._handleWidth || i > 0))) return t._dragEnd = i, t.$container.css("margin-left", "" + t._dragEnd + "px") } }(this), "mouseup.bootstrapSwitch touchend.bootstrapSwitch": function (t) { return function (e) { var i; if (t._dragStart) return e.preventDefault(), t.options.animate && t.$wrapper.addClass("" + t.options.baseClass + "-animate"), t._dragEnd ? (i = t._dragEnd > -(t._handleWidth / 2), t._dragEnd = !1, t.state(t.options.inverse ? !i : i)) : t.state(!t.options.state), t._dragStart = !1 } }(this), "mouseleave.bootstrapSwitch": function (t) { return function () { return t.$label.trigger("mouseup.bootstrapSwitch") } }(this) }) }, t.prototype._externalLabelHandler = function () { var t; return t = this.$element.closest("label"), t.on("click", function (e) { return function (i) { return i.preventDefault(), i.stopImmediatePropagation(), i.target === t[0] ? e.toggleState() : void 0 } }(this)) }, t.prototype._formHandler = function () { var t; return t = this.$element.closest("form"), t.data("bootstrap-switch") ? void 0 : t.on("reset.bootstrapSwitch", function () { return i.setTimeout(function () { return t.find("input").filter(function () { return e(this).data("bootstrap-switch") }).each(function () { return e(this).bootstrapSwitch("state", this.checked) }) }, 1) }).data("bootstrap-switch", !0) }, t.prototype._getClasses = function (t) { var i, n, o, s; if (!e.isArray(t)) return ["" + this.options.baseClass + "-" + t]; for (n = [], o = 0, s = t.length; s > o; o++) i = t[o], n.push("" + this.options.baseClass + "-" + i); return n }, t }(), e.fn.bootstrapSwitch = function () { var i, o, s; return o = arguments[0], i = 2 <= arguments.length ? t.call(arguments, 1) : [], s = this, this.each(function () { var t, a; return t = e(this), a = t.data("bootstrap-switch"), a || t.data("bootstrap-switch", a = new n(this, o)), "string" == typeof o ? s = a[o].apply(a, i) : void 0 }), s }, e.fn.bootstrapSwitch.Constructor = n, e.fn.bootstrapSwitch.defaults = { state: !0, size: null, animate: !0, disabled: !1, readonly: !1, indeterminate: !1, inverse: !1, radioAllOff: !1, onColor: "primary", offColor: "default", onText: "ON", offText: "OFF", labelText: "&nbsp;", handleWidth: "auto", labelWidth: "auto", baseClass: "bootstrap-switch", wrapperClass: "wrapper", onInit: function () { }, onSwitchChange: function () { } } }(window.jQuery, window) }).call(this);
(function (c) {
    var j = {
        init: function (a) {
            var b = { color: c(this).css("background-color"), reach: 20, speed: 1E3, pause: 0, glow: !0, repeat: !0, onHover: !1 }; c(this).css({ "-moz-outline-radius": c(this).css("border-top-left-radius"), "-webkit-outline-radius": c(this).css("border-top-left-radius"), "outline-radius": c(this).css("border-top-left-radius") }); a && c.extend(b, a); b.color = c("<div style='background:" + b.color + "'></div>").css("background-color"); !0 !== b.repeat && (!isNaN(b.repeat) && 0 < b.repeat) && (b.repeat -= 1); return this.each(function () {
                b.onHover ?
                c(this).bind("mouseover", function () { g(b, this, 0) }).bind("mouseout", function () { c(this).pulsate("destroy") }) : g(b, this, 0)
            })
        }, destroy: function () { return this.each(function () { clearTimeout(this.timer); c(this).css("outline", 0) }) }
    }, g = function (a, b, d) {
        var f = a.reach; d = d > f ? 0 : d; var h = (f - d) / f, e = a.color.split(","), h = "rgba(" + e[0].split("(")[1] + "," + e[1] + "," + e[2].split(")")[0] + "," + h + ")", e = { outline: "2px solid " + h }; a.glow ? (e["box-shadow"] = "0px 0px " + parseInt(d / 1.5) + "px " + h, userAgent = navigator.userAgent || "", /(chrome)[ \/]([\w.]+)/.test(userAgent.toLowerCase()) &&
        (e["outline-offset"] = d + "px", e["outline-radius"] = "100 px")) : e["outline-offset"] = d + "px"; c(b).css(e); b.timer = setTimeout(function () { if (d >= f && !a.repeat) return c(b).pulsate("destroy"), !1; if (d >= f && !0 !== a.repeat && !isNaN(a.repeat) && 0 < a.repeat) a.repeat -= 1; else if (a.pause && d >= f) { var e = d + 1; innerfunc = function () { g(a, b, e) }; setTimeout(innerfunc, a.pause); return !1 } g(a, b, d + 1) }, a.speed / f)
    }; c.fn.pulsate = function (a) {
        if (j[a]) return j[a].apply(this, Array.prototype.slice.call(arguments, 1)); if ("object" === typeof a || !a) return j.init.apply(this,
        arguments); c.error("Method " + a + " does not exist on jQuery.pulsate")
    }
})(jQuery);
/**
* @version: 1.3.13
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2014-09-04
* @copyright: Copyright (c) 2012-2014 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
*/

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['moment', 'jquery', 'exports'], function (momentjs, $, exports) {
            root.daterangepicker = factory(root, exports, momentjs, $);
        });

    } else if (typeof exports !== 'undefined') {
        var momentjs = require('moment');
        var jQuery;
        try {
            jQuery = require('jquery');
        } catch (err) {
            jQuery = window.jQuery;
            if (!jQuery) throw new Error('jQuery dependency not found');
        }

        factory(root, exports, momentjs, jQuery);

        // Finally, as a browser global.
    } else {
        root.daterangepicker = factory(root, {}, root.moment, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, daterangepicker, moment, $) {

    var DateRangePicker = function (element, options, cb) {

        // by default, the daterangepicker element is placed at the bottom of HTML body
        this.parentEl = 'body';

        //element that triggered the date range picker
        this.element = $(element);

        //tracks visible state
        this.isShowing = false;

        //create the picker HTML object
        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left"></div>' +
                '<div class="calendar right"></div>' +
                '<div class="ranges">' +
                  '<div class="range_inputs">' +
                    '<div class="daterangepicker_start_input">' +
                      '<label for="daterangepicker_start"></label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
                    '</div>' +
                    '<div class="daterangepicker_end_input">' +
                      '<label for="daterangepicker_end"></label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
                    '</div>' +
                    '<button class="applyBtn" disabled="disabled"></button>&nbsp;' +
                    '<button class="cancelBtn"></button>' +
                  '</div>' +
                '</div>' +
              '</div>';

        //custom options
        if (typeof options !== 'object' || options === null)
            options = {};

        this.parentEl = (typeof options === 'object' && options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(DRPTemplate).appendTo(this.parentEl);

        this.setOptions(options, cb);

        //apply CSS classes and labels to buttons
        var c = this.container;
        $.each(this.buttonClasses, function (idx, val) {
            c.find('button').addClass(val);
        });
        this.container.find('.daterangepicker_start_input label').html(this.locale.fromLabel);
        this.container.find('.daterangepicker_end_input label').html(this.locale.toLabel);
        if (this.applyClass.length)
            this.container.find('.applyBtn').addClass(this.applyClass);
        if (this.cancelClass.length)
            this.container.find('.cancelBtn').addClass(this.cancelClass);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //event listeners

        this.container.find('.calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.updateMonthYear, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.updateMonthYear, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.ampmselect', $.proxy(this.updateTime, this));

        this.container.find('.ranges')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.showCalendars, this))
            .on('change.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsChanged, this))
            .on('keydown.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsKeydown, this))
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter.daterangepicker', 'li', $.proxy(this.enterRange, this))
            .on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

        if (this.element.is('input')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.updateFromControl, this)
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
        }

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setOptions: function (options, callback) {

            this.startDate = moment().startOf('day');
            this.endDate = moment().endOf('day');
            this.minDate = false;
            this.maxDate = false;
            this.dateLimit = false;

            this.showDropdowns = false;
            this.showWeekNumbers = false;
            this.timePicker = false;
            this.timePickerIncrement = 30;
            this.timePicker12Hour = true;
            this.singleDatePicker = false;
            this.ranges = {};

            this.opens = 'right';
            if (this.element.hasClass('pull-right'))
                this.opens = 'left';

            this.buttonClasses = ['btn', 'btn-small btn-sm'];
            this.applyClass = 'btn-success';
            this.cancelClass = 'btn-default';

            this.format = 'MM/DD/YYYY';
            this.separator = ' - ';

            this.locale = {
                applyLabel: 'Apply',
                cancelLabel: 'Cancel',
                fromLabel: 'From',
                toLabel: 'To',
                weekLabel: 'W',
                customRangeLabel: 'Custom Range',
                daysOfWeek: moment.weekdaysMin(),
                monthNames: moment.monthsShort(),
                firstDay: moment.localeData()._week.dow
            };

            this.cb = function () { };

            if (typeof options.format === 'string')
                this.format = options.format;

            if (typeof options.separator === 'string')
                this.separator = options.separator;

            if (typeof options.startDate === 'string')
                this.startDate = moment(options.startDate, this.format);

            if (typeof options.endDate === 'string')
                this.endDate = moment(options.endDate, this.format);

            if (typeof options.minDate === 'string')
                this.minDate = moment(options.minDate, this.format);

            if (typeof options.maxDate === 'string')
                this.maxDate = moment(options.maxDate, this.format);

            if (typeof options.startDate === 'object')
                this.startDate = moment(options.startDate);

            if (typeof options.endDate === 'object')
                this.endDate = moment(options.endDate);

            if (typeof options.minDate === 'object')
                this.minDate = moment(options.minDate);

            if (typeof options.maxDate === 'object')
                this.maxDate = moment(options.maxDate);

            if (typeof options.applyClass === 'string')
                this.applyClass = options.applyClass;

            if (typeof options.cancelClass === 'string')
                this.cancelClass = options.cancelClass;

            if (typeof options.dateLimit === 'object')
                this.dateLimit = options.dateLimit;

            if (typeof options.locale === 'object') {

                if (typeof options.locale.daysOfWeek === 'object') {
                    // Create a copy of daysOfWeek to avoid modification of original
                    // options object for reusability in multiple daterangepicker instances
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }

                if (typeof options.locale.monthNames === 'object') {
                    this.locale.monthNames = options.locale.monthNames.slice();
                }

                if (typeof options.locale.firstDay === 'number') {
                    this.locale.firstDay = options.locale.firstDay;
                }

                if (typeof options.locale.applyLabel === 'string') {
                    this.locale.applyLabel = options.locale.applyLabel;
                }

                if (typeof options.locale.cancelLabel === 'string') {
                    this.locale.cancelLabel = options.locale.cancelLabel;
                }

                if (typeof options.locale.fromLabel === 'string') {
                    this.locale.fromLabel = options.locale.fromLabel;
                }

                if (typeof options.locale.toLabel === 'string') {
                    this.locale.toLabel = options.locale.toLabel;
                }

                if (typeof options.locale.weekLabel === 'string') {
                    this.locale.weekLabel = options.locale.weekLabel;
                }

                if (typeof options.locale.customRangeLabel === 'string') {
                    this.locale.customRangeLabel = options.locale.customRangeLabel;
                }
            }

            if (typeof options.opens === 'string')
                this.opens = options.opens;

            if (typeof options.showWeekNumbers === 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses === 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses === 'object') {
                this.buttonClasses = options.buttonClasses;
            }

            if (typeof options.showDropdowns === 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.singleDatePicker === 'boolean') {
                this.singleDatePicker = options.singleDatePicker;
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                }
            }

            if (typeof options.timePicker === 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerIncrement === 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker12Hour === 'boolean') {
                this.timePicker12Hour = options.timePicker12Hour;
            }

            // update day names order to firstDay
            if (this.locale.firstDay != 0) {
                var iterator = this.locale.firstDay;
                while (iterator > 0) {
                    this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                    iterator--;
                }
            }

            var start, end, range;

            //if no start/end dates set, check if an input element contains initial values
            if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
                if ($(this.element).is('input[type=text]')) {
                    var val = $(this.element).val();
                    var split = val.split(this.separator);
                    start = end = null;
                    if (split.length == 2) {
                        start = moment(split[0], this.format);
                        end = moment(split[1], this.format);
                    } else if (this.singleDatePicker) {
                        start = moment(val, this.format);
                        end = moment(val, this.format);
                    }
                    if (start !== null && end !== null) {
                        this.startDate = start;
                        this.endDate = end;
                    }
                }
            }

            if (typeof options.ranges === 'object') {
                for (range in options.ranges) {

                    start = moment(options.ranges[range][0]);
                    end = moment(options.ranges[range][1]);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges ul').remove();
                this.container.find('.ranges').prepend(list);
            }

            if (typeof callback === 'function') {
                this.cb = callback;
            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }

            if (this.singleDatePicker) {
                this.opens = 'right';
                this.container.addClass('single');
                this.container.find('.calendar.right').show();
                this.container.find('.calendar.left').hide();
                if (!this.timePicker) {
                    this.container.find('.ranges').hide();
                } else {
                    this.container.find('.ranges .daterangepicker_start_input, .ranges .daterangepicker_end_input').hide();
                }
                if (!this.container.find('.calendar.right').hasClass('single'))
                    this.container.find('.calendar.right').addClass('single');
            } else {
                this.container.removeClass('single');
                this.container.find('.calendar.right').removeClass('single');
                this.container.find('.ranges').show();
            }

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.oldChosenLabel = this.chosenLabel;

            this.leftCalendar = {
                month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
                calendar: []
            };

            this.rightCalendar = {
                month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
                calendar: []
            };

            if (this.opens == 'right') {
                //swap calendar positions
                var left = this.container.find('.calendar.left');
                var right = this.container.find('.calendar.right');

                if (right.hasClass('single')) {
                    right.removeClass('single');
                    left.addClass('single');
                }

                left.removeClass('left').addClass('right');
                right.removeClass('right').addClass('left');

                if (this.singleDatePicker) {
                    left.show();
                    right.hide();
                }
            }

            if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
                this.container.addClass('show-calendar');
            }

            this.container.addClass('opens' + this.opens);

            this.updateView();
            this.updateCalendars();

        },

        setStartDate: function (startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.format);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            this.oldStartDate = this.startDate.clone();

            this.updateView();
            this.updateCalendars();
            this.updateInputText();
        },

        setEndDate: function (endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            this.oldEndDate = this.endDate.clone();

            this.updateView();
            this.updateCalendars();
            this.updateInputText();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
            this.updateFormInputs();
        },

        updateFormInputs: function () {
            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.format);
                end = moment(dateString[1], this.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.format);
                end = start;
            }

            if (end.isBefore(start)) return;

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.startDate = start;
            this.endDate = end;

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.updateCalendars();
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate, this.chosenLabel);
        },

        move: function () {
            var parentOffset = { top: 0, left: 0 };
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        toggle: function (e) {
            if (this.element.hasClass('active')) {
                this.hide();
            } else {
                this.show();
            }
        },

        show: function (e) {
            if (this.isShowing) return;

            this.element.addClass('active');
            this.container.show();
            this.move();

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function (e) { this.outsideClick(e); }, this);
            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.daterangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.daterangepicker', this._outsideClickProxy);

            this.isShowing = true;
            this.element.trigger('show.daterangepicker', this);
        },

        outsideClick: function (e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-date').length
                ) return;
            this.hide();
        },

        hide: function (e) {
            if (!this.isShowing) return;

            $(document)
              .off('mousedown.daterangepicker')
              .off('click.daterangepicker', '[data-toggle=dropdown]')
              .off('focusin.daterangepicker');

            this.element.removeClass('active');
            this.container.hide();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.isShowing = false;
            this.element.trigger('hide.daterangepicker', this);
        },

        enterRange: function (e) {
            // mouse pointer has entered a range label
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        showCalendars: function () {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function () {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        // when a date is typed into the start to end date textboxes
        inputsChanged: function (e) {
            var el = $(e.target);
            var date = moment(el.val(), this.format);
            if (!date.isValid()) return;

            var startDate, endDate;
            if (el.attr('name') === 'daterangepicker_start') {
                startDate = date;
                endDate = this.endDate;
            } else {
                startDate = this.startDate;
                endDate = date;
            }
            this.setCustomDates(startDate, endDate);
        },

        inputsKeydown: function (e) {
            if (e.keyCode === 13) {
                this.inputsChanged(e);
                this.notify();
            }
        },

        updateInputText: function () {
            if (this.element.is('input') && !this.singleDatePicker) {
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            } else if (this.element.is('input')) {
                this.element.val(this.endDate.format(this.format));
            }
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();

                this.updateInputText();

                this.hideCalendars();
                this.hide();
                this.element.trigger('apply.daterangepicker', this);
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }
        },

        setCustomDates: function (startDate, endDate) {
            this.chosenLabel = this.locale.customRangeLabel;
            if (startDate.isAfter(endDate)) {
                var difference = this.endDate.diff(this.startDate);
                endDate = moment(startDate).add(difference, 'ms');
            }
            this.startDate = startDate;
            this.endDate = endDate;

            this.updateView();
            this.updateCalendars();
        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            var startDate, endDate;
            if (cal.hasClass('left')) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
                if (typeof this.dateLimit === 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit === 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            if (this.singleDatePicker && cal.hasClass('left')) {
                endDate = startDate.clone();
            } else if (this.singleDatePicker && cal.hasClass('right')) {
                startDate = endDate.clone();
            }

            cal.find('td').removeClass('active');

            $(e.target).addClass('active');

            this.setCustomDates(startDate, endDate);

            if (!this.timePicker)
                endDate.endOf('day');

            if (this.singleDatePicker && !this.timePicker)
                this.clickApply();
        },

        clickApply: function (e) {
            this.updateInputText();
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.chosenLabel = this.oldChosenLabel;
            this.updateView();
            this.updateCalendars();
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        updateMonthYear: function (e) {
            var isLeft = $(e.target).closest('.calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.calendar.' + leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            this[leftOrRight + 'Calendar'].month.month(month).year(year);
            this.updateCalendars();
        },

        updateTime: function (e) {

            var cal = $(e.target).closest('.calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('.hourselect').val(), 10);
            var minute = parseInt(cal.find('.minuteselect').val(), 10);

            if (this.timePicker12Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute);
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute);
            }

            this.updateCalendars();
        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
            this.container.find('.calendar.left').empty().html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find('.calendar.right').empty().html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.singleDatePicker ? this.minDate : this.startDate, this.maxDate));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
                            .addClass('active').html();
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
                            .addClass('active').html();
                    }
                }
                i++;
            }
            if (customRange) {
                this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
                this.showCalendars();
            }
        },

        buildCalendar: function (month, year, hour, minute, side) {
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            var i;

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute]);
            var col, row;
            for (i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);
            }

            return calendar;
        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var yearHtml = '<select class="yearselect">';

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate) {

            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar.firstDay)) {
                html += '<th class="prev available"><i class="fa fa-angle-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar.lastDay)) {
                html += '<th class="next available"><i class="fa fa-angle-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate, 'day')) || (maxDate && calendar[row][col].isAfter(maxDate, 'day'))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            var i;
            if (this.timePicker) {

                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';
                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12)
                        selected_hour -= 12;
                    if (selected_hour === 0)
                        selected_hour = 12;
                }

                for (i = start; i <= end; i++) {
                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + i + '</option>';
                    }
                }

                html += '</select> : ';

                html += '<select class="minuteselect">';

                for (i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10)
                        num = '0' + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + num + '</option>';
                    }
                }

                html += '</select> ';

                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';
                    if (selected.hour() >= 12) {
                        html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
                    }
                    html += '</select>';
                }

                html += '</div>';

            }

            return html;

        },

        remove: function () {

            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData('daterangepicker');

        }

    };

    $.fn.daterangepicker = function (options, cb) {
        this.each(function () {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, options, cb));
        });
        return this;
    };

}));

/**
Core script to handle the entire theme and core functions
**/
var Metronic = function () {

    // IE mode
    var isRTL = false;
    var isIE8 = false;
    var isIE9 = false;
    var isIE10 = false;

    var resizeHandlers = [];

    var assetsPath = '../../assets/';

    var globalImgPath = 'global/img/';

    var globalPluginsPath = 'global/plugins/';

    var globalCssPath = 'global/css/';

    // theme layout color set

    var brandColors = {
        'blue': '#89C4F4',
        'red': '#F3565D',
        'green': '#1bbc9b',
        'purple': '#9b59b6',
        'grey': '#95a5a6',
        'yellow': '#F8CB00'
    };

    // initializes main settings
    var handleInit = function () {

        if ($('body').css('direction') === 'rtl') {
            isRTL = true;
        }

        isIE8 = !!navigator.userAgent.match(/MSIE 8.0/);
        isIE9 = !!navigator.userAgent.match(/MSIE 9.0/);
        isIE10 = !!navigator.userAgent.match(/MSIE 10.0/);

        if (isIE10) {
            $('html').addClass('ie10'); // detect IE10 version
        }

        if (isIE10 || isIE9 || isIE8) {
            $('html').addClass('ie'); // detect IE10 version
        }
    };

    // runs callback functions set by Metronic.addResponsiveHandler().
    var _runResizeHandlers = function () {
        // reinitialize other subscribed elements
        for (var i = 0; i < resizeHandlers.length; i++) {
            var each = resizeHandlers[i];
            each.call();
        }
    };

    // handle the layout reinitialization on window resize
    var handleOnResize = function () {
        var resize;
        if (isIE8) {
            var currheight;
            $(window).resize(function () {
                if (currheight == document.documentElement.clientHeight) {
                    return; //quite event since only body resized not window.
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    _runResizeHandlers();
                }, 50); // wait 50ms until window resize finishes.                
                currheight = document.documentElement.clientHeight; // store last body client height
            });
        } else {
            $(window).resize(function () {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    _runResizeHandlers();
                }, 50); // wait 50ms until window resize finishes.
            });
        }
    };

    // Handles portlet tools & actions
    var handlePortletTools = function () {
        // handle portlet remove
        $('body').on('click', '.portlet > .portlet-title > .tools > a.remove', function (e) {
            e.preventDefault();
            var portlet = $(this).closest(".portlet");

            if ($('body').hasClass('page-portlet-fullscreen')) {
                $('body').removeClass('page-portlet-fullscreen');
            }

            portlet.find('.portlet-title .fullscreen').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .reload').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .remove').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .config').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip('destroy');

            portlet.remove();
        });

        // handle portlet fullscreen
        $('body').on('click', '.portlet > .portlet-title .fullscreen', function (e) {
            e.preventDefault();
            var portlet = $(this).closest(".portlet");
            if (portlet.hasClass('portlet-fullscreen')) {
                $(this).removeClass('on');
                portlet.removeClass('portlet-fullscreen');
                $('body').removeClass('page-portlet-fullscreen');
                portlet.children('.portlet-body').css('height', 'auto');
            } else {
                var height = Metronic.getViewPort().height -
                    portlet.children('.portlet-title').outerHeight() -
                    parseInt(portlet.children('.portlet-body').css('padding-top')) -
                    parseInt(portlet.children('.portlet-body').css('padding-bottom'));

                $(this).addClass('on');
                portlet.addClass('portlet-fullscreen');
                $('body').addClass('page-portlet-fullscreen');
                portlet.children('.portlet-body').css('height', height);
            }
        });

        $('body').on('click', '.portlet > .portlet-title > .tools > a.reload', function (e) {
            e.preventDefault();
            var el = $(this).closest(".portlet").children(".portlet-body");
            var url = $(this).attr("data-url");
            var error = $(this).attr("data-error-display");
            if (url) {
                Metronic.blockUI({
                    target: el,
                    animate: true,
                    overlayColor: 'none'
                });
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: url,
                    dataType: "html",
                    success: function (res) {
                        Metronic.unblockUI(el);
                        el.html(res);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        Metronic.unblockUI(el);
                        var msg = 'Error on reloading the content. Please check your connection and try again.';
                        if (error == "toastr" && toastr) {
                            toastr.error(msg);
                        } else if (error == "notific8" && $.notific8) {
                            $.notific8('zindex', 11500);
                            $.notific8(msg, {
                                theme: 'ruby',
                                life: 3000
                            });
                        } else {
                            alert(msg);
                        }
                    }
                });
            } else {
                // for demo purpose
                Metronic.blockUI({
                    target: el,
                    animate: true,
                    overlayColor: 'none'
                });
                window.setTimeout(function () {
                    Metronic.unblockUI(el);
                }, 1000);
            }
        });

        // load ajax data on page init
        $('.portlet .portlet-title a.reload[data-load="true"]').click();

        $('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function (e) {
            e.preventDefault();
            var el = $(this).closest(".portlet").children(".portlet-body");
            if ($(this).hasClass("collapse")) {
                $(this).removeClass("collapse").addClass("expand");
                el.slideUp(200);
            } else {
                $(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
            }
        });
    };

    // Handles custom checkboxes & radios using jQuery Uniform plugin
    var handleUniform = function () {
        if (!$().uniform) {
            return;
        }
        var test = $("input[type=checkbox]:not(.toggle, .md-check, .md-radiobtn, .make-switch, .icheck), input[type=radio]:not(.toggle, .md-check, .md-radiobtn, .star, .make-switch, .icheck)");
        if (test.size() > 0) {
            test.each(function () {
                if ($(this).parents(".checker").size() === 0) {
                    $(this).show();
                    $(this).uniform();
                }
            });
        }
    };

    // Handlesmaterial design checkboxes
    var handleMaterialDesign = function () {

        // Material design ckeckbox and radio effects
        $('body').on('click', '.md-checkbox > label, .md-radio > label', function () {
            var the = $(this);
            // find the first span which is our circle/bubble
            var el = $(this).children('span:first-child');

            // add the bubble class (we do this so it doesnt show on page load)
            el.addClass('inc');

            // clone it
            var newone = el.clone(true);

            // add the cloned version before our original
            el.before(newone);

            // remove the original so that it is ready to run on next click
            $("." + el.attr("class") + ":last", the).remove();
        });

        if ($('body').hasClass('page-md')) {
            // Material design click effect
            // credit where credit's due; http://thecodeplayer.com/walkthrough/ripple-click-effect-google-material-design       
            $('body').on('click', 'a.btn, button.btn, input.btn, label.btn', function (e) {
                var element, circle, d, x, y;

                element = $(this);

                if (element.find(".md-click-circle").length == 0) {
                    element.prepend("<span class='md-click-circle'></span>");
                }

                circle = element.find(".md-click-circle");
                circle.removeClass("md-click-animate");

                if (!circle.height() && !circle.width()) {
                    d = Math.max(element.outerWidth(), element.outerHeight());
                    circle.css({ height: d, width: d });
                }

                x = e.pageX - element.offset().left - circle.width() / 2;
                y = e.pageY - element.offset().top - circle.height() / 2;

                circle.css({ top: y + 'px', left: x + 'px' }).addClass("md-click-animate");

                setTimeout(function () {
                    circle.removeClass('md-click-animate');
                }, 1000);
            });
        }

        // Floating labels
        var handleInput = function (el) {
            if (el.val() != "") {
                el.addClass('edited');
            } else {
                el.removeClass('edited');
            }
        }

        $('body').on('keydown', '.form-md-floating-label .form-control', function (e) {
            handleInput($(this));
        });
        $('body').on('blur', '.form-md-floating-label .form-control', function (e) {
            handleInput($(this));
        });
    }

    // Handles custom checkboxes & radios using jQuery iCheck plugin
    var handleiCheck = function () {
        if (!$().iCheck) {
            return;
        }

        $('.icheck').each(function () {
            var checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
            var radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';

            if (checkboxClass.indexOf('_line') > -1 || radioClass.indexOf('_line') > -1) {
                $(this).iCheck({
                    checkboxClass: checkboxClass,
                    radioClass: radioClass,
                    insert: '<div class="icheck_line-icon"></div>' + $(this).attr("data-label")
                });
            } else {
                $(this).iCheck({
                    checkboxClass: checkboxClass,
                    radioClass: radioClass
                });
            }
        });
    };

    // Handles Bootstrap switches
    var handleBootstrapSwitch = function () {
        if (!$().bootstrapSwitch) {
            return;
        }
        $('.make-switch').bootstrapSwitch();
    };

    // Handles Bootstrap confirmations
    var handleBootstrapConfirmation = function () {
        if (!$().confirmation) {
            return;
        }
        $('[data-toggle=confirmation]').confirmation({ container: 'body', btnOkClass: 'btn-xs btn-success', btnCancelClass: 'btn-xs btn-danger' });
    }

    // Handles Bootstrap Accordions.
    var handleAccordions = function () {
        $('body').on('shown.bs.collapse', '.accordion.scrollable', function (e) {
            Metronic.scrollTo($(e.target));
        });
    };

    // Handles Bootstrap Tabs.
    var handleTabs = function () {
        //activate tab if tab id provided in the URL
        if (location.hash) {
            var tabid = location.hash.substr(1);
            $('a[href="#' + tabid + '"]').parents('.tab-pane:hidden').each(function () {
                var tabid = $(this).attr("id");
                $('a[href="#' + tabid + '"]').click();
            });
            $('a[href="#' + tabid + '"]').click();
        }

        if ($().tabdrop) {
            $('.tabbable-tabdrop .nav-pills, .tabbable-tabdrop .nav-tabs').tabdrop({
                text: '<i class="fa fa-ellipsis-v"></i>&nbsp;<i class="fa fa-angle-down"></i>'
            });
        }
    };

    // Handles Bootstrap Modals.
    var handleModals = function () {
        // fix stackable modal issue: when 2 or more modals opened, closing one of modal will remove .modal-open class. 
        $('body').on('hide.bs.modal', function () {
            if ($('.modal:visible').size() > 1 && $('html').hasClass('modal-open') === false) {
                $('html').addClass('modal-open');
            } else if ($('.modal:visible').size() <= 1) {
                $('html').removeClass('modal-open');
            }
        });

        // fix page scrollbars issue
        $('body').on('show.bs.modal', '.modal', function () {
            if ($(this).hasClass("modal-scroll")) {
                $('body').addClass("modal-open-noscroll");
            }
        });

        // fix page scrollbars issue
        $('body').on('hide.bs.modal', '.modal', function () {
            $('body').removeClass("modal-open-noscroll");
        });

        // remove ajax content and remove cache on modal closed 
        $('body').on('hidden.bs.modal', '.modal:not(.modal-cached)', function () {
            $(this).removeData('bs.modal');
        });
    };

    // Handles Bootstrap Tooltips.
    var handleTooltips = function () {
        // global tooltips
        $('.tooltips').tooltip();

        // portlet tooltips
        $('.portlet > .portlet-title .fullscreen').tooltip({
            container: 'body',
            title: 'Fullscreen'
        });
        $('.portlet > .portlet-title > .tools > .reload').tooltip({
            container: 'body',
            title: 'Reload'
        });
        $('.portlet > .portlet-title > .tools > .remove').tooltip({
            container: 'body',
            title: 'Remove'
        });
        $('.portlet > .portlet-title > .tools > .config').tooltip({
            container: 'body',
            title: 'Settings'
        });
        $('.portlet > .portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip({
            container: 'body',
            title: 'Collapse/Expand'
        });
    };

    // Handles Bootstrap Dropdowns
    var handleDropdowns = function () {
        /*
          Hold dropdown on click  
        */
        $('body').on('click', '.dropdown-menu.hold-on-click', function (e) {
            e.stopPropagation();
        });
    };

    var handleAlerts = function () {
        $('body').on('click', '[data-close="alert"]', function (e) {
            $(this).parent('.alert').hide();
            $(this).closest('.note').hide();
            e.preventDefault();
        });

        $('body').on('click', '[data-close="note"]', function (e) {
            $(this).closest('.note').hide();
            e.preventDefault();
        });

        $('body').on('click', '[data-remove="note"]', function (e) {
            $(this).closest('.note').remove();
            e.preventDefault();
        });
    };

    // Handle Hower Dropdowns
    var handleDropdownHover = function () {
        $('[data-hover="dropdown"]').not('.hover-initialized').each(function () {
            $(this).dropdownHover();
            $(this).addClass('hover-initialized');
        });
    };

    // Handle textarea autosize 
    var handleTextareaAutosize = function () {
        if (typeof (autosize) == "function") {
            autosize(document.querySelector('textarea.autosizeme'));
        }
    }

    // Handles Bootstrap Popovers

    // last popep popover
    var lastPopedPopover;

    var handlePopovers = function () {
        $('.popovers').popover();

        // close last displayed popover

        $(document).on('click.bs.popover.data-api', function (e) {
            if (lastPopedPopover) {
                lastPopedPopover.popover('hide');
            }
        });
    };

    // Handles scrollable contents using jQuery SlimScroll plugin.
    var handleScrollers = function () {
        Metronic.initSlimScroll('.scroller');
    };

    // Handles Image Preview using jQuery Fancybox plugin
    var handleFancybox = function () {
        if (!jQuery.fancybox) {
            return;
        }

        if ($(".fancybox-button").size() > 0) {
            $(".fancybox-button").fancybox({
                groupAttr: 'data-rel',
                prevEffect: 'none',
                nextEffect: 'none',
                closeBtn: true,
                helpers: {
                    title: {
                        type: 'inside'
                    }
                }
            });
        }
    };

    // Fix input placeholder issue for IE8 and IE9
    var handleFixInputPlaceholderForIE = function () {
        //fix html5 placeholder attribute for ie7 & ie8
        if (isIE8 || isIE9) { // ie8 & ie9
            // this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
            $('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function () {
                var input = $(this);

                if (input.val() === '' && input.attr("placeholder") !== '') {
                    input.addClass("placeholder").val(input.attr('placeholder'));
                }

                input.focus(function () {
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                });

                input.blur(function () {
                    if (input.val() === '' || input.val() == input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                });
            });
        }
    };

    // Handle Select2 Dropdowns
    //var handleSelect2 = function () {
    //    if ($().select2) {
    //        $('.select2me').select2({
    //            placeholder: "Select",
    //            allowClear: true
    //        });
    //    }
    //};

    //* END:CORE HANDLERS *//

    return {

        //main function to initiate the theme
        init: function () {
            //IMPORTANT!!!: Do not modify the core handlers call order.

            //Core handlers
            handleInit(); // initialize core variables
            handleOnResize(); // set and handle responsive    

            //UI Component handlers     
            handleMaterialDesign(); // handle material design       
            handleUniform(); // hanfle custom radio & checkboxes
            handleiCheck(); // handles custom icheck radio and checkboxes
            handleBootstrapSwitch(); // handle bootstrap switch plugin
            handleScrollers(); // handles slim scrolling contents 
            handleFancybox(); // handle fancy box
            //handleSelect2(); // handle custom Select2 dropdowns
            handlePortletTools(); // handles portlet action bar functionality(refresh, configure, toggle, remove)
            handleAlerts(); //handle closabled alerts
            handleDropdowns(); // handle dropdowns
            handleTabs(); // handle tabs
            handleTooltips(); // handle bootstrap tooltips
            handlePopovers(); // handles bootstrap popovers
            handleAccordions(); //handles accordions 
            handleModals(); // handle modals
            handleBootstrapConfirmation(); // handle bootstrap confirmations
            handleTextareaAutosize(); // handle autosize textareas

            // Hacks
            handleFixInputPlaceholderForIE(); //IE8 & IE9 input placeholder issue fix
        },

        //main function to initiate core javascript after ajax complete
        initAjax: function () {
            handleUniform(); // handles custom radio & checkboxes     
            handleiCheck(); // handles custom icheck radio and checkboxes
            handleBootstrapSwitch(); // handle bootstrap switch plugin
            handleDropdownHover(); // handles dropdown hover       
            handleScrollers(); // handles slim scrolling contents 
            //handleSelect2(); // handle custom Select2 dropdowns
            handleFancybox(); // handle fancy box
            handleDropdowns(); // handle dropdowns
            handleTooltips(); // handle bootstrap tooltips
            handlePopovers(); // handles bootstrap popovers
            handleAccordions(); //handles accordions 
            handleBootstrapConfirmation(); // handle bootstrap confirmations
        },

        //init main components 
        initComponents: function () {
            this.initAjax();
        },

        //public function to remember last opened popover that needs to be closed on click
        setLastPopedPopover: function (el) {
            lastPopedPopover = el;
        },

        //public function to add callback a function which will be called on window resize
        addResizeHandler: function (func) {
            resizeHandlers.push(func);
        },

        //public functon to call _runresizeHandlers
        runResizeHandlers: function () {
            _runResizeHandlers();
        },

        // wrMetronicer function to scroll(focus) to an element
        scrollTo: function (el, offeset) {
            var pos = (el && el.size() > 0) ? el.offset().top : 0;

            if (el) {
                if ($('body').hasClass('page-header-fixed')) {
                    pos = pos - $('.page-header').height();
                } else if ($('body').hasClass('page-header-top-fixed')) {
                    pos = pos - $('.page-header-top').height();
                } else if ($('body').hasClass('page-header-menu-fixed')) {
                    pos = pos - $('.page-header-menu').height();
                }
                pos = pos + (offeset ? offeset : -1 * el.height());
            }

            $('html,body').animate({
                scrollTop: pos
            }, 'slow');
        },

        initSlimScroll: function (el) {
            $(el).each(function () {
                if ($(this).attr("data-initialized")) {
                    return; // exit
                }

                var height;

                if ($(this).attr("data-height")) {
                    height = $(this).attr("data-height");
                } else {
                    height = $(this).css('height');
                }

                $(this).slimScroll({
                    allowPageScroll: true, // allow page scroll when the element scroll is ended
                    size: '7px',
                    color: ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
                    wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                    railColor: ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#eaeaea'),
                    position: isRTL ? 'left' : 'right',
                    height: height,
                    alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
                    railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
                    disableFadeOut: true
                });

                $(this).attr("data-initialized", "1");
            });
        },

        destroySlimScroll: function (el) {
            $(el).each(function () {
                if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
                    $(this).removeAttr("data-initialized");
                    $(this).removeAttr("style");

                    var attrList = {};

                    // store the custom attribures so later we will reassign.
                    if ($(this).attr("data-handle-color")) {
                        attrList["data-handle-color"] = $(this).attr("data-handle-color");
                    }
                    if ($(this).attr("data-wrapper-class")) {
                        attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
                    }
                    if ($(this).attr("data-rail-color")) {
                        attrList["data-rail-color"] = $(this).attr("data-rail-color");
                    }
                    if ($(this).attr("data-always-visible")) {
                        attrList["data-always-visible"] = $(this).attr("data-always-visible");
                    }
                    if ($(this).attr("data-rail-visible")) {
                        attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
                    }

                    $(this).slimScroll({
                        wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                        destroy: true
                    });

                    var the = $(this);

                    // reassign custom attributes
                    $.each(attrList, function (key, value) {
                        the.attr(key, value);
                    });

                }
            });
        },

        // function to scroll to the top
        scrollTop: function () {
            Metronic.scrollTo();
        },

        // wrMetronicer function to  block element(indicate loading)
        blockUI: function (options) {
            options = $.extend(true, {}, options);
            var html = '';
            if (options.animate) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '">' + '<div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>' + '</div>';
            } else if (options.iconOnly) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""></div>';
            } else if (options.textOnly) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            } else {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            }

            if (options.target) { // element blocking
                var el = $(options.target);
                if (el.height() <= ($(window).height())) {
                    options.cenrerY = true;
                }
                el.block({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    centerY: options.cenrerY !== undefined ? options.cenrerY : false,
                    css: {
                        top: '10%',
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            } else { // page blocking
                $.blockUI({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    css: {
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            }
        },

        // wrMetronicer function to  un-block element(finish loading)
        unblockUI: function (target) {
            if (target) {
                $(target).unblock({
                    onUnblock: function () {
                        $(target).css('position', '');
                        $(target).css('zoom', '');
                    }
                });
            } else {
                $.unblockUI();
            }
        },

        startPageLoading: function (options) {
            if (options && options.animate) {
                $('.page-spinner-bar').remove();
                $('body').append('<div class="page-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
            } else {
                $('.page-loading').remove();
                $('body').append('<div class="page-loading"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif"/>&nbsp;&nbsp;<span>' + (options && options.message ? options.message : 'Loading...') + '</span></div>');
            }
        },

        stopPageLoading: function () {
            $('.page-loading, .page-spinner-bar').remove();
        },

        alert: function (options) {

            options = $.extend(true, {
                container: "", // alerts parent container(by default placed after the page breadcrumbs)
                place: "append", // "append" or "prepend" in container 
                type: 'success', // alert's type
                message: "", // alert's message
                close: true, // make alert closable
                reset: true, // close all previouse alerts first
                focus: true, // auto scroll to the alert after shown
                closeInSeconds: 0, // auto close after defined seconds
                icon: "" // put icon before the message
            }, options);

            var id = Metronic.getUniqueID("Metronic_alert");

            var html = '<div id="' + id + '" class="Metronic-alerts alert alert-' + options.type + ' fade in">' + (options.close ? '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>' : '') + (options.icon !== "" ? '<i class="fa-lg fa fa-' + options.icon + '"></i>  ' : '') + options.message + '</div>';

            if (options.reset) {
                $('.Metronic-alerts').remove();
            }

            if (!options.container) {
                if ($('body').hasClass("page-container-bg-solid")) {
                    $('.page-title').after(html);
                } else {
                    if ($('.page-bar').size() > 0) {
                        $('.page-bar').after(html);
                    } else {
                        $('.page-breadcrumb').after(html);
                    }
                }
            } else {
                if (options.place == "append") {
                    $(options.container).append(html);
                } else {
                    $(options.container).prepend(html);
                }
            }

            if (options.focus) {
                Metronic.scrollTo($('#' + id));
            }

            if (options.closeInSeconds > 0) {
                setTimeout(function () {
                    $('#' + id).remove();
                }, options.closeInSeconds * 1000);
            }

            return id;
        },

        // initializes uniform elements
        initUniform: function (els) {
            if (els) {
                $(els).each(function () {
                    if ($(this).parents(".checker").size() === 0) {
                        $(this).show();
                        $(this).uniform();
                    }
                });
            } else {
                handleUniform();
            }
        },

        //wrMetronicer function to update/sync jquery uniform checkbox & radios
        updateUniform: function (els) {
            $.uniform.update(els); // update the uniform checkbox & radios UI after the actual input control state changed
        },

        //public function to initialize the fancybox plugin
        initFancybox: function () {
            handleFancybox();
        },

        //public helper function to get actual input value(used in IE9 and IE8 due to placeholder attribute not supported)
        getActualVal: function (el) {
            el = $(el);
            if (el.val() === el.attr("placeholder")) {
                return "";
            }
            return el.val();
        },

        //public function to get a paremeter by name from URL
        getURLParameter: function (paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },

        // check for device touch support
        isTouchDevice: function () {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        },

        // To get the correct viewport width based on  http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
        getViewPort: function () {
            var e = window,
                a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }

            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        },

        getUniqueID: function (prefix) {
            return 'prefix_' + Math.floor(Math.random() * (new Date()).getTime());
        },

        // check IE8 mode
        isIE8: function () {
            return isIE8;
        },

        // check IE9 mode
        isIE9: function () {
            return isIE9;
        },

        //check RTL mode
        isRTL: function () {
            return isRTL;
        },

        // check IE8 mode
        isAngularJsApp: function () {
            return (typeof angular == 'undefined') ? false : true;
        },

        getAssetsPath: function () {
            return assetsPath;
        },

        setAssetsPath: function (path) {
            assetsPath = path;
        },

        setGlobalImgPath: function (path) {
            globalImgPath = path;
        },

        getGlobalImgPath: function () {
            return assetsPath + globalImgPath;
        },

        setGlobalPluginsPath: function (path) {
            globalPluginsPath = path;
        },

        getGlobalPluginsPath: function () {
            return assetsPath + globalPluginsPath;
        },

        getGlobalCssPath: function () {
            return assetsPath + globalCssPath;
        },

        // get layout color code by color name
        getBrandColor: function (name) {
            if (brandColors[name]) {
                return brandColors[name];
            } else {
                return '';
            }
        },

        getResponsiveBreakpoint: function (size) {
            // bootstrap responsive breakpoints
            var sizes = {
                'xs': 480,     // extra small
                'sm': 768,     // small
                'md': 992,     // medium
                'lg': 1200     // large
            };

            return sizes[size] ? sizes[size] : 0;
        }
    };

}();
/**
Core script to handle the entire theme and core functions
**/
var Layout = function () {

    var layoutImgPath = 'admin/layout/img/';

    var layoutCssPath = 'admin/layout/css/';

    var resBreakpointMd = Metronic.getResponsiveBreakpoint('md');

    //* BEGIN:CORE HANDLERS *//
    // this function handles responsive layout on screen size resize or mobile device rotate.

    // Set proper height for sidebar and content. The content and sidebar height must be synced always.
    var handleSidebarAndContentHeight = function () {
        var content = $('.page-content');
        var sidebar = $('.page-sidebar');
        var body = $('body');
        var height;

        if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
            var available_height = Metronic.getViewPort().height - $('.page-footer').outerHeight() - $('.page-header').outerHeight();
            if (content.height() < available_height) {
                content.attr('style', 'min-height:' + available_height + 'px');
            }
        } else {
            if (body.hasClass('page-sidebar-fixed')) {
                height = _calculateFixedSidebarViewportHeight();
                if (body.hasClass('page-footer-fixed') === false) {
                    height = height - $('.page-footer').outerHeight();
                }
            } else {
                var headerHeight = $('.page-header').outerHeight();
                var footerHeight = $('.page-footer').outerHeight();

                if (Metronic.getViewPort().width < resBreakpointMd) {
                    height = Metronic.getViewPort().height - headerHeight - footerHeight;
                } else {
                    height = sidebar.height() + 20;
                }

                if ((height + headerHeight + footerHeight) <= Metronic.getViewPort().height) {
                    height = Metronic.getViewPort().height - headerHeight - footerHeight;
                }
            }
            content.attr('style', 'min-height:' + height + 'px');
        }
    };

    // Handle sidebar menu links
    var handleSidebarMenuActiveLink = function (mode, el) {
        var url = location.hash.toLowerCase();

        var menu = $('.page-sidebar-menu');

        if (mode === 'click' || mode === 'set') {
            el = $(el);
        } else if (mode === 'match') {
            menu.find("li > a").each(function () {
                var path = $(this).attr("href").toLowerCase();
                // url match condition         
                if (path.length > 1 && url.substr(1, path.length - 1) == path.substr(1)) {
                    el = $(this);
                    return;
                }
            });
        }

        if (!el || el.size() == 0) {
            return;
        }

        if (el.attr('href').toLowerCase() === 'javascript:;' || el.attr('href').toLowerCase() === '#') {
            return;
        }

        var slideSpeed = parseInt(menu.data("slide-speed"));
        var keepExpand = menu.data("keep-expanded");

        // disable active states
        menu.find('li.active').removeClass('active');
        menu.find('li > a > .selected').remove();

        if (menu.hasClass('page-sidebar-menu-hover-submenu') === false) {
            menu.find('li.open').each(function () {
                if ($(this).children('.sub-menu').size() === 0) {
                    $(this).removeClass('open');
                    $(this).find('> a > .arrow.open').removeClass('open');
                }
            });
        } else {
            menu.find('li.open').removeClass('open');
        }

        el.parents('li').each(function () {
            $(this).addClass('active');
            $(this).find('> a > span.arrow').addClass('open');

            if ($(this).parent('ul.page-sidebar-menu').size() === 1) {
                $(this).find('> a').append('<span class="selected"></span>');
            }

            if ($(this).children('ul.sub-menu').size() === 1) {
                $(this).addClass('open');
            }
        });

        if (mode === 'click') {
            if (Metronic.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }
        }
    };

    // Handle sidebar menu
    var handleSidebarMenu = function () {
        // handle sidebar link click
        $('.page-sidebar').on('click', 'li > a', function (e) {

            if ($('body').hasClass('page-sidebar-closed') && $(this).parent('li').parent('.page-sidebar-menu').size() === 1) {
                return;
            }

            var hasSubMenu = $(this).next().hasClass('sub-menu');

            if (Metronic.getViewPort().width >= resBreakpointMd && $(this).parents('.page-sidebar-menu-hover-submenu').size() === 1) { // exit of hover sidebar menu
                return;
            }

            if (hasSubMenu === false) {
                if (Metronic.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                    $('.page-header .responsive-toggler').click();
                }
                return;
            }

            if ($(this).next().hasClass('sub-menu always-open')) {
                return;
            }

            var parent = $(this).parent().parent();
            var the = $(this);
            var menu = $('.page-sidebar-menu');
            var sub = $(this).next();

            var autoScroll = menu.data("auto-scroll");
            var slideSpeed = parseInt(menu.data("slide-speed"));
            var keepExpand = menu.data("keep-expanded");

            if (keepExpand !== true) {
                parent.children('li.open').children('a').children('.arrow').removeClass('open');
                parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
                parent.children('li.open').removeClass('open');
            }

            var slideOffeset = -200;

            if (sub.is(":visible")) {
                $('.arrow', $(this)).removeClass("open");
                $(this).parent().removeClass("open");
                sub.slideUp(slideSpeed, function () {
                    if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                        if ($('body').hasClass('page-sidebar-fixed')) {
                            menu.slimScroll({
                                'scrollTo': (the.position()).top
                            });
                        } else {
                            Metronic.scrollTo(the, slideOffeset);
                        }
                    }
                    handleSidebarAndContentHeight();
                });
            } else if (hasSubMenu) {
                $('.arrow', $(this)).addClass("open");
                $(this).parent().addClass("open");
                sub.slideDown(slideSpeed, function () {
                    if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
                        if ($('body').hasClass('page-sidebar-fixed')) {
                            menu.slimScroll({
                                'scrollTo': (the.position()).top
                            });
                        } else {
                            Metronic.scrollTo(the, slideOffeset);
                        }
                    }
                    handleSidebarAndContentHeight();
                });
            }

            e.preventDefault();
        });

        // handle ajax links within sidebar menu
        $('.page-sidebar').on('click', ' li > a.ajaxify', function (e) {
            e.preventDefault();
            Metronic.scrollTop();

            var url = $(this).attr("href");
            var menuContainer = $('.page-sidebar ul');
            var pageContent = $('.page-content');
            var pageContentBody = $('.page-content .page-content-body');

            menuContainer.children('li.active').removeClass('active');
            menuContainer.children('arrow.open').removeClass('open');

            $(this).parents('li').each(function () {
                $(this).addClass('active');
                $(this).children('a > span.arrow').addClass('open');
            });
            $(this).parents('li').addClass('active');

            if (Metronic.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }

            Metronic.startPageLoading();

            var the = $(this);

            $.ajax({
                type: "GET",
                cache: false,
                url: url,
                dataType: "html",
                success: function (res) {
                    if (the.parents('li.open').size() === 0) {
                        $('.page-sidebar-menu > li.open > a').click();
                    }

                    Metronic.stopPageLoading();
                    pageContentBody.html(res);
                    Layout.fixContentHeight(); // fix content height
                    Metronic.initAjax(); // initialize core stuff
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    Metronic.stopPageLoading();
                    pageContentBody.html('<h4>Could not load the requested content.</h4>');
                }
            });
        });

        // handle ajax link within main content
        $('.page-content').on('click', '.ajaxify', function (e) {
            e.preventDefault();
            Metronic.scrollTop();

            var url = $(this).attr("href");
            var pageContent = $('.page-content');
            var pageContentBody = $('.page-content .page-content-body');

            Metronic.startPageLoading();

            if (Metronic.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
                $('.page-header .responsive-toggler').click();
            }

            $.ajax({
                type: "GET",
                cache: false,
                url: url,
                dataType: "html",
                success: function (res) {
                    Metronic.stopPageLoading();
                    pageContentBody.html(res);
                    Layout.fixContentHeight(); // fix content height
                    Metronic.initAjax(); // initialize core stuff
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    pageContentBody.html('<h4>Could not load the requested content.</h4>');
                    Metronic.stopPageLoading();
                }
            });
        });

        // handle scrolling to top on responsive menu toggler click when header is fixed for mobile view
        $(document).on('click', '.page-header-fixed-mobile .page-header .responsive-toggler', function () {
            Metronic.scrollTop();
        });

        // handle sidebar hover effect        
        handleFixedSidebarHoverEffect();

        // handle the search bar close
        $('.page-sidebar').on('click', '.sidebar-search .remove', function (e) {
            e.preventDefault();
            $('.sidebar-search').removeClass("open");
        });

        // handle the search query submit on enter press
        $('.page-sidebar .sidebar-search').on('keypress', 'input.form-control', function (e) {
            if (e.which == 13) {
                $('.sidebar-search').submit();
                return false; //<---- Add this line
            }
        });

        // handle the search submit(for sidebar search and responsive mode of the header search)
        $('.sidebar-search .submit').on('click', function (e) {
            e.preventDefault();
            if ($('body').hasClass("page-sidebar-closed")) {
                if ($('.sidebar-search').hasClass('open') === false) {
                    if ($('.page-sidebar-fixed').size() === 1) {
                        $('.page-sidebar .sidebar-toggler').click(); //trigger sidebar toggle button
                    }
                    $('.sidebar-search').addClass("open");
                } else {
                    $('.sidebar-search').submit();
                }
            } else {
                $('.sidebar-search').submit();
            }
        });

        // handle close on body click
        if ($('.sidebar-search').size() !== 0) {
            $('.sidebar-search .input-group').on('click', function (e) {
                e.stopPropagation();
            });

            $('body').on('click', function () {
                if ($('.sidebar-search').hasClass('open')) {
                    $('.sidebar-search').removeClass("open");
                }
            });
        }
    };

    // Helper function to calculate sidebar height for fixed sidebar layout.
    var _calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = Metronic.getViewPort().height - $('.page-header').outerHeight();
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.page-footer').outerHeight();
        }

        return sidebarHeight;
    };

    // Handles fixed sidebar
    var handleFixedSidebar = function () {
        var menu = $('.page-sidebar-menu');

        Metronic.destroySlimScroll(menu);

        if ($('.page-sidebar-fixed').size() === 0) {
            handleSidebarAndContentHeight();
            return;
        }

        if (Metronic.getViewPort().width >= resBreakpointMd) {
            menu.attr("data-height", _calculateFixedSidebarViewportHeight());
            Metronic.initSlimScroll(menu);
            handleSidebarAndContentHeight();
        }
    };

    // Handles sidebar toggler to close/hide the sidebar.
    var handleFixedSidebarHoverEffect = function () {
        var body = $('body');
        if (body.hasClass('page-sidebar-fixed')) {
            $('.page-sidebar').on('mouseenter', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').removeClass('page-sidebar-menu-closed');
                }
            }).on('mouseleave', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
                }
            });
        }
    };

    // Hanles sidebar toggler
    var handleSidebarToggler = function () {
        var body = $('body');
        if ($.cookie && $.cookie('sidebar_closed') === '1' && Metronic.getViewPort().width >= resBreakpointMd) {
            $('body').addClass('page-sidebar-closed');
            $('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
        }

        // handle sidebar show/hide
        $('body').on('click', '.sidebar-toggler', function (e) {
            var sidebar = $('.page-sidebar');
            var sidebarMenu = $('.page-sidebar-menu');
            $(".sidebar-search", sidebar).removeClass("open");

            if (body.hasClass("page-sidebar-closed")) {
                body.removeClass("page-sidebar-closed");
                sidebarMenu.removeClass("page-sidebar-menu-closed");
                if ($.cookie) {
                    $.cookie('sidebar_closed', '0');
                }
            } else {
                body.addClass("page-sidebar-closed");
                sidebarMenu.addClass("page-sidebar-menu-closed");
                if (body.hasClass("page-sidebar-fixed")) {
                    sidebarMenu.trigger("mouseleave");
                }
                if ($.cookie) {
                    $.cookie('sidebar_closed', '1');
                }
            }

            $(window).trigger('resize');
        });
    };

    // Handles the horizontal menu
    var handleHorizontalMenu = function () {
        //handle tab click
        $('.page-header').on('click', '.hor-menu a[data-toggle="tab"]', function (e) {
            e.preventDefault();
            var nav = $(".hor-menu .nav");
            var active_link = nav.find('li.current');
            $('li.active', active_link).removeClass("active");
            $('.selected', active_link).remove();
            var new_link = $(this).parents('li').last();
            new_link.addClass("current");
            new_link.find("a:first").append('<span class="selected"></span>');
        });

        // handle search box expand/collapse        
        $('.page-header').on('click', '.search-form', function (e) {
            $(this).addClass("open");
            $(this).find('.form-control').focus();

            $('.page-header .search-form .form-control').on('blur', function (e) {
                $(this).closest('.search-form').removeClass("open");
                $(this).unbind("blur");
            });
        });

        // handle hor menu search form on enter press
        $('.page-header').on('keypress', '.hor-menu .search-form .form-control', function (e) {
            if (e.which == 13) {
                $(this).closest('.search-form').submit();
                return false;
            }
        });

        // handle header search button click
        $('.page-header').on('mousedown', '.search-form.open .submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).closest('.search-form').submit();
        });

        // handle hover dropdown menu for desktop devices only
        $('[data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function () {
            $(this).dropdownHover();
            $(this).addClass('hover-initialized');
        });

        $(document).on('click', '.mega-menu-dropdown .dropdown-menu', function (e) {
            e.stopPropagation();
        });
    };

    // Handles Bootstrap Tabs.
    var handleTabs = function () {
        // fix content height on tab click
        $('body').on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
            handleSidebarAndContentHeight();
        });
    };

    // Handles the go to top button at the footer
    var handleGoTop = function () {
        var offset = 300;
        var duration = 500;

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {  // ios supported
            $(window).bind("touchend touchcancel touchleave", function (e) {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        } else {  // general 
            $(window).scroll(function () {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        }

        $('.scroll-to-top').click(function (e) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, duration);
            return false;
        });
    };

    // Hanlde 100% height elements(block, portlet, etc)
    var handle100HeightContent = function () {

        var target = $('.full-height-content');
        var height;

        height = Metronic.getViewPort().height -
            $('.page-header').outerHeight(true) -
            $('.page-footer').outerHeight(true) -
            $('.page-title').outerHeight(true) -
            $('.page-bar').outerHeight(true);

        if (target.hasClass('portlet')) {
            var portletBody = target.find('.portlet-body');

            if (Metronic.getViewPort().width < resBreakpointMd) {
                Metronic.destroySlimScroll(portletBody.find('.full-height-content-body')); // destroy slimscroll 
                return;
            }

            height = height -
                target.find('.portlet-title').outerHeight(true) -
                parseInt(target.find('.portlet-body').css('padding-top')) -
                parseInt(target.find('.portlet-body').css('padding-bottom')) - 2;

            if (target.hasClass("full-height-content-scrollable")) {
                height = height - 35;
                portletBody.find('.full-height-content-body').css('height', height);
                Metronic.initSlimScroll(portletBody.find('.full-height-content-body'));
            } else {
                portletBody.css('min-height', height);
            }
        } else {
            if (Metronic.getViewPort().width < resBreakpointMd) {
                Metronic.destroySlimScroll(target.find('.full-height-content-body')); // destroy slimscroll 
                return;
            }

            if (target.hasClass("full-height-content-scrollable")) {
                height = height - 35;
                target.find('.full-height-content-body').css('height', height);
                Metronic.initSlimScroll(target.find('.full-height-content-body'));
            } else {
                target.css('min-height', height);
            }
        }
    };
    //* END:CORE HANDLERS *//

    return {
        // Main init methods to initialize the layout
        //IMPORTANT!!!: Do not modify the core handlers call order.

        initHeader: function () {
            handleHorizontalMenu(); // handles horizontal menu    
        },

        setSidebarMenuActiveLink: function (mode, el) {
            handleSidebarMenuActiveLink(mode, el);
        },

        initSidebar: function () {
            //layout handlers
            handleFixedSidebar(); // handles fixed sidebar menu
            handleSidebarMenu(); // handles main menu
            handleSidebarToggler(); // handles sidebar hide/show

            if (Metronic.isAngularJsApp()) {
                handleSidebarMenuActiveLink('match'); // init sidebar active links 
            }

            Metronic.addResizeHandler(handleFixedSidebar); // reinitialize fixed sidebar on window resize
        },

        initContent: function () {
            handle100HeightContent(); // handles 100% height elements(block, portlet, etc)
            handleTabs(); // handle bootstrah tabs

            Metronic.addResizeHandler(handleSidebarAndContentHeight); // recalculate sidebar & content height on window resize
            Metronic.addResizeHandler(handle100HeightContent); // reinitialize content height on window resize 
        },

        initFooter: function () {
            handleGoTop(); //handles scroll to top functionality in the footer
        },

        init: function () {
            this.initHeader();
            this.initSidebar();
            this.initContent();
            this.initFooter();
        },

        //public function to fix the sidebar and content height accordingly
        fixContentHeight: function () {
            handleSidebarAndContentHeight();
        },

        initFixedSidebarHoverEffect: function () {
            handleFixedSidebarHoverEffect();
        },

        initFixedSidebar: function () {
            handleFixedSidebar();
        },

        getLayoutImgPath: function () {
            return Metronic.getAssetsPath() + layoutImgPath;
        },

        getLayoutCssPath: function () {
            return Metronic.getAssetsPath() + layoutCssPath;
        }
    };

}();
/**
Core script to handle the entire theme and core functions
**/
var QuickSidebar = function () {

    // Handles quick sidebar toggler
    var handleQuickSidebarToggler = function () {
        // quick sidebar toggler
        $('.top-menu .dropdown-quick-sidebar-toggler a, .page-quick-sidebar-toggler').click(function (e) {
            $('body').toggleClass('page-quick-sidebar-open');
        });
    };

    // Handles quick sidebar chats
    var handleQuickSidebarChat = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperChat = wrapper.find('.page-quick-sidebar-chat');

        var initChatSlimScroll = function () {
            var chatUsers = wrapper.find('.page-quick-sidebar-chat-users');
            var chatUsersHeight;

            chatUsersHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // chat user list 
            Metronic.destroySlimScroll(chatUsers);
            chatUsers.attr("data-height", chatUsersHeight);
            Metronic.initSlimScroll(chatUsers);

            var chatMessages = wrapperChat.find('.page-quick-sidebar-chat-user-messages');
            var chatMessagesHeight = chatUsersHeight - wrapperChat.find('.page-quick-sidebar-chat-user-form').outerHeight() - wrapperChat.find('.page-quick-sidebar-nav').outerHeight();

            // user chat messages 
            Metronic.destroySlimScroll(chatMessages);
            chatMessages.attr("data-height", chatMessagesHeight);
            Metronic.initSlimScroll(chatMessages);
        };

        initChatSlimScroll();
        Metronic.addResizeHandler(initChatSlimScroll); // reinitialize on window resize

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .media').click(function () {
            wrapperChat.addClass("page-quick-sidebar-content-item-shown");
        });

        wrapper.find('.page-quick-sidebar-chat-user .page-quick-sidebar-back-to-list').click(function () {
            wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
        });

        var handleChatMessagePost = function (e) {
            e.preventDefault();

            var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages");
            var input = wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control');

            var text = input.val();
            if (text.length === 0) {
                return;
            }

            var preparePost = function (dir, time, name, avatar, message) {
                var tpl = '';
                tpl += '<div class="post ' + dir + '">';
                tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + avatar + '.jpg"/>';
                tpl += '<div class="message">';
                tpl += '<span class="arrow"></span>';
                tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                tpl += '<span class="datetime">' + time + '</span>';
                tpl += '<span class="body">';
                tpl += message;
                tpl += '</span>';
                tpl += '</div>';
                tpl += '</div>';

                return tpl;
            };

            // handle post
            var time = new Date();
            var message = preparePost('out', (time.getHours() + ':' + time.getMinutes()), "Bob Nilson", 'avatar3', text);
            message = $(message);
            chatContainer.append(message);

            var getLastPostPos = function () {
                var height = 0;
                chatContainer.find(".post").each(function () {
                    height = height + $(this).outerHeight();
                });

                return height;
            };

            chatContainer.slimScroll({
                scrollTo: getLastPostPos()
            });

            input.val("");

            // simulate reply
            setTimeout(function () {
                var time = new Date();
                var message = preparePost('in', (time.getHours() + ':' + time.getMinutes()), "Ella Wong", 'avatar2', 'Lorem ipsum doloriam nibh...');
                message = $(message);
                chatContainer.append(message);

                chatContainer.slimScroll({
                    scrollTo: getLastPostPos()
                });
            }, 3000);
        };

        wrapperChat.find('.page-quick-sidebar-chat-user-form .btn').click(handleChatMessagePost);
        wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control').keypress(function (e) {
            if (e.which == 13) {
                handleChatMessagePost(e);
                return false;
            }
        });
    };

    // Handles quick sidebar tasks
    var handleQuickSidebarAlerts = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-alerts');

        var initAlertsSlimScroll = function () {
            var alertList = wrapper.find('.page-quick-sidebar-alerts-list');
            var alertListHeight;

            alertListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(alertList);
            alertList.attr("data-height", alertListHeight);
            Metronic.initSlimScroll(alertList);
        };

        initAlertsSlimScroll();
        Metronic.addResizeHandler(initAlertsSlimScroll); // reinitialize on window resize
    };

    // Handles quick sidebar settings
    var handleQuickSidebarSettings = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-settings');

        var initSettingsSlimScroll = function () {
            var settingsList = wrapper.find('.page-quick-sidebar-settings-list');
            var settingsListHeight;

            settingsListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(settingsList);
            settingsList.attr("data-height", settingsListHeight);
            Metronic.initSlimScroll(settingsList);
        };

        initSettingsSlimScroll();
        Metronic.addResizeHandler(initSettingsSlimScroll); // reinitialize on window resize
    };

    return {

        init: function () {
            //layout handlers
            handleQuickSidebarToggler(); // handles quick sidebar's toggler
            handleQuickSidebarChat(); // handles quick sidebar's chats
            handleQuickSidebarAlerts(); // handles quick sidebar's alerts
            handleQuickSidebarSettings(); // handles quick sidebar's setting
        }
    };

}();
/**
Demo script to handle the theme demo
**/
var Demo = function () {

    // Handle Theme Settings
    var handleTheme = function () {

        var panel = $('.theme-panel');

        if ($('body').hasClass('page-boxed') === false) {
            $('.layout-option', panel).val("fluid");
        }

        $('.sidebar-option', panel).val("default");
        $('.page-header-option', panel).val("fixed");
        $('.page-footer-option', panel).val("default");
        if ($('.sidebar-pos-option').attr("disabled") === false) {
            $('.sidebar-pos-option', panel).val(Metronic.isRTL() ? 'right' : 'left');
        }

        //handle theme layout
        var resetLayout = function () {
            $("body").
            removeClass("page-boxed").
            removeClass("page-footer-fixed").
            removeClass("page-sidebar-fixed").
            removeClass("page-header-fixed").
            removeClass("page-sidebar-reversed");

            $('.page-header > .page-header-inner').removeClass("container");

            if ($('.page-container').parent(".container").size() === 1) {
                $('.page-container').insertAfter('body > .clearfix');
            }

            if ($('.page-footer > .container').size() === 1) {
                $('.page-footer').html($('.page-footer > .container').html());
            } else if ($('.page-footer').parent(".container").size() === 1) {
                $('.page-footer').insertAfter('.page-container');
                $('.scroll-to-top').insertAfter('.page-footer');
            }

            $(".top-menu > .navbar-nav > li.dropdown").removeClass("dropdown-dark");

            $('body > .container').remove();
        };

        var lastSelectedLayout = '';

        var setLayout = function () {

            var layoutOption = $('.layout-option', panel).val();
            var sidebarOption = $('.sidebar-option', panel).val();
            var headerOption = $('.page-header-option', panel).val();
            var footerOption = $('.page-footer-option', panel).val();
            var sidebarPosOption = $('.sidebar-pos-option', panel).val();
            var sidebarStyleOption = $('.sidebar-style-option', panel).val();
            var sidebarMenuOption = $('.sidebar-menu-option', panel).val();
            var headerTopDropdownStyle = $('.page-header-top-dropdown-style-option', panel).val();

            if (sidebarOption == "fixed" && headerOption == "default") {
                alert('Default Header with Fixed Sidebar option is not supported. Proceed with Fixed Header with Fixed Sidebar.');
                $('.page-header-option', panel).val("fixed");
                $('.sidebar-option', panel).val("fixed");
                sidebarOption = 'fixed';
                headerOption = 'fixed';
            }

            resetLayout(); // reset layout to default state

            if (layoutOption === "boxed") {
                $("body").addClass("page-boxed");

                // set header
                $('.page-header > .page-header-inner').addClass("container");
                var cont = $('body > .clearfix').after('<div class="container"></div>');

                // set content
                $('.page-container').appendTo('body > .container');

                // set footer
                if (footerOption === 'fixed') {
                    $('.page-footer').html('<div class="container">' + $('.page-footer').html() + '</div>');
                } else {
                    $('.page-footer').appendTo('body > .container');
                }
            }

            if (lastSelectedLayout != layoutOption) {
                //layout changed, run responsive handler: 
                Metronic.runResizeHandlers();
            }
            lastSelectedLayout = layoutOption;

            //header
            if (headerOption === 'fixed') {
                $("body").addClass("page-header-fixed");
                $(".page-header").removeClass("navbar-static-top").addClass("navbar-fixed-top");
            } else {
                $("body").removeClass("page-header-fixed");
                $(".page-header").removeClass("navbar-fixed-top").addClass("navbar-static-top");
            }

            //sidebar
            if ($('body').hasClass('page-full-width') === false) {
                if (sidebarOption === 'fixed') {
                    $("body").addClass("page-sidebar-fixed");
                    $("page-sidebar-menu").addClass("page-sidebar-menu-fixed");
                    $("page-sidebar-menu").removeClass("page-sidebar-menu-default");
                    Layout.initFixedSidebarHoverEffect();
                } else {
                    $("body").removeClass("page-sidebar-fixed");
                    $("page-sidebar-menu").addClass("page-sidebar-menu-default");
                    $("page-sidebar-menu").removeClass("page-sidebar-menu-fixed");
                    $('.page-sidebar-menu').unbind('mouseenter').unbind('mouseleave');
                }
            }

            // top dropdown style
            if (headerTopDropdownStyle === 'dark') {
                $(".top-menu > .navbar-nav > li.dropdown").addClass("dropdown-dark");
            } else {
                $(".top-menu > .navbar-nav > li.dropdown").removeClass("dropdown-dark");
            }

            //footer 
            if (footerOption === 'fixed') {
                $("body").addClass("page-footer-fixed");
            } else {
                $("body").removeClass("page-footer-fixed");
            }

            //sidebar style
            if (sidebarStyleOption === 'light') {
                $(".page-sidebar-menu").addClass("page-sidebar-menu-light");
            } else {
                $(".page-sidebar-menu").removeClass("page-sidebar-menu-light");
            }

            //sidebar menu 
            if (sidebarMenuOption === 'hover') {
                if (sidebarOption == 'fixed') {
                    $('.sidebar-menu-option', panel).val("accordion");
                    alert("Hover Sidebar Menu is not compatible with Fixed Sidebar Mode. Select Default Sidebar Mode Instead.");
                } else {
                    $(".page-sidebar-menu").addClass("page-sidebar-menu-hover-submenu");
                }
            } else {
                $(".page-sidebar-menu").removeClass("page-sidebar-menu-hover-submenu");
            }

            //sidebar position
            if (Metronic.isRTL()) {
                if (sidebarPosOption === 'left') {
                    $("body").addClass("page-sidebar-reversed");
                    $('#frontend-link').tooltip('destroy').tooltip({
                        placement: 'right'
                    });
                } else {
                    $("body").removeClass("page-sidebar-reversed");
                    $('#frontend-link').tooltip('destroy').tooltip({
                        placement: 'left'
                    });
                }
            } else {
                if (sidebarPosOption === 'right') {
                    $("body").addClass("page-sidebar-reversed");
                    $('#frontend-link').tooltip('destroy').tooltip({
                        placement: 'left'
                    });
                } else {
                    $("body").removeClass("page-sidebar-reversed");
                    $('#frontend-link').tooltip('destroy').tooltip({
                        placement: 'right'
                    });
                }
            }

            Layout.fixContentHeight(); // fix content height            
            Layout.initFixedSidebar(); // reinitialize fixed sidebar
        };

        // handle theme colors
        var setColor = function (color) {
            var color_ = (Metronic.isRTL() ? color + '-rtl' : color);
            $('#style_color').attr("href", Layout.getLayoutCssPath() + 'themes/' + color_ + ".css");
            if (color == 'light2') {
                $('.page-logo img').attr('src', Layout.getLayoutImgPath() + 'logo-invert.png');
            } else {
                $('.page-logo img').attr('src', Layout.getLayoutImgPath() + 'logo.png');
            }
        };

        $('.toggler', panel).click(function () {
            $('.toggler').hide();
            $('.toggler-close').show();
            $('.theme-panel > .theme-options').show();
        });

        $('.toggler-close', panel).click(function () {
            $('.toggler').show();
            $('.toggler-close').hide();
            $('.theme-panel > .theme-options').hide();
        });

        $('.theme-colors > ul > li', panel).click(function () {
            var color = $(this).attr("data-style");
            setColor(color);
            $('ul > li', panel).removeClass("current");
            $(this).addClass("current");
        });

        // set default theme options:

        if ($("body").hasClass("page-boxed")) {
            $('.layout-option', panel).val("boxed");
        }

        if ($("body").hasClass("page-sidebar-fixed")) {
            $('.sidebar-option', panel).val("fixed");
        }

        if ($("body").hasClass("page-header-fixed")) {
            $('.page-header-option', panel).val("fixed");
        }

        if ($("body").hasClass("page-footer-fixed")) {
            $('.page-footer-option', panel).val("fixed");
        }

        if ($("body").hasClass("page-sidebar-reversed")) {
            $('.sidebar-pos-option', panel).val("right");
        }

        if ($(".page-sidebar-menu").hasClass("page-sidebar-menu-light")) {
            $('.sidebar-style-option', panel).val("light");
        }

        if ($(".page-sidebar-menu").hasClass("page-sidebar-menu-hover-submenu")) {
            $('.sidebar-menu-option', panel).val("hover");
        }

        var sidebarOption = $('.sidebar-option', panel).val();
        var headerOption = $('.page-header-option', panel).val();
        var footerOption = $('.page-footer-option', panel).val();
        var sidebarPosOption = $('.sidebar-pos-option', panel).val();
        var sidebarStyleOption = $('.sidebar-style-option', panel).val();
        var sidebarMenuOption = $('.sidebar-menu-option', panel).val();

        $('.layout-option, .page-header-option, .page-header-top-dropdown-style-option, .sidebar-option, .page-footer-option, .sidebar-pos-option, .sidebar-style-option, .sidebar-menu-option', panel).change(setLayout);
    };

    // handle theme style
    var setThemeStyle = function (style) {
        var file = (style === 'rounded' ? 'components-rounded' : 'components');
        file = (Metronic.isRTL() ? file + '-rtl' : file);

        $('#style_components').attr("href", Metronic.getGlobalCssPath() + file + ".css");

        if ($.cookie) {
            $.cookie('layout-style-option', style);
        }
    };

    return {

        //main function to initiate the theme
        init: function () {
            // handles style customer tool
            handleTheme();

            // handle layout style change
            $('.theme-panel .layout-style-option').change(function () {
                setThemeStyle($(this).val());
            });

            // set layout style from cookie
            if ($.cookie && $.cookie('layout-style-option') === 'rounded') {
                setThemeStyle($.cookie('layout-style-option'));
                $('.theme-panel .layout-style-option').val($.cookie('layout-style-option'));
            }
        }
    };

}();
var Index = function () {

    return {

        //main function
        init: function () {
            Metronic.addResizeHandler(function () {
                jQuery('.vmaps').each(function () {
                    var map = jQuery(this);
                    map.width(map.parent().width());
                });
            });
        },

        initJQVMAP: function () {
            if (!jQuery().vectorMap) {
                return;
            }

            var showMap = function (name) {
                jQuery('.vmaps').hide();
                jQuery('#vmap_' + name).show();
            }

            var setMap = function (name) {
                var data = {
                    map: 'world_en',
                    backgroundColor: null,
                    borderColor: '#333333',
                    borderOpacity: 0.5,
                    borderWidth: 1,
                    color: '#c6c6c6',
                    enableZoom: true,
                    hoverColor: '#c9dfaf',
                    hoverOpacity: null,
                    values: sample_data,
                    normalizeFunction: 'linear',
                    scaleColors: ['#b6da93', '#909cae'],
                    selectedColor: '#c9dfaf',
                    selectedRegion: null,
                    showTooltip: true,
                    onLabelShow: function (event, label, code) {

                    },
                    onRegionOver: function (event, code) {
                        if (code == 'ca') {
                            event.preventDefault();
                        }
                    },
                    onRegionClick: function (element, code, region) {
                        var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
                        alert(message);
                    }
                };

                data.map = name + '_en';
                var map = jQuery('#vmap_' + name);
                if (!map) {
                    return;
                }
                map.width(map.parent().parent().width());
                map.show();
                map.vectorMap(data);
                map.hide();
            }

            setMap("world");
            setMap("usa");
            setMap("europe");
            setMap("russia");
            setMap("germany");
            showMap("world");

            jQuery('#regional_stat_world').click(function () {
                showMap("world");
            });

            jQuery('#regional_stat_usa').click(function () {
                showMap("usa");
            });

            jQuery('#regional_stat_europe').click(function () {
                showMap("europe");
            });
            jQuery('#regional_stat_russia').click(function () {
                showMap("russia");
            });
            jQuery('#regional_stat_germany').click(function () {
                showMap("germany");
            });

            $('#region_statistics_loading').hide();
            $('#region_statistics_content').show();
        },

        initCalendar: function () {
            if (!jQuery().fullCalendar) {
                return;
            }

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            var h = {};

            if ($('#calendar').width() <= 400) {
                $('#calendar').addClass("mobile");
                h = {
                    left: 'title, prev, next',
                    center: '',
                    right: 'today,month,agendaWeek,agendaDay'
                };
            } else {
                $('#calendar').removeClass("mobile");
                if (Metronic.isRTL()) {
                    h = {
                        right: 'title',
                        center: '',
                        left: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
                } else {
                    h = {
                        left: 'title',
                        center: '',
                        right: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
                }
            }



            $('#calendar').fullCalendar('destroy'); // destroy the calendar
            $('#calendar').fullCalendar({ //re-initialize the calendar
                disableDragging: false,
                header: h,
                editable: true,
                events: [{
                    title: 'All Day',
                    start: new Date(y, m, 1),
                    backgroundColor: Metronic.getBrandColor('yellow')
                }, {
                    title: 'Long Event',
                    start: new Date(y, m, d - 5),
                    end: new Date(y, m, d - 2),
                    backgroundColor: Metronic.getBrandColor('blue')
                }, {
                    title: 'Repeating Event',
                    start: new Date(y, m, d - 3, 16, 0),
                    allDay: false,
                    backgroundColor: Metronic.getBrandColor('red')
                }, {
                    title: 'Repeating Event',
                    start: new Date(y, m, d + 6, 16, 0),
                    allDay: false,
                    backgroundColor: Metronic.getBrandColor('green')
                }, {
                    title: 'Meeting',
                    start: new Date(y, m, d + 9, 10, 30),
                    allDay: false
                }, {
                    title: 'Lunch',
                    start: new Date(y, m, d, 14, 0),
                    end: new Date(y, m, d, 14, 0),
                    backgroundColor: Metronic.getBrandColor('grey'),
                    allDay: false
                }, {
                    title: 'Birthday',
                    start: new Date(y, m, d + 1, 19, 0),
                    end: new Date(y, m, d + 1, 22, 30),
                    backgroundColor: Metronic.getBrandColor('purple'),
                    allDay: false
                }, {
                    title: 'Click for Google',
                    start: new Date(y, m, 28),
                    end: new Date(y, m, 29),
                    backgroundColor: Metronic.getBrandColor('yellow'),
                    url: 'http://google.com/'
                }]
            });
        },

        initCharts: function () {
            if (!jQuery.plot) {
                return;
            }

            function showChartTooltip(x, y, xValue, yValue) {
                $('<div id="tooltip" class="chart-tooltip">' + yValue + '<\/div>').css({
                    position: 'absolute',
                    display: 'none',
                    top: y - 40,
                    left: x - 40,
                    border: '0px solid #ccc',
                    padding: '2px 6px',
                    'background-color': '#fff'
                }).appendTo("body").fadeIn(200);
            }

            var data = [];
            var totalPoints = 250;

            // random data generator for plot charts

            function getRandomData() {
                if (data.length > 0) data = data.slice(1);
                // do a random walk
                while (data.length < totalPoints) {
                    var prev = data.length > 0 ? data[data.length - 1] : 50;
                    var y = prev + Math.random() * 10 - 5;
                    if (y < 0) y = 0;
                    if (y > 100) y = 100;
                    data.push(y);
                }
                // zip the generated y values with the x values
                var res = [];
                for (var i = 0; i < data.length; ++i) res.push([i, data[i]])
                return res;
            }

            function randValue() {
                return (Math.floor(Math.random() * (1 + 50 - 20))) + 10;
            }

            var visitors = [
                ['02/2013', 1500],
                ['03/2013', 2500],
                ['04/2013', 1700],
                ['05/2013', 800],
                ['06/2013', 1500],
                ['07/2013', 2350],
                ['08/2013', 1500],
                ['09/2013', 1300],
                ['10/2013', 4600]
            ];


            if ($('#site_statistics').size() != 0) {

                $('#site_statistics_loading').hide();
                $('#site_statistics_content').show();

                var plot_statistics = $.plot($("#site_statistics"),
                    [{
                        data: visitors,
                        lines: {
                            fill: 0.6,
                            lineWidth: 0
                        },
                        color: ['#f89f9f']
                    }, {
                        data: visitors,
                        points: {
                            show: true,
                            fill: true,
                            radius: 5,
                            fillColor: "#f89f9f",
                            lineWidth: 3
                        },
                        color: '#fff',
                        shadowSize: 0
                    }],

                    {
                        xaxis: {
                            tickLength: 0,
                            tickDecimals: 0,
                            mode: "categories",
                            min: 0,
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        yaxis: {
                            ticks: 5,
                            tickDecimals: 0,
                            tickColor: "#eee",
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        grid: {
                            hoverable: true,
                            clickable: true,
                            tickColor: "#eee",
                            borderColor: "#eee",
                            borderWidth: 1
                        }
                    });

                var previousPoint = null;
                $("#site_statistics").bind("plothover", function (event, pos, item) {
                    $("#x").text(pos.x.toFixed(2));
                    $("#y").text(pos.y.toFixed(2));
                    if (item) {
                        if (previousPoint != item.dataIndex) {
                            previousPoint = item.dataIndex;

                            $("#tooltip").remove();
                            var x = item.datapoint[0].toFixed(2),
                                y = item.datapoint[1].toFixed(2);

                            showChartTooltip(item.pageX, item.pageY, item.datapoint[0], item.datapoint[1] + ' visits');
                        }
                    } else {
                        $("#tooltip").remove();
                        previousPoint = null;
                    }
                });
            }


            if ($('#site_activities').size() != 0) {
                //site activities
                var previousPoint2 = null;
                $('#site_activities_loading').hide();
                $('#site_activities_content').show();

                var data1 = [
                    ['DEC', 300],
                    ['JAN', 600],
                    ['FEB', 1100],
                    ['MAR', 1200],
                    ['APR', 860],
                    ['MAY', 1200],
                    ['JUN', 1450],
                    ['JUL', 1800],
                    ['AUG', 1200],
                    ['SEP', 600]
                ];


                var plot_statistics = $.plot($("#site_activities"),

                    [{
                        data: data1,
                        lines: {
                            fill: 0.2,
                            lineWidth: 0,
                        },
                        color: ['#BAD9F5']
                    }, {
                        data: data1,
                        points: {
                            show: true,
                            fill: true,
                            radius: 4,
                            fillColor: "#9ACAE6",
                            lineWidth: 2
                        },
                        color: '#9ACAE6',
                        shadowSize: 1
                    }, {
                        data: data1,
                        lines: {
                            show: true,
                            fill: false,
                            lineWidth: 3
                        },
                        color: '#9ACAE6',
                        shadowSize: 0
                    }],

                    {

                        xaxis: {
                            tickLength: 0,
                            tickDecimals: 0,
                            mode: "categories",
                            min: 0,
                            font: {
                                lineHeight: 18,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        yaxis: {
                            ticks: 5,
                            tickDecimals: 0,
                            tickColor: "#eee",
                            font: {
                                lineHeight: 14,
                                style: "normal",
                                variant: "small-caps",
                                color: "#6F7B8A"
                            }
                        },
                        grid: {
                            hoverable: true,
                            clickable: true,
                            tickColor: "#eee",
                            borderColor: "#eee",
                            borderWidth: 1
                        }
                    });

                $("#site_activities").bind("plothover", function (event, pos, item) {
                    $("#x").text(pos.x.toFixed(2));
                    $("#y").text(pos.y.toFixed(2));
                    if (item) {
                        if (previousPoint2 != item.dataIndex) {
                            previousPoint2 = item.dataIndex;
                            $("#tooltip").remove();
                            var x = item.datapoint[0].toFixed(2),
                                y = item.datapoint[1].toFixed(2);
                            showChartTooltip(item.pageX, item.pageY, item.datapoint[0], item.datapoint[1] + 'M$');
                        }
                    }
                });

                $('#site_activities').bind("mouseleave", function () {
                    $("#tooltip").remove();
                });
            }
        },

        initMiniCharts: function () {
            if (!jQuery().easyPieChart || !jQuery().sparkline) {
                return;
            }

            // IE8 Fix: function.bind polyfill
            if (Metronic.isIE8() && !Function.prototype.bind) {
                Function.prototype.bind = function (oThis) {
                    if (typeof this !== "function") {
                        // closest thing possible to the ECMAScript 5 internal IsCallable function
                        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                    }

                    var aArgs = Array.prototype.slice.call(arguments, 1),
                        fToBind = this,
                        fNOP = function () { },
                        fBound = function () {
                            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                        };

                    fNOP.prototype = this.prototype;
                    fBound.prototype = new fNOP();

                    return fBound;
                };
            }

            $('.easy-pie-chart .number.transactions').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: Metronic.getBrandColor('yellow')
            });

            $('.easy-pie-chart .number.visits').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: Metronic.getBrandColor('green')
            });

            $('.easy-pie-chart .number.bounce').easyPieChart({
                animate: 1000,
                size: 75,
                lineWidth: 3,
                barColor: Metronic.getBrandColor('red')
            });

            $('.easy-pie-chart-reload').click(function () {
                $('.easy-pie-chart .number').each(function () {
                    var newValue = Math.floor(100 * Math.random());
                    $(this).data('easyPieChart').update(newValue);
                    $('span', this).text(newValue);
                });
            });

            $("#sparkline_bar").sparkline([8, 9, 10, 11, 10, 10, 12, 10, 10, 11, 9, 12, 11, 10, 9, 11, 13, 13, 12], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#35aa47',
                negBarColor: '#e02222'
            });

            $("#sparkline_bar2").sparkline([9, 11, 12, 13, 12, 13, 10, 14, 13, 11, 11, 12, 11, 11, 10, 12, 11, 10], {
                type: 'bar',
                width: '100',
                barWidth: 5,
                height: '55',
                barColor: '#ffb848',
                negBarColor: '#e02222'
            });

            $("#sparkline_line").sparkline([9, 10, 9, 10, 10, 11, 12, 10, 10, 11, 11, 12, 11, 10, 12, 11, 10, 12], {
                type: 'line',
                width: '100',
                height: '55',
                lineColor: '#ffb848'
            });

        },

        initChat: function () {

            var cont = $('#chats');
            var list = $('.chats', cont);
            var form = $('.chat-form', cont);
            var input = $('input', form);
            var btn = $('.btn', form);

            var handleClick = function (e) {
                e.preventDefault();

                var text = input.val();
                if (text.length == 0) {
                    return;
                }

                var time = new Date();
                var time_str = (time.getHours() + ':' + time.getMinutes());
                var tpl = '';
                tpl += '<li class="out">';
                tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + 'avatar1.jpg"/>';
                tpl += '<div class="message">';
                tpl += '<span class="arrow"></span>';
                tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                tpl += '<span class="datetime">at ' + time_str + '</span>';
                tpl += '<span class="body">';
                tpl += text;
                tpl += '</span>';
                tpl += '</div>';
                tpl += '</li>';

                var msg = list.append(tpl);
                input.val("");

                var getLastPostPos = function () {
                    var height = 0;
                    cont.find("li.out, li.in").each(function () {
                        height = height + $(this).outerHeight();
                    });

                    return height;
                }

                cont.find('.scroller').slimScroll({
                    scrollTo: getLastPostPos()
                });
            }

            $('body').on('click', '.message .name', function (e) {
                e.preventDefault(); // prevent click event

                var name = $(this).text(); // get clicked user's full name
                input.val('@' + name + ':'); // set it into the input field
                Metronic.scrollTo(input); // scroll to input if needed
            });

            btn.click(handleClick);

            input.keypress(function (e) {
                if (e.which == 13) {
                    handleClick(e);
                    return false; //<---- Add this line
                }
            });
        },

        initDashboardDaterange: function () {

            if (!jQuery().daterangepicker) {
                return;
            }

            $('#dashboard-report-range').daterangepicker({
                opens: (Metronic.isRTL() ? 'right' : 'left'),
                startDate: moment().subtract('days', 29),
                endDate: moment(),
                minDate: '01/01/2012',
                maxDate: '12/31/2014',
                dateLimit: {
                    days: 60
                },
                showDropdowns: false,
                showWeekNumbers: true,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                    'Last 7 Days': [moment().subtract('days', 6), moment()],
                    'Last 30 Days': [moment().subtract('days', 29), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                },
                buttonClasses: ['btn btn-sm'],
                applyClass: ' blue',
                cancelClass: 'default',
                format: 'MM/DD/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Apply',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1
                }
            },
                function (start, end) {
                    $('#dashboard-report-range span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                }
            );


            $('#dashboard-report-range span').html(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
            $('#dashboard-report-range').show();
        }

    };

}();
var Tasks = function () {


    return {

        //main function to initiate the module
        initDashboardWidget: function () {
            $('.task-list input[type="checkbox"]').change(function () {
                if ($(this).is(':checked')) {
                    $(this).parents('li').addClass("task-done");
                } else {
                    $(this).parents('li').removeClass("task-done");
                }
            });
        }

    };

}();
/**
Todo Module
**/
var Todo = function () {

    // private functions & variables

    var _initComponents = function () {

        // init datepicker
        $('.todo-taskbody-due').datepicker({
            rtl: Metronic.isRTL(),
            orientation: "left",
            autoclose: true
        });

        // init tags        
        //$(".todo-taskbody-tags").select2({
        //    tags: ["Testing", "Important", "Info", "Pending", "Completed", "Requested", "Approved"]
        //});
    }

    var _handleProjectListMenu = function () {
        if (Metronic.getViewPort().width <= 992) {
            $('.todo-project-list-content').addClass("collapse");
        } else {
            $('.todo-project-list-content').removeClass("collapse").css("height", "auto");
        }
    }

    // public functions
    return {

        //main function
        init: function () {
            _initComponents();
            _handleProjectListMenu();

            Metronic.addResizeHandler(function () {
                _handleProjectListMenu();
            });
        }

    };

}();

/*!
 * Select2 4.0.3
 * https://select2.github.io
 *
 * Released under the MIT license
 * https://github.com/select2/select2/blob/master/LICENSE.md
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function (jQuery) {
    // This is needed so we can catch the AMD loader configuration and use it
    // The inner file should be wrapped (by `banner.start.js`) in a function that
    // returns the AMD loader references.
    var S2 =
  (function () {
      // Restore the Select2 AMD loader so it can be used
      // Needed mostly in the language files, where the loader is not inserted
      if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
          var S2 = jQuery.fn.select2.amd;
      }
      var S2; (function () {
          if (!S2 || !S2.requirejs) {
              if (!S2) { S2 = {}; } else { require = S2; }
              /**
               * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
               * Available via the MIT or new BSD license.
               * see: http://github.com/jrburke/almond for details
               */
              //Going sloppy to avoid 'use strict' string cost, but strict practices should
              //be followed.
              /*jslint sloppy: true */
              /*global setTimeout: false */

              var requirejs, require, define;
              (function (undef) {
                  var main, req, makeMap, handlers,
                      defined = {},
                      waiting = {},
                      config = {},
                      defining = {},
                      hasOwn = Object.prototype.hasOwnProperty,
                      aps = [].slice,
                      jsSuffixRegExp = /\.js$/;

                  function hasProp(obj, prop) {
                      return hasOwn.call(obj, prop);
                  }

                  /**
                   * Given a relative module name, like ./something, normalize it to
                   * a real name that can be mapped to a path.
                   * @param {String} name the relative name
                   * @param {String} baseName a real name that the name arg is relative
                   * to.
                   * @returns {String} normalized name
                   */
                  function normalize(name, baseName) {
                      var nameParts, nameSegment, mapValue, foundMap, lastIndex,
                          foundI, foundStarMap, starI, i, j, part,
                          baseParts = baseName && baseName.split("/"),
                          map = config.map,
                          starMap = (map && map['*']) || {};

                      //Adjust any relative paths.
                      if (name && name.charAt(0) === ".") {
                          //If have a base name, try to normalize against it,
                          //otherwise, assume it is a top-level require that will
                          //be relative to baseUrl in the end.
                          if (baseName) {
                              name = name.split('/');
                              lastIndex = name.length - 1;

                              // Node .js allowance:
                              if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                                  name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                              }

                              //Lop off the last part of baseParts, so that . matches the
                              //"directory" and not name of the baseName's module. For instance,
                              //baseName of "one/two/three", maps to "one/two/three.js", but we
                              //want the directory, "one/two" for this normalization.
                              name = baseParts.slice(0, baseParts.length - 1).concat(name);

                              //start trimDots
                              for (i = 0; i < name.length; i += 1) {
                                  part = name[i];
                                  if (part === ".") {
                                      name.splice(i, 1);
                                      i -= 1;
                                  } else if (part === "..") {
                                      if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                                          //End of the line. Keep at least one non-dot
                                          //path segment at the front so it can be mapped
                                          //correctly to disk. Otherwise, there is likely
                                          //no path mapping for a path starting with '..'.
                                          //This can still fail, but catches the most reasonable
                                          //uses of ..
                                          break;
                                      } else if (i > 0) {
                                          name.splice(i - 1, 2);
                                          i -= 2;
                                      }
                                  }
                              }
                              //end trimDots

                              name = name.join("/");
                          } else if (name.indexOf('./') === 0) {
                              // No baseName, so this is ID is resolved relative
                              // to baseUrl, pull off the leading dot.
                              name = name.substring(2);
                          }
                      }

                      //Apply map config if available.
                      if ((baseParts || starMap) && map) {
                          nameParts = name.split('/');

                          for (i = nameParts.length; i > 0; i -= 1) {
                              nameSegment = nameParts.slice(0, i).join("/");

                              if (baseParts) {
                                  //Find the longest baseName segment match in the config.
                                  //So, do joins on the biggest to smallest lengths of baseParts.
                                  for (j = baseParts.length; j > 0; j -= 1) {
                                      mapValue = map[baseParts.slice(0, j).join('/')];

                                      //baseName segment has  config, find if it has one for
                                      //this name.
                                      if (mapValue) {
                                          mapValue = mapValue[nameSegment];
                                          if (mapValue) {
                                              //Match, update name to the new value.
                                              foundMap = mapValue;
                                              foundI = i;
                                              break;
                                          }
                                      }
                                  }
                              }

                              if (foundMap) {
                                  break;
                              }

                              //Check for a star map match, but just hold on to it,
                              //if there is a shorter segment match later in a matching
                              //config, then favor over this star map.
                              if (!foundStarMap && starMap && starMap[nameSegment]) {
                                  foundStarMap = starMap[nameSegment];
                                  starI = i;
                              }
                          }

                          if (!foundMap && foundStarMap) {
                              foundMap = foundStarMap;
                              foundI = starI;
                          }

                          if (foundMap) {
                              nameParts.splice(0, foundI, foundMap);
                              name = nameParts.join('/');
                          }
                      }

                      return name;
                  }

                  function makeRequire(relName, forceSync) {
                      return function () {
                          //A version of a require function that passes a moduleName
                          //value for items that may need to
                          //look up paths relative to the moduleName
                          var args = aps.call(arguments, 0);

                          //If first arg is not require('string'), and there is only
                          //one arg, it is the array form without a callback. Insert
                          //a null so that the following concat is correct.
                          if (typeof args[0] !== 'string' && args.length === 1) {
                              args.push(null);
                          }
                          return req.apply(undef, args.concat([relName, forceSync]));
                      };
                  }

                  function makeNormalize(relName) {
                      return function (name) {
                          return normalize(name, relName);
                      };
                  }

                  function makeLoad(depName) {
                      return function (value) {
                          defined[depName] = value;
                      };
                  }

                  function callDep(name) {
                      if (hasProp(waiting, name)) {
                          var args = waiting[name];
                          delete waiting[name];
                          defining[name] = true;
                          main.apply(undef, args);
                      }

                      if (!hasProp(defined, name) && !hasProp(defining, name)) {
                          throw new Error('No ' + name);
                      }
                      return defined[name];
                  }

                  //Turns a plugin!resource to [plugin, resource]
                  //with the plugin being undefined if the name
                  //did not have a plugin prefix.
                  function splitPrefix(name) {
                      var prefix,
                          index = name ? name.indexOf('!') : -1;
                      if (index > -1) {
                          prefix = name.substring(0, index);
                          name = name.substring(index + 1, name.length);
                      }
                      return [prefix, name];
                  }

                  /**
                   * Makes a name map, normalizing the name, and using a plugin
                   * for normalization if necessary. Grabs a ref to plugin
                   * too, as an optimization.
                   */
                  makeMap = function (name, relName) {
                      var plugin,
                          parts = splitPrefix(name),
                          prefix = parts[0];

                      name = parts[1];

                      if (prefix) {
                          prefix = normalize(prefix, relName);
                          plugin = callDep(prefix);
                      }

                      //Normalize according
                      if (prefix) {
                          if (plugin && plugin.normalize) {
                              name = plugin.normalize(name, makeNormalize(relName));
                          } else {
                              name = normalize(name, relName);
                          }
                      } else {
                          name = normalize(name, relName);
                          parts = splitPrefix(name);
                          prefix = parts[0];
                          name = parts[1];
                          if (prefix) {
                              plugin = callDep(prefix);
                          }
                      }

                      //Using ridiculous property names for space reasons
                      return {
                          f: prefix ? prefix + '!' + name : name, //fullName
                          n: name,
                          pr: prefix,
                          p: plugin
                      };
                  };

                  function makeConfig(name) {
                      return function () {
                          return (config && config.config && config.config[name]) || {};
                      };
                  }

                  handlers = {
                      require: function (name) {
                          return makeRequire(name);
                      },
                      exports: function (name) {
                          var e = defined[name];
                          if (typeof e !== 'undefined') {
                              return e;
                          } else {
                              return (defined[name] = {});
                          }
                      },
                      module: function (name) {
                          return {
                              id: name,
                              uri: '',
                              exports: defined[name],
                              config: makeConfig(name)
                          };
                      }
                  };

                  main = function (name, deps, callback, relName) {
                      var cjsModule, depName, ret, map, i,
                          args = [],
                          callbackType = typeof callback,
                          usingExports;

                      //Use name if no relName
                      relName = relName || name;

                      //Call the callback to define the module, if necessary.
                      if (callbackType === 'undefined' || callbackType === 'function') {
                          //Pull out the defined dependencies and pass the ordered
                          //values to the callback.
                          //Default to [require, exports, module] if no deps
                          deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
                          for (i = 0; i < deps.length; i += 1) {
                              map = makeMap(deps[i], relName);
                              depName = map.f;

                              //Fast path CommonJS standard dependencies.
                              if (depName === "require") {
                                  args[i] = handlers.require(name);
                              } else if (depName === "exports") {
                                  //CommonJS module spec 1.1
                                  args[i] = handlers.exports(name);
                                  usingExports = true;
                              } else if (depName === "module") {
                                  //CommonJS module spec 1.1
                                  cjsModule = args[i] = handlers.module(name);
                              } else if (hasProp(defined, depName) ||
                                         hasProp(waiting, depName) ||
                                         hasProp(defining, depName)) {
                                  args[i] = callDep(depName);
                              } else if (map.p) {
                                  map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                                  args[i] = defined[depName];
                              } else {
                                  throw new Error(name + ' missing ' + depName);
                              }
                          }

                          ret = callback ? callback.apply(defined[name], args) : undefined;

                          if (name) {
                              //If setting exports via "module" is in play,
                              //favor that over return value and exports. After that,
                              //favor a non-undefined return value over exports use.
                              if (cjsModule && cjsModule.exports !== undef &&
                                      cjsModule.exports !== defined[name]) {
                                  defined[name] = cjsModule.exports;
                              } else if (ret !== undef || !usingExports) {
                                  //Use the return value from the function.
                                  defined[name] = ret;
                              }
                          }
                      } else if (name) {
                          //May just be an object definition for the module. Only
                          //worry about defining if have a module name.
                          defined[name] = callback;
                      }
                  };

                  requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
                      if (typeof deps === "string") {
                          if (handlers[deps]) {
                              //callback in this case is really relName
                              return handlers[deps](callback);
                          }
                          //Just return the module wanted. In this scenario, the
                          //deps arg is the module name, and second arg (if passed)
                          //is just the relName.
                          //Normalize module name, if it contains . or ..
                          return callDep(makeMap(deps, callback).f);
                      } else if (!deps.splice) {
                          //deps is a config object, not an array.
                          config = deps;
                          if (config.deps) {
                              req(config.deps, config.callback);
                          }
                          if (!callback) {
                              return;
                          }

                          if (callback.splice) {
                              //callback is an array, which means it is a dependency list.
                              //Adjust args if there are dependencies
                              deps = callback;
                              callback = relName;
                              relName = null;
                          } else {
                              deps = undef;
                          }
                      }

                      //Support require(['a'])
                      callback = callback || function () { };

                      //If relName is a function, it is an errback handler,
                      //so remove it.
                      if (typeof relName === 'function') {
                          relName = forceSync;
                          forceSync = alt;
                      }

                      //Simulate async callback;
                      if (forceSync) {
                          main(undef, deps, callback, relName);
                      } else {
                          //Using a non-zero value because of concern for what old browsers
                          //do, and latest browsers "upgrade" to 4 if lower value is used:
                          //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
                          //If want a value immediately, use require('id') instead -- something
                          //that works in almond on the global level, but not guaranteed and
                          //unlikely to work in other AMD implementations.
                          setTimeout(function () {
                              main(undef, deps, callback, relName);
                          }, 4);
                      }

                      return req;
                  };

                  /**
                   * Just drops the config on the floor, but returns req in case
                   * the config return value is used.
                   */
                  req.config = function (cfg) {
                      return req(cfg);
                  };

                  /**
                   * Expose module registry for debugging and tooling
                   */
                  requirejs._defined = defined;

                  define = function (name, deps, callback) {
                      if (typeof name !== 'string') {
                          throw new Error('See almond README: incorrect module build, no module name');
                      }

                      //This module may not have dependencies
                      if (!deps.splice) {
                          //deps is not an array, so probably means
                          //an object literal or factory function for
                          //the value. Adjust args.
                          callback = deps;
                          deps = [];
                      }

                      if (!hasProp(defined, name) && !hasProp(waiting, name)) {
                          waiting[name] = [name, deps, callback];
                      }
                  };

                  define.amd = {
                      jQuery: true
                  };
              }());

              S2.requirejs = requirejs; S2.require = require; S2.define = define;
          }
      }());
      S2.define("almond", function () { });

      /* global jQuery:false, $:false */
      S2.define('jquery', [], function () {
          var _$ = jQuery || $;

          if (_$ == null && console && console.error) {
              console.error(
                'Select2: An instance of jQuery or a jQuery-compatible library was not ' +
                'found. Make sure that you are including jQuery before Select2 on your ' +
                'web page.'
              );
          }

          return _$;
      });

      S2.define('select2/utils', [
        'jquery'
      ], function ($) {
          var Utils = {};

          Utils.Extend = function (ChildClass, SuperClass) {
              var __hasProp = {}.hasOwnProperty;

              function BaseConstructor() {
                  this.constructor = ChildClass;
              }

              for (var key in SuperClass) {
                  if (__hasProp.call(SuperClass, key)) {
                      ChildClass[key] = SuperClass[key];
                  }
              }

              BaseConstructor.prototype = SuperClass.prototype;
              ChildClass.prototype = new BaseConstructor();
              ChildClass.__super__ = SuperClass.prototype;

              return ChildClass;
          };

          function getMethods(theClass) {
              var proto = theClass.prototype;

              var methods = [];

              for (var methodName in proto) {
                  var m = proto[methodName];

                  if (typeof m !== 'function') {
                      continue;
                  }

                  if (methodName === 'constructor') {
                      continue;
                  }

                  methods.push(methodName);
              }

              return methods;
          }

          Utils.Decorate = function (SuperClass, DecoratorClass) {
              var decoratedMethods = getMethods(DecoratorClass);
              var superMethods = getMethods(SuperClass);

              function DecoratedClass() {
                  var unshift = Array.prototype.unshift;

                  var argCount = DecoratorClass.prototype.constructor.length;

                  var calledConstructor = SuperClass.prototype.constructor;

                  if (argCount > 0) {
                      unshift.call(arguments, SuperClass.prototype.constructor);

                      calledConstructor = DecoratorClass.prototype.constructor;
                  }

                  calledConstructor.apply(this, arguments);
              }

              DecoratorClass.displayName = SuperClass.displayName;

              function ctr() {
                  this.constructor = DecoratedClass;
              }

              DecoratedClass.prototype = new ctr();

              for (var m = 0; m < superMethods.length; m++) {
                  var superMethod = superMethods[m];

                  DecoratedClass.prototype[superMethod] =
                    SuperClass.prototype[superMethod];
              }

              var calledMethod = function (methodName) {
                  // Stub out the original method if it's not decorating an actual method
                  var originalMethod = function () { };

                  if (methodName in DecoratedClass.prototype) {
                      originalMethod = DecoratedClass.prototype[methodName];
                  }

                  var decoratedMethod = DecoratorClass.prototype[methodName];

                  return function () {
                      var unshift = Array.prototype.unshift;

                      unshift.call(arguments, originalMethod);

                      return decoratedMethod.apply(this, arguments);
                  };
              };

              for (var d = 0; d < decoratedMethods.length; d++) {
                  var decoratedMethod = decoratedMethods[d];

                  DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
              }

              return DecoratedClass;
          };

          var Observable = function () {
              this.listeners = {};
          };

          Observable.prototype.on = function (event, callback) {
              this.listeners = this.listeners || {};

              if (event in this.listeners) {
                  this.listeners[event].push(callback);
              } else {
                  this.listeners[event] = [callback];
              }
          };

          Observable.prototype.trigger = function (event) {
              var slice = Array.prototype.slice;
              var params = slice.call(arguments, 1);

              this.listeners = this.listeners || {};

              // Params should always come in as an array
              if (params == null) {
                  params = [];
              }

              // If there are no arguments to the event, use a temporary object
              if (params.length === 0) {
                  params.push({});
              }

              // Set the `_type` of the first object to the event
              params[0]._type = event;

              if (event in this.listeners) {
                  this.invoke(this.listeners[event], slice.call(arguments, 1));
              }

              if ('*' in this.listeners) {
                  this.invoke(this.listeners['*'], arguments);
              }
          };

          Observable.prototype.invoke = function (listeners, params) {
              for (var i = 0, len = listeners.length; i < len; i++) {
                  listeners[i].apply(this, params);
              }
          };

          Utils.Observable = Observable;

          Utils.generateChars = function (length) {
              var chars = '';

              for (var i = 0; i < length; i++) {
                  var randomChar = Math.floor(Math.random() * 36);
                  chars += randomChar.toString(36);
              }

              return chars;
          };

          Utils.bind = function (func, context) {
              return function () {
                  func.apply(context, arguments);
              };
          };

          Utils._convertData = function (data) {
              for (var originalKey in data) {
                  var keys = originalKey.split('-');

                  var dataLevel = data;

                  if (keys.length === 1) {
                      continue;
                  }

                  for (var k = 0; k < keys.length; k++) {
                      var key = keys[k];

                      // Lowercase the first letter
                      // By default, dash-separated becomes camelCase
                      key = key.substring(0, 1).toLowerCase() + key.substring(1);

                      if (!(key in dataLevel)) {
                          dataLevel[key] = {};
                      }

                      if (k == keys.length - 1) {
                          dataLevel[key] = data[originalKey];
                      }

                      dataLevel = dataLevel[key];
                  }

                  delete data[originalKey];
              }

              return data;
          };

          Utils.hasScroll = function (index, el) {
              // Adapted from the function created by @ShadowScripter
              // and adapted by @BillBarry on the Stack Exchange Code Review website.
              // The original code can be found at
              // http://codereview.stackexchange.com/q/13338
              // and was designed to be used with the Sizzle selector engine.

              var $el = $(el);
              var overflowX = el.style.overflowX;
              var overflowY = el.style.overflowY;

              //Check both x and y declarations
              if (overflowX === overflowY &&
                  (overflowY === 'hidden' || overflowY === 'visible')) {
                  return false;
              }

              if (overflowX === 'scroll' || overflowY === 'scroll') {
                  return true;
              }

              return ($el.innerHeight() < el.scrollHeight ||
                $el.innerWidth() < el.scrollWidth);
          };

          Utils.escapeMarkup = function (markup) {
              var replaceMap = {
                  '\\': '&#92;',
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  '\'': '&#39;',
                  '/': '&#47;'
              };

              // Do not try to escape the markup if it's not a string
              if (typeof markup !== 'string') {
                  return markup;
              }

              return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
                  return replaceMap[match];
              });
          };

          // Append an array of jQuery nodes to a given element.
          Utils.appendMany = function ($element, $nodes) {
              // jQuery 1.7.x does not support $.fn.append() with an array
              // Fall back to a jQuery object collection using $.fn.add()
              if ($.fn.jquery.substr(0, 3) === '1.7') {
                  var $jqNodes = $();

                  $.map($nodes, function (node) {
                      $jqNodes = $jqNodes.add(node);
                  });

                  $nodes = $jqNodes;
              }

              $element.append($nodes);
          };

          return Utils;
      });

      S2.define('select2/results', [
        'jquery',
        './utils'
      ], function ($, Utils) {
          function Results($element, options, dataAdapter) {
              this.$element = $element;
              this.data = dataAdapter;
              this.options = options;

              Results.__super__.constructor.call(this);
          }

          Utils.Extend(Results, Utils.Observable);

          Results.prototype.render = function () {
              var $results = $(
                '<ul class="select2-results__options" role="tree"></ul>'
              );

              if (this.options.get('multiple')) {
                  $results.attr('aria-multiselectable', 'true');
              }

              this.$results = $results;

              return $results;
          };

          Results.prototype.clear = function () {
              this.$results.empty();
          };

          Results.prototype.displayMessage = function (params) {
              var escapeMarkup = this.options.get('escapeMarkup');

              this.clear();
              this.hideLoading();

              var $message = $(
                '<li role="treeitem" aria-live="assertive"' +
                ' class="select2-results__option"></li>'
              );

              var message = this.options.get('translations').get(params.message);

              $message.append(
                escapeMarkup(
                  message(params.args)
                )
              );

              $message[0].className += ' select2-results__message';

              this.$results.append($message);
          };

          Results.prototype.hideMessages = function () {
              this.$results.find('.select2-results__message').remove();
          };

          Results.prototype.append = function (data) {
              this.hideLoading();

              var $options = [];

              if (data.results == null || data.results.length === 0) {
                  if (this.$results.children().length === 0) {
                      this.trigger('results:message', {
                          message: 'noResults'
                      });
                  }

                  return;
              }

              data.results = this.sort(data.results);

              for (var d = 0; d < data.results.length; d++) {
                  var item = data.results[d];

                  var $option = this.option(item);

                  $options.push($option);
              }

              this.$results.append($options);
          };

          Results.prototype.position = function ($results, $dropdown) {
              var $resultsContainer = $dropdown.find('.select2-results');
              $resultsContainer.append($results);
          };

          Results.prototype.sort = function (data) {
              var sorter = this.options.get('sorter');

              return sorter(data);
          };

          Results.prototype.highlightFirstItem = function () {
              var $options = this.$results
                .find('.select2-results__option[aria-selected]');

              var $selected = $options.filter('[aria-selected=true]');

              // Check if there are any selected options
              if ($selected.length > 0) {
                  // If there are selected options, highlight the first
                  $selected.first().trigger('mouseenter');
              } else {
                  // If there are no selected options, highlight the first option
                  // in the dropdown
                  $options.first().trigger('mouseenter');
              }

              this.ensureHighlightVisible();
          };

          Results.prototype.setClasses = function () {
              var self = this;

              this.data.current(function (selected) {
                  var selectedIds = $.map(selected, function (s) {
                      return s.id.toString();
                  });

                  var $options = self.$results
                    .find('.select2-results__option[aria-selected]');

                  $options.each(function () {
                      var $option = $(this);

                      var item = $.data(this, 'data');

                      // id needs to be converted to a string when comparing
                      var id = '' + item.id;

                      if ((item.element != null && item.element.selected) ||
                          (item.element == null && $.inArray(id, selectedIds) > -1)) {
                          $option.attr('aria-selected', 'true');
                      } else {
                          $option.attr('aria-selected', 'false');
                      }
                  });

              });
          };

          Results.prototype.showLoading = function (params) {
              this.hideLoading();

              var loadingMore = this.options.get('translations').get('searching');

              var loading = {
                  disabled: true,
                  loading: true,
                  text: loadingMore(params)
              };
              var $loading = this.option(loading);
              $loading.className += ' loading-results';

              this.$results.prepend($loading);
          };

          Results.prototype.hideLoading = function () {
              this.$results.find('.loading-results').remove();
          };

          Results.prototype.option = function (data) {
              var option = document.createElement('li');
              option.className = 'select2-results__option';

              var attrs = {
                  'role': 'treeitem',
                  'aria-selected': 'false'
              };

              if (data.disabled) {
                  delete attrs['aria-selected'];
                  attrs['aria-disabled'] = 'true';
              }

              if (data.id == null) {
                  delete attrs['aria-selected'];
              }

              if (data._resultId != null) {
                  option.id = data._resultId;
              }

              if (data.title) {
                  option.title = data.title;
              }

              if (data.children) {
                  attrs.role = 'group';
                  attrs['aria-label'] = data.text;
                  delete attrs['aria-selected'];
              }

              for (var attr in attrs) {
                  var val = attrs[attr];

                  option.setAttribute(attr, val);
              }

              if (data.children) {
                  var $option = $(option);

                  var label = document.createElement('strong');
                  label.className = 'select2-results__group';

                  var $label = $(label);
                  this.template(data, label);

                  var $children = [];

                  for (var c = 0; c < data.children.length; c++) {
                      var child = data.children[c];

                      var $child = this.option(child);

                      $children.push($child);
                  }

                  var $childrenContainer = $('<ul></ul>', {
                      'class': 'select2-results__options select2-results__options--nested'
                  });

                  $childrenContainer.append($children);

                  $option.append(label);
                  $option.append($childrenContainer);
              } else {
                  this.template(data, option);
              }

              $.data(option, 'data', data);

              return option;
          };

          Results.prototype.bind = function (container, $container) {
              var self = this;

              var id = container.id + '-results';

              this.$results.attr('id', id);

              container.on('results:all', function (params) {
                  self.clear();
                  self.append(params.data);

                  if (container.isOpen()) {
                      self.setClasses();
                      self.highlightFirstItem();
                  }
              });

              container.on('results:append', function (params) {
                  self.append(params.data);

                  if (container.isOpen()) {
                      self.setClasses();
                  }
              });

              container.on('query', function (params) {
                  self.hideMessages();
                  self.showLoading(params);
              });

              container.on('select', function () {
                  if (!container.isOpen()) {
                      return;
                  }

                  self.setClasses();
                  self.highlightFirstItem();
              });

              container.on('unselect', function () {
                  if (!container.isOpen()) {
                      return;
                  }

                  self.setClasses();
                  self.highlightFirstItem();
              });

              container.on('open', function () {
                  // When the dropdown is open, aria-expended="true"
                  self.$results.attr('aria-expanded', 'true');
                  self.$results.attr('aria-hidden', 'false');

                  self.setClasses();
                  self.ensureHighlightVisible();
              });

              container.on('close', function () {
                  // When the dropdown is closed, aria-expended="false"
                  self.$results.attr('aria-expanded', 'false');
                  self.$results.attr('aria-hidden', 'true');
                  self.$results.removeAttr('aria-activedescendant');
              });

              container.on('results:toggle', function () {
                  var $highlighted = self.getHighlightedResults();

                  if ($highlighted.length === 0) {
                      return;
                  }

                  $highlighted.trigger('mouseup');
              });

              container.on('results:select', function () {
                  var $highlighted = self.getHighlightedResults();

                  if ($highlighted.length === 0) {
                      return;
                  }

                  var data = $highlighted.data('data');

                  if ($highlighted.attr('aria-selected') == 'true') {
                      self.trigger('close', {});
                  } else {
                      self.trigger('select', {
                          data: data
                      });
                  }
              });

              container.on('results:previous', function () {
                  var $highlighted = self.getHighlightedResults();

                  var $options = self.$results.find('[aria-selected]');

                  var currentIndex = $options.index($highlighted);

                  // If we are already at te top, don't move further
                  if (currentIndex === 0) {
                      return;
                  }

                  var nextIndex = currentIndex - 1;

                  // If none are highlighted, highlight the first
                  if ($highlighted.length === 0) {
                      nextIndex = 0;
                  }

                  var $next = $options.eq(nextIndex);

                  $next.trigger('mouseenter');

                  var currentOffset = self.$results.offset().top;
                  var nextTop = $next.offset().top;
                  var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);

                  if (nextIndex === 0) {
                      self.$results.scrollTop(0);
                  } else if (nextTop - currentOffset < 0) {
                      self.$results.scrollTop(nextOffset);
                  }
              });

              container.on('results:next', function () {
                  var $highlighted = self.getHighlightedResults();

                  var $options = self.$results.find('[aria-selected]');

                  var currentIndex = $options.index($highlighted);

                  var nextIndex = currentIndex + 1;

                  // If we are at the last option, stay there
                  if (nextIndex >= $options.length) {
                      return;
                  }

                  var $next = $options.eq(nextIndex);

                  $next.trigger('mouseenter');

                  var currentOffset = self.$results.offset().top +
                    self.$results.outerHeight(false);
                  var nextBottom = $next.offset().top + $next.outerHeight(false);
                  var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;

                  if (nextIndex === 0) {
                      self.$results.scrollTop(0);
                  } else if (nextBottom > currentOffset) {
                      self.$results.scrollTop(nextOffset);
                  }
              });

              container.on('results:focus', function (params) {
                  params.element.addClass('select2-results__option--highlighted');
              });

              container.on('results:message', function (params) {
                  self.displayMessage(params);
              });

              if ($.fn.mousewheel) {
                  this.$results.on('mousewheel', function (e) {
                      var top = self.$results.scrollTop();

                      var bottom = self.$results.get(0).scrollHeight - top + e.deltaY;

                      var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
                      var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();

                      if (isAtTop) {
                          self.$results.scrollTop(0);

                          e.preventDefault();
                          e.stopPropagation();
                      } else if (isAtBottom) {
                          self.$results.scrollTop(
                            self.$results.get(0).scrollHeight - self.$results.height()
                          );

                          e.preventDefault();
                          e.stopPropagation();
                      }
                  });
              }

              this.$results.on('mouseup', '.select2-results__option[aria-selected]',
                function (evt) {
                    var $this = $(this);

                    var data = $this.data('data');

                    if ($this.attr('aria-selected') === 'true') {
                        if (self.options.get('multiple')) {
                            self.trigger('unselect', {
                                originalEvent: evt,
                                data: data
                            });
                        } else {
                            self.trigger('close', {});
                        }

                        return;
                    }

                    self.trigger('select', {
                        originalEvent: evt,
                        data: data
                    });
                });

              this.$results.on('mouseenter', '.select2-results__option[aria-selected]',
                function (evt) {
                    var data = $(this).data('data');

                    self.getHighlightedResults()
                        .removeClass('select2-results__option--highlighted');

                    self.trigger('results:focus', {
                        data: data,
                        element: $(this)
                    });
                });
          };

          Results.prototype.getHighlightedResults = function () {
              var $highlighted = this.$results
              .find('.select2-results__option--highlighted');

              return $highlighted;
          };

          Results.prototype.destroy = function () {
              this.$results.remove();
          };

          Results.prototype.ensureHighlightVisible = function () {
              var $highlighted = this.getHighlightedResults();

              if ($highlighted.length === 0) {
                  return;
              }

              var $options = this.$results.find('[aria-selected]');

              var currentIndex = $options.index($highlighted);

              var currentOffset = this.$results.offset().top;
              var nextTop = $highlighted.offset().top;
              var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);

              var offsetDelta = nextTop - currentOffset;
              nextOffset -= $highlighted.outerHeight(false) * 2;

              if (currentIndex <= 2) {
                  this.$results.scrollTop(0);
              } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
                  this.$results.scrollTop(nextOffset);
              }
          };

          Results.prototype.template = function (result, container) {
              var template = this.options.get('templateResult');
              var escapeMarkup = this.options.get('escapeMarkup');

              var content = template(result, container);

              if (content == null) {
                  container.style.display = 'none';
              } else if (typeof content === 'string') {
                  container.innerHTML = escapeMarkup(content);
              } else {
                  $(container).append(content);
              }
          };

          return Results;
      });

      S2.define('select2/keys', [

      ], function () {
          var KEYS = {
              BACKSPACE: 8,
              TAB: 9,
              ENTER: 13,
              SHIFT: 16,
              CTRL: 17,
              ALT: 18,
              ESC: 27,
              SPACE: 32,
              PAGE_UP: 33,
              PAGE_DOWN: 34,
              END: 35,
              HOME: 36,
              LEFT: 37,
              UP: 38,
              RIGHT: 39,
              DOWN: 40,
              DELETE: 46
          };

          return KEYS;
      });

      S2.define('select2/selection/base', [
        'jquery',
        '../utils',
        '../keys'
      ], function ($, Utils, KEYS) {
          function BaseSelection($element, options) {
              this.$element = $element;
              this.options = options;

              BaseSelection.__super__.constructor.call(this);
          }

          Utils.Extend(BaseSelection, Utils.Observable);

          BaseSelection.prototype.render = function () {
              var $selection = $(
                '<span class="select2-selection" role="combobox" ' +
                ' aria-haspopup="true" aria-expanded="false">' +
                '</span>'
              );

              this._tabindex = 0;

              if (this.$element.data('old-tabindex') != null) {
                  this._tabindex = this.$element.data('old-tabindex');
              } else if (this.$element.attr('tabindex') != null) {
                  this._tabindex = this.$element.attr('tabindex');
              }

              $selection.attr('title', this.$element.attr('title'));
              $selection.attr('tabindex', this._tabindex);

              this.$selection = $selection;

              return $selection;
          };

          BaseSelection.prototype.bind = function (container, $container) {
              var self = this;

              var id = container.id + '-container';
              var resultsId = container.id + '-results';

              this.container = container;

              this.$selection.on('focus', function (evt) {
                  self.trigger('focus', evt);
              });

              this.$selection.on('blur', function (evt) {
                  self._handleBlur(evt);
              });

              this.$selection.on('keydown', function (evt) {
                  self.trigger('keypress', evt);

                  if (evt.which === KEYS.SPACE) {
                      evt.preventDefault();
                  }
              });

              container.on('results:focus', function (params) {
                  self.$selection.attr('aria-activedescendant', params.data._resultId);
              });

              container.on('selection:update', function (params) {
                  self.update(params.data);
              });

              container.on('open', function () {
                  // When the dropdown is open, aria-expanded="true"
                  self.$selection.attr('aria-expanded', 'true');
                  self.$selection.attr('aria-owns', resultsId);

                  self._attachCloseHandler(container);
              });

              container.on('close', function () {
                  // When the dropdown is closed, aria-expanded="false"
                  self.$selection.attr('aria-expanded', 'false');
                  self.$selection.removeAttr('aria-activedescendant');
                  self.$selection.removeAttr('aria-owns');

                  self.$selection.focus();

                  self._detachCloseHandler(container);
              });

              container.on('enable', function () {
                  self.$selection.attr('tabindex', self._tabindex);
              });

              container.on('disable', function () {
                  self.$selection.attr('tabindex', '-1');
              });
          };

          BaseSelection.prototype._handleBlur = function (evt) {
              var self = this;

              // This needs to be delayed as the active element is the body when the tab
              // key is pressed, possibly along with others.
              window.setTimeout(function () {
                  // Don't trigger `blur` if the focus is still in the selection
                  if (
                    (document.activeElement == self.$selection[0]) ||
                    ($.contains(self.$selection[0], document.activeElement))
                  ) {
                      return;
                  }

                  self.trigger('blur', evt);
              }, 1);
          };

          BaseSelection.prototype._attachCloseHandler = function (container) {
              var self = this;

              $(document.body).on('mousedown.select2.' + container.id, function (e) {
                  var $target = $(e.target);

                  var $select = $target.closest('.select2');

                  var $all = $('.select2.select2-container--open');

                  $all.each(function () {
                      var $this = $(this);

                      if (this == $select[0]) {
                          return;
                      }

                      var $element = $this.data('element');

                      $element.select2('close');
                  });
              });
          };

          BaseSelection.prototype._detachCloseHandler = function (container) {
              $(document.body).off('mousedown.select2.' + container.id);
          };

          BaseSelection.prototype.position = function ($selection, $container) {
              var $selectionContainer = $container.find('.selection');
              $selectionContainer.append($selection);
          };

          BaseSelection.prototype.destroy = function () {
              this._detachCloseHandler(this.container);
          };

          BaseSelection.prototype.update = function (data) {
              throw new Error('The `update` method must be defined in child classes.');
          };

          return BaseSelection;
      });

      S2.define('select2/selection/single', [
        'jquery',
        './base',
        '../utils',
        '../keys'
      ], function ($, BaseSelection, Utils, KEYS) {
          function SingleSelection() {
              SingleSelection.__super__.constructor.apply(this, arguments);
          }

          Utils.Extend(SingleSelection, BaseSelection);

          SingleSelection.prototype.render = function () {
              var $selection = SingleSelection.__super__.render.call(this);

              $selection.addClass('select2-selection--single');

              $selection.html(
                '<span class="select2-selection__rendered"></span>' +
                '<span class="select2-selection__arrow" role="presentation">' +
                  '<b role="presentation"></b>' +
                '</span>'
              );

              return $selection;
          };

          SingleSelection.prototype.bind = function (container, $container) {
              var self = this;

              SingleSelection.__super__.bind.apply(this, arguments);

              var id = container.id + '-container';

              this.$selection.find('.select2-selection__rendered').attr('id', id);
              this.$selection.attr('aria-labelledby', id);

              this.$selection.on('mousedown', function (evt) {
                  // Only respond to left clicks
                  if (evt.which !== 1) {
                      return;
                  }

                  self.trigger('toggle', {
                      originalEvent: evt
                  });
              });

              this.$selection.on('focus', function (evt) {
                  // User focuses on the container
              });

              this.$selection.on('blur', function (evt) {
                  // User exits the container
              });

              container.on('focus', function (evt) {
                  if (!container.isOpen()) {
                      self.$selection.focus();
                  }
              });

              container.on('selection:update', function (params) {
                  self.update(params.data);
              });
          };

          SingleSelection.prototype.clear = function () {
              this.$selection.find('.select2-selection__rendered').empty();
          };

          SingleSelection.prototype.display = function (data, container) {
              var template = this.options.get('templateSelection');
              var escapeMarkup = this.options.get('escapeMarkup');

              return escapeMarkup(template(data, container));
          };

          SingleSelection.prototype.selectionContainer = function () {
              return $('<span></span>');
          };

          SingleSelection.prototype.update = function (data) {
              if (data.length === 0) {
                  this.clear();
                  return;
              }

              var selection = data[0];

              var $rendered = this.$selection.find('.select2-selection__rendered');
              var formatted = this.display(selection, $rendered);

              $rendered.empty().append(formatted);
              $rendered.prop('title', selection.title || selection.text);
          };

          return SingleSelection;
      });

      S2.define('select2/selection/multiple', [
        'jquery',
        './base',
        '../utils'
      ], function ($, BaseSelection, Utils) {
          function MultipleSelection($element, options) {
              MultipleSelection.__super__.constructor.apply(this, arguments);
          }

          Utils.Extend(MultipleSelection, BaseSelection);

          MultipleSelection.prototype.render = function () {
              var $selection = MultipleSelection.__super__.render.call(this);

              $selection.addClass('select2-selection--multiple');

              $selection.html(
                '<ul class="select2-selection__rendered"></ul>'
              );

              return $selection;
          };

          MultipleSelection.prototype.bind = function (container, $container) {
              var self = this;

              MultipleSelection.__super__.bind.apply(this, arguments);

              this.$selection.on('click', function (evt) {
                  self.trigger('toggle', {
                      originalEvent: evt
                  });
              });

              this.$selection.on(
                'click',
                '.select2-selection__choice__remove',
                function (evt) {
                    // Ignore the event if it is disabled
                    if (self.options.get('disabled')) {
                        return;
                    }

                    var $remove = $(this);
                    var $selection = $remove.parent();

                    var data = $selection.data('data');

                    self.trigger('unselect', {
                        originalEvent: evt,
                        data: data
                    });
                }
              );
          };

          MultipleSelection.prototype.clear = function () {
              this.$selection.find('.select2-selection__rendered').empty();
          };

          MultipleSelection.prototype.display = function (data, container) {
              var template = this.options.get('templateSelection');
              var escapeMarkup = this.options.get('escapeMarkup');

              return escapeMarkup(template(data, container));
          };

          MultipleSelection.prototype.selectionContainer = function () {
              var $container = $(
                '<li class="select2-selection__choice">' +
                  '<span class="select2-selection__choice__remove" role="presentation">' +
                    '&times;' +
                  '</span>' +
                '</li>'
              );

              return $container;
          };

          MultipleSelection.prototype.update = function (data) {
              this.clear();

              if (data.length === 0) {
                  return;
              }

              var $selections = [];

              for (var d = 0; d < data.length; d++) {
                  var selection = data[d];

                  var $selection = this.selectionContainer();
                  var formatted = this.display(selection, $selection);

                  $selection.append(formatted);
                  $selection.prop('title', selection.title || selection.text);

                  $selection.data('data', selection);

                  $selections.push($selection);
              }

              var $rendered = this.$selection.find('.select2-selection__rendered');

              Utils.appendMany($rendered, $selections);
          };

          return MultipleSelection;
      });

      S2.define('select2/selection/placeholder', [
        '../utils'
      ], function (Utils) {
          function Placeholder(decorated, $element, options) {
              this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

              decorated.call(this, $element, options);
          }

          Placeholder.prototype.normalizePlaceholder = function (_, placeholder) {
              if (typeof placeholder === 'string') {
                  placeholder = {
                      id: '',
                      text: placeholder
                  };
              }

              return placeholder;
          };

          Placeholder.prototype.createPlaceholder = function (decorated, placeholder) {
              var $placeholder = this.selectionContainer();

              $placeholder.html(this.display(placeholder));
              $placeholder.addClass('select2-selection__placeholder')
                          .removeClass('select2-selection__choice');

              return $placeholder;
          };

          Placeholder.prototype.update = function (decorated, data) {
              var singlePlaceholder = (
                data.length == 1 && data[0].id != this.placeholder.id
              );
              var multipleSelections = data.length > 1;

              if (multipleSelections || singlePlaceholder) {
                  return decorated.call(this, data);
              }

              this.clear();

              var $placeholder = this.createPlaceholder(this.placeholder);

              this.$selection.find('.select2-selection__rendered').append($placeholder);
          };

          return Placeholder;
      });

      S2.define('select2/selection/allowClear', [
        'jquery',
        '../keys'
      ], function ($, KEYS) {
          function AllowClear() { }

          AllowClear.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              if (this.placeholder == null) {
                  if (this.options.get('debug') && window.console && console.error) {
                      console.error(
                        'Select2: The `allowClear` option should be used in combination ' +
                        'with the `placeholder` option.'
                      );
                  }
              }

              this.$selection.on('mousedown', '.select2-selection__clear',
                function (evt) {
                    self._handleClear(evt);
                });

              container.on('keypress', function (evt) {
                  self._handleKeyboardClear(evt, container);
              });
          };

          AllowClear.prototype._handleClear = function (_, evt) {
              // Ignore the event if it is disabled
              if (this.options.get('disabled')) {
                  return;
              }

              var $clear = this.$selection.find('.select2-selection__clear');

              // Ignore the event if nothing has been selected
              if ($clear.length === 0) {
                  return;
              }

              evt.stopPropagation();

              var data = $clear.data('data');

              for (var d = 0; d < data.length; d++) {
                  var unselectData = {
                      data: data[d]
                  };

                  // Trigger the `unselect` event, so people can prevent it from being
                  // cleared.
                  this.trigger('unselect', unselectData);

                  // If the event was prevented, don't clear it out.
                  if (unselectData.prevented) {
                      return;
                  }
              }

              this.$element.val(this.placeholder.id).trigger('change');

              this.trigger('toggle', {});
          };

          AllowClear.prototype._handleKeyboardClear = function (_, evt, container) {
              if (container.isOpen()) {
                  return;
              }

              if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
                  this._handleClear(evt);
              }
          };

          AllowClear.prototype.update = function (decorated, data) {
              decorated.call(this, data);

              if (this.$selection.find('.select2-selection__placeholder').length > 0 ||
                  data.length === 0) {
                  return;
              }

              var $remove = $(
                '<span class="select2-selection__clear">' +
                  '&times;' +
                '</span>'
              );
              $remove.data('data', data);

              this.$selection.find('.select2-selection__rendered').prepend($remove);
          };

          return AllowClear;
      });

      S2.define('select2/selection/search', [
        'jquery',
        '../utils',
        '../keys'
      ], function ($, Utils, KEYS) {
          function Search(decorated, $element, options) {
              decorated.call(this, $element, options);
          }

          Search.prototype.render = function (decorated) {
              var $search = $(
                '<li class="select2-search select2-search--inline">' +
                  '<input class="select2-search__field" type="search" tabindex="-1"' +
                  ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
                  ' spellcheck="false" role="textbox" aria-autocomplete="list" />' +
                '</li>'
              );

              this.$searchContainer = $search;
              this.$search = $search.find('input');

              var $rendered = decorated.call(this);

              this._transferTabIndex();

              return $rendered;
          };

          Search.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              container.on('open', function () {
                  self.$search.trigger('focus');
              });

              container.on('close', function () {
                  self.$search.val('');
                  self.$search.removeAttr('aria-activedescendant');
                  self.$search.trigger('focus');
              });

              container.on('enable', function () {
                  self.$search.prop('disabled', false);

                  self._transferTabIndex();
              });

              container.on('disable', function () {
                  self.$search.prop('disabled', true);
              });

              container.on('focus', function (evt) {
                  self.$search.trigger('focus');
              });

              container.on('results:focus', function (params) {
                  self.$search.attr('aria-activedescendant', params.id);
              });

              this.$selection.on('focusin', '.select2-search--inline', function (evt) {
                  self.trigger('focus', evt);
              });

              this.$selection.on('focusout', '.select2-search--inline', function (evt) {
                  self._handleBlur(evt);
              });

              this.$selection.on('keydown', '.select2-search--inline', function (evt) {
                  evt.stopPropagation();

                  self.trigger('keypress', evt);

                  self._keyUpPrevented = evt.isDefaultPrevented();

                  var key = evt.which;

                  if (key === KEYS.BACKSPACE && self.$search.val() === '') {
                      var $previousChoice = self.$searchContainer
                        .prev('.select2-selection__choice');

                      if ($previousChoice.length > 0) {
                          var item = $previousChoice.data('data');

                          self.searchRemoveChoice(item);

                          evt.preventDefault();
                      }
                  }
              });

              // Try to detect the IE version should the `documentMode` property that
              // is stored on the document. This is only implemented in IE and is
              // slightly cleaner than doing a user agent check.
              // This property is not available in Edge, but Edge also doesn't have
              // this bug.
              var msie = document.documentMode;
              var disableInputEvents = msie && msie <= 11;

              // Workaround for browsers which do not support the `input` event
              // This will prevent double-triggering of events for browsers which support
              // both the `keyup` and `input` events.
              this.$selection.on(
                'input.searchcheck',
                '.select2-search--inline',
                function (evt) {
                    // IE will trigger the `input` event when a placeholder is used on a
                    // search box. To get around this issue, we are forced to ignore all
                    // `input` events in IE and keep using `keyup`.
                    if (disableInputEvents) {
                        self.$selection.off('input.search input.searchcheck');
                        return;
                    }

                    // Unbind the duplicated `keyup` event
                    self.$selection.off('keyup.search');
                }
              );

              this.$selection.on(
                'keyup.search input.search',
                '.select2-search--inline',
                function (evt) {
                    // IE will trigger the `input` event when a placeholder is used on a
                    // search box. To get around this issue, we are forced to ignore all
                    // `input` events in IE and keep using `keyup`.
                    if (disableInputEvents && evt.type === 'input') {
                        self.$selection.off('input.search input.searchcheck');
                        return;
                    }

                    var key = evt.which;

                    // We can freely ignore events from modifier keys
                    if (key == KEYS.SHIFT || key == KEYS.CTRL || key == KEYS.ALT) {
                        return;
                    }

                    // Tabbing will be handled during the `keydown` phase
                    if (key == KEYS.TAB) {
                        return;
                    }

                    self.handleSearch(evt);
                }
              );
          };

          /**
           * This method will transfer the tabindex attribute from the rendered
           * selection to the search box. This allows for the search box to be used as
           * the primary focus instead of the selection container.
           *
           * @private
           */
          Search.prototype._transferTabIndex = function (decorated) {
              this.$search.attr('tabindex', this.$selection.attr('tabindex'));
              this.$selection.attr('tabindex', '-1');
          };

          Search.prototype.createPlaceholder = function (decorated, placeholder) {
              this.$search.attr('placeholder', placeholder.text);
          };

          Search.prototype.update = function (decorated, data) {
              var searchHadFocus = this.$search[0] == document.activeElement;

              this.$search.attr('placeholder', '');

              decorated.call(this, data);

              this.$selection.find('.select2-selection__rendered')
                             .append(this.$searchContainer);

              this.resizeSearch();
              if (searchHadFocus) {
                  this.$search.focus();
              }
          };

          Search.prototype.handleSearch = function () {
              this.resizeSearch();

              if (!this._keyUpPrevented) {
                  var input = this.$search.val();

                  this.trigger('query', {
                      term: input
                  });
              }

              this._keyUpPrevented = false;
          };

          Search.prototype.searchRemoveChoice = function (decorated, item) {
              this.trigger('unselect', {
                  data: item
              });

              this.$search.val(item.text);
              this.handleSearch();
          };

          Search.prototype.resizeSearch = function () {
              this.$search.css('width', '25px');

              var width = '';

              if (this.$search.attr('placeholder') !== '') {
                  width = this.$selection.find('.select2-selection__rendered').innerWidth();
              } else {
                  var minimumWidth = this.$search.val().length + 1;

                  width = (minimumWidth * 0.75) + 'em';
              }

              this.$search.css('width', width);
          };

          return Search;
      });

      S2.define('select2/selection/eventRelay', [
        'jquery'
      ], function ($) {
          function EventRelay() { }

          EventRelay.prototype.bind = function (decorated, container, $container) {
              var self = this;
              var relayEvents = [
                'open', 'opening',
                'close', 'closing',
                'select', 'selecting',
                'unselect', 'unselecting'
              ];

              var preventableEvents = ['opening', 'closing', 'selecting', 'unselecting'];

              decorated.call(this, container, $container);

              container.on('*', function (name, params) {
                  // Ignore events that should not be relayed
                  if ($.inArray(name, relayEvents) === -1) {
                      return;
                  }

                  // The parameters should always be an object
                  params = params || {};

                  // Generate the jQuery event for the Select2 event
                  var evt = $.Event('select2:' + name, {
                      params: params
                  });

                  self.$element.trigger(evt);

                  // Only handle preventable events if it was one
                  if ($.inArray(name, preventableEvents) === -1) {
                      return;
                  }

                  params.prevented = evt.isDefaultPrevented();
              });
          };

          return EventRelay;
      });

      S2.define('select2/translation', [
        'jquery',
        'require'
      ], function ($, require) {
          function Translation(dict) {
              this.dict = dict || {};
          }

          Translation.prototype.all = function () {
              return this.dict;
          };

          Translation.prototype.get = function (key) {
              return this.dict[key];
          };

          Translation.prototype.extend = function (translation) {
              this.dict = $.extend({}, translation.all(), this.dict);
          };

          // Static functions

          Translation._cache = {};

          Translation.loadPath = function (path) {
              if (!(path in Translation._cache)) {
                  var translations = require(path);

                  Translation._cache[path] = translations;
              }

              return new Translation(Translation._cache[path]);
          };

          return Translation;
      });

      S2.define('select2/diacritics', [

      ], function () {
          var diacritics = {
              '\u24B6': 'A',
              '\uFF21': 'A',
              '\u00C0': 'A',
              '\u00C1': 'A',
              '\u00C2': 'A',
              '\u1EA6': 'A',
              '\u1EA4': 'A',
              '\u1EAA': 'A',
              '\u1EA8': 'A',
              '\u00C3': 'A',
              '\u0100': 'A',
              '\u0102': 'A',
              '\u1EB0': 'A',
              '\u1EAE': 'A',
              '\u1EB4': 'A',
              '\u1EB2': 'A',
              '\u0226': 'A',
              '\u01E0': 'A',
              '\u00C4': 'A',
              '\u01DE': 'A',
              '\u1EA2': 'A',
              '\u00C5': 'A',
              '\u01FA': 'A',
              '\u01CD': 'A',
              '\u0200': 'A',
              '\u0202': 'A',
              '\u1EA0': 'A',
              '\u1EAC': 'A',
              '\u1EB6': 'A',
              '\u1E00': 'A',
              '\u0104': 'A',
              '\u023A': 'A',
              '\u2C6F': 'A',
              '\uA732': 'AA',
              '\u00C6': 'AE',
              '\u01FC': 'AE',
              '\u01E2': 'AE',
              '\uA734': 'AO',
              '\uA736': 'AU',
              '\uA738': 'AV',
              '\uA73A': 'AV',
              '\uA73C': 'AY',
              '\u24B7': 'B',
              '\uFF22': 'B',
              '\u1E02': 'B',
              '\u1E04': 'B',
              '\u1E06': 'B',
              '\u0243': 'B',
              '\u0182': 'B',
              '\u0181': 'B',
              '\u24B8': 'C',
              '\uFF23': 'C',
              '\u0106': 'C',
              '\u0108': 'C',
              '\u010A': 'C',
              '\u010C': 'C',
              '\u00C7': 'C',
              '\u1E08': 'C',
              '\u0187': 'C',
              '\u023B': 'C',
              '\uA73E': 'C',
              '\u24B9': 'D',
              '\uFF24': 'D',
              '\u1E0A': 'D',
              '\u010E': 'D',
              '\u1E0C': 'D',
              '\u1E10': 'D',
              '\u1E12': 'D',
              '\u1E0E': 'D',
              '\u0110': 'D',
              '\u018B': 'D',
              '\u018A': 'D',
              '\u0189': 'D',
              '\uA779': 'D',
              '\u01F1': 'DZ',
              '\u01C4': 'DZ',
              '\u01F2': 'Dz',
              '\u01C5': 'Dz',
              '\u24BA': 'E',
              '\uFF25': 'E',
              '\u00C8': 'E',
              '\u00C9': 'E',
              '\u00CA': 'E',
              '\u1EC0': 'E',
              '\u1EBE': 'E',
              '\u1EC4': 'E',
              '\u1EC2': 'E',
              '\u1EBC': 'E',
              '\u0112': 'E',
              '\u1E14': 'E',
              '\u1E16': 'E',
              '\u0114': 'E',
              '\u0116': 'E',
              '\u00CB': 'E',
              '\u1EBA': 'E',
              '\u011A': 'E',
              '\u0204': 'E',
              '\u0206': 'E',
              '\u1EB8': 'E',
              '\u1EC6': 'E',
              '\u0228': 'E',
              '\u1E1C': 'E',
              '\u0118': 'E',
              '\u1E18': 'E',
              '\u1E1A': 'E',
              '\u0190': 'E',
              '\u018E': 'E',
              '\u24BB': 'F',
              '\uFF26': 'F',
              '\u1E1E': 'F',
              '\u0191': 'F',
              '\uA77B': 'F',
              '\u24BC': 'G',
              '\uFF27': 'G',
              '\u01F4': 'G',
              '\u011C': 'G',
              '\u1E20': 'G',
              '\u011E': 'G',
              '\u0120': 'G',
              '\u01E6': 'G',
              '\u0122': 'G',
              '\u01E4': 'G',
              '\u0193': 'G',
              '\uA7A0': 'G',
              '\uA77D': 'G',
              '\uA77E': 'G',
              '\u24BD': 'H',
              '\uFF28': 'H',
              '\u0124': 'H',
              '\u1E22': 'H',
              '\u1E26': 'H',
              '\u021E': 'H',
              '\u1E24': 'H',
              '\u1E28': 'H',
              '\u1E2A': 'H',
              '\u0126': 'H',
              '\u2C67': 'H',
              '\u2C75': 'H',
              '\uA78D': 'H',
              '\u24BE': 'I',
              '\uFF29': 'I',
              '\u00CC': 'I',
              '\u00CD': 'I',
              '\u00CE': 'I',
              '\u0128': 'I',
              '\u012A': 'I',
              '\u012C': 'I',
              '\u0130': 'I',
              '\u00CF': 'I',
              '\u1E2E': 'I',
              '\u1EC8': 'I',
              '\u01CF': 'I',
              '\u0208': 'I',
              '\u020A': 'I',
              '\u1ECA': 'I',
              '\u012E': 'I',
              '\u1E2C': 'I',
              '\u0197': 'I',
              '\u24BF': 'J',
              '\uFF2A': 'J',
              '\u0134': 'J',
              '\u0248': 'J',
              '\u24C0': 'K',
              '\uFF2B': 'K',
              '\u1E30': 'K',
              '\u01E8': 'K',
              '\u1E32': 'K',
              '\u0136': 'K',
              '\u1E34': 'K',
              '\u0198': 'K',
              '\u2C69': 'K',
              '\uA740': 'K',
              '\uA742': 'K',
              '\uA744': 'K',
              '\uA7A2': 'K',
              '\u24C1': 'L',
              '\uFF2C': 'L',
              '\u013F': 'L',
              '\u0139': 'L',
              '\u013D': 'L',
              '\u1E36': 'L',
              '\u1E38': 'L',
              '\u013B': 'L',
              '\u1E3C': 'L',
              '\u1E3A': 'L',
              '\u0141': 'L',
              '\u023D': 'L',
              '\u2C62': 'L',
              '\u2C60': 'L',
              '\uA748': 'L',
              '\uA746': 'L',
              '\uA780': 'L',
              '\u01C7': 'LJ',
              '\u01C8': 'Lj',
              '\u24C2': 'M',
              '\uFF2D': 'M',
              '\u1E3E': 'M',
              '\u1E40': 'M',
              '\u1E42': 'M',
              '\u2C6E': 'M',
              '\u019C': 'M',
              '\u24C3': 'N',
              '\uFF2E': 'N',
              '\u01F8': 'N',
              '\u0143': 'N',
              '\u00D1': 'N',
              '\u1E44': 'N',
              '\u0147': 'N',
              '\u1E46': 'N',
              '\u0145': 'N',
              '\u1E4A': 'N',
              '\u1E48': 'N',
              '\u0220': 'N',
              '\u019D': 'N',
              '\uA790': 'N',
              '\uA7A4': 'N',
              '\u01CA': 'NJ',
              '\u01CB': 'Nj',
              '\u24C4': 'O',
              '\uFF2F': 'O',
              '\u00D2': 'O',
              '\u00D3': 'O',
              '\u00D4': 'O',
              '\u1ED2': 'O',
              '\u1ED0': 'O',
              '\u1ED6': 'O',
              '\u1ED4': 'O',
              '\u00D5': 'O',
              '\u1E4C': 'O',
              '\u022C': 'O',
              '\u1E4E': 'O',
              '\u014C': 'O',
              '\u1E50': 'O',
              '\u1E52': 'O',
              '\u014E': 'O',
              '\u022E': 'O',
              '\u0230': 'O',
              '\u00D6': 'O',
              '\u022A': 'O',
              '\u1ECE': 'O',
              '\u0150': 'O',
              '\u01D1': 'O',
              '\u020C': 'O',
              '\u020E': 'O',
              '\u01A0': 'O',
              '\u1EDC': 'O',
              '\u1EDA': 'O',
              '\u1EE0': 'O',
              '\u1EDE': 'O',
              '\u1EE2': 'O',
              '\u1ECC': 'O',
              '\u1ED8': 'O',
              '\u01EA': 'O',
              '\u01EC': 'O',
              '\u00D8': 'O',
              '\u01FE': 'O',
              '\u0186': 'O',
              '\u019F': 'O',
              '\uA74A': 'O',
              '\uA74C': 'O',
              '\u01A2': 'OI',
              '\uA74E': 'OO',
              '\u0222': 'OU',
              '\u24C5': 'P',
              '\uFF30': 'P',
              '\u1E54': 'P',
              '\u1E56': 'P',
              '\u01A4': 'P',
              '\u2C63': 'P',
              '\uA750': 'P',
              '\uA752': 'P',
              '\uA754': 'P',
              '\u24C6': 'Q',
              '\uFF31': 'Q',
              '\uA756': 'Q',
              '\uA758': 'Q',
              '\u024A': 'Q',
              '\u24C7': 'R',
              '\uFF32': 'R',
              '\u0154': 'R',
              '\u1E58': 'R',
              '\u0158': 'R',
              '\u0210': 'R',
              '\u0212': 'R',
              '\u1E5A': 'R',
              '\u1E5C': 'R',
              '\u0156': 'R',
              '\u1E5E': 'R',
              '\u024C': 'R',
              '\u2C64': 'R',
              '\uA75A': 'R',
              '\uA7A6': 'R',
              '\uA782': 'R',
              '\u24C8': 'S',
              '\uFF33': 'S',
              '\u1E9E': 'S',
              '\u015A': 'S',
              '\u1E64': 'S',
              '\u015C': 'S',
              '\u1E60': 'S',
              '\u0160': 'S',
              '\u1E66': 'S',
              '\u1E62': 'S',
              '\u1E68': 'S',
              '\u0218': 'S',
              '\u015E': 'S',
              '\u2C7E': 'S',
              '\uA7A8': 'S',
              '\uA784': 'S',
              '\u24C9': 'T',
              '\uFF34': 'T',
              '\u1E6A': 'T',
              '\u0164': 'T',
              '\u1E6C': 'T',
              '\u021A': 'T',
              '\u0162': 'T',
              '\u1E70': 'T',
              '\u1E6E': 'T',
              '\u0166': 'T',
              '\u01AC': 'T',
              '\u01AE': 'T',
              '\u023E': 'T',
              '\uA786': 'T',
              '\uA728': 'TZ',
              '\u24CA': 'U',
              '\uFF35': 'U',
              '\u00D9': 'U',
              '\u00DA': 'U',
              '\u00DB': 'U',
              '\u0168': 'U',
              '\u1E78': 'U',
              '\u016A': 'U',
              '\u1E7A': 'U',
              '\u016C': 'U',
              '\u00DC': 'U',
              '\u01DB': 'U',
              '\u01D7': 'U',
              '\u01D5': 'U',
              '\u01D9': 'U',
              '\u1EE6': 'U',
              '\u016E': 'U',
              '\u0170': 'U',
              '\u01D3': 'U',
              '\u0214': 'U',
              '\u0216': 'U',
              '\u01AF': 'U',
              '\u1EEA': 'U',
              '\u1EE8': 'U',
              '\u1EEE': 'U',
              '\u1EEC': 'U',
              '\u1EF0': 'U',
              '\u1EE4': 'U',
              '\u1E72': 'U',
              '\u0172': 'U',
              '\u1E76': 'U',
              '\u1E74': 'U',
              '\u0244': 'U',
              '\u24CB': 'V',
              '\uFF36': 'V',
              '\u1E7C': 'V',
              '\u1E7E': 'V',
              '\u01B2': 'V',
              '\uA75E': 'V',
              '\u0245': 'V',
              '\uA760': 'VY',
              '\u24CC': 'W',
              '\uFF37': 'W',
              '\u1E80': 'W',
              '\u1E82': 'W',
              '\u0174': 'W',
              '\u1E86': 'W',
              '\u1E84': 'W',
              '\u1E88': 'W',
              '\u2C72': 'W',
              '\u24CD': 'X',
              '\uFF38': 'X',
              '\u1E8A': 'X',
              '\u1E8C': 'X',
              '\u24CE': 'Y',
              '\uFF39': 'Y',
              '\u1EF2': 'Y',
              '\u00DD': 'Y',
              '\u0176': 'Y',
              '\u1EF8': 'Y',
              '\u0232': 'Y',
              '\u1E8E': 'Y',
              '\u0178': 'Y',
              '\u1EF6': 'Y',
              '\u1EF4': 'Y',
              '\u01B3': 'Y',
              '\u024E': 'Y',
              '\u1EFE': 'Y',
              '\u24CF': 'Z',
              '\uFF3A': 'Z',
              '\u0179': 'Z',
              '\u1E90': 'Z',
              '\u017B': 'Z',
              '\u017D': 'Z',
              '\u1E92': 'Z',
              '\u1E94': 'Z',
              '\u01B5': 'Z',
              '\u0224': 'Z',
              '\u2C7F': 'Z',
              '\u2C6B': 'Z',
              '\uA762': 'Z',
              '\u24D0': 'a',
              '\uFF41': 'a',
              '\u1E9A': 'a',
              '\u00E0': 'a',
              '\u00E1': 'a',
              '\u00E2': 'a',
              '\u1EA7': 'a',
              '\u1EA5': 'a',
              '\u1EAB': 'a',
              '\u1EA9': 'a',
              '\u00E3': 'a',
              '\u0101': 'a',
              '\u0103': 'a',
              '\u1EB1': 'a',
              '\u1EAF': 'a',
              '\u1EB5': 'a',
              '\u1EB3': 'a',
              '\u0227': 'a',
              '\u01E1': 'a',
              '\u00E4': 'a',
              '\u01DF': 'a',
              '\u1EA3': 'a',
              '\u00E5': 'a',
              '\u01FB': 'a',
              '\u01CE': 'a',
              '\u0201': 'a',
              '\u0203': 'a',
              '\u1EA1': 'a',
              '\u1EAD': 'a',
              '\u1EB7': 'a',
              '\u1E01': 'a',
              '\u0105': 'a',
              '\u2C65': 'a',
              '\u0250': 'a',
              '\uA733': 'aa',
              '\u00E6': 'ae',
              '\u01FD': 'ae',
              '\u01E3': 'ae',
              '\uA735': 'ao',
              '\uA737': 'au',
              '\uA739': 'av',
              '\uA73B': 'av',
              '\uA73D': 'ay',
              '\u24D1': 'b',
              '\uFF42': 'b',
              '\u1E03': 'b',
              '\u1E05': 'b',
              '\u1E07': 'b',
              '\u0180': 'b',
              '\u0183': 'b',
              '\u0253': 'b',
              '\u24D2': 'c',
              '\uFF43': 'c',
              '\u0107': 'c',
              '\u0109': 'c',
              '\u010B': 'c',
              '\u010D': 'c',
              '\u00E7': 'c',
              '\u1E09': 'c',
              '\u0188': 'c',
              '\u023C': 'c',
              '\uA73F': 'c',
              '\u2184': 'c',
              '\u24D3': 'd',
              '\uFF44': 'd',
              '\u1E0B': 'd',
              '\u010F': 'd',
              '\u1E0D': 'd',
              '\u1E11': 'd',
              '\u1E13': 'd',
              '\u1E0F': 'd',
              '\u0111': 'd',
              '\u018C': 'd',
              '\u0256': 'd',
              '\u0257': 'd',
              '\uA77A': 'd',
              '\u01F3': 'dz',
              '\u01C6': 'dz',
              '\u24D4': 'e',
              '\uFF45': 'e',
              '\u00E8': 'e',
              '\u00E9': 'e',
              '\u00EA': 'e',
              '\u1EC1': 'e',
              '\u1EBF': 'e',
              '\u1EC5': 'e',
              '\u1EC3': 'e',
              '\u1EBD': 'e',
              '\u0113': 'e',
              '\u1E15': 'e',
              '\u1E17': 'e',
              '\u0115': 'e',
              '\u0117': 'e',
              '\u00EB': 'e',
              '\u1EBB': 'e',
              '\u011B': 'e',
              '\u0205': 'e',
              '\u0207': 'e',
              '\u1EB9': 'e',
              '\u1EC7': 'e',
              '\u0229': 'e',
              '\u1E1D': 'e',
              '\u0119': 'e',
              '\u1E19': 'e',
              '\u1E1B': 'e',
              '\u0247': 'e',
              '\u025B': 'e',
              '\u01DD': 'e',
              '\u24D5': 'f',
              '\uFF46': 'f',
              '\u1E1F': 'f',
              '\u0192': 'f',
              '\uA77C': 'f',
              '\u24D6': 'g',
              '\uFF47': 'g',
              '\u01F5': 'g',
              '\u011D': 'g',
              '\u1E21': 'g',
              '\u011F': 'g',
              '\u0121': 'g',
              '\u01E7': 'g',
              '\u0123': 'g',
              '\u01E5': 'g',
              '\u0260': 'g',
              '\uA7A1': 'g',
              '\u1D79': 'g',
              '\uA77F': 'g',
              '\u24D7': 'h',
              '\uFF48': 'h',
              '\u0125': 'h',
              '\u1E23': 'h',
              '\u1E27': 'h',
              '\u021F': 'h',
              '\u1E25': 'h',
              '\u1E29': 'h',
              '\u1E2B': 'h',
              '\u1E96': 'h',
              '\u0127': 'h',
              '\u2C68': 'h',
              '\u2C76': 'h',
              '\u0265': 'h',
              '\u0195': 'hv',
              '\u24D8': 'i',
              '\uFF49': 'i',
              '\u00EC': 'i',
              '\u00ED': 'i',
              '\u00EE': 'i',
              '\u0129': 'i',
              '\u012B': 'i',
              '\u012D': 'i',
              '\u00EF': 'i',
              '\u1E2F': 'i',
              '\u1EC9': 'i',
              '\u01D0': 'i',
              '\u0209': 'i',
              '\u020B': 'i',
              '\u1ECB': 'i',
              '\u012F': 'i',
              '\u1E2D': 'i',
              '\u0268': 'i',
              '\u0131': 'i',
              '\u24D9': 'j',
              '\uFF4A': 'j',
              '\u0135': 'j',
              '\u01F0': 'j',
              '\u0249': 'j',
              '\u24DA': 'k',
              '\uFF4B': 'k',
              '\u1E31': 'k',
              '\u01E9': 'k',
              '\u1E33': 'k',
              '\u0137': 'k',
              '\u1E35': 'k',
              '\u0199': 'k',
              '\u2C6A': 'k',
              '\uA741': 'k',
              '\uA743': 'k',
              '\uA745': 'k',
              '\uA7A3': 'k',
              '\u24DB': 'l',
              '\uFF4C': 'l',
              '\u0140': 'l',
              '\u013A': 'l',
              '\u013E': 'l',
              '\u1E37': 'l',
              '\u1E39': 'l',
              '\u013C': 'l',
              '\u1E3D': 'l',
              '\u1E3B': 'l',
              '\u017F': 'l',
              '\u0142': 'l',
              '\u019A': 'l',
              '\u026B': 'l',
              '\u2C61': 'l',
              '\uA749': 'l',
              '\uA781': 'l',
              '\uA747': 'l',
              '\u01C9': 'lj',
              '\u24DC': 'm',
              '\uFF4D': 'm',
              '\u1E3F': 'm',
              '\u1E41': 'm',
              '\u1E43': 'm',
              '\u0271': 'm',
              '\u026F': 'm',
              '\u24DD': 'n',
              '\uFF4E': 'n',
              '\u01F9': 'n',
              '\u0144': 'n',
              '\u00F1': 'n',
              '\u1E45': 'n',
              '\u0148': 'n',
              '\u1E47': 'n',
              '\u0146': 'n',
              '\u1E4B': 'n',
              '\u1E49': 'n',
              '\u019E': 'n',
              '\u0272': 'n',
              '\u0149': 'n',
              '\uA791': 'n',
              '\uA7A5': 'n',
              '\u01CC': 'nj',
              '\u24DE': 'o',
              '\uFF4F': 'o',
              '\u00F2': 'o',
              '\u00F3': 'o',
              '\u00F4': 'o',
              '\u1ED3': 'o',
              '\u1ED1': 'o',
              '\u1ED7': 'o',
              '\u1ED5': 'o',
              '\u00F5': 'o',
              '\u1E4D': 'o',
              '\u022D': 'o',
              '\u1E4F': 'o',
              '\u014D': 'o',
              '\u1E51': 'o',
              '\u1E53': 'o',
              '\u014F': 'o',
              '\u022F': 'o',
              '\u0231': 'o',
              '\u00F6': 'o',
              '\u022B': 'o',
              '\u1ECF': 'o',
              '\u0151': 'o',
              '\u01D2': 'o',
              '\u020D': 'o',
              '\u020F': 'o',
              '\u01A1': 'o',
              '\u1EDD': 'o',
              '\u1EDB': 'o',
              '\u1EE1': 'o',
              '\u1EDF': 'o',
              '\u1EE3': 'o',
              '\u1ECD': 'o',
              '\u1ED9': 'o',
              '\u01EB': 'o',
              '\u01ED': 'o',
              '\u00F8': 'o',
              '\u01FF': 'o',
              '\u0254': 'o',
              '\uA74B': 'o',
              '\uA74D': 'o',
              '\u0275': 'o',
              '\u01A3': 'oi',
              '\u0223': 'ou',
              '\uA74F': 'oo',
              '\u24DF': 'p',
              '\uFF50': 'p',
              '\u1E55': 'p',
              '\u1E57': 'p',
              '\u01A5': 'p',
              '\u1D7D': 'p',
              '\uA751': 'p',
              '\uA753': 'p',
              '\uA755': 'p',
              '\u24E0': 'q',
              '\uFF51': 'q',
              '\u024B': 'q',
              '\uA757': 'q',
              '\uA759': 'q',
              '\u24E1': 'r',
              '\uFF52': 'r',
              '\u0155': 'r',
              '\u1E59': 'r',
              '\u0159': 'r',
              '\u0211': 'r',
              '\u0213': 'r',
              '\u1E5B': 'r',
              '\u1E5D': 'r',
              '\u0157': 'r',
              '\u1E5F': 'r',
              '\u024D': 'r',
              '\u027D': 'r',
              '\uA75B': 'r',
              '\uA7A7': 'r',
              '\uA783': 'r',
              '\u24E2': 's',
              '\uFF53': 's',
              '\u00DF': 's',
              '\u015B': 's',
              '\u1E65': 's',
              '\u015D': 's',
              '\u1E61': 's',
              '\u0161': 's',
              '\u1E67': 's',
              '\u1E63': 's',
              '\u1E69': 's',
              '\u0219': 's',
              '\u015F': 's',
              '\u023F': 's',
              '\uA7A9': 's',
              '\uA785': 's',
              '\u1E9B': 's',
              '\u24E3': 't',
              '\uFF54': 't',
              '\u1E6B': 't',
              '\u1E97': 't',
              '\u0165': 't',
              '\u1E6D': 't',
              '\u021B': 't',
              '\u0163': 't',
              '\u1E71': 't',
              '\u1E6F': 't',
              '\u0167': 't',
              '\u01AD': 't',
              '\u0288': 't',
              '\u2C66': 't',
              '\uA787': 't',
              '\uA729': 'tz',
              '\u24E4': 'u',
              '\uFF55': 'u',
              '\u00F9': 'u',
              '\u00FA': 'u',
              '\u00FB': 'u',
              '\u0169': 'u',
              '\u1E79': 'u',
              '\u016B': 'u',
              '\u1E7B': 'u',
              '\u016D': 'u',
              '\u00FC': 'u',
              '\u01DC': 'u',
              '\u01D8': 'u',
              '\u01D6': 'u',
              '\u01DA': 'u',
              '\u1EE7': 'u',
              '\u016F': 'u',
              '\u0171': 'u',
              '\u01D4': 'u',
              '\u0215': 'u',
              '\u0217': 'u',
              '\u01B0': 'u',
              '\u1EEB': 'u',
              '\u1EE9': 'u',
              '\u1EEF': 'u',
              '\u1EED': 'u',
              '\u1EF1': 'u',
              '\u1EE5': 'u',
              '\u1E73': 'u',
              '\u0173': 'u',
              '\u1E77': 'u',
              '\u1E75': 'u',
              '\u0289': 'u',
              '\u24E5': 'v',
              '\uFF56': 'v',
              '\u1E7D': 'v',
              '\u1E7F': 'v',
              '\u028B': 'v',
              '\uA75F': 'v',
              '\u028C': 'v',
              '\uA761': 'vy',
              '\u24E6': 'w',
              '\uFF57': 'w',
              '\u1E81': 'w',
              '\u1E83': 'w',
              '\u0175': 'w',
              '\u1E87': 'w',
              '\u1E85': 'w',
              '\u1E98': 'w',
              '\u1E89': 'w',
              '\u2C73': 'w',
              '\u24E7': 'x',
              '\uFF58': 'x',
              '\u1E8B': 'x',
              '\u1E8D': 'x',
              '\u24E8': 'y',
              '\uFF59': 'y',
              '\u1EF3': 'y',
              '\u00FD': 'y',
              '\u0177': 'y',
              '\u1EF9': 'y',
              '\u0233': 'y',
              '\u1E8F': 'y',
              '\u00FF': 'y',
              '\u1EF7': 'y',
              '\u1E99': 'y',
              '\u1EF5': 'y',
              '\u01B4': 'y',
              '\u024F': 'y',
              '\u1EFF': 'y',
              '\u24E9': 'z',
              '\uFF5A': 'z',
              '\u017A': 'z',
              '\u1E91': 'z',
              '\u017C': 'z',
              '\u017E': 'z',
              '\u1E93': 'z',
              '\u1E95': 'z',
              '\u01B6': 'z',
              '\u0225': 'z',
              '\u0240': 'z',
              '\u2C6C': 'z',
              '\uA763': 'z',
              '\u0386': '\u0391',
              '\u0388': '\u0395',
              '\u0389': '\u0397',
              '\u038A': '\u0399',
              '\u03AA': '\u0399',
              '\u038C': '\u039F',
              '\u038E': '\u03A5',
              '\u03AB': '\u03A5',
              '\u038F': '\u03A9',
              '\u03AC': '\u03B1',
              '\u03AD': '\u03B5',
              '\u03AE': '\u03B7',
              '\u03AF': '\u03B9',
              '\u03CA': '\u03B9',
              '\u0390': '\u03B9',
              '\u03CC': '\u03BF',
              '\u03CD': '\u03C5',
              '\u03CB': '\u03C5',
              '\u03B0': '\u03C5',
              '\u03C9': '\u03C9',
              '\u03C2': '\u03C3'
          };

          return diacritics;
      });

      S2.define('select2/data/base', [
        '../utils'
      ], function (Utils) {
          function BaseAdapter($element, options) {
              BaseAdapter.__super__.constructor.call(this);
          }

          Utils.Extend(BaseAdapter, Utils.Observable);

          BaseAdapter.prototype.current = function (callback) {
              throw new Error('The `current` method must be defined in child classes.');
          };

          BaseAdapter.prototype.query = function (params, callback) {
              throw new Error('The `query` method must be defined in child classes.');
          };

          BaseAdapter.prototype.bind = function (container, $container) {
              // Can be implemented in subclasses
          };

          BaseAdapter.prototype.destroy = function () {
              // Can be implemented in subclasses
          };

          BaseAdapter.prototype.generateResultId = function (container, data) {
              var id = container.id + '-result-';

              id += Utils.generateChars(4);

              if (data.id != null) {
                  id += '-' + data.id.toString();
              } else {
                  id += '-' + Utils.generateChars(4);
              }
              return id;
          };

          return BaseAdapter;
      });

      S2.define('select2/data/select', [
        './base',
        '../utils',
        'jquery'
      ], function (BaseAdapter, Utils, $) {
          function SelectAdapter($element, options) {
              this.$element = $element;
              this.options = options;

              SelectAdapter.__super__.constructor.call(this);
          }

          Utils.Extend(SelectAdapter, BaseAdapter);

          SelectAdapter.prototype.current = function (callback) {
              var data = [];
              var self = this;

              this.$element.find(':selected').each(function () {
                  var $option = $(this);

                  var option = self.item($option);

                  data.push(option);
              });

              callback(data);
          };

          SelectAdapter.prototype.select = function (data) {
              var self = this;

              data.selected = true;

              // If data.element is a DOM node, use it instead
              if ($(data.element).is('option')) {
                  data.element.selected = true;

                  this.$element.trigger('change');

                  return;
              }

              if (this.$element.prop('multiple')) {
                  this.current(function (currentData) {
                      var val = [];

                      data = [data];
                      data.push.apply(data, currentData);

                      for (var d = 0; d < data.length; d++) {
                          var id = data[d].id;

                          if ($.inArray(id, val) === -1) {
                              val.push(id);
                          }
                      }

                      self.$element.val(val);
                      self.$element.trigger('change');
                  });
              } else {
                  var val = data.id;

                  this.$element.val(val);
                  this.$element.trigger('change');
              }
          };

          SelectAdapter.prototype.unselect = function (data) {
              var self = this;

              if (!this.$element.prop('multiple')) {
                  return;
              }

              data.selected = false;

              if ($(data.element).is('option')) {
                  data.element.selected = false;

                  this.$element.trigger('change');

                  return;
              }

              this.current(function (currentData) {
                  var val = [];

                  for (var d = 0; d < currentData.length; d++) {
                      var id = currentData[d].id;

                      if (id !== data.id && $.inArray(id, val) === -1) {
                          val.push(id);
                      }
                  }

                  self.$element.val(val);

                  self.$element.trigger('change');
              });
          };

          SelectAdapter.prototype.bind = function (container, $container) {
              var self = this;

              this.container = container;

              container.on('select', function (params) {
                  self.select(params.data);
              });

              container.on('unselect', function (params) {
                  self.unselect(params.data);
              });
          };

          SelectAdapter.prototype.destroy = function () {
              // Remove anything added to child elements
              this.$element.find('*').each(function () {
                  // Remove any custom data set by Select2
                  $.removeData(this, 'data');
              });
          };

          SelectAdapter.prototype.query = function (params, callback) {
              var data = [];
              var self = this;

              var $options = this.$element.children();

              $options.each(function () {
                  var $option = $(this);

                  if (!$option.is('option') && !$option.is('optgroup')) {
                      return;
                  }

                  var option = self.item($option);

                  var matches = self.matches(params, option);

                  if (matches !== null) {
                      data.push(matches);
                  }
              });

              callback({
                  results: data
              });
          };

          SelectAdapter.prototype.addOptions = function ($options) {
              Utils.appendMany(this.$element, $options);
          };

          SelectAdapter.prototype.option = function (data) {
              var option;

              if (data.children) {
                  option = document.createElement('optgroup');
                  option.label = data.text;
              } else {
                  option = document.createElement('option');

                  if (option.textContent !== undefined) {
                      option.textContent = data.text;
                  } else {
                      option.innerText = data.text;
                  }
              }

              if (data.id) {
                  option.value = data.id;
              }

              if (data.disabled) {
                  option.disabled = true;
              }

              if (data.selected) {
                  option.selected = true;
              }

              if (data.title) {
                  option.title = data.title;
              }

              var $option = $(option);

              var normalizedData = this._normalizeItem(data);
              normalizedData.element = option;

              // Override the option's data with the combined data
              $.data(option, 'data', normalizedData);

              return $option;
          };

          SelectAdapter.prototype.item = function ($option) {
              var data = {};

              data = $.data($option[0], 'data');

              if (data != null) {
                  return data;
              }

              if ($option.is('option')) {
                  data = {
                      id: $option.val(),
                      text: $option.text(),
                      disabled: $option.prop('disabled'),
                      selected: $option.prop('selected'),
                      title: $option.prop('title')
                  };
              } else if ($option.is('optgroup')) {
                  data = {
                      text: $option.prop('label'),
                      children: [],
                      title: $option.prop('title')
                  };

                  var $children = $option.children('option');
                  var children = [];

                  for (var c = 0; c < $children.length; c++) {
                      var $child = $($children[c]);

                      var child = this.item($child);

                      children.push(child);
                  }

                  data.children = children;
              }

              data = this._normalizeItem(data);
              data.element = $option[0];

              $.data($option[0], 'data', data);

              return data;
          };

          SelectAdapter.prototype._normalizeItem = function (item) {
              if (!$.isPlainObject(item)) {
                  item = {
                      id: item,
                      text: item
                  };
              }

              item = $.extend({}, {
                  text: ''
              }, item);

              var defaults = {
                  selected: false,
                  disabled: false
              };

              if (item.id != null) {
                  item.id = item.id.toString();
              }

              if (item.text != null) {
                  item.text = item.text.toString();
              }

              if (item._resultId == null && item.id && this.container != null) {
                  item._resultId = this.generateResultId(this.container, item);
              }

              return $.extend({}, defaults, item);
          };

          SelectAdapter.prototype.matches = function (params, data) {
              var matcher = this.options.get('matcher');

              return matcher(params, data);
          };

          return SelectAdapter;
      });

      S2.define('select2/data/array', [
        './select',
        '../utils',
        'jquery'
      ], function (SelectAdapter, Utils, $) {
          function ArrayAdapter($element, options) {
              var data = options.get('data') || [];

              ArrayAdapter.__super__.constructor.call(this, $element, options);

              this.addOptions(this.convertToOptions(data));
          }

          Utils.Extend(ArrayAdapter, SelectAdapter);

          ArrayAdapter.prototype.select = function (data) {
              var $option = this.$element.find('option').filter(function (i, elm) {
                  return elm.value == data.id.toString();
              });

              if ($option.length === 0) {
                  $option = this.option(data);

                  this.addOptions($option);
              }

              ArrayAdapter.__super__.select.call(this, data);
          };

          ArrayAdapter.prototype.convertToOptions = function (data) {
              var self = this;

              var $existing = this.$element.find('option');
              var existingIds = $existing.map(function () {
                  return self.item($(this)).id;
              }).get();

              var $options = [];

              // Filter out all items except for the one passed in the argument
              function onlyItem(item) {
                  return function () {
                      return $(this).val() == item.id;
                  };
              }

              for (var d = 0; d < data.length; d++) {
                  var item = this._normalizeItem(data[d]);

                  // Skip items which were pre-loaded, only merge the data
                  if ($.inArray(item.id, existingIds) >= 0) {
                      var $existingOption = $existing.filter(onlyItem(item));

                      var existingData = this.item($existingOption);
                      var newData = $.extend(true, {}, item, existingData);

                      var $newOption = this.option(newData);

                      $existingOption.replaceWith($newOption);

                      continue;
                  }

                  var $option = this.option(item);

                  if (item.children) {
                      var $children = this.convertToOptions(item.children);

                      Utils.appendMany($option, $children);
                  }

                  $options.push($option);
              }

              return $options;
          };

          return ArrayAdapter;
      });

      S2.define('select2/data/ajax', [
        './array',
        '../utils',
        'jquery'
      ], function (ArrayAdapter, Utils, $) {
          function AjaxAdapter($element, options) {
              this.ajaxOptions = this._applyDefaults(options.get('ajax'));

              if (this.ajaxOptions.processResults != null) {
                  this.processResults = this.ajaxOptions.processResults;
              }

              AjaxAdapter.__super__.constructor.call(this, $element, options);
          }

          Utils.Extend(AjaxAdapter, ArrayAdapter);

          AjaxAdapter.prototype._applyDefaults = function (options) {
              var defaults = {
                  data: function (params) {
                      return $.extend({}, params, {
                          q: params.term
                      });
                  },
                  transport: function (params, success, failure) {
                      var $request = $.ajax(params);

                      $request.then(success);
                      $request.fail(failure);

                      return $request;
                  }
              };

              return $.extend({}, defaults, options, true);
          };

          AjaxAdapter.prototype.processResults = function (results) {
              return results;
          };

          AjaxAdapter.prototype.query = function (params, callback) {
              var matches = [];
              var self = this;

              if (this._request != null) {
                  // JSONP requests cannot always be aborted
                  if ($.isFunction(this._request.abort)) {
                      this._request.abort();
                  }

                  this._request = null;
              }

              var options = $.extend({
                  type: 'GET'
              }, this.ajaxOptions);

              if (typeof options.url === 'function') {
                  options.url = options.url.call(this.$element, params);
              }

              if (typeof options.data === 'function') {
                  options.data = options.data.call(this.$element, params);
              }

              function request() {
                  var $request = options.transport(options, function (data) {
                      var results = self.processResults(data, params);

                      if (self.options.get('debug') && window.console && console.error) {
                          // Check to make sure that the response included a `results` key.
                          if (!results || !results.results || !$.isArray(results.results)) {
                              console.error(
                                'Select2: The AJAX results did not return an array in the ' +
                                '`results` key of the response.'
                              );
                          }
                      }

                      callback(results);
                  }, function () {
                      // Attempt to detect if a request was aborted
                      // Only works if the transport exposes a status property
                      if ($request.status && $request.status === '0') {
                          return;
                      }

                      self.trigger('results:message', {
                          message: 'errorLoading'
                      });
                  });

                  self._request = $request;
              }

              if (this.ajaxOptions.delay && params.term != null) {
                  if (this._queryTimeout) {
                      window.clearTimeout(this._queryTimeout);
                  }

                  this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
              } else {
                  request();
              }
          };

          return AjaxAdapter;
      });

      S2.define('select2/data/tags', [
        'jquery'
      ], function ($) {
          function Tags(decorated, $element, options) {
              var tags = options.get('tags');

              var createTag = options.get('createTag');

              if (createTag !== undefined) {
                  this.createTag = createTag;
              }

              var insertTag = options.get('insertTag');

              if (insertTag !== undefined) {
                  this.insertTag = insertTag;
              }

              decorated.call(this, $element, options);

              if ($.isArray(tags)) {
                  for (var t = 0; t < tags.length; t++) {
                      var tag = tags[t];
                      var item = this._normalizeItem(tag);

                      var $option = this.option(item);

                      this.$element.append($option);
                  }
              }
          }

          Tags.prototype.query = function (decorated, params, callback) {
              var self = this;

              this._removeOldTags();

              if (params.term == null || params.page != null) {
                  decorated.call(this, params, callback);
                  return;
              }

              function wrapper(obj, child) {
                  var data = obj.results;

                  for (var i = 0; i < data.length; i++) {
                      var option = data[i];

                      var checkChildren = (
                        option.children != null &&
                        !wrapper({
                            results: option.children
                        }, true)
                      );

                      var checkText = option.text === params.term;

                      if (checkText || checkChildren) {
                          if (child) {
                              return false;
                          }

                          obj.data = data;
                          callback(obj);

                          return;
                      }
                  }

                  if (child) {
                      return true;
                  }

                  var tag = self.createTag(params);

                  if (tag != null) {
                      var $option = self.option(tag);
                      $option.attr('data-select2-tag', true);

                      self.addOptions([$option]);

                      self.insertTag(data, tag);
                  }

                  obj.results = data;

                  callback(obj);
              }

              decorated.call(this, params, wrapper);
          };

          Tags.prototype.createTag = function (decorated, params) {
              var term = $.trim(params.term);

              if (term === '') {
                  return null;
              }

              return {
                  id: term,
                  text: term
              };
          };

          Tags.prototype.insertTag = function (_, data, tag) {
              data.unshift(tag);
          };

          Tags.prototype._removeOldTags = function (_) {
              var tag = this._lastTag;

              var $options = this.$element.find('option[data-select2-tag]');

              $options.each(function () {
                  if (this.selected) {
                      return;
                  }

                  $(this).remove();
              });
          };

          return Tags;
      });

      S2.define('select2/data/tokenizer', [
        'jquery'
      ], function ($) {
          function Tokenizer(decorated, $element, options) {
              var tokenizer = options.get('tokenizer');

              if (tokenizer !== undefined) {
                  this.tokenizer = tokenizer;
              }

              decorated.call(this, $element, options);
          }

          Tokenizer.prototype.bind = function (decorated, container, $container) {
              decorated.call(this, container, $container);

              this.$search = container.dropdown.$search || container.selection.$search ||
                $container.find('.select2-search__field');
          };

          Tokenizer.prototype.query = function (decorated, params, callback) {
              var self = this;

              function createAndSelect(data) {
                  // Normalize the data object so we can use it for checks
                  var item = self._normalizeItem(data);

                  // Check if the data object already exists as a tag
                  // Select it if it doesn't
                  var $existingOptions = self.$element.find('option').filter(function () {
                      return $(this).val() === item.id;
                  });

                  // If an existing option wasn't found for it, create the option
                  if (!$existingOptions.length) {
                      var $option = self.option(item);
                      $option.attr('data-select2-tag', true);

                      self._removeOldTags();
                      self.addOptions([$option]);
                  }

                  // Select the item, now that we know there is an option for it
                  select(item);
              }

              function select(data) {
                  self.trigger('select', {
                      data: data
                  });
              }

              params.term = params.term || '';

              var tokenData = this.tokenizer(params, this.options, createAndSelect);

              if (tokenData.term !== params.term) {
                  // Replace the search term if we have the search box
                  if (this.$search.length) {
                      this.$search.val(tokenData.term);
                      this.$search.focus();
                  }

                  params.term = tokenData.term;
              }

              decorated.call(this, params, callback);
          };

          Tokenizer.prototype.tokenizer = function (_, params, options, callback) {
              var separators = options.get('tokenSeparators') || [];
              var term = params.term;
              var i = 0;

              var createTag = this.createTag || function (params) {
                  return {
                      id: params.term,
                      text: params.term
                  };
              };

              while (i < term.length) {
                  var termChar = term[i];

                  if ($.inArray(termChar, separators) === -1) {
                      i++;

                      continue;
                  }

                  var part = term.substr(0, i);
                  var partParams = $.extend({}, params, {
                      term: part
                  });

                  var data = createTag(partParams);

                  if (data == null) {
                      i++;
                      continue;
                  }

                  callback(data);

                  // Reset the term to not include the tokenized portion
                  term = term.substr(i + 1) || '';
                  i = 0;
              }

              return {
                  term: term
              };
          };

          return Tokenizer;
      });

      S2.define('select2/data/minimumInputLength', [

      ], function () {
          function MinimumInputLength(decorated, $e, options) {
              this.minimumInputLength = options.get('minimumInputLength');

              decorated.call(this, $e, options);
          }

          MinimumInputLength.prototype.query = function (decorated, params, callback) {
              params.term = params.term || '';

              if (params.term.length < this.minimumInputLength) {
                  this.trigger('results:message', {
                      message: 'inputTooShort',
                      args: {
                          minimum: this.minimumInputLength,
                          input: params.term,
                          params: params
                      }
                  });

                  return;
              }

              decorated.call(this, params, callback);
          };

          return MinimumInputLength;
      });

      S2.define('select2/data/maximumInputLength', [

      ], function () {
          function MaximumInputLength(decorated, $e, options) {
              this.maximumInputLength = options.get('maximumInputLength');

              decorated.call(this, $e, options);
          }

          MaximumInputLength.prototype.query = function (decorated, params, callback) {
              params.term = params.term || '';

              if (this.maximumInputLength > 0 &&
                  params.term.length > this.maximumInputLength) {
                  this.trigger('results:message', {
                      message: 'inputTooLong',
                      args: {
                          maximum: this.maximumInputLength,
                          input: params.term,
                          params: params
                      }
                  });

                  return;
              }

              decorated.call(this, params, callback);
          };

          return MaximumInputLength;
      });

      S2.define('select2/data/maximumSelectionLength', [

      ], function () {
          function MaximumSelectionLength(decorated, $e, options) {
              this.maximumSelectionLength = options.get('maximumSelectionLength');

              decorated.call(this, $e, options);
          }

          MaximumSelectionLength.prototype.query =
            function (decorated, params, callback) {
                var self = this;

                this.current(function (currentData) {
                    var count = currentData != null ? currentData.length : 0;
                    if (self.maximumSelectionLength > 0 &&
                      count >= self.maximumSelectionLength) {
                        self.trigger('results:message', {
                            message: 'maximumSelected',
                            args: {
                                maximum: self.maximumSelectionLength
                            }
                        });
                        return;
                    }
                    decorated.call(self, params, callback);
                });
            };

          return MaximumSelectionLength;
      });

      S2.define('select2/dropdown', [
        'jquery',
        './utils'
      ], function ($, Utils) {
          function Dropdown($element, options) {
              this.$element = $element;
              this.options = options;

              Dropdown.__super__.constructor.call(this);
          }

          Utils.Extend(Dropdown, Utils.Observable);

          Dropdown.prototype.render = function () {
              var $dropdown = $(
                '<span class="select2-dropdown">' +
                  '<span class="select2-results"></span>' +
                '</span>'
              );

              $dropdown.attr('dir', this.options.get('dir'));

              this.$dropdown = $dropdown;

              return $dropdown;
          };

          Dropdown.prototype.bind = function () {
              // Should be implemented in subclasses
          };

          Dropdown.prototype.position = function ($dropdown, $container) {
              // Should be implmented in subclasses
          };

          Dropdown.prototype.destroy = function () {
              // Remove the dropdown from the DOM
              this.$dropdown.remove();
          };

          return Dropdown;
      });

      S2.define('select2/dropdown/search', [
        'jquery',
        '../utils'
      ], function ($, Utils) {
          function Search() { }

          Search.prototype.render = function (decorated) {
              var $rendered = decorated.call(this);

              var $search = $(
                '<span class="select2-search select2-search--dropdown">' +
                  '<input class="select2-search__field" type="search" tabindex="-1"' +
                  ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
                  ' spellcheck="false" role="textbox" />' +
                '</span>'
              );

              this.$searchContainer = $search;
              this.$search = $search.find('input');

              $rendered.prepend($search);

              return $rendered;
          };

          Search.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              this.$search.on('keydown', function (evt) {
                  self.trigger('keypress', evt);

                  self._keyUpPrevented = evt.isDefaultPrevented();
              });

              // Workaround for browsers which do not support the `input` event
              // This will prevent double-triggering of events for browsers which support
              // both the `keyup` and `input` events.
              this.$search.on('input', function (evt) {
                  // Unbind the duplicated `keyup` event
                  $(this).off('keyup');
              });

              this.$search.on('keyup input', function (evt) {
                  self.handleSearch(evt);
              });

              container.on('open', function () {
                  self.$search.attr('tabindex', 0);

                  self.$search.focus();

                  window.setTimeout(function () {
                      self.$search.focus();
                  }, 0);
              });

              container.on('close', function () {
                  self.$search.attr('tabindex', -1);

                  self.$search.val('');
              });

              container.on('focus', function () {
                  if (container.isOpen()) {
                      self.$search.focus();
                  }
              });

              container.on('results:all', function (params) {
                  if (params.query.term == null || params.query.term === '') {
                      var showSearch = self.showSearch(params);

                      if (showSearch) {
                          self.$searchContainer.removeClass('select2-search--hide');
                      } else {
                          self.$searchContainer.addClass('select2-search--hide');
                      }
                  }
              });
          };

          Search.prototype.handleSearch = function (evt) {
              if (!this._keyUpPrevented) {
                  var input = this.$search.val();

                  this.trigger('query', {
                      term: input
                  });
              }

              this._keyUpPrevented = false;
          };

          Search.prototype.showSearch = function (_, params) {
              return true;
          };

          return Search;
      });

      S2.define('select2/dropdown/hidePlaceholder', [

      ], function () {
          function HidePlaceholder(decorated, $element, options, dataAdapter) {
              this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

              decorated.call(this, $element, options, dataAdapter);
          }

          HidePlaceholder.prototype.append = function (decorated, data) {
              data.results = this.removePlaceholder(data.results);

              decorated.call(this, data);
          };

          HidePlaceholder.prototype.normalizePlaceholder = function (_, placeholder) {
              if (typeof placeholder === 'string') {
                  placeholder = {
                      id: '',
                      text: placeholder
                  };
              }

              return placeholder;
          };

          HidePlaceholder.prototype.removePlaceholder = function (_, data) {
              var modifiedData = data.slice(0);

              for (var d = data.length - 1; d >= 0; d--) {
                  var item = data[d];

                  if (this.placeholder.id === item.id) {
                      modifiedData.splice(d, 1);
                  }
              }

              return modifiedData;
          };

          return HidePlaceholder;
      });

      S2.define('select2/dropdown/infiniteScroll', [
        'jquery'
      ], function ($) {
          function InfiniteScroll(decorated, $element, options, dataAdapter) {
              this.lastParams = {};

              decorated.call(this, $element, options, dataAdapter);

              this.$loadingMore = this.createLoadingMore();
              this.loading = false;
          }

          InfiniteScroll.prototype.append = function (decorated, data) {
              this.$loadingMore.remove();
              this.loading = false;

              decorated.call(this, data);

              if (this.showLoadingMore(data)) {
                  this.$results.append(this.$loadingMore);
              }
          };

          InfiniteScroll.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              container.on('query', function (params) {
                  self.lastParams = params;
                  self.loading = true;
              });

              container.on('query:append', function (params) {
                  self.lastParams = params;
                  self.loading = true;
              });

              this.$results.on('scroll', function () {
                  var isLoadMoreVisible = $.contains(
                    document.documentElement,
                    self.$loadingMore[0]
                  );

                  if (self.loading || !isLoadMoreVisible) {
                      return;
                  }

                  var currentOffset = self.$results.offset().top +
                    self.$results.outerHeight(false);
                  var loadingMoreOffset = self.$loadingMore.offset().top +
                    self.$loadingMore.outerHeight(false);

                  if (currentOffset + 50 >= loadingMoreOffset) {
                      self.loadMore();
                  }
              });
          };

          InfiniteScroll.prototype.loadMore = function () {
              this.loading = true;

              var params = $.extend({}, { page: 1 }, this.lastParams);

              params.page++;

              this.trigger('query:append', params);
          };

          InfiniteScroll.prototype.showLoadingMore = function (_, data) {
              return data.pagination && data.pagination.more;
          };

          InfiniteScroll.prototype.createLoadingMore = function () {
              var $option = $(
                '<li ' +
                'class="select2-results__option select2-results__option--load-more"' +
                'role="treeitem" aria-disabled="true"></li>'
              );

              var message = this.options.get('translations').get('loadingMore');

              $option.html(message(this.lastParams));

              return $option;
          };

          return InfiniteScroll;
      });

      S2.define('select2/dropdown/attachBody', [
        'jquery',
        '../utils'
      ], function ($, Utils) {
          function AttachBody(decorated, $element, options) {
              this.$dropdownParent = options.get('dropdownParent') || $(document.body);

              decorated.call(this, $element, options);
          }

          AttachBody.prototype.bind = function (decorated, container, $container) {
              var self = this;

              var setupResultsEvents = false;

              decorated.call(this, container, $container);

              container.on('open', function () {
                  self._showDropdown();
                  self._attachPositioningHandler(container);

                  if (!setupResultsEvents) {
                      setupResultsEvents = true;

                      container.on('results:all', function () {
                          self._positionDropdown();
                          self._resizeDropdown();
                      });

                      container.on('results:append', function () {
                          self._positionDropdown();
                          self._resizeDropdown();
                      });
                  }
              });

              container.on('close', function () {
                  self._hideDropdown();
                  self._detachPositioningHandler(container);
              });

              this.$dropdownContainer.on('mousedown', function (evt) {
                  evt.stopPropagation();
              });
          };

          AttachBody.prototype.destroy = function (decorated) {
              decorated.call(this);

              this.$dropdownContainer.remove();
          };

          AttachBody.prototype.position = function (decorated, $dropdown, $container) {
              // Clone all of the container classes
              $dropdown.attr('class', $container.attr('class'));

              $dropdown.removeClass('select2');
              $dropdown.addClass('select2-container--open');

              $dropdown.css({
                  position: 'absolute',
                  top: -999999
              });

              this.$container = $container;
          };

          AttachBody.prototype.render = function (decorated) {
              var $container = $('<span></span>');

              var $dropdown = decorated.call(this);
              $container.append($dropdown);

              this.$dropdownContainer = $container;

              return $container;
          };

          AttachBody.prototype._hideDropdown = function (decorated) {
              this.$dropdownContainer.detach();
          };

          AttachBody.prototype._attachPositioningHandler =
              function (decorated, container) {
                  var self = this;

                  var scrollEvent = 'scroll.select2.' + container.id;
                  var resizeEvent = 'resize.select2.' + container.id;
                  var orientationEvent = 'orientationchange.select2.' + container.id;

                  var $watchers = this.$container.parents().filter(Utils.hasScroll);
                  $watchers.each(function () {
                      $(this).data('select2-scroll-position', {
                          x: $(this).scrollLeft(),
                          y: $(this).scrollTop()
                      });
                  });

                  $watchers.on(scrollEvent, function (ev) {
                      var position = $(this).data('select2-scroll-position');
                      $(this).scrollTop(position.y);
                  });

                  $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent,
                    function (e) {
                        self._positionDropdown();
                        self._resizeDropdown();
                    });
              };

          AttachBody.prototype._detachPositioningHandler =
              function (decorated, container) {
                  var scrollEvent = 'scroll.select2.' + container.id;
                  var resizeEvent = 'resize.select2.' + container.id;
                  var orientationEvent = 'orientationchange.select2.' + container.id;

                  var $watchers = this.$container.parents().filter(Utils.hasScroll);
                  $watchers.off(scrollEvent);

                  $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
              };

          AttachBody.prototype._positionDropdown = function () {
              var $window = $(window);

              var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
              var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');

              var newDirection = null;

              var offset = this.$container.offset();

              offset.bottom = offset.top + this.$container.outerHeight(false);

              var container = {
                  height: this.$container.outerHeight(false)
              };

              container.top = offset.top;
              container.bottom = offset.top + container.height;

              var dropdown = {
                  height: this.$dropdown.outerHeight(false)
              };

              var viewport = {
                  top: $window.scrollTop(),
                  bottom: $window.scrollTop() + $window.height()
              };

              var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
              var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

              var css = {
                  left: offset.left,
                  top: container.bottom
              };

              // Determine what the parent element is to use for calciulating the offset
              var $offsetParent = this.$dropdownParent;

              // For statically positoned elements, we need to get the element
              // that is determining the offset
              if ($offsetParent.css('position') === 'static') {
                  $offsetParent = $offsetParent.offsetParent();
              }

              var parentOffset = $offsetParent.offset();

              css.top -= parentOffset.top;
              css.left -= parentOffset.left;

              if (!isCurrentlyAbove && !isCurrentlyBelow) {
                  newDirection = 'below';
              }

              if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
                  newDirection = 'above';
              } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
                  newDirection = 'below';
              }

              if (newDirection == 'above' ||
                (isCurrentlyAbove && newDirection !== 'below')) {
                  css.top = container.top - parentOffset.top - dropdown.height;
              }

              if (newDirection != null) {
                  this.$dropdown
                    .removeClass('select2-dropdown--below select2-dropdown--above')
                    .addClass('select2-dropdown--' + newDirection);
                  this.$container
                    .removeClass('select2-container--below select2-container--above')
                    .addClass('select2-container--' + newDirection);
              }

              this.$dropdownContainer.css(css);
          };

          AttachBody.prototype._resizeDropdown = function () {
              var css = {
                  width: this.$container.outerWidth(false) + 'px'
              };

              if (this.options.get('dropdownAutoWidth')) {
                  css.minWidth = css.width;
                  css.position = 'relative';
                  css.width = 'auto';
              }

              this.$dropdown.css(css);
          };

          AttachBody.prototype._showDropdown = function (decorated) {
              this.$dropdownContainer.appendTo(this.$dropdownParent);

              this._positionDropdown();
              this._resizeDropdown();
          };

          return AttachBody;
      });

      S2.define('select2/dropdown/minimumResultsForSearch', [

      ], function () {
          function countResults(data) {
              var count = 0;

              for (var d = 0; d < data.length; d++) {
                  var item = data[d];

                  if (item.children) {
                      count += countResults(item.children);
                  } else {
                      count++;
                  }
              }

              return count;
          }

          function MinimumResultsForSearch(decorated, $element, options, dataAdapter) {
              this.minimumResultsForSearch = options.get('minimumResultsForSearch');

              if (this.minimumResultsForSearch < 0) {
                  this.minimumResultsForSearch = Infinity;
              }

              decorated.call(this, $element, options, dataAdapter);
          }

          MinimumResultsForSearch.prototype.showSearch = function (decorated, params) {
              if (countResults(params.data.results) < this.minimumResultsForSearch) {
                  return false;
              }

              return decorated.call(this, params);
          };

          return MinimumResultsForSearch;
      });

      S2.define('select2/dropdown/selectOnClose', [

      ], function () {
          function SelectOnClose() { }

          SelectOnClose.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              container.on('close', function (params) {
                  self._handleSelectOnClose(params);
              });
          };

          SelectOnClose.prototype._handleSelectOnClose = function (_, params) {
              if (params && params.originalSelect2Event != null) {
                  var event = params.originalSelect2Event;

                  // Don't select an item if the close event was triggered from a select or
                  // unselect event
                  if (event._type === 'select' || event._type === 'unselect') {
                      return;
                  }
              }

              var $highlightedResults = this.getHighlightedResults();

              // Only select highlighted results
              if ($highlightedResults.length < 1) {
                  return;
              }

              var data = $highlightedResults.data('data');

              // Don't re-select already selected resulte
              if (
                (data.element != null && data.element.selected) ||
                (data.element == null && data.selected)
              ) {
                  return;
              }

              this.trigger('select', {
                  data: data
              });
          };

          return SelectOnClose;
      });

      S2.define('select2/dropdown/closeOnSelect', [

      ], function () {
          function CloseOnSelect() { }

          CloseOnSelect.prototype.bind = function (decorated, container, $container) {
              var self = this;

              decorated.call(this, container, $container);

              container.on('select', function (evt) {
                  self._selectTriggered(evt);
              });

              container.on('unselect', function (evt) {
                  self._selectTriggered(evt);
              });
          };

          CloseOnSelect.prototype._selectTriggered = function (_, evt) {
              var originalEvent = evt.originalEvent;

              // Don't close if the control key is being held
              if (originalEvent && originalEvent.ctrlKey) {
                  return;
              }

              this.trigger('close', {
                  originalEvent: originalEvent,
                  originalSelect2Event: evt
              });
          };

          return CloseOnSelect;
      });

      S2.define('select2/i18n/en', [], function () {
          // English
          return {
              errorLoading: function () {
                  return 'The results could not be loaded.';
              },
              inputTooLong: function (args) {
                  var overChars = args.input.length - args.maximum;

                  var message = 'Please delete ' + overChars + ' character';

                  if (overChars != 1) {
                      message += 's';
                  }

                  return message;
              },
              inputTooShort: function (args) {
                  var remainingChars = args.minimum - args.input.length;

                  //var message = 'Please enter ' + remainingChars + ' or more characters';
                  var message = 'Search by word (minimum ' + remainingChars + ' or more characters)';

                  return message;
              },
              loadingMore: function () {
                  return 'Loading more results…';
              },
              maximumSelected: function (args) {
                  var message = 'You can only select ' + args.maximum + ' item';

                  if (args.maximum != 1) {
                      message += 's';
                  }

                  return message;
              },
              noResults: function () {
                  return 'No results found';
              },
              searching: function () {
                  return 'Searching…';
              }
          };
      });

      S2.define('select2/defaults', [
        'jquery',
        'require',

        './results',

        './selection/single',
        './selection/multiple',
        './selection/placeholder',
        './selection/allowClear',
        './selection/search',
        './selection/eventRelay',

        './utils',
        './translation',
        './diacritics',

        './data/select',
        './data/array',
        './data/ajax',
        './data/tags',
        './data/tokenizer',
        './data/minimumInputLength',
        './data/maximumInputLength',
        './data/maximumSelectionLength',

        './dropdown',
        './dropdown/search',
        './dropdown/hidePlaceholder',
        './dropdown/infiniteScroll',
        './dropdown/attachBody',
        './dropdown/minimumResultsForSearch',
        './dropdown/selectOnClose',
        './dropdown/closeOnSelect',

        './i18n/en'
      ], function ($, require,

                   ResultsList,

                   SingleSelection, MultipleSelection, Placeholder, AllowClear,
                   SelectionSearch, EventRelay,

                   Utils, Translation, DIACRITICS,

                   SelectData, ArrayData, AjaxData, Tags, Tokenizer,
                   MinimumInputLength, MaximumInputLength, MaximumSelectionLength,

                   Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
                   AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,

                   EnglishTranslation) {
          function Defaults() {
              this.reset();
          }

          Defaults.prototype.apply = function (options) {
              options = $.extend(true, {}, this.defaults, options);

              if (options.dataAdapter == null) {
                  if (options.ajax != null) {
                      options.dataAdapter = AjaxData;
                  } else if (options.data != null) {
                      options.dataAdapter = ArrayData;
                  } else {
                      options.dataAdapter = SelectData;
                  }

                  if (options.minimumInputLength > 0) {
                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MinimumInputLength
                      );
                  }

                  if (options.maximumInputLength > 0) {
                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumInputLength
                      );
                  }

                  if (options.maximumSelectionLength > 0) {
                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumSelectionLength
                      );
                  }

                  if (options.tags) {
                      options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
                  }

                  if (options.tokenSeparators != null || options.tokenizer != null) {
                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Tokenizer
                      );
                  }

                  if (options.query != null) {
                      var Query = require(options.amdBase + 'compat/query');

                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Query
                      );
                  }

                  if (options.initSelection != null) {
                      var InitSelection = require(options.amdBase + 'compat/initSelection');

                      options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        InitSelection
                      );
                  }
              }

              if (options.resultsAdapter == null) {
                  options.resultsAdapter = ResultsList;

                  if (options.ajax != null) {
                      options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        InfiniteScroll
                      );
                  }

                  if (options.placeholder != null) {
                      options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        HidePlaceholder
                      );
                  }

                  if (options.selectOnClose) {
                      options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        SelectOnClose
                      );
                  }
              }

              if (options.dropdownAdapter == null) {
                  if (options.multiple) {
                      options.dropdownAdapter = Dropdown;
                  } else {
                      var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

                      options.dropdownAdapter = SearchableDropdown;
                  }

                  if (options.minimumResultsForSearch !== 0) {
                      options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        MinimumResultsForSearch
                      );
                  }

                  if (options.closeOnSelect) {
                      options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        CloseOnSelect
                      );
                  }

                  if (
                    options.dropdownCssClass != null ||
                    options.dropdownCss != null ||
                    options.adaptDropdownCssClass != null
                  ) {
                      var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

                      options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        DropdownCSS
                      );
                  }

                  options.dropdownAdapter = Utils.Decorate(
                    options.dropdownAdapter,
                    AttachBody
                  );
              }

              if (options.selectionAdapter == null) {
                  if (options.multiple) {
                      options.selectionAdapter = MultipleSelection;
                  } else {
                      options.selectionAdapter = SingleSelection;
                  }

                  // Add the placeholder mixin if a placeholder was specified
                  if (options.placeholder != null) {
                      options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        Placeholder
                      );
                  }

                  if (options.allowClear) {
                      options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        AllowClear
                      );
                  }

                  if (options.multiple) {
                      options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        SelectionSearch
                      );
                  }

                  if (
                    options.containerCssClass != null ||
                    options.containerCss != null ||
                    options.adaptContainerCssClass != null
                  ) {
                      var ContainerCSS = require(options.amdBase + 'compat/containerCss');

                      options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        ContainerCSS
                      );
                  }

                  options.selectionAdapter = Utils.Decorate(
                    options.selectionAdapter,
                    EventRelay
                  );
              }

              if (typeof options.language === 'string') {
                  // Check if the language is specified with a region
                  if (options.language.indexOf('-') > 0) {
                      // Extract the region information if it is included
                      var languageParts = options.language.split('-');
                      var baseLanguage = languageParts[0];

                      options.language = [options.language, baseLanguage];
                  } else {
                      options.language = [options.language];
                  }
              }

              if ($.isArray(options.language)) {
                  var languages = new Translation();
                  options.language.push('en');

                  var languageNames = options.language;

                  for (var l = 0; l < languageNames.length; l++) {
                      var name = languageNames[l];
                      var language = {};

                      try {
                          // Try to load it with the original name
                          language = Translation.loadPath(name);
                      } catch (e) {
                          try {
                              // If we couldn't load it, check if it wasn't the full path
                              name = this.defaults.amdLanguageBase + name;
                              language = Translation.loadPath(name);
                          } catch (ex) {
                              // The translation could not be loaded at all. Sometimes this is
                              // because of a configuration problem, other times this can be
                              // because of how Select2 helps load all possible translation files.
                              if (options.debug && window.console && console.warn) {
                                  console.warn(
                                    'Select2: The language file for "' + name + '" could not be ' +
                                    'automatically loaded. A fallback will be used instead.'
                                  );
                              }

                              continue;
                          }
                      }

                      languages.extend(language);
                  }

                  options.translations = languages;
              } else {
                  var baseTranslation = Translation.loadPath(
                    this.defaults.amdLanguageBase + 'en'
                  );
                  var customTranslation = new Translation(options.language);

                  customTranslation.extend(baseTranslation);

                  options.translations = customTranslation;
              }

              return options;
          };

          Defaults.prototype.reset = function () {
              function stripDiacritics(text) {
                  // Used 'uni range + named function' from http://jsperf.com/diacritics/18
                  function match(a) {
                      return DIACRITICS[a] || a;
                  }

                  return text.replace(/[^\u0000-\u007E]/g, match);
              }

              function matcher(params, data) {
                  // Always return the object if there is nothing to compare
                  if ($.trim(params.term) === '') {
                      return data;
                  }

                  // Do a recursive check for options with children
                  if (data.children && data.children.length > 0) {
                      // Clone the data object if there are children
                      // This is required as we modify the object to remove any non-matches
                      var match = $.extend(true, {}, data);

                      // Check each child of the option
                      for (var c = data.children.length - 1; c >= 0; c--) {
                          var child = data.children[c];

                          var matches = matcher(params, child);

                          // If there wasn't a match, remove the object in the array
                          if (matches == null) {
                              match.children.splice(c, 1);
                          }
                      }

                      // If any children matched, return the new object
                      if (match.children.length > 0) {
                          return match;
                      }

                      // If there were no matching children, check just the plain object
                      return matcher(params, match);
                  }

                  var original = stripDiacritics(data.text).toUpperCase();
                  var term = stripDiacritics(params.term).toUpperCase();

                  // Check if the text contains the term
                  if (original.indexOf(term) > -1) {
                      return data;
                  }

                  // If it doesn't contain the term, don't return anything
                  return null;
              }

              this.defaults = {
                  amdBase: './',
                  amdLanguageBase: './i18n/',
                  closeOnSelect: true,
                  debug: false,
                  dropdownAutoWidth: false,
                  escapeMarkup: Utils.escapeMarkup,
                  language: EnglishTranslation,
                  matcher: matcher,
                  minimumInputLength: 0,
                  maximumInputLength: 0,
                  maximumSelectionLength: 0,
                  minimumResultsForSearch: 0,
                  selectOnClose: false,
                  sorter: function (data) {
                      return data;
                  },
                  templateResult: function (result) {
                      return result.text;
                  },
                  templateSelection: function (selection) {
                      return selection.text;
                  },
                  theme: 'default',
                  width: 'resolve'
              };
          };

          Defaults.prototype.set = function (key, value) {
              var camelKey = $.camelCase(key);

              var data = {};
              data[camelKey] = value;

              var convertedData = Utils._convertData(data);

              $.extend(this.defaults, convertedData);
          };

          var defaults = new Defaults();

          return defaults;
      });

      S2.define('select2/options', [
        'require',
        'jquery',
        './defaults',
        './utils'
      ], function (require, $, Defaults, Utils) {
          function Options(options, $element) {
              this.options = options;

              if ($element != null) {
                  this.fromElement($element);
              }

              this.options = Defaults.apply(this.options);

              if ($element && $element.is('input')) {
                  var InputCompat = require(this.get('amdBase') + 'compat/inputData');

                  this.options.dataAdapter = Utils.Decorate(
                    this.options.dataAdapter,
                    InputCompat
                  );
              }
          }

          Options.prototype.fromElement = function ($e) {
              var excludedData = ['select2'];

              if (this.options.multiple == null) {
                  this.options.multiple = $e.prop('multiple');
              }

              if (this.options.disabled == null) {
                  this.options.disabled = $e.prop('disabled');
              }

              if (this.options.language == null) {
                  if ($e.prop('lang')) {
                      this.options.language = $e.prop('lang').toLowerCase();
                  } else if ($e.closest('[lang]').prop('lang')) {
                      this.options.language = $e.closest('[lang]').prop('lang');
                  }
              }

              if (this.options.dir == null) {
                  if ($e.prop('dir')) {
                      this.options.dir = $e.prop('dir');
                  } else if ($e.closest('[dir]').prop('dir')) {
                      this.options.dir = $e.closest('[dir]').prop('dir');
                  } else {
                      this.options.dir = 'ltr';
                  }
              }

              $e.prop('disabled', this.options.disabled);
              $e.prop('multiple', this.options.multiple);

              if ($e.data('select2Tags')) {
                  if (this.options.debug && window.console && console.warn) {
                      console.warn(
                        'Select2: The `data-select2-tags` attribute has been changed to ' +
                        'use the `data-data` and `data-tags="true"` attributes and will be ' +
                        'removed in future versions of Select2.'
                      );
                  }

                  $e.data('data', $e.data('select2Tags'));
                  $e.data('tags', true);
              }

              if ($e.data('ajaxUrl')) {
                  if (this.options.debug && window.console && console.warn) {
                      console.warn(
                        'Select2: The `data-ajax-url` attribute has been changed to ' +
                        '`data-ajax--url` and support for the old attribute will be removed' +
                        ' in future versions of Select2.'
                      );
                  }

                  $e.attr('ajax--url', $e.data('ajaxUrl'));
                  $e.data('ajax--url', $e.data('ajaxUrl'));
              }

              var dataset = {};

              // Prefer the element's `dataset` attribute if it exists
              // jQuery 1.x does not correctly handle data attributes with multiple dashes
              if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
                  dataset = $.extend(true, {}, $e[0].dataset, $e.data());
              } else {
                  dataset = $e.data();
              }

              var data = $.extend(true, {}, dataset);

              data = Utils._convertData(data);

              for (var key in data) {
                  if ($.inArray(key, excludedData) > -1) {
                      continue;
                  }

                  if ($.isPlainObject(this.options[key])) {
                      $.extend(this.options[key], data[key]);
                  } else {
                      this.options[key] = data[key];
                  }
              }

              return this;
          };

          Options.prototype.get = function (key) {
              return this.options[key];
          };

          Options.prototype.set = function (key, val) {
              this.options[key] = val;
          };

          return Options;
      });

      S2.define('select2/core', [
        'jquery',
        './options',
        './utils',
        './keys'
      ], function ($, Options, Utils, KEYS) {
          var Select2 = function ($element, options) {
              if ($element.data('select2') != null) {
                  $element.data('select2').destroy();
              }

              this.$element = $element;

              this.id = this._generateId($element);

              options = options || {};

              this.options = new Options(options, $element);

              Select2.__super__.constructor.call(this);

              // Set up the tabindex

              var tabindex = $element.attr('tabindex') || 0;
              $element.data('old-tabindex', tabindex);
              $element.attr('tabindex', '-1');

              // Set up containers and adapters

              var DataAdapter = this.options.get('dataAdapter');
              this.dataAdapter = new DataAdapter($element, this.options);

              var $container = this.render();

              this._placeContainer($container);

              var SelectionAdapter = this.options.get('selectionAdapter');
              this.selection = new SelectionAdapter($element, this.options);
              this.$selection = this.selection.render();

              this.selection.position(this.$selection, $container);

              var DropdownAdapter = this.options.get('dropdownAdapter');
              this.dropdown = new DropdownAdapter($element, this.options);
              this.$dropdown = this.dropdown.render();

              this.dropdown.position(this.$dropdown, $container);

              var ResultsAdapter = this.options.get('resultsAdapter');
              this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
              this.$results = this.results.render();

              this.results.position(this.$results, this.$dropdown);

              // Bind events

              var self = this;

              // Bind the container to all of the adapters
              this._bindAdapters();

              // Register any DOM event handlers
              this._registerDomEvents();

              // Register any internal event handlers
              this._registerDataEvents();
              this._registerSelectionEvents();
              this._registerDropdownEvents();
              this._registerResultsEvents();
              this._registerEvents();

              // Set the initial state
              this.dataAdapter.current(function (initialData) {
                  self.trigger('selection:update', {
                      data: initialData
                  });
              });

              // Hide the original select
              $element.addClass('select2-hidden-accessible');
              $element.attr('aria-hidden', 'true');

              // Synchronize any monitored attributes
              this._syncAttributes();

              $element.data('select2', this);
          };

          Utils.Extend(Select2, Utils.Observable);

          Select2.prototype._generateId = function ($element) {
              var id = '';

              if ($element.attr('id') != null) {
                  id = $element.attr('id');
              } else if ($element.attr('name') != null) {
                  id = $element.attr('name') + '-' + Utils.generateChars(2);
              } else {
                  id = Utils.generateChars(4);
              }

              id = id.replace(/(:|\.|\[|\]|,)/g, '');
              id = 'select2-' + id;

              return id;
          };

          Select2.prototype._placeContainer = function ($container) {
              $container.insertAfter(this.$element);

              var width = this._resolveWidth(this.$element, this.options.get('width'));

              if (width != null) {
                  $container.css('width', width);
              }
          };

          Select2.prototype._resolveWidth = function ($element, method) {
              var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

              if (method == 'resolve') {
                  var styleWidth = this._resolveWidth($element, 'style');

                  if (styleWidth != null) {
                      return styleWidth;
                  }

                  return this._resolveWidth($element, 'element');
              }

              if (method == 'element') {
                  var elementWidth = $element.outerWidth(false);

                  if (elementWidth <= 0) {
                      return 'auto';
                  }

                  return elementWidth + 'px';
              }

              if (method == 'style') {
                  var style = $element.attr('style');

                  if (typeof (style) !== 'string') {
                      return null;
                  }

                  var attrs = style.split(';');

                  for (var i = 0, l = attrs.length; i < l; i = i + 1) {
                      var attr = attrs[i].replace(/\s/g, '');
                      var matches = attr.match(WIDTH);

                      if (matches !== null && matches.length >= 1) {
                          return matches[1];
                      }
                  }

                  return null;
              }

              return method;
          };

          Select2.prototype._bindAdapters = function () {
              this.dataAdapter.bind(this, this.$container);
              this.selection.bind(this, this.$container);

              this.dropdown.bind(this, this.$container);
              this.results.bind(this, this.$container);
          };

          Select2.prototype._registerDomEvents = function () {
              var self = this;

              this.$element.on('change.select2', function () {
                  self.dataAdapter.current(function (data) {
                      self.trigger('selection:update', {
                          data: data
                      });
                  });
              });

              this.$element.on('focus.select2', function (evt) {
                  self.trigger('focus', evt);
              });

              this._syncA = Utils.bind(this._syncAttributes, this);
              this._syncS = Utils.bind(this._syncSubtree, this);

              if (this.$element[0].attachEvent) {
                  this.$element[0].attachEvent('onpropertychange', this._syncA);
              }

              var observer = window.MutationObserver ||
                window.WebKitMutationObserver ||
                window.MozMutationObserver
              ;

              if (observer != null) {
                  this._observer = new observer(function (mutations) {
                      $.each(mutations, self._syncA);
                      $.each(mutations, self._syncS);
                  });
                  this._observer.observe(this.$element[0], {
                      attributes: true,
                      childList: true,
                      subtree: false
                  });
              } else if (this.$element[0].addEventListener) {
                  this.$element[0].addEventListener(
                    'DOMAttrModified',
                    self._syncA,
                    false
                  );
                  this.$element[0].addEventListener(
                    'DOMNodeInserted',
                    self._syncS,
                    false
                  );
                  this.$element[0].addEventListener(
                    'DOMNodeRemoved',
                    self._syncS,
                    false
                  );
              }
          };

          Select2.prototype._registerDataEvents = function () {
              var self = this;

              this.dataAdapter.on('*', function (name, params) {
                  self.trigger(name, params);
              });
          };

          Select2.prototype._registerSelectionEvents = function () {
              var self = this;
              var nonRelayEvents = ['toggle', 'focus'];

              this.selection.on('toggle', function () {
                  self.toggleDropdown();
              });

              this.selection.on('focus', function (params) {
                  self.focus(params);
              });

              this.selection.on('*', function (name, params) {
                  if ($.inArray(name, nonRelayEvents) !== -1) {
                      return;
                  }

                  self.trigger(name, params);
              });
          };

          Select2.prototype._registerDropdownEvents = function () {
              var self = this;

              this.dropdown.on('*', function (name, params) {
                  self.trigger(name, params);
              });
          };

          Select2.prototype._registerResultsEvents = function () {
              var self = this;

              this.results.on('*', function (name, params) {
                  self.trigger(name, params);
              });
          };

          Select2.prototype._registerEvents = function () {
              var self = this;

              this.on('open', function () {
                  self.$container.addClass('select2-container--open');
              });

              this.on('close', function () {
                  self.$container.removeClass('select2-container--open');
              });

              this.on('enable', function () {
                  self.$container.removeClass('select2-container--disabled');
              });

              this.on('disable', function () {
                  self.$container.addClass('select2-container--disabled');
              });

              this.on('blur', function () {
                  self.$container.removeClass('select2-container--focus');
              });

              this.on('query', function (params) {
                  if (!self.isOpen()) {
                      self.trigger('open', {});
                  }

                  this.dataAdapter.query(params, function (data) {
                      self.trigger('results:all', {
                          data: data,
                          query: params
                      });
                  });
              });

              this.on('query:append', function (params) {
                  this.dataAdapter.query(params, function (data) {
                      self.trigger('results:append', {
                          data: data,
                          query: params
                      });
                  });
              });

              this.on('keypress', function (evt) {
                  var key = evt.which;

                  if (self.isOpen()) {
                      if (key === KEYS.ESC || key === KEYS.TAB ||
                          (key === KEYS.UP && evt.altKey)) {
                          self.close();

                          evt.preventDefault();
                      } else if (key === KEYS.ENTER) {
                          self.trigger('results:select', {});

                          evt.preventDefault();
                      } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
                          self.trigger('results:toggle', {});

                          evt.preventDefault();
                      } else if (key === KEYS.UP) {
                          self.trigger('results:previous', {});

                          evt.preventDefault();
                      } else if (key === KEYS.DOWN) {
                          self.trigger('results:next', {});

                          evt.preventDefault();
                      }
                  } else {
                      if (key === KEYS.ENTER || key === KEYS.SPACE ||
                          (key === KEYS.DOWN && evt.altKey)) {
                          self.open();

                          evt.preventDefault();
                      }
                  }
              });
          };

          Select2.prototype._syncAttributes = function () {
              this.options.set('disabled', this.$element.prop('disabled'));

              if (this.options.get('disabled')) {
                  if (this.isOpen()) {
                      this.close();
                  }

                  this.trigger('disable', {});
              } else {
                  this.trigger('enable', {});
              }
          };

          Select2.prototype._syncSubtree = function (evt, mutations) {
              var changed = false;
              var self = this;

              // Ignore any mutation events raised for elements that aren't options or
              // optgroups. This handles the case when the select element is destroyed
              if (
                evt && evt.target && (
                  evt.target.nodeName !== 'OPTION' && evt.target.nodeName !== 'OPTGROUP'
                )
              ) {
                  return;
              }

              if (!mutations) {
                  // If mutation events aren't supported, then we can only assume that the
                  // change affected the selections
                  changed = true;
              } else if (mutations.addedNodes && mutations.addedNodes.length > 0) {
                  for (var n = 0; n < mutations.addedNodes.length; n++) {
                      var node = mutations.addedNodes[n];

                      if (node.selected) {
                          changed = true;
                      }
                  }
              } else if (mutations.removedNodes && mutations.removedNodes.length > 0) {
                  changed = true;
              }

              // Only re-pull the data if we think there is a change
              if (changed) {
                  this.dataAdapter.current(function (currentData) {
                      self.trigger('selection:update', {
                          data: currentData
                      });
                  });
              }
          };

          /**
           * Override the trigger method to automatically trigger pre-events when
           * there are events that can be prevented.
           */
          Select2.prototype.trigger = function (name, args) {
              var actualTrigger = Select2.__super__.trigger;
              var preTriggerMap = {
                  'open': 'opening',
                  'close': 'closing',
                  'select': 'selecting',
                  'unselect': 'unselecting'
              };

              if (args === undefined) {
                  args = {};
              }

              if (name in preTriggerMap) {
                  var preTriggerName = preTriggerMap[name];
                  var preTriggerArgs = {
                      prevented: false,
                      name: name,
                      args: args
                  };

                  actualTrigger.call(this, preTriggerName, preTriggerArgs);

                  if (preTriggerArgs.prevented) {
                      args.prevented = true;

                      return;
                  }
              }

              actualTrigger.call(this, name, args);
          };

          Select2.prototype.toggleDropdown = function () {
              if (this.options.get('disabled')) {
                  return;
              }

              if (this.isOpen()) {
                  this.close();
              } else {
                  this.open();
              }
          };

          Select2.prototype.open = function () {
              if (this.isOpen()) {
                  return;
              }

              this.trigger('query', {});
          };

          Select2.prototype.close = function () {
              if (!this.isOpen()) {
                  return;
              }

              this.trigger('close', {});
          };

          Select2.prototype.isOpen = function () {
              return this.$container.hasClass('select2-container--open');
          };

          Select2.prototype.hasFocus = function () {
              return this.$container.hasClass('select2-container--focus');
          };

          Select2.prototype.focus = function (data) {
              // No need to re-trigger focus events if we are already focused
              if (this.hasFocus()) {
                  return;
              }

              this.$container.addClass('select2-container--focus');
              this.trigger('focus', {});
          };

          Select2.prototype.enable = function (args) {
              if (this.options.get('debug') && window.console && console.warn) {
                  console.warn(
                    'Select2: The `select2("enable")` method has been deprecated and will' +
                    ' be removed in later Select2 versions. Use $element.prop("disabled")' +
                    ' instead.'
                  );
              }

              if (args == null || args.length === 0) {
                  args = [true];
              }

              var disabled = !args[0];

              this.$element.prop('disabled', disabled);
          };

          Select2.prototype.data = function () {
              if (this.options.get('debug') &&
                  arguments.length > 0 && window.console && console.warn) {
                  console.warn(
                    'Select2: Data can no longer be set using `select2("data")`. You ' +
                    'should consider setting the value instead using `$element.val()`.'
                  );
              }

              var data = [];

              this.dataAdapter.current(function (currentData) {
                  data = currentData;
              });

              return data;
          };

          Select2.prototype.val = function (args) {
              if (this.options.get('debug') && window.console && console.warn) {
                  console.warn(
                    'Select2: The `select2("val")` method has been deprecated and will be' +
                    ' removed in later Select2 versions. Use $element.val() instead.'
                  );
              }

              if (args == null || args.length === 0) {
                  return this.$element.val();
              }

              var newVal = args[0];

              if ($.isArray(newVal)) {
                  newVal = $.map(newVal, function (obj) {
                      return obj.toString();
                  });
              }

              this.$element.val(newVal).trigger('change');
          };

          Select2.prototype.destroy = function () {
              this.$container.remove();

              if (this.$element[0].detachEvent) {
                  this.$element[0].detachEvent('onpropertychange', this._syncA);
              }

              if (this._observer != null) {
                  this._observer.disconnect();
                  this._observer = null;
              } else if (this.$element[0].removeEventListener) {
                  this.$element[0]
                    .removeEventListener('DOMAttrModified', this._syncA, false);
                  this.$element[0]
                    .removeEventListener('DOMNodeInserted', this._syncS, false);
                  this.$element[0]
                    .removeEventListener('DOMNodeRemoved', this._syncS, false);
              }

              this._syncA = null;
              this._syncS = null;

              this.$element.off('.select2');
              this.$element.attr('tabindex', this.$element.data('old-tabindex'));

              this.$element.removeClass('select2-hidden-accessible');
              this.$element.attr('aria-hidden', 'false');
              this.$element.removeData('select2');

              this.dataAdapter.destroy();
              this.selection.destroy();
              this.dropdown.destroy();
              this.results.destroy();

              this.dataAdapter = null;
              this.selection = null;
              this.dropdown = null;
              this.results = null;
          };

          Select2.prototype.render = function () {
              var $container = $(
                '<span class="select2 select2-container">' +
                  '<span class="selection"></span>' +
                  '<span class="dropdown-wrapper" aria-hidden="true"></span>' +
                '</span>'
              );

              $container.attr('dir', this.options.get('dir'));

              this.$container = $container;

              this.$container.addClass('select2-container--' + this.options.get('theme'));

              $container.data('element', this.$element);

              return $container;
          };

          return Select2;
      });

      S2.define('select2/compat/utils', [
        'jquery'
      ], function ($) {
          function syncCssClasses($dest, $src, adapter) {
              var classes, replacements = [], adapted;

              classes = $.trim($dest.attr('class'));

              if (classes) {
                  classes = '' + classes; // for IE which returns object

                  $(classes.split(/\s+/)).each(function () {
                      // Save all Select2 classes
                      if (this.indexOf('select2-') === 0) {
                          replacements.push(this);
                      }
                  });
              }

              classes = $.trim($src.attr('class'));

              if (classes) {
                  classes = '' + classes; // for IE which returns object

                  $(classes.split(/\s+/)).each(function () {
                      // Only adapt non-Select2 classes
                      if (this.indexOf('select2-') !== 0) {
                          adapted = adapter(this);

                          if (adapted != null) {
                              replacements.push(adapted);
                          }
                      }
                  });
              }

              $dest.attr('class', replacements.join(' '));
          }

          return {
              syncCssClasses: syncCssClasses
          };
      });

      S2.define('select2/compat/containerCss', [
        'jquery',
        './utils'
      ], function ($, CompatUtils) {
          // No-op CSS adapter that discards all classes by default
          function _containerAdapter(clazz) {
              return null;
          }

          function ContainerCSS() { }

          ContainerCSS.prototype.render = function (decorated) {
              var $container = decorated.call(this);

              var containerCssClass = this.options.get('containerCssClass') || '';

              if ($.isFunction(containerCssClass)) {
                  containerCssClass = containerCssClass(this.$element);
              }

              var containerCssAdapter = this.options.get('adaptContainerCssClass');
              containerCssAdapter = containerCssAdapter || _containerAdapter;

              if (containerCssClass.indexOf(':all:') !== -1) {
                  containerCssClass = containerCssClass.replace(':all:', '');

                  var _cssAdapter = containerCssAdapter;

                  containerCssAdapter = function (clazz) {
                      var adapted = _cssAdapter(clazz);

                      if (adapted != null) {
                          // Append the old one along with the adapted one
                          return adapted + ' ' + clazz;
                      }

                      return clazz;
                  };
              }

              var containerCss = this.options.get('containerCss') || {};

              if ($.isFunction(containerCss)) {
                  containerCss = containerCss(this.$element);
              }

              CompatUtils.syncCssClasses($container, this.$element, containerCssAdapter);

              $container.css(containerCss);
              $container.addClass(containerCssClass);

              return $container;
          };

          return ContainerCSS;
      });

      S2.define('select2/compat/dropdownCss', [
        'jquery',
        './utils'
      ], function ($, CompatUtils) {
          // No-op CSS adapter that discards all classes by default
          function _dropdownAdapter(clazz) {
              return null;
          }

          function DropdownCSS() { }

          DropdownCSS.prototype.render = function (decorated) {
              var $dropdown = decorated.call(this);

              var dropdownCssClass = this.options.get('dropdownCssClass') || '';

              if ($.isFunction(dropdownCssClass)) {
                  dropdownCssClass = dropdownCssClass(this.$element);
              }

              var dropdownCssAdapter = this.options.get('adaptDropdownCssClass');
              dropdownCssAdapter = dropdownCssAdapter || _dropdownAdapter;

              if (dropdownCssClass.indexOf(':all:') !== -1) {
                  dropdownCssClass = dropdownCssClass.replace(':all:', '');

                  var _cssAdapter = dropdownCssAdapter;

                  dropdownCssAdapter = function (clazz) {
                      var adapted = _cssAdapter(clazz);

                      if (adapted != null) {
                          // Append the old one along with the adapted one
                          return adapted + ' ' + clazz;
                      }

                      return clazz;
                  };
              }

              var dropdownCss = this.options.get('dropdownCss') || {};

              if ($.isFunction(dropdownCss)) {
                  dropdownCss = dropdownCss(this.$element);
              }

              CompatUtils.syncCssClasses($dropdown, this.$element, dropdownCssAdapter);

              $dropdown.css(dropdownCss);
              $dropdown.addClass(dropdownCssClass);

              return $dropdown;
          };

          return DropdownCSS;
      });

      S2.define('select2/compat/initSelection', [
        'jquery'
      ], function ($) {
          function InitSelection(decorated, $element, options) {
              if (options.get('debug') && window.console && console.warn) {
                  console.warn(
                    'Select2: The `initSelection` option has been deprecated in favor' +
                    ' of a custom data adapter that overrides the `current` method. ' +
                    'This method is now called multiple times instead of a single ' +
                    'time when the instance is initialized. Support will be removed ' +
                    'for the `initSelection` option in future versions of Select2'
                  );
              }

              this.initSelection = options.get('initSelection');
              this._isInitialized = false;

              decorated.call(this, $element, options);
          }

          InitSelection.prototype.current = function (decorated, callback) {
              var self = this;

              if (this._isInitialized) {
                  decorated.call(this, callback);

                  return;
              }

              this.initSelection.call(null, this.$element, function (data) {
                  self._isInitialized = true;

                  if (!$.isArray(data)) {
                      data = [data];
                  }

                  callback(data);
              });
          };

          return InitSelection;
      });

      S2.define('select2/compat/inputData', [
        'jquery'
      ], function ($) {
          function InputData(decorated, $element, options) {
              this._currentData = [];
              this._valueSeparator = options.get('valueSeparator') || ',';

              if ($element.prop('type') === 'hidden') {
                  if (options.get('debug') && console && console.warn) {
                      console.warn(
                        'Select2: Using a hidden input with Select2 is no longer ' +
                        'supported and may stop working in the future. It is recommended ' +
                        'to use a `<select>` element instead.'
                      );
                  }
              }

              decorated.call(this, $element, options);
          }

          InputData.prototype.current = function (_, callback) {
              function getSelected(data, selectedIds) {
                  var selected = [];

                  if (data.selected || $.inArray(data.id, selectedIds) !== -1) {
                      data.selected = true;
                      selected.push(data);
                  } else {
                      data.selected = false;
                  }

                  if (data.children) {
                      selected.push.apply(selected, getSelected(data.children, selectedIds));
                  }

                  return selected;
              }

              var selected = [];

              for (var d = 0; d < this._currentData.length; d++) {
                  var data = this._currentData[d];

                  selected.push.apply(
                    selected,
                    getSelected(
                      data,
                      this.$element.val().split(
                        this._valueSeparator
                      )
                    )
                  );
              }

              callback(selected);
          };

          InputData.prototype.select = function (_, data) {
              if (!this.options.get('multiple')) {
                  this.current(function (allData) {
                      $.map(allData, function (data) {
                          data.selected = false;
                      });
                  });

                  this.$element.val(data.id);
                  this.$element.trigger('change');
              } else {
                  var value = this.$element.val();
                  value += this._valueSeparator + data.id;

                  this.$element.val(value);
                  this.$element.trigger('change');
              }
          };

          InputData.prototype.unselect = function (_, data) {
              var self = this;

              data.selected = false;

              this.current(function (allData) {
                  var values = [];

                  for (var d = 0; d < allData.length; d++) {
                      var item = allData[d];

                      if (data.id == item.id) {
                          continue;
                      }

                      values.push(item.id);
                  }

                  self.$element.val(values.join(self._valueSeparator));
                  self.$element.trigger('change');
              });
          };

          InputData.prototype.query = function (_, params, callback) {
              var results = [];

              for (var d = 0; d < this._currentData.length; d++) {
                  var data = this._currentData[d];

                  var matches = this.matches(params, data);

                  if (matches !== null) {
                      results.push(matches);
                  }
              }

              callback({
                  results: results
              });
          };

          InputData.prototype.addOptions = function (_, $options) {
              var options = $.map($options, function ($option) {
                  return $.data($option[0], 'data');
              });

              this._currentData.push.apply(this._currentData, options);
          };

          return InputData;
      });

      S2.define('select2/compat/matcher', [
        'jquery'
      ], function ($) {
          function oldMatcher(matcher) {
              function wrappedMatcher(params, data) {
                  var match = $.extend(true, {}, data);

                  if (params.term == null || $.trim(params.term) === '') {
                      return match;
                  }

                  if (data.children) {
                      for (var c = data.children.length - 1; c >= 0; c--) {
                          var child = data.children[c];

                          // Check if the child object matches
                          // The old matcher returned a boolean true or false
                          var doesMatch = matcher(params.term, child.text, child);

                          // If the child didn't match, pop it off
                          if (!doesMatch) {
                              match.children.splice(c, 1);
                          }
                      }

                      if (match.children.length > 0) {
                          return match;
                      }
                  }

                  if (matcher(params.term, data.text, data)) {
                      return match;
                  }

                  return null;
              }

              return wrappedMatcher;
          }

          return oldMatcher;
      });

      S2.define('select2/compat/query', [

      ], function () {
          function Query(decorated, $element, options) {
              if (options.get('debug') && window.console && console.warn) {
                  console.warn(
                    'Select2: The `query` option has been deprecated in favor of a ' +
                    'custom data adapter that overrides the `query` method. Support ' +
                    'will be removed for the `query` option in future versions of ' +
                    'Select2.'
                  );
              }

              decorated.call(this, $element, options);
          }

          Query.prototype.query = function (_, params, callback) {
              params.callback = callback;

              var query = this.options.get('query');

              query.call(null, params);
          };

          return Query;
      });

      S2.define('select2/dropdown/attachContainer', [

      ], function () {
          function AttachContainer(decorated, $element, options) {
              decorated.call(this, $element, options);
          }

          AttachContainer.prototype.position =
            function (decorated, $dropdown, $container) {
                var $dropdownContainer = $container.find('.dropdown-wrapper');
                $dropdownContainer.append($dropdown);

                $dropdown.addClass('select2-dropdown--below');
                $container.addClass('select2-container--below');
            };

          return AttachContainer;
      });

      S2.define('select2/dropdown/stopPropagation', [

      ], function () {
          function StopPropagation() { }

          StopPropagation.prototype.bind = function (decorated, container, $container) {
              decorated.call(this, container, $container);

              var stoppedEvents = [
              'blur',
              'change',
              'click',
              'dblclick',
              'focus',
              'focusin',
              'focusout',
              'input',
              'keydown',
              'keyup',
              'keypress',
              'mousedown',
              'mouseenter',
              'mouseleave',
              'mousemove',
              'mouseover',
              'mouseup',
              'search',
              'touchend',
              'touchstart'
              ];

              this.$dropdown.on(stoppedEvents.join(' '), function (evt) {
                  evt.stopPropagation();
              });
          };

          return StopPropagation;
      });

      S2.define('select2/selection/stopPropagation', [

      ], function () {
          function StopPropagation() { }

          StopPropagation.prototype.bind = function (decorated, container, $container) {
              decorated.call(this, container, $container);

              var stoppedEvents = [
                'blur',
                'change',
                'click',
                'dblclick',
                'focus',
                'focusin',
                'focusout',
                'input',
                'keydown',
                'keyup',
                'keypress',
                'mousedown',
                'mouseenter',
                'mouseleave',
                'mousemove',
                'mouseover',
                'mouseup',
                'search',
                'touchend',
                'touchstart'
              ];

              this.$selection.on(stoppedEvents.join(' '), function (evt) {
                  evt.stopPropagation();
              });
          };

          return StopPropagation;
      });

      /*!
       * jQuery Mousewheel 3.1.13
       *
       * Copyright jQuery Foundation and other contributors
       * Released under the MIT license
       * http://jquery.org/license
       */

      (function (factory) {
          if (typeof S2.define === 'function' && S2.define.amd) {
              // AMD. Register as an anonymous module.
              S2.define('jquery-mousewheel', ['jquery'], factory);
          } else if (typeof exports === 'object') {
              // Node/CommonJS style for Browserify
              module.exports = factory;
          } else {
              // Browser globals
              factory(jQuery);
          }
      }(function ($) {

          var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
              toBind = ('onwheel' in document || document.documentMode >= 9) ?
                          ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
              slice = Array.prototype.slice,
              nullLowestDeltaTimeout, lowestDelta;

          if ($.event.fixHooks) {
              for (var i = toFix.length; i;) {
                  $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
              }
          }

          var special = $.event.special.mousewheel = {
              version: '3.1.12',

              setup: function () {
                  if (this.addEventListener) {
                      for (var i = toBind.length; i;) {
                          this.addEventListener(toBind[--i], handler, false);
                      }
                  } else {
                      this.onmousewheel = handler;
                  }
                  // Store the line height and page height for this particular element
                  $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
                  $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
              },

              teardown: function () {
                  if (this.removeEventListener) {
                      for (var i = toBind.length; i;) {
                          this.removeEventListener(toBind[--i], handler, false);
                      }
                  } else {
                      this.onmousewheel = null;
                  }
                  // Clean up the data we added to the element
                  $.removeData(this, 'mousewheel-line-height');
                  $.removeData(this, 'mousewheel-page-height');
              },

              getLineHeight: function (elem) {
                  var $elem = $(elem),
                      $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
                  if (!$parent.length) {
                      $parent = $('body');
                  }
                  return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
              },

              getPageHeight: function (elem) {
                  return $(elem).height();
              },

              settings: {
                  adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
                  normalizeOffset: true  // calls getBoundingClientRect for each event
              }
          };

          $.fn.extend({
              mousewheel: function (fn) {
                  return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
              },

              unmousewheel: function (fn) {
                  return this.unbind('mousewheel', fn);
              }
          });


          function handler(event) {
              var orgEvent = event || window.event,
                  args = slice.call(arguments, 1),
                  delta = 0,
                  deltaX = 0,
                  deltaY = 0,
                  absDelta = 0,
                  offsetX = 0,
                  offsetY = 0;
              event = $.event.fix(orgEvent);
              event.type = 'mousewheel';

              // Old school scrollwheel delta
              if ('detail' in orgEvent) { deltaY = orgEvent.detail * -1; }
              if ('wheelDelta' in orgEvent) { deltaY = orgEvent.wheelDelta; }
              if ('wheelDeltaY' in orgEvent) { deltaY = orgEvent.wheelDeltaY; }
              if ('wheelDeltaX' in orgEvent) { deltaX = orgEvent.wheelDeltaX * -1; }

              // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
              if ('axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
                  deltaX = deltaY * -1;
                  deltaY = 0;
              }

              // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
              delta = deltaY === 0 ? deltaX : deltaY;

              // New school wheel delta (wheel event)
              if ('deltaY' in orgEvent) {
                  deltaY = orgEvent.deltaY * -1;
                  delta = deltaY;
              }
              if ('deltaX' in orgEvent) {
                  deltaX = orgEvent.deltaX;
                  if (deltaY === 0) { delta = deltaX * -1; }
              }

              // No change actually happened, no reason to go any further
              if (deltaY === 0 && deltaX === 0) { return; }

              // Need to convert lines and pages to pixels if we aren't already in pixels
              // There are three delta modes:
              //   * deltaMode 0 is by pixels, nothing to do
              //   * deltaMode 1 is by lines
              //   * deltaMode 2 is by pages
              if (orgEvent.deltaMode === 1) {
                  var lineHeight = $.data(this, 'mousewheel-line-height');
                  delta *= lineHeight;
                  deltaY *= lineHeight;
                  deltaX *= lineHeight;
              } else if (orgEvent.deltaMode === 2) {
                  var pageHeight = $.data(this, 'mousewheel-page-height');
                  delta *= pageHeight;
                  deltaY *= pageHeight;
                  deltaX *= pageHeight;
              }

              // Store lowest absolute delta to normalize the delta values
              absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

              if (!lowestDelta || absDelta < lowestDelta) {
                  lowestDelta = absDelta;

                  // Adjust older deltas if necessary
                  if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                      lowestDelta /= 40;
                  }
              }

              // Adjust older deltas if necessary
              if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                  // Divide all the things by 40!
                  delta /= 40;
                  deltaX /= 40;
                  deltaY /= 40;
              }

              // Get a whole, normalized value for the deltas
              delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
              deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
              deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

              // Normalise offsetX and offsetY properties
              if (special.settings.normalizeOffset && this.getBoundingClientRect) {
                  var boundingRect = this.getBoundingClientRect();
                  offsetX = event.clientX - boundingRect.left;
                  offsetY = event.clientY - boundingRect.top;
              }

              // Add information to the event object
              event.deltaX = deltaX;
              event.deltaY = deltaY;
              event.deltaFactor = lowestDelta;
              event.offsetX = offsetX;
              event.offsetY = offsetY;
              // Go ahead and set deltaMode to 0 since we converted to pixels
              // Although this is a little odd since we overwrite the deltaX/Y
              // properties with normalized deltas.
              event.deltaMode = 0;

              // Add event and delta to the front of the arguments
              args.unshift(event, delta, deltaX, deltaY);

              // Clearout lowestDelta after sometime to better
              // handle multiple device types that give different
              // a different lowestDelta
              // Ex: trackpad = 3 and mouse wheel = 120
              if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
              nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

              return ($.event.dispatch || $.event.handle).apply(this, args);
          }

          function nullLowestDelta() {
              lowestDelta = null;
          }

          function shouldAdjustOldDeltas(orgEvent, absDelta) {
              // If this is an older event and the delta is divisable by 120,
              // then we are assuming that the browser is treating this as an
              // older mouse wheel event and that we should divide the deltas
              // by 40 to try and get a more usable deltaFactor.
              // Side note, this actually impacts the reported scroll distance
              // in older browsers and can cause scrolling to be slower than native.
              // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
              return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
          }

      }));

      S2.define('jquery.select2', [
        'jquery',
        'jquery-mousewheel',

        './select2/core',
        './select2/defaults'
      ], function ($, _, Select2, Defaults) {
          if ($.fn.select2 == null) {
              // All methods that should return the element
              var thisMethods = ['open', 'close', 'destroy'];

              $.fn.select2 = function (options) {
                  options = options || {};

                  if (typeof options === 'object') {
                      this.each(function () {
                          var instanceOptions = $.extend(true, {}, options);

                          var instance = new Select2($(this), instanceOptions);
                      });

                      return this;
                  } else if (typeof options === 'string') {
                      var ret;
                      var args = Array.prototype.slice.call(arguments, 1);

                      this.each(function () {
                          var instance = $(this).data('select2');

                          if (instance == null && window.console && console.error) {
                              console.error(
                                'The select2(\'' + options + '\') method was called on an ' +
                                'element that is not using Select2.'
                              );
                          }

                          ret = instance[options].apply(instance, args);
                      });

                      // Check if we should be returning `this`
                      if ($.inArray(options, thisMethods) > -1) {
                          return this;
                      }

                      return ret;
                  } else {
                      throw new Error('Invalid arguments for Select2: ' + options);
                  }
              };
          }

          if ($.fn.select2.defaults == null) {
              $.fn.select2.defaults = Defaults;
          }

          return Select2;
      });

      // Return the AMD loader configuration so it can be used outside of this file
      return {
          define: S2.define,
          require: S2.require
      };
  }());

    // Autoload the jQuery bindings
    // We know that all of the modules exist above this, so we're safe
    var select2 = S2.require('jquery.select2');

    // Hold the AMD module references on the jQuery function that was just loaded
    // This allows Select2 to use the internal loader outside of this file, such
    // as in the language files.
    jQuery.fn.select2.amd = S2;

    // Return the Select2 instance for anyone who is importing it.
    return select2;
}));
