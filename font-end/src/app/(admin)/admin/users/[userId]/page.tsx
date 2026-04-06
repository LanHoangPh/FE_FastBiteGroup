import { Metadata } from "next";
import { notFound } from "next/navigation";
import UserDetailPage from "@/components/features/admin/users/UserDetailPage";

interface UserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export async function generateMetadata({
  params,
}: UserDetailPageProps): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `Chi tiết người dùng ${userId} | FastBite Admin`,
    description: "Xem và quản lý thông tin chi tiết người dùng",
  };
}

export default async function UserDetailPageRoute({
  params,
}: UserDetailPageProps) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  return <UserDetailPage userId={userId} />;
}
