import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import {
  Container, Row, Button,
} from 'react-bootstrap';


function MainPage(props) {
  const wikiLink = 'https://en.wikipedia.org/wiki/Dots_(game)';

  return (
    <Container>
      <h2 className="text-center mb-5">Welcome to the dots game!</h2>
      <Row className="mb-5">
        <ul className="list-group d-flex m-auto mt-50">
          <li className="list-group-item text-center font-weight-bold">Rules are simple</li>
          <li className="list-group-item">Place the dots on the game field</li>
          <li className="list-group-item">Capture enemy points by creating a &quot;loop&quot; from your points</li>
          <li className="list-group-item">Try to catch as much points as you can</li>
          <li className="list-group-item">Have fun</li>
          <li className="list-group-item">
            Additional info can be found on the&nbsp;
            <a href={wikiLink} target="_blank" rel="noopener noreferrer">wiki</a>
              &nbsp;page.
          </li>
        </ul>
      </Row>

      <p className="p-20" />
      <div className="text-center">
        <Button variant="success" className="w-50" href="/new_game">Lets play a game</Button>
      </div>
    </Container>
  );
}


export default hot(
  connect(
    null, null,
  )(MainPage),
);
