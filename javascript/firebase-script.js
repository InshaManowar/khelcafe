// Your Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyC4eVukZa-QOI7OXFdF8hC6XGBAyCVGQNY",
    authDomain: "khelcafe.firebaseapp.com",
    projectId: "khelcafe",
    storageBucket: "khelcafe.appspot.com",
    messagingSenderId: "343020766912",
    appId: "1:343020766912:web:51eaf0ebcd987ac613cf25"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

async function uploadImages(files) {
    const imageUrls = [];

    for (const file of files) {
        const storageRef = firebase.storage().ref(`images/${file.name}`);
        await storageRef.put(file);
        const downloadURL = await storageRef.getDownloadURL();
        imageUrls.push(downloadURL);
    }

    return imageUrls;
}
