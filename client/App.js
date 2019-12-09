import React, { Component } from 'react';
import io from "socket.io-client";
import { StyleSheet, Text, View } from 'react-native';
import { YellowBox } from 'react-native';
import { URL } from './utils/constants'
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { activateKeepAwake } from 'expo-keep-awake';
const fetch = require('node-fetch');

export default class App extends Component {
  state = {
    stats: null,
    powerState: null,
    totalMem: null,
    osVersion: null,
    status: null,
    socket: null,
    isScraping: false
  }

  batteryState = {
    [Battery.BatteryState.UNKNOWN]: "Unknown",
    [Battery.BatteryState.UNPLUGGED]: "Unplugged",
    [Battery.BatteryState.CHARGING]: "Charging",
    [Battery.BatteryState.FULL]: "Full"
  }

  getBatteryInfo = async () => {
    let powerState = await Battery.getPowerStateAsync();
    powerState.batteryState = this.batteryState[powerState.batteryState]
    let totalMem = Device.totalMemory;
    let osVersion = Device.osVersion;
    this.setState({
      powerState: powerState,
      totalMem: totalMem,
      osVersion: osVersion
    });
  }

  displayBatteryInfo = () => {
    if (this.state.powerState) {
      return (
        <View>
          <Text>Current Battery Level: {this.state.powerState.batteryLevel}</Text>
          <Text>Current Battery State: {this.state.powerState.batteryState}</Text>
          <Text>Low Power Mode: {JSON.stringify(this.state.powerState.lowPowerMode)}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  _subscribe = () => {
    this._subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      console.log("Battery changed");
      let powerState = this.state.powerState;
      powerState.batteryLevel = batteryLevel
      this.setState({
        powerState: powerState
      });
      if (this.state.socket != null) {
        this.state.socket.emit("update_battery", {
          powerState: powerState
        })
      }
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  async componentDidMount() {
    activateKeepAwake();
    YellowBox.ignoreWarnings([
      'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
    ]);
    this.setState({ status: "Waiting for job" })

    const socket = io.connect(URL, {transports: ['websocket']});
    this.setState({
      socket: socket
    })

    await this.getBatteryInfo();
    powerState = this.state.powerState;
    powerState.batteryState = this.batteryState[powerState.batteryState]
    socket.emit("client_connect", {
      powerState: powerState,
      totalMem: this.state.totalMem / Math.pow(1, 9) // Convert from bytes to GB
    });

    socket.on("scrape", async (data) => {
      this.setState({
        status: `Scraping url ${data.url}`,
        isScraping: true
      });

      // Send request through CORS proxy first to avoid access error
      const proxyurl = "https://cors-anywhere.herokuapp.com/";
      const url = "https://" + data.url;

      fetch(proxyurl + data.url, {  // https://cors-anywhere.herokuapp.com/https://example.com
        headers: { 'Origin': URL },
      })
        .then(response => response.text())
        .then(contents => {
          this.setState({ status: `Finished scraping ${data.url}` });
          powerState = this.state.powerState;
          powerState.batteryState = this.batteryState[powerState.batteryState]
          socket.emit("return_result", {
            result: contents,
            user_id: data.user_id,
            powerState: powerState,
            totalMem: this.state.totalMem / Math.pow(1, 9) // Convert from bytes to GB
          })
        })
        .catch(() => {
          let error = "Can’t access " + url + " response. Blocked by browser?"
          this.setState({ status: `Blocked by browser` });
          socket.emit("return_result", {
            result: error,
            user_id: data.user_id,
            powerState: {},
            totalMem: 0
          })
        })
      
        let powerState = await Battery.getPowerStateAsync();
        powerState.batteryState = this.batteryState[powerState.batteryState]
        console.log(powerState);
        this.setState({
          powerState: powerState,
          isScraping: false
        })
        socket.emit("update_battery", {
          powerState: powerState
        })
    });

    this._subscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
    this.state.socket.disconnect();
  }

  render() {
    let isScraping;
    if (this.state.isScraping === null || this.state.isScraping === false) {
      isScraping = false
    } else {
      isScraping = true
    }
    return (
      <View style={isScraping === false ? styles.container : styles.containerGreen}>
        <View>
          <Text style={styles.text}>Connected as client for scraper</Text>
          <this.displayBatteryInfo></this.displayBatteryInfo>
          <Text>Total Memory: {this.state.totalMem}</Text>
          <Text>OS Version: {this.state.osVersion}</Text>
          <Text>Status: {this.state.status}</Text>
          <Text>Scraping: {isScraping === false ? 'false' : 'true'}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerGreen: {
    flex: 1,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 25
  },
  status: {}
});
