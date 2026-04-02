import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { vi } from 'vitest';

/**
 * Staff+ Testing Utility: Custom Render (v6.9.0)
 * Wraps components in all necessary providers (Query, Router, Auth).
 * Ensures tests match the production environment exactly.
 */

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockUser = { id: 'test-user', email: 'test@example.com', user_metadata: { full_name: 'John Doe' } };
  const mockValue = {
    session: { user: mockUser, access_token: 'mock-token' } as any,
    user: mockUser as any,
    loading: false,
    signInWithGoogle: vi.fn(),
    login: vi.fn(),
    signOut: vi.fn(),
  };

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  );
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
