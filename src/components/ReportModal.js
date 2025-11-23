'use client';

import { useEffect, useState } from 'react';
import styles from './ReportModal.module.css';
import { getDrivePreviewUrl } from '../utils/image';

export default function ReportModal({ report, onClose, onUpdateStatus, onAddComment, onUpdateReport, onDeleteReport }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedReport, setEditedReport] = useState({
        location: report.location,
        item: report.item,
        remarks: report.remarks
    });

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!report) return null;

    const handleSaveEdit = () => {
        onUpdateReport(report.id, editedReport);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedReport({
            location: report.location,
            item: report.item,
            remarks: report.remarks
        });
        setIsEditing(false);
    };

    const isDataUrl = report.imageUrl && report.imageUrl.startsWith('data:');
    const previewUrl = isDataUrl ? report.imageUrl : getDrivePreviewUrl(report.imageUrl);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>

                <div className={styles.imageSection}>
                    <iframe
                        src={previewUrl}
                        className={styles.iframe}
                        allow="autoplay"
                        title="Media Preview"
                    />
                </div>

                <div className={styles.contentSection}>
                    <div className={styles.header}>
                        <span className={`${styles.statusBadge} ${styles[report.status.toLowerCase().replace(' ', '')]}`}>
                            {report.status}
                        </span>
                        <span className={styles.date}>{report.timestamp}</span>
                    </div>

                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={editedReport.location}
                                onChange={(e) => setEditedReport({ ...editedReport, location: e.target.value })}
                                className={styles.editInput}
                                placeholder="場所"
                            />
                            <input
                                type="text"
                                value={editedReport.item}
                                onChange={(e) => setEditedReport({ ...editedReport, item: e.target.value })}
                                className={styles.editInput}
                                placeholder="項目"
                                style={{ marginBottom: '2rem' }}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className={styles.title}>{report.location}</h2>
                            <h3 className={styles.subtitle}>{report.item}</h3>
                        </>
                    )}

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>店舗</label>
                            <p>{report.facility}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>報告者</label>
                            <p>{report.reporter}</p>
                        </div>
                    </div>

                    <div className={styles.remarksSection}>
                        <label>詳細 / 備考</label>
                        {isEditing ? (
                            <textarea
                                value={editedReport.remarks}
                                onChange={(e) => setEditedReport({ ...editedReport, remarks: e.target.value })}
                                className={styles.editTextarea}
                                rows="4"
                            />
                        ) : (
                            <p className={styles.remarks}>{report.remarks}</p>
                        )}
                    </div>

                    <div className={styles.timelineSection}>
                        <label>対応履歴</label>
                        <div className={styles.timeline}>
                            {report.history && report.history.map((event, index) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineHeader}>
                                        <span className={styles.timelineDate}>{event.date}</span>
                                        <span className={styles.timelineUser}>{event.user}</span>
                                    </div>
                                    <p className={styles.timelineContent}>{event.content}</p>
                                </div>
                            ))}
                            {(!report.history || report.history.length === 0) && (
                                <p className={styles.noHistory}>履歴はありません</p>
                            )}
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const comment = e.target.comment.value;
                                const userName = e.target.userName.value;
                                if (comment.trim() && userName.trim()) {
                                    onAddComment(report.id, comment, userName);
                                    e.target.reset();
                                }
                            }}
                            className={styles.commentForm}
                        >
                            <input
                                name="userName"
                                placeholder="対応者名"
                                className={styles.userNameInput}
                                autoComplete="off"
                                required
                            />
                            <input
                                name="comment"
                                placeholder="コメントを入力..."
                                className={styles.commentInput}
                                autoComplete="off"
                                required
                            />
                            <button type="submit" className={styles.commentSubmitBtn}>送信</button>
                        </form>
                    </div>

                    <div className={styles.actions} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {isEditing ? (
                            <>
                                <button
                                    className={styles.actionBtn}
                                    onClick={handleSaveEdit}
                                    style={{ background: 'var(--success-color)', color: '#fff' }}
                                >
                                    保存
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    onClick={handleCancelEdit}
                                    style={{ background: '#666', color: '#fff' }}
                                >
                                    キャンセル
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => setIsEditing(true)}
                                    style={{ background: 'var(--primary-color)', color: '#1a1a1a' }}
                                >
                                    編集
                                </button>
                                {report.status !== 'Fixed' && (
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onUpdateStatus(report.id, 'Fixed')}
                                        style={{ background: 'var(--success-color)', color: '#fff' }}
                                    >
                                        修繕完了にする
                                    </button>
                                )}
                                {report.status === 'Open' && (
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onUpdateStatus(report.id, 'In Progress')}
                                        style={{ background: '#e9c46a', color: '#1a1a1a' }}
                                    >
                                        対応中にする
                                    </button>
                                )}
                            </>
                        )}
                        {!isEditing && (
                            <button
                                className={styles.actionBtn}
                                onClick={() => {
                                    if (window.confirm('本当にこのレポートを削除しますか？')) {
                                        onDeleteReport(report.id);
                                    }
                                }}
                                style={{ background: '#d32f2f', color: '#fff', marginLeft: 'auto' }}
                            >
                                削除
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
