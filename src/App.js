import React, { Component } from 'react';
import {
  Badge,
  Button,
  Container,
  Row,
  Col,
} from 'reactstrap';
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
    return (
      <Hand>
        {inHand.map(card => <Card card={card} key={card}/>)}
        {[...Array(Math.max(this.props.cardsInHand - inHand.length, 0)).keys()].map(ix => <CardBack key={ix}/>)}
      </Hand>
    );
  }}

const CardOutline = styled.span`
  border: 2px solid grey;
  border-radius: 5px;
  padding-left: .05rem;
  margin: 1px;
  width: 1em;
  display: inline-block;
`

class Card extends Component {
  render() {
    return (
      <CardOutline>
        <sup className="rank">{this.props.card[0]}</sup>
        <sub className="suit">{this.props.card[1]}</sub>
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
    var color = "basic";
    switch (this.props.inHand) {
      case IN_HAND:
        color = "success";
        break;
      case OUT_OF_HAND:
        color = "danger";
        break;
      default:
        break;
    }

    return (
      <td>
        <CardButton
          color={color}
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

function unicodeCard(card) {
  const rank = card[0],
        suit = card[1];

  if (rank === "!") {
    if (suit === "B") {
      return String.fromCodePoint(0x1F0CF);
    } else {
      return String.fromCodePoint(0x1F0DF);
    }
  } else {
    const suitBase = {
        "\u2660": 0x1F0A1,
        "\u2665": 0x1F0B1,
        "\u2666": 0x1F0C1,
        "\u2663": 0x1F0D1,
      }[suit],
      rankOffset = ranks.indexOf(rank);

    return String.fromCodePoint(suitBase + rankOffset);
  }
}

export default App;
