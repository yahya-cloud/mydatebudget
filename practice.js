
var budgetController = (function() {

var Income =  function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
}

var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
}

Expense.prototype.calcPercentage = function(totalIncome){

    if(totalIncome > 0){
    this.percentage = Math.round((this.value / totalIncome) * 100 )
    }else {
        this.percentage = -1
    }

}

Expense.prototype.getPercentage = function(){
    return this.percentage
}

var calculateTotal =  function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(cur) {
        sum += cur.value;
    })
    data.totals[type] = sum;
}

var data = {
    allItems:{
        inc: [],
        exp: []
    },
    totals:{
        inc: 0,
        exp: 0
    },
    budget:0,
    percentage:-1
}

return {
    addItem: function(type, des, value){
        var newItem, ID;
        //Generating ID
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1
        }else{
            ID = 0;
        }

        //Creating New Instance 
        if(type === 'exp'){
            newItem = new Expense(ID, des, value)
        }else if(type === 'inc'){
            newItem = new Income(ID, des, value)
        }

      

        //Pushing it to Array
        data.allItems[type].push(newItem)

        return newItem
    },

    deleteItem: function(type, id){
        var ids, index;

        ids = data.allItems[type].map(function(current){
        return current.id
        })

        index = ids.indexOf(id);
        console.log(ids);

        if(index !== -1){
            data.allItems[type].splice(index, 1)
        }
        
    },

    calculateBudget: function(){
        calculateTotal('inc')
        calculateTotal('exp')

        data.budget = data.totals.inc - data.totals.exp;

        if(data.totals.inc > 0){
            data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 )
        }else{
            data.percentage = -1
        }
    },

    calculatePercentage: function(){
        data.allItems.exp.forEach(cur =>{
            cur.calcPercentage(data.totals.inc)
        })
    },

    getPercentage: function(){
        var allPercs = data.allItems.exp.map(cur =>{
           return cur.getPercentage()
        })
        console.log(allPercs);
        return allPercs
       
    },

    getBudget: function(){
        return{
            budget: data.budget,
            percentage: data.percentage,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp
        } 
    },

    testing: function(){
        console.log(data);
    }
}


})();


var UIController = (function(){
    //DOM
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton:".add__btn",
        incomeContainer: ".income__list",
        expensesContainer:".expenses__list",
        budgetLabel:".budget__value",
        expenseLabel: ".budget__expenses--value",
        incomeLabel: ".budget__income--value",
        percentageLabel: ".budget__expenses--percentage",
        container:".container",
        expencesPercLabel:".item__percentage",
        monthLabel:".budget__title--month"
    }

    var formatNumber = function(num, type){
        var dec, int, numSplit, type;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.')

        int = numSplit[0]
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3)
        }

        dec = numSplit[1]

        return(
            (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
        )

        
    }

    
    var  nodeListForEach = function(list, callBack){
        for(var i = 0; i < list.length; i++){
            callBack(list[i], i)
        }
    }

    return{
        getDOMStrings:function(){
            return DOMStrings
        },

      

        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseInt(document.querySelector(DOMStrings.inputValue).value)
            }
        },


        addListItems: function(obj, type){
            var html, newHtml, element;

            if(type === 'inc'){
                element = DOMStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer
                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>'
            }

            newHtml = html.replace('%id%',obj.id)
            newHtml = newHtml.replace('%description%',obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFeild: function(){
            var feilds, feildsArry;

            feilds = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            feildsArry = Array.prototype.slice.call(feilds)
            feildsArry.forEach( function(current){
                return current.value = ''
            });

            feildsArry[0].focus()
        },

        displayBudget: function(obj){
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent =  formatNumber( obj.totalInc,type) ;
            document.querySelector(DOMStrings.expenseLabel).textContent =  formatNumber( obj.totalExp,type) ;

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages: function(percentages){
            var feilds = document.querySelectorAll(DOMStrings.expencesPercLabel)
            

            nodeListForEach(feilds, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%'
                }else {
                    current.textContent = '---'
                }
            })

        },

        displayMonth: function(){
            var year,month,months;
            year = new Date().getFullYear()
            month = new Date().getMonth()

            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July'
            ,'Agust', 'September', 'Ouctober', 'November', 'December']

            document.querySelector(DOMStrings.monthLabel).textContent = months[month] + ' ' + year

        },

        changedType: function(){

            var feild = document.querySelectorAll(
              DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
            )

            nodeListForEach(feild, function(cur){
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMStrings.addButton).classList.toggle('red')
        }




    }
})();


var controller = (function(CtrlBudget, UICtrl){

    //Importing DOM Strings
    var DOMStrings = UICtrl.getDOMStrings()

   

    var setEventListeners = function(){
        document.querySelector(DOMStrings.addButton).addEventListener("click", ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem()
            }
        })

        document.querySelector(DOMStrings.container).addEventListener("click",ctrlDeleteItem)
        document.querySelector(DOMStrings.inputType).addEventListener("change",UICtrl.changedType)
    };

    var updateBudget = function(){
        
        //CALCULATE BUDGET
        CtrlBudget.calculateBudget();
        
        //GET BUDGET 
        var budget = CtrlBudget.getBudget();

        //DISPLAY THE CALCULATED BUDGET ON THE UI
        UICtrl.displayBudget(budget);
        
    }

    var updatePercentage = function(){

        //DISPLAY PERCENTAGES
        CtrlBudget.calculatePercentage()

        //GET CALCULATED PERCENTAGES
        var percentages = CtrlBudget.getPercentage()

        //DISPLAY PERCENTAGES
        UICtrl.displayPercentages(percentages)
    }


    var ctrlAddItem = function(){
        var input, newItem

        //GETTING VALUES OF INPUT
        input = UICtrl.getInput();
      


        if(input.description !== ' ' && !isNaN(input.value) && input.value !== 0){
        //ADD ITEMS TO OUR DATA STRUCTURE  
        newItem = CtrlBudget.addItem(input.type, input.description, input.value)
        }

        //SHOW ADDED ITEMS ON UI
        UICtrl.addListItems(newItem, input.type)

        //CLEAR INPUTS
        UICtrl.clearFeild()

        //UPDATE BUDGET
        updateBudget()

        //UPDATE PERCENTAGE
        updatePercentage()
    }


    var ctrlDeleteItem = function(event){
        var type ,ID, splitID, itenID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        splitID = itemID.split("-")
        type = splitID[0]
        ID = parseInt(splitID[1])
       
        //DELETE ITEM FROM BUDGET 
        CtrlBudget.deleteItem(type, ID)

        //DELETE ITEM FROM UI
        UICtrl.deleteListItem(itemID)

        //UPDATE BUDGET
        updateBudget()

        //UPDATE PERCENTAGE
        updatePercentage()

    }

 



    return {
        init: function(){
            return(
                console.log('Application has started'),
                setEventListeners(),
                UICtrl.displayMonth(),
                UICtrl.displayBudget({
                    budget: '0',
                    percentage: '0',
                    totalInc: '0',
                    totalExp: '0'
                })
            )
            

        }
    }

})(budgetController, UIController);
controller.init()

