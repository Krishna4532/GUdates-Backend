// controllers/chatController.js
import Message from "../models/Message.js";

/**
 * POST /api/chat/send
 * body: { to, text, image }
 * requires auth (req.user)
 */
export const sendMessage = async (req, res) => {
  try {
    const from = req.user._id;
    const { to, text = "", image = "" } = req.body;
    if (!to) return res.status(400).json({ success: false, message: "Missing 'to' field" });

    const msg = await Message.create({
      sender: from,
      receiver: to,
      text,
      image
    });

    // Try emitting via socket.io if available
    try {
      const io = req.app.get("io");
      if (io) {
        // send only to recipient socket(s)
        // we store socketId map in server (see server.js)
        const onlineMap = req.app.get("onlineMap");
        const recipientSocketId = onlineMap?.get(String(to));
        if (recipientSocketId) io.to(recipientSocketId).emit("receiveMessage", msg);
      }
    } catch (err) {
      console.warn("socket emit failed:", err.message);
    }

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/chat/conversation/:id
 * Get conversation between logged-in user and :id
 */
export const getConversation = async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.id;

    const msgs = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages: msgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/chat/list
 * Get recent conversations for logged-in user (simple)
 */
export const getConversationList = async (req, res) => {
  try {
    const me = req.user._id;
    // Aggregate last message per chat partner
    const agg = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { receiver: me }] } },
      { $project: {
          other: { $cond: [{ $eq: ["$sender", me] }, "$receiver", "$sender"] },
          text: 1, createdAt: 1, sender: 1, receiver: 1, read:1
        }
      },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$other",
          lastMessage: { $first: "$$ROOT" },
          lastAt: { $first: "$createdAt" }
        }
      },
      { $sort: { lastAt: -1 } }
    ]);

    res.json({ success: true, list: agg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
