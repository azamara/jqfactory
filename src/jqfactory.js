/* jqfactory - v0.2.0 - 2013-7-03
* Copyright (c) 2013 Greg Franko; Licensed MIT */
;(function (jqfactory) {
    // Strict Mode
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // An AMD loader is on the page. Register jqfactory as a named AMD module.
        define('jqfactory', ['jquery'], function() {
            jqfactory(window.jQuery, window, document);
        });
    } else {
        // An AMD loader is not on the page.
        jqfactory(window.jQuery, window, document);
    }
} (function ($, window, document, undefined) {
    // Strict mode
    'use strict';
    var slice = Array.prototype.slice,
        jqfactory = {
        create: function(name, props, enforceNamespace) {
            var names = name.split('.'),
                namespace = names[0],
                basename = names[1],
                fullname = namespace + '-' + basename,
                eventnamespace = '.' + fullname,
                instanceProps = props,
                protoProps = jqfactory.common,
                setup,
                namespaceObj = {},
                currentNamespace = $.fn[namespace],
                Plugin;
            $[namespace] = $[namespace] || {};
            if(!namespace || !basename || !$.isPlainObject(props) || $.isEmptyObject(props) || $[namespace][basename]) {
                return;
            }
            Plugin = function(props) {
                for(var x in props) {
                    if(props.hasOwnProperty(x)) {
                        this[x] = props[x];
                    }
                }
            };
            Plugin.prototype = protoProps;
            $[namespace][basename] = instanceProps;
            if(enforceNamespace) {
                namespaceObj[basename] = function(options) {
                    return this.each(function() {
                        setup(this, options);
                    });
                };
                jqfactory.utils.createNamespace(namespace, namespaceObj);
            } else {
                $.fn[basename] = function(options) {
                    return this.each(function() {
                        setup(this, options);
                    });
                };
            }
            setup = function(element, options) {
                var existingElem = props.element,
                    elem = existingElem ? $(existingElem)[0] : element,
                    $elem = $(elem),
                    existingInstance = $.data(elem, fullname),
                    obj = {},
                    widget,
                    defaultOptions = instanceProps.options || {},
                    created,
                    rendered;
                if (existingInstance) {
                    existingInstance._init(options);
                    return;
                }
                widget = new Plugin(instanceProps);
                widget.options = $.extend(true, {}, defaultOptions, options);
                widget._super = jqfactory.common,
                widget.callingElement = element;
                widget.$callingElement = $(element);
                widget.element = elem;
                widget.$element = $elem;
                widget.namespace = namespace;
                widget.basename = basename;
                widget.fullname = fullname;
                widget.eventnamespace = eventnamespace;
                $.data(elem, widget.fullname, widget);
                obj[fullname] = function(elem) {
                    return $(elem).data(fullname) !== undefined;
                };
                $.extend($.expr[":"], obj);
                created = widget._create() || {};
                if(jqfactory.utils.isDeferred(created)) {
                    created.done(function() {
                        rendered = widget._render.apply(widget, arguments) || {};
                        jqfactory.utils.postRender(rendered, widget, arguments);
                    });
                } else {
                    rendered = widget._render() || {};
                    jqfactory.utils.postRender(rendered, widget);
                }
            };
        },
        utils: {
            createNamespace: function(namespaceName, namespaceFuncs) {
                if (!$.fn[namespaceName]) {
                    $.fn[namespaceName] = function Namespace(context) {
                        if (this instanceof Namespace) {
                            this.__namespace_context__ = context;
                        }
                        else {
                            return new Namespace(this);
                        }
                    };
                }
                $.each(namespaceFuncs, function(closureName, closure) {
                    $.fn[namespaceName].prototype[closureName] = function() {
                        return closure.apply(this.__namespace_context__, arguments);
                    };
                });
            },
            isDeferred: function(def) {
                return $.isPlainObject(def) && def.promise && def.done;
            },
            postRender: function(rendered, widget, args) {
                if(jqfactory.utils.isDeferred(rendered)) {
                    rendered.done(function() {
                        widget._on(widget._events);
                        widget._postevents.apply(widget, args);
                    });
                } else {
                    widget._on(widget._events);
                    widget._postevents();
                }
            }
        },
        common: {
            _create: $.noop,
            _init: $.noop,
            _render: $.noop,
            _events: {},
            _postevents: $.noop,
            _on: function(selector, fn) {
                var obj = {};
                if($.isPlainObject(selector)) {
                    obj = selector;
                } else if($.type(selector) === 'string' && $.isFunction(fn)) {
                    obj[selector] = fn;
                }
                this._eventBindings(obj);
                this._events = $.extend(true, {}, this._events, obj);
                return this;
            },
            _off: function(selector) {
                var obj = {}, i = -1, len;
                if($.isArray(selector)) {
                    len = selector.length;
                    while (++i < len) {
                        obj[selector[i]] = 0;
                    }
                } else if($.isPlainObject(selector)) {
                    obj = selector;
                } else {
                    obj[selector] = 0;
                }
                this._eventBindings(obj, 'off');
                return this;
            },
            _trigger: function(elem, ev, data) {
                elem = elem === 'window' ? $(window) : elem === 'document' ? $(document) : elem;
                var elemLength = $(elem).length;
                data = elemLength ? data : ev;
                ev = elemLength ? ev : elem;
                elem = elem ? elem.jquery ? elem : elemLength ? $(elem) : this.$element : this.$element;
                elem.trigger(ev + this.eventnamespace, data);
                return this;
            },
            _superMethod: function() {
                var args = slice.call(arguments),
                    method = args.shift();
                return jqfactory.common[method].apply(this, args);
            },
            delay: function(handler, delay) {
                function handlerProxy() {
                    return ($.type(handler) === 'string' ? instance[ handler ] : handler).apply(instance, arguments);
                }
                var instance = this;
                return setTimeout(handlerProxy, delay || 0);
            },
            disable: function() {
                this.option('disabled', true);
                this._trigger('disable');
                return this;
            },
            enable: function() {
                this.option('disabled', false);
                this._trigger('enable');
                return this;
            },
            destroy: function() {
                this._trigger('destroy');
                $.removeData(this.callingElement, this.fullname);
                this._off(this._events, 'off');
                return this;
            },
            option: function(key, val) {
                var self = this,
                    keys,
                    keyLen,
                    hasVal = val !== undefined,
                    options = self.options;
                if(arguments.length === 0) {
                    this._trigger('getOptions', options);
                    return options;
                }
                if($.type(key) === 'string' && !key.length) return;
                if($.isPlainObject(key)) {
                    for(var prop in key) {
                        if(key.hasOwnProperty(prop)) {
                            nestedOption(prop, key[prop]);
                        }
                    }
                    this._trigger('setOptions', key);
                } else {
                    keys = key.split('.');
                    keyLen = keys.length;
                    if(keyLen === 1 && !hasVal) {
                        this._trigger('getOption', { key: key, val: options[key] });
                        return options[key];
                   }
                   else if(keyLen === 1 && hasVal) {
                       options[key] = val;
                       this._trigger('setOption', { key: key, val: val });
                   }
                   else {
                       if(val) {
                            nestedOption(key, val);
                            this._trigger('setOption', { key: key, val: val });
                       } else {
                            this._trigger('getOption', { key: key, val: val });
                            return nestedOption(key);
                       }
                   }
               }
               function nestedOption (key, value) {
                   var i = -1,
                       keys = key.split('.'),
                       keyLen = keys.length,
                       currentOptions = options,
                       currentOption;
                   while (++i < keyLen) {
                       currentOption = keys[i];
                       if(currentOptions[currentOption]) {
                           if(keyLen - 1 === i) {
                               if(value !== undefined) {
                                   currentOptions[currentOption] = value;
                                   return;
                               } else {
                                    return currentOptions[currentOption];
                               }
                           }
                           currentOptions = currentOptions[currentOption];
                       }
                   }
               }
               return this;
           },
            _eventBindings: function(pluginEvents, type) {
                var widget = this,
                    widgetElem = widget.$element,
                    spacePos = 0,
                    ev,
                    currentCallback,
                    currentEvent,
                    directElemBinding,
                    elem,
                    $elem;
                type = type || 'on';
                if(type === 'off') {
                    widgetElem.off(widget.eventnamespace);
                }
                for(ev in pluginEvents) {
                    spacePos = ev.lastIndexOf(' ');
                    currentCallback = $.proxy(pluginEvents[ev], widget);
                    directElemBinding = ev.charAt(0) === '!';
                    currentEvent = ev.substring(spacePos + 1) + widget.eventnamespace;
                    if(spacePos === -1) {
                        if(type === 'on') widgetElem.on(currentEvent, currentCallback);
                    } else {
                        if(directElemBinding) {
                            elem = ev.substring(1, spacePos);
                            $elem = elem === 'window' ? $(window) : elem === 'document' ? $(document) : $(elem);
                            if(type === 'on') $elem.on(currentEvent, currentCallback);
                            else if(type === 'off') $elem.off(currentEvent);
                        } else {
                            elem = ev.substring(0, spacePos);
                            if(type === 'on') widgetElem.on(currentEvent, elem, currentCallback);
                        }
                    }
                }
                return this;
            }
        }
    };
    if($.jqfactory === undefined) {
        $.jqfactory = function() {
            jqfactory.create.apply(this, arguments);
        };
        $.jqfactory.common = jqfactory.common;
        $.jqfactory.VERSION = '0.2.0';
    }
}));