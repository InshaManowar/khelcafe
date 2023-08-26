document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addQuizForm');
    const submitBtn = form.querySelector('[type="submit"]');

    submitBtn.addEventListener('click', async function (event) {
        event.preventDefault();

        const question = form.elements.question.value.trim();
        const option1 = form.elements.option1.value.trim();
        const option2 = form.elements.option2.value.trim();
        const option3 = form.elements.option3.value.trim();
        const option4 = form.elements.option4.value.trim();
        const answer = parseInt(form.elements.answer.value); // Convert answer to integer
        
        const loggedInAuthorId = localStorage.getItem('fetchedAuthorId');
        console.log('id', loggedInAuthorId);
        const currentDate = new Date().toISOString().substring(0, 23);

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
                type:'',
                articleType: 'quizType',
                imgUrl: imageUrls,
                date: currentDate,
                tags: formattedImageCredit ? [formattedImageCredit, ...tagsArray] : tagsArray,
                description: '',
                poll: {
                    question: '',
                    options: [''],
                    optionResults: [0],
                    participants: [{ id: '', index: 0 }],
                },
                sendNotif: false,
                quiz: {
                    question: question,
                    options: [
                       option1,
                       option2,
                        option3,
                       option4
                    ],
                    answer: answer,

                    participants: [{ id: '', index: 0 }],
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

                const previewUrl = `article-preview.html?type=${encodeURIComponent(form.elements.sport.textContent)}&id=${insertedId}&date=${currentDate}&authorId=${authorDetails.id}`;
                console.log(insertedId);


            } else {
                console.error('Failed to add article:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
