import { render } from '@testing-library/react-native';
import TabsHomeScreen from '../../app/tabs/index';

describe('Index Screen', () => {
  it('renderiza el texto correctamente', () => {
    const { getByText } = render(<TabsHomeScreen />);

    expect(getByText('A chambear con Agora')).toBeTruthy();
    expect(getByText('Ánimo!')).toBeTruthy();
  });
});
