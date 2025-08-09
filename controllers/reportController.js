const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');

const getReportSummary = async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    const elections = await Election.find();

    // Example: Calculate votes per election and turnout
    const electionStats = await Promise.all(
      elections.map(async (election) => {
        const votes = await Vote.countDocuments({ election: election._id });
        const turnout = totalUsers ? Math.round((votes / totalUsers) * 100) : 0;
        return {
          _id: election._id,
          name: election.name,
          status: election.status,
          votes,
          turnout,
        };
      })
    );

    // Example: Voted vs Not Voted (for Pie chart)
    const voted = await Vote.distinct('user');
    const notVoted = totalUsers - voted.length;
    const voterTurnout = totalUsers ? Math.round((voted.length / totalUsers) * 100) : 0;

    res.json({
      totalElections,
      totalVotes,
      totalUsers,
      voterTurnout,
      voted: voted.length,
      notVoted,
      elections: electionStats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report summary', error: err.message });
  }
};

module.exports = { getReportSummary };