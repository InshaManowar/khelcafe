document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addPollForm');
    const submitButton = document.getElementById('submitButton');
    const confirmCheckbox = document.getElementById('confirmCheckbox');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    // Add event listener to confirm checkbox
    confirmCheckbox.addEventListener('change', function () {
        submitButton.style.display = confirmCheckbox.checked ? 'block' : 'none';
    });

    submitButton.addEventListener('click', async function (event) {
        event.preventDefault();



        const currentDate = new Date().toISOString().substring(0, 23);
        const language = form.elements.language.textContent.trim();
        const question = form.elements.question.value.trim();
        const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
        console.log('id', loggedInAuthorId);
        if (!language || !question) {
            alert('Please fill in all required fields.');
            return;
        }
        const confirmCheckbox = document.getElementById('confirmCheckbox');
        const submitButton = document.getElementById('submitButton');

        confirmCheckbox.addEventListener('change', function () {
            submitButton.style.display = confirmCheckbox.checked ? 'block' : 'none';
        }); submitButton.addEventListener('click', async function (event) {
            event.preventDefault();


        });

        async function fetchAuthorDetails() {
            const authorResponse = await fetch(`https://my-app-9tpgj.ondigitalocean.app/authors/getAuthorById/${loggedInAuthorId}`);
            const authorData = await authorResponse.json();
            return authorData;
        }

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
        const sendNotif = form.elements.sendNotif.checked;
        const [authorDetails, imageUrls] = await Promise.all([fetchAuthorDetails(), uploadImages(form.elements.images.files)]);
        console.log('Author Details:', authorDetails);
        console.log('Image URLs:', imageUrls);

        const tagInput = form.elements.tags;
        const imageCreditInput = form.elements.imageCredit;
        const tagsArray = tagInput.value.split(',').map(tag => tag.trim());
        const imageCredit = imageCreditInput.value.trim();
        const formattedImageCredit = imageCredit ? "Image : " + imageCredit : ""; // Add prefix if credit is present


        function populatePayload() {
            const jsonData = {
                heading: '',
                language: form.elements.language.value,
                verified: false,
                author: {
                    id: authorDetails.id,
                    username: authorDetails.username,
                    email: authorDetails.email,
                    verified: authorDetails.verified,
                    totalArticles: authorDetails.totalArticles,
                    joinedOn: authorDetails.joinedOn,
                    imageUrl: authorDetails.imageUrl,
                    isAdmin: false,
                },
                type: '',
                articleType: 'pollType',
                imgUrl: imageUrls,
                date: currentDate,
                tags: formattedImageCredit ? [formattedImageCredit, ...tagsArray] : tagsArray,
                description: '',
                poll: {
                    question: form.elements.question.value,
                    options: pollOptions,
                    optionResults: [0,0,0,0],
                    participants: [{ id: '', index: 0 }],
                },
                sendNotif: sendNotif,
                quiz: {
                    question: '',
                    options: [''],
                    participants: [{ id: '', index: 0 }],
                    answer: 0,
                },
                pictorial: {
                    images: [''],
                    text: [''],
                    onClick: [''],
                    bgImage: '',
                },
            };

            return jsonData;
        }

        const jsonData = populatePayload();

        try {
            const response = await fetch('https://my-app-9tpgj.ondigitalocean.app/articles/addArticle/one', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            });
            if (response.ok) {
                const result = await response.json();
                console.log('Article added successfully. Response:', result);

                successModal.show();
                form.reset();

            } else {
                console.error('Failed to add article:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});



