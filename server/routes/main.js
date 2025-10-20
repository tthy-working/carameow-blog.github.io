const express = require('express');
const router = express.Router();
const Post =  require('../models/post');


/**
 * GET /
 * HOME
 */


// Routes
router.get('', async (req, res) => { // Define a route for the root URL 
  try {
    const locals = {
      title: "Carameow Blog",
      description: "Simple blog built with NodeJs, Express & MongoDb"
  };

    const perPage = 3; // number of posts per page
    const count = await Post.countDocuments(); // total number of posts
    const totalPages = Math.ceil(count/perPage); // total number of pages
    
    let page = parseInt(req.query.page) || 1; // current page number from query parameter, default to 1
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const data = await Post.find() // fetch posts from MongoDB
                           .sort({ createdAt: -1 }) // sort by createdAt in descending order
                           .skip((perPage * page) - perPage) // skip posts for previous pages
                           .limit(perPage)
                           .exec();

    

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    res.render('index', { 
      locals, 
      data,
      currentPage: page,
      totalPages,
      nextPage,
      prevPage,
      currentRoute: '/'
     });  // render once — after data is loaded
 
  } catch (error) {
    console.log(error);
  }
});

/*
router.get('/', async (req, res) => { // Define a route for the root URL
  const locals = {
    title: "NodeJs Blog",
    description: "Simple blog built with NodeJs, Express & MongoDb"
  };
  
  try {
    const data = await Post.find(); // fetch posts from MongoDB
    res.render('index', { locals, data });  // render once — after data is loaded
  } catch (error) {
    console.log(error);
  }

});
*/

/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
      currentRoute: `/post/${slug}`
    }

    res.render('post', { 
      locals,
      data,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
  }

});



/**
 * POST /
 * Post - searchTerm
*/
router.get('/search', async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    let searchTerm = req.query.search;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
      ]
    });
    
    res.render('search', {
      data,
      locals,
      currentRoute: '/'
    });
  } catch (error) {
    console.log(error);
  }
});




/**
 * GET /
 * About
*/
router.get('/about', (req, res) => { 
  res.render('about', {
    currentRoute: '/about'
  }); 
});

/**
 * GET /
 * Contact
*/
router.get('/contact', (req, res) => { 
  res.render('contact', {
    currentRoute: '/contact'
  }); 
});

/**
 * POST /
 * Contact
*/
router.post('/contact', (req, res) => { 
  const { name, email, message } = req.body;
  console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
  res.render('contact', {
    currentRoute: '/contact',
    successMessage: 'Your message has been sent!'
  });
});


/*
function insertPost() {
  Post.insertMany([
    {
      title: "A Love Letter from Seoul",
      body: "Body"
    },
    {
      title: "Vending Machines, Ramen, and Midnight Strolls",
      body: "Body"
    },
    {
      title: "Boba Stars in My Pocket",
      body: "Body"
    },
    {
      title: "Sweet Egg Tarts, Soft Goodbyes",
      body: "Body"
    },
    {
      title: "Snowflakes in My Suitcase",
      body: "Body"
    }
  ])
}
*/
// insertPost();



module.exports = router; // Export the router to be used in other files
