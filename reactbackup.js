class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      stations: [],
      liveTrains: [],
      value: "",
      thisStationCode: "",
      arrivaltime: "300",
      departuretime: "0",
      arriving:"10",
      departing:"0"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getStationName = this.getStationName.bind(this);
    this.getArrivals = this.getArrivals.bind(this);
    this.getDepartures = this.getDepartures.bind(this);
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    let currentStation = this.state.stations.filter(
      station => station.stationName == this.state.value
    );
    this.setState({ thisStationCode: currentStation[0].stationShortCode });
    fetch("https://rata.digitraffic.fi/api/v1/live-trains/station/" + currentStation[0].stationShortCode +"?version=1&arrived_trains=0&arriving_trains="+this.state.arriving+"&departed_trains=0&departing_trains="+this.state.departing+"&minutes_before_departure="+this.state.departuretime+"&minutes_after_departure=0&minutes_before_arrival="+this.state.arrivaltime+"&minutes_after_arrival=0&include_nonstopping=false"
    )
      .then(res => res.json())
      .then(data =>
        this.setState({
          liveTrains: data
        })
      )
      .catch(error => this.setState({ error, isLoaded: false }));
    event.preventDefault();
    
  }

  componentDidMount() {
    this.fetchStations();
  }

  fetchStations() {
    fetch("https://rata.digitraffic.fi/api/v1/metadata/stations")
      .then(res => res.json())
      .then(data =>
        this.setState({
          stations: data,
          isLoaded: true
        })
      )
      .catch(error => this.setState({ error, isLoaded: false }));
  }
  getTrainType = (traincat, commID, trainnum) => {
    var thisTraintype = this.state.liveTrains.filter(
      train =>
        traincat == train.trainCategory &&
        commID == train.commuterLineID &&
        trainnum == train.trainNumber
    );
    //console.log(thisTraintype[0])
    for (var i = 0; i < thisTraintype.length; i++) {
      //console.log(thisTraintype[i].commuterLineID)
      //console.log(commID)
      //console.log(thisTraintype[i].trainNumber)
      //console.log(trainnum)
      if (
        thisTraintype[i].trainNumber == trainnum &&
        thisTraintype[i].commuterLineID == ""
      ) {
        return thisTraintype[i].trainType + thisTraintype[i].trainNumber;
      } else {
        return (
          thisTraintype[i].trainCategory +
          " train " +
          thisTraintype[i].commuterLineID
        );
      }
    }
  };
  getStationName = shortcode => {
    let newstation = this.state.stations.filter(
      station => station.stationShortCode == shortcode
    );
    return newstation[0].stationName;
  };
  getScheduledTime = (thisScheduledTime, traintype, trainnumber) => {
    var thisTrain = this.state.liveTrains.filter(
      train => trainnumber == train.trainNumber && traintype == train.trainType
    );
    //console.log(thisTrain[0])
    for (var i = 0; i < thisTrain[0].timeTableRows.length; i++) {
      if (thisTrain[0].timeTableRows[i].stationShortCode == thisScheduledTime) {
        //console.log(thisTrain[0].timeTableRows[i].scheduledTime)
        var date = new Date(thisTrain[0].timeTableRows[i].scheduledTime);
        date
        return date.toLocaleString("en-GB", { 
          timeZone: "Europe/Helsinki",
          //year: 'numeric',
          //month: 'short',
          //day: 'numeric',
          hour: "2-digit",
          minute: "numeric",
          //second: 'numeric',
          hour12: false
        });
      }
    }
  };
    getArrivals() {
       this.setState({
                arrivaltime: "300",
                departuretime: "0",
                arriving:"10",
                departing:"0"
        })
  }
  getDepartures(){
       this.setState({
                arrivaltime: "0",
                departuretime: "300",
                arriving:"0",
                departing:"10"
        })
  }
  render() {
    const { error, isLoaded, stations } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <form id="form" onSubmit={this.handleSubmit}>
            <input
              type="text"
              id="stationList"
              list="station-list"
              name="stations"
              onChange={this.handleChange}
            />
            <datalist id="station-list">
              <select id="selectStation" value={this.state.value}>
                {stations.map(station => (
                  <option
                    key={station.stationName}
                    value={station.stationName}
                    onChange={this.HandleChange}
                  >
                    {station.stationShortCode}
                  </option>
                ))}
              </select>
            </datalist>
            <input type="submit" id="btn" value="submit" /><br></br>
            <input type="submit" onClick={this.getArrivals} value="Arrivals"/><input type="submit" onClick={this.getDepartures} value="Departures"/>
          </form>
            
          <table>
            <tbody id="schedules">
              <tr>
                <th>Train</th>
                <th>Departure Station</th>
                <th>Arrival Station</th>
                <th>Time</th>
              </tr>
              {this.state.liveTrains.map(train => (
                <tr key={train.trainNumber}>
                  <td>
                    {this.getTrainType(
                      train.trainCategory,
                      train.commuterLineID,
                      train.trainNumber
                    )}
                  </td>
                  <td>
                    {this.getStationName(
                      train.timeTableRows[0].stationShortCode
                    )}
                  </td>
                  <td>
                    {this.getStationName(
                      train.timeTableRows[train.timeTableRows.length - 1]
                        .stationShortCode
                    )}
                  </td>
                  <td>
                    {this.getScheduledTime(
                      this.state.thisStationCode,
                      train.trainType,
                      train.trainNumber
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}
ReactDOM.render(<MyComponent />, document.getElementById("main"));
