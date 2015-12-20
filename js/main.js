(function (window, document, undefined) {

    var basketController;

    document.addEventListener("DOMContentLoaded", onDomContentLoaded);

    function onDomContentLoaded(event) {
        document.removeEventListener("DOMContentLoaded", onDomContentLoaded);
        buildApp();
    }

    function buildApp() {
        if (!basketController) {
            basketController = new BasketController();
            window.basketController = basketController;
        }
    }

    function BasketController() {

        var __instance = this;
        this.shoppingList = new basketapp.model.ShoppingList();
        this.shoppingListView = new basketapp.view.ShoppingListView(this.shoppingList);
        this.shoppingListView.setParent(document.getElementById("shoppingListContainer"));

        var newItemInput = document.getElementById("newItemInput");

        newItemInput.addEventListener("keyup", function (event) {
            if (event.keyCode == 13) {
                addNewItem.call(basketController);
            }
        });

        var plusButton = document.getElementById("newItemCreator").querySelector(".plus-button");

        newItemInput.addEventListener("input", function (event) {
            plusButton.style.opacity = (this.value.length == 0) ? "0.5" : "1";
        });

        plusButton.addEventListener("click", function (e) {
            addNewItem.call(basketController);
        });

        plusButton.style.opacity = "0.5";

        function addNewItem() {

            var item_name = (Helpers.trimString(newItemInput.value));
            if (item_name && item_name.length) {
                addItem(item_name);
            }
            newItemInput.value = "";
            plusButton.style.opacity = "0.5";
        }

        function addItem(item_name) {
            var item = new basketapp.model.Item(item_name);
            __instance.shoppingListView.addItemView(item);

        }

    }

})(window, document);