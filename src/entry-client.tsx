import ReactDOM from 'react-dom/client'
import { AppRouter } from './AppRouter'
import { Providers } from './providers'
import './styles.css'

const rootElement = document.getElementById('root')!
ReactDOM.hydrateRoot(
    rootElement,
    <Providers>
        <AppRouter />
    </Providers>
)
