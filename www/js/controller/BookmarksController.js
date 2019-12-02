// This is a JavaScript file
angular.module('app')

.controller('BookmarksController'
				, ['$scope'
					, '$rootScope'
				    , 'DictionaryDataService'
					, function($scope
					, $rootScope
					, DictionaryDataService) {
	
	var that = this;

	$scope.showWordDetail = function (wordEntry) {
		// $rootScope.selectedEntry = wordEntry;
		// $rootScope.selectedSection = that.getSectionById(wordEntry.group_id);
		// $rootScope.selectedSection = that.getSectionById(wordEntry.sectionId);
		
		// navi.pushPage('word.html', {data: {dictionary: that.getFilteredDictionary(), selectedEntry: wordEntry}});
    	$rootScope.$emit('onShowBookMarkedItem', wordEntry);
	};

	this.getSectionById = function(id) {
		return DictionaryDataService.getSectionById(id);
	}
	
	$scope.bookmarksFilter = function(item) {
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx != -1) {
				return true;
			}
		}
		return false;
	}

	this.removeBookmark = function(item) {
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx != -1) {
				$rootScope.bookmarks.splice(idx, 1);

				ons.notification.toast("Sözcük favorilerden çıkarıldı", { timeout: 2000 });
			}
		}
	}

	this.getFilteredDictionary = function() {
		// return $rootScope.selectedSection.entries;
		return DictionaryDataService.getSectionEntries();
	}

	this.showPage = function (pageUrl) {
		console.log("BookmarksController.showPage: " + pageUrl);
		$scope.navi.pushPage(pageUrl);
	};

	this.getBookmarkEntries = function() {
		return DictionaryDataService.getListEntries($rootScope.bookmarks);
	}
	
	this.bookmarks = function() {
		return $rootScope.bookmarks;
	}

}])

