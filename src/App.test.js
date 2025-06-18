import { render, screen } from '@testing-library/react';
import App from './App';

test('renders marketplace title', () => {
  render(<App />);
  const heading = screen.getByText(/NFT Marketplace/i);
  expect(heading).toBeInTheDocument();
});
