const mongoose = require("mongoose");
const { Schema } = mongoose;

// Remove avatarUrl field from schema
const commentSchema = new Schema({
  blogId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  parentOfRepliedCommentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  repliedToCommentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
