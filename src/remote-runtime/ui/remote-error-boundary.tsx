import { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { RemoteErrorFallback } from './remote-error-fallback';

type RemoteErrorBoundaryProps = WithTranslation & {
  children: ReactNode;
  resetKey?: string | number;
};

type RemoteErrorBoundaryState = {
  error: Error | null;
};

class RemoteErrorBoundaryBase extends Component<
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
          title={this.props.t('remote.slotCrashedTitle')}
          message={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export const RemoteErrorBoundary = withTranslation()(RemoteErrorBoundaryBase);
