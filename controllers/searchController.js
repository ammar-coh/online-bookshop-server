const Book = require("../models/bookModel");




exports.index = async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: 'Missing or empty keyword parameter' });
  try {
    const results =  await Book.find(
    // .or([
    //   { title: { $regex: keyword, $options: 'i' } },
    //   { author: { $regex: keyword, $options: 'i' } }
    // ])
    // .exec();
      { $text: { $search: keyword } },
    )
      .collation({ locale: 'en', strength: 2 })
    .exec();
    if (results.length>0 ){
res.status(200).json({
  status:true,
  message:`Found ${results.length} books`,
  results: results
})
    }
    else{
      res.status(400).json({
        status:false,
        message:"Found 0 results ",
        results:results
      })
    }
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};