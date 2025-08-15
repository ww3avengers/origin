import { render, fireEvent, screen } from 'test/layout-test-utils';
import Stop from '../Stop';

describe('Stop', () => {
  it('should render the Stop button', () => {
    render(
      <Stop
        onClick={() => {
          ('');
        }}
      />,
    );
    expect(screen.getByTestId('stop-generation-button')).toBeInTheDocument();
  });

  it('should call onClick when the button is clicked', () => {
    const handleClick = jest.fn();
    render(<Stop onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('stop-generation-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
