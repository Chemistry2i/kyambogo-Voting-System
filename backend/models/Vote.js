const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    position: { // Optional: useful if voting for multiple positions in one election
        type: String,
        trim: true,
        required: false
    },
    status: { // Optional: for vote verification or soft delete
        type: String,
        enum: ['valid', 'invalid'],
        default: 'valid'
    }
}, {timestamps: true});

// Prevent double voting per user per election
voteSchema.index({ user: 1, election: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;