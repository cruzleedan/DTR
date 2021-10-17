import { createTable } from "./tableGenerator.js";
import { getDateStringFromDatetime, getTimeFromDatetime, getDatesBetweenDates, getDayOfTheWeek, isDateInstance, isNotDateInstance } from "./utils.js";
import { global_wb, X, setGlobalVar } from "./globalVars";

var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	worker: './js/workers/xlsxworker.js'
};

const getTimeCol = (hours, arr) => {
    let index;
    if (hours > 5 && hours < 11) {
        index = 0;
    } else if (hours > 11 && hours < 14) {
        index = 2;
        if (!arr[1]) {
            index = 1;
        }
    } else if (hours > 14) {
        index = 3;
    }
    return index;
}

const transformData = (arr) => {
    let data = new Map();
    let columns = {};
    let minDate;
    let maxDate;
    for(let i = 0; i < arr.length; i++) {
        let row = arr[i][0];
        row = row.split('\t').map(col => col.trim());
        if (i === 0) {
            row.forEach((name, j) => columns[name] = j);
            continue;
        }
        let datetime = new Date(row[columns.DateTime]);
        let dateStr = getDateStringFromDatetime(datetime);
        let name = row[columns.Name].trim() || row[columns.UID].trim();
        let time = getTimeFromDatetime(datetime);

        if (!minDate || (new Date(dateStr) - new Date(minDate) < 0)) {
            minDate = dateStr;
        }
        if (!maxDate || (new Date(dateStr) - new Date(maxDate) > 0)) {
            maxDate = dateStr;
        }
        
        if (!data.has(name)) {
            data.set(name, {
                [dateStr]: ['', '', '', '']
            });
        }
        
        if (!data.get(name)[dateStr]) {
            data.get(name)[dateStr] = ['', '', '', ''] // 2 Logs for AM and 2 Logs for PM
        }

        let momentDate = moment(datetime);
        let hours = momentDate.hours();
        let index = getTimeCol(hours, data.get(name)[dateStr]);
        let lastLog = data.get(name)[dateStr][index];
        if (lastLog) {
            let diffMin = momentDate.diff(lastLog, 'minutes');
            if (diffMin > 5) {
                data.get(name)[dateStr][index] = datetime;
            }
        } else {
            data.get(name)[dateStr][index] = datetime;
        }
    }

    let period = getDatesBetweenDates(new Date(minDate), new Date(maxDate));
    for (let i = 0; i < period.length; i++) {
        let date = period[i];
        let dayOfWeek = getDayOfTheWeek(date);
        data.forEach((row) => {
            if (row[date]) {
                let totalHours;
                let totalMinutes;
                if (isDateInstance([
                    row[date][0],
                    row[date][1],
                    row[date][2],
                    row[date][3]
                ])) {
                    let morningDuration = moment.duration(moment(row[date][1]).diff(row[date][0]));
                    let afternoonDuration = moment.duration(moment(row[date][3]).diff(row[date][2]));
                    totalHours = parseInt(morningDuration.asHours() + afternoonDuration.asHours());
                    totalMinutes = parseInt((morningDuration.asMinutes() + afternoonDuration.asMinutes()) % 60);
                } else if (isDateInstance([
                    row[date][0],
                    row[date][3]
                ]) && isNotDateInstance([
                    row[date][1],
                    row[date][2],
                ])) {
                    let duration = moment.duration(moment(row[date][3]).diff(row[date][0]));
                    totalHours = parseInt(duration.asHours());
                    totalMinutes = parseInt(duration.asMinutes() % 60);
                }
                
                row[date] = row[date].map(datetime => datetime instanceof Date ? getTimeFromDatetime(datetime) : datetime);
                row[date].unshift(date, dayOfWeek);
                row[date].push(totalHours, totalMinutes);
            } else {
                row[date] = [date, dayOfWeek];
            }
        });
    }

    let timesheet = [];
    data.forEach((row, name) => {
        timesheet = timesheet.concat([[name]], Object.values(row));
    });
    
    return {
        data,
        minDate,
        maxDate,
        timesheet
    };
}

export const process_wb = (function() {
	var OUT = document.getElementById('out');
	var HTMLOUT = document.getElementById('htmlout');

	var get_format = (function() {
		var radios = document.getElementsByName( "format" );
		return function() {
			for(var i = 0; i < radios.length; ++i) if(radios[i].checked || radios.length === 1) return radios[i].value;
		};
	})();

	var to_table = function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
			var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
			if(roa.length) result[sheetName] = roa;
		});
        let { timesheet, minDate, maxDate } = transformData(result.Sheet1);
        let table = createTable(timesheet, {minDate, maxDate});
        HTMLOUT.innerHTML = "";
        HTMLOUT.appendChild(table);
        return "";
	};
	
    var to_json = function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
			var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
			if(roa.length) result[sheetName] = roa;
		});
        return JSON.stringify(result, 2, 2);
	};

	var to_csv = function to_csv(workbook) {
		var result = [];
		workbook.SheetNames.forEach(function(sheetName) {
			var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
			if(csv.length){
				result.push("SHEET: " + sheetName);
				result.push("");
				result.push(csv);
			}
		});
		return result.join("\n");
	};

	var to_fmla = function to_fmla(workbook) {
		var result = [];
		workbook.SheetNames.forEach(function(sheetName) {
			var formulae = X.utils.get_formulae(workbook.Sheets[sheetName]);
			if(formulae.length){
				result.push("SHEET: " + sheetName);
				result.push("");
				result.push(formulae.join("\n"));
			}
		});
		return result.join("\n");
	};

	var to_html = function to_html(workbook) {
		HTMLOUT.innerHTML = "";
		workbook.SheetNames.forEach(function(sheetName) {
			var htmlstr = X.write(workbook, {sheet:sheetName, type:'string', bookType:'html'});
			HTMLOUT.innerHTML += htmlstr;
		});
		return "";
	};

	return function process_wb(wb) {
        setGlobalVar('global_wb', wb);
		// global_wb = wb;
		var output = "";

        HTMLOUT.innerHTML = "";
        OUT.innerHTML = "";

		switch(get_format()) {
			case "form":
                output = to_fmla(wb); break;
			case "html":
                output = to_html(wb); break;
			case "json":
                output = to_json(wb); break;
			case "table":
                output = to_table(wb); break;
			default:
                output = to_csv(wb);
		}
		
        if (OUT.innerText === undefined) {
            OUT.textContent = output;
        } else {
            OUT.innerText = output;
        }

		if (typeof console !== 'undefined') {
            console.log("output", new Date());
        }
	};
})(global_wb, X);

export const readFile = (() => {
    var rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString;
    var domrabs = document.getElementsByName("userabs")[0];
    if (!rABS) {
        domrabs.disabled = !(domrabs.checked = false);
    }

    var use_worker = typeof Worker !== 'undefined';
    var domwork = document.getElementsByName("useworker")[0];
    if (!use_worker) {
        domwork.disabled = !(domwork.checked = false);
    }

    var xw = function xw(data, cb) {
        var worker = new Worker(XW.worker);
        worker.onmessage = function(e) {
            switch(e.data.t) {
                case 'ready': break;
                case 'e': console.error(e.data.d); break;
                case XW.msg: cb(JSON.parse(e.data.d)); break;
            }
        };
        worker.postMessage({d:data,b:rABS?'binary':'array'});
    };

    return function do_file(files, callbackFn) {
        rABS = domrabs.checked;
        use_worker = domwork.checked;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            if (typeof console !== 'undefined') {
                console.log("onload", new Date(), rABS, use_worker);
            }

            var data = e.target.result;
            if (!rABS) {
                data = new Uint8Array(data);
            }

            if (use_worker) {
                xw(data, process_wb);
            } else {
                process_wb(X.read(data, {type: rABS ? 'binary' : 'array'}));
            }
        };

        if (rABS) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };    
})(X);
