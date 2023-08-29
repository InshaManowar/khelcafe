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
const captions = []; // Array to store captions
const links = []; // Array to store links    let isUploading = false; // Flag to track if images are currently uploading

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
                const linkInput = document.createElement('input'); // Create an input element for link
                captionInput.type = 'text';
                linkInput.type = 'text'; // Set the input type to text for link
                captionInput.placeholder = 'Enter caption';
                linkInput.placeholder = 'Enter link'; // Set placeholder for link input
                captionInput.classList.add('image-caption'); // Add a class for styling
                linkInput.classList.add('image-link'); // Add a class for styling
                captionInput.addEventListener('input', function () {
                    f.caption = captionInput.value; // Store the caption with the file object
                });
                linkInput.addEventListener('input', function () {
                    f.link = linkInput.value; // Store the link with the file object
                });
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imgBox = document.createElement('div');
                    imgBox.className = 'upload__img-box';
                    imgBox.innerHTML = `
                            <div class='img-bg' style='background-image: url(${e.target.result})' data-file='${f.name}'>
                                <div class='upload__img-close'></div>
                            </div>`;
                    imgBox.appendChild(captionInput);
                    imgBox.appendChild(linkInput); // Append the caption input
                    imgWrap.appendChild(imgBox);
                };
                reader.readAsDataURL(f);
                filesToUpload.push(f);
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
                    captions.push(info.caption);
                    links.push(info.link);
                    console.log('Uploaded Image URL:', info.downloadURL);
                    console.log('Caption:', info.caption);
                    console.log('Link:', info.link);
                    // Create a new caption element for display
                    const captionDisplay = document.createElement('p');
                    imgWrapList[0].appendChild(captionDisplay); // You can adjust the index if needed
                }
                console.log('All Uploaded Image URLs:', uploadedImageUrls);
                console.log('All Captions:', captions);
                console.log('All Links:', links);

                const payload = {
                    // Other properties of the payload...
                    pictorial: {
                        images: uploadedImageUrls,
                        text: captions,
                        onClick: links,
                        bgImage: '',  // Set the background image if applicable
                    },
                };
                // Make the API request
                const response = await fetch('https://my-app-9tpgj.ondigitalocean.app/articles/addArticle/one', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('Article added successfully. Response:', result);
                    successModal.show();
                } else {
                    console.error('Failed to add article:', response.status, response.statusText);
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
    const caption = file.caption || '';
    const link = file.link || ''; // Assuming you have a way to get the link value
    return { downloadURL, caption, link };
}