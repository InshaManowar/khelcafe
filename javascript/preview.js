document.addEventListener('DOMContentLoaded', async function () {
    const queryParams = new URLSearchParams(window.location.search);
    const type = queryParams.get('type');
    const decodedType = decodeURIComponent(type);
    const resultId = queryParams.get('id'); // Using the result.id here
    const date = queryParams.get('date');
    const authorId = queryParams.get('authorId');
    console.log(decodedType);
    const apiUrl = `https://my-app-9tpgj.ondigitalocean.app/articles/getArticles/${decodedType}/${resultId}/${date}/${authorId}`;
    try {
        const response = await fetch(apiUrl);
        const articleDataArray = await response.json();
    
        if (articleDataArray.length > 0) {
            const firstArticle = articleDataArray[0]; // Get the first article
            
            const articleContent = document.querySelector('.article-content');
            articleContent.innerHTML = `
                <h1>${firstArticle.heading}</h1>
                <p>${firstArticle.description}</p>
                <!-- Add more HTML structure for displaying the article content -->
            `;
        } else {
            console.log('No articles found.');
            // Optionally, display a message to the user that no articles were found.
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        // Optionally, display an error message to the user on the preview page
    }
    
});
