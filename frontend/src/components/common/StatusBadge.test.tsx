import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status text', () => {
    render(<StatusBadge status="PUBLISHED" />);
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
  });
});
