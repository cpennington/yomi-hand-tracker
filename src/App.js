import React, { Component } from 'react';
import Button from 'reactstrap/lib/Button';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import Navbar from 'reactstrap/lib/Navbar';
import NavbarBrand from 'reactstrap/lib/NavbarBrand';
import './App.css';
import styled from "styled-components";

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const cards = ['!\u2726', '!\u2727'].concat(...ranks.map(rank => suits.map(suit => rank + suit)));
const UNKNOWN = 0, IN_HAND = 1, OUT_OF_HAND = 2;

const AppContainer = styled.div.attrs({
  className: "App"
})`
`

const HandTracker = styled(Container)`
`

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { cards: new Map(cards.map(card => [card, UNKNOWN])), cardsInHand: 7 };
  }

  render() {
    return (
      <AppContainer>
        <Navbar><NavbarBrand className="mx-auto">Yomi Hand Tracker</NavbarBrand></Navbar>
        <HandTracker className="d-flex h-100">
          <Row className="align-items-center">
            <Col xs="12" lg="auto">
              <HandDisplay cards={this.state.cards} cardsInHand={this.state.cardsInHand}/>
            </Col>
            <Col xs="12" lg="auto">
              <HandSelector cards={this.state.cards} cardsInHand={this.state.cardsInHand} clickCard={card => this.clickCard(card)}/>
            </Col>
            <Col xs="12" lg="auto">
              <HandSizeSelector cardsInHand={this.state.cardsInHand} add={amount => this.addCardsInHand(amount)}/>
            </Col>
          </Row>
        </HandTracker>
      </AppContainer>
    );
  }

  clickCard(card) {
    var newCards = new Map(this.state.cards);
    newCards.set(card, (newCards.get(card) + 1) % 3);

    const inHand = new Array(...newCards.entries())
      .filter(entry => entry[1] === IN_HAND)
      .map(entry => entry[0]);

    if (inHand.length > 12) {
      return;
    }

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

    const newAmount = Math.min(Math.max(this.state.cardsInHand + amount, inHand.length), 12);
    this.setState({ cardsInHand: newAmount })
  }
}

const Hand = styled.div.attrs({
  align: "center"
})`
  .handrow {
    font-size: 200%;
    width: 8em;
    height: 1.5em;
    border-radius: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
  margin: 0 auto;
`

class HandDisplay extends Component {
  render() {
    const inHand = new Array(...this.props.cards.entries())
      .filter(entry => entry[1] === IN_HAND)
      .map(entry => entry[0]);

    const elements = inHand.map(card => <Card card={card} key={card} />).concat(
      [...Array(Math.max(this.props.cardsInHand - inHand.length, 0)).keys()].map(ix => <CardBack key={ix} />)
    );
    return (
      <Hand>
        <div>Current Hand</div>
        <div className='handrow bg-secondary'>{elements.slice(0, 6)}</div>
        <div className='handrow bg-secondary'>{elements.slice(6, 12)}</div>
      </Hand>
    );
  }}

const CardOutline = styled.span`
  border: 2px solid grey;
  border-radius: 5px;
  padding: 0.2rem;
  margin: 0.1rem;
  background: white;

  sub.red {
    color: red;
  }
`

class Card extends Component {
  render() {
    const color = {
      "\u2660": "black",
      "\u2665": "red",
      "\u2666": "red",
      "\u2663": "black",
      "\u2726": "black",
      "\u2727": "red",
    }[this.props.card[1]];

    return (
      <CardOutline>
        <sup className="rank">{this.props.card[0]}</sup>
        <sub className={`suit ${color}`}>{this.props.card[1]}</sub>
      </CardOutline>
    )
  }
}

class CardBack extends Component {
  render() {
    return (
      <CardOutline>{String.fromCodePoint(0x1F7CD)}</CardOutline>
    )
  }
}

const SelectorTable = styled.table.attrs({
  align: "center"
})`
  border-collapse: collapse;
  tr {
    padding: 0;
  }
  th {
    padding: .25rem .5rem;
    font-size: .875rem;
    line-height: 1.5;
  }
`

class HandSelector extends Component {
  render () {
    return (
      <div>
        <div>Known Cards</div>
        <SelectorTable className="d-xs-inline d-lg-none">
          <tbody>
            {ranks.map(rank =>
              <tr key={rank}>
                <th>{rank}</th>
                {suits.map(suit =>
                  <CardSelector
                    key={rank+suit}
                    card={rank+suit}
                    suit={suit}
                    clickCard={this.props.clickCard}
                    inHand={this.props.cards.get(rank+suit)}
                  />
                )}
              </tr>
            )}
            <tr>
              <th>!</th>
              <CardSelector card={"!\u2727"} suit={"\u2727"} clickCard={this.props.clickCard} inHand={this.props.cards.get("!\u2727")} />
              <CardSelector card={"!\u2726"} suit={"\u2726"} clickCard={this.props.clickCard} inHand={this.props.cards.get("!\u2726")} />
            </tr>
          </tbody>
        </SelectorTable>
        <SelectorTable className="d-none d-lg-inline">
          <thead>
            <tr>
              {ranks.map(rank =>
                <th>{rank}</th>
              )}
              <th>!</th>
            </tr>
          </thead>
          <tbody>
            {suits.map(suit =>
              <tr key={suit}>
                {ranks.map(rank =>
                  <CardSelector
                    key={rank + suit}
                    card={rank + suit}
                    suit={suit}
                    clickCard={this.props.clickCard}
                    inHand={this.props.cards.get(rank + suit)}
                  />
                )}
                {suit === "\u2660" ? <CardSelector card={"!\u2727"} suit={"\u2727"} clickCard={this.props.clickCard} inHand={this.props.cards.get("!\u2727")} /> : null}
                {suit === "\u2665" ? <CardSelector card={"!\u2726"} suit={"\u2726"} clickCard={this.props.clickCard} inHand={this.props.cards.get("!\u2726")} /> : null}
              </tr>
            )}
          </tbody>
        </SelectorTable>
      </div>
    );
  }
}

const CardButton = styled(Button)`
  width: 2em;
`

class CardSelector extends Component {
  render () {
    return (
      <td>
        <CardButton
          outline={this.props.inHand === OUT_OF_HAND}
          color={this.props.inHand === IN_HAND ? "success" : this.props.inHand === OUT_OF_HAND ? "danger" : "secondary"}
          onClick={() => this.props.clickCard(this.props.card)}
          size="sm"
        >
          {this.props.suit}
        </CardButton>
      </td>
    )
  }
}

const HandSizeContainer = styled.div`
  .size {
    width: 2em;
    margin-left: .5em;
    margin-right: .5em;
    display: inline-block;
    padding: .25rem .5rem;
    font-size: .875rem;
    line-height: 1.5;
    border-radius: .2rem;
  }
`

class HandSizeSelector extends Component {
  render () {
    return (
      <HandSizeContainer>
        <div>Hand Size</div>
        <Button size="sm" onClick={() => this.props.add(-1)}>-</Button>
        <span className='bg-warning size'>{this.props.cardsInHand}</span>
        <Button size="sm" onClick={() => this.props.add(1)}>+</Button>
      </HandSizeContainer>
    )
  }
}

export default App;
