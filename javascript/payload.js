document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addArticleForm');
    const submitBtn = form.querySelector('[type="submit"]');

    submitBtn.addEventListener('click', async function (event) {
        event.preventDefault();

        const heading = form.elements.heading.value.trim();
        const language = form.elements.language.textContent.trim();
        const sportType = form.elements.sport.textContent.trim();
        const tags = form.elements.tags.value.trim();
        const description = form.elements.description.value.trim();

        if (!heading || !language || !sportType || !tags || !description) {
            // Show an error message to the user indicating missing fields
            alert('Please fill in all required fields.');
            return; // Exit the function if any required field is empty
        }
        const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
        console.log('id', loggedInAuthorId);
        const selectedContentType = localStorage.getItem('selectedContentType'); // Get the selected content type
        const currentDate = new Date().toISOString().substring(0, 23); // Format: 'YYYY-MM-DDTHH:mm:ss.sss'

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

        // Fetch author details and Firebase image URLs
        const [authorDetails, imageUrls] = await Promise.all([fetchAuthorDetails(), uploadImages(form.elements.images.files)]);

        console.log('Author Details:', authorDetails);
        console.log('Image URLs:', imageUrls);

        // Populate the payload for article submission
        function populatePayload() {
            const jsonData = {
                heading: form.elements.heading.value,
                language: form.elements.language.textContent,
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
                type: form.elements.sport.textContent,
                articleType: null,
                imgUrl: imageUrls,
                date: currentDate,
                tags: form.elements.tags.value.split(','), 
                description: form.elements.description.value,
                poll: {
                    question: '',
                    options: [''],
                    optionResults:[0],
                    participants: [{ id: '', index: 0 }],
                },
                sendNotif: false,
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

        // Populate and submit the payload
        const jsonData = populatePayload();

        // Make the POST request to the API
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
                
                const insertedId = result.insertedId; // Get the insertedId from the response
                
                const previewUrl = `article-preview.html?type=${encodeURIComponent(form.elements.sport.textContent)}&id=${insertedId}&date=${currentDate}&authorId=${authorDetails.id}`;
                console.log(insertedId);
                
                // Redirect to the preview page
                // window.location.href = previewUrl;
            } else {
                console.error('Failed to add article:', response.status, response.statusText);
                // Optionally, show an error message to the user
            }
        } catch (error) {
            console.error('Error:', error);
            // Optionally, show an error message to the user
        }
    });
});
