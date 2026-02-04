const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/save', async (req, res) => {
  const { id, name, headline, title, profileImg, socialLinks, blocks } = req.body;

  try {
    const result = await prisma.page.upsert({
      where: {
        id: id || 'temp-id-if-not-exists', 
      },
      update: {
        name,
        headline,
        title,
        profileImg,
        socialLinks,
        blocks,
      },
      create: {
        id,
        name,
        headline,
        title,
        profileImg,
        socialLinks,
        blocks,
      },
    });

    console.log(`Data halaman "${name}" berhasil disinkronkan.`);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/pages', async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend TurtlSip berjalan di: http://localhost:${PORT}`);
});