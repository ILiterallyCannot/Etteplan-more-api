class MyComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        isLoaded: false,
        stations: [],
        value: '',
        id: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event){
        
        this.setState({value: event.target.value,id: event.target.id});
    }

    handleSubmit(event) {
        var getId = this.state.value;
        console.log("This is bullshite");
        console.log(getId);
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
                isLoaded: true,
            })
            
        )
          
        .catch(error => this.setState({ error, isLoaded: false }));
    }
  
    render() {
      const { error, isLoaded, stations } = this.state;
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        return (
            <form id="form" onSubmit={this.handleSubmit}>
                <input type="text" id="stationList" list="station-list" name="stations"  onChange={this.handleChange}/>
                <datalist id="station-list">
                    <select id="selectStation" value={this.state.value} id={this.state.id}  >
                    {stations.map(station => (
                    <option key={station.stationName} id={station.stationShortCode}>
                        {station.stationName}
                    </option>
                    
                    ))}
                    </select>
                </datalist>
                <input type="submit" id="btn" value="submit"/>
            </form>
          
        );
      }
    }
  }
ReactDOM.render(
    <MyComponent />,
    document.getElementById('main')
);


