angular.module('app')

.service('DictionaryDataService', ['$rootScope', function ($rootScope) {
  
	var that = this;
	
	$rootScope.getEntryLabel = function (item) {
		let res = item.label ? item.label : item.entry;
		return res;
	}

	this.getSectionById = function(id) {
		var res = null;
		if (that.dictionary()) {
			var secArr = that.dictionary().sections;

			for (var i = 0; i < secArr.length; i++) {
				var section = secArr[i];
				if (section.sectionId == id) {
					return section;
				}
			};
		}
		return res;
	}
	
	this.syncIndex = function (updateData) 
	{
		console.log("-- syncIndex");
		let isDirty = false;

		// UPDATE modified items
		if (updateData.updated_entries && updateData.updated_entries.length > 0) {
			isDirty = true;

			updateData.updated_entries.map((item) => {
				$rootScope.indexMap[item.id] = that.toIndexItem(item);
			});
		}

		// ADD new entries
		if (updateData.new_entries && updateData.new_entries.length > 0) {
			isDirty = true;
			
			updateData.new_entries.map((item) => {
				$rootScope.indexMap[item.id] = that.toIndexItem(item);
			});
		}

		// DELETE removed items
		if (updateData.deleted_entries && updateData.deleted_entries.length > 0) {
			isDirty = true;

			updateData.deleted_entries.map((itemId) => {
				delete $rootScope.indexMap[itemId];
			});
		}

		if (isDirty) {
			$rootScope.index = Object.values($rootScope.indexMap);
		}
	}

	this.toIndexItem = function (val) {
		return {
			id: val.id
			, entry: val.entry
			, label: val.label ? val.label : val.entry
			, group_id: val.group_id
		};
	}

	this.syncData = function (updateData) 
	{
		let secEntries = that.selectedSectionEntries();
		let secEntryMap = {};
		secEntries.forEach((item) => {
			secEntryMap[item.id] = item;
		});

		let isDirty = false;
		// UPDATE modified items
		if (updateData.updated_entries) {
			// var arr = [];
			updateData.updated_entries.forEach(function(val, index) {
				if ($rootScope.sectionId == val.group_id) {
					isDirty = true;
					secEntryMap[val.id] = val;
				}
			});
		}

		// ADD new entries
		if (updateData.new_entries) {
			updateData.new_entries.forEach(function(val, index) {

				if ($rootScope.sectionId == val.group_id) {
					isDirty = true;
					secEntryMap[val.id] = val;
				}
			});
		}

		// DELETE removed items
		if (updateData.deleted_entries) {

			updateData.deleted_entries.forEach((itemId) => {
				if (secEntryMap[itemId] != null) {
					isDirty = true;
					delete secEntryMap[itemId];
				}
			});
		}
		
		if (isDirty) {
			that.setSelectedSectionEntries(Object.values(secEntryMap));
			that.sortDictionary();
		}
	}
	
	this.getEntrySectionId = function (txt) {
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
	}
	
	this.getEntrySection = function (txt) {
		var idx = that.getEntrySectionId(txt);
		
		if (idx > -1) {
			return $rootScope.dictionary.sections[idx];
		}
		return null;
	}
	
	this.sortDictionary = function () {
		if (that.dictionary()) {
			var sections = that.dictionary().sections;
			
			if (sections) {
				sections.forEach(function (section) {
					section.entries.sort(function(a, b) {
						return (a.entry).localeCompare(b.entry, 'tr', {sensitivity: 'base'});
					});
				});
			}
		}
	}
	
	this.getSectionEntries = function () {
		if ($rootScope.selectedSection) {
			return $rootScope.selectedSection.entries;
		}
		return [];
	}

	this.getIndexEntryById = function (id) {
		let res = null;
		$rootScope.index.forEach((entry, k) => {
			if (entry.id == id) {
				res = entry;
				return false;
			}
		});
		return res;
	}

	this.getIndexEntryIdx = function (id) {
		let res = -1;
		$rootScope.index.forEach((entry, k) => {
			if (entry.id == id) {
				res = k
				return false;
			}
		});
		return res;
	}

	this.getEntryById = function (id) {
		
		var res = null;
		$rootScope.dictionary.sections.forEach (function(section, i) {
			
			section.entries.forEach (function(entry, k) {
				// console.log("getEntryIndexById: " + item.id);
				if (entry.id == id) {
					entry.sectionId = section.sectionId;
					res = entry;
					return false;	// break inner forEach
				}
			});
			if (res) {
				return false;	// break outer forEach
			}
		});
		return res;
	}
	
	this.dictionary = function() {
		return $rootScope.dictionary;
	}

	this.getEntryIndexById = function (id) {
		var res = null;
		if (that.dictionary()) {
			that.dictionary().sections.forEach (function(section, i) {
				
				section.entries.forEach (function(entry, k) {
					// console.log("getEntryIndexById: " + item.id);
					if (entry.id == id) {
						res = {
							sectionId: section.sectionId,
							idx: k
						}
						return false;	// break
					}
				});
				if (res) {
					return false;	// break
				}
			});
		}
		return res;
	}

	this.selectedSection = function() {
		return $rootScope.selectedSection;
	}

	this.selectedSectionEntries = function() {
		let section = that.selectedSection();

		if (section && section.entries) {
			return section.entries;
		}
		return [];
	}

	this.setSelectedSectionEntries = (entries) => {
		if ($rootScope.selectedSection) {
			$rootScope.selectedSection.entries = entries;
		}
	}

	this.getFilteredDictionary = function() {
		return that.selectedSectionEntries().filter($scope.wordEntryFilter);
	}
	
	this.getListEntries = function(arr) {
		var res = [];
		
		arr.forEach(function (id, i) {
			// var item = that.getEntryById(id);
			var item = that.getIndexEntryById(id);
			if (item) {
				res.push(item);
			}
		});
		res.sort( (a, b) => { return a.entry.localeCompare(b.entry); } );
		return res;
	}
}]);