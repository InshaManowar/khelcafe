document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addPollForm');
    const submitBtn = form.querySelector('[type="submit"]'); 
    submitBtn.addEventListener('click', async function (event) {
        event.preventDefault(); 
        const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
        console.log('id', loggedInAuthorId);
        const selectedContentType = localStorage.getItem('selectedContentType'); 
        const currentDate = new Date().toISOString().substring(0, 23); 

        async function fetchAuthorDetails() {
            const authorResponse = await fetch(`https://my-app-9tpgj.ondigitalocean.app/authors/getAuthorById/${loggedInAuthorId}`);
            const authorData = await authorResponse.json();
            return authorData;
        }
        const sendNotif = form.elements.sendNotif.checked;
        const [authorDetails, imageUrls] = await Promise.all([fetchAuthorDetails()]);
        console.log('Author Details:', authorDetails);
        console.log(pollOptions)

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
                imgUrl: '', 
                date: currentDate,
                tags:[1], 
                description: '',
                poll: {
                    question: form.elements.question.value,
                    options: pollOptions,
                    optionResults:[0],
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
                
                const insertedId = result.insertedId; 
           
            } else {
                console.error('Failed to add article:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});



