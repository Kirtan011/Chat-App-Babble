import "./App.css";
import { Route, Switch } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/video.mp4" type="video/mp4" />
      </video>

      <div className="content">
        <Switch>
          <Route path="/" component={Homepage} exact />
          <Route path="/chats" component={Chatpage} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
