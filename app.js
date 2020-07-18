//BUDGET CONTROLLER

var budgetController = (function(){

    var Income = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Expense = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100 )
        }else{
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
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    }

    return {
         addItem: function(type, des, value){
             var newItem, ID;

             //CREATE NEW ID
             if(data.allItems[type].length > 0){
                 ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
             }else{
                 ID = 0
              }

             //CREATE NEW ITEM
             if(type === "exp"){
                 newItem = new Expense(ID, des, value)
             }else if (type === "inc"){
                 newItem = new Income(ID, des, value)
             }

             //ADD ITEM TO THE ARRAY
             data.allItems[type].push(newItem)

             return newItem

        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
            return current.id
            })

            index = ids.indexOf(id);
            console.log(index);

            if(index !== -1){
                data.allItems[type].splice(index, 1)
            }
            
        },

        calculateBudget:function(){

            //ADD ALL ELEMENTS IN THE ARRAY
            calculateTotal('inc');
            calculateTotal('exp');

            //CALCULATE THE BUDGET
            data.budget = data.totals.inc - data.totals.exp;
           
            //CALCULATE PERCENTAGE OF INCOME THAT WE SPENT
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage()
            });
            return allPerc
        }, 

        getBudget:function() {
            return{
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },


        testing:function(){
            console.log(data);
         
        }
    }
    
})();


//UI CONTROLLER
var UIController = (function(){
    var DOMStrings = {
        inputType:".add__type",
        inputDescription:".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer:".expenses__list",
        budgetLabel:".budget__value",
        incomeLabel:".budget__income--value",
        expenseLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        expencesPercLabel:".item__percentage",
        date:".budget__title--month"
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        //TAKING NUM AND REMOVING SIGN,PUTING 2 DECIMAL PLACE, SPLITING NUM
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3);
        };
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' +  int + '.' + dec


    };

    var nodeListForEach = function(list, callBack){
        for(i = 0 ; i < list.length; i++){
            callBack(list[i], i)
        }
    };
    return{
      getInput: function(){
          return{
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseInt( document.querySelector(DOMStrings.inputValue).value)
      }
    },

    addListItem: function(obj, type){
        var html, newHtml, element;


        //CREATE HTML STRING
        if(type === "exp"){
         element = DOMStrings.expensesContainer;
          html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>'
        }else if (type === "inc"){
         element = DOMStrings.incomeContainer;
         html = '  <div class="item clearfix" id="inc-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }

        //REPLACE PLACEHOLDER TEXT WITH HTML TEXT
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%',obj.description );
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type) );

        //INSERT HTML TO THE UI
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

    },

    deleteListItem: function(selectorID){
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    },

    clearFeild: function(){
        var feilds, feildsArry;

        //SELECTING INPUT AND DISCRIPTION
        feilds = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

        //CONVERTING STRINGS TO ARRAY
        feildsArry = Array.prototype.slice.call(feilds);
        feildsArry.forEach(function(current , value, id){
            current.value = "";
        });

        //PUTTING FOCUS BACK TO DISCRIPTION
        feildsArry[0].focus();

    },
    displayBudget: function(obj){

        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp'

        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
        document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, type);

        if(obj.percentage > 0){
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        }else{
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }

    },

    displayPercentage: function(percentages){
        var feilds = document.querySelectorAll(DOMStrings.expencesPercLabel);

      
        nodeListForEach(feilds, function(current, index){
            if(percentages[index] > 0){
                current.textContent = percentages[index] + "%"
            }else{
                current.textContent = "---"
            }
         
        })

    },

    displayMonthFunction: function(){
        var now, month, year,months;
         now = new Date();
         month = now.getMonth();
         year = now.getFullYear();

         months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 
        'July', 'Agust', 'September', 'October', 'November', 'December']

        document.querySelector(".budget__title--month").textContent = months[month] + ' ' + year
    },

    changedType: function(){
        var feilds = document.querySelectorAll(
            DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
        );

        nodeListForEach(feilds, function(cur){
            cur.classList.toggle('red-focus');
        })

        document.querySelector(DOMStrings.addButton).classList.toggle('red')

    },
    getDOMStrings: function(){
        return DOMStrings
    }
    };

  

})();

//CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var DOM = UICtrl.getDOMStrings();

    var setEventListeners = function(){
        document.querySelector(DOM.addButton).addEventListener("click",ctrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType)
    };

    var updateBudget = function(){
        //1. CALCULATE BUDGET 
        budgetCtrl.calculateBudget();

        //2. RETURN
        var budget = budgetCtrl.getBudget() ;
       
        
        //3. DISPLAY BUDGET ON UI'
        UICtrl.displayBudget(budget);
    }

    var updatePercentage = function(){
        //1. CALCULATE PERCENTAGE

        budgetCtrl.calculatePercentage()

        //2. RETURN THE CALCULATED PERCENTAGE
        var percentage = budgetCtrl.getPercentage()

        //3. DISPLAY THE PERCENTAGE ON UI
        UICtrl.displayPercentage(percentage)
        

    }


    var ctrlAddItem = function(){
        var input, newItem;

   

        //1. Get the feild input Data
         input = UICtrl.getInput();

         if(input.description !== "" && !isNaN(input.value) && input.value !== 0){

         //2. Add the item to budget contoller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         

         //3. Add item to the UI
         UICtrl.addListItem(newItem, input.type);
 
         //4. CLEAR THE VALUES
         UICtrl.clearFeild();
         
         //5. CALL UPDATE BUDGET
         updateBudget()

         //6. CALL UPDATE PERCENTAGE
         updatePercentage()

         }
       
    };

    
    var ctrlDeleteItem = function(event){
        var itemId, splitId, ID, type;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //DELETE THE ITEM FROM THE DATA STUCTURE
            budgetCtrl.deleteItem(type, ID);


            //DELETE THE ITEM FROM THE UI
            UICtrl.deleteListItem(itemId);

            //UPDATE THE UI
            updateBudget();

            //CALL UPDATE PERCENTAGE
            updatePercentage();

        }
    }
  

    return{
        init:function(){
            return(
                console.log("Application has started"),
                UICtrl.displayMonthFunction(),
                UICtrl.displayBudget(
                    {
                        budget: '0',
                        percentage: '0',
                        totalInc: '0',
                        totalExp: '0'
                    }
                ),
                setEventListeners()
            )
        }
    }

})(budgetController, UIController);

controller.init()

