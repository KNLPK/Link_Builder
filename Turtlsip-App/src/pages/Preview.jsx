import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import '../styles/Preview.css';

function Preview() {
  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    const originalTitle = document.title; 
    document.title = "Preview TurtlSip"; 

    return () => {
      document.title = originalTitle; 
    };
  }, []);

  const loadPreviewData = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/pages');
      if (res.data && res.data.length > 0) setActivePage(res.data[0]);
    } catch (e) { 
      console.error("Database connection failed for preview", e); 
    }
  };

  useEffect(() => { loadPreviewData(); }, []);

  if (!activePage) return <div className="loading">Connecting to TurtlSip...</div>;

  return (
    <div className="preview-container">
      <div className="preview-content">
        <header className="preview-header">
          <div className="preview-avatar">
            <img src={activePage.profileImg || `https://ui-avatars.com/api/?name=${activePage.headline || 'User'}`} alt="Avatar" />
          </div>
          <h1 className="preview-headline">@{activePage.headline || 'username'}</h1>
          <p className="preview-bio">{activePage.title || 'Welcome to my page'}</p>
        </header>

        <div className="preview-socials">
          {activePage.socialLinks?.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="social-icon-link">
              <i className={`fa-brands fa-${l.type}`}></i>
            </a>
          ))}
        </div>

        <div className="preview-blocks">
          {activePage.blocks?.map((b) => (
            <div key={b.id} className={`preview-block-item type-${b.type}`}>
              {b.type === 'button' && (
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="preview-btn">
                  <span className="btn-text">{b.label}</span>
                  <ChevronRight size={18} className="btn-chevron" />
                </a>
              )}
              {b.type === 'text' && <p className="preview-text-block">{b.content}</p>}
              {b.type === 'image' && <img src={b.content} alt="Content" className="preview-image-block" />}
            </div>
          ))}
        </div>

        <footer className="preview-footer">
          <img src="/src/assets/turtlsip_logo_text.svg" alt="TurtlSip" className="footer-logo" />
          <p>Created with TurtlSip</p>
        </footer>
      </div>
    </div>
  );
}

export default Preview;