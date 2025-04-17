import { Router } from 'express';
import historyController from '../controllers/history.controller';

const historyRouter = Router();
historyRouter.get('/', historyController.getAllHistorys);
historyRouter.post('/', historyController.createHistory);
historyRouter.get('/:id', historyController.getHistoryByUserId);
historyRouter.put('/:id', historyController.updateHistoryById);
historyRouter.delete('/:id', historyController.deleteHistoryById);

export default historyRouter;
