import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import React from "react";


const Dashboard = () => {
    const auth = useAuth();
    const [loading, setLoading] = React.useState(false);
    // console.log('Dashboard RouteComponent', context);
    const handleLogout = async () => {
        setLoading(true);
        await auth.logout();
        // maybe redirect to /sign-in here if you want, e.g.,
        // router.navigate({ to: '/sign-in' })
        setLoading(false);
    };

    return (
        <div>
            Hello "/(authenticated)/"! Dashboard
            <Button onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out...' : 'Logout'}
            </Button>
        </div>
    );
}
export default Dashboard;