import { render, fireEvent, screen } from 'test/layout-test-utils';
import Regenerate from '../Regenerate';

describe('Regenerate', () => {
  it('should render the Regenerate button', () => {
    render(
      <Regenerate
        onClick={() => {
          ('');
        }}
      />,
    );
    expect(screen.getByTestId('regenerate-generation-button')).toBeInTheDocument();
  });

  it('should call onClick when the button is clicked', () => {
    const handleClick = jest.fn();
    render(<Regenerate onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('regenerate-generation-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
