import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PortalHomePage } from './PortalHomePage';
import { api } from '../../services/api/client';

vi.mock('../../services/api/client', () => ({
  api: {
    getPublicFolders: vi.fn(),
    getPublicDocuments: vi.fn(),
    searchDocuments: vi.fn(),
  },
}));

describe('PortalHomePage', () => {
  beforeEach(() => {
    vi.mocked(api.getPublicFolders).mockResolvedValue([]);
    vi.mocked(api.getPublicDocuments).mockResolvedValue([]);
    vi.mocked(api.searchDocuments).mockResolvedValue([]);
  });

  it('keeps the search button disabled until the query has at least one character', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PortalHomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.getPublicFolders).toHaveBeenCalled();
      expect(api.getPublicDocuments).toHaveBeenCalled();
    });

    const searchButton = screen.getByRole('button', { name: '검색' });
    const searchInput = screen.getByPlaceholderText('제목 또는 본문 키워드를 입력하세요');

    expect(searchButton).toBeDisabled();

    await user.type(searchInput, 'a');

    expect(searchButton).toBeEnabled();
  });

  it('shows the empty-result message only after executing a search', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PortalHomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.getPublicFolders).toHaveBeenCalled();
      expect(api.getPublicDocuments).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText('제목 또는 본문 키워드를 입력하세요');

    await user.type(searchInput, '없는문서');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '검색' }));

    await waitFor(() => {
      expect(api.searchDocuments).toHaveBeenCalledWith('없는문서');
    });
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
