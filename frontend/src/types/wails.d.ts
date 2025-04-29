export {};

declare global {
  interface Window {
    go: {
      auth: {
        // The RecoveryProcess function as defined in recProcess.go
        RecoveryProcess: (email: string, password: string, seedPhrase: string) => Promise<string>;
        RecoveryRequest: (email: string) => Promise<any>;
        RecoverySetup: (email: string) => Promise<string>;
        // Add other auth methods as needed
      };
      // Add other modules as needed
    };
  }
}