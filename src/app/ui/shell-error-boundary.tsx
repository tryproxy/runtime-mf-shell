import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShellErrorFallback } from './shell-error-fallback';

type ShellErrorBoundaryProps = {
  children: ReactNode;
};

type ShellErrorBoundaryState = {
  error: Error | null;
};

export class ShellErrorBoundary extends Component<
  ShellErrorBoundaryProps,
  ShellErrorBoundaryState
> {
  state: ShellErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ShellErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ShellErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ShellErrorFallback
          message={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
