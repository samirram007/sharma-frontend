import { Link } from '@tanstack/react-router'

export default function Footer() {
    return (
        <footer className="p-2 min-h-20 mt-1 rounded-sm flex gap-2 bg-blue-600/10 text-black justify-between">
            <h1>Footer</h1>
            <nav className="flex flex-row">
                <div className="px-2 font-bold">
                    <Link to="/">Home</Link>
                </div>



            </nav>
        </footer>
    )
}
