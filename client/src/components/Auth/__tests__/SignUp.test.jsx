import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SignUp from '../SignUp';
import api from '../../../services/api';

vi.mock('../../../services/api');

describe('SignUp Component', () => {
  const mockUser = {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    phone: '1234567890'
  };

  beforeEach(() => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
  });

  test('renders signup form', () => {
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  test('successful registration', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    // Fill form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: mockUser.name } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: mockUser.username } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: mockUser.email } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: mockUser.password } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: mockUser.password } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: mockUser.phone } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });
});
