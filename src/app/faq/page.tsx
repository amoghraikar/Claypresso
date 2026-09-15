'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Plus,
  Minus,
  X,
  ArrowRight,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { FAQ_ITEMS, FAQ_CATEGORIES } from '@/data/faqData';
import styles from './faq.module.css';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openItemIds, setOpenItemIds] = useState<string[]>(['prod-1', 'shp-1']); // default open two common questions

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className={styles.faqPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={13} />
              <span>Studio Help &amp; FAQs</span>
            </div>

            <h1 className={styles.heroTitle}>QUESTIONS? WE&apos;VE GOT YOU.</h1>

            <p className={styles.heroSubtitle}>
              Everything you need to know about our handmade polymer clay pieces, shipping timelines, order tracking, and custom commissions.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. SEARCH & CATEGORY CONTROLS */}
        <div className={styles.controlsWrapper}>
          {/* Client-side Search Input */}
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search questions (e.g. shipping, custom, care)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className={styles.categoryPills} role="tablist" aria-label="FAQ categories">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`${styles.categoryPill} ${
                  selectedCategory === cat ? styles.categoryPillActive : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ACCORDION FAQ LIST */}
        <div className={styles.faqList}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyResults}>
              <HelpCircle size={36} color="var(--color-warm-brown)" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: 8 }}>
                No matching questions found
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Feel free to drop us a note directly.
              </p>
              <Link href="/contact" className={styles.calloutBtn}>
                Contact Us Directly →
              </Link>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openItemIds.includes(item.id);
              const answerId = `faq-answer-${item.id}`;
              const buttonId = `faq-btn-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    className={styles.faqButton}
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span>{item.question}</span>
                    <span className={styles.iconCircle} aria-hidden="true">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={styles.faqAnswer}
                    >
                      <span className={styles.categoryTag}>{item.category}</span>
                      <p style={{ margin: 0 }}>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 4. STILL HAVE QUESTIONS FOOTER CALLOUT */}
        <div className={styles.footerCallout}>
          <div className={styles.calloutText}>
            <h3>Still have questions?</h3>
            <p>
              We&apos;re an independent studio and happy to help with orders, dimensions, or custom ideas.
            </p>
          </div>
          <Link href="/contact" className={styles.calloutBtn}>
            <MessageCircle size={16} />
            <span>SAY HELLO TO US</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
