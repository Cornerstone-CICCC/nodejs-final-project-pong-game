import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IUser, User } from '../models/user.model';
import { Socket } from 'socket.io';

//get all users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch all users' });
  }
};

// Get user by Id
const getUserById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'user not found!' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to find user.' });
  }
};

//Delete user By Id
const deleteUserById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete user' });
  }
};

//Create new User
const createUser = async (req: Request<{}, {}, IUser>, res: Response) => {
  try {
    const { username, password, message } = req.body;

    const existUser = await User.exists({ username });

    if (existUser) {
      res.status(400).json({ message: 'Username is already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      password: hashedPassword,
      message,
      win: 0,
      lose: 0,
      scores: 0,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create user.' });
  }
};

//Login user
const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send('Username/password missing!');
    return;
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Username/password incorrect' });
      return;
    }

    const isValid: boolean = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Username/password incorrect' });
      return;
    }

    if (!req.session) {
      res.status(500).json({ message: 'Session not initialized' });
      return;
    }

    if (isValid === true) {
      req.session.isLoggedIn = true;

      res.cookie('username', user.username, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true,
      });

      res.cookie('user_id', user.id, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true,
      });
    }

    res.status(200).json({ message: 'User logged in' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login error' });
  }
};

const logoutUser = (req: Request, res: Response) => {
  req.session = null;
  res.clearCookie('username');
  res.clearCookie('user_id');
  res.status(200).json({ message: 'User logged out!' });
};

//Updates user by id
const updateUserById = async (
  req: Request<{ id: string }, {}, Partial<IUser>>,
  res: Response
) => {
  try {
    const { username, password, message } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const updateUser = {
        username: username,
        password: hashedPassword,
        message: message,
      };
      const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
        new: true,
      });
      res.status(200).json(user);
    }
    // const hashedPassword = await bcrypt.hash(password, 12)
    const updateUser = {
      username: username,
      message: message,
    };
    const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
      new: true,
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to  update user' });
  }
};

//Updates user by id
const updateUserStatusById = async (
  req: Request<{ id: string }, {}, Partial<IUser>>,
  res: Response
) => {
  try {
    const { win, lose, scores } = req.body;

    const updateUser = {
      win: win,
      lose: lose,
      scores: scores,
    };
    const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
      new: true,
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update user status' });
  }
};

const checkCookie = (req: Request, res: Response) => {
  if (req.session && req.session.isLoggedIn) {
    res.status(200).json({
      message: req.session.isLoggedIn,
    });
    return;
  }
  res.status(500).json({
    content: 'No cookies, have to login!',
  });
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  updateUserStatusById,
  deleteUserById,
  loginUser,
  logoutUser,
  checkCookie,
};
