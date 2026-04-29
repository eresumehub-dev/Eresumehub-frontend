import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { vi } from 'vitest';
import { User, Session } from '@supabase/supabase-js';

/**
 * Staff+ Testing Utility: Custom Render (v7.0.0)
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

const mockUser: User = {
  id: 'test-user',
  email: 'test@example.com',
  user_metadata: { full_name: 'John Doe' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

interface MockAuthOptions {
  user?: Partial<User> | null;
  loading?: boolean;
}

const createMockAuthValue = (overrides?: MockAuthOptions) => {
  const user = overrides?.user === null ? null : ({ ...mockUser, ...(overrides?.user || {}) } as User);
  
  return {
    session: user ? ({
      user,
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    } as Session) : null,
    user,
    loading: overrides?.loading ?? false,
    signInWithGoogle: vi.fn(),
    login: vi.fn(),
    signOut: vi.fn(),
  };
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  authOptions?: MockAuthOptions;
}

const customRender = (
  ui: ReactElement,
  { route = '/', authOptions, ...options }: CustomRenderOptions = {},
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = React.useState(() => createTestQueryClient());
    
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthContext.Provider value={createMockAuthValue(authOptions)}>
            {children}
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
