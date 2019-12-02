// This is a JavaScript file
const INVALID_CHARS = "[](){}^_\\?*.+$";

const rowTmpl = '<ons-list-item data-id="{id}" class="word_list_item">{icon}{label}</ons-list-item>';
const iconTmpl = '<i class="fa fa-bookmark word_list_icon word_list_icon-{os}" style="visibility: {vis};"></i>';

var clusterize = null;
var sectionClstr = null;

var prefsTestMode = false;

var lockExecInit = false;

angular.module('app')

.controller('DictionaryController'
				, ['$scope'
					, '$rootScope'
					, 'MainDictionary'
					, 'DictionaryDataService'
					, 'LocalStorageDictService'
					, 'RemoteUpdateService'
					, 'PrefsService'
					, 'WordHtmlService'
					, function($scope
					, $rootScope 
					, MainDictionary
					, DictionaryDataService
					, LocalStorageDictService
					, RemoteUpdateService
					, PrefsService
					, WordHtmlService) {
	
	var that = this;
	$scope.carouselIndex = 0;

	/*$rootScope.alphabet = [
								 ['Aa', 'Bb', 'Cc', 'Çç', 'Dd', 'Ee', 'Ff']
							 , ['Gg', 'Hh', 'Iı', 'İi', 'Jj', 'Kk', 'Ll']
							 , ['Mm', 'Nn', 'Oo', 'Öö', 'Pp', 'Rr', 'Ss']
							 , ['Şş', 'Tt', 'Uu', 'Üü', 'Vv', 'Yy', 'Zz']
						 ];*/
						
	$rootScope.alphabet = [
								 [{c: 'A', id: 0}, {c: 'B', id: 1}, {c: 'C', id: 2}, {c: 'Ç', id: 3}, 
								{c: 'D', id: 4}, {c: 'E', id: 5}, {c: 'F', id: 6}], [{c: 'G', id: 7},
								{c: 'H', id: 8}, {c: 'I', id: 9}, {c: 'İ', id: 10}, {c: 'J', id: 11}, 
								{c: 'K', id: 12}, {c: 'L', id: 13}], [{c: 'M', id: 14}, {c: 'N', id: 15}, 
								{c: 'O', id: 16}, {c: 'Ö', id: 17}, {c: 'P', id: 18}, {c: 'R', id: 19}, 
								{c: 'S', id: 20}], [{c: 'Ş', id: 21}, {c: 'T', id: 22}, {c: 'U', id: 23}, 
								{c: 'Ü', id: 24}, {c: 'V', id: 25}, {c: 'Y', id: 26}, {c: 'Z', id: 27}]
						 ];
						
	$rootScope.alphabetList = [
		{ c: 'A', id: 0 }
		, { c: 'B', id: 1 }
		, { c: 'C', id: 2 }
		, { c: 'Ç', id: 3 }
		, { c: 'D', id: 4 }
		, { c: 'E', id: 5 }
		, { c: 'F', id: 6 }
		, { c: 'G', id: 7 }
		, { c: 'H', id: 8 }
		, { c: 'I', id: 9 }
		, { c: 'İ', id: 10 }
		, { c: 'J', id: 11 }
		, { c: 'K', id: 12 }
		, { c: 'L', id: 13 }
		, { c: 'M', id: 14 }
		, { c: 'N', id: 15 }
		, { c: 'O', id: 16 }
		, { c: 'Ö', id: 17 }
		, { c: 'P', id: 18 }
		, { c: 'R', id: 19 }
		, { c: 'S', id: 20 }
		, { c: 'Ş', id: 21 }
		, { c: 'T', id: 22 }
		, { c: 'U', id: 23 }
		, { c: 'Ü', id: 24 }
		, { c: 'V', id: 25 }
		, { c: 'Y', id: 26 }
		, { c: 'Z', id: 27 }
	];

	$scope.search = { query: "" };
	$scope.searchResult = [];
	$scope.searchResultArr = [];
				
	if (!$rootScope.isUpdateListenersInitilized) {
		$rootScope.isUpdateListenersInitilized = true;

		$scope.$on('doDictionaryUpdate', function(event, entry) {
			console.log('-- doDictionaryUpdate');
			that.updateDictionary();
		});

		$scope.$on('doDictUpdateDoneRemote', function(event, entry) {
			that.showUpdateNotification('Sözlük Güncellendi');
		});

		$scope.$on('showSeeAlsoItem', function(event, entryId) {
			if (entryId) {
				$("#scrollArea").css('opacity', 0);
				setTimeout(() => {
					let wrd = $rootScope.searchIndex.documentStore.getDoc(entryId);
					let promise = that.load('main.html');
					promise.then(() => {
						// $scope.showWordDetail(wrd, 'none');					
						$scope.showWordDetail(wrd);
						setTimeout(() => {
							$("#scrollArea").css('opacity', 1);
						}, 1000);
					}).catch((error) => {
						console.error(error);
					});
					// $scope.showWordDetail(wrd);
				}, 500);
			}
		});

		$("#letterSplitter").on('preopen', (e) => {
			console.log("-- hide banner ad");
			$(".ad-box").fadeOut();
		});

		$("#letterSplitter").on('preclose', (e) => {
			// console.log("-- show banner ad");
			/*if (!$scope.disableShowBanner) {
				$(".ad-box").fadeIn();
			}*/
		});

		$("#letterSplitter").on('postclose', (e) => {
			console.log("-- show banner ad");
			if (!$scope.disableShowBanner) {
				$(".ad-box").fadeIn();
			}
		});
	}

	this.showUpdateNotification = function(msg) {
		setTimeout(function() {
			ons.notification.toast(msg, { timeout: 2000 });
		}, 500);
	}

	$scope.sanitizeQuery = function (q) {
		if (!q) {
			return q;
		}
		for (var i = 0; i < INVALID_CHARS.length; i++) {
			var c = INVALID_CHARS.substr(i, 1);
			if (q.indexOf(c) != -1) {
				var rgx = new RegExp("\\" + c, "g");
				q = q.replace(rgx, "");
				if (!q) {
					break;
				}
			}
		}
		return q;
	}

	$scope.testWordHtml = function (wordEntry) {
		return wordEntry.entry;
	}

	$scope.getWordHtml = function (wordEntry) {
		var html = WordHtmlService.buildEntryHtml(wordEntry);
		return html;
	}

	this.allSearchEntries = function() {
		if ($scope && $scope.searchResult) {
			return $scope.searchResult;
		}
		return [];
	}

	$scope.allEntriesSearchFilter = function(item) {
		return true;
	}

/*	$scope.allEntriesFilter = function(entry) {
		var query = $scope.search.queryAll = $scope.sanitizeQuery($scope.search.queryAll);
		
		if (query === '') {
			return true;
		}

		if (query && query.length == 1) {
			return false;
		}

		
		if (entry && entry.entry && $scope.searchResultArr) {
			return $scope.searchResultArr.indexOf(entry.entry) != -1;
		}
		// if (entry && entry.entry) {
		// 	return that.matchQuery2(entry.entry, query);
		// }
		return false;
	}*/

	this.onSearchSectionInputChange = function() {
		console.log("onSearchSectionInputChange");
		that.updateFilteredSectionList();
	}

	this.onSearchAllInputChange = function() {
		console.log("onSearchAllInputChange");
		// var query = $scope.search.query = $scope.sanitizeQuery($scope.search.query);
		/*$scope.$apply(() => {
			
		});*/
		that.updateFilteredMainList();
	}

	this.fnSortLabel = (a, b) => {
		let ea = a.label ? a.label : a.entry;
		let eb = b.label ? b.label : b.entry;

		let ansp = ea.replace(' ', '').replace('/', '');
		let bnsp = eb.replace(' ', '').replace('/', '');
		
		return that.compQuery(ansp, bnsp, null);

		// return ansp.localeCompare(bnsp, "tr");
	}

	this.fnSortDocLabel = (a, b) => {
		let query = $scope.search.queryAll;

		let ea = a.doc ? a.doc.label : a.label;
		let eb = b.doc ? b.doc.label : b.label;

		if (ea && eb) {
			let ansp = ea.replace(' ', '').replace('/', '');
			let bnsp = eb.replace(' ', '').replace('/', '');
			return that.compQuery(ansp, bnsp, query);
		}
		return false;
	}

	that.compQuery = (ansp, bnsp, query) => {
		if (query) {
			if (ansp == query) {
				return -1;
			}

			if (bnsp == query) {
				return 1;
			}

			if (ansp.indexOf(query) != -1 && bnsp.indexOf(query) != -1) {
				return ansp.localeCompare(bnsp, "en");
			}

			if (ansp.indexOf(query) != -1) {
				return -1;
			}

			if (bnsp.indexOf(query) != -1) {
				return 1;
			}
		}

		if (ansp == "çiftkapı" && bnsp == "çiftekapı") {
			return -1;
		}
		return ansp.localeCompare(bnsp, "en");
	}

	this.fnSortSearch = (a, b) => {
		let query = $scope.search.querySection;

		let ea = a.doc ? a.doc.entry : a.entry;
		let eb = b.doc ? b.doc.entry : b.entry;

		let ansp = ea.replace(' ', '').replace('/', '');
		let bnsp = eb.replace(' ', '').replace('/', '');

		return that.compQuery(ansp, bnsp, query);
		/*if (ansp == "çiftkapı" && bnsp == "çiftekapı") {
			return -1;
		}
		return ansp.localeCompare(bnsp, "tr");*/
	}

	this.updateFilteredSectionList = function() {
		var query = $scope.search.querySection = $scope.sanitizeQuery($("input[name='querySection']").val());

		let itemArr = [];
		// search parameters
		let sPrm = $rootScope.prefs.search;

		// use indexed search
		if (!sPrm.isSearchDetails && !sPrm.isPartialMatch) {
			if (query != "") {
				$scope.sectionSearchResult = $rootScope.sectionSearchIndex.search(query, {expand: true});

				$scope.sectionSearchResult.sort(that.fnSortSearch);

				$scope.sectionSearchResult.forEach((item) => {
					itemArr.push(that.getListEntryHtml(item.doc));
				});

				that.updateSectionList(itemArr, false);
			} else {
				that.updateSectionList([], true);
			}

		} else {
			let secRes = $rootScope.sectionSearchIndex.search(query, {expand: true});
			let secEntries = that.selectedSectionEntries();
			//secEntries = secEntries.concat(secRes);

			$scope.sectionSearchResult = secEntries.filter(that.filterEntry);

			$scope.sectionSearchResult.sort(that.fnSortSearch);

			$scope.sectionSearchResult.forEach((item) => {
				itemArr.push(that.getListEntryHtml(item));
			});

			that.updateSectionList(itemArr, false);
		}

		
	}

	this.filterEntry = function(entry) {
		let query = $scope.search.querySection;

		if (!query || query == "") {
			return true;
		}

		if (entry != null && entry.entry != null) {

			let sPrm = $rootScope.prefs.search;
			if (that.matchQuery(entry.entry, query)) {
				return true;
			} else if (sPrm.isSearchDetails && !sPrm.isPartialMatch) {
				if (that.matchQuery(entry.definition, query)) {
					return true;
				}
				if (that.matchQuery(entry.see_also, query)) {
					return true;
				}
				if (that.matchItemList(entry.definitions, query)) {
					return true;
				}
				if (that.matchItemList(entry.usages, query)) {
					return true;
				}
			}
		}
		return false;
	}
	
	this.updateSectionList = function (itemArr, fillIfEmpty) {
		if (itemArr.length == 0 && fillIfEmpty) {
			$rootScope.selectedSection.entries.forEach((item) => {
				itemArr.push(that.getListEntryHtml(item));
			});
		}
		if (sectionClstr) {
			sectionClstr.update(itemArr);
		}
	}

	this.updateFilteredMainList = function(qryStr) {
		var query = $scope.search.queryAll = $scope.sanitizeQuery($("input[name='queryAll']").val()).toLocaleLowerCase('tr');
		// filter the index here
		let itemArr = [];
		if (query.length > 1) {
			$scope.searchResult = $rootScope.searchIndex.search(query, {expand: true});

			console.log("-- result count: " + $scope.searchResult.length);
			
			$scope.searchResult.sort(that.fnSortDocLabel);

			$scope.searchResult.forEach((item) => {
				itemArr.push(that.getListEntryHtml(item.doc));
			});

			that.updateMainList(itemArr, false);
		} else {
			that.updateMainList([], true);
		}

	}

	this.updateMainList = function (itemArr, fillIfEmpty) {
		if (itemArr.length == 0 && fillIfEmpty) {
			
			$rootScope.index.forEach((item) => {
				itemArr.push(that.getListEntryHtml(item));
			});
		}

		if (clusterize) {
			clusterize.update(itemArr);
		}
	}

	this.getListEntryHtml = function (item) {
		let label = item.label || item.entry;
		let os = 'android';
		let isBm = that.isBookmarked(item);
		let icon = iconTmpl
						.replace(/{os}/g, os)
						.replace(/{vis}/g, isBm ? 'visible' : 'hidden');

		// console.log("getListEntryHtml:" + label);

		return rowTmpl
			.replace(/{icon}/g, icon)
			.replace(/{label}/g, label)
			.replace(/{id}/g, item.id);
	}

	$scope.wordEntryFilter = function(entry) {
		var query = $scope.search.querySection = $scope.sanitizeQuery($scope.search.query).toLocaleLowerCase('tr');

		if (!query) {
			return true;
		}

		if ($rootScope.prefs.search && !$rootScope.prefs.search.isShowAll && !query) {
			return false;
		}

		if (entry != null && entry.entry != null) {
			if ($rootScope.prefs.search && $rootScope.prefs.search.isShowAll) {
				return true;
			} else if (that.matchQuery(entry.entry, query)) {
				return true;
			} else if ($rootScope.prefs.search.isSearchDetails && !$rootScope.prefs.search.isPartialMatch) {
				if (that.matchQuery(entry.definition, query)) {
					return true;
				}
				if (that.matchQuery(entry.see_also, query)) {
					return true;
				}
				if (that.matchItemList(entry.definitions, query)) {
					return true;
				}
				if (that.matchItemList(entry.usages, query)) {
					return true;
				}
			}
		}
		return false;
	}

	$scope.getEntryLabel = function (item) {
		let res = item.label ? item.label : item.entry;
		return res;
	}

	$scope.getSearchEntryLabel = function (item) {
		let res = "";//item.doc ? (item.doc.label ? item.doc.label : item.doc.entry) : (item.label ? item.label : item.entry);
		res = item.doc ? (item.doc.label ? item.doc.label : item.doc.entry) : (item.label ? item.label : item.entry);
		return res;
	}

	this.isIterable = function(obj) {
		if (obj == null) {
			return false;
		}
		return typeof obj[Symbol.iterator] === 'function';
	}

	this.isBookmarked = function(item) {
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx != -1) {
				return true;
			}
		}
		return false;
	}

	this.matchItemList = function query(itemList, query) {
		if (itemList != null) {
			for (defn of itemList) {
				if(that.matchQuery(defn.entry, query)) {
					return true;
				}
				if(that.matchQuery(defn.definition, query)) {
					return true;
				}
				if(that.matchQuery(defn.see_also, query)) {
					return true;
				}
				if(that.matchQuery(defn.synonym, query)) {
					return true;
				}
			}
		}
		return false;
	}

	this.onClearClick = function() {
		$scope.query = "";
	}

	/*this.matchQuery2 = function (srcStr, query) {
		if (!srcStr || !query) {
			return false;
		}
		//return srcStr.indexOf(query) != -1;
		var regEx = new RegExp(query, "i");
		return srcStr.match(regEx);
	}*/
	
	this.matchQuery = function (srcStr, query) {
		if (srcStr == null) {
			return false;
		}
		//return srcStr.indexOf(query) != -1;
		if (!$rootScope.prefs.search.isPartialMatch) {
			var regEx = new RegExp(query, "i");
			return srcStr.match(regEx);
		} else if (query.length > 2) {
			var isMatch = this.checkPartialMatch(srcStr, query);
			if (isMatch) {
				return true;
			}
		}
		return false;
	}

	this.checkPartialMatch = function(srcStr, query) {
		var isMatch = false;
		if (query.charCount(".") > 1) {
			return false;
		}
		//console.log("checkPartialMatch: main: " + srcStr + ":" + query);
		for (var i = 0; i < query.length; i++) {
			if (query.substr(i, 1) != ".") {
				var q = query.replaceAt(i, ".");
				//console.log("checkPartialMatch: " + q);
				var regEx = new RegExp(q, "i");
				isMatch = srcStr.match(regEx);
				if (isMatch) {
					//console.log("checkPartialMatch: found: " + srcStr + ":" + q);
					return true;
				}
				// search recursiveliy
				if (this.checkPartialMatch(srcStr, q)) {
					return true;
				}
			}
		}
		return false;
	}

	this.getSectionById = function(id) {
		var res = null;
		var secArr = that.dictionary().sections;

		for (var i = 0; i < secArr.length; i++) {
			var section = secArr[i];
			if (section.sectionId == id) {
				return section;
			}
		};
		return res;
	}

	/*$scope.btnAlphabetClick2 = function($event) {
		// called from section
		let sectionId = parseInt($($event.currentTarget).data('section-id'));
		navi.popPage();
		$("#scrollArea").fadeOut();
		setTimeout(() => {
			that.loadSection(sectionId, true);
		}, 500);
	}*/

	$scope.btnAlphabetClick = function($event) {
		
		let currPage = $($scope.navi.topPage).data('page-name');
		console.log("btnAlphabetClick: " + currPage);
		if (currPage == "mainPage") {
			// called from main list
			console.log("-- btnAlphabetClick - a");
			that.selectSection($event, true);
		} else {
			// called from section
			console.log("-- btnAlphabetClick - b");

			let sectionId = parseInt($($event.currentTarget).data('section-id'));
			navi.popPage();
			// $("#scrollArea").fadeOut();
			$("#scrollArea").animate({ opacity: 0 });
			// $(".ad-box").hide();
			$scope.disableShowBanner = true;
			setTimeout(() => {
				that.loadSection(sectionId, true);
				setTimeout(() => {
					$scope.disableShowBanner = false;
				}, 500);
			}, 500);
		}
		$('#letterSplitter')[0].close();
	}

	this.disableSelectLetter = function() {
		$('#letterSplitter').removeAttr('swipeable');
	}

	this.enableSelectLetter = function() {
		$('#letterSplitter').attr('swipeable', '');
	}

	this.selectSection = function ($event, flag) {
		let sectionId = parseInt($($event.currentTarget).data('section-id'));
		console.log("charIndex: " + sectionId);
		$rootScope.prefs.search.isShowAll = true;

		that.loadSection(sectionId, flag, null);
	}

	$rootScope.$on('onShowBookMarkedItem', function(event, entry) {
		console.log('-- onShowBookMarkedItem: ' + entry.id);
		// setTimeout($scope.notifyPage, 300 , entry);
		// 
		$scope.showWordDetail(entry);
	});

	/*
	 * function that displays word details on the respective page
	 */
	$scope.showWordDetail = function (wordEntry, anim) {
		let wrd = wordEntry;
		let sectionId = $rootScope.sectionId;

		if (that.isIndexItem(wordEntry)) {

			if (sectionId != wordEntry.group_id) {
				sectionId = wordEntry.group_id;

				that.loadSection(sectionId, false, () => {
					// replace index entry with actual dictionary item after section loaded
					wordEntry = DictionaryDataService.getEntryById(wordEntry.id);
					if (wordEntry) {
						that.selectWordEntry(wordEntry, anim);
					} else {
						console.warn("-- WARNING - index item not in dictionary: " + wrd.id);
					}
				});
			} else {
				wordEntry = DictionaryDataService.getEntryById(wordEntry.id);
				that.selectWordEntry(wordEntry, anim);
			}
		} else {
			//$rootScope.selectedSection = DictionaryDataService.getEntrySection(wordEntry.entry);
			that.selectWordEntry(wordEntry, anim);
		}
	}

	this.selectWordEntry = function (wordEntry, anim) {
		if (wordEntry) {
			$rootScope.selectedEntry = wordEntry;
			$rootScope.selEntry = wordEntry.entry;

			let opt = {
						data: {
							/*dictionary: that.getFilteredDictionary(), */
							selectedEntry: wordEntry
						},
					};
			if (anim) {
				opt.animation = anim;
			}
			navi.pushPage('word.html', opt);
			$scope.$emit('onShowPage', wordEntry);
		} else {
			that.showUpdateNotification("Kelime bulunamadı!");
		}
	}

	this.isIndexItem = function(entry) {
		if (entry) {
			return entry.group_id != null;
		}
		return false;
	}

	this.showPage = function (pageUrl) {
		console.log("DictionaryController.showPage: " + pageUrl);
		$scope.navi.pushPage(pageUrl);
	};

	this.onSearchOptionChange = function (e) {
		console.log("-- onSearchOptionChange");
		that.updateFilteredSectionList();
	}

	this.hideProgress = function(msg) {
		// var modal = document.querySelector('ons-modal');
		var modal = $('#mainProgressModal');
		if (modal) {
			modal[0].hide();
		}
	}

	this.showProgress = function() {

		var modal = $('#mainProgressModal');
		if (modal) {
			modal[0].show();
		}
	};  

	/*this.syncData = function () 
	{
		-
		
		//that.sortDictionary();
	}*/
	
	/*this.getEntrySection = function (txt) {
		var res = -1;
		if (txt) {
			var fc = txt.substr(0, 1).toLocaleUpperCase('tr');
			var abc = $rootScope.alphabet;

			for (var i = 0; i < abc.length; i++) {
				var row = abc[i];
				for (var k = 0; k < row.length; k++) {
					res++;
					c = row[k];
					if (c === fc) {
						return res;
					}
				};
			};
		}
		return res;
	}*/
	
	/*this.sortDictionary = function () {
		var sections = that.dictionary().sections;
		
		if (sections) {
			sections.forEach(function (section) {
				section.entries.sort(function(a, b) {
					return (a.entry).localeCompare(b.entry, 'tr', {sensitivity: 'base'});
				});
			});
		}
	}*/

	/*this.getEntryIndexById = function (id) {
		
		that.dictionary().sections.forEach (function(section, i) {
			
			section.entries.forEach (function(entry, k) {
				// console.log("getEntryIndexById: " + item.id);
				if (entry.id == id) {
					var res = {
						sectionId: section.sectionId,
						idx: k
					}
					return res;
				}
			});
		});
		return null;
	}*/

	this.alphabet = function() {
		return $rootScope.alphabet;
	}
	
	this.alphabetList = function() {
		return $rootScope.alphabetList;
	}
	
	this.dictionary = function() {
		return $rootScope.dictionary;
	}

	this.selectedChar = function () {
		var res = that.selectedSection().sectionName;
		if (res) {
			return res.toLocaleUpperCase('tr');
		}
		return 'A';
	}
						
	this.selectedSection = function() {
		return $rootScope.selectedSection;
	}

	this.selectedSectionEntries = function() {
		if ($rootScope.selectedSection) {
			return $rootScope.selectedSection.entries;
		}
		return [];
	}

	this.allFilteredEntries = function() {
		/*if ($rootScope && $rootScope.dictionary) {
			var secArr = $rootScope.dictionary.sections;
			var res = [];
			secArr.forEach(function(sec, idx) {
				res = res.concat(sec.entries);
			});
			return res;
		}
		return [];*/
		if ($rootScope && $rootScope.dictionary) {
			return $rootScope.index;
		}
		return [];
	}

	this.getFilteredDictionary = function() {
		return that.selectedSectionEntries().filter($scope.wordEntryFilter);
	}

	this.initBanner = (bannerInfo) => {
		console.log("-- initBanner");
		if ($rootScope.bannerInfo && $rootScope.bannerInfo.bannerImg) {
			$('.ad-box-image').prop('src', $rootScope.bannerInfo.bannerImg);
			$('.ad-box').css('background-color', $rootScope.bannerInfo.bannerBg);
			$('.ad-box-image').removeClass('fade');

			if ($rootScope.bannerInfo.bannerLink != "") {
				// $('.ad-box-link').attr('href', $rootScope.bannerInfo.bannerLink);
				let url = $rootScope.bannerInfo.bannerLink;
				$('.ad-box-link').on('click', () => {
					window.open(url, '_system');
					return false;
				});
			} else {
				$('.ad-box-link').remoteAttr('href');
			}
		}
	}

	this.loadBannerInfo = function () {
		console.log("-- loadBannerInfo");

		let sysPrf = $rootScope.prefs.system;
		let url = sysPrf.updateUrl;

		if (sysPrf.updateHost && sysPrf.bannerInfoTmpl) {
			let host = sysPrf.updateHost;
			let urlTmpl = sysPrf.bannerInfoTmpl
			if (urlTmpl) {
				url = urlTmpl.replace(/{host}/g, host);
			}
		}

		RemoteUpdateService.getBannerInfo(url).then ((bannerInfo) => {
			if (bannerInfo && bannerInfo.error === 'ok'/*&& Object.keys(updatedData).length > 1*/) {

				console.log("-- loadBannerInfo: remote OK");

				$rootScope.bannerInfo = bannerInfo.result || {};
				
				that.initBanner($rootScope.bannerInfo);

				
			} else {
				console.log("-- loadBannerInfo: failed");
				
				if (bannerInfo.error) {
					$scope.$emit("onRemoteError", {status: bannerInfo.status, msg: bannerInfo.msg});
				}
			}
		}).catch ((err) => {
			console.log(err);
		});
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

	this.updateDictionary = function(cbFunc) {
		console.log("-- updateDictionary");
		let ukDef = moment().format('YYYYMMDD');
		var lastUpdateKey = localStorage.getItem("lastUpdateKey");
		let ignoreTime = lastUpdateKey == null ? 1 : 0;
		var lastUpdateTime = lastUpdateKey ? parseInt(lastUpdateKey.substr(0, 8)) : ukDef;

		let sysPrf = $rootScope.prefs.system;
		let url = sysPrf.updateUrl;

		if (sysPrf.updateHost && sysPrf.updateUrlTmpl) {
			let host = sysPrf.updateHost;
			let urlTmpl = sysPrf.updateUrlTmpl;
			if (urlTmpl) {
				url = urlTmpl.replace(/{host}/g, host)
					.replace(/{lastUpdateTime}/g, lastUpdateTime)
					.replace(/{ignoreTime}/g, ignoreTime);
			}
		}

		that.showProgress();

		RemoteUpdateService.get(url).then ((updatedData) => {
			if (updatedData && updatedData.error === 'ok'/*&& Object.keys(updatedData).length > 1*/) {

				console.log("-- updateDictionary: remote OK");

				$rootScope.updatedData = updatedData.result || {};
				LocalStorageDictService.saveUpdates($rootScope.updatedData);
				
				DictionaryDataService.syncIndex($rootScope.updatedData);
				// DictionaryDataService.syncData($rootScope.updatedData);
				//LocalStorageDictService.saveRemoteUpdateKey();
				
				that.updateIndexList(null, true);

				$scope.$emit("onDictUpdateDoneRemote");

				if (cbFunc) {
					cbFunc(true);
				}
			} else {
				console.log("-- updateDictionary: readCachedData");
				if (updatedData.error) {
					$scope.$emit("onRemoteError", {status: updatedData.status, msg: updatedData.msg});
				}
				// that.hideProgress();
				LocalStorageDictService.readCachedData((cachedData) => {
					// this part is the callback function

					cachedData = cachedData ? cachedData.item.data : {};
					$rootScope.updatedData = cachedData;

					DictionaryDataService.syncIndex(cachedData);
					DictionaryDataService.syncData(cachedData);

					that.updateIndexList(null, true);

					$scope.$emit("onDictUpdateDone");
				});
			}
		}).catch ((err) => {
			console.log(err);
		}).finally (() => {
			that.hideProgress();
		});
	}

	this.readCachedData = function(cbFunc) {
		console.log('-- readCachedData');
		
		LocalStorageDictService.readCachedData((cachedData) => {
			
			console.log('>> readCachedData.callback:' + cachedData);
			// this part is the callback function
			$scope.$apply(function () {
				var updateData = cachedData ? cachedData.item.data : {};
				$rootScope.updatedData = updateData;

				DictionaryDataService.syncData(updateData);
				DictionaryDataService.syncIndex(updateData);
				
				if (updateData && updateData.new_entries) {
					console.log('>> readCachedData: entries:' + updateData.new_entries.length);
				}

				if (cbFunc) {
					cbFunc();
				}
			});
		});
	}

	this.updateIndexList = function (indexList, enableUpdateList) {
		console.log ("-- updateIndexList - update display: " + enableUpdateList);
		if (indexList) {
			$rootScope.indexMap = indexList;
		}
		$rootScope.index = Object.values($rootScope.indexMap);

		let itemArr = [];
		if (!$rootScope.isIndexing) {
			$rootScope.isIndexing = true;
			$rootScope.searchIndex = elasticlunr(function () {
				this.use(elasticlunr.tr);
				this.addField("entry");
				this.addField("label");
				this.setRef('id');
			});

			$rootScope.index.sort(that.fnSortLabel);

			$rootScope.index.forEach((item) => {
				$rootScope.searchIndex.addDoc(item);

				itemArr.push(that.getListEntryHtml(item));
			});

			// display whole index until search/filtering is made
			$scope.searchResult = $rootScope.index;

			if (enableUpdateList) {
				clusterize = new Clusterize({
					rows: itemArr
					, scrollId: "scrollArea"
					, contentId: "contentArea"
					, no_data_text: "Sonuç bulunamadı"
					, rows_in_block : 10
				});
			}

			$("#contentArea").off('click');
			$("#contentArea").on('click', 'ons-list-item', (e) => {
				let entryId = $(e.currentTarget).data('id');
				if (entryId) {
					let wrd = $rootScope.searchIndex.documentStore.getDoc(entryId);
					$scope.showWordDetail(wrd);
				}
			});

			$rootScope.isIndexing = false;
		}

	}

	this.loadIndex = function () {
		console.log("-- loadIndex: " + RemoteUpdateService.getAppVersionDate().getTime());

		if (!$rootScope.isLoading) {
			$rootScope.isLoading = true;
			that.showProgress();

			/*$rootScope.searchIndex = elasticlunr(function () {
				this.use(elasticlunr.tr);
				this.addField("entry");
				this.addField("label");
				this.setRef('id');
			});*/

			$("input[name='queryAll']").keyup((e) => {
				that.onSearchAllInputChange();
			})

			$("input[name='querySection']").keyup((e) => {
				that.onSearchSectionInputChange();
			})

			MainDictionary.loadIndex().then ((indexRes) => {
				console.log('>>> loadIndex completed');

				that.updateIndexList(indexRes.index, false);

				// check if update check is necessary
				var uperiod = parseInt($rootScope.prefs.system.updatePeriod);

				if (LocalStorageDictService.isUpdateRequired(uperiod)) {

					console.log('-- INFO: DictionaryController: update required');
					
					that.updateDictionary((succ) => {
						// that.hideProgress();
						if (!succ) {
							// in case of network error, fall-back to saved changes
							that.readCachedData(() => {
								that.updateIndexList(null, true);
								that.hideProgress();
							});

						} else {
							that.hideProgress();
						}
					})
				} else {
					that.readCachedData(() => {
						that.updateIndexList(null, true);
						that.hideProgress();
					});

				}
				$rootScope.isLoading = false;
				that.enableSelectLetter();
			}).finally (() => {
				// that.hideProgress();
			});
		}
	}

	this.moveSubItems = function (items) {
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];

				if (item.derivatives) {
					let remArr = [];
					for (var k = 0; k < item.derivatives.length; k++) {
						let derv = item.derivatives[k];
						if (derv.parent_id != null) {
							console.log("relocating: " + derv.entry);
							
							var usg = that.getItemParent(item.usages, derv.parent_id);
							if (usg) {
								console.log("relocating %s to: %s", derv.entry, usg.entry);
								if (!usg.subDerv) {
									usg.subDerv = [];
								}
								remArr.unshift(item.derivatives.indexOf(derv));
								//item.derivatives.splice(item.derivatives.indexOf(derv), 1);
								usg.subDerv.push(derv);
								usg.subDerv.sort((a, b) => {
									let ca = a.entry;
									let cb = b.entry;	
									return ca.localeCompare(cb, "tr");
								});
							} else {
								console.warn("## WARNING - parent not found: " + derv.parent_id);
							}
						}
					}
					for (var k = 0; k < remArr.length; k++) {
						item.derivatives.splice(remArr[k], 1);
					}
				}
			}
		}
	}

	this.getItemParent = function (lst, itemId) {
		let res = null;
		if (lst) {
			for (let i = 0; i < lst.length; i++) {
				let item = lst[i];
				if (item.id == itemId) {
					res = item;
					break;
				}
			}
		}
		return res;
	}

	this.load = function(page) {

		return new Promise((resolve, reject) => {
			let pages = $scope.navi.pages;

			console.log("-- DictionaryController.load: " + page);
			if (page != null) {
				if (page == "main.html") {
					// remove intermediate pages to enable single page pop animation
					for (let i = 0; i < pages.length - 2; i++) {
						$scope.navi.pages[1].remove();
					}
					$scope.navi.popPage({
						// animation: 'none',
						callback: () => { 
							console.log("tests");
							resolve();
						}
					});
					// resolve();
				} else {
					$scope.navi.replacePage(page, { data: null });
					resolve();
				}
			} else {
				reject("invalid_page");
			}
		});
	};

	this.loadSection = function (sectionId, gotoList, cbFunc) {

		MainDictionary.get(sectionId).then ((dictionary) => {
			console.log('>>> loadSection completed: ' + sectionId);

			$rootScope.dictionary = dictionary;
			$rootScope.sectionId = sectionId;
			$rootScope.selectedSection = dictionary.sections[0];

			that.moveSubItems($rootScope.selectedSection.entries);

			// if update data present, sync
			if ($rootScope.updatedData) {
				DictionaryDataService.syncData($rootScope.updatedData);
			}

			// create index
			$rootScope.sectionSearchIndex = elasticlunr(function () {
				this.use(elasticlunr.tr);
				this.addField("entry");
				this.addField("label");
				this.setRef('id');
			});

			// add entries/docs to index, html elements to clusterize list
			let itemArr = [];
			$rootScope.selectedSection.entries.forEach((item) => {
				$rootScope.sectionSearchIndex.addDoc(item);

				itemArr.push(that.getListEntryHtml(item));
			});
			
			if (gotoList) {
				that.showPage('search.html');
			}
			setTimeout(() => {
				that.initSection(itemArr);
				// $("#scrollArea").fadeIn();
				$("#scrollArea").animate({ opacity: 1 });
			}, 1000);

			// check if update check is necessary
			/*var uperiod = parseInt($rootScope.prefs.system.updatePeriod);
			if (LocalStorageDictService.isUpdateRequired(uperiod)) {
				console.log('-- INFO: DictionaryController: update required');
				that.updateDictionary();
			} else {
				that.readCachedData();
			}*/

			if (cbFunc) {
				cbFunc();
			}
		});
	}

	
	this.initSection = function(itemArr) {
		console.log("-- initSection:" + itemArr.length);

		if ($("#sectionScrollArea").length > 0) {
			// $("#sectionScrollArea").empty();
			if (sectionClstr) {
				sectionClstr.clear();
				sectionClstr.destroy();
				// sectionClstr.update(itemArr);
				// sectionClstr.refresh();
			} else {
				
			}
			sectionClstr = new Clusterize({
					rows: itemArr
					, scrollId: "sectionScrollArea"
					, contentId: "sectionContentArea"
					, no_data_text: "Sonuç bulunamadı"
					, rows_in_block : 20
				});



			$("#sectionContentArea").on('click', 'ons-list-item', (e) => {
				let entryId = $(e.currentTarget).data('id');
				if (entryId) {
					let wrd = $rootScope.sectionSearchIndex.documentStore.getDoc(entryId);
					$scope.showWordDetail(wrd);
				}
			});
		}
	}

	this.updateSectionQuery = function () {
		$scope.search.querySection = $scope.sanitizeQuery($("input[name='querySection']").val());
		return $scope.search.querySection;
	}

	this.initPageHandlers = function () {
		if (!$rootScope.isMainPageHandler) {
			$rootScope.isMainPageHandler = true;

			document.querySelector('ons-navigator').addEventListener('postpush', function(e) {
				// let pgId = $(e.enterPage).attr('id');
				let pgId = $(e.enterPage).data('page-name');
				console.log("-- Post Push: " + pgId);
				
				that.disableSelectLetter();

				if (pgId == "searchPage") {
					$("input[name='querySection']").keyup((e) => {
						that.onSearchSectionInputChange();
					})
					that.enableSelectLetter();
				} else if (pgId == "mainPage") {

					that.loadIndex();
					// that.enableSelectLetter();

				} else if (pgId == "menu" || pgId == "prefsPage" || pgId == "aboutPage") {
					
				}
			});

			document.querySelector('ons-navigator').addEventListener('postpop', function(e) {
				let pgId = $(e.enterPage).data('page-name');
				console.log("-- Post Pop: " + pgId);

				that.disableSelectLetter();

				if (pgId == "searchPage") {
					let query = that.updateSectionQuery();

					if (query && query.length > 0) {
						that.updateFilteredSectionList();
					} else if (sectionClstr) {
						that.updateSectionList([], true);
					}
					that.enableSelectLetter();

				} else if (pgId == "mainPage") {

					//$rootScope.selectedSection = null;

					let qryStr = $scope.search.queryAll
					if (qryStr && qryStr.length > 0) {
						that.updateFilteredMainList();
					} else if (clusterize) {
						that.updateMainList([], true);
					}
					that.enableSelectLetter();
					if (!$scope.disableShowBanner) {
						$(".ad-box").fadeIn();
					}
				}
			});

			document.querySelector('ons-page').addEventListener('show', function() {
				console.log("-- Page Shown");
			});
		}
	}

	// EXECUTE INITIALIZATION
	if (!lockExecInit && typeof $rootScope.dictionary === "undefined") {
		
		lockExecInit = true;

		ons.forcePlatformStyling('ios');
		// setTimeout(ons.forcePlatformStyling, 1, 'ios');
		
		$rootScope.defaultPrefs = PrefsService.getDefaultPrefs();
		// copy prefs to empty object recursively
		$rootScope.prefs = jQuery.extend(true, {}, $rootScope.defaultPrefs);

		$rootScope.bookmarks = [];
		
		// setInterval(that.loadIndex, 4500);
		// that.loadIndex();
		//that.loadSection(0, false, null);
		
		// LocalStorageDictService.init();
		if (!prefsTestMode) {
			PrefsService.load($rootScope.prefs);
		} else {
			PrefsService.reset();
		}

		that.initPageHandlers();

		that.loadBannerInfo();

		// lockExecInit = false;
	}

	this.getSectionLabel = function() {
		let char = that.alphabetList()[$rootScope.sectionId];

		return char.c + char.c.toLocaleLowerCase('tr');
	}

	this.toggleLetters = () => {
		console.log('toggleLetters');
		$('#letterSplitter')[0].toggle();
	}

	this.clearSearchBox = () => {
		$("#txtSearchAll").val("");
		$("input[name='queryAll']").trigger('keyup');
		$("input[name='queryAll']").focus();
	}

	this.clearSectionSearchBox = () => {
		$("#txtSearchSection").val("");
		$("input[name='querySection']").trigger('keyup');
	}

}])

.directive('wordDetails', function() {
	return {
		transclude : true,
		template: '<div style="padding-top: 20px; margin-left: 40px;">{{ testWordHtml(wordEntry) }}</div>',
		link : function($scope, $element, $attr) {
			// some code
		}
	}
});
