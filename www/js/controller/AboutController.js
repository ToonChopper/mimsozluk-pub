angular.module('app')

.controller('AboutController', ['$scope'
									, '$rootScope'
									, 'LocalStorageDictService'
									, function($scope
										, $rootScope
										, LocalStorageDictService) {

	var that = this;

	$scope.$on('doDictUpdateDone', function(event, entry) {
		that.hideProgress('Yeni güncelleme yok.');
	});

	$scope.$on('doDictUpdateDoneRemote', function(event, entry) {
		that.hideProgress('Sözlük Güncellendi!');
	});

	this.showResetDialog = function() {
		if ($scope.approveResetDialog) {
			$scope.approveResetDialog.show();
		}
	}

	this.approveClearData = function(dictCtrl) {
		$scope.approveResetDialog.hide(); 
		that.clearAppData();
	}

	this.clearAppData = function() {
		$rootScope.disableSaveOnExit = true;

		$rootScope.bookmarks = [];

		LocalStorageDictService.clearAppData().then(() => {
			that.showUpdateNotification('Uygulama bilgileri sıfırlandı');
		}).catch((err) => {
			that.showUpdateNotification('Bir hata oluştu!');
		});
	}

	this.showUpdateNotification = function(msg) {
		setTimeout(function() {
			ons.notification.toast(msg, { timeout: 2000 });
		}, 500);
	}

	this.hideProgress = function(msg) {
		setTimeout(function () {
			// var modal = document.querySelector('ons-modal');
			var modal = $('#aboutProgressModal')[0];
			if (modal) {
				modal.hide();
			}
		}, 2000);

		/*setTimeout(function() {
			ons.notification.toast(msg, { timeout: 2000 });
		}, 2500);*/
	}

	this.checkDictionaryUpdate = function() {
		// console.log("checkDictionaryUpdate");
		$scope.$emit('onCheckDictUpdate');

		//$(".progress_bg").fadeIn();

		// var modal = document.querySelector('ons-modal');
		var modal = $('#aboutProgressModal')[0];
		if (modal) {
			modal.show();
		}
	};  

	this.checkVersionUpdate = function() {
		// console.log("checkVersionUpdate");
		$scope.$emit('onCheckVersionUpdate');
	};
}]);
