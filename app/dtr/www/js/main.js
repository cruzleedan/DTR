import { readFile, process_wb } from "./fileReader.js";
import { global_wb } from "./globalVars";

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

const onToggleSettings = () => {
    const settings = document.querySelector('#advance-settings');
    const isCollapsed = settings.classList.contains("collapsed");
    if (isCollapsed) {
        settings.classList.remove("collapsed");
    } else {
        settings.classList.add("collapsed");
    }
};

const setupDragAndDrop = () => {
    const dropArea = document.querySelector('#drop-area');
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
};

export const initializeApp = () => {
    const uploadBtn = document.querySelector('.upload-file-btn');
    const outputFormat = document.querySelector('select[name=format]');
    const settingsBtn = document.querySelector('#advance-settings-btn');

    uploadBtn.addEventListener('click', onClickUploadXlsFile);
    outputFormat.addEventListener('change', onChangeFormat);
    settingsBtn.addEventListener('click', onToggleSettings);
    
    setupDragAndDrop();
};