describe('Poker Table', () => {
  beforeEach(() => {
    cy.visit('/poker/table1');
    cy.window().then(win => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('userId', 'user1');
    });
  });

  it('should display poker table and allow actions', () => {
    cy.intercept('GET', '/api/poker/tables/table1', {
      statusCode: 200,
      body: {
        tableNumber: 1,
        pot: 100,
        communityCards: [{ value: 'A', suit: 'spades' }],
        players: [{ user: { username: 'Player1' }, balance: 1000, currentBet: 0, status: 'active' }],
      },
    }).as('getTable');

    cy.wait('@getTable');
    cy.contains('Poker Table #1').should('be.visible');
    cy.contains('Pot: 100 USDT').should('be.visible');
    cy.get('input[placeholder="Bet Amount"]').type('100');
    cy.get('select').select('call');
    cy.get('button').contains('Submit').click();
  });
});