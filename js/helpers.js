if (typeof Array.prototype.indexOf != "function") {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
}

if (typeof window.requestAnimationFrame != "function") {
    window.requestAnimationFrame = (
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    }
    );
}

Helpers = {
    trimString: function (str) {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    },

    addEvent: function (evnt, elem, handler) {
        if (elem.addEventListener)  // W3C DOM
            elem.addEventListener(evnt, handler, false);
        else if (elem.attachEvent) { // IE DOM
            elem.attachEvent("on" + evnt, function (e) {
                return handler.call(elem, e)
            });
        } else { // No much to do
            elem["on" + evnt] = handler;
        }
    },

    isTouchDevice: function () {
        return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
    },


    validateEmail: function (email) {
        return (email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) !== null);
    },

    getWindowInnerWidth: function () {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    },

    getWindowInnerHeight: function () {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },

//CSS MANIPULATION

    hasClass: function (elem, className) {
        if (elem.className.indexOf(className) !== -1) {
            return false;
        }
        return ((" " + elem.className + " ").indexOf(' ' + className + ' ') !== -1);
        //return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
    },

    addClass: function (elem, className) {
        if (!hasClass(elem, className)) {
            elem.className += ' ' + className;
        }
    },

    removeClass: function (elem, className) {
        if (hasClass(elem, className)) {
            var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
            while (newClass.indexOf(' ' + className + ' ') !== -1) {
                newClass = newClass.replace(' ' + className + ' ', ' ');
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    },

    toggleClass: function (elem, className) {
        if (hasClass(elem, className)) {
            removeClass(elem, className);
        } else {
            elem.className += ' ' + className;
        }
    }

}

/***************/
/* CLASS HELPERS */
/***************/

var __uid = (new Date()).getTime() / 1000 | 0;
Object.prototype.setUID = function() {
    this._uid = "_" + __uid.toString(16);
    __uid++;
}

function __extends(derived, base) {
    function __() {
        this.constructor = derived;
    }

    __.prototype = base.prototype;
    derived.prototype = new __();
};

function __defineSimpleProperty(constructor, property, defaultValue, readOnly) {
    Object.defineProperty(constructor.prototype, property, {
        get: function () {
            if (typeof this["_" + property] == "undefined") {
                this["_" + property] = defaultValue;
            }
            return this["_" + property];
        },
        set: function (value) {
            if (readOnly) {
                throw new Error('Property is read only!');
                return;
            }
            if (defaultValue && typeof value !== typeof defaultValue) {
                throw new Error('Cannot set ' + property + ' to type "' + typeof value + '"!');
                return;
            }
            if (value !== this["_" + property]) {
                this["_" + property] = value;
                this.dispatchEvent(new Event("change:" + property, this));
            }
        },
        enumerable: true,
        configurable: !readOnly
    });
};




