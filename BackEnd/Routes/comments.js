const express = require("express");
const router = express.Router();
const User = require("../Schema/User");
const Comment = require("../Schema/Comment");
router.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    // Fetch and populate user data
    const allComments = await Comment.find({ blogId })
      .populate("userId", "_id name pfp")
      .populate({
        path: "repliedToCommentId",
        populate: { path: "userId", select: "_id name" },
      })

      .sort({ timestamp: 1 })
      .lean();
    const commentMap = {};
    const topLevelComments = [];
    allComments.forEach((comment) => {
      const formatted = {
        comId: comment._id,
        userId: comment.userId?._id,
        fullName: comment.userId?.name,
        avatarUrl: comment.userId?.pfp,
        text: comment.repliedToCommentId
          ? comment.text.replace(
              /<p>/,
              `<p>@${comment.repliedToCommentId.userId.name} `
            )
          : comment.text,
        parentOfRepliedCommentId: comment.parentOfRepliedCommentId,
        repliedToCommentId:
          comment.repliedToCommentId?._id || comment.repliedToCommentId,
        timestamp: comment.timestamp,
        userProfile: "#",
        replies: [],
      };

      commentMap[comment._id.toString()] = formatted;
    });

    Object.values(commentMap).forEach((comment) => {
      if (comment.repliedToCommentId) {
        const parent =
          commentMap[
            comment.parentOfRepliedCommentId || comment.repliedToCommentId
          ];
        if (parent) {
          parent.replies.push(comment); // ✅ Correct (formatted)
        }
      } else {
        topLevelComments.push(comment); // ✅ Correct (formatted)
      }
    });
    res.json(topLevelComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});
// ➕ Submit a new comment

router.post("/", async (req, res) => {
  const { blogId, userId, text } = req.body;
  try {
    const newComment = new Comment({
      blogId,
      userId,
      text,
      parentOfRepliedCommentId: null,
      repliedToCommentId: null,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ↪️ Reply to a comment
router.post("/reply", async (req, res) => {
  const { blogId, userId, text, parentOfRepliedCommentId, repliedToCommentId } =
    req.body;
  try {
    const reply = new Comment({
      blogId,
      userId,
      text,
      parentOfRepliedCommentId,
      repliedToCommentId,
    });

    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ Edit a comment
router.put("/:_id", async (req, res) => {
  console.log(req.params._id, req.body.text);
  try {
    const updated = await Comment.findOneAndUpdate(
      { _id: req.params._id },
      { text: req.body.text },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete a comment and its direct replies
router.delete("/:_id", async (req, res) => {
  console.log(req.params._id);
  try {
    const deleted = await Comment.findOneAndDelete({ _id: req.params._id });
    if (!deleted) return res.status(404).json({ error: "Comment not found" });

    await Comment.deleteMany({
      $or: [
        { parentOfRepliedCommentId: req.params._id },
        { repliedToCommentId: req.params._id },
      ],
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
