(function (window, document, undefined) {

    /*BUILD NAMESPACE*/

    window.basketapp = window.basketapp || {};
    basketapp.view = basketapp.view || {};

    var AbstractView = (function () {
        __extends(AbstractView, basketapp.model.EventDispatcher);

        //preload icon images
        var editIcon = new Image();
        editIcon.src = "images/edit-icon.png";
        var closeIcon = new Image();
        closeIcon.src = "images/close-icon.png";

        function AbstractView() {
            basketapp.model.EventDispatcher.call(this);
            setUID();
        }

        AbstractView.prototype.setParent = function (value) {
            if (this._root) {
                if (value instanceof Element) {
                    value.appendChild(this._root);
                } else if (value === null) {
                    if (this._root.parentNode) {
                        this._root.parentNode.removeChild(this._root);
                    }
                }
            }
        };


        AbstractView.prototype.toggleEditIcon = function (editSpan, showX) {
            var img_element = editSpan.querySelector("img");
            if (img_element) {
                if (showX) {
                    img_element.src = closeIcon.src;
                    img_element.alt = "close";
                } else {
                    img_element.src = editIcon.src;
                    img_element.alt = "edit";
                }
            }
        };

        return AbstractView;
    })();

    basketapp.view.AbstractView = AbstractView;

    var ControlView = (function () {
        __extends(ControlView, AbstractView);

        function ControlView(propName, inputElement) {
            AbstractView.call(this);
            this._propName = propName;
            this._element = inputElement;
            this._type = this._element.type;
        }

        Object.defineProperty(ControlView.prototype, "value", {
            get: function () {
                switch (this._type) {
                    case "text":
                        return this._element.value;
                        break;
                    case "checkbox":
                        return this._element.checked;
                        break;
                }
            },
            set: function (value) {
                switch (this._type) {
                    case "text":
                        this._setValue = value;
                        this._element.value = value;
                        break;
                    case "checkbox":
                        this._setValue = (value === true);
                        this._element.checked = this._setValue;
                        break;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ControlView.prototype, "changed", {
            get: function () {

                switch (this._type) {
                    case "text":
                        return (this._setValue != this._element.value);
                        break;
                    case "checkbox":
                        return (this._setValue != this._element.checked);
                        break;
                }
                return false;
            },
            enumerable: true,
            configurable: false
        });

        return ControlView;
    })();
    
    basketapp.view.ControlView = ControlView;

    var ShoppingListView = (function () {
        __extends(ShoppingListView, AbstractView);

        function ShoppingListView(shoppingList) {
            AbstractView.call(this);
            this._itemViews = new basketapp.model.Collection(ItemView);
            this._shoppingList = shoppingList;
            this._editorOpen = false;
        }

        //OVERRIDE setParent
        ShoppingListView.prototype.setParent = function (value) {
            if (!this._root) {
                if (value instanceof Element == false) {
                    throw new Error('ShoppingListView.setParent parameter is wrong type!');
                    return;
                }
                this._root = value;
                this._titleSpan = this._root.querySelector("h2 span");
                this._titleSpan.textContent = this._shoppingList.title;
                this._itemList = this._root.querySelector("ul");
                this._editIcon = this._root.querySelector(".edit-icon");

                this._editor = document.getElementById("shoppingListEditor");

                this._editor.querySelector("#listTitleInput").value = this._shoppingList.title;

                

                this._editIcon.addEventListener("click", clickHandler);
            }

            __instance = this;

            function clickHandler(e) {

                toggleItemEditor.call(__instance);

                if (e && e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }

            function toggleItemEditor() {
                if (!this._editorOpen) {
                    //this._itemEditor.udateControls();
                    this._editor.querySelector("#listTitleInput").value = this._shoppingList.title;
                    this._editor.style.display = "block";
                    this._editorOpen = true;
                } else {
                    this._shoppingList.title = this._editor.querySelector("#listTitleInput").value;
                    this._titleSpan.textContent = this._shoppingList.title;
                    this._editor.style.display = "none";
                    this._editorOpen = false;
                }
                this.toggleEditIcon(this._editIcon, this._editorOpen);
            }

        };

        ShoppingListView.prototype.addItemView = function (item) {
            var __instance = this;
            if (this._itemList) {
                var item_view = new ItemView(item);
                item_view.setParent(this._itemList);
                this._itemViews.add(item_view);
                item_view.setIndex(this._itemViews.length);
                item_view.addEventListener("remove", itemRemoveEventHandler);
            }


            function itemRemoveEventHandler(event) {
                if (this instanceof ItemView) {
                    __instance._removeItem.call(__instance, this);
                }
                this.removeEventListener("remove", itemRemoveEventHandler);
            }
        };

        ShoppingListView.prototype._removeItem = function (itemView) {
                
            var delete_index = -1;
            this._itemViews.forEach(
                function(item_view, index, collection) {
                    if (item_view === itemView) {
                        delete_index = index;
                    } else if (delete_index != -1 && index > delete_index) {
                        item_view.setIndex(index);
                    }
                }, this);

            if (delete_index != -1) {
                this._itemViews.deleteAt(delete_index);
            }

            this._itemList.removeChild(itemView._root);
            itemView.removeEventListeners();
            itemView = null;

        };
        return ShoppingListView;
    })();

    basketapp.view.ShoppingListView = ShoppingListView;

    var ItemView = (function () {
        __extends(ItemView, AbstractView);

        function ItemView(item) {
            if (item instanceof basketapp.model.Item == false) {
                throw new Error('ItemView item is wrong type!');
                return;
            }
            AbstractView.call(this);
            var __instance = this;
            this._item = item;
            this._root = document.createElement("li");
            this._root.className = "shopping-list-item";

            this._editorOpen = false;

            this._head = document.createElement("div");
            this._head.className = "item-head";
            this._root.appendChild(this._head);

            this._editor = document.createElement("div");
            this._editor.className = "editor-container";
            this._root.appendChild(this._editor);


            this._index = document.createElement("span");
            this._index.className = "item-index";
            this._index.textContent = "1.";
            this._head.appendChild(this._index);

            this._name = createPropElement("name");
            this._quantity = createPropElement("quantity");
            this._unit = createPropElement("unit");

            this._itemEditor = new ItemEditorView();
            this._itemEditor.setItem(item);
            this._itemEditor.addEventListener("close", itemEditorEventHandler);
            this._itemEditor.addEventListener("remove", itemEditorEventHandler);


            this._editIcon = document.createElement("span");
            this._editIcon.className = "edit-icon";
            this._editIcon.style.float = "right";
            var edit_icon_image = new Image();
            edit_icon_image.src = "images/edit-icon.png";
            edit_icon_image.alt = "edit";
            this._editIcon.appendChild(edit_icon_image);
            this._head.appendChild(this._editIcon);


            var element = document.createElement("span");
            element.style.float = "right";
            this._collectedCb = document.createElement("input");
            this._collectedCb.type = "checkbox";
            this._collectedCb.className = "collected-cb";

            this._collectedCb.checked = (this._item.collected == true);
            var collected_cb_id = "collectedCb"+this._uid;
            this._collectedCb.setAttribute("id", collected_cb_id);
            this._collectedCb.addEventListener("click", collectedCbChangeHandler);
            var collected_cb_label = document.createElement("label");
            collected_cb_label.setAttribute("for", collected_cb_id);
            collected_cb_label.textContent = "Collected";

            element.appendChild(this._collectedCb);
            element.appendChild(collected_cb_label);
            this._head.appendChild(element);

            this._item.addEventListener("change:collected", collectedChangeHandler);


            this._name.addEventListener("click", clickHandler);
            this._index.addEventListener("click", clickHandler);
            this._editIcon.addEventListener("click", clickHandler);

            function collectedCbChangeHandler(e) {
                if (__instance._collectedCb.checked) {
                    __instance._item.collected = true;
                } else {
                    __instance._item.collected = false;
                }
            }

            function collectedChangeHandler(event) {
                if (__instance._item.collected == true) {
                    __instance._name.style.textDecoration = "line-through";
                } else {

                    __instance._name.style.textDecoration = "none";
                }
            }

            function itemEditorEventHandler(event) {
                if (event.type === "close") {
                    toggleItemEditor.call(__instance, "-");
                } else if (event.type === "remove") {
                    toggleItemEditor.call(__instance, "-");
                    window.setTimeout(
                        function() {
                            __instance.dispatchEvent.call(__instance, event.clone());
                        }, 200);

                }
            }

            function clickHandler(e) {

                toggleItemEditor.call(__instance);

                if (e && e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }

            var __timeoutID;

            /*
            * direction parameter is optional
             * if "+" editor is only opened
             * if "-" editor is only closed
             * otherwise it toggles as usual
            * */
            function toggleItemEditor(direction) {

                if (this._editorOpen && direction !== "+") {
                    this._editor.style.maxHeight = "0";
                    this._editor.style.height = "0";
                    this._editorOpen = false;
                } else if (!this._editorOpen && direction !== "-") {
                    this._itemEditor.setParent(this._editor);
                    this._itemEditor.udateControls();
                    this._editor.style.height = "auto";
                    this._editor.style.maxHeight = "500px";
                    this._editorOpen = true;

                    if (__timeoutID) {
                        window.clearTimeout(__timeoutID);
                        __timeoutID = 0;
                    }

                    __timeoutID = window.setTimeout(function () {
                        if (__instance._editorOpen) {
                            __instance._editor.style.maxHeight = "999px";
                        }
                        __timeoutID = 0;
                    }, 2000);
                } else {
                    return;
                }
                this.toggleEditIcon(this._editIcon, this._editorOpen);
            }


            this.removeEventListeners = function () {
                this._head.removeEventListener("click", clickHandler);
                this._editIcon.removeEventListener("click", clickHandler);
                this._item.removeEventListener("*", changePropEventHandler);
            };

            function changePropEventHandler(event) {
                if (event.type.indexOf("change:" == 0)) {
                    var prop = event.type.split(":")[1];
                    if (__instance.hasOwnProperty("_" + prop)) {
                        __instance["_" + prop].innerHTML = this[prop];
                    }
                }
            }

            function createPropElement(prop) {
                var element = document.createElement("span");
                element.className = "item-" + prop;
                element.textContent = __instance._item[prop];
                __instance._item.addEventListener("change:" + prop, changePropEventHandler);
                __instance._head.appendChild(element);
                return element;
            }
        }

        ItemView.prototype.setIndex = function (value) {
            this._index.textContent = value + ".";
        };

        return ItemView;
    })();

    basketapp.view.ItemView = ItemView;


    var ItemEditorView = (function () {
        __extends(ItemEditorView, AbstractView);

        var _template = null;


        function ItemEditorView() {
            AbstractView.call(this);
            var __instance = this;
            this._item = null;
            this._root = document.createElement("div");
            this._root.className = "editor";
            if (!_template) {
                _template = document.getElementById("itemEditorTemplate").textContent;
            }
            this._root.innerHTML = _template.replace(/{id}/g, this._uid);

            this._controlViews = {};

            var input_elements = this._root.querySelectorAll("input");
            for (var i = 0; i < input_elements.length; i++) {
                var input_el = input_elements[i];
                var prop = input_el.getAttribute("data-prop");
                var control_view = new ControlView(prop, input_el);
                this._controlViews[prop] = control_view;
            }

            this._saveButton = this._root.querySelector(".save-button");
            this._saveButton.addEventListener("click", saveClickHandler);

            this._cancelButton = this._root.querySelector(".cancel-button");
            this._cancelButton.addEventListener("click", cancelClickHandler);

            this._removeButton = this._root.querySelector(".remove-button");
            this._removeButton.addEventListener("click", removeClickHandler);

            this._commentsSection = this._root.querySelector(".comments-section");
            this._commentsList = this._commentsSection.querySelector("ul");

            this._commentsTextarea = this._commentsSection.querySelector(".comments-section textarea");

            var place_holder_text = Helpers.trimString(this._commentsTextarea.value);
            this._commentsTextarea.addEventListener("focus", commentsTextareaFocusHandler);
            this._commentsTextarea.addEventListener("blur", commentsTextareaBlurHandler);

            

            this._addCommentsButton = this._commentsSection.querySelector(".addcomment-button");
            this._addCommentsButton.addEventListener("click", addCommentsClickHandler);

            function commentsTextareaFocusHandler(e) {
                if (Helpers.trimString(this.value) == place_holder_text) {
                    this.value = "";
                }
            }


            function commentsTextareaBlurHandler(e) {
                if (Helpers.trimString(this.value) == "") {
                    this.value = place_holder_text;
                }
            }


            function addCommentsClickHandler(e) {
                var comment_value = Helpers.trimString(__instance._commentsTextarea.value);
                if (comment_value != "" && comment_value != place_holder_text) {
                    var li_element = document.createElement("li");
                    li_element.textContent = "[user]: " + comment_value;
                    __instance._commentsList.appendChild(li_element);
                    __instance._commentsTextarea.value = place_holder_text;
                }

                if (e && e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }


            function saveClickHandler(e) {

                __instance.saveChanges.call(__instance);
                __instance.dispatchEvent.call(__instance, new basketapp.model.Event("close"));

                if (e && e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }

            function cancelClickHandler(e) {

                __instance.udateControls.call(__instance);
                __instance.dispatchEvent.call(__instance, new basketapp.model.Event("close", __instance));


                if (e && e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
                
            }

            function removeClickHandler(e) {
                if (confirm("Are you sure you want to remove item?")) {
                    __instance.dispatchEvent.call(__instance, new basketapp.model.Event("remove", __instance));
                }
            }

        }

        ItemEditorView.prototype.udateControls = function () {
            if (this._root) {
                for (prop in this._controlViews) {
                    var control_view = this._controlViews[prop];
                    control_view.value = this._item[prop];
                }
            }
        };


        ItemEditorView.prototype.saveChanges = function () {
            if (this._root) {

                for (prop in this._controlViews) {
                    var control_view = this._controlViews[prop];
                    if (control_view.changed) {
                        this._item[prop] = control_view.value;
                        //mark as unchanged
                        control_view.value == control_view.value;
                    }
                }
            }
        };

        ItemEditorView.prototype.setItem = function (item) {
            if (item instanceof basketapp.model.Item == false) {
                throw new Error('ItemEditorView.setItem: item parameter is wrong type!');
                return;
            }

            if (this._item !== null) {
                throw new Error('ItemEditorView.setItem: item can be set only once!');
                return;
            }

            if (this._item !== item) {
                this._item = item;
            }

        };


        return ItemEditorView;
    })();

    basketapp.view.ItemEditorView = ItemEditorView;

})
(window, document);