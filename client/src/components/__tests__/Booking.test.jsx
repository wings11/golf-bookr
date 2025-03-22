import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Booking from '../Booking';
import api from '../../services/api';

vi.mock('../../services/api');

describe('Booking Component', () => {
  const mockTeeTimes = [
    { id: 1, course: 'Pine Valley', date: '2023-10-01', time: '10:00', holes: '18', available: true },
    { id: 2, course: 'Augusta National', date: '2023-10-01', time: '11:00', holes: '18', available: false },
  ];

  beforeEach(() => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );
  });

  test('renders booking form', () => {
    expect(screen.getByText(/book a tee time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select course/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select holes/i)).toBeInTheDocument();
  });

  test('fetches and displays tee times', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, teeTimes: mockTeeTimes } });

    fireEvent.change(screen.getByLabelText(/select course/i), { target: { value: 'Pine Valley' } });
    fireEvent.change(screen.getByLabelText(/select holes/i), { target: { value: '18H' } });
    fireEvent.click(screen.getByRole('button', { name: /search tee times/i }));

    await waitFor(() => {
      expect(screen.getByText(/pine valley/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00/i)).toBeInTheDocument();
      expect(screen.getByText(/augusta national/i)).toBeInTheDocument();
      expect(screen.getByText(/11:00/i)).toBeInTheDocument();
    });
  });

  test('books a tee time successfully', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, teeTimes: mockTeeTimes } });
    api.post.mockResolvedValueOnce({ data: { success: true, message: 'Booking confirmed' } });

    fireEvent.change(screen.getByLabelText(/select course/i), { target: { value: 'Pine Valley' } });
    fireEvent.change(screen.getByLabelText(/select holes/i), { target: { value: '18H' } });
    fireEvent.click(screen.getByRole('button', { name: /search tee times/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /select/i }));
    });

    fireEvent.change(screen.getByLabelText(/number of players/i), { target: { value: 2 } });
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));

    await waitFor(() => {
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
    });
  });
});
