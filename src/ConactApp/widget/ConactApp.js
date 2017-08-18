define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "ConactApp/lib/jquery-1.11.2",
    "ConactApp/lib/selectize",
    "dojo/text!ConactApp/widget/template/ConactApp.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, selectize, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    return declare("ConactApp.widget.ConactApp", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,
        _attributeList: null,
        _displayTemplate: "",
        _selectedTemplate: "",


        widgetBase: null,

        // Internal variables.j
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {

            logger.debug(this.id + ".postCreate");


            this._attributeList = this._variableContainer;
            this._displayTemplate = this.displayTemplate;
            this._selectedTemplate = this.selectedTemplate;

        },

        getCustomerData: function() {
            mx.data.get({
                xpath: "//" + this.CustomerEntity,
                callback: function(objs) {

                    let customerList = objs.map(obj => {
                        return {
                            attr_2: obj.get(this.Name),
                            attr_1: obj.get(this.Email)
                            
                        };
                    })
                    console.log(customerList);
                    this.getCustomerIntoField(customerList);
                }.bind(this)
            })
        },
        getCustomerIntoField: function(customerList) {

            var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

            var preLoadValue = [];
            const FROM_FLIELD = "From"; 
            const TO_FIELD = "To";
           
            if (this.maxItems === 1) {
                preLoadValue.push(this._contextObj.get(FROM_FLIELD));
            } else {
                var toValue = this._contextObj.get(TO_FIELD);
                    preLoadValue = toValue.split(',');
            }
            var $select = $(this.selectTo).selectize({
                maxItems: this.maxItems,
                valueField: 'attr_1',
                labelField: 'attr_2',
                searchField: ['attr_2', 'attr_1'],
                items: preLoadValue,
                options: customerList,
                placeholder: this.placeHolder,
                hideSelected: true,
                onChange: function(value) {
                    this._contextObj.set(this.InputField, value);
                    mx.data.commit({
                        mxobj: this._contextObj,
                        callback: function() {}
                    })
                    mx.data.create({
                        entity: "TestSuite.Invitation",
                        callback: function(obj) {
                            console.log("Object created on server")
                           // console.log(obj);
                        },
                        error: function(e) {
                            console.log("an error occured" + e);
                        }
                    });

                }.bind(this),
                render: { //how we can make the render customizeable instead of hard code? (user should be able to config this as template in widget)
                    item: function(item, escape) {
                        console.log(item);
                        return '<div>' +
                            (item.attr_2 ? '<span class="name">' + escape(item.attr_2) + '</span>' : '') +
                            (item.attr_1 ? '<span class="email">' + escape(item.attr_1) + '</span>' : '') +
                            (item.attr_3 ? '<span class="email">' + escape(item.attr_3) + '</span>' : '') +
                            (item.attr_4 ? '<span class="email">' + escape(item.attr_4) + '</span>' : '') +
                            (item.attr_5 ? '<span class="email">' + escape(item.attr_5) + '</span>' : '')
                            '</div>';
                    },
                    option: function(item, escape) {
                        var label = item.name || item.email;
                        var caption = item.name ? item.email : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                            '</div>';
                    }
                }
                // createFilter: function(input) { //unused function?
                //     var match, regex;
                //     // email@address.com
                //     regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
                //     match = input.match(regex);
                //     if (match) return !this.options.hasOwnProperty(match[0]);

                //     // name <email@address.com>
                //     regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
                //     match = input.match(regex);
                //     if (match) return !this.options.hasOwnProperty(match[2]);

                //     return false;
                // },
                // create: function(input) { //unused funciton?
                //     if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                //         return {
                //             email: input
                //         };
                //     }
                //     var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
                //     if (match) {
                //         return {
                //             email: match[2],
                //             name: $.trim(match[1])
                //         };
                //     }
                //     alert('Invalid email address.');
                //     return false;
                // }
            }).bind(this);
        },
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this.getCustomerData()

            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function(mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function(objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function(error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function(cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["ConactApp/widget/ConactApp"]);
