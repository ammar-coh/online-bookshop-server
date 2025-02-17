const Book = require("../models/bookModel");
//var mongoose = require('mongoose');
const Auth = require("../auth");
const Category = require("../models/categoryModel");
// Handle index actions

// exports.index = async (req, res) => {

//   const list = await Book.find();
//   res.status(200).json(list);
// };
exports.index = async (req, res) => {
  try {
    const { filter } = req.body; 
    // console.log('first', req.body) // Assume categoryName comes from the request body
    const { page = 1, limit = 10 } = req.query;
    // Initialize a query object
    const query = {};
// const category={}
console.log('book request api', req.body)
console.log("No category is asked")
    if (filter.categoryName) {
      console.log("yes category is asked")
      // Resolve the full category path
      const category = await Category.findOne({ name: filter.categoryName });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    
      // Safely create a regex to match the category path
      query.categoryPaths = { $regex: new RegExp(`^${category.path}`, 'i') }; // 'i' for case-insensitivity
    }

    if (filter.price) {
      if (filter.price.min !== undefined && filter.price.max !== undefined) {
        query.price = {};
        if (filter.price.min !== undefined) query.price.$gte = filter.price.min; // Greater than or equal to min price
        if (filter.price.max !== undefined) query.price.$lte = filter.price.max; // Less than or equal to max price
      } else {
        return res.status(400).json({ message: "Invalid price filter. Provide at least min or max value." });
      }
    }
    const skip = (page - 1) * limit;
    // Fetch the books based on the constructed query
    const books = await Book.find(query).skip(skip).limit(limit);;
    const totalBooks = await Book.count(query);

    res.status(200).json({
      data: books,
      pagination: {
        total: totalBooks,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalBooks /limit),
      },
    });
  } catch (error) {
    console.error("An error occurred while fetching books:", error.message || error);
    res.status(500).json({ message: "An error occurred while fetching books", error });
  }
};




exports.new = async function (req, res) {
  try {
    let { price, rating, stock, title, author, description, categories, category } = req.body;
    console.log("category search", req.body)
    var book = new Book();
    var currentList = await Book.find();

    // Ensure categories is always an array
    if (!categories && category) {
      categories = Array.isArray(category) ? category : [category];
    } else if (typeof categories === 'string') {
      categories = [categories];
    } else if (!Array.isArray(categories)) {
      categories = [];
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({ message: "At least one category is required" });
    }

    // Add debug logging
    console.log("Categories to search:", categories);

    // Resolve category paths for provided category names
    const categoryDocs = await Category.find({ name: { $in: categories } });
    
    // Add debug logging
    console.log("Found category docs:", categoryDocs);

    if (categoryDocs.length !== categories.length) {
      return res.status(404).json({
        message: "Some categories were not found",
        missingCategories: categories.filter(
          (cat) => !categoryDocs.find((doc) => doc.name === cat)
        )
      });
    }

    // Extract category paths from the resolved categories
    const categoryPaths = categoryDocs.map((category) => category.path);
    
    // Add debug logging
    console.log("Category paths:", categoryPaths);

    Object.assign(book, {
      price: price,
      title: title,
      author: author,
      rating: rating,
      stock: stock,
      description: description,
      category: categories,
      categoryPaths: categoryPaths,
    });

    // Add image handling
    if (req.file) {
      const imageUrl = req.imageUrl; // Get the image URL from req object
      book.image = imageUrl;
    }

    // Add debug logging
    console.log("Book object before save:", book);

    await book.save();
    currentList.push(book);
    res.status(200).json({
      status: true,
      message: "New book has been added!",
      data: book,
    });
  } catch (error) {
    // More detailed error logging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "An error occurred while adding the book.",
      details: error.message 
    });
  }
};

exports.updating = async function (req, res) {
  try {
    const id = req.params.bookId;
    const { title, author, price, rating, stock, description, category } = req.body;
    const updates = {
      title,
      author,
      price,
      rating,
      stock,
      description,
      category,
    };

    if (req.file) {
      const imageUrl = req.imageUrl; // Get the image URL from req object
      updates.image = imageUrl; // Set the image URL in the updates object
    }

    const options = { new: true };
    const book = await Book.findByIdAndUpdate(id, updates, options);
    if (book) {
      res.status(200).json({
        status: true,
        book: book
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Book doesn't exist"
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the book." });
  }
};

// Handle create new product
// exports.new = async function (req, res) {
//   let { price, rating, stock, title, author, description, category } = req.body;
//   var book = new Book();
//   var currentList = await Book.find();
//   Object.assign(book, {
//     price: price,
//     title: title,
//     author: author,
//     rating: rating,
//     stock: stock,
//     description: description,
//     category: category
//   });
//   if (req.file) {
//     // Handle the in-memory file differently
//     const buffer = req.file.buffer;
//     // Assuming you want to save the image as a Base64 encoded string
//     const base64Image = buffer.toString('base64');
//     updates.image = `data:${req.file.mimetype};base64,${base64Image}`;
//   }
//   book.save();
//   currentList.push(book);
//   res.status(200).json({
//     status:true,
//     message: "new book has been added!",
//     data: book,
//   });
// };

// // Handle update product info
// exports.updating = async function (req, res) {
//   try {
//     const id = req.params.bookId;
//     const { title, author, price, rating, stock, description, category } = req.body;
//     const updates = {
//       title,
//       author,
//       price,
//       rating,
//       stock,
//       description,
//       category,
//     };
//     if (req.file) {
//       // Handle the in-memory file differently
//       const buffer = req.file.buffer;
//       // Assuming you want to save the image as a Base64 encoded string
//       const base64Image = buffer.toString('base64');
//       updates.image = `data:${req.file.mimetype};base64,${base64Image}`;
//     }
//     const options = { new: true };
//     const book = await Book.findByIdAndUpdate(id, updates, options);
//     if (book) {
//       res.status(200).json({
//         status: true,
//         book: book
//       });
//     } else {
//       res.status(400).json({
//         status: false,
//         message: "Book doesn't exist"
//       })
//     }
//   } catch (error) {
//     res.status(500).json({ error: `Couldn't fint what the book in database or something went wrong` });

//   }
// };
// Handle delete product info
exports.delete = async function (req, res) {
  const id = await req.params.bookId;
  try {
    const options = { new: true };
    await Book.findByIdAndDelete(id, options);
    const checkBookDeleted = await Book.findById({
      _id: id,
    });
    var updatedBookList = await Book.find();

    if (!checkBookDeleted) {
      res.status(200).json({
        status: true,
        bookId: id
      })
    }
    else {
      res.status(400).json({
        status: false,
        bookId: id
      })
    }
  }
  catch (error) {
    res.status(500).json({ error: 'An error occurred while removing the book.' });

  }
};
