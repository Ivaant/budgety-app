//BUDGET CONTROLLER (MODEL)
const budgetController = (function() {

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentageOfTotal = function(total) {
        if (total > 0) {
            this.percentage = Math.round((this.value / total) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Income.prototype.calculatePercentageOfTotal = function(total) {
        if (total > 0) {
            this.percentage = Math.round((this.value / total) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Income.prototype.getPercentage = function() {
        return this.percentage;
    };

    const data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    const calculateTotal = function(type) {
        data.totals[type] = data.allItems[type].reduce((sum, item) => {
            return sum += item.value;
        }, 0);
    };
    //Calculate each item percentage of total income
    const calculateAllItemsPercentage = function(type) {
        data.allItems[type].forEach(item => {
            item.calculatePercentageOfTotal(data.totals.inc);
        });
    };

    return {
        addItem: function(type, des, val) {
            let newItem, ID, percentage;
            //create new ID
            if (data.allItems[type].length === 0) ID = 0;
            else ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            //create new item
            if (type === "inc") {
                newItem = new Income(ID, des, val);
            } else if (type === "exp") {
                newItem = new Expense(ID, des, val);
            }
            //push new item to data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id) {
            data.allItems[type] = data.allItems[type].filter(item => item.id !== id);

            // const ids = data.allItems[type].map(elem => elem.id);
            // const foundID = ids.indexOf(id);
            // if (foundID !== -1)
            //     data.allItems[type].splice(foundID, 1);
        },
        calculateBudget: function() {
            //Calculate totals of income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //Calculate each item percentage of total income
            calculateAllItemsPercentage("exp");
            calculateAllItemsPercentage("inc");

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate percentage of income we spent
            if (data.totals.inc > 0) {
                //Calculate total expenses percentage of total income
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else data.percentage = -1;
        },
        getAllItems: function(type) {
            return data.allItems[type];
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function() {
            console.log(data);
        }
    };
})();


//UI CONTROLLER
const UIController = (function() {

    const DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        buttonAdd: ".add__btn",
        divIncomeList: ".income__list",
        divExpensesList: ".expenses__list",
        divBudgetValue: ".budget__value",
        divBudgetIncomeValue: ".budget__income--value",
        divBudgetExpensesValue: ".budget__expenses--value",
        divBudgetPercentageValue: ".budget__expenses--percentage",
        divItemsContainer: ".container",
        spanTitleDate: ".budget__title--month"
    };

    const formatNumber = function(num, type) {
        let sign;
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        sign = type === 'inc' ? '+ ' : type === 'exp' ? '- ' : '';
        return sign + formatter.format(num);
    };

    const createItemHtml = function(object, type) {
        let html, newHtml;
        if (type === 'inc') {
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp') {
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        //replace placeholder text with real data
        newHtml = html.replace('%id%', object.id);
        newHtml = newHtml.replace('%description%', object.description);
        newHtml = newHtml.replace('%value%', formatNumber(object.value, type));
        if (object.percentage > 0) {
            newHtml = newHtml.replace('%percentage%', object.percentage + '%');
        } else {
            newHtml = newHtml.replace('%percentage%', '---');
        }
        return newHtml;
    };

    //UI code here
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        showAllItems: function(items, type) {
            let listContainerClass, element;
            //Get the DOM container element
            if (type === 'inc') {
                listContainerClass = DOMstrings.divIncomeList;
            } else if (type === 'exp') {
                listContainerClass = DOMstrings.divExpensesList;
            }
            element = document.querySelector(listContainerClass);

            //Clear the container element
            while (element.firstChild) element.removeChild(element.lastChild);

            //Populate the container element with items html
            items.forEach(item => {
                const itemHtml = createItemHtml(item, type);
                element.insertAdjacentHTML('beforeend', itemHtml);
            });
        },
        removeListItem: function(selectorID) {
            document.querySelector("#" + selectorID).remove();
            //Alternative way
            /*elem = document.getElementById("selectorID");
            elem.parentNode.removeChild(elem);*/
        },
        displayBudget: function(budget) {
            document.querySelector(DOMstrings.divBudgetValue).textContent = formatNumber(budget.budget);
            document.querySelector(DOMstrings.divBudgetIncomeValue).textContent = formatNumber(budget.totalInc, "inc");
            document.querySelector(DOMstrings.divBudgetExpensesValue).textContent = formatNumber(budget.totalExp, "exp");


            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.divBudgetPercentageValue).textContent = budget.percentage + "%";
            } else {
                document.querySelector(DOMstrings.divBudgetPercentageValue).textContent = "---";
            }

        },
        clearFields: function() {
            let fieldsList, fieldsArray;

            fieldsList = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fieldsList);

            fieldsArray.forEach(field => {
                field.value = "";
            });
            fieldsArray[0].focus();
        },

        getDOMstrings: function() {
            return DOMstrings;
        },
        displayCurrentDate: function() {
            const date = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });
            document.querySelector(DOMstrings.spanTitleDate).textContent = date;
        },
        typeChanged: function() {
            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            Array.from(fields).forEach(field => {
                field.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.buttonAdd).classList.toggle("red");
        }
    };
})();



//APP CONTROLLER
const controller = (function(budgetCtrl, UICtrl) {

    const setupEventListeners = function() {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.buttonAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.divItemsContainer).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.typeChanged);
    };

    const updateBudget = function() {
        let budget;
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        budget = budgetCtrl.getBudget();
        //3. Display the budget to UI
        UICtrl.displayBudget(budget);
    };

    const updateAllItems = function(type) {
        const allItems = budgetCtrl.getAllItems(type);
        UICtrl.showAllItems(allItems, type);
    };



    const ctrlAddItem = function() {
        let input, allItems;
        //1. Get the input field data.
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the budget controller
            budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Calculate and update the budget
            updateBudget();

            //4. Display all items to the UI controller
            updateAllItems("inc");
            updateAllItems("exp");

            //5. Clear the fields
            UICtrl.clearFields();
        }
    };

    const ctrlDeleteItem = function(event) {
        let itemID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            [type, id] = itemID.split("-");

            //1. Delete the item from data structure
            budgetCtrl.deleteItem(type, parseInt(id));

            //2. Update the budget in data structure and in UI
            updateBudget();

            //3. Delete the item from UI
            //UICtrl.removeListItem(itemID);

            //4. Display all items to the UI controller
            updateAllItems("inc");
            updateAllItems("exp");
        }
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayCurrentDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            console.log("Application has started...")
        }
    }
})(budgetController, UIController);

controller.init();