// Restangular needs help unpacking
//  API results.
function unpack($obj){
    console.log($obj);
    return $obj['objects'];
}

// Traffic to the server all goes
// through Restangular API client.
(function(){
    angular.module('app', ['restangular']);
    angular.module('app').controller(
		'ctrl', function($scope, Restangular){

        Restangular.setBaseUrl('/api')
        Restangular.addResponseInterceptor(unpack);
		
        $scope.get_purchases = function(){

			var query = '{"filters":[{"name":"done","op":"is_null"}]}';
			Restangular.all('purchase').getList(
				{'q':query}).then(function (items){
                $scope.purchases = items;
            });

			var query = '{"filters":[{"name":"bought","op":"eq","val":true}]}';
			Restangular.all('purchase').getList(
				{'q':query}).then(function (items){
                $scope.bought = items;
            });

			var query = '{"filters":[{"name":"bought","op":"neq","val":true}]}';
			Restangular.all('purchase').getList(
				{'q':query}).then(function (items){
                $scope.wont = items;
            });


		}
		$scope.get_purchases();

		// Modify a purchase with a form.
		$scope.purchase = Restangular.one('purchase');

		// Add a purchase...
        $scope.add_purchase = function(){
			console.log('Scope: ');
			console.log($scope);
			Restangular.all('purchase').post($scope.purchase).then(
					function(purchase) {
					  $scope.purchase.name = null;
					  $scope.purchase.price = null;
					  $scope.get_purchases();
					}
			);
        }

		$scope.buy = function(purchase){
            var item = Restangular.one('purchase', purchase.id);
			item.bought = true;
			item.done = Date();
			item.put();
			$scope.get_purchases();
		}

		$scope.wont = function(purchase){
            var item = Restangular.one('purchase', purchase.id);
			item.bought = false;
			item.done = Date();
			item.put();
			$scope.get_purchases();
		}



		// Modify a purchase
		$scope.showpurchaseEdit = function(purchase){
			$scope.purchase_edit_form = purchase.id;
		}

		$scope.updatepurchase = function(purchase){
            var item = Restangular.one('purchase', purchase.id);
			item = purchase;
			item.put();

			// Hide the add form.
		    $scope.purchase_edit_form = null;
			$scope.get_purchases();
		}

    });

})();
