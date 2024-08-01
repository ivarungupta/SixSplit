# SixSplit

SixSplit is a web application that allows users to upload images, split them into parts, and combine the parts into a single PDF. The application provides a simple interface for managing images and generating PDFs.

![Alt text](SixSplit,UIUX.png)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [License](#license)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/ivarungupta7/SixSplit.git
   cd sixsplit
   ```
2. Install server dependencies:
   ```sh
   npm install
   ```
3. Navigate to the client directory and install client dependencies:
   ```sh
   cd client
   npm install
   ```
4. Start the server:
   ```sh
   npm start
   ```
5. Start the client:
   ```sh
   npm start
   ```
The server will run on http://localhost:5000 and the client on http://localhost:3000.

## Usage

1. Upload images using the file input on the main page.
2. The uploaded images will be processed and displayed in a grid.
3. Select the parts of the images you want to include in the PDF.
4. Click on the "Generate PDF" button to create a PDF from the selected image parts.
5. Download the generated PDF or individual image parts.

## Features

- **Image Upload**: Upload multiple images at once.
- **Image Splitting**: Automatically split images into equal parts.
- **PDF Generation**: Combine selected image parts into a single PDF.
- **Download Options**: Download individual image parts or the generated PDF.

## API Endpoints

- **POST /upload**: Upload images and split them into parts.
- **GET /processed-images**: Retrieve the list of processed images.
- **POST /generate-pdf**: Generate a PDF from selected image parts.
- **GET /download-pdf**: Download the generated PDF.
- **POST /cleanup**: Cleanup temporary files and processed images.

## Technologies Used

- **Backend**: Node.js, Express, Multer, Sharp, PDFKit
- **Frontend**: React, Axios, CSS
- **Others**: Cors, fs, path

## Contact 

Feel free to contact me at ivarungupta7@gmail.com for any doubts or permissions.

## Thank You!!



