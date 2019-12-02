
String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.charCount = function (srchChar) {
	var res = 0;
	for (var i = 0; i < this.length; i++) {
		if (this.substr(i,1) == srchChar) {
			res++;
		}
	}
	return res;
}

angular.module('app', ['onsen']);

ons.platform.select("android");
