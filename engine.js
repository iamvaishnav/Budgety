var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100)
        }

    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }


    var dataTotals = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        })
        data.totals[type] = sum;
    };
    return {
        writeItems: function(type, description, value) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0
            }

            if (type === 'inc') {
                newItem = new Income(ID, description, value);

            } else if (type === 'exp') {
                newItem = new Expense(ID, description, value);

            }
            data.allItems[type].push(newItem)
            return newItem;
        },

        eraseItem: function(type, id) {
            var itemsArray, index, ids;
            itemsArray = data.allItems[type];
            ids = itemsArray.map(function(current) {
                return current.id;
            })
            index = ids.indexOf(id);
            if (index !== -1) {
                itemsArray.splice(index, 1);
            }

        },

        budgetCalculator: function() {
            dataTotals('inc');
            dataTotals('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }


        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: function() {
            return data;
        }
    }



})();

var uiController = (function() {
    var DOMStrings = {
        inputType: '.type-selector',
        inputDescription: '.description',
        inputValue: '.value',
        inputBtn: '.add-btn',
        incomeContainer: '.income',
        expenseContainer: '.expense',
        budgetLabel: '.budget-value',
        incomeLabel: '.income-value',
        expenseLabel: '.expense-value',
        percentageLabel: '.expense-value-percentage',
        container: '.bottom-container',
    }

    return {
        readInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: function() {

                    document.querySelector(DOMStrings.inputDescription).addEventListener('keypress', function(event) {

                        if (event.keyCode === 13) {
                            document.querySelector(DOMStrings.inputValue).focus();
                        }

                    })
                    return document.querySelector(DOMStrings.inputDescription).value;
                },
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            };

        },
        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item " id="inc-%id%"> <div class="item-desc">%description%</div><div class="item-delete"><button class="delete-btn"><ion-icon name="close-circle-outline"></ion-icon></button></div><div class="item-value-container">%value%</div></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item " id="exp-%id%"> <div class="item-desc">%description%</div><div class="item-delete"><button class="delete-btn"><ion-icon name="close-circle-outline"></ion-icon></button></div><div class="item-value-percentage">25%</div><div class="item-value-container">%value%</div></div>'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%description%', obj.description);
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml)
        },

        deleteListItem: function(selectorId) {
            document.getElementById(selectorId).remove();
        },
        clearFields: function() {
            var field, fieldArray;
            field = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldArray = Array.prototype.slice.call(field);
            fieldArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldArray[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExpense;
            document.querySelector(DOMStrings.percentageLabel).style.display = 'inline-table';
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        }

    }


})();

var budgetUpdater = function() {
    budgetController.budgetCalculator();
    var budget = budgetController.getBudget();
    uiController.displayBudget(budget)
}


var inputController = (function(budgetCtrl, uiCtrl) {

    var setupEventListener = function() {
        var DOM = uiController.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', addItem)
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                addItem();
            }
        })
        document.querySelector(DOM.container).addEventListener('click', deleteItem)
    }



    var addItem = function() {
        var input = uiCtrl.readInput();
        var description = input.description();
        if (description !== "" && !isNaN(input.value) && input.value > 0) {
            var newItem = budgetCtrl.writeItems(input.type, input.description, input.value);
            uiCtrl.addListItem(newItem, input.type);
            uiCtrl.clearFields();
            budgetUpdater();
        }


    }


    var deleteItem = function(event) {
        var itemID, splitID, id;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            budgetCtrl.eraseItem(type, id);
            uiCtrl.deleteListItem(itemID);
            budgetUpdater();

        }
    }


    return {
        init: function() {
            setupEventListener();
            console.log('Application has started')
            uiCtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1,
            })
        }
    }


})(budgetController, uiController);
inputController.init()