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


        widgetBase: null,

        // Internal variables.j
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {

            logger.debug(this.id + ".postCreate");

        },

        getCustomerData: function() {
            mx.data.get({
                xpath: "//" + this.CustomerEntity,
                callback: function(objs) {

                    let customerList = objs.map(obj => {
                        return {
                            email: obj.get(this.Email),
                            name: obj.get(this.Name)
                        };
                    })
                    console.log(customerList);
                    //console.log(objs.map(obj => {obj.jsonData.attributes.Email.value}));
                    this.getCustomerIntoField(customerList);
                }.bind(this)
            })
        },
        // saveInvitationData: function(from, to) {
        //     mx.data.create({
        //         entity: "TestSuite.Invitation", 
        //         callback: function(obj) {
        //             console.log("Object created on server")
        //             console.log(obj);
        //         }, 
        //         error: function(e) {
        //             console.log("an error occured" + e); 
        //         }
        //     })
        // },
        getCustomerIntoField: function(customerList) {

            var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

            //$(this.selectTo).val("khoai@gmail.com");
            //this.inputText.value = "test";
            // this.selectTo.value="test";    
            var preLoadValue = [];
            var preLoadFromValue = this._contextObj.jsonData.attributes.From.value; //use get("attribute")
            var preLoadToValue = this._contextObj.jsonData.attributes.To.value; //unused variable?
            if (this.maxItems === 1) {
                preLoadValue.push(this._contextObj.jsonData.attributes.From.value); //? From ?
            } else {
                var toValue = this._contextObj.jsonData.attributes.To.value; //where "To" come from?
                if (toValue.indexOf(',') > -1) { //do we need this?
                    preLoadValue = toValue.split(',');
                } else {
                    preLoadValue.push(toValue);
                }

            }
            var $select = $(this.selectTo).selectize({
                persist: true, //do we need this?
                maxItems: this.maxItems,
                valueField: 'email',
                labelField: 'name',
                searchField: ['name', 'email'],
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
                            console.log(obj);
                        },
                        error: function(e) {
                            console.log("an error occured" + e);
                        }
                    });

                }.bind(this),
                render: { //how we can make the render customizeable instead of hard code? (user should be able to config this as template in widget)
                    item: function(item, escape) {
                        return '<div>' +
                            (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                            (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
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
                },
                createFilter: function(input) { //unused function?
                    var match, regex;
                    // email@address.com
                    regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
                    match = input.match(regex);
                    if (match) return !this.options.hasOwnProperty(match[0]);

                    // name <email@address.com>
                    regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
                    match = input.match(regex);
                    if (match) return !this.options.hasOwnProperty(match[2]);

                    return false;
                },
                create: function(input) { //unused funciton?
                    if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                        return {
                            email: input
                        };
                    }
                    var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
                    if (match) {
                        return {
                            email: match[2],
                            name: $.trim(match[1])
                        };
                    }
                    alert('Invalid email address.');
                    return false;
                }
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
