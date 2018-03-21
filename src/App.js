import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
} from 'reactstrap';
import './App.css';
import styled from "styled-components";

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const cards = ['!B', '!R'].concat(...ranks.map(rank => suits.map(suit => rank + suit)));
const UNKNOWN = 0, IN_HAND = 1, OUT_OF_HAND = 2;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { cards: new Map(cards.map(card => [card, UNKNOWN])), cardsInHand: 7 };
  }

  render() {
    return (
      <div className="App">
        <Container>
          <Row>
            <Col>
              <HandDisplay cards={this.state.cards} cardsInHand={this.state.cardsInHand}/>
            </Col>
          </Row>
          <Row>
            <Col>
              <HandSelector cards={this.state.cards} cardsInHand={this.state.cardsInHand} clickCard={card => this.clickCard(card)}/>
              <HandSizeSelector cardsInHand={this.state.cardsInHand} add={amount => this.addCardsInHand(amount)}/>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  clickCard(card) {
    var newCards = new Map(this.state.cards);
    newCards.set(card, (newCards.get(card) + 1) % 3);

    const inHand = new Array(...newCards.entries())
      .filter(entry => entry[1] === IN_HAND)
      .map(entry => entry[0]);

    var newState = {cards: newCards};

    switch (this.state.cards.get(card)) {
      case IN_HAND:
        newState.cardsInHand = this.state.cardsInHand - 1;
        break;
      case UNKNOWN:
        if (inHand.length > this.state.cardsInHand) {
          newState.cardsInHand = inHand.length;
        }
        break;
      default:
    }

    this.setState(newState)
  }

  addCardsInHand(amount) {
    const inHand = new Array(...this.state.cards.entries())
      .filter(entry => entry[1] === IN_HAND)
      .map(entry => entry[0]);

    const newAmount = Math.max(this.state.cardsInHand + amount, inHand.length);
    this.setState({ cardsInHand: newAmount })
  }
}

class HandDisplay extends Component {
  render() {
    const inHand = new Array(...this.props.cards.entries())
      .filter(entry => entry[1] === IN_HAND)
      .map(entry => entry[0]);
    return (
      <div>
        {inHand.map(card => <Card card={card} key={card}/>)}
        {[...Array(Math.max(this.props.cardsInHand - inHand.length, 0)).keys()].map(ix => <span key={ix}>?</span>)}
      </div>
    );
  }}

class Card extends Component {
  render() {
    return (
      <span>{this.props.card}</span>
    )
  }
}

const SelectorTable = styled.table.attrs({
  align: "center"
})`
  border-collapse: collapse;
`

const SelectorTr = styled.tr`
  padding: 0;
`

const SelectorTh = styled.th`
  padding-right: 0.5em;
`

class HandSelector extends Component {
  render () {
    return (
      <SelectorTable>
        <tbody>
          {ranks.map(rank =>
            <SelectorTr key={rank}>
              <SelectorTh>{rank}</SelectorTh>
              {suits.map(suit =>
                <CardSelector
                  key={rank+suit}
                  card={rank+suit}
                  suit={suit}
                  clickCard={this.props.clickCard}
                  inHand={this.props.cards.get(rank+suit)}
                />
              )}
            </SelectorTr>
          )}
          <SelectorTr>
            <SelectorTh>!</SelectorTh>
            <CardSelector card="!B" suit="B" clickCard={this.props.clickCard} inHand={this.props.cards.get("!B")} />
            <CardSelector card="!R" suit="R" clickCard={this.props.clickCard} inHand={this.props.cards.get("!R")} />
          </SelectorTr>
        </tbody>
      </SelectorTable>
    );
  }
}

const SelectSquare = styled.td`
  display: inline-block;
  min-width: ${props => props.size};
  min-height: ${props => props.size};
  background-color: ${props => {
    switch (props.inHand) {
      case IN_HAND: return "green";
      case OUT_OF_HAND: return "red";
      default: return "lightgrey";
    }
  }};
  border: 1px solid grey;
`

class CardSelector extends Component {
  render () {
    return (
      <SelectSquare
        size="1.5em"
        onClick={() => this.props.clickCard(this.props.card)}
        inHand={this.props.inHand}
      >{this.props.suit}</SelectSquare>
    )
  }
}

class HandSizeSelector extends Component {
  render () {
    return (
      <div>
        <button onClick={() => this.props.add(-1)}>-</button>
        <span>{this.props.cardsInHand}</span>
        <button onClick={() => this.props.add(1)}>+</button>
      </div>
    )
  }
}

export default App;
