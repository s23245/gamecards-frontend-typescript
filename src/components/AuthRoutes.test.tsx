import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './AuthRoutes';
import { clearAuth } from '../auth/token';

it('redirects unauthenticated users away from protected pages', async () => {
    clearAuth();
    render(<MemoryRouter initialEntries={['/account']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
        <Route path="/account" element={<ProtectedRoute><div>Private account</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login screen</div>} />
    </Routes></MemoryRouter>);
    expect(await screen.findByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Private account')).not.toBeInTheDocument();
});
