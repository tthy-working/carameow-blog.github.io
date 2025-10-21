const express = require('express');
const router = express.Router();
const Post =  require('../models/post');
const User =  require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET

/**
 * 
 * Check Login
 */
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
};



/**
 * GET /
 * Admin . Login page
 */

router.get('/admin', async (req, res) => { // Define a route for the root URL
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog built with NodeJs, Express & MongoDb"
  };
  
    res.render('admin/index', { locals, layout: adminLayout });  // render once — after data is loaded
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin . Check login
 */
router.post('/admin', async (req, res) => { // Define a route for the root URL
  try {
    
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if(!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret)
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});



/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin - Create New Post
*/
// Show the form to create a new post
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});



/**
 * POST / 
 * Admin - Create New Post
*/
// Sending data to a server, actually create a new post in the database
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body 
        });

        await Post.create(newPost);
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET / 
 * Admin - Create New Post
*/
// Show the form to edit a post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'Free NodeJs User Management System'
    };

    const data = await Post.findById(req.params.id);
    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});




/**
 * PUT /
 * Admin - Create New Post
*/
// Handling the form submission to update the post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    
    await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updateAt: Date.now()
    }); 

    res.redirect('/edit-post/${req.params.id}');

  } catch (error) {
    console.log(error);
  }
});



/**
 * POST /
 * Admin . Register
 */
router.post('/register', async (req, res) => { // Define a route for the root URL
  try {
    
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User created', user });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }

    } catch (error) {
    console.log(error);
  }
});


/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});



/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
  res.redirect('/');
});


module.exports = router;

