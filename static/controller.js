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
		'ctrl', function($scope, $http, Restangular){

        Restangular.setBaseUrl('/api')
        Restangular.addResponseInterceptor(unpack);

		$scope.get_savings = function(){
			var query = '{"functions":[{"name":"sum", "field":"price"}],"filters":[{"name":"bought","op":"neq","val":true}]}';

			$http.get('/api/eval/purchase?q=' + query).success(
				function(data, status, headers, config) {
					console.log(data);
					$scope.saved = data['sum__price'];
			    });
		}
        $scope.get_savings();
		$scope.purchase_page = 1;

		$scope.get_next_purchases = function(){
			$scope.purchase_page += 1;
			$scope.get_purchases();
		}

		$scope.get_prev_purchases = function(){
			$scope.purchase_page -= 1;
			$scope.get_purchases();
		}

		
        $scope.get_purchases = function(){

			var query = '{"filters":[{"name":"done","op":"is_null"}]}';
			Restangular.all('purchase').getList(
				{'page':$scope.purchase_page, 'q':query}).then(function (items){
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
                $scope.no_buy = items;
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
