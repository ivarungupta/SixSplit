import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    const cleanup = async () => {
      try {
        await axios.post('http://localhost:5000/cleanup');
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select files');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchProcessedImages();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error processing images');
    } finally {
      setProcessing(false);
    }
  };

  const fetchProcessedImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/processed-images');
      setProcessedImages(response.data);
      setSelectedImages(response.data.map(img => img.id));
    } catch (error) {
      console.error('Error fetching processed images:', error);
    }
  };

  const handleImageSelection = (id) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGeneratePDF = async () => {
    try {
      await axios.post('http://localhost:5000/generate-pdf', { selectedImages });
      setPdfReady(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const handleDownload = () => {
    window.location.href = 'http://localhost:5000/download-pdf';
  };

  const handleImageDownload = (imageUrl, originalImage, partIndex) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${imageUrl}`;
    link.download = `img-part-${originalImage}-${partIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SixSplit</h1>
        <p>Upload, Split, and Combine Images into PDF</p>
      </header>
      <main>
        <section className="upload-section">
          <form onSubmit={handleSubmit}>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="file-input" 
                onChange={handleFileChange} 
                accept="image/*" 
                multiple 
              />
              <label htmlFor="file-input" className="file-input-label">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Choose Files'}
              </label>
            </div>
            <button 
              type="submit" 
              disabled={processing || files.length === 0} 
              className="primary-button"
            >
              {processing ? 'Processing...' : 'Upload and Process'}
            </button>
          </form>
        </section>
        
        {processedImages.length > 0 && (
          <section className="processed-images-section">
            <h2>Processed Images</h2>
            <div className="image-grid">
              {processedImages.map((img) => (
                <div key={img.id} className="image-item">
                  <input
                    type="checkbox"
                    id={`img-${img.id}`}
                    checked={selectedImages.includes(img.id)}
                    onChange={() => handleImageSelection(img.id)}
                  />
                  <label htmlFor={`img-${img.id}`}>
                    <img 
                      src={`http://localhost:5000${img.imageUrl}`} 
                      alt={`${img.originalImage} - Part ${img.partIndex + 1}`} 
                    />
                    <span>{`${img.originalImage} - Part ${img.partIndex + 1}`}</span>
                  </label>
                  <button 
                    className="download-button"
                    onClick={() => handleImageDownload(img.imageUrl, img.originalImage, img.partIndex)}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleGeneratePDF} className="primary-button">
              Generate PDF
            </button>
          </section>
        )}
        
        {pdfReady && (
          <section className="download-section">
            <button onClick={handleDownload} className="primary-button">
              Download PDF
            </button>
          </section>
        )}
      </main>
      <footer>
        <p>&copy; 2024 SixSplit. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;