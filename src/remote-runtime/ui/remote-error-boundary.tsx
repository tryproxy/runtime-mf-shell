import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RemoteErrorFallback } from './remote-error-fallback';

type RemoteErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string | number;
};

type RemoteErrorBoundaryState = {
  error: Error | null;
};

export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RemoteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RemoteErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: RemoteErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <RemoteErrorFallback
          title="Remote slot crashed"
          message={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
