    document.addEventListener('DOMContentLoaded', function() {
      const imagesInput = document.getElementById('images');
      const uploadProgress = document.getElementById('uploadProgress');
    
      imagesInput.addEventListener('change', handleFileUpload);
    
      async function handleFileUpload(event) {
        const files = event.target.files;
        const storageRef = firebase.storage().ref();
        const imageUrls = []; // Array to store the uploaded image URLs
    
        for (const file of files) {
          const uploadTask = storageRef.child(`images/${file.name}`).put(file);
    
          uploadTask.on('state_changed',
            (snapshot) => {
              // Update progress bar
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              uploadProgress.value = progress;
            },
            (error) => {
              console.error('Error uploading image:', error);
            },
            async () => {
              // Get the download URL for the uploaded image
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              imageUrls.push(downloadURL); // Add the URL to the array
              
              // If all images are uploaded, you can use the imageUrls array as needed
              if (imageUrls.length === files.length) {
                console.log('All images uploaded:', imageUrls);
              }
            }
          );
        }
      }
    });
