document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addPollForm'); // Get the form element
    const submitBtn = form.querySelector('[type="submit"]'); // Get the submit button inside the form

    submitBtn.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
        console.log('id', loggedInAuthorId);
        const selectedContentType = localStorage.getItem('selectedContentType'); // Get the selected content type
        const currentDate = new Date().toISOString().substring(0, 23); // Format: 'YYYY-MM-DDTHH:mm:ss.sss'

        async function fetchAuthorDetails() {
            const authorResponse = await fetch(`https://my-app-9tpgj.ondigitalocean.app/authors/getAuthorById/${loggedInAuthorId}`);
            const authorData = await authorResponse.json();
            return authorData;
        }
        const sendNotif = form.elements.sendNotif.checked;

       
        // Fetch author details and Firebase image URLs
        const [authorDetails, imageUrls] = await Promise.all([fetchAuthorDetails()]);

        console.log('Author Details:', authorDetails);
        console.log(pollOptions)

        // Populate the payload for article submission
        function populatePayload() {
            const jsonData = {
                heading: '',
                language: '',
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
                type:'',
                articleType: 'pollType',
                imgUrl: '', // Populate this with image URLs later
                date: currentDate,
                tags: '', // Split tags into an array
                description: '',
                poll: {
                    question: form.elements.question.value,
                    options: pollOptions,
                    optionResults:[0],
                    participants: [{ id: '', index: '' }],
                },
                sendNotif: sendNotif,
                quiz: {
                    question: '',
                    options: [''],
                    participants: [{ id: '', index: '' }],
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
                
                // const previewUrl = `article-preview.html?type=${encodeURIComponent(form.elements.sport.textContent)}&id=${insertedId}&date=${currentDate}&authorId=${authorDetails.id}`;
                // console.log(insertedId);
                
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
