import React, {useState, useEffect, useRef} from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

//firebase
import database from '@react-native-firebase/database';

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';

import {Dimensions} from 'react-native';

const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get('window').width;

function HomeScreen() {
  const [kelembapan, setKelembapan] = useState<number>(0);
  const [labels, setLabels] = useState<string[]>([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
  ]);
  const [sensorData, setSensorData] = useState<number[]>([
    40, 45, 66, 70, 89, 10,
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const month = monthNames[monthIndex];

  const [suhu, setSuhu] = React.useState<any>(0);
  const referenceSuhu = database().ref('/sensor/suhus /');
  referenceSuhu.on('value', snapshot => {
    console.log('ValueSuhu :', snapshot.val());
    setSuhu(snapshot.val());
  });

  useEffect(() => {
    const reference = database().ref('/sensor/kelembapan/');
    const onValueChange = reference.on('value', snapshot => {
      setKelembapan(snapshot.val());
    });

    return () => reference.off('value', onValueChange);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLabels(prevLabels => {
        const newLabels = [
          ...prevLabels,
          (parseInt(prevLabels[prevLabels.length - 1]) + 1).toString(),
        ];
        return newLabels.length > 6 ? newLabels.slice(1) : newLabels;
      });

      setSensorData(prevSensorData => {
        const newSensorData = [
          ...prevSensorData,
          kelembapan - 20 > 100 ? 0 : kelembapan - 20,
        ];
        return newSensorData.length > 6
          ? newSensorData.slice(1)
          : newSensorData;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [kelembapan]);

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const data = {
    labels: labels,
    datasets: [
      {
        data: sensorData,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Kelembapan'],
  };

  // Function to get time of day
  const getTimeOfDay = (hour: number) => {
    if (hour >= 5 && hour < 12) {
      return 'Pagi';
    } else if (hour >= 12 && hour < 18) {
      return 'Siang';
    } else if (hour >= 18 && hour < 21) {
      return 'Sore';
    } else {
      return 'Malam';
    }
  };

  // const [icon, setIcon] = useState<any>();

  // Function to get temperature category
  const getTemperatureCategory = (temp: number) => {
    if (temp >= 30) {
      // setIcon('☀️');
      return 'Panas';
    } else if (temp >= 20 && temp < 30) {
      // setIcon('🌤️');
      return 'Hangat';
    } else {
      // setIcon('🌨️');
      return 'Dingin';
    }
  };

  const timeOfDay = getTimeOfDay(hours);
  const temperatureCategory = getTemperatureCategory(suhu);

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          margin: 20,
          marginTop: 80,
          borderRadius: 20,
          backgroundColor: '#69c9ff',
          padding: 5,
          paddingBottom: 20,
          borderColor: 'black',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '80%',
          }}>
          <Image
            source={require('../asset/sun.png')}
            style={{width: 90, height: 90}}
          />
          <Text style={{color: '#2d363b', fontSize: 60, fontWeight: 'bold'}}>
            {suhu == 'nan' ? 0 : suhu}°
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}>
          <Text style={{fontSize: 30, fontWeight: 'bold', color: '#2d363b'}}>
            {temperatureCategory}
          </Text>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: '#2d363b'}}>
            {date} {month}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}>
          <Text style={{fontSize: 20, color: '#2d363b'}}>{timeOfDay}</Text>
          <Text style={{fontSize: 30, fontWeight: 'bold', color: '#2d363b'}}>
            {year}
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            color: '#302c2c',
            fontSize: 20,
            fontWeight: 'bold',
            paddingHorizontal: 30,
          }}>
          Update Data Realtime
        </Text>
      </View>
      <View
        style={{
          marginTop: 30,
          borderWidth: 1,
          borderColor: 'black',
          margin: 20,
          borderRadius: 20,
          overflow: 'hidden',
        }}>
        <LineChart
          data={data}
          width={screenWidth}
          height={320}
          chartConfig={chartConfig}
        />
      </View>
    </View>
  );
}

function Temperature() {
  const [kelembapan, setKelembapan] = React.useState<any>(0);
  const [suhu, setSuhu] = React.useState<any>(0);

  const referenceSuhu = database().ref('/sensor/suhus /');
  const reference = database().ref('/sensor/kelembapan/');

  referenceSuhu.on('value', snapshot => {
    console.log('ValueSuhu :', snapshot.val());
    setSuhu(snapshot.val());
  });
  reference.on('value', snapshot => {
    console.log('ValueKelem :', snapshot.val());
    setKelembapan(snapshot.val());
  });

  const data = {
    labels: ['Kelembapan', 'Suhu'], // optional
    data: [
      kelembapan > 120 ? 0 : kelembapan / 120,
      suhu == 'nan' ? 0 : suhu / 100,
    ],
  };
  const chartConfig = {
    backgroundGradientFrom: '#6944e3',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#6944e3',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(100, 125, 227, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          flexDirection: 'column',
        }}>
        <ProgressChart
          data={data}
          width={screenWidth}
          height={300}
          strokeWidth={30}
          radius={50}
          chartConfig={chartConfig}
          hideLegend={true}
          style={{
            // flex : 1,
            flexDirection: 'column',
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      <Text
        style={{
          color: '#302c2c',
          fontWeight: 'bold',
          fontSize: 30,
        }}>
        Kelembapan :
        <Text
          style={{
            color: 'purple',
          }}>
          {data.data[0] * 100}%
        </Text>
      </Text>
      <Text
        style={{
          color: '#302c2c',
          fontWeight: 'bold',
          fontSize: 30,
        }}>
        Suhu :
        <Text
          style={{
            color: 'red',
          }}>
          {data.data[1] * 100} %
        </Text>
      </Text>
    </View>
  );
}
// function SettingsScreen() {
//   return (
//     <View style={{flex: 1, backgroundColor: '#2f472e'}}>
//       <View style={{marginTop: 70, paddingHorizontal: 20}}>
//         <TouchableOpacity
//           style={{
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           <Text style={{color: '#fff', fontSize: 33}}>About This App</Text>
//           <Text
//             style={{
//               color: '#fff',
//               fontSize: 20,
//               textAlign: 'center',
//               marginTop: 20,
//               padding : 10
//             }}>
//             Aplikasi monitoring kelembapan tanah ini adalah solusi inovatif bagi
//             Anda yang ingin mengoptimalkan hasil panen dan menghemat penggunaan
//             air. Aplikasi ini bekerja dengan sensor yang ditanam di tanah, yang
//             akan terus mengukur kadar air secara real-time.
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

function RootTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Smart Farming"
        component={HomeScreen}
        options={{
          headerTransparent: true,
          title: 'Smart Farming',
          headerTitleStyle: {
            color: 'black',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Temperature"
        component={Temperature}
        options={{
          headerTransparent: true,
          title: 'Temperature',
          headerTitleStyle: {
            // color: 'white',
            fontWeight: 'bold',
          },
        }}
      />
      {/* <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTransparent: true,
          title: 'About',
          headerTitleStyle: {
            color: 'white',
            fontWeight: 'bold',
          },
        }}
      /> */}
    </Tab.Navigator>
  );
}

export default RootTabs;
