import { render, screen } from '@testing-library/react';
  import GameCard from '../components/GameCard';

  test('renders game card', () => {
    render(<GameCard gameType="slots" />);
    expect(screen.getByText(/slots/i)).toBeInTheDocument();
  });