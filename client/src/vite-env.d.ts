interface Window {
  dbAPI: {
    runQuery: (
      query: string,
    ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
    login: (
      username: string,
      pin: string,
    ) => Promise<{ success: boolean; message?: string; error?: string }>;
  };
}
