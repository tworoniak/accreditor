import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-3 p-8 dark:bg-gray-950'>
          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Something went wrong
          </p>
          <p className='max-w-sm text-center text-xs text-gray-400 dark:text-gray-500'>
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className='mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
