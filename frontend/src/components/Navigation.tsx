"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./Navigation.module.css";

const navigationItems = [
  { href: "/", label: "Bio", featured: false },
  { href: "/research", label: "Research", featured: false },
  { href: "/teaching", label: "Teaching", featured: false },
  { href: "/ddcf", label: "DDCF Hub", featured: true },
  { href: "/empleo-publico", label: "Empleo público", featured: false },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <div className={styles.logo}>
        <Link href="/" aria-label="Joaquin Garcia-Suarez, home">
          JGS
        </Link>
      </div>

      <button
        ref={menuButtonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={isOpen}
        aria-controls="primary-navigation-links"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <X size={21} aria-hidden="true" />
        ) : (
          <Menu size={21} aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <ul
        id="primary-navigation-links"
        className={`${styles.links} ${isOpen ? styles.linksOpen : ""}`}
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${item.featured ? styles.highlight : ""} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.label}</span>
                {item.featured && (
                  <span className={styles.linkArrow} aria-hidden="true">
                    ↗
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
