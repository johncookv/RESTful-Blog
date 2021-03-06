var express          = require("express"),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    methodOverride   = require("method-override"),
    app              = express(),
    expressSanitizer = require("express-sanitizer");

// App config
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// Mongoose model config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTful routes

app.get("/", function(req, res) {
  res.redirect("/blogs");
});

// Index Route

app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

// New Route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

// Create Route
app.post("/blogs", function(req, res) {
  // sanitize input
  req.body.blog.body = req.sanitize(req.body.blog.body);
  
  // create blog
  Blog.create(req.body.blog, function(err, blogPost) {
    if (err) {
      console.log(err);
      res.render("/blogs/new");
    } else {
      console.log("NEW BLOG POST: ", blogPost);
      res.redirect("/blogs");
    }
  });
});

// Show route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if (err) {
        console.log(err);
        res.render("/blogs");
      } else {
        res.render("show", {blog: foundBlog});
      }
    });
});

// Edit route
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
      if (err) {
        console.log(err);
        res.render("/blogs");
      } else {
        res.render("edit", {blog: foundBlog});
      }
    });
});

// Update route
app.put("/blogs/:id", function(req, res) {
  // sanitize input
  req.body.blog.body = req.sanitize(req.body.blog.body);
  
  // update blog post
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, foundBlog) {
    if (err) {
      console.log(err);
      res.render("/blogs");
    } else {
      console.log("UPDATED BLOG: ", foundBlog);
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

app.delete("/blogs/:id", function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err, deletedBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(process.env.PORT, process.env.IP, function() {
  console.log("Server has started...");
})