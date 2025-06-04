import api from "axiosInstance";
import { toast } from "react-toastify";
export async function fetchComments(blogId) {
  try {
    const { data } = await api.get("/comments/" + blogId);

    return data;
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch comment");
    return [];
  }
}
export async function submitComment({ blogId, userId, text }) {
  try {
    const { data } = await api.post("/comments", {
      blogId,
      userId,
      text,
    });
    toast.success("Comment Submitted Successfully");
  } catch (err) {
    toast.error("Failed to submit comment");
    console.error("Submit comment error:", err);
    return null;
  }
}
export async function submitReply({
  blogId,
  userId,
  text,
  parentOfRepliedCommentId,
  repliedToCommentId,
}) {
  try {
    const { data } = await api.post("/comments/reply", {
      blogId,
      userId,
      text,
      parentOfRepliedCommentId,
      repliedToCommentId,
    });
    toast.success("Reply Submitted Successfully");
  } catch (err) {
    toast.error("Failed to submit reply");
    console.error("Submit comment error:", err);
    return null;
  }
}
export async function editComment(_id, newText) {
  try {
    const { data } = await api.put(`/comments/${_id}`, {
      text: newText,
    });
    toast.success("Comment Edited Successfully");
  } catch (err) {
    toast.error("Failed to edit comment");
    console.error("Failed to edit comment:", err);
    return null;
  }
}
export async function deleteComment(_id) {
  try {
    const { data } = await api.delete(`/comments/${_id}`);
    toast.success("Comment Deleted Successfully");
  } catch (err) {
    toast.error("Failed to delete comment");
    console.error("Failed to delete comment:", err);
    return null;
  }
}
