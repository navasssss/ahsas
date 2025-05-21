// Wait for DOM to fully load
let cropper;
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide icons

    lucide.createIcons();

    // Elements cache
    const elements = {
        // Steps and content areas
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        introOverlay: document.getElementById('introOverlay'),

        // Form inputs
        userName: document.getElementById('userName'),
        photoInput: document.getElementById('photoInput'),
        dropZone: document.getElementById('dropZone'),
        uploadContent: document.getElementById('uploadContent'),
        uploadProcessing: document.getElementById('uploadProcessing'),

        // Buttons
        createFrameBtn: document.getElementById('createFrameBtn'),
        createAnotherBtn: document.getElementById('createAnotherBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        shareToFacebook: document.getElementById('shareToFacebook'),
        shareToInstagram: document.getElementById('shareToInstagram'),
        shareToWhatsapp: document.getElementById('shareToWhatsapp'),

        // Preview elements
        previewPhoto: document.getElementById('previewPhoto'),
        userPhotoDemo: document.getElementById('userPhotoDemo'),
        blah: document.getElementById('blah'),
        previewName: document.getElementById('previewName'),
        previewFrame: document.getElementById('previewFrame'),
        finalFrame: document.getElementById('finalFrame'),
        finalPhoto: document.getElementById('finalPhoto')
    };

    const frameImg = document.getElementById('framee');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const frameCanvas = document.createElement('canvas');
    const frameCtx = frameCanvas.getContext('2d');

    // let transparentBox = null;
    // const cachedBox = localStorage.getItem('transparentBox');

    // if (cachedBox) {
    //     transparentBox = JSON.parse(cachedBox);
    //     console.log('Loaded from cache:', transparentBox);
    // } else {
    //     frameImg.onload = function () {
    //         frameCanvas.width = frameImg.width;
    //         frameCanvas.height = frameImg.height;
    //         frameCtx.drawImage(frameImg, 0, 0);

    //         canvas.width = frameImg.width;
    //         canvas.height = frameImg.height;
    //         ctx.drawImage(frameImg, 0, 0);

    //         const imageData = frameCtx.getImageData(0, 0, frameImg.width, frameImg.height);
    //         const data = imageData.data;
    //         let minX = frameImg.width, minY = frameImg.height, maxX = 0, maxY = 0;

    //         for (let y = 0; y < frameImg.height; y++) {
    //             for (let x = 0; x < frameImg.width; x++) {
    //                 const i = (y * frameImg.width + x) * 4;
    //                 const alpha = data[i + 3];
    //                 if (alpha < 10) {
    //                     if (x < minX) minX = x;
    //                     if (y < minY) minY = y;
    //                     if (x > maxX) maxX = x;
    //                     if (y > maxY) maxY = y;
    //                 }
    //             }
    //         }

    //         transparentBox = {
    //             x: minX,
    //             y: minY,
    //             width: maxX - minX,
    //             height: maxY - minY
    //         };

    //         localStorage.setItem('transparentBox', JSON.stringify(transparentBox));
    //         console.log('Calculated and cached:', transparentBox);
    //     };

    transparentBox = {
        //     x: 1221, y: 1673, width: 557, height: 746
        height
            :
            746,
        width
            :
            653,
        x
            :
            1173,
        y: 1673,
    };
    // if (frameImg.complete) {
    //     frameImg.onload();
    // }
    // }


    // State
    let state = {
        name: '',
        photo: null,
        finalImage: null
    };

    // Hide intro overlay after 3 seconds
    setTimeout(() => {
        if (elements.introOverlay) {
            elements.introOverlay.style.opacity = '0';
            setTimeout(() => {
                elements.introOverlay.style.display = 'none';
            }, 3000);
        }
    }, 1000);

    // Event Listeners

    // Name input
    elements.userName.addEventListener('input', function (e) {
        state.name = e.target.value;
        elements.previewName.textContent = state.name || 'Your Name';
        validateForm();
    });

    // Photo upload via input
    elements.photoInput.addEventListener('change', function (e) {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop functionality
    elements.dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('border-blue-500', 'bg-blue-50', 'scale-102');
    });

    elements.dropZone.addEventListener('dragleave', function () {
        this.classList.remove('border-blue-500', 'bg-blue-50', 'scale-102');
    });

    elements.dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('border-blue-500', 'bg-blue-50', 'scale-102');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    elements.dropZone.addEventListener('click', function () {
        elements.photoInput.click();
    });

    // Create Frame Button
    elements.createFrameBtn.addEventListener('click', function () {
        showStep(2);

        // Clone the preview frame content to the final frame
        // const previewClone = elements.previewFrame.cloneNode(true);
        // elements.finalFrame.innerHTML = '';
        // elements.finalFrame.appendChild(previewClone.querySelector('div'));

        // Generate the image
        generateImage();
    });

    // Create Another Button
    elements.createAnotherBtn.addEventListener('click', function () {
        showStep(1);
        state.finalImage = null;
    });

    // Download Button
    elements.downloadBtn.addEventListener('click', function () {
        if (!state.finalImage) {
            showToast('Error', 'Image not ready yet. Please try again in a moment.', 'error');
            return;
        }

        downloadImage();
    });

    // Share Buttons
    elements.shareToFacebook.addEventListener('click', function () {
        shareToSocial('Facebook');
    });

    elements.shareToInstagram.addEventListener('click', function () {
        shareToSocial('Instagram');
    });

    elements.shareToWhatsapp.addEventListener('click', function () {
        shareToSocial('Whatsapp');
    });

    // Functions




    function handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Invalid file type', 'Please upload an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large', 'Please upload an image smaller than 5MB', 'error');
            return;
        }

        elements.uploadContent.classList.add('hidden');
        elements.uploadProcessing.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target?.result) {
                // Show modal with cropper
                setTimeout(() => {
                    document.getElementById('uploadProcessing').classList.add('hidden');
                    document.getElementById('cropperImage').src = e.target.result;
                    document.getElementById('cropperModal').classList.remove('hidden');

                    if (cropper) cropper.destroy();
                    cropper = new Cropper(document.getElementById('cropperImage'), {
                        viewMode: 1,
                        responsive: true,
                        autoCrop: true,
                        ready() {
                            // Set default crop box size to 558x747px centered in the image
                            const containerData = cropper.getContainerData();
                            const canvasData = cropper.getCanvasData();

                            const cropBoxWidth = 653.99;
                            const cropBoxHeight = 747;

                            const left = canvasData.left + (canvasData.width - cropBoxWidth) / 2;
                            const top = canvasData.top + (canvasData.height - cropBoxHeight) / 2;

                            cropper.setCropBoxData({
                                left: left,
                                top: top,
                                width: cropBoxWidth,
                                height: cropBoxHeight
                            });
                        }
                    });

                }, 500);
            }
        };
        reader.readAsDataURL(file);
    }

    function validateForm() {
        const isValid = state.name.trim() !== '' && state.photo !== null;
        elements.createFrameBtn.disabled = !isValid;
    }

    function showStep(step) {
        if (step === 1) {
            elements.step1.classList.remove('hidden');
            elements.step2.classList.add('hidden');
        } else {
            elements.step1.classList.add('hidden');
            elements.step2.classList.remove('hidden');
        }
    }

    async function generateImage() {
        try {
            if (!state.photo) {
                console.error("No photo found in state.");
                showToast('Error', 'No photo available to generate image', 'error');
                return;
            }

            const croppedImage = new Image();
            croppedImage.onload = function () {
                canvas.width = frameImg.width;
                canvas.height = frameImg.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Center and clip if circle
                const centerX = transparentBox.x + transparentBox.width / 2;
                const centerY = transparentBox.y + transparentBox.height / 2;
                const radius = Math.min(transparentBox.width, transparentBox.height) / 2;
                const isCircle = Math.abs(transparentBox.width - transparentBox.height) < 10;

                if (isCircle) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.clip();
                }

                // Draw cropped image inside the transparent box
                ctx.drawImage(croppedImage, transparentBox.x, transparentBox.y, transparentBox.width, transparentBox.height);

                if (isCircle) ctx.restore();

                ctx.drawImage(frameImg, 0, 0);

                // ✅ Add name text
                ctx.font = 'bold 100px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(state.name, canvas.width / 2, 2500);



                // Save final image
                state.finalImage = canvas.toDataURL('image/png');
                elements.finalPhoto.src = state.finalImage;
                document.getElementById('downloadBtn').style.display = 'block';
                showToast('Success', 'Frame generated successfully', 'success');
            };

            // ✅ Set source of image to trigger onload
            croppedImage.src = state.photo;

        } catch (error) {
            console.error("Error generating image:", error);
            showToast('Error', 'Failed to generate image', 'error');
        }
    }




    function downloadImage() {
        // Show downloading animation
        elements.downloadBtn.innerHTML = 'Downloading...';
        elements.downloadBtn.disabled = true;

        setTimeout(() => {
            // Create a temporary link element
            const downloadLink = document.createElement("a");
            downloadLink.href = state.finalImage;
            downloadLink.download = `${state.name.replace(/\s+/g, "-")}-anti-terrorism-pledge.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Reset button
            elements.downloadBtn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i> Download Image';
            // lucide.createIcons();
            elements.downloadBtn.disabled = false;

            showToast('Success!', 'Your pledge frame has been downloaded.', 'success');
        }, 800);
    }

    function shareToSocial(platform) {
        if (!state.finalImage) {
            showToast('Error', 'Image not ready yet. Please try again in a moment.', 'error');
            return;
        }

        // Add active style to button
        const button = document.getElementById(`shareTo${platform}`);
        if (button) {
            button.classList.add('bg-blue-100', 'scale-95');
            setTimeout(() => button.classList.remove('bg-blue-100', 'scale-95'), 1000);
        }

        // In a real app, you would integrate with actual share APIs
        // For this example, we'll just show a toast message
        switch (platform.toLowerCase()) {
            case 'facebook':
                // Implementation would use Facebook's Share Dialog
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
                break;
            case 'whatsapp':
                // Implementation would use WhatsApp's Web API
                const message = `*Sindoor* - _Anti Terrorism Day Social Media Campaign_

മതേതരത്ത്വത്തിന്റെ മധുരച്ചാറിനെ വര്‍ഗീയതയുടെ കൈപ്പുനീര് കൊണ്ട് ഹീനമാക്കുന്ന ഭീകരവാദത്തിനെതിരെയുള്ള *അഹ്‌സാസിന്റെ* ഈ സോഷ്യല്‍ മീഡിയ ക്യാമ്പയിനില്‍ നമുക്കും പങ്കാളികളാകാം, 



*ഈ ക്യാമ്പയിനില്‍ പങ്കെടുക്കാന്‍ താഴെ കാണുന്ന ലിങ്കില്‍ ക്ലിക്ക് ചെയ്യുക👇*
*Click To Participate*: ${window.location.href}`;

                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);

                // Implementation would use Twitter's Web Intent
                break;
            case 'instagram':
                // Instagram doesn't have a web share API
                showToast('Instagram', 'Instagram sharing typically requires a mobile app integration', 'info');
                break;
        }
    }

    document.getElementById('applyCrop').addEventListener('click', function () {
        const canvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400
        });

        const croppedDataURL = canvas.toDataURL('image/png');

        // Update preview
        state.photo = croppedDataURL;
        elements.userPhotoDemo.src = state.photo;
        elements.userPhotoDemo.classList.remove('hidden');
        elements.blah.classList.remove('hidden');

        // Close modal
        cropper.destroy();
        document.getElementById('cropperModal').classList.add('hidden');

        validateForm();
    });
    document.getElementById('cancelCrop').addEventListener('click', () => {
        cropper.destroy();
        document.getElementById('cropperModal').classList.add('hidden');
    });

    document.getElementById('closeCropperModal').addEventListener('click', () => {
        cropper.destroy();
        document.getElementById('cropperModal').classList.add('hidden');
    });

    function showToast(title, message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-start gap-3 animate-fade-in max-w-xs z-50 ${type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' :
            type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' :
                'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
            }`;

        // Icon based on type
        const icon = type === 'error' ? 'alert-triangle' :
            type === 'success' ? 'check-circle' : 'info';

        toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0"></i>
      <div>
        <h4 class="font-medium">${title}</h4>
        <p class="text-sm opacity-90">${message}</p>
      </div>
      <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

        document.body.appendChild(toast);
        // lucide.createIcons();

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // Initialize by disabling the create button
    validateForm();



});








