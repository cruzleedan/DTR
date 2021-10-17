import { readFile, process_wb } from "./fileReader.js";
import { global_wb } from "./globalVars";
import { exportTableToXlsx } from "./tableGenerator";
import { isBrowser } from "./deviceInfo";

const onChangeUploadFile = (e) => {
    readFile(e.target.files);
}

const onClickUploadXlsFile = () => {
    const upload = document.querySelector(".upload-file-input");
    upload.click();
    upload.addEventListener("change", onChangeUploadFile);
};

const onChangeFormat = window.setfmt = function setfmt() {
    if (global_wb) {
        process_wb(global_wb);
    }
};

const setupDragAndDrop = () => {
    const dropArea = document.querySelector('#drop-area');
    if (isBrowser()) {
        dropArea.dataset.platform = "browser";
        const handleDrop = (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
    
            readFile(files);
        }
          
        const highlight = (e) => {
            dropArea.classList.add('highlight')
        }
          
        const unhighlight = (e) => {
            dropArea.classList.remove('highlight')
        }
    
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        }
    
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        });
    
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        });
          
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false)
        });
    
        dropArea.addEventListener('drop', handleDrop, false);  
    }
};

const onTapSave = (btn) => {
    if (btn.classList.contains("disabled")) {
        return;
    }
    const outputEl = document.querySelector("#htmlout");
    if (outputEl) {
        const tableEl = outputEl.querySelector("table");
        const titleEl = outputEl.querySelector(".time-period");
        const title = `${titleEl.dataset.minDate}-${titleEl.dataset.maxDate}`.replace(/\//g, '');
        exportTableToXlsx(tableEl, title);
    }
};

const setupSettingsDialog = () => {
    const settingsBtn = document.querySelector('#advance-settings-btn');
    
    const dialog = document.querySelector('dialog[data-id="advance-settings"]');
    const showDialogButton = document.querySelector('#advance-settings-btn');
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    showDialogButton.addEventListener('click', function() {
        dialog.showModal();
    });
    dialog.querySelector('.close').addEventListener('click', function() {
        dialog.close();
    });
};

export const initializeApp = () => {
    const uploadBtn = document.querySelector('.upload-file-btn');
    const outputFormat = document.querySelector('select[name=format]');
    const saveBtn = document.querySelector("#save-btn");

    uploadBtn.addEventListener('click', onClickUploadXlsFile);
    outputFormat.addEventListener('change', onChangeFormat);
    saveBtn.addEventListener('click', () => onTapSave(saveBtn));
    saveBtn.classList.add('disabled');
    
    setupDragAndDrop();
    setupSettingsDialog();
};