// This is a JavaScript file

angular.module('app')

.controller('WordDetailController', ['$scope'
									, '$rootScope'
									, '$timeout'
									, 'WordHtmlService'
									, 'DictionaryDataService'
									, 'PrefsService'

									, function($scope
									, $rootScope
									, $timeout
									, WordHtmlService
									, DictionaryDataService
									, PrefsService) {
	var that = this;
	
	this.swiper;

	this.dictArr = $rootScope.dictionary;
	this.testCnt = 4;

	this.activeEntry = "";
	this.isShowPage = false;

	$scope.$on('myShowPage', function(event, entry) {
		console.log('++ received myShowPage: ' + that.selectedEntry().entry);
	
		// that.initPage(entry);
	});

	this.initPage = function (entry) {
		if (!that.isShowPage) {
			//that.isShowPage = true;

			var idx = -1;
			idx = that.selectedSectionEntries().indexOf(entry);

			if (idx == -1) {
				that.selectedSectionEntries().forEach((item, k) => {
					if (item.id == entry.id) {
						idx = k;
						return false;
					}
				});
			}
			that.isShowPage = false;
		}
		that.initSwiper(idx);
	}

	this.initSwiper = function(initItem) {
		that.swiper = new Swiper('.swiper-container', {
			slidesPerView: 1,
			centeredSlides: true,
			spaceBetween: 10,
			initialSlide: initItem,
			virtual: {
				slides: (function () {
					var slides = [];
					let fn = that.getCarouselSlide;
					for (var i = 0; i < that.selectedSectionEntries().length; i += 1) {
						slides.push(fn(i));
					}
					return slides;
				}()),
			},
		});

		that.swiper.on('slideChange', function () {
			var entry = that.selectedSectionEntries()[that.swiper.activeIndex];
			if (entry) {
				$rootScope.selectedEntry = entry;
				that.setToolbarTitle();
				that.setMarkupHandlers();
			}
		});

		this.setToolbarTitle();
		this.setMarkupHandlers();
	}

	this.setMarkupHandlers = () => {
		console.log('-- setMarkupHandlers');
		$(".see-also-link").off('click');

		$(".see-also-link").on('click', (event) => {
			let tgt = $(event.currentTarget);
			if (tgt) {
				let entryId = tgt.data('entry-id');
				console.log(`target: ${entryId}`);

				if (entryId) {
					$rootScope.$broadcast('showSeeAlsoItem', entryId);
				}
			}
		});
	}

	this.setToolbarTitle = function() {
		let entry = $rootScope.selectedEntry;
		/*if (that.swiper) {
			entry = that.selectedSectionEntries()[that.swiper.activeIndex];
		} else {
			entry = $rootScope.selectedEntry;
		}*/
		if (entry) {
			$(".selected_word_entry").html(that.getEntryLabel(entry));

			if (that.isBookmarked()) {
				$('.word-bookmark').attr('icon', 'fa-bookmark');
			} else {
				$('.word-bookmark').attr('icon', 'fa-bookmark-o');
			}
		}
	}

	var carouselPageTempl = '<div class="scrolling-wrapper-flexbox d-flex flex-column h-100"><div class="navbar fixed-top sticky-top sel-word-nav"><div class="sel_word_div" style=""><label class="selected_word" id="wordTitle-{id}">{titleHml}</label></div></div><div id="outer" style="flex: 1;" class="d-flex flex-column flex-grow"><div id="two" class="h-100 flex-grow"><div class="d-flex flex-column flex-grow" style=""><div class="sel_def_div"><label id="wordDefinition-{id}" class="selected_def">{defnHtml}</label></div></div></div></div></div>';

	this.getCarouselSlide = function(i) {

		let entry = that.selectedSectionEntries()[i];
		if (entry) {
			// console.log('++ Building entry: ' + i + ":" + entry.entry);
			let titleHtml = WordHtmlService.buildTitleHtml(entry);
			let defnHtml = WordHtmlService.buildEntryHtml(entry);

			MathJax.Hub.Config({messageStyle: "none"});
			MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

			return carouselPageTempl.replace(/{id}/g, entry.id)
									.replace(/{titleHml}/g, titleHtml)
									.replace(/{defnHtml}/g, defnHtml)

		}
	}

	this.addNeighborItems = function (entry) {
		var idx = that.selectedSectionEntries().indexOf(entry);
		if (idx == -1) {
			entry = DictionaryDataService.getEntryById(entry.id);
			idx = that.selectedSectionEntries().indexOf(entry);
		}
		if (idx > 0) {
			var prevItem = that.selectedSectionEntries()[idx - 1];
			that.buildEntryHtml(prevItem);
		}
		if (idx < that.selectedSectionEntries().length - 1) {
			var nextItem = that.selectedSectionEntries()[idx + 1];
			that.buildEntryHtml(nextItem);
		}
	}

	this.isBookmarked = function() {
		var item = that.selectedEntry();
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx != -1) {
				return true;
			}
		}
		return false;
	}

	this.seeAlsoClick = function() {
		console.log("- seeAlsoClick");
	}

	this.addBookmark = function() {
		var item = that.selectedEntry();
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx == -1) {
				$rootScope.bookmarks.push(item.id);
				ons.notification.toast("Sözcük favorilere eklendi", { timeout: 2000 });
			} else {
				$rootScope.bookmarks.splice(idx, 1);
				ons.notification.toast("Sözcük favorilerden çıkarıldı", { timeout: 2000 });
			}
			that.setToolbarTitle();
		}
	}

	this.removeBookmark = function() {
		var item = that.selectedEntry();
		if (item) {
			var idx = $rootScope.bookmarks.indexOf(item.id);
			if (idx != -1) {
				$rootScope.bookmarks.splice(idx, 1);
				ons.notification.toast("Sözcük favorilerden çıkarıldı", { timeout: 2000 });
				that.setToolbarTitle();
			}
		}
	}

	this.getEntryLabel = function (item) {
		let res = item.label ? item.label : item.entry;
		return res;
	}

	this.onPostChange = function(event) {
		$scope.$apply(() => {
			var entry = that.selectedSectionEntries()[event.activeIndex];
			if (entry) {
				$rootScope.selectedEntry = entry;
				
				// that.activeEntry = entry.entry;
				$(".selected_word_entry").html(that.getEntryLabel(entry));

				console.log('++ Changed to ' + event.activeIndex + ":" + entry.entry);
				that.buildEntryHtml(entry);
				that.addNeighborItems(entry);
				$(".word_carousel_item").css("overflow-y", "auto");
			}
		});
	};

	this.selectedEntry = function() {
		/*if ($scope.navi.topPage.data == null) {
			return null;
		}
		return $scope.navi.topPage.data.selectedEntry;*/
		if ($rootScope.selectedEntry) {
			return $rootScope.selectedEntry;
		}
		return null;
	}

	this.selectedSectionEntries = function() {
		/*if ($scope.navi.topPage.data == null) {
			return null;
		}
		return $scope.navi.topPage.data.dictionary;*/
		if ($rootScope.selectedSection) {
			return $rootScope.selectedSection.entries;
		}
		return [];
	}

	/*this.buildEntryHtml = function (item) {
		//var item = that.selectedEntry();
		var itemId = "#wordDefinition" + item.id;
		var elem = $(itemId);
		if (elem != null && elem.length > 0 && item != null) {
			var html = WordHtmlService.buildEntryHtml(item);

			elem.html(html);
			// elem.css('display', 'none');
			elem.fadeIn();

			MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
		}
		// console.log('buildEntryHtml end');
	}*/

	this.buildTitleHtml = function (item) {
		let res = WordHtmlService.buildTitleHtml(item);
		return res;
	}

	this.buildEntryHtml = function (item) {
		//var item = that.selectedEntry();
		var titleElem = $("#wordTitle-" + item.id);
		var defElem = $("#wordDefinition-" + item.id);

		if (titleElem != null && titleElem.length > 0 && item != null) {
			let html = WordHtmlService.buildTitleHtml(item);

			titleElem.html(html);
			titleElem.fadeIn();
		}

		if (defElem != null && defElem.length > 0 && item != null) {
			let html = WordHtmlService.buildEntryHtml(item);

			defElem.html(html);
			defElem.fadeIn();

			MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

			$(".see-also-link").click((event) => {
				let tgt = $(event.currentTarget);
				if (tgt) {
					let itemId = tgt.data('item-id');
					console.log(`target: ${itemId}`);

				}
			});
		}
		// console.log('buildEntryHtml end');
	}

	this.entry = function() {
		if (that.selectedEntry() == null) {
			return "";
		}
		return that.selectedEntry().entry;
	}

	this.showPage = function (pageUrl) {
		console.log("WordDetailController.showPage: " + pageUrl);
		$scope.navi.pushPage(pageUrl);
	};

	this.postPushHandler = function(e) {
		let pgId = $(e.enterPage).data('page-name');
		console.log("-- Word Detail Post Push: " + pgId);

		if (pgId == "wordPage") {
			that.initPage(that.selectedEntry());
		}
	}

	this.initPageHandlers = function () {
		if (!$rootScope.isWordPageHandler) {
			$rootScope.isWordPageHandler = true;
			document.querySelector('ons-navigator').addEventListener('postpush', that.postPushHandler);
		}
	};

	that.initPageHandlers();

}]);
