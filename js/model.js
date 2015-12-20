(function (window, undefined) {

    /*BUILD NAMESPACE*/

    window.basketapp = window.basketapp || {};
    basketapp.model = basketapp.model || {};

    /***********************/
    /* Collection Class    */
    /***********************/

    var Collection = (function () {
        function Collection(type) {
            this.setUID();
            this._items = [];
            this._type = type;
        }

        Object.defineProperty(Collection.prototype, "length", {
            get: function () {
                return this._items.length;
            },
            enumerable: true,
            configurable: false
        });

        //callback gets parameters value, index, collection.
        Collection.prototype.forEach = function (callback, scope) {
            for (var i = 0; i < this._items.length; i++) {
                callback.call(scope, this._items[i], i, this);
            }
        };

        Collection.prototype.add = function (value) {
            if (!this._type || (value instanceof this._type)) {
                this._items.push(value);
            } else {
                throw new Error('Parameter is wrong type!');
            }
        };

        Collection.prototype.delete = function (value) {
            for (var i = 0; i < this._items.length; i++) {
                if (value === this._items[i]) {
                    this._items.splice(i, 1);
                    i--;
                }
            }
        };

        Collection.prototype.setAt = function (index, value) {
            if (!this._type || (value instanceof this._type)) {
                this._items[index] = value;
            } else {
                throw new Error('Parameter is wrong type!');
            }
        };

        Collection.prototype.getAt = function (index) {
            return this._items[index];
        };

        Collection.prototype.deleteAt = function (index) {
            this._items.splice(index, 1);
        };

        Collection.prototype.deleteAll = function (index) {
            this._items.length = 0;
        };

        Collection.prototype.clone = function () {
            var collection = new Collection(this._type);
            collection._items = this._items.slice(0);
            return collection;
        };

        return Collection;
    })();


    /***********************/
    /* Event Class */
    /***********************/

    var Event = (function () {
        function Event(type, targetObj, data) {
            if (typeof type !== "string") {
                throw new Error('Parameter is wrong type!');
                return;
            }
            this.setUID();
            this._data = data || {};
            this._type = type;
            if (!targetObj) {
                this._target = this;
            } else {
                this._target = targetObj;
            }
        }

        Event.prototype.clone = function() {
            return new Event(this._type, this._target, this._data);
        }


        Object.defineProperty(Event.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(Event.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: false
        });


        Object.defineProperty(Event.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: false
        });

        return Event;
    })();

    /*************************/
    /* EventDispatcher Class */
    /*************************/

    var EventDispatcher = (function () {
        function EventDispatcher() {
            this.setUID();
            this._listeners = [];
        }

        EventDispatcher.prototype.hasEventListener = function (type, listener) {
            var exists = false;
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === type && this._listeners[i].listener === listener) {
                    exists = true;
                }
            }
            return exists;
        };
        EventDispatcher.prototype.addEventListener = function (type, listener) {
            if (typeof listener !== "function") {
                throw new Error('Parameter is wrong type!');
                return;
            }
            if (this.hasEventListener(type, listener)) {
                return;
            }
            this._listeners.push({
                type: type,
                listener: listener
            });
        };
        EventDispatcher.prototype.removeEventListener = function (type, listener) {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === type && (!listener || this._listeners[i].listener === listener)) {
                    this._listeners.splice(i, 1);
                }
            }
        };
        EventDispatcher.prototype.dispatchEvent = function (event) {
            /*
            if (window.console && window.console.log) {
                window.console.log("Event disptached event.type=" + event.type);
            }*/
            if (typeof event.type !== "string") {
                throw new Error('Parameter is wrong type!');
                return;
            }
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === event.type || this._listeners[i].type == "*") {
                    this._listeners[i].listener.call(this, event);
                }
            }
        };
        return EventDispatcher;
    })();

    /***********************/
    /* Shopping List Class */
    /* Extends: EventDispatcher*/
    /***********************/

    var ShoppingList = (function () {
        __extends(ShoppingList, EventDispatcher);

        function ShoppingList(options) {
            this.setUID();
            EventDispatcher.call(this);
            this._collectors = new Collection();
            this._items = new Collection(Item);

        }

        /******************/
        /* title property */
        /******************/
        var date = new Date();
        __defineSimpleProperty(ShoppingList, "title", "Shopping List " + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), false);

        /******************/
        /* creator property */
        /******************/
        Object.defineProperty(ShoppingList.prototype, "creator", {
            get: function () {
                //lazy init
                if (!this._creator) {
                    this._creator = new User("--");
                }
                return this._creator;
            },
            set: function (value) {
                if (value instanceof User === false) {
                    throw new Error('creator setter parameter is wrong type!');
                    return;
                }
                if (this.creator.isEqual(value) == false) {
                    this._creator.name = value.name;
                    this._creator.email = value.email;
                    this.dispatchEvent(new Event("change:creator", this));
                }
            },
            enumerable: true,
            configurable: true
        });

        /******************/
        /* items property */
        /******************/
        ShoppingList.prototype.addItem = function (item) {
            if (item instanceof Item === false) {
                throw new Error('Parameter is wrong type!');
                return;
            }
            this._items.add(item);
            this.dispatchEvent(new Event("added:item", item));
        };


        ShoppingList.prototype.getItemAt = function (index) {
            if (index >= 0 && index < this._items.length) {
                return this._items[index];
            }
            return null;
        };

        ShoppingList.prototype.addCollector = function (user) {
            if (user instanceof User === false) {
                throw new Error('Parameter is wrong type!');
                return;
            }

            this._collectors.forEach(function (collector, index, collection) {
                if (user.isEqual(collector)) {
                    if (window.console && window.console.log) {
                        window.console.log(user.toString() + " already added to Collectors");
                    }
                    return;
                }
            }, this);

            this._collectors.add(user);
            this.dispatchEvent(new Event("added:collector", user));
        };

        return ShoppingList;
    })();


    /***********************/
    /* Item Class */
    /***********************/
    /*
     *
     *
     •  Name (required)
     •  Amount
     •  Unit
     •  Price
     •  Mark as bought (collected)
     •  Assign
     •  Comments
     */
    var Item = (function () {
        __extends(Item, EventDispatcher);

        function Item(name) {
            this.setUID();
            EventDispatcher.call(this);

            var instance = this;
            initProps(name);

            this._comments = new Collection();

            function initProps(name) {
                var quantity;
                var unit;
                var words = name.split(" ");

                if (words.length > 1) {
                    var last_word = words[words.length - 1];
                    if (words.length > 2) {
                        quantity = parseInt(words[words.length - 2]);
                        if (!isNaN(quantity)) {

                            instance._name = words.slice(0, words.length - 2).join(" ");
                            instance._quantity = quantity;
                            instance._unit = last_word;
                            return;
                        }

                    }
                    if (words.length > 1) {
                        quantity = parseInt(last_word);
                        if (!isNaN(quantity)) {

                            instance._name = words.slice(0, words.length - 1).join(" ");
                            instance._quantity = quantity.toString();

                            if (last_word.length > instance._quantity.length) {
                                instance._unit = last_word.substr(instance._quantity.length);
                            } else {
                                instance._unit = "";
                            }
                            return;
                        }

                    }
                }


                instance._name = name;
                instance._quantity = "";
                instance._unit = "";
            }
        }

        /******************/
        /* name property */
        /******************/
        __defineSimpleProperty(Item, "name", "", false);
        /******************/
        /* quantity property */
        /******************/
        __defineSimpleProperty(Item, "quantity", "", false);
        /* unit property */
        /******************/
        __defineSimpleProperty(Item, "unit", "", false);
        /* price property */
        /******************/
        __defineSimpleProperty(Item, "price", "", false);
        /* assigned property */
        /******************/
        __defineSimpleProperty(Item, "assigned", "", false);
        /******************/
        /* collected property */
        /******************/
        __defineSimpleProperty(Item, "collected", false, false);


        return Item;
    })();

    /***********************/
    /* User Class */
    /* VERY SIMPLE */
    /***********************/
    var User = (function () {
        function User(name, email) {
            this.setUID();
            this.name = name || "";
            this.email = email || "";
        }

        User.prototype.isEqual = function (user) {
            if (user instanceof User) {
                return (user.name == this.name && user.email == this.email);
            }
            return false;
        };

        User.prototype.toString = function () {
            return "User(name:'" + this.name + "',email:'" + this.email + "')";
        };

        return User;
    })();


    basketapp.model.Collection = Collection;
    basketapp.model.Event = Event;
    basketapp.model.EventDispatcher = EventDispatcher;
    basketapp.model.ShoppingList = ShoppingList;
    basketapp.model.Item = Item;
    basketapp.model.User = User;


})(window, document);




