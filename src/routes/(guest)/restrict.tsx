import React from 'react';
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react';


import { clean_logout, clearAllCookies } from '@/utils/protectedRoute';
import { createFileRoute } from '@tanstack/react-router'
import { Route as SignInRoute } from '@/routes/(guest)/sign-in';


export const Route = createFileRoute('/(guest)/restrict')({
    component: RouteComponent,
})

function RouteComponent() {

    const [isLoading, setIsLoading] = React.useState(false);
    const retry = async () => {
        setIsLoading(true);

        clearAllCookies();
        clean_logout();

        await new Promise((r) => setTimeout(r, 300));
        window.location.replace(SignInRoute.fullPath);
        setIsLoading(false);
    };

    return <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div>Access Restricted</div>
        <div>You do not have permission to access this page.</div>
        <Button variant="outline"
            className='border-2 border-red-400 py-6 px-12 active:border-slate-500'
            onClick={retry}>
            {isLoading ? <span className='flex flex-row gap-2'><Loader size={16} className='animate-spin' /> Retrying..</span> : '  Retry'}

        </Button>
    </div>
}
