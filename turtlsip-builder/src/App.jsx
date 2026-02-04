import axios from 'axios';
import { CheckCircle, CloudUpload, Edit3, GripVertical, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/turtlsip_logo_text.svg';
import { useTurtlLogic } from './useTurtlLogic';

function App() {
  const {
    pages, activePage, activePageId, setActivePageId, renamePage, deletePage,
    addPage, updateProfile, updateProfileImage, processFileToBase64,
    addSocial, updateSocialUrl, removeSocial, addBlock, deleteBlock, reorderBlocks,
    setFullPageData
  } = useTurtlLogic();

  const [modal, setModal] = useState({ type: null, open: false, targetId: null });
  const [tempData, setTempData] = useState({ label: '', url: '', content: '', pageName: '' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const closeModal = () => {
    setModal({ type: null, open: false, targetId: null });
    setTempData({ label: '', url: '', content: '', pageName: '' });
  };

  const loadInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pages');
      if (response.data && response.data.length > 0) {
        const savedPage = response.data[0];

        setFullPageData(savedPage);

        showToast("Database Synced");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast("Offline Mode: Server unreachable");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSaveToDatabase = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/save', activePage);
      if (response.data.success) {
        showToast("Changes Published to PostgreSQL!");
      }
    } catch (error) {
      console.error("Save Error:", error);
      showToast("Error: Failed to reach database");
    }
  };


  const handleBlockImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64Data = await processFileToBase64(file);
        addBlock('image', { content: base64Data });
        closeModal();
        showToast("Image Block Added");
      } catch (error) {
        showToast("Failed to process image");
      }
    }
  };

  if (isLoading) return <div className="loading-screen">Connecting to Database...</div>;

  return (
    <div className="builder-app">
      <header className="top">
        <div className="brand"><img src={logo} alt="Logo" className="brand-logo" /></div>
        <div className="top-actions" style={{ display: 'flex', gap: '15px' }}>
          <button className="btn secondary" onClick={() => window.open('/preview', '_blank')}>Preview</button>
          <button className="btn primary publish-btn" onClick={handleSaveToDatabase}>
            <CloudUpload size={18} /> Publish Changes
          </button>
        </div>
      </header>

      <main className="wrap">
        <aside className="panel">
          <div className="card">
            <h3>Your Pages</h3>
            <ul className="page-list">
              {pages.map(p => (
                <li key={p.id} className={`page-item ${p.id === activePageId ? 'active' : ''}`} onClick={() => setActivePageId(p.id)}>
                  <span className="page-name">{p.name}</span>
                  <div className="page-actions">
                    <button className="btn-page-action" onClick={(e) => {
                      e.stopPropagation();
                      setModal({ type: 'rename', open: true, targetId: p.id });
                      setTempData({ ...tempData, pageName: p.name });
                    }}><Edit3 size={14} /></button>
                    <button className="btn-page-action delete" onClick={(e) => {
                      e.stopPropagation();
                      if (deletePage(p.id)) showToast("Page Deleted");
                    }}><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn secondary full-width" onClick={() => setModal({ type: 'page', open: true })}><Plus size={16} /> New Page</button>
          </div>

          <div className="card">
            <h3>Page Settings</h3>
            <div className="form-group">
              <label>Profile Photo</label>
              <div className="img-preview"><img src={activePage.profileImg || `https://ui-avatars.com/api/?name=${activePage.headline || 'User'}`} alt="Profile" /></div>
              <label htmlFor="profile-upload" className="file-label"><CloudUpload size={16} /> Change Photo</label>
              <input type="file" id="profile-upload" hidden onChange={(e) => updateProfileImage(e.target.files[0])} accept="image/*" />
            </div>
            <div className="form-group"><label>Headline</label><input type="text" value={activePage.headline || ''} onChange={(e) => updateProfile('headline', e.target.value)} placeholder="@username" /></div>
            <div className="form-group"><label>Bio</label><input type="text" value={activePage.title || ''} onChange={(e) => updateProfile('title', e.target.value)} placeholder="Short Bio" /></div>

            <hr className="separator" /><label>Social Links</label>
            <div className="social-links-list">
              {activePage.socialLinks?.map((link, idx) => (
                <div key={idx} className="social-input-item">
                  <div className="drag-handle"><GripVertical size={16} /></div>
                  <i className={`fa-brands fa-${link.type}`}></i>
                  <input type="text" value={link.url} onChange={(e) => updateSocialUrl(idx, e.target.value)} placeholder="URL" />
                  <button className="btn-remove-social" onClick={() => removeSocial(idx)}><X size={14} /></button>
                </div>
              ))}
            </div>
            <div className="social-selector-grid">
              {['instagram', 'youtube', 'tiktok', 'whatsapp', 'x-twitter', 'github'].map(s => (
                <button key={s} className="social-choice" onClick={() => addSocial(s)}><i className={`fa-brands fa-${s}`}></i></button>
              ))}
            </div>
            <button className="btn primary full-width" style={{ marginTop: '20px' }} onClick={handleSaveToDatabase}>
              Save All Settings
            </button>
          </div>
        </aside>

        <section className="editor">
          <div className="card">
            <div className="card-header-flex">
              <h3>Content Blocks</h3>
              <button className="btn primary small" onClick={() => setModal({ type: 'chooser', open: true })}>+ Add Block</button>
            </div>
            <div id="block-list-container">
              {activePage.blocks?.map((block, idx) => (
                <div key={block.id} className={`block-item item-${block.type}`} draggable
                  onDragStart={() => setDraggedIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { reorderBlocks(draggedIndex, idx); setDraggedIndex(null); }}>

                  {/* 1. Drag Handle */}
                  <div className="drag-handle"><GripVertical size={18} /></div>

                  {/* 2. NEW: Block Type Icon Visual */}
                  <div className={`block-type-visual icon-${block.type}`}>
                    {block.type === 'button' && <LinkIcon size={20} />}
                    {block.type === 'text' && <Type size={20} />}
                    {block.type === 'image' && <ImageIcon size={20} />}
                  </div>

                  {/* 3. Block Info Text */}
                  <div className="block-info-text">
                    {block.type === 'image' ?
                      <img src={block.content} alt="Thumb" className="block-thumb" /> :
                      (block.label || block.content)
                    }
                  </div>

                  {/* 4. Delete Button */}
                  <button className="btn-delete" onClick={() => deleteBlock(idx)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {toast.show && <div className="toast show"><div className="toast-icon"><CheckCircle size={16} /></div><span>{toast.message}</span></div>}

      {modal.open && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            <input type="file" id="block-image-upload" hidden accept="image/*" onChange={handleBlockImageSelect} />
            {modal.type === 'page' && (
              <><h3>Create Page</h3><input type="text" value={tempData.pageName} onChange={(e) => setTempData({ ...tempData, pageName: e.target.value })} placeholder="Page Name" /><button className="btn primary full-width" style={{ marginTop: '15px' }} onClick={() => { addPage(tempData.pageName); closeModal(); showToast("Page Created"); }}>Create</button></>
            )}
            {modal.type === 'rename' && (
              <><h3>Rename Page</h3><input type="text" value={tempData.pageName} onChange={(e) => setTempData({ ...tempData, pageName: e.target.value })} placeholder="New Name" /><button className="btn primary full-width" style={{ marginTop: '15px' }} onClick={() => { renamePage(modal.targetId, tempData.pageName); closeModal(); showToast("Page Renamed"); }}>Rename</button></>
            )}
            {modal.type === 'chooser' && (
              <><h3>Add New Block</h3><div className="block-choices-grid">
                <div className="modal-choice-item choice-link" onClick={() => setModal({ type: 'button', open: true })}><div className="block-symbol"><LinkIcon size={32} /></div><span>Link</span></div>
                <div className="modal-choice-item choice-text" onClick={() => setModal({ type: 'text', open: true })}><div className="block-symbol"><Type size={32} /></div><span>Text</span></div>
                <label htmlFor="block-image-upload" className="modal-choice-item choice-image"><div className="block-symbol"><ImageIcon size={32} /></div><span>Image</span></label>
              </div></>
            )}
            {modal.type === 'button' && (
              <><h3>Link Block</h3><input type="text" placeholder="Label" value={tempData.label} onChange={(e) => setTempData({ ...tempData, label: e.target.value })} /><input type="url" placeholder="URL" value={tempData.url} onChange={(e) => setTempData({ ...tempData, url: e.target.value })} /><button className="btn primary full-width" style={{ marginTop: '15px' }} onClick={() => { addBlock('button', { label: tempData.label, url: tempData.url }); closeModal(); showToast("Block Added"); }}>Save</button></>
            )}
            {modal.type === 'text' && (
              <><h3>Text Block</h3><textarea placeholder="Content" value={tempData.content} onChange={(e) => setTempData({ ...tempData, content: e.target.value })} rows="4" style={{ width: '100%', borderRadius: '12px', padding: '14px', border: '1.5px solid var(--border)', fontFamily: 'inherit' }} /><button className="btn primary full-width" style={{ marginTop: '15px' }} onClick={() => { addBlock('text', { content: tempData.content }); closeModal(); showToast("Block Added"); }}>Save</button></>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;