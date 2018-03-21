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
        {[...Array(Math.max(this.props.cardsInHand - inHand.length, 0)).keys()].map(ix => <span key={ix}>{String.fromCodePoint(0x1F0A0)}</span>)}
      </Hand>
    );
  }}

class Card extends Component {
  render() {
    return (
      <span>{unicodeCard(this.props.card)}</span>
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
      <div>
        <div>Known Cards</div>
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
      </div>
    );
  }
}

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
        <Button
          color={color}
          onClick={() => this.props.clickCard(this.props.card)}
          size="sm"
        >
          {this.props.suit}
        </Button>
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
