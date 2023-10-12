const Book = require("../models/bookModel");




exports.index = async (req, res) => {
    const keyword = req.query.keyword;
    console.log("keyword", keyword)

    try {
      const results = await Book.find()
        .or([
          { title: { $regex: keyword, $options: 'i' } }, // Case-insensitive search
          { author: { $regex: keyword, $options: 'i' } }
        ])
        .exec();
  
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };