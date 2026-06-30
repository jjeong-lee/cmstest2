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

async function renderPortalHomePage() {
  render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <PortalHomePage />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(api.getPublicFolders).toHaveBeenCalled();
    expect(api.getPublicDocuments).toHaveBeenCalledWith(null);
  });
}

describe('PortalHomePage', () => {
  beforeEach(() => {
    vi.mocked(api.getPublicFolders).mockResolvedValue([]);
    vi.mocked(api.getPublicDocuments).mockResolvedValue([]);
    vi.mocked(api.searchDocuments).mockResolvedValue([]);
  });

  it('disables the search button until a query is entered', async () => {
    const user = userEvent.setup();

    await renderPortalHomePage();

    const searchButton = screen.getByRole('button', { name: /search/i });
    const searchInput = screen.getByPlaceholderText('제목 또는 본문 키워드를 입력하세요');

    expect(searchButton).toBeDisabled();

    await user.type(searchInput, 'portal');

    expect(searchButton).toBeEnabled();
  });

  it('shows an empty state only after a search returns no results', async () => {
    const user = userEvent.setup();

    await renderPortalHomePage();

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('제목 또는 본문 키워드를 입력하세요');
    await user.type(searchInput, 'missing');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(api.searchDocuments).toHaveBeenCalledWith('missing');
    });

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('다른 키워드나 폴더 범위를 시도해 보세요.')).toBeInTheDocument();
  });
});
