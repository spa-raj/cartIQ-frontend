'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export default function ChatMarkdown({ content, className = '' }: ChatMarkdownProps) {
  return (
    <div className={`chat-markdown ${className}`}>
      <ReactMarkdown
        components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">{children}</p>
        ),
        // Bold text
        strong: ({ children }) => (
          <strong className="font-semibold text-surface-900">{children}</strong>
        ),
        // Italic text
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Unordered lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-2 last:mb-0">{children}</ul>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0">{children}</ol>
        ),
        // List items
        li: ({ children }) => (
          <li className="text-surface-700">{children}</li>
        ),
        // Headings
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-surface-900 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-surface-900 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-surface-900 mb-1">{children}</h3>
        ),
        // Code
        code: ({ children }) => (
          <code className="bg-surface-100 px-1.5 py-0.5 rounded text-sm font-mono text-primary-700">
            {children}
          </code>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}