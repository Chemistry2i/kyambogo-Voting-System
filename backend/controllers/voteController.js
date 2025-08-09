const asyncHandler = require("express-async-handler");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

// @desc    Cast a vote
// @route   POST /api/votes
// @access  User
const castVote = asyncHandler(async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId) {
      console.log({ message: "Missing electionId or candidateId" });
      return res.status(400).json({ message: "electionId and candidateId are required" });
    }

    // Check if election exists and is ongoing
    const election = await Election.findById(electionId);
    if (!election || election.status !== "ongoing") {
      console.log({ message: "Election not found or not ongoing" });
      return res.status(400).json({ message: "Election not found or not ongoing" });
    }

    // Check if candidate exists and belongs to the election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      console.log({ message: "Candidate not found in this election" });
      return res.status(400).json({ message: "Candidate not found in this election" });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ user: req.user._id, election: electionId });
    if (existingVote) {
      console.log({ message: "User has already voted in this election" });
      return res.status(400).json({ message: "You have already voted in this election" });
    }

    // Create vote
    const vote = await Vote.create({
      user: req.user._id,
      election: electionId,
      candidate: candidateId
    });

    // Optionally increment candidate's vote count
    candidate.votes = (candidate.votes || 0) + 1;
    await candidate.save();

    console.log({ message: "Vote cast successfully" });
    res.status(201).json({ message: "Vote cast successfully", vote });
  } catch (error) {
    console.log({ message: "Error casting vote", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get own voting history
// @route   GET /api/votes/me
// @access  User
const getMyVotes = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user._id })
      .populate("election", "title")
      .populate("candidate", "name position");
    console.log({ message: "Fetched user's voting history" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching voting history", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for an election
// @route   GET /api/votes/election/:electionId
// @access  Admin
const getVotesByElection = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ election: req.params.electionId })
      .populate("user", "name email")
      .populate("candidate", "name position");
    console.log({ message: "Fetched votes for election" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching votes by election", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for a candidate
// @route   GET /api/votes/candidate/:candidateId
// @access  Admin
const getVotesByCandidate = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ candidate: req.params.candidateId })
      .populate("user", "name email")
      .populate("election", "title");
    console.log({ message: "Fetched votes for candidate" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching votes by candidate", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes (system-wide)
// @route   GET /api/votes
// @access  Admin
const getAllVotes = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("user", "name email")
      .populate("election", "title")
      .populate("candidate", "name position");
    console.log({ message: "Fetched all votes" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching all votes", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  castVote,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
};