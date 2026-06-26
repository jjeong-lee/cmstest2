import { render, screen } from '@testing-library/react';
import { AdminUsersPage } from './AdminUsersPage';
import { api } from '../../services/api/client';

vi.mock('../../services/api/client', () => ({
  api: {
    getTeams: vi.fn(),
    getUsers: vi.fn(),
    createTeam: vi.fn(),
    deleteTeam: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

describe('AdminUsersPage', () => {
  it('renders teams and users from the admin API', async () => {
    vi.mocked(api.getTeams).mockResolvedValue([
      { id: 1, name: 'Content Ops', memberCount: 1 },
      { id: 2, name: 'Platform', memberCount: 0 },
    ]);
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

    render(<AdminUsersPage />);

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('hong@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Content Ops').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('EDITOR')).toBeInTheDocument();
  });
});
