import React, { Component } from 'react';
import io from "socket.io-client";
import { StyleSheet, Text, View } from 'react-native';
import { YellowBox } from 'react-native';
import { URL } from './utils/constants'
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
const fetch = require('node-fetch');

export default class App extends Component {
  state = {
    powerState: null,
    totalMem: null,
    osVersion: null,
  }

  batteryState = {
    [Battery.BatteryState.UNKNOWN]: "Unknown",
    [Battery.BatteryState.UNPLUGGED]: "Unplugged",
    [Battery.BatteryState.PLUGGED]: "Charging",
    [Battery.BatteryState.FULL]: "Full"
  }

  async componentDidMount() {
    let powerState = await Battery.getPowerStateAsync();
    let totalMem = Device.totalMemory;
    let osVersion = Device.osVersion;
    this.setState({
      powerState: powerState,
      totalMem: totalMem,
      osVersion: osVersion
    });
  }

  displayBatteryInfo = () => {
    if(this.state.powerState) {
      return(
        <View>
          <Text>Current Battery Level: {this.state.powerState.batteryLevel}</Text>
          <Text>Current Battery State: {this.batteryState[this.state.powerState.batteryState]}</Text>
          <Text>Low Power Mode: {JSON.stringify(this.state.powerState.lowPowerMode)}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  componentWillMount() {
    YellowBox.ignoreWarnings([
        'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
    ]);

    const socket = io.connect(URL);
    socket.emit("client_connect");

    socket.on("scrape", (data) => {
      console.log(`Scraping url ${data.url}`);

      // Send request through CORS proxy first to avoid access error
      const proxyurl = "https://cors-anywhere.herokuapp.com/";
      const url = "https://" + data.url;

      fetch(proxyurl + data.url, {  // https://cors-anywhere.herokuapp.com/https://example.com
        headers: { 'Origin': URL },
      })
      .then(response => response.text())
      .then(contents => {
        console.log("Returning result to user");
        powerState = this.state.powerState;
        powerState.batteryState = this.batteryState[powerState.batteryState]
        socket.emit("return_result", {
          result: contents,
          user_id: data.user_id,
          powerState: powerState
        })
      })
      .catch(() => {
        let error = "Can’t access " + url + " response. Blocked by browser?"
        socket.emit("return_result", {
          result: error,
          user_id: data.user_id,
          powerState: {}
        })
      })
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.text}>Connected as client for scraper</Text>
          <this.displayBatteryInfo></this.displayBatteryInfo>
          <Text>Total Memory: {this.state.totalMem}</Text>
          <Text>OS Version: {this.state.osVersion}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 25
  }
});
