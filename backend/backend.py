from fastapi import FastAPI
from pydantic import BaseModel

import cv2  # For image processing
import numpy as np  # For handling image arrays
import base64  # For base64 encoding/decoding

app = FastAPI()

class ImageProcessRequest(BaseModel):
    kernel_size: int
    image: str

@app.post("/process")
async def process_image(data: ImageProcessRequest):
    # decode base64 image
    try:
        image_data = base64.b64decode(data.image.split(",")[1])
        np_array = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image data")
    except (IndexError, ValueError, base64.binascii.Error) as e:
        return {"error": f"Invalid image data: {str(e)}"}

   # Step 1: Convert to grayscale
    gray_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Step 2: Invert grayscale image
    inverted_gray = cv2.bitwise_not(gray_image)

    # Step 3: Apply Gaussian blur on the inverted grayscale
    kernel_size = data.kernel_size
    if kernel_size % 2 == 0:
        kernel_size += 1
    blurred = cv2.GaussianBlur(inverted_gray, (kernel_size, kernel_size), 0)

    # Step 4: Blend using dodge technique
    sketch = cv2.divide(gray_image, 255 - blurred, scale=256)

    processed_img = sketch  # Our final sketch

    # encode back to base64
    _, buffer = cv2.imencode('.png', processed_img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    # return processed image
    return {"processed_image": f"data:image/png;base64,{encoded_img}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

