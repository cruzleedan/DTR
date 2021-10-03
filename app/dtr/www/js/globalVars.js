var X = null;
var global_wb = null;
var setGlobalVar = (name, value) => {
    switch (name) {
        case 'X':
            X = value;
            break;
        case 'global_wb':
            global_wb = value;
            break;
        default:
    }
}

export {
    X,
    global_wb,
    setGlobalVar
}