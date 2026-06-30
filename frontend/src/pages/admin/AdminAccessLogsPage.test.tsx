import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminAccessLogsPage } from './AdminAccessLogsPage';
import { api } from '../../services/api/client';

vi.mock('../../services/api/client', () => ({
  api: {
    getUsers: vi.fn(),
    getAccessLogs: vi.fn(),
    createAccessLog: vi.fn(),
  },
}));

describe('AdminAccessLogsPage', () => {
  it('creates an access log for the selected user and renders the log table', async () => {
    vi.mocked(api.getUsers).mockResolvedValue([
      {
        id: 7,
        name: '홍길동',
        email: 'hong@example.com',
        role: 'ADMIN',
        teamId: 1,
        teamName: 'Content Ops',
        createdAt: '2026-06-26T00:00:00Z',
        updatedAt: '2026-06-26T00:00:00Z',
      },
    ]);
    vi.mocked(api.createAccessLog).mockResolvedValue({
      id: 11,
      userId: 7,
      userName: '홍길동',
      role: 'ADMIN',
      accessedAt: '2026-06-30T01:00:00Z',
    });
    vi.mocked(api.getAccessLogs).mockResolvedValue([
      {
        id: 11,
        userId: 7,
        userName: '홍길동',
        role: 'ADMIN',
        accessedAt: '2026-06-30T01:00:00Z',
      },
    ]);

    render(<AdminAccessLogsPage />);

    await userEvent.selectOptions(await screen.findByLabelText('로그 기록 사용자'), '7');

    await waitFor(() => {
      expect(api.createAccessLog).toHaveBeenCalledWith({ userId: 7 });
    });
    expect(api.getAccessLogs).toHaveBeenCalled();
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('홍길동')).toBeInTheDocument();
    expect(within(table).getByText('ADMIN')).toBeInTheDocument();
    expect(within(table).getByText('7')).toBeInTheDocument();
  });
});
