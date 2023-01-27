import { Socket } from "socket.io";
import { sqlFilter, concatPubKeys } from "../utils";
import {
  isNewUser,
  isUserName,
  newUser,
  getUser,
  updateUser,
  getUserFollows,
  getUserFollowers,
  getUserFriends,
  searchUsers,
  addFriend,
  removeFriend,
  getUsersFlags,
  isFriend,
} from "../controllers/users.controller";
import {
  createMessages,
  // deleteMessages
} from "../controllers/messages.controller";
import { getUserNFTs } from "../services/nfts/getUserNFTs";

export const newConnectionSocket = (socket: Socket): void => {
  socket.on("newConnection", async (pubkey: string) => {
    console.log("NEW LOGIN:", pubkey);
    const isNew = await isNewUser(pubkey);
    console.log("isnew:", isNew);
    socket.emit("isNewUser", isNew);
    await userDataSocket(socket, pubkey);
  });
};

export const newDisconnectionSocket = (socket: Socket): void => {
  socket.on("newDisconnection", (pubkey: string) => {
    console.log("NEW LOGOUT:", pubkey);
  });
};

export const newUserSocket = async (socket: Socket): Promise<void> => {
  socket.on(
    "newUser",
    async (pubkey: string, username: string, appuser: boolean) => {
      if (username.length >= 3) {
        const regexUser = sqlFilter(username);
        if (regexUser.length >= 3) {
          if (await newUser(pubkey, regexUser, appuser)) {
            socket.emit("newUserCreated", true);
            console.log("New user created!", regexUser, pubkey);
            await userDataSocket(socket, pubkey);
          } else {
            console.log("New user creation failed.");
            socket.emit("newUserCreated", false);
          }
        }
      }
    }
  );
};

export const usernameExistsSocket = (socket: Socket) => {
  socket.on("userName", async (username: string) => {
    const regexUser = sqlFilter(username);
    const userNameAv = await isUserName(regexUser);
    socket.emit("userNameAv", userNameAv);
  });
};

export const userDataSocket = async (
  socket: Socket,
  pubkey: string
): Promise<void> => {
  const userInfo = await getUser(pubkey);
  socket.emit("userInfo", userInfo);
  const userNFTs = await getUserNFTs(pubkey);
  socket.emit("userNFTs", userNFTs);
  const userFriends = await getUserFriends(pubkey);
  socket.emit("userFriends", userFriends);
};

export const searchUsersSocket = (socket: Socket): void => {
  socket.on("searchUsers", async (search: string) => {
    const inputClean: string = sqlFilter(search);
    if (inputClean.length >= 3) {
      socket.emit("searchUsersRes", await searchUsers(inputClean));
    }
  });
};

export const getUserSocket = (socket: Socket): void => {
  socket.on("getUser", async (user: string) => {
    const userInfo = await getUser(user);
    socket.emit("getUserRes", userInfo);
  });
};

export const updateUserSocket = (socket: Socket): void => {
  socket.on(
    "updateUser",
    async (pubkey: string, update: string, value: string) => {
      const pubkey_ = sqlFilter(pubkey);
      const update_ = sqlFilter(update);
      let value_ = sqlFilter(value);
      if (value.slice(0, 2) === "__") {
        value_ = value.replace("__", "");
      }
      if (pubkey_ && update_ && value_) {
        const isUserUpdate = await updateUser(pubkey_, update_, value_);
        socket.emit("updateUserRes", isUserUpdate);
        if (isUserUpdate) {
          const userInfo = await getUser(pubkey);
          socket.emit("userInfo", userInfo);
          console.log("Updated user succesfully!");
        } else {
          socket.emit("updateUserRes", false);
          console.log("useInfo update failed.", pubkey_, update_, value_);
        }
      }
    }
  );
};

export const addFriendSocket = (socket: Socket): void => {
  socket.on("addFriend", async (pubkey: string, pubkey2: string) => {
    if (pubkey.length > 22 && pubkey2.length > 22) {
      socket.emit("addFriendRes", await addFriend(pubkey, pubkey2));
      if (await isFriend(pubkey2, pubkey)) {
        const table = concatPubKeys(pubkey, pubkey2);
        if (await createMessages(table)) {
          socket.emit("addFriendRes", "New chat created successfully");
          console.log("Chat created successfully");
        } else {
          socket.emit(
            "addFriendRes",
            "Chat creation failed. Trying one more time..."
          );
          if (await createMessages(table)) {
            socket.emit("addFriendRes", "New chat created successfully");
            console.log("Chat creation failed!");
            console.log("Chat created successfully");
          }
        }
      }
    }
  });
};

export const removeFriendSocket = (socket: Socket): void => {
  socket.on("deleteFriend", async (pubkey: string, pubkey2: string) => {
    if (pubkey.length > 22 && pubkey2.length > 22) {
      socket.emit("deleteFriendRes", await removeFriend(pubkey, pubkey2));
    }
  });
};

export const getUserFollowsSocket = (socket: Socket) => {
  socket.on("getUserFollows", async (pubkey: string) => {
    socket.emit("getUserFollowsRes", await getUserFollows(pubkey));
  });
};

export const getUserFollowersSocket = (socket: Socket) => {
  socket.on("getUserFollowers", async (pubkey: string) => {
    socket.emit("getUserFollowersRes", await getUserFollowers(pubkey));
  });
};

export const getUserFriendsSocket = (socket: Socket): void => {
  socket.on("getUserFriends", async (pubkey: string) => {
    socket.emit("userFriends", await getUserFriends(pubkey));
  });
};

export const getUsersFlagsSocket = (socket: Socket): void => {
  socket.on("getUsersFlags", async () => {
    const usersFlags = await getUsersFlags();
    socket.emit("getUsersFlagsRes", usersFlags);
  });
};

const userSocket = (socket: Socket): void => {
  newConnectionSocket(socket);
  newDisconnectionSocket(socket);
  newUserSocket(socket);
  usernameExistsSocket(socket);
  searchUsersSocket(socket);
  getUserSocket(socket);
  updateUserSocket(socket);
  addFriendSocket(socket);
  removeFriendSocket(socket);
  getUserFollowsSocket(socket);
  getUserFollowersSocket(socket);
  getUserFriendsSocket(socket);
  getUsersFlagsSocket(socket);
};

export default userSocket;
