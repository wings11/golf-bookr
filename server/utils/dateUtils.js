export function getBangkokDateTime() {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
}

export function formatBangkokDate(date) {
    return new Date(date).toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export function formatBangkokTime(date) {
    return new Date(date).toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export function getCurrentBangkokDate() {
    return new Date().toLocaleDateString('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-');
}
