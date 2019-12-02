angular.module('app')

.service('WordHtmlService', ['$http'
							, '$rootScope'
							, function($http
							, $rootScope) {

	var that = this;

	var _opts = null;

	this.testItem = function (scope, iElement, iAttrs, controller) {
		iElement.append(angular.element('<p>testing</p>'));
	}

	this.buildTitleHtml = function (item) {
		let titleTempl = "<p class='selected_word'>{entry}</p>";
		let originTmplStr = "<p class='word_origin'><span class='span-entry-origin'>{origin}</span></p> ";

		let elem = $("<div></div>");

		elem.append($(titleTempl.replace(/\{entry\}/g, item.entry)));

		if (item.origin) {
			elem.append($(originTmplStr.replace(/\{origin\}/g, item.origin)));
		}

		if (item.entry2) {
			elem.append($(titleTempl.replace(/\{entry\}/g, item.entry2)));
		}

		if (item.origin2) {
			elem.append($(originTmplStr.replace(/\{origin\}/g, item.origin2)));
		}
		return elem.html();
	}

	this.buildOriginHtml = function (item) {
		var originTmplStr = "<span class='word_origin'>{origin}</span> ";

		let res = originTmplStr.replace(/\{origin\}/g, item.origin);
		return res;
	}

	this.buildEntryHtml = function (item) {
		var html = "";
		that._opts = $rootScope.prefs.formatting;
		//var origStr = "";
		// template for in-line origin string
		var originTmplStr = "<span class='word_origin'>{origin}</span> ";
		if (item != null) {

			/*if (item.origin != null) {
				// separate main origin
				origStr = item.origin ;

				if (item.origin2 != null) {
					// separate main origin
					origStr += ", " + item.origin2;
				}
				origStr = "<p class='word_origin'>" + origStr + "</p> ";
			}*/
			
			if (item.definitions != null) {

				var cnt = 1;
				if (item.definitions.length > 0) {
					html += "<ol class='word_def word_def_list'>"
					for (var i = 0; i < item.definitions.length; i++) {
						var defItem = item.definitions[i];
						if (defItem.definition != null) {
							let origStr = "";
							if (defItem.origin) {
								//origStr = originTmplStr.replace(/\{origin\}/g, defItem.origin);
								origStr = this.buildOriginHtml(defItem);
							}
							html += "<li>";
							html += origStr;
							html += this.buildEntryDef(defItem);
							html += "</li>";
						}
						cnt++;
					}
					html += "</ol>"
				}
			}

			if (item.type != null) {
				html += "<span class='word_def_type'>" + item.type + "</span> ";
			}
			let definition = item.definition;
			if (definition != null) {
				definition = this.replaceMarkup(definition);

				html += "<p class='word_def'>" + definition + "</p>";
			}

			//html = origStr + html;
			
			html += this.buildExtras(item);
			html = html.trim();

			// if not empty, wrap inside paragraph
			if (html != "") {
				if (html.substr(html.length - 1, 1) != ".") {
					//html += ".";
				}
				html = "<p class='word_def'>" + html + "</p>"
			}

			if (item.derivatives != null) {
				item.derivatives.sort((a, b) => {
					//return a.entry.localeCompare(b.entry, "tr");
					let ansp = a.entry.replace(' ', '').replace('/', '');
					let bnsp = b.entry.replace(' ', '').replace('/', '');
					if (ansp == "çiftkapı" && bnsp == "çiftekapı") {
						return -1;
					} else if (ansp == "çiftekapı" && bnsp == "çiftkapı") {
						return 1;
					} 
					return ansp.localeCompare(bnsp, "tr");
				});

				html += this.addSubItems(item.derivatives, "word_derv_entry");
			}
			if (item.usages != null) {
				item.usages.sort((a, b) => {
					// return a.entry.localeCompare(b.entry, "tr");
					let ansp = a.entry.replace(' ', '').replace('/', '');
					let bnsp = b.entry.replace(' ', '').replace('/', '');
					return ansp.localeCompare(bnsp, "tr");
				});

				html += this.addSubItems(item.usages, "word_usage_entry");
			}
			if (item.images != null) {
				for (var i = 0; i < item.images.length; i++) {
					let img = item.images[i];
					var imgSrc = img.data != null ? img.data : img.url;
					var caption = img.caption ? img.caption : '';
					var title = img.title ? img.title : '';
					var customCls = img.custom_class ? img.custom_class : '';
					html += "<div class='word_image'>";
					if (title) {
						html += "<p class='word_image_title'>" + title + "</p>";
					}
					let clsStr = ['word_image', customCls].join(' ');
					html += "<img class='" + clsStr + "' src='" + imgSrc + "'/>";
					if (caption) {
						html += "<p class='word_image word_image_caption'>" + caption + "</p>";
					}
					html += "</div>";
				}
			}

		}

		return html;
	}

	this.addSubItems = function (subItemList, class_name) {
		var sub_html = "";
		var originTmplStr = "<span class='word_origin'>{origin}</span> ";
		var blockTmplStr = "<p class='p-{className}'><span class='{className}'>{entry}</span> {origin} {definition}</p>";
		for (var i = 0; i < subItemList.length; i++) {
			var item = subItemList[i];
			let origStr = "";
			if (item.origin) {
				origStr = originTmplStr.replace(/\{origin\}/g, item.origin);
			}
			// sub_html += "<p class='p-" + class_name + "'><span class='" + class_name + "'>" + origStr + item.entry + "</span>";
			// sub_html += this.buildEntryDef(item, class_name);
			// sub_html += "</p>"
			let enableLinks = this._opts ? this._opts.enableSeeAlso : false;
			sub_html += blockTmplStr.replace(/\{origin\}/g, origStr)
							.replace(/\{className\}/g, class_name)
							.replace(/\{entry\}/g, item.entry)
							.replace(/\{definition\}/g, this.buildEntryDef(item, class_name, enableLinks));

			if (item.subDerv) {
				sub_html += this.addSubItems(item.subDerv, 'word_derv_entry');
			}
		}
		return sub_html;
	}

	this.buildEntryDef = function(item, class_name) {
		var res_html = "";
		let enableLinks = this._opts ? this._opts.enableSeeAlso : false;
		if (item.definition != null) {
			if (class_name) {
				item.definition = item.definition.replace(/<p>/g, "<p class='p-" + class_name + "'>");
				item.definition = item.definition.replace(/<p([ a-z'"\-;:=0-9]+)>/g, "<p$1 class='p-" + class_name + "'>");
			}

			item.definition = this.replaceMarkup(item.definition);

			res_html += " <span class='word_def'>" + item.definition + "</span>";
		}
		res_html += this.buildExtras(item);
		return res_html;
	}

	/*
	 * Add synonym and see also fields to item's or subitem's definition
	 */
	this.buildExtras = function (item) {
		var res_html = "";
		if (item.synonym) {
			if (item.definition != null) {
				res_html += ",";
			}
			res_html += " <span class='word_synonym'>" + item.synonym + "</span>";
		}
		if (item.definition) {
			item.definition = item.definition.trim();
			if (item.definition.substr(item.definition.length - 1, 1) != ".") {
				//res_html += ".";
			}
		}
		if (item.see_also) {
			res_html += " <span>Bkz. " + item.see_also + "</span>.";
		}
		return res_html;
	}

	this.replaceMarkup = function(txt) {
		let enableLinks = this._opts ? this._opts.enableSeeAlso : false;
		if (txt) {
			if (enableLinks) {
				txt = txt.replace(/\[\[([a-zA-Z \-/ğĞüÜşŞıİöÖçÇâ°]+)\]\[([0-9]+)\]\]/g, "<a class='see-also-link' data-entry-id='$2' href='#'>$1</a>");
			} else {
				txt = txt.replace(/\[\[([a-zA-Z \-/ğĞüÜşŞıİöÖçÇâ°]+)\]\[([0-9]+)\]\]/g, "$1");
			}
		}
		return txt;
	}

}]);
