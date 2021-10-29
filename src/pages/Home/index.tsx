/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {ScreenWrapper} from '../../components/ScreenWrapper';
import {PrimaryButton} from '../../components/PrimaryButton';
import {InfoModal} from '../../components/InfoModal';
import {CityCard} from '../../components/CityCard';
import {Screen} from '../../enums/screens';
import {CityWeather} from '../../types/ICity';
import {useCities} from '../../providers/CitiesProvider';
import {colors, fontSize, spacing} from '../../config/styles';
import {updateAllCities} from '../../utils/city';
import NoCities from '../../assets/no_cities.svg';

export const Home: React.FC<{navigation: any}> = ({navigation}) => {
  const {width} = Dimensions.get('window');
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(false);
  const {cities, setSelectedCity, lastUpdate, setCities, handleSetLastUpdate} =
    useCities();

  useEffect(() => {
    async function loadCities(): Promise<void> {
      await handleUpdateAllCities();
    }
    loadCities();
  }, []);

  const handleSelectCity = (city: CityWeather): void => {
    setSelectedCity(city);
    navigation.navigate(Screen.CITY_DETAILS, {cidade: city.cidade});
  };

  const handleUpdateAllCities = async (): Promise<void> => {
    try {
      setLoading(true);
      const updatedCities = await updateAllCities();
      setCities(updatedCities);
      handleSetLastUpdate(moment().format('DD/MM/YYYY hh:mm'));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setModalError(true);
    }
  };

  const CitiesContent = (): JSX.Element => (
    <View>
      <Text style={styles.details}>
        {loading ? 'Atualizando' : `Ultima atualização: ${lastUpdate}`}
      </Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={cities}
        keyExtractor={(item: CityWeather) => item.id}
        renderItem={({item}) => (
          <CityCard city={item} onPress={() => handleSelectCity(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleUpdateAllCities} />
        }
      />
    </View>
  );

  const NoCitiesContent = (): JSX.Element => (
    <View style={styles.noCities}>
      <NoCities width={width * 0.8} height={width / 2} fill={colors.primary} />
      <Text style={styles.noCitiesText}>
        Adicione uma cidade para saber como está o clima 😉
      </Text>
    </View>
  );

  const ModalError = (): JSX.Element => (
    <InfoModal
      visible={modalError}
      title={'Ops!'}
      type="error"
      message={
        'Estamos com problemas para atualizar os dados das cidades salvas. Tente novamente mais tarde'
      }
      close={(): void => setModalError(false)}
    />
  );

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        {cities.length > 0 ? <CitiesContent /> : <NoCitiesContent />}
      </View>
      <PrimaryButton
        title="Adicionar Cidade"
        onPress={(): void => {
          navigation.navigate(Screen.ADD_CITY);
        }}
      />
      <ModalError />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, marginBottom: 32},
  details: {
    fontSize: fontSize.text,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.small,
  },
  list: {
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    paddingRight: spacing.small,
  },
  loading: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  noCities: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCitiesText: {
    fontSize: fontSize.button,
    color: colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '70%',
  },
});
