const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
// Close Button
closeBtn.addEventListener('click', () => {
window.electronAPI.close();
});

// Minimize Button
minimizeBtn.addEventListener('click', () => {
    window.electronAPI.minimize();
});
// Upload Button
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// Со сликите дали да се покажуваат или пак полароидите
const originalImg = document.getElementById('original-img');
const sketchImg = document.getElementById('sketch-img');
const originalPlaceholder = document.getElementById('original-placeholder');
const sketchPlaceholder = document.getElementById('sketch-placeholder');
const pravoagolniceto = document.getElementsByClassName('pravoagolniceto');

const kernelSlider = document.getElementById('kernel-slider');
const kernelValue = document.getElementById('kernel-value');

let currentBase64Image = null;

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            console.log('Base64 Image:', base64Image); // log the base64 image

            currentBase64Image = base64Image;

            originalImg.src = base64Image;
            originalPlaceholder.style.display = 'none';
            pravoagolniceto[0].style.display = 'none'; 
            
            originalImg.style.display = 'block';
            sketchImg.style.display = 'none';
            sketchPlaceholder.style.display = 'block';
            pravoagolniceto[1].style.display = 'block'; // show the second rectangle

            console.log('Sending to backend with kernel size:', kernelSlider.value);
            
            const defaultKernelSize = kernelSlider.value; // get current slider value

            sendToBackend(base64Image, defaultKernelSize);
        };
        reader.readAsDataURL(file);
    }
});

// Save Sketch Button
const saveSketchBtn = document.getElementById('save-sketch-btn');

saveSketchBtn.addEventListener('click', () => {
  const sketchDataUrl = sketchImg.src;  // current sketch image (base64)
  window.electronAPI.saveSketch(sketchDataUrl);
});

// Бојата да се полни на слајдерот
function updateSliderFill() {
  const min = Number(kernelSlider.min);
  const max = Number(kernelSlider.max);
  const value = Number(kernelSlider.value);

  const percentage = ((value - min) / (max - min)) * 100;

  kernelSlider.style.background = `linear-gradient(to right, #f345d3 0%, #f345d3 ${percentage}%, #5100ff ${percentage}%, #5100ff 100%)`;
}


let debounceTimeout = null;
kernelSlider.addEventListener('input', () => {
  updateSliderFill();
  kernelValue.textContent = kernelSlider.value;  

    // if (currentBase64Image) {
    // clearTimeout(debounceTimeout);  // cancel previous scheduled request
    // }
    // debounce the request to avoid sending too many requests in a short time

    if (currentBase64Image) {
      console.log('Sending to backend with kernel size:', kernelSlider.value);
      sendToBackend(currentBase64Image, kernelSlider.value);
    }
    // debounceTimeout = setTimeout(() => {
      
    // }, 0);  // колку мс delay
  
//     if (currentBase64Image) {
//     console.log('Sending to backend with kernel size:', kernelSlider.value);
//     sendToBackend(currentBase64Image, kernelSlider.value);
//   }
});

updateSliderFill();


async function sendToBackend(base64Image, kernelSize) {
  try {
    const response = await fetch('http://localhost:8000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kernel_size: kernelSize,
        image: base64Image,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend Error:', errorData);
      return;
    }

    const result = await response.json();
    console.log('Processed image received:', result);

    // update sketch image with backend result
    
    document.getElementById('sketch-img').src = result.processed_image;
    sketchImg.style.display = 'block';
    sketchPlaceholder.style.display = 'none';
    
    pravoagolniceto[1].style.display = 'none';

  } catch (error) {
    console.error('Request failed:', error);
  }
}




