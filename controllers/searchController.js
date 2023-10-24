const Book = require("../models/bookModel");




exports.index = async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: 'Missing or empty keyword parameter' });
  try {
    const agg = [
      {
        '$search': {
          index: "bookSearch",
          'compound': {
            'should': [
              {
                "autocomplete": {
                  "query": keyword,
                  "path": "title",
                  "tokenOrder": "sequential",
                  "fuzzy": { prefixLength: 0, maxEdits: 1 },
                },
              },
              {
                "autocomplete": {
                  "query": keyword,
                  "path": "author",
                  "tokenOrder": "sequential",
                  "fuzzy": { prefixLength: 0, maxEdits: 1 },
                }
              },

            ],
            'minimumShouldMatch': 1
          }
        }
      },
      { $limit: 2 },
      {
        $sort: {
          'highlight': -1 // Sort suggestions by relevance
        }
      }
    ];
    const results = await Book.aggregate(agg);
    if (results.length > 0) {
      res.status(200).json({
        status: true,
        message: `Found ${results.length} books`,
        results: results
      })
    }
    else {
      res.status(400).json({
        status: false,
        message: "Found 0 results ",
        results: results
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};