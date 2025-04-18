export type roomCardType = {
  _id: string;
  room_name: string;
  participants: number;
};

export type currentUserType = {
  userId: string;
  username: string;
};

export type roomType = {
  _id: string;
  room_name: string;
  __v: number;
};

export type userType = {
  _id: string;
  username: string;
  password: string;
  message: string;
  win: number;
  lose: number;
  scores: number;
  __v: number;
};

export type userRoomType = {
  _id: string;
  room_id: roomType;
  creator_user_id: userType;
  opponent_user_id: userType | null;
};

export type HistoryType = {
  _id: string;
  user_id: string;
  opponent_user_id: string;
  own_score: number;
  opponent_score: number;
  date: string;
  opponent_username: string;
};
