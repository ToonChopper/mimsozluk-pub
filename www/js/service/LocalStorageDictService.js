angular.module('app')

.service('LocalStorageDictService', ['$window', function(win) {
    var that = this;
    var msgs = [];
    var conn;

    this.addItem = function(store) {
        try {
            store.put({ id: 1302, item: {} });
        } catch (err) {
            console.log("ERROR.addItem: " + err.message);
            that.notifyError('Yerel veritabanı hatası');
        }
    };

    this.openDBConnection = function() {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        conn = indexedDB.open("dictionary", 1);
    }

    this.readCachedData = function(callback) {
        that.openDBConnection();

        conn.onerror = function(evt) {
            console.log(">> readCachedData - Database error code: " + evt.target.error.code + ":" + evt.target.error.message);
            that.notifyError(evt.target.error.message);
        };

        conn.onupgradeneeded = function() {
            console.log(">> readCachedData - onupgradeneeded");
            try {
                var db = conn.result;
                var dictStore = db.createObjectStore("DictionaryStore", { keyPath: "id" });
            } catch (err) {
                console.error("ERROR:" + err.message);
                that.notifyError(err.message);
            }
        };

        conn.onsuccess = function() {
            console.log(">> readCachedData - onsuccess");
            try {
					// Start a new transaction
					var db = conn.result;
					var tx = db.transaction("DictionaryStore", "readwrite");
					var store = tx.objectStore("DictionaryStore");

					var cacheKey = localStorage.getItem("lastUpdateKey");
					if (cacheKey) {
						var cachedData = store.get(cacheKey);

						cachedData.onsuccess = function(event) {
							console.log("->> readCachedData - onsuccess: " + cacheKey);
							/*for (var key in cachedData) {
								console.log("++ cachedData." + key + " = " +  cachedData[key]);
							}*/
							callback(cachedData.result);
						}

						cachedData.onerror = function() {
							console.error("->> readCachedData - onerror: " + cachedData.error);
							callback(null);
						}
					} else {
						callback(null);
					}

					db.close();	
					
					tx.oncomplete = function(e_tx) {
					}
					

            } catch (err) {
                console.error("ERROR:" + err.message);
                that.notifyError(err.message);
            }
        }
    };

    this.getDateKey = function(join_str) {
        if (!join_str) {
            join_str = '';
        }
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join(join_str);
    }

    this.saveRemoteUpdateKey = function() {
        var key = that.getSaveIndex();
        localStorage.setItem("lastUpdateKey", key);
        console.log("-- saveRemoteUpdateKey: " + key);
    }

    this.getSaveIndex = function() {
        if (!localStorage) {
            return that.getDateKey();
        }
        var res = localStorage.getItem("lastUpdateKey");
        var n = 1;
        if (res) {
            var pdate = res.substr(0, 8);           // format: yyyymmdd000
            if (pdate !== that.getDateKey()) {
                n = 1;
            } else {
                n = parseInt(res.substr(8)) + 1;
            }
        }
        res = that.getDateKey() + "";
        if (n < 10) {
            res += "00";
        } else if (n < 100) {
            res += "0";
        }
        res += n;
        return res;
    }

    this.saveUpdates = function(dictData) {
        that.openDBConnection();
        console.log("-- saveUpdates");

        conn.onupgradeneeded = function() {
            console.log(">> saveUpdates.connect.upgradeneeded");
            try {
                var db = conn.result;
                var dictStore = db.createObjectStore("DictionaryStore", { keyPath: "id" });
            } catch (err) {
                console.log("ERROR:" + err.message);
                that.notifyError(err.message);
            }
        };

        conn.onsuccess = function() {
            console.log(">> saveUpdates.connect.success");
            try {
                // Start a new transaction
                var db = conn.result;
                var tx = db.transaction("DictionaryStore", "readwrite");
                var store = tx.objectStore("DictionaryStore");

                // Check item count
                var cntReq = store.count();
                cntReq.onerror = function(event) {
                    console.error("->> saveUpdates.onerror: " + dictData.error);
                }

                cntReq.onsuccess = function(event) {

                    var cnt = parseInt(cntReq.result);
                    var lastKey = localStorage.getItem("lastUpdateKey");
                    var saveIndex = that.getSaveIndex();

                    console.log("->> saveUpdates.onsuccess: saveIndex: " + saveIndex);

                    if (cnt > 1 && lastKey) {
                        // Delete older entries
                        var delReq = store.delete(IDBKeyRange.upperBound(lastKey, true));
                        delReq.onsuccess = function(event) {
                            // save
                            store.put({ id: saveIndex, item: { "data": dictData } });
                        }

                    } else {
                        store.put({ id: saveIndex, item: { "data": dictData } });
                    }
                    /*that.clearDB().then(() => {
                        store.put({ id: saveIndex, item: { "data": dictData } });
                    }).then(() => {
                        that.saveRemoteUpdateKey();
                    });*/

                    that.saveRemoteUpdateKey();
                }

                // Close the db when the transaction is done
                tx.oncomplete = function() {
                    db.close();
                };

            } catch (err) {
                console.log("ERROR:" + err.message);
                that.notifyError(err.message);
            }
        };

        conn.onerror = function(evt) {
            console.log(">> Database error: " + evt.target.error.code + ":" + evt.target.error.message);
            that.notifyError(evt.target.error.message);
        };

    };

    this.clearAppData = async function() {
        return new Promise(async (resolve, reject) => {
            localStorage.clear();

            await that.clearDB();

            resolve();
        }).catch((err) => {
            reject(err);
        });
    }

    this.clearDB = function() {
        return new Promise((resolve, reject) => {

            that.openDBConnection();
            console.log("-- clearDB");

            conn.onsuccess = function() {
                console.log(">> clearDB.connect.success");
                try {
                    // Start a new transaction
                    var db = conn.result;
                    var tx = db.transaction("DictionaryStore", "readwrite");
                    var store = tx.objectStore("DictionaryStore");

                    tx.onerror = function(event) {
                        console.error("->> clearDB.onerror: " + tx.error);
                    }

                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };

                    var clearReq = store.clear();

                    clearReq.onerror = function(event) {
                        console.error("->> clearDB error: " + clearReq.error);
                        reject(clearReq.error);
                    }

                    clearReq.onsuccess = function(event) {
                        console.log("-- clearDB succeeded");
                        resolve();
                    }

                } catch (err) {
                    console.log("ERROR:" + err.message);
                    that.notifyError(err.message);
                    reject(err.message);
                }
            };

            conn.onerror = function(evt) {
                console.log(">> Database error: " + evt.target.error.code + ":" + evt.target.error.message);
                that.notifyError(evt.target.error.message);
                reject(evt.target.error.message);
            };
        });
    };

    this.isUpdateRequired = function(updatePeriod) {
        var lastUpdateKey = localStorage.getItem("lastUpdateKey");
        var updateDate = lastUpdateKey ? parseInt(lastUpdateKey.substr(0, 8)) : 0;
        console.log("-- isUpdateRequired.key: " + lastUpdateKey);

        // TEST
        // return false;

        if (!lastUpdateKey) {
            return true;
        }
        if (!updatePeriod) {
            updatePeriod = 7;
        }

        var dateKey = parseInt(that.getDateKey());

        console.log("-- isUpdateRequired.dates: " + dateKey + ":" + updateDate + ":period:" + updatePeriod);

        return dateKey - updateDate >= updatePeriod;
    }

    this.notifyError = function(msg) {
        //ons.notification.alert(msg);
    }
}]);