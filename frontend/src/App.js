import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import sixSplitLogo from './SixSplit.png';
import sixSplitLogoheader from './white.png';

function App() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [loading, setLoading] = useState(false);

  // New state for slider
  const trackRef = useRef(null);
  const [mouseDownAt, setMouseDownAt] = useState("0");
  const [prevPercentage, setPrevPercentage] = useState("0");
  const [percentage, setPercentage] = useState("0");

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

  // New functions for slider
  const handleMouseDown = (e) => {
    setMouseDownAt(e.clientX);
  };

  const handleMouseUp = () => {
    setMouseDownAt("0");
    setPrevPercentage(percentage);
  };

  const handleMouseMove = (e) => {
    if (mouseDownAt === "0") return;

    const mouseDelta = parseFloat(mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2;

    const newPercentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(prevPercentage) + newPercentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    setPercentage(nextPercentage);

    if (trackRef.current) {
      trackRef.current.animate({
        transform: `translate(${nextPercentage}%, -50%)`
      }, { duration: 1200, fill: "forwards" });

      for (const image of trackRef.current.getElementsByClassName("image")) {
        image.animate({
          objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
      }
    }
  };

  return (
    <div className="App">
      {loading && <div className="loading-overlay">Processing...</div>}
      <header className="main-header">
        <div className="logo-container">
          <img src={sixSplitLogoheader} alt="SixSplit Logo" href="#" className="header-logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="">HOME</a></li>
            <li><a href="upload-section">SERVICES</a></li>
            <li><a href="https://github.com/ivarungupta/SixSplit/blob/main/README.md" target='_blank'>ABOUT</a></li>
            <li><a href="mailto:ivarungupta7@gmail.com">CONTACT</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="hero">
          <img src={sixSplitLogo} alt="SixSplit Logo" className="hero-logo" />
          <h2>Crop AMAZING Carousels in just ONE click ↗</h2>
        </section>

        {/* New slider section */}
        <section className="slider-section">
          <div 
            id="image-track" 
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <img className="image" src="img/1.png" draggable="false" alt="Slider image 1" />
            <img className="image" src="img/2.png" draggable="false" alt="Slider image 2" />
            <img className="image" src="img/5.png" draggable="false" alt="Slider image 3" />
            <img className="image" src="img/4.png" draggable="false" alt="Slider image 4" />
            <img className="image" src="img/3.png" draggable="false" alt="Slider image 5" />
            <img className="image" src="img/6.png" draggable="false" alt="Slider image 6" />
            <img className="image" src="img/7.png" draggable="false" alt="Slider image 7" />
            <img className="image" src="img/8.png" draggable="false" alt="Slider image 8" />
            <img className="image" src="img/9.png" draggable="false" alt="Slider image 9" />
            <img className="image" src="img/10.png" draggable="false" alt="Slider image 10" />
          </div>
        </section>

        <section className="slide-text-section">
          <h2>← SLIDE TO CHECK OUT! →</h2>
        </section>

        <section className="upload-section" title='upload-section'>
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