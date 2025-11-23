'use client';

import { useState, useMemo, useEffect } from 'react';
import ReportCard from '../components/ReportCard';
import ReportModal from '../components/ReportModal';
import NewReportModal from '../components/NewReportModal';
import styles from './page.module.css';
import {
    subscribeToReports,
    addReport,
    updateReport,
    addCommentToReport,
    uploadImage,
    deleteReport
} from '../lib/firebaseService';

export default function Home() {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('Open');
    const [facilityFilter, setFacilityFilter] = useState('All');
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Subscribe to real‑time updates
    useEffect(() => {
        const unsubscribe = subscribeToReports(updated => {
            setReports(updated);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Unique facilities for filter buttons
    const facilities = useMemo(() => {
        const uniq = new Set(reports.map(r => r.facility).filter(Boolean));
        return ['All', ...Array.from(uniq)];
    }, [reports]);

    const filteredReports = reports.filter(r => {
        const statusMatch = filter === 'All' || r.status === filter;
        const facilityMatch = facilityFilter === 'All' || r.facility === facilityFilter;
        return statusMatch && facilityMatch;
    });

    const stats = {
        open: reports.filter(r => r.status === 'Open').length,
        fixed: reports.filter(r => r.status === 'Fixed').length,
    };

    // ---------- Handlers ----------
    const handleAddReport = async (newReportData) => {
        console.log('Submitting new report:', newReportData);
        try {
            setStatusMessage('画像をアップロード中...');
            let imageUrl = newReportData.imageUrl;
            if (newReportData.imageFile) {
                const tempId = `temp_${Date.now()}`;
                try {
                    imageUrl = await uploadImage(newReportData.imageFile, tempId);
                    console.log('Image uploaded:', imageUrl);
                } catch (uploadError) {
                    console.error('Image upload failed, falling back to Base64:', uploadError);
                    setStatusMessage('アップロード失敗。簡易モードで保存中...');
                    // Fallback to Base64 string (already in newReportData.imageUrl from preview)
                    // Check if Base64 string is too large (approx > 900KB to be safe for Firestore 1MB limit)
                    if (imageUrl && imageUrl.length > 1200000) { // ~900KB
                        alert('画像のアップロードに失敗し、画像サイズが大きすぎるため保存できませんでした。画像なしで保存します。');
                        imageUrl = '';
                    } else {
                        alert('画像のアップロードに失敗したため、簡易モード（画質低下の可能性あり）で保存します。');
                    }
                }
            }

            setStatusMessage('レポートを保存中...');
            const report = {
                facility: newReportData.facility,
                location: newReportData.location,
                item: newReportData.item,
                remarks: newReportData.remarks,
                imageUrl,
                timestamp: new Date().toLocaleString('ja-JP'),
                reporter: '新規投稿',
                status: 'Open',
                history: []
            };
            const docId = await addReport(report);
            console.log('Report added, id:', docId);
            setIsModalOpen(false);
            return docId;
        } catch (e) {
            console.error('Error adding report:', e);
            alert(`レポートの追加に失敗しました: ${e.message}`);
            // We don't close the modal on error so user can retry
            throw e;
        } finally {
            setStatusMessage('');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const report = reports.find(r => r.id === id);
            if (!report) return;
            const history = report.history || [];
            const entry = {
                date: new Date().toLocaleString('ja-JP'),
                user: 'システム',
                content: `ステータスを「${newStatus}」に変更しました`
            };
            await updateReport(id, { status: newStatus, history: [...history, entry] });
            setSelectedReport(null);
        } catch (e) {
            console.error('Error updating status:', e);
            alert('ステータスの更新に失敗しました');
        }
    };

    const handleAddComment = async (id, comment, userName) => {
        try {
            const report = reports.find(r => r.id === id);
            if (!report) return;
            const history = report.history || [];
            const newComment = { date: new Date().toLocaleString('ja-JP'), user: userName, content: comment };
            await addCommentToReport(id, history, newComment);
            setSelectedReport({ ...report, history: [...history, newComment] });
        } catch (e) {
            console.error('Error adding comment:', e);
            alert('コメントの追加に失敗しました');
        }
    };

    const handleUpdateReport = async (id, updates) => {
        try {
            await updateReport(id, updates);
            const report = reports.find(r => r.id === id);
            if (report) setSelectedReport({ ...report, ...updates });
        } catch (e) {
            console.error('Error updating report:', e);
            alert('レポートの更新に失敗しました');
        }
    };

    const handleDeleteReport = async (id) => {
        try {
            await deleteReport(id);
            setSelectedReport(null);
            // Local state update is handled by subscription, but we can optimistically remove it if needed.
            // Subscription should handle it automatically.
        } catch (e) {
            console.error('Error deleting report:', e);
            alert('レポートの削除に失敗しました');
        }
    };

    // ---------- Render ----------
    if (loading) {
        return (
            <main className={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
                    読み込み中...
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <img src="/logo.png" alt="Ledian Spa" style={{ height: '40px', objectFit: 'contain' }} />
                            <div>
                                <h1 className={styles.title}>Ledian Group</h1>
                                <p className={styles.subtitle}>修繕依頼アプリ</p>
                            </div>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.open}</span>
                                <span className={styles.statLabel}>未対応</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.fixed}</span>
                                <span className={styles.statLabel}>完了</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className={styles.controls} style={{ marginBottom: 0 }}>
                        <button className={`${styles.filterBtn} ${filter === 'All' ? styles.active : ''}`} onClick={() => setFilter('All')}>全て</button>
                        <button className={`${styles.filterBtn} ${filter === 'Open' ? styles.active : ''}`} onClick={() => setFilter('Open')}>未対応</button>
                        <button className={`${styles.filterBtn} ${filter === 'In Progress' ? styles.active : ''}`} onClick={() => setFilter('In Progress')}>対応中</button>
                        <button className={`${styles.filterBtn} ${filter === 'Fixed' ? styles.active : ''}`} onClick={() => setFilter('Fixed')}>完了</button>
                    </div>
                    <button className={styles.filterBtn} style={{ background: 'var(--primary-color)', color: '#1a1a1a', fontWeight: 'bold', border: 'none' }} onClick={() => setIsModalOpen(true)}>
                        ＋ 新規投稿
                    </button>
                </div>

                <div className={styles.controls}>
                    {facilities.map(f => (
                        <button key={f} className={`${styles.filterBtn} ${facilityFilter === f ? styles.active : ''}`} onClick={() => setFacilityFilter(f)}>
                            {f === 'All' ? '全店舗' : f}
                        </button>
                    ))}
                </div>

                <div className="grid">
                    {filteredReports.map(report => (
                        <ReportCard key={report.id} report={report} onClick={setSelectedReport} />
                    ))}
                </div>

                {selectedReport && (
                    <ReportModal
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                        onUpdateStatus={handleUpdateStatus}
                        onAddComment={handleAddComment}
                        onUpdateReport={handleUpdateReport}
                        onDeleteReport={handleDeleteReport}
                    />
                )}

                {isModalOpen && (
                    <NewReportModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAddReport}
                        statusMessage={statusMessage}
                    />
                )}
            </div>
        </main>
    );
}
