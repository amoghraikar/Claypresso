'use client';

import React, { useState } from 'react';
import { Star, MessageSquareHeart, CheckCircle, X } from 'lucide-react';
import { Product, ProductReview } from '@/types/product';
import styles from './ProductDetail.module.css';

export interface ReviewsSectionProps {
  product: Product;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ product }) => {
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(product.reviews || []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Modal form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !name.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: name.trim(),
      rating,
      date: 'Just now',
      content: comment.trim(),
      verifiedPurchase: true,
    };

    setReviewsList((prev) => [newReview, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setName('');
      setComment('');
      setRating(5);
    }, 1500);
  };

  const hasReviews = reviewsList.length > 0;

  return (
    <section id="reviews" className={styles.reviewsSection} aria-labelledby="reviews-heading">
      <div className={styles.reviewsHeader}>
        <div>
          <h2 id="reviews-heading" className={styles.reviewsTitle}>
            Customer Reviews
          </h2>
          {hasReviews && (
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: 4, display: 'block' }}>
              {reviewsList.length} {reviewsList.length === 1 ? 'verified review' : 'verified reviews'}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.writeReviewBtn}
          onClick={() => setIsModalOpen(true)}
        >
          Write a Review
        </button>
      </div>

      {/* Review Content */}
      {hasReviews ? (
        <div className={styles.reviewsGrid}>
          {reviewsList.map((rev) => (
            <div key={rev.id} className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={styles.reviewAuthor}>{rev.author}</span>
                  {rev.verifiedPurchase && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '11px', color: '#2F6F4E' }}>
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>
                <span className={styles.reviewDate}>{rev.date}</span>
              </div>

              <div className={styles.stars} aria-label={`${rev.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= rev.rating ? '#F2B041' : 'none'}
                    color={s <= rev.rating ? '#F2B041' : 'var(--color-border)'}
                  />
                ))}
              </div>

              <p className={styles.reviewBody}>{rev.content}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Tasteful Empty State (Requirement 11 - DO NOT fabricate reviews) */
        <div className={styles.reviewsEmptyBox}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--color-cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-terracotta)',
            }}
          >
            <MessageSquareHeart size={24} />
          </div>

          <h3 className={styles.reviewsEmptyTitle}>Be the first to leave a little love.</h3>
          <p className={styles.reviewsEmptyText}>
            Every single charm and tray is hand-sculpted by our Bangalore studio. If you&apos;ve added this piece to your collection, we&apos;d adore hearing your honest thoughts.
          </p>

          <button
            type="button"
            className={styles.writeReviewBtn}
            onClick={() => setIsModalOpen(true)}
          >
            Share Your Experience
          </button>
        </div>
      )}

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close review dialog"
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: 0, color: 'var(--color-espresso)' }}>
              Review &ldquo;{product.name}&rdquo;
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#2F6F4E' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 600 }}>Thank you for your review! ✦</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                    Your Rating
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                        aria-label={`Rate ${s} stars`}
                      >
                        <Star
                          size={24}
                          fill={s <= rating ? '#F2B041' : 'none'}
                          color={s <= rating ? '#F2B041' : 'var(--color-border)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review-author" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                    Your Name
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    required
                    placeholder="e.g. Diya K."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-border)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                    Your Thoughts
                  </label>
                  <textarea
                    id="review-comment"
                    required
                    rows={4}
                    placeholder="How does it feel in hand? Is the glaze satisfying?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--color-border)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button type="submit" className={styles.writeReviewBtn} style={{ marginTop: 6 }}>
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
