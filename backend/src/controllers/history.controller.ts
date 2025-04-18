import { Request, Response } from 'express';
import { History, IHistory } from '../models/history.model';
import { error } from 'console';
import { User } from '../models/user.model';

// Get all historys
const getAllHistorys = async (req: Request, res: Response) => {
  try {
    const historys = await History.find();
    res.status(200).json(historys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'unable' });
  }
};

// Get history by id
const getHistoryByUserId = async (req: Request, res: Response) => {
  try {
    const histories = await History.find({
      $or: [{ user_id: req.params.id }, { opponent_user_id: req.params.id }],
    })
      .sort({ date: 1 })
      .lean();

    if (!histories || histories.length === 0) {
      res.status(404).json({ message: 'No history found for this user' });
      return;
    }

    const historiesWithUsernames = await Promise.all(
      histories.map(async history => {
        const opponentUser = await User.findById(
          history.opponent_user_id
        ).select('username');
        return {
          ...history,
          opponent_username: opponentUser ? opponentUser.username : 'Unknown',
        };
      })
    );

    res.status(200).json(historiesWithUsernames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to get history' });
  }
};

// Create new history
const createHistory = async (req: Request, res: Response) => {
  try {
    const { user_id, opponent_user_id, own_score, opponent_score } = req.body;
    const history = await History.create({
      user_id,
      opponent_user_id,
      own_score,
      opponent_score,
      date: new Date(),
    });
    res.status(201).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create history' });
  }
};

//Update history by id
const updateHistoryById = async (
  req: Request<{ id: string }, {}, Partial<IHistory>>,
  res: Response
) => {
  try {
    const history = await History.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return update data
    });
    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update history' });
  }
};

//Delete history by id
const deleteHistoryById = async (
  req: Request<{ id: string }, {}, Partial<IHistory>>,
  res: Response
) => {
  try {
    const history = await History.findByIdAndDelete(req.params.id);
    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete history' });
  }
};

export default {
  createHistory,
  getHistoryByUserId,
  getAllHistorys,
  updateHistoryById,
  deleteHistoryById,
};
