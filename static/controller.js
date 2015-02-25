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

			var query = {'filters':[{
				'name':'bought',
				'op':'eq',
				'val':''
			}]};
			// Active goals
			Restangular.all('purchase').getList(
				{'q':query}).then(function (items){
                $scope.purchases = items;
            });

		}
		$scope.get_purchases();

		// Modify a purchase with a form.
		$scope.purchase = Restangular.one('purchase');


		// Add a purchase...
        $scope.add_purchase = function(){
			console.log('Scope: ');
			console.log($scope);
			Restangular.all('purchase').post($scope.purchase).then(function(purchase) {
			  $scope.purchase.name = null;
			  $scope.purchase.price = null;
			  $scope.get_purchases();
		    });
        }

		// Modify a purchase
		$scope.showpurchaseEdit = function(purchase){
			$scope.purchase_edit_form = purchase.id;
		}

		$scope.updatepurhcase = function(purhcase){
            var item = Restangular.one('purhcase', purhcase.id);
			item = purhcase;
			item.put();

			// Hide the add form.
		    $scope.purhcase_edit_form = null;
			$scope.refreshGoals();
		}

    });

})();
