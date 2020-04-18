import React, {Component} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PlayingCard from "./PlayingCard/Hand/PlayingCard/PlayingCard";
var Uuid = require("uuid-lib");

class PlayingHand extends Component {
  constructor(props){
    super(props);
    this.state = {
      cards: this.props.cards
    }
  }

  render() {
    return (
        <div style={{display: "inline-block"}}>
          {
          this.props.cards.map((card) => {
            return <div key={Uuid.create()} style={{float: 'left', minWidth: '75px'}}>
              <PlayingCard card={card} height={100} onClick={this.props.onClick ? this.props.onClick.bind(this) : ()=>{}}/>
            </div>
          })
          }
        </div>
    )
  }
}

export { PlayingHand }
