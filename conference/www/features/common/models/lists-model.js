(function() {
    'use strict';
    
    angular
        .module('models.lists', [
            'ngResource',
            'models.todos'
        ])
        .service('ListsModel', ListsModel)
    ;
    
    ListsModel.$inject = ['$http', '$q', 'TodosModel'];

    function ListsModel($http, $q, TodosModel) {
        var model = this,
            URLS = {
                FETCH : 'data/lists.json'
            },
            lists,
            todos,
            currentList;
        
        model.getLists = getLists;
        model.createList = createList;
        model.getListById = getListById;
        model.setCurrentList = setCurrentList;
        model.getCurrentList = getCurrentList;
        model.addNumberTodos = addNumberTodos;
        model.updateList = updateList;
        model.deleteList = deleteList;
        
        function httpCall(){
            return $http
                        .get(URLS.FETCH)
                        .then(cacheLists)
                        .catch(errorCall);
        }
        function getLists(){
            if(lists){
                return $q.when(lists);
            }else{
                return httpCall();
            }
        }
        function extract(result){
            return result.data;
        }
        function errorCall(result){
            var newMessage = 'XHR Failed';
            if (result.data && result.data.description) {
              newMessage = newMessage + '\n' + result.data.description;
            }
            result.data.description = newMessage;
            //logger.error(newMessage);
            return $q.reject(result);
        }
        function cacheLists(result){
            lists = extract(result);
            addNumberTodos();
            return lists;
        }
        function createList(list){
            list.id = lists.length;
            lists.push(list);
        }
        function addNumberTodos(){
            var deferred = $q.defer();
            if(todos){
                deferred.resolve(numberTodoByList());    
            } else {
                TodosModel.getTodos()
                    .then(function(result){
                        todos = result;
                        deferred.resolve(numberTodoByList());
                    });
            }
            function numberTodoByList(){
                var i,j;
                for(i=0;i<lists.length;i++){
                    lists[i].numberTodo = 0;
                    for(j=0;j<todos.length;j++){
                        if(lists[i].id == todos[j].listId){
                            lists[i].numberTodo++;
                        }
                    }
                }
            }
            return deferred.promise;
        }
        function getListById(listId){
            var deferred = $q.defer();
            function findList(){
                return _.find(lists, function(l){
                    return l.id == listId;
                });
            }
            if(lists){
                deferred.resolve(findList());
            } else {
                getLists()
                    .then(function(result){
                        deferred.resolve(findList());
                    });
            }
            return deferred.promise;
        }
        function setCurrentList(listId){
            return getListById(listId)
                .then(function(list){
                    currentList = list;
                    return currentList;
                });
        }
        function getCurrentList(listId){
            return $q.when(setCurrentList(listId));
        }
        function updateList(list){
            var index = _.findIndex(lists,function(l){
                return l.id == list.id;
            });
            lists[index] = list;
        }
        function deleteList(list){
            _.remove(lists,function(l){
                return l.id == list.id;
            });
        }
    }
    
})();