angular.module('app')

.service('PrefsService', ['$http', '$rootScope', function($http, $rootScope) {

	var that = this;

	this.getDefaultPrefs = function () {
		var res = {
			search: {
				isShowAll: true
				, isPartialMatch: false
				, isSearchDetails: true
			}
			, ui: {
				viewMode: "search"
			}
			, formatting: {
				enableSeeAlso: false
			}
			, system: {
				updatePeriod: 1
				, updateHost: "https://www.mimarliksozlugu.net"
				// , updateHost: "http://sozlukdev.test"
				, updateUrl: "db/update.json"
				, updateUrl2: "db/update.json"
				, updateUrlTmpl: "{host}/api/entries/patch/{lastUpdateTime}/{ignoreTime}"
				, bannerInfoTmpl: "{host}/api/banner/get"
			}
		};

		return res;
	}

	this.reset = function() {
		$rootScope.prefs = jQuery.extend(true, {}, $rootScope.defaultPrefs);
	}

	this.save = function() {
		localStorage.setItem("prefs", JSON.stringify($rootScope.prefs));
		localStorage.setItem("bookmarks", JSON.stringify($rootScope.bookmarks));
	}

	this.load = function(defPrefs) {
		var str = localStorage.getItem("prefs");
		if (str) {
			$rootScope.prefs = JSON.parse(str);

			// merge with possible new attributes from def data
			$rootScope.prefs = jQuery.extend(defPrefs, $rootScope.prefs);
		} else {
			that.reset();
		}
		var bm = localStorage.getItem("bookmarks");
		if (bm) {
			$rootScope.bookmarks = JSON.parse(bm);
		}
	}

}]);
