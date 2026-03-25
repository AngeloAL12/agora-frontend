import { StyleSheet, View } from 'react-native';
// Importamos las nuevas creaciones de componentes para probarlos aquí)
import { Badge } from '../Components/Badge';
import { Button } from '../Components/Button';
import { Input } from '../Components/Input';

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Probando el Input */}
      <Input placeholder="Buscar clubes..." />

      {/* Probando los Badges */}
      <View style={styles.row}>
        <Badge label="Miembro" variant="member" />
        <Badge label="Unirse" variant="join" />
      </View>

      {/* Probando los Botones */}
      <Button
        title="Empezar (Primario)"
        onPress={() => console.log('Click!')}
      />
      <Button
        title="Continuar (Secundario)"
        variant="secondary"
        onPress={() => console.log('Click!')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5', // Fondito gris para que resalten
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 20,
  },
});
