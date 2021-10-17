const writeFile = function (fileEntry, dataObj, callback) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            // console.log("Successful file write...");
            callback(true);
        };

        fileWriter.onerror = function (e) {
            callback(false, "Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
};

const cordovaSaveFile = (data, filename) => {
    return new Promise((resolve, reject) => {
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT,
            0,
            function (fileSystem) {
                fileSystem.root.getDirectory(
                    "Download",
                    { create: true, exclusive: false },
                    function (dirEntry) {
                        dirEntry.getFile(
                            filename,
                            { create: true, exclusive: false },
                            function (fileEntry) {
                                writeFile(fileEntry, data, function(success, errMsg) {
                                    if (success) {
                                        resolve(true);
                                    } else {
                                        reject(errMsg);
                                    }
                                });
                            },
                            function (error) {
                                reject("Failed to download file." + JSON.stringify(error));
                            }
                        );
                    },
                    function (error) {
                        reject("Failed to locate download folder.");
                    }
                );
            },
            function (error) {
                reject("error accessing local file system");
            }
        );
    });
};
export const saveFile = (data, filename) => {
    if (device.platform === "Android") {
        return cordovaSaveFile(data, filename);
    } else {
        return new Promise(resolve => {
            saveAs(data, filename);
            resolve(true);
        });
    }
};
