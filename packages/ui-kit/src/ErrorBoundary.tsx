"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: unknown) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Wraps every theme/widget mount in the shared render pipeline (apps/web/src/lib/portfolioRenderer.tsx)
 * so one broken widget/theme component degrades to `fallback` instead of blanking the whole
 * public portfolio page (edge_case.md §2).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
