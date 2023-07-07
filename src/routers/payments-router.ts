import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { paymentSchema } from "../schemas/payments-schemas";
import paymentsController from "../controllers/payments-controller";

const paymentsRouter = Router();

paymentsRouter.get('/', authenticateToken,paymentsController.getPayment)
paymentsRouter.post('/process', authenticateToken, validateBody(paymentSchema),paymentsController.newPayment)

export {paymentsRouter}