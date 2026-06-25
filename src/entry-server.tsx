import { createMemoryHistory } from '@tanstack/react-router'
import { renderToString } from 'react-dom/server'
import { AppRouter } from './AppRouter'
import { Providers } from './providers'
import { createAppRouter } from './router'

export async function render(url: string) {
    const history = createMemoryHistory({ initialEntries: [url] })
    const router = createAppRouter({ history })

    // prefetch matching loaders (optional, for data on first render)
    await router.load()

    const app = (
        <Providers>
            <AppRouter />
        </Providers>
    )

    return renderToString(app)
}
