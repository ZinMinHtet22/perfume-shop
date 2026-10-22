import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ orderNo: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { orderNo } = await params;

  if (!/^[A-Za-z0-9-]+$/.test(orderNo)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNo },
    select: { status: true, payment: { select: { status: true } } },
  });

  if (!order || !order.payment) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  return NextResponse.json(
    {
      orderStatus: order.status,
      paymentStatus: order.payment.status,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
