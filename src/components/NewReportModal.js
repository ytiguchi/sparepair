'use client';

import { useState } from 'react';
import styles from './ReportModal.module.css'; // Reusing modal styles
import { compressImage } from '../utils/image';

export default function NewReportModal({ onClose, onSubmit, statusMessage }) {
    const [formData, setFormData] = useState({
        facility: 'Ledian Spa 恵比寿',
        location: '',
        item: '',
        imageUrl: '',
        imageFile: null,
        priority: '中',
        remarks: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        console.log('handleSubmit started', formData);
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            console.log('onSubmit completed successfully');
            // Modal closes on success via parent, so no need to reset isSubmitting here
        } catch (error) {
            console.error('Submission failed:', error);
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
                <div className={styles.header}>
                    <h2 className={styles.title} style={{ marginBottom: 0 }}>新規レポート作成</h2>
                    <button className={styles.closeBtn} onClick={onClose} style={{ position: 'static', marginBottom: 0 }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.infoItem}>
                        <label>店舗</label>
                        <select
                            name="facility"
                            value={formData.facility}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                        >
                            <option value="Ledian Spa 恵比寿">Ledian Spa 恵比寿</option>
                            <option value="Ledian Spa 麻布個室">Ledian Spa 麻布個室</option>
                            <option value="Ledian Spa 麻布大衆店">Ledian Spa 麻布大衆店</option>
                            <option value="Ledian Lounge">Ledian Lounge</option>
                            <option value="Ledian Clinic">Ledian Clinic</option>
                        </select>
                    </div>

                    <div className={styles.infoItem}>
                        <label>場所</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="例: 402号室"
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                        />
                    </div>

                    <div className={styles.infoItem}>
                        <label>項目 / カテゴリ</label>
                        <input
                            type="text"
                            name="item"
                            value={formData.item}
                            onChange={handleChange}
                            required
                            placeholder="例: シャワーヘッド破損"
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                        />
                    </div>

                    <div className={styles.infoItem}>
                        <label>画像 (アップロード)</label>
                        <input
                            type="file"
                            name="imageFile"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    console.log('File selected:', file.name, file.size);
                                    try {
                                        console.log('Starting compression...');
                                        const compressedFile = await compressImage(file);
                                        console.log('Compression finished:', compressedFile.name, compressedFile.size);
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({
                                                ...prev,
                                                imageUrl: reader.result,
                                                imageFile: compressedFile
                                            }));
                                        };
                                        reader.readAsDataURL(compressedFile);
                                    } catch (error) {
                                        console.error('Image compression failed:', error);
                                        // Fallback to original file if compression fails
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({
                                                ...prev,
                                                imageUrl: reader.result,
                                                imageFile: file
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }
                            }}
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                        />
                        {formData.imageUrl && (
                            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #555' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.infoItem}>
                        <label>緊急度</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                        >
                            <option value="低">低</option>
                            <option value="中">中</option>
                            <option value="高">高</option>
                        </select>
                    </div>

                    <div className={styles.remarksSection}>
                        <label>詳細 / 備考</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={4}
                            style={{ width: '100%', padding: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.actionBtn}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: isSubmitting ? '#666' : 'var(--primary-color)',
                            color: '#1a1a1a',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? (statusMessage || '送信中...') : '投稿する'}
                    </button>
                </form>
            </div>
        </div>
    );
}
