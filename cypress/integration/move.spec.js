/// <reference types="cypress" />

context('Move element', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1234')
  })

  it('should add and move an element with rotation 0', () => {
    cy.get('#insertRectBtn').click()

    cy.get('#controls-continer > g > rect:nth-child(1)').trigger("mousedown", {
      which: 1
    });

    cy.get('#controls-continer > g > rect:nth-child(1)').trigger("mousemove", {pageX: 500, pageY: 300});
    cy.get('#controls-continer > g > rect:nth-child(1)').trigger("mouseup")
  })

})
