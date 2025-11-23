import './globals.css'

export const metadata = {
    title: 'Ledian Group 修繕管理システム',
    description: 'Ledian Groupの施設修繕依頼を効率的に管理するシステムです。修繕状況の確認、進捗管理、コメント機能を提供します。',
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    )
}
