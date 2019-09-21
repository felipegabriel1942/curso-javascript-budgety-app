// CONTROLADOR DE ORÇAMENTO
var budgetControler = (function() {

    //OBJETO DESPESA
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //OBJETO RECEITA
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //FUNCAO PARA CALCULAR RESULTADO LIQUIDO
    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    //OBJETO CONTENDO LISTAS DE ITENS, TOTAIS, VALOR LIQUIDO E PERCENTUAL DE DESPESA
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        //ADICIONAR ITEM NA LISTA
        addItem: function(type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        //DELETAR ITEM DA LISTA
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        //CALCULAR VALOR LIQUIDO
        calculateBugdget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }    
        },

        //PEGAR RESULTADOS DO VALOR DO TOPO
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },        

        testing: function() {
            console.log(data);
        }
    }
})();


// UI CONTROLLER
var UIController = (function() {

    //OBJETO CRIADO PARA CONTER TODAS AS STRINGS QUE REPRESENTAM CLASSES
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtnAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // O retorno sera inc ou exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        //ADIONA ITEM DA LISTA NA TELA (DOM)
        addListItem: function(obj, type) {
            var html, newHtml, element;

            //CRIA O HTML COM UM TEMPLATE COM VARIAVEIS DETERMINADAS PELO %variavel%
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                        '<div class="item__value">%value%</div>' +
                        '<div class="item__delete">' +
                            '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                        '<div class="item__value">%value%</div>' +
                        '<div class="item__percentage">21%</div>' +
                        '<div class="item__delete">' +
                            '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }

            //TROCA AS VARIAVES PELO VALOR DESEJADO
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //INSERE O HTML CRIADO NO DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //REMOVER ITEM DA TELA
        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            //SELECIONA OS CAMPOS DESEJADOS
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            //CONVERTE UMA CADEIA DE TEXTO SEPARADA POR VIRGULA EM ARRAY
            fieldsArray = Array.prototype.slice.call(fields);

            //VARRE O ARRAY LIMPANDO OS CAMPOS
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            //COLOCA O FOCO NO CAMPO DESCRIÇÃO
            fieldsArray[0].focus();
        },

        //ATUALIZA A AREA RESERVADA AO CALCULO DO BUDGET
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
            

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        getDOMstrings: function() {
            return DOMStrings;
        }
    }
})();


// CONTROLLER GLOBAL DA APLICAÇÃO
var controller = (function(budgetCtrl, UICtrl) {
    var input, newItem;

    //INICIA OS EVENTOS
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtnAdd).addEventListener('click', ctrlAddItem);

        //FAZ COM QUE APENAS A TECLA ENTER TAMBÉM ADICIONE NA LISTA
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
               ctrlAddItem();
            }        
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    //ATUALIZA A PERTE DE ORÇAMENTO DA TELA
    var updateBudget = function() {
        budgetCtrl.calculateBugdget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    }

    //CONTROLE DE ADIÇÃO DE ITEM DO CONTROLE DE DADOS E UI
    var ctrlAddItem = function() {

       input = UICtrl.getInput();

       //VALIDAÇÃO PARA ADICIONAR APENAS QUANDO CAMPO DESCRIÇÃO TIVER TEXTO
       // E O VALOR EXISTIR E FOR MAIOR QUE 30
       if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
       
            UICtrl.addListItem(newItem, input.type);
 
            UICtrl.clearFields();
 
            updateBudget();
       }

    };

    //CONTROLE DE DELEÇÃO DE ITEM DO CONTROLE DE DADOS E UI
    var ctrlDeleteItem = function(event) {
        var itemId, splitID, type, id;

        //SOBE A ESTRUTURA DO DOM ONDE ESTA CONTIDO O LOCAL ONDE HOUVE O EVENTO
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitID = itemId.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }

        budgetCtrl.deleteItem(type, id);

        UICtrl.deleteListItem(itemId);
        
        updateBudget();
    };

    return {
        //UTILIZADO PARA INICIAR OS EVENTOS DE CLIQUE
        //OU AÇÕES EM GERAL
        init: function() {
            console.log('Aplicação iniciou.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetControler, UIController);

//Linha de código que basicamente inicia a aplicação
//Seria mais ou menos como o ngOnInit()
controller.init();