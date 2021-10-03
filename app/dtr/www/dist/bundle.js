/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./www/js/fileReader.js":
/*!******************************!*\
  !*** ./www/js/fileReader.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"process_wb\": () => (/* binding */ process_wb),\n/* harmony export */   \"readFile\": () => (/* binding */ readFile)\n/* harmony export */ });\n/* harmony import */ var _tableGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tableGenerator.js */ \"./www/js/tableGenerator.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ \"./www/js/utils.js\");\n/* harmony import */ var _globalVars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./globalVars */ \"./www/js/globalVars.js\");\n\n\n\n\nvar XW = {\n\t/* worker message */\n\tmsg: 'xlsx',\n\t/* worker scripts */\n\tworker: './js/workers/xlsxworker.js'\n};\n\nconst getTimeCol = (hours, arr) => {\n    let index;\n    if (hours > 5 && hours < 11) {\n        index = 0;\n    } else if (hours > 11 && hours < 14) {\n        index = 2;\n        if (!arr[1]) {\n            index = 1;\n        }\n    } else if (hours > 14) {\n        index = 3;\n    }\n    return index;\n}\n\nconst transformData = (arr) => {\n    let data = new Map();\n    let columns = {};\n    let minDate;\n    let maxDate;\n    for(let i = 0; i < arr.length; i++) {\n        let row = arr[i][0];\n        row = row.split('\\t').map(col => col.trim());\n        if (i === 0) {\n            row.forEach((name, j) => columns[name] = j);\n            continue;\n        }\n        let datetime = new Date(row[columns.DateTime]);\n        let dateStr = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getDateStringFromDatetime)(datetime);\n        let name = row[columns.Name].trim() || row[columns.UID].trim();\n        let time = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getTimeFromDatetime)(datetime);\n\n        if (!minDate || (new Date(dateStr) - new Date(minDate) < 0)) {\n            minDate = dateStr;\n        }\n        if (!maxDate || (new Date(dateStr) - new Date(maxDate) > 0)) {\n            maxDate = dateStr;\n        }\n        \n        if (!data.has(name)) {\n            data.set(name, {\n                [dateStr]: ['', '', '', '']\n            });\n        }\n        \n        if (!data.get(name)[dateStr]) {\n            data.get(name)[dateStr] = ['', '', '', ''] // 2 Logs for AM and 2 Logs for PM\n        }\n\n        let momentDate = moment(datetime);\n        let hours = momentDate.hours();\n        let index = getTimeCol(hours, data.get(name)[dateStr]);\n        let lastLog = data.get(name)[dateStr][index];\n        if (lastLog) {\n            let diffMin = momentDate.diff(lastLog, 'minutes');\n            if (diffMin > 5) {\n                data.get(name)[dateStr][index] = datetime;\n            }\n        } else {\n            data.get(name)[dateStr][index] = datetime;\n        }\n    }\n\n    let period = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getDatesBetweenDates)(new Date(minDate), new Date(maxDate));\n    for (let i = 0; i < period.length; i++) {\n        let date = period[i];\n        let dayOfWeek = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getDayOfTheWeek)(date);\n        data.forEach((row) => {\n            if (row[date]) {\n                let totalHours;\n                let totalMinutes;\n                if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.isDateInstance)([\n                    row[date][0],\n                    row[date][1],\n                    row[date][2],\n                    row[date][3]\n                ])) {\n                    let morningDuration = moment.duration(moment(row[date][1]).diff(row[date][0]));\n                    let afternoonDuration = moment.duration(moment(row[date][3]).diff(row[date][2]));\n                    totalHours = parseInt(morningDuration.asHours() + afternoonDuration.asHours());\n                    totalMinutes = parseInt((morningDuration.asMinutes() + afternoonDuration.asMinutes()) % 60);\n                } else if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.isDateInstance)([\n                    row[date][0],\n                    row[date][3]\n                ]) && (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.isNotDateInstance)([\n                    row[date][1],\n                    row[date][2],\n                ])) {\n                    let duration = moment.duration(moment(row[date][3]).diff(row[date][0]));\n                    totalHours = parseInt(duration.asHours());\n                    totalMinutes = parseInt(duration.asMinutes() % 60);\n                }\n                \n                row[date] = row[date].map(datetime => datetime instanceof Date ? (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getTimeFromDatetime)(datetime) : datetime);\n                row[date].unshift(date, dayOfWeek);\n                row[date].push(totalHours, totalMinutes);\n            } else {\n                row[date] = [date, dayOfWeek];\n            }\n        });\n    }\n\n    let timesheet = [];\n    data.forEach((row, name) => {\n        timesheet = timesheet.concat([[name]], Object.values(row));\n    });\n    \n    return {\n        data,\n        minDate,\n        maxDate,\n        timesheet\n    };\n}\n\nconst process_wb = (function() {\n\tvar OUT = document.getElementById('out');\n\tvar HTMLOUT = document.getElementById('htmlout');\n\n\tvar get_format = (function() {\n\t\tvar radios = document.getElementsByName( \"format\" );\n\t\treturn function() {\n\t\t\tfor(var i = 0; i < radios.length; ++i) if(radios[i].checked || radios.length === 1) return radios[i].value;\n\t\t};\n\t})();\n\n\tvar to_table = function to_json(workbook) {\n\t\tvar result = {};\n\t\tworkbook.SheetNames.forEach(function(sheetName) {\n\t\t\tvar roa = _globalVars__WEBPACK_IMPORTED_MODULE_2__.X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});\n\t\t\tif(roa.length) result[sheetName] = roa;\n\t\t});\n        let { timesheet, minDate, maxDate } = transformData(result.Sheet1);\n        let table = (0,_tableGenerator_js__WEBPACK_IMPORTED_MODULE_0__.createTable)(timesheet, `${minDate}_${maxDate}`);\n        HTMLOUT.innerHTML = \"\";\n        HTMLOUT.appendChild(table);\n        return \"\";\n\t};\n\t\n    var to_json = function to_json(workbook) {\n\t\tvar result = {};\n\t\tworkbook.SheetNames.forEach(function(sheetName) {\n\t\t\tvar roa = _globalVars__WEBPACK_IMPORTED_MODULE_2__.X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});\n\t\t\tif(roa.length) result[sheetName] = roa;\n\t\t});\n        return JSON.stringify(result, 2, 2);\n\t};\n\n\tvar to_csv = function to_csv(workbook) {\n\t\tvar result = [];\n\t\tworkbook.SheetNames.forEach(function(sheetName) {\n\t\t\tvar csv = _globalVars__WEBPACK_IMPORTED_MODULE_2__.X.utils.sheet_to_csv(workbook.Sheets[sheetName]);\n\t\t\tif(csv.length){\n\t\t\t\tresult.push(\"SHEET: \" + sheetName);\n\t\t\t\tresult.push(\"\");\n\t\t\t\tresult.push(csv);\n\t\t\t}\n\t\t});\n\t\treturn result.join(\"\\n\");\n\t};\n\n\tvar to_fmla = function to_fmla(workbook) {\n\t\tvar result = [];\n\t\tworkbook.SheetNames.forEach(function(sheetName) {\n\t\t\tvar formulae = _globalVars__WEBPACK_IMPORTED_MODULE_2__.X.utils.get_formulae(workbook.Sheets[sheetName]);\n\t\t\tif(formulae.length){\n\t\t\t\tresult.push(\"SHEET: \" + sheetName);\n\t\t\t\tresult.push(\"\");\n\t\t\t\tresult.push(formulae.join(\"\\n\"));\n\t\t\t}\n\t\t});\n\t\treturn result.join(\"\\n\");\n\t};\n\n\tvar to_html = function to_html(workbook) {\n\t\tHTMLOUT.innerHTML = \"\";\n\t\tworkbook.SheetNames.forEach(function(sheetName) {\n\t\t\tvar htmlstr = _globalVars__WEBPACK_IMPORTED_MODULE_2__.X.write(workbook, {sheet:sheetName, type:'string', bookType:'html'});\n\t\t\tHTMLOUT.innerHTML += htmlstr;\n\t\t});\n\t\treturn \"\";\n\t};\n\n\treturn function process_wb(wb) {\n        (0,_globalVars__WEBPACK_IMPORTED_MODULE_2__.setGlobalVar)('global_wb', wb);\n\t\t// global_wb = wb;\n\t\tvar output = \"\";\n\n        HTMLOUT.innerHTML = \"\";\n        OUT.innerHTML = \"\";\n\n\t\tswitch(get_format()) {\n\t\t\tcase \"form\":\n                output = to_fmla(wb); break;\n\t\t\tcase \"html\":\n                output = to_html(wb); break;\n\t\t\tcase \"json\":\n                output = to_json(wb); break;\n\t\t\tcase \"table\":\n                output = to_table(wb); break;\n\t\t\tdefault:\n                output = to_csv(wb);\n\t\t}\n\t\t\n        if (OUT.innerText === undefined) {\n            OUT.textContent = output;\n        } else {\n            OUT.innerText = output;\n        }\n\n\t\tif (typeof console !== 'undefined') {\n            console.log(\"output\", new Date());\n        }\n\t};\n})(_globalVars__WEBPACK_IMPORTED_MODULE_2__.global_wb, _globalVars__WEBPACK_IMPORTED_MODULE_2__.X);\n\nconst readFile = (() => {\n    var rABS = typeof FileReader !== \"undefined\" && (FileReader.prototype||{}).readAsBinaryString;\n    var domrabs = document.getElementsByName(\"userabs\")[0];\n    if (!rABS) {\n        domrabs.disabled = !(domrabs.checked = false);\n    }\n\n    var use_worker = typeof Worker !== 'undefined';\n    var domwork = document.getElementsByName(\"useworker\")[0];\n    if (!use_worker) {\n        domwork.disabled = !(domwork.checked = false);\n    }\n\n    var xw = function xw(data, cb) {\n        var worker = new Worker(XW.worker);\n        worker.onmessage = function(e) {\n            switch(e.data.t) {\n                case 'ready': break;\n                case 'e': console.error(e.data.d); break;\n                case XW.msg: cb(JSON.parse(e.data.d)); break;\n            }\n        };\n        worker.postMessage({d:data,b:rABS?'binary':'array'});\n    };\n\n    return function do_file(files, callbackFn) {\n        rABS = domrabs.checked;\n        use_worker = domwork.checked;\n        var file = files[0];\n        var reader = new FileReader();\n        reader.onload = function(e) {\n            if (typeof console !== 'undefined') {\n                console.log(\"onload\", new Date(), rABS, use_worker);\n            }\n\n            var data = e.target.result;\n            if (!rABS) {\n                data = new Uint8Array(data);\n            }\n\n            if (use_worker) {\n                xw(data, process_wb);\n            } else {\n                process_wb(_globalVars__WEBPACK_IMPORTED_MODULE_2__.X.read(data, {type: rABS ? 'binary' : 'array'}));\n            }\n        };\n\n        if (rABS) {\n            reader.readAsBinaryString(file);\n        } else {\n            reader.readAsArrayBuffer(file);\n        }\n    };    \n})(_globalVars__WEBPACK_IMPORTED_MODULE_2__.X);\n\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/fileReader.js?");

/***/ }),

/***/ "./www/js/globalVars.js":
/*!******************************!*\
  !*** ./www/js/globalVars.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"X\": () => (/* binding */ X),\n/* harmony export */   \"global_wb\": () => (/* binding */ global_wb),\n/* harmony export */   \"setGlobalVar\": () => (/* binding */ setGlobalVar)\n/* harmony export */ });\nvar X = null;\nvar global_wb = null;\nvar setGlobalVar = (name, value) => {\n    switch (name) {\n        case 'X':\n            X = value;\n            break;\n        case 'global_wb':\n            global_wb = value;\n            break;\n        default:\n    }\n}\n\n\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/globalVars.js?");

/***/ }),

/***/ "./www/js/index.js":
/*!*************************!*\
  !*** ./www/js/index.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ \"./www/js/main.js\");\n/* harmony import */ var _globalVars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globalVars */ \"./www/js/globalVars.js\");\n/*\n * Licensed to the Apache Software Foundation (ASF) under one\n * or more contributor license agreements.  See the NOTICE file\n * distributed with this work for additional information\n * regarding copyright ownership.  The ASF licenses this file\n * to you under the Apache License, Version 2.0 (the\n * \"License\"); you may not use this file except in compliance\n * with the License.  You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing,\n * software distributed under the License is distributed on an\n * \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n * KIND, either express or implied.  See the License for the\n * specific language governing permissions and limitations\n * under the License.\n */\n\n// Wait for the deviceready event before using any of Cordova's device APIs.\n// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready\n\n\n\n\ndocument.addEventListener('deviceready', onDeviceReady, false);\n\nfunction onDeviceReady() {\n    // Cordova is now initialized. Have fun!\n\n    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);\n    document.getElementById('deviceready').classList.add('ready');\n    document.getElementById('main-loading-mask').classList.add('hidden');\n    (0,_globalVars__WEBPACK_IMPORTED_MODULE_1__.setGlobalVar)('X', XLSX);\n    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.initializeApp)();\n}\n\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/index.js?");

/***/ }),

/***/ "./www/js/main.js":
/*!************************!*\
  !*** ./www/js/main.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"initializeApp\": () => (/* binding */ initializeApp)\n/* harmony export */ });\n/* harmony import */ var _fileReader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fileReader.js */ \"./www/js/fileReader.js\");\n/* harmony import */ var _globalVars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globalVars */ \"./www/js/globalVars.js\");\n\n\n\nconst onChangeUploadFile = (e) => {\n    (0,_fileReader_js__WEBPACK_IMPORTED_MODULE_0__.readFile)(e.target.files);\n}\n\nconst onClickUploadXlsFile = () => {\n    const upload = document.querySelector(\".upload-file-input\");\n    upload.click();\n    upload.addEventListener(\"change\", onChangeUploadFile);\n};\n\nconst onChangeFormat = window.setfmt = function setfmt() {\n    if (_globalVars__WEBPACK_IMPORTED_MODULE_1__.global_wb) {\n        (0,_fileReader_js__WEBPACK_IMPORTED_MODULE_0__.process_wb)(_globalVars__WEBPACK_IMPORTED_MODULE_1__.global_wb);\n    }\n};\n\nconst onToggleFieldset = (btn) => {\n    const fieldset = btn.closest('fieldset');\n    const isCollapsed = fieldset.classList.contains(\"collapsed\");\n    if (isCollapsed) {\n        fieldset.classList.remove(\"collapsed\");\n    } else {\n        fieldset.classList.add(\"collapsed\");\n    }\n};\n\nconst setupDragAndDrop = () => {\n    const dropArea = document.querySelector('#drop-area');\n    const handleDrop = (e) => {\n        let dt = e.dataTransfer;\n        let files = dt.files;\n\n        (0,_fileReader_js__WEBPACK_IMPORTED_MODULE_0__.readFile)(files);\n    }\n      \n    const highlight = (e) => {\n        dropArea.classList.add('highlight')\n    }\n      \n    const unhighlight = (e) => {\n        dropArea.classList.remove('highlight')\n    }\n\n    const preventDefaults = (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n    }\n\n    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {\n        dropArea.addEventListener(eventName, preventDefaults, false)\n    });\n\n    ['dragenter', 'dragover'].forEach(eventName => {\n        dropArea.addEventListener(eventName, highlight, false)\n    });\n      \n    ['dragleave', 'drop'].forEach(eventName => {\n        dropArea.addEventListener(eventName, unhighlight, false)\n    });\n\n    dropArea.addEventListener('drop', handleDrop, false);  \n};\n\nconst initializeApp = () => {\n    const uploadBtn = document.querySelector('.upload-file-btn');\n    const outputFormat = document.querySelector('select[name=format]');\n    const fieldsetToggleBtn = document.querySelector('.fieldset-toggle-btn');\n\n    uploadBtn.addEventListener('click', onClickUploadXlsFile);\n    outputFormat.addEventListener('change', onChangeFormat);\n    fieldsetToggleBtn.addEventListener('click', () => onToggleFieldset(fieldsetToggleBtn));\n    \n    setupDragAndDrop();\n};\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/main.js?");

/***/ }),

/***/ "./www/js/tableGenerator.js":
/*!**********************************!*\
  !*** ./www/js/tableGenerator.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"createTable\": () => (/* binding */ createTable)\n/* harmony export */ });\n\nconst exportTableToXlsx = (tableEl, filename = 'dtr') => {\n    const wb = XLSX.utils.table_to_book(tableEl, { sheet: \"DTR\" });\n    wb.Props = {\n        Title: \"DTR\",\n        Subject: \"Time Period\",\n        Author: \"D3\",\n        CreatedDate: new Date()\n    };\n    \n    let wbout = XLSX.write(wb, { bookType:'xlsx',  type: 'binary' });\n    \n    function s2ab(s) {\n        let buf = new ArrayBuffer(s.length);\n        let view = new Uint8Array(buf);\n        for (var i=0; i<s.length; i++) {\n            view[i] = s.charCodeAt(i) & 0xFF;\n        }\n        return buf;\n    }\n    saveAs(new Blob([s2ab(wbout)],{type:\"application/octet-stream\"}), `${filename}.xlsx`);\n};\n\nconst onCellKedown = (e, cell) => {\n    let row = cell.parentNode;\n    if ((e.ctrlKey || e.metaKey) && e.key === \"Backspace\") {\n        if (!cell.innerText) {\n            cell.remove();\n            if (row.querySelectorAll(\"td:not(.add-col-cont)\").length === 0) {\n                row.remove();\n            }\n        }\n    }\n};\n\nconst createEditableCell = () => {\n    const tdEl = document.createElement(\"td\");\n    tdEl.contentEditable = true;\n    tdEl.addEventListener(\"keydown\", (e) => onCellKedown(e, tdEl));\n    return tdEl;\n};\n\nconst onAddCol = (addCol, trEl) => {\n    const tdEl = createEditableCell();\n    trEl.insertBefore(tdEl, addCol);\n};\n\nconst onAddRow = (row) => {\n    const trEl = document.createElement(\"tr\");\n    const tdEl = createEditableCell();\n    trEl.classList.add(\"relative-pos\");\n    trEl.appendChild(createAddRow());\n    trEl.appendChild(tdEl);\n    trEl.appendChild(createAddCol(trEl));\n    row.parentNode.insertBefore(trEl, row.nextSibling);\n};\n\nconst createAddBtn = (cls) => {\n    const div = document.createElement(\"div\");\n    div.classList.add(cls);\n    return div;\n};\n\nconst createAddCol = (trEl) => {\n    const addCol = document.createElement(\"td\");\n    const addColBtn = createAddBtn(\"add-col-btn\");\n    addCol.classList.add(\"add-col-cont\", \"no-border\");\n    addCol.appendChild(addColBtn);\n    addColBtn.addEventListener(\"click\", () => onAddCol(addCol, trEl));\n    return addCol;\n};\n\nconst createAddRow = (trEl) => {\n    const addRowBtn = createAddBtn(\"add-row-btn\");\n    addRowBtn.addEventListener(\"click\", () => onAddRow(trEl));\n    return addRowBtn;\n};\n\nconst createTable = (data, title) => {\n    const tableEl = document.createElement(\"table\");\n    const tbodyEl = document.createElement(\"tbody\");\n    tableEl.appendChild(tbodyEl);\n    tableEl.classList.add(\"editable-table\");\n\n    for (let i = 0; i < data.length; i++) {\n        let row = data[i];\n        const trEl = document.createElement(\"tr\");    \n        trEl.classList.add(\"relative-pos\");\n        trEl.appendChild(createAddRow(trEl));\n        for (let j = 0; j < row.length; j++) {\n            let value = row[j];\n            const tdEl = createEditableCell();\n            tdEl.textContent = value;\n            trEl.append(tdEl);\n        }\n        \n        trEl.append(createAddCol(trEl));\n        tbodyEl.appendChild(trEl);\n    }\n\n    const divContainer = document.createElement(\"div\");\n    const downloadBtn = document.createElement(\"button\");\n    downloadBtn.innerText = \"Download\";\n    downloadBtn.classList.add(\"download-btn\");\n    divContainer.appendChild(downloadBtn);\n    divContainer.appendChild(tableEl);\n    downloadBtn.addEventListener(\"click\", () => exportTableToXlsx(tableEl, title));\n\n    return divContainer;\n};\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/tableGenerator.js?");

/***/ }),

/***/ "./www/js/utils.js":
/*!*************************!*\
  !*** ./www/js/utils.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"getDateStringFromDatetime\": () => (/* binding */ getDateStringFromDatetime),\n/* harmony export */   \"getTimeFromDatetime\": () => (/* binding */ getTimeFromDatetime),\n/* harmony export */   \"getDatesBetweenDates\": () => (/* binding */ getDatesBetweenDates),\n/* harmony export */   \"getDayOfTheWeek\": () => (/* binding */ getDayOfTheWeek),\n/* harmony export */   \"isDateInstance\": () => (/* binding */ isDateInstance),\n/* harmony export */   \"isNotDateInstance\": () => (/* binding */ isNotDateInstance)\n/* harmony export */ });\nconst getDateStringFromDatetime = (datetime) => {\n    return datetime.toLocaleDateString();\n}\n\nconst getTimeFromDatetime = (datetime) => {\n    return datetime.toLocaleTimeString('en-us', { timeStyle: 'short' });\n}\n\nconst getDatesBetweenDates = (fromDate, toDate) => {\n    let dates = [];\n    while (fromDate <= toDate) {\n        dates.push(getDateStringFromDatetime(fromDate));\n        fromDate.setDate(fromDate.getDate() + 1);\n    }\n    return dates;\n};\n\nconst getDayOfTheWeek = (date) => {\n    return Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));\n}\n\nconst isDateInstance = (param) => {\n    if (Array.isArray(param)) {\n        return param.every(d => d instanceof Date);\n    } else {\n        return param instanceof Date;\n    }\n};\n\nconst isNotDateInstance = (param) => {\n    if (Array.isArray(param)) {\n        return param.every(d => !(d instanceof Date));\n    } else {\n        return !(param instanceof Date);\n    }\n};\n\n//# sourceURL=webpack://com.dantuts.dtr/./www/js/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./www/js/index.js");
/******/ 	
/******/ })()
;