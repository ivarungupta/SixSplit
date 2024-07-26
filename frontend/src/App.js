import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import sixSplitLogo from './SixSplit.png'; // Make sure to replace with your actual image path
import sixSplitLogoheader from './white.png';

function App() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      setShowDeleteButton(true);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error processing images');
    } finally {
      setProcessing(false);
      setLoading(false);
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
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/generate-pdf', { selectedImages });
      setPdfReady(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = 'http://localhost:5000/download-pdf';
  };

  const handleImageDownload = async (imageUrl, partIndex) => {
    try {
      const response = await fetch(`http://localhost:5000${imageUrl}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `image-part-${partIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error downloading image');
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/cleanup');
      setProcessedImages([]);
      setSelectedImages([]);
      setPdfReady(false);
      setShowDeleteButton(false);
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Error cleaning up files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {loading && <div className="loading-overlay">Processing...</div>}
      <header className="main-header">
        <div className="logo-container">
          <img src={sixSplitLogoheader} alt="SixSplit Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="hero">
          <img src={sixSplitLogo} alt="SixSplit Logo" className="hero-logo" />
          <h2>Crop AMAZING Carousels in just ONE click ↗</h2>
        </section>
        <section className="upload-section">
          <form onSubmit={handleSubmit}>
            <div className="button-group">
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
            </div>
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
                    <div className="image-info">
                      <span>{`${img.originalImage} - Part ${img.partIndex + 1}`}</span>
                      <button 
                        className="download-button"
                        onClick={() => handleImageDownload(img.imageUrl, img.partIndex)}
                      >
                        Download
                      </button>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="button-group">
              <button onClick={handleGeneratePDF} className="primary-button">
                Generate PDF
              </button>
              {showDeleteButton && (
                <button onClick={handleCleanup} className="delete-button">
                  Delete All Images
                </button>
              )}
            </div>
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
        <p>&copy; 2024 SixSplit | All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;