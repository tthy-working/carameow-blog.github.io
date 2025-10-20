// build.js

// 1️⃣ Load environment variables
require('dotenv').config();

// 2️⃣ Import packages
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const fse = require('fs-extra');
const mongoose = require('mongoose');
const Post = require('./server/models/post'); // adjust if your post model path is different

// 3️⃣ Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI);

mongoose.connection.on('connected', () => console.log('MongoDB connected!'));
mongoose.connection.on('error', (err) => console.log('MongoDB connection error:', err));

// 4️⃣ Define output folder
const DIST_DIR = path.join(__dirname, 'dist');
fse.removeSync(DIST_DIR);
fse.ensureDirSync(DIST_DIR);

// 5️⃣ Helper function to render EJS to HTML
async function renderPage(templateFile, outputFile, data = {}) {
  const templatePath = path.join(__dirname, 'views', templateFile);
  const html = await ejs.renderFile(templatePath, data, { async: true });
  fs.writeFileSync(path.join(DIST_DIR, outputFile), html);
  console.log(`Generated ${outputFile}`);
}

// 6️⃣ Copy public assets
fse.copySync(path.join(__dirname, 'public'), path.join(DIST_DIR, 'public'));
console.log('Copied public assets');

// 7️⃣ Build function
async function build() {
  try {
    // Fetch posts
    const posts = await Post.find().sort({ createdAt: -1 }).lean();

    // Pagination (for index page)
    const perPage = 3;
    const totalPages = Math.ceil(posts.length / perPage);
    const page = 1;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Generate post pages
    for (const post of posts) {
      await renderPage('post.ejs', `post-${post._id}.html`, {
        locals: { title: post.title, description: 'Carameow Blog', currentRoute: `/post/${post._id}` },
        data: post
      });
    }

    // Generate index page (first page)
    await renderPage('index.ejs', 'index.html', {
      locals: { title: 'Carameow Blog', description: 'Simple blog', currentRoute: '/' },
      data: posts.slice(0, perPage),
      currentPage: page,
      totalPages,
      nextPage,
      prevPage
    });

    // Generate About page
    await renderPage('about.ejs', 'about.html', {
      locals: { title: 'About', description: 'About Carameow', currentRoute: '/about' }
    });

    // Generate Contact page
    await renderPage('contact.ejs', 'contact.html', {
      locals: { title: 'Contact', description: 'Contact Carameow', currentRoute: '/contact' }
    });

    console.log('✅ Build complete! Static site is in /dist');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// 8️⃣ Run build
build();
