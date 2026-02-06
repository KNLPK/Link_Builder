const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const isNotEmpty = (str) => str && str.trim().length > 0;

app.post('/api/save', async (req, res) => {
  const { id, name, headline, title, profileImg, socialLinks, blocks } = req.body;

  if (!isNotEmpty(headline)) {
    return res.status(400).json({ 
      success: false, 
      message: "Validation Error: Headline is mandatory and cannot be empty." 
    });
  }

  if (!blocks || !Array.isArray(blocks)) {
    return res.status(400).json({ 
      success: false, 
      message: "Validation Error: Content blocks must be a valid list." 
    });
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type === 'button') {
      if (!isNotEmpty(block.label) || !isNotEmpty(block.url)) {
        return res.status(400).json({ 
          success: false, 
          message: `Block #${index + 1} (Link): Label and URL are required.` 
        });
      }
    } else if (block.type === 'text') {
      if (!isNotEmpty(block.content)) {
        return res.status(400).json({ 
          success: false, 
          message: `Block #${index + 1} (Text): Content cannot be empty.` 
        });
      }
    } else if (block.type === 'image') {
      if (!isNotEmpty(block.content)) {
        return res.status(400).json({ 
          success: false, 
          message: `Block #${index + 1} (Image): Image data is missing.` 
        });
      }
    }
  }

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

    console.log(`Data halaman "${name}" berhasil disinkronkan ke database.`);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database Error: " + error.message 
    });
  }
});

app.get('/api/pages', async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.json(pages);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend TurtlSip berjalan di: http://localhost:${PORT}`);
});