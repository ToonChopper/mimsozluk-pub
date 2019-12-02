angular.module('app')

	.service('RemoteUpdateService', ['$http', function($http) {
		var that = this;
		var msgs = [];

		const VERSION = "1.0.0";
		// updates after this date should be loaded
		const VERSION_DATE = "2019-03-01T00:00:00+03:00";

		this.getAppVersion = function() {
			return VERSION;
		}

		this.getAppVersionDate = function() {
			return moment(VERSION_DATE).toDate();
		}

		this.get = function(url) {
			return $http.get(url, { 'method': 'GET', 'responseType': 'json' })
				.then((response) => {
						//return {};
					return {
						result: {
							new_entries: response.data.result.new_entries,
							updated_entries: response.data.result.updated_entries,
							deleted_entries: response.data.result.deleted_entries
						},
						error: 'ok'
					}
				}, 
				(err) => {
					console.log("Error: ", err.status + ":" + err.statusText);
					return {
						error: "http_error",
						msg: "Sunucuya erişilemiyor!",
						status: err.status,
						statusText: err.statusText
					};
				});
		};

		this.getBannerInfo = function(url) {
			return $http.get(url, { 'method': 'GET', 'responseType': 'json' })
				.then(
					function(response) {
						//return {};
						return {
							result: {
								bannerImg: response.data.result.banner_img,
								bannerLink: response.data.result.banner_link,
								bannerBg: response.data.result.banner_bg
							},
							error: 'ok'
						}
					},
					function(err) {
						console.log("Error: ", err.status + ":" + err.statusText);
						return {
							error: "http_error",
							msg: "Sunucuya erişilemiyor!",
							status: err.status,
							statusText: err.statusText
						};
					}
				);
		};

	}]);