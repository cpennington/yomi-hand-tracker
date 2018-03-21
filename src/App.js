import React, { Component } from 'react';
import Badge from 'reactstrap/lib/Badge';
import Button from 'reactstrap/lib/Button';
import Container from 'reactstrap/lib/Container';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import './App.css';
import styled from "styled-components";

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const cards = ['!\u2726', '!\u2727'].concat(...ranks.map(rank => suits.map(suit => rank + suit)));
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
            <Col className="justify-content-center">
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

const Hand = styled.div`
  font-size: 200%;
  max-width: 7em;
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
        {elements.slice(0, 6)}
        <br/>
        {elements.slice(6, 12)}
      </Hand>
    );
  }}

const CardOutline = styled.span`
  border: 2px solid grey;
  border-radius: 5px;
  padding: 3px;
  margin: 1px;

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
    padding-right: 0.5em;
  }
`

class HandSelector extends Component {
  render () {
    return (
      <div>
        <div>Known Cards</div>
        <SelectorTable>
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

class HandSizeSelector extends Component {
  render () {
    return (
      <div>
        <div>Hand Size</div>
        <Button size="sm" onClick={() => this.props.add(-1)}>-</Button>
        <Badge color="info" pill>{this.props.cardsInHand}</Badge>
        <Button size="sm" onClick={() => this.props.add(1)}>+</Button>
      </div>
    )
  }
}

export default App;
