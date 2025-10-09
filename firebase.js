// firebase.js - SIMPLIFIED VERSION

// Check if Firebase is already initialized in index.html
if (typeof firebase === 'undefined') {
    console.error('Firebase not loaded. Make sure Firebase SDK is included in index.html');
} else {
    console.log('Firebase already initialized in index.html');
}

// Export Firebase instances for use in other modules
export const getFirestoreInstance = () => {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        return firebase.firestore();
    }
    return null;
};

export const getStorageInstance = () => {
    if (typeof firebase !== 'undefined' && firebase.storage) {
        return firebase.storage();
    }
    return null;
};

export const getAuthInstance = () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth();
    }
    return null;
};
