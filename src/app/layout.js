import './globals.css'

export const metadata = {
    title: 'Sauna Repair Management',
    description: 'Track and manage sauna facility repairs',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    )
}
