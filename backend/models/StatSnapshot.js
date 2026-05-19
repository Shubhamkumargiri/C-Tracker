import mongoose from "mongoose";

const platformStatsSchema = new mongoose.Schema(
  {
    github: {
      username: String,
      repositories: Number,
      pullRequests: Number,
      commits: Number,
      contributions: Number,
      followers: Number,
      following: Number,
      profileScore: Number,
    },
    leetcode: {
      username: String,
      totalSolved: Number,
      easySolved: Number,
      mediumSolved: Number,
      hardSolved: Number,
      contestRating: Number,
      acceptanceRate: Number,
      streak: Number,
      totalSubmissions: Number,
      profileScore: Number,
      submissionDaysLast30: Number,
    },
    linkedin: {
      connections: Number,
      profileViewers: Number,
      postImpressions: Number,
      profileScore: Number,
    },
  },
  { _id: false }
);

const statSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    stats: {
      type: platformStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

statSnapshotSchema.index({ user: 1, dateKey: 1 }, { unique: true });

const StatSnapshot = mongoose.model("StatSnapshot", statSnapshotSchema);

export default StatSnapshot;
