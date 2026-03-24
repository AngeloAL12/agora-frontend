import { render } from '@testing-library/react-native';
import Index from '../../app/index';

describe('Index Screen', () => {
  it('renderiza el texto correctamente', () => {
    const { getByText } = render(<Index />);

    expect(getByText('A chambear con Agora')).toBeTruthy();
    expect(getByText('Animo!')).toBeTruthy();
  });
});
