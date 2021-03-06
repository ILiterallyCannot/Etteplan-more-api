class TrainSchedule extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
     var schedules = this.refs.Schedules
    const traindata = this.props.traindata;
    //dataSorter = this.datasorter;
    return (
      <table id="Schedules" ref="Schedules">
        <thead className="tablehead">
          <tr>
            <th>Train</th>
            <th>Departure Station</th>
            <th>Arrival Station</th>
            <th id="sortthis" onClick={e => this.props.onSort()}>Time (click to sort by time)</th>
          </tr>
        </thead>
        <tbody>
          {traindata.map(train => (
      <tr key={train.trainNumber}>
            <td>
              {this.props.getType(
                train.trainCategory,
                train.commuterLineID,
                train.trainNumber
              )}
            </td>
            <td>
              {this.props.getName(
                train.timeTableRows[0].stationShortCode
              )}
            </td>
            <td>
              {this.props.getName(
                train.timeTableRows[train.timeTableRows.length - 1]
                  .stationShortCode
              )}
            </td>
            <td>
              {this.props.getTime(
                this.props.stationcode,
                train.trainType,
                train.trainNumber,
                traindata
              )}
            </td>
          </tr>
          ))}
    </tbody>
      </table>
    )
  }
}

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      isUpdated:false,
      stations: [],
      liveTrains: [],
      thisVersionNumber: 0,
      sort: {
      column: null,
      },
      value: "",
      thisStationCode: "",
      arrivaltime: "180",
      departuretime: "0",
      arriving: "10",
      departing: "0",
      arrivals: "active",
      departures: "notactive"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getStationName = this.getStationName.bind(this);
    this.getArrivals = this.getArrivals.bind(this);
    this.getDepartures = this.getDepartures.bind(this);
    this.onSort = this.onSort.bind(this);
    this.getTrainNumber = this.getTrainNumber.bind(this);
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }
  
  handleSubmit(event) {
    let currentStation = this.state.stations.filter(
      station => station.stationName == this.state.value
    );
    this.setState({ thisStationCode: currentStation[0].stationShortCode, thisVersionNumber: currentStation[0].version });
    fetch("https://rata.digitraffic.fi/api/v1/live-trains/station/" + currentStation[0].stationShortCode + "?version=1&arrived_trains=0&arriving_trains=" + this.state.arriving + "&departed_trains=0&departing_trains=" + this.state.departing + "&minutes_before_departure=" + this.state.departuretime + "&minutes_after_departure=0&minutes_before_arrival=" + this.state.arrivaltime + "&minutes_after_arrival=0&include_nonstopping=false"
    )
      .then(res => res.json())
      .then(data =>
        this.setState({
          liveTrains: data,
          isUpdated: false
        })
      )
      
      .catch(error => this.setState({ error, isLoaded: false }));
      console.log(this.state.isUpdated)
    event.preventDefault();
    
  }

  componentDidMount() {
    this.fetchStations();
  }
  
  componentDidUpdate(a,b) {
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
  getTrainNumber = (versionnum) => {
    var thisTraintype = this.state.liveTrains.filter(
      train =>
        versionnum == train.version
    );
    for (var i = 0; i < thisTraintype.length; i++) {
      if (
        thisTraintype[i].version == versionnum
      ) {
        return thisTraintype[i].trainNumber;
      } 
    }
  };
  getStationName = shortcode => {
    let newstation = this.state.stations.filter(
      station => station.stationShortCode == shortcode
    );
    return newstation[0].stationName;
  };
  getScheduledTime = (thisCode, traintype, trainnumber, trainData) => {
    const sortedliveTrains = []
    var thisTrain = trainData.filter(
      train => trainnumber == train.trainNumber && traintype == train.trainType
    );
    //console.log(thisTrain,thisCode,traintype,trainnumber)
    for (var i = 0; i < thisTrain[0].timeTableRows.length; i++) {
      //console.log(thisTrain[i].timeTableRows.length)
      if (thisTrain[0].timeTableRows[i].stationShortCode == thisCode) {
        //console.log(thisTrain[0].timeTableRows[i].scheduledTime)
        var date = new Date(thisTrain[0].timeTableRows[i].scheduledTime);
        var result = date.toLocaleString("en-GB", {
          timeZone: "Europe/Helsinki",
          //year: 'numeric',
          //month: 'short',
          //day: 'numeric',
          hour: "2-digit",
          minute: "numeric",
          //second: 'numeric',
          hour12: false
        });
          
          sortedliveTrains.push({result})
          
          //console.log(sortedliveTrains[0].result)
          //console.log(sortedliveTrains)
          return sortedliveTrains[0].result
        
        
      }
    }
 
  };
  getArrivals() {
    this.setState({
      arrivaltime: "180",
      departuretime: "0",
      arriving: "10",
      departing: "0",
      arrivals: "active",
      departures: "notactive"
    })
  }
  getDepartures() {
    this.setState({
      arrivaltime: "0",
      departuretime: "180",
      arriving: "0",
      departing: "10",
      arrivals: "notactive",
      departures: "active"
    })
  }
  onSort = (column, versionnum) => (e) => { //var date = new Date(thisTrain[0].timeTableRows[i].scheduledTime);
    console.log("Sort function called")
    const direction = 'asc'
    const sortedData = this.state.liveTrains.sort((a, b) => {
      var sortA = a.timeTableRows.filter( train => 
        versionnum == train.stationShortCode
      );
      var sortB = b.timeTableRows.filter( train => 
        versionnum == train.stationShortCode
      );
      if (column === 'sortTrains') {
        const nameA = new Date(sortA[0].scheduledTime).getTime()
        const nameB = new Date(sortB[0].scheduledTime).getTime()
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      }
    });
    
    
    this.setState({
      data: sortedData,
      sort: {
        column,
        direction,
      },
      isUpdated:true
    });
  };
  render() {
    const { error, isLoaded, stations } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <header>
                <h1>Simple VR API with react</h1>
          </header>
          <form id="form" onSubmit={this.handleSubmit}>
          <input
              type="text"
              id="stationList"
              list="station-list"
              name="stations"
              placeholder="Enter a station, for example 'Helsinki'"
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
            <input type="submit" id="btnsubmit" value="Submit" /><br></br>
            <input type="submit" className={this.state.arrivals} id="btn" onClick={this.getArrivals}  value="Arrivals" /><input id="btn" className={this.state.departures} type="submit" onClick={this.getDepartures} value="Departures" />
          </form>

          <TrainSchedule onFilteredChange={this.onSort} traindata={this.state.liveTrains} stationcode={this.state.thisStationCode} getTime={this.getScheduledTime} getName={this.getStationName} getType={this.getTrainType} onSort={this.onSort('sortTrains',this.state.thisStationCode)}/>

        </div>
      );
    }
  }
}
ReactDOM.render(<MyComponent />, document.getElementById("main"));
