import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/permission";

// GET — non lues
export async function GET() {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;
  try {
    const data = await prisma.notification.findMany({
      where: { userId: session.user.id, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;
  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}


export async function PUT(request) {
  const { session, error } = await requireRole("PROFESSEUR", "RH", "ADMIN");
  if (error) return error;

  const { id } = await request.json();
  try {
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Notification introuvable." },
        { status: 404 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

