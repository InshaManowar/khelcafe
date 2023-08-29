document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addStoryForm');
    const submitButton = document.getElementById('getUrlsButton');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    submitButton.addEventListener('click', async function (event) {
        try {
            event.preventDefault();
            const currentDate = new Date().toISOString().substring(0, 23);
            const language = form.elements.language.value.trim(); // Use .value instead of .textContent
            const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
            console.log('id', loggedInAuthorId);
            
            // Check for required fields like language
            if (!language) {
                alert('Please fill in all required fields.');
                return;
            }

            // Fetch author details
            async function fetchAuthorDetails() {
                const authorResponse = await fetch(`https://my-app-9tpgj.ondigitalocean.app/authors/getAuthorById/${loggedInAuthorId}`);
                const authorData = await authorResponse.json();
                return authorData;
            }

            const [authorDetails] = await Promise.all([fetchAuthorDetails()]);
            console.log('Author Details:', authorDetails);

            // Assuming you have defined the uploadImages function correctly
            const imageUrls = await uploadImages(imageFiles);
            
            // Assuming you have defined captions and links arrays elsewhere
            const captions = ['caption1', 'caption2']; // Replace with your captions
            const links = ['link1', 'link2']; // Replace with your links

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
                articleType: 'storyType',
                imgUrl: '',
                date: currentDate,
                tags: '',
                description: '',
                poll: {
                    question: '',
                    options:'',
                    optionResults: [0],
                    participants: [{ id: '', index: 0 }],
                },
                quiz: {
                    question: '',
                    options: [''],
                    participants: [{ id: '', index: 0 }],
                    answer: 0,
                },
                pictorial: {
                    images: imageUrls,
                    text: captions,  // Assuming captions array is defined
                    onClick: links,
                    bgImage: '',
                },
            };

            return jsonData;
        }

   
        const jsonData = populatePayload();

        // Make API request
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
        } else {
            console.error('Failed to add article:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
});
