import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorCard } from "./error-card";
import { clientLogger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    clientLogger.error("ErrorBoundary", error.message, {
      stack: error.stack,
      componentStack: info.componentStack,
    });
    this.setState({ errorInfo: info.componentStack ?? "" });
  }

  handleRetry = (): void => {
    this.setState({ error: null, errorInfo: "" });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorCard
          title="Une erreur est survenue"
          message={this.state.error.message}
          logs={[
            this.state.error.stack ?? "",
            this.state.errorInfo,
            clientLogger.exportText(),
          ].join("\n\n")}
          onRetry={this.handleRetry}
          onBack={() => {
            window.location.href = "/";
          }}
        />
      );
    }
    return this.props.children;
  }
}
