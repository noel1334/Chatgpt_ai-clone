import Chat from "../models/Chat.js";
import UserChats from "../models/UserChats.js";

export const createNewChat = async (req, res) => {
  try {
    const userId = req.auth.userId; // Get userId from req.auth
    const { text } = req.body;
    console.log(text);

    const newChat = new Chat({
      userId: userId, // Use the userId from req.auth
      history: [
        {
          role: "user",
          parts: [
            {
              text,
            },
          ],
        },
      ],
    });

    const savedChat = await newChat.save();
    //res.status(201).json(savedChat); //Response only after

    // check if user chat exist

    let userChats = await UserChats.findOne({ userId: userId }); // Use the userId from req.auth
    if (!userChats) {
      const newUserChats = new UserChats({
        userId: userId, // Use the userId from req.auth
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
      userChats = newUserChats; // Assign the newly created userChats to userChats variable
      //res.status(201).json(savedChat); // Send response here if no userChats
    } else {
      // if exist then push add the chat into array
      await UserChats.updateOne(
        { userId: userId }, // Use the userId from req.auth
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }
    // After either creating or updating UserChats, fetch the updated document
    userChats = await UserChats.findOne({ userId: userId });

    res.status(201).json(savedChat);
  } catch (error) {
    console.error("Error creating new chat:", error);
    res
      .status(500)
      .json({ message: "Failed to create new chat", error: error.message }); // Error
  }
};

export const userChats = async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.findOne({ userId: userId });

    // Safely access the chats property only if userChats exists and is not null
    if (userChats) {
      res.status(200).send(userChats.chats);
    } else {
      // If userChats is null or doesn't exist, return an empty array
      res.status(200).send([]);
    }
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Failed to Fetch userChat", error: error.message });
  }
};

export const chat = async (req, res) => {
  const userId = req.auth.userId;
  const chatId = req.params.id;
  try {
    const chats = await Chat.findOne({ _id: chatId, userId: userId });
    if (!chats) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).send(chats);
  } catch (error) {
    console.error("Error in chat controller:", error);
    res
      .status(500)
      .json({ message: "Failed to Fetch Chat", error: error.message });
  }
};

export const updateChat = async (req, res) => {
  const userId = req.auth.userId;
  const chatId = req.params.id;
  const { question, answer, img } = req.body;

  const newItems = [];

  if (question) {
    const userMessage = { role: "user", parts: [{ text: question }] };
    if (img) {
      userMessage.img = img;
    }
    newItems.push(userMessage);
  }

  newItems.push({ role: "model", parts: [{ text: answer }] });

  try {
    const updatedChat = await Chat.updateOne(
      { _id: chatId, userId: userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );

    if (updatedChat.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Chat not found or not authorized" });
    }

    res.status(200).send(updatedChat);
  } catch (error) {
    console.error("Error in chat controller:", error);
    res
      .status(500)
      .json({ message: "Failed to add Chat conversation", error: error.message });
  }
};