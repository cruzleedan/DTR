export const getDateStringFromDatetime = (datetime) => {
    return datetime.toLocaleDateString();
}

export const getTimeFromDatetime = (datetime) => {
    return datetime.toLocaleTimeString('en-us', { timeStyle: 'short' });
}

export const getDatesBetweenDates = (fromDate, toDate) => {
    let dates = [];
    while (fromDate <= toDate) {
        dates.push(getDateStringFromDatetime(fromDate));
        fromDate.setDate(fromDate.getDate() + 1);
    }
    return dates;
};

export const getDayOfTheWeek = (date) => {
    return Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));
}

export const isDateInstance = (param) => {
    if (Array.isArray(param)) {
        return param.every(d => d instanceof Date);
    } else {
        return param instanceof Date;
    }
};

export const isNotDateInstance = (param) => {
    if (Array.isArray(param)) {
        return param.every(d => !(d instanceof Date));
    } else {
        return !(param instanceof Date);
    }
};