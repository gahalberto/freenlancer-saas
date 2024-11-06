"use client"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminFirstSection from "@/components/dashboard/AdminFirstSection";

const AdminDashboard = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    if(session?.user.roleId != 3 ){
        router.push('/');
        return('Carregando...')
    }

    return (
        <>
            <AdminFirstSection />
        </>
    )
}

export default AdminDashboard;
