'use client';

import styles from './ReportCard.module.css';
import { getDrivePreviewUrl } from '../utils/image';

export default function ReportCard({ report, onClick }) {
    const isDataUrl = report.imageUrl && report.imageUrl.startsWith('data:');
    const previewUrl = isDataUrl ? report.imageUrl : getDrivePreviewUrl(report.imageUrl);

    return (
        <div className={styles.card} onClick={() => onClick(report)}>
            <div className={styles.imageContainer}>
                <iframe
                    src={previewUrl}
                    className={styles.iframe}
                    title="Media Preview"
                    loading="lazy"
                    style={isDataUrl ? { pointerEvents: 'none' } : {}} // Disable interaction for images in iframe
                />
                <div className={styles.imageOverlay} />
                <span className={styles.facilityBadge}>
                    {report.facility}
                </span>
                <span className={`${styles.statusBadge} ${styles[report.status.toLowerCase().replace(' ', '')]}`}>
                    {report.status}
                </span>
            </div>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{report.location}</h3>
                    <span className={styles.date}>{report.timestamp.split(' ')[0]}</span>
                </div>
                <p className={styles.item}>{report.item}</p>
                <p className={styles.remarks}>{report.remarks}</p>
                <div className={styles.footer}>
                    <span className={styles.reporter}>Rep: {report.reporter}</span>
                </div>
            </div>
        </div>
    );
}
