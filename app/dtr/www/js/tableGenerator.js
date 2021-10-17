import { saveFile } from "./fileHelper.js";
export const exportTableToXlsx = (tableEl, filename = 'dtr') => {
    const wb = XLSX.utils.table_to_book(tableEl, { sheet: "DTR" });
    wb.Props = {
        Title: "DTR",
        Subject: "Time Period",
        Author: "D3",
        CreatedDate: new Date()
    };
    
    let wbout = XLSX.write(wb, { bookType:'xlsx',  type: 'binary' });
    
    function s2ab(s) {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }
    const fullFilename = filename.replace(/\//g, '-');
    return saveFile(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), `${filename}.xlsx`);
};

const onCellKedown = (e, cell) => {
    let row = cell.parentNode;
    if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
        if (!cell.innerText) {
            cell.remove();
            if (row.querySelectorAll("td:not(.add-col-cont)").length === 0) {
                row.remove();
            }
        }
    }
};

const createEditableCell = () => {
    const tdEl = document.createElement("td");
    tdEl.contentEditable = true;
    tdEl.addEventListener("keydown", (e) => onCellKedown(e, tdEl));
    return tdEl;
};

const onAddCol = (addCol, trEl) => {
    const tdEl = createEditableCell();
    trEl.insertBefore(tdEl, addCol);
};

const onAddRow = (row) => {
    const trEl = document.createElement("tr");
    const tdEl = createEditableCell();
    trEl.classList.add("relative-pos");
    trEl.appendChild(createAddRow());
    trEl.appendChild(tdEl);
    trEl.appendChild(createAddCol(trEl));
    row.parentNode.insertBefore(trEl, row.nextSibling);
};

const createAddBtn = (cls) => {
    const div = document.createElement("div");
    div.classList.add(cls);
    return div;
};

const createAddCol = (trEl) => {
    const addCol = document.createElement("td");
    const addColBtn = createAddBtn("add-col-btn");
    addCol.classList.add("add-col-cont", "no-border");
    addCol.appendChild(addColBtn);
    addColBtn.addEventListener("click", () => onAddCol(addCol, trEl));
    return addCol;
};

const createAddRow = (trEl) => {
    const addRowBtn = createAddBtn("add-row-btn");
    addRowBtn.addEventListener("click", () => onAddRow(trEl));
    return addRowBtn;
};

export const createTable = (data, {minDate, maxDate}) => {
    const tableEl = document.createElement("table");
    const tbodyEl = document.createElement("tbody");
    tableEl.appendChild(tbodyEl);
    tableEl.classList.add("editable-table");

    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        const trEl = document.createElement("tr");    
        trEl.classList.add("relative-pos");
        trEl.appendChild(createAddRow(trEl));
        for (let j = 0; j < row.length; j++) {
            let value = row[j];
            const tdEl = createEditableCell();
            tdEl.textContent = value;
            trEl.append(tdEl);
        }
        
        trEl.append(createAddCol(trEl));
        tbodyEl.appendChild(trEl);
    }

    const divContainer = document.createElement("div");
    const titleEl = document.createElement("div");
    const saveBtn = document.querySelector("#save-btn");
    titleEl.classList.add("time-period");
    titleEl.innerText = `${minDate} - ${maxDate}`;
    titleEl.dataset.minDate = minDate;
    titleEl.dataset.maxDate = maxDate;
    divContainer.appendChild(titleEl);
    divContainer.appendChild(tableEl);
    saveBtn.classList.remove("disabled");

    return divContainer;
};