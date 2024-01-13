const ChatRoom = require("../models/chatRoomModel");
exports.privateRoom = async({room_id , userID, participant})=>{
    await ChatRoom.collection.findOne(
        { roomID: room_id },
        async (err, data) => {
                  console.log("checkData",data)

          if (err) {
            console.error("Error finding chatroom:", err);
            return;
          }
  
          if (data) {
            let messagesOfParticipant = await data.messages;
            let user_joining_status = await data.participant_online_status;
            for (let i = 0; i < user_joining_status?.length; i++) {
              if (user_joining_status[i]._id.toString() == userID) {
                user_joining_status[i].status = true;
              }
            }
            for (let i = 0; i < messagesOfParticipant.length; i++) {
              if (messagesOfParticipant[i]?.author_id == participant) {
                messagesOfParticipant[i].isRead = true;
              }
            }
            const messageUpdated = {
              messages: messagesOfParticipant,
              participant_online_status: user_joining_status,
            };
            let options = { new: true };
  
            const draft = await ChatRoom.findByIdAndUpdate(
              data._id.toString(),
              messageUpdated,
              options
            );
  
          } else {
            console.log("chat room not found???");
          }
        }
      );
}