const writeFile = function (fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
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
                            writeFile(fileEntry, data);
                        },
                        function (error) {
                            console.log(
                                "error downloading file ", error
                            );
                        }
                    );
                },
                function (error) {
                    console.log("creating file ", error);
                }
            );
        },
        function (error) {
            console.log("error accessing local file system", error);
        }
    );
};
export const saveFile = (data, filename) => {
    if (device.platform === "Android") {
        cordovaSaveFile(data, filename);
    } else {
        saveAs(data, filename);
    }
};
