import { useCallback, useEffect, useState } from 'react';

export const TurtlsipLogic = () => {
  const [pages, setPages] = useState(() => {
    const saved = localStorage.getItem('turtlsip_pages');
    return saved ? JSON.parse(saved) : [
      { id: 'page-home', name: 'Home Page', title: 'Welcome', headline: 'User', profileImg: '', blocks: [], socialLinks: [] }
    ];
  });

  const [activePageId, setActivePageId] = useState(localStorage.getItem('turtlsip_active_id') || pages[0].id);

  useEffect(() => {
    localStorage.setItem('turtlsip_pages', JSON.stringify(pages));
    localStorage.setItem('turtlsip_active_id', activePageId);
  }, [pages, activePageId]);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const updateActivePage = useCallback((newData) => {
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, ...newData } : p));
  }, [activePageId]);

  const setFullPageData = (data) => {
    updateActivePage({
      headline: data.headline || '',
      title: data.title || '',
      profileImg: data.profileImg || '',
      socialLinks: data.socialLinks || [],
      blocks: data.blocks || []
    });
  };

  const processFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject("No file selected");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const updateProfileImage = async (file) => {
    try {
      const base64Data = await processFileToBase64(file);
      updateActivePage({ profileImg: base64Data });
    } catch (error) {
      console.error("Image processing failed", error);
    }
  };

  const renamePage = (id, newName) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const deletePage = (id) => {
    if (pages.length <= 1) return false;
    const filtered = pages.filter(p => p.id !== id);
    setPages(filtered);
    if (activePageId === id) setActivePageId(filtered[0].id);
    return true;
  };

  const addPage = (name) => {
    const newPage = { id: 'pg-'+Date.now(), name, title: name, headline: '', profileImg: '', blocks: [], socialLinks: [] };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
  };

  const reorderBlocks = (sourceIndex, targetIndex) => {
    const newBlocks = [...(activePage.blocks || [])];
    const [movedBlock] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(targetIndex, 0, movedBlock);
    updateActivePage({ blocks: newBlocks });
  };

  return {
    pages, activePage, activePageId, setActivePageId, renamePage, deletePage, addPage,
    updateProfile: (field, value) => updateActivePage({ [field]: value }),
    setFullPageData, 
    processFileToBase64, 
    updateProfileImage,
    addSocial: (type) => {
      if (activePage.socialLinks?.some(l => l.type === type)) return;
      
      const newSocial = { id: 'soc-' + Date.now(), type: type, url: '' };
      updateActivePage({ socialLinks: [...(activePage.socialLinks || []), newSocial] });
    },
    updateSocialUrl: (index, url) => {
      const links = [...(activePage.socialLinks || [])];
      links[index] = { ...links[index], url: url };
      updateActivePage({ socialLinks: links });
    },
    removeSocial: (index) => {
      const links = [...(activePage.socialLinks || [])]; links.splice(index, 1);
      updateActivePage({ socialLinks: links });
    },
    addBlock: (type, data) => updateActivePage({ 
      blocks: [...(activePage.blocks || []), { id: 'blk-'+Date.now(), type: type, ...data }] 
    }),
    deleteBlock: (index) => {
      const blocks = [...(activePage.blocks || [])]; blocks.splice(index, 1);
      updateActivePage({ blocks: blocks });
    },
    reorderBlocks
  };
};