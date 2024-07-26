const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/temp', express.static(path.join(__dirname, 'temp')));

const upload = multer({ dest: 'uploads/' });

let processedImages = [];

app.post('/upload', upload.array('images', 2), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    processedImages = [];
    for (const file of req.files) {
      const inputBuffer = await sharp(file.path)
        .resize(6480, 1350, { fit: 'fill' })
        .toBuffer();

      for (let i = 0; i < 6; i++) {
        const part = await sharp(inputBuffer)
          .extract({ left: i * 1080, top: 0, width: 1080, height: 1350 })
          .toBuffer();
        
        const tempFilename = `temp_${Date.now()}_${i}.jpg`;
        const tempFilePath = path.join(__dirname, 'temp', tempFilename);
        await sharp(part).toFile(tempFilePath);
        
        console.log(`Saved file: ${tempFilePath}`);

        processedImages.push({
          buffer: part,
          originalImage: file.originalname,
          partIndex: i,
          tempFilename: tempFilename
        });
      }

      fs.unlinkSync(file.path);
    }

    res.json({ message: 'Images processed', count: processedImages.length });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send('Error processing images');
  }
});

app.get('/processed-images', (req, res) => {
  const imageList = processedImages.map((img, index) => ({
    id: index,
    originalImage: img.originalImage,
    partIndex: img.partIndex,
    imageUrl: `/temp/${img.tempFilename}`
  }));
  res.json(imageList);
});

app.post('/generate-pdf', (req, res) => {
  const { selectedImages } = req.body;
  if (!selectedImages || selectedImages.length === 0) {
    return res.status(400).send('No images selected for PDF');
  }

  const pdfPath = path.join(__dirname, 'output.pdf');
  const doc = new PDFDocument({ size: [1080, 1350] });
  doc.pipe(fs.createWriteStream(pdfPath));

  selectedImages.forEach((id, index) => {
    const image = processedImages[id];
    doc.image(image.buffer, 0, 0, { width: 1080, height: 1350 });
    if (index < selectedImages.length - 1) {
      doc.addPage();
    }
  });

  doc.end();

  res.json({ message: 'PDF generated', pdfPath });
});

app.get('/download-pdf', (req, res) => {
  const pdfPath = path.join(__dirname, 'output.pdf');
  res.download(pdfPath, 'processed_images.pdf');
});

app.post('/cleanup', (req, res) => {
  const tempDir = path.join(__dirname, 'temp');
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return res.status(500).send('Error cleaning up files');
    }
    
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) console.error('Error deleting file:', file, err);
      });
    }
    
    processedImages = [];
    res.send('Cleanup completed');
  });
});

app.get('/temp/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'temp', filename);
  res.sendFile(filePath);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));