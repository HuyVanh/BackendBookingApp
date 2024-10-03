const SearchHistory = require('../models/SearchHistory');

exports.saveSearch = async (req, res) => {
  try {
    const { search_query } = req.body;

    const search = new SearchHistory({
      user: req.user.user_id,
      search_query,
    });
    await search.save();

    res.status(201).json(search);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserSearchHistory = async (req, res) => {
  try {
    const searches = await SearchHistory.find({ user: req.user.user_id })
      .sort({ search_date: -1 });
    res.status(200).json(searches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  try {
    const search = await SearchHistory.findById(req.params.id);
    if (!search) return res.status(404).json({ message: 'Search history not found.' });

    // Kiểm tra quyền truy cập
    if (search.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await search.remove();
    res.status(200).json({ message: 'Search history deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
