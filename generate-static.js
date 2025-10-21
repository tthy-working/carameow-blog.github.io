const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// --------- CONFIG ----------
const postsPerPage = 3; // 3 posts per page

// Example blog posts (replace with your real posts)
const posts = [
  { _id: 1, title: "First Post", createdAt: new Date("2025-10-01"), body: "Post 1 content" },
  { _id: 2, title: "Second Post", createdAt: new Date("2025-10-02"), body: "Post 2 content" },
  { _id: 3, title: "Third Post", createdAt: new Date("2025-10-03"), body: "Post 3 content" },
  { _id: 4, title: "Fourth Post", createdAt: new Date("2025-10-04"), body: "Post 4 content" },
  { _id: 5, title: "Fifth Post", createdAt: new Date("2025-10-05"), body: "Post 5 content" },
  { _id: 6, title: "Sixth Post", createdAt: new Date("2025-10-06"), body: "Post 6 content" },
];

// --------- SETUP ----------
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Copy public folder
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(distDir, 'public');

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log("Copied public folder!");
}

// --------- GENERATE INDEX PAGES ----------
const totalPages = Math.ceil(posts.length / postsPerPage);

for (let page = 1; page <= totalPages; page++) {
  const pagePosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage);

  ejs.renderFile(
    path.join(__dirname, 'views', 'index.ejs'),
    {
      data: pagePosts,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      totalPages,
      currentPage: page
    },
    {},
    (err, str) => {
      if (err) return console.error(err);
      const filename = path.join(distDir, page === 1 ? 'index.html' : `index${page}.html`);
      fs.writeFileSync(filename, str);
      console.log(`Generated index page ${page}`);
    }
  );
}

// --------- GENERATE INDIVIDUAL POST PAGES ----------
posts.forEach(post => {
  ejs.renderFile(
    path.join(__dirname, 'views', 'post.ejs'),
    { data: post }, // <-- Option 2: match your template
    {},
    (err, str) => {
      if (err) return console.error(err);
      fs.writeFileSync(path.join(distDir, `post${post._id}.html`), str);
      console.log(`Generated post ${post._id}`);
    }
  );
});

// --------- GENERATE ABOUT PAGE ----------
ejs.renderFile(
  path.join(__dirname, 'views', 'about.ejs'),
  {},
  {},
  (err, str) => {
    if (err) return console.error(err);
    fs.writeFileSync(path.join(distDir, 'about.html'), str);
    console.log('Generated about.html');
  }
);
