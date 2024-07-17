# Introduction

In this guide, we're going to create an Activation Function that registers a user with a successful vote on a Jokerace contest in order to register the user with WATTS.

The guide will utilize two smart contracts:

- **JokeVote**: Mocks the jokerace contracts to allow a vote and verify if a vote has been cast by a specific address.
- **VoteCheckerActivationFunction**: Interacts with JokeVote contract to check whether the sender's address has verified its vote.
