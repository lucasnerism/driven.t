import { PaymentData } from "@/protocols";
import { prisma } from "@/config";

async function createPayment(paymentData:PaymentData){
  return prisma.payment.create({
    data:paymentData
  })
}

async function findPayment(ticketId:number){
  return prisma.payment.findFirst({
    where:{ticketId}
  })
}

const paymentsRepository = {
  createPayment,
  findPayment,
}

export default paymentsRepository