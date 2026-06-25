import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Must export a function for SSR flexibility
export function createAppRouter(opts?: { history?: any }) {
    return createRouter({
        routeTree,
        context: {
            auth: undefined!,
            queryClient: undefined!
        },
        defaultPreload: 'intent',
        scrollRestoration: true,
        defaultStructuralSharing: true,
        defaultPreloadStaleTime: 0,
        history: opts?.history,
    })
}
