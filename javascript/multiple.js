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
  

    document.addEventListener('DOMContentLoaded', function () {
        ImgUpload();
    });

    const uploadedImageUrls = []; // Array to store uploaded image URLs
    let isUploading = false; // Flag to track if images are currently uploading

    function ImgUpload() {
        const imgWrapList = document.querySelectorAll('.upload__img-wrap');
        const getUrlsButton = document.getElementById('getUrlsButton');
        const loader = document.getElementById('loader');
        const filesToUpload = []; // Array to store files to be uploaded
        const uploadCompleteCheckbox = document.getElementById('uploadCompleteCheckbox'); // New checkbox element

        imgWrapList.forEach(function (imgWrap) {
            const inputfile = imgWrap.closest('.upload__box').querySelector('.upload__inputfile');
            const maxLength = parseInt(inputfile.getAttribute('data-max_length'));

            inputfile.addEventListener('change', function (e) {
                const files = e.target.files;
                const filesArr = Array.from(files);

                for (const f of filesArr) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }

                    if (filesToUpload.length >= maxLength) {
                        break;
                    }

                    const captionInput = document.createElement('input'); // Create an input element for caption
                    captionInput.type = 'text';
                    captionInput.placeholder = 'Enter caption';
                    captionInput.classList.add('image-caption'); // Add a class for styling
                    captionInput.addEventListener('input', function () {
                        f.caption = captionInput.value; // Store the caption with the file object
                    });
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imgBox = document.createElement('div');
                        imgBox.className = 'upload__img-box';
                        imgBox.innerHTML = `
                            <div class='img-bg' style='background-image: url(${e.target.result})' data-file='${f.name}'>
                                <div class='upload__img-close'></div>
                            </div>`;
                        imgBox.appendChild(captionInput); // Append the caption input
                        imgWrap.appendChild(imgBox);
                    };
                    reader.readAsDataURL(f);
                }
            });

            // Event listener for the checkbox
            uploadCompleteCheckbox.addEventListener('change', function () {
                if (uploadCompleteCheckbox.checked) {
                    getUrlsButton.disabled = false; // Enable the button
                } else {
                    getUrlsButton.disabled = true; // Disable the button
                }
            });

            getUrlsButton.addEventListener('click', async function () {
                if (!uploadCompleteCheckbox.checked) {
                    console.log('Please confirm uploading of all images.');
                    return;
                }

                if (filesToUpload.length === 0) {
                    console.log('No images to upload.');
                    return;
                }

                isUploading = true; // Start uploading
                loader.style.display = 'block'; // Show loader

                const uploadPromises = filesToUpload.map(uploadImagesToFirebase);
                try {
                    const imageInfos = await Promise.all(uploadPromises);
                    for (const info of imageInfos) {
                        uploadedImageUrls.push(info.downloadURL);
                        console.log('Uploaded Image URL:', info.downloadURL);
                        console.log('Caption:', info.caption); // Display the caption
                
                        // Create a new caption element for display
                        const captionDisplay = document.createElement('p');
                        captionDisplay.textContent = `Caption: ${info.caption}`;
                        imgWrapList[0].appendChild(captionDisplay); // You can adjust the index if needed
                    }
                
                    loader.style.display = 'none'; // Hide loader
                    isUploading = false; // Finished uploading
                } catch (error) {
                    console.error('Error uploading images:', error);
                    loader.style.display = 'none'; // Hide loader in case of error
                    isUploading = false; // Reset uploading status
                }
            });

            imgWrap.addEventListener('click', function (e) {
                if (e.target.classList.contains('upload__img-close')) {
                    const file = e.target.parentElement.getAttribute('data-file');
                    const imgBox = e.target.closest('.upload__img-box');
                    imgBox.remove();
                    removeFromArray(filesToUpload, file);
                }
            });
        });
    }

    function removeFromArray(arr, value) {
        const index = arr.findIndex(item => item.name === value);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }

    async function uploadImagesToFirebase(file) {
        const storageRef = firebase.storage().ref(`images/${file.name}`);
        await storageRef.put(file);
        const downloadURL = await storageRef.getDownloadURL();
        const caption = file.caption || ''; // Get the caption from the file object
        return { downloadURL, caption }; 
    }
