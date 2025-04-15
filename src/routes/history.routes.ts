import { Router } from "express";
import historyController from "../controllers/history.controller";

const historyRouter = Router();
historyRouter.get("/", historyController.getAllHistorys);
historyRouter.get("/:id", historyController.getHistoryById);
historyRouter.post("/", historyController.createHistory);
historyRouter.put("/:id", historyController.updateHistoryById);
historyRouter.delete("/:id", historyController.deleteHistoryById);

export default historyRouter;
